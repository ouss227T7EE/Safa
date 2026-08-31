import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import {
  ChessDifficulty,
  ChessGameState,
  ChessGameStatus,
  ChessMove,
  ChessState,
  Language,
  Piece,
  PieceColor,
  PieceType,
  Position,
  ViewType,
} from '../types';
import { t } from '../lib/i18n';
import {
  applyChessMove,
  chooseAIMove,
  getChessGameStatus,
  initialChessState,
  isKingInCheck,
  legalMoves,
} from '../lib/chessEngine';
import { ChessPiece } from './ChessPiece';
import { ProgramLogo } from './BrandIcons';

interface ChessGameProps {
  lang: Language;
  stats: ChessGameState;
  onUpdateStats: (updater: (prev: ChessGameState) => ChessGameState) => void;
  onNavigate: (view: ViewType) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const ChessGame: React.FC<ChessGameProps> = ({
  lang,
  stats,
  onUpdateStats,
  onNavigate,
}) => {
  const [gameState, setGameState] = useState<ChessState>(initialChessState());
  const [difficulty, setDifficulty] = useState<ChessDifficulty>('easy');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [highlightMoves, setHighlightMoves] = useState<ChessMove[]>([]);
  const [lastMove, setLastMove] = useState<ChessMove | null>(null);
  const [draggedPos, setDraggedPos] = useState<Position | null>(null);
  const [dragOverPos, setDragOverPos] = useState<Position | null>(null);
  const [animatingMove, setAnimatingMove] = useState<ChessMove | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<ChessGameStatus>('ongoing');

  const boardRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<ChessState>(gameState);
  gameStateRef.current = gameState;

  const startNewGame = (diff: ChessDifficulty = difficulty) => {
    setDifficulty(diff);
    const fresh = initialChessState();
    setGameState(fresh);
    gameStateRef.current = fresh;
    setSelectedPos(null);
    setHighlightMoves([]);
    setLastMove(null);
    setDraggedPos(null);
    setDragOverPos(null);
    setAnimatingMove(null);
    setGameStatus('ongoing');
    setAiThinking(false);
    setIsPlaying(true);
  };

  const endGame = useCallback((reason: ChessGameStatus, finalState: ChessState) => {
    setGameStatus(reason);
    onUpdateStats((prev) => {
      const next = { ...prev, played: prev.played + 1 };
      if (reason === 'checkmate') {
        if (finalState.turn === 'b') next.wins += 1;
        else next.losses += 1;
      } else {
        next.draws += 1;
      }
      return next;
    });
  }, [onUpdateStats]);

  const executeMove = useCallback((move: ChessMove) => {
    setAnimatingMove(move);
    setLastMove(move);
    setSelectedPos(null);
    setHighlightMoves([]);
    setDraggedPos(null);
    setDragOverPos(null);

    // Trigger smooth move state transition
    setTimeout(() => {
      const next = applyChessMove(gameStateRef.current, move);
      setGameState(next);
      gameStateRef.current = next;
      setAnimatingMove(null);

      const st = getChessGameStatus(next);
      if (st !== 'ongoing') {
        endGame(st, next);
      }
    }, 120);
  }, [endGame]);

  // AI Move triggered when turn is Black ('b')
  useEffect(() => {
    if (!isPlaying) return;
    if (gameState.turn === 'b' && gameStatus === 'ongoing') {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const move = chooseAIMove(gameState, difficulty);
        if (move) {
          executeMove(move);
        }
        setAiThinking(false);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [gameState, isPlaying, difficulty, gameStatus, executeMove]);

  const handleSquareClick = (r: number, c: number) => {
    if (!isPlaying || gameState.turn !== 'w' || gameStatus !== 'ongoing' || aiThinking) {
      return;
    }

    // Check if clicked square is a valid target move
    const matchedMove = highlightMoves.find((m) => m.to.row === r && m.to.col === c);
    if (matchedMove) {
      executeMove(matchedMove);
      return;
    }

    // Select piece
    const piece = gameState.board[r][c];
    if (piece && piece.color === 'w') {
      setSelectedPos({ row: r, col: c });
      const available = legalMoves(gameState, 'w').filter(
        (m) => m.from.row === r && m.from.col === c
      );
      setHighlightMoves(available);
    } else {
      setSelectedPos(null);
      setHighlightMoves([]);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, r: number, c: number) => {
    if (!isPlaying || gameState.turn !== 'w' || gameStatus !== 'ongoing' || aiThinking) {
      e.preventDefault();
      return;
    }
    const piece = gameState.board[r][c];
    if (!piece || piece.color !== 'w') {
      e.preventDefault();
      return;
    }

    setDraggedPos({ row: r, col: c });
    setSelectedPos({ row: r, col: c });
    const available = legalMoves(gameState, 'w').filter(
      (m) => m.from.row === r && m.from.col === c
    );
    setHighlightMoves(available);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ r, c }));
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverPos || dragOverPos.row !== r || dragOverPos.col !== c) {
      setDragOverPos({ row: r, col: c });
    }
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    setDragOverPos(null);
    if (!draggedPos) return;

    const matchedMove = highlightMoves.find(
      (m) => m.from.row === draggedPos.row && m.from.col === draggedPos.col && m.to.row === r && m.to.col === c
    );

    if (matchedMove) {
      executeMove(matchedMove);
    } else {
      setDraggedPos(null);
      setHighlightMoves([]);
      setSelectedPos(null);
    }
  };

  const inCheck = isKingInCheck(gameState, gameState.turn);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
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
          {t(lang, 'chess_name')}
        </h2>
      </div>

