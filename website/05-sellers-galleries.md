# 05 — Sellers / galleries

> Backend `b4db81a`, mobile app `ea5fd92` + `4dfb4d4`, admin `aaba150`.
> **Do this before `07-search-enhancements.md`** — that document's seller strip uses these endpoints.

## Quick facts

| | |
|---|---|
| **All endpoints are public** | no auth, no `Authorization` header |
| **Controller prefix** | `/public/profile` — the `v2` in the path is a literal route segment |
| **Directory** | `GET /public/profile/v2/sellers` — paginated, searchable |
| **Home rail** | `GET /public/profile/v2/top-sellers` — a **bare array**, no pagination |
| **Profile** | `GET /public/profile/v2/:userId` |
| **Their listings** | `GET /public/profile/v2/:userId/listings` |
| **Filter listings by seller** | `where=[{"field":"userId","operator":"eq","value":42}]` |
| **Staleness** | Redis-cached ~10 min |

---

## 1. What the feature is

A **seller** (the product also calls them galleries or showrooms) is a user who holds the `trader` role
**and** has at least one publicly-visible listing.

The role is granted **automatically** as a user's approved listings accumulate, and admins can grant or
revoke it by hand. **Eligibility is decided entirely server-side** — every seller surface just renders
what comes back. Do not try to re-derive who is a seller from listing counts or any other signal.

There are four surfaces:

1. A **Top Sellers rail** on the home page.
2. A browsable, searchable **sellers directory**.
3. A **seller profile** page with stats and their listings.
4. A **seller filter** inside the listing search filters.

Plus a fifth, documented separately in `07-search-enhancements.md`: a strip of matching sellers above
search results.

---

## 2. API contract

All four routes live on one controller, `@Controller('public/profile')`, with **no auth decorators
anywhere**. Rate limit: 40/s, 400/min per IP.

> Route ordering on the server puts `v2/sellers` and `v2/top-sellers` **before** `v2/:userId`, so the
> literal segments win. You do not need to do anything about this; it is noted so you know
> `/v2/sellers` is not interpreted as a user id.

### 2.1 `GET /public/profile/v2/sellers` — the directory

**Auth:** none. **Headers:** none required — the result is locale-agnostic (`name` and `profileUrl` are
not translated).

| Query param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | `1` | coerced with `Math.max(1, …)` |
| `pageSize` | int | `20` | **clamped to a hard maximum of 50** |
| `searchTerm` | string | — | Arabic-normalized, case-insensitive **substring** match on the user's name |

> These are parsed manually, **not** through the shared `QueryParams` decorator. `sortBy`,
> `sortDirection`, `where` and `filterGroups` are **not** accepted here and are silently ignored.

Response `data` is a `PaginatedResponse`:

```jsonc
{
  "success": true,
  "data": {
    "data": [
      { "id": 42, "name": "معرض السلام", "profileUrl": "https://…/avatar.jpg", "listingsCount": 37 }
    ],
    "currentPage": 1, "totalPages": 5, "pageSize": 20,
    "totalItems": 94, "hasNextPage": true, "hasPreviousPage": false
  }
}
```

```ts
interface SellerSummary {
  id: number;                 // = userId. Use it for /v2/:userId and /v2/:userId/listings
  name: string;
  profileUrl: string | null;  // avatar
  listingsCount: number;      // publicly-visible listings owned by this user
}
```

Ordering: `listingsCount DESC`, then `id ASC`.

The `searchTerm` matching here uses the **exact same normalized predicate** as the listing search's
seller branch. That parity is deliberate and load-bearing — see `07-search-enhancements.md` §3.

### 2.2 `GET /public/profile/v2/top-sellers` — the home rail

**Auth:** none.

| Query param | Type | Default | Notes |
|---|---|---|---|
| `maxCount` | int | `10` | clamped to `1..50` |
| `minListings` | int | `0` | a seller shows only when `listingsCount > minListings` — **strictly greater than**, not `>=` |

Response `data` is a **bare array** (not paginated, not searchable):

