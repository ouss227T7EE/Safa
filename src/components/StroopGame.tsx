import React, { useState, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { Language, StroopGameState, StroopResponse, StroopTrial, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generateStroopTrials, scoreStroopResults, STROOP_COLORS } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface StroopGameProps {
  lang: Language;
  stats: StroopGameState;
  onUpdateStats: (updater: (prev: StroopGameState) => StroopGameState) => void;
  onNavigate: (view: ViewType) => void;
}

export const StroopGame: React.FC<StroopGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [responses, setResponses] = useState<StroopResponse[]>([]);
  const [results, setResults] = useState<{
    score: number;
    accuracy: number;
    avgRT: number | null;
    stroopEffect: number | null;
  } | null>(null);

  const trialStartRef = useRef<number>(0);

  const startTest = () => {
    const list = generateStroopTrials(24);
    setTrials(list);
    setTrialIndex(0);
    setResponses([]);
    setResults(null);
    setIsPlaying(true);
    trialStartRef.current = performance.now();
  };

  const handleAnswer = (selectedColorKey: string) => {
    if (!isPlaying || trialIndex >= trials.length) return;

    const currentTrial = trials[trialIndex];
    const rt = performance.now() - trialStartRef.current;
    const isCorrect = selectedColorKey === currentTrial.inkKey;

    const newResponse: StroopResponse = {
      correct: isCorrect,
      rtMs: Math.round(rt),
      congruent: currentTrial.congruent,
    };

    const nextResponses = [...responses, newResponse];
    setResponses(nextResponses);

    const nextIdx = trialIndex + 1;
    if (nextIdx >= trials.length) {
      // Finished
      setIsPlaying(false);
      const scored = scoreStroopResults(nextResponses);
      setResults(scored);

      onUpdateStats((prev) => ({
        played: prev.played + 1,
        bestScore: Math.max(prev.bestScore, scored.score),
        bestAccuracy: Math.max(prev.bestAccuracy, scored.accuracy),
      }));
    } else {
      setTrialIndex(nextIdx);
      trialStartRef.current = performance.now();
    }
  };

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
          {t(lang, 'stroop_name')}
        </h2>
      </div>

      {!isPlaying && !results ? (
        /* Setup */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ProgramLogo type="stroop" size="lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-100">{t(lang, 'stroop_name')}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'stroop_instructions')}
            </p>
          </div>

          <button
            onClick={startTest}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'stroop_start_btn')} (24 Trials)
          </button>
        </div>
      ) : isPlaying && current ? (
        /* Playing Stage */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-8 text-center shadow-xl shadow-slate-950/50">
          {/* Progress */}
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-teal-500 transition-all duration-150 ease-linear shadow-xs shadow-teal-500/50"
              style={{
                width: `${Math.round(((trialIndex + 1) / trials.length) * 100)}%`,
              }}
            />
          </div>

          {/* Color Word with Ink Styling & Accessible Tactile Pattern */}
          <div className="py-8 relative">
            <div
              className="inline-block px-8 py-4 rounded-2xl transition-all stroop-stimulus-box"
              data-cb-color={current.inkKey}
              data-pattern-label={
                current.inkKey === 'red'
                  ? '/// 45° Stripes (Red)'
                  : current.inkKey === 'green'
                  ? '≡≡≡ Horizontal (Green)'
                  : current.inkKey === 'blue'
                  ? '\\\\\\ -45° Stripes (Blue)'
                  : '|||| Vertical (Yellow)'
              }
            >
              <span
                className="text-5xl sm:text-6xl font-bold font-display transition-colors select-none drop-shadow"
                style={{ color: current.inkHex }}
              >
                {t(lang, `color_${current.wordKey}`)}
              </span>
            </div>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {STROOP_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => handleAnswer(c.key)}
                data-cb-color={c.key}
                className={`py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-sm font-bold text-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs cb-pattern-${c.key}`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-xs border border-white/20"
                  style={{ backgroundColor: c.hex }}
                  data-cb-color={c.key}
                />
                <span>{t(lang, `color_${c.key}`)}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Trial {trialIndex + 1} / {trials.length}
          </div>
        </div>
      ) : (
        /* Results */
        results && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Stroop Performance Score</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {results.score}
                <span className="text-sm font-normal text-slate-400 ml-1">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'stroop_result_accuracy')}</div>
                <div className="font-mono text-xl font-bold text-emerald-400">
                  {results.accuracy}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'stroop_result_rt')}</div>
                <div className="font-mono text-xl font-bold text-slate-100">
                  {results.avgRT !== null ? `${results.avgRT} ms` : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'stroop_result_effect')}</div>
                <div className="font-mono text-xl font-bold text-teal-400">
                  {results.stroopEffect !== null ? `${results.stroopEffect} ms` : '—'}
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

      {/* Stats */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-around text-center shadow-md shadow-slate-950/40">
        <div>
          <div className="text-[10px] text-slate-500">{t(lang, 'game_total_plays')}</div>
          <div className="font-mono text-base font-bold text-slate-100">{stats.played}</div>
        </div>
        <div>
          <div className="text-[10px] text-teal-400">Best Score</div>
          <div className="font-mono text-base font-bold text-teal-400">{stats.bestScore}/100</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Best Accuracy</div>
          <div className="font-mono text-base font-bold text-emerald-400">{stats.bestAccuracy}%</div>
        </div>
      </div>
    </div>
  );
};
