import { motion } from 'framer-motion';

export function AddFab({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 z-30 flex h-15 w-15 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)] ring-1 ring-white/20"
      aria-label="Add a place"
      data-testid="add-fab"
    >
      <svg viewBox="0 0 24 24" className="h-6.5 w-6.5 fill-current" aria-hidden>
        <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z" />
      </svg>
    </motion.button>
  );
}
