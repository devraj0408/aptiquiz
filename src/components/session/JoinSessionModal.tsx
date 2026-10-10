import React, { useState } from 'react';
import { JoinSessionPayload } from '../../types';
import { sessionService, SessionResult } from '../../services/sessionService';
import { X, LogIn, Check, KeyRound, User, School, ArrowRight } from 'lucide-react';

interface JoinSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onJoined?: (payload: JoinSessionPayload) => void;
}

export const JoinSessionModal: React.FC<JoinSessionModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  onJoined,
}) => {
  const [formData, setFormData] = useState<JoinSessionPayload>({
    joinCode: initialCode,
    participantName: 'Siddharth Nair',
    collegeName: 'BITS Pilani',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await sessionService.joinSession(formData);
    setLoading(false);
    setResult(res);

    if (res.success && onJoined) {
      onJoined(formData);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-md shadow-xl flex flex-col max-h-[90vh] my-auto overflow-hidden text-[var(--ink)] animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">Join Live Aptitude Session</h2>
              <p className="text-[11px] text-[var(--ink-muted)]">Enter session room code & competitor handle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {result?.success ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--correct-tint)] border border-[var(--correct)] text-[var(--correct)] flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                Ready for Arena Session {result.code}
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                {result.message}
              </p>
            </div>

            <div className="p-3 bg-[var(--brand-tint)] border border-[var(--brand)]/30 text-[var(--brand)] rounded-[5px] text-xs font-medium">
              Real-time synchronized round state will connect upon host launch.
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
              <button
                onClick={() => setResult(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Join Different Session
              </button>
              <button
                onClick={() => {
                  if (onJoined) onJoined(formData);
                  else onClose();
                }}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <span>Enter Lobby Shell</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {result && !result.success && (
                <div className="p-3 bg-[var(--wrong-tint)] border border-[var(--wrong)] text-[var(--wrong)] rounded text-xs font-medium">
                  {result.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span>6-Digit Join Code *</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. APTI99"
                  value={formData.joinCode}
                  onChange={e => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 font-mono text-center text-xl font-extrabold tracking-widest bg-[var(--bg)] border border-[var(--border)] rounded-[5px] uppercase text-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span>Your Name / Handle *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.participantName}
                  onChange={e => setFormData({ ...formData, participantName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  <span>College / Campus (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BITS Pilani"
                  value={formData.collegeName}
                  onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                />
              </div>
            </div>

            {/* Pinned Action Buttons Footer */}
            <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--bg)] shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Joining...' : 'Enter Session'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
