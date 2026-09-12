# 02 — Phone number validation

> Backend `3e02459`, mobile app `123fc30`, admin `94fcad4`. **Build this second**, before the other
> add-listing features — three of them touch the same forms, and they all need one shared `PhoneField`.

## Quick facts

| | |
|---|---|
| **Library** | `libphonenumber-js` — the **`/max`** metadata bundle |
| **The rule** | full per-country validity via `parsed.isValid()`. **Not** a length check. |
| **Stored format** | always E.164 (`+963955555678`) |
| **Default dial code** | `+963` (Syria) |
| **Endpoints that validate a phone** | `POST /my-listings`, `PUT /my-listings/:id` (`contactNumber`), `PUT /profile/update` (`phone`) |
| **Error message from the server** | `Not a valid phone number`, keyed by field in the 400 `errors` map |
| **Settings** | none |

---

## 1. What the feature is

Phone numbers used to be validated by length: `.min(10).max(20)`. That happily accepted
`+963963955555555` — a nonsense number — and rejected nothing that mattered. It also meant that when a
seller typed their country code twice, or pasted an international number, or used an Arabic keyboard,
the value went to the database broken.

The replacement does two things:

1. **Repair** — normalize whatever the user typed into a canonical E.164 number, correcting the four
   mistakes people actually make.
2. **Validate** — check real per-country validity, carrier prefix included.

Both the client and the server run the same ladder. **The server is authoritative**; the client runs it
for inline feedback and so the user sees the corrected number before submitting.

> There is no monorepo, so the website carries its **own copy** of this logic. §3 is written to be
> pasted in. The fixture table in §6 is the contract that proves the copies still agree — **carry it as
> a test.**

---

## 2. Why `libphonenumber-js/max`, and what it is not

```ts
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
```

**`/max` is the metadata bundle, not a "maximum length" rule.** From the source comment:

> `libphonenumber-js/max` (not the default `min` bundle): with `min`, `isValid()` silently degrades to
> a length-only check, which would accept a wrong carrier prefix. `max` also keeps FIXED_LINE valid, so
> a dealership may list a landline.

Two consequences worth stating plainly:

- **Do not import from `libphonenumber-js` or `libphonenumber-js/min`.** Both weaken `isValid()` and
  you will silently accept invalid numbers.
- **Landlines must stay valid.** Dealerships and showrooms list them. Any rule that only accepts mobile
  numbers is wrong.

`/max` is a larger metadata bundle. It is worth the bytes; this is the whole feature.

---

## 3. The implementation — copy this

Suggested location: `src/core/lib/phone/phone.util.ts`.

