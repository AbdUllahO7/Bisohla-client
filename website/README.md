# Bishola website — feature handoff documentation

**For:** the `bishola-website` developer, and the AI coding agent working alongside them.

This folder specifies every client-facing feature that the Bishola backend and the mobile app have
shipped since **`feat: add legal documents feature`** and that the public website does **not** yet have.

## Start here

You are not expected to read the backend (`bishola-nest-server`) or the mobile app
(`bishola-app-v2`). **Everything you need is in these files**: every endpoint, every field name, every
enum value, every error string, every settings key, every English and Arabic translation, and the
mobile UX each feature is reproducing.

**Read [`00-conventions.md`](./00-conventions.md) first.** It carries the shared contract — base URL,
response envelope, auth, locale, settings, pagination, the website's own architecture and shared
components, and a list of pre-existing defects that will bite you. Every other file assumes it.

Then work through the features in the order below. It is not arbitrary: earlier documents build things
later ones reuse.

---

## The documents

| # | Document | What it covers | Website today |
|---|---|---|---|
| — | [00-conventions.md](./00-conventions.md) | The shared contract. **Read first.** | — |
| 1 | [01-legal-documents.md](./01-legal-documents.md) | API-driven Terms / Privacy / Cookie pages, the registration consent checkbox, the re-acceptance gate, and a cookie-consent plan | Hardcoded privacy page; **the register page's consent links are `href="#"`**; no gate |
| 2 | [02-phone-validation.md](./02-phone-validation.md) | Real per-country phone validation with `libphonenumber-js`, the repair ladder, and one shared `PhoneField` | Three inconsistent phone inputs; the profile one has **no validation at all** |
| 3 | [03-reference-item-proposals.md](./03-reference-item-proposals.md) | "I can't find my model" — proposing a missing catalogue value from the listing form | Not implemented; reference pickers are read-only |
| 4 | [04-installment-plans.md](./04-installment-plans.md) | Sellers offering monthly instalment plans, and how buyers see them | Not implemented |
| 5 | [05-sellers-galleries.md](./05-sellers-galleries.md) | The sellers directory, seller profiles, the Top Sellers rail, and the seller filter | Partial — a profile page and a home rail exist; no directory, no filter |
| 6 | [07-search-enhancements.md](./07-search-enhancements.md) | Searching by listing `#ID`, the seller-match strip, and Arabic normalization | Plain `searchTerm` only |
| 7 | [06-saved-addresses.md](./06-saved-addresses.md) | A reusable address book, and applying an address to a listing | Not implemented |

> The file numbers reflect feature grouping; the **table order is the recommended build order**.
> `07` comes before `06` because its seller strip depends on `05`.

---

## Why this order

| Step | Reason |
|---|---|
| **1. Legal** | Stands completely alone. The dead consent links are the single highest-value fix on the site — it currently claims consent to documents it does not serve. |
| **2. Phone** | Three later features touch the same forms. Build the shared `PhoneField` once, before anyone else edits those files. |
| **3. Proposals** | Add-listing wizard. |
| **4. Installments** | Add-listing wizard, the same step as the contact field from step 2. **Has two prerequisite defects** — see its §9.4. |
| **5. Sellers** | Provides the endpoints and the shared seller row that step 6 needs. |
| **6. Search** | Its seller strip is built on step 5's directory endpoint. |
| **7. Saved addresses** | Self-contained. Needs the missing `<Toaster />` fixed first (`00-conventions.md` §11 #1). |

---

## Every document has the same shape

Nine sections, in the same order, so you can pattern-match across them:

1. **Quick facts** — the contract lines this feature needs
2. **What the feature is** — the product behaviour, in prose
3. **API contract** — every endpoint, verbatim request and response shapes
4. **Enums & constants** — literal values
5. **Settings that gate it** — key path, type, default, effect
6. **Errors to handle** — verbatim messages and their triggers
7. **UX reference** — the mobile app's screens, states, edge cases, and the reasoning behind them
8. **i18n keys** — full English + Arabic tables, ready to paste into `src/messages/*.json`
9. **Where this lands in `bishola-website`** — routes, components, files, prerequisites

Section 7 describes a React Native app. It is a **behavioural** reference, not a visual one — copy the
states, the ordering, the gating rules and the copy; render them as a website, not as a phone.

Every document ends with a **testing checklist** you can work through before calling the feature done.

---

## Things that are true across all of them

A short version of `00-conventions.md`, so nothing here surprises you:

- **`BACKEND_URL` already ends in `/api/v1`.** Every path in these docs is relative.
- **Every 2xx response is wrapped**: `{ success, message, data, timestamp, path }`. A paginated payload
  puts the array at `data.data`.
- **`makeRequest` never rejects.** Always check `res.success`.
- **`Accept-Language` must be a bare `ar` or `en`.** `en-US` silently falls back to the default, which
  is **`ar`**.
- **Match the auth helper to the route.** `postReq` on a guarded route gives a silent 401 with a clean
  TypeScript build.
- **Every new string needs a key in both `en.json` and `ar.json`.** No hardcoded bilingual ternaries.
- **Import navigation from `@/i18n/routing`**, never `next/navigation` — `localePrefix` is `'always'`.
- **Bidi-isolate** any Latin or numeric run interpolated into Arabic prose.

---

## Pre-existing defects you will hit

Listed in full in `00-conventions.md` §11, and repeated in whichever document they block. The three
that matter most:

| Issue | Blocks |
|---|---|
| **`<Toaster />` is mounted only in `(web)/layout.tsx`** — every `toast()` from a dashboard or auth page renders nowhere | `06`, and any toast you add to `01` or `02` |
| **`normalizeListingToCarDto()`** squashes every listing into the legacy car shape, so **any new listing field is invisible** until threaded through it | `04`, partly `05` and `07` |
| **`rentType` is collected but never sent** — and the website's local enum has a `yearly` value the API rejects | `04` |

---

## Source of truth

These documents were written against **`bishola-nest-server` @ `bfd1f42`** and
**`bishola-app-v2` @ `4dfb4d4`**.

If the live API disagrees with a document, **the API is right** — but report it rather than working
around it. The contract is cheap to extend now and expensive to change once something has shipped
against it.

Backend Swagger UI, if it is reachable to you, is at `<api-host>/api` — **not** under the `/api/v1`
prefix. It is the fastest way to confirm any shape here.
