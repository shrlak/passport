import { Router } from 'express';
import { db, type UserRow } from '../db.js';
import {
  createSession,
  currentUser,
  destroySession,
  hashPassword,
  requireAuth,
  verifyPassword,
} from '../auth.js';

export const authRouter = Router();

function serializeUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    createdAt: user.created_at,
  };
}

function statsFor(userId: number) {
  const { stampCount } = db
    .prepare('SELECT count(*) AS stampCount FROM stamps WHERE user_id = ?')
    .get(userId) as { stampCount: number };
  const { countryCount } = db
    .prepare(
      `SELECT count(DISTINCT p.country) AS countryCount
       FROM stamps s JOIN places p ON p.id = s.place_id
       WHERE s.user_id = ?`,
    )
    .get(userId) as { countryCount: number };
  return { stampCount, countryCount };
}

authRouter.post('/register', (req, res) => {
  const { email, password, displayName } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters.' });
    return;
  }
  const name =
    typeof displayName === 'string' && displayName.trim()
      ? displayName.trim().slice(0, 40)
      : email.split('@')[0];

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'EMAIL_TAKEN' });
    return;
  }
  const info = db
    .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
    .run(email, hashPassword(password), name);
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(info.lastInsertRowid) as UserRow;
  createSession(res, user.id);
  res.status(201).json({ user: serializeUser(user), stats: statsFor(user.id) });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    | UserRow
    | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    return;
  }
  createSession(res, user.id);
  res.json({ user: serializeUser(user), stats: statsFor(user.id) });
});

authRouter.post('/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (_req, res) => {
  const user = currentUser(res);
  res.json({ user: serializeUser(user), stats: statsFor(user.id) });
});
