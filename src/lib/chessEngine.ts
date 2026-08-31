import {
  ChessBoard,
  ChessDifficulty,
  ChessGameStatus,
  ChessMove,
  ChessState,
  Piece,
  PieceColor,
  Position,
} from '../types';

export const FILES = 'abcdefgh';

const DIRS = {
  B: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  R: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  Q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
  N: [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]],
  K: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
};

export function initialChessState(): ChessState {
  const board: ChessBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank: ('R' | 'N' | 'B' | 'Q' | 'K' | 'B' | 'N' | 'R')[] = [
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R',
  ];

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'w' };
    board[1][c] = { type: 'P', color: 'w' };
    board[6][c] = { type: 'P', color: 'b' };
    board[7][c] = { type: backRank[c], color: 'b' };
  }

  return {
    board,
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
  };
}

export function cloneChessState(s: ChessState): ChessState {
  return {
    board: s.board.map((row) => row.map((p) => (p ? { ...p } : null))),
    turn: s.turn,
    castling: { ...s.castling },
    enPassant: s.enPassant ? { ...s.enPassant } : null,
    halfmove: s.halfmove,
    fullmove: s.fullmove,
  };
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function oppositeColor(c: PieceColor): PieceColor {
  return c === 'w' ? 'b' : 'w';
}

export function kingPosition(board: ChessBoard, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function squareAttacked(board: ChessBoard, row: number, col: number, byColor: PieceColor): boolean {
  // Pawns
  const pawnDir = byColor === 'w' ? -1 : 1;
  for (const dc of [-1, 1]) {
    const r = row + pawnDir;
    const c = col + dc;
    if (inBounds(r, c)) {
      const p = board[r][c];
      if (p && p.type === 'P' && p.color === byColor) return true;
    }
  }

  // Knights
  for (const [dr, dc] of DIRS.N) {
    const r = row + dr;
    const c = col + dc;
    if (inBounds(r, c)) {
      const p = board[r][c];
      if (p && p.type === 'N' && p.color === byColor) return true;
    }
  }

  // Bishops / Queens
  for (const [dr, dc] of DIRS.B) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'B' || p.type === 'Q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // Rooks / Queens
  for (const [dr, dc] of DIRS.R) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'R' || p.type === 'Q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // Kings
  for (const [dr, dc] of DIRS.K) {
    const r = row + dr;
    const c = col + dc;
    if (inBounds(r, c)) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === byColor) return true;
    }
  }

  return false;
}

export function isKingInCheck(state: ChessState, color: PieceColor): boolean {
  const k = kingPosition(state.board, color);
  if (!k) return false;
  return squareAttacked(state.board, k.row, k.col, oppositeColor(color));
}

export function pseudoMovesForSquare(state: ChessState, row: number, col: number): ChessMove[] {
  const { board } = state;
  const piece = board[row][col];
  if (!piece) return [];
  const moves: ChessMove[] = [];

  const pushMove = (r: number, c: number, extra: Partial<ChessMove> = {}) => {
    moves.push({
      from: { row, col },
      to: { row: r, col: c },
      ...extra,
    });
  };

  if (piece.type === 'P') {
    const dir = piece.color === 'w' ? 1 : -1;
    const startRow = piece.color === 'w' ? 1 : 6;
    const promoRow = piece.color === 'w' ? 7 : 0;

    // Single step
    if (inBounds(row + dir, col) && !board[row + dir][col]) {
      if (row + dir === promoRow) {
        pushMove(row + dir, col, { promotion: 'Q' });
      } else {
        pushMove(row + dir, col);
      }

      // Double step
      if (row === startRow && !board[row + 2 * dir][col]) {
        pushMove(row + 2 * dir, col, { doubleStep: true });
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const r = row + dir;
      const c = col + dc;
      if (!inBounds(r, c)) continue;
      const target = board[r][c];
      if (target && target.color !== piece.color) {
        if (r === promoRow) {
          pushMove(r, c, { capture: true, promotion: 'Q' });
        } else {
          pushMove(r, c, { capture: true });
        }
      } else if (!target && state.enPassant && state.enPassant.row === r && state.enPassant.col === c) {
        pushMove(r, c, { capture: true, isEnPassant: true });
      }
    }
  } else if (piece.type === 'N' || piece.type === 'K') {
    for (const [dr, dc] of DIRS[piece.type]) {
      const r = row + dr;
      const c = col + dc;
      if (!inBounds(r, c)) continue;
      const target = board[r][c];
      if (!target) {
        pushMove(r, c);
      } else if (target.color !== piece.color) {
        pushMove(r, c, { capture: true });
      }
    }

    // Castling
    if (piece.type === 'K') {
      const rights = state.castling;
      const homeRow = piece.color === 'w' ? 0 : 7;
      if (row === homeRow && col === 4 && !isKingInCheck(state, piece.color)) {
        const canK = piece.color === 'w' ? rights.wK : rights.bK;
        const canQ = piece.color === 'w' ? rights.wQ : rights.bQ;

        // Kingside
        if (
          canK &&
          !board[homeRow][5] &&
          !board[homeRow][6] &&
          board[homeRow][7]?.type === 'R' &&
          board[homeRow][7]?.color === piece.color &&
          !squareAttacked(board, homeRow, 5, oppositeColor(piece.color)) &&
          !squareAttacked(board, homeRow, 6, oppositeColor(piece.color))
        ) {
          pushMove(homeRow, 6, { isCastle: true, castleSide: 'K' });
        }

        // Queenside
        if (
          canQ &&
          !board[homeRow][1] &&
          !board[homeRow][2] &&
          !board[homeRow][3] &&
          board[homeRow][0]?.type === 'R' &&
          board[homeRow][0]?.color === piece.color &&
          !squareAttacked(board, homeRow, 3, oppositeColor(piece.color)) &&
          !squareAttacked(board, homeRow, 2, oppositeColor(piece.color))
        ) {
          pushMove(homeRow, 2, { isCastle: true, castleSide: 'Q' });
        }
      }
    }
  } else {
    // Sliding pieces (B, R, Q)
    for (const [dr, dc] of DIRS[piece.type]) {
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          pushMove(r, c);
        } else {
          if (target.color !== piece.color) {
            pushMove(r, c, { capture: true });
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }
  }

  return moves;
}

export function applyChessMove(state: ChessState, move: ChessMove): ChessState {
  const s = cloneChessState(state);
  const { board } = s;
  const piece = board[move.from.row][move.from.col] as Piece;
  const isPawn = piece.type === 'P';

  if (move.isEnPassant) {
    board[move.from.row][move.to.col] = null;
  }

  board[move.to.row][move.to.col] = move.promotion
    ? { type: move.promotion, color: piece.color }
    : piece;
  board[move.from.row][move.from.col] = null;

  if (move.isCastle) {
    const homeRow = move.from.row;
    if (move.castleSide === 'K') {
      board[homeRow][5] = board[homeRow][7];
      board[homeRow][7] = null;
    } else {
      board[homeRow][3] = board[homeRow][0];
      board[homeRow][0] = null;
    }
  }

  // Update castling rights
  if (piece.type === 'K') {
    if (piece.color === 'w') {
      s.castling.wK = false;
      s.castling.wQ = false;
    } else {
      s.castling.bK = false;
      s.castling.bQ = false;
    }
  }

  const clearRookRight = (r: number, c: number) => {
    if (r === 0 && c === 0) s.castling.wQ = false;
    if (r === 0 && c === 7) s.castling.wK = false;
    if (r === 7 && c === 0) s.castling.bQ = false;
    if (r === 7 && c === 7) s.castling.bK = false;
  };

  clearRookRight(move.from.row, move.from.col);
  clearRookRight(move.to.row, move.to.col);

  s.enPassant =
    isPawn && move.doubleStep
      ? { row: (move.from.row + move.to.row) / 2, col: move.from.col }
      : null;

  s.halfmove = isPawn || move.capture ? 0 : s.halfmove + 1;
  if (piece.color === 'b') s.fullmove += 1;
  s.turn = oppositeColor(piece.color);

  return s;
}

export function legalMoves(state: ChessState, color: PieceColor): ChessMove[] {
  const out: ChessMove[] = [];
  const { board } = state;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      for (const m of pseudoMovesForSquare(state, r, c)) {
        const next = applyChessMove(state, m);
        if (!isKingInCheck(next, color)) {
          out.push(m);
        }
      }
    }
  }

  return out;
}

