/**
 * Safe redirect validator to prevent Open Redirect attacks.
 * Accepts only relative paths starting with a single '/' and rejects
 * protocol-relative URLs ('//'), absolute URLs ('https://...'), and malformed paths.
 */
export function isValidRedirectPath(path: unknown): path is string {
  if (typeof path !== 'string') return false;
  const trimmed = path.trim();
  if (!trimmed) return false;

  // Must start with '/' but not '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return false;
  }

  // Must not contain scheme delimiter
  if (trimmed.includes('://')) {
    return false;
  }

  // Must not contain control characters or newlines
  if (/[\r\n\t]/.test(trimmed)) {
    return false;
  }

  return true;
}

export function getSafeRedirect(
  path: unknown,
  fallback: string | null = null,
): string | null {
  if (isValidRedirectPath(path)) {
    return path.trim();
  }
  return fallback;
}

