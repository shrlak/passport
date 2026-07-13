// Hand-tuned vintage travel-poster palettes. Curated landmarks may pin one
// (see landmarks.ts); custom places pick by hash.
export interface Palette {
  skyTop: string;
  skyBottom: string;
  sun: string;
  mid: string;
  ink: string;
}

export const PALETTES: Palette[] = [
  // 0 dawn — apricot sky, terracotta sun
  { skyTop: '#f4d3a0', skyBottom: '#efae7e', sun: '#d96f4e', mid: '#c08a63', ink: '#4a382c' },
  // 1 lagoon — sea-glass teal over cream
  { skyTop: '#a3c6be', skyBottom: '#e9dfc0', sun: '#e0a458', mid: '#6f9a8d', ink: '#2d4741' },
  // 2 sakura — rose sky, indigo hills
  { skyTop: '#e9b7ba', skyBottom: '#f5e0d1', sun: '#c1554d', mid: '#9187ab', ink: '#3b3352' },
  // 3 harvest — mustard noon, olive ground
  { skyTop: '#e9c46a', skyBottom: '#f4e8c2', sun: '#cd7a3d', mid: '#8b9a5b', ink: '#3d431f' },
  // 4 kiln — sand sky, oxblood sun
  { skyTop: '#e6c69f', skyBottom: '#f3e5cb', sun: '#a63d2f', mid: '#c58f66', ink: '#57312a' },
  // 5 harbor — chambray sky, amber sun
  { skyTop: '#9cbcd3', skyBottom: '#e4e8db', sun: '#e8b04b', mid: '#5f8aa2', ink: '#2c4453' },
  // 6 dusk — mauve to peach
  { skyTop: '#b394b4', skyBottom: '#edccb1', sun: '#e2814f', mid: '#7d6386', ink: '#43304e' },
  // 7 alpine — celadon sky, pine ground
  { skyTop: '#b6caa9', skyBottom: '#ede6c5', sun: '#d99a3d', mid: '#5d7d59', ink: '#31422e' },
  // 8 sirocco — burnt-gold sky, pale sun disc
  { skyTop: '#ecd8b5', skyBottom: '#d9a441', sun: '#f5efdf', mid: '#b86944', ink: '#53341e' },
  // 9 nocturne — slate night, moon disc
  { skyTop: '#4d5c82', skyBottom: '#8f9cb6', sun: '#eee1ba', mid: '#3a476b', ink: '#252d45' },
];
