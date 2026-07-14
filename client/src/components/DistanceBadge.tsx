import { COLLECT_RADIUS_M, formatDistance } from '../lib/geo';
import { useUnits } from '../hooks/useUnits';

export function DistanceBadge({ meters }: { meters: number }) {
  const { units } = useUnits();
  const inRange = meters <= COLLECT_RADIUS_M;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        inRange ? 'bg-teal/15 text-teal' : 'bg-ink/8 text-ink-soft'
      }`}
    >
      {inRange && <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />}
      {inRange ? 'In range' : formatDistance(meters, units)}
    </span>
  );
}
