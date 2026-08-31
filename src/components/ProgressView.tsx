import React, { useState } from 'react';
import {
  LineChart,
  BarChart3,
  History,
  ShieldAlert,
  GitCompare,
  TrendingDown,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Language, SafaAppState } from '../types';
import { t } from '../lib/i18n';
import { SvgScoreChart } from './Dashboard';
import {
  computeCorrelation,
  extractPairedData,
  BENCHMARK_PAIRED_DATA,
} from '../lib/correlation';

interface ProgressViewProps {
  state: SafaAppState;
  lang: Language;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ state, lang }) => {
  const [showBenchmark, setShowBenchmark] = useState(false);
  const tests = state.attentionTests;

  const logEntries = Object.keys(state.dailyLogs)
    .sort()
    .map((k) => ({
      key: k,
      minutes: state.dailyLogs[k].screenTimeMinutes,
    }));

  const maxMinutes = Math.max(1, ...logEntries.map((e) => e.minutes || 0));

  // Compute Empirical Correlation
  const userPairedData = extractPairedData(state.dailyLogs, state.attentionTests);
  const activePairedData =
    showBenchmark || userPairedData.length < 2
      ? showBenchmark
        ? BENCHMARK_PAIRED_DATA
        : userPairedData
      : userPairedData;

  const correlation = computeCorrelation(
    activePairedData.length > 0 ? activePairedData : BENCHMARK_PAIRED_DATA
  );

  const hasRealCorrelation = userPairedData.length >= 2;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
          {t(lang, 'progress_eyebrow')}
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
          {t(lang, 'progress_title')}
        </h2>
      </div>

      {/* ========================================================================= */}
      {/* DATA CORRELATION ENGINE (Screen Time vs. SART Attention Score)            */}
      {/* ========================================================================= */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                {t(lang, 'correlation_eyebrow')}
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-100">
                {t(lang, 'correlation_title')}
              </h3>
            </div>
          </div>

          {/* Benchmark Toggle Button */}
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 transition-all border ${
              showBenchmark
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showBenchmark ? 'Showing Benchmark' : t(lang, 'correlation_sample_toggle')}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t(lang, 'correlation_desc')}
        </p>

        {/* Key Correlation Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pearson R */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {t(lang, 'correlation_r_metric')}
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  correlation.direction === 'negative'
                    ? 'text-teal-400'
                    : correlation.direction === 'positive'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {correlation.rFormatted}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {correlation.strength}
              </span>
            </div>
          </div>

          {/* Delta Per Hour */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {t(lang, 'correlation_delta_hour')}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-teal-300">
                {correlation.slopePerHour !== null
                  ? `${correlation.slopePerHour > 0 ? '+' : ''}${correlation.slopePerHour}`
                  : '—'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">pts/hr</span>
            </div>
          </div>

          {/* Mean Screen Time */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {t(lang, 'correlation_avg_screen_time')}
            </div>
            <div className="font-mono text-2xl font-bold text-slate-200">
              {correlation.meanScreenTime} <span className="text-xs text-slate-500 font-normal">min</span>
            </div>
          </div>

          {/* Mean SART Score */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {t(lang, 'correlation_avg_score')}
            </div>
            <div className="font-mono text-2xl font-bold text-teal-400">
              {correlation.meanScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
        </div>

        {/* Narrative Insight Banner */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-teal-500/20 flex items-start gap-3">
          <div className="mt-0.5 p-1 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
            {correlation.direction === 'negative' ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
          </div>
          <div className="space-y-1 text-xs leading-relaxed">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span>{t(lang, 'correlation_impact_label')}</span>
              {showBenchmark && (
                <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-mono">
                  PNAS Study Benchmark
                </span>
              )}
            </div>
            <p className="text-slate-400 font-medium">
              {lang === 'ar' ? correlation.insightAr : correlation.insightEn}
            </p>
          </div>
        </div>

        {/* Paired Sessions Comparison Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 font-semibold flex items-center justify-between">
            <span>
              {t(lang, 'correlation_paired_samples')} ({activePairedData.length})
            </span>
            {!hasRealCorrelation && !showBenchmark && (
              <span className="text-[11px] text-amber-400/90 flex items-center gap-1 font-sans">
                <Info className="w-3 h-3" />
                {t(lang, 'correlation_empty_hint')}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-start text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                  <th className="py-2.5 px-4 text-start">{t(lang, 'correlation_date_col')}</th>
                  <th className="py-2.5 px-4 text-start">{t(lang, 'correlation_screen_col')}</th>
                  <th className="py-2.5 px-4 text-start">{t(lang, 'correlation_score_col')}</th>
                  <th className="py-2.5 px-4 text-start">{t(lang, 'correlation_commission_col')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {activePairedData.length > 0 ? (
                  activePairedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-300 font-medium">{row.date}</td>
                      <td className="py-2.5 px-4 text-teal-400 font-bold">
                        {row.screenTimeMinutes} min
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20">
                          {row.score} / 100
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {row.commissionErrors !== undefined ? `${row.commissionErrors} lapses` : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      {t(lang, 'correlation_empty_hint')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. Attention Curve */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold font-display text-slate-100">
          <LineChart className="w-4 h-4 text-teal-400" />
          <span>{t(lang, 'progress_curve_title')}</span>
        </div>

        <div className="h-64 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center shadow-inner">
          {tests.length ? (
            <SvgScoreChart values={tests.map((t) => t.score)} height={240} />
          ) : (
            <div className="text-center space-y-2 text-slate-500">
              <ShieldAlert className="w-6 h-6 mx-auto stroke-1" />
              <p className="text-sm">{t(lang, 'curve_empty')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Daily Screen Time Bars */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold font-display text-slate-100">
          <BarChart3 className="w-4 h-4 text-teal-400" />
          <span>{t(lang, 'progress_screentime_title')}</span>
        </div>

        {logEntries.length ? (
          <div className="h-44 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-end gap-3 overflow-x-auto shadow-inner">
            {logEntries.map((e) => {
              const h = e.minutes !== null ? Math.max(8, (e.minutes / maxMinutes) * 100) : 8;
              const label = e.key.slice(5); // MM-DD

              return (
                <div
                  key={e.key}
                  className="flex-1 min-w-[36px] flex flex-col items-center gap-1.5 h-full justify-end group"
                >
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {e.minutes ?? '—'}m
                  </div>
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full max-w-[28px] rounded-t-md bg-teal-500/80 group-hover:bg-teal-400 transition-colors shadow-xs shadow-teal-500/30"
                  />
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            {t(lang, 'progress_screentime_empty')}
          </div>
        )}
      </div>

      {/* 3. Session History */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold font-display text-slate-100">
          <History className="w-4 h-4 text-teal-400" />
          <span>{t(lang, 'progress_history_title')}</span>
        </div>

        {tests.length ? (
          <div className="space-y-2">
            {[...tests].reverse().map((tItem, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs transition-colors hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{tItem.date}</span>
                  <span className="text-slate-500">
                    RT: {tItem.meanRT !== null ? `${tItem.meanRT}ms` : '—'} (CV {tItem.rtCV.toFixed(2)})
                  </span>
                  <span className="text-slate-500">
                    Commission: {tItem.commissionErrors}/{tItem.noGoTrials}
                  </span>
                </div>
                <div className="font-mono font-bold text-base text-teal-400">
                  {tItem.score} / 100
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            {t(lang, 'progress_history_empty')}
          </div>
        )}
      </div>
    </div>
  );
};