export function getChessGameStatus(state: ChessState): ChessGameStatus {
  const moves = legalMoves(state, state.turn);
  const inCheck = isKingInCheck(state, state.turn);

  if (moves.length === 0) {
    return inCheck ? 'checkmate' : 'stalemate';
  }

  if (state.halfmove >= 100) return 'draw';
  return 'ongoing';
}

// Evaluation & Minimax AI
const PIECE_VALUE: Record<string, number> = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000,
};

const PST_PAWN = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PST_KNIGHT = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const PST_KING_MID = [
  [20, 30, 10, 0, 0, 10, 30, 20],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
];

function pstValue(type: string, row: number, col: number, color: PieceColor): number {
  const r = color === 'w' ? row : 7 - row;
  if (type === 'P') return PST_PAWN[r][col];
  if (type === 'N') return PST_KNIGHT[r][col];
  if (type === 'K') return PST_KING_MID[r][col];
  return 0;
}

export function evaluateBoard(state: ChessState): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      const val = PIECE_VALUE[p.type] + pstValue(p.type, r, c, p.color);
      score += p.color === 'w' ? val : -val;
    }
  }
  return score; // Positive = good for white
}

function orderMoves(moves: ChessMove[]): ChessMove[] {
  return [...moves].sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));
}

function minimax(
  state: ChessState,
  depth: number,
  alpha: number,
  beta: number
): { score: number; move: ChessMove | null } {
  const status = getChessGameStatus(state);
  if (status === 'checkmate') {
    return {
      score: state.turn === 'w' ? -100000 - depth : 100000 + depth,
      move: null,
    };
  }
  if (status === 'stalemate' || status === 'draw') {
    return { score: 0, move: null };
  }
  if (depth === 0) {
    return { score: evaluateBoard(state), move: null };
  }

  const moves = orderMoves(legalMoves(state, state.turn));
  let bestMove: ChessMove | null = null;

  if (state.turn === 'w') {
    let value = -Infinity;
    for (const m of moves) {
      const next = applyChessMove(state, m);
      const { score } = minimax(next, depth - 1, alpha, beta);
      if (score > value) {
        value = score;
        bestMove = m;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { score: value, move: bestMove };
  } else {
    let value = Infinity;
    for (const m of moves) {
      const next = applyChessMove(state, m);
      const { score } = minimax(next, depth - 1, alpha, beta);
      if (score < value) {
        value = score;
        bestMove = m;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { score: value, move: bestMove };
  }
}

export function chooseAIMove(state: ChessState, difficulty: ChessDifficulty = 'easy'): ChessMove | null {
  const moves = legalMoves(state, state.turn);
  if (!moves.length) return null;

  const depth = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 4;

  if (difficulty === 'easy' && Math.random() < 0.35) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const { move } = minimax(state, depth, -Infinity, Infinity);
  return move || moves[Math.floor(Math.random() * moves.length)];
}

export const CHESS_SYMBOLS: Record<PieceColor, Record<string, string>> = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};
