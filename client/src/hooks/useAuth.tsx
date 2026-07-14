import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, IS_LOCAL_BACKEND, api } from '../lib/api';
import type { Stats, User } from '../types';

interface MeResponse {
  user: User;
  stats: Stats;
  syncVersion?: number;
}

interface AuthContextValue {
  user: User | null;
  stats: Stats | null;
  loading: boolean;
  syncVersion: number;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncVersion, setSyncVersion] = useState(0);
  const syncVersionRef = useRef(0);

  const acceptMe = useCallback((me: MeResponse) => {
    const nextVersion = Number.isInteger(me.syncVersion) ? (me.syncVersion as number) : 0;
    syncVersionRef.current = nextVersion;
    setSyncVersion(nextVersion);
    setUser(me.user);
    setStats(me.stats);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await api.get<MeResponse>('/api/auth/me');
      acceptMe(me);
    } catch (error) {
      // A temporary network failure must not make a valid account appear to
      // sign out. Only the API's explicit authentication response clears it.
      if (error instanceof ApiError && error.status === 401) {
        syncVersionRef.current = 0;
        setSyncVersion(0);
        setUser(null);
        setStats(null);
      }
    }
  }, [acceptMe]);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  // Poll only a tiny integer while this app is visible. The full profile and
  // place catalog are fetched only after another device changes the account.
  useEffect(() => {
    if (!user || IS_LOCAL_BACKEND) return;
    let active = true;
    let checking = false;
    const checkForChanges = async () => {
      if (!active || checking || document.visibilityState !== 'visible') return;
      checking = true;
      try {
        const sync = await api.get<{ version: number }>('/api/sync');
        if (Number.isInteger(sync.version) && sync.version !== syncVersionRef.current) {
          await refreshMe();
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) await refreshMe();
      } finally {
        checking = false;
      }
    };
    const refreshWhenActive = () => void checkForChanges();
    const interval = window.setInterval(checkForChanges, 30_000);
    window.addEventListener('focus', refreshWhenActive);
    document.addEventListener('visibilitychange', refreshWhenActive);
    void checkForChanges();
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenActive);
      document.removeEventListener('visibilitychange', refreshWhenActive);
    };
  }, [user?.id, refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      stats,
      loading,
      syncVersion,
      signIn: async (username, password) => {
        const me = await api.post<MeResponse>('/api/auth/login', { username, password });
        acceptMe(me);
      },
      signUp: async (username, password) => {
        const me = await api.post<MeResponse>('/api/auth/register', { username, password });
        acceptMe(me);
      },
      signOut: async () => {
        await api.post('/api/auth/logout');
        syncVersionRef.current = 0;
        setSyncVersion(0);
        setUser(null);
        setStats(null);
      },
      refreshMe,
    }),
    [user, stats, loading, syncVersion, acceptMe, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
