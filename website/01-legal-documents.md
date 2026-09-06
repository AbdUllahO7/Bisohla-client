# 01 — Legal documents, consent & the re-acceptance gate

> Supersedes the earlier standalone legal handoff. Backend built and merged (`721ac0a`); mobile app shipped
> (`179bc6a`, `304ac56`); admin dashboard shipped (`e98725e`). The API below is final and callable today.

## Quick facts

| | |
|---|---|
| **Base path** | relative — `BACKEND_URL` already ends in `/api/v1` |
| **Public endpoints** | `GET /legal/documents`, `GET /legal/documents/:kind`, `GET /legal/documents/:kind/versions/:version` |
| **Authenticated** | `GET /legal/pending`, `POST /legal/accept`, `GET /legal/my-acceptances` — Bearer, **any** role |
| **Registration** | `POST /auth/register` gains an optional `acceptedLegal: boolean` |
| **Locale** | `Accept-Language: ar` \| `en` — bare code only |
| **Envelope** | `{ success, message, data, timestamp, path }` — payload is in `data` |
| **Settings** | none gate this feature; two legacy settings are read as fallbacks |
| **Rate limit** | 40/s, 400/min per IP |

---

## 1. What the feature is

Legal documents — privacy policy, terms of service, cookie policy — are no longer a settings field.
They live in a versioned `legal` schema with per-user acceptance tracking.

- Each document has a **version history**. Exactly one version is live (`active`) at a time.
- A published version is **immutable** — a change means a new version.
- A publish can be marked **material**, which bumps the *major* version and re-prompts every user.
- Every acceptance is a row: user, exact version, timestamp, IP, user-agent, device, source, platform.

Three things the website must build:

1. **Readable document pages** served from the API, replacing the hardcoded privacy page.
2. **A consent checkbox at registration**, replacing today's passive sentence with two dead links.
3. **A re-acceptance gate** — a blocking dialog shown to a signed-in user who has outstanding
   documents, with an Accept action and a Sign-out escape.

> **`general.content.privacy_html` still exists and still returns the current privacy policy.** The
> backend mirrors every published privacy version back into it so the current site keeps working
> untouched. It is **deprecated** — build against `/legal/*` and the mirror goes away in a later
> release. It survives here only as a narrow 404 fallback (§7.3).

---

## 2. API contract

### 2.1 `GET /legal/documents` — list, bodies omitted

**Auth:** none. **Query params:** none. **Headers:** `Accept-Language`.

Use it to render footer links and the settings list without hardcoding document kinds — publishing a
Cookie Policy in the admin then adds a link with no code change.

Response `data` is an **array**:

```jsonc
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "documentId": 1,
      "kind": "privacy_policy",
      "slug": "privacy-policy",
      "requiresAcceptance": true,
      "version": 1,
      "effectiveAt": "2026-06-02T00:00:00.000+03:00",
      "publishedAt": "2026-08-18T10:00:00.000+03:00",
      "title": "Privacy Policy",
      "summary": null
    }
  ],
  "timestamp": "...",
  "path": "/api/v1/legal/documents"
}
```

Only documents where `isActive = true` **and** an `active` version exists are returned. A document
whose only version is a draft is skipped entirely.

> ⚠️ **`title` can be `null` here.** This endpoint does **not** fall back to the default locale — a
> missing translation for the requested locale yields `null`. The by-kind and by-version reads (§2.2,
> §2.3) *do* fall back. Always render `title ?? <a per-kind label from your own messages file>`.

Cached server-side for 24 hours, per locale.

### 2.2 `GET /legal/documents/:kind` — the live version, with body

**Auth:** none. **Query params:** none. **Headers:** `Accept-Language`.

`:kind` accepts **either** the enum kind (`privacy_policy`) **or** the slug (`privacy-policy`).

Response `data`:

```ts
{
  documentId: number;
  kind: 'privacy_policy' | 'terms_of_service' | 'cookie_policy';
  slug: string;
  requiresAcceptance: boolean;
  version: number;
  effectiveAt: string | null;
  publishedAt: string | null;
  title: string | null;
  contentHtml: string | null;   // sanitized HTML — render with dangerouslySetInnerHTML
  summary: string | null;
}
```

