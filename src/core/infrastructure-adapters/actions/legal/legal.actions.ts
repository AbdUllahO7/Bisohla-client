'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import {
  AcceptLegalPayloadDto,
  LegalDocumentDetailDto,
  LegalDocumentListItemDto,
  PendingLegalResponseDto,
  UserAcceptanceDto,
} from '@/core/entities/models/legal/legal.dto';
import { getAuthReq, getReq, postAuthReq } from '@/core/lib/api';

/**
 * Fetch all published active legal documents (without bodies).
 * Used for footers, settings lists, and registration checkboxes.
 */
export const getLegalDocuments = async (): Promise<
  ApiResponse<LegalDocumentListItemDto[]>
> => {
  return getReq({
    url: '/legal/documents',
  });
};

/**
 * Fetch the active published version of a legal document by kind or slug.
 */
export const getLegalDocumentByKind = async (
  kind: string,
): Promise<ApiResponse<LegalDocumentDetailDto>> => {
  return getReq({
    url: `/legal/documents/${kind}`,
  });
};

/**
 * Fetch a specific historical version of a legal document by kind/slug and version integer.
 */
export const getLegalDocumentVersion = async (
  kind: string,
  version: number,
): Promise<ApiResponse<LegalDocumentDetailDto>> => {
  return getReq({
    url: `/legal/documents/${kind}/versions/${version}`,
  });
};

/**
 * Fetch any pending legal documents requiring acceptance for the signed-in user.
 */
export const getPendingLegalDocuments = async (): Promise<
  ApiResponse<PendingLegalResponseDto>
> => {
  return getAuthReq({
    url: '/legal/pending',
  });
};

/**
 * Submit acceptance for pending legal documents.
 * Returns the refreshed pending list.
 */
export const acceptLegalDocuments = async (
  payload: AcceptLegalPayloadDto,
): Promise<ApiResponse<PendingLegalResponseDto>> => {
  return postAuthReq({
    url: '/legal/accept',
    body: payload,
  });
};

/**
 * Fetch consent history for the signed-in user.
 */
export const getMyAcceptances = async (): Promise<
  ApiResponse<UserAcceptanceDto[]>
> => {
  return getAuthReq({
    url: '/legal/my-acceptances',
  });
};
