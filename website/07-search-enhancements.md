# 07 — Search: listing `#ID`, seller matches, Arabic normalization

> Backend `f3676f3` + `bfd1f42`, mobile app `b87aaa5` + `4dfb4d4`.
> **Read `05-sellers-galleries.md` first** — the seller strip uses its endpoints and its shared row.

## Quick facts

| | |
|---|---|
| **No new query param** | the existing `searchTerm` now matches five things |
| **Listing id** | `/^#?(\d+)$/`, range `1..2147483647`. `123` and `#123`, nothing else. |
| **Seller names are searchable** | but only for users holding the `trader` role |
| **Matching** | Arabic-normalized, case- and diacritic-insensitive, punctuation-blind, **substring** |
| **Seller strip** | pure client behaviour — the backend already folds the seller's listings in |
| **Settings** | `listings_settings.search.seller_suggestions_*` |

---

## 1. What changed

Nothing in the request. `searchTerm` on the listing search is the same parameter it always was. What
changed is **what the server matches it against** — and two client-side affordances built on top.

### The five things a term now matches

The predicate is an OR across five branches:

| # | Branch | Effect for the user |
|---|---|---|
| a | The listing's own **title, description, story and slug** | unchanged behaviour |
| b | The listing's **translation rows** | an Arabic-only title is findable while browsing in English, and vice versa |
| c | **Reference-catalogue attribute values** — the item's name or its translation, scoped to attributes flagged `isSearchable` **and** `isActive` | typing `أودي` returns every listing whose *Make* is Audi, **regardless of how the title is worded** |
| d | The **seller's name**, gated on the `trader` role | typing a showroom's name returns that showroom's listings, not just the showroom |
| e | The **exact listing id** | `#12345` or `12345` opens listing 12345 |

Branch (d) is gated deliberately. From the backend's own comment:

> Gated on the trader role, exactly like the sellers directory: if this branch matched any owner it
> would return a private individual's listings under their personal name with no card above them —
> findable by name without ever being a seller.

The id branch is **OR'd, not exclusive**. Searching `2020` still matches titles containing "2020" *and*
listing #2020.

### Where it applies

Every endpoint that runs the shared listing query:

- `GET /listings-visitor/:typeId/search`
- `GET /public/profile/v2/:userId/listings`
- `GET /my-listings`
- favourites

**Not** `GET /listings-visitor/map` — the map endpoint forwards only `where` / `filterGroups`, never
`searchTerm`.

`GET /public/profile/v2/sellers?searchTerm=` uses the **same normalized predicate** against the user's
name. That parity is load-bearing — §4.

---

## 2. Parsing a listing id

```ts
const INT4_MAX = 2147483647;

export const parseIdSearchTerm = (term: string): number | null => {
  const match = /^#?(\d+)$/.exec(term.trim());
  if (match == null) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id >= 1 && id <= INT4_MAX ? id : null;
};
```

Copy this **exactly**. It mirrors the backend's own guard, and if the two disagree you either offer a
direct-open card for a term the server already matched, or stay silent for one it didn't.

| Input | Parses? |
|---|---|
| `123` | ✅ |
| `#123` | ✅ |
| `  #123  ` | ✅ (trimmed) |
| `id:123` | ❌ |
| `# 123` | ❌ (space after the hash) |
| `12a` | ❌ |
| `0` | ❌ (range starts at 1) |
| `99999999999` | ❌ (over int4 max — the server degrades to text-only search, no 500) |

---

## 3. Arabic normalization — what "أودي matches اودي" means exactly

The **same** normalizer is applied to both the stored text and the search term, then compared with a
substring match.

```
1. Unicode NFKC normalize
2. Fold:  أ إ آ ٱ → ا      ى → ي      ة → ه
3. Delete: the 8 harakat (U+064B–U+0652), superscript alef (U+0670), tatweel (U+0640)
4. Lowercase
5. Replace every run of non-alphanumerics with a single space
6. Collapse repeated spaces, trim
```

The SQL implementation, for reference:

