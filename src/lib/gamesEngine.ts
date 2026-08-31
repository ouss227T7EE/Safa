import {
  FlankerDirection,
  FlankerResult,
  FlankerTrial,
  PosnerResult,
  PosnerSide,
  PosnerTrial,
  StroopColor,
  StroopResponse,
  StroopTrial,
  TaskSwitchColor,
  TaskSwitchResult,
  TaskSwitchRule,
  TaskSwitchShape,
  TaskSwitchTrial,
  TOLPegs,
  TOLPuzzle,
} from '../types';

export const STROOP_COLORS: StroopColor[] = [
  { key: 'red', label: 'أحمر', hex: '#FF6B6B' },
  { key: 'blue', label: 'أزرق', hex: '#5B8DEF' },
  { key: 'green', label: 'أخضر', hex: '#4CD97B' },
  { key: 'yellow', label: 'أصفر', hex: '#F2C94C' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 1) STROOP
export function generateStroopTrials(n = 24): StroopTrial[] {
  const trials: StroopTrial[] = [];
  for (let i = 0; i < n; i++) {
    const word = pickRandom(STROOP_COLORS);
    const congruent = Math.random() < 0.25; // 25% congruent, 75% incongruent
    let ink = word;
    if (!congruent) {
      const others = STROOP_COLORS.filter((c) => c.key !== word.key);
      ink = pickRandom(others);
    }
    trials.push({
      wordKey: word.key,
      wordLabel: word.label,
      inkKey: ink.key,
      inkHex: ink.hex,
      congruent,
    });
  }
  return trials;
}

export function scoreStroopResults(results: StroopResponse[]) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const correctRTs = results.filter((r) => r.correct && r.rtMs != null).map((r) => r.rtMs);
  const avgRT = correctRTs.length
    ? Math.round(correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length)
    : null;

  const incongruentCorrect = results
    .filter((r) => !r.congruent && r.correct && r.rtMs != null)
    .map((r) => r.rtMs);
  const congruentCorrect = results
    .filter((r) => r.congruent && r.correct && r.rtMs != null)
    .map((r) => r.rtMs);

  const avgIncong = incongruentCorrect.length
    ? incongruentCorrect.reduce((a, b) => a + b, 0) / incongruentCorrect.length
    : null;
  const avgCong = congruentCorrect.length
    ? congruentCorrect.reduce((a, b) => a + b, 0) / congruentCorrect.length
    : null;

  const stroopEffect =
    avgIncong != null && avgCong != null ? Math.round(avgIncong - avgCong) : null;

  const speedFactor = avgRT ? Math.max(0, Math.min(100, 100 - (avgRT - 500) / 8)) : 50;
  const score = Math.round(Math.max(0, Math.min(100, accuracy * 0.8 + speedFactor * 0.2)));

  return {
    total,
    correct,
    accuracy,
    avgRT,
    stroopEffect,
    score,
  };
}

// 2) N-BACK
export function generateNBackSequence(n: number, length = 20): number[] {
  const seq: number[] = [Math.floor(Math.random() * 9)];
  for (let i = 1; i < length; i++) {
    if (i >= n && Math.random() < 0.3) {
      seq.push(seq[i - n]); // Deliberate match
    } else {
      let pos: number;
      do {
        pos = Math.floor(Math.random() * 9);
      } while (i >= n && pos === seq[i - n] && Math.random() < 0.5);
      seq.push(pos);
    }
  }
  return seq;
}

export function scoreNBackSequence(sequence: number[], n: number, responses: number[]) {
  const respondedSet = new Set(responses);
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctRejections = 0;

  for (let i = n; i < sequence.length; i++) {
    const isMatch = sequence[i] === sequence[i - n];
    const responded = respondedSet.has(i);

    if (isMatch && responded) hits++;
    else if (isMatch && !responded) misses++;
    else if (!isMatch && responded) falseAlarms++;
    else correctRejections++;
  }

  const totalMatchable = sequence.length - n;
  const accuracy = totalMatchable
    ? Math.round(((hits + correctRejections) / totalMatchable) * 100)
    : 100;

  return {
    hits,
    misses,
    falseAlarms,
    correctRejections,
    accuracy,
  };
}

// 3) CORSI BLOCK-TAPPING
export function generateCorsiSequence(length: number, gridSize = 16): number[] {
  const seq: number[] = [];
  const used = new Set<number>();
  while (seq.length < length) {
    const pos = Math.floor(Math.random() * gridSize);
    if (!used.has(pos)) {
      used.add(pos);
      seq.push(pos);
    }
  }
  return seq;
}

