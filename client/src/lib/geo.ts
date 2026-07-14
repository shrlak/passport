// Mirrors server/src/geo.ts. The client values only drive UI copy and
// gating; the server checks are authoritative.
export const COLLECT_RADIUS_M = 500;
export const PHOTO_RADIUS_M = 5000;

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

const METERS_PER_FOOT = 0.3048;
const FEET_PER_MILE = 5280;

export function formatDistance(meters: number, units: 'metric' | 'imperial' = 'metric'): string {
  if (units === 'imperial') {
    const feet = meters / METERS_PER_FOOT;
    if (feet < FEET_PER_MILE) return `${Math.round(feet).toLocaleString()} ft`;
    const miles = feet / FEET_PER_MILE;
    if (miles < 10) return `${miles.toFixed(1)} mi`;
    return `${Math.round(miles).toLocaleString()} mi`;
  }
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 10000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000).toLocaleString()} km`;
}
