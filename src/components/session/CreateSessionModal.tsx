import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QuizSessionConfig, AptitudeCategory, ActiveQuestion } from '../../types';
import { sessionService, SessionResult } from '../../services/sessionService';
import { X, Play, Copy, Check, Clock, Layers, Award, Sparkles, ArrowRight, Plus, Trash2 } from 'lucide-react';


interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (config: QuizSessionConfig, result?: SessionResult) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [submittedConfig, setSubmittedConfig] = useState<QuizSessionConfig | null>(null);
  const [formData, setFormData] = useState<QuizSessionConfig>({
    title: 'Speed Aptitude Sprint #1',
    category: 'Quantitative Aptitude',
    questionCount: 10,
    timePerQuestionSec: 45,
    mode: 'Standard',
    hostName: 'Prof. Ramanujan',
    collegeName: 'IIT Madras',
  });

  const [useCustomQuestions, setUseCustomQuestions] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<
    { prompt: string; optionA: string; optionB: string; optionC: string; optionD: string; correctKey: 'A' | 'B' | 'C' | 'D' }[]
  >([
    { prompt: '', optionA: '', optionB: '', optionC: '', optionD: '', correctKey: 'A' },
  ]);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Scroll lock on background page body while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Dismiss on Escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: AptitudeCategory[] = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
    'General Aptitude',
  ];

  const handleAddCustomQuestion = () => {
    setCustomQuestions(prev => [
      ...prev,
      { prompt: '', optionA: '', optionB: '', optionC: '', optionD: '', correctKey: 'A' },
    ]);
  };

  const handleRemoveCustomQuestion = (index: number) => {
    setCustomQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomQuestionChange = (
    index: number,
    field: 'prompt' | 'optionA' | 'optionB' | 'optionC' | 'optionD' | 'correctKey',
    value: string
  ) => {
    setCustomQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let preparedCustomQs: ActiveQuestion[] | undefined = undefined;

    if (useCustomQuestions) {
      if (customQuestions.length === 0) {
        setValidationError('Please add at least one custom question.');
        return;
      }

      for (let i = 0; i < customQuestions.length; i++) {
        const q = customQuestions[i];
        if (!q.prompt.trim()) {
          setValidationError(`Question #${i + 1} is missing the question prompt text.`);
          return;
        }
        if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
          setValidationError(`Question #${i + 1} must have all 4 options (A, B, C, D) filled in.`);
          return;
        }
      }

      preparedCustomQs = customQuestions.map((q, idx) => {
        const optA_id = `cq_${idx}_opt_a`;
        const optB_id = `cq_${idx}_opt_b`;
        const optC_id = `cq_${idx}_opt_c`;
        const optD_id = `cq_${idx}_opt_d`;

        let correctOptionId = optA_id;
        if (q.correctKey === 'B') correctOptionId = optB_id;
        if (q.correctKey === 'C') correctOptionId = optC_id;
        if (q.correctKey === 'D') correctOptionId = optD_id;

        return {
          id: `cq_${idx + 1}_${Date.now()}`,
          prompt: q.prompt.trim(),
          category: formData.category,
          options: [
            { id: optA_id, key: 'A', text: q.optionA.trim() },
            { id: optB_id, key: 'B', text: q.optionB.trim() },
            { id: optC_id, key: 'C', text: q.optionC.trim() },
            { id: optD_id, key: 'D', text: q.optionD.trim() },
          ],
          correctOptionId,
          explanation: `Correct Answer: Option ${q.correctKey}`,
        };
      });
    }

    setLoading(true);
    setResult(null);

    const finalConfig: QuizSessionConfig = {
      ...formData,
      questionCount: preparedCustomQs ? preparedCustomQs.length : formData.questionCount,
      customQuestions: preparedCustomQs,
    };

    setSubmittedConfig(finalConfig);
    const res = await sessionService.createSession(finalConfig);
    setLoading(false);
    setResult(res);
  };

  const copyCode = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-session-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-xl shadow-xl flex flex-col max-h-[90dvh] my-auto overflow-hidden text-[var(--ink)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-session-modal-title" className="text-base sm:text-lg font-bold font-serif leading-tight">Create Aptitude Competition Session</h2>
              <p className="text-[11px] text-[var(--ink-muted)]">Configure round rules and question builder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            title="Close Modal"
            aria-label="Close modal"
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
                  if (onCreated && submittedConfig && result) {
                    onCreated(submittedConfig, result);
                  } else {
                    onClose();
                  }
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
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {validationError && (
                <div className="p-3 bg-[var(--wrong-tint)] border border-[var(--wrong)] text-[var(--wrong)] rounded text-xs font-medium">
                  {validationError}
                </div>
              )}

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
                    min={1}
                    max={50}
                    disabled={useCustomQuestions}
                    value={useCustomQuestions ? customQuestions.length : formData.questionCount}
                    onChange={e => setFormData({ ...formData, questionCount: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-[5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all disabled:opacity-60"
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

              {/* Custom Questions Builder Accordion */}
              <div className="pt-3 border-t border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="toggle-custom-qs"
                      type="checkbox"
                      checked={useCustomQuestions}
                      onChange={e => setUseCustomQuestions(e.target.checked)}
                      className="w-4 h-4 text-[var(--brand)] rounded border-[var(--border)] focus:ring-[var(--brand)]/20 cursor-pointer"
                    />
                    <label htmlFor="toggle-custom-qs" className="text-xs font-bold text-[var(--ink)] cursor-pointer">
                      Add Custom Questions to this Session
                    </label>
                  </div>
                  {useCustomQuestions && (
                    <span className="text-[10px] font-mono text-[var(--brand)] font-semibold">
                      {customQuestions.length} Custom Q(s)
                    </span>
                  )}
                </div>

                {useCustomQuestions && (
                  <div className="space-y-4 pt-2">
                    {customQuestions.map((cq, idx) => (
                      <div key={idx} className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-[var(--brand)]">
                            Question #{idx + 1}
                          </span>
                          {customQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomQuestion(idx)}
                              className="text-xs text-[var(--wrong)] hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter question text..."
                            value={cq.prompt}
                            onChange={e => handleCustomQuestionChange(idx, 'prompt', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--ink)] focus:outline-none focus:border-[var(--brand)] font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map(key => {
                            const optField = `option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                            const isCorrect = cq.correctKey === key;
                            return (
                              <div key={key} className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCustomQuestionChange(idx, 'correctKey', key)}
                                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded border transition-colors ${
                                    isCorrect
                                      ? 'bg-[var(--correct)] text-[#FBFAF7] border-[var(--correct)]'
                                      : 'bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--border)] hover:border-[var(--brand)]'
                                  }`}
                                  title={`Mark ${key} as Correct`}
                                >
                                  {key}
                                </button>
                                <input
                                  type="text"
                                  placeholder={`Option ${key}`}
                                  value={cq[optField]}
                                  onChange={e => handleCustomQuestionChange(idx, optField, e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--ink)] focus:outline-none focus:border-[var(--brand)]"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddCustomQuestion}
                      className="w-full py-2 border border-dashed border-[var(--brand)]/50 text-[var(--brand)] hover:bg-[var(--brand-tint)]/30 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Question</span>
                    </button>
                  </div>
                )}
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
    </div>,
    document.body
  );
};

