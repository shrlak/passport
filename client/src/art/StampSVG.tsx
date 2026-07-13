import { useId } from 'react';
import { fnv1a, seeded } from '../lib/hash';
import { PALETTES } from './palettes';
import { LANDMARKS } from './landmarks';
import { MOTIFS } from './motifs';

// Everything a stamp needs to render; a full Place satisfies this.
export interface StampSubject {
  id: string;
  name: string;
  country: string;
  artKey?: string | null;
}

const W = 200;
const H = 240;
const PAPER = '#faf5e9';
// Art panel geometry (inside the perforated margin).
const P = { x: 14, y: 14, w: 172, h: 156 };
const GROUND_TOP = 150;
const LANDMARK_BASELINE = 154;

function perforationHoles(): { cx: number; cy: number }[] {
  const holes: { cx: number; cy: number }[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = (W / 12) * i;
    holes.push({ cx: x, cy: 0 }, { cx: x, cy: H });
  }
  for (let i = 1; i < 14; i++) {
    const y = (H / 14) * i;
    holes.push({ cx: 0, cy: y }, { cx: W, cy: y });
  }
  return holes;
}

const HOLES = perforationHoles();

function nameFontSize(name: string): number {
  if (name.length <= 12) return 15;
  if (name.length <= 16) return 13;
  if (name.length <= 21) return 11;
  return 9.5;
}

/** Deterministic vintage postage stamp. Same subject ⇒ same art, everywhere. */
export function StampSVG({
  subject,
  className,
}: {
  subject: StampSubject;
  className?: string;
}) {
  const uid = useId();
  const hash = fnv1a(subject.id);
  const rnd = seeded(hash);

  const art = (subject.artKey && LANDMARKS[subject.artKey]) || MOTIFS[hash % MOTIFS.length];
  const palette =
    art.paletteIndex !== undefined ? PALETTES[art.paletteIndex] : PALETTES[rnd(PALETTES.length)];

  // Hash-derived scene parameters.
  const sunCx = P.x + P.w * (0.25 + rnd(51) / 100);
  const sunCy = P.y + P.h * 0.22 + rnd(18);
  const sunR = 13 + rnd(8);
  const hillPeak1 = P.x + P.w * (0.15 + rnd(30) / 100);
  const hillPeak2 = P.x + P.w * (0.55 + rnd(30) / 100);
  const denomination = 5 + (hash % 80);

  const skyId = `sky-${uid}`;
  const clipId = `clip-${uid}`;
  const perfId = `perf-${uid}`;

  const groundY = GROUND_TOP;
  const hill = (peakX: number, peakY: number) =>
    `M${P.x} ${groundY} L${P.x} ${peakY + 14} Q${peakX} ${peakY} ${P.x + P.w} ${peakY + 20} L${P.x + P.w} ${groundY} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`${subject.name} stamp`}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.skyTop} />
          <stop offset="100%" stopColor={palette.skyBottom} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x={P.x} y={P.y} width={P.w} height={P.h} />
        </clipPath>
        <mask id={perfId}>
          <rect width={W} height={H} fill="white" />
          {HOLES.map((h, i) => (
            <circle key={i} cx={h.cx} cy={h.cy} r={5} fill="black" />
          ))}
        </mask>
      </defs>

      <g mask={`url(#${perfId})`}>
        {/* stamp paper */}
        <rect width={W} height={H} fill={PAPER} />

        {/* scene */}
        <g clipPath={`url(#${clipId})`}>
          <rect x={P.x} y={P.y} width={P.w} height={P.h} fill={`url(#${skyId})`} />
          <circle cx={sunCx} cy={sunCy} r={sunR + 14} fill="none" stroke={palette.sun} strokeWidth="1.5" opacity="0.25" />
          <circle cx={sunCx} cy={sunCy} r={sunR + 7} fill="none" stroke={palette.sun} strokeWidth="1.5" opacity="0.4" />
          <circle cx={sunCx} cy={sunCy} r={sunR} fill={palette.sun} />
          <path d={hill(hillPeak1, groundY - 34)} fill={palette.mid} opacity="0.35" />
          <path d={hill(hillPeak2, groundY - 20)} fill={palette.mid} opacity="0.55" />
          <g transform={`translate(35 ${LANDMARK_BASELINE - 130}) scale(1.3)`}>
            <path d={art.path} fill={palette.ink} fillRule="evenodd" />
            {art.accent && <path d={art.accent} fill={PAPER} fillRule="evenodd" opacity="0.92" />}
          </g>
          <rect x={P.x} y={groundY} width={P.w} height={P.y + P.h - groundY} fill={palette.ink} />
        </g>

        {/* frame */}
        <rect
          x={12}
          y={12}
          width={W - 24}
          height={160}
          fill="none"
          stroke={palette.ink}
          strokeWidth="1.4"
        />

        {/* denomination badge */}
        <circle cx={173} cy={27} r={9.5} fill={PAPER} opacity="0.9" />
        <text
          x={173}
          y={30.5}
          textAnchor="middle"
          fontFamily="'DM Serif Display', Georgia, serif"
          fontSize="10"
          fill={palette.ink}
        >
          {denomination}
        </text>

        {/* caption */}
        <text
          x={W / 2}
          y={196}
          textAnchor="middle"
          fontFamily="'DM Serif Display', Georgia, serif"
          fontSize={nameFontSize(subject.name)}
          letterSpacing="1"
          fill={palette.ink}
        >
          {subject.name.toUpperCase()}
        </text>
        <text
          x={W / 2}
          y={212}
          textAnchor="middle"
          fontFamily="'DM Serif Display', Georgia, serif"
          fontSize="7.5"
          letterSpacing="2.5"
          fill={palette.ink}
          opacity="0.75"
        >
          {subject.country.toUpperCase()}
        </text>
        <text
          x={W / 2}
          y={228}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="5"
          letterSpacing="1.8"
          fill={palette.ink}
          opacity="0.5"
        >
          STAMPQUEST • POSTAGE
        </text>
      </g>
    </svg>
  );
}
