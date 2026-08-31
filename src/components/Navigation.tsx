import React from 'react';
import {
  Home,
  Brain,
  Gamepad2,
  CalendarDays,
  LineChart,
  BookOpen,
  Sparkles,
  GraduationCap,
  Download,
  Upload,
  Globe,
  Eye,
} from 'lucide-react';
import { Language, ViewType } from '../types';
import { LANGUAGE_LABELS, t } from '../lib/i18n';
import { BrandLogo } from './BrandIcons';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onOpenPortfolio: () => void;
  colorblindMode: boolean;
  onToggleColorblindMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  lang,
  onLanguageChange,
  onExport,
  onImport,
  onOpenPortfolio,
  colorblindMode,
  onToggleColorblindMode,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems: { id: ViewType; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelKey: 'nav_dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'test', labelKey: 'nav_test', icon: <Brain className="w-4 h-4" /> },
    { id: 'games-hub', labelKey: 'nav_games', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'challenge', labelKey: 'nav_challenge', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'progress', labelKey: 'nav_progress', icon: <LineChart className="w-4 h-4" /> },
    { id: 'reading', labelKey: 'nav_reading', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'science', labelKey: 'nav_science', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-slate-950/90 backdrop-blur-2xl border-b lg:border-b-0 lg:border-inline-end border-slate-800/80 p-4 lg:p-6 flex flex-col justify-between lg:h-screen lg:sticky lg:top-0 z-40 shadow-2xl shadow-slate-950/80">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between lg:justify-start gap-3 pb-5 mb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <BrandLogo size="md" />
            <div>
              <h1 className="font-display font-bold text-xl text-slate-100 tracking-wide leading-none group-hover:text-teal-300 transition-colors">
                {t(lang, 'brand')}
              </h1>
              <p className="text-[10px] text-teal-400 font-mono mt-1 leading-none tracking-wider font-semibold">
                COGNITIVE LAB
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPortfolio}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-teal-400 hover:bg-slate-800 hover:border-teal-500/40 transition-colors shadow-sm"
            title={t(lang, 'nav_portfolio')}
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none" role="tablist">
          {navItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === 'games-hub' && currentView.startsWith('game-'));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                role="tab"
                aria-selected={isActive}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 text-start group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-transparent text-teal-300 border border-teal-500/30 shadow-sm font-bold'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 font-medium'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute start-0 inset-y-1.5 w-1 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
                )}
                <span className={`transition-transform duration-200 ${isActive ? 'text-teal-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{t(lang, item.labelKey)}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenPortfolio}
            className="hidden lg:flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 text-start text-teal-400 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-400/60 hover:shadow-md hover:shadow-teal-500/10 mt-4 shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t(lang, 'nav_portfolio')}</span>
          </button>
        </nav>
      </div>

      {/* Footer Settings / Lang / Storage */}
      <div className="pt-4 mt-4 border-t border-slate-800/60 flex flex-col gap-3">
        {/* Language Selection */}
        <div className="flex items-center justify-between p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLanguageChange(l)}
              className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all font-semibold ${
                lang === l
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Colorblind Accessibility Mode Toggle */}
        <button
          id="toggle-colorblind-mode-btn"
          onClick={onToggleColorblindMode}
          className={`w-full flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
            colorblindMode
              ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-sm shadow-teal-500/20'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title={t(lang, 'colorblind_mode_desc')}
        >
          <div className="flex items-center gap-2">
            <Eye className={`w-3.5 h-3.5 ${colorblindMode ? 'text-teal-400' : 'text-slate-400'}`} />
            <span>{t(lang, 'colorblind_mode')}</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              colorblindMode
                ? 'bg-teal-400 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {colorblindMode ? t(lang, 'colorblind_on') : t(lang, 'colorblind_off')}
          </span>
        </button>

        {/* Engine Badge */}
        <div className="text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-2 leading-relaxed text-center font-mono">
          <span className="text-teal-400 font-semibold">Safa Engine v2.4</span> • {t(lang, 'engine_badge')}
        </div>

        {/* Data Persistence Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-slate-100 hover:border-teal-500/30 hover:bg-slate-850 transition-all shadow-xs active:scale-95"
            title={t(lang, 'btn_export')}
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>{t(lang, 'btn_export_short')}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-slate-100 hover:border-teal-500/30 hover:bg-slate-850 transition-all shadow-xs active:scale-95"
            title={t(lang, 'btn_import')}
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>{t(lang, 'btn_import_short')}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />
        </div>
      </div>
    </aside>
  );
};
