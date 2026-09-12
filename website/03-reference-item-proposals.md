# 03 — Reference-item proposals ("I can't find my model")

> Backend `c925495`, mobile app `d8d7ced`, admin `0618d8d`.
> **Do `02-phone-validation.md` first** — it touches the same wizard.

## Quick facts

| | |
|---|---|
| **There is no `POST /proposals`** | A proposal is a **field on the listing write** |
| **Submit** | `attributeValues: [{ attributeId, proposedReferenceName }]` on `POST`/`PUT /my-listings` |
| **"Did you mean?" lookup** | `GET /listing-type-ref/ref-groups/:groupId/items/fuzzy` — public, bare array, max 8 |
| **Read state back** | `attributeValues[].refItemProposal = { id, submittedName, status, resolvedItemId }` |
| **Settings group** | `listings_settings.reference_proposals` (8 keys) |
| **Rejections** | undifferentiated **422** with an English-only string — **never string-match it** |
| **Envelope** | `{ success, message, data, timestamp, path }` |

---

## 1. What the feature is

A listing's `reference` attributes — Make, Model, Trim — are picked from an admin-managed catalogue.
When a seller's actual car isn't in it, they used to be stuck: they could not complete the form.

Now they can **propose** the missing value. They type the name, the system offers near-matches in case
it's a typo, and if none fit, the typed name is submitted as a proposal. The listing can be created and
saved immediately — but **it cannot be approved by an admin** until the proposal is approved, rejected
or linked to an existing item.

Three properties of the design that shape the UI:

1. **A proposal is not a value.** It lives in its own field (`proposedReferenceName` in, `refItemProposal`
   out), mutually exclusive with `referenceItemId`. Everything downstream assumes
   `reference ⇒ a numeric id`, so a sentinel id would break the whole form.
2. **A proposal row is shared.** It has no `listingId`. Ten sellers proposing "Zzz Turbo GT" under the
   same make produce **one** row that an admin reviews once.
3. **A pending proposal counts as an answer.** A required reference attribute with a pending proposal
   is considered filled and does not block submission.

---

## 2. API contract

### 2.1 `GET /listing-type-ref/ref-groups/:groupId/items` — the ordinary picker

Already used by the website (`useDynamicForm.fetchOptions()` →
`IListingTypeRefsRepoController.getItemsByGroupId`). Listed here for context.

**Auth:** none. **Path:** `groupId` (int).
**Query:** `parentItemId` (optional int) + all the shared `QueryParams` (`page`, `pageSize`, `searchTerm`,
`sortBy`, `sortDirection`, `where`, `filterGroups`, `id`, `locale`).

The server always injects `groupId = :groupId` and `isActive = true`, plus `parentItemId` when given.
Canonical sort: `isPinned desc`, `order asc`, then `sortBy ?? 'name'`. `searchTerm` here is a
**substring** match and is cross-locale (it resolves matching ids through the translation table first).

Response `data` is a `PaginatedResponse` of:

```ts
{
  id: number;
  groupId: number;
  parentItemId: number | null;
  slug: string;
  name: string;                       // locale-resolved
  iconUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isLeaf: boolean;                    // false = an intermediate node the user cannot select directly
  order: number;
  metadata: Record<string, unknown> | null;
  translations: { ar?: { name: string }, en?: { name: string } };
  createdAt: string;
  updatedAt: string;
}
```

Redis-cached per (groupId, parentItemId, query).

### 2.2 `GET /listing-type-ref/ref-groups/:groupId/items/fuzzy` — the "did you mean?" call

Trigram-ranked near-match search. From the controller's own comment:

> exposed over HTTP so the app can offer near-matches before a seller proposes a value that is really a
> typo of one already in the catalogue. **Deliberately NOT cached.**

**Auth:** none. **Path:** `groupId` (int). **Headers:** `Accept-Language`.

| Query param | Type | Required | Notes |
|---|---|---|---|
| `searchTerm` | string | **yes** | empty or whitespace returns `[]` with a **200**, not an error |
| `parentItemId` | int | no | scope to a cascading parent |
| `searchAllParents` | string | no | **compared to the literal string `'true'`** — send `?searchAllParents=true` |

Response `data` is a **bare array**, ordered by `score` descending, **max 8 results**:

