import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';

/**
 * Resolves a raw GenericAttributeValue into a human-readable display string.
 * Handles: reference, select, number, boolean, date, text.
 */
export const resolveAttributeValue = (
  av: GenericAttributeValue,
  locale: string = 'en',
): string => {
  const { attribute, referenceItem, valueText, valueNumber, valueBoolean, valueDate, valueJson } = av;

  switch (attribute.type) {
    case 'reference':
      return referenceItem?.name || '';

    case 'select': {
      if (!valueText) return '';
      const option = attribute.options?.find((o) => o.id === valueText);
      if (option) return option.label[locale as 'ar' | 'en'] || option.label.en || valueText;
      return valueText;
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

    case 'text':
    default:
      if (valueText) return valueText;
      if (valueJson !== null && valueJson !== undefined) {
        return typeof valueJson === 'string' ? valueJson : JSON.stringify(valueJson);
      }
      return '';
  }
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
    status: listing.publicationStatus,
    isFeatured: listing.isFeatured || false,
    isTrend: listing.isTrend || false,
    isFavorite: listing.isFavorite || false,
    saveStatus: listing.publicationStatus,
    listingType: listing.listingOfferType,
    contactNumber: listing.contactNumber,

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
      colorExterior: normalizeValue(colorExteriorAttr?.valueText),
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

    make: makeAttr?.referenceItem ? {
      id: makeAttr.referenceItem.id,
      name: getLocalizedValue(makeAttr.referenceItem.name),
      logoUrl: makeAttr.referenceItem.logoUrl,
      description: null,
      isCarTrimRequired: makeAttr.referenceItem.metadata?.isCarTrimRequired || false,
      createdAt: makeAttr.referenceItem.createdAt,
      updatedAt: makeAttr.referenceItem.updatedAt,
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
    model: modelAttr?.referenceItem ? {
      id: modelAttr.referenceItem.id,
      makeId: makeAttr?.referenceItemId || 0,
      name: getLocalizedValue(modelAttr.referenceItem.name),
      yearStart: null,
      yearEnd: null,
      description: null,
      createdAt: modelAttr.referenceItem.createdAt,
      updatedAt: modelAttr.referenceItem.updatedAt,
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
    trim: trimAttr?.referenceItem ? {
      id: trimAttr.referenceItem.id,
      modelId: modelAttr?.referenceItemId || 0,
      name: getLocalizedValue(trimAttr.referenceItem.name),
      description: null,
      createdAt: trimAttr.referenceItem.createdAt,
      updatedAt: trimAttr.referenceItem.updatedAt,
      deletedAt: null
    } : undefined,
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
