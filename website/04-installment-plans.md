# 04 — Installment plans

> Backend `3df207e`, mobile app `7858bdd`, admin `8cd4805`.
> **Two prerequisite defects block this feature — read §11.4 before you start.**

## Quick facts

| | |
|---|---|
| **Read policy from** | `GET /listing-types` or `GET /listing-types/:slug` — **not from a listing card** (§2.1) |
| **Card carries** | `installmentsAvailable: boolean` + `minMonthlyInstallment: string \| null` |
| **Detail carries** | `installmentsAvailable` + `installmentPlans[]` — **no** `minMonthlyInstallment` |
| **Write** | `installmentsAvailable` + `installmentPlans` on `POST`/`PUT /my-listings` — **together or not at all** |
| **Money** | **numbers in, decimal strings out.** Total is never stored. |
| **Filter** | `where=[{"field":"installmentsAvailable","operator":"eq","value":true}]` |
| **Settings** | `listings_settings.installments.{max_plans_per_listing, max_months}` |

---

## 1. What the feature is

A seller with a for-sale listing can offer **installment plans**: "24 months, $3,000 down, $450 a
month". A listing may carry several, so a buyer can pick a duration.

Whether installments are offered at all is **per listing type**, not a global setting. A listing type
carries three new policy flags:

| Flag | Meaning |
|---|---|
| `rentEnabled` | `false` ⇒ this type is **sale-only**: `listingOfferType` is always `for_sale` and `rentType` is always `null`. Do not render an offer-type selector. |
| `installmentsEnabled` | `false` ⇒ no installments UI at all for this type — not the toggle, not the editor, not the search filter. |
| `installmentsMode` | `'free'` ⇒ the seller may enter any duration. `'catalog'` ⇒ only durations from the type's own `installmentOptions` list. |

Installments are **for-sale only**. They never apply to a rental.

---

## 2. API contract

### 2.1 `GET /listing-types` and `GET /listing-types/:slug` — the policy source

**Auth:** none. **Headers:** `Accept-Language`. **Query:** the shared `QueryParams` on the list route.

`data` on the list route is a `PaginatedResponse`; on the `:slug` route it is a single object. Either
way each listing type is:

```ts
{
  id: number;
  slug: string;                       // 'motorcycles'
  name: string;                       // locale-resolved
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;

  rentEnabled: boolean;               // NEW
  installmentsEnabled: boolean;       // NEW
  installmentsMode: 'free' | 'catalog'; // NEW
  installmentOptions: Array<{ id: number; months: number; displayOrder: number }>; // NEW

  createdByAdminId: number | null;
  updatedByAdminId: number | null;
  createdAt: string; updatedAt: string; deletedAt: string | null;
}
```

`installmentOptions` semantics, from the service's own comment:

> Attaches the installment-duration catalog to types in `catalog` mode. A type in `free` mode gets an
> empty array — the seller may enter any duration there, so the catalog is inert.

So it is **always an array, never undefined**, and it is **`[]` unless
`installmentsEnabled && installmentsMode === 'catalog'`**. Sorted by `displayOrder`, then `id`.

> ### ⚠️ The card gotcha — read this before you design anything
>
> A **listing card** carries a nested `listingType` object, and it looks like it should have the policy
> flags. **It does not.** The eager-load allowlist for cards selects only
> `{ id, slug, name, description, iconUrl, imageUrl }`, so `rentEnabled`, `installmentsEnabled` and
> `installmentsMode` come out `undefined` and are **absent from card JSON entirely**.
>
> **Read the policy flags from `GET /listing-types` (cache it) or from the listing DETAIL response —
> never from a card.** A `!card.listingType.installmentsEnabled` check silently evaluates truthy-false
> for every listing and hides the feature everywhere.

### 2.2 Listing **card** shape — search, featured, trending, favourites, seller listings

Every card-shaped payload gains two fields:

```ts
{
  // …all listing columns…
  installmentsAvailable: boolean;
  minMonthlyInstallment: string | null;   // decimal string, e.g. "450.00"; null when no plans
  // …title, description, primaryImage, listingType, attributeValues, isFavorite, user…
}
```

`minMonthlyInstallment` is the cheapest `monthlyAmount` across the listing's plans. It is a **card-only
field** — the detail response does not have it.

`installmentPlans` is **never** on a card. Coordinates are also stripped from cards.

Endpoints returning card shape: `GET /listings-visitor/:typeId/search`, `/featured`, `/trending`,
`/recent`, `/card/:slug`, `GET /my-listings`, `GET /public/profile/v2/:userId/listings`.

