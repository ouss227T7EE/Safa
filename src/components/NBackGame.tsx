import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Sliders, Zap } from 'lucide-react';
import { Language, NBackGameState, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generateNBackSequence, scoreNBackSequence } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface NBackGameProps {
  lang: Language;
  stats: NBackGameState;
  onUpdateStats: (updater: (prev: NBackGameState) => NBackGameState) => void;
  onNavigate: (view: ViewType) => void;
}

export const NBackGame: React.FC<NBackGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [level, setLevel] = useState<number>(2);
  const [stimulusMs, setStimulusMs] = useState<number>(600); // Expose stimulus time
  const [blankMs, setBlankMs] = useState<number>(1200); // Expose blank interval time
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [responses, setResponses] = useState<Set<number>>(new Set());
  const [matchPressed, setMatchPressed] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'hit' | 'false-alarm' | null>(null);
  const [results, setResults] = useState<{
    accuracy: number;
    hits: number;
    misses: number;
    falseAlarms: number;
  } | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const responsesRef = useRef<Set<number>>(new Set());

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startGame = (nLevel = level) => {
    clearTimers();
    setLevel(nLevel);
    const seqLength = 15 + nLevel * 5; // e.g. 25 items for 2-back
    const seq = generateNBackSequence(nLevel, seqLength);
    setSequence(seq);
    responsesRef.current = new Set();
    setResponses(new Set());
    setResults(null);
    setFeedback(null);
    setCurrentIndex(0);
    setIsPlaying(true);

    // Initial brief pause before first stimulus
    const startTimer = setTimeout(() => {
      runStep(0, seq, nLevel, stimulusMs, blankMs);
    }, 600);
    timersRef.current.push(startTimer);
  };

  const runStep = (idx: number, seq: number[], nLevel: number, stimTime: number, blankTime: number) => {
    if (idx >= seq.length) {
      finishGame(seq, nLevel);
      return;
    }

    setCurrentIndex(idx);
    const pos = seq[idx];
    setActiveSquare(pos);

    // Light up for stimTime ms, then dark for blankTime ms
    const darkTimer = setTimeout(() => {
      setActiveSquare(null);
      const nextTimer = setTimeout(() => {
        runStep(idx + 1, seq, nLevel, stimTime, blankTime);
      }, blankTime);
      timersRef.current.push(nextTimer);
    }, stimTime);

    timersRef.current.push(darkTimer);
  };

  const handleMatchClick = () => {
    if (!isPlaying || currentIndex < 0) return;
    responsesRef.current.add(currentIndex);
    setResponses(new Set(responsesRef.current));
    setMatchPressed(true);
    setTimeout(() => setMatchPressed(false), 200);

    // Immediate brief visual feedback without breaking sequence flow
    const isTrueMatch = currentIndex >= level && sequence[currentIndex] === sequence[currentIndex - level];
    setFeedback(isTrueMatch ? 'hit' : 'false-alarm');

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
    }, 380);
  };

  const finishGame = (seq: number[], nLevel: number) => {
    clearTimers();
    setIsPlaying(false);
    setActiveSquare(null);
    setFeedback(null);

    const scored = scoreNBackSequence(seq, nLevel, Array.from(responsesRef.current));
    setResults(scored);

    onUpdateStats((prev) => ({
      played: prev.played + 1,
      bestLevel: Math.max(prev.bestLevel, nLevel),
      bestAccuracy: Math.max(prev.bestAccuracy, scored.accuracy),
    }));
  };

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
          {t(lang, 'nback_name')}
        </h2>
      </div>

      {!isPlaying && !results ? (
        /* Setup */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <ProgramLogo type="nback" size="lg" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-slate-100">{t(lang, 'nback_name')}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'nback_instructions')} <strong className="text-teal-400">{level}</strong> {t(lang, 'nback_steps')}
            </p>
          </div>

          {/* Level Selector */}
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-mono uppercase">{t(lang, 'nback_level')}</div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
                    level === l
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {l}-Back
                </button>
              ))}
            </div>
          </div>

          {/* Adjustable Timing Controls */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 max-w-md mx-auto text-start">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                Timing & Speed Calibration
              </span>
              <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {stimulusMs + blankMs}ms per cycle
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-mono flex justify-between">
                  <span>Stimulus Flash:</span>
                  <span className="text-teal-400 font-bold">{stimulusMs}ms</span>
                </label>
                <div className="flex gap-1">
                  {[400, 600, 800].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setStimulusMs(ms)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        stimulusMs === ms
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {ms}ms
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-mono flex justify-between">
                  <span>Blank Interval:</span>
                  <span className="text-teal-400 font-bold">{blankMs}ms</span>
                </label>
                <div className="flex gap-1">
                  {[800, 1200, 1600].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setBlankMs(ms)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        blankMs === ms
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {ms}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => startGame(level)}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'nback_start_btn')}
          </button>
        </div>
      ) : isPlaying ? (
        /* Playing Stage */
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 text-center shadow-xl shadow-slate-950/50 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Level: {level}-Back ({stimulusMs}/{blankMs}ms)</span>
            <span>
              Item {currentIndex + 1} / {sequence.length}
            </span>
          </div>

          {/* 3x3 Grid with Instant Visual Feedback border & glow */}
          <div
            className={`w-64 h-64 mx-auto grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-2xl shadow-inner transition-all duration-150 relative ${
              feedback === 'hit'
                ? 'border-2 border-emerald-400 ring-4 ring-emerald-500/30 shadow-emerald-500/20'
                : feedback === 'false-alarm'
                ? 'border-2 border-rose-500 ring-4 ring-rose-500/30 shadow-rose-500/20'
                : 'border border-slate-800'
            }`}
          >
            {Array.from({ length: 9 }).map((_, i) => {
              const isLit = activeSquare === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl transition-all duration-150 ${
                    isLit
                      ? 'bg-teal-400 shadow-lg shadow-teal-500/50 scale-95 ring-2 ring-white cb-pattern-active'
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                />
              );
            })}

            {/* Floating Visual Feedback Badge */}
            {feedback && (
              <div
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 shadow-md animate-fade-in ${
                  feedback === 'hit'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {feedback === 'hit' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>HIT</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>FALSE ALARM</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Match Response Button */}
          <button
            onClick={handleMatchClick}
            className={`w-full max-w-xs mx-auto py-4 rounded-xl font-bold text-base transition-all duration-100 flex items-center justify-center gap-2 ${
              matchPressed
                ? 'bg-emerald-400 text-slate-950 scale-95 shadow-lg shadow-emerald-500/40'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 active:scale-[0.98]'
            }`}
          >
            <span>{t(lang, 'nback_match_btn')}</span>
          </button>
        </div>
      ) : (
        /* Results */
        results && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Results ({level}-Back)</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {results.accuracy}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'nback_result_hits')}</div>
                <div className="font-mono text-xl font-bold text-emerald-400">{results.hits}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'nback_result_misses')}</div>
                <div className="font-mono text-xl font-bold text-slate-400">{results.misses}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'nback_result_fa')}</div>
                <div className="font-mono text-xl font-bold text-rose-400">{results.falseAlarms}</div>
              </div>
            </div>

            <button
              onClick={() => startGame(level)}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
            >
              {t(lang, 'btn_new_game')}
            </button>
          </div>
        )
      )}

      {/* Stats */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-around text-center shadow-md shadow-slate-950/40">
        <div>
          <div className="text-[10px] text-slate-500">{t(lang, 'game_total_plays')}</div>
          <div className="font-mono text-base font-bold text-slate-100">{stats.played}</div>
        </div>
        <div>
          <div className="text-[10px] text-teal-400">Best Level</div>
          <div className="font-mono text-base font-bold text-teal-400">{stats.bestLevel}-Back</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Best Accuracy</div>
          <div className="font-mono text-base font-bold text-emerald-400">{stats.bestAccuracy}%</div>
        </div>
      </div>
    </div>
  );
};
