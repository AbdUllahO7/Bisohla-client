import type { AdInformationStorageData } from '../../StepFour/storageUtils';
import type { WizardListingType, WizardMode } from './listing-wizard.types';

type Listener = () => void;

/**
 * Module-level bridge between the wizard context and the common-fields step
 * (`AddProductStepFour`), whose load/save helpers are plain functions rather than
 * hooks. The wizard provider owns it: it seeds it on hydrate/draft-restore and
 * subscribes to write the step's edits back into wizard state.
 */
let data: AdInformationStorageData | null = null;
let policy: WizardListingType | null = null;
let mode: WizardMode = 'create';
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const l of listeners) l();
};

export const commonFieldsStore = {
  get: (): AdInformationStorageData | null => data,
  has: (): boolean => data != null,
  set: (next: AdInformationStorageData): void => {
    data = next;
    emit();
  },
  getPolicy: (): WizardListingType | null => policy,
  setPolicy: (next: WizardListingType | null): void => {
    policy = next;
    emit();
  },
  getMode: (): WizardMode => mode,
  setMode: (next: WizardMode): void => {
    mode = next;
  },
  reset: (): void => {
    data = null;
    policy = null;
    emit();
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