```ts
interface FuzzyRefItemResult {
  id: number;
  slug: string;
  label: string;                        // ← `label`, NOT `name`. This shape is deliberately narrower.
  score: number;                        // trigram similarity, 0..1
  parentItemId: number | null;
  parentLabel: string | null;           // set only for a cascading child (e.g. the make of a model)
  metadata: Record<string, unknown> | null;
  parentMetadata: Record<string, unknown> | null;
}
```

Behaviour you must design around:

- **The server widens the search across parents on its own.** If a parent-scoped search returns zero
  hits, it retries once across all parents. So **a hit routinely belongs to a different parent than the
  one you asked for.** Always read `parentItemId` / `parentLabel` off each result — see §7.5.
- `matchPartialWords` is hard-coded on for this endpoint, so `"chev"` matches `"Chevrolet"`.
- The similarity threshold is the setting `reference_proposals.duplicate_match_threshold` (default
  `0.4`). Lower means more suggestions.
- **Do not cache this client-side.** It is typed one keystroke at a time; a stale suggestion list is
  worse than a refetch. Set `staleTime: 0` / `gcTime: 0` on the query.
- `metadata` and `parentMetadata` are not decoration — see §7.6.

### 2.3 Submitting a proposal — on the listing write

`POST /api/…/my-listings` (201) and `PUT /my-listings/:id`.
**Auth:** Bearer + `user` role. Optional header `x-idempotency-key` on the create.

The relevant part of the body schema, verbatim from the backend:

```ts
export const AttributeValueInputSchema = z.object({
  attributeId: z.number().int().positive('Attribute ID is required'),
  valueText: z.string().nullable().optional(),
  valueTextTranslations: z.record(z.string(), z.string().nullable()).nullable().optional(),
  valueNumber: z.number().nullable().optional(),
  valueBoolean: z.boolean().nullable().optional(),
  valueDate: z.string().nullable().optional(),         // ISO date string
  valueJson: z.unknown().nullable().optional(),        // multi_select: string[]; range: { min, max }
  referenceItemId: z.number().int().positive().nullable().optional(),
  // For type=reference when the catalogue has no match: the value the seller
  // typed, to be reviewed by an admin. Mutually exclusive with referenceItemId.
  proposedReferenceName: z.string().trim().min(1).max(120).nullable().optional(),
});
```

**To propose:** send the attribute's entry with `proposedReferenceName` set and `referenceItemId`
omitted (or null). That is the whole mechanism.

```jsonc
{
  "listingTypeId": 3,
  "listingOfferType": "for_sale",
  "price": 12000,
  "currency": "USD",
  "translations": { "ar": { "title": "…" }, "en": { "title": "…" } },
  "attributeValues": [
    { "attributeId": 11, "referenceItemId": 402 },              // Make — picked normally
    { "attributeId": 12, "proposedReferenceName": "Zzz Turbo GT" }, // Model — proposed
    { "attributeId": 15, "valueNumber": 2019 }                  // Year
  ],
  "images": ["https://…"],
  "primaryImageIndex": 0,
  "contactNumber": "+963955555555"
}
```

**Chained proposals** — missing make *and* missing model: send `proposedReferenceName` on **both**
attributes in the same payload. The server orders parents before children and wires the child
proposal's `parentProposalId` itself. You send nothing extra.

There is **no `origin` field in the body.** The server stamps it from `createdVia`.

`PUT` uses `UpdateListingSchema` = the create schema, partial, plus an optional `version`.

### 2.4 Reading proposal state back

`GET /my-listings/:id` (owner) **and** the public visitor detail routes both shape
`attributeValues[]` the same way:

```ts
{
  id: number;
  attributeId: number;
  valueText, valueNumber, valueBoolean, valueDate, valueJson, valueTextTranslations,
  referenceItemId: number | null;
  refItemProposalId: number | null;
  attribute: {                                   // name/hint locale-resolved
    id: number; slug: string; type: string;
    name: string; hint: string | null;
    options: unknown; isTranslatable: boolean;
  } | null;
  referenceItem: { id: number; slug: string; name: string; iconUrl: string | null; logoUrl: string | null } | null;
  refItemProposal: {
    id: number;
    submittedName: string;
    status: 'pending' | 'approved' | 'rejected' | 'linked' | 'withdrawn' | 'orphaned';
    resolvedItemId: number | null;
  } | null;
}
```