`contentHtml` comes through the same allowlist sanitizer as news content and is safe to inject.

**Errors:**

| Status | `message` | When |
|---|---|---|
| 404 | `Document not found` | unknown kind/slug, or `isActive = false` |
| 404 | `This document has not been published yet` | the document exists but has no `active` version |

> **Today only `privacy-policy` has an active version.** `terms-of-service` and `cookie-policy` are
> seeded as drafts and return the second 404 until an admin publishes them. **Your UI must not treat
> that as an error** — render an "unavailable" empty state, not a crash or a red banner.

Cached server-side for 24 hours, per locale.

### 2.3 `GET /legal/documents/:kind/versions/:version` — historical permalink

**Auth:** none. `:version` is the flat integer `version`. This is the permalink for *"the text you
accepted on 3 June"*, which you need if you build a data-access / download-my-data surface.

Response `data`: same shape as §2.2.

**Errors:** 404 `Document not found`; 404 `Version not found` — the latter also covers a version whose
status is `draft`. Drafts are never public. **Archived versions *are* returned.**

Not cached.

### 2.4 `GET /legal/pending` — what this user still owes

**Auth:** `Authorization: Bearer <jwt>`. **Any** account type — the backend deliberately guards this
with a plain JWT check rather than a `user`-role check, so admins and staff are covered too.

**Headers:** `Accept-Language`. **Query/body:** none.

Response — note the payload is an **object with a `pending` key**, not a bare array:

```jsonc
{
  "success": true,
  "data": {
    "pending": [
      {
        "documentId": 2,
        "kind": "terms_of_service",
        "slug": "terms-of-service",
        "versionId": 7,
        "version": 3,
        "majorVersion": 2,
        "effectiveAt": "2026-09-01T00:00:00.000+03:00",
        "title": "Terms of Service",
        "summary": "We clarified how disputes between buyers and sellers are handled."
      }
    ]
  }
}
```

Ordered by the admin's `displayOrder`. `summary` is the *"what changed"* note — show it in the prompt.
`title` is a LEFT JOIN on the request locale and can be `null`; fall back to a per-kind label.

The predicate: document `isActive` **and** `requiresAcceptance` **and** version `status = 'active'`
**and** no acceptance row with `acceptedMajorVersion >= version.majorVersion`. So a **minor** version
bump does not re-prompt — only a publish marked material, which bumps the major version.

**An empty array means the user is up to date.** Call this once per cold boot.

> ### ⚠️ There is no server-side gate
>
> No guard, interceptor or endpoint blocks a user with pending documents. There is no 403 or 409 to
> catch anywhere else in the API. **The block is entirely client-side.** A user who dismisses your
> dialog by any means keeps full access to the site.

### 2.5 `POST /legal/accept`

**Auth:** Bearer, any role.
**Headers used by the server:** `Accept-Language` (locale), `x-app-source` (→ platform), `user-agent`,
`x-device-id` (optional; the web sends nothing here). The IP is taken from the request.

**Body** — at least one of the two keys is required:

```ts
{
  kinds?: Array<'privacy_policy' | 'terms_of_service' | 'cookie_policy'>;
  documentIds?: number[];
}
```

```jsonc
{ "kinds": ["terms_of_service"] }
```

> **Never send a version id.** The server resolves each named document to its *current* active version
> itself. This is deliberate — it makes the call impossible to get wrong from a stale client.

The call is **idempotent** (unique on `userId` + `versionId`, conflicts ignored), so a double-submit is
harmless.

**Response** — the **refreshed** pending list, same shape as §2.4:

```jsonc
{ "success": true, "data": { "pending": [] } }
```

> **Trust this list; do not assume success cleared everything.** A document published while the user
> was reading would still be outstanding. Close the gate only when `data.pending.length === 0`.

**Errors:**

| Status | `message` / `errors` | When |
|---|---|---|
| 400 | `Validation failed` + `errors: { kinds: "Provide at least one of kinds or documentIds" }` | neither key supplied, or both empty |
| 400 | `No matching legal documents to accept` | none of the supplied kinds/ids matched a document with `requiresAcceptance = true`. **`cookie_policy` has `requiresAcceptance: false`, so accepting only the cookie policy produces this.** |