```jsonc
{ "success": true, "data": [ { "id": 42, "name": "…", "profileUrl": "…", "listingsCount": 37 } ] }
```

Same object shape as §2.1. Ordered by `listingsCount DESC`, `id ASC`.

> Note the **strictly greater than**. With the default `minListings: 0`, a seller with exactly 0 public
> listings is excluded (they would not be a seller anyway), and a seller with 1 is included. If you pass
> `minListings: 2` expecting "two or more", you will get "three or more".

### 2.3 `GET /public/profile/v2/:userId` — the seller's public profile

**Auth:** none. **Path:** `userId` (int — a non-numeric value returns **400**). No query params.

```ts
{
  id: number;
  name: string;
  profileUrl: string | null;
  createdAt: string;                  // ISO — "Member since"
  totalForSaleListings: number;
  totalForRentListings: number;
  totalListings: number;              // = forSale + forRent
  countsByListingType: Array<{ listingTypeId: number; count: number }>;
}
```

**404** with `profile.userNotFound` when the user does not exist.

> **There is no `isTrader` / `isSeller` flag on this payload.** This route serves *any* user's public
> profile, seller or not. The only way to know whether a profile is a seller is whether their id appears
> in `/v2/sellers`. In practice you arrive here *from* a seller surface, so you already know.

`countsByListingType` gives only ids. Resolve the names against your cached `GET /listing-types`.

### 2.4 `GET /public/profile/v2/:userId/listings` — their listings

**Auth:** none.

> ⚠️ This route has **no `@OptionalAuth`**, unlike the visitor search. So even for a signed-in user,
> **`isFavorite` is not injected** on these cards. Either resolve favourite state client-side from your
> own favourites cache, or accept that the heart renders unfilled here.

**Path:** `userId` (int).
**Query:** `typeId` (optional int) **plus the full shared `QueryParams` set** — `page` (default 1),
`pageSize` (default 20), `sortBy` (default `priorityScore`), `sortDirection` (default `desc`),
`searchTerm`, `where`, `filterGroups` including `attrs.*`.

Response `data` is a `PaginatedResponse` of **listing cards** — the exact same card shape as the
visitor search, including `installmentsAvailable` and `minMonthlyInstallment` (see
`04-installment-plans.md` §2.2), minus `isFavorite`, with coordinates stripped.

### 2.5 Filtering the main search by seller

There is **no dedicated `sellerId` query param.** Use the standard `where` clause on
`GET /listings-visitor/:typeId/search`:

```jsonc
where=[{"field":"userId","operator":"eq","value":42}]
```

`userId` is a real `listings` column, so this is indexed and cheap.

### 2.6 Legacy routes on the same controller — ignore

`GET /public/profile/:userId` and `GET /public/profile/:userId/car-listings` belong to the legacy cars
module. Do not build against them.

---

## 3. How someone becomes a seller

Not something the website controls, but you need it to explain the feature and to reason about empty
states.

The role is `trader`. It is granted automatically by a listener when a listing is approved and the
user's approved-listing count reaches the threshold. It is **never revoked automatically**. Admins can
grant or revoke it manually, and there is an admin-only backfill task.

A user must have **both** the role **and** ≥1 publicly-visible listing to appear in `/v2/sellers` or
`/v2/top-sellers`. A seller who unpublishes everything disappears from the directory but keeps the role.

`listingsCount` counts publicly-visible listings, and **includes sold ones** when
`listings_settings.sold_visibility.public_profile_listings` is on (default `true`).

---

## 4. Settings

### Seller eligibility — server-side only, listed for completeness

| Key | Type | Default | Meaning |
|---|---|---|---|
| `listings_settings.sellers.trader_auto_grant_enabled` | boolean | `true` | Grant the Trader role automatically once approved listings reach the threshold. Off ⇒ new sellers only appear after a manual grant. |
| `listings_settings.sellers.trader_auto_grant_min_listings` | number | `2` | Approved listings needed ("this many **or more**"). Lowering it is not retroactive. |