      {!isPlaying ? (
        /* Setup Phase */
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <ProgramLogo type="chess" size="lg" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-slate-100">
              {t(lang, 'chess_name')}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(lang, 'chess_science')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-mono uppercase">AI Difficulty</div>
            <div className="flex items-center justify-center gap-2">
              {(['easy', 'hard', 'legendary'] as ChessDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    difficulty === d
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {t(lang, `difficulty_${d}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startNewGame(difficulty)}
            className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {t(lang, 'btn_new_game')}
          </button>
        </div>
      ) : (
        /* Game Playing Board */
        <div className="space-y-4">
          {/* Status bar */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-md shadow-slate-950/40">
            <div className="flex items-center gap-2.5">
              {gameState.turn === 'w' ? (
                <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
              ) : (
                <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse" />
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-100">
                {gameStatus === 'checkmate'
                  ? gameState.turn === 'b'
                    ? t(lang, 'chess_win')
                    : t(lang, 'chess_lose')
                  : gameStatus === 'stalemate'
                  ? t(lang, 'chess_stalemate')
                  : gameStatus === 'draw'
                  ? t(lang, 'chess_draw')
                  : aiThinking
                  ? t(lang, 'chess_thinking')
                  : inCheck
                  ? 'Check! Protect your King'
                  : t(lang, 'chess_your_turn')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
                Level: {t(lang, `difficulty_${difficulty}`)}
              </span>
              <button
                onClick={() => startNewGame(difficulty)}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chessboard Container matching requested look */}
          <div className="p-3 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-slate-950/60">
            {/* Main Board with classic dark wood border */}
            <div
              ref={boardRef}
              dir="ltr"
              style={{
                gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
              }}
              className="w-full max-w-[420px] aspect-square grid border-[6px] sm:border-[8px] border-[#382013] rounded-md shadow-2xl relative overflow-hidden bg-[#382013]"
            >
              {Array.from({ length: 8 }).map((_, rowIndex) => {
                const r = 7 - rowIndex; // 7 down to 0 (Rank 8 down to 1)
                return Array.from({ length: 8 }).map((_, c) => {
                  const piece = gameState.board[r][c];
                  const isLight = (r + c) % 2 !== 0;
                  const isSelected = selectedPos?.row === r && selectedPos?.col === c;
                  const isLegalTarget = highlightMoves.some(
                    (m) => m.to.row === r && m.to.col === c
                  );
                  const isDragOver = dragOverPos?.row === r && dragOverPos?.col === c && isLegalTarget;
                  
                  // Last move highlight check
                  const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
                  const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
                  const isLastMove = isLastMoveFrom || isLastMoveTo;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      onDragOver={(e) => handleDragOver(e, r, c)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, r, c)}
                      style={{
                        minWidth: 0,
                        minHeight: 0,
                        aspectRatio: '1 / 1',
                      }}
                      className={`relative w-full h-full min-w-0 min-h-0 aspect-square overflow-hidden select-none transition-colors duration-100 cursor-pointer ${
                        isSelected
                          ? 'bg-[#BBCB42]'
                          : isLastMove
                          ? 'bg-[#CDD16D]'
                          : isLight
                          ? 'bg-[#FFFFFF]'
                          : 'bg-[#D4C5B9]'
                      } ${
                        isDragOver ? 'ring-4 ring-inset ring-emerald-400' : ''
                      }`}
                    >
                      {/* Rank coordinate (top-left on file a) */}
                      {c === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-sans font-bold leading-none select-none pointer-events-none z-10 ${
                            isSelected || isLastMove
                              ? 'text-[#382013]'
                              : isLight
                              ? 'text-[#503525]'
                              : 'text-[#4A3222]'
                          }`}
                        >
                          {r + 1}
                        </span>
                      )}

                      {/* File coordinate (bottom-right on rank 1) */}
                      {r === 0 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-sans font-bold leading-none select-none pointer-events-none z-10 ${
                            isSelected || isLastMove
                              ? 'text-[#382013]'
                              : isLight
                              ? 'text-[#503525]'
                              : 'text-[#4A3222]'
                          }`}
                        >
                          {FILES[c]}
                        </span>
                      )}

                      {/* Legal Move Indicator Dot */}
                      {isLegalTarget && (
                        <div
                          className={`absolute z-20 pointer-events-none transition-transform ${
                            piece
                              ? 'inset-0 w-full h-full rounded-none ring-4 ring-inset ring-rose-500/70 bg-rose-500/20'
                              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-950/25 ring-2 ring-white/60'
                          }`}
                        />
                      )}

                      {/* Piece SVG with Absolute Centering & Drag */}
                      {piece && (
                        <div
                          draggable={isPlaying && gameState.turn === 'w' && piece.color === 'w' && !aiThinking}
                          onDragStart={(e) => handleDragStart(e, r, c)}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                          className={`w-[85%] h-[85%] flex items-center justify-center transition-transform duration-150 transform hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing z-10 ${
                            animatingMove && animatingMove.to.row === r && animatingMove.to.col === c
                              ? 'animate-bounce'
                              : ''
                          }`}
                        >
                          <ChessPiece type={piece.type} color={piece.color} />
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center font-mono">
            {t(lang, 'chess_promo_note')}
          </p>
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md shadow-slate-950/40">
        <div className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-teal-400" />
          <span>{t(lang, 'game_total_plays')}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] text-slate-500">{t(lang, 'chess_stat_played')}</div>
            <div className="font-mono text-base font-bold text-slate-100">{stats.played}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] text-teal-400">{t(lang, 'chess_stat_wins')}</div>
            <div className="font-mono text-base font-bold text-teal-400">{stats.wins}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] text-rose-400">{t(lang, 'chess_stat_losses')}</div>
            <div className="font-mono text-base font-bold text-rose-400">{stats.losses}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">{t(lang, 'chess_stat_draws')}</div>
            <div className="font-mono text-base font-bold text-slate-300">{stats.draws}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
