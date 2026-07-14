import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { BrandMark } from '../components/BrandMark';
import { StampSVG } from '../art/StampSVG';
import { ApiError } from '../lib/api';

const ERROR_COPY: Record<string, string> = {
  INVALID_CREDENTIALS: 'Wrong username or password.',
  USERNAME_TAKEN: 'That username is already taken — try signing in, or pick another.',
  INVALID_USERNAME: 'Usernames are 3–24 characters: letters, numbers, and underscores only.',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',
};

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signin') await signIn(username, password);
      else await signUp(username, password);
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
    <motion.main
      className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center overflow-hidden px-5 py-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute -top-32 -left-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,#9bd0ff_0%,#dcefff_38%,transparent_70%)] opacity-65" />
      <div className="pointer-events-none absolute -right-36 -bottom-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,#ffd28d_0%,#ffedcc_38%,transparent_70%)] opacity-70" />
      <div className="pointer-events-none absolute top-[13%] -left-8 w-24 -rotate-[12deg] opacity-45 blur-[0.2px]" aria-hidden>
        <StampSVG
          subject={{ id: 'auth-paris', name: 'Paris', country: 'France', artKey: 'eiffel' }}
          locked={false}
          className="w-full drop-shadow-lg"
        />
      </div>
      <div className="pointer-events-none absolute right-[-2rem] bottom-[12%] w-24 rotate-[10deg] opacity-40 blur-[0.2px]" aria-hidden>
        <StampSVG
          subject={{ id: 'auth-tokyo', name: 'Tokyo', country: 'Japan', artKey: 'fuji' }}
          locked={false}
          className="w-full drop-shadow-lg"
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto mb-4 rounded-[18px] shadow-[0_14px_36px_rgba(74,56,44,0.2)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <BrandMark size={76} />
      </motion.div>
      <p className="relative z-10 text-center text-[10px] font-bold tracking-[0.16em] text-teal uppercase">Your world in stamps</p>
      <h1 className="relative z-10 mt-1 text-center font-display text-[40px] leading-tight">StampQuest</h1>
      <p className="relative z-10 mx-auto mt-2 max-w-72 text-center text-[15px] leading-relaxed text-ink-soft">
        Turn the places you visit into a passport that is entirely yours.
      </p>

      <form
        onSubmit={submit}
        className="glass-panel relative z-10 mt-7 flex flex-col gap-3 rounded-[30px] p-5"
      >
        <div className="mb-1">
          <p className="eyebrow text-ink-soft">{mode === 'signin' ? 'Continue the journey' : 'Begin the journey'}</p>
          <p className="font-display text-xl">
            {mode === 'signin' ? 'Welcome back' : 'Create your passport'}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {mode === 'signin'
              ? 'Sign in to continue your collection.'
              : 'Your collection stays private to your account.'}
          </p>
        </div>
        <input
          className="input"
          required
          placeholder="Username"
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          title="Letters, numbers, and underscores only"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          data-testid="auth-username"
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
          data-testid="auth-password"
        />
        {error && (
          <p className="rounded-xl bg-terracotta/8 px-3 py-2.5 text-sm text-terracotta" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="mt-1 w-full" data-testid="auth-submit">
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <button
        type="button"
        className="relative z-10 mx-auto mt-4 rounded-full border border-white/70 bg-white/62 px-4 py-2.5 text-center text-sm font-semibold text-teal shadow-sm backdrop-blur-xl transition-transform hover:-translate-y-0.5"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          setError(null);
        }}
      >
        {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
      </button>
    </motion.main>
  );
}
