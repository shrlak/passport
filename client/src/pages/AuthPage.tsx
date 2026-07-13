import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { StampSVG } from '../art/StampSVG';
import { ApiError } from '../lib/api';

const ERROR_COPY: Record<string, string> = {
  INVALID_CREDENTIALS: 'Wrong email or password.',
  EMAIL_TAKEN: 'An account with this email already exists — try signing in.',
  INVALID_EMAIL: 'That doesn’t look like a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',
};

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password, displayName);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (ERROR_COPY[err.code] ?? 'Something went wrong. Try again.')
          : 'Could not reach the server. Are you online?',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mx-auto mb-4 w-28 rotate-[-3deg]">
        <StampSVG
          subject={{ id: 'welcome', name: 'StampQuest', country: 'Your travel passport', artKey: 'eiffel' }}
          illustrated
          className="w-full drop-shadow-[0_3px_6px_rgba(47,42,36,0.25)]"
        />
      </div>
      <h1 className="text-center font-display text-4xl">StampQuest</h1>
      <p className="mt-1 text-center text-sm text-ink-soft">
        Collect stamps from the places you visit.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            className="input"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            maxLength={40}
          />
        )}
        <input
          className="input"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="input"
          type="password"
          required
          minLength={8}
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} data-testid="auth-submit">
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <button
        type="button"
        className="mt-4 text-center text-sm text-ink-soft underline underline-offset-2"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          setError(null);
        }}
      >
        {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
      </button>
    </div>
  );
}
