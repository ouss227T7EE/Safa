import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { Language, PosnerGameState, PosnerResult, PosnerSide, PosnerTrial, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generatePosnerTrials, scorePosnerResults } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface PosnerGameProps {
  lang: Language;
  stats: PosnerGameState;
  onUpdateStats: (updater: (prev: PosnerGameState) => PosnerGameState) => void;
  onNavigate: (view: ViewType) => void;
}

type StagePhase = 'fixation' | 'cued' | 'target';

export const PosnerGame: React.FC<PosnerGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trials, setTrials] = useState<PosnerTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [stagePhase, setStagePhase] = useState<StagePhase>('fixation');
  const [activeCueSide, setActiveCueSide] = useState<PosnerSide | null>(null);
  const [activeTargetSide, setActiveTargetSide] = useState<PosnerSide | null>(null);
  const [results, setResults] = useState<PosnerResult | null>(null);

  const trialStartRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const isRespondingRef = useRef<boolean>(false);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const runTrial = useCallback((idx: number, sequence: PosnerTrial[]) => {
    clearTimers();
    if (idx >= sequence.length) {
      setIsPlaying(false);
      setStagePhase('fixation');
      setActiveCueSide(null);
      setActiveTargetSide(null);
      const scored = scorePosnerResults(sequence);
      setResults(scored);

      onUpdateStats((prev) => ({
        played: prev.played + 1,
        bestAdvantage: Math.max(prev.bestAdvantage, scored.cueingEffect),
        bestAccuracy: Math.max(prev.bestAccuracy, scored.accuracy),
      }));
      return;
    }

    const currentTrial = sequence[idx];
    setTrialIndex(idx);
    setStagePhase('fixation');
    setActiveCueSide(null);
    setActiveTargetSide(null);
    isRespondingRef.current = false;

    // 1. Show Fixation for 500ms
    const cueTimer = setTimeout(() => {
      setStagePhase('cued');
      setActiveCueSide(currentTrial.cueSide);

      // 2. Cue flash duration = 100ms
      const uncueTimer = setTimeout(() => {
        setActiveCueSide(null);

        // 3. Target display after SOA
        const targetTimer = setTimeout(() => {
          setStagePhase('target');
          setActiveTargetSide(currentTrial.targetSide);
          trialStartRef.current = performance.now();
        }, currentTrial.soaMs);

        timersRef.current.push(targetTimer);
      }, 100);

      timersRef.current.push(uncueTimer);
    }, 500);

    timersRef.current.push(cueTimer);
  }, [onUpdateStats]);

  const startTest = () => {
    clearTimers();
    const list = generatePosnerTrials(20);
    setTrials(list);
    setResults(null);
    setIsPlaying(true);
    runTrial(0, list);
  };

  const handleBoxClick = (clickedSide: PosnerSide) => {
    if (!isPlaying || isRespondingRef.current) return;
    if (stagePhase !== 'target' || !activeTargetSide) return;

    isRespondingRef.current = true;
    const rt = performance.now() - trialStartRef.current;
    const currentTrial = trials[trialIndex];
    const isCorrect = clickedSide === currentTrial.targetSide;

    const updatedTrials = [...trials];
    updatedTrials[trialIndex] = {
      ...currentTrial,
      responded: true,
      isCorrect,
      rtMs: Math.round(rt),
    };
    setTrials(updatedTrials);

    // Advance to next trial after brief 200ms feedback
    setTimeout(() => {
      runTrial(trialIndex + 1, updatedTrials);
    }, 200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            clearTimers();
            onNavigate('games-hub');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t(lang, 'btn_back_games')}</span>
        </button>

        <h2 className="text-xl font-display font-bold text-slate-100">
          {t(lang, 'posner_title')}
        </h2>
      </div>

      {!isPlaying && !results ? (
        /* Setup / Intro */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <ProgramLogo type="posner" size="lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-100">
              {t(lang, 'posner_title')}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'posner_desc')}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl max-w-sm mx-auto text-xs text-slate-300 font-mono space-y-1">
            <div className="text-teal-400 font-bold mb-1">Spatial Protocol:</div>
            <div>Keep gaze on the central <span className="text-teal-400 font-bold">(+)</span></div>
            <div>Click the yellow target circle as fast as possible</div>
          </div>

          <button
            onClick={startTest}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'posner_start_btn')} (20 Trials)
          </button>
        </div>
      ) : isPlaying ? (
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

          {/* Posner 3-Section Stage */}
          <div className="grid grid-cols-3 items-center w-full h-64 bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 select-none relative shadow-inner">
            {/* Left Box */}
            <div
              onClick={() => handleBoxClick('left')}
              className={`w-24 h-24 mx-auto border-2 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                activeCueSide === 'left'
                  ? 'border-teal-400 bg-teal-400/20 shadow-lg shadow-teal-400/40 ring-4 ring-teal-400/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {activeTargetSide === 'left' && (
                <div className="w-10 h-10 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-ping-once border-2 border-amber-200" />
              )}
            </div>

            {/* Central Fixation Cross */}
            <div className="text-4xl font-mono text-teal-400 font-light select-none tracking-widest">
              +
            </div>

            {/* Right Box */}
            <div
              onClick={() => handleBoxClick('right')}
              className={`w-24 h-24 mx-auto border-2 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                activeCueSide === 'right'
                  ? 'border-teal-400 bg-teal-400/20 shadow-lg shadow-teal-400/40 ring-4 ring-teal-400/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {activeTargetSide === 'right' && (
                <div className="w-10 h-10 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-ping-once border-2 border-amber-200" />
              )}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Trial {trialIndex + 1} / {trials.length} &bull; Fixate on center cross
          </div>
        </div>
      ) : (
        /* Results Stage */
        results && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Spatial Attention Score</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {results.score}
                <span className="text-sm font-normal text-slate-400 ml-1">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Valid Cue RT</div>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {results.validRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Invalid Cue RT</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.invalidRt} ms
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Cueing Advantage</div>
                <div className="font-mono text-xl font-bold text-teal-400">
                  +{results.cueingEffect} ms
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
          <div className="text-[10px] text-teal-400">Best Spatial Benefit</div>
          <div className="font-mono text-base font-bold text-teal-400">{stats.bestAdvantage ? `+${stats.bestAdvantage}ms` : '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Best Accuracy</div>
          <div className="font-mono text-base font-bold text-emerald-400">{stats.bestAccuracy}%</div>
        </div>
      </div>
    </div>
  );
};
