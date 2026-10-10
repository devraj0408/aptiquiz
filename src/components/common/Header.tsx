import React from 'react';
import { SupabaseStatusBadge } from './SupabaseStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { Zap, BookOpen, Shield, PlusCircle, LogIn, User, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenJoinModal,
  onOpenAuthModal,
}) => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand)] text-[var(--surface)] flex items-center justify-center font-bold font-serif text-xl border border-[var(--brand-hover)] shadow-xs">
              A
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-serif text-[var(--ink)] tracking-tight">
                AptiQuiz
              </span>
              <span className="hidden xl:inline-block text-[10px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--ink-muted)] font-mono font-semibold">
                Live Arena
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 text-xs font-semibold text-[var(--ink-muted)]">
            <a href="#arena" className="flex items-center gap-1.5 hover:text-[var(--brand)] transition-colors">
              <Zap className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>Arena</span>
            </a>
            <a href="#categories" className="flex items-center gap-1.5 hover:text-[var(--brand)] transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Topics</span>
            </a>
            <a href="#modes" className="flex items-center gap-1.5 hover:text-[var(--brand)] transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>Features</span>
            </a>
          </nav>

          {/* Action Buttons, Profile & Backend Status */}
          <div className="flex items-center gap-2 shrink-0">
            <SupabaseStatusBadge />

            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold text-[var(--ink)]">
                  <User className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                  <span className="truncate max-w-[80px] sm:max-w-[130px]">
                    {profile?.fullName || user.email?.split('@')[0]}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--brand-tint)] text-[var(--brand)] font-semibold">
                    {profile?.role || 'student'}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--wrong-tint)] text-[var(--ink-muted)] hover:text-[var(--wrong)] transition-colors text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenJoinModal}
              className="btn-secondary text-xs py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
              <span className="hidden sm:inline">Join Session</span>
              <span className="sm:hidden">Join</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="btn-primary text-xs py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Create Session</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