```ts
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { COUNTRY_CODES } from './country-codes';   // [{ iso, name, nameAr, dial, flag }]

export const DEFAULT_DIAL_CODE = '+963';
export const DEFAULT_COUNTRY_ISO = 'SY';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_ARABIC_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/** Maps Arabic-Indic and Extended-Arabic-Indic numerals to ASCII digits. */
export function normalizeDigits(input: string): string {
  let out = '';
  for (const char of input) {
    const arabic = ARABIC_INDIC.indexOf(char);
    if (arabic >= 0) { out += String(arabic); continue; }
    const extended = EXTENDED_ARABIC_INDIC.indexOf(char);
    out += extended >= 0 ? String(extended) : char;
  }
  return out;
}

/**
 * Reduces free-typed input to digits plus at most one leading `+`. Handles the
 * Arabic keyboard, pasted spacing/dashes/parentheses, and the space-separated
 * "+963 912345678" wire format.
 */
export function sanitizePhoneInput(raw: string | null | undefined): string {
  if (!raw) return '';
  const ascii = normalizeDigits(raw).trim();
  const hasPlus = ascii.startsWith('+');
  return (hasPlus ? '+' : '') + ascii.replace(/\D/g, '');
}

export interface PhoneRepairResult {
  /** E.164 when `isValid`, else the best-effort assembly (never null once digits exist). */
  e164: string | null;
  /** ISO country of the resolved number — may differ from `dialCode`'s country. */
  country: string | null;
  /** Dial code the picker should show. Changes when the input named another country. */
  dialCode: string;
  /** Local (national) part the digits field should show. */
  localNumber: string;
  isValid: boolean;
  /** True when normalization changed the number — rewrite the field so the user sees it. */
  wasRepaired: boolean;
}

/**
 * Resolves what the user meant from a local number + the selected dial code.
 *
 * Tries candidates in order and takes the first that is genuinely valid. A prefix
 * is only stripped when doing so turns an INVALID number into a VALID one — never
 * because it merely looks like a dial code.
 */
export function repairPhone(
  rawLocalNumber: string | null | undefined,
  rawDialCode: string | null | undefined,
): PhoneRepairResult {
  const dialCode = rawDialCode || DEFAULT_DIAL_CODE;
  const sanitized = sanitizePhoneInput(rawLocalNumber);
  const digits = sanitized.replace(/\D/g, '');

  if (!digits) {
    return { e164: null, country: null, dialCode, localNumber: '', isValid: false, wasRepaired: false };
  }

  const dialDigits = dialCode.replace(/\D/g, '');
  const asTyped = `${dialCode}${digits}`;

  const candidates: string[] = [
    asTyped,
    // The whole international number was typed into the digits box.
    ...(sanitized.startsWith('+') ? [`+${digits}`] : []),
    // "00" is the international access prefix in most of the region.
    ...(digits.startsWith('00') ? [`+${digits.slice(2)}`] : []),
    // The dial code was entered twice — the reported defect.
    ...(digits.startsWith(dialDigits) && digits.length > dialDigits.length
      ? [`${dialCode}${digits.slice(dialDigits.length)}`]
      : []),
  ];

  for (const candidate of candidates) {
    const parsed = parsePhoneNumberFromString(candidate);
    if (!parsed?.isValid()) continue;

    return {
      e164: parsed.number,
      country: parsed.country ?? null,
      dialCode: `+${parsed.countryCallingCode}`,
      localNumber: String(parsed.nationalNumber),
      isValid: true,
      wasRepaired: parsed.number !== asTyped,
    };
  }

  return { e164: asTyped, country: null, dialCode, localNumber: digits, isValid: false, wasRepaired: false };
}

/** True when the local number is a real, dialable number for the given dial code. */
export function isValidPhone(
  localNumber: string | null | undefined,
  dialCode: string | null | undefined,
): boolean {
  return repairPhone(localNumber, dialCode).isValid;
}

/**
 * Merges dial code + local number into a single E.164 string, repairing what is
 * unambiguously repairable on the way. Returns null when the local number is empty.
 * An unrepairable number is still assembled (callers validate separately) so
 * nothing is silently dropped.
 */
export function assemblePhone(
  dialCode: string | undefined,
  number: string | null | undefined,
): string | null {
  if (!number) return null;
  return repairPhone(number, dialCode).e164;
}

/**
 * Inverse of `assemblePhone` — splits a stored number back into
 * `{ dialCode, localNumber }` so the picker + digits field can be populated.
 *
 * Prefers libphonenumber's parse (which also repairs a stored number written by an
 * older client) and falls back to longest-known-prefix matching so an unparseable
 * legacy value still lands in the right country box rather than dumping the dial
 * code into the digits field.
 */
export function splitPhone(full: string | null | undefined): { dialCode: string; localNumber: string } {
  if (!full) return { dialCode: DEFAULT_DIAL_CODE, localNumber: '' };

  const sanitized = sanitizePhoneInput(full);
  const parsed = sanitized.startsWith('+') ? parsePhoneNumberFromString(sanitized) : null;
  if (parsed?.isValid()) {
    return { dialCode: `+${parsed.countryCallingCode}`, localNumber: String(parsed.nationalNumber) };
  }

  const match = COUNTRY_CODES.map((c) => c.dial)
    .filter((dial) => sanitized.startsWith(dial))
    .sort((a, b) => b.length - a.length)[0];

  if (match) return { dialCode: match, localNumber: sanitized.slice(match.length) };
  return { dialCode: DEFAULT_DIAL_CODE, localNumber: sanitized.replace(/\D/g, '') };
}
```

### The load-bearing guard — do not "simplify" this

The candidate order is not arbitrary. `asTyped` is tried **first**, so a legitimate number that happens
to begin with the dial-code digits stops the ladder before anything can corrupt it.

