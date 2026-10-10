import React, { useState } from 'react';
import { AptitudeCategory, ActiveQuestion } from '../../types';
import { questionBank } from '../../data/questionBank';
import { ArrowLeft, BookOpen, X, RotateCcw, Award, ChevronRight, ChevronLeft, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';


interface PracticeModeProps {
  onReturnDashboard: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onReturnDashboard }) => {
  const [selectedCategory, setSelectedCategory] = useState<AptitudeCategory | null>(null);
  const [questions, setQuestions] = useState<ActiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // qId -> optionId
  const [isCompleted, setIsCompleted] = useState(false);

  const categories: { id: AptitudeCategory; name: string; desc: string; count: number }[] = [
    {
      id: 'Quantitative Aptitude',
      name: 'Quantitative Aptitude',
      desc: 'Work & time, speed-distance, interest, percentages, algebra & series',
      count: questionBank.filter(q => q.category === 'Quantitative Aptitude').length,
    },
    {
      id: 'Logical Reasoning',
      name: 'Logical Reasoning',
      desc: 'Directions, series completion, coding-decoding, blood relations, syllogisms',
      count: questionBank.filter(q => q.category === 'Logical Reasoning').length,
    },
    {
      id: 'Verbal Ability',
      name: 'Verbal Ability',
      desc: 'Synonyms, antonyms, grammar rules, idioms, sentence completion',
      count: questionBank.filter(q => q.category === 'Verbal Ability').length,
    },
    {
      id: 'Data Interpretation',
      name: 'Data Interpretation',
      desc: 'Pie charts, bar graphs, tables, line graphs, percentage growth analysis',
      count: questionBank.filter(q => q.category === 'Data Interpretation').length,
    },
    {
      id: 'General Aptitude',
      name: 'General Aptitude',
      desc: 'Clocks & calendars, binary numbers, probability, geometry, mean/averages',
      count: questionBank.filter(q => q.category === 'General Aptitude').length,
    },
  ];

  const startPracticeCategory = (category: AptitudeCategory) => {
    const categoryQs = questionBank.filter(q => q.category === category);
    setSelectedCategory(category);
    setQuestions(categoryQs);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
  };

  const currentQ = questions[currentIndex];
  const selectedOptionId = currentQ ? userAnswers[currentQ.id] : null;

  const handleSelectOption = (optionId: string) => {
    if (!currentQ || userAnswers[currentQ.id]) return; // Single attempt per question in practice mode
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Calculate summary score
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc;
  }, 0);
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in-up">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={selectedCategory ? () => setSelectedCategory(null) : onReturnDashboard}
          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--ink-muted)]" />
          <span>{selectedCategory ? 'Change Topic' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-[var(--brand-tint)] text-[var(--brand)] font-semibold border border-[var(--brand-tint)] flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Bank (250 Questions)</span>
          </span>
        </div>
      </div>

      {/* 1. Category Selection View */}
      {!selectedCategory && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand)] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Self-Paced Aptitude Practice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[var(--ink)]">
              Choose a Practice Topic
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
              Master placement topics with step-by-step mathematical & logical explanations for every question. No time limits — test your accuracy first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => startPracticeCategory(cat.id)}
                className="card p-5 hover:border-[var(--brand)] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group bg-[var(--surface)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif font-bold text-base text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="badge-teal text-[10px] uppercase font-mono font-semibold">
                      {cat.count} Questions
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--brand)] font-medium">
                  <span>Start Practice Sprint</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Active Practice Question Player */}
      {selectedCategory && !isCompleted && currentQ && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--brand)]">
                {selectedCategory}
              </span>
              <h2 className="text-sm font-serif font-bold text-[var(--ink)]">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-[var(--correct)]">Correct: {correctCount}</span>
              <span className="text-[var(--ink-muted)]">•</span>
              <span className="text-[var(--ink-muted)]">Attempted: {answeredCount}/{questions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--brand)] h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Prompt Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="text-base sm:text-lg font-serif font-semibold text-[var(--ink)] leading-relaxed">
              {currentQ.prompt}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map(option => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;
                const hasAnswered = Boolean(selectedOptionId);

                let buttonStyle = 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--brand)]/40 text-[var(--ink)]';
                if (hasAnswered) {
                  if (isCorrect) {
                    buttonStyle = 'bg-[var(--correct-tint)] border-[var(--correct)] text-[var(--correct)] font-semibold';
                  } else if (isSelected) {
                    buttonStyle = 'bg-[var(--wrong-tint)] border-[var(--wrong)] text-[var(--wrong)] font-semibold';
                  } else {
                    buttonStyle = 'bg-[var(--bg)] border-[var(--border)] opacity-60 text-[var(--ink-muted)]';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={hasAnswered}
                    className={`p-4 rounded-[6px] border text-left flex items-start justify-between transition-all duration-150 text-xs sm:text-sm ${buttonStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                        hasAnswered && isCorrect
                          ? 'bg-[var(--correct)] text-[#FBFAF7] border-[var(--correct)]'
                          : hasAnswered && isSelected
                          ? 'bg-[var(--wrong)] text-[#FBFAF7] border-[var(--wrong)]'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--ink-muted)]'
                      }`}>
                        {option.key}
                      </span>
                      <span className="pt-0.5">{option.text}</span>
                    </div>

                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--correct)] shrink-0 ml-2" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <X className="w-5 h-5 text-[var(--wrong)] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box (Revealed after answer selection) */}
            {selectedOptionId && (
              <div className="p-4 rounded-[6px] bg-[var(--brand-tint)]/40 border border-[var(--brand)]/20 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center gap-1.5 font-bold font-serif text-[var(--brand)] text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>Step-by-Step Explanation</span>
                </div>
                <p className="text-[var(--ink)] leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-xs"
            >
              <span>{currentIndex + 1 === questions.length ? 'View Practice Summary' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Summary View */}
      {selectedCategory && isCompleted && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 sm:p-10 space-y-6 shadow-md text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-tint)] border border-[var(--brand)]/30 text-[var(--brand)] flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[var(--ink)]">
              Practice Sprint Complete!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
              Topic: <strong>{selectedCategory}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px]">
              <div className="text-xl font-bold font-mono text-[var(--ink)]">{answeredCount}</div>
              <div className="text-[10px] text-[var(--ink-muted)] uppercase font-semibold">Attempted</div>
            </div>
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px]">
              <div className="text-xl font-bold font-mono text-[var(--correct)]">{correctCount}</div>
              <div className="text-[10px] text-[var(--ink-muted)] uppercase font-semibold">Correct</div>
            </div>
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[6px]">
              <div className="text-xl font-bold font-mono text-[var(--brand)]">{accuracyPct}%</div>
              <div className="text-[10px] text-[var(--ink-muted)] uppercase font-semibold">Accuracy</div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => startPracticeCategory(selectedCategory)}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-xs w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn-secondary text-xs py-2.5 px-6 w-full sm:w-auto"
            >
              Choose Another Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
