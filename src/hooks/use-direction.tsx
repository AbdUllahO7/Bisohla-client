import { useLocale } from 'next-intl';

export const useDirection = () => {
  const locale = useLocale();

  return locale === 'ar' ? 'rtl' : 'ltr';
};
