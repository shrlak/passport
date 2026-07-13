import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHEMA } from './schema.js';
import { CURATED_PLACES } from './seed.js';

const DEFAULT_DB_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'stampquest.db',
);

const dbPath = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH;
if (dbPath !== ':memory:') {
  mkdirSync(dirname(dbPath), { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(SCHEMA);

const placeCount = db
  .prepare('SELECT count(*) AS n FROM places WHERE is_curated = 1')
  .get() as { n: number };

if (placeCount.n === 0) {
  const insert = db.prepare(
    `INSERT INTO places (id, name, country, description, lat, lng, is_curated, art_key)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
  );
  const seedAll = db.transaction(() => {
    for (const p of CURATED_PLACES) {
      insert.run(randomUUID(), p.name, p.country, p.description, p.lat, p.lng, p.artKey);
    }
  });
  seedAll();
  console.log(`Seeded ${CURATED_PLACES.length} curated places`);
}

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export interface PlaceRow {
  id: string;
  name: string;
  country: string;
  description: string;
  lat: number;
  lng: number;
  is_curated: number;
  created_by: number | null;
  art_key: string | null;
  created_at: string;
}

export interface StampRow {
  id: string;
  user_id: number;
  place_id: string;
  collected_at: string;
  collected_lat: number | null;
  collected_lng: number | null;
  distance_m: number | null;
}
