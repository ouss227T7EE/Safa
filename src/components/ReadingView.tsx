import React from 'react';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../lib/i18n';
import { RECOMMENDED_BOOKS } from '../lib/storage';

export const ReadingView: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t(lang, 'reading_eyebrow')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
          {t(lang, 'reading_title')}
        </h2>
        <p className="text-sm text-slate-400 max-w-xl">
          {t(lang, 'reading_sub')}
        </p>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOMMENDED_BOOKS.map((b, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded font-semibold">
                  {b.year}
                </span>
                <span className="text-xs text-slate-500 font-mono">Literature</span>
              </div>

              <h3 className="text-base font-bold font-display text-slate-100 group-hover:text-teal-400 transition-colors">
                {b.title}
              </h3>
              <div className="text-xs font-semibold text-emerald-400">{b.author}</div>

              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {b.summaryKey}
              </p>
            </div>

            <a
              href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-xs font-semibold text-slate-200 transition-all shadow-xs"
            >
              <span>{t(lang, 'reading_find_btn')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
