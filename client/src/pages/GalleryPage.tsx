import { StampSVG } from '../art/StampSVG';
import { LANDMARKS } from '../art/landmarks';
import { MOTIFS } from '../art/motifs';
import { fnv1a } from '../lib/hash';

// Hidden visual-QA harness: renders every curated silhouette plus one sample
// stamp per custom-place motif. Not linked from the UI; open /gallery.
const SAMPLE_NAMES: Record<string, { name: string; country: string }> = {
  eiffel: { name: 'Eiffel Tower', country: 'France' },
  liberty: { name: 'Statue of Liberty', country: 'United States' },
  bigben: { name: 'Big Ben', country: 'United Kingdom' },
  colosseum: { name: 'Colosseum', country: 'Italy' },
  tajmahal: { name: 'Taj Mahal', country: 'India' },
  pyramids: { name: 'Great Pyramid of Giza', country: 'Egypt' },
  operahouse: { name: 'Sydney Opera House', country: 'Australia' },
  goldengate: { name: 'Golden Gate Bridge', country: 'United States' },
  redeemer: { name: 'Christ the Redeemer', country: 'Brazil' },
  machu: { name: 'Machu Picchu', country: 'Peru' },
  fuji: { name: 'Mount Fuji', country: 'Japan' },
  torii: { name: 'Fushimi Inari Shrine', country: 'Japan' },
  sagrada: { name: 'Sagrada Família', country: 'Spain' },
  brandenburg: { name: 'Brandenburg Gate', country: 'Germany' },
  burj: { name: 'Burj Khalifa', country: 'United Arab Emirates' },
  petra: { name: 'Petra', country: 'Jordan' },
  angkor: { name: 'Angkor Wat', country: 'Cambodia' },
  greatwall: { name: 'Great Wall at Mutianyu', country: 'China' },
  moai: { name: 'Moai of Rapa Nui', country: 'Chile' },
  tablemountain: { name: 'Table Mountain', country: 'South Africa' },
  niagara: { name: 'Niagara Falls', country: 'Canada' },
  santorini: { name: 'Oia, Santorini', country: 'Greece' },
  neuschwanstein: { name: 'Neuschwanstein Castle', country: 'Germany' },
  acropolis: { name: 'Acropolis of Athens', country: 'Greece' },
};

const MOTIF_SAMPLES = [
  { name: 'Bear Lake Trailhead', country: 'United States' },
  { name: 'Nonna’s Trattoria', country: 'Italy' },
  { name: 'Old Harbour Light', country: 'Portugal' },
  { name: 'Kreuzberg Rooftop', country: 'Germany' },
  { name: 'Half Moon Bay', country: 'New Zealand' },
  { name: 'Cappadocia Sunrise', country: 'Türkiye' },
  { name: 'Lakeside Camp 12', country: 'Canada' },
  { name: 'The Wander Inn', country: 'Ireland' },
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="font-display text-2xl mb-4">Stamp gallery (QA)</h1>
      <h2 className="font-display text-lg mb-2">Curated landmarks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="gallery-curated">
        {Object.keys(LANDMARKS).map((key) => (
          <div key={key}>
            <StampSVG
              subject={{ id: `gallery-${key}`, artKey: key, ...SAMPLE_NAMES[key] }}
              illustrated
              locked={false}
              className="w-full drop-shadow-md"
            />
            <p className="text-xs text-ink-soft text-center mt-1">{key}</p>
          </div>
        ))}
      </div>
      <h2 className="font-display text-lg mt-8 mb-2">Custom-place motifs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="gallery-motifs">
        {MOTIF_SAMPLES.map((s, i) => (
          <div key={s.name}>
            {/* seed chosen so sample i lands on motif i */}
            <StampSVG
              subject={{ id: motifSeed(i), ...s }}
              illustrated
              locked={false}
              className="w-full drop-shadow-md"
            />
            <p className="text-xs text-ink-soft text-center mt-1">motif {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function motifSeed(target: number): string {
  for (let n = 0; n < 1000; n++) {
    const id = `motif-sample-${n}`;
    if (fnv1a(id) % MOTIFS.length === target) return id;
  }
  return 'motif-sample-0';
}
