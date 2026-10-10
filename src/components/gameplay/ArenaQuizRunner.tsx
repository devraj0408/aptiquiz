import React, { useState, useEffect } from 'react';
import { ActiveGameSession, ActiveQuestionOption } from '../../types';
import { LiveLeaderboard } from './LiveLeaderboard';
import { Clock, CheckCircle2, XCircle, ArrowRight, Zap, Lightbulb, Trophy } from 'lucide-react';

interface ArenaQuizRunnerProps {
  session: ActiveGameSession;
  onAnswerSubmitted: (optionId: string, latencyMs: number) => void;
  onNextRound: () => void;
  onCompleteSession: () => void;
}

export const ArenaQuizRunner: React.FC<ArenaQuizRunnerProps> = ({
  session,
  onAnswerSubmitted,
  onNextRound,
  onCompleteSession,
}) => {
  const currentRoundIndex = session.currentRoundIndex;
  const currentQuestion = session.questions[currentRoundIndex] || session.questions[0];

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session.timePerQuestion);
  const [startTime, setStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; scoreAwarded: number } | null>(null);

  // Reset answer state & timer when advancing to next round
  useEffect(() => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setTimeLeft(session.timePerQuestion);
    setFeedback(null);
    setStartTime(Date.now());
  }, [currentRoundIndex, session.timePerQuestion]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit timeout if no option was chosen
          if (!isSubmitted) {
            handleAutoTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleAutoTimeout = () => {
    setIsSubmitted(true);
    setFeedback({ isCorrect: false, scoreAwarded: 0 });
  };


  const handleSelectOption = (option: ActiveQuestionOption) => {
    if (isSubmitted) return;
    setSelectedOptionId(option.id);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isSubmitted) return;

    const latencyMs = Date.now() - startTime;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    
    // Speed bonus calculation: base 10 pts + up to 5 pts speed bonus
    const maxTime = session.timePerQuestion * 1000;
    const speedRatio = Math.max(0, 1 - latencyMs / maxTime);
    const scoreAwarded = isCorrect ? Math.round(10 + 5 * speedRatio) : 0;

    setIsSubmitted(true);
    setFeedback({ isCorrect, scoreAwarded });

    onAnswerSubmitted(selectedOptionId, latencyMs);
  };

  const isLowTime = timeLeft <= 5 && timeLeft > 0;
  const progressPercent = (timeLeft / session.timePerQuestion) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in-up">
      {/* Top Session Progress Bar & Timer */}
      <div className="card-flat bg-[var(--surface)] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[var(--ink)]">
              Round {currentRoundIndex + 1} of {session.totalQuestions}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--brand-tint)] text-[var(--brand)] font-semibold border border-[var(--brand-tint)]">
              {session.category}
            </span>
          </div>

          {/* Prominent Timer Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[5px] border font-mono font-bold transition-all ${
            isLowTime 
              ? 'animate-timer-warn text-[var(--accent)]' 
              : 'bg-[var(--bg)] border-[var(--border)] text-[var(--ink)]'
          }`}>
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-[var(--accent)] animate-spin' : 'text-[var(--brand)]'}`} />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            {isLowTime && <span className="text-[10px] font-sans text-[var(--accent)]">TIME LOW!</span>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isLowTime ? 'bg-[var(--accent)]' : 'bg-[var(--brand)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Gameplay Grid: Main Question Card & Live Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Question & Answer Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-flat bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xs border-[var(--border)] rounded-[8px]">
            {/* Question Header */}
            <div className="space-y-2 border-b border-[var(--border)] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--brand)]">
                  Question #{currentRoundIndex + 1} of {session.totalQuestions}
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                  Topic: {currentQuestion.category || session.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[var(--ink)] leading-snug tracking-tight">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Answer Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrectOption = option.id === currentQuestion.correctOptionId;

                let optionStyle = 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--brand)]/60 hover:bg-[var(--bg)] text-[var(--ink)] shadow-2xs';
                if (isSubmitted) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-[var(--correct-tint)] border-[var(--correct)] text-[var(--correct)] font-semibold shadow-xs';
                  } else if (isSelected && !feedback?.isCorrect) {
                    optionStyle = 'bg-[var(--wrong-tint)] border-[var(--wrong)] text-[var(--wrong)] shadow-xs';
                  } else {
                    optionStyle = 'bg-[var(--bg)] border-[var(--border)] opacity-60 text-[var(--ink-muted)]';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-[var(--brand-tint)] border-[var(--brand)] text-[var(--brand)] font-bold shadow-xs ring-2 ring-[var(--brand)]/20';
                }

                return (
                  <button
                    key={option.id}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 rounded-[6px] border flex items-center justify-between transition-all duration-150 active:scale-[0.99] stagger-${idx + 1} ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-8 h-8 rounded-[5px] flex items-center justify-center font-mono font-bold text-xs border shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-[var(--brand)] text-[#FBFAF7] border-[var(--brand)]' 
                          : 'bg-[var(--bg)] border-[var(--border)] text-[var(--ink)]'
                      }`}>
                        {option.key}
                      </span>
                      <span className="text-sm font-medium leading-normal">{option.text}</span>
                    </div>

                    {isSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--correct)] shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-[var(--wrong)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Action or Feedback Banner */}
            {!isSubmitted ? (
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!selectedOptionId || timeLeft <= 0}
                  onClick={handleSubmitAnswer}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-50 active:scale-[0.98] shadow-xs"
                >
                  <Zap className="w-4 h-4 fill-current text-[var(--accent)]" />
                  <span>Submit Answer</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2 animate-fade-in-up">
                {/* Result Feedback Alert */}
                <div className={`p-4 rounded-[6px] border flex items-center justify-between shadow-2xs ${
                  feedback?.isCorrect
                    ? 'bg-[var(--correct-tint)] border-[var(--correct)] text-[var(--correct)]'
                    : 'bg-[var(--wrong-tint)] border-[var(--wrong)] text-[var(--wrong)]'
                }`}>
                  <div className="flex items-center gap-3">
                    {feedback?.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 shrink-0 text-[var(--correct)]" />
                    ) : (
                      <XCircle className="w-6 h-6 shrink-0 text-[var(--wrong)]" />
                    )}
                    <div>
                      <h4 className="font-bold font-serif text-base">
                        {feedback?.isCorrect ? 'Correct Answer!' : 'Incorrect / Time Expired'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {feedback?.isCorrect
                          ? `Awarded ${feedback.scoreAwarded} points (Includes speed bonus)`
                          : `The correct option was ${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.key}`}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-extrabold text-xl">
                    +{feedback?.scoreAwarded || 0} pts
                  </span>
                </div>

                {/* Question Explanation Box */}
                <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] space-y-1 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--brand)] mb-1">
                    <Lightbulb className="w-4 h-4" />
                    <span>Solution Explanation</span>
                  </div>
                  <p className="text-[var(--ink-muted)] leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>

                {/* Next Round Action */}
                <div className="pt-2 flex justify-end">
                  {currentRoundIndex + 1 < session.totalQuestions ? (
                    <button
                      onClick={onNextRound}
                      className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 shadow-xs active:scale-[0.98]"
                    >
                      <span>Proceed to Round #{currentRoundIndex + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onCompleteSession}
                      className="btn-accent flex items-center gap-2 text-sm py-2.5 px-6 shadow-xs active:scale-[0.98]"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Final Podium Standings</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Competition Leaderboard */}
        <div className="lg:col-span-1">
          <LiveLeaderboard
            players={session.players}
            currentRound={currentRoundIndex + 1}
          />
        </div>
      </div>
    </div>
  );
};
