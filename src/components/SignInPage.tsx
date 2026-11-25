import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export interface AuthUser {
  id?: number | string;
  email: string;
  name?: string | null;
  role?: string;
}

interface SignInPageProps {
  onSuccess?: (user: AuthUser) => void;
  onLogin?: (user: AuthUser) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const contentType = res.headers.get('content-type');
      const data =
        contentType && contentType.includes('application/json')
          ? await res.json()
          : null;

      if (!res.ok) {
        setErrorMessage(data?.error || 'Invalid credentials. Please try again.');
        return;
      }

      const authenticatedUser: AuthUser = data?.user || { email: cleanEmail };
      onSuccess?.(authenticatedUser);
      onLogin?.(authenticatedUser);
    } catch {
      setErrorMessage('Network error while signing in. Check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-neutral-100 font-sans antialiased flex items-center justify-center px-4 py-12 selection:bg-amber-500/30">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#121214] p-7 shadow-2xl space-y-6">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="YazooBlu Studio OS"
            className="w-11 h-11 rounded-xl bg-amber-500 p-0.5 object-contain shadow-lg shadow-amber-500/20"
          />
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight font-mono">
              Yazooblu // Studio OS
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Sovereign Session Authentication
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800/80 pt-5">
          <h2 className="text-sm font-bold text-white font-mono">Operator Sign In</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in with your PostgreSQL operator credentials to access the studio workspace.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-200 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="signin-email" className="block text-xs font-mono text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@yazooblu.com"
                className="w-full rounded-xl border border-neutral-800 bg-[#0b0b0c] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signin-password" className="block text-xs font-mono text-neutral-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-[#0b0b0c] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs uppercase tracking-wider py-3 px-4 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Studio OS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
