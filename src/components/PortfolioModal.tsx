import React from 'react';
import { X, Printer, GraduationCap, Award, Brain, Cpu, Database, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../lib/i18n';
import { BrandLogo } from './BrandIcons';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-y-auto flex flex-col p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Top Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-teal-400">
            <GraduationCap className="w-5 h-5" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Academic & Engineering Portfolio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Academic Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
          <div className="flex-shrink-0">
            <BrandLogo size="lg" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-mono font-semibold">
              COGNITIVE SCIENCE & APPLIED AI PORTFOLIO
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
              Project: Safa (صفا) — Cognitive Restoration & Empirical Attention Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              An offline-first, mathematically calibrated software suite designed to measure, evaluate, and rehabilitate human sustained attention and working memory capacity in an era of algorithmic hyper-fragmentation.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-teal-400">
              <Brain className="w-4 h-4" />
              <h3 className="font-bold text-sm font-display text-slate-100">
                1. Cognitive Neuropsychology Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Implements standardized psychometric paradigms: SART (Robertson et al., 1997) with millisecond-accurate Go/No-Go stimulus presentation (250ms active / 900ms mask), the Stroop Effect (1935) measuring cognitive interference control, Kirchner’s Dual-Task N-Back (1958) testing working memory updating, and Corsi Block-Tapping (1972) quantifying visuospatial span.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <Cpu className="w-4 h-4" />
              <h3 className="font-bold text-sm font-display text-slate-100">
                2. Algorithmic Intelligence & Heuristics
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered a zero-dependency deterministic AI Chess engine featuring Minimax recursive game-tree search optimized by Alpha-Beta Pruning, dynamic depth scaling, Piece-Square Tables (PST) positional evaluation, and legal move validation without relying on external cloud APIs.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-teal-400">
              <Database className="w-4 h-4" />
              <h3 className="font-bold text-sm font-display text-slate-100">
                3. Privacy-Preserving Offline Resilience
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed around complete data sovereignty. All trial reaction times, performance vectors, and behavioral logs persist purely within client-side transactional storage. Features schema-validated JSON export/import pipelines ensuring zero user tracking or telemetry leakage.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-rose-400">
              <Award className="w-4 h-4" />
              <h3 className="font-bold text-sm font-display text-slate-100">
                4. Mathematical Modeling & Metrics
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates the Focus Score using a weighted composite formula:{' '}
              <span className="font-mono text-teal-400">
                Score = 50%(Commission Accuracy) + 30%(Omission Accuracy) + 20%(RT Variability)
              </span>
              , isolating lapses in top-down prefrontal executive inhibition.
            </p>
          </div>
        </div>

        {/* Technical Stack Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs shadow-inner">
          <div className="text-teal-400 font-bold">TECHNICAL SPECIFICATIONS & ARTIFACTS:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
            <div>• TypeScript & React 18+</div>
            <div>• Vite Build Matrix</div>
            <div>• 7-Language i18n Core</div>
            <div>• Pure SVG Telemetry Visualizer</div>
            <div>• High-Performance Game Loops</div>
            <div>• Minimax & Alpha-Beta Engine</div>
            <div>• WCAG AA Accessibility</div>
            <div>• Offline PWA Ready</div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
          >
            Close Portfolio View
          </button>
        </div>
      </div>
    </div>
  );
};
