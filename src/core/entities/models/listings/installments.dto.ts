// src/core/entities/models/listings/installments.dto.ts

export interface InstallmentNoteTranslations {
  en?: string | null;
  ar?: string | null;
}

/**
 * Single installment plan item as received from the API (read detail).
 * Money amounts arrive as decimal strings (e.g. "3000.00", "450.00").
 */
export interface ListingInstallmentPlan {
  months: number;
  downPayment: string; // decimal string
  monthlyAmount: string; // decimal string
  note: string | null; // already locale-resolved by server
  displayOrder: number;
  noteTranslations?: InstallmentNoteTranslations | null; // owner read only
}

/**
 * Single installment plan input payload for POST / PUT /my-listings.
 * Money amounts MUST be sent as numbers.
 */
export interface InstallmentPlanInputDto {
  months: number;
  downPayment: number;
  monthlyAmount: number;
  noteTranslations?: InstallmentNoteTranslations | null;
  displayOrder?: number;
}

/**
 * Installment mode: 'free' (any duration) or 'catalog' (only type's predefined options).
 */
export type InstallmentsMode = 'free' | 'catalog';
export type ListingInstallmentsMode = InstallmentsMode;

export interface ListingInstallmentOption {
  id: number;
  months: number;
  displayOrder: number;
}

// Client constants mirroring specifications
export const INSTALLMENTS_DEFAULT_MAX_PLANS_PER_LISTING = 6;
export const INSTALLMENTS_DEFAULT_MAX_MONTHS = 60;
export const INSTALLMENT_NOTE_MAX_LENGTH = 300;
export const INSTALLMENT_DURATION_PRESETS = [6, 12, 24, 36, 48, 60];
export const DOWN_PAYMENT_PERCENT_PRESETS = [0, 10, 25, 50];
export const SUMMARY_VISIBLE_PLANS = 3;

export const INSTALLMENT_MONTHS_HARD_CAP = 120;
export const INSTALLMENT_PLANS_HARD_CAP = 30;