### 2.3 Listing **detail** shape

`GET /listings-visitor/:id`, `GET /listings-visitor/slug/:slug` (both `@OptionalAuth`), and
`GET /my-listings/:id` (owner).

```ts
{
  // …all listing columns, incl.:
  installmentsAvailable: boolean;
  listingOfferType: 'for_sale' | 'for_rent';
  rentType: 'daily' | 'weekly' | 'monthly' | null;
  price: string | null;               // decimal string
  currency: string;                   // e.g. "USD"

  listingType: {
    id, slug, name, description, iconUrl, imageUrl,
    rentEnabled: boolean;             // ← present on DETAIL (unlike on a card)
    installmentsEnabled: boolean;
    installmentsMode: 'free' | 'catalog';
  } | null;

  installmentPlans: Array<{
    months: number;
    downPayment: string;              // "3000.00" — decimal STRING
    monthlyAmount: string;            // "450.00"  — decimal STRING
    note: string | null;              // already locale-resolved by the server
    displayOrder: number;
    noteTranslations?: { en: string | null; ar: string | null } | null;  // OWNER READ ONLY
  }>;                                 // always an array; [] when there are none

  // …images, attributeValues, translations, isFavorite…
}
```

Plans arrive sorted by `displayOrder`, then `months`.

**`noteTranslations` is only present on `GET /my-listings/:id`** (and admin reads), so a bilingual edit
form can round-trip both locales. Public detail gets the single resolved `note`.

**`minMonthlyInstallment` is NOT on the detail response.** Derive it:

```ts
const from = Math.min(...plans.map((p) => parseFloat(p.monthlyAmount)));
```

### 2.4 Writing plans — `POST /my-listings`, `PUT /my-listings/:id`

**Auth:** Bearer + `user` role. `POST` returns **201**. Optional `x-idempotency-key` header on create.

The installment part of the schema, verbatim:

```ts
export const InstallmentPlanInputSchema = z.object({
  months: z.number().int().min(1, 'Duration must be at least 1 month').max(120),
  downPayment: z.number().min(0, 'Down payment cannot be negative'),
  monthlyAmount: z.number().positive('Monthly amount must be positive'),
  noteTranslations: z.object({
      en: z.string().trim().max(300).nullable().optional(),
      ar: z.string().trim().max(300).nullable().optional(),
    }).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const InstallmentPlansArraySchema = z
  .array(InstallmentPlanInputSchema)
  .max(30)                          // hard cap; the settings value clamps below this
  .superRefine(/* rejects duplicate `months`: "Duplicate installment duration: N months" */);
```

And on the listing itself:

```ts
listingOfferType: z.enum(['for_sale', 'for_rent']),                    // REQUIRED
rentType: z.enum(['daily','weekly','monthly']).nullable().optional(),
installmentsAvailable: z.boolean().default(false).optional(),          // NEW
installmentPlans: InstallmentPlansArraySchema.optional(),              // NEW
price: z.number().positive('Price must be positive').nullable().optional(),
currency: z.string().default('USD').optional(),
```

> ### Three rules that will bite you
>
> **1. Numbers in, strings out.** You **send** `downPayment` and `monthlyAmount` as **numbers**. You
> **receive** them as **decimal strings**. Parse before doing arithmetic; a raw float sum surfaces as
> `1234.5600000000001`, so round to cents: `Math.round(v * 100) / 100`.
>
> **2. There is no plan `id`.** Plans are replaced wholesale on every write. `InstallmentPlanInputSchema`
> has no `id` field and none is returned. Do not build an update-one-plan flow.
>
> **3. Omitting `installmentPlans` leaves the stored plans untouched.** The server only rewrites rows
> when the key is present. **An edit that switches installments off must send `installmentPlans: []`
> explicitly**, or the old plans survive on a listing whose toggle says off.
>
> Send `installmentsAvailable` and `installmentPlans` **together, or neither**. Omit both entirely for a
> rental listing or an installments-disabled type.

Currency is inherited from the listing's `currency`. **Plans carry no currency of their own.**

### 2.5 Other `my-listings` routes, unchanged but relevant

`GET /my-listings` (card shape), `GET /my-listings/:id` (owner detail, with `noteTranslations`),
`PATCH /my-listings/:id/publication-status` (`{ publicationStatus: 'draft'|'published'|'sold' }`),
`PATCH /my-listings/:id/map-visibility`, `DELETE /my-listings/:id`,
`GET /my-listings/submissions/:key` (resolve an ambiguous create).

