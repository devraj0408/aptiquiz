import React, { useState } from 'react';
import { QuickStats } from '../components/dashboard/QuickStats';
import { AptiCategories } from '../components/dashboard/AptiCategories';
import { FeatureGrid } from '../components/dashboard/FeatureGrid';
import { CreateSessionModal } from '../components/session/CreateSessionModal';
import { JoinSessionModal } from '../components/session/JoinSessionModal';
import { AptitudeCategory, QuizSessionConfig, JoinSessionPayload } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PlusCircle, LogIn, Trophy, Play, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface DashboardLandingProps {
  isCreateOpen: boolean;
  isJoinOpen: boolean;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onCloseCreate: () => void;
  onCloseJoin: () => void;
  onSessionCreated: (config: QuizSessionConfig) => void;
  onSessionJoined: (payload: JoinSessionPayload) => void;
}

export const DashboardLanding: React.FC<DashboardLandingProps> = ({
  isCreateOpen,
  isJoinOpen,
  onOpenCreate,
  onOpenJoin,
  onCloseCreate,
  onCloseJoin,
  onSessionCreated,
  onSessionJoined,
}) => {
  const { user, profile } = useAuth();
  const [quickCode, setQuickCode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onSessionJoined({
        joinCode: quickCode.trim(),
        participantName: profile?.fullName || 'Siddharth Nair',
        collegeName: 'BITS Pilani',
      });
    }
  };

  const handleSelectCategory = (category: AptitudeCategory) => {
    onSessionCreated({
      title: `${category} Arena Sprint`,
      category,
      questionCount: 5,
      timePerQuestionSec: 30,
      mode: 'Standard',
      hostName: profile?.fullName || 'Prof. Ramanujan',
      collegeName: 'IIT Madras',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
      {/* Hero Shell Card */}
      <section id="arena" className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 sm:p-10 relative overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200">
        <div className="max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--brand-tint)] border border-[var(--brand)]/20 text-[var(--brand)] text-xs font-bold shadow-2xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>Real-Time Aptitude Arena</span>
            </div>

            {user && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>Welcome back, <strong>{profile?.fullName || user.email?.split('@')[0]}</strong></span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-[var(--ink)] tracking-tight leading-[1.15]">
            Master Placement Aptitude in Real-Time Arena Battles.
          </h1>

          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Compete with classmates and placement aspirants in synchronized quantitative, logical reasoning, and verbal aptitude challenges with server-checked round timers and live leaderboards.
          </p>

          {/* Action Entry Points */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onOpenCreate}
              className="btn-primary flex items-center justify-center gap-2 text-sm py-3 px-6 group shadow-xs active:scale-[0.99]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create New Session</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenJoin}
              className="btn-secondary flex items-center justify-center gap-2 text-sm py-3 px-6 active:scale-[0.99]"
            >
              <LogIn className="w-5 h-5 text-[var(--brand)]" />
              <span>Join Session with Code</span>
            </button>
          </div>

          {/* Quick Join Input Box */}
          <form 
            onSubmit={handleQuickJoin} 
            className="pt-4 border-t border-[var(--border)] flex items-center gap-2.5 max-w-md"
          >
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Code (e.g. APTI99)"
                value={quickCode}
                onChange={e => setQuickCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-xs font-mono bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={!quickCode.trim()}
              className="btn-accent text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick Join</span>
            </button>
          </form>
        </div>

        {/* Floating Side Info Panel */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs font-serif font-bold text-[var(--ink)]">
            <Compass className="w-4 h-4 text-[var(--brand)]" />
            <span>Active Competition Rules</span>
          </div>

          <ul className="text-xs space-y-2.5 text-[var(--ink-muted)]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-1.5 shrink-0" />
              <span>Speed & accuracy scoring rewards fast correct submissions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
              <span>Pressure Cooker mode reduces answer windows by 5s each round.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--correct)] mt-1.5 shrink-0" />
              <span>Live campus leaderboard tracks inter-college rankings.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
            <span>Server Clock: UTC</span>
            <span className="text-[var(--correct)] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--correct)] animate-pulse" />
              Realtime Active
            </span>
          </div>
        </div>
      </section>

      {/* Quick Statistics Banner */}
      <QuickStats />

      {/* Aptitude Topics & Domains */}
      <AptiCategories onSelectCategory={handleSelectCategory} />

      {/* Arena Features */}
      <FeatureGrid />

      {/* Modals */}
      <CreateSessionModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onCreated={onSessionCreated}
      />

      <JoinSessionModal
        isOpen={isJoinOpen}
        onClose={onCloseJoin}
        initialCode={quickCode}
        onJoined={onSessionJoined}
      />
    </div>
  );
};
