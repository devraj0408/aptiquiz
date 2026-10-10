import React from 'react';
import { ActiveGameSession } from '../../types';
import { Trophy, Crown, RefreshCw, Home, Award } from 'lucide-react';

interface PodiumViewProps {
  session: ActiveGameSession;
  onReturnDashboard: () => void;
  onPlayAgain: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  session,
  onReturnDashboard,
  onPlayAgain,
}) => {
  const sorted = [...session.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const third = sorted[2];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-scale-in text-center">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-tint)] border border-[var(--brand)]/30 flex items-center justify-center mx-auto text-[var(--brand)] shadow-xs animate-float-subtle">
          <Trophy className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-[var(--ink)] tracking-tight">
          Session Competition Finalized!
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          {session.title} • Topic: <strong className="text-[var(--ink)]">{session.category}</strong>
        </p>
      </div>

      {/* Podium Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
        {/* 2nd Place */}
        {runnerUp && (
          <div className="card-flat bg-[var(--surface)] p-5 border-[var(--border)] rounded-[8px] space-y-2 order-2 sm:order-1 hover-lift">
            <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mx-auto font-bold text-xs font-serif text-[var(--ink-muted)]">
              2nd
            </div>
            <h3 className="font-serif font-bold text-base text-[var(--ink)]">{runnerUp.name}</h3>
            {runnerUp.college && <div className="text-[10px] text-[var(--ink-muted)] font-mono">{runnerUp.college}</div>}
            <div className="font-mono text-lg font-extrabold text-[var(--brand)]">
              {runnerUp.score} pts
            </div>
          </div>
        )}

        {/* 1st Place Champion */}
        {winner && (
          <div className="card-flat bg-[var(--brand-tint)] border-[var(--brand)] rounded-[8px] p-6 space-y-3 order-1 sm:order-2 relative shadow-md ring-2 ring-[var(--brand)]/20 hover-lift animate-border-glow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-[var(--accent)] text-[#FBFAF7] rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-float-subtle">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Arena Champion</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-[var(--brand)] text-[#FBFAF7] flex items-center justify-center mx-auto font-extrabold text-xl font-serif shadow-xs">
              1st
            </div>
            <h2 className="font-serif font-extrabold text-xl text-[var(--ink)]">{winner.name}</h2>
            {winner.college && <div className="text-xs text-[var(--ink-muted)] font-mono">{winner.college}</div>}
            <div className="font-mono text-3xl font-extrabold text-[var(--brand)]">
              {winner.score} pts
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="card-flat bg-[var(--surface)] p-5 border-[var(--border)] rounded-[8px] space-y-2 order-3 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mx-auto font-bold text-xs font-serif text-[var(--ink-muted)]">
              3rd
            </div>
            <h3 className="font-serif font-bold text-base text-[var(--ink)]">{third.name}</h3>
            {third.college && <div className="text-[10px] text-[var(--ink-muted)] font-mono">{third.college}</div>}
            <div className="font-mono text-lg font-extrabold text-[var(--brand)]">
              {third.score} pts
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Roster Table */}
      <div className="card-flat bg-[var(--surface)] p-6 space-y-3 text-left rounded-[8px] border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--brand)]" />
            <span className="font-serif font-bold text-sm text-[var(--ink)]">Complete Competition Results</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
            Server Validated
          </span>
        </div>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <div key={p.id} className="p-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between text-xs hover:border-[var(--brand)]/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold w-6 text-[var(--ink-muted)] text-center">#{idx + 1}</span>
                <div>
                  <span className="font-bold text-[var(--ink)]">{p.name}</span>
                  {p.college && <span className="text-[10px] text-[var(--ink-muted)] ml-2">({p.college})</span>}
                </div>
              </div>
              <span className="font-mono font-extrabold text-sm text-[var(--brand)]">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onPlayAgain}
          className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-6 shadow-xs active:scale-[0.98] w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Another Session</span>
        </button>

        <button
          onClick={onReturnDashboard}
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-6 shadow-xs active:scale-[0.98] w-full sm:w-auto justify-center"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