// 4) ERIKSEN FLANKER TASK (Eriksen & Eriksen, 1974)
export function generateFlankerTrials(n = 24): FlankerTrial[] {
  const trials: FlankerTrial[] = [];
  const directions: FlankerDirection[] = ['left', 'right'];

  for (let i = 0; i < n; i++) {
    const target = directions[Math.floor(Math.random() * 2)];
    const isCongruent = Math.random() < 0.5;
    const flanker = isCongruent ? target : (target === 'left' ? 'right' : 'left');

    const targetSym = target === 'left' ? '<' : '>';
    const flankerSym = flanker === 'left' ? '<' : '>';
    const stimulusString = `${flankerSym} ${flankerSym} ${targetSym} ${flankerSym} ${flankerSym}`;

    trials.push({
      target,
      type: isCongruent ? 'congruent' : 'incongruent',
      stimulusString,
      responded: false,
      isCorrect: false,
      rtMs: 0,
    });
  }
  return trials;
}

export function scoreFlankerResults(trials: FlankerTrial[]): FlankerResult {
  const valid = trials.filter((t) => t.responded && t.isCorrect);
  const congruent = valid.filter((t) => t.type === 'congruent');
  const incongruent = valid.filter((t) => t.type === 'incongruent');

  const avg = (arr: FlankerTrial[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + (b.rtMs || 0), 0) / arr.length) : 0;

  const meanCongruentRt = avg(congruent);
  const meanIncongruentRt = avg(incongruent);
  const flankerCost = Math.max(0, meanIncongruentRt - meanCongruentRt);
  const accuracy = trials.length ? Math.round((valid.length / trials.length) * 100) : 0;

  // Composite score (0-100)
  const accuracyFactor = accuracy * 0.7;
  const costFactor = Math.max(0, Math.min(30, 30 - flankerCost * 0.2));
  const score = Math.round(Math.max(0, Math.min(100, accuracyFactor + costFactor)));

  return {
    meanCongruentRt,
    meanIncongruentRt,
    flankerCost,
    accuracy,
    totalTrials: trials.length,
    score,
  };
}

// 5) TOWER OF LONDON (Shallice, 1982)
export const TOL_CAPACITIES = [3, 2, 1]; // Peg 0: 3 balls, Peg 1: 2 balls, Peg 2: 1 ball

export function isValidTOLMove(pegs: TOLPegs, fromPeg: number, toPeg: number): boolean {
  if (fromPeg === toPeg) return false;
  if (!pegs[fromPeg] || pegs[fromPeg].length === 0) return false;
  if (pegs[toPeg].length >= TOL_CAPACITIES[toPeg]) return false;
  return true;
}

export function applyTOLMove(pegs: TOLPegs, fromPeg: number, toPeg: number): TOLPegs | null {
  if (!isValidTOLMove(pegs, fromPeg, toPeg)) return null;
  const nextPegs: TOLPegs = pegs.map((p) => [...p]);
  const ball = nextPegs[fromPeg].pop();
  if (ball) {
    nextPegs[toPeg].push(ball);
  }
  return nextPegs;
}

export function isTOLEqual(pegsA: TOLPegs, pegsB: TOLPegs): boolean {
  return JSON.stringify(pegsA) === JSON.stringify(pegsB);
}

export function solveTOLMinMoves(initial: TOLPegs, target: TOLPegs): number {
  const targetKey = JSON.stringify(target);
  const startKey = JSON.stringify(initial);
  if (startKey === targetKey) return 0;

  const queue: { pegs: TOLPegs; depth: number }[] = [{ pegs: initial, depth: 0 }];
  const visited = new Set<string>();
  visited.add(startKey);

  while (queue.length > 0) {
    const { pegs, depth } = queue.shift()!;
    if (depth >= 15) break;

    for (let from = 0; from < 3; from++) {
      for (let to = 0; to < 3; to++) {
        if (from !== to && isValidTOLMove(pegs, from, to)) {
          const next = applyTOLMove(pegs, from, to);
          if (next) {
            const nextKey = JSON.stringify(next);
            if (nextKey === targetKey) return depth + 1;
            if (!visited.has(nextKey)) {
              visited.add(nextKey);
              queue.push({ pegs: next, depth: depth + 1 });
            }
          }
        }
      }
    }
  }
  return -1;
}

