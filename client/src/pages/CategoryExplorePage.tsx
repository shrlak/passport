import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useGeo } from '../hooks/useGeolocation';
import { usePlaces } from '../hooks/usePlaces';
import { useUnits } from '../hooks/useUnits';
import { haversineMeters } from '../lib/geo';
import { Button } from '../components/Button';
import { DistanceBadge } from '../components/DistanceBadge';
import { SearchInput } from '../components/SearchInput';
import { StampSVG } from '../art/StampSVG';
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
    placeholder: 'Search landmarks or countries…',
    noun: 'landmarks',
    center: [20, 10],
    zoom: 2,
  },
  city: {
    title: 'Cities',
    placeholder: 'Search cities or countries…',
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

export default function CategoryExplorePage({ category }: { category: PlaceCategory }) {
  const meta = CATEGORY_META[category];
  const { position, error, loading, request } = useGeo();
  const { places } = usePlaces();
  const { units } = useUnits();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');

  const categoryPlaces = useMemo(
    () => places?.filter((p) => p.category === category) ?? null,
    [places, category],
  );

  const q = query.trim().toLowerCase();
  const filtered = categoryPlaces
    ? categoryPlaces.filter(
        (p) => !q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q),
      )
    : null;

  // Sorted by distance once we have a position; otherwise alphabetically, so
  // search is useful even before location is granted.
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
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between">
        <h1 className="font-display text-3xl">{meta.title}</h1>
        {view === 'list' && position && (
          <button
            type="button"
            onClick={request}
            disabled={loading}
            className="text-sm text-teal underline underline-offset-2 disabled:opacity-50"
          >
            {loading ? 'Locating…' : 'Refresh location'}
          </button>
        )}
      </header>

      {categoryPlaces && categoryPlaces.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={meta.placeholder}
              data-testid={`${category}-search`}
            />
          </div>
          <div className="flex shrink-0 rounded-xl border border-ink/10 bg-paper-light p-1">
            {(['list', 'map'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                data-testid={`${category}-view-${v}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v ? 'bg-ink text-paper-light' : 'text-ink-soft'
                }`}
              >
                {v === 'list' ? 'List' : 'Map'}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'list' ? (
        <>
          {!position && (
            <div className="mb-5 rounded-2xl border border-ink/10 bg-paper-light p-5 text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 fill-teal" aria-hidden>
                <path d="M12 2a7 7 0 0 1 7 7c0 4.5-4.7 10.3-6.4 12.2a.8.8 0 0 1-1.2 0C9.7 19.3 5 13.5 5 9a7 7 0 0 1 7-7Zm0 4.4A2.6 2.6 0 1 0 12 11.6 2.6 2.6 0 0 0 12 6.4Z" />
              </svg>
              <h2 className="mt-2 font-display text-lg">Find stamps near you</h2>
              <p className="mx-auto mt-1 max-w-64 text-sm text-ink-soft">
                Enable location to see how far you are from each stamp — get within 500 m to
                collect.
              </p>
              <Button onClick={request} disabled={loading} className="mt-3" data-testid="enable-location">
                {loading ? 'Locating…' : 'Enable location'}
              </Button>
              {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
            </div>
          )}

          {sorted && sorted.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-soft">
              No {meta.noun} match “{query}”.
            </p>
          )}

          {sorted && sorted.length > 0 && (
            <ul className="flex flex-col gap-2 pb-6" data-testid={`${category}-list`}>
              {sorted.map(({ place, distance }, i) => (
                <li
                  key={place.id}
                  className="animate-card-in"
                  style={{ animationDelay: `${Math.min(i, 24) * 14}ms` }}
                >
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  >
                    <Link
                      to={`/place/${place.id}`}
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper-light p-2.5"
                    >
                      <div className="w-12 shrink-0">
                        <StampSVG
                          subject={place}
                          photoUrl={place.stamp?.photoUrl}
                          className={place.stamp ? 'w-full' : 'w-full opacity-60 grayscale'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display">{place.name}</p>
                        <p className="truncate text-xs text-ink-soft">{place.country}</p>
                      </div>
                      {place.stamp ? (
                        <span className="rounded-full bg-mustard/20 px-2.5 py-1 text-[11px] font-medium text-ink">
                          Collected
                        </span>
                      ) : distance !== null ? (
                        <DistanceBadge meters={distance} />
                      ) : null}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div
          className="-mx-4 h-[65vh] overflow-hidden border-y border-ink/10"
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