> `963955555` is itself a valid Syrian mobile. Unconditionally stripping a leading `963` because it
> "looks like the country code" would turn a real number into a different real number.

Same reasoning for the national trunk `0`: libphonenumber strips it inside
`parsePhoneNumberFromString`, not by a manual `.replace(/^0/, '')` of yours. Do not add one.

And note the last branch of `repairPhone`: when nothing validates, it returns
`isValid: false` with `e164` set to the best-effort assembly. **Nothing is silently dropped** — the
caller validates separately and shows the user what they typed.

---

## 4. Where validation lives — object level, not field level

Validity depends on **two** fields: the digits and the selected dial code. A per-field zod schema
cannot see its sibling, so the refinement must sit on the object and be pointed back at the digits
field so react-hook-form surfaces the message under the input the user can fix.

```ts
// src/core/lib/phone/phone.schema.ts
/**
 * Empty is treated as valid here — required-ness is the caller's own rule, so a
 * blank optional phone does not report "invalid".
 */
export const isPhoneFieldValid = (
  localNumber: string | null | undefined,
  dialCode: string | null | undefined,
): boolean => {
  if (!localNumber) return true;
  return isValidPhone(localNumber, dialCode);
};
```

Attach it like this:

```ts
const contactSchema = z
  .object({
    contactNumber: z.string().min(1, 'listing.errors.contact_number_required'),
    countryDialCode: z.string(),
    // …
  })
  .refine((d) => isPhoneFieldValid(d.contactNumber, d.countryDialCode), {
    message: 'listing.errors.contact_number_invalid',
    path: ['contactNumber'],          // ← so the error renders under the input
  });
```

`countryDialCode` is in the **form** schema only so the refinement can see it. It is **merged into the
phone as E.164 at submit and never sent as its own field.**

---

## 5. Repair timing — three moments, and one that is not

**Never repair on every keystroke.** A number is briefly invalid while it is being typed; rewriting the
field mid-entry fights the user.

### 5.1 On paste / autofill — immediately

```ts
const sanitized = sanitizePhoneInput(nextValue);
// A jump of more than one character (or a pasted `+`) is a paste, not typing.
const isPaste = sanitized.startsWith('+') || sanitized.length - localNumber.length > 1;
if (isPaste) {
  const result = repairPhone(sanitized, dialCode);
  if (result.isValid) {
    onLocalNumberChange(result.localNumber);
    if (result.dialCode !== dialCode) onDialCodeChange(result.dialCode);
    return;
  }
}
onLocalNumberChange(sanitized);
```

Repair a paste immediately so the user sees the corrected number the moment it lands.

### 5.2 On blur — commit only if valid

```ts
const result = repairPhone(localNumber, dialCode);
if (!result.isValid) return;   // leave exactly as typed, so the inline error refers to what they see
if (result.localNumber !== localNumber) onLocalNumberChange(result.localNumber);
if (result.dialCode !== dialCode) onDialCodeChange(result.dialCode);
```

If the number cannot be repaired, **leave it alone**. Rewriting it into something else and then showing
"invalid" next to a value the user did not type is worse than useless.

### 5.3 Before submit — because blur is not guaranteed

A user can click Submit without the input ever losing focus (mobile's `keyboardShouldPersistTaps`
equivalent on the web: clicking a button that already has a mousedown handler, or submitting with
Enter). Run `assemblePhone` on the way into the payload.

> This is a real defect the mobile app hit: the **review screen showed a number that was not the one
> being published**, because the display concatenated `dialCode + number` while the submit path
> assembled and repaired it. If you have a review or summary surface, render
> `assemblePhone(dialCode, number)` — **not** a naive concat.

### 5.4 Prefill also repairs — on the way in

When you seed a listing's contact number from the user's stored profile phone, run `repairPhone` on it
first. A profile holding a malformed number — written before validation existed, or by another client —
would otherwise seed that same broken value into every listing the seller creates. Repairing at the
point of use contains the damage to the profile row, which stays as-is until its owner edits it.

---

## 6. The fixture table — carry this as a test

This table is duplicated verbatim between the mobile app and the backend. It is what proves the copies
of the ladder still agree. **Add a third copy to the website with a unit test that runs it.**

