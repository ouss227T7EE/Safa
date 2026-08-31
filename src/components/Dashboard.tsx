import React from 'react';
import { Play, Flame, ShieldAlert, Sparkles, Calendar, Activity, Zap, Trophy, ArrowUpRight } from 'lucide-react';
import { Language, SafaAppState, ViewType } from '../types';
import { t } from '../lib/i18n';
import { calculateChallengeDay, computeLogStreak } from '../lib/storage';

interface DashboardProps {
  state: SafaAppState;
  lang: Language;
  onNavigate: (view: ViewType) => void;
  onStartChallenge: () => void;
}

export const SvgScoreChart: React.FC<{
  values: number[];
  height?: number;
  color?: string;
}> = ({ values, height = 180, color = '#2DD4BF' }) => {
  const pad = { t: 20, r: 24, b: 24, l: 32 };
  const width = 600;
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  if (!values.length) return null;
  const n = values.length;
  const xToPx = (i: number) => (n === 1 ? pad.l + innerW / 2 : pad.l + (i / (n - 1)) * innerW);
  const yToPx = (v: number) => pad.t + (1 - v / 100) * innerH;

  const points = values.map((v, i) => `${xToPx(i).toFixed(1)},${yToPx(v).toFixed(1)}`);
  const pathD = points.map((p, i) => (i === 0 ? `M ${p}` : `L ${p}`)).join(' ');
  const areaD = `${pathD} L ${xToPx(n - 1).toFixed(1)},${yToPx(0)} L ${xToPx(0).toFixed(1)},${yToPx(0)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full block overflow-visible"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Grid lines */}
      {[0, 50, 100].map((v) => {
        const py = yToPx(v);
        return (
          <g key={v}>
            <line
              x1={pad.l}
              y1={py}
              x2={width - pad.r}
              y2={py}
              stroke="#1E2D4A"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={pad.l - 8}
              y={py + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] font-mono font-medium"
            >
              {v}
            </text>
          </g>
        );
      })}

      {n > 1 && <path d={areaD} fill="url(#chartGrad)" />}
      {n > 1 && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
      )}

      {/* Data dots */}
      {values.map((v, i) => (
        <g key={i} className="group cursor-pointer">
          <circle
            cx={xToPx(i)}
            cy={yToPx(v)}
            r={n === 1 ? 6 : 5}
            fill="#070B12"
            stroke={color}
            strokeWidth="2.5"
            className="transition-transform group-hover:scale-150"
          />
          <circle cx={xToPx(i)} cy={yToPx(v)} r={9} fill={color} opacity="0.25" />
        </g>
      ))}
    </svg>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  lang,
  onNavigate,
  onStartChallenge,
}) => {
  const tests = state.attentionTests;
  const isStarted = !!state.challengeStartDate;
  const dayNum = calculateChallengeDay(state.challengeStartDate);
  const streak = computeLogStreak(state.dailyLogs);

  const latestScore = tests.length ? tests[tests.length - 1].score : null;
  const baselineScore = tests.length ? tests[0].score : null;
  const scoreDelta =
    tests.length > 1 && latestScore !== null && baselineScore !== null
      ? latestScore - baselineScore
      : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section with animated demo digit */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800/90 shadow-2xl shadow-slate-950/70 p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
        {/* Subtle decorative glow orb */}
        <div className="absolute -top-24 -end-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 start-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{t(lang, 'hero_eyebrow')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-100 leading-tight tracking-tight">
              {t(lang, 'hero_title')}
            </h2>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl font-normal">
              {t(lang, 'hero_sub')}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                id="hero-start-test-btn"
                onClick={() => onNavigate('test')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/25 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t(lang, 'hero_cta')}</span>
              </button>

              {!isStarted && (
                <button
                  id="hero-start-challenge-btn"
                  onClick={onStartChallenge}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-sm font-semibold transition-all shadow-xs active:scale-95"
                >
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>{t(lang, 'start_challenge_btn')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Demo Visual Stimulus Container */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute top-3 inset-x-0 flex justify-center">
                  <span className="text-[10px] font-mono text-teal-400/80 uppercase tracking-widest font-bold">
                    SART STIMULUS
                  </span>
                </div>
                <span className="font-mono text-7xl font-black text-teal-400 animate-hero-flicker select-none drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                  5
                </span>
                <div className="absolute bottom-3 text-[10px] text-slate-400 font-mono font-medium">
                  Spacebar = GO
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Challenge Day */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-teal-500/40 transition-all shadow-lg shadow-slate-950/50 space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t(lang, 'stat_day_label')}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {isStarted ? dayNum : '—'}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {isStarted
              ? dayNum >= 14
                ? t(lang, 'stat_day_done')
                : `${t(lang, 'stat_day_of14')} (${14 - dayNum} remaining)`
              : t(lang, 'stat_day_not_started')}
          </div>
        </div>

        {/* Card 2: Latest Focus Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-lg shadow-slate-950/50 space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t(lang, 'stat_score_label')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {latestScore !== null ? latestScore : '—'}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {latestScore !== null
              ? scoreDelta !== null
                ? t(lang, 'score_delta_gain_template', {
                    delta: (scoreDelta > 0 ? '+' : '') + scoreDelta,
                  })
                : t(lang, 'stat_score_baseline')
              : t(lang, 'stat_score_hint')}
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-rose-500/40 transition-all shadow-lg shadow-slate-950/50 space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t(lang, 'stat_streak_label')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">{streak}</div>
          <div className="text-xs text-slate-500 font-medium">{t(lang, 'stat_streak_sub')}</div>
        </div>

        {/* Card 4: Tests count */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-sky-500/40 transition-all shadow-lg shadow-slate-950/50 space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t(lang, 'stat_tests_label')}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">{tests.length}</div>
          <div className="text-xs text-slate-500 font-medium">{t(lang, 'stat_tests_sub')}</div>
        </div>
      </section>

      {/* Challenge Callout if not started */}
      {!isStarted && (
        <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-950/40 via-slate-900/90 to-slate-900/90 border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              <span>{t(lang, 'start_challenge_title')}</span>
            </h3>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              {t(lang, 'start_challenge_desc')}
            </p>
          </div>
          <button
            onClick={onStartChallenge}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all whitespace-nowrap shadow-lg shadow-teal-500/20 active:scale-95"
          >
            {t(lang, 'start_challenge_btn')}
          </button>
        </section>
      )}

      {/* Focus Curve Preview Panel */}
      <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl shadow-slate-950/50 space-y-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>{t(lang, 'curve_title')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{t(lang, 'curve_desc')}</p>
          </div>
          {tests.length > 0 && (
            <button
              onClick={() => onNavigate('progress')}
              className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-mono font-semibold transition-colors group"
            >
              <span>{t(lang, 'nav_progress')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>

        <div className="h-48 w-full bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-center shadow-inner">
          {tests.length ? (
            <SvgScoreChart values={tests.map((t) => t.score)} />
          ) : (
            <div className="text-center space-y-2 text-slate-500">
              <ShieldAlert className="w-6 h-6 mx-auto stroke-1 text-slate-400" />
              <p className="text-sm font-medium">{t(lang, 'curve_empty')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