Documents with no active version are silently skipped — no row, no error.

Acceptances written here are recorded with `source: 'reacceptance_gate'`.

### 2.6 `GET /legal/my-acceptances` — the caller's consent history

**Auth:** Bearer, any role. No params.

Response `data` is an array of raw acceptance rows, newest first:

```ts
{
  id: number;
  userId: number;
  documentId: number;
  versionId: number;
  acceptedMajorVersion: number;
  acceptedAt: string;
  source: 'registration' | 'oauth_registration' | 'reacceptance_gate'
        | 'profile_screen' | 'admin_backfill' | 'seed_import';
  platform: 'web' | 'mobile' | 'admin' | 'api';
  locale: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  createdAt: string;
}
```

No document title or kind is joined — resolve `documentId` against `GET /legal/documents`.

### 2.7 `POST /auth/register` — the consent field

**Auth:** none. Public.

```ts
{
  email: string;                 // valid email
  password: string;              // 8–255
  passwordConfirmation: string;  // must equal password
  name: string;                  // 1–50
  acceptedLegal?: boolean;       // NEW — optional
}
```

The refinement error for a mismatch lands on `passwordConfirmation`:
`Password confirmation must match the password`.

Server behaviour:

| You send | Server behaviour |
|---|---|
| `acceptedLegal: true` | Records an acceptance for **every** document with `requiresAcceptance = true` that has an active version, at its current version. **This is what you want.** |
| field omitted | Same as `true` — records the acceptance. Kept this way so today's live form is unaffected while you build. |
| `acceptedLegal: false` | Records **nothing**. The user is caught by the pending gate on their next load. |

> Send `true` only when the checkbox is ticked, and **do not send `false` as the default for an
> unticked box you intend to block on** — block client-side and simply do not submit. Send `false` only
> if you deliberately allow registering without consent.

The consent write is best-effort: a failure never fails the signup. Platform is derived from
`x-app-source` — `web-app → web`, `mobile-app → mobile`, **absent → `api`**. The site already sends
`x-app-source: web-app`, so acceptance rows will correctly say `platform: 'web'`.

`acceptedLegal` is optional **for now**. It becomes required one release after both the website and
the mobile app ship their checkbox — **tell the backend team when yours is live.**

**OAuth signup needs no changes at all.** Those users land with no acceptance rows and are caught by
the pending gate on their next screen. There is no way to capture consent in an OAuth redirect, and
the `oauth_registration` source is reserved but never written.

### 2.8 Admin-only — do not call from the website

For completeness. These require admin permissions and must never be called from the public site:

`/admin/legal/documents` (list, get, create, update), `/admin/legal/documents/:id/versions`,
`/admin/legal/versions/:versionId` (+ `/translations`, `/publish`, `/archive`, delete),
`/admin/legal/seed`, `/admin/legal/backfill-acceptances`, `/admin/legal/acceptances`,
`/admin/legal/acceptances/stats`.

---

## 3. Enums & constants

```ts
// Document kinds
'privacy_policy' | 'terms_of_service' | 'cookie_policy'

// Version status
'draft' | 'active' | 'archived'

// Acceptance source
'registration'          // the register form's checkbox
| 'oauth_registration'  // reserved, never written today
| 'reacceptance_gate'   // POST /legal/accept
| 'profile_screen'
| 'admin_backfill'      // the bulk privacy backfill
| 'seed_import'

// Acceptance platform
'web' | 'mobile' | 'admin' | 'api'

// x-app-source → platform
{ 'mobile-app': 'mobile', 'web-app': 'web' }   // anything else, or absent → 'api'
```

### Seeded catalogue — the state of the data today

| kind | slug | `requiresAcceptance` | `displayOrder` | published? |
|---|---|---|---|---|
| `privacy_policy` | `privacy-policy` | `true` | 0 | **yes** (effective `2026-06-02`) |
| `terms_of_service` | `terms-of-service` | `true` | 1 | no — draft outline |
| `cookie_policy` | `cookie-policy` | **`false`** | 2 | no — draft outline |

