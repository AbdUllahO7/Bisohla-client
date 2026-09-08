export type LegalDocumentKind =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'cookie_policy';

export type LegalVersionStatus = 'draft' | 'active' | 'archived';

export interface LegalDocumentListItemDto {
  documentId: number;
  kind: LegalDocumentKind;
  slug: string;
  requiresAcceptance: boolean;
  version: number;
  effectiveAt: string | null;
  publishedAt: string | null;
  title: string | null;
  summary: string | null;
}

export interface LegalDocumentDetailDto {
  documentId: number;
  kind: LegalDocumentKind;
  slug: string;
  requiresAcceptance: boolean;
  version: number;
  effectiveAt: string | null;
  publishedAt: string | null;
  title: string | null;
  contentHtml: string | null;
  summary: string | null;
}

export interface PendingLegalItemDto {
  documentId: number;
  kind: LegalDocumentKind;
  slug: string;
  versionId: number;
  version: number;
  majorVersion: number;
  effectiveAt: string | null;
  title: string | null;
  summary: string | null;
}

export interface PendingLegalResponseDto {
  pending: PendingLegalItemDto[];
}

export interface AcceptLegalPayloadDto {
  kinds?: LegalDocumentKind[];
  documentIds?: number[];
}

export interface UserAcceptanceDto {
  id: number;
  userId: number;
  documentId: number;
  versionId: number;
  acceptedMajorVersion: number;
  acceptedAt: string;
  source:
    | 'registration'
    | 'oauth_registration'
    | 'reacceptance_gate'
    | 'profile_screen'
    | 'admin_backfill'
    | 'seed_import';
  platform: 'web' | 'mobile' | 'admin' | 'api';
  locale: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  createdAt: string;
}