`repairPhone(localNumber, dialCode).e164` — `null` means the input must be rejected:

| `localNumber` | `dialCode` | Expected E.164 | Why |
|---|---|---|---|
| `963955555555` | `+963` | `+963955555555` | duplicated dial code — **the reported defect** |
| `955555555` | `+963` | `+963955555555` | already correct |
| `0955555555` | `+963` | `+963955555555` | national trunk zero |
| `00963955555555` | `+963` | `+963955555555` | international `00` prefix |
| `+963955555555` | `+963` | `+963955555555` | full E.164 pasted into the digits box |
| `+966501234567` | `+963` | `+966501234567` | another country pasted — **the picker follows the number** |
| `955 555 555` | `+963` | `+963955555555` | spaces |
| `955-555-555` | `+963` | `+963955555555` | dashes |
| `(955) 555-555` | `+963` | `+963955555555` | parentheses |
| `٩٥٥٥٥٥٥٥٥` | `+963` | `+963955555555` | Arabic-Indic numerals |
| `۹۵۵۵۵۵۵۵۵` | `+963` | `+963955555555` | Extended-Arabic-Indic numerals |
| `` (space)`912345678` | `+963` | **`null`** | the `91` prefix is unassigned in Syria |
| `963955555` | `+963` | `+963963955555` | **THE GUARD** — a legitimate number beginning with the dial-code digits |
| `111234567` | `+963` | `+963111234567` | Damascus landline — dealerships list these |
| `501234567` | `+966` | `+966501234567` | Saudi Arabia |
| `501234567` | `+971` | `+971501234567` | United Arab Emirates |
| `5389370863` | `+90` | `+905389370863` | Turkey |
| `966501234567` | `+966` | `+966501234567` | duplicated dial code, Saudi Arabia |
| `12345` | `+963` | **`null`** | too short |
| `95555555555555` | `+963` | **`null`** | too long |
| `abc` | `+963` | **`null`** | no digits at all |
| `` (empty) | `+963` | **`null`** | empty |

`splitPhone(stored)`:

| Stored | → `dialCode` | → `localNumber` | Why |
|---|---|---|---|
| `+963955555555` | `+963` | `955555555` | canonical E.164 |
| `+963 912345678` | `+963` | `912345678` | **the website's own space-separated legacy wire format** |
| `+963963955555555` | `+963` | `963955555555` | a corrupt stored value — shown as-is so its owner can see and fix it |
| `+966501234567` | `+966` | `501234567` | Saudi Arabia |
| `` (empty) | `+963` | `` | empty falls back to the default country |

---

## 7. The `PhoneField` component

Build **one**, in `src/components/forms/phone-field.tsx`, and use it everywhere.

### Props

```ts
interface PhoneFieldProps {
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  onLocalNumberBlur?: () => void;
  label?: string;              // omit to hide the label
  required?: boolean;          // appends " *" to the label
  placeholder?: string;
  helper?: string;             // caption below the row, e.g. "Pre-filled from your profile"
  error?: string;              // resolved message, rendered in destructive colour
  disabled?: boolean;
}
```

### Layout

```
Label *
┌──────────────┬────────────────────────────────────┐
│ 🇸🇾 +963  ▾  │ 944 123 456                        │
└──────────────┴────────────────────────────────────┘
Pre-filled from your profile
```

`[ country picker ][ number input, flex: 1 ]`, label above, helper caption and error below.

### Country picker

A compact trigger showing flag + dial code + chevron. Clicking opens a searchable list of
`flag · country name · dial code`, current one highlighted. Default `+963` / `SY`.

`src/core/entities/enums/country-codes.enum.ts` already exists in the repo and can back this — check
whether it carries flags and Arabic names, and extend it if not.

> **Flag emoji warning:** Windows has no regional-indicator flag glyphs at all, and several other
> platforms ship stale ones. The mobile app bundles a vector flag for Syria for exactly this reason. On
> the web, either use inline SVG flags or accept that the flag is decorative and never the only signal —
> the dial code text must always be visible.

### Direction — a documented RTL exception

Phone numbers are universally LTR (`+CC NNN NNN NNN`). On an Arabic page the whole row must stay LTR:

