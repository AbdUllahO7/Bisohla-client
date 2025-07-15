'use client';

import { Locale, routing, usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';
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
    // send request to change user locale in back end, but even if failed nothign happen
    if (session.user) {
      updateUserLocale.mutate({ id: session.user.id, locale: nextLocale });
    }

    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params },
      { locale: nextLocale as Locale },
    );
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
