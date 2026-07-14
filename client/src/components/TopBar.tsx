import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';
import { BrandMark } from './BrandMark';

export function TopBar() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-b border-black/6 bg-paper-light/72 pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="flex h-16 items-center justify-between px-5">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl outline-none transition-opacity hover:opacity-75 focus-visible:ring-4 focus-visible:ring-teal/15"
          data-testid="topbar-home"
        >
          <BrandMark size={30} />
          <span className="font-display text-[17px]">StampQuest</span>
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
