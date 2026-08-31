import React, { useState, useEffect } from 'react';
import {
  AttentionTestResult,
  DailyLog,
  Language,
  SafaAppState,
  ViewType,
} from './types';
import {
  loadAppState,
  saveAppState,
  dayKey,
  defaultAppState,
} from './lib/storage';
import { t } from './lib/i18n';
import { Toast } from './components/Toast';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AttentionTest } from './components/AttentionTest';
import { GamesHub } from './components/GamesHub';
import { ChessGame } from './components/ChessGame';
import { NBackGame } from './components/NBackGame';
import { StroopGame } from './components/StroopGame';
import { CorsiGame } from './components/CorsiGame';
import { FlankerGame } from './components/FlankerGame';
import { TOLGame } from './components/TOLGame';
import { TaskSwitchGame } from './components/TaskSwitchGame';
import { PosnerGame } from './components/PosnerGame';
import { ChallengeView } from './components/ChallengeView';
import { ProgressView } from './components/ProgressView';
import { ScienceView } from './components/ScienceView';
import { ReadingView } from './components/ReadingView';
import { PortfolioModal } from './components/PortfolioModal';

export default function App() {
  const [state, setState] = useState<SafaAppState>(() => loadAppState());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [lang, setLang] = useState<Language>('ar');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('safa:colorblind_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Synchronize language and text direction with document
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Synchronize colorblind accessibility mode with document classes & storage
  useEffect(() => {
    try {
      localStorage.setItem('safa:colorblind_mode', String(colorblindMode));
    } catch {}
    if (colorblindMode) {
      document.documentElement.classList.add('colorblind-mode');
      document.body.classList.add('colorblind-mode');
    } else {
      document.documentElement.classList.remove('colorblind-mode');
      document.body.classList.remove('colorblind-mode');
    }
  }, [colorblindMode]);

  // Persist state whenever changed
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleColorblindMode = () => {
    setColorblindMode((prev) => !prev);
  };

  const handleStartChallenge = () => {
    const today = dayKey();
    setState((prev) => ({
      ...prev,
      challengeStartDate: today,
    }));
    showToast(t(lang, 'toast_challenge_started'));
    setCurrentView('challenge');
  };

  const handleSaveLog = (key: string, log: DailyLog, dayNum: number) => {
    setState((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [key]: log,
      },
    }));
    showToast(t(lang, 'toast_log_saved', { day: dayNum }));
  };

  const handleSaveTestResult = (result: AttentionTestResult) => {
    setState((prev) => ({
      ...prev,
      attentionTests: [...prev.attentionTests, result],
    }));
    showToast(t(lang, 'toast_test_saved'));
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `safa-backup-${dayKey()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(t(lang, 'toast_exported'));
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (
          typeof parsed === 'object' &&
          'dailyLogs' in parsed &&
          'attentionTests' in parsed
        ) {
          const def = defaultAppState();
          const merged: SafaAppState = {
            ...def,
            ...parsed,
            games: {
              ...def.games,
              ...(parsed.games || {}),
            },
          };
          setState(merged);
          showToast(t(lang, 'toast_imported'));
        } else {
          showToast(t(lang, 'toast_invalid_file'));
        }
      } catch (err) {
        showToast(t(lang, 'toast_invalid_file'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-teal-500/30 selection:text-teal-300 relative grid-ambient">
      {/* Subtle ambient light gradient layer */}
      <div className="fog-layer" aria-hidden="true" />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Navigation Sidebar / Header */}
      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        lang={lang}
        onLanguageChange={setLang}
        onExport={handleExportData}
        onImport={handleImportData}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        colorblindMode={colorblindMode}
        onToggleColorblindMode={handleToggleColorblindMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full relative z-10">
        {currentView === 'dashboard' && (
          <Dashboard
            state={state}
            lang={lang}
            onNavigate={setCurrentView}
            onStartChallenge={handleStartChallenge}
          />
        )}

        {currentView === 'test' && (
          <AttentionTest
            lang={lang}
            onSaveTestResult={handleSaveTestResult}
            onNavigate={setCurrentView}
            previousTests={state.attentionTests}
          />
        )}

        {currentView === 'games-hub' && (
          <GamesHub lang={lang} onNavigate={setCurrentView} />
        )}

        {currentView === 'game-chess' && (
          <ChessGame
            lang={lang}
            stats={state.games.chess}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, chess: updater(prev.games.chess) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-nback' && (
          <NBackGame
            lang={lang}
            stats={state.games.nback}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, nback: updater(prev.games.nback) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-stroop' && (
          <StroopGame
            lang={lang}
            stats={state.games.stroop}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, stroop: updater(prev.games.stroop) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-corsi' && (
          <CorsiGame
            lang={lang}
            stats={state.games.corsi}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, corsi: updater(prev.games.corsi) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-flanker' && (
          <FlankerGame
            lang={lang}
            stats={state.games.flanker}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, flanker: updater(prev.games.flanker) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-tol' && (
          <TOLGame
            lang={lang}
            stats={state.games.tol}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, tol: updater(prev.games.tol) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-taskswitch' && (
          <TaskSwitchGame
            lang={lang}
            stats={state.games.taskswitch}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, taskswitch: updater(prev.games.taskswitch) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'game-posner' && (
          <PosnerGame
            lang={lang}
            stats={state.games.posner}
            onUpdateStats={(updater) =>
              setState((prev) => ({
                ...prev,
                games: { ...prev.games, posner: updater(prev.games.posner) },
              }))
            }
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'challenge' && (
          <ChallengeView
            state={state}
            lang={lang}
            onSaveLog={handleSaveLog}
            onStartChallenge={handleStartChallenge}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView state={state} lang={lang} />
        )}

        {currentView === 'reading' && <ReadingView lang={lang} />}

        {currentView === 'science' && <ScienceView lang={lang} />}
      </main>

      {/* Academic Portfolio Modal */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        lang={lang}
      />
    </div>
  );
}
