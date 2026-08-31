export type Language = 'ar' | 'en' | 'ru' | 'es' | 'fr' | 'zh' | 'hi';

export type ViewType =
  | 'dashboard'
  | 'test'
  | 'games-hub'
  | 'game-chess'
  | 'game-nback'
  | 'game-stroop'
  | 'game-corsi'
  | 'game-flanker'
  | 'game-tol'
  | 'game-taskswitch'
  | 'game-posner'
  | 'challenge'
  | 'progress'
  | 'reading'
  | 'science';

export interface SARTTrial {
  digit: number;
  isNoGo: boolean;
  responded?: boolean;
  rtMs?: number | null;
}

export interface AttentionTestResult {
  date: string;
  timestamp: number;
  score: number;
  commissionErrors: number;
  omissionErrors: number;
  meanRT: number | null;
  rtCV: number;
  goTrials: number;
  noGoTrials: number;
}

export interface DailyLog {
  screenTimeMinutes: number | null;
  notifications: boolean;
  phoneFree: boolean;
  note?: string;
}

export interface ChessGameState {
  played: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface NBackGameState {
  played: number;
  bestLevel: number;
  bestAccuracy: number;
}

export interface StroopGameState {
  played: number;
  bestScore: number;
  bestAccuracy: number;
}

export interface CorsiGameState {
  played: number;
  bestSpan: number;
}

export interface FlankerGameState {
  played: number;
  bestCost: number;
  bestAccuracy: number;
}

export interface TOLGameState {
  played: number;
  puzzlesSolved: number;
  bestMovesScore: number;
}

export interface TaskSwitchGameState {
  played: number;
  bestCost: number;
  bestAccuracy: number;
}

export interface PosnerGameState {
  played: number;
  bestAdvantage: number;
  bestAccuracy: number;
}

export interface GamesState {
  chess: ChessGameState;
  nback: NBackGameState;
  stroop: StroopGameState;
  corsi: CorsiGameState;
  flanker: FlankerGameState;
  tol: TOLGameState;
  taskswitch: TaskSwitchGameState;
  posner: PosnerGameState;
}

// 1) Flanker Types
export type FlankerDirection = 'left' | 'right';
export type FlankerCongruency = 'congruent' | 'incongruent';

export interface FlankerTrial {
  target: FlankerDirection;
  type: FlankerCongruency;
  stimulusString: string;
  responded?: boolean;
  isCorrect?: boolean;
  rtMs?: number;
}

export interface FlankerResult {
  meanCongruentRt: number;
  meanIncongruentRt: number;
  flankerCost: number;
  accuracy: number;
  totalTrials: number;
  score: number;
}

// 2) Tower of London Types
export type TOLBallColor = 'R' | 'G' | 'B';
export type TOLPegs = TOLBallColor[][];

export interface TOLPuzzle {
  id: number;
  initial: TOLPegs;
  target: TOLPegs;
  minMoves: number;
}

// 3) Task-Switching Types
export type TaskSwitchRule = 'color' | 'shape';
export type TaskSwitchColor = 'red' | 'blue';
export type TaskSwitchShape = 'circle' | 'square';

export interface TaskSwitchTrial {
  trialIndex: number;
  task: TaskSwitchRule;
  isSwitch: boolean;
  color: TaskSwitchColor;
  shape: TaskSwitchShape;
  correctChoice: string;
  responded?: boolean;
  isCorrect?: boolean;
  rtMs?: number;
}

export interface TaskSwitchResult {
  repeatRt: number;
  switchRt: number;
  switchCost: number;
  accuracy: number;
  totalTrials: number;
  score: number;
}

// 4) Posner Spatial Cueing Types
export type PosnerSide = 'left' | 'right';
export type PosnerValidity = 'valid' | 'invalid';

export interface PosnerTrial {
  trialIndex: number;
  targetSide: PosnerSide;
  cueSide: PosnerSide;
  validity: PosnerValidity;
  soaMs: number;
  responded?: boolean;
  isCorrect?: boolean;
  rtMs?: number;
}

export interface PosnerResult {
  validRt: number;
  invalidRt: number;
  cueingEffect: number;
  accuracy: number;
  totalTrials: number;
  score: number;
}

export interface SafaAppState {
  challengeStartDate: string | null;
  dailyLogs: Record<string, DailyLog>;
  attentionTests: AttentionTestResult[];
  games: GamesState;
}

// Chess Engine Types
export type PieceColor = 'w' | 'b';
export type PieceType = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface ChessMove {
  from: Position;
  to: Position;
  capture?: boolean;
  doubleStep?: boolean;
  promotion?: PieceType;
  isEnPassant?: boolean;
  isCastle?: boolean;
  castleSide?: 'K' | 'Q';
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface ChessState {
  board: ChessBoard;
  turn: PieceColor;
  castling: CastlingRights;
  enPassant: Position | null;
  halfmove: number;
  fullmove: number;
}

export type ChessGameStatus = 'ongoing' | 'checkmate' | 'stalemate' | 'draw';
export type ChessDifficulty = 'easy' | 'hard' | 'legendary';

// Stroop Types
export interface StroopColor {
  key: string;
  label: string;
  hex: string;
}

export interface StroopTrial {
  wordKey: string;
  wordLabel: string;
  inkKey: string;
  inkHex: string;
  congruent: boolean;
}

export interface StroopResponse {
  correct: boolean;
  rtMs: number;
  congruent: boolean;
}

// Books
export interface BookResource {
  title: string;
  author: string;
  summaryKey: string;
  query: string;
  year: number;
}
