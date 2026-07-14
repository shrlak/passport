import assert from 'node:assert/strict';

const baseUrl = (process.env.STAMPQUEST_TEST_URL ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const password = 'sync-pass-123';
const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function request(path, { method = 'GET', token, body, expectedStatus } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Origin: 'https://shrlak.github.io',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (expectedStatus === undefined) {
    assert.ok(response.ok, `${method} ${path} returned ${response.status}: ${JSON.stringify(data)}`);
  } else {
    assert.equal(
      response.status,
      expectedStatus,
      `${method} ${path} returned ${response.status}: ${JSON.stringify(data)}`,
    );
  }
  return data;
}

const sharedUsername = `sync_${suffix}`.slice(0, 24);
const first = await request('/api/auth/register', {
  method: 'POST',
  body: { username: sharedUsername, password },
});
await request('/api/migrate', {
  method: 'POST',
  token: first.sessionToken,
  body: { complete: true },
});
const second = await request('/api/auth/login', {
  method: 'POST',
  body: { username: sharedUsername, password },
});
assert.equal(first.user.id, second.user.id, 'both sessions must resolve the same D1 user');

const beforePlace = await request('/api/sync', { token: second.sessionToken });
const created = await request('/api/places', {
  method: 'POST',
  token: first.sessionToken,
  body: {
    name: 'Shared test place',
    country: 'United States',
    description: 'Cross-device integration check',
    lat: 41.8781,
    lng: -87.6298,
    category: 'city',
  },
});
const afterPlace = await request('/api/sync', { token: second.sessionToken });
assert.ok(afterPlace.version > beforePlace.version, 'a write must advance the shared version');
const secondPlaces = await request('/api/places', { token: second.sessionToken });
assert.ok(
  secondPlaces.places.some((place) => place.id === created.place.id),
  'the second session must see a place created by the first',
);

const radiusTargets = secondPlaces.places.filter(
  (place) => place.isCurated && Math.abs(place.lat) < 80,
);
assert.ok(radiusTargets.length >= 2, 'the curated catalog must provide radius test targets');
const withinTarget = radiusTargets[0];
const outsideTarget = radiusTargets[1];
await request(`/api/places/${encodeURIComponent(withinTarget.id)}/collect-photo`, {
  method: 'POST',
  token: first.sessionToken,
  body: {
    photo: tinyPng,
    photoLat: withinTarget.lat + 0.1,
    photoLng: withinTarget.lng,
  },
});
const outsideRadius = await request(
  `/api/places/${encodeURIComponent(outsideTarget.id)}/collect-photo`,
  {
    method: 'POST',
    token: first.sessionToken,
    expectedStatus: 403,
    body: {
      photo: tinyPng,
      photoLat: outsideTarget.lat + 0.2,
      photoLng: outsideTarget.lng,
    },
  },
);
assert.equal(outsideRadius.error, 'PHOTO_TOO_FAR');

await request('/api/auth/me/photo', {
  method: 'PUT',
  token: first.sessionToken,
  body: { photo: tinyPng },
});
const afterPhoto = await request('/api/sync', { token: second.sessionToken });
assert.ok(afterPhoto.version > afterPlace.version, 'a photo update must advance the shared version');
const secondMe = await request('/api/auth/me', { token: second.sessionToken });
assert.equal(typeof secondMe.user.photoUrl, 'string', 'the second session must receive the R2 photo URL');
const photo = await fetch(secondMe.user.photoUrl);
assert.equal(photo.status, 200, 'the shared R2 photo must be readable');
assert.equal(photo.headers.get('content-type'), 'image/png');

const migrationUsername = `migrate_${suffix}`.slice(0, 24);
const migrationOwner = await request('/api/auth/register', {
  method: 'POST',
  body: { username: migrationUsername, password },
});
const ownerPlaceId = `legacy-owner-${suffix}`;
const blockedPlaceId = `legacy-blocked-${suffix}`;
await request('/api/migrate', {
  method: 'POST',
  token: migrationOwner.sessionToken,
  body: {
    customPlaces: [
      {
        id: ownerPlaceId,
        name: 'Owner legacy place',
        country: 'United States',
        description: '',
        lat: 40.7128,
        lng: -74.006,
        category: 'city',
        createdAt: new Date().toISOString(),
      },
    ],
  },
});
const competingSession = await request('/api/auth/login', {
  method: 'POST',
  body: { username: migrationUsername, password },
});
const busy = await request('/api/migrate', {
  method: 'POST',
  token: competingSession.sessionToken,
  body: {
    customPlaces: [
      {
        id: blockedPlaceId,
        name: 'Blocked legacy place',
        country: 'United States',
        description: '',
        lat: 34.0522,
        lng: -118.2437,
        category: 'city',
        createdAt: new Date().toISOString(),
      },
    ],
  },
});
assert.equal(busy.migrationBusy, true, 'a second device must not own the legacy import');
await request('/api/migrate', {
  method: 'POST',
  token: migrationOwner.sessionToken,
  body: { complete: true },
});
const completed = await request('/api/migrate', {
  method: 'POST',
  token: competingSession.sessionToken,
  body: {
    customPlaces: [
      {
        id: blockedPlaceId,
        name: 'Blocked legacy place',
        country: 'United States',
        description: '',
        lat: 34.0522,
        lng: -118.2437,
        category: 'city',
        createdAt: new Date().toISOString(),
      },
    ],
  },
});
assert.equal(completed.migrationComplete, true);
const canonicalPlaces = await request('/api/places', { token: competingSession.sessionToken });
assert.ok(canonicalPlaces.places.some((place) => place.id === ownerPlaceId));
assert.ok(!canonicalPlaces.places.some((place) => place.id === blockedPlaceId));

console.log(
  JSON.stringify({
    ok: true,
    sameUserId: first.user.id,
    versionAfterPlace: afterPlace.version,
    versionAfterPhoto: afterPhoto.version,
    migrationOwnerEnforced: true,
    r2PhotoShared: true,
    tenMileRadiusEnforced: true,
  }),
);
