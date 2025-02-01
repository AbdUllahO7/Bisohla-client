import { createContainer } from '@evyweb/ioctopus';

import { createAuthModule } from './modules/auth.module';
import { DI_RETURN_TYPES, DI_SYMBOLS } from './types';

const AppContainer = createContainer();

AppContainer.load(Symbol('AuthModule'), createAuthModule());

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return AppContainer.get(DI_SYMBOLS[symbol]);
}
