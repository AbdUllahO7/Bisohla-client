# 06 — Saved addresses

> Backend `7fcabe4`, mobile app `3c05028`, admin `33dec81`.
> **Fix known issue #1 (`<Toaster />` missing from the dashboard layout) before you start** — this
> feature toasts on almost every action.

## Quick facts

| | |
|---|---|
| **Base resource** | `/user-addresses` |
| **Auth** | **every** route requires `Authorization: Bearer <jwt>` **and** the `user` role |
| **List** | `GET /user-addresses` — a **flat array, unpaginated** |
| **Default address** | at most one per user, enforced by the database |
| **Applying to a listing** | **copies** the values — there is no foreign key |
| **Settings** | `listings_settings.location.{saved_addresses_enabled, max_saved_addresses_per_user}` |
| **Rate limit** | 20/s, 200/min per IP |

---

## 1. What the feature is

A user's reusable address book. Save "Home", "Showroom", "Warehouse" once, then apply one to a listing
instead of re-entering the governorate, city, street and map pin every time.

The single most important property, from the schema's own comment:

> A user's reusable address book. Applying one to a listing **COPIES** these values onto the listing
> row — there is no FK, so editing or deleting an address can never mutate or orphan a published
> listing.

Say that to the user too. It is the difference between "deleting this address will break my live ads"
and "deleting this address is safe", and they cannot know which without being told.

---

## 2. API contract

All routes: `@Controller('user-addresses')`, `@CheckUser(['user'])`, `@AuthRateLimit()`.
The user id is taken from the auth context — **never** from the request — so every route is
ownership-scoped automatically.

### 2.1 `GET /user-addresses` — the whole book

No query params. **Unpaginated** — `data` is a flat array.

Order: `isDefault DESC`, `lastUsedAt DESC NULLS LAST`, `createdAt DESC`, `id ASC`.

That ordering is the picker's ordering: the default first, then most-recently-used.

### 2.2 `GET /user-addresses/:id`

**Path:** `id` (int). Ownership-scoped — someone else's id returns 404.

**404** `Resource not found`.

> The mobile app **does not use this route.** It prefills the edit form from the already-warm list
> cache. Do the same on the web unless you have a reason not to — one fewer request, and the list is
> always loaded before you can reach an edit screen.

### 2.3 `POST /user-addresses` → **201**

```ts
export const CreateUserAddressSchema = z.object({
  label: z.string().trim().min(1).max(100),                     // REQUIRED
  governorate: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  // Optional on create. The very first address a user saves is promoted to
  // default regardless, so auto-fill has something to work with.
  isDefault: z.boolean().optional(),
});
```

> **The first address a user saves always becomes the default**, regardless of what you send. Precisely:
> default is granted when `isDefault === true` **or** the user currently has no default — which also
> self-heals an account that somehow lost one.

`data` = the created address.

### 2.4 `PATCH /user-addresses/:id`

```ts
export const UpdateUserAddressSchema = CreateUserAddressSchema.partial();
```

Every field optional.

> **`isDefault: true` in the body additionally runs "set default"**, clearing the previous default in
> the same transaction. **`isDefault: false` is ignored** — it is destructured out and never written.
> **You cannot unset a default; you can only set another one.** Design the UI accordingly: offer "Set as
> default" on the non-default rows, and nothing on the default row.

**404** when not owned. `data` = the updated address.

### 2.5 `PATCH /user-addresses/:id/set-default` → 200

No body. Clears the previous default in the same transaction. **404** when not owned.
`data` = the updated address.

Writes are serialised with a per-user advisory lock, so **a double-clicked "Set default" is safe** — no
race, no two defaults.

### 2.6 `PATCH /user-addresses/:id/touch` → 200

No body. Bumps `lastUsedAt` so the picker can order most-recently-used first.

Call it **when the address is applied to a listing draft**, fire-and-forget. It is not activity-logged
and failing it is harmless. **404** when not owned.

### 2.7 `DELETE /user-addresses/:id`

No body.

