# 00 — Conventions

**Read this first.** Every other document in `docs/website/` assumes what is written here and does not
repeat it in full. Each feature doc opens with a short **Quick facts** box carrying the lines it
actually needs, and points back here for the rest.

**Audience:** the developer (and the AI coding agent) building features into `bishola-website`, a
Next.js 15 App Router site. You are not expected to read the NestJS backend or the React Native app —
everything you need is in these documents.

---

## 1. Base URL and paths

`bishola-website` reads its backend URL from `config.{dev,staging,prod}.json` via
`src/core/lib/web/constants.ts`:

```jsonc
// config.prod.json
{ "APP_URL": "https://www.bishola.com", "BACKEND_URL": "https://api.bishola.com/api/v1" }
// config.dev.json
{ "APP_URL": "http://localhost:3000",   "BACKEND_URL": "http://localhost:4000/api/v1" }
```

**`BACKEND_URL` already ends in `/api/v1`.** Every path in these documents is therefore written
**relative** — `/legal/documents`, never `/api/v1/legal/documents`. Pass the relative path to the
fetch wrapper and it composes the full URL.

There is no Nest API versioning; `v1` is a literal prefix segment set once with
`app.setGlobalPrefix('api/v1')`. Where you see a `v2` inside a path — `/public/profile/v2/sellers` —
that `v2` is part of the controller's own route, not a version negotiation.

> `src/constants/constants.ts` exports a *second*, env-based `BACKEND_URL`/`APP_URL`. It is imported
> nowhere and is dead. `.env`'s `NEXT_PUBLIC_BACKEND_URL` is likewise unused. Do not start using them.

Swagger UI, if the backend is reachable to you, is at `<host>/api` — **not** under the `/api/v1`
prefix. It is the fastest way to confirm anything in these docs against the live server.

---

## 2. The response envelope

### Success — every 2xx

```jsonc
{
  "success": true,
  "message": "Operation successful",
  "data": <the actual payload>,
  "timestamp": "2026-09-06T12:34:56.000+03:00",
  "path": "/api/v1/legal/documents"
}
```

- `message` is the literal `"Operation successful"` unless the service returned its own `message`
  field, in which case that bubbles up here.
- `path` is the raw request URL and **includes** the global prefix and the query string.
- All ISO timestamps are rewritten into the server's configured timezone offset, so they come back as
  `+03:00`, **not** `Z`. Do not assume UTC when parsing.

### Paginated success

A paginated endpoint puts this object in `data`:

```ts
interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  statistics?: GlobalStatistics;   // admin surfaces only
}
```

So the raw HTTP body is `{ success, message, data: { data: [...], currentPage, ... }, timestamp, path }`
— **the array is `body.data.data`**.

Some endpoints deliberately return a **bare array** instead of a paginated object. Each is called out
where it appears; the ones in these docs are `/public/profile/v2/top-sellers`,
`/listing-type-ref/ref-groups/:groupId/items/fuzzy`, `/user-addresses`, `/listings-visitor/recent` and
`/listings-visitor/map`.

### Errors — non-2xx

Errors are **not** wrapped in the success envelope. They are emitted directly:

```jsonc
{
  "success": false,
  "message": "<human-readable message>",
  "errors": <array | object>,
  "path": "/api/v1/...",
  "timestamp": "...",
  "stack": "..."   // development only
}
```

Three shapes of `errors` matter:

**1. Zod validation failure — HTTP 400.** `errors` is an object map of field path → message.
Multiple errors on the same path are joined with `"; "`. Nested paths are dot-joined.

```jsonc
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "kinds": "Provide at least one of kinds or documentIds",
    "attributeValues.0.proposedReferenceName": "String must contain at least 1 character(s)"
  }
}
```

**2. A thrown application exception.** `errors` is whatever the exception carried. It may be an
**object** like `{ "message": "..." }` **or an array**. Code defensively:

```ts
const detail =
  typeof res.errors === 'object' && res.errors !== null && !Array.isArray(res.errors)
    ? (res.errors as { message?: string }).message
    : Array.isArray(res.errors)
      ? String(res.errors[0])
      : undefined;
```

