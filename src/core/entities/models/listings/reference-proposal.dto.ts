export type ProposalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'linked'
  | 'withdrawn'
  | 'orphaned';

export interface RefItemProposal {
  id: number;
  submittedName: string;
  status: ProposalStatus;
  resolvedItemId: number | null;
}

export interface FuzzyRefItemResult {
  id: number;
  slug: string;
  label: string;
  score: number;
  parentItemId: number | null;
  parentLabel: string | null;
  metadata: Record<string, unknown> | null;
  parentMetadata: Record<string, unknown> | null;
}

export type ProposeReferenceResult =
  | { kind: 'propose'; name: string }
  | {
      kind: 'existing';
      id: number;
      label: string;
      parentItemId: number | null;
      parentLabel: string | null;
      metadata: Record<string, unknown> | null;
      parentMetadata: Record<string, unknown> | null;
    };

export const LOOKS_LIKE_CONTACT_OR_URL =
  /(https?:\/\/|www\.|\S+@\S+\.\S+|\+?\d[\d\s\-()]{7,})/i;