### 2.6 Admin-only — do not call

`listing-type.admin.controller.ts` (creates/updates a type's `rentEnabled`, `installmentsEnabled`,
`installmentsMode` and its `installmentOptions` catalogue) and `listing.admin.controller.ts`.

---

## 3. Enums & constants

```ts
// NEW — how a seller may pick installment durations on a listing of this type.
// `free` = any duration; `catalog` = only durations in the type's own catalog.
export const LISTING_INSTALLMENTS_MODE = { FREE: 'free', CATALOG: 'catalog' } as const;

// Pre-existing, needed alongside it
LISTING_OFFER_TYPE = { FOR_SALE: 'for_sale', FOR_RENT: 'for_rent' }
LISTING_RENT_TYPE  = { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly' }
PUBLICATION_STATUS = { DRAFT: 'draft', PUBLISHED: 'published', SOLD: 'sold' }
MODERATION_STATUS  = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }
```

Client constants worth mirroring (from the mobile app):

```ts
export const INSTALLMENTS_DEFAULT_MAX_PLANS_PER_LISTING = 6;   // settings fallback
export const INSTALLMENTS_DEFAULT_MAX_MONTHS = 60;             // settings fallback
export const INSTALLMENT_NOTE_MAX_LENGTH = 300;                // per locale, backend-enforced
export const INSTALLMENT_DURATION_PRESETS = [6, 12, 24, 36, 48, 60];  // `free` mode chips
export const DOWN_PAYMENT_PERCENT_PRESETS = [0, 10, 25, 50];   // 0 is a legitimate plan
export const SUMMARY_VISIBLE_PLANS = 3;                        // then "+N more"
```

Backend hard caps, which the settings values are clamped to:

```ts
INSTALLMENT_MONTHS_HARD_CAP = 120;
INSTALLMENT_PLANS_HARD_CAP  = 30;
```

---

## 4. Settings

Group `listings_settings.installments`. Read via `GET /settings/listings_settings/installments`.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `max_plans_per_listing` | number | `6` | How many plans a seller may attach to one for-sale listing. |
| `max_months` | number | `60` | Longest plan duration. Applies to **`free`-mode types only** — in `catalog` mode the type's own catalogue is the limit. |

> **Whether installments are offered at all is NOT a setting.** It is per listing type
> (`installmentsEnabled`, `rentEnabled`, `installmentsMode`). Do not look for a global on/off flag.

Neither key is `secret`, so both come through the public settings read. Code the defaults as fallbacks.

---

## 5. Errors to handle

All are **HTTP 400** from `enforceOfferAndInstallmentRules`, with the detail in `message`:

| Condition | Message |
|---|---|
| type has `rentEnabled: false` but you sent `for_rent` | `Listing type #<id> is sale-only; listingOfferType must be for_sale.` |
| `for_rent` with no `rentType` | `rentType is required when listingOfferType is for_rent.` |
| type has `installmentsEnabled: false` but you asked for installments | `Listing type #<id> does not allow installments.` |
| `for_rent` and you asked for installments | `Installments are only available on for-sale listings.` |
| `installmentsAvailable: true` with zero plans | `installmentsAvailable requires at least one installment plan.` |
| plans sent while `installmentsAvailable` is false | `installmentPlans were sent but installmentsAvailable is false.` |
| more plans than the setting allows | `A listing may have at most <N> installment plans.` |
| two plans with the same duration | `Duplicate installment duration: <N> months.` |
| a duration over the setting | `Installment duration may not exceed <N> months.` |
| `downPayment >= price` (when `price > 0`) | `Down payment (<d>) must be less than the listing price (<p>).` |
| catalog mode, a month not in the catalogue | `Installment duration(s) not offered by this listing type: 18, 30.` |

**Silent behaviours — no error, but the result differs from what you sent:**

- Switching a listing to `for_rent` **silently clears** `installmentsAvailable` and all its plans.
- A stray `rentType` on a `for_sale` listing is **silently nulled**.

Mirror every one of these client-side (§6). They are English-only strings with no error code, so they
cannot be translated for the user.

---

## 6. Client-side validation — mirror these

Validate **per field**, so the form can say *which* number is wrong.

