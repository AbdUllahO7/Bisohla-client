/**
 * Helper to safely extract isCarTrimRequired / hasTrim flags from reference items
 * whether stored as direct fields, boolean, stringified JSON in metadata, or nested objects.
 */
export function extractIsTrimRequired(item: any): boolean | undefined {
  if (!item) return undefined;

  // 1. Direct properties on the item
  if (typeof item.isCarTrimRequired === 'boolean') return item.isCarTrimRequired;
  if (typeof item.is_car_trim_required === 'boolean') return item.is_car_trim_required;
  if (typeof item.hasTrim === 'boolean') return item.hasTrim;
  if (typeof item.has_trim === 'boolean') return item.has_trim;
  if (typeof item.isTrimRequired === 'boolean') return item.isTrimRequired;
  if (typeof item.trimRequired === 'boolean') return item.trimRequired;
  if (typeof item.isRequired === 'boolean') return item.isRequired;
  if (typeof item.required === 'boolean') return item.required;

  // 2. Metadata (could be object or stringified JSON or boolean string)
  let meta = item.metadata;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      const lower = meta.trim().toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      meta = null;
    }
  }

  if (meta && typeof meta === 'object') {
    const val =
      meta.isCarTrimRequired ??
      meta.is_car_trim_required ??
      meta.hasTrim ??
      meta.has_trim ??
      meta.isTrimRequired ??
      meta.trimRequired ??
      meta.required;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    if (typeof val === 'number') return val === 1;
  }

  return undefined;
}

/**
 * Check if an attribute represents Trim / Car Trim / فئة
 */
export function isTrimAttribute(attr: { slug?: string; name?: any }): boolean {
  if (!attr) return false;
  const slug = (attr.slug || '').toLowerCase();
  return slug === 'trim' || slug === 'car_trim' || slug === 'cartrim' || slug === 'فئة';
}

/**
 * Check if an attribute represents Make / Car Make / ماركة / شركة
 */
export function isMakeAttribute(attr: { slug?: string; name?: any }): boolean {
  if (!attr) return false;
  const slug = (attr.slug || '').toLowerCase();
  return slug === 'make' || slug === 'marka' || slug === 'brand' || slug === 'car_make' || slug === 'carmake' || slug === 'شركة' || slug === 'ماركة';
}

/**
 * Check if an attribute represents Model / Car Model / موديل
 */
export function isModelAttribute(attr: { slug?: string; name?: any }): boolean {
  if (!attr) return false;
  const slug = (attr.slug || '').toLowerCase();
  return slug === 'model' || slug === 'car_model' || slug === 'carmodel' || slug === 'موديل';
}