`refItemProposal.status === 'pending'` is the signal to render "awaiting review".

> Note this appears on the **public** detail routes too, not just the owner's. A visitor viewing a
> listing whose seller proposed a value will receive `refItemProposal` in the payload. Decide
> deliberately what a buyer sees — the mobile app shows nothing there (see §7.8).

### 2.5 Admin-only — do not call from the website

`/listing-ref-proposals-repo` — `GET /`, `GET /:id`, `PATCH /:id/approve`, `PATCH /:id/link`,
`PATCH /:id/reject`, `POST /bulk-approve`, `POST /bulk-reject`. All require the
`listing_types.MODERATE_PROPOSALS` permission.

> **There is no user-facing "my proposals" endpoint.** A seller sees proposal state only through
> `refItemProposal` on their own listings. If you want a "my pending suggestions" page, that needs a
> backend change — ask first.

---

## 3. Enums & constants

```ts
// Proposal status — src/db/schema/listing-types/listing-types.enums.ts
'pending'    // awaiting admin review
| 'approved' // accepted; a new catalogue item was created
| 'rejected' // declined
| 'linked'   // resolved by binding to an existing item instead
| 'withdrawn'// no listing references it any more
| 'orphaned' // its attribute or group vanished in a newer listing-type version

// Attribute types (the full set — `reference` is the only one that can carry a proposal)
'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date' | 'range'
| 'reference' | 'repeating_group' | 'year' | 'color_picker'
| 'color_selection' | 'color_multi_selection'

// Proposal origin, stamped by the server from the listing's createdVia
'manual' | 'ai' | 'voice'
```

The contact/URL guard regex, which you must mirror **exactly** (§6):

```ts
export const LOOKS_LIKE_CONTACT_OR_URL =
  /(https?:\/\/|www\.|\S+@\S+\.\S+|\+?\d[\d\s\-()]{7,})/i;
```

---

## 4. Settings

Group `listings_settings.reference_proposals`. Read via `GET /settings/listings_settings/reference_proposals`
or `GET /settings/public`.

| Key | Type | Default | What it controls |
|---|---|---|---|
| `enabled` | boolean | `true` | Kill switch. Hides every propose affordance. Turning it off does **not** touch proposals already awaiting review. |
| `max_per_listing` | number | `5` | Max proposals in one listing payload. |
| `min_name_length` | number | `2` | Below this: show an error, and do **not** fire the fuzzy query. |
| `max_name_length` | number | `120` | Above this: show an error. Zod also hard-caps at 120 regardless. |
| `allow_chained_proposals` | boolean | `true` | Lets a seller propose a value whose parent is also proposed (a missing model under a missing make). |
| `max_pending_per_user` | number | `10` | Abuse cap across the whole account. |
| `duplicate_match_threshold` | number | `0.4` | Trigram similarity used by the fuzzy endpoint. Lower = more suggestions. Server-side only. |
| `notify_admins` | boolean | `true` | Admin notification on a new proposal. Server-side only. |

> **`max_pending_per_user` cannot be pre-checked.** No endpoint exposes the account-wide pending count.
> You will only ever discover it from the 422 on submit. Handle that case gracefully; do not try to
> count client-side.

The group is **optional** on the settings payload — a cached response from before it existed will not
have it. Code the defaults above as fallbacks.

---

## 5. Errors to handle

Every proposal rejection comes back as:

```jsonc
{
  "success": false,
  "message": "The request could not be processed",
  "errors": { "message": "<the detail below>" },
  "path": "...", "timestamp": "..."
}
```

HTTP **422**. The detail messages, verbatim:

