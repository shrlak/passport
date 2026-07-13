import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter } from './routes/auth.js';
import { placesRouter } from './routes/places.js';

const app = express();
app.disable('x-powered-by');
// generous limit: stamp photos arrive as base64 data URLs (client downscales first)
app.use(express.json({ limit: '8mb' }));

app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

// In production the server is the single deployable: it serves the built
// client (client/dist) with an SPA fallback for client-side routes.
const clientDist = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'client',
  'dist',
);
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(join(clientDist, 'index.html'));
  });
}

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`StampQuest API listening on http://localhost:${port}`);
});