```ts
{
  deleted: boolean;                          // false when not found/owned (defensive — you'll get a 404 first)
  promotedDefault: UserAddress | null;
  // "The address that inherited the default, when the deleted one held it.
  //  Null when the deleted address was not the default, or was the last one."
}
```

**Deleting the default hands it to the next address in list order** — chosen by
`lastUsedAt DESC NULLS LAST, createdAt DESC, id ASC`, i.e. the row that was directly beneath it in the
list the user was looking at.

> **Name the successor in your success toast.** *"Address deleted · "Showroom" is now your default"* —
> otherwise the Default badge silently reappears on a different row and the user cannot tell why.

### 2.8 Response shape

```ts
interface UserAddress {
  id: number;
  userId: number;
  label: string;                // 'Home'
  governorate: string | null;   // 'Damascus' — a stable English enum id, not a display name
  city: string | null;          // 'Mezzeh'
  address: string | null;       // 'Behind the central pharmacy'
  latitude: number | null;      // 33.5138 — double precision
  longitude: number | null;     // 36.2765
  isDefault: boolean;           // at most one per user
  lastUsedAt: string | null;    // last time this was applied to a listing draft
  createdAt: string;
  updatedAt: string;
}
```

`governorate` and `city` are stored as **stable English identifiers**, the same values the listing form
uses. Render them through your locale-aware label lookup — the website already has `SyriaGovernorate`
and `getCityOptions()` in
`src/components/web/ProductsPage/addProducts/StepOne/utils.tsx`.

### 2.9 Admin-only — do not call

`/user-addresses-admin` — `GET /`, `GET /user/:userId`, `GET /:id`, `DELETE /:id`.

---

## 3. Settings

Group `listings_settings.location`. Read via `GET /settings/listings_settings/location`.

| Key | Type | Default | Effect |
|---|---|---|---|
| `saved_addresses_enabled` | boolean | `true` | When `false`, **`POST` returns 403**. Reads, updates, set-default, touch and delete are **not** blocked — an existing book stays manageable. Hide the "Add address" button, the wizard's "Choose from saved addresses" button and the "Save this address" checkbox. |
| `max_saved_addresses_per_user` | number | `10` | Enforced inside the create transaction. Disable "Add address" at the cap and show the cap caption. |

Code both defaults as fallbacks.

---

## 4. Errors to handle

| Status | Message | When |
|---|---|---|
| 400 | validation errors keyed by field | e.g. `label` empty or > 100 chars |
| 400 | `You have reached the maximum of {max} saved addresses. Delete one before adding another.` | at the cap |
| 403 | `Saved addresses are currently unavailable` | `saved_addresses_enabled` is off — **`POST` only** |
| 404 | `Resource not found` | unknown id, or not owned |

