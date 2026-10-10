
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Award,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);

        if (!res.success) {
          setErrorMsg(res.error || 'Sign in failed.');
          return;
        }

        onClose();
        return;
      }

      const res = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        role
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Sign up failed.');
        return;
      }

      setSuccessMsg(
        'Account created successfully! Check your email to confirm registration.'
      );
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode((current) =>
      current === 'signin' ? 'signup' : 'signin'
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-md shadow-xl flex flex-col max-h-[90vh] my-auto overflow-hidden text-[var(--ink)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h2
                id="auth-modal-title"
                className="text-base sm:text-lg font-bold font-serif leading-tight"
              >
                {mode === 'signin'
                  ? 'Sign In to AptiQuiz'
                  : 'Create Account'}
              </h2>

              <p className="text-[11px] text-[var(--ink-muted)]">
                {mode === 'signin'
                  ? 'Access placement stats & custom sessions'
                  : 'Join as student competitor or faculty advisor'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close authentication modal"
            className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="p-3 bg-[var(--wrong-tint)] border border-[var(--wrong)] text-[var(--wrong)] rounded text-xs font-medium"
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="p-3 bg-[var(--correct-tint)] border border-[var(--correct)] text-[var(--correct)] rounded text-xs font-medium"
              >
                {successMsg}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label
                    htmlFor="auth-full-name"
                    className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--brand)]" />
                      Full Name *
                    </span>
                  </label>

                  <input
                    id="auth-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-role"
                    className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[var(--brand)]" />
                      Role *
                    </span>
                  </label>

                  <select
                    id="auth-role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as 'student' | 'faculty')
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all cursor-pointer"
                  >
                    <option value="student">Student Competitor</option>
                    <option value="faculty">
                      Faculty / League Advisor
                    </option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--brand)]" />
                  Email Address *
                </span>
              </label>

              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--brand)]" />
                  Password *
                </span>
              </label>

              <input
                id="auth-password"
                type="password"
                required
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                minLength={6}
                maxLength={128}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--bg)] shrink-0 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="text-xs text-[var(--brand)] hover:underline font-semibold disabled:opacity-50"
            >
              {mode === 'signin'
                ? 'Need an account? Sign Up'
                : 'Already registered? Sign In'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
            >
              {mode === 'signin' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}

              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
