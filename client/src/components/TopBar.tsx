import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';
import { BrandMark } from './BrandMark';
import { useGeo } from '../hooks/useGeolocation';

export function TopBar() {
  const { user } = useAuth();
  const { position } = useGeo();
  return (
    <header className="pointer-events-none fixed top-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-3 pt-[calc(env(safe-area-inset-top)+0.55rem)]">
      <div className="pointer-events-auto flex h-15 items-center justify-between rounded-[21px] border border-white/75 bg-white/78 px-3.5 shadow-[0_12px_38px_rgba(24,32,52,0.12)] backdrop-blur-2xl backdrop-saturate-150">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl outline-none transition-opacity hover:opacity-75 focus-visible:ring-4 focus-visible:ring-teal/15"
          data-testid="topbar-home"
        >
          <BrandMark size={30} />
          <span>
            <span className="block font-display text-[16px] leading-none">StampQuest</span>
            <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold tracking-[0.08em] text-ink-soft uppercase">
              <span className={`h-1.5 w-1.5 rounded-full ${position ? 'bg-olive' : 'bg-ink/20'}`} />
              {position ? 'Location ready' : 'Photo mode'}
            </span>
          </span>
        </Link>
        <Link
          to="/profile"
          aria-label="Profile"
          data-testid="topbar-profile"
          className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-teal/15"
        >
          <Avatar user={user} size={36} />
        </Link>
      </div>
    </header>
  );
}