| Condition | i18n key |
|---|---|
| months not a positive integer | `installments.errors.months_required` |
| months > `max_months` | `installments.errors.months_max` (`{max}`) |
| catalog mode and months not in the catalogue | `installments.errors.months_not_in_catalog` |
| months duplicates another plan | `installments.errors.months_duplicate` |
| `downPayment` empty | `installments.errors.down_payment_required` |
| `downPayment < 0` | `installments.errors.down_payment_negative` |
| `downPayment >= price` | `installments.errors.down_payment_too_high` |
| `monthlyAmount` empty | `installments.errors.monthly_amount_required` |
| `monthlyAmount <= 0` | `installments.errors.monthly_amount_positive` |

Form-level refinements, all gated on `installmentsAvailable === true`:

- zero plans → `installments.errors.plans_required`
- duplicate months across plans → `months_duplicate`
- any `plan.downPayment >= price` → `down_payment_too_high`

> **Only *display* an error once the field is non-null.** A missing value is already communicated by the
> disabled Save button. Showing "required" in red before the seller has typed anything reads as
> failure, not guidance.

Round every money value to cents: `Math.round(v * 100) / 100`.

---

## 7. UX reference (from the mobile app)

### 7.1 The three-level gate

All must pass before any installments UI renders:

1. **Listing type** — `installmentsEnabled === true`. Otherwise the block, the editor and the search
   filter are not rendered at all.
2. **Offer type** — `listingOfferType === 'for_sale'`. Hidden entirely for `for_rent`. When the type has
   `rentEnabled: false`, there is no offer-type selector at all and installments are always eligible.
3. **`installmentsMode`** — `catalog` restricts durations to the type's `installmentOptions[].months`
   (chips only, **no free-text field**); `free` shows preset chips **plus** a numeric "Another duration"
   input.

### 7.2 Where it lives in the seller flow

The same step as offer type / price / currency / location / condition. On the website that is
**StepFour** (`AddProductStepFour.tsx`). Order within the step:

```
Offer type  →  Rent type (only if for_rent)  →  Price  →  Currency
            →  ▸ Installments card ◂
            →  Location  →  Contact number  →  …
```

### 7.3 The summary card — four states

A card with a tinted disc + credit-card icon, the title **"Installments"**, the fixed caption **"Let
buyers pay in monthly instalments instead of all at once."** (a line describing what the switch *does*,
deliberately not a state sentence), and a master switch bound to `installmentsAvailable`.

| State | What renders below the switch |
|---|---|
| **Off, no plans** | nothing |
| **Off, plans exist** | a primary-coloured line: *"{n} plans saved — turn installments on to use them."* — **turning off never deletes plans** |
| **On, 0 plans** | hint *"Add at least one plan so buyers know the terms."* + a primary **"Add your first plan"** button |
| **On, ≥1 plan** | up to **3** compact plan rows, then *"+N more"*, then a ghost **"Manage plans"** button |

A form-level error (e.g. "Add at least one installment plan") renders in destructive colour under the
card.

**Toggle behaviour:**

- toggling **on with 0 plans** opens the editor straight onto the blank plan form — "on but empty" is a
  dead end
- toggling **on with plans** opens the editor on the list
- toggling **off** keeps the plans, writing `{ available: false, plans: <unchanged> }`

### 7.4 The plan editor — two views

On mobile this is a bottom sheet, *"because the plan fields drowned in the wizard's own fields — a
seller could scroll past a half-typed plan to Next and lose it."* On the web use a `<Dialog>` for the
same reason. **Do not inline the plan form into the wizard step.**

**View 1 — the plan list**

- Header: credit-card icon + **"Installment plans"**
- Empty: *"Add at least one plan so buyers know the terms."*
- Each plan is a full plan row card, clickable to edit, with a trash button (*"Remove plan"*)
- **Add row**: `+ Add plan` — primary when the list is empty, ghost otherwise. **Hidden** when
  `plans.length >= maxPlans` **or** (catalog mode and every catalogue duration is taken), replaced by
  the caption *"You can add up to {max} plans."* / *"Every available duration is already used."*
- Ghost **"Turn off installments"** at the bottom (keeps the plans)
- Footer: full-width primary **"Done"**

> **Dismissing the editor commits.** Closing writes `{ available: plans.length > 0, plans }`, so
> "available with no plans" can never survive. Do not treat close as cancel.

**View 2 — the single-plan form** (back chevron + **"Add plan"** / **"Edit plan"**)

**1. Duration**

