import { motion } from 'framer-motion';

export function AddFab({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 z-30 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-[22px] bg-ink text-white shadow-[0_16px_38px_rgba(18,22,32,0.32)] ring-1 ring-white/25 before:absolute before:inset-1 before:rounded-[18px] before:border before:border-white/10"
      aria-label="Add a place"
      data-testid="add-fab"
    >
      <svg viewBox="0 0 24 24" className="relative h-6.5 w-6.5 fill-current" aria-hidden>
        <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z" />
      </svg>
    </motion.button>
  );
}
