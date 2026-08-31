import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Language, TOLGameState, TOLPegs, TOLPuzzle, ViewType } from '../types';
import { t } from '../lib/i18n';
import {
  applyTOLMove,
  isTOLEqual,
  isValidTOLMove,
  TOL_CAPACITIES,
  TOL_PUZZLES,
} from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface TOLGameProps {
  lang: Language;
  stats: TOLGameState;
  onUpdateStats: (updater: (prev: TOLGameState) => TOLGameState) => void;
  onNavigate: (view: ViewType) => void;
}

const BALL_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    shadow: string;
    highlight: string;
    nameAr: string;
    nameEn: string;
  }
> = {
  R: {
    bg: 'from-rose-500 via-rose-600 to-rose-900',
    border: 'border-rose-300/40',
    shadow: 'shadow-rose-950/60 ring-rose-400/50',
    highlight: 'bg-rose-200/50',
    nameAr: 'حمراء',
    nameEn: 'Red',
  },
  G: {
    bg: 'from-emerald-400 via-emerald-600 to-emerald-900',
    border: 'border-emerald-300/40',
    shadow: 'shadow-emerald-950/60 ring-emerald-400/50',
    highlight: 'bg-emerald-200/50',
    nameAr: 'خضراء',
    nameEn: 'Green',
  },
  B: {
    bg: 'from-sky-400 via-blue-600 to-blue-900',
    border: 'border-sky-300/40',
    shadow: 'shadow-blue-950/60 ring-blue-400/50',
    highlight: 'bg-sky-200/50',
    nameAr: 'زرقاء',
    nameEn: 'Blue',
  },
};

