import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useGeo } from '../hooks/useGeolocation';
import { usePlaces } from '../hooks/usePlaces';
import { useUnits } from '../hooks/useUnits';
import { haversineMeters } from '../lib/geo';
import { SearchInput } from '../components/SearchInput';
import { StampCard } from '../components/StampCard';
import type { PlaceCategory } from '../types';

// Leaflet is a hefty dependency (~150 kB) — only fetch it when someone
// actually switches to map view, not on every page load.
const CategoryMapView = lazy(() => import('../components/CategoryMapView'));

const CATEGORY_META: Record<
  PlaceCategory,
  { title: string; placeholder: string; noun: string; center: [number, number]; zoom: number }
> = {
  landmark: {
    title: 'Landmarks',
    placeholder: 'Search landmarks…',
    noun: 'landmarks',
    center: [20, 10],
    zoom: 2,
  },
  city: {
    title: 'Cities',
    placeholder: 'Search cities…',
    noun: 'cities',
    center: [25, 10],
    zoom: 2,
  },
  'us-state': {
    title: 'US States',
    placeholder: 'Search states…',
    noun: 'states',
    center: [39.5, -98.5],
    zoom: 3,
  },
};

// Reached only by tapping a card on the home page — there's no persistent
// tab for these anymore, so a back chevron is the way home.
export default function CategoryExplorePage({ category }: { category: PlaceCategory }) {
  const meta = CATEGORY_META[category];
  const navigate = useNavigate();
  const { position } = useGeo();
  const { places } = usePlaces();
  const { units } = useUnits();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'cards' | 'map'>('cards');

  const categoryPlaces = useMemo(
    () => places?.filter((p) => p.category === category) ?? null,
    [places, category],
  );

  const q = query.trim().toLowerCase();
  const filtered = categoryPlaces
    ? categoryPlaces.filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q),
      )
    : null;

  // Sorted by distance once we have a position (granted from any screen);
  // otherwise alphabetically, so search is useful even before that.
  const sorted = filtered
    ? filtered
        .map((p) => ({
          place: p,
          distance: position ? haversineMeters(position.lat, position.lng, p.lat, p.lng) : null,
        }))
        .sort((a, b) =>
          a.distance !== null && b.distance !== null
            ? a.distance - b.distance
            : a.place.name.localeCompare(b.place.name),
        )
    : null;

  return (
    <div className="px-5 pt-5">
      <motion.button
        type="button"
        onClick={() => navigate('/')}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-2xl shadow-sm"
        aria-label="Back to home"
        data-testid="back-button"
      >
        ‹
      </motion.button>

      <div className="mb-5">
        <h1 className="font-display text-[34px] leading-tight">{meta.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {categoryPlaces ? `${categoryPlaces.length} places to discover` : 'Loading places…'}
        </p>
      </div>

      {categoryPlaces && categoryPlaces.length > 0 && (
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={meta.placeholder}
              data-testid={`${category}-search`}
            />
          </div>
          <div className="flex shrink-0 rounded-2xl bg-black/5 p-1" role="group" aria-label="View">
            {(['cards', 'map'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                data-testid={`${category}-view-${v}`}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  view === v ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
                }`}
              >
                {v === 'cards' ? 'Cards' : 'Map'}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted && sorted.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-soft">
          No {meta.noun} match “{query}”.
        </p>
      )}

      {view === 'cards' ? (
        sorted &&
        sorted.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-7" data-testid={`${category}-cards`}>
            {sorted.map(({ place }, i) => (
              <StampCard key={place.id} place={place} index={i} />
            ))}
          </div>
        )
      ) : (
        <div
          className="h-[65vh] overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          data-testid={`${category}-map`}
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-ink-soft">
                Loading map…
              </div>
            }
          >
            <CategoryMapView
              places={sorted ?? []}
              center={meta.center}
              zoom={meta.zoom}
              units={units}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
