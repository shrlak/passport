// FNV-1a 32-bit — deterministic seed for all stamp art parameters, so a
// stamp renders identically on every device with zero stored artwork.
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Split a hash into an infinite sequence of small ints for art parameters. */
export function seeded(hash: number): (max: number) => number {
  let state = hash || 1;
  return (max: number) => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state % max;
  };
}
