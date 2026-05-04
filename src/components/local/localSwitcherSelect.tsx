'use client';

import { Locale, routing, usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { ReactNode, startTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useUpdateLocale } from '@/core/infrastructure-adapters/use-actions/users/locale.use-actions';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, label }: Props) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();
  const session = useSession();

  const updateUserLocale = useUpdateLocale();

  function onSelectChange(nextLocale: string) {
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    // Non-blocking locale switch using startTransition so the UI stays responsive
    startTransition(() => {
      router.replace(
        `${pathname}${searchParams}`,
        { locale: nextLocale as Locale },
      );
    });

    // Update backend locale preference if logged in
    if (session.user && session.user.id > 0) {
      updateUserLocale.mutate({ id: session.user.id, locale: nextLocale });
    }
  }


  return (
    <Select defaultValue={defaultValue} onValueChange={onSelectChange}>
      <SelectTrigger
        className="w-[80px] h-8  border-none bg-transparent focus:ring-0 focus:ring-offset-0"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="absolute top-0  z-[150]">
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
