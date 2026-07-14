import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePlaces } from '../hooks/usePlaces';
import { useUnits } from '../hooks/useUnits';
import { Button } from '../components/Button';
import { StampCard } from '../components/StampCard';
import { IS_LOCAL_BACKEND } from '../lib/api';

export default function ProfilePage() {
  const { user, stats, signOut } = useAuth();
  const { places } = usePlaces();
  const { units, setUnits } = useUnits();
  const navigate = useNavigate();

  const mine = places?.filter((p) => p.isMine) ?? [];
  const collected = places?.filter((p) => p.stamp !== null) ?? [];

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl">Profile</h1>
      <motion.div
        className="mt-4 rounded-2xl border border-ink/10 bg-paper-light p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-display text-xl">{user?.username}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <p>
            <span className="font-display text-lg">{stats?.stampCount ?? 0}</span>{' '}
            <span className="text-ink-soft">stamps</span>
          </p>
          <p>
            <span className="font-display text-lg">{stats?.countryCount ?? 0}</span>{' '}
            <span className="text-ink-soft">countries</span>
          </p>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-ink/10 bg-paper-light p-4">
        <div>
          <p className="font-display text-base">Units</p>
          <p className="text-xs text-ink-soft">Distances shown around the app</p>
        </div>
        <div className="flex shrink-0 rounded-xl border border-ink/10 bg-paper p-1" data-testid="units-toggle">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              data-testid={`units-${u}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                units === u ? 'bg-ink text-paper-light' : 'text-ink-soft'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <h2 className="mt-6 mb-2 font-display text-xl">
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

      <h2 className="mt-6 mb-2 font-display text-xl">My places</h2>
      {mine.length === 0 ? (
        <p className="text-sm text-ink-soft">
          None yet —{' '}
          <Link to="/add" className="underline underline-offset-2">
            add a place you love
          </Link>
          .
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
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper-light px-3 py-2.5"
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

      {IS_LOCAL_BACKEND ? (
        <div className="mt-8">
          <p className="mb-3 text-center text-xs text-ink-soft">
            Demo mode — your passport is stored on this device only.
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
              resetLocalData();
              window.location.reload();
            }}
          >
            Reset passport
          </Button>
        </div>
      ) : (
        <Button
          variant="danger"
          className="mt-8 w-full"
          onClick={async () => {
            await signOut();
            navigate('/auth', { replace: true });
          }}
          data-testid="sign-out"
        >
          Sign out
        </Button>
      )}
    </div>
  );
}
