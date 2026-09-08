import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { COUNTRY_CODES } from './country-codes';

export const DEFAULT_DIAL_CODE = '+963';
export const DEFAULT_COUNTRY_ISO = 'SY';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_ARABIC_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/** Maps Arabic-Indic and Extended-Arabic-Indic numerals to ASCII digits. */
export function normalizeDigits(input: string): string {
  let out = '';
  for (const char of input) {
    const arabic = ARABIC_INDIC.indexOf(char);
    if (arabic >= 0) {
      out += String(arabic);
      continue;
    }
    const extended = EXTENDED_ARABIC_INDIC.indexOf(char);
    out += extended >= 0 ? String(extended) : char;
  }
  return out;
}

/**
 * Reduces free-typed input to digits plus at most one leading `+`. Handles the
 * Arabic keyboard, pasted spacing/dashes/parentheses, and the space-separated
 * "+963 912345678" wire format.
 */
export function sanitizePhoneInput(raw: string | null | undefined): string {
  if (!raw) return '';
  const ascii = normalizeDigits(raw).trim();
  const hasPlus = ascii.startsWith('+');
  return (hasPlus ? '+' : '') + ascii.replace(/\D/g, '');
}

export interface PhoneRepairResult {
  /** E.164 when `isValid`, else the best-effort assembly (never null once digits exist). */
  e164: string | null;
  /** ISO country of the resolved number — may differ from `dialCode`'s country. */
  country: string | null;
  /** Dial code the picker should show. Changes when the input named another country. */
  dialCode: string;
  /** Local (national) part the digits field should show. */
  localNumber: string;
  isValid: boolean;
  /** True when normalization changed the number — rewrite the field so the user sees it. */
  wasRepaired: boolean;
}

/**
 * Resolves what the user meant from a local number + the selected dial code.
 *
 * Tries candidates in order and takes the first that is genuinely valid. A prefix
 * is only stripped when doing so turns an INVALID number into a VALID one — never
 * because it merely looks like a dial code.
 */
export function repairPhone(
  rawLocalNumber: string | null | undefined,
  rawDialCode: string | null | undefined,
): PhoneRepairResult {
  const dialCode = rawDialCode || DEFAULT_DIAL_CODE;
  const sanitized = sanitizePhoneInput(rawLocalNumber);
  const digits = sanitized.replace(/\D/g, '');

  if (!digits) {
    return {
      e164: null,
      country: null,
      dialCode,
      localNumber: '',
      isValid: false,
      wasRepaired: false,
    };
  }

  const dialDigits = dialCode.replace(/\D/g, '');
  const asTyped = `${dialCode}${digits}`;

  const candidates: string[] = [
    asTyped,
    // The whole international number was typed into the digits box.
    ...(sanitized.startsWith('+') ? [`+${digits}`] : []),
    // "00" is the international access prefix in most of the region.
    ...(digits.startsWith('00') ? [`+${digits.slice(2)}`] : []),
    // Leading zero in domestic numbers (e.g. 09... in Syria and Arab countries)
    ...(digits.startsWith('0') ? [`${dialCode}${digits.replace(/^0+/, '')}`] : []),
    // The dial code was entered twice — the reported defect.
    ...(digits.startsWith(dialDigits) && digits.length > dialDigits.length
      ? [`${dialCode}${digits.slice(dialDigits.length)}`]
      : []),
  ];

  for (const candidate of candidates) {
    const parsed = parsePhoneNumberFromString(candidate);
    if (!parsed?.isValid()) continue;

    return {
      e164: parsed.number,
      country: parsed.country ?? null,
      dialCode: `+${parsed.countryCallingCode}`,
      localNumber: String(parsed.nationalNumber),
      isValid: true,
      wasRepaired: parsed.number !== asTyped,
    };
  }

  return {
    e164: asTyped,
    country: null,
    dialCode,
    localNumber: digits,
    isValid: false,
    wasRepaired: false,
  };
}

/** True when the local number is a real, dialable number for the given dial code. */
export function isValidPhone(
  localNumber: string | null | undefined,
  dialCode: string | null | undefined,
): boolean {
  return repairPhone(localNumber, dialCode).isValid;
}

/**
 * Merges dial code + local number into a single E.164 string, repairing what is
 * unambiguously repairable on the way. Returns null when the local number is empty.
 * An unrepairable number is still assembled (callers validate separately) so
 * nothing is silently dropped.
 */
export function assemblePhone(
  dialCode: string | undefined,
  number: string | null | undefined,
): string | null {
  if (!number || number.trim() === '') return null;
  return repairPhone(number, dialCode).e164;
}

/**
 * Inverse of `assemblePhone` — splits a stored number back into
 * `{ dialCode, localNumber }` so the picker + digits field can be populated.
 *
 * Prefers libphonenumber's parse (which also repairs a stored number written by an
 * older client) and falls back to longest-known-prefix matching so an unparseable
 * legacy value still lands in the right country box rather than dumping the dial
 * code into the digits field.
 */
export function splitPhone(
  full: string | null | undefined,
): { dialCode: string; localNumber: string } {
  if (!full) return { dialCode: DEFAULT_DIAL_CODE, localNumber: '' };

  const sanitized = sanitizePhoneInput(full);
  const parsed = sanitized.startsWith('+')
    ? parsePhoneNumberFromString(sanitized)
    : null;

  if (parsed?.isValid()) {
    return {
      dialCode: `+${parsed.countryCallingCode}`,
      localNumber: String(parsed.nationalNumber),
    };
  }

  const match = COUNTRY_CODES.map((c) => c.dial)
    .filter((dial) => sanitized.startsWith(dial))
    .sort((a, b) => b.length - a.length)[0];

  if (match) {
    return {
      dialCode: match,
      localNumber: sanitized.slice(match.length),
    };
  }

  return {
    dialCode: DEFAULT_DIAL_CODE,
    localNumber: sanitized.replace(/\D/g, ''),
  };
}
