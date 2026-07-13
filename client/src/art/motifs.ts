// Generic scene motifs for user-created places, same 100×100 convention as
// landmarks.ts (ground at y=100). Picked deterministically by place hash so
// custom stamps look as considered as curated ones.
import type { LandmarkArt } from './landmarks';

export const MOTIFS: LandmarkArt[] = [
  // mountain ridge
  {
    path: `M0 100 L16 62 L28 78 L44 38 L62 74 L74 58 L88 82 L100 74 L100 100 Z`,
    accent: `M44 38 L52 54 L48 51 L44 57 L40 51 L36 54 Z`,
  },
  // pine cluster
  {
    path: `M20 100 L20 92 L24 92 L24 100 Z M14 92 L22 64 L30 92 Z M12 78 L22 52 L32 78 Z
      M52 100 L52 88 L57 88 L57 100 Z M44 88 L54.5 50 L65 88 Z M42 68 L54.5 34 L67 68 Z
      M78 100 L78 94 L81 94 L81 100 Z M73 94 L79.5 72 L86 94 Z M72 82 L79.5 62 L87 82 Z`,
  },
  // lighthouse on rocks
  {
    path: `M40 92 L44 40 L56 40 L60 92 Z
      M42 40 L42 32 L58 32 L58 40 Z M44 32 L50 22 L56 32 Z
      M38 24 L44 30 L42 32 L36 27 Z M62 24 L56 30 L58 32 L64 27 Z
      M28 100 L36 88 L48 94 L62 86 L74 92 L82 84 L92 100 Z
      M46 52 L54 52 L54 58 L46 58 Z`,
  },
  // city skyline
  {
    path: `M8 100 L8 70 L20 70 L20 100 Z M22 100 L22 52 L32 52 L32 100 Z
      M34 100 L34 78 L46 78 L46 100 Z M48 100 L48 40 L50 40 L50 34 L54 34 L54 40 L58 40 L58 100 Z
      M60 100 L60 64 L72 64 L72 100 Z M74 100 L74 82 L88 82 L88 100 Z
      M25 58 L29 58 L29 62 L25 62 Z M63 70 L67 70 L67 74 L63 74 Z`,
  },
  // waves and sail
  {
    path: `M48 80 L48 34 L26 80 Z M52 80 L52 42 L70 80 Z M22 84 L76 84 L70 92 L28 92 Z
      M0 96 Q10 90 20 96 Q30 102 40 96 Q50 90 60 96 Q70 102 80 96 Q90 90 100 96 L100 100 L0 100 Z`,
  },
  // hot-air balloon
  {
    path: `M50 12 Q72 14 72 38 Q72 56 58 66 L58 72 L42 72 L42 66 Q28 56 28 38 Q28 14 50 12 Z
      M44 74 L56 74 L55 84 L45 84 Z
      M0 100 L30 90 L60 96 L100 88 L100 100 Z`,
    accent: `M46 14 Q40 26 40 40 Q40 54 46 64 L50 64 Q45 52 45 39 Q45 25 50 14 Z
      M54 14 Q60 26 60 40 Q60 54 54 64 L58 64 Q64 52 64 38 Q63 24 58 15 Z`,
  },
  // tent and campfire
  {
    path: `M16 100 L42 52 L68 100 Z M42 52 L48 62 L36 100 L30 100 Z
      M78 100 L78 96 L74 90 L80 92 L79 84 L84 90 L86 82 L88 90 L94 86 L90 94 L86 96 L86 100 Z
      M70 100 L96 100 L94 96 L72 96 Z`,
  },
  // compass rose
  {
    path: `M50 20 L56 46 L50 42 L44 46 Z M50 92 L44 66 L50 70 L56 66 Z
      M14 56 L40 50 L36 56 L40 62 Z M86 56 L60 62 L64 56 L60 50 Z
      M50 52 a5 5 0 1 0 0.01 0 Z
      M28 36 L44 48 L40 50 Z M72 36 L56 48 L60 50 Z M28 76 L44 64 L40 62 Z M72 76 L56 64 L60 62 Z
      M0 100 L100 100 L100 97 L0 97 Z`,
  },
];
