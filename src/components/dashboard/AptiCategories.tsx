import React from 'react';
import { AptitudeCategory } from '../../types';
import { Calculator, BrainCircuit, MessageSquareText, BarChart3, ChevronRight } from 'lucide-react';

interface AptiCategoriesProps {
  onSelectCategory: (category: AptitudeCategory) => void;
}

export const AptiCategories: React.FC<AptiCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      name: 'Quantitative Aptitude' as AptitudeCategory,
      icon: <Calculator className="w-6 h-6 text-[var(--brand)]" />,
      topics: ['Time & Work', 'Speed & Distance', 'Permutations', 'Profit & Loss'],
      count: '150+ Questions',
      badge: 'High Frequency',
    },
    {
      name: 'Logical Reasoning' as AptitudeCategory,
      icon: <BrainCircuit className="w-6 h-6 text-[var(--accent)]" />,
      topics: ['Blood Relations', 'Syllogisms', 'Seating Arrangement', 'Coding-Decoding'],
      count: '120+ Questions',
      badge: 'Speed Critical',
    },
    {
      name: 'Verbal Ability' as AptitudeCategory,
      icon: <MessageSquareText className="w-6 h-6 text-[var(--correct)]" />,
      topics: ['Reading Comprehension', 'Para Jumbles', 'Grammar Correction', 'Vocabulary'],
      count: '100+ Questions',
      badge: 'Accuracy Focus',
    },
    {
      name: 'Data Interpretation' as AptitudeCategory,
      icon: <BarChart3 className="w-6 h-6 text-[var(--brand)]" />,
      topics: ['Bar Graphs & Charts', 'Pie Charts', 'Caselets', 'Data Sufficiency'],
      count: '80+ Sets',
      badge: 'Analytic',
    },
  ];

  return (
    <section id="categories" className="my-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[var(--ink)]">Aptitude Competition Domains</h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Standard placement syllabus topics tailored for competitive time-bound multi-player rounds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.name}
            className={`card-flat bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-md transition-all duration-200 group flex flex-col justify-between stagger-${idx + 1} animate-fade-in-up`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[var(--bg)] rounded-[6px] border border-[var(--border)] shadow-2xs group-hover:bg-[var(--brand-tint)] group-hover:border-[var(--brand)]/30 transition-colors">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">{cat.name}</h3>
                    <span className="text-[11px] text-[var(--ink-muted)] font-mono">{cat.count}</span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-[4px] bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20 shadow-2xs">
                  {cat.badge}
                </span>
              </div>

              <div className="my-3 border-t border-b border-[var(--border)] py-3">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--ink-muted)] mb-2">
                  Core Topics Included
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.topics.map(t => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-[4px] text-[var(--ink)] hover:border-[var(--brand)]/40 hover:bg-[var(--surface)] transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onSelectCategory(cat.name)}
                className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[var(--brand-tint)]/60 transition-all"
              >
                <span>Launch Quick Sprint</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
