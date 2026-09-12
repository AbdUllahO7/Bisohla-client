const INT4_MAX = 2147483647;

/**
 * Parses a search term as a listing ID.
 * Matches `/^#?(\d+)$/`, strictly in range `1..2147483647`.
 *
 * Valid examples: "123", "#123", "  #123  "
 * Invalid examples: "id:123", "# 123", "12a", "0", "99999999999"
 */
export const parseIdSearchTerm = (term: string | null | undefined): number | null => {
  if (!term) return null;
  const match = /^#?(\d+)$/.exec(term.trim());
  if (match == null) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id >= 1 && id <= INT4_MAX ? id : null;
};
