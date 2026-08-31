import { BookResource, SafaAppState } from '../types';

export const STORAGE_KEY = 'safa:v1';
export const DAY_MS = 24 * 60 * 60 * 1000;

export function defaultAppState(): SafaAppState {
  return {
    challengeStartDate: null,
    dailyLogs: {},
    attentionTests: [],
    games: {
      chess: { played: 0, wins: 0, losses: 0, draws: 0 },
      nback: { played: 0, bestLevel: 1, bestAccuracy: 0 },
      stroop: { played: 0, bestScore: 0, bestAccuracy: 0 },
      corsi: { played: 0, bestSpan: 0 },
      flanker: { played: 0, bestCost: 0, bestAccuracy: 0 },
      tol: { played: 0, puzzlesSolved: 0, bestMovesScore: 0 },
      taskswitch: { played: 0, bestCost: 0, bestAccuracy: 0 },
      posner: { played: 0, bestAdvantage: 0, bestAccuracy: 0 },
    },
  };
}

export function loadAppState(): SafaAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppState();
    const parsed = JSON.parse(raw);
    if (!('dailyLogs' in parsed) || !('attentionTests' in parsed)) {
      return defaultAppState();
    }
    const def = defaultAppState();
    return {
      ...def,
      ...parsed,
      games: {
        ...def.games,
        ...(parsed.games || {}),
      },
    };
  } catch (e) {
    console.warn('Could not parse Safa state from localStorage, initializing default.', e);
    return defaultAppState();
  }
}

export function saveAppState(state: SafaAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function dayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function calculateChallengeDay(startDateStr: string | null): number {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr).getTime();
  const diff = Date.now() - start;
  return Math.max(1, Math.floor(diff / DAY_MS) + 1);
}

export function computeLogStreak(dailyLogs: Record<string, unknown>): number {
  let streak = 0;
  let cursor = new Date();
  if (!dailyLogs[dayKey(cursor)]) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  while (dailyLogs[dayKey(cursor)]) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export const RECOMMENDED_BOOKS: BookResource[] = [
  {
    title: 'Stolen Focus: Why You Can\'t Pay Attention',
    author: 'Johann Hari',
    summaryKey: 'Johann Hari investigates the structural, systemic causes of the global attention crisis, from algorithmic surveillance capitalism to chronic sleep deprivation.',
    query: 'Stolen Focus Johann Hari',
    year: 2022,
  },
  {
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    summaryKey: 'Foundational framework defining deep work as the ultimate cognitive superpower in an increasingly fragmented modern knowledge economy.',
    query: 'Deep Work Cal Newport',
    year: 2016,
  },
  {
    title: 'Digital Minimalism: Choosing a Focused Life in a Noisy World',
    author: 'Cal Newport',
    summaryKey: 'Practical, philosophy-driven guide on conducting a 30-day digital declutter and resetting human-machine relationship boundaries.',
    query: 'Digital Minimalism Cal Newport',
    year: 2019,
  },
  {
    title: 'The Shallows: What the Internet Is Doing to Our Brains',
    author: 'Nicholas Carr',
    summaryKey: 'Pulitzer Prize finalist exploring neural plasticity and how rapid hyperlinking alters cognitive reading depth and linear contemplation.',
    query: 'The Shallows Nicholas Carr',
    year: 2010,
  },
  {
    title: 'Indistractable: How to Control Your Attention and Choose Your Life',
    author: 'Nir Eyal',
    summaryKey: 'Cognitive behavioral strategies to tackle internal triggers and master intentional time management against external interruptions.',
    query: 'Indistractable Nir Eyal',
    year: 2019,
  },
  {
    title: 'Attention Span: A Groundbreaking Way to Restore Balance, Happiness and Productivity',
    author: 'Dr. Gloria Mark',
    summaryKey: 'Empirical psychologist Gloria Mark reveals landmark laboratory findings on modern 47-second screen switching and cognitive rhythm restoration.',
    query: 'Attention Span Gloria Mark',
    year: 2023,
  },
];