- Chips, one per available duration, labelled *"{count} months"*.
- Chip source: `catalog` → the type's `installmentOptions`; `free` → `[6, 12, 24, 36, 48, 60]`.
- **In both cases, filter out** durations over `max_months` **and** durations already used by *another*
  plan. A taken duration is removed from the chip list entirely — **unreachable beats merely invalid**.
- `free` mode also renders a numeric **"Another duration"** input, placeholder *"e.g. 24"*, helper *"In
  months, up to {max}."*, with "months" as a right adornment.
- `catalog` with zero available chips → the caption *"Every available duration is already used."*

**2. Down payment**

- Quick-percent chips `0% / 10% / 25% / 50%`, rendered only once a price exists. **0% is a legitimate
  plan** — keep it.
- Numeric input, right adornment = the currency code.
- Helper: *"{percent}% of the price."* once a value is entered, else *"Must be less than the listing
  price."*

**3. Monthly amount**

- Numeric input, right adornment = currency.
- **Auto-computed** as `(price − downPayment) / months` whenever the seller changes duration or down
  payment — **until they type their own figure.** Helper then reads *"Calculated from the price:
  {value}. Edit it to add your markup."*
- Once overridden, a ghost **"Reset to the calculated amount"** button appears.
- **Editing an existing plan sets "overridden" immediately** — never overwrite a seller's own figure
  with a recomputation.

**4. Note (optional)**

Collapsed behind a ghost `+ Add a note (optional)` button; expands into a bilingual (en/ar) multiline
input, ~2 rows, client-truncated to **300 characters per locale**. Auto-expanded when editing a plan
that already has a note.

**The live maths panel** — in the form footer, above the buttons. Five label/value rows, each showing
`—` until its inputs exist:

```
Price                    12,000
− Down payment            3,000
= To finance              9,000
× 24 months                 450
Total                    13,800     ← emphasised
```

Plus, when the total exceeds the price, a small muted line: *"{value} more than the cash price"*.

Footer: ghost **Cancel** + primary **Save plan** (disabled while the draft is invalid).

### 7.5 The policy clamp — do not skip this

An admin can flip `rentEnabled` or `installmentsEnabled` **after** a draft was saved. On mount, the form
must force-correct itself:

- `!rentEnabled && offerType === 'for_rent'` → switch to `for_sale`, clear `rentType`
- installments no longer allowed → set `installmentsAvailable = false` (**keep the plans**)

Without this, a hidden field's "required" rule blocks submit forever with no visible cause. The website
persists drafts to `localStorage`, so this is not hypothetical — a draft can sit for weeks.

### 7.6 Buyer-side — the listing card

A **single muted caption line directly under the price**:

```
$12,000
from $450/month
```

Rendered only when **all** of:

- `installmentsAvailable === true`
- `minMonthlyInstallment` parses to a number
- `publicationStatus !== 'sold'` — *a sold listing is not purchasable at all, so its instalment terms
  are noise*

Style it **subordinate** to the price: muted, its own line, prefixed "from". It must not be mistakable
for the item's cost.

### 7.7 Buyer-side — the listing detail

**Not a table on the page.** A single clickable summary row, placed **immediately under the seller/price
card**:

```
┌──────────────────────────────────────────────────┐
│ (💳)  Installments available                  ›  │
│       from $450/month · 3 plans                  │
└──────────────────────────────────────────────────┘
```

Clicking it opens a read-only dialog: header **"Installment plans"**, subtitle **"Offered by the seller.
Agree the terms directly with them."**, body = a stack of full plan rows.

> Rationale, verbatim from the mobile implementation: *"three stacked plan cards ate most of the fold
> for something only a minority of buyers act on."*

Shown only when `installmentsAvailable === true` **and** `installmentPlans.length > 0`.

### 7.8 The plan row — the shared atom

```
┌───────────────────────────────────────────────┐
│ 24 months                        $450         │  ← duration left, amount right (primary colour)
│ Down payment $3,000              per month    │  ← captions
│ Total $13,800                                 │  ← full variant only
│ <the seller's note>                           │  ← full variant only, when present
└───────────────────────────────────────────────┘
```

Two variants: `compact` (used in the seller's summary card — drops the total, the note and the
elevation) and `full`.

**The total is always derived, never stored:** `downPayment + monthlyAmount * months`.

Note locale fallback: `isArabic ? (noteAr || noteEn) : (noteEn || noteAr)`.

### 7.9 The search filter

A **toggle row**, not a chip pair — *"the value is on/any, not a set of choices, so a chip pair would
imply a meaningless 'no' option."* Labelled **"Installments available"**.