So `GET /legal/documents` returns **one** entry today. Build for the list, not for the single row.

---

## 4. Settings

**No settings gate this feature.** It is gated only by database state: `isActive`,
`requiresAcceptance`, and each version's `status`.

Three legacy settings are read as fallbacks or content sources:

| Key | Used for |
|---|---|
| `general.content.privacy_html` | **Deprecated.** A mirror of the current published privacy policy, overwritten on every publish. Use it only as the narrow 404 fallback in §7.3. |
| `general.content.about_html` | The About page. **About is marketing copy, not a legal document** — it is not in the legal API and never will be. |
| `general.site_info.copyright_message` | The brand footer caption under a document body. Render only when non-blank. |

Read them from `GET /settings/public`.

---

## 5. Errors to handle

| Where | Status | Message | What the UI should do |
|---|---|---|---|
| `GET /legal/documents/:kind` | 404 | `Document not found` | 404 page |
| `GET /legal/documents/:kind` | 404 | `This document has not been published yet` | **"Content unavailable"** empty state — this is the normal state of Terms and Cookies today |
| `GET /legal/documents/:kind/versions/:version` | 404 | `Version not found` | 404 page |
| `POST /legal/accept` | 400 | `errors.kinds = "Provide at least one of kinds or documentIds"` | a client bug — you sent an empty body |
| `POST /legal/accept` | 400 | `No matching legal documents to accept` | you sent only non-acceptance-requiring kinds; recompute from `pending` |
| `POST /legal/accept` | any | network / 5xx | **keep the dialog open**, show an inline error, let the user retry |
| any | 429 | `Too many requests. Please try again later.` | back off |

---

## 6. What happens to existing users

Worth knowing so the gate's behaviour isn't surprising:

- **Privacy policy** — every existing user got an implied acceptance written in bulk by an admin,
  recorded with `source: 'admin_backfill'`. They are **not** prompted. The policy already existed and
  was linked, so continued use is a defensible basis.
- **Terms of service** — **no backfill**. It has never been served to anyone, so an implied acceptance
  would be a fabricated record. **Every existing user is prompted exactly once**, for Terms only.
- **Cookie policy** — informational (`requiresAcceptance: false`). Nobody is ever prompted.

So once you ship the gate, expect a one-time Terms prompt across the existing userbase, and nothing
else — and only after an admin publishes the Terms document.

---

## 7. UX reference (from the mobile app)

Three surfaces render the same `contentHtml`. Copy the **behaviour**; render it as a website.

### 7.1 The document renderer — three branches, in this order

Never treat "empty" as "loading", and never treat "loading" as "empty":

1. **`isLoading`** → a skeleton **sized to fill the viewport**. The mobile constants: line height 16,
   fill the full viewport, min 8 / max 40 lines, widths cycled through
   `['100%','92%','96%','88%','100%','85%','94%','70%']`. A legal document is always longer than a
   screen; a short placeholder let the page footer sit under it and then jump when content arrived.
2. **`isEmpty`** (`html == null || html.trim() === ''`) → an empty state:
   *"Content unavailable" / "This document hasn't been published yet. Please try again later."*
3. Otherwise → the HTML.

Layout of a document page: `<h1>` title → effective date → HTML body → brand footer (logo +
`general.site_info.copyright_message`, rendered only when configured). **Withhold the footer while
loading** — anchoring it under a short skeleton made the logo jump.

`dir` follows the page locale; links inside `contentHtml` should open externally.

### 7.2 The settings / footer document list — **data first**

Build the list from `GET /legal/documents` so a newly published document appears with no release.

```ts
const documents = data ?? [];
// Only when there is genuinely nothing to show — never merely because a request
// is in flight or a refetch failed.
if (documents.length === 0) return [PRIVACY_FALLBACK_LINK];
```

> An earlier mobile version gated on `isLoading || isError` and collapsed a three-row list into one row
> whenever a background refetch failed. **Do not gate the list on loading or error state.**

Each row's label is `document.title`, falling back to a per-kind label from your own messages file.