> **Note the 404 message.** There are `user-address.notFound` / `notFoundOrUnauthorized` strings in the
> backend's i18n files, but the service actually throws the generic `errors.NOT_FOUND` → **`Resource not
> found`**. Do not build a UI that expects the specific string. Map the status code to your own message.

The Arabic versions of the two feature-specific messages exist server-side
(`"العناوين المحفوظة غير متاحة حاليًا"`,
`"لقد وصلت إلى الحد الأقصى وهو {max} عناوين محفوظة. احذف عنوانًا قبل إضافة عنوان آخر."`) and are
selected by the `Accept-Language` / `?lang=` resolver. You can display them, or map the status to your
own keys — the latter is more predictable.

---

## 5. UX reference (from the mobile app)

### 5.1 The address list

- An `h1` **"Saved addresses"**, rendered in **every** state branch.
- A list of address rows.
- Footer: a secondary full-width **"Add address"** button, **disabled at the cap**, with the caption
  *"You've reached the limit of {count} saved addresses"* shown when disabled.

**States:** 4 skeleton rows → a generic error state → an empty state (map-pin icon, *"No saved addresses
yet"* / *"Save an address once and reuse it on future listings"*, with an "Add address" CTA that is
**suppressed at the cap**) → content.

**Row actions:**

- Clicking the row body **edits**.
- A labelled footer action **"Set as default"** (star icon, primary text) sits **inside the card**,
  below a hairline divider, and only when `!isDefault`.
- **Delete is deliberately NOT in the list.** It lives on the edit screen behind a confirmation, *"so a
  destructive control never sits in a scrolling list under a stray thumb."*

Set-default shows a **per-row** pending state — only that row disables, not the whole list — and toasts
*"Default address updated"* or *"Could not set this address as default. Please try again."*

### 5.2 The address row — two variants

```
┌────────────────────────────────────────────────────┐
│ (◉)  Home   [Default]                          ›   │  ← map-pin in a circle, tinted primary
│      Mezzeh, Damascus                              │     when default. Badge is a pill.
│      Behind the central pharmacy                   │     (clamp to 2 lines)
├────────────────────────────────────────────────────┤
│ ★  Set as default                                  │  ← manageable + !isDefault only
└────────────────────────────────────────────────────┘
```

- **`manageable`** — the profile list. Chevron, plus the "Set as default" footer action.
- **`selectable`** — the wizard picker. No chevron, no footer action; a primary check mark when
  selected.

Accessible hints: manageable → *"Opens this address for editing"*; selectable → *"Uses this address for
this listing"*.

### 5.3 Add / Edit form

**Field order mirrors the create-listing wizard's location block — map pin FIRST**, because it drives
everything below it:

1. **"Pick location on map"** — a mini-map preview card that opens the full map picker.
2. **Governorate** and **City** selects.
   - Once the pin resolves to a governorate, **governorate is locked (disabled)** with the hint *"Set
     from your map pin"* and an inline action **"Change on map"**.
   - If reverse-geocoding **failed**, governorate stays editable with the hint *"We couldn't work out the
     area from your pin — check the governorate matches it"*.
   - City stays editable, but its options are scoped to the chosen governorate.
3. **"Address details"** — a multiline field, ~3 rows.
4. **"Label"** — a text field, placeholder *"e.g. Home, Work"*.

**There is no default toggle on the form.** `PATCH /:id/set-default` is the sole write path for default
status, *"which keeps 'does creating a default displace the old one?' from being a question the form has
to answer."*

**Validation:**

| Field | Rule | Message |
|---|---|---|
| `label` | required | Enter a label for this address |
| `governorate` | **required client-side** | Pick a governorate |
| `city` | **required client-side** | Pick a city |
| `address` | optional | — |
| `latitude` | −90..90, nullable | — |
| `longitude` | −180..180, nullable | — |
| cross-field | if a pin exists and its detected governorate is known, `governorate` must equal it | The governorate must match the location pin. Reposition the pin to change it. |

> Governorate and city are **optional on the backend** but **required on the client**, deliberately: *"an
> address book entry with no location can't fill anything in."* The cross-field refinement is normally
> unreachable thanks to the lock; it guards against drift when editing an older row.

**Screen chrome:**

- `h1` **"New address"** / **"Edit address"**
- A root error caption, then a full-width primary **"Save address"** with a loading state; on success,
  go back.
- **Edit only** adds a destructive **card** — not a second full-width button, *"a full-width destructive
  button competes with Save for primary weight"*: trash icon disc + **"Delete address"** + the caption
  *"Listings you already published with this address are not affected."*
  - Confirm dialog: title *"Delete this address?"*, body *"This address will be permanently removed from
    your address book. Listings you already published using it are not affected."*, confirm **"Delete"**,
    destructive variant. Use `src/components/ui/confirmation-dialog.tsx`.
  - Success toast: **"Address deleted"** — or, when the deleted row held the default,
    **"Address deleted · "{label}" is now your default"** using `promotedDefault.label`.
  - Failure toast: *"Could not delete the address. Please try again."*

**Edit prefill** comes from the warm list cache, **once**, guarded by a ref so a background refetch
never stomps an in-progress edit.

**Legacy repair:** rows created before the "detected governorate" concept existed should set
`detectedGovernorate = latitude != null ? governorate : null` on load — *"otherwise the lock engages
with nothing behind it."*

If the query has settled and there is no such row → an empty state, *"Address not found"* / *"This
address may have been deleted."*

### 5.4 Using a saved address in the create-listing flow

Three paths, all landing on the same "apply" operation, in the wizard's location step.

**(a) Auto-prefill from the default — one shot, on mount**

Skipped when: the feature is off, the wizard is in **edit** mode, or the address list has not settled.

> **It is an ABSENT gate, never an OVERWRITE gate.** If the form already holds a location — user-entered,
> restored from a draft, or extracted by an AI/voice flow — the prefill does **not** run. An extracted
> location must always win over the saved default.

Picks the address where `isDefault === true`.

**(b) The explicit picker**

A ghost button **"Choose from saved addresses"** right beside the map/address block, rendered only when
`saved_addresses_enabled`.

Opens a dialog: header **"Saved addresses"**, then skeleton rows → error state → empty state (map-pin,
*"No saved addresses yet"* / **"Save an address from Profile › Saved addresses to reuse it here"**) →
the list of `selectable` rows, with a check mark on whichever currently matches the form's location.

Selecting: apply, close, and fire `PATCH /:id/touch` **fire-and-forget** so the picker orders
most-recently-used first next time.

**What "apply" writes — six fields, and the first three travel together:**

```ts
{
  // MUST travel together, or the governorate lock engages with nothing behind it
  ...(lat != null && lng != null
      ? { latitude: lat, longitude: lng, detectedGovernorate: address.governorate }
      : {}),
  ...(address.governorate != null ? { governorate: address.governorate } : {}),
  ...(address.city        != null ? { city:        address.city }        : {}),
  ...(address.address     != null ? { address:     address.address }     : {}),
}
```

Mark the fields dirty so the wizard's own persistence picks them up.

**(c) The reverse — "save this address for next time"**

First, decide whether the current location **already is** one of the saved addresses:

```ts
// Case-insensitive trimmed compare of governorate / city / address, plus
// coordinates within ~33 m — but only when BOTH sides have a pin. Adding a pin to
// a pin-less address makes it strictly more precise, so that is worth saving
// separately.
const COORDINATE_EPSILON = 0.0003;
```

When there is **no** match, show a checkbox **"Save this address for next time"**. Ticking it reveals a
text field **"Address label"**, placeholder *"e.g. Home, Showroom"*. Refinement: ticked ⇒ label
non-empty → *"Please name this address"*.

When the location **becomes** a known address, **force-clear the tick** — in both the form state and
wherever the review step reads it from.

> **The `POST` happens on submit, AFTER the listing is created** — *"so abandoned wizards don't litter
> the address book"* — and it is deliberately **not awaited**. A failure toasts a **warning** that says
> explicitly: *"Couldn't save this address, but your listing was published"*.

The `saveAsSavedAddress` and `savedAddressLabel` form fields are **wizard-local**. Strip them from the
listing payload — `POST /my-listings` will reject unknown keys or silently ignore them, and neither is
what you want.

---

## 6. i18n keys

### The address book

| Key | English | العربية |
|---|---|---|
| `profile.rows.saved_addresses` | Saved addresses | العناوين المحفوظة |
| `savedAddresses.title` | Saved addresses | العناوين المحفوظة |
| `savedAddresses.add_button` | Add address | إضافة عنوان |
| `savedAddresses.empty_title` | No saved addresses yet | لا توجد عناوين محفوظة بعد |
| `savedAddresses.empty_body` | Save an address once and reuse it on future listings | احفظ عنواناً مرة واحدة وأعد استخدامه في إعلاناتك القادمة |
| `savedAddresses.cap_reached_note` | You've reached the limit of {count} saved addresses | لقد وصلت إلى الحد الأقصى وهو {count} عناوين محفوظة |
| `savedAddresses.delete_confirm_title` | Delete this address? | حذف هذا العنوان؟ |
| `savedAddresses.delete_confirm_body` | This address will be permanently removed from your address book. Listings you already published using it are not affected. | سيتم حذف هذا العنوان نهائياً من دفتر عناوينك. لن يؤثر ذلك على الإعلانات التي نشرتها مسبقاً باستخدامه. |
| `savedAddresses.delete_confirm_button` | Delete | حذف |
| `savedAddresses.delete_success_toast` | Address deleted | تم حذف العنوان |
| `savedAddresses.delete_success_promoted_toast` | Address deleted · "{label}" is now your default | تم حذف العنوان · أصبح "{label}" عنوانك الافتراضي |
| `savedAddresses.delete_failed_toast` | Could not delete the address. Please try again. | تعذّر حذف العنوان. حاول مجدداً. |
| `savedAddresses.set_default_success_toast` | Default address updated | تم تحديث العنوان الافتراضي |
| `savedAddresses.set_default_failed_toast` | Could not set this address as default. Please try again. | تعذّر تعيين هذا العنوان كافتراضي. حاول مجدداً. |

### The form

| Key | English | العربية |
|---|---|---|
| `savedAddresses.form.title_add` | New address | عنوان جديد |
| `savedAddresses.form.title_edit` | Edit address | تعديل العنوان |
| `savedAddresses.form.label_field` | Label | التسمية |
| `savedAddresses.form.label_placeholder` | e.g. Home, Work | مثال: المنزل، العمل |
| `savedAddresses.form.governorate` | Governorate | المحافظة |
| `savedAddresses.form.city` | City | المدينة |
| `savedAddresses.form.address` | Address details | تفاصيل العنوان |
| `savedAddresses.form.pick_on_map` | Pick location on map | تحديد الموقع على الخريطة |
| `savedAddresses.form.save_button` | Save address | حفظ العنوان |
| `savedAddresses.form.label_required` | Enter a label for this address | أدخل تسمية لهذا العنوان |
| `savedAddresses.form.governorate_required` | Pick a governorate | اختر محافظة |
| `savedAddresses.form.city_required` | Pick a city | اختر مدينة |
| `savedAddresses.form.governorate_pin_locked` | Set from your map pin | محدّدة من موقعك على الخريطة |
| `savedAddresses.form.governorate_pin_undetected` | We couldn't work out the area from your pin — check the governorate matches it | تعذّر تحديد المنطقة من موقعك على الخريطة — تأكد من مطابقة المحافظة له |
| `savedAddresses.form.governorate_change_on_map` | Change on map | تغيير على الخريطة |
| `savedAddresses.form.governorate_pin_mismatch` | The governorate must match the location pin. Reposition the pin to change it. | يجب أن تتطابق المحافظة مع موقعك على الخريطة. أعد تحديد الموقع لتغييرها. |
| `savedAddresses.form.save_failed_error` | Could not save the address. Please try again. | تعذّر حفظ العنوان. حاول مجدداً. |
| `savedAddresses.form.not_found_title` | Address not found | العنوان غير موجود |
| `savedAddresses.form.not_found_body` | This address may have been deleted. | قد يكون هذا العنوان قد حُذف. |
| `savedAddresses.form.delete_button` | Delete address | حذف العنوان |
| `savedAddresses.form.delete_note` | Listings you already published with this address are not affected. | لن تتأثر الإعلانات التي سبق أن نشرتها بهذا العنوان. |

### The shared row and picker

| Key | English | العربية |
|---|---|---|
| `savedAddress.default_badge` | Default | افتراضي |
| `savedAddress.set_default_action` | Set as default | تعيين كافتراضي |
| `savedAddress.edit_hint` | Opens this address for editing | يفتح هذا العنوان للتعديل |
| `savedAddress.select_hint` | Uses this address for this listing | استخدام هذا العنوان في هذا الإعلان |
| `savedAddress.picker_empty_title` | No saved addresses yet | لا توجد عناوين محفوظة بعد |
| `savedAddress.picker_empty_body` | Save an address from Profile › Saved addresses to reuse it here | احفظ عنوانًا من الملف الشخصي ‹ العناوين المحفوظة لاستخدامه هنا |

### The wizard

| Key | English | العربية |
|---|---|---|
| `listing.wizard.saved_address.choose_button` | Choose from saved addresses | اختر من العناوين المحفوظة |
| `listing.wizard.saved_address.save_checkbox` | Save this address for next time | احفظ هذا العنوان لاستخدامه لاحقًا |
| `listing.wizard.saved_address.label_field` | Address label | اسم العنوان |
| `listing.wizard.saved_address.label_placeholder` | e.g. Home, Showroom | مثال: المنزل، المعرض |
| `listing.wizard.saved_address.save_failed_toast` | Couldn't save this address, but your listing was published | تعذّر حفظ هذا العنوان، لكن تم نشر إعلانك بنجاح |
| `listing.errors.saved_address_label_required` | Please name this address | يرجى تسمية هذا العنوان |

> `{label}` in `delete_success_promoted_toast` is a user-supplied string that may be Latin inside Arabic
> prose — bidi-isolate it (`00-conventions.md` §9). The `›` in `picker_empty_body` should mirror in RTL;
> the Arabic string above already uses `‹`.

---

## 7. Where this lands in `bishola-website`

### 7.1 New routes

Under the dashboard, so they inherit the sidebar layout at
`src/app/[locale]/userProfile/layout.tsx`:

| Route | File |
|---|---|
| `/userProfile/SavedAddresses` | `src/app/[locale]/userProfile/SavedAddresses/page.tsx` |
| `/userProfile/SavedAddresses/new` | `.../SavedAddresses/new/page.tsx` |
| `/userProfile/SavedAddresses/[id]` | `.../SavedAddresses/[id]/page.tsx` |

Add a sidebar entry in `src/components/dashboard/DashboardSidebar.tsx`, gated on
`saved_addresses_enabled`.

The dashboard is already guarded by `src/middleware.ts` (`userProfile` requires a user or admin role),
so no extra route protection is needed.

### 7.2 New files

| File | What |
|---|---|
| `src/core/infrastructure-adapters/actions/users/saved-address.actions.ts` | `'use server'` — all seven endpoints via `getAuthReq` / `postAuthReq` / `patchAuthReq` / `deleteAuthReq` |
| `src/core/infrastructure-adapters/use-actions/users/saved-address.use-actions.ts` | TanStack hooks; **invalidate the list query on every mutation** |
| `src/core/entities/models/users/saved-address.dto.ts` | `UserAddress`, create/update payloads, the zod schema from §5.3 |
| `src/components/web/SavedAddresses/SavedAddressesList.tsx` | §5.1 |
| `src/components/web/SavedAddresses/SavedAddressRow.tsx` | §5.2, both variants |
| `src/components/web/SavedAddresses/SavedAddressForm.tsx` | §5.3, shared by new + edit |
| `src/components/web/SavedAddresses/SavedAddressPickerDialog.tsx` | §5.4(b) |
| `src/core/lib/saved-address-match.ts` | `findMatchingSavedAddress` + `COORDINATE_EPSILON` |

> **Use `postAuthReq` / `patchAuthReq` / `deleteAuthReq`, not the unauthenticated variants.** Every one
> of these routes is guarded. Using `postReq` on a guarded route produces a silent 401 with a perfectly
> clean TypeScript build — it has broken this site before.

### 7.3 Files to change

| File | Change |
|---|---|
| `src/components/web/ProductsPage/addProducts/StepFour/AddProductStepFour.tsx` | The location block already collects `governorate` / `city` / `address`. Add the "Choose from saved addresses" button, the auto-prefill (§5.4a), and the "Save this address for next time" checkbox + label field. |
| `.../StepFour/schema.ts` | Add `saveAsSavedAddress`, `savedAddressLabel`, `detectedGovernorate` (form-only), plus the label refinement. |
| `.../Main/hooks/useSubmitForm.ts` | **Strip the three wizard-local fields from the listing payload.** After a successful create, fire the `POST /user-addresses` (unawaited) per §5.4(c). |
| `src/components/dashboard/DashboardSidebar.tsx` | The nav entry. |
| `src/app/[locale]/userProfile/layout.tsx` | **Mount `<Toaster />`** — see §7.4. |

Reuse `ui/confirmation-dialog.tsx`, `ui/dialog.tsx`, `ui/checkbox.tsx`, `ui/skeleton.tsx`,
`ui/badge.tsx`, `shared/SectionHeader.tsx`, `Box`, and the map picker from
`src/components/web/Map/`. Governorate/city options come from
`src/components/web/ProductsPage/addProducts/StepOne/utils.tsx` (`SyriaGovernorate`,
`getCityOptions()`).

### 7.4 Prerequisites and gotchas

| # | Thing | Where |
|---|---|---|
| **1** | **`<Toaster />` is mounted only in `(web)/layout.tsx`.** This feature toasts on delete, set-default, save-failure and the post-submit address save — **every one of them would render nowhere.** Mount it in `userProfile/layout.tsx` (and `auth/layout.tsx` while you're there) **before** building anything here. | `src/app/[locale]/userProfile/layout.tsx` |
| 2 | The wizard uses hand-rolled `useState` + manual validation for most steps; only `AddProductStepFour.tsx` has `zodResolver`. The location fields are in StepFour, so you are on the good side of that line. | `.../StepFour/` |
| 3 | The wizard persists drafts to `localStorage` (`STORAGE_KEYS` in `Main/hooks/useLocalStorage.ts`), with separate create/edit buckets. Applying a saved address must write into the same bucket, or a refresh loses it. | `Main/hooks/useLocalStorage.ts` |
| 4 | Reverse-geocoding to a governorate is the one piece the mobile app has that the website may not. If the map picker cannot detect a governorate, take the "undetected" branch of §5.3 — leave the field editable with the explanatory hint. **Do not block saving on it.** | `src/components/web/Map/` |
| 5 | `POST /user-addresses` returns **201**, not 200. Make sure your success check is `res.success`, not `status === 200`. | the action |

---

## 8. Testing checklist

- The Saved addresses page is reachable from the dashboard sidebar and 302s to sign-in when signed out.
- The **first** address saved is marked Default, even without ticking anything.
- "Set as default" moves the badge; **only that row** shows a pending state, not the whole list.
- Double-clicking "Set as default" does not produce two defaults.
- There is **no** way to unset a default except by setting another — confirm the UI offers none.
- Deleting a non-default address toasts *"Address deleted"*.
- Deleting **the default** toasts *"Address deleted · "X" is now your default"* with the real successor
  label, and the badge appears on that row.
- **The toasts actually appear** (known issue #1).
- At `max_saved_addresses_per_user`, "Add address" is disabled and the cap caption shows; the empty
  state's CTA is suppressed too.
- With `saved_addresses_enabled: false`: the sidebar entry, the wizard button and the wizard checkbox
  are all hidden, but an existing list still loads and can be edited and deleted.
- Placing a map pin **locks** the governorate with the "Set from your map pin" hint and a working
  "Change on map"; the city list narrows to that governorate.
- In the create-listing wizard, the default address auto-fills an **empty** location block…
- …and does **not** overwrite a location the user already entered or that was restored from a draft.
- Picking an address from the wizard picker fills all six fields together and fires the `touch` call.
- With the wizard's location already matching a saved address, the "Save this address for next time"
  checkbox is **hidden**.
- Ticking it without a label blocks submit with *"Please name this address"*.
- Submitting with it ticked publishes the listing **and** creates the address; a forced failure of the
  address call still publishes the listing and shows the warning toast.
- `saveAsSavedAddress` / `savedAddressLabel` / `detectedGovernorate` never appear in the
  `POST /my-listings` body.
- Refreshing mid-wizard preserves the applied address.
- `/ar/userProfile/SavedAddresses` renders right-to-left with the chevron and the `›` in the picker's
  empty body mirrored.
