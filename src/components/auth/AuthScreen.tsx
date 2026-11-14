import React, { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { networkService } from '../../services/networkService';
import { SafeImage } from '../ui/SafeImage';

export const AuthScreen: React.FC = () => {
  const { setStage, loginDemoUser, pushToast } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('elena.vance@phantomx.io');
  const [password, setPassword] = useState('PhantomX#2026');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'Enter password' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score, label: 'Weak' };
    if (score <= 3) return { score, label: 'Moderate' };
    return { score, label: 'Strong' };
  }, [password]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (mode === 'signup' && fullName.trim().length < 2) {
      next.fullName = 'Enter your full name (minimum 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Enter a valid email address.';
    }
    if (password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }
    if (mode === 'signup' && confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    setAuthNotice('');

    try {
      if (mode === 'login') {
        const res = await networkService.authLogin(email.trim(), password);
        loginDemoUser(res.user.email, res.user.fullName);
      } else {
        const res = await networkService.authSignup(
          email.trim(),
          password,
          fullName.trim(),
        );
        if (res.requiresEmailConfirm) {
          setAuthNotice(
            'Account created. Check your inbox to confirm your email address before signing in.',
          );
          pushToast('Confirmation email sent.', 'info');
        } else {
          loginDemoUser(res.user.email, res.user.fullName);
        }
      }
    } catch (err: any) {
      setErrors({ form: err?.message || 'Authentication request failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--np-canvas)] flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-10">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStage('splash-onboarding')}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => loginDemoUser()}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-accent)] hover:bg-[var(--np-accent-soft)] transition-colors whitespace-nowrap cursor-pointer"
        >
          Open Workspace
        </button>
      </header>

      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--np-border)] shrink-0">
              <SafeImage
                src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
                alt="PhantomX"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--np-text-primary)]">
                PhantomX
              </h1>
              <p className="text-xs text-[var(--np-text-secondary)]">
                Network Behaviour Guardian Console
              </p>
            </div>
          </div>

          {/* Segmented Mode Switch */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrors({});
                setAuthNotice('');
              }}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--np-surface)] text-[var(--np-text-primary)] shadow-xs border border-[var(--np-border)]'
                  : 'text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrors({});
                setAuthNotice('');
                setPassword('');
              }}
              className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--np-surface)] text-[var(--np-text-primary)] shadow-xs border border-[var(--np-border)]'
                  : 'text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="np-fullname"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Analyst Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="np-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Vance"
                    className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="np-email"
                className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="np-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@company.io"
                  className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="np-password"
                className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="np-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full min-h-[44px] pl-10 pr-11 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="min-w-[44px] min-h-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--np-text-muted)] hover:text-[var(--np-text-primary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
              )}

              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 rounded-full ${
                          passwordStrength.score >= bar
                            ? passwordStrength.score >= 4
                              ? 'bg-emerald-500'
                              : passwordStrength.score >= 2
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            : 'bg-slate-500/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--np-text-muted)]">
                    Strength: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="np-confirm"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="np-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-[var(--np-text-secondary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--np-border)] accent-sky-500 w-4 h-4"
                  />
                  <span>Keep session active</span>
                </label>
                <button
                  type="button"
                  onClick={() => loginDemoUser()}
                  className="text-[var(--np-accent)] hover:underline cursor-pointer"
                >
                  Quick sign in
                </button>
              </div>
            )}

            {errors.form && (
              <p className="text-xs text-rose-500 p-2.5 rounded-lg bg-rose-500/10">
                {errors.form}
              </p>
            )}

            {authNotice && (
              <p className="text-xs text-emerald-500 p-2.5 rounded-lg bg-emerald-500/10">
                {authNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-70 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              {submitting
                ? 'Authenticating...'
                : mode === 'login'
                  ? 'Sign In to Workspace'
                  : 'Create Account'}
            </button>
          </form>
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-[var(--np-text-muted)]">
        PhantomX · Intelligent Network Behaviour Guardian
      </footer>
    </div>
  );
};
