PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  media_token TEXT NOT NULL,
  photo_mime TEXT,
  photo_updated_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS custom_places (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'landmark',
  state TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_custom_places_user ON custom_places(user_id);

CREATE TABLE IF NOT EXISTS stamps (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_country TEXT NOT NULL,
  collected_at TEXT NOT NULL,
  collected_lat REAL,
  collected_lng REAL,
  distance_m REAL,
  photo_mime TEXT,
  photo_updated_at TEXT,
  UNIQUE (user_id, place_id)
);
CREATE INDEX IF NOT EXISTS idx_stamps_user ON stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_user_country ON stamps(user_id, place_country);

PRAGMA optimize;
