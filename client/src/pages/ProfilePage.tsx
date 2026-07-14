import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePlaces } from '../hooks/usePlaces';
import { useUnits } from '../hooks/useUnits';
import { Button } from '../components/Button';
import { StampCard } from '../components/StampCard';
import { Avatar } from '../components/Avatar';
import { IS_LOCAL_BACKEND, api } from '../lib/api';
import { fileToStampPhoto } from '../lib/image';

export default function ProfilePage() {
  const { user, stats, signOut, refreshMe } = useAuth();
  const { places } = usePlaces();
  const { units, setUnits } = useUnits();
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const mine = places?.filter((p) => p.isMine) ?? [];
  const collected = places?.filter((p) => p.stamp !== null) ?? [];

  const onPhotoPicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setSavingPhoto(true);
    setPhotoError(null);
    try {
      const dataUrl = await fileToStampPhoto(file);
      await api.put('/api/auth/me/photo', { photo: dataUrl });
      await refreshMe();
    } catch {
      setPhotoError('Could not save that picture. Try a different image.');
    } finally {
      setSavingPhoto(false);
    }
  };

  return (
    <div className="px-5 pt-7 pb-8">
      <h1 className="font-display text-[34px] leading-tight">Profile</h1>
      <p className="mt-1 text-sm text-ink-soft">Your account and travel preferences</p>
      <motion.div
        className="mt-5 flex items-center gap-4 rounded-[24px] border border-black/4 bg-white p-4.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={() => photoInput.current?.click()}
          disabled={savingPhoto}
          className="relative shrink-0 rounded-full transition-transform active:scale-95 disabled:active:scale-100"
          aria-label={user?.photoUrl ? 'Replace profile photo' : 'Add a profile photo'}
          data-testid="profile-photo-tap-target"
        >
          <Avatar user={user} size={64} />
          <span className="pointer-events-none absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-teal shadow">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white" aria-hidden>
              <path d="M4 7h3.2L9 4.5h6L16.8 7H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 2.2a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6Zm0 1.8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
            </svg>
          </span>
        </button>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onPhotoPicked}
          data-testid="profile-photo-input"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[21px]">{user?.username}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <p>
              <span className="font-display text-lg">{stats?.stampCount ?? 0}</span>{' '}
              <span className="text-ink-soft">stamps</span>
            </p>
            <p>
              <span className="font-display text-lg">{stats?.countryCount ?? 0}</span>{' '}
              <span className="text-ink-soft">countries</span>
            </p>
          </div>
          {photoError && <p className="mt-1 text-xs text-terracotta">{photoError}</p>}
        </div>
      </motion.div>

      <div className="mt-3.5 flex items-center justify-between rounded-[24px] border border-black/4 bg-white p-4.5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <div>
          <p className="font-display text-[17px]">Units</p>
          <p className="text-xs text-ink-soft">Distances shown around the app</p>
        </div>
        <div className="flex shrink-0 rounded-2xl bg-black/5 p-1" data-testid="units-toggle">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              data-testid={`units-${u}`}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                units === u ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <h2 className="mt-7 mb-3 font-display text-[21px]">
        Collected stamps{' '}
        <span className="font-sans text-sm text-ink-soft">({collected.length})</span>
      </h2>
      {collected.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nothing collected yet — head to{' '}
          <Link to="/landmarks" className="underline underline-offset-2">
            Landmarks
          </Link>{' '}
          and start stamping your passport.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 pb-2" data-testid="collected-grid">
          {collected.map((p, i) => (
            <StampCard key={p.id} place={p} index={i} />
          ))}
        </div>
      )}

      <h2 className="mt-7 mb-3 font-display text-[21px]">My places</h2>
      {mine.length === 0 ? (
        <p className="text-sm text-ink-soft">
          None yet — tap the <span className="font-medium">+</span> button to add a place you
          love.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {mine.map((p, i) => (
            <li
              key={p.id}
              className="animate-card-in"
              style={{ animationDelay: `${Math.min(i, 24) * 16}ms` }}
            >
              <Link
                to={`/place/${p.id}`}
                className="flex items-center justify-between rounded-2xl border border-black/4 bg-white px-4 py-3 shadow-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display">{p.name}</span>
                  <span className="block truncate text-xs text-ink-soft">{p.country}</span>
                </span>
                <span className="text-xs text-ink-soft">{p.stamp ? 'Collected' : 'Locked'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {IS_LOCAL_BACKEND && (
        <div className="mt-8">
          <p className="mb-3 text-center text-xs text-ink-soft">
            Static mode — accounts and passports stay on this device only.
          </p>
          <Button
            variant="danger"
            className="w-full"
            onClick={async () => {
              if (
                !window.confirm(
                  'Reset your passport? All stamps and custom places on this device will be erased.',
                )
              ) {
                return;
              }
              const { resetLocalData } = await import('../lib/localBackend');
              await resetLocalData();
              window.location.reload();
            }}
          >
            Reset passport
          </Button>
        </div>
      )}

      <Button
        variant="danger"
        className={`${IS_LOCAL_BACKEND ? 'mt-3' : 'mt-8'} w-full`}
        onClick={async () => {
          await signOut();
          navigate('/auth', { replace: true });
        }}
        data-testid="sign-out"
      >
        Sign out
      </Button>
    </div>
  );
}
