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
    <div className="px-4 pt-3 pb-8">
      <div className="mb-4 px-1">
        <p className="eyebrow text-teal">Traveler identity</p>
        <h1 className="mt-1 font-display text-[36px] leading-tight">Your profile</h1>
      </div>
      <motion.div
        className="relative overflow-hidden rounded-[32px] bg-midnight p-5 text-white shadow-[0_24px_70px_rgba(20,25,39,0.25)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-none absolute -top-24 -right-14 h-64 w-64 rounded-full bg-[radial-gradient(circle,#2f7fcc_0%,#254a72_38%,transparent_70%)] opacity-75" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,#d67453_0%,#7e4638_38%,transparent_70%)] opacity-50" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden>
          <path d="M-20 170 C70 80 123 206 205 112 S307 46 382 82" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 8" className="animate-route-dash" />
        </svg>

        <div className="relative z-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            disabled={savingPhoto}
            className="relative shrink-0 rounded-full transition-transform active:scale-95 disabled:active:scale-100"
            aria-label={user?.photoUrl ? 'Replace profile photo' : 'Add a profile photo'}
            data-testid="profile-photo-tap-target"
          >
            <span className="block rounded-full border-2 border-white/30 p-1 shadow-xl">
              <Avatar user={user} size={68} />
            </span>
            <span className="pointer-events-none absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-[10px] border-2 border-midnight bg-white text-ink shadow">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                <path d="M4 7h3.2L9 4.5h6L16.8 7H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 2.2a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6Z" />
              </svg>
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-white/45">Passport holder</p>
            <p className="mt-1 truncate font-display text-[25px]">{user?.username}</p>
            <p className="mt-1 text-[12px] text-white/55">Building a world of personal stamps.</p>
            {photoError && <p className="mt-1 text-xs text-[#ff9b90]">{photoError}</p>}
          </div>
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onPhotoPicked}
          data-testid="profile-photo-input"
        />

        <div className="relative z-10 mt-5 grid grid-cols-2 divide-x divide-white/12 rounded-[18px] border border-white/10 bg-white/8 py-3 backdrop-blur-xl">
          <div className="text-center">
            <p className="font-display text-[23px]">{stats?.stampCount ?? 0}</p>
            <p className="eyebrow mt-1 text-white/40">Stamps</p>
          </div>
          <div className="text-center">
            <p className="font-display text-[23px]">{stats?.countryCount ?? 0}</p>
            <p className="eyebrow mt-1 text-white/40">Countries</p>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel mt-3.5 flex items-center justify-between rounded-[24px] p-4.5">
        <div>
          <p className="eyebrow text-ink-soft">Preference</p>
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
                units === u ? 'bg-ink text-white shadow-sm' : 'text-ink-soft'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 mb-3 flex items-end justify-between px-1">
        <div>
          <p className="eyebrow text-ink-soft">Your album</p>
          <h2 className="mt-1 font-display text-[23px]">Collected stamps</h2>
        </div>
        <span className="text-xs font-semibold text-ink-soft">{collected.length} total</span>
      </div>
      {collected.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nothing collected yet — head to{' '}
          <Link to="/landmarks" className="underline underline-offset-2">
            Landmarks
          </Link>{' '}
          and start stamping your passport.
        </p>
      ) : (
        <div className="rounded-[26px] border border-white/70 bg-white/48 p-3 shadow-[0_14px_40px_rgba(24,32,52,0.07)] backdrop-blur-lg">
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 pb-2" data-testid="collected-grid">
            {collected.map((p, i) => (
              <StampCard key={p.id} place={p} index={i} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 mb-3 px-1">
        <p className="eyebrow text-ink-soft">Made by you</p>
        <h2 className="mt-1 font-display text-[23px]">My places</h2>
      </div>
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
                className="glass-panel group flex items-center justify-between rounded-[20px] px-4 py-3.5 transition-transform hover:-translate-y-0.5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display">{p.name}</span>
                  <span className="block truncate text-xs text-ink-soft">{p.country}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${p.stamp ? 'bg-olive/12 text-olive' : 'bg-black/5 text-ink-soft'}`}>
                  {p.stamp ? 'Collected' : 'Locked'}
                </span>
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
