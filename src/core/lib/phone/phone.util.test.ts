import { repairPhone, splitPhone } from './phone.util';
import { REPAIR_PHONE_FIXTURES, SPLIT_PHONE_FIXTURES } from './phone.fixtures';

export function runPhoneTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const fixture of REPAIR_PHONE_FIXTURES) {
    const result = repairPhone(fixture.localNumber, fixture.dialCode);
    const actual = result.isValid ? result.e164 : null;

    if (actual === fixture.expectedE164) {
      passed++;
    } else {
      failed++;
      errors.push(
        `[repairPhone] Failed on: "${fixture.description}". Input: (${fixture.dialCode}) "${fixture.localNumber}". Expected: ${fixture.expectedE164}, Got: ${actual}`,
      );
    }
  }

  for (const fixture of SPLIT_PHONE_FIXTURES) {
    const result = splitPhone(fixture.stored);

    if (
      result.dialCode === fixture.expectedDialCode &&
      result.localNumber === fixture.expectedLocalNumber
    ) {
      passed++;
    } else {
      failed++;
      errors.push(
        `[splitPhone] Failed on: "${fixture.description}". Input: "${fixture.stored}". Expected: { dialCode: ${fixture.expectedDialCode}, localNumber: ${fixture.expectedLocalNumber} }, Got: { dialCode: ${result.dialCode}, localNumber: ${result.localNumber} }`,
      );
    }
  }

  console.log(`Phone validation & repair tests: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    console.error('Errors:', errors);
    process.exit(1);
  }
  return { passed, failed, errors };
}

if (typeof require !== 'undefined' && require.main === module) {
  runPhoneTests();
}

