// GitHub Pages stays usable before the cloud Worker is configured. Once
// VITE_API_URL is set, the same UI talks to the shared Cloudflare API instead.
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
export const IS_LOCAL_BACKEND =
  import.meta.env.VITE_BACKEND === 'local' || API_BASE_URL.length === 0;

const CLOUD_SESSION_KEY = 'stampquest.cloud.session.v1';
const migrationKey = (userId: number) => `stampquest.cloud.migrated.${userId}.v1`;

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public data: Record<string, unknown>,
  ) {
    super(code);
  }
}

interface RawResponse {
  status: number;
  ok: boolean;
  data: Record<string, unknown>;
}

async function cloudFetch(path: string, method: string, requestBody?: unknown): Promise<RawResponse> {
  const token = localStorage.getItem(CLOUD_SESSION_KEY);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'omit',
    headers: {
      ...(requestBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
  });
  return {
    status: res.status,
    ok: res.ok,
    data: (await res.json().catch(() => ({}))) as Record<string, unknown>,
  };
}

function rememberSession(result: RawResponse): void {
  const token = result.data.sessionToken;
  if (result.ok && typeof token === 'string') {
    localStorage.setItem(CLOUD_SESSION_KEY, token);
  }
}

async function migrateVerifiedLocalAccount(
  username: string,
  password: string,
  result: RawResponse,
): Promise<RawResponse> {
  const user = result.data.user as { id?: unknown } | undefined;
  if (!result.ok || typeof user?.id !== 'number' || localStorage.getItem(migrationKey(user.id))) {
    return result;
  }
  const { exportLocalAccount } = await import('./localBackend');
  const snapshot = await exportLocalAccount(username, password);
  if (!snapshot) {
    const finalized = await cloudFetch('/api/migrate', 'POST', { complete: true });
    if (!finalized.ok) return finalized;
    localStorage.setItem(migrationKey(user.id), new Date().toISOString());
    return cloudFetch('/api/auth/me', 'GET');
  }

  let migration: RawResponse = { status: 200, ok: true, data: {} };
  let needsProfilePhoto = false;
  const missingPhotoPlaceIds = new Set<string>();
  const migrateBatch = async (payload: Record<string, unknown>): Promise<boolean> => {
    migration = await cloudFetch('/api/migrate', 'POST', payload);
    if (!migration.ok) return false;
    needsProfilePhoto ||= migration.data.needsProfilePhoto === true;
    if (Array.isArray(migration.data.missingPhotoPlaceIds)) {
      for (const value of migration.data.missingPhotoPlaceIds) {
        if (typeof value === 'string') missingPhotoPlaceIds.add(value);
      }
    }
    return true;
  };

  // The bounds mirror the Worker endpoint and keep every invocation below
  // Cloudflare D1's free-plan query cap, even for a large local passport.
  for (const customPlaces of chunks(snapshot.customPlaces, 80)) {
    if (!(await migrateBatch({ customPlaces }))) return migration;
  }
  for (const stamps of chunks(snapshot.stamps, 160)) {
    if (!(await migrateBatch({ stamps }))) return migration;
  }
  for (const photoPlaceIds of chunks(Object.keys(snapshot.stampPhotos), 200)) {
    if (!(await migrateBatch({ photoPlaceIds }))) return migration;
  }
  // Also handles empty passports and determines whether the cloud profile
  // photo is missing after all metadata has been merged.
  if (!(await migrateBatch({ complete: true }))) return migration;

  if (snapshot.profilePhoto && needsProfilePhoto) {
    const uploaded = await cloudFetch('/api/auth/me/photo', 'PUT', {
      photo: snapshot.profilePhoto,
    });
    if (!uploaded.ok) return uploaded;
  }
  for (const placeId of missingPhotoPlaceIds) {
    const photo = snapshot.stampPhotos[placeId];
    if (!photo) continue;
    const uploaded = await cloudFetch(
      `/api/places/${encodeURIComponent(placeId)}/photo`,
      'PUT',
      { photo },
    );
    if (!uploaded.ok) return uploaded;
  }

  localStorage.setItem(migrationKey(user.id), new Date().toISOString());
  return cloudFetch('/api/auth/me', 'GET');
}

async function cloudRequest<T>(path: string, method: string, requestBody?: unknown): Promise<T> {
  let result = await cloudFetch(path, method, requestBody);
  let shouldMigrateLocalAccount = path === '/api/auth/register' && method === 'POST';

  // Existing Pages users already have valid local credentials. On their first
  // cloud sign-in, transparently claim the same username and migrate that
  // device's passport if no cloud account exists yet.
  if (
    path === '/api/auth/login' &&
    method === 'POST' &&
    result.status === 401 &&
    requestBody &&
    typeof requestBody === 'object'
  ) {
    const credentials = requestBody as Record<string, unknown>;
    if (typeof credentials.username === 'string' && typeof credentials.password === 'string') {
      const { exportLocalAccount } = await import('./localBackend');
      if (await exportLocalAccount(credentials.username, credentials.password)) {
        const registration = await cloudFetch('/api/auth/register', 'POST', requestBody);
        if (registration.ok) {
          result = registration;
          shouldMigrateLocalAccount = true;
        }
      }
    }
  }

  if (
    result.ok &&
    (path === '/api/auth/login' || path === '/api/auth/register') &&
    requestBody &&
    typeof requestBody === 'object'
  ) {
    rememberSession(result);
    const credentials = requestBody as Record<string, unknown>;
    if (
      shouldMigrateLocalAccount &&
      typeof credentials.username === 'string' &&
      typeof credentials.password === 'string'
    ) {
      result = await migrateVerifiedLocalAccount(
        credentials.username,
        credentials.password,
        result,
      );
    }
  }

  if (path === '/api/auth/logout') {
    localStorage.removeItem(CLOUD_SESSION_KEY);
    // A stale server session should not trap someone in the signed-in UI.
    if (result.status === 401) {
      result = { status: 200, ok: true, data: { ok: true } };
    }
  }
  if (!result.ok) {
    throw new ApiError(
      result.status,
      typeof result.data.error === 'string' ? result.data.error : 'UNKNOWN',
      result.data,
    );
  }
  return result.data as T;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  if (IS_LOCAL_BACKEND) {
    const { localRequest } = await import('./localBackend');
    const { status, data } = await localRequest(path, method, body);
    if (status >= 400) {
      const d = data as Record<string, unknown>;
      throw new ApiError(status, typeof d.error === 'string' ? d.error : 'UNKNOWN', d);
    }
    return data as T;
  }
  return cloudRequest<T>(path, method, body);
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put: <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  delete: <T>(path: string) => request<T>(path, 'DELETE'),
};

/** SQLite's datetime('now') is UTC without a timezone marker. */
export function parseServerDate(s: string): Date {
  return new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
}

export function formatCollectedDate(s: string): string {
  return parseServerDate(s).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
