import { isValidPhone } from './phone.util';

/**
 * Empty is treated as valid here — required-ness is the caller's own rule, so a
 * blank optional phone does not report "invalid".
 */
export const isPhoneFieldValid = (
  localNumber: string | null | undefined,
  dialCode: string | null | undefined,
): boolean => {
  if (!localNumber || localNumber.trim() === '') return true;
  return isValidPhone(localNumber, dialCode);
};
