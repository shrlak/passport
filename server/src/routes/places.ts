import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db, type PlaceRow, type StampRow } from '../db.js';
import { currentUser, requireAuth } from '../auth.js';
import { COLLECT_RADIUS_M, haversineMeters } from '../geo.js';

export const placesRouter = Router();
placesRouter.use(requireAuth);

function serializeStamp(stamp: StampRow) {
  return {
    id: stamp.id,
    placeId: stamp.place_id,
    collectedAt: stamp.collected_at,
    distanceM: stamp.distance_m,
  };
}

function serializePlace(place: PlaceRow, stamp: StampRow | null) {
  return {
    id: place.id,
    name: place.name,
    country: place.country,
    description: place.description,
    lat: place.lat,
    lng: place.lng,
    isCurated: place.is_curated === 1,
    isMine: place.created_by !== null,
    artKey: place.art_key,
    createdAt: place.created_at,
    stamp: stamp ? serializeStamp(stamp) : null,
  };
}

// A place is visible to a user if it's curated or their own custom place.
function visiblePlace(placeId: string, userId: number): PlaceRow | undefined {
  return db
    .prepare(
      'SELECT * FROM places WHERE id = ? AND (is_curated = 1 OR created_by = ?)',
    )
    .get(placeId, userId) as PlaceRow | undefined;
}

function stampFor(placeId: string, userId: number): StampRow | null {
  const row = db
    .prepare('SELECT * FROM stamps WHERE place_id = ? AND user_id = ?')
    .get(placeId, userId) as StampRow | undefined;
  return row ?? null;
}

placesRouter.get('/', (_req, res) => {
  const user = currentUser(res);
  const places = db
    .prepare(
      `SELECT * FROM places WHERE is_curated = 1 OR created_by = ?
       ORDER BY is_curated DESC, name`,
    )
    .all(user.id) as PlaceRow[];
  res.json({
    places: places.map((p) => serializePlace(p, stampFor(p.id, user.id))),
  });
});

placesRouter.post('/', (req, res) => {
  const user = currentUser(res);
  const { name, country, description, lat, lng } = (req.body ?? {}) as Record<
    string,
    unknown
  >;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
    res.status(400).json({ error: 'INVALID_NAME' });
    return;
  }
  if (typeof country !== 'string' || !country.trim() || country.trim().length > 60) {
    res.status(400).json({ error: 'INVALID_COUNTRY' });
    return;
  }
  if (
    typeof lat !== 'number' || typeof lng !== 'number' ||
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    res.status(400).json({ error: 'INVALID_COORDINATES' });
    return;
  }
  const desc = typeof description === 'string' ? description.trim().slice(0, 400) : '';
  const id = randomUUID();
  db.prepare(
    `INSERT INTO places (id, name, country, description, lat, lng, is_curated, created_by)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(id, name.trim(), country.trim(), desc, lat, lng, user.id);
  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as PlaceRow;
  res.status(201).json({ place: serializePlace(place, null) });
});

placesRouter.get('/:id', (req, res) => {
  const user = currentUser(res);
  const place = visiblePlace(req.params.id, user.id);
  if (!place) {
    res.status(404).json({ error: 'PLACE_NOT_FOUND' });
    return;
  }
  res.json({ place: serializePlace(place, stampFor(place.id, user.id)) });
});

placesRouter.delete('/:id', (req, res) => {
  const user = currentUser(res);
  const info = db
    .prepare('DELETE FROM places WHERE id = ? AND created_by = ? AND is_curated = 0')
    .run(req.params.id, user.id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'PLACE_NOT_FOUND' });
    return;
  }
  res.json({ ok: true });
});

placesRouter.post('/:id/collect', (req, res) => {
  const user = currentUser(res);
  const place = visiblePlace(req.params.id, user.id);
  if (!place) {
    res.status(404).json({ error: 'PLACE_NOT_FOUND' });
    return;
  }
  const { lat, lng } = (req.body ?? {}) as Record<string, unknown>;
  if (
    typeof lat !== 'number' || typeof lng !== 'number' ||
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    res.status(400).json({ error: 'INVALID_COORDINATES' });
    return;
  }
  // Authoritative proximity check — the client-side gate is cosmetic.
  const distanceM = haversineMeters(lat, lng, place.lat, place.lng);
  if (distanceM > COLLECT_RADIUS_M) {
    res.status(403).json({ error: 'TOO_FAR', distanceM: Math.round(distanceM) });
    return;
  }
  if (stampFor(place.id, user.id)) {
    res.status(409).json({ error: 'ALREADY_COLLECTED' });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO stamps (id, user_id, place_id, collected_lat, collected_lng, distance_m)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, user.id, place.id, lat, lng, distanceM);
  const stamp = db.prepare('SELECT * FROM stamps WHERE id = ?').get(id) as StampRow;
  res.status(201).json({ stamp: serializeStamp(stamp) });
});