```sql
SELECT trim(
  regexp_replace(
    regexp_replace(
      lower(translate(normalize(coalesce(input,''), NFKC),
        'أإآٱىةًٌٍَُِّْٰـ',
        'اااايه')),
      '[^[:alnum:]]+', ' ', 'g'),
    '\s+', ' ', 'g'));
```

### What this means for your UI

- **Case-insensitive and diacritic-insensitive.** `أودي`, `اودي` and `أُودِي` all match each other.
- **Punctuation-blind.** `BMW-X5` matches `bmw x5`; `مرسيدس‑بنز` matches `مرسيدس بنز`.
- **It is a plain substring match on the whole normalized document — not per-word, and not fuzzy.**

That last point is the one that will surprise users:

> `"معرض قبس الحصرم"` will **NOT** match a stored `"معرض قبس"`. The term must be a contiguous substring
> of the normalized text.

**Design the UI to narrow as the user types, not to retry.** Do not implement a client-side
"drop the last word and search again" fallback — the backend has one internally for the AI assistant,
but the HTTP endpoints deliberately do not, and adding one on the client makes results
non-reproducible from a shared URL.

An empty or whitespace-only `searchTerm` adds **no** predicate at all — it is not an error, and it is
not "match nothing".

---

## 4. The seller-match strip

A strip above the search results showing sellers whose **name** matches the typed term — so typing
`معرض الس` surfaces `معرض السلام` as a clickable card.

> ### It does not bring in the seller's listings
>
> The backend's free-text search already matches the seller's name (branch **d**) and folds that
> seller's listings into the normal result set. The strip is only **the face on that match** — which is
> why turning it off in settings does not change the results at all.

### When it shows — all four must hold

1. `listings_settings.search.seller_suggestions_enabled` (fallback `true`)
2. `searchTerm.trim().length >= listings_settings.search.seller_suggestions_min_term_length`
   (fallback `2`)
3. `parseIdSearchTerm(term) == null` — **a bare listing id is never a seller lookup**
4. the lookup returned ≥ 1 seller

> **The min-length gate applies to the seller lookup ONLY.** The listing search must keep working for
> short terms like `X5` and `M3`. Do not gate the main search on it.

### How to fetch it

```
GET /public/profile/v2/sellers?page=1&pageSize=<seller_suggestions_count>&searchTerm=<term>
```

`seller_suggestions_count` (fallback `3`) goes straight in as `pageSize`.

Run it **in parallel** with the listing search, not before it — the results must not wait on the strip.

### What it looks like

```
Sellers                                                    ← muted label
┌──────────────────────────────────────────────────────┐
│ (avatar)  معرض السلام                             ›  │   ← the SellerRowCard from 05 §6.1
│           12 listings                                │
└──────────────────────────────────────────────────────┘
This seller has no listings in this category right now     ← conditional caption
```

- Sits **between** the result count / ad slot and the results list.
- Render it as a **plain sibling of the results list**, not as a list header — it must appear
  identically in the empty and non-empty branches.
- **Render `null` — not a spinner — while the lookup is in flight.** Most terms match no seller, so a
  loading placeholder would flash a "Sellers" heading above the results on **every single search**.
- The trailing caption appears when `sellerMatches.length > 0 && totalItems === 0` — a seller matched by
  name but has nothing in the listing type currently being browsed. The seller directory is global; the
  listing search is per-type.
- Clicking a row navigates to that seller's profile (`/profile/[id]`).

### Debounce

Ride the search box's existing debounce and use the **committed** term, so the lookup fires once per
settled edit rather than per keystroke. The mobile app uses 900 ms on the search bar.

### The parity rule — do not "improve" one side

The strip and the listing search use the **same** normalized predicate on the seller's name, on
purpose. From the backend:

> The SAME predicate the listing search's seller branch uses. It has to be: the app shows this
> endpoint's hit as a seller card and the listing search folds that seller's listings into the results
> below it, so if the two matched differently a card would appear with none of its listings, or the
> listings would appear with no card.