- Visible only when `listingType.installmentsEnabled !== false` **and** the current offer-type filter is
  not `for_rent`.
- Serialises into the search `where` array **only when on**:
  ```jsonc
  { "field": "installmentsAvailable", "operator": "eq", "value": true }
  ```
  Sending `false` would exclude every cash listing — never do it.
- Switching the offer-type filter to `for_rent` **deletes** the installments filter from the draft.
- Counts as 1 toward the active-filter badge.
- Make sure `installmentsAvailable` survives the URL round-trip (`where → UI state → where`), or the
  filter silently drops on a shared link. There is a DB index for it, so it is cheap.

---

## 8. i18n keys

### Shared atoms

| Key | English | العربية |
|---|---|---|
| `installments.months_one` | {count} month | شهر واحد |
| `installments.months_other` | {count} months | {count} شهر |
| `installments.duration_unit` | months | شهر |
| `installments.per_month` | per month | شهرياً |
| `installments.down_payment_value` | Down payment {value} | الدفعة الأولى {value} |
| `installments.total_value` | Total {value} | الإجمالي {value} |
| `installments.price_label` | Price | السعر |
| `installments.down_payment_line` | − Down payment | − الدفعة الأولى |
| `installments.to_finance` | = To finance | = المبلغ المقسّط |
| `installments.monthly_line` | × {months} months | × {months} شهر |
| `installments.total_line` | Total | الإجمالي |
| `installments.over_cash_price` | {value} more than the cash price | {value} أكثر من السعر نقداً |

> **`monthly_line` uses `{months}`, deliberately not `{count}`.** In i18n libraries `count` switches the
> key into plural mode, and Arabic needs all six CLDR categories (`zero`, `one`, `two`, `few`, `many`,
> `other`). Where you *do* want pluralisation — `months_one` / `months_other` above — provide the full
> Arabic set: `بدون أشهر` (zero), `شهر واحد` (one), `شهران` (two), `{count} أشهر` (few),
> `{count} شهراً` (many), `{count} شهر` (other).

### Seller wizard

| Key | English | العربية |
|---|---|---|
| `installments.title` | Installments | التقسيط |
| `installments.description` | Let buyers pay in monthly instalments instead of all at once. | اسمح للمشترين بالدفع على أقساط شهرية بدلاً من الدفع دفعة واحدة. |
| `installments.sheet_title` | Installment plans | خطط التقسيط |
| `installments.empty_hint` | Add at least one plan so buyers know the terms. | أضف خطة واحدة على الأقل ليعرف المشترون الشروط. |
| `installments.add_first` | Add your first plan | أضف خطتك الأولى |
| `installments.add_plan` | Add plan | إضافة خطة |
| `installments.edit_plan` | Edit plan | تعديل الخطة |
| `installments.remove_plan` | Remove plan | حذف الخطة |
| `installments.manage` | Manage plans | إدارة الخطط |
| `installments.more_plans` | +{more} more | +{more} أخرى |
| `installments.done` | Done | تم |
| `installments.turn_off` | Turn off installments | إيقاف التقسيط |
| `installments.cancel_plan` | Cancel | إلغاء |
| `installments.save_plan` | Save plan | حفظ الخطة |
| `installments.duration` | Duration | المدة |
| `installments.duration_other` | Another duration | مدة أخرى |
| `installments.duration_placeholder` | e.g. 24 | مثال: ٢٤ |
| `installments.duration_hint` | In months, up to {max}. | بالأشهر، حتى {max}. |
| `installments.down_payment` | Down payment | الدفعة الأولى |
| `installments.down_payment_hint` | Must be less than the listing price. | يجب أن تكون أقل من سعر الإعلان. |
| `installments.down_payment_percent` | {percent}% | {percent}% |
| `installments.down_payment_of_price` | {percent}% of the price. | {percent}% من السعر. |
| `installments.monthly_amount` | Monthly amount | القسط الشهري |
| `installments.monthly_calculated` | Calculated from the price: {value}. Edit it to add your markup. | محسوب من السعر: {value}. عدّله لإضافة هامش ربحك. |
| `installments.monthly_reset` | Reset to the calculated amount | العودة إلى المبلغ المحسوب |
| `installments.note` | Note (optional) | ملاحظة (اختياري) |
| `installments.note_add` | Add a note (optional) | إضافة ملاحظة (اختياري) |
| `installments.catalog_exhausted` | Every available duration is already used. | تم استخدام كل المدد المتاحة. |
| `installments.max_reached` | You can add up to {max} plans. | يمكنك إضافة {max} خطط كحد أقصى. |
| `installments.kept_one` | 1 plan saved — turn installments on to use it. | خطة واحدة محفوظة — فعّل التقسيط لاستخدامها. |
| `installments.kept_other` | {count} plans saved — turn installments on to use them. | {count} خطة محفوظة — فعّل التقسيط لاستخدامها. |

