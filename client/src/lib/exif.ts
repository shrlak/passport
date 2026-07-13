import type { Coords } from '../hooks/useGeolocation';

// Reads the GPS position embedded in a photo's EXIF metadata (JPEG/HEIC/TIFF).
// exifr is loaded lazily — only when the user actually picks a photo.
export async function extractGps(file: File): Promise<Coords | null> {
  try {
    const exifr = (await import('exifr')).default;
    const gps = await exifr.gps(file);
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      return { lat: gps.latitude, lng: gps.longitude };
    }
  } catch {
    // unreadable metadata — treat as no GPS
  }
  return null;
}
