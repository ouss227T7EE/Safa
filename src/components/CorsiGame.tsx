import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CorsiGameState, Language, ViewType } from '../types';
import { t } from '../lib/i18n';
import { generateCorsiSequence } from '../lib/gamesEngine';
import { ProgramLogo } from './BrandIcons';

interface CorsiGameProps {
  lang: Language;
  stats: CorsiGameState;
  onUpdateStats: (updater: (prev: CorsiGameState) => CorsiGameState) => void;
  onNavigate: (view: ViewType) => void;
}

export const CorsiGame: React.FC<CorsiGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentSpan, setCurrentSpan] = useState<number>(3);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [isDemonstrating, setIsDemonstrating] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [tappedSquare, setTappedSquare] = useState<number | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startGame = () => {
    clearTimers();
    setCurrentSpan(3);
    setGameOver(false);
    setIsPlaying(true);
    startRound(3);
  };

  const startRound = (spanLength: number) => {
    clearTimers();
    const seq = generateCorsiSequence(spanLength, 16);
    setSequence(seq);
    setUserSequence([]);
    setIsDemonstrating(true);

    // Initial pause before demonstration begins
    const initTimer = setTimeout(() => {
      playSequenceAnimation(seq, 0, spanLength);
    }, 600);
    timersRef.current.push(initTimer);
  };

  const playSequenceAnimation = (seq: number[], index: number, spanLength: number) => {
    if (index >= seq.length) {
      setActiveSquare(null);
      setIsDemonstrating(false);
      return;
    }

    const pos = seq[index];
    setActiveSquare(pos);

    // Light up for 500ms
    const offTimer = setTimeout(() => {
      setActiveSquare(null);
      // Wait 250ms between flashes
      const nextTimer = setTimeout(() => {
        playSequenceAnimation(seq, index + 1, spanLength);
      }, 250);
      timersRef.current.push(nextTimer);
    }, 500);

    timersRef.current.push(offTimer);
  };

  const handleTileClick = (index: number) => {
    if (isDemonstrating || gameOver || !isPlaying) return;

    const nextUserSeq = [...userSequence, index];
    setUserSequence(nextUserSeq);

    // Visual feedback for user tap
    setTappedSquare(index);
    setTimeout(() => setTappedSquare(null), 200);

    const currentIndex = nextUserSeq.length - 1;
    // Check if user made a mistake
    if (nextUserSeq[currentIndex] !== sequence[currentIndex]) {
      handleGameOver();
      return;
    }

    // Check if completed round
    if (nextUserSeq.length === sequence.length) {
      const nextSpan = currentSpan + 1;
      setCurrentSpan(nextSpan);
      setIsDemonstrating(true);
      const nextRoundTimer = setTimeout(() => {
        startRound(nextSpan);
      }, 800);
      timersRef.current.push(nextRoundTimer);
    }
  };

  const handleGameOver = () => {
    clearTimers();
    setGameOver(true);
    setIsPlaying(false);
    const finalAchievedSpan = currentSpan - 1;

    onUpdateStats((prev) => ({
      played: prev.played + 1,
      bestSpan: Math.max(prev.bestSpan, finalAchievedSpan),
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
          {t(lang, 'corsi_name')}
        </h2>
      </div>

      {!isPlaying && !gameOver ? (
        /* Setup */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <ProgramLogo type="corsi" size="lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-100">{t(lang, 'corsi_name')}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'corsi_instructions')}
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'corsi_start_btn')}
          </button>
        </div>
      ) : isPlaying ? (
        /* Playing Stage */
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 text-center shadow-xl shadow-slate-950/50">
          {/* Header Status */}
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span className="text-teal-400 font-bold">Span: {currentSpan} Blocks</span>
            <span>
              {isDemonstrating ? t(lang, 'corsi_watch') : t(lang, 'corsi_your_turn')}
            </span>
          </div>

          {/* 4x4 Grid (16 Tiles) */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 mx-auto grid grid-cols-4 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
            {Array.from({ length: 16 }).map((_, i) => {
              const isDemonstratingLit = activeSquare === i;
              const isUserTapped = tappedSquare === i;

              return (
                <button
                  key={i}
                  disabled={isDemonstrating}
                  onClick={() => handleTileClick(i)}
                  className={`rounded-xl transition-all duration-150 aspect-square select-none ${
                    isDemonstratingLit
                      ? 'bg-teal-400 shadow-lg shadow-teal-500/60 scale-95 ring-2 ring-white'
                      : isUserTapped
                      ? 'bg-teal-300 scale-95 ring-2 ring-teal-400'
                      : 'bg-slate-900 hover:bg-slate-850 border border-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Progress: {userSequence.length} / {sequence.length}
          </div>
        </div>
      ) : (
        /* Game Over */
        gameOver && (
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t(lang, 'corsi_final_span')}</span>
              </div>
              <div className="font-mono text-6xl font-bold text-teal-400 pt-2">
                {currentSpan - 1}
                <span className="text-sm font-normal text-slate-400 ml-1">blocks</span>
              </div>
            </div>

            <button
              onClick={startGame}
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
          <div className="text-[10px] text-teal-400">{t(lang, 'corsi_best')}</div>
          <div className="font-mono text-base font-bold text-teal-400">{stats.bestSpan} blocks</div>
        </div>
      </div>
    </div>
  );
};