If you add client-side filtering, fuzzy matching or a different normalizer to the strip, you break that
guarantee.

---

## 5. The cross-type direct-open card

The problem: a buyer pastes `#12345` while browsing **Cars**, but listing 12345 is a **Motorcycle**. The
in-type search legitimately returns nothing, and the user concludes the listing is gone.

### When to fire

All of:

- `parseIdSearchTerm(searchTerm) != null`
- `currentPage === 1`
- the in-type search has **succeeded**, is **not fetching**, and returned `totalItems === 0`

Then resolve the id globally:

```
GET /listings-visitor/:id
```

A **404** leaves it `null` and the plain empty state stands. **Surface no error** — this is a
speculative lookup, not a user action.

### What it looks like

Rendered **above** the empty state, not instead of it — *"the in-type search still legitimately has zero
results; this card is an additional escape hatch for a pasted #id that lives elsewhere."*

```
┌──────────────────────────────────────────────────────┐
│ (#)  Found listing #12345                        ›   │
│      This listing is in Motorcycles — outside your   │
│      current search                                  │
└──────────────────────────────────────────────────────┘

        [ the normal "No listings found" empty state ]
```

The whole row is the click target; *"Open listing"* is its accessible label, not visible text.

### Two gotchas

**1. Bidi.** The `#` must sit **inside** the interpolated value, never in the translation string:

```ts
// right — the hash travels with the digits inside one isolate
t('search.direct_open.title', { id: `⁦#${id}⁩` })
// wrong — "#" as a literal in the Arabic string reorders unpredictably
```

`#` followed by digits is a bidi-neutral run and will jump to the wrong end of an Arabic sentence. Use
`⁦…⁩` (LRI/PDI) or a `dir="ltr"` span with `unicode-bidi: isolate`.

**2. Stale-data flash.** Guard on the resolved id, not just on "we have data":

```ts
// Without the equality check, searching a second id renders the PREVIOUS listing's
// card for the whole in-flight window and then rips it away on the 404.
const card = listing != null && listing.id === directOpenId ? listing : null;
```

In TanStack Query terms: read the current query's data, and compare `data.id` against the id you asked
for before rendering.

---

## 6. The listing-detail `#ID` chip

This is where the id a buyer pastes comes from. On the listing detail page, in the metadata row under
the title block:

```
🕐 3 days ago          #  12345
```

The `#` chip is a **button that copies the bare digits** — `12345`, **not** `"#12345"`.

> This is the value a buyer pastes back into the search box, and the leading hash is only a display
> affordance. The parser accepts both, but copying the bare number is what makes the paste reliable
> across an Arabic UI where the hash may have been visually reordered.

- Toast on success: **"Listing ID copied"**
- Accessible label: **"Copy listing ID {id}"** — with **bare digits** in the interpolation, or a
  screen reader announces `# #12345`. The `#` icon *is* the hash; do not repeat it in the label.
- Give it a generous hit area.

---

## 7. Settings

Group `listings_settings.search`. Read via `GET /settings/listings_settings/search`.

The group carries this comment on the backend:

> The seller strip above the search results. Free-text search already matches a seller's name
> server-side and folds that seller's listings into the results; these only control the card the app
> shows on top of them.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `seller_suggestions_enabled` | boolean | `true` | Show matching sellers as cards above the listing results. **Turning it off hides the card only — the seller's listings still appear in the results.** |
| `seller_suggestions_count` | number | `3` | Max seller cards. Pass as `pageSize`. |
| `seller_suggestions_min_term_length` | number | `2` | Below this many characters, do not look up sellers at all. **Does not gate the listing search** — that must keep working for `X5`, `M3`. |

> **These are pure client-behaviour settings. The backend does not enforce any of them.** If you ignore
> them, nothing breaks server-side — the feature just stops being configurable.

---

## 8. Errors to handle