```tsx
<div className="flex" dir="ltr">
  <CountryPicker … />
  <input dir="ltr" style={{ unicodeBidi: 'isolate', textAlign: 'left' }} … />
</div>
```

The **label**, **helper** and **error** text stay in the page direction. Only the input row is pinned.

---

## 8. Server contract

### 8.1 The schema the backend runs

```ts
export const optionalPhoneSchema = z
  .string().nullable().optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === '') return null;
    return normalizeStoredPhone(value) ?? value;
  })
  .refine((value) => value == null || normalizeStoredPhone(value) !== null, {
    message: 'Not a valid phone number',
  });
```

Semantics you must respect:

| You send | Server does |
|---|---|
| the field **omitted** (`undefined`) | leaves the stored number **untouched** |
| `null` | **clears** the stored number |
| `""` or whitespace only | treated as `null` — clears. **Not** an error. |
| a valid number in any accepted form | normalizes to E.164 and stores that |
| an unrepairable number | **400**, `errors: { "<field>": "Not a valid phone number" }` |

> `undefined` and `null` are **deliberately not collapsed** — partial updates branch on exactly that
> distinction. A `PATCH`-style update that omits `phone` must actually omit it, not send `null`.

The server accepts everything the ladder in §3 accepts: Arabic-Indic digits, spaces, dashes,
parentheses, a leading `+`, a `00` prefix, a doubled dial code, and a bare local number (to which it
prepends `+963`). It always stores and returns E.164.

### 8.2 Where a phone is submitted

| Endpoint | Field | Auth |
|---|---|---|
| `POST /my-listings` | `contactNumber` | Bearer + `user` role |
| `PUT /my-listings/:id` | `contactNumber` | Bearer + `user` role |
| `PUT /profile/update` | `phone` | Bearer |

`PUT /profile/update` body:

```ts
{
  name?: string;            // 1–50
  profileUrl?: string | null;
  phone?: string | null;    // optionalPhoneSchema
  password?: string | null;            // 8–255
  passwordConfirmation?: string | null;
}
```

> **`email` is not updatable here** — it is commented out of the schema server-side. Do not build an
> email field into the profile form expecting it to save.

**Field-name asymmetry to watch:** the request field is **`phone`**, but `GET /profile` returns it as
**`phoneNumber`**. Do not assume they match.

**There is no phone field on registration.** `POST /auth/register` takes `email`, `password`,
`passwordConfirmation`, `name`, `acceptedLegal` — nothing else. Login and password reset are
email-based.

---

## 9. Errors to handle

| Status | Shape | When |
|---|---|---|
| 400 | `errors: { "contactNumber": "Not a valid phone number" }` | listing write with an unrepairable contact number |
| 400 | `errors: { "phone": "Not a valid phone number" }` | profile update with an unrepairable number |

The message is English-only and comes straight from the zod refinement. **Do not display it verbatim** —
map the field to your own i18n key (`listing.errors.contact_number_invalid` /
`profile.errors.phone_invalid`) so Arabic users get Arabic.

If you have mirrored the ladder correctly, a user should never see these — the client catches it first.
They exist as the backstop.

---

## 10. i18n keys

| Key | English | العربية |
|---|---|---|
| `phone.label` | Phone number | رقم الهاتف |
| `phone.placeholder` | `944 123 456` | `944 123 456` |
| `phone.country_search` | Search countries | ابحث عن دولة |
| `listing.wizard.contact_number` | Contact number | رقم التواصل |
| `listing.wizard.contact_prefilled` | Pre-filled from your profile | تم الملء من ملفك الشخصي |
| `listing.wizard.save_as_profile_number` | Save as my profile number | حفظ كرقم ملفي الشخصي |
| `listing.errors.contact_number_required` | Phone number is required | رقم الهاتف مطلوب |
| `listing.errors.contact_number_invalid` | This is not a valid phone number for the selected country | هذا ليس رقم هاتف صالحاً للدولة المختارة |
| `profile.edit.phone_label` | Phone number | رقم الهاتف |
| `profile.edit.phone_placeholder` | Enter phone number | أدخل رقم الهاتف |
| `profile.errors.phone_invalid` | This is not a valid phone number for the selected country | هذا ليس رقم هاتف صالحاً للدولة المختارة |

