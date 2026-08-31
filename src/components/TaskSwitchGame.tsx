import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { Language, TaskSwitchGameState, TaskSwitchResult, TaskSwitchTrial, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generateTaskSwitchTrials, scoreTaskSwitchResults } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface TaskSwitchGameProps {
  lang: Language;
  stats: TaskSwitchGameState;
  onUpdateStats: (updater: (prev: TaskSwitchGameState) => TaskSwitchGameState) => void;
  onNavigate: (view: ViewType) => void;
}

export const TaskSwitchGame: React.FC<TaskSwitchGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trials, setTrials] = useState<TaskSwitchTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [results, setResults] = useState<TaskSwitchResult | null>(null);

  const trialStartRef = useRef<number>(0);
  const isRespondingRef = useRef<boolean>(false);

  const startTest = () => {
    const list = generateTaskSwitchTrials(24);
    setTrials(list);
    setTrialIndex(0);
    setResults(null);
    setIsPlaying(true);
    isRespondingRef.current = false;
    trialStartRef.current = performance.now();
  };

  const handleResponse = useCallback((choice: string) => {
    if (!isPlaying || isRespondingRef.current) return;
    if (trialIndex >= trials.length) return;

    isRespondingRef.current = true;
    const rt = performance.now() - trialStartRef.current;
    const currentTrial = trials[trialIndex];
    const isCorrect = choice === currentTrial.correctChoice;

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
      const scored = scoreTaskSwitchResults(updatedTrials);
      setResults(scored);

      onUpdateStats((prev) => ({
        played: prev.played + 1,
        bestCost: prev.bestCost === 0 ? scored.switchCost : Math.min(prev.bestCost, scored.switchCost),
        bestAccuracy: Math.max(prev.bestAccuracy, scored.accuracy),
      }));
    } else {
      setTrialIndex(nextIdx);
      isRespondingRef.current = false;
      trialStartRef.current = performance.now();
    }
  }, [isPlaying, trialIndex, trials, onUpdateStats]);

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
          {t(lang, 'taskswitch_title')}
        </h2>
      </div>

      {!isPlaying && !results ? (
        /* Intro Stage */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <ProgramLogo type="taskswitch" size="lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-100">
              {t(lang, 'taskswitch_title')}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'taskswitch_desc')}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl max-w-sm mx-auto text-xs text-slate-300 font-mono space-y-1">
            <div className="text-teal-400 font-bold mb-1">Rule Shift Pattern:</div>
            <div>2 Trials: Match by <span className="text-amber-400 font-bold">COLOR</span></div>
            <div>2 Trials: Match by <span className="text-teal-400 font-bold">SHAPE</span></div>
          </div>

          <button
            onClick={startTest}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'taskswitch_start_btn')} (24 Trials)
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

          {/* Active Rule Indicator */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Active Rule</span>
            <div
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-extrabold uppercase tracking-widest shadow-md transition-all ${
                current.task === 'color'
                  ? 'border-amber-500/70 bg-amber-500/10 text-amber-300 shadow-amber-500/10 scale-105'
                  : 'border-teal-500/70 bg-teal-500/10 text-teal-300 shadow-teal-500/10 scale-105'
              }`}
            >
              Match by: {current.task === 'color' ? 'COLOR' : 'SHAPE'}
            </div>
          </div>

          {/* Visual Stimulus */}
          <div className="h-44 w-full bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
            <div
              data-cb-color={current.color}
              className={`w-20 h-20 shadow-xl border-2 border-white/30 transition-all cb-pattern-${current.color} ${
                current.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
              } ${
                current.color === 'red'
                  ? 'bg-rose-500 shadow-rose-500/40'
                  : 'bg-blue-500 shadow-blue-500/40'
              }`}
            />
          </div>

          {/* Decision Buttons */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {current.task === 'color' ? (
              <>
                <button
                  onClick={() => handleResponse('red')}
                  data-cb-color="red"
                  className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500 text-sm font-bold text-slate-100 hover:text-rose-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs cb-pattern-red" data-cb-color="red" />
                  <span>Red (///)</span>
                </button>
                <button
                  onClick={() => handleResponse('blue')}
                  data-cb-color="blue"
                  className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500 text-sm font-bold text-slate-100 hover:text-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-xs cb-pattern-blue" data-cb-color="blue" />
                  <span>Blue (\\\)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleResponse('circle')}
                  className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-teal-500/20 border border-slate-800 hover:border-teal-500 text-sm font-bold text-slate-100 hover:text-teal-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-100" />
                  <span>Circle</span>
                </button>
                <button
                  onClick={() => handleResponse('square')}
                  className="py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-teal-500/20 border border-slate-800 hover:border-teal-500 text-sm font-bold text-slate-100 hover:text-teal-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="w-3.5 h-3.5 rounded-xs border-2 border-slate-100" />
                  <span>Square</span>
                </button>
              </>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Trial {trialIndex + 1} / {trials.length}
          </div>
        </div>
      ) : (
        /* Results Stage */
        results && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cognitive Flexibility Score</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {results.score}
                <span className="text-sm font-normal text-slate-400 ml-1">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Repeat Trial RT</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.repeatRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Switch Trial RT</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.switchRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Switch Cost</div>
                <div className="font-mono text-xl font-bold text-amber-400">
                  +{results.switchCost} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Accuracy</div>
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
          <div className="text-[10px] text-amber-400">Best Switch Cost</div>
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
