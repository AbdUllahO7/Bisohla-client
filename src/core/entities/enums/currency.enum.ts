// src/enums/currency.ts

/**
 * Represents supported currency codes
 */
export enum Currency {
  SYP = 'SYP', // Syrian Pound
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
}

/**
 * Currency information with symbol and name
 */
export const CURRENCY_INFO: Record<Currency, { symbol: string; name: string }> =
  {
    [Currency.SYP]: { symbol: '£', name: 'Syrian Pound' },
    [Currency.USD]: { symbol: '$', name: 'US Dollar' },
    [Currency.EUR]: { symbol: '€', name: 'Euro' },
  };

/**
 * Get currency options for select components
 */
// In the currency.enum.ts file, update the getCurrencyOptions function:

export const getCurrencyOptions = (t?: any) => {
  return Object.values(Currency).map((code) => {
    // If translation function is provided, try to get the translation
    // Using the correct path based on your translation structure
    let name = CURRENCY_INFO[code].name;
    
    if (t) {
      try {
        // First try to get from the currency path
        name = t(`currency.${code.toLowerCase()}`);
      } catch (error) {
        // Fallback to the price options path for backwards compatibility
        try {
          name = t(`price.options.${code.toLowerCase()}`);
        } catch (err) {
          // If translation is not found, use the default name
          name = CURRENCY_INFO[code].name;
        }
      }
    }
    
    return {
      value: code,
      label: `${code} (${CURRENCY_INFO[code].symbol}) - ${name}`,
    };
  });
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
