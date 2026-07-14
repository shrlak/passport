import { AnimatePresence, motion } from 'framer-motion';
import { useGeo } from '../hooks/useGeolocation';
import { Button } from './Button';

export function LocationOnboarding() {
  const {
    ready,
    onboardingComplete,
    loading,
    error,
    request,
    continueWithoutLocation,
  } = useGeo();

  return (
    <AnimatePresence>
      {ready && !onboardingComplete && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#111318]/45 px-3 pb-3 backdrop-blur-md sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="location-onboarding"
        >
          <motion.section
            className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/60 bg-white p-5 shadow-[0_30px_90px_rgba(18,23,38,0.28)]"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            aria-labelledby="location-title"
          >
            <div className="pointer-events-none absolute -top-18 -right-14 h-52 w-52 rounded-full bg-[radial-gradient(circle,#ffd08a_0%,#ffb95e_34%,transparent_68%)] opacity-70" />
            <div className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,#8dc8ff_0%,#5aa8f7_36%,transparent_68%)] opacity-55" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-ink text-white shadow-[0_12px_30px_rgba(29,29,31,0.24)]">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
                  <path d="M12 1.8a7.2 7.2 0 0 1 7.2 7.2c0 5-5.6 11.7-6.6 12.8a.8.8 0 0 1-1.2 0C10.4 20.7 4.8 14 4.8 9A7.2 7.2 0 0 1 12 1.8Zm0 4.2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </div>
              <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-teal uppercase">
                One-time setup
              </p>
              <h1 id="location-title" className="mt-1 font-display text-[30px] leading-[1.05]">
                Find the stamps around you.
              </h1>
              <p className="mt-3 max-w-[19rem] text-[15px] leading-relaxed text-ink-soft">
                Allow location once to sort nearby places and collect stamps when you arrive.
                We keep it only for this signed-in session and clear it when you sign out.
              </p>

              {error && (
                <p className="mt-4 rounded-2xl bg-terracotta/8 px-3.5 py-3 text-sm leading-snug text-terracotta" role="alert">
                  {error}
                </p>
              )}

              <Button
                className="mt-5 w-full"
                disabled={loading}
                onClick={() => void request()}
                data-testid="location-enable"
              >
                {loading ? 'Finding your location…' : 'Enable location'}
              </Button>
              <button
                type="button"
                onClick={continueWithoutLocation}
                disabled={loading}
                className="mt-2.5 w-full rounded-full py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-black/4 disabled:opacity-40"
                data-testid="location-skip"
              >
                Continue without location
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
