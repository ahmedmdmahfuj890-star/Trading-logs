import React, { useState, useEffect } from 'react';
import { AppState, MonthData, DayLog } from './types/journal';
import {
  loadInitialState,
  saveState,
  createBlankMonth
} from './utils/storage';
import { Header } from './components/Header';
import { MarketSessions } from './components/MarketSessions';
import { SettingsAndLotCalculator } from './components/SettingsAndLotCalculator';
import { MonthlyStats } from './components/MonthlyStats';
import { DayStrip } from './components/DayStrip';
import { WeeklyReview } from './components/WeeklyReview';
import { DailyLog } from './components/DailyLog';
import { TourModal, TOUR_STEPS } from './components/TourModal';
import { ArrowUp, HelpCircle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [tourStep, setTourStep] = useState<number>(-1);

  // Auto-save on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // First time tour prompt check
  useEffect(() => {
    try {
      const tourDone = localStorage.getItem('mh-tour-done');
      if (!tourDone) {
        setTourStep(0);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const currentMonthIdx = state.c < state.m.length ? state.c : 0;
  const currentMonth = state.m[currentMonthIdx] || state.m[0];

  // Select month
  const handleSelectMonth = (idx: number) => {
    setState(prev => ({
      ...prev,
      c: idx
    }));
  };

  // Add new month (starts with $0 balance)
  const handleAddNewMonth = () => {
    const newMonthNumber = state.m.length + 1;
    const newMonth = createBlankMonth(`Month ${newMonthNumber}`, 0);
    newMonth.l = currentMonth.l;
    newMonth.dt = currentMonth.dt;
    newMonth.mt = currentMonth.mt;

    setState(prev => ({
      c: prev.m.length,
      m: [...prev.m, newMonth]
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rename current month
  const handleRenameMonth = (name: string) => {
    setState(prev => {
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = {
        ...updatedMonths[prev.c],
        nm: name
      };
      return {
        ...prev,
        m: updatedMonths
      };
    });
  };

  // Update whole month object
  const handleUpdateCurrentMonth = (updatedMonth: MonthData) => {
    setState(prev => {
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = updatedMonth;
      return {
        ...prev,
        m: updatedMonths
      };
    });
  };

  // Update single day
  const handleUpdateDay = (dayIndex: number, updatedDay: DayLog) => {
    setState(prev => {
      const targetMonth = prev.m[prev.c];
      const updatedDays = [...targetMonth.d];
      updatedDays[dayIndex] = updatedDay;
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = {
        ...targetMonth,
        d: updatedDays
      };
      return {
        ...prev,
        m: updatedMonths
      };
    });
  };

  // Update weekly mistakes
  const handleUpdateWeeklyMistakes = (mistakes: string[]) => {
    setState(prev => {
      const targetMonth = prev.m[prev.c];
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = {
        ...targetMonth,
        wm: mistakes
      };
      return {
        ...prev,
        m: updatedMonths
      };
    });
  };

  // Clear current month
  const handleClearMonth = () => {
    setState(prev => {
      const oldMonth = prev.m[prev.c];
      const cleared = createBlankMonth(oldMonth.nm, oldMonth.s);
      cleared.dt = oldMonth.dt;
      cleared.mt = oldMonth.mt;
      cleared.l = oldMonth.l;
      cleared.lot = oldMonth.lot;
      cleared.snap = oldMonth.snap;

      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = cleared;
      return {
        ...prev,
        m: updatedMonths
      };
    });
  };

  // Jump to day card
  const handleDayClick = (dayIndex: number) => {
    const el = document.getElementById(`card${dayIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Tour handlers
  const handleTourNext = () => {
    if (tourStep >= TOUR_STEPS.length - 1) {
      setTourStep(-1);
      try {
        localStorage.setItem('mh-tour-done', '1');
      } catch (e) {
        // ignore
      }
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handleTourSkip = () => {
    setTourStep(-1);
    try {
      localStorage.setItem('mh-tour-done', '1');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center px-4 py-4 sm:py-6 pb-28">
      <main className="w-full max-w-[600px]">
        {/* Header with Title Animation, Month Selector, Exports */}
        <Header
          state={state}
          onSelectMonth={handleSelectMonth}
          onAddNewMonth={handleAddNewMonth}
          onRenameMonth={handleRenameMonth}
          onRestoreState={newState => setState(newState)}
        />

        {/* Forex Market Sessions Real-time Clock */}
        <MarketSessions />

        <p className="text-xs text-slate-400 mb-4 px-1 leading-relaxed">
          Tap rules to cycle Y / N. Each month is saved separately on this device. A new month
          starts from 0.
        </p>

        {/* Starting Capital, Risk Targets & Lot Size Calculator */}
        <SettingsAndLotCalculator
          month={currentMonth}
          onChange={handleUpdateCurrentMonth}
        />

        {/* Monthly Numbers Dashboard */}
        <MonthlyStats month={currentMonth} />

        {/* 20-Day Interactive Strip Navigator */}
        <DayStrip month={currentMonth} onDayClick={handleDayClick} />

        {/* Weekly Review & Weekly Mistakes */}
        <WeeklyReview
          month={currentMonth}
          onChangeMistakes={handleUpdateWeeklyMistakes}
        />

        {/* 20-Day Detailed Trade Journal */}
        <DailyLog
          month={currentMonth}
          onUpdateDay={handleUpdateDay}
          onClearMonth={handleClearMonth}
        />
      </main>

      {/* Floating Buttons: Help (?) & Back to Top (↑) */}
      <div className="fixed left-4 bottom-5 z-40 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-950/60 hover:opacity-90 active:scale-95 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setTourStep(0)}
          aria-label="Help tour"
          className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-indigo-950/60 hover:opacity-90 active:scale-95 transition-all"
        >
          ?
        </button>
      </div>

      {/* Onboarding Tour Modal */}
      <TourModal
        currentStep={tourStep}
        onNext={handleTourNext}
        onSkip={handleTourSkip}
      />
    </div>
  );
}
