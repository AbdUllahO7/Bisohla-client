'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocaleQuery } from '../common/use-locale-query';
import {
  acceptLegalDocuments,
  getLegalDocumentByKind,
  getLegalDocuments,
  getLegalDocumentVersion,
  getMyAcceptances,
  getPendingLegalDocuments,
} from '../../actions/legal/legal.actions';
import { AcceptLegalPayloadDto } from '@/core/entities/models/legal/legal.dto';

export const useLegalDocuments = () =>
  useLocaleQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => await getLegalDocuments(),
    staleTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
  });

export const useLegalDocument = (kind: string) =>
  useLocaleQuery({
    queryKey: ['legal-document', kind],
    queryFn: async () => await getLegalDocumentByKind(kind),
    enabled: !!kind,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

export const useLegalDocumentVersion = (kind: string, version: number) =>
  useLocaleQuery({
    queryKey: ['legal-document-version', kind, version],
    queryFn: async () => await getLegalDocumentVersion(kind, version),
    enabled: !!kind && version > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const usePendingLegalDocuments = (userId?: number, enabled = true) =>
  useLocaleQuery({
    queryKey: ['legal-pending', userId ?? 0],
    queryFn: async () => await getPendingLegalDocuments(),
    enabled: enabled && Boolean(userId && userId > 0),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });

export const useAcceptLegalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AcceptLegalPayloadDto) =>
      await acceptLegalDocuments(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      queryClient.invalidateQueries({ queryKey: ['legal-my-acceptances'] });
    },
  });
};

export const useMyAcceptances = () =>
  useLocaleQuery({
    queryKey: ['legal-my-acceptances'],
    queryFn: async () => await getMyAcceptances(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