**The website never reads these.** They are documented so you understand why a user with one approved
listing is not yet in the directory.

### The home rail

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app_settings.home.top_sellers_enabled` | boolean | `true` | Show the Top Sellers section at all. |
| `app_settings.home.top_sellers_count` | number | `10` | Pass as `maxCount`. |
| `app_settings.home.top_sellers_min_listings` | number | `0` | Pass as `minListings`. Remember it is **strictly greater than**. |
| `app_settings.home.sections_order` | array | includes `'top_sellers'` | Home section ordering; the literal token is `top_sellers`. |

### Sold-listing visibility — affects counts and lists

| Key | Type | Default | Effect |
|---|---|---|---|
| `listings_settings.sold_visibility.public_profile_listings` | boolean | `true` | Include sold listings on a seller's public profile **and** in the `listingsCount` shown on every seller card, in both the directory and the rail. |
| `listings_settings.sold_visibility.search` | boolean | `true` | Include sold listings in the main search. |
| `listings_settings.sold_visibility.favorites` | boolean | `true` | |
| `listings_settings.sold_visibility.featured` | boolean | `false` | |
| `listings_settings.sold_visibility.trending` | boolean | `false` | |
| `listings_settings.sold_visibility.recent` | boolean | `false` | |
| `listings_settings.sold_visibility.map` | boolean | `false` | |

A sold listing has `publicationStatus === 'sold'`. Render a SOLD badge and disable favourite/compare on
it. The site already has a `SoldCard` i18n namespace, so some of this exists.

### The seller-suggestion strip

`listings_settings.search.seller_suggestions_*` — documented in `07-search-enhancements.md` §4.

---

## 5. Errors to handle

| Endpoint | Status | When |
|---|---|---|
| `GET /v2/:userId` | 400 | `userId` is not numeric |
| `GET /v2/:userId` | 404 | no such user (`profile.userNotFound`) |
| any | 400 | anonymous deep pagination — `page * pageSize > 5000` |
| any | 429 | rate limit |

There are no feature-specific error strings. Everything else is a generic failure — render the error
state from §6.

---

## 6. UX reference (from the mobile app)

### 6.1 The shared seller row — build this once

One component, reused by the directory, the filter picker **and** the search strip, *so a seller looks
identical everywhere*.

```
┌────────────────────────────────────────────────┐
│ (avatar)  معرض السلام                      ›   │
│           37 listings                          │
└────────────────────────────────────────────────┘
```

- 40 px circular avatar, name, `{count} listings` caption, chevron.
- **Flat row — no card border or elevation.** The parent list owns the separation.
- Fixed height (64 px on mobile; keep it uniform on the web too so lists don't jitter).
- Props: `userId, name, profileUrl, listingsCount, onClick, selected?, showChevron?`
- `selected` → the name takes the primary colour and the chevron becomes a check mark.
- **RTL:** keep the DOM order and let `dir` handle it — do not flip with `row-reverse`. Mirror the
  chevron.

### 6.2 The home rail — "Top Sellers"

- A section header **"Top Sellers"** with a **"See all"** action linking to the directory.
- A horizontally scrolling strip of avatar cards: ~108 px wide, 64 px circular avatar, name,
  `{count} listings` caption.
- Params from settings: `maxCount` ← `app_settings.home.top_sellers_count` (fallback 10),
  `minListings` ← `app_settings.home.top_sellers_min_listings` (fallback 0).
- Visibility and position from `top_sellers_enabled` and `sections_order`.

**States:** 5 skeleton cards while loading → error state (*"Could not load sellers"* / *"Try again"*) →
empty state (*"No sellers yet"*) → content.

> **The section header with "See all" renders in *every* branch** — loading, error, empty and content.
> A header that vanishes while loading makes the page jump, and an error state with no way out is a
> dead end.

Refetch it when a listing is created, deleted, published, or has its status changed.

### 6.3 The directory

**Header — rendered above the loading/error/empty switch, in every branch:**

- An `h1` **"Sellers"**
- A search input, placeholder **"Search sellers by name"**, debounced (~300 ms)

> Keep the header outside the conditional. If the search input is inside the branch that swaps to a
> skeleton, it **unmounts while the user is typing** and loses focus on every keystroke.

**List:** vertical, `pageSize` **20** (matches the backend default; the hard cap is 50). Either infinite
scroll or the existing `src/components/shared/Pagination.tsx` — the endpoint is paginated, so both work.
Changing the search term resets to page 1 and clears the accumulated results.

**States:**

- loading → 8 skeleton rows
- error → *"Could not load sellers"* / *"Try again"*
- empty → **two distinct empty states**:

| Situation | Title | Body |
|---|---|---|
| a search term is active | No sellers match your search | Try a different name. |
| no search term | No sellers yet | Sellers appear here once they publish their listings. |

> This distinction is deliberate: *"a search that found nothing is a different situation from a
> directory with no sellers in it, and telling them apart is what stops the user concluding the feature
> is broken."*

### 6.4 The seller profile

Header block, in order:

1. **Hero** — a blurred cover band derived from the avatar with a dark gradient overlay, and the
   circular avatar straddling its bottom edge.
2. **Identity** — the name as `h1`, plus a **"Member since {date}"** pill from `createdAt`.
3. **Stats card** — three equal columns: **For sale** / **For rent** / **Total**, from
   `totalForSaleListings`, `totalForRentListings`, `totalListings`.
4. **Filter row** — a "Listings" section title plus a filter button with an active-dot indicator.
5. **Listing-type chips** — a horizontal row: an **"All"** chip plus one chip per entry in
   `countsByListingType`, names resolved from the listing-types catalogue. Selecting one sets `typeId`
   on the listings query.

Body: listing cards, paginated or infinite, with the loading / error / empty states rendered **under
the loaded header** rather than replacing the whole page.

A **Share** action in the header. Share message: *"Check out {name}'s listings on Bishola: {url}"*.

The website already has `/profile/[id]` with `generateMetadata` + Open Graph tags. Extend it rather
than starting over.

### 6.5 The seller filter in the search filters

A seller is `listings.userId` — a listing **column**, not an attribute — so it belongs in the *common*
filters section, not the per-type schema-driven ones.

- Label **"Seller"**. The trigger shows the selected seller's name or the placeholder **"Any seller"**,
  with an **×** clear button when set and a chevron.
- Clicking it opens a picker: a search input (placeholder reuses *"Search sellers by name"*, ~300 ms
  debounce), then a paginated list of seller rows with `selected` state and no chevron.
- **Clicking the already-selected seller clears the filter** (toggle semantics).
- Picker states reuse the directory's strings: *"Could not load sellers"* / *"Try again"*, skeleton
  rows, *"No sellers match your search"* / *"Try a different name."*
- Serialises to `{ field: 'userId', operator: 'eq', value: sellerId }`.

> ### The preselected-by-id lookup is load-bearing
>
> When the filter is restored from a URL, you have a `sellerId` and no name. That seller may be on page
> 4 of the directory, or filtered out by whatever term is in the search box. **Resolve their name
> separately with `GET /public/profile/v2/:userId`** — otherwise the trigger shows "Any seller" while a
> filter is actually applied, and the user cannot tell why their results are narrow.

### 6.6 Caching and staleness

`/v2/sellers` and `/v2/top-sellers` are Redis-cached for about 10 minutes and invalidated when a new
trader is granted. A seller who just published their first listing may not appear immediately. Set your
client cache to something similar (10 min) rather than fighting it.

---

## 7. i18n keys

### Directory

| Key | English | العربية |
|---|---|---|
| `sellers.list.title` | Sellers | البائعون |
| `sellers.list.search_placeholder` | Search sellers by name | ابحث عن بائع بالاسم |
| `sellers.list.empty_title` | No sellers yet | لا يوجد بائعون بعد |
| `sellers.list.empty_subtitle` | Sellers appear here once they publish their listings. | يظهر البائعون هنا بعد نشر إعلاناتهم. |
| `sellers.list.empty_search_title` | No sellers match your search | لا يوجد بائع يطابق بحثك |
| `sellers.list.empty_search_subtitle` | Try a different name. | جرّب اسماً آخر. |
| `sellers.list.error_title` | Could not load sellers | تعذّر تحميل البائعين |
| `sellers.list.error_cta` | Try again | إعادة المحاولة |

### Home rail

| Key | English | العربية |
|---|---|---|
| `home.sections.top_sellers` | Top Sellers | أفضل البائعين |
| `home.sections.see_all` | See all | عرض الكل |
| `home.top_sellers.listings_count` | {count} listings | {count} إعلان |
| `home.top_sellers.empty_title` | No sellers yet | لا يوجد بائعون بعد |
| `home.top_sellers.error_title` | Could not load sellers | تعذّر تحميل البائعين |
| `home.top_sellers.error_cta` | Try again | حاول مجدداً |

### Seller profile

| Key | English | العربية |
|---|---|---|
| `publicProfile.title` | Seller profile | ملف البائع |
| `publicProfile.member_since` | Member since {date} | عضو منذ {date} |
| `publicProfile.listings_count_one` | {count} listing | {count} إعلان |
| `publicProfile.listings_count_other` | {count} listings | {count} إعلان |
| `publicProfile.for_sale` | For sale | للبيع |
| `publicProfile.for_rent` | For rent | للإيجار |
| `publicProfile.total` | Total | الإجمالي |
| `publicProfile.listings_overview` | Listings overview | نظرة عامة على الإعلانات |
| `publicProfile.view_listings` | View listings | عرض الإعلانات |
| `publicProfile.listings_section_title` | Listings | الإعلانات |
| `publicProfile.type_chip_all` | All | الكل |
| `publicProfile.filter_button` | Filter listings | تصفية الإعلانات |
| `publicProfile.listings_empty` | No listings yet | لا توجد إعلانات بعد |
| `publicProfile.listings_empty_description` | This seller has no public listings. | هذا البائع ليس لديه إعلانات عامة. |
| `publicProfile.listings_error` | Failed to load listings | فشل تحميل الإعلانات |
| `publicProfile.listings_error_description` | Try again. | حاول مجدداً. |
| `publicProfile.error_title` | Profile not found | الملف الشخصي غير موجود |
| `publicProfile.error_description` | This seller's profile could not be loaded. | تعذر تحميل ملف هذا البائع. |
| `publicProfile.empty_title` | No profile found | لا يوجد ملف شخصي |
| `publicProfile.empty_description` | This seller has no public profile. | هذا البائع ليس لديه ملف شخصي عام. |
| `publicProfile.share.a11y` | Share this seller's profile | مشاركة ملف هذا البائع |
| `publicProfile.share.message` | Check out {name}'s listings on Bishola: {url} | اطّلع على إعلانات {name} على بسهولة: {url} |

### Seller filter and listing detail

| Key | English | العربية |
|---|---|---|
| `listing.filters.seller_label` | Seller | البائع |
| `listing.filters.seller_placeholder` | Any seller | أي بائع |
| `listing.filters.seller_clear_a11y` | Clear the selected seller | إلغاء اختيار البائع |
| `listing.detail.view_seller` | View profile | عرض الملف الشخصي |
| `listing.detail.contact_seller` | Contact seller | تواصل مع البائع |

> The `{name}` in `publicProfile.share.message` is frequently an Arabic gallery name inside an English
> sentence, or vice versa — bidi-isolate it (`00-conventions.md` §9).

---

## 8. Where this lands in `bishola-website`

### 8.1 What already exists

| Thing | Where | State |
|---|---|---|
| Public seller profile route | `src/app/[locale]/(web)/profile/[id]/{page,profile-client,mobile-profile-client}.tsx`, `FloatingProfileShareButton.tsx` | **Exists.** Has `generateMetadata` + OG tags. Needs the stats card, type chips and filter row. |
| Profile presentational parts | `src/components/web/ProfilePage/{ProfileHeader,ProfileStats}.tsx` | **Exist.** Extend. |
| Home Top Sellers rail | `src/components/web/Home/TopSellersSection.tsx` | **Exists**, already calls `/top-sellers`. Check it renders the header in every branch (§6.2). |
| Actions | `src/core/infrastructure-adapters/actions/visitors/public-profile.actions.ts` | Has `/v2/:id`, `/v2/:id/listings`, `/v2/top-sellers`. **Missing `/v2/sellers`.** |
| DTOs | `src/core/entities/models/public-profile/{public-profile.dto.ts,top-seller.dto.ts}` | Extend with `SellerSummary` and `countsByListingType`. |

### 8.2 What to create

| File | What |
|---|---|
| `src/app/[locale]/(web)/sellers/page.tsx` | **NEW** — the directory (§6.3). Server component shell + a client list. |
| `src/components/web/Sellers/SellersDirectory.tsx` | the searchable list |
| `src/components/web/design/SellerRowCard.tsx` | the shared row (§6.1) — used by the directory, the filter picker **and** `07`'s search strip |
| `src/components/web/ProductsPage/SellerFilterPicker.tsx` | §6.5 |
| add `getSellers()` + `getSellerById()` to `public-profile.actions.ts` | §2.1, §2.3 |
| `src/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions.ts` | TanStack hooks, 10-min `staleTime` |

Add `/sellers` to `src/constants/routes.constant.ts`. Reuse `shared/Pagination.tsx`,
`shared/SectionHeader.tsx`, `ui/avatar.tsx`, `ui/skeleton.tsx`, `ui/command.tsx` (for the searchable
picker) and `Box`.

### 8.3 The seller filter

`src/providers/filters.provider.tsx` `buildQueryParams()` already builds a `filterGroups` array from
the filter state. Add the seller as a `where` clause (§2.5), and add `userId` to the URL-param
whitelist so it round-trips through a shared link. Then resolve the name per §6.5 when restoring from
the URL.

The filter UI itself goes in `src/components/web/ProductsPage/Filter.tsx` alongside the other common
filters.

### 8.4 Prerequisites and gotchas

| # | Thing | Where |
|---|---|---|
| 1 | **`/v2/:userId/listings` returns no `isFavorite`** (§2.4). If your card component assumes the field, the heart renders as "not favourited" for everything on a seller's page. Either resolve from your favourites cache or accept it. | the card components |
| 2 | **`normalizeListingToCarDto()`** applies here too — the seller's listings come back in generic card shape and go through the same normaliser. | `src/utils/listing-normalization.ts` |
| 3 | The website has **two favourites systems** (`/listing-favorites/*` and legacy `/user-favorites/*`). Use the first. | `actions/users/listing.user.actions.ts` |
| 4 | The `/sellers` route is new and public — make sure `src/middleware.ts` does not gate it. | `src/middleware.ts`, `routes.constant.ts` |

---

## 9. Testing checklist

- `/sellers` lists sellers ordered by listing count, 20 per page, and paginates.
- Typing in the directory search narrows the list; **the input keeps focus across every keystroke.**
- Searching for a nonsense string shows *"No sellers match your search"*, **not** *"No sellers yet"*.
- With the directory genuinely empty, the second empty state shows instead.
- The Top Sellers rail's header and "See all" are visible while loading, on error, and when empty.
- "See all" navigates to `/sellers` with the locale prefix intact.
- Clicking a seller anywhere — rail, directory, filter picker — lands on the same
  `/profile/[id]` page.
- The profile shows For sale / For rent / Total matching the API, and the type chips match
  `countsByListingType`.
- Selecting a type chip filters the listings and the counts stay stable (they describe the whole
  profile, not the filtered view).
- The seller filter applies, appears in the URL, survives a refresh, **and shows the seller's name**
  after that refresh rather than "Any seller".
- Clicking the already-selected seller in the picker clears the filter.
- A `userId` that does not exist renders the "Profile not found" state, not a crash.
- `/ar/sellers` renders right-to-left with the chevrons mirrored and the avatar on the logical start
  side.
