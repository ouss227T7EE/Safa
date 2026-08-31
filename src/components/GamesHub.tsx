import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { Language, ViewType } from '../types';
import { t } from '../lib/i18n';
import { GameIconType, ProgramLogo } from './BrandIcons';

interface GamesHubProps {
  lang: Language;
  onNavigate: (view: ViewType) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ lang, onNavigate }) => {
  const gamesList: {
    id: ViewType;
    iconType: GameIconType;
    titleKey: string;
    scienceKey: string;
    tag: string;
    theme: {
      borderHover: string;
      iconBg: string;
      iconText: string;
      glow: string;
    };
  }[] = [
    {
      id: 'game-chess',
      iconType: 'chess',
      titleKey: 'chess_name',
      scienceKey: 'chess_science',
      tag: 'Strategic AI & Minimax',
      theme: {
        borderHover: 'hover:border-indigo-500/50',
        iconBg: 'bg-indigo-500/10 border-indigo-500/30',
        iconText: 'text-indigo-400',
        glow: 'group-hover:shadow-indigo-500/10',
      },
    },
    {
      id: 'game-nback',
      iconType: 'nback',
      titleKey: 'nback_name',
      scienceKey: 'nback_science',
      tag: 'Working Memory (Kirchner 1958)',
      theme: {
        borderHover: 'hover:border-teal-500/50',
        iconBg: 'bg-teal-500/10 border-teal-500/30',
        iconText: 'text-teal-400',
        glow: 'group-hover:shadow-teal-500/10',
      },
    },
    {
      id: 'game-stroop',
      iconType: 'stroop',
      titleKey: 'stroop_name',
      scienceKey: 'stroop_science',
      tag: 'Cognitive Control (Stroop 1935)',
      theme: {
        borderHover: 'hover:border-amber-500/50',
        iconBg: 'bg-amber-500/10 border-amber-500/30',
        iconText: 'text-amber-400',
        glow: 'group-hover:shadow-amber-500/10',
      },
    },
    {
      id: 'game-corsi',
      iconType: 'corsi',
      titleKey: 'corsi_name',
      scienceKey: 'corsi_science',
      tag: 'Visuospatial Span (Corsi 1972)',
      theme: {
        borderHover: 'hover:border-sky-500/50',
        iconBg: 'bg-sky-500/10 border-sky-500/30',
        iconText: 'text-sky-400',
        glow: 'group-hover:shadow-sky-500/10',
      },
    },
    {
      id: 'game-flanker',
      iconType: 'flanker',
      titleKey: 'flanker_title',
      scienceKey: 'flanker_science',
      tag: 'Selective Attention (Eriksen 1974)',
      theme: {
        borderHover: 'hover:border-emerald-500/50',
        iconBg: 'bg-emerald-500/10 border-emerald-500/30',
        iconText: 'text-emerald-400',
        glow: 'group-hover:shadow-emerald-500/10',
      },
    },
    {
      id: 'game-tol',
      iconType: 'tol',
      titleKey: 'tol_title',
      scienceKey: 'tol_science',
      tag: 'Executive Planning (Shallice 1982)',
      theme: {
        borderHover: 'hover:border-rose-500/50',
        iconBg: 'bg-rose-500/10 border-rose-500/30',
        iconText: 'text-rose-400',
        glow: 'group-hover:shadow-rose-500/10',
      },
    },
    {
      id: 'game-taskswitch',
      iconType: 'taskswitch',
      titleKey: 'taskswitch_title',
      scienceKey: 'taskswitch_science',
      tag: 'Cognitive Flexibility (Monsell 2003)',
      theme: {
        borderHover: 'hover:border-purple-500/50',
        iconBg: 'bg-purple-500/10 border-purple-500/30',
        iconText: 'text-purple-400',
        glow: 'group-hover:shadow-purple-500/10',
      },
    },
    {
      id: 'game-posner',
      iconType: 'posner',
      titleKey: 'posner_title',
      scienceKey: 'posner_science',
      tag: 'Spatial Cueing (Posner 1980)',
      theme: {
        borderHover: 'hover:border-cyan-500/50',
        iconBg: 'bg-cyan-500/10 border-cyan-500/30',
        iconText: 'text-cyan-400',
        glow: 'group-hover:shadow-cyan-500/10',
      },
    },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t(lang, 'games_eyebrow')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100">
          {t(lang, 'games_title')}
        </h2>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          {t(lang, 'games_sub')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {gamesList.map((g) => (
          <div
            key={g.id}
            className={`p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/80 ${g.theme.borderHover} transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl shadow-slate-950/40 hover:shadow-2xl ${g.theme.glow} group backdrop-blur-sm`}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className={`w-12 h-12 rounded-2xl ${g.theme.iconBg} ${g.theme.iconText} border flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-xs`}>
                  <ProgramLogo type={g.iconType} size="md" />
                </span>
                <span className="text-[10.5px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-full font-medium">
                  {g.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-display text-slate-100 group-hover:text-teal-300 transition-colors">
                  {t(lang, g.titleKey)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 font-normal">
                  {t(lang, g.scienceKey)}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(g.id)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-teal-500 text-slate-200 hover:text-slate-950 border border-slate-700/80 hover:border-teal-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 group-hover:bg-slate-850 group-hover:border-slate-600"
            >
              <Play className="w-3.5 h-3.5 fill-current text-teal-400 group-hover:text-slate-950" />
              <span>{t(lang, 'game_play_btn')}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