export const TOLGame: React.FC<TOLGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [currentPegs, setCurrentPegs] = useState<TOLPegs>(() =>
    TOL_PUZZLES[0].initial.map((p) => [...p])
  );
  const [history, setHistory] = useState<TOLPegs[]>([]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const puzzle: TOLPuzzle = TOL_PUZZLES[puzzleIndex];

  const startPuzzle = (index: number) => {
    const idx = (index + TOL_PUZZLES.length) % TOL_PUZZLES.length;
    setPuzzleIndex(idx);
    setCurrentPegs(TOL_PUZZLES[idx].initial.map((p) => [...p]));
    setHistory([]);
    setSelectedPeg(null);
    setMoveCount(0);
    setIsSolved(false);
    setErrorMessage(null);
  };

  const handleUndo = () => {
    if (history.length === 0 || isSolved) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentPegs(previous);
    setMoveCount((prev) => Math.max(0, prev - 1));
    setSelectedPeg(null);
    setErrorMessage(null);
  };

  const handlePegClick = (pegIdx: number) => {
    if (isSolved) return;
    setErrorMessage(null);

    // 1. If no ball is currently selected
    if (selectedPeg === null) {
      if (currentPegs[pegIdx].length === 0) return;
      setSelectedPeg(pegIdx);
      return;
    }

    // 2. If clicking the SAME peg -> Deselect
    if (selectedPeg === pegIdx) {
      setSelectedPeg(null);
      return;
    }

    // 3. Trying to move selected ball to pegIdx
    if (isValidTOLMove(currentPegs, selectedPeg, pegIdx)) {
      const nextPegs = applyTOLMove(currentPegs, selectedPeg, pegIdx);
      if (nextPegs) {
        setHistory((prev) => [...prev, currentPegs.map((p) => [...p])]);
        const nextMoves = moveCount + 1;
        setCurrentPegs(nextPegs);
        setMoveCount(nextMoves);
        setSelectedPeg(null);

        // Check if solved
        if (isTOLEqual(nextPegs, puzzle.target)) {
          setIsSolved(true);
          const isOptimal = nextMoves === puzzle.minMoves;
          const score = isOptimal
            ? 100
            : Math.max(40, 100 - (nextMoves - puzzle.minMoves) * 15);

          onUpdateStats((prev) => ({
            played: prev.played + 1,
            puzzlesSolved: prev.puzzlesSolved + 1,
            bestMovesScore: Math.max(prev.bestMovesScore, score),
          }));
        }
      }
    } else {
      // Invalid move: check if target peg is full
      if (currentPegs[pegIdx].length >= TOL_CAPACITIES[pegIdx]) {
        setErrorMessage(t(lang, 'tol_invalid_full'));
      } else if (currentPegs[pegIdx].length > 0) {
        // Change selection to this peg's top ball
        setSelectedPeg(pegIdx);
      } else {
        setSelectedPeg(null);
      }
    }
  };

  // Renders a single sphere with glossy 3D illumination & tactile patterns
  const renderSphere = (
    colorKey: string,
    size: 'normal' | 'mini',
    isLifted = false
  ) => {
    const style = BALL_STYLES[colorKey] || BALL_STYLES.R;
    const isNormal = size === 'normal';
    const cbColor = colorKey === 'R' ? 'red' : colorKey === 'G' ? 'green' : 'blue';

    return (
      <div
        data-cb-color={cbColor}
        className={`relative rounded-full bg-gradient-to-br ${style.bg} border ${
          style.border
        } shadow-lg ${style.shadow} flex items-center justify-center font-bold select-none transition-all duration-200 cb-pattern-${cbColor} ${
          isNormal
            ? 'w-12 h-12 sm:w-[50px] sm:h-[50px] text-xs text-white'
            : 'w-7 h-7 text-[10px] text-white/90'
        } ${
          isLifted
            ? 'ring-4 ring-teal-400 shadow-teal-500/50 scale-110 -translate-y-2 animate-bounce'
            : ''
        }`}
      >
        {/* Specular glass reflection highlight */}
        <div
          className={`absolute top-1 left-2 rounded-full ${
            style.highlight
          } blur-[0.5px] pointer-events-none ${
            isNormal ? 'w-4 h-2.5 rotate-[-25deg]' : 'w-2.5 h-1.5 rotate-[-25deg]'
          }`}
        />
        <span className="drop-shadow-md z-10 font-mono tracking-tighter">
          {colorKey}
        </span>
      </div>
    );
  };

  // Renders an entire peg apparatus with calibrated rod heights and physical slots
  const renderApparatus = (
    pegs: TOLPegs,
    interactive: boolean,
    size: 'normal' | 'mini'
  ) => {
    const isNormal = size === 'normal';

    // Exact rod physical heights based on capacity (3, 2, 1)
    const rodHeights = isNormal
      ? ['h-[160px]', 'h-[110px]', 'h-[60px]']
      : ['h-[84px]', 'h-[58px]', 'h-[32px]'];

    const containerHeight = isNormal ? 'h-[230px]' : 'h-[110px]';
    const ballSpacing = isNormal ? 52 : 28;

    return (
      <div
        className={`w-full ${containerHeight} relative flex items-end justify-around px-2 sm:px-6 select-none`}
      >
        {pegs.map((balls, pegIdx) => {
          const capacity = TOL_CAPACITIES[pegIdx];
          const isSelected = interactive && selectedPeg === pegIdx;
          const isHoverable =
            interactive &&
            ((selectedPeg === null && balls.length > 0) ||
              (selectedPeg !== null &&
                (selectedPeg === pegIdx || balls.length < capacity)));

          const isDropTargetValid =
            interactive &&
            selectedPeg !== null &&
            selectedPeg !== pegIdx &&
            balls.length < capacity;

          return (
            <div
              key={pegIdx}
              id={`tol-peg-${pegIdx}-${size}`}
              onClick={() => interactive && handlePegClick(pegIdx)}
              className={`relative flex flex-col items-center justify-end w-20 sm:w-28 h-full group transition-all ${
                interactive ? 'cursor-pointer' : ''
              }`}
            >
              {/* Selected Lifted Indicator / Drop Target Glow */}
              {isDropTargetValid && (
                <div className="absolute top-2 w-14 h-6 rounded-full bg-teal-500/20 border border-teal-500/60 text-teal-300 text-[9px] font-bold flex items-center justify-center animate-pulse z-30 pointer-events-none">
                  {lang === 'ar' ? 'ضع هنا' : 'Drop'}
                </div>
              )}

              {/* Physical Vertical Rod */}
              <div
                className={`absolute bottom-6 w-3 sm:w-3.5 ${
                  rodHeights[pegIdx]
                } rounded-t-full bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 border-x border-slate-500/60 shadow-md transition-all z-0 ${
                  isSelected
                    ? 'ring-2 ring-teal-400 bg-teal-600'
                    : isDropTargetValid
                    ? 'ring-2 ring-teal-400/50'
                    : ''
                }`}
              />

              {/* Balls Layer stacked over rod from base */}
              <div className="absolute bottom-6 flex flex-col items-center z-10 w-full pointer-events-none">
                {balls.map((b, bIdx) => {
                  const isTop = bIdx === balls.length - 1;
                  const isLifted = isSelected && isTop;

                  return (
                    <div
                      key={bIdx}
                      className="absolute transition-all duration-300 ease-out"
                      style={{
                        bottom: isLifted
                          ? `${175}px`
                          : `${bIdx * ballSpacing}px`,
                      }}
                    >
                      {renderSphere(b, size, isLifted)}
                    </div>
                  );
                })}
              </div>

              {/* Peg Base Plate / Socket */}
              <div
                className={`w-16 sm:w-20 h-5 sm:h-6 rounded-lg bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-600/80 shadow-md flex items-center justify-center z-10 transition-colors ${
                  isSelected
                    ? 'border-teal-400 bg-slate-800'
                    : isHoverable && interactive
                    ? 'group-hover:border-slate-400'
                    : ''
                }`}
              >
                <div className="w-4 h-2 rounded-full bg-slate-950/80 border border-slate-700 shadow-inner" />
              </div>

              {/* Peg Capacity Label */}
              <div className="mt-1 text-[10px] font-mono font-medium text-slate-400">
                {t(lang, 'tol_peg')} {pegIdx + 1}{' '}
                <span className="text-slate-500">
                  ({t(lang, 'tol_peg_cap')} {capacity})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="tol-back-btn"
          onClick={() => onNavigate('games-hub')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t(lang, 'btn_back_games')}</span>
        </button>

        <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
          <ProgramLogo type="tol" size="sm" />
          <span>{t(lang, 'tol_title')}</span>
        </h2>
      </div>

      {/* Level Selection & Navigation Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 shadow-md">
        <button
          id="tol-prev-puzzle-btn"
          onClick={() => startPuzzle(puzzleIndex - 1)}
          disabled={puzzleIndex === 0}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Previous Puzzle"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Puzzle Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {TOL_PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              id={`tol-level-chip-${p.id}`}
              onClick={() => startPuzzle(idx)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                puzzleIndex === idx
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 scale-105'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              #{p.id} ({p.minMoves}m)
            </button>
          ))}
        </div>

        <button
          id="tol-next-puzzle-btn"
          onClick={() => startPuzzle(puzzleIndex + 1)}
          disabled={puzzleIndex === TOL_PUZZLES.length - 1}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Next Puzzle"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Playing Interface */}
      <div className="p-5 sm:p-7 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 shadow-xl shadow-slate-950/50 relative">
        {/* Info & Metrics Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-xs font-bold">
              {t(lang, 'tol_puzzle')} {puzzleIndex + 1} / {TOL_PUZZLES.length}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              {t(lang, 'tol_moves')}{' '}
              <b
                className={`text-sm ${
                  moveCount > puzzle.minMoves
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {moveCount}
              </b>
            </div>
            <div>
              {t(lang, 'tol_optimal')}{' '}
              <b className="text-teal-400 text-sm">{puzzle.minMoves}</b>
            </div>

            {/* Action Buttons: Undo & Reset */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                id="tol-undo-btn"
                onClick={handleUndo}
                disabled={history.length === 0 || isSolved}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title={t(lang, 'tol_undo')}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                id="tol-reset-btn"
                onClick={() => startPuzzle(puzzleIndex)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
                title={t(lang, 'tol_reset')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Target Goal Configuration (Miniature Replica) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t(lang, 'tol_goal_target')}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Min: {puzzle.minMoves} moves
            </span>
          </div>

          <div className="pt-1">
            {renderApparatus(puzzle.target, false, 'mini')}
          </div>
        </div>

        {/* Interactive Working Board */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border-2 border-slate-800 relative shadow-inner overflow-hidden">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            {t(lang, 'tol_current_board')}
          </div>

          {renderApparatus(currentPegs, true, 'normal')}

          {/* Interactive Instructions / Error Toast */}
          {errorMessage && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg animate-shake z-30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Solved Victory Overlay */}
          {isSolved && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-40 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display text-slate-100">
                  {moveCount === puzzle.minMoves
                    ? t(lang, 'tol_perfect_title')
                    : t(lang, 'tol_solved_title')}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {t(lang, 'tol_solved_desc')
                    .replace('{moves}', String(moveCount))
                    .replace('{optimal}', String(puzzle.minMoves))}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  id="tol-replay-btn"
                  onClick={() => startPuzzle(puzzleIndex)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  {t(lang, 'tol_replay')}
                </button>
                <button
                  id="tol-next-btn"
                  onClick={() => startPuzzle(puzzleIndex + 1)}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/20"
                >
                  {t(lang, 'tol_next_puzzle')}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 leading-relaxed">
          {t(lang, 'tol_instructions')}
        </p>
      </div>

      {/* Persistent Stats Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-around text-center shadow-md shadow-slate-950/40">
        <div>
          <div className="text-[10px] text-slate-500">
            {t(lang, 'game_total_plays')}
          </div>
          <div className="font-mono text-base font-bold text-slate-100">
            {stats.played}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-teal-400">
            {t(lang, 'tol_puzzles_solved')}
          </div>
          <div className="font-mono text-base font-bold text-teal-400">
            {stats.puzzlesSolved}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">
            {t(lang, 'tol_planning_efficiency')}
          </div>
          <div className="font-mono text-base font-bold text-emerald-400">
            {stats.bestMovesScore ? `${stats.bestMovesScore}%` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