**3. A Postgres constraint failure** → 409 for a unique violation, 400 for FK / not-null / check, with
`errors: [{ field, message }]`.

### How the website already handles this

`src/core/lib/api.ts` `handleResponse` **already unwraps the outer envelope**, and a non-2xx is
converted into a *resolved* value by `toFailureResponse` rather than a rejection. So:

- Your action never receives a rejected promise from `makeRequest`. **Always check `res.success`.**
- What you get back in `res.data` is the inner payload — for a paginated endpoint that is the
  `PaginatedResponse<T>` object, so you still read `res.data.data` for the array.

---

## 3. Locale

```ts
// backend: src/locale/locale.middleware.ts
const headerLocale = req.header('Accept-Language');
if (headerLocale && isLocaleSupported(headerLocale)) locale = headerLocale;
```

`isLocaleSupported` is an exact membership test against `['ar', 'en']`.

> **`Accept-Language` must be a bare `ar` or `en`.** A real browser header — `en-US,en;q=0.9`, or
> `ar-SY` — is **not** matched and silently falls back to the default locale, which is **`ar`**.

`makeRequest` already sends the bare active locale, so you get this for free as long as you go through
it. Do not hand-roll a fetch that forwards the browser's own `Accept-Language`.

Every translatable field resolves as *translation row for the request locale → fall back to the base
column*. Detail responses additionally return a raw `translations` object keyed by locale, so you can
render both languages client-side when you need to (bilingual edit forms do this).

Exception messages are translated by a separate resolver that also honours a `?lang=ar` query param.
The two are independent: `Accept-Language` picks the **content** locale, `?lang=` can force the
**error message** locale.

---

## 4. Authentication

There is **no global auth guard** on the backend. A controller with no auth decorator is fully public.

| Backend decorator | What it means for you |
|---|---|
| *(none)* | Fully public. No `Authorization` header needed or used. |
| `@OptionalAuth()` | Works anonymously. Sending `Authorization: Bearer <jwt>` adds user-specific fields (notably `isFavorite` on listings). |
| `@checkAuth()` | Requires `Authorization: Bearer <jwt>`. Any account type. |
| `@CheckUser(['user'])` | Requires a Bearer token **and** the `user` role. |

Each endpoint in these docs states which one applies.

### The website's session model

- The site wraps the backend's `accessToken` + `refreshToken` in **its own** `jose`-signed JWT stored
  in an httpOnly cookie named `session` (`src/core/lib/web/session.token.ts`,
  `SESSION_COOKIE_OPTIONS` = `httpOnly`, `sameSite: 'lax'`, `secure` in production, `path: '/'`).
- Middleware (`src/middleware.ts`) trusts only that cookie. Proactive token refresh happens in
  middleware (`src/core/lib/web/session.refresh.ts`), on GET/HEAD non-prefetch requests only.
- `getAuthReq` / `postAuthReq` / `putAuthReq` / `patchAuthReq` / `deleteAuthReq` fail fast with 401 if
  there is no session. `getReq` / `postReq` / … attach the token opportunistically when one exists.
  **Match the helper to whether the backend route is guarded** — using `postReq` on a guarded route
  produces a silent 401 with a perfectly clean TypeScript build.
- When a request comes back 401/403 having carried a Bearer, `makeRequest` refreshes once and retries,
  then returns `{ ...res, sessionExpired: true }` if the refresh itself failed. `SessionExpiryWatcher`
  in `src/providers/query.provider.tsx` watches for that and redirects to sign-in.

### Headers the site sends

`makeRequest` already attaches all of these (except when the body is `FormData`, which drops the first
three so the browser can set the multipart boundary):

