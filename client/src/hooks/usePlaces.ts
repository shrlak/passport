import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Place } from '../types';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ places: Place[] }>('/api/places');
      setPlaces(data.places);
      setError(null);
    } catch {
      setError('Could not load places.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { places, error, refresh };
}

export function usePlace(id: string | undefined) {
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<{ place: Place }>(`/api/places/${id}`);
      setPlace(data.place);
      setError(null);
    } catch {
      setError('This place could not be found.');
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { place, error, refresh };
}