### Errors

| Key | English | العربية |
|---|---|---|
| `installments.errors.months_required` | Enter a whole number of months | أدخل عدد أشهر صحيح |
| `installments.errors.months_max` | The duration must be {max} months or fewer | يجب ألا تتجاوز المدة {max} شهراً |
| `installments.errors.months_not_in_catalog` | Pick one of the offered durations | اختر إحدى المدد المتاحة |
| `installments.errors.months_duplicate` | Each plan needs a different duration | يجب أن تختلف مدة كل خطة |
| `installments.errors.down_payment_required` | Enter a down payment | أدخل الدفعة الأولى |
| `installments.errors.down_payment_negative` | The down payment cannot be negative | لا يمكن أن تكون الدفعة الأولى بالسالب |
| `installments.errors.down_payment_too_high` | The down payment must be less than the price | يجب أن تكون الدفعة الأولى أقل من السعر |
| `installments.errors.monthly_amount_required` | Enter a monthly amount | أدخل القسط الشهري |
| `installments.errors.monthly_amount_positive` | The monthly amount must be greater than zero | يجب أن يكون القسط الشهري أكبر من صفر |
| `installments.errors.plans_required` | Add at least one installment plan | أضف خطة تقسيط واحدة على الأقل |

### Buyer-facing

| Key | English | العربية |
|---|---|---|
| `listing.card.installments_from` | from {amount}/month | من {amount} شهرياً |
| `listing.detail.installments_summary_title` | Installments available | متاح بالتقسيط |
| `listing.detail.installments_summary_plans_one` | 1 plan | خطة واحدة |
| `listing.detail.installments_summary_plans_other` | {count} plans | {count} خطة |
| `listing.detail.installments_title` | Installment plans | خطط التقسيط |
| `listing.detail.installments_subtitle` | Offered by the seller. Agree the terms directly with them. | مقدَّمة من البائع. اتفق على الشروط معه مباشرة. |
| `listing.filters.installments_only_label` | Installments available | متاح بالتقسيط |
| `listing.preview.section_installments` | Installments | التقسيط |

> Money amounts and month counts inside Arabic prose are mixed-direction runs — bidi-isolate the
> interpolated value (`00-conventions.md` §9).

---

## 9. Where this lands in `bishola-website`

### 9.1 Seller side

| File | Change |
|---|---|
| `src/components/web/ProductsPage/addProducts/StepFour/AddProductStepFour.tsx` | Add the installments summary card after Price/Currency. This file already uses react-hook-form + `zodResolver`, so the form-level refinements in §6 slot in. |
| `.../StepFour/schema.ts` | Extend `adInformationSchema` with `installmentsAvailable`, `installmentPlans`, **and `rentType`** (see §11.4). |
| `.../Main/hooks/useSubmitForm.ts` | Emit `installmentsAvailable` + `installmentPlans` per §2.4 — together or neither, `[]` when switching off. Map plan money values to **numbers**. |
| `.../Main/hooks/useLocalStorage.ts` | Plans must persist into the draft bucket and restore. |
| `src/app/[locale]/(web)/products/EditProduct/[id]/page.tsx` | Flatten `installmentPlans` (with `noteTranslations`, which the owner read provides) back into the form. Run the policy clamp from §7.5 on mount. |

### 9.2 New components

| File | What |
|---|---|
| `src/components/web/ProductsPage/addProducts/StepFour/InstallmentsCard.tsx` | §7.3 |
| `.../StepFour/InstallmentPlansDialog.tsx` | §7.4, both views |
| `src/components/web/design/InstallmentPlanRow.tsx` | §7.8, `compact` + `full` variants |
| `src/components/web/ProductsPage/product/InstallmentsSummaryRow.tsx` | §7.7 |
| `src/core/lib/installments.ts` | maths + the §6 per-field validators + the display mapper |
| `src/core/entities/models/listings/installments.dto.ts` | `ListingInstallmentPlan`, `InstallmentPlanDto`, `InstallmentsMode`, `ListingInstallmentOption` |

