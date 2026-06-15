export interface ListingTypeRefItemDto {
  id: number;
  groupId: number;
  parentItemId: number | null;
  slug: string;
  name: string;
  iconUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isLeaf: boolean;
  order: number;
  metadata: any | null;
  createdAt: string;
  updatedAt: string;
  translations: Record<string, { name: string }>;
}
