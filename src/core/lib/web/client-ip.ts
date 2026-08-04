import { headers } from 'next/headers';

/** Header the backend reads to learn which visitor a server call is for. */
export const CLIENT_IP_HEADER = 'x-client-ip';

/**
 * The visitor's IP, to forward on server-side API calls.
 *
 * Every call in `api.ts` is server-side, so the backend otherwise sees this
 * machine's address for every user. Against the rate limiter that never mattered
 * (400 req/min is generous and the site is nowhere near it), but the
 * contact-reveal quota is 20 per DAY — shared, the whole site would exhaust it
 * on the 21st person who taps Call.
 *
 * The backend honours this header ONLY from an IP listed in
 * `security_settings.rate_limiting.trusted_ips`, so a visitor cannot send it to
 * become someone else.
 *
 * Returns `null` outside a request scope (build-time / static generation), where
 * `headers()` throws and there is no visitor to speak for.
 */
export async function getVisitorIp(): Promise<string | null> {
  try {
    const h = await headers();
    // nginx-proxy overwrites x-real-ip with the true peer; the leftmost
    // x-forwarded-for entry is client-supplied, so it is only a last resort.
    const realIp = h.get('x-real-ip')?.trim();
    if (realIp) return realIp;

    const forwarded = h.get('x-forwarded-for');
    const first = forwarded?.split(',')[0]?.trim();
    return first || null;
  } catch {
    return null;
  }
}
