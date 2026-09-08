import { UserAddress } from '@/core/entities/models/users/saved-address.dto';

export const COORDINATE_EPSILON = 0.0003;

interface LocationTarget {
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const normalize = (str?: string | null) => (str ? str.trim().toLowerCase() : '');

export function findMatchingSavedAddress(
  addresses: UserAddress[] | undefined | null,
  current: LocationTarget
): UserAddress | undefined {
  if (!addresses || addresses.length === 0) return undefined;

  const currentGov = normalize(current.governorate);
  const currentCity = normalize(current.city);
  const currentAddr = normalize(current.address);

  // If no textual location at all, can't match
  if (!currentGov && !currentCity && !currentAddr) return undefined;

  return addresses.find((addr) => {
    const govMatches = normalize(addr.governorate) === currentGov;
    const cityMatches = normalize(addr.city) === currentCity;
    const addrMatches = normalize(addr.address) === currentAddr;

    if (!govMatches || !cityMatches || !addrMatches) {
      return false;
    }

    // Check coordinates
    const hasCurrentCoords =
      current.latitude != null &&
      current.longitude != null &&
      !isNaN(current.latitude) &&
      !isNaN(current.longitude);

    const hasAddrCoords =
      addr.latitude != null &&
      addr.longitude != null &&
      !isNaN(addr.latitude) &&
      !isNaN(addr.longitude);

    // If both have pins, coordinates must be within COORDINATE_EPSILON
    if (hasCurrentCoords && hasAddrCoords) {
      const latDiff = Math.abs(current.latitude! - addr.latitude!);
      const lngDiff = Math.abs(current.longitude! - addr.longitude!);
      return latDiff <= COORDINATE_EPSILON && lngDiff <= COORDINATE_EPSILON;
    }

    // If only one side has a pin, adding a pin makes it strictly more precise,
    // so that is worth saving separately (i.e. not a match).
    if (hasCurrentCoords !== hasAddrCoords) {
      return false;
    }

    // Neither has a pin, and text fields matched
    return true;
  });
}
