import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import arMessages from '@/messages/ar.json';
import enMessages from '@/messages/en.json';

const getColorLabel = (colorKey: string, locale: string): string => {
  const messages = locale === 'ar' ? arMessages : enMessages;
  const options = (messages as any).addProduct?.enteredData?.stepTwo?.color?.options || {};
  return options[colorKey] || colorKey;
};

const getLocalizedValue = (val: any, locale: string): string => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    return val[locale] || Object.values(val)[0] || '';
  }
  return '';
};

const getFeatureLabel = (featureKey: string, locale: string): string | null => {
  const messages = locale === 'ar' ? arMessages : enMessages;
  const featuresObj = (messages as any).addProduct?.enteredData?.stepTwo?.features;
  if (featuresObj && typeof featuresObj === 'object') {
    for (const category of Object.values(featuresObj)) {
      if (category && typeof category === 'object') {
        const label = (category as any)[featureKey];
        if (label) return label;
      }
    }
  }
  return null;
};

export const humanizeOptionId = (id: string, locale: string): string => {
  const translated = getFeatureLabel(id, locale);
  if (translated) return translated;

  const mappingsEn: Record<string, string> = {
    abs: 'ABS',
    usb_charger: 'USB Charger',
    led_lights: 'LED Lights',
    gps: 'GPS',
    tcs: 'TCS',
    esc: 'ESC',
    ebd: 'EBD',
  };

  const mappingsAr: Record<string, string> = {
    abs: 'نظام الفرامل المانعة للانغلاق (ABS)',
    electric_start: 'تشغيل كهربائي',
    kick_start: 'تشغيل بالقدم (مانيلا)',
    digital_display: 'شاشة رقمية',
    led_lights: 'إضاءة LED',
    alarm: 'إنذار ضد السرقة',
    usb_charger: 'شاحن USB',
    keyless: 'بدون مفتاح (بصمة)',
    traction_control: 'نظام التحكم في الجر',
    cruise_control: 'مثبت السرعة',
    heated_grips: 'مقابض مدفأة',
    windshield: 'زجاج أمامي',
    luggage_box: 'صندوق أمتعة',
    crash_bars: 'قضبان الحماية',
    disc_brake: 'فرامل ديسك',
    alloy_wheels: 'جنوط ألمنيوم',
  };

  if (locale === 'ar') {
    if (mappingsAr[id]) return mappingsAr[id];
  }

  if (mappingsEn[id]) return mappingsEn[id];

  return id
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Resolves a raw GenericAttributeValue into a human-readable display string.
 * Handles: reference, select, number, boolean, date, text.
 */
export const resolveAttributeValue = (
  av: GenericAttributeValue,
  locale: string = 'en',
): string => {
  if (av.refItemProposal && av.refItemProposal.submittedName) {
    return av.refItemProposal.submittedName;
  }

  const { attribute, referenceItem, valueText, valueNumber, valueBoolean, valueDate, valueJson } = av;

  const getVal = () => {
    switch (attribute.type as string) {
      case 'reference':
        return referenceItem ? getLocalizedValue(referenceItem.name, locale) : '';

      case 'select':
      case 'color_selection': {
        if (!valueText) return '';
        const option = attribute.options?.find((o) => o.id === valueText);
        if (option) return option.label[locale as 'ar' | 'en'] || option.label.en || valueText;
        if (attribute.type === 'color_selection') {
          return getColorLabel(valueText, locale);
        }
        return valueText;
      }

      case 'color_picker':
        return valueText || '';

      case 'color_multi_selection': {
        let ids: string[] = [];
        if (Array.isArray(valueJson)) {
          ids = valueJson;
        } else if (typeof valueText === 'string') {
          try {
            const parsed = JSON.parse(valueText);
            if (Array.isArray(parsed)) ids = parsed;
            else ids = [valueText];
          } catch {
            ids = valueText.split(',').map(s => s.trim());
          }
        }
        if (ids.length === 0) return '';
        const labels = ids.map(id => {
          const option = attribute.options?.find((o) => o.id === id);
          if (option) return option.label[locale as 'ar' | 'en'] || option.label.en || id;
          return getColorLabel(id, locale);
        });
        return labels.join(', ');
      }

      case 'year': {
        if (valueNumber !== null && valueNumber !== undefined) return valueNumber.toString();
        if (valueText) return valueText;
        return '';
      }

      case 'number': {
        if (valueNumber === null || valueNumber === undefined) return '';
        // Strip unnecessary trailing zeros
        const num = parseFloat(valueNumber);
        return isNaN(num) ? valueNumber : num.toString();
      }

      case 'boolean':
        if (valueBoolean === null || valueBoolean === undefined) return '';
        return locale === 'ar' ? (valueBoolean ? 'نعم' : 'لا') : (valueBoolean ? 'Yes' : 'No');

      case 'date': {
        const rawValue = valueDate || valueText;
        if (!rawValue) return '';
        try {
          const date = new Date(rawValue);
          if (isNaN(date.getTime())) return rawValue;
          
          // If slug is "year", just show the year
          if (attribute.slug === 'year') {
            return date.getFullYear().toString();
          }
          
          // Otherwise return formatted local date
          return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            });
        } catch {
          return rawValue;
        }
      }

      case 'multi_select':
      case 'multi_selection': {
        let ids: string[] = [];
        if (Array.isArray(valueJson)) {
          ids = valueJson;
        } else if (typeof valueText === 'string') {
          try {
            const parsed = JSON.parse(valueText);
            if (Array.isArray(parsed)) ids = parsed;
            else ids = [valueText];
          } catch {
            ids = valueText.split(',').map(s => s.trim());
          }
        }
        if (ids.length === 0) return '';
        const labels = ids.map(id => {
          const option = attribute.options?.find((o) => o.id === id);
          if (option) return option.label[locale as 'ar' | 'en'] || option.label.en || id;
          return humanizeOptionId(id, locale);
        });
        return labels.join(', ');
      }

      case 'text':
      default: {
        // If the value is a JSON string of an array (e.g. ["abs", "electric_start"]), parse and format it.
        let ids: string[] | null = null;
        if (Array.isArray(valueJson)) {
          ids = valueJson.map(v => String(v));
        } else if (typeof valueText === 'string' && valueText.trim().startsWith('[') && valueText.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(valueText);
            if (Array.isArray(parsed)) {
              ids = parsed.map(v => String(v));
            }
          } catch {
            // Not a valid JSON array
          }
        }

        if (ids && ids.length > 0) {
          const labels = ids.map(id => {
            const option = attribute.options?.find((o) => o.id === id);
            if (option) return option.label[locale as 'ar' | 'en'] || option.label.en || id;
            return humanizeOptionId(id, locale);
          });
          return labels.join(', ');
        }

        if (valueText) return valueText;
        if (valueJson !== null && valueJson !== undefined) {
          return typeof valueJson === 'string' ? valueJson : JSON.stringify(valueJson);
        }
        return '';
      }
    }
  };

  const resolved = getVal();
  if (!resolved && referenceItem?.name) {
    return getLocalizedValue(referenceItem.name, locale);
  }
  return resolved;
};


