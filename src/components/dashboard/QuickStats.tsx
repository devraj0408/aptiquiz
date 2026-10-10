import React from 'react';
import { Timer, Zap, Users, ShieldCheck } from 'lucide-react';

export const QuickStats: React.FC = () => {
  const stats = [
    {
      icon: <Zap className="w-5 h-5 text-[var(--accent)]" />,
      value: '4 Core',
      label: 'Aptitude Modules',
      subtext: 'Quant, Verbal, Logic & DI',
    },
    {
      icon: <Timer className="w-5 h-5 text-[var(--brand)]" />,
      value: '30–60s',
      label: 'Round Deadline',
      subtext: 'Server-authoritative timer',
    },
    {
      icon: <Users className="w-5 h-5 text-[var(--correct)]" />,
      value: '50+',
      label: 'Concurrent Players',
      subtext: 'Synchronized live lobby',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[var(--brand)]" />,
      value: 'Zero-Trust',
      label: 'Scoring Engine',
      subtext: 'Anti-cheat deadline validation',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      {stats.map((item, idx) => (
        <div 
          key={idx} 
          className={`card-flat flex items-start gap-3.5 bg-[var(--surface)] hover:border-[var(--brand)]/40 hover:-translate-y-0.5 transition-all duration-200 shadow-2xs hover:shadow-xs stagger-${idx + 1} animate-fade-in-up`}
        >
          <div className="p-2.5 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] shrink-0 shadow-2xs">
            {item.icon}
          </div>
          <div>
            <div className="text-xl font-extrabold font-serif text-[var(--ink)] tracking-tight">{item.value}</div>
            <div className="text-xs font-bold text-[var(--ink)] mt-0.5">{item.label}</div>
            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{item.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
