import React from 'react';
import { ShieldCheck, GitBranch, Cpu, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-16 py-10 text-xs text-[var(--ink-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif font-bold text-base text-[var(--ink)]">AptiQuiz</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--brand-tint)] text-[var(--brand)] font-medium">
                Slate & Teal Design System
              </span>
            </div>
            <p className="text-[var(--ink-muted)]">
              Real-Time Multiplayer Aptitude Arena for quantitative aptitude, logical reasoning & placement test preparation.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-[var(--ink)]">
              <ShieldCheck className="w-4 h-4 text-[var(--correct)]" />
              <span>Server-Authoritative Timing</span>
            </span>
            <span className="flex items-center gap-1 text-[var(--ink)]">
              <Cpu className="w-4 h-4 text-[var(--brand)]" />
              <span>Supabase Realtime</span>
            </span>
            <span className="flex items-center gap-1 text-[var(--ink)]">
              <GitBranch className="w-4 h-4 text-[var(--accent)]" />
              <span>React 19 + Vite 6</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} AptiQuiz Platform. Live Aptitude Competition Arena.</p>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono">
              <Terminal className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>VITE_SUPABASE_URL</span>
            </span>
            <span>•</span>
            <span>No AI APIs & No Socket.IO required</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