### 7.3 The privacy page's 404-only fallback

For the **privacy policy only**, when `GET /legal/documents/privacy-policy` returns **HTTP 404 and
nothing else**, fall back to rendering `general.content.privacy_html`.

Scoping this to 404 is deliberate: a network failure must surface as the empty state, not silently
serve stale mirrored content. So you need the *status code*, not just "the request failed" — preserve
it through your error handling.

Terms and Cookies have **no** fallback. Their 404 renders the empty state.

### 7.4 Consent capture at registration

- A checkbox on one row with the consent sentence. **Never pre-ticked** — a pre-ticked box is void
  consent under every framework that has an opinion, which defeats the point of collecting it.
- The sentence is *"I agree to the "* followed by the document names, separated by `", "` (`"، "` in
  Arabic), each name a link that **opens the document without navigating away**. On mobile that is a
  modal; on the web use a `<Dialog>` or a new tab — **not** a route change, which discards a half-filled
  form.
- **Which documents are named:** every entry of `GET /legal/documents` where `requiresAcceptance ===
  true`. Fall back to **Privacy Policy alone** while loading, on error, or when the list is empty — a
  consent checkbox that names no documents is worse than one naming the document that has always
  existed.
- Structurally: the prefix text and each link are **siblings**, never nested. On mobile, nesting made
  "did they tap the link or the label?" ambiguous. On the web, keep the links out of the `<label>`'s
  activation area, or clicking a link also toggles the box.
- Tapping the prefix text toggles the checkbox; clicking a document name opens the document.
- Disable submit until it is ticked, **and** validate on the server side of your Server Action —
  a client-only check is not a control.
- **Under the OAuth buttons**, render the same sentence as a passive caption — prefix inert, links
  live, no checkbox. *"By continuing with Google or Apple you agree to the …"*. **No acceptance row is
  written from a caption**; those users are caught by the gate.

### 7.5 The re-acceptance gate

**When it fires** — all must hold:

- the user is signed in
- settings have loaded
- `GET /legal/pending` returned a **non-empty** list
- **no higher-priority blocker is showing.** On mobile that is the force-update gate; the legal gate is
  invoked immediately *after* it and yields to it. On the web, express the same precedence in whatever
  blocker stack you have — a maintenance or forced-refresh interstitial must beat this one.
- this exact `userId + sorted document ids` combination has not already been shown this session

Mark the combination as shown **only on an actual open**, so a deferred attempt retries on the next
dependency change. Reset the marker on sign-out, so a second account in the same session is evaluated
from scratch.

**What the user sees:**

- **Non-dismissable.** No Escape, no backdrop click, no close button, no route escape. In shadcn terms:
  no `<DialogClose>`, `onOpenChange` a no-op, `onInteractOutside` and `onEscapeKeyDown` prevented.
- **List view** — a title, a body line (*"We've updated our legal documents. Please review and accept
  them to continue using بسهولة."*), then one row per pending document showing
  `title ?? <per-kind label>` and, beneath it, `summary` if present, otherwise a primary-coloured
  *"Read the full document"* line. Chevron on the end.
- **Detail view** — clicking a row swaps **the same dialog's** content (back chevron + title +
  scrollable document body). **Do not open a second dialog** — nesting modals is how you end up with an
  unclosable stack.
- **Footer, visible in both views** — an optional inline error caption, then a full-width primary
  **"Accept & continue"** with a loading state, then a ghost **"Sign out instead"** (disabled while
  accepting).

**Accept:**

```ts
const result = await acceptLegalDocuments({ kinds: pending.map(p => p.kind) });
// Trust the server's refreshed list rather than assuming success cleared everything —
// a document published mid-flight would still be outstanding.
if (result.pending.length === 0) closeGate();
```

On failure the dialog **stays open** with an inline error. Do not close, do not toast-and-dismiss.

If the pending list empties underneath the user — accepted on another device, or the document was
unpublished — **auto-close the gate**.

**Decline → sign out.** Never trap a user with no exit. Route the sign-out through the site's normal
logout path rather than inlining it; the ordering matters and is easy to get wrong. The mobile
coordinator's fixed order, which the web equivalent should mirror:

1. **Revoke the server session first**, while credentials still exist — after clearing them every
   request goes out unauthenticated and 401s.
2. Clear the session cookie.
3. Reset query caches **after** step 2 — resetting first triggers refetches that still believe the user
   is authenticated and storm the 401 → refresh → logout path.
4. Redirect to sign-in.

**Not in middleware.** A middleware implementation would need a backend call on every navigation —
exactly the per-request cost the design rules out — and `src/middleware.ts` already does enough
(intl → token refresh → route guards). Mount a provider instead.

---

## 8. i18n keys

Add to **both** `src/messages/en.json` and `src/messages/ar.json`. Namespace suggestion: `legal`.

### Gate and document rendering

| Key | English | العربية |
|---|---|---|
| `legal.gate.title` | Updated legal terms | تحديث الشروط القانونية |
| `legal.gate.body` | We've updated our legal documents. Please review and accept them to continue using بسهولة. | قمنا بتحديث مستنداتنا القانونية. يرجى مراجعتها والموافقة عليها لمتابعة استخدام بسهولة. |
| `legal.gate.read_action` | Read the full document | قراءة المستند كاملاً |
| `legal.gate.accept_button` | Accept & continue | أوافق ومتابعة |
| `legal.gate.sign_out` | Sign out instead | تسجيل الخروج بدلاً من ذلك |
| `legal.gate.error` | We couldn't record your acceptance. Please try again. | تعذّر تسجيل موافقتك. يرجى المحاولة مرة أخرى. |
| `legal.document.empty_title` | Content unavailable | المحتوى غير متاح |
| `legal.document.empty_subtitle` | This document hasn't been published yet. Please try again later. | لم يتم نشر هذا المستند بعد. يرجى المحاولة لاحقاً. |
| `legal.document_kind.privacy_policy` | Privacy Policy | سياسة الخصوصية |
| `legal.document_kind.terms_of_service` | Terms of Service | شروط الخدمة |
| `legal.document_kind.cookie_policy` | Cookie Policy | سياسة ملفات تعريف الارتباط |
| `legal.list_separator` | `", "` | `"، "` |

### Registration consent

| Key | English | العربية |
|---|---|---|
| `auth.signup.legal.prefix` | I agree to the | أوافق على |
| `auth.legal.oauth_caption_prefix` | By continuing with Google or Apple you agree to the | بالمتابعة عبر Google أو Apple فإنك توافق على |
| `auth.errors.legal_required` | You must accept the legal documents to continue. | يجب الموافقة على المستندات القانونية للمتابعة. |

### Page titles and settings rows

| Key | English | العربية |
|---|---|---|
| `legal.pages.privacy.title` | Privacy Policy | سياسة الخصوصية |
| `legal.pages.terms.title` | Terms of Service | شروط الخدمة |
| `legal.pages.cookies.title` | Cookie Policy | سياسة ملفات تعريف الارتباط |
| `legal.pages.about.title` | About Bishola | عن بسهولة |
| `legal.settings.section` | Legal | الشروط والسياسات |

> **The brand name in Arabic-facing copy is بسهولة** (not بشولة). It appears in
> `legal.gate.body` above — keep it exactly as written.

---

## 9. Where this lands in `bishola-website`

### 9.1 Fix the dead consent links — do this first, it stands alone

`src/app/[locale]/auth/register/page.tsx` tells the user *"By creating an account, you agree to our
Terms of Service and Privacy Policy"* — and **both links are `href="#"`**. The site is claiming consent
to a document it does not serve. This is the single highest-value fix in this document and it depends
on nothing else here.

`src/components/web/Home/Footer.tsx` points **three** different links — privacy, terms, cookies — all
at `/Privacypolicy`. Point them at the real document routes once those exist.

### 9.2 Legal document pages — NEW route

`src/app/[locale]/(web)/legal/[kind]/page.tsx`

- A **server component**. (The current privacy page is a 1074-line `'use client'` file with an in-file
  `translations` dictionary — do not follow that pattern.)