| Header | Value | Why it matters |
|---|---|---|
| `Content-Type` | `application/json` | |
| `Accept-Language` | `ar` \| `en` | content locale — see §3 |
| `x-app-source` | `web-app` | The backend maps this to a platform: `web-app → web`, `mobile-app → mobile`, **absent → `api`**. It is what makes a legal-acceptance row say `platform: 'web'`. |
| `x-forwarded-for` | the real client IP | Resolved by `src/core/lib/web/client-ip.ts`. The backend scans X-Forwarded-For **right-to-left** and takes the first non-private entry, so SSR forwarding gives each visitor their own rate-limit identity instead of collapsing everyone onto the server's IP. |
| `Authorization` | `Bearer <accessToken>` | when a session exists and the route is not pre-auth |

One header you must add yourself where noted: `x-idempotency-key` on `POST /my-listings` — a
client-minted token, one per submission attempt. Re-sending the same token returns the listing already
created for it instead of creating a duplicate. Omit it to disable dedup.

> A timeout is **ambiguous, not a failure**. Never blind-retry a non-idempotent request. `makeRequest`
> already restricts its retry logic to idempotent methods (`IDEMPOTENT_METHODS`) — keep it that way.

---

## 5. Shared query parameters

Most list endpoints accept the same parameter set:

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | `1` | |
| `pageSize` | int | `20` on listing search, `10` on generic lists | clamped — see below |
| `sortBy` | string | `priorityScore` on visitor listing search | must be a real column |
| `sortDirection` | `asc` \| `desc` | `desc` | ties always break on `id` in the same direction |
| `searchTerm` | string | — | free text; see `07-search-enhancements.md` |
| `searchKey` | string | — | optional companion, unused on listings |
| `id` | int, `1,2,3`, or repeated | — | |
| `locale` | `ar` \| `en` | — | only affects cache keys and the map endpoint; content locale comes from `Accept-Language` |
| `where` | JSON array | `[]` | `[{"field":"price","operator":"gte","value":1000}]` |
| `filterGroups` | JSON array | `[]` | `[{"operator":"or","filters":[{...}]}]` |

Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `in`, `inArray`, `notInArray`.
Logical operators for `filterGroups`: `and`, `or`.

`searchTerm` is also accepted as `search[term]`, `search.term`, or `searchKey`/`searchTerm`. Use the
plain `searchTerm` form.

`where` and `filterGroups` are JSON-encoded automatically by the website — `JSON_PARAM_KEYS` in
`src/core/lib/api.ts` handles it, and `src/providers/filters.provider.tsx` `buildQueryParams()`
already builds `filterGroups` for the products page. Follow that pattern.

For listings, a `where` field resolves against any real `listings` column (`price`, `governorate`,
`city`, `condition`, `listingOfferType`, `rentType`, `installmentsAvailable`, `userId`, `isFeatured`,
…), plus `attrs.<attributeSlug>` which becomes a lookup into the listing's attribute values.
**Unknown fields are silently dropped** — a typo in a field name does not error, it just returns
unfiltered results.

### Pagination clamping

A global interceptor clamps `pageSize`: anonymous **≤ 50**, authenticated ≤ 100, admin ≤ 500, absolute
ceiling 1000.

Anonymous callers additionally get a **400** when `page * pageSize > 5000`:

> `Pagination offset too large. Narrow your filters instead of paging beyond 5000 results.`

Deep pagination on a public listing page will hit this. Design for filtering, not for page 300.

### Rate limits

Per route, per client IP.

| Class | Limit | Applies to |
|---|---|---|
| Public routes | 40 req/s and 400 req/min | legal, listing-type-ref, listings-visitor, public profile |
| Authenticated routes | 20 req/s and 200 req/min | user addresses, profile |
| Global ceiling | 50/s, 200/10s, 600/min | everything |

429 message: `Too many requests. Please try again later.`

---

## 6. Reading settings

Almost every feature in these docs is gated or tuned by admin-editable settings. Two public,
unauthenticated endpoints read them:

```
GET /settings/public                          all public settings, all groups
GET /settings/<group>                         one group, e.g. /settings/listings_settings
GET /settings/<group>/<subgroup>              one subgroup, e.g. /settings/listings_settings/installments
```

Credentials (`secret: true` fields) are stripped from every public read path, so nothing sensitive
leaks. The website already has the plumbing:

