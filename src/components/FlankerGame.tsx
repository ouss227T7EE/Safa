import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Play } from 'lucide-react';
import { FlankerDirection, FlankerGameState, FlankerResult, FlankerTrial, Language, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generateFlankerTrials, scoreFlankerResults } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface FlankerGameProps {
  lang: Language;
  stats: FlankerGameState;
  onUpdateStats: (updater: (prev: FlankerGameState) => FlankerGameState) => void;
  onNavigate: (view: ViewType) => void;
}

export const FlankerGame: React.FC<FlankerGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trials, setTrials] = useState<FlankerTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [results, setResults] = useState<FlankerResult | null>(null);

  const trialStartRef = useRef<number>(0);
  const isRespondingRef = useRef<boolean>(false);

  const startTest = () => {
    const list = generateFlankerTrials(24);
    setTrials(list);
    setTrialIndex(0);
    setResults(null);
    setIsPlaying(true);
    isRespondingRef.current = false;
    trialStartRef.current = performance.now();
  };

  const handleResponse = useCallback((direction: FlankerDirection) => {
    if (!isPlaying || isRespondingRef.current) return;
    if (trialIndex >= trials.length) return;

    isRespondingRef.current = true;
    const rt = performance.now() - trialStartRef.current;
    const currentTrial = trials[trialIndex];
    const isCorrect = direction === currentTrial.target;

    const updatedTrials = [...trials];
    updatedTrials[trialIndex] = {
      ...currentTrial,
      responded: true,
      isCorrect,
      rtMs: Math.round(rt),
    };
    setTrials(updatedTrials);

    const nextIdx = trialIndex + 1;
    if (nextIdx >= trials.length) {
      setIsPlaying(false);
      const scored = scoreFlankerResults(updatedTrials);
      setResults(scored);

      onUpdateStats((prev) => ({
        played: prev.played + 1,
        bestCost: prev.bestCost === 0 ? scored.flankerCost : Math.min(prev.bestCost, scored.flankerCost),
        bestAccuracy: Math.max(prev.bestAccuracy, scored.accuracy),
      }));
    } else {
      setTrialIndex(nextIdx);
      isRespondingRef.current = false;
      trialStartRef.current = performance.now();
    }
  }, [isPlaying, trialIndex, trials, onUpdateStats]);

  // Keyboard navigation for Left and Right Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleResponse('left');
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleResponse('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleResponse]);

  const current = trials[trialIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('games-hub')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t(lang, 'btn_back_games')}</span>
        </button>

        <h2 className="text-xl font-display font-bold text-slate-100">
          {t(lang, 'flanker_title')}
        </h2>
      </div>

      {!isPlaying && !results ? (
        /* Intro / Setup */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ProgramLogo type="flanker" size="lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-100">
              {t(lang, 'flanker_title')}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'flanker_desc')}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl max-w-sm mx-auto text-xs text-slate-300 font-mono">
            <div className="text-teal-400 font-bold mb-1">Stimulus Guide:</div>
            <div>&lt; &lt; <span className="text-teal-300 font-bold underline">&lt;</span> &lt; &lt; → Press Left</div>
            <div>&gt; &gt; <span className="text-teal-300 font-bold underline">&lt;</span> &gt; &gt; → Press Left (Center Arrow)</div>
          </div>

          <button
            onClick={startTest}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'flanker_start_btn')} (24 Trials)
          </button>
        </div>
      ) : isPlaying && current ? (
        /* Live Stage */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-8 text-center shadow-xl shadow-slate-950/50">
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-teal-500 transition-all duration-150 ease-linear shadow-xs shadow-teal-500/50"
              style={{
                width: `${Math.round(((trialIndex + 1) / trials.length) * 100)}%`,
              }}
            />
          </div>

          <div className="py-8 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-inner flex items-center justify-center">
            <span className="font-mono text-5xl sm:text-6xl font-bold tracking-widest text-slate-100 select-none">
              {current.stimulusString}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleResponse('left')}
              className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-teal-500/20 border border-slate-800 hover:border-teal-500 text-sm font-bold text-slate-100 hover:text-teal-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
            >
              &larr; {t(lang, 'flanker_btn_left')}
            </button>
            <button
              onClick={() => handleResponse('right')}
              className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-teal-500/20 border border-slate-800 hover:border-teal-500 text-sm font-bold text-slate-100 hover:text-teal-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
            >
              {t(lang, 'flanker_btn_right')} &rarr;
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Trial {trialIndex + 1} / {trials.length} &bull; Arrow keys active
          </div>
        </div>
      ) : (
        /* Results Stage */
        results && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selective Attention Score</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {results.score}
                <span className="text-sm font-normal text-slate-400 ml-1">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'flanker_result_congruent')}</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.meanCongruentRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'flanker_result_incongruent')}</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.meanIncongruentRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'flanker_result_cost')}</div>
                <div className="font-mono text-xl font-bold text-amber-400">
                  +{results.flankerCost} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'flanker_result_accuracy')}</div>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {results.accuracy}%
                </div>
              </div>
            </div>

            <button
              onClick={startTest}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
            >
              {t(lang, 'btn_new_game')}
            </button>
          </div>
        )
      )}

      {/* Persistent Stats Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-around text-center shadow-md shadow-slate-950/40">
        <div>
          <div className="text-[10px] text-slate-500">{t(lang, 'game_total_plays')}</div>
          <div className="font-mono text-base font-bold text-slate-100">{stats.played}</div>
        </div>
        <div>
          <div className="text-[10px] text-amber-400">Best Flanker Cost</div>
          <div className="font-mono text-base font-bold text-amber-400">{stats.bestCost ? `+${stats.bestCost}ms` : '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Best Accuracy</div>
          <div className="font-mono text-base font-bold text-emerald-400">{stats.bestAccuracy}%</div>
        </div>
      </div>
    </div>
  );
};
