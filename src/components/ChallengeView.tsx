import React, { useState, useEffect } from 'react';
import { Calendar, Check, Play, Save } from 'lucide-react';
import { DailyLog, Language, SafaAppState } from '../types';
import { t } from '../lib/i18n';
import { calculateChallengeDay, DAY_MS, dayKey } from '../lib/storage';

interface ChallengeViewProps {
  state: SafaAppState;
  lang: Language;
  onSaveLog: (key: string, log: DailyLog, dayNum: number) => void;
  onStartChallenge: () => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  state,
  lang,
  onSaveLog,
  onStartChallenge,
}) => {
  const isStarted = !!state.challengeStartDate;
  const currentDayNum = calculateChallengeDay(state.challengeStartDate);
  const todayKeyStr = dayKey();

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedKey, setSelectedKey] = useState<string>('');

  // Form states
  const [screenTime, setScreenTime] = useState<string>('');
  const [notifications, setNotifications] = useState<boolean>(false);
  const [phoneFree, setPhoneFree] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (!isStarted || !state.challengeStartDate) return;

    const startDate = new Date(state.challengeStartDate);
    let targetDay = Math.min(14, Math.max(1, currentDayNum));
    let targetKey = dayKey(new Date(startDate.getTime() + (targetDay - 1) * DAY_MS));

    setSelectedDay(targetDay);
    setSelectedKey(targetKey);
    loadFormData(targetKey);
  }, [isStarted, state.challengeStartDate, currentDayNum]);

  const loadFormData = (key: string) => {
    const existing = state.dailyLogs[key];
    if (existing) {
      setScreenTime(existing.screenTimeMinutes !== null ? String(existing.screenTimeMinutes) : '');
      setNotifications(!!existing.notifications);
      setPhoneFree(!!existing.phoneFree);
      setNote(existing.note || '');
    } else {
      setScreenTime('');
      setNotifications(false);
      setPhoneFree(false);
      setNote('');
    }
  };

  const handleSelectDay = (d: number, k: string) => {
    setSelectedDay(d);
    setSelectedKey(k);
    loadFormData(k);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    const minutesNum = parseInt(screenTime, 10);
    const payload: DailyLog = {
      screenTimeMinutes: isNaN(minutesNum) ? null : minutesNum,
      notifications,
      phoneFree,
      note: note.trim(),
    };

    onSaveLog(selectedKey, payload, selectedDay);
  };

  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-xs">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-slate-100">
            {t(lang, 'challenge_title')}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {t(lang, 'start_challenge_desc')}
          </p>
        </div>
        <button
          onClick={onStartChallenge}
          className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{t(lang, 'challenge_start_btn')}</span>
        </button>
      </div>
    );
  }

  const startDate = new Date(state.challengeStartDate!);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
          {t(lang, 'challenge_eyebrow')}
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
          {t(lang, 'challenge_title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Day Grid Matrix (7 cols x 2 rows) */}
        <div className="lg:col-span-6 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-slate-100">
              {t(lang, 'daymap_title')}
            </h3>
            <p className="text-xs text-slate-400">{t(lang, 'daymap_desc')}</p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const d = i + 1;
              const date = new Date(startDate.getTime() + i * DAY_MS);
              const key = dayKey(date);
              const isLogged = !!state.dailyLogs[key];
              const isFuture = d > currentDayNum;
              const isToday = key === todayKeyStr;
              const isSelected = selectedDay === d;

              return (
                <button
                  key={d}
                  disabled={isFuture}
                  onClick={() => handleSelectDay(d, key)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 relative transition-all ${
                    isSelected
                      ? 'ring-2 ring-teal-400 bg-slate-800 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950 border border-slate-800'
                  } ${
                    isLogged
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'text-slate-400'
                  } ${
                    isFuture
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:border-teal-500/50 cursor-pointer'
                  } ${isToday ? 'border-dashed border-teal-400' : ''}`}
                >
                  <span className="font-mono text-sm font-bold">{d}</span>
                  {isLogged && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-xs shadow-teal-400/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Log Form */}
        <div className="lg:col-span-6 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <h3 className="text-base font-bold font-display text-slate-100">
            {state.dailyLogs[selectedKey]
              ? t(lang, 'log_form_edit_day', { day: selectedDay })
              : t(lang, 'log_form_new_day', { day: selectedDay })}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Screen Time Minutes */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium block">
                {t(lang, 'log_screen_time')}
              </label>
              <input
                type="number"
                min="0"
                max="1440"
                value={screenTime}
                onChange={(e) => setScreenTime(e.target.value)}
                placeholder="e.g. 180"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-mono"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
                <span>{t(lang, 'log_notifications')}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={phoneFree}
                  onChange={(e) => setPhoneFree(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
                <span>{t(lang, 'log_phone_free')}</span>
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-400 font-medium block">
                {t(lang, 'log_note')}
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional daily focus observations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 resize-none transition-all"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>
                {t(lang, 'log_save_btn')} (Day {selectedDay})
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
