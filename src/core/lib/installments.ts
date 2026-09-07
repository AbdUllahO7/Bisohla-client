// src/core/lib/installments.ts
import { ListingInstallmentPlan, InstallmentPlanInputDto } from '../entities/models/listings/installments.dto';

/**
 * Rounds a floating point money amount to 2 decimal places to avoid IEEE-754 precision issues.
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Formats a numeric or decimal string value into a clean human readable string with thousand separators.
 * Example: 12000 -> "12,000", 450.5 -> "450.50"
 */
export function formatMoney(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
  });
}

/**
 * Auto-computes standard monthly amount without markup: (price - downPayment) / months.
 */
export function computeMonthlyAmount(
  price: number,
  downPayment: number,
  months: number,
): number {
  if (!months || months <= 0) return 0;
  const principal = Math.max(0, price - downPayment);
  return roundToCents(principal / months);
}

/**
 * Computes the derived total installment sum: downPayment + (monthlyAmount * months).
 */
export function computeTotalInstallment(
  downPayment: number,
  monthlyAmount: number,
  months: number,
): number {
  return roundToCents(downPayment + (monthlyAmount * months));
}

/**
 * Extracts the minimum monthly amount across all plans.
 */
export function computeMinMonthlyInstallment(
  plans: Array<ListingInstallmentPlan | InstallmentPlanInputDto> | null | undefined,
): number | null {
  if (!plans || plans.length === 0) return null;
  const amounts = plans
    .map((p) =>
      typeof p.monthlyAmount === 'string'
        ? parseFloat(p.monthlyAmount)
        : p.monthlyAmount,
    )
    .filter((a) => !isNaN(a) && a > 0);
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

/**
 * Validates plan months/duration per §6 rules.
 */
export function validatePlanMonths(
  months: number | null | undefined,
  maxMonths: number,
  catalogMonths?: number[] | null,
  existingMonths?: number[],
): string | null {
  if (months === null || months === undefined || isNaN(months) || months < 1) {
    return 'errors.months_required';
  }
  if (!Number.isInteger(months)) {
    return 'errors.months_required';
  }
  if (months > maxMonths) {
    return 'errors.months_max';
  }
  if (catalogMonths && catalogMonths.length > 0 && !catalogMonths.includes(months)) {
    return 'errors.months_not_in_catalog';
  }
  if (existingMonths && existingMonths.includes(months)) {
    return 'errors.months_duplicate';
  }
  return null;
}

/**
 * Validates down payment per §6 rules.
 */
export function validatePlanDownPayment(
  downPayment: number | null | undefined,
  price?: number | null,
): string | null {
  if (downPayment === null || downPayment === undefined || isNaN(downPayment)) {
    return 'errors.down_payment_required';
  }
  if (downPayment < 0) {
    return 'errors.down_payment_negative';
  }
  if (price && price > 0 && downPayment >= price) {
    return 'errors.down_payment_too_high';
  }
  return null;
}

/**
 * Validates monthly amount per §6 rules.
 */
export function validatePlanMonthlyAmount(
  monthlyAmount: number | null | undefined,
): string | null {
  if (monthlyAmount === null || monthlyAmount === undefined || isNaN(monthlyAmount)) {
    return 'errors.monthly_amount_required';
  }
  if (monthlyAmount <= 0) {
    return 'errors.monthly_amount_positive';
  }
  return null;
}