- `src/core/infrastructure-adapters/actions/settings/settings.actions.ts`
- `src/core/infrastructure-adapters/use-actions/settings/settings.use-actions.tsx`
- `src/providers/settings.provider.tsx`
- typed shapes in `src/core/entities/models/settings/settings.dto.ts`

**Add the new groups to the typed shape** as you consume them, and always code a fallback default —
an installed client may hold a cached settings payload from before a group existed. Every settings
table in these docs gives the default to fall back to.

Settings responses are cached in Redis for 24 hours. A settings change made in the admin dashboard can
take that long to appear unless the cache is cleared, so do not conclude a key is missing from one
stale read.

---

## 7. The website's two architectures — pick one deliberately

`bishola-website` currently contains **two live patterns** for calling the backend. Both work. Know
which one you are following.

### (a) The full DI slice — older features

Seven files, wired through the `@evyweb/ioctopus` container. Example, `listings-visitor`:

```
src/core/entities/models/listings/listings.dto.ts                             types
src/core/application/repositories/listings/listings.visitor.repo.interface.ts interface
src/core/infrastructure/repositories/listings/listings.visitor.repo.ts        HTTP calls
src/core/application/use-cases/repositories/listings/…use-case.ts             use-case
src/core/application/controllers/repositories/listings/…controller.ts         controller
src/di/modules/repositories/listings-visitor.repo.module.ts                   binding
src/di/types.ts + src/di/container.ts                                         symbol + registration
  ↓
src/core/infrastructure-adapters/actions/visitors/listing.visitor.actions.ts  'use server'
src/core/infrastructure-adapters/use-actions/visitors/listing.visitor.use-actions.tsx  TanStack hook
  ↓
src/app/[locale]/(web)/products/AllCarListings.tsx                            consumer
```

### (b) The direct action — newer features

One `'use server'` file calling the fetch helpers straight from `src/core/lib/api.ts`. See
`src/core/infrastructure-adapters/actions/users/listing.user.actions.ts`,
`.../users/statistics.user.actions.ts`, `.../visitors/public-profile.actions.ts`,
`.../settings.actions.ts`.

```ts
'use server';
import { getAuthReq } from '@/core/lib/api';

export async function listSavedAddresses() {
  return getAuthReq<SavedAddressDto[]>({ url: '/user-addresses' });
}
```

### Recommendation

> **Use pattern (b) for all the work in these documents.** It is where the repository is already
> heading, it is one file instead of seven, and every feature here is a straightforward set of
> endpoint calls with no domain logic worth a use-case layer. Pair each action file with a TanStack
> Query hook in `src/core/infrastructure-adapters/use-actions/` when a client component needs it.

Where a feature extends something that already has a DI slice, extend the slice rather than mixing
patterns inside one feature.

---

## 8. Data fetching

- **Server Components** call the `'use server'` actions directly (`await getListingBySlug(slug)`) and
  frequently wrap them in `cache()` from `react`.
- **Client Components** use TanStack Query hooks whose `queryFn` calls the same Server Action. The
  house helper is `useLocaleQuery` (`src/core/infrastructure-adapters/use-actions/common/use-locale-query.tsx`),
  which appends the active locale to the query key automatically — **use it**, or a locale switch
  serves cached content in the wrong language.
- The `QueryClient` is a module-level singleton in `src/providers/query.provider.tsx`:
  `staleTime` 60 s, `gcTime` 5 min, `retry` 1, no refetch on window focus.
- Mutations use plain `useMutation`. **Invalidate the affected query keys on success** — nothing does
  it for you.

---

## 9. i18n and RTL

- Locales: `['en', 'ar']`, **default `ar`**. Config in `src/i18n/routing.ts`, `localePrefix: 'always'`.
- Messages: `src/messages/en.json` and `src/messages/ar.json`.
- **Interpolation syntax.** The i18n tables in these documents are written in **next-intl's
  single-brace form** — `{count} listings`, `Member since {date}` — ready to paste into
  `src/messages/*.json`. The mobile app they were taken from uses i18next's `{{count}}`; that has
  already been converted for you. If you copy a string from anywhere else, convert it.
  Pluralisation differs too: next-intl uses ICU `{count, plural, ...}` inside one message rather than
  i18next's `_one` / `_other` sibling keys. Where a table lists `foo_one` / `foo_other`, fold them into
  a single ICU message — and for Arabic include all six CLDR categories
  (`=0`/`zero`, `one`, `two`, `few`, `many`, `other`).
