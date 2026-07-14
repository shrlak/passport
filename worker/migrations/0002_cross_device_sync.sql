ALTER TABLE users ADD COLUMN data_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN local_migration_session_hash TEXT;
ALTER TABLE users ADD COLUMN local_migration_started_at TEXT;
ALTER TABLE users ADD COLUMN local_migration_completed_at TEXT;

PRAGMA optimize;