- `export const revalidate = 3600;`
- `generateMetadata` from the document title — an indexable Terms page has real SEO value.
- Renders title, effective date, and `contentHtml`.
- Handles the two 404s per §5 and §7.1.

Add `/legal/privacy-policy` and `/legal/terms-of-service` to `src/constants/routes.constant.ts` as
public routes so `src/middleware.ts` does not gate them — they must be reachable **signed out**, since
the register page links to them.

### 9.3 Keep `/Privacypolicy` alive — this is load-bearing

**Do not delete `src/app/[locale]/(web)/Privacypolicy/page.tsx`.** Turn it into a thin server component
that reads `?tab=` and redirects:

| Query | Redirect to |
|---|---|
| `?tab=privacy` **or absent** | `/[locale]/legal/privacy-policy` |
| `?tab=terms` | `/[locale]/legal/terms-of-service` |
| `?tab=cookies` | `/[locale]/legal/cookie-policy` |
| `?tab=about` | keep rendering `general.content.about_html` — About is marketing copy, not a legal document |

That URL is load-bearing in three places: the footer links to it three times, it is the App Store
privacy-policy URL, and **the mobile app deep-links it from binaries already on users' phones**
(`Privacypolicy?tab=privacy`). Breaking it breaks installed apps. The default for the bare path and
`?tab=privacy` must stay privacy, forever.

The `?tab=terms` and `?tab=cookies` values are also accepted by the current mobile app, so any link you
emit with those values opens the right document in the app as well as on the site.

Use the next-intl `redirect` from `@/i18n/routing` — `localePrefix` is `'always'`.

### 9.4 Registration consent checkbox

- Use the existing shadcn `<Checkbox>` (`src/components/ui/checkbox.tsx`), `name="acceptedLegal"`.
- Add `acceptedLegal` to `RegisterFormSchema`
  (`src/core/entities/models/auth/register-form-schema.ts`) as
  `z.boolean().refine(v => v === true, { message: 'auth.errors.legal_required' })`.
- Add it to the `fields` object in `handleRegister` (`src/services/auth/auth.service.ts`):
  `acceptedLegal: data.get('acceptedLegal') === 'on'`.
- Build the document names from `GET /legal/documents` filtered on `requiresAcceptance`, with the
  Privacy-only fallback (§7.4).
- Put the same links, without a checkbox, under the OAuth buttons.

### 9.5 The re-acceptance gate

New `src/providers/legal-gate.provider.tsx`, mounted inside `GlobalProvider`
(`src/providers/global.provider.tsx`), beside `ProfileProvider`.

- On a signed-in cold boot, call `GET /legal/pending` once.
- Non-empty → the non-dismissable `<Dialog>` described in §7.5.
- Reuse `src/components/ui/dialog.tsx`; the list→detail swap is internal state, not a second dialog.
- Sign-out goes through the site's existing sign-out path — **a Server Action, never a `<Link>` to a
  GET route.** Next `<Link>` prefetch executes GET route handlers in production, which is how a
  signout GET route once deleted live sessions on hover.

### 9.6 Cookie consent

Nothing here is legally required *today*: the site sets only `session`, `__session_probe`,
`sidebar:state` and `NEXT_LOCALE` — all strictly-necessary or functional — and there are **zero
tracking scripts installed**. It becomes required the moment `google_analytics_id` /
`google_tag_manager_id` / `facebook_pixel_id` go live, or if meaningful EU/UK/Turkey traffic appears.

**Recommendation: build the plumbing now, ship the banner later.** Retrofitting consent onto a live GA
install is the painful path; a banner asking permission for something you don't do is pure friction.
Build all of this, keep the banner UI behind a flag defaulted off, and flip it the day the first
tracking script lands.

```
src/core/lib/web/cookie-consent.ts                cookie name/shape/read/write
src/providers/cookie-consent.provider.tsx         <CookieConsentProvider/> + useCookieConsent()
src/components/shared/CookieConsentBanner.tsx     clone SmartAppBanner.tsx's structure
src/components/shared/CookiePreferencesDialog.tsx shadcn Dialog + a Switch per category
```

