import { Link } from 'react-router';
import { motion } from 'framer-motion';
import type { Place } from '../types';
import { StampSVG } from '../art/StampSVG';
import { fnv1a } from '../lib/hash';
import { formatCollectedDate } from '../lib/api';

export function StampCard({ place, index = 0 }: { place: Place; index?: number }) {
  const collected = place.stamp !== null;
  // pasted-in-the-album tilt, deterministic per place
  const rotation = collected ? ((fnv1a(place.id) >> 8) % 5) - 2 : 0;

  return (
    <div className="animate-card-in" style={{ animationDelay: `${Math.min(index, 24) * 16}ms` }}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      >
        <Link
          to={`/place/${place.id}`}
          className="group block"
          data-testid="stamp-card"
          data-collected={collected}
        >
          <div className="relative transition-transform duration-300 group-hover:scale-[1.025]" style={{ transform: `rotate(${rotation}deg)` }}>
            <StampSVG
              subject={place}
              photoUrl={place.stamp?.photoUrl}
              className={`w-full ${
                place.stamp?.photoUrl
                  ? 'drop-shadow-[0_5px_11px_rgba(0,0,0,0.2)]'
                  : 'saturate-[0.88] drop-shadow-[0_4px_9px_rgba(0,0,0,0.16)]'
              }`}
            />
          </div>
          {place.category === 'us-state' && place.state && (
            <p
              className="mt-2 text-center text-xs font-medium text-ink"
              data-testid="state-name"
            >
              {place.state}
            </p>
          )}
          <div className="mt-1.5 text-center">
            <p className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.02em] ${
              collected ? 'bg-olive/10 text-[#218345]' : 'bg-black/5 text-ink-soft'
            }`}>
              {collected
                ? place.stamp!.photoUrl
                  ? `Collected ${formatCollectedDate(place.stamp!.collectedAt)}`
                  : 'Collected · Add photo'
                : 'Locked · Visit to collect'}
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
