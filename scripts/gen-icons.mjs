// Renders the app icon with the preinstalled Playwright chromium — no
// image-processing dependencies. Run from the repo root:
//   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/gen-icons.mjs
// (or just `npm run gen-icons` after `npx playwright install chromium`).
// Outputs are committed, so this only needs re-running when the mark changes.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'client', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// App mark shared with BrandMark.tsx: a globe and outbound flight on an
// Apple-style blue rounded square.
const iconSvg = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sky" x1="${pad}" y1="${pad}" x2="${512 - pad}" y2="${512 - pad}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2997ff"/><stop offset="1" stop-color="#0066cc"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#f5f5f7"/>
  <rect x="${pad}" y="${pad}" width="${512 - 2 * pad}" height="${512 - 2 * pad}" rx="${(512 - 2 * pad) * 0.28}" fill="url(#sky)"/>
  <circle cx="256" cy="244" r="${(512 - 2 * pad) * 0.25}" fill="none" stroke="white" stroke-width="${(512 - 2 * pad) * 0.05}"/>
  <path d="M${pad + 0.23 * (512 - 2 * pad)} 244H${512 - pad - 0.23 * (512 - 2 * pad)}M256 ${pad + 0.23 * (512 - 2 * pad)}C${256 + 0.16 * (512 - 2 * pad)} ${pad + 0.4 * (512 - 2 * pad)} ${256 + 0.16 * (512 - 2 * pad)} ${512 - pad - 0.4 * (512 - 2 * pad)} 256 ${512 - pad - 0.23 * (512 - 2 * pad)}C${256 - 0.16 * (512 - 2 * pad)} ${512 - pad - 0.4 * (512 - 2 * pad)} ${256 - 0.16 * (512 - 2 * pad)} ${pad + 0.4 * (512 - 2 * pad)} 256 ${pad + 0.23 * (512 - 2 * pad)}Z" fill="none" stroke="white" stroke-width="${(512 - 2 * pad) * 0.036}" stroke-linecap="round"/>
  <path d="m${512 - pad - 0.31 * (512 - 2 * pad)} ${pad + 0.24 * (512 - 2 * pad)} ${0.25 * (512 - 2 * pad)} ${-0.1 * (512 - 2 * pad)} ${-0.1 * (512 - 2 * pad)} ${0.25 * (512 - 2 * pad)} ${-0.05 * (512 - 2 * pad)} ${-0.05 * (512 - 2 * pad)} ${-0.13 * (512 - 2 * pad)} ${0.13 * (512 - 2 * pad)} ${-0.08 * (512 - 2 * pad)} ${-0.08 * (512 - 2 * pad)} ${0.13 * (512 - 2 * pad)} ${-0.13 * (512 - 2 * pad)}Z" fill="white"/>
</svg>`;

const html = (svg, size) =>
  `<!doctype html><style>html,body{margin:0}</style><div style="width:${size}px;height:${size}px">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 600 } });

const targets = [
  // maskable needs generous padding (safe zone = inner 80%)
  { file: 'pwa-512.png', size: 512, pad: 64 },
  { file: 'pwa-192.png', size: 192, pad: 64 },
  { file: 'apple-touch-icon.png', size: 180, pad: 48 },
];

for (const t of targets) {
  await page.setContent(html(iconSvg(t.pad), t.size));
  const el = page.locator('div');
  await el.screenshot({ path: join(outDir, t.file) });
  console.log('wrote', t.file);
}

await browser.close();