Mount `<CookieConsentProvider>` in `src/providers/global.provider.tsx`, and `<CookieConsentBanner />`
in `src/app/[locale]/layout.tsx` beside `<SmartAppBanner />` — there is a commented-out
`<AppDownloadModalProvider />` there, a free slot.

Consent cookie — one **non-httpOnly** JSON cookie so both client JS and server components can read it:

```
name  : bishola_consent
value : base64url(JSON.stringify({
          v: 1, id: '<uuid-v4>', ts: 1780000000, pol: 3,
          cat: { necessary: 1, preferences: 0, analytics: 0, marketing: 0 }
        }))
opts  : { path: '/', sameSite: 'lax', secure: true, maxAge: 60*60*24*365 }
```

`pol` is the cookie-policy version the banner was showing. When a new cookie policy is published as a
material change, re-show the banner — that reuses the same versioning machinery for anonymous visitors.

Middleware is **not** involved: a banner click is a client event, so plain `document.cookie` works —
the same mechanism `src/components/ui/sidebar.tsx` already uses for `sidebar:state`.

**Google Consent Mode v2** — the reason to build this before the trackers exist:

1. A small inline `<script>` in `<head>`, **before any tag manager**, defaulting `ad_storage`,
   `ad_user_data`, `ad_personalization`, `analytics_storage` to `'denied'`; `functionality_storage` and
   `security_storage` to `'granted'`; `wait_for_update: 500`.
2. `useCookieConsent()` fires `gtag('consent', 'update', {...})` on accept / save.
3. The GA/GTM/Pixel `<Script strategy="afterInteractive">` tags mount only inside
   `{consent.analytics && …}` / `{consent.marketing && …}`. Their IDs are already typed but unused in
   `src/core/entities/models/settings/settings.dto.ts` and `src/utils/settings-metadata.utils.ts`.

There is a `POST /legal/consent/cookies` endpoint planned for a server-side consent ledger. It is
**not built yet** — the cookie itself is a sufficient record while only strictly-necessary cookies are
set. Ask the backend team when you need it.

### 9.7 Prerequisites and gotchas

| # | Thing | Where |
|---|---|---|
| 1 | Register page has dead `href="#"` links, no checkbox, and `acceptedLegal` in neither the schema nor `handleRegister` | `src/app/[locale]/auth/register/page.tsx`, `src/core/entities/models/auth/register-form-schema.ts`, `src/services/auth/auth.service.ts` |
| 2 | Footer points privacy/terms/cookies all at `/Privacypolicy` | `src/components/web/Home/Footer.tsx` |
| 3 | `<Toaster />` is not mounted in `auth/layout.tsx`, so a toast from the register page renders nowhere | `src/app/[locale]/auth/layout.tsx` |
| 4 | The gate needs the *HTTP status* to distinguish a 404 from a network failure — make sure your error path preserves it | `src/core/lib/api.ts` `toFailureResponse` already carries `status` |

---

## 10. Testing checklist

- `/ar/Privacypolicy` and `/en/Privacypolicy` still resolve (redirecting), and `?tab=about` still shows
  About.
- `?tab=terms` and `?tab=cookies` redirect to the right document routes.
- The register page's Terms and Privacy links open real documents, **signed out**, without discarding
  the half-filled form.
- Registering with the box ticked creates exactly one acceptance row per required document — ask the
  backend team to check the admin ledger at `/admin/legal/acceptances`.
- Registering without `acceptedLegal` still succeeds today (it will not, later).
- A signed-in session with an outstanding Terms version shows the blocking dialog on next load;
  accepting clears it permanently; **"Sign out instead" works and actually revokes the session**.
- The dialog cannot be dismissed with Escape, an outside click, or a close button.
- With `terms-of-service` still unpublished, `/legal/terms-of-service` renders the "Content
  unavailable" empty state — not a crash, not a 500.
- With the backend unreachable, the privacy page shows the empty state; it does **not** silently serve
  `general.content.privacy_html` (that fallback is 404-only).
- With no consent cookie, no analytics script is present in the DOM.

---

## 11. Questions

Anything ambiguous in the API, ask before working around it — the contract is easy to extend now and
expensive to change once you have shipped against it.