Reuse `ui/switch.tsx`, `ui/dialog.tsx`, `ui/card.tsx`, `ui/input.tsx`, `ui/badge.tsx` and `Box`.

### 9.3 Buyer side

| File | Change |
|---|---|
| `src/components/web/design/ProductCardItem.tsx`, `ProductCardItemEnhanced.tsx`, `ProductCardListView.tsx`, `RentProductCard.tsx` | the "from {amount}/month" caption, §7.6 |
| `src/app/[locale]/(web)/products/product/[id]/page.tsx` + its components | the summary row + read-only dialog, §7.7 |
| `src/providers/filters.provider.tsx` `buildQueryParams()` | the `installmentsAvailable` filter, §7.9 |
| `src/components/web/ProductsPage/Filter.tsx` | the toggle row |
| `src/components/web/Map/MapListingPreviewCard.tsx` | the card caption (the `/card/:slug` endpoint returns card shape, so the fields are there) |

### 9.4 Prerequisites — **two real blockers**

| # | Blocker | Detail |
|---|---|---|
| **1** | **`rentType` is collected but never sent.** | `RentType` (`daily/weekly/monthly/yearly`) and `getRentTypeOptions()` exist in `src/core/entities/enums/cars.enums.ts`; `rentType` is in `adInformationSchema` and read back on edit (`EditProduct/[id]/page.tsx`). But **`useSubmitForm.ts` never puts it into `CreateListingDto`/`UpdateListingDto`**, and `src/core/entities/models/listings/create-listing.dto.ts` has no `rentType` field. The rent period a seller picks is silently discarded. Installments sit **directly beside** offer type and rent type in the same step and share the same server-side validation block — **fix this first**, or you will be debugging installment 400s that are actually rent-type 400s. Note the backend enum is `daily \| weekly \| monthly` — there is **no `yearly`**; the website's local enum has a value the API will reject. |
| **2** | **`normalizeListingToCarDto()`** (`src/utils/listing-normalization.ts`) converts every generic listing into the legacy `SelectCarListingDto` car shape so the old car UI keeps working. **Any new field is invisible until you thread it through this function.** Add `installmentsAvailable`, `minMonthlyInstallment` and `installmentPlans` to it, or the card caption and the detail row will render nothing while the API is returning perfectly good data. |

Two smaller ones:

| # | Thing | Where |
|---|---|---|
| 3 | `create-listing.dto.ts` comments say the update is a `PATCH`, but the action uses `putAuthReq`. The backend route **is** `PUT`. Fix the comment, not the call. | `src/core/entities/models/listings/create-listing.dto.ts` |
| 4 | The product detail page has a fallback branch that calls the legacy `/car-listings-visitor/:id`. That endpoint returns **no** installment fields. Make sure the listing-types path is the one that runs. | `src/app/[locale]/(web)/products/product/[id]/page.tsx` |

---

## 10. Testing checklist

- On a listing type with `installmentsEnabled: false`, no installments UI appears anywhere — wizard,
  detail, or filter.
- On a `rentEnabled: false` type, no offer-type selector renders and installments are available.
- Switching offer type to **For rent** hides the installments card and clears it from the payload.
- In **catalog** mode, only the type's own durations appear as chips and there is **no** free-text
  duration input.
- In **free** mode, a duration above `max_months` is rejected client-side with the Arabic message.
- Adding a second plan with the same duration: that duration is **absent from the chip list**, not
  present-and-erroring.
- Changing the duration recomputes the monthly amount; typing a custom amount stops the recomputation
  and reveals "Reset to the calculated amount"; **editing an existing plan never overwrites its amount**.
- The live maths panel's Total equals `downPayment + monthlyAmount × months`, and the "more than the
  cash price" line appears when it exceeds the price.
- Turning the master switch **off** keeps the plans and shows "{n} plans saved — turn installments on to
  use them".
- Saving with installments off sends `installmentPlans: []` and the plans are actually gone on re-read.
- Closing the plans dialog with plans present commits `installmentsAvailable: true`; closing it with
  zero plans commits `false`.
- A card shows `from $450/month` under the price, muted, and **not** on a `sold` listing.
- The detail page shows the summary row, and the dialog's totals match the card's "from" figure.
- The "Installments available" filter round-trips through the URL and survives a page refresh.
- A draft saved while installments were enabled, then opened after an admin disabled them for that
  type, **submits successfully** (the clamp in §7.5).
- Money renders as `450` / `3,000`, never `450.00000000001`.