- **Every new string needs a key in both files.** Do not add hardcoded bilingual ternaries
  (`locale === 'ar' ? '…' : '…'`) — several older files do this (`Steps.tsx`, the privacy page's
  in-file `translations` dictionary, `auth/register/page.tsx`) and it is the pattern being retired,
  not extended.
- **Import navigation from `@/i18n/routing`**, never from `next/navigation`:
  ```ts
  import { Link, redirect, usePathname, useRouter } from '@/i18n/routing';
  ```
  `localePrefix` is `'always'`, so a bare `<a href="/legal/terms-of-service">` drops the locale.
- Direction is set once, on `<html dir>` in `src/app/[locale]/layout.tsx`. There is no RTL Tailwind
  plugin; components handle direction with `useDirection()` (`src/hooks/use-direction.tsx`) or
  conditional classes. Prefer logical CSS properties (`margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`) over `left`/`right` in new code.
- **Bidi isolation.** Anything that mixes a Latin/numeric run into Arabic prose — a listing id, a
  phone number, an attribute name inside a sentence — must be isolated, or the characters reorder
  unpredictably. Use `⁦…⁩` (LRI/PDI) around the interpolated value, or wrap it in an element
  with `dir="ltr"` and `unicode-bidi: isolate`. Never bake the punctuation (`#`, `+`) into the
  translation string; put it **inside** the interpolated value.

> **Known gap:** `en.json` has `notifications` and `pagination` namespaces that `ar.json` lacks, while
> `ar` is the default locale. Please don't widen the gap; closing it while you're in there would be
> welcome.

---

## 10. Shared UI you should reuse

`src/components/ui/` — shadcn/Radix ("new-york" style, `components.json`), 34 primitives:
`accordion, alert, alert-dialog, avatar, badge, box, breadcrumb, button, calendar, card, carousel,
checkbox, command, confirmation-dialog, dialog, dropdown-menu, form, input, label, popover, progress,
scroll-area, select, separator, sheet, sidebar, skeleton, switch, tabs, text, textarea, toast, toaster,
tooltip, visually-hidden`.

Two are custom to this repo and used everywhere — prefer them over ad-hoc divs:

- **`Box`** (`src/components/ui/box.tsx`) — the layout primitive.
  `<Box variant="row|column|rowBetween|columnBetween|center|container">`
- **`Text`** (`src/components/ui/text.tsx`)

Other things that already exist, so you do not rebuild them:

| Need | Use |
|---|---|
| Pagination controls | `src/components/shared/Pagination.tsx` (controlled: `currentPage`, `totalPages`, `hasNext`, `hasPrev`, `onPageChange`) |
| Destructive confirm | `src/components/ui/confirmation-dialog.tsx` (`ConfirmationDialog` — direction-aware, `isLoading`, `variant="destructive"`) |
| Section heading | `src/components/shared/SectionHeader.tsx` |
| Breadcrumbs | `src/components/shared/smart-breadcrumbs.tsx` (`SmartBreadcrumb`, takes `{label, arLabel, href}[]`) |
| Form input (auth style) | `src/components/forms/detailed-input.tsx` |
| Submit button | `src/components/forms/submit-button.tsx` (uses `useFormStatus`) |
| Searchable select | `src/components/web/design/SelectFieldWithSearch.tsx`, `src/components/forms/server-select.tsx` |
| Image upload | `src/components/image-uploader/image-uploader.tsx` (`ImageUploader`, `ImageUploaderRef`) |
| Loading | `src/components/ui/skeleton.tsx`; route-level `loading.tsx`; `nextjs-toploader` is already mounted globally |
| Map | `src/components/web/Map/LeafletMapView.tsx`, `InteractiveMapContainer.tsx` |
| Listing card | `src/components/web/design/ProductCardItem*.tsx`, `ProductCardListView.tsx`, `RentProductCard.tsx` |