> **Do not add length-based error strings.** The mobile app **removed** `contact_number_min` ("must be
> at least 8 digits") and `contact_number_max` ("at most 20 digits") in this change — length is not the
> rule and saying so misleads the user. Do not reintroduce them on the web.
>
> The placeholder changed from `912 345 678` to `944 123 456` for the same reason: `91…` is an
> unassigned Syrian prefix, so the old placeholder was itself an invalid number.

---

## 11. Where this lands in `bishola-website`

### 11.1 Install

```
npm i libphonenumber-js
```

### 11.2 Create

| File | What |
|---|---|
| `src/core/lib/phone/phone.util.ts` | §3, verbatim |
| `src/core/lib/phone/phone.schema.ts` | `isPhoneFieldValid` from §4 |
| `src/core/lib/phone/phone.fixtures.ts` | the §6 tables |
| `src/core/lib/phone/phone.util.test.ts` | runs the fixtures |
| `src/components/forms/phone-field.tsx` | §7 |

### 11.3 Replace the three existing phone inputs

The site currently has three, all different, none correct.

**1. Listing contact — the least-bad one.**
`src/components/web/ProductsPage/addProducts/StepFour/AddProductStepFour.tsx` and
`.../StepFour/schema.ts`.

Today: a country-code `<Select>` backed by the `CountryCode` enum (default `+963`), a number input,
local `parsePhoneNumber` / `combinePhoneNumber` helpers, and zod `min(10).max(20)`. It auto-fills from
`profile.phoneNumber`.

Change to: `<PhoneField>`, drop the local helpers in favour of `splitPhone` / `assemblePhone`, replace
the length rules with the object-level refinement from §4, and run `repairPhone` on the prefilled
profile number per §5.4. This file already uses react-hook-form + `zodResolver`, so the refinement
slots straight in.

**2. Profile edit — the worst one.**
`src/components/web/Profile/EditProfilePage.tsx`.

Today: a plain `<input {...register('phone')} />` against `z.string().optional()`. **No validation, no
country code at all.** A user can save literally anything.

Change to: `<PhoneField>` with `countryDialCode` in the form schema for the refinement only, and
`phone: assemblePhone(countryDialCode, data.phone)` when building the `PUT /profile/update` body.
Populate the two fields from the stored value with `splitPhone`. This file already uses RHF + zod.

**3. Registration — nothing to do.**
`src/app/[locale]/auth/register/page.tsx` has no phone field, and the backend register endpoint has no
phone parameter. Leave it. If a phone is ever added to registration, it needs a backend change first.

### 11.4 Anything that displays a phone

Wherever a stored contact number is rendered — the listing detail page, the my-listings detail, a
review or summary step — render it as E.164 or a formatted version of the **stored** value, and wrap it
in `dir="ltr"` on Arabic pages (§7). Never concatenate a dial code onto a raw local number for display.

### 11.5 Prerequisites

| # | Thing | Where |
|---|---|---|
| 1 | `src/core/entities/enums/country-codes.enum.ts` may not carry flags or Arabic country names — check and extend before building the picker | that file |
| 2 | `<Toaster />` is not mounted in `userProfile/layout.tsx`, so a "profile saved" toast from `EditProfilePage` renders nowhere | `src/app/[locale]/userProfile/layout.tsx` |

---

## 12. Testing checklist

- The §6 fixture table passes as a unit test, all 22 + 5 rows.
- Typing `963955555555` with `+963` selected and blurring rewrites the field to `955555555`.
- Typing `963955555` with `+963` selected and blurring **leaves it as `963955555`** — the guard.
- Pasting `+966501234567` into the digits box switches the country picker to Saudi Arabia.
- Typing `٩٥٥٥٥٥٥٥٥` on an Arabic keyboard produces `+963955555555` on submit.
- Typing `912345678` shows the inline invalid error and blocks submit.
- Clicking Submit **without blurring** the phone input still publishes the repaired E.164 number.
- The review/summary step shows the same number that ends up in the listing.
- On `/ar/…`, the phone row renders left-to-right with the dial code physically on the left, while the
  label and error stay right-aligned.
- Saving a profile with an empty phone **clears** it (200), and does not 400.
- A listing update that does not touch the phone leaves the stored number unchanged.
