import type { User } from '../types';

export function Avatar({ user, size = 36 }: { user: User | null; size?: number }) {
  const initial = user?.username?.[0]?.toUpperCase() ?? '?';
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#2997ff] to-[#0066cc] font-display text-white shadow-[0_2px_8px_rgba(0,0,0,0.14)]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {user?.photoUrl ? (
        <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