### Forms

Two patterns exist:

- **Server Action + `useActionState` + zod inside `makeRequest`** — all auth pages.
  `src/app/[locale]/auth/register/page.tsx` → `handleRegister` → `postReq({ validationSchema })`.
  Schemas in `src/core/entities/models/auth/`, validation in `src/core/lib/validation.ts`.
- **react-hook-form + `zodResolver`** — used in exactly two files today
  (`.../addProducts/StepFour/AddProductStepFour.tsx` and `src/components/web/Profile/EditProfilePage.tsx`),
  both of which consume `src/components/ui/form.tsx`.

**For the new forms in these documents, use react-hook-form + `zodResolver`.** The hand-rolled
`useState` + manual validation approach used by the rest of the add-listing wizard is not worth
extending, and several of these features (phone validation, installment plans, saved addresses) need
cross-field refinements that a resolver gives you for free.

---

## 11. Cross-cutting known issues

These are pre-existing defects in `bishola-website` that will bite you while implementing these
features. Each is repeated in the feature doc it actually blocks.

| # | Issue | Impact |
|---|---|---|
| 1 | **`<Toaster />` is mounted only in `src/app/[locale]/(web)/layout.tsx`** — not in `userProfile/layout.tsx` or `auth/layout.tsx`. | Every `toast()` fired from a dashboard or auth page renders nowhere. Existing calls in `MyListings*`, `Statistics*`, `EditProfilePage`, `Settings` and `useSubmitForm` are already silently lost. Mount `<Toaster />` in the other two layouts before building anything that toasts. |
| 2 | **`normalizeListingToCarDto()`** (`src/utils/listing-normalization.ts`) squashes every generic listing into the legacy `SelectCarListingDto` car shape so the old car UI keeps working. | **Any new listing field is invisible until you thread it through this function.** This blocks installments (`04`) directly. |
| 3 | **`rentType` is collected but never sent.** It is in `adInformationSchema` and read back on edit, but `useSubmitForm.ts` never puts it in the DTO and `create-listing.dto.ts` has no such field. | The rent period a seller picks is silently discarded. Blocks `04-installment-plans.md`, which lives in the same wizard step. |
| 4 | **Legacy `/car-*` endpoints are still in the hot path.** `src/core/infrastructure/repositories/cars/*`, `services/{visitors,users}/car.*.service.ts` call `/car-listings-visitor/*`, `/car-listings-user/*`, `/car-make-visitor/*`, etc. Consumed by the product detail page's fallback branch, `Home/WorldOfProduct.tsx`, `ProductsPage/Categories.tsx`, `addProducts/StepTwo/hooks.ts` and the card components. | The cars module is legacy. New work goes through listing-types. Do not add calls to `/car-*`. |
| 5 | **Two favorites systems in parallel** — new `/listing-favorites/*` and old `/user-favorites/*`. | Use `/listing-favorites/*`. |
| 6 | **`ar.json` is missing the `notifications` and `pagination` namespaces** that `en.json` has, while `ar` is the default locale. | Those UI areas fall back to keys in Arabic. |
| 7 | **`/admin/*` is guarded in `src/middleware.ts` but no such route group exists**, and `allRoutes.admin` in `src/constants/routes.constant.ts` is dead. | Harmless, but do not build against it. The admin dashboard is a separate application. |
| 8 | **Duplicate/alias routes that will drift:** `/products/EditProduct/[id]` vs `/products/edit/[id]`; `/profile/edit` vs `/userProfile/UserInfo`; `/favorites` vs `/userProfile/Favorites`; `/notifications` vs `/userProfile/Notification`; `/car-alerts` vs `/userProfile/Alerts`; `userProfile/page.tsx` vs `userProfile/Home/page.tsx`. | When you touch one, check whether its twin needs the same change. |
| 9 | **`.env` and `.env.example` both contain a committed `SESSION_SECRET_KEY`.** | Rotate it. Not a blocker for these features, but it should not stay. |

