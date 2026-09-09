/**
 * Fallbacks mirroring the backend defaults in
 * `bishola-nest-server/src/settings/config/listings-settings.config.ts`
 * (`listings_settings.reference_proposals`). Used when a cached
 * `/settings/public` payload predates the group.
 */
export const REFERENCE_PROPOSAL_DEFAULT_ENABLED = true;
export const REFERENCE_PROPOSAL_DEFAULT_MAX_PER_LISTING = 5;
export const REFERENCE_PROPOSAL_DEFAULT_ALLOW_CHAINED = true;
export const REFERENCE_PROPOSAL_DEFAULT_MIN_NAME_LENGTH = 2;
export const REFERENCE_PROPOSAL_DEFAULT_MAX_NAME_LENGTH = 120;
