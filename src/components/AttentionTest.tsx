import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Home, Sparkles, AlertCircle, CheckCircle2, PauseCircle } from 'lucide-react';
import { AttentionTestResult, Language, SARTTrial, ViewType } from '../types';
import { t } from '../lib/i18n';
import {
  generateSARTSequence,
  scoreSART,
  recordTrialResponse,
  playStimulusCue,
  DIGIT_MS,
  TRIAL_MS,
  FIXATION_CROSS,
  INPUT_DEBOUNCE_MS,
} from '../lib/sartEngine';
import { dayKey } from '../lib/storage';

interface AttentionTestProps {
  lang: Language;
  onSaveTestResult: (result: AttentionTestResult) => void;
  onNavigate: (view: ViewType) => void;
  previousTests: AttentionTestResult[];
}

type TestPhase = 'intro' | 'countdown' | 'running' | 'results';

export const AttentionTest: React.FC<AttentionTestProps> = ({
  lang,
  onSaveTestResult,
  onNavigate,
  previousTests,
}) => {
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [sequence, setSequence] = useState<SARTTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<AttentionTestResult | null>(null);
  const [testBlocks, setTestBlocks] = useState<number>(12); // 12 blocks = 108 trials standard

  const sequenceRef = useRef<SARTTrial[]>([]);
  const trialStartRef = useRef<number>(0);
  const currentTrialIndexRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const lastResponseTimeRef = useRef<number>(0);
  const isKeyDownRef = useRef<Record<string, boolean>>({});
  const activeTrialRef = useRef<{ trialIndex: number; responded: boolean; rtMs: number | null }>({
    trialIndex: -1,
    responded: false,
    rtMs: null,
  });

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Synchronize sequence ref
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  // Teardown when unmounting
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const handleResponse = useCallback((e?: React.SyntheticEvent | Event) => {
    if (phase !== 'running' || isPaused) return;
    if (e && 'preventDefault' in e && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    
    // Strict debouncing and single-response enforcement per trial
    const now = performance.now();
    const currentIdx = currentTrialIndexRef.current;

    // 1. Minimum debounce threshold to eliminate double-tap bounce & micro jitter
    if (now - lastResponseTimeRef.current < INPUT_DEBOUNCE_MS) return;

    // 2. Strict per-trial single-response lock
    if (activeTrialRef.current.responded || activeTrialRef.current.trialIndex !== currentIdx) {
      return;
    }

    lastResponseTimeRef.current = now;
    const rt = now - trialStartRef.current;
    activeTrialRef.current.responded = true;
    activeTrialRef.current.rtMs = Math.min(TRIAL_MS, Math.max(0, Math.round(rt)));

    // Update sequence array using engine helper
    setSequence((prev) => {
      const next = [...prev];
      if (next[currentIdx]) {
        next[currentIdx] = recordTrialResponse(next[currentIdx], rt);
      }
      return next;
    });
  }, [phase, isPaused]);

  // Keyboard handler for Spacebar and Enter with strict debounce & held-key release requirement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'running' || isPaused) return;

      const isSpaceOrEnter = e.code === 'Space' || e.key === ' ' || e.code === 'Enter';
      if (!isSpaceOrEnter) return;

      e.preventDefault();

      // 1. Browser key auto-repeat prevention (holding down key)
      if (e.repeat) return;

      // 2. Physical key-state lock (must release key before pressing again)
      if (isKeyDownRef.current[e.code]) return;
      isKeyDownRef.current[e.code] = true;

      handleResponse(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isSpaceOrEnter = e.code === 'Space' || e.key === ' ' || e.code === 'Enter';
      if (isSpaceOrEnter) {
        isKeyDownRef.current[e.code] = false;
      }
    };

    const handleBlur = () => {
      isKeyDownRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase, isPaused, handleResponse]);

  // Focus Lock & Anti-Cheat: Visibility API listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'running' && !isPaused) {
        clearAllTimers();
        setIsPaused(true);
      }
    };

    const handleWindowBlur = () => {
      isKeyDownRef.current = {};
      if (phase === 'running' && !isPaused) {
        clearAllTimers();
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [phase, isPaused, clearAllTimers]);

  const resumeTest = () => {
    if (!isPaused) return;
    setIsPaused(false);
    // Resume immediately from the current trial
    runTrial(currentTrialIndexRef.current, sequenceRef.current);
  };

  const startCountdown = (blocks = 12) => {
    clearAllTimers();
    setIsPaused(false);
    setTestBlocks(blocks);
    setPhase('countdown');
    setCountdownNum(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        startRunningTest(blocks);
      } else {
        setCountdownNum(count);
      }
    }, 800);

    timersRef.current.push(interval as unknown as NodeJS.Timeout);
  };

  const startRunningTest = (blocks: number) => {
    const seq = generateSARTSequence(blocks);
    setSequence(seq);
    sequenceRef.current = seq;
    setTrialIndex(0);
    setPhase('running');
    setIsPaused(false);
    runTrial(0, seq);
  };

  const runTrial = (idx: number, seq: SARTTrial[]) => {
    if (idx >= seq.length) {
      finishTest(seq);
      return;
    }

    setTrialIndex(idx);
    currentTrialIndexRef.current = idx;
    activeTrialRef.current = { trialIndex: idx, responded: false, rtMs: null };
    trialStartRef.current = performance.now();
    setCurrentDigit(seq[idx].digit);

    // Multimodal synthetic audio cue (400Hz, 50ms beep)
    playStimulusCue();

    // Hide digit after DIGIT_MS (250ms)
    const hideTimer = setTimeout(() => {
      setCurrentDigit(null);
    }, DIGIT_MS);
    timersRef.current.push(hideTimer);

    // Next trial after TRIAL_MS (1150ms)
    const nextTimer = setTimeout(() => {
      runTrial(idx + 1, seq);
    }, TRIAL_MS);
    timersRef.current.push(nextTimer);
  };

  const finishTest = (finalSeq: SARTTrial[]) => {
    clearAllTimers();
    setPhase('results');
    setIsPaused(false);
    setCurrentDigit(null);

    const scored = scoreSART(finalSeq);
    const fullResult: AttentionTestResult = {
      date: dayKey(),
      timestamp: Date.now(),
      ...scored,
    };

    setTestResult(fullResult);
    onSaveTestResult(fullResult);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t(lang, 'test_eyebrow')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
              {t(lang, 'test_title')}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              {t(lang, 'test_intro_p_1')}
              <strong className="text-slate-200">{t(lang, 'test_intro_p_2')}</strong>
              <strong className="text-rose-400 text-base px-1">3</strong>
              {t(lang, 'test_intro_p_3')}
            </p>
          </div>

          {/* Rule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-start">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/30 shadow-xs">
              <div className="w-3 h-3 rounded-full bg-teal-400 flex-shrink-0" />
              <div className="text-xs font-bold text-slate-200">{t(lang, 'rule_go')}</div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 shadow-xs">
              <div className="w-3 h-3 rounded-full bg-rose-400 flex-shrink-0" />
              <div className="text-xs font-bold text-rose-400">{t(lang, 'rule_nogo')}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startCountdown(12)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t(lang, 'btn_begin_test')} (Standard 108 Trials)</span>
            </button>

            <button
              onClick={() => startCountdown(4)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-semibold transition-all shadow-xs"
            >
              Practice Run (36 Trials)
            </button>
          </div>
        </div>
      )}

      {/* Countdown Phase */}
      {phase === 'countdown' && (
        <div className="p-16 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl shadow-slate-950/50">
          <span className="font-mono text-8xl font-bold text-teal-400 animate-pulse">
            {countdownNum}
          </span>
          <p className="text-sm font-mono text-slate-400">{t(lang, 'countdown_ready')}</p>
        </div>
      )}

      {/* Running Phase */}
      {phase === 'running' && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-teal-500 transition-all duration-100 ease-linear shadow-xs shadow-teal-500/50"
              style={{
                width: `${Math.round(((trialIndex + 1) / sequence.length) * 100)}%`,
              }}
            />
          </div>

          {/* Stimulus Stage Area (Clickable / Tappable) */}
          <div
            onClick={handleResponse}
            className="w-full h-72 sm:h-80 rounded-2xl bg-slate-950 border-2 border-slate-800 hover:border-teal-500/50 flex items-center justify-center select-none cursor-pointer shadow-2xl shadow-slate-950/80 relative overflow-hidden transition-colors"
          >
            {/* Subtle central target ring */}
            <div className="absolute w-36 h-36 rounded-full border border-slate-800/60 pointer-events-none" />

            {/* Centered Presentation Layer */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              {currentDigit !== null ? (
                <span className="font-mono text-8xl sm:text-9xl font-bold tracking-tight text-slate-50 drop-shadow-[0_0_24px_rgba(45,212,191,0.25)] select-none">
                  {currentDigit}
                </span>
              ) : (
                /* Persistent Fixation Cross (+) during blank interval to maintain central gaze */
                <span className="font-mono text-6xl sm:text-7xl font-light text-teal-400/80 leading-none select-none drop-shadow-[0_0_12px_rgba(45,212,191,0.3)]">
                  {FIXATION_CROSS}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
              <span className="text-xs text-slate-500 font-mono">
                {t(lang, 'test_hint')}
              </span>
            </div>

            {/* Focus Lock & Anti-Cheat Pause Overlay */}
            {isPaused && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  resumeTest();
                }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all animate-fade-in"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400">
                  <PauseCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-1.5">
                  {lang === 'ar' ? 'تم إيقاف الاختبار مؤقتاً' : 'Test Paused'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4">
                  {lang === 'ar'
                    ? 'فقدت النافذة التركيز لضمان دقة البيانات المعرفية. اضغط هنا للمتابعة.'
                    : 'Test Paused: Window lost focus. Click here to resume.'}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeTest();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'ar' ? 'متابعة الاختبار' : 'Click here to resume'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-500 px-2">
            <span>
              Trial {trialIndex + 1} / {sequence.length}
            </span>
            <span>Block {Math.floor(trialIndex / 9) + 1} / {testBlocks}</span>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && testResult && (
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-6 text-center shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t(lang, 'result_title')}</span>
            </div>
            <div className="flex items-baseline justify-center gap-2 pt-2">
              <span className="font-mono text-6xl sm:text-7xl font-bold text-teal-400">
                {testResult.score}
              </span>
              <span className="text-sm font-medium text-slate-400">{t(lang, 'result_of100')}</span>
            </div>
            <p className="text-xs text-slate-400">
              {(() => {
                const earlierTests = previousTests.filter((t) => t.timestamp !== testResult.timestamp);
                if (earlierTests.length > 0) {
                  const baseline = earlierTests[0];
                  const diff = testResult.score - baseline.score;
                  return t(lang, 'score_delta_gain_template', {
                    delta: (diff >= 0 ? '+' : '') + diff,
                  });
                }
                return t(lang, 'result_delta_baseline');
              })()}
            </p>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Commission Errors */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-start shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">
                {t(lang, 'result_commission_label')}
              </div>
              <div className="font-mono text-2xl font-bold text-rose-400">
                {testResult.commissionErrors} / {testResult.noGoTrials}
              </div>
              <div className="text-[10px] text-slate-500">
                {t(lang, 'result_commission_note')}
              </div>
            </div>

            {/* Omission Errors */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-start shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">
                {t(lang, 'result_omission_label')}
              </div>
              <div className="font-mono text-2xl font-bold text-slate-100">
                {testResult.omissionErrors} / {testResult.goTrials}
              </div>
              <div className="text-[10px] text-slate-500">
                {t(lang, 'result_omission_note')}
              </div>
            </div>

            {/* Mean RT */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-start shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">{t(lang, 'result_rt_label')}</div>
              <div className="font-mono text-2xl font-bold text-teal-400">
                {testResult.meanRT !== null ? `${testResult.meanRT} ms` : '—'}
              </div>
              <div className="text-[10px] text-slate-500">
                CV: {testResult.rtCV.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startCountdown(testBlocks)}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-teal-500/20 active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t(lang, 'btn_retake')}</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2 shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>{t(lang, 'btn_back_dashboard')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
