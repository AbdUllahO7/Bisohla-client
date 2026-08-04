import { headers } from 'next/headers';

/**
 * The forwarding chain of the incoming page request, to pass through on
 * server-side API calls.
 *
 * This app is a proxy hop like any other: every call in `api.ts` is server-side,
 * so without forwarding this the backend sees THIS machine for every user. It
 * never mattered against the rate limiter (400 req/min is generous and the site
 * is nowhere near it), but the contact-reveal quota is 20 per DAY — shared, the
 * whole site would exhaust it on the 21st person who taps Call.
 *
 * The backend walks this chain from the right and discards its own hops, so a
 * value forged by a visitor can never win: nginx appends its view of the source
 * after whatever we send. Nothing needs configuring on either side.
 *
 * Returns `null` outside a request scope (build time / static generation).
 */
export async function getForwardedFor(): Promise<string | null> {
  try {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for')?.trim();
    if (forwarded) return forwarded;
    // Some proxies set only X-Real-IP; it starts a chain just as well.
    return h.get('x-real-ip')?.trim() || null;
  } catch {
    return null;
  }
}