| Condition | Detail message |
|---|---|
| feature disabled | `Proposing new reference values is currently disabled.` |
| more than `max_per_listing` in one payload | `A listing may propose at most {maxPerListing} new values.` |
| `attributeId` not in this listing type | `Attribute #{id} is not part of this listing type.` |
| attribute is not `type: 'reference'` | `A new value can only be proposed for a reference attribute ("{slug}" is "{type}").` |
| both `referenceItemId` and `proposedReferenceName` sent | `"{slug}" cannot carry both a selected value and a proposed one.` |
| name length outside the settings bounds | `Proposed value for "{slug}" must be between {min} and {max} characters.` |
| name contains a URL / email / phone | `Proposed value for "{slug}" may not contain a link, email or phone number.` |
| normalized name is empty | `Proposed value for "{slug}" has no usable characters.` |
| parent also proposed but chaining is off | `"{parentSlug}" must be an existing value before a new "{slug}" can be proposed.` |
| parent attribute has no selected item | `Select "{parentSlug}" before proposing a new "{slug}".` |
| unknown chained parent in payload | `Cannot propose "{attributeSlug}" before its parent "{parentAttributeSlug}".` |
| over the account-wide pending cap | `You already have {pending} proposed values awaiting review (limit {cap}). Please wait for them to be reviewed.` |
| listing type has no published schema | `This listing type has no published schema, so a new value cannot be proposed.` |

> ### ⚠️ Never string-match these
>
> They are **English-only, non-enumerated free text with no error code.** There is nothing safe to
> branch on. Match on the **status code** and on whether *your own payload* contained a proposal:
>
> ```ts
> export const bodyHasReferenceProposal = (body: Record<string, unknown>): boolean => {
>   const values = body.attributeValues;
>   if (!Array.isArray(values)) return false;
>   return values.some((v) => (v as { proposedReferenceName?: unknown })?.proposedReferenceName != null);
> };
>
> export const resolveSubmitErrorKey = (err: unknown, hasProposals = false): string => {
>   const status = (err as { status?: unknown })?.status;
>   if (status === 409) return 'listing.errors.conflict';
>   if (status === 422 && hasProposals) return 'listing.errors.reference_proposal_generic';
>   return 'listing.errors.submit_failed';
> };
> ```
>
> Derive the flag **from the body**, not from a parameter each caller passes — a new submit path cannot
> then forget it.
>
> This is exactly why §6 exists: gating up front is the only way to explain the limit in the user's own
> language, because the server's answer is untranslatable.

### Silent server behaviours — no error, but the result differs from what you sent

| Behaviour | Consequence for your UI |
|---|---|
| **An exact catalogue match wins silently.** If the typed name exactly matches an active item under the same parent, the server converts it into a normal selection (`referenceItemId = existing.id`, `proposedReferenceName = null`). No proposal, no error. (Skipped for chained proposals.) | After a successful save, re-read the listing rather than assuming your local state matches. The attribute may come back as a normal reference value. |
| **Deduplication.** A matching pending proposal (same group + parent + normalized name) is reused. No new row. | Two sellers proposing the same thing share one review. Nothing to render differently. |
| **Withdrawal on edit.** If an update no longer carries a binding, it is unbound, and the proposal moves `pending → withdrawn` **only when no other listing is still bound to it**. | Clearing a proposed value on edit is safe and does not affect other sellers. |
| **A pending proposal counts as an answer** for required-attribute validation. | Mirror this client-side — §7.7. |

---

## 6. Client-side guards — mirror these exactly

Run these **in this order** before enabling the confirm button:

```ts
if (!enabled)                                  return 'referenceProposal.error_disabled';
if (trimmed.length < minNameLength)            return 'referenceProposal.error_too_short';   // { min }
if (trimmed.length > maxNameLength)            return 'referenceProposal.error_too_long';    // { max }
if (LOOKS_LIKE_CONTACT_OR_URL.test(trimmed))   return 'referenceProposal.error_contact_info';
```

The regex is a **client mirror of the backend's guard**. The 422 it prevents is an English-only string
with no code, so it must match character-for-character:

```ts
/(https?:\/\/|www\.|\S+@\S+\.\S+|\+?\d[\d\s\-()]{7,})/i
```

### Visibility gate

One function decides whether a propose affordance shows at all. Every host shares it:

```ts
const canProposeFor = (attr, parentReferenceItemId: number | null) => {
  if (!isEnabled) return false;
  if (attr.type !== 'reference' || attr.referenceGroupId == null) return false;

  const alreadyProposed = currentProposals[attr.id] != null;
  // An attribute that already has a proposal keeps its CTA (revise/replace);
  // the cap only blocks an N+1th.
  if (!alreadyProposed && proposalCount >= maxPerListing) return false;

  // Chained proposals off ⇒ a cascading child needs a REAL parent. A merely
  // proposed parent leaves `parentReferenceItemId` null, which is what makes
  // this check cover both "unset" and "proposed" without a separate branch.
  if (!allowChained && attr.dependsOnAttributeId != null && parentReferenceItemId == null) return false;

  return true;
};
```

