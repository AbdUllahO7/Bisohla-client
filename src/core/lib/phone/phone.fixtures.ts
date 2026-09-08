export interface RepairPhoneFixture {
  localNumber: string;
  dialCode: string;
  expectedE164: string | null;
  description: string;
}

export interface SplitPhoneFixture {
  stored: string;
  expectedDialCode: string;
  expectedLocalNumber: string;
  description: string;
}

export const REPAIR_PHONE_FIXTURES: RepairPhoneFixture[] = [
  { localNumber: '963955555555', dialCode: '+963', expectedE164: '+963955555555', description: 'duplicated dial code' },
  { localNumber: '955555555', dialCode: '+963', expectedE164: '+963955555555', description: 'already correct' },
  { localNumber: '0955555555', dialCode: '+963', expectedE164: '+963955555555', description: 'national trunk zero' },
  { localNumber: '00963955555555', dialCode: '+963', expectedE164: '+963955555555', description: 'international 00 prefix' },
  { localNumber: '+963955555555', dialCode: '+963', expectedE164: '+963955555555', description: 'full E.164 pasted into the digits box' },
  { localNumber: '+966501234567', dialCode: '+963', expectedE164: '+966501234567', description: 'another country pasted' },
  { localNumber: '955 555 555', dialCode: '+963', expectedE164: '+963955555555', description: 'spaces' },
  { localNumber: '955-555-555', dialCode: '+963', expectedE164: '+963955555555', description: 'dashes' },
  { localNumber: '(955) 555-555', dialCode: '+963', expectedE164: '+963955555555', description: 'parentheses' },
  { localNumber: '٩٥٥٥٥٥٥٥٥', dialCode: '+963', expectedE164: '+963955555555', description: 'Arabic-Indic numerals' },
  { localNumber: '۹۵۵۵۵۵۵۵۵', dialCode: '+963', expectedE164: '+963955555555', description: 'Extended-Arabic-Indic numerals' },
  { localNumber: ' 912345678', dialCode: '+963', expectedE164: null, description: 'the 91 prefix is unassigned in Syria' },
  { localNumber: '963955555', dialCode: '+963', expectedE164: '+963963955555', description: 'THE GUARD - legitimate number beginning with dial-code digits' },
  { localNumber: '111234567', dialCode: '+963', expectedE164: '+963111234567', description: 'Damascus landline' },
  { localNumber: '501234567', dialCode: '+966', expectedE164: '+966501234567', description: 'Saudi Arabia' },
  { localNumber: '501234567', dialCode: '+971', expectedE164: '+971501234567', description: 'United Arab Emirates' },
  { localNumber: '5389370863', dialCode: '+90', expectedE164: '+905389370863', description: 'Turkey' },
  { localNumber: '966501234567', dialCode: '+966', expectedE164: '+966501234567', description: 'duplicated dial code, Saudi Arabia' },
  { localNumber: '12345', dialCode: '+963', expectedE164: null, description: 'too short' },
  { localNumber: '95555555555555', dialCode: '+963', expectedE164: null, description: 'too long' },
  { localNumber: 'abc', dialCode: '+963', expectedE164: null, description: 'no digits at all' },
  { localNumber: '', dialCode: '+963', expectedE164: null, description: 'empty' },
];

export const SPLIT_PHONE_FIXTURES: SplitPhoneFixture[] = [
  { stored: '+963955555555', expectedDialCode: '+963', expectedLocalNumber: '955555555', description: 'canonical E.164' },
  { stored: '+963 912345678', expectedDialCode: '+963', expectedLocalNumber: '912345678', description: 'website space-separated legacy wire format' },
  { stored: '+963963955555555', expectedDialCode: '+963', expectedLocalNumber: '963955555555', description: 'corrupt stored value shown as-is' },
  { stored: '+966501234567', expectedDialCode: '+966', expectedLocalNumber: '501234567', description: 'Saudi Arabia' },
  { stored: '', expectedDialCode: '+963', expectedLocalNumber: '', description: 'empty falls back to default country' },
];