| Situation | Behaviour |
|---|---|
| `GET /listings-visitor/:id` 404 on the direct-open lookup | **silent** — render nothing, keep the empty state |
| seller lookup fails | **silent** — render no strip; never block or degrade the listing results |
| anonymous deep pagination (`page * pageSize > 5000`) | 400 `Pagination offset too large…` — show a "narrow your filters" message rather than a generic error |
| 429 | back off; the search box's debounce should normally prevent this |

Both new lookups are **speculative enrichments**. Neither may ever produce a visible error state or
delay the results.

---

## 9. Composite render order

For a full port, the search results page assembles in this order:

1. Search bar + filter/sort chips + view-mode toggle (sticky header)
2. Result count — `{count} results`
3. Ad slot (search-results header)
4. **Seller-match strip** — a sibling of the list, rendered in **both** the empty and non-empty branches
5. Then either:
   - the results list (grid or list mode, ads merged inline), **or**
   - the empty group: **direct-open card** (when resolved) → empty state (+ "Clear filters" when filters
     are active) → the "create an alert" CTA card

---

## 10. What did NOT change

Worth stating so nobody ports a string that does not exist:

- **There is no hint text about `#123` anywhere in the mobile app.** The search placeholder is
  unchanged: *"Search listings..."* / *"ابحث في الإعلانات..."*.
- **The empty-state copy is unchanged**: *"No listings found"* / *"Try adjusting your filters"*, plus the
  existing "Clear filters" CTA when filters are active.

If the website wants an explicit affordance — *"Search by title or #ID"* — that is a **new** string, a
reasonable product decision, and not a port. Say so if you add it.

---

## 11. i18n keys

| Key | English | العربية |
|---|---|---|
| `search.direct_open.title` | Found listing {id} | تم العثور على الإعلان {id} |
| `search.direct_open.subtitle` | This listing is in {typeName} — outside your current search | هذا الإعلان ضمن {typeName} — خارج نطاق بحثك الحالي |
| `search.direct_open.button` | Open listing | فتح الإعلان |
| `listing.detail.id_chip.copied_toast` | Listing ID copied | تم نسخ رقم الإعلان |
| `listing.detail.id_chip.a11y_label` | Copy listing ID {id} | نسخ رقم الإعلان {id} |
| `search.seller_matches.title` | Sellers | البائعون |
| `search.seller_matches.no_type_listings` | This seller has no listings in this category right now | لا توجد لدى هذا البائع إعلانات في هذا القسم حالياً |

Unchanged, listed so you can confirm they already exist:

| Key | English | العربية |
|---|---|---|
| `search.bar_placeholder` | Search listings... | ابحث في الإعلانات... |
| `search.empty_title` | No listings found | لم يتم العثور على إعلانات |
| `search.empty_description` | Try adjusting your filters | جرّب تعديل الفلاتر |

Optional, if you add the affordance from §10:

| Key | English | العربية |
|---|---|---|
| `search.bar_placeholder_with_id` | Search listings or paste an ID | ابحث في الإعلانات أو الصق رقم إعلان |

> `{id}` in `search.direct_open.title` must arrive **already bidi-isolated with its `#`** (§5).
> `{id}` in the a11y label must be **bare digits** (§6). They are deliberately different.

---

## 12. Where this lands in `bishola-website`

### 12.1 What already exists

The search already sends `searchTerm` — `src/providers/filters.provider.tsx` `buildQueryParams()`
builds it alongside `page` (default 1), `pageSize` (12, overridden to 16 by
`src/app/[locale]/(web)/products/page.tsx`), `sortBy` (`createdAt`, overridden to `publishedAt` by the
page header), `sortDirection` and `filterGroups`.

**So branches (a)–(e) of §1 are already live on the website today — the server does them.** Nothing is
required to get Arabic normalization, cross-locale titles, reference-value matching, seller-name
matching or id matching. What this document adds is the two client affordances.

### 12.2 Files to change

