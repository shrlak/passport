import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useGeo } from '../hooks/useGeolocation';
import { api } from '../lib/api';
import { Button } from './Button';
import { StampSVG } from '../art/StampSVG';
import type { Place } from '../types';

export function AddPlaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { position } = useGeo();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [manual, setManual] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setName('');
    setCountry('');
    setDescription('');
    setManual(false);
    setLat('');
    setLng('');
    setError(null);
    setBusy(false);
    onClose();
  };

  const coords = manual
    ? { lat: Number(lat), lng: Number(lng) }
    : position
      ? { lat: position.lat, lng: position.lng }
      : null;
  const coordsValid =
    coords !== null &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    (!manual || (lat.trim() !== '' && lng.trim() !== '')) &&
    Math.abs(coords.lat) <= 90 &&
    Math.abs(coords.lng) <= 180;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coordsValid) {
      setError('Set a location first — use your current position or enter coordinates.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await api.post<{ place: Place }>('/api/places', {
        name: name.trim(),
        country: country.trim(),
        description: description.trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
      close();
      navigate(`/place/${data.place.id}`);
    } catch {
      setError('Could not save the place. Check the fields and try again.');
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[91vh] w-full max-w-md overflow-y-auto rounded-t-[34px] bg-[linear-gradient(160deg,#ffffff_0%,#f7f9fc_54%,#fff8eb_100%)] px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-24px_70px_rgba(18,23,38,0.18)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            data-testid="add-place-modal"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/15" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow text-teal">Create your own</p>
                <h1 className="mt-1 font-display text-[26px]">Add a place</h1>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-ink-soft active:bg-ink/5"
              >
                ×
              </button>
            </div>

            {/* live preview: hashed on the name pre-save, so the final stamp's
                palette (hashed on the real id) may differ — that's fine */}
            <motion.div
              className="relative mx-auto mb-6 flex min-h-[178px] w-full items-center justify-center overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#dbeeff,#fff1d6)]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <div className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full border-[24px] border-white/30" />
              <div className="w-32 rotate-2">
                <StampSVG
                  subject={{
                    id: name.trim() || 'preview-stamp',
                    name: name.trim() || 'Your place',
                    country: country.trim() || 'Somewhere',
                  }}
                  locked={false}
                  className="w-full drop-shadow-[0_12px_20px_rgba(24,32,52,0.2)]"
                />
              </div>
            </motion.div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                className="input"
                placeholder="Place name"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="place-name"
              />
              <input
                className="input"
                placeholder="Country"
                required
                maxLength={60}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                data-testid="place-country"
              />
              <textarea
                className="input py-2.5"
                placeholder="What makes it special? (optional)"
                rows={2}
                maxLength={400}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="rounded-[20px] border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-xl">
                {!manual ? (
                  <div
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 ${
                      position ? 'bg-olive/10 text-ink' : 'bg-black/4 text-ink-soft'
                    }`}
                    data-testid="use-my-location"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        position ? 'bg-olive text-white' : 'bg-black/8'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" aria-hidden>
                        <path d="M12 2a7 7 0 0 1 7 7c0 4.7-5.3 11-6.4 12.2a.8.8 0 0 1-1.2 0C10.3 20 5 13.7 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {position ? 'Using your saved location' : 'Location is off for this session'}
                      </span>
                      <span className="block truncate text-xs opacity-70">
                        {position
                          ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
                          : 'Enter coordinates to place this stamp'}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="Latitude"
                      inputMode="decimal"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      data-testid="manual-lat"
                    />
                    <input
                      className="input"
                      placeholder="Longitude"
                      inputMode="decimal"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      data-testid="manual-lng"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="mt-2 text-xs text-ink-soft underline underline-offset-2"
                  onClick={() => setManual(!manual)}
                >
                  {manual
                    ? position
                      ? 'Use my saved location instead'
                      : 'Hide coordinate fields'
                    : 'Enter coordinates manually'}
                </button>
              </div>

              {error && (
                <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy} data-testid="save-place">
                {busy ? 'Saving…' : 'Create stamp'}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