---

## 7. UX reference (from the mobile app)

### 7.1 Where the affordance appears

Inside the **reference attribute's picker**, in two places:

1. **When the search returned nothing** — as the action button on the empty state. This branch renders
   no list, so a footer CTA cannot appear there, and it is exactly where the user needs it most.
2. **When the list is not empty** — as a ghost button in the **list footer**, alongside the pagination
   spinner. A long list can still be loading a page and not hold the item.

CTA label: *"Can't find the {attribute}? Suggest it"* — with the attribute name bidi-isolated. Falls
back to *"Can't find it? Suggest it"* when no attribute label is available.

> **Ordering note that matters on the web too:** on mobile, the propose sheet opens only **after** the
> picker sheet has fully dismissed — opening both in the same commit froze the app on iOS. On the web,
> if your picker is a `<Dialog>` or `<Popover>`, close it and open the propose dialog in the close
> callback rather than stacking two modals.

### 7.2 The propose dialog

**It performs no network write.** It reads the fuzzy endpoint and resolves one of two outcomes back to
its caller. The actual proposal goes out with the listing.

**Header (fixed):** title *"Suggest a new value for "{attribute}""*, subtitle *"An admin reviews it
before it joins the list. You can publish your listing meanwhile."*, then the **Name** text field —
autofocused, autocorrect off, **seeded with whatever the user had typed into the picker's search box**.

**Body (scrolls):** the *"Did you mean one of these?"* section. It renders **only** when
`debouncedName.length >= minNameLength` **and** (loading **or** ≥1 candidate). A settled-empty result
shows **nothing** — no empty-state chrome. While loading, 3 skeleton rows.

Each candidate row: `label`, plus an *"under {parent}"* caption when `parentLabel != null`.

**Footer (fixed):** the confirm button. Label is *"None of these — suggest "{name}""* when candidates
exist, else *"Suggest this name"*. Disabled whenever a validation error is present.

**Debounce before the fuzzy query: 300 ms.**

**Two outcomes:**

```ts
type ProposeReferenceResult =
  | { kind: 'propose';  name: string }
  | { kind: 'existing'; id: number; label: string; parentItemId: number | null;
      parentLabel: string | null; metadata: unknown; parentMetadata: unknown };
```

### 7.3 The trigger row once a proposal is held

The attribute's trigger shows the proposed name plus a muted **"Pending"** pill (clock icon), and a
separate **×** clear button.

> Make the × and the open-picker control **siblings**, not nested. On mobile, nesting them made every
> "clear" also open the picker. On the web the same trap is a `<button>` inside a `<button>` (invalid
> HTML) or a click handler on a wrapping div — put the clear button outside the trigger's click area.

A real pick always wins over a proposal:

```ts
const pendingName = value == null ? proposedValue?.name ?? null : null;
```

### 7.4 The blocked child picker

When a cascading parent holds a **proposal** rather than a real item, the child's picker must:

- **skip the browse query entirely** — do not run it unscoped, or you show every model of every make
- render an explained empty state: *"The value you suggested for "{parent}" is still under review, so
  nothing is listed under it yet."*

The distinct case where the parent is simply **unset** gets different copy: *"Choose "{parent}" first
to see the options available here."*

### 7.5 Picking a "did you mean?" candidate re-binds the whole chain

This is the subtlest rule in the feature.

Because the server widens the fuzzy search across parents (§2.2), a candidate routinely belongs to a
**different parent** than the one currently selected. Example: the seller's make says "Zzz", they type
"ZS" for the model, and the top candidate is the MG ZS — under **MG**.

> **Re-bind from the candidate's `parentItemId`, up the whole chain — including replacing a proposed
> make with the real parent.** Binding the child alone is how a model ends up filed under a make it does
> not belong to.

### 7.6 Carry `metadata` and `parentMetadata` through