| File | Change |
|---|---|
| `src/app/[locale]/(web)/products/AllCarListings.tsx` | Add the seller strip as a sibling of the results (§4, §9). Add the direct-open card to the empty branch (§5). |
| `src/providers/filters.provider.tsx` | Expose the committed `searchTerm` so the strip and the id parser can read it without re-debouncing. |
| `src/components/web/ProductsPage/Filter.tsx` | Only if you add the §10 placeholder change. |
| `src/app/[locale]/(web)/products/product/[id]/page.tsx` + its header components | The `#ID` chip (§6). |

### 12.3 Files to create

| File | What |
|---|---|
| `src/core/lib/parse-id-search-term.ts` | §2, verbatim |
| `src/components/web/ProductsPage/SellerMatchStrip.tsx` | §4 — reuses `SellerRowCard` from `05` §6.1 |
| `src/components/web/ProductsPage/DirectOpenListingCard.tsx` | §5 |
| `src/hooks/use-search-seller-matches.ts` | the gated, parallel seller lookup |

The seller lookup calls `getSellers()` — added to
`src/core/infrastructure-adapters/actions/visitors/public-profile.actions.ts` by
`05-sellers-galleries.md` §8.2.

The direct-open lookup calls the existing listing-by-id action in
`src/core/infrastructure-adapters/actions/visitors/listing.visitor.actions.ts`.

### 12.4 Prerequisites and gotchas

| # | Thing | Where |
|---|---|---|
| 1 | **`normalizeListingToCarDto()`** — the direct-open card renders a listing from a different listing type. If the normaliser assumes car-shaped attributes, a motorcycle may render oddly. Keep the card minimal: id, type name, chevron. Nothing else. | `src/utils/listing-normalization.ts` |
| 2 | The direct-open card needs the **listing type's display name**, which `GET /listings-visitor/:id` returns on the detail's `listingType.name`. It is locale-resolved, so no extra lookup is needed. | — |
| 3 | The product detail page has a fallback branch to the legacy `/car-listings-visitor/:id`. Make sure the id chip reads the id from the listing-types payload, not the car one. | `products/product/[id]/page.tsx` |
| 4 | Copy-to-clipboard needs a secure context (`navigator.clipboard`). Have a `document.execCommand` fallback or hide the chip when unavailable. | the chip component |
| 5 | `<Toaster />` **is** mounted in `(web)/layout.tsx`, so the "Listing ID copied" toast works on the product page. It would not work from a dashboard page. | `src/app/[locale]/(web)/layout.tsx` |

---

## 13. Testing checklist

**Server-side matching (already live — confirm, don't build):**

- Searching `أودي` returns Audi listings whose titles do not contain the word.
- Searching `اودي` (no hamza) returns the same results as `أودي`.
- Searching `BMW-X5` and `bmw x5` return the same results.
- Searching an Arabic title while the UI is in English still finds the listing.
- Searching a showroom's name returns that showroom's listings.
- Searching a **private individual's** name returns nothing — only traders' names are searchable.
- `"معرض قبس الحصرم"` does **not** match a seller stored as `"معرض قبس"` (substring, not per-word).

**The seller strip:**

- Typing 1 character fires **no** seller lookup; the listing search still runs.
- Typing `12345` fires no seller lookup — it is an id.
- A term matching a seller shows at most `seller_suggestions_count` cards above the results.
- **Nothing renders while the lookup is in flight** — no "Sellers" heading flash on a term that matches
  no seller.
- Setting `seller_suggestions_enabled: false` hides the strip **and the listing results are unchanged**.
- A seller who matches but has no listings in the current type shows the trailing caption.
- Clicking a card lands on `/profile/[id]`.

**Direct open:**

- Searching `#12345` inside a type that does not contain it shows the card **above** the empty state.
- Searching a nonexistent id shows the plain empty state with **no error**.
- Searching id A, then quickly id B, never renders A's card under B's search.
- Searching `2020` still returns title matches **and** listing #2020 if it exists in that type.
- On page 2, the direct-open card does not appear.

**The ID chip:**

- Clicking it copies `12345`, not `#12345`, and toasts.
- Pasting the copied value into the search box finds the listing.
- On `/ar/…`, the `#` renders to the left of the digits and the whole chip reads left-to-right.
