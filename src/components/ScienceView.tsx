import React from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { t } from '../lib/i18n';

export const ScienceView: React.FC<{ lang: Language }> = ({ lang }) => {
  const concepts = [
    {
      num: t(lang, 'science_c1_num'),
      title: t(lang, 'science_c1_h'),
      desc: t(lang, 'science_c1_p'),
      accent: false,
    },
    {
      num: t(lang, 'science_c2_num'),
      title: t(lang, 'science_c2_h'),
      desc: t(lang, 'science_c2_p'),
      accent: false,
    },
    {
      num: t(lang, 'science_c3_num'),
      title: t(lang, 'science_c3_h'),
      desc: t(lang, 'science_c3_p'),
      accent: true,
    },
    {
      num: t(lang, 'science_c4_num'),
      title: t(lang, 'science_c4_h'),
      desc: t(lang, 'science_c4_p'),
      accent: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t(lang, 'science_eyebrow')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
          {t(lang, 'science_title')}
        </h2>
      </div>

      {/* 4 Concept Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {concepts.map((c, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border space-y-2 shadow-xl shadow-slate-950/50 backdrop-blur-sm transition-all ${
              c.accent
                ? 'bg-gradient-to-br from-teal-500/10 via-slate-900/90 to-slate-900/90 border-teal-500/40 ring-1 ring-teal-500/20'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-bold">
              {c.num}
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">{c.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* SART Mathematical Formulation Panel */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold font-display text-slate-100">
              {t(lang, 'formula_title')}
            </h3>
          </div>
          <p className="text-xs text-slate-400">{t(lang, 'formula_desc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-xs">
            <span className="font-mono text-2xl font-bold text-rose-400">50%</span>
            <div className="text-xs font-bold text-slate-200">
              {t(lang, 'formula_1_label')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(lang, 'formula_1_desc')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-xs">
            <span className="font-mono text-2xl font-bold text-slate-100">30%</span>
            <div className="text-xs font-bold text-slate-200">
              {t(lang, 'formula_2_label')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(lang, 'formula_2_desc')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-xs">
            <span className="font-mono text-2xl font-bold text-teal-400">20%</span>
            <div className="text-xs font-bold text-slate-200">
              {t(lang, 'formula_3_label')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(lang, 'formula_3_desc')}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-mono text-center pt-2">
          {t(lang, 'formula_note')}
        </p>
      </div>
    </div>
  );
};