/**
 * Normalizes a generic listing response from the API into the structured SelectCarListingDto
 * that the car-specific UI components expect.
 */
export const normalizeListingToCarDto = (listing: any, locale: string = 'en'): SelectCarListingDto => {
  if (!listing) return null as any;

  const getLocalizedValue = (val: any) => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
      return val[locale] || Object.values(val)[0] || '';
    }
    return '';
  };

  const normalizeValue = (val: any) => {
    const stringVal = getLocalizedValue(val);
    if (!stringVal) return '';
    
    // Direct mapping for common display values to slugs
    const mapping: Record<string, string> = {
      'Gasoline/Gas': 'gasoline_gas',
      'Gasoline': 'gasoline',
      'Diesel': 'diesel',
      'Electric': 'electric',
      'Hybrid': 'hybrid',
      'Plug-in Hybrid': 'plug_in_hybrid',
      'Automatic': 'automatic',
      'Manual': 'manual',
      'Semi-Automatic': 'semi_automatic',
      'CVT': 'cvt'
    };
    
    if (mapping[stringVal]) return mapping[stringVal];
    
    // Fallback: lowercase and replace spaces with underscores
    return stringVal.toLowerCase().replace(/[\s/]+/g, '_');
  };

  const attributeValues = listing.attributeValues || [];
  
  const getAttr = (slug: string) => attributeValues.find((av: any) => av.attribute?.slug === slug);
  
  const makeAttr = getAttr('make');
  const modelAttr = getAttr('model');
  const trimAttr = getAttr('trim');
  const yearAttr = getAttr('year');
  const mileageAttr = getAttr('mileage');
  const fuelTypeAttr = getAttr('fuel_type');
  const transmissionAttr = getAttr('transmission');
  const engineSizeAttr = getAttr('engine_size');
  const enginePowerAttr = getAttr('engine_power');
  const bodyTypeAttr = getAttr('body_type');
  const doorsAttr = getAttr('doors');
  const colorExteriorAttr = getAttr('color_exterior');
  const colorInteriorAttr = getAttr('color_interior');
  const plateNumberAttr = getAttr('plate_number');
  const vinAttr = getAttr('vin');

  // Mapping features
  const features: any[] = [];
  const featureSlugs = [
    'features_comfort', 'features_technology', 'features_safety', 
    'features_exterior', 'features_interior', 'features_performance', 
    'features_entertainment', 'features_other'
  ];
  
  featureSlugs.forEach(slug => {
    const attr = getAttr(slug);
    if (attr && Array.isArray(attr.valueJson)) {
      attr.valueJson.forEach((fId: string) => {
        // Find the label for this feature in attribute options
        const option = attr.attribute?.options?.find((o: any) => o.id === fId);
        features.push({
          id: Math.random(), // Fallback ID
          carListingId: listing.id,
          featureId: fId,
          feature: {
            id: fId,
            name: getLocalizedValue(option?.label || fId),
            category: slug.replace('features_', '')
          }
        });
      });
    }
  });

  // Mapping damages
  let damages: any[] = [];
  if (listing.damages && Array.isArray(listing.damages)) {
    damages = listing.damages.map((d: any) => ({
      id: d.id,
      carListingId: d.carListingId || listing.id,
      damageZone: d.damageZone || d.damage_zone,
      damageType: d.damageType || d.damage_type,
      damage_zone: d.damage_zone || d.damageZone,
      damage_type: d.damage_type || d.damageType,
      description: d.description || '',
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  } else {
    const damagesAttr = getAttr('damages');
    if (damagesAttr) {
      let rawDamages: any[] = [];
      if (Array.isArray(damagesAttr.valueJson)) {
        rawDamages = damagesAttr.valueJson;
      } else if (typeof damagesAttr.valueText === 'string') {
        try {
          rawDamages = JSON.parse(damagesAttr.valueText);
        } catch (e) {
          console.error('Failed to parse damages JSON text', e);
        }
      }
      if (Array.isArray(rawDamages)) {
        damages = rawDamages.map((d: any, index: number) => ({
          id: d.id || index,
          carListingId: listing.id,
          damageZone: d.damageZone || d.damage_zone,
          damageType: d.damageType || d.damage_type,
          damage_zone: d.damage_zone || d.damageZone,
          damage_type: d.damage_type || d.damageType,
          description: d.description || '',
          createdAt: d.createdAt || listing.createdAt,
          updatedAt: d.updatedAt || listing.updatedAt,
        }));
      }
    }
  }

  // Extract translation for title, description, story
  const translations = listing.translations || {};
  let currentTranslation: any = {};
  
  if (Array.isArray(translations)) {
    currentTranslation = translations.find((t: any) => t.locale === locale) || translations[0] || {};
  } else {
    currentTranslation = translations[locale] || Object.values(translations)[0] || {};
  }

  return {
    id: listing.id,
    slug: listing.slug || listing.id.toString(),
    title: getLocalizedValue(currentTranslation.title || listing.title),
    description: getLocalizedValue(currentTranslation.description || listing.description),
    story: getLocalizedValue(currentTranslation.story || listing.story),
    price: listing.price ? Number(listing.price) : null,
    currency: listing.currency,
    userId: listing.userId,
    user: listing.user,
    makeId: makeAttr?.referenceItemId || 0,
    modelId: modelAttr?.referenceItemId || 0,
    trimId: trimAttr?.referenceItemId || null,
    listingTypeId: listing.listingTypeId,
    status: listing.moderationStatus || listing.status || listing.publicationStatus,
    moderationStatus: listing.moderationStatus,
    rejectionReason: listing.rejectionReason,
    isFeatured: listing.isFeatured || false,
    isTrend: listing.isTrend || false,
    isFavorite: listing.isFavorite || false,
    saveStatus: listing.publicationStatus,
    listingType: listing.listingOfferType,
    contactNumber: listing.contactNumber,
    // Carry the reveal flag: without it every product page reads "seller has no
    // number" and disables Call / WhatsApp permanently once protection is on.
    contactAvailable: listing.contactAvailable,

    governorate: getLocalizedValue(listing.governorate),
    city: getLocalizedValue(listing.city),
    address: getLocalizedValue(listing.address),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    publishedAt: listing.publishedAt,
    primaryImage: listing.primaryImage || (listing.images && listing.images.length > 0 ? listing.images.find((img: any) => img.isPrimary)?.url || listing.images[0]?.url : null),
    details: {
      id: listing.id,
      carListingId: listing.id,
      year: yearAttr?.valueNumber 
        ? Number(yearAttr.valueNumber) 
        : (yearAttr?.valueText ? (() => {
            const d = new Date(yearAttr.valueText);
            return isNaN(d.getTime()) ? 0 : d.getFullYear();
          })() : 0),
      mileage: mileageAttr?.valueNumber ? Number(mileageAttr.valueNumber) : null,
      fuelType: normalizeValue(fuelTypeAttr?.valueText),
      transmission: normalizeValue(transmissionAttr?.valueText),
      engineSize: engineSizeAttr?.valueNumber ? Number(engineSizeAttr.valueNumber) : null,
      enginePower: enginePowerAttr?.valueNumber ? Number(enginePowerAttr.valueNumber) : null,
      bodyType: normalizeValue(bodyTypeAttr?.valueText),
      doors: doorsAttr?.valueNumber ? doorsAttr.valueNumber.toString() : null,
      colorExterior: colorExteriorAttr ? resolveAttributeValue(colorExteriorAttr, locale) : null,
      colorInterior: colorInteriorAttr ? resolveAttributeValue(colorInteriorAttr, locale) : null,
      vin: vinAttr?.valueText,
      plateNumber: plateNumberAttr?.valueText,
      condition: listing.condition,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      deletedAt: listing.deletedAt,
    },
    features: features,
    images: (listing.images && listing.images.length > 0) 
      ? listing.images.map((img: any) => ({
          id: img.id,
          carListingId: listing.id,
          url: img.url,
          isPrimary: img.isPrimary,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          deletedAt: null
        }))
      : (listing.primaryImage ? [{
          id: 0,
          carListingId: listing.id,
          url: listing.primaryImage,
          isPrimary: true,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          deletedAt: null
        }] : []),

    make: (makeAttr?.referenceItem || makeAttr?.refItemProposal || listing.make) ? {
      id: makeAttr?.referenceItem?.id || listing.make?.id || makeAttr?.referenceItemId || 0,
      name: makeAttr?.refItemProposal?.submittedName || getLocalizedValue(makeAttr?.referenceItem?.name || listing.make?.name || ''),
      logoUrl: makeAttr?.referenceItem?.logoUrl || listing.make?.logoUrl || null,
      description: null,
      isCarTrimRequired: makeAttr?.referenceItem?.metadata?.isCarTrimRequired || listing.make?.metadata?.isCarTrimRequired || false,
      createdAt: makeAttr?.referenceItem?.createdAt || listing.make?.createdAt || '',
      updatedAt: makeAttr?.referenceItem?.updatedAt || listing.make?.updatedAt || '',
      deletedAt: null
    } : {
      id: makeAttr?.referenceItemId || 0,
      name: '',
      logoUrl: null,
      description: null,
      isCarTrimRequired: false,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    },
    model: (modelAttr?.referenceItem || modelAttr?.refItemProposal || listing.model) ? {
      id: modelAttr?.referenceItem?.id || listing.model?.id || modelAttr?.referenceItemId || 0,
      makeId: makeAttr?.referenceItemId || listing.model?.makeId || 0,
      name: modelAttr?.refItemProposal?.submittedName || getLocalizedValue(modelAttr?.referenceItem?.name || listing.model?.name || ''),
      yearStart: null,
      yearEnd: null,
      description: null,
      createdAt: modelAttr?.referenceItem?.createdAt || listing.model?.createdAt || '',
      updatedAt: modelAttr?.referenceItem?.updatedAt || listing.model?.updatedAt || '',
      deletedAt: null
    } : {
      id: modelAttr?.referenceItemId || 0,
      makeId: makeAttr?.referenceItemId || 0,
      name: '',
      yearStart: null,
      yearEnd: null,
      description: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    },
    trim: (trimAttr?.referenceItem || trimAttr?.refItemProposal || listing.trim) ? {
      id: trimAttr?.referenceItem?.id || listing.trim?.id || trimAttr?.referenceItemId || 0,
      modelId: modelAttr?.referenceItemId || listing.trim?.modelId || 0,
      name: trimAttr?.refItemProposal?.submittedName || getLocalizedValue(trimAttr?.referenceItem?.name || listing.trim?.name || ''),
      description: null,
      createdAt: trimAttr?.referenceItem?.createdAt || listing.trim?.createdAt || '',
      updatedAt: trimAttr?.referenceItem?.updatedAt || listing.trim?.updatedAt || '',
      deletedAt: null
    } : undefined,
    damages: damages,
    statics: {
        id: listing.id,
        carListingId: listing.id,
        viewsCount: 0,
        contactCount: 0,
        favoritesCount: 0,
        viewDuration: 0,
        sharesCount: 0,
        detailsViewedCount: 0,
        lastViewedAt: null,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
    },
    rawListing: listing
  } as any;
};