---

## 12. Existing route map

The site's current routes, for orientation. New routes proposed by the feature docs are marked
**NEW**.

**Public — `src/app/[locale]/(web)/`**

| Route | Notes |
|---|---|
| `/` | home |
| `/products` | search / browse |
| `/products/product/[id]` | detail; accepts an id **or** a slug |
| `/products/AddProducts` | create-listing wizard |
| `/products/EditProduct/[id]`, `/products/edit/[id]` | edit (the second re-exports the first) |
| `/map` | `?typeId=` |
| `/compare`, `/favorites`, `/notifications`, `/car-alerts`, `/settings` | |
| `/news`, `/news/[slug]` | |
| `/profile/[id]` | public seller profile |
| `/profile/edit` | own profile |
| `/ContactUs`, `/Privacypolicy`, `/Links` | |
| `/my-listings`, `/statistics` | redirect into `/userProfile/*` |
| `/legal/[kind]` | **NEW** — see `01-legal-documents.md` |
| `/sellers` | **NEW** — see `05-sellers-galleries.md` |

**Dashboard — `src/app/[locale]/userProfile/`**

`/userProfile`, `/Home`, `/Products`, `/Products/[id]`, `/UserInfo`, `/Favorites`, `/Alerts`,
`/Notification`, `/Statistics`, `/Statistics/listing/[id]`, plus **NEW** `/SavedAddresses`,
`/SavedAddresses/new`, `/SavedAddresses/[id]` — see `06-saved-addresses.md`.

**Auth — `src/app/[locale]/auth/`**

`/sign-in`, `/register`, `/verify-email`, `/email-verified`, `/reset-password`,
`/send-reset-password-email`, `/oauth-success`, `/error`.

**Non-localized:** `GET /app` → `src/app/app/route.ts` (store redirect).

> **Careful with route handlers.** A GET route handler is executed by Next `<Link>` **prefetch** in
> production. That is how a signout GET route once deleted live sessions on hover, invisible in
> `next dev`. Anything with a side effect must be a Server Action or a POST, never a `<Link>` target.

---

## 13. What each feature document contains

All seven use the same nine sections, so you can pattern-match across them:

1. **Quick facts** — the contract lines this feature needs.
2. **What the feature is** — the product behaviour, in prose.
3. **API contract** — every endpoint, verbatim request and response shapes.
4. **Enums & constants** — literal values.
5. **Settings that gate it** — key path, type, default, effect.
6. **Errors to handle** — verbatim messages and their triggers.
7. **UX reference** — the mobile app's screens, states and edge cases, with the reasoning.
8. **i18n keys** — full en + ar tables, ready to paste.
9. **Where this lands in `bishola-website`** — routes, components, files, prerequisites.

Section 7 describes the React Native app. It is a **behavioural** reference, not a visual one — copy
the states, the ordering, the gating rules and the copy; render them as a website, not as a phone.

---

## 14. Reading order

| Order | Document | Why here |
|---|---|---|
| 1 | `01-legal-documents.md` | Stands alone; the dead consent links are the highest-value fix on the site. |
| 2 | `02-phone-validation.md` | Three later features touch the same forms. Build the shared `PhoneField` once. |
| 3 | `03-reference-item-proposals.md` | Add-listing wizard. |
| 4 | `04-installment-plans.md` | Add-listing wizard, same step as `02`'s contact field. Has two prerequisite defects. |
| 5 | `05-sellers-galleries.md` | Provides the endpoints `07` needs. |
| 6 | `07-search-enhancements.md` | Its seller strip depends on `05`. |
| 7 | `06-saved-addresses.md` | Self-contained; needs known issue #1 fixed first. |

---

## 15. When something here is wrong

These documents were written against the backend at commit `bfd1f42` and the mobile app at `4dfb4d4`.
If the live API disagrees with a document, **the API is right** — but say so rather than working
around it. The contract is cheap to extend now and expensive to change once you have shipped against
it.
