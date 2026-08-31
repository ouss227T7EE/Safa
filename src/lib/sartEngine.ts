import { SARTTrial, AttentionTestResult } from '../types';

export const NO_GO_DIGIT = 3;
export const DIGIT_MS = 250;
export const BLANK_MS = 900;
export const TRIAL_MS = DIGIT_MS + BLANK_MS; // 1150ms total window per stimulus
export const FIXATION_CROSS = '+';
export const INPUT_DEBOUNCE_MS = 120;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Generates an offline synthetic sine-wave beep (400Hz, 50ms) for multisensory stimulus feedback
 */
export function playStimulusCue(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);

    // Fast attack (8ms), exponential decay to zero at 50ms
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.050);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.055);
  } catch {
    // Graceful silent fallback if AudioContext is not permitted by browser
  }
}

export function recordTrialResponse(trial: SARTTrial, rawRtMs: number): SARTTrial {
  if (trial.responded) return trial;
  return {
    ...trial,
    responded: true,
    rtMs: Math.min(TRIAL_MS, Math.max(0, Math.round(rawRtMs))),
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSARTSequence(blocks = 12): SARTTrial[] {
  const seq: SARTTrial[] = [];
  for (let b = 0; b < blocks; b++) {
    const block = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    block.forEach((d) => {
      seq.push({
        digit: d,
        isNoGo: d === NO_GO_DIGIT,
      });
    });
  }
  return seq;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = avg(arr);
  return Math.sqrt(avg(arr.map((x) => (x - m) ** 2)));
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function scoreSART(trials: SARTTrial[]): Omit<AttentionTestResult, 'date' | 'timestamp'> {
  const goTrials = trials.filter((t) => !t.isNoGo);
  const noGoTrials = trials.filter((t) => t.isNoGo);

  const omissionErrors = goTrials.filter((t) => !t.responded).length;
  const commissionErrors = noGoTrials.filter((t) => t.responded).length;

  const correctGoRTs = goTrials
    .filter((t) => t.responded && t.rtMs != null)
    .map((t) => t.rtMs as number);

  const meanRT = correctGoRTs.length ? avg(correctGoRTs) : null;
  const rtSD = correctGoRTs.length > 1 ? stdDev(correctGoRTs) : 0;
  const rtCV = meanRT ? rtSD / meanRT : 0;

  const commissionRate = noGoTrials.length ? commissionErrors / noGoTrials.length : 0;
  const omissionRate = goTrials.length ? omissionErrors / goTrials.length : 0;
  const rtCVClamped = Math.min(1, rtCV);

  // 50% Commission (Inhibition failure / mind-wandering)
  // 30% Omission (Disengagement)
  // 20% RT CV (Attentional instability)
  const raw = 100 * (1 - 0.5 * commissionRate - 0.3 * omissionRate - 0.2 * rtCVClamped);
  const score = Math.round(clamp(raw, 0, 100));

  return {
    score,
    commissionErrors,
    omissionErrors,
    meanRT: meanRT ? Math.round(meanRT) : null,
    rtCV: Math.round(rtCV * 100) / 100,
    goTrials: goTrials.length,
    noGoTrials: noGoTrials.length,
  };
}
