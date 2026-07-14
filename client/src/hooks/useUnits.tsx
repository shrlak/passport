import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type UnitSystem = 'metric' | 'imperial';

const STORAGE_KEY = 'stampquest.units';

function readStored(): UnitSystem {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

interface UnitsContextValue {
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  toggleUnits: () => void;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [units, setUnitsState] = useState<UnitSystem>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, units);
    } catch {
      // localStorage unavailable (private browsing, etc.) — preference just won't persist.
    }
  }, [units]);

  const setUnits = useCallback((u: UnitSystem) => setUnitsState(u), []);
  const toggleUnits = useCallback(
    () => setUnitsState((u) => (u === 'metric' ? 'imperial' : 'metric')),
    [],
  );

  return (
    <UnitsContext.Provider value={{ units, setUnits, toggleUnits }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits(): UnitsContextValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within UnitsProvider');
  return ctx;
}
