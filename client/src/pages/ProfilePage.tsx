import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { usePlaces } from '../hooks/usePlaces';
import { Button } from '../components/Button';

export default function ProfilePage() {
  const { user, stats, signOut } = useAuth();
  const { places } = usePlaces();
  const navigate = useNavigate();

  const mine = places?.filter((p) => p.isMine) ?? [];

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl">Profile</h1>
      <div className="mt-4 rounded-2xl border border-ink/10 bg-paper-light p-4">
        <p className="font-display text-xl">{user?.displayName}</p>
        <p className="text-sm text-ink-soft">{user?.email}</p>
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
      </div>

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
          {mine.map((p) => (
            <li key={p.id}>
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
    </div>
  );
}
