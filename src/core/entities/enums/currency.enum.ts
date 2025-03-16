// src/enums/currency.ts

/**
 * Represents supported currency codes
 */
export enum Currency {
  SYP = 'SYP', // Syrian Pound
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  JPY = 'JPY', // Japanese Yen
  CAD = 'CAD', // Canadian Dollar
  AUD = 'AUD', // Australian Dollar
  CNY = 'CNY', // Chinese Yuan
  NZD = 'NZD', // New Zealand Dollar
  MXN = 'MXN', // Mexican Peso
  BRL = 'BRL', // Brazilian Real
  TRY = 'TRY', // Turkish Lira
  RUB = 'RUB', // Russian Ruble
  PLN = 'PLN', // Polish Złoty
  SEK = 'SEK', // Swedish Krona
  NOK = 'NOK', // Norwegian Krone
  DKK = 'DKK', // Danish Krone
  CHF = 'CHF', // Swiss Franc
  HKD = 'HKD', // Hong Kong Dollar
  SGD = 'SGD', // Singapore Dollar
  MYR = 'MYR', // Malaysian Ringgit
  PHP = 'PHP', // Philippine Peso
  THB = 'THB', // Thai Baht
  ZAR = 'ZAR', // South African Rand
  BGN = 'BGN', // Bulgarian Lev
  CZK = 'CZK', // Czech Koruna
  ILS = 'ILS', // Israeli New Shekel
  KRW = 'KRW', // South Korean Won
  HUF = 'HUF', // Hungarian Forint
  ISK = 'ISK', // Icelandic Króna
  LTL = 'LTL', // Lithuanian Litas
  LVL = 'LVL', // Latvian Lats
  RON = 'RON', // Romanian Leu
  RSD = 'RSD', // Serbian Dinar
  SKK = 'SKK', // Slovak Koruna
  EEK = 'EEK', // Estonian Kroon
  SIT = 'SIT', // Slovenian Tolar
  UAH = 'UAH', // Ukrainian Hryvnia
}

/**
 * Currency information with symbol and name
 */
export const CURRENCY_INFO: Record<Currency, { symbol: string; name: string }> =
  {
    [Currency.SYP]: { symbol: '£', name: 'Syrian Pound' },
    [Currency.USD]: { symbol: '$', name: 'US Dollar' },
    [Currency.EUR]: { symbol: '€', name: 'Euro' },
    [Currency.GBP]: { symbol: '£', name: 'British Pound' },
    [Currency.JPY]: { symbol: '¥', name: 'Japanese Yen' },
    [Currency.CAD]: { symbol: 'C$', name: 'Canadian Dollar' },
    [Currency.AUD]: { symbol: 'A$', name: 'Australian Dollar' },
    [Currency.CNY]: { symbol: '¥', name: 'Chinese Yuan' },
    [Currency.NZD]: { symbol: 'NZ$', name: 'New Zealand Dollar' },
    [Currency.MXN]: { symbol: '$', name: 'Mexican Peso' },
    [Currency.BRL]: { symbol: 'R$', name: 'Brazilian Real' },
    [Currency.TRY]: { symbol: '₺', name: 'Turkish Lira' },
    [Currency.RUB]: { symbol: '₽', name: 'Russian Ruble' },
    [Currency.PLN]: { symbol: 'zł', name: 'Polish Złoty' },
    [Currency.SEK]: { symbol: 'kr', name: 'Swedish Krona' },
    [Currency.NOK]: { symbol: 'kr', name: 'Norwegian Krone' },
    [Currency.DKK]: { symbol: 'kr', name: 'Danish Krone' },
    [Currency.CHF]: { symbol: 'Fr', name: 'Swiss Franc' },
    [Currency.HKD]: { symbol: 'HK$', name: 'Hong Kong Dollar' },
    [Currency.SGD]: { symbol: 'S$', name: 'Singapore Dollar' },
    [Currency.MYR]: { symbol: 'RM', name: 'Malaysian Ringgit' },
    [Currency.PHP]: { symbol: '₱', name: 'Philippine Peso' },
    [Currency.THB]: { symbol: '฿', name: 'Thai Baht' },
    [Currency.ZAR]: { symbol: 'R', name: 'South African Rand' },
    [Currency.BGN]: { symbol: 'лв', name: 'Bulgarian Lev' },
    [Currency.CZK]: { symbol: 'Kč', name: 'Czech Koruna' },
    [Currency.ILS]: { symbol: '₪', name: 'Israeli New Shekel' },
    [Currency.KRW]: { symbol: '₩', name: 'South Korean Won' },
    [Currency.HUF]: { symbol: 'Ft', name: 'Hungarian Forint' },
    [Currency.ISK]: { symbol: 'kr', name: 'Icelandic Króna' },
    [Currency.LTL]: { symbol: 'Lt', name: 'Lithuanian Litas' },
    [Currency.LVL]: { symbol: 'Ls', name: 'Latvian Lats' },
    [Currency.RON]: { symbol: 'lei', name: 'Romanian Leu' },
    [Currency.RSD]: { symbol: 'дин', name: 'Serbian Dinar' },
    [Currency.SKK]: { symbol: 'Sk', name: 'Slovak Koruna' },
    [Currency.EEK]: { symbol: 'kr', name: 'Estonian Kroon' },
    [Currency.SIT]: { symbol: 'SIT', name: 'Slovenian Tolar' },
    [Currency.UAH]: { symbol: '₴', name: 'Ukrainian Hryvnia' },
  };

/**
 * Get currency options for select components
 */
export const getCurrencyOptions = () => {
  return Object.values(Currency).map((code) => ({
    value: code,
    label: `${code} (${CURRENCY_INFO[code].symbol}) - ${CURRENCY_INFO[code].name}`,
  }));
};

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