They ride along on the fuzzy result for a reason: `conditionallyRequiredWhen` rules read the **parent's
metadata** to decide whether a child field (e.g. Trim) is shown at all. Dropping them made picking a
suggestion **hide a field that picking from the list revealed**.

### 7.7 Four places a pending proposal changes behaviour

These must all agree, or the user reviews one listing and submits another.

1. **It counts as "filled."** `hasAttributeValue(attr, value, hasProposal)` returns true for
   `type === 'reference'` when a proposal exists, so a required attribute stops blocking submission.
   Type-specific rules are **skipped** — there is no real value to run them against.
2. **A proposed parent keeps its conditionally-required child VISIBLE and OPTIONAL.** A proposed parent
   has no metadata, and a naive evaluator reads "no metadata" as "flag off" and hides the child.
   **"Unknown" is not "off."** Guard this in *every* place that evaluates display: the form, the
   validator, the review/preview builder, and the submit assembler.
3. **A cascading child is not disabled by a proposed parent.** Treat "parent has a value" as
   `parentValue != null || parentProposal != null` — otherwise proposing a make locks the model. (The
   child's picker still shows the explained empty list from §7.4.)
4. **The review step renders the proposed name plus a "Pending review" badge** — muted, *not*
   destructive. A proposal is a pending answer, not an error. Put the badge **below** the value, not
   beside it: in a two-column spec grid the label is long enough to shrink the value to zero width. The
   row must **not** fall through to the "Not added" empty placeholder.

### 7.8 Cascade clearing

Changing **or** proposing a parent clears every dependent's value, snapshot **and** pending proposal.
Half-cleared cascades are how a listing ends up with a Trim that belongs to another Model.

### 7.9 Editing a listing that has a pending proposal

Check the proposal branch **first**, before `referenceItemId`:

```ts
// Checked FIRST: a still-pending proposal is the attribute's real answer, and it
// deliberately leaves the value map unset (the two are mutually exclusive).
// Without this the seller reopens their listing and their proposed value has
// silently vanished.
if (av.refItemProposal != null && av.refItemProposal.status === 'pending') {
  proposals[attrId] = { name: av.refItemProposal.submittedName };
} else if (av.referenceItemId != null) {
  values[attrId] = av.referenceItemId;
}
```

Editing then behaves exactly like creating: proposed name + Pending pill on the trigger, blocked child
picker, Pending badge on review, and re-submitting re-sends `proposedReferenceName`.

### 7.10 Known gaps in the mobile app — the web can do better

The mobile app has three gaps here. None are bugs you must reproduce; two are worth fixing on the web:

| Gap | Recommendation for the website |
|---|---|
| **No badge on the saved my-listing detail view.** `refItemProposal` is in the payload but the detail formatter renders `referenceItem?.name ?? ''`, so a pending proposal shows as an **empty value**. The Pending badge exists only in the create/edit review. | **Fix it on the web.** Render the proposed name + Pending badge on the my-listings detail too. An empty field where the seller entered something reads as data loss. |
| **No "blocked from approval" notice anywhere.** The seller is never told that their listing cannot go live until the proposal is reviewed. | **Add it on the web.** A single line on the my-listing detail — *"Your listing can't be approved until we review the value you suggested"* — is worth a lot of support email. |
| **No proposal-specific notifications.** There is a generic notification type enum with server-supplied title/body; nothing client-side handles a proposal approval or rejection specifically. | Nothing to build. If the backend emits a generic notification, it renders through your existing notifications surface. |

**After a rejection**, a required attribute can be left empty — the listing then fails approval for a
different reason (`invalid_attributes`, with the missing attribute slugs). The seller must edit and pick
a real value. Surface that clearly.

---

## 8. i18n keys

| Key | English | العربية |
|---|---|---|
| `referenceProposal.propose_cta` | Can't find the {attribute}? Suggest it | لم تجد «{attribute}»؟ اقترحه |
| `referenceProposal.propose_cta_generic` | Can't find it? Suggest it | لم تجده؟ اقترحه |
| `referenceProposal.pending_pill` | Pending | قيد المراجعة |
| `referenceProposal.clear_a11y` | Remove suggested value | إزالة القيمة المقترحة |
| `referenceProposal.sheet_title` | Suggest a new value for "{attribute}" | اقتراح قيمة جديدة لـ«{attribute}» |
| `referenceProposal.sheet_subtitle` | An admin reviews it before it joins the list. You can publish your listing meanwhile. | يراجعه المشرف قبل إضافته إلى القائمة، ويمكنك نشر إعلانك في الأثناء. |
| `referenceProposal.name_label` | Name | الاسم |
| `referenceProposal.name_placeholder` | Type the exact {attribute} name | اكتب اسم «{attribute}» بدقة |
| `referenceProposal.did_you_mean_title` | Did you mean one of these? | هل تقصد أحد هذه؟ |
| `referenceProposal.did_you_mean_hint` | Or did you mean: | أم تقصد: |
| `referenceProposal.under_parent` | under {parent} | ضمن {parent} |
| `referenceProposal.confirm_cta` | None of these — suggest "{name}" | لا شيء من هذه — اقترح "{name}" |
| `referenceProposal.confirm_cta_empty` | Suggest this name | اقترح هذا الاسم |
| `referenceProposal.error_too_short` | Must be at least {min} characters | يجب ألا يقل عن {min} أحرف |
| `referenceProposal.error_too_long` | Must be at most {max} characters | يجب ألا يزيد عن {max} حرفًا |
| `referenceProposal.error_contact_info` | Please don't include a phone number, link, or email | الرجاء عدم تضمين رقم هاتف أو رابط أو بريد إلكتروني |
| `referenceProposal.error_disabled` | Suggesting new options is currently unavailable | اقتراح خيارات جديدة غير متاح حاليًا |
| `listing.preview.pending_badge` | Pending review | قيد المراجعة |
| `listing.errors.reference_proposal_generic` | We couldn't submit one of your suggested values. Please review your listing and try again. | تعذر إرسال إحدى القيم المقترحة. يرجى مراجعة الإعلان والمحاولة مرة أخرى. |
| `attributeForm.search_in_attribute` | Search {attribute}… | ابحث في «{attribute}»… |
| `attributeForm.parent_pending_description` | The value you suggested for "{parent}" is still under review, so nothing is listed under it yet. | القيمة التي اقترحتها لـ«{parent}» ما تزال قيد المراجعة، لذا لا توجد خيارات مرتبطة بها بعد. |
| `attributeForm.parent_unset_description` | Choose "{parent}" first to see the options available here. | اختر «{parent}» أولًا لعرض الخيارات المتاحة هنا. |
| `attributeForm.options_empty_title` | No options available | لا توجد خيارات متاحة |
| `attributeForm.options_empty_description` | There are no options to choose from here. | لا توجد خيارات للاختيار من بينها هنا. |

New strings the web should add (no mobile equivalent — see §7.10):

| Key | English | العربية |
|---|---|---|
| `referenceProposal.blocked_from_approval` | Your listing can't be approved until we review the value you suggested. | لا يمكن الموافقة على إعلانك حتى نراجع القيمة التي اقترحتها. |

> `{attribute}` and `{parent}` interpolate a catalogue name that is frequently Latin (`Model`, `BMW`)
> inside Arabic prose. **Bidi-isolate them** — `⁦{attribute}⁩` or a `dir="ltr"` span. See
> `00-conventions.md` §9.

---

## 9. Where this lands in `bishola-website`

### 9.1 The files that change

The add-listing wizard lives at `src/components/web/ProductsPage/addProducts/`:

| File | Change |
|---|---|
| `Main/hooks/useDynamicForm.ts` | Add the fuzzy call beside the existing `fetchOptions()`. Add a `proposals: Record<attributeId, { name: string }>` map, kept **mutually exclusive** with the value map. Extend the cascade-clear to clear proposals too. |
| `Main/Components/DynamicFormStep.tsx` | The reference branch (~line 412, `type === 'reference'` → `SelectFieldWithSearch`). Add the propose CTA, the Pending pill on the trigger, the × clear, and the blocked-child empty state. Apply the four rules in §7.7 to the `valueDependency` / hidden-field logic already there. |
| `Main/hooks/useSubmitForm.ts` | Emit `{ attributeId, proposedReferenceName }` entries from the proposals map. Extend `buildAttributeValue` so a proposal is not routed into `valueText`. Add `bodyHasReferenceProposal` + `resolveSubmitErrorKey` from §5. |
| `Main/Components/ErrorDialog.tsx` | Render the mapped i18n key, never the raw 422 string. |
| `src/app/[locale]/(web)/products/EditProduct/[id]/page.tsx` | Prefill per §7.9 — check `refItemProposal.status === 'pending'` **before** `referenceItemId` when flattening the listing into the wizard's localStorage buckets. |
| `src/components/web/design/SelectFieldWithSearch.tsx` | Where the picker UI actually lives. |
| `src/components/web/MyListings/MyListingDetailPage.tsx` | §7.10 — render the proposed name + Pending badge + the "can't be approved yet" line. |

### 9.2 New files

| File | What |
|---|---|
| `src/core/infrastructure-adapters/actions/visitors/reference-proposal.actions.ts` | `'use server'` — the fuzzy call |
| `src/core/infrastructure-adapters/use-actions/visitors/reference-proposal.use-actions.ts` | TanStack hook, `staleTime: 0`, `gcTime: 0` |
| `src/components/web/ProductsPage/addProducts/ProposeReferenceDialog.tsx` | §7.2 |
| `src/core/entities/models/listings/reference-proposal.dto.ts` | `FuzzyRefItemResult`, `RefItemProposal`, status union |

Reuse `src/components/ui/dialog.tsx`, `ui/skeleton.tsx`, `ui/badge.tsx` and `ui/input.tsx`.

### 9.3 Prerequisites and gotchas

| # | Thing | Where |
|---|---|---|
| 1 | **The wizard is hand-rolled `useState` + manual validation, not react-hook-form.** Only `AddProductStepFour.tsx` uses `zodResolver`. The dynamic attribute step validates by hand — the four rules in §7.7 have to be threaded into that hand-rolled logic, in every place it runs. | `Main/hooks/useStepManagement.ts`, `useDynamicForm.ts` |
| 2 | **Drafts persist to `localStorage`, not to the server.** `STORAGE_KEYS` in `Main/hooks/useLocalStorage.ts`, with separate buckets for create and edit. Proposals must be persisted and restored alongside `__attributeMap__` or they vanish on refresh. | `Main/hooks/useLocalStorage.ts` |
| 3 | **`__attributeMap__`** — `useDynamicForm` writes `{ [slug]: { id, type, isRequired } }` into the step's bucket so submit-time can resolve attribute ids. A proposal needs the same treatment. | `useDynamicForm.ts` |
| 4 | Governorate/city are special-cased to a local `SyriaGovernorate` enum, not the reference catalogue — they can never carry a proposal. | `addProducts/StepOne/utils.tsx` |
| 5 | `useSubmitForm.ts` duplicates the same title/description into **both** `en` and `ar` translations, and leaves a `console.log("createDto", …)` in production. Worth cleaning while you're in the file. | `Main/hooks/useSubmitForm.ts` |

---

## 10. Testing checklist

- Searching a reference picker for a nonsense string shows the empty state **with** the "Suggest it"
  CTA.
- Searching for a string with results shows the CTA in the list footer, below the options.
- Typing a near-match (`"Chevrolet"` misspelled) in the propose dialog surfaces candidates within
  ~300 ms; typing 1 character fires no request at all.
- Picking a candidate whose `parentItemId` differs from the current selection **re-binds the parent
  too**, and any child field gated on the parent's metadata appears/disappears correctly.
- Confirming a proposal shows the proposed name + Pending pill on the trigger.
- With a proposed Make, the Model picker is **enabled** but shows the "still under review" empty state,
  and fires no unscoped browse request.
- A required reference attribute with a proposal does **not** block Next / Submit.
- The review step shows the proposed name with a muted "Pending review" badge — not "Not added", not a
  red error.
- Entering `+963 955 555 555` or `www.example.com` as a proposed name is blocked **client-side** with
  the Arabic error, before any request.
- Submitting with a proposal succeeds; re-opening the listing for edit shows the proposed name again,
  not an empty field.
- Submitting a name that exactly matches an existing catalogue item comes back as a **normal selection**
  with no proposal — re-read the listing and confirm the UI reflects that.
- A 422 on submit shows the translated generic message, never the raw English detail.
- Refreshing the page mid-wizard restores the proposal along with the rest of the draft.
