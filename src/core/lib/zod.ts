import { z } from 'zod';

export function zodTimestamps() {
  const baseColumns = {
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
  };

  return baseColumns;
}

export function zodTimestampsWithDeleteAt() {
  const baseColumns = {
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
  };

  return baseColumns;
}
