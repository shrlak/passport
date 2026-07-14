import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './useAuth';

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextValue {
  position: Coords | null;
  error: string | null;
  loading: boolean;
  ready: boolean;
  onboardingComplete: boolean;
  /**
   * Must be called from a user gesture (button tap) — iOS Safari only shows
   * the permission prompt then. Never request on mount.
   */
  request: () => Promise<boolean>;
  continueWithoutLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);
const LOCATION_SESSION_KEY = 'stampquest.location-session.v1';

interface SavedLocationSession {
  userId: number;
  onboardingComplete: boolean;
  position: Coords | null;
}

function readSavedSession(): SavedLocationSession | null {
  try {
    const raw = localStorage.getItem(LOCATION_SESSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<SavedLocationSession>;
    const position = saved.position;
    if (
      typeof saved.userId !== 'number' ||
      saved.onboardingComplete !== true ||
      (position !== null &&
        position !== undefined &&
        (typeof position.lat !== 'number' || typeof position.lng !== 'number'))
    ) {
      return null;
    }
    return {
      userId: saved.userId,
      onboardingComplete: true,
      position: position ?? null,
    };
  } catch {
    return null;
  }
}

function saveSession(session: SavedLocationSession | null) {
  try {
    if (session) localStorage.setItem(LOCATION_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(LOCATION_SESSION_KEY);
  } catch {
    // Storage can be unavailable in private browsing. Context state still
    // preserves the location during this page session.
  }
}

// Context (not a per-page hook) so granting location on one screen carries
// over to the others without re-prompting.
export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [position, setPosition] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPosition(null);
      setError(null);
      setLoading(false);
      setOnboardingComplete(false);
      saveSession(null);
      setReady(true);
      return;
    }

    const saved = readSavedSession();
    if (saved?.userId === user.id) {
      setPosition(saved.position);
      setOnboardingComplete(saved.onboardingComplete);
    } else {
      setPosition(null);
      setOnboardingComplete(false);
      saveSession(null);
    }
    setError(null);
    setLoading(false);
    setReady(true);
  }, [authLoading, user]);

  const request = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Location is not supported by this browser.');
      return false;
    }
    setLoading(true);
    setError(null);
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(next);
          setOnboardingComplete(true);
          setLoading(false);
          if (user) {
            saveSession({ userId: user.id, onboardingComplete: true, position: next });
          }
          resolve(true);
        },
        (err) => {
          setError(
            err.code === err.PERMISSION_DENIED
              ? 'Location access was denied. You can continue and collect with photo evidence instead.'
              : 'We could not determine your location. You can continue without it.',
          );
          setLoading(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    });
  }, [user]);

  const continueWithoutLocation = useCallback(() => {
    setPosition(null);
    setError(null);
    setOnboardingComplete(true);
    if (user) {
      saveSession({ userId: user.id, onboardingComplete: true, position: null });
    }
  }, [user]);

  const value = useMemo(
    () => ({
      position,
      error,
      loading,
      ready,
      onboardingComplete,
      request,
      continueWithoutLocation,
    }),
    [
      position,
      error,
      loading,
      ready,
      onboardingComplete,
      request,
      continueWithoutLocation,
    ],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

// Named useGeo (not useLocation) to avoid clashing with react-router's hook.
export function useGeo(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useGeo must be used within LocationProvider');
  return ctx;
}
