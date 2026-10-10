import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Users2, LineChart, Monitor, ShieldAlert, Zap, X, ArrowRight } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const [activePreview, setActivePreview] = useState<'skills' | 'projector' | 'pressure' | 'relay' | null>(null);

  useEffect(() => {
    if (!activePreview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePreview]);

  const features = [
    {
      id: 'pressure' as const,
      title: 'Pressure Cooker Mode',
      icon: <Flame className="w-5 h-5 text-[var(--accent)]" />,
      tag: 'Special Mode',
      description: 'Progressively shorter round timers (30s → 20s → 10s) with a high-stakes finale to simulate actual placement stress.',
    },
    {
      id: 'relay' as const,
      title: 'Team Relay Battle',
      icon: <Users2 className="w-5 h-5 text-[var(--brand)]" />,
      tag: 'Team Play',
      description: 'Teams of 3 to 5 students compete through coordinated sequential rounds where accuracy compounds score multipliers.',
    },
    {
      id: 'skills' as const,
      title: 'Skill Progress Map',
      icon: <LineChart className="w-5 h-5 text-[var(--correct)]" />,
      tag: 'Analytics',
      description: 'Track topic-wise accuracy, average response speed, and weak-area identification across all competition sessions.',
    },
    {
      id: 'projector' as const,
      title: 'Projector Mode',
      icon: <Monitor className="w-5 h-5 text-[var(--brand)]" />,
      tag: 'College Events',
      description: 'Clean high-contrast live view optimized for auditorium screens during college campus placement leagues.',
    },
  ];

  return (
    <section id="modes" className="my-12">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand)] mb-1">
          <Zap className="w-4 h-4 text-[var(--brand)]" />
          <span>Enhanced Features</span>
        </div>
        <h2 className="text-2xl font-bold font-serif text-[var(--ink)]">AptiQuiz Arena Features</h2>
        <p className="text-xs text-[var(--ink-muted)]">
          Designed specifically for timed placement tests, campus placement drives, and peer aptitude battles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feat, i) => (
          <div 
            key={feat.id} 
            className={`card-flat bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-md transition-all duration-200 space-y-3 cursor-pointer group stagger-${i + 1} animate-fade-in-up`}
            onClick={() => setActivePreview(feat.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] group-hover:bg-[var(--brand-tint)] group-hover:border-[var(--brand)]/30 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">{feat.title}</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--ink-muted)]">
                {feat.tag}
              </span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              {feat.description}
            </p>
            <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)] group-hover:underline">
              <span>View Feature Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[6px] flex items-center gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-[var(--brand)] shrink-0" />
        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink)] font-semibold">Strict Timing & Anti-Cheat Guard: </strong>
          All answer submittals are timestamped server-side via Supabase. Local clock modifications will not bypass deadline enforcement.
        </p>
      </div>

      {/* Feature Preview Modal */}
      {activePreview && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade overflow-y-auto"
          onClick={() => setActivePreview(null)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-in text-[var(--ink)] my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                {features.find(f => f.id === activePreview)?.icon}
                <h3 id="preview-modal-title" className="font-serif font-bold text-lg">
                  {features.find(f => f.id === activePreview)?.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1 rounded hover:bg-[var(--border)] text-[var(--ink-muted)] transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activePreview === 'skills' && (
              <div className="space-y-3 text-xs">
                <p className="text-[var(--ink-muted)]">
                  Live topic-wise progress & response latency telemetry dashboard.
                </p>
                <div className="space-y-2 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[6px]">
                  <div className="flex justify-between font-semibold">
                    <span>Quantitative Aptitude Accuracy</span>
                    <span className="text-[var(--correct)]">84%</span>
                  </div>
                  <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="bg-[var(--correct)] h-full w-[84%]" />
                  </div>
                  <div className="flex justify-between font-semibold pt-1">
                    <span>Logical Reasoning Speed</span>
                    <span className="text-[var(--brand)]">14.2s avg</span>
                  </div>
                  <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="bg-[var(--brand)] h-full w-[72%]" />
                  </div>
                </div>
              </div>
            )}

            {activePreview === 'projector' && (
              <div className="space-y-3 text-xs">
                <p className="text-[var(--ink-muted)]">
                  High-contrast auditorium view with extra-large leaderboard text and live round notifications.
                </p>
                <div className="p-4 bg-[var(--bg)] border border-[var(--brand)] rounded-[6px] text-center space-y-2">
                  <div className="font-serif font-bold text-base text-[var(--brand)]">AUDITORIUM LEAGUE MODE</div>
                  <div className="font-mono text-xl font-extrabold text-[var(--ink)]">CAMPUS FINALS #1</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">Optimized for 1080p / 4K projection screens</div>
                </div>
              </div>
            )}

            {activePreview === 'pressure' && (
              <div className="space-y-3 text-xs">
                <p className="text-[var(--ink-muted)]">
                  Round durations accelerate automatically each question (30s → 25s → 20s → 15s → 10s) to build real pressure.
                </p>
                <div className="p-3 bg-[var(--warning-tint)] border border-[var(--accent)] text-[var(--accent)] rounded-[6px] font-semibold text-center">
                  ⚠️ Accelerating Timer Active: -5s per round!
                </div>
              </div>
            )}

            {activePreview === 'relay' && (
              <div className="space-y-3 text-xs">
                <p className="text-[var(--ink-muted)]">
                  Synchronized multi-player team battle where scores multiply when team members hit consecutive correct streaks.
                </p>
                <div className="p-3 bg-[var(--brand-tint)] border border-[var(--brand)] text-[var(--brand)] rounded-[6px] font-semibold text-center">
                  👥 3x Combo Multiplier active for Team Alpha
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActivePreview(null)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

