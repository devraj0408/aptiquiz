import React, { useState } from 'react';
import { QuizSessionConfig, AptitudeCategory } from '../../types';
import { sessionService, SessionResult } from '../../services/sessionService';
import { X, Play, Copy, Check, Clock, Layers, Award, Sparkles, ArrowRight } from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (config: QuizSessionConfig) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState<QuizSessionConfig>({
    title: 'Speed Aptitude Sprint #1',
    category: 'Quantitative Aptitude',
    questionCount: 10,
    timePerQuestionSec: 45,
    mode: 'Standard',
    hostName: 'Prof. Ramanujan',
    collegeName: 'IIT Madras',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const categories: AptitudeCategory[] = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await sessionService.createSession(formData);
    setLoading(false);
    setResult(res);

    if (res.success && onCreated) {
      onCreated(formData);
    }
  };

  const copyCode = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] my-auto overflow-hidden text-[var(--ink)] animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">Create Aptitude Competition Session</h2>
              <p className="text-[11px] text-[var(--ink-muted)]">Configure round rules and start live lobby</p>
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

        {/* Content Body */}
        {result?.success ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--correct-tint)] border border-[var(--correct)] text-[var(--correct)] flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[var(--ink)]">
                Session Room Scaffolded!
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Your live aptitude competition lobby is ready for players.
              </p>
            </div>
            
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] space-y-2">
              <span className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                Share Join Code With Competitors
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold text-[var(--brand)] tracking-wider">
                  {result.code}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] rounded transition-all text-xs flex items-center gap-1.5 active:scale-95 shadow-2xs"
                  title="Copy Join Code"
                >
                  {copied ? <Check className="w-4 h-4 text-[var(--correct)]" /> : <Copy className="w-4 h-4 text-[var(--ink-muted)]" />}
                  <span className="font-medium">{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              {result.message}
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
              <button
                onClick={() => setResult(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Create Another
              </button>
              <button
                onClick={() => {
                  if (onCreated) onCreated(formData);
                  else onClose();
                }}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <span>Enter Room Lobby</span>
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
                <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS/Wipro Placement Practice #1"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                    Aptitude Topic *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as AptitudeCategory })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                    Game Mode *
                  </label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({ ...formData, mode: e.target.value as QuizSessionConfig['mode'] })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all cursor-pointer"
                  >
                    <option value="Standard">Standard Competition</option>
                    <option value="Pressure Cooker">Pressure Cooker (-5s/rd)</option>
                    <option value="Team Relay">Team Relay Battle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span>Questions</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={formData.questionCount}
                    onChange={e => setFormData({ ...formData, questionCount: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Secs / Round</span>
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    step={5}
                    value={formData.timePerQuestionSec}
                    onChange={e => setFormData({ ...formData, timePerQuestionSec: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                    Host Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Ramanujan"
                    value={formData.hostName}
                    onChange={e => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span>College (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay / Anna Univ"
                    value={formData.collegeName}
                    onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                  />
                </div>
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
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{loading ? 'Initializing...' : 'Initialize Session'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
