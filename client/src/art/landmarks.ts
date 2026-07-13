// Hand-authored landmark silhouettes for curated places, keyed by art_key
// (kept in sync with server/src/seed.ts). Each path lives in a 100×100 box
// with the ground line at y=100; StampSVG scales and anchors it. `accent`
// is an optional second path drawn in stamp-paper color (snow, mist, cloud).
// Fill rule is evenodd, so counter-wound subpaths punch holes (clock faces,
// arches).
export interface LandmarkArt {
  path: string;
  accent?: string;
  paletteIndex?: number;
}

export const LANDMARKS: Record<string, LandmarkArt> = {
  eiffel: {
    paletteIndex: 0,
    path: `M49 0 L51 0 L50.7 6 L49.3 6 Z
      M50 4 L53 22 L51.5 22 L56 46 L54 46 L61 72 L57.5 72 L68 92 L74 100 L58 100
      Q50 82 42 100 L26 100 L32 92 L42.5 72 L39 72 L46 46 L44 46 L48.5 22 L47 22 Z
      M36 44 L64 44 L64 48 L36 48 Z
      M42 68 L58 68 L58 72 L42 72 Z`,
  },
  liberty: {
    paletteIndex: 5,
    path: `M38 100 L38 80 L34 80 L36 72 L64 72 L66 80 L62 80 L62 100 Z
      M46 72 L44 48 Q44 40 50 38 Q56 40 56 48 L54 72 Z
      M50 24 a6 6 0 1 0 0.01 0 Z
      M46 24 L42 16 L47 21 Z M50 22 L50 12 L52.5 21 Z M54 23 L59 15 L56.5 22 Z
      M55 44 L66 24 L69 26 L59 47 Z
      M67 21 a2.8 2.8 0 1 0 0.01 0 Z
      M67.8 13 L66 19.5 L70.3 18.7 Z
      M45 48 L37 55 L40 58 L46 53 Z`,
  },
  bigben: {
    paletteIndex: 9,
    path: `M40 100 L40 34 L36 34 L50 6 L64 34 L60 34 L60 100 Z
      M50 30 a8 8 0 1 0 0.01 0 Z
      M38 58 L62 58 L62 61 L38 61 Z`,
  },
  colosseum: {
    paletteIndex: 4,
    path: `M8 100 L8 74 Q8 64 18 62 L40 56 L40 52 Q40 47 46 46 L74 41 Q80 40 80 46 L80 51 L88 53 Q92 54 92 62 L92 100 Z
      M14 100 a5 9 0 0 1 10 0 Z M30 100 a5 9 0 0 1 10 0 Z M46 100 a5 9 0 0 1 10 0 Z
      M62 100 a5 9 0 0 1 10 0 Z M78 100 a5 9 0 0 1 10 0 Z
      M18 72 a2.5 3.5 0 1 0 0.01 0 Z M30 70 a2.5 3.5 0 1 0 0.01 0 Z
      M42 68 a2.5 3.5 0 1 0 0.01 0 Z M54 66 a2.5 3.5 0 1 0 0.01 0 Z
      M66 65 a2.5 3.5 0 1 0 0.01 0 Z M78 66 a2.5 3.5 0 1 0 0.01 0 Z
      M46 58 a2.5 3.5 0 1 0 0.01 0 Z M58 56 a2.5 3.5 0 1 0 0.01 0 Z M70 55 a2.5 3.5 0 1 0 0.01 0 Z`,
  },
  tajmahal: {
    paletteIndex: 2,
    path: `M9 100 L9 55 Q9 50 11 50 Q13 50 13 55 L13 100 Z
      M87 100 L87 55 Q87 50 89 50 Q91 50 91 55 L91 100 Z
      M22 100 L22 68 L78 68 L78 100 Z
      M50 30 Q66 38 62 54 Q60 62 50 64 Q40 62 38 54 Q34 38 50 30 Z
      M38 61 L62 61 L62 68 L38 68 Z
      M49 21 L51 21 L50.6 32 L49.4 32 Z
      M25 68 a6 6 0 0 1 12 0 Z M63 68 a6 6 0 0 1 12 0 Z
      M44 100 L44 84 Q50 76 56 84 L56 100 Z`,
  },
  pyramids: {
    paletteIndex: 8,
    path: `M2 100 L30 58 L58 100 Z
      M30 100 L62 42 L96 100 Z
      M60 100 L80 76 L100 100 Z`,
  },
  operahouse: {
    paletteIndex: 1,
    path: `M6 100 L6 93 L94 93 L94 100 Z
      M12 93 Q18 70 40 61 L40 93 Z
      M34 93 Q42 60 62 53 L62 93 Z
      M58 93 Q68 58 84 55 L84 68 Q77 79 74 93 Z`,
  },
  goldengate: {
    paletteIndex: 6,
    path: `M14 100 L14 34 L18 34 L18 100 Z M24 100 L24 34 L28 34 L28 100 Z
      M12 42 L30 42 L30 45 L12 45 Z M12 56 L30 56 L30 59 L12 59 Z
      M72 100 L72 34 L76 34 L76 100 Z M82 100 L82 34 L86 34 L86 100 Z
      M70 42 L88 42 L88 45 L70 45 Z M70 56 L88 56 L88 59 L70 59 Z
      M0 76 L100 76 L100 80 L0 80 Z
      M16 36 Q50 78 84 36 L84 40 Q50 82 16 40 Z
      M0 60 Q7 38 16 36 L16 40 Q9 43 2 63 Z
      M100 60 Q93 38 84 36 L84 40 Q91 43 98 63 Z`,
  },
  redeemer: {
    paletteIndex: 0,
    path: `M50 44 a4.5 4.5 0 1 0 0.01 0 Z
      M24 56 L76 56 L76 60 L54 60 L54 63 L46 63 L46 60 L24 60 Z
      M46 63 L44 88 L56 88 L54 63 Z
      M43 88 L57 88 L59 95 L41 95 Z
      M24 100 Q50 86 76 100 Z`,
  },
  machu: {
    paletteIndex: 7,
    path: `M36 84 Q50 26 60 42 Q70 56 80 84 Z
      M6 100 L6 94 L18 94 L18 88 L30 88 L30 82 L42 82 L42 88 L56 88 L56 82 L70 82 L70 88 L82 88 L82 94 L94 94 L94 100 Z
      M30 82 L42 82 L42 76 L34 76 Z`,
  },
  fuji: {
    paletteIndex: 2,
    path: `M6 100 Q13 96 21 78 Q32 52 44 40 L56 40 Q68 52 79 78 Q87 96 94 100 Z`,
    accent: `M44 40 L56 40 Q60 45 58 49 L54 44 L50 50 L46 44 L42 49 Q40 45 44 40 Z`,
  },
  torii: {
    paletteIndex: 4,
    path: `M12 28 Q50 20 88 28 L88 35 Q50 27 12 35 Z
      M46.5 35 L53.5 35 L53.5 46 L46.5 46 Z
      M20 48 L80 48 L80 54 L20 54 Z
      M26 100 L29 33 L35 33 L38 100 Z
      M62 100 L65 33 L71 33 L74 100 Z`,
  },
  sagrada: {
    paletteIndex: 6,
    path: `M22 100 L25 56 Q26 48 28 48 Q30 48 31 56 L34 100 Z
      M34 100 L37 41 Q38 33 40 33 Q42 33 43 41 L46 100 Z
      M46 100 L48.5 28 Q50 21 51.5 28 L54 100 Z
      M54 100 L57 41 Q58 33 60 33 Q62 33 63 41 L66 100 Z
      M66 100 L69 56 Q70 48 72 48 Q74 48 75 56 L78 100 Z
      M20 100 L20 78 L80 78 L80 100 Z
      M46 100 L46 89 Q50 84 54 89 L54 100 Z`,
  },
  brandenburg: {
    paletteIndex: 5,
    path: `M12 52 L88 52 L88 44 L12 44 Z
      M20 44 L80 44 L80 36 L20 36 Z
      M42 36 L58 36 L58 27 L42 27 Z
      M43 27 L47 20 L49 27 Z M51 27 L55 19 L57 27 Z
      M14 100 L14 55 L22 55 L22 100 Z M26 100 L26 55 L34 55 L34 100 Z
      M38 100 L38 55 L46 55 L46 100 Z M54 100 L54 55 L62 55 L62 100 Z
      M66 100 L66 55 L74 55 L74 100 Z M78 100 L78 55 L86 55 L86 100 Z`,
  },
  burj: {
    paletteIndex: 8,
    path: `M38 100 L38 78 L42 78 L42 56 L46 56 L46 34 L48.4 34 L49.4 6 L50.6 6 L51.6 34 L54 34 L54 56 L58 56 L58 78 L62 78 L62 100 Z
      M29 100 L29 84 L38 84 L38 100 Z M62 100 L62 84 L71 84 L71 100 Z`,
  },
  petra: {
    paletteIndex: 4,
    path: `M22 100 L22 60 L78 60 L78 100 L70 100 L70 72 L64 72 L64 100 L58 100 L58 74 L42 74 L42 100 L36 100 L36 72 L30 72 L30 100 Z
      M42 100 L42 78 L58 78 L58 100 L54 100 L54 82 L46 82 L46 100 Z
      M24 56 L24 44 L40 49 L40 56 Z
      M60 56 L76 44 L76 56 Z
      M44 56 L44 42 Q50 36 56 42 L56 56 Z
      M48 40 L52 40 L51.5 32 L48.5 32 Z`,
  },
  angkor: {
    paletteIndex: 0,
    path: `M10 100 L10 88 L14 88 L14 80 L86 80 L86 88 L90 88 L90 100 Z
      M42 80 L43.5 62 L45.5 62 L46.5 48 L48.5 48 L49.5 34 L50.5 34 L51.5 48 L53.5 48 L54.5 62 L56.5 62 L58 80 Z
      M20 80 L21.5 66 L23.5 66 L24.5 54 L25.5 54 L26.5 66 L28.5 66 L30 80 Z
      M70 80 L71.5 66 L73.5 66 L74.5 54 L75.5 54 L76.5 66 L78.5 66 L80 80 Z`,
  },
  greatwall: {
    paletteIndex: 7,
    path: `M0 84 Q25 62 50 70 Q75 78 100 56 L100 66 Q75 86 50 78 Q25 70 0 94 Z
      M56 74 L56 52 L59 52 L59 48 L62 48 L62 52 L66 52 L66 48 L69 48 L69 52 L72 52 L72 76 Z`,
  },
  moai: {
    paletteIndex: 6,
    path: `M40 100 L40 96 L38 96 L39 84 L35 84 L36.5 72 L32.5 72 L34.5 58 L30.5 56 L33.5 47 Q36 33 48 29 Q64 25 68 38 Q70 44 69 58 L66 96 L66 100 Z`,
  },
  tablemountain: {
    paletteIndex: 1,
    path: `M0 100 L7 95 L19 66 L27 58 L73 58 L81 66 L93 95 L100 100 Z`,
    accent: `M27 58 L73 58 Q68 65 58 63 Q45 67 35 62 Q29 62 27 58 Z`,
  },
  niagara: {
    paletteIndex: 5,
    path: `M8 46 Q50 37 92 46 L92 53 Q50 44 8 53 Z
      M14 51 Q50 42 86 51 L86 98 L14 98 Z`,
    accent: `M20 57 Q50 49 80 57 L80 88 Q70 92 62 89 Q50 94 38 89 Q28 92 20 88 Z
      M30 62 L32 62 L32 84 L30 84 Z M42 60 L44 60 L44 86 L42 86 Z
      M56 60 L58 60 L58 86 L56 86 Z M68 62 L70 62 L70 84 L68 84 Z
      M24 94 a6 5 0 1 0 0.01 0 Z M40 96 a7 5 0 1 0 0.01 0 Z
      M58 95 a7 5 0 1 0 0.01 0 Z M74 94 a6 5 0 1 0 0.01 0 Z`,
  },
  santorini: {
    paletteIndex: 5,
    path: `M14 100 L14 78 L24 78 L24 64 L38 64 L38 74 L52 74 L52 58 Q58 49 64 58 L64 70 L78 70 L78 82 L86 82 L86 100 Z
      M28 64 L28 48 L30 43 L34 43 L36 48 L36 64 Z`,
  },
  neuschwanstein: {
    paletteIndex: 7,
    path: `M18 100 L18 54 L22 54 L27 39 L32 54 L36 54 L36 100 Z
      M44 100 L44 40 L48 40 L53 23 L58 40 L62 40 L62 100 Z
      M70 100 L70 54 L74 54 L79 39 L84 54 L88 54 L88 100 Z
      M36 100 L36 68 L44 68 L44 100 Z M62 100 L62 68 L70 68 L70 100 Z
      M38 68 L38 58 L40 52 L42 58 L42 68 Z M64 68 L64 58 L66 52 L68 58 L68 68 Z`,
  },
  acropolis: {
    paletteIndex: 3,
    path: `M4 100 Q20 88 32 86 L68 86 Q80 88 96 100 Z
      M24 84 L76 84 L76 80 L24 80 Z
      M26 80 L26 62 L29.5 62 L29.5 80 Z M32.5 80 L32.5 62 L36 62 L36 80 Z
      M39 80 L39 62 L42.5 62 L42.5 80 Z M45.5 80 L45.5 62 L49 62 L49 80 Z
      M51 80 L51 62 L54.5 62 L54.5 80 Z M57.5 80 L57.5 62 L61 62 L61 80 Z
      M64 80 L64 62 L67.5 62 L67.5 80 Z M70.5 80 L70.5 62 L74 62 L74 80 Z
      M24 62 L76 62 L76 57 L24 57 Z
      M22 57 L50 45 L78 57 Z`,
  },
};
