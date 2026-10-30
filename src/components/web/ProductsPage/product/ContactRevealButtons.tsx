'use client';

import { useState } from 'react';
import { MessageCircle, PhoneCall, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRevealContact } from '@/core/infrastructure-adapters/use-actions/visitors/reveal-contact.use-actions';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/providers/settings.provider';

/**
 * Call + WhatsApp buttons that fetch the seller's number on click.
 *
 * Why this exists: a competitor was scraping the site. The backend can now hide
 * `contactNumber` from listing responses and hand it out only through a
 * quota-limited endpoint, which makes a copied listing worthless. That also
 * means the number must NOT appear anywhere in the server-rendered HTML — so
 * these are `<button>`s, never `<Link href="tel:…">`, and the label is a
 * translated word rather than the digits.
 *
 * Works unchanged whether or not protection is enabled: when the number is
 * already on the listing it is used directly and no request is made.
 */

/**
 * Revealed numbers, kept per listing id for the page's lifetime.
 *
 * `ProductDetailSwitcher` renders the desktop client on SSR and swaps to the
 * mobile one, so this component can mount more than once for the same listing.
 * Without this, a remount after a reveal would spend a second reveal from the
 * visitor's daily allowance. Same module-level-cache precedent as
 * `globalTrackingState` in `use-product-statistics.tsx`.
 */
const revealedNumbers = new Map<number, string>();

interface ContactRevealButtonsProps {
  /** NUMERIC listing id — the route also accepts a slug, which won't work here. */
  listingId?: number;
  /** Present when protection is off, or the seller's number is already public. */
  contactNumber?: string | null;
  /** Deprecated: whether a number exists at all. Kept for backwards compatibility. */
  contactAvailable?: boolean;
  productName?: string;
  /** Fired only on a SUCCESSFUL reveal, so failures don't inflate contact stats. */
  onContactClick?: () => void;
  /** Both layouts render the same logic with different classes. */
  variant: 'mobile' | 'desktop';
  /** Whether the current visitor is authenticated. */
  isAuthenticated?: boolean;
  /** Whether the listing is sold. */
  isSold?: boolean;
}

const formatPhoneForWhatsApp = (phone: string) => phone.replace(/\D/g, '');

export default function ContactRevealButtons({
  listingId,
  contactNumber,
  contactAvailable,
  productName = '',
  onContactClick,
  variant,
  isAuthenticated = false,
  isSold = false,
}: ContactRevealButtonsProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const { toast } = useToast();
  const { isContactRevealSignInRequired } = useSettings();
  const revealContact = useRevealContact();
  const [revealed, setRevealed] = useState<string | null>(
    listingId != null ? (revealedNumbers.get(listingId) ?? null) : null,
  );

  const effectiveNumber = contactNumber || revealed;
  // Buttons are enabled on any listing that is not sold
  const canContact = !isSold && listingId != null;
  const isBusy = revealContact.isPending;

  const handleSignInRedirect = () => {
    const currentPath =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '';
    const signInUrl = `/auth/sign-in${
      currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ''
    }`;

    toast({
      title: t('signInToContactTitle', { defaultValue: 'Sign in to contact' }),
      description: t('signInToContactDescription', {
        defaultValue: 'You need an account to contact sellers',
      }),
      action: (
        <button
          onClick={() => {
            router.push(signInUrl);
          }}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium"
        >
          {t('signIn', { defaultValue: 'Sign In' })}
        </button>
      ),
    });

    setTimeout(() => {
      router.push(signInUrl);
    }, 1200);
  };

  /** Returns the number to act on, fetching it first if it is hidden. */
  const resolveNumber = async (): Promise<string | null> => {
    if (effectiveNumber) return effectiveNumber;
    if (listingId == null) return null;

    // Check require_sign_in setting before calling reveal
    if (isContactRevealSignInRequired() && !isAuthenticated) {
      handleSignInRedirect();
      return null;
    }

    try {
      const res = await revealContact.mutateAsync({ listingId });
      const number = res.data?.contactNumber || null;
      if (number) {
        revealedNumbers.set(listingId, number);
        setRevealed(number);
      }
      return number;
    } catch (err: any) {
      // 401 CONTACT_REVEAL_SIGN_IN_REQUIRED → go to sign-in (§3.2)
      if (
        err?.status === 401 ||
        err?.code === 'CONTACT_REVEAL_SIGN_IN_REQUIRED'
      ) {
        handleSignInRedirect();
        return null;
      }

      toast({
        title: t('contactUnavailable'),
        description: t('contactUnavailableHint'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleCall = async () => {
    const number = await resolveNumber();
    if (!number) return;
    onContactClick?.();
    window.location.href = `tel:${number}`;
  };

  const handleWhatsApp = async () => {
    const number = await resolveNumber();
    if (!number) return;
    onContactClick?.();
    const message = encodeURIComponent(
      `Hi, I'm interested in your ${productName} listing.`,
    );
    const formatted = formatPhoneForWhatsApp(number);
    window.open(
      `https://wa.me/${formatted}?text=${message}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const isMobile = variant === 'mobile';

  const callClasses = isMobile
    ? 'relative flex w-full items-center justify-center font-bold gap-2 text-base px-4 py-1 border-2 border-[#198341] text-[#198341] rounded-lg hover:bg-[#198341] hover:text-white transition-all duration-300 min-h-[48px] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed'
    : 'relative flex items-center justify-center font-bold gap-1 text-sm px-3 py-2 sm:px-4 sm:py-1.5 border-2 border-[#198341] text-[#198341] rounded-md hover:bg-[#198341] hover:text-white transition-all duration-300 min-w-[80px] sm:min-w-0 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed';

  const whatsappClasses = isMobile
    ? 'relative flex w-full items-center justify-center gap-2 px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 min-h-[48px] font-bold text-base overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed'
    : 'relative flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-1.5 bg-gradient-to-r from-[#198341] to-[#198341] text-white hover:from-[#2C3C39] hover:to-[#198341] rounded-md transition-all duration-300 min-w-[120px] sm:min-w-0 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed';

  const iconSize = isMobile ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <>
      <div className={isMobile ? 'flex-1 relative group' : 'relative group'}>
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] ${
            isMobile ? 'rounded-lg' : 'rounded-md'
          } opacity-0 group-hover:opacity-30 blur transition-opacity duration-300`}
        ></div>
        <button
          type="button"
          onClick={handleCall}
          disabled={!canContact || isBusy}
          aria-label={t('call')}
          className={callClasses}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {isBusy ? (
            <Loader2 className={`${iconSize} relative z-10 animate-spin`} />
          ) : (
            <PhoneCall className={`${iconSize} relative z-10`} />
          )}
          {/* The digits are deliberately NOT the label — that would put a
              scrapable phone number straight back into the rendered HTML. */}
          <span className="relative z-10">{t('call')}</span>
        </button>
      </div>

      <div className={isMobile ? 'flex-1 relative group' : 'relative group'}>
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r ${
            isMobile
              ? 'from-green-500 to-green-600 rounded-lg group-hover:opacity-50'
              : 'from-[#198341] to-[#ABDE3B] rounded-md group-hover:opacity-50'
          } opacity-0 blur transition-opacity duration-300`}
        ></div>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={!canContact || isBusy}
          aria-label={t('whatsapp')}
          className={whatsappClasses}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {isBusy ? (
            <Loader2 className={`${iconSize} relative z-10 animate-spin`} />
          ) : (
            <MessageCircle className={`${iconSize} relative z-10`} />
          )}
          <span className="font-bold text-sm relative z-10">{t('whatsapp')}</span>
        </button>
      </div>
    </>
  );
}