export const TOL_PUZZLES: TOLPuzzle[] = [
  {
    id: 1,
    initial: [['R', 'G', 'B'], [], []],
    target: [['R'], ['G', 'B'], []],
    minMoves: 3,
  },
  {
    id: 2,
    initial: [['R', 'G', 'B'], [], []],
    target: [[], ['G', 'B'], ['R']],
    minMoves: 4,
  },
  {
    id: 3,
    initial: [['R'], ['G', 'B'], []],
    target: [['B'], ['G'], ['R']],
    minMoves: 4,
  },
  {
    id: 4,
    initial: [['G', 'B'], ['R'], []],
    target: [['R', 'G'], [], ['B']],
    minMoves: 4,
  },
  {
    id: 5,
    initial: [['B'], ['G', 'R'], []],
    target: [['R'], ['B'], ['G']],
    minMoves: 5,
  },
  {
    id: 6,
    initial: [['R', 'B'], ['G'], []],
    target: [[], ['R', 'B'], ['G']],
    minMoves: 5,
  },
];

// 6) COGNITIVE TASK-SWITCHING (Monsell, 2003)
export function generateTaskSwitchTrials(n = 24): TaskSwitchTrial[] {
  const colors: TaskSwitchColor[] = ['red', 'blue'];
  const shapes: TaskSwitchShape[] = ['circle', 'square'];
  const trials: TaskSwitchTrial[] = [];

  // Predictable run: 2 color trials, 2 shape trials, alternating
  for (let i = 0; i < n; i++) {
    const task: TaskSwitchRule = Math.floor(i / 2) % 2 === 0 ? 'color' : 'shape';
    const isSwitch = i > 0 && task !== trials[i - 1].task;

    const color = colors[Math.floor(Math.random() * 2)];
    const shape = shapes[Math.floor(Math.random() * 2)];
    const correctChoice = task === 'color' ? color : shape;

    trials.push({
      trialIndex: i,
      task,
      isSwitch,
      color,
      shape,
      correctChoice,
      responded: false,
      isCorrect: false,
      rtMs: 0,
    });
  }
  return trials;
}

export function scoreTaskSwitchResults(trials: TaskSwitchTrial[]): TaskSwitchResult {
  const valid = trials.filter((t) => t.responded && t.isCorrect);
  const repeatTrials = valid.filter((t, idx) => idx > 0 && !t.isSwitch);
  const switchTrials = valid.filter((t) => t.isSwitch);

  const avg = (arr: TaskSwitchTrial[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + (b.rtMs || 0), 0) / arr.length) : 0;

  const repeatRt = avg(repeatTrials);
  const switchRt = avg(switchTrials);
  const switchCost = Math.max(0, switchRt - repeatRt);
  const accuracy = trials.length ? Math.round((valid.length / trials.length) * 100) : 0;

  const accuracyFactor = accuracy * 0.7;
  const costFactor = Math.max(0, Math.min(30, 30 - switchCost * 0.15));
  const score = Math.round(Math.max(0, Math.min(100, accuracyFactor + costFactor)));

  return {
    repeatRt,
    switchRt,
    switchCost,
    accuracy,
    totalTrials: trials.length,
    score,
  };
}

// 7) POSNER SPATIAL CUEING (Posner, 1980)
export function generatePosnerTrials(n = 20): PosnerTrial[] {
  const trials: PosnerTrial[] = [];
  for (let i = 0; i < n; i++) {
    const targetSide: PosnerSide = Math.random() < 0.5 ? 'left' : 'right';
    const isValidCue = Math.random() < 0.8; // 80% valid cues
    const cueSide: PosnerSide = isValidCue ? targetSide : targetSide === 'left' ? 'right' : 'left';

    trials.push({
      trialIndex: i,
      targetSide,
      cueSide,
      validity: isValidCue ? 'valid' : 'invalid',
      soaMs: 250 + Math.floor(Math.random() * 250), // 250ms - 500ms SOA
      responded: false,
      isCorrect: false,
      rtMs: 0,
    });
  }
  return trials;
}

export function scorePosnerResults(trials: PosnerTrial[]): PosnerResult {
  const valid = trials.filter((t) => t.responded && t.isCorrect);
  const validCueTrials = valid.filter((t) => t.validity === 'valid');
  const invalidCueTrials = valid.filter((t) => t.validity === 'invalid');

  const avg = (arr: PosnerTrial[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + (b.rtMs || 0), 0) / arr.length) : 0;

  const validRt = avg(validCueTrials);
  const invalidRt = avg(invalidCueTrials);
  const cueingEffect = Math.max(0, invalidRt - validRt);
  const accuracy = trials.length ? Math.round((valid.length / trials.length) * 100) : 0;

  const speedScore = validRt ? Math.max(0, Math.min(50, 50 - (validRt - 250) * 0.1)) : 30;
  const accuracyScore = accuracy * 0.5;
  const score = Math.round(Math.max(0, Math.min(100, speedScore + accuracyScore)));

  return {
    validRt,
    invalidRt,
    cueingEffect,
    accuracy,
    totalTrials: trials.length,
    score,
  };
}
