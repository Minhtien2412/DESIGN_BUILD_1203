/**
 * Geolocation Utilities
 * Distance calculation, bounding box, bearing for worker-map features
 * Uses Haversine formula for accurate earth-surface distances
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// ============================================================================
// DISTANCE
// ============================================================================

/**
 * Haversine distance between two lat/lng points in kilometers
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = (b.latitude - a.latitude) * DEG_TO_RAD;
  const dLng = (b.longitude - a.longitude) * DEG_TO_RAD;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(a.latitude * DEG_TO_RAD) *
      Math.cos(b.latitude * DEG_TO_RAD) *
      sinDLng *
      sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Format distance for display: "0.8 km" or "350 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimated travel time by motorbike (avg 25 km/h in city)
 */
export function estimateTravelTime(
  distanceKm: number,
  speedKmh: number = 25,
): number {
  return Math.ceil((distanceKm / speedKmh) * 60); // minutes
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 1) return "< 1 phút";
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m} phút` : `${h} giờ`;
}

// ============================================================================
// BOUNDING BOX / RADIUS SEARCH
// ============================================================================

/**
 * Create bounding box around a center point with a given radius (km)
 */
export function boundingBox(center: LatLng, radiusKm: number): BoundingBox {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * RAD_TO_DEG;
  const lngDelta =
    (radiusKm / (EARTH_RADIUS_KM * Math.cos(center.latitude * DEG_TO_RAD))) *
    RAD_TO_DEG;
  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lngDelta,
    west: center.longitude - lngDelta,
  };
}

/**
 * Check if a point is within a radius (km) of the center
 */
export function isWithinRadius(
  center: LatLng,
  point: LatLng,
  radiusKm: number,
): boolean {
  return haversineDistance(center, point) <= radiusKm;
}

/**
 * Sort points by distance from a reference point (nearest first)
 */
export function sortByDistance<T extends LatLng>(
  from: LatLng,
  points: T[],
): (T & { distance: number })[] {
  return points
    .map((p) => ({ ...p, distance: haversineDistance(from, p) }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter points within a radius and sort by distance
 */
export function nearbyPoints<T extends LatLng>(
  from: LatLng,
  points: T[],
  radiusKm: number,
): (T & { distance: number })[] {
  return sortByDistance(from, points).filter((p) => p.distance <= radiusKm);
}

// ============================================================================
// BEARING & HEADING
// ============================================================================

/**
 * Calculate bearing (degrees) from point A to point B
 * 0 = North, 90 = East, 180 = South, 270 = West
 */
export function bearing(from: LatLng, to: LatLng): number {
  const dLng = (to.longitude - from.longitude) * DEG_TO_RAD;
  const fromLat = from.latitude * DEG_TO_RAD;
  const toLat = to.latitude * DEG_TO_RAD;
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
}

/**
 * Interpolate between two points (0 = from, 1 = to)
 * Used for smooth animation of worker movement
 */
export function interpolateLatLng(
  from: LatLng,
  to: LatLng,
  fraction: number,
): LatLng {
  const t = Math.max(0, Math.min(1, fraction));
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * t,
    longitude: from.longitude + (to.longitude - from.longitude) * t,
  };
}

// ============================================================================
// MAP REGION HELPERS
// ============================================================================

/**
 * Calculate map region to fit both worker and customer locations
 * with padding for UI elements
 */
export function fitToCoordinates(
  points: LatLng[],
  padding: number = 0.3,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (points.length === 0) {
    // Default to Ho Chi Minh City
    return {
      latitude: 10.7769,
      longitude: 106.7009,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  if (points.length === 1) {
    return {
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = (maxLat - minLat) * (1 + padding) || 0.01;
  const lngDelta = (maxLng - minLng) * (1 + padding) || 0.01;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.005),
    longitudeDelta: Math.max(lngDelta, 0.005),
  };
}

// ============================================================================
// HCM CITY DISTRICT COORDINATES (for mock/fallback)
// ============================================================================

export const HCM_DISTRICTS: Record<string, LatLng> = {
  "Quận 1": { latitude: 10.7756, longitude: 106.7019 },
  "Quận 2": { latitude: 10.7868, longitude: 106.7514 },
  "Quận 3": { latitude: 10.7838, longitude: 106.6854 },
  "Quận 4": { latitude: 10.7576, longitude: 106.7043 },
  "Quận 5": { latitude: 10.754, longitude: 106.6633 },
  "Quận 6": { latitude: 10.7481, longitude: 106.6352 },
  "Quận 7": { latitude: 10.734, longitude: 106.7218 },
  "Quận 8": { latitude: 10.7244, longitude: 106.6286 },
  "Quận 9": { latitude: 10.8427, longitude: 106.8283 },
  "Quận 10": { latitude: 10.7745, longitude: 106.6672 },
  "Quận 11": { latitude: 10.7633, longitude: 106.6505 },
  "Quận 12": { latitude: 10.8671, longitude: 106.6547 },
  "Bình Thạnh": { latitude: 10.8107, longitude: 106.7091 },
  "Gò Vấp": { latitude: 10.8386, longitude: 106.6652 },
  "Phú Nhuận": { latitude: 10.7998, longitude: 106.6826 },
  "Tân Bình": { latitude: 10.8014, longitude: 106.6528 },
  "Tân Phú": { latitude: 10.79, longitude: 106.6281 },
  "Thủ Đức": { latitude: 10.8483, longitude: 106.7592 },
  "Bình Tân": { latitude: 10.765, longitude: 106.6038 },
  "Nhà Bè": { latitude: 10.6945, longitude: 106.7043 },
  "Hóc Môn": { latitude: 10.8862, longitude: 106.5956 },
  "Củ Chi": { latitude: 11.0102, longitude: 106.4933 },
  "Cần Giờ": { latitude: 10.4114, longitude: 106.9542 },
};

/**
 * Get coordinates for a location string (e.g., "Quận 7", "Q.7")
 * Returns fallback HCM center if not found
 */
export function locationToLatLng(location: string): LatLng {
  // Try exact match first
  if (HCM_DISTRICTS[location]) return HCM_DISTRICTS[location];

  // Normalize: "Q.7" -> "Quận 7", "Q7" -> "Quận 7"
  const normalized = location
    .replace(/^Q\.\s*/, "Quận ")
    .replace(/^Q(\d)/, "Quận $1")
    .replace(/^Tp\.\s*/i, "")
    .replace(/^TP\s*/i, "")
    .trim();

  if (HCM_DISTRICTS[normalized]) return HCM_DISTRICTS[normalized];

  // Partial match
  const key = Object.keys(HCM_DISTRICTS).find(
    (k) =>
      k.toLowerCase().includes(location.toLowerCase()) ||
      location.toLowerCase().includes(k.toLowerCase()),
  );
  if (key) return HCM_DISTRICTS[key];

  // Default: HCM City center
  return { latitude: 10.7769, longitude: 106.7009 };
}

/**
 * Add random jitter to coordinates (for displaying multiple workers in same area)
 */
export function addJitter(point: LatLng, radiusMeters: number = 500): LatLng {
  const r = radiusMeters / 111320; // approximate meters to degrees
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * r;
  return {
    latitude: point.latitude + dist * Math.cos(angle),
    longitude: point.longitude + dist * Math.sin(angle),
  };
}
