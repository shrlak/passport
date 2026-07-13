import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextValue {
  position: Coords | null;
  error: string | null;
  loading: boolean;
  /**
   * Must be called from a user gesture (button tap) — iOS Safari only shows
   * the permission prompt then. Never request on mount.
   */
  request: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

// Context (not a per-page hook) so granting location on one screen carries
// over to the others without re-prompting.
export function LocationProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Location is not supported by this browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access in your browser settings to collect stamps.'
            : 'Could not determine your location. Try again.',
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  const value = useMemo(
    () => ({ position, error, loading, request }),
    [position, error, loading, request],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

// Named useGeo (not useLocation) to avoid clashing with react-router's hook.
export function useGeo(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useGeo must be used within LocationProvider');
  return ctx;
}
