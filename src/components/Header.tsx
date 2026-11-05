import React, { useState, useEffect, useRef } from 'react';
import { MonthData, AppState } from '../types/journal';
import { generateJournalPDF, generateJournalPNG, downloadBlob } from '../utils/pdfExport';
import { cleanState } from '../utils/storage';
import { Download, Upload, Plus, FileText, Image as ImageIcon, Database } from 'lucide-react';

interface HeaderProps {
  state: AppState;
  onSelectMonth: (idx: number) => void;
  onAddNewMonth: () => void;
  onRenameMonth: (name: string) => void;
  onRestoreState: (newState: AppState) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onSelectMonth,
  onAddNewMonth,
  onRenameMonth,
  onRestoreState
}) => {
  const currentMonth = state.m[state.c] || state.m[0];
  const [newMonthArmed, setNewMonthArmed] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pngLoading, setPngLoading] = useState(false);
  const [backupFlash, setBackupFlash] = useState<string | null>(null);
  const [restoreFlash, setRestoreFlash] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AppState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated Dust / Typing Title Effect
  const [displayText, setDisplayText] = useState('');
  const [isDusting, setIsDusting] = useState(false);
  const [dustParticles, setDustParticles] = useState<
    { char: string; color: string; dx: number; dy: number; r: number; d: number }[]
  >([]);

  const titleFull = 'MAHFUJ TRADING LOG';

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    let cancelled = false;

    const startTyping = () => {
      if (cancelled) return;
      setIsDusting(false);
      setDustParticles([]);
      charIndex = 0;
      setDisplayText('');

      const typeStep = () => {
        if (cancelled) return;
        charIndex++;
        setDisplayText(titleFull.slice(0, charIndex));

        if (charIndex >= titleFull.length) {
          // Pause before dusting
          timeout = setTimeout(() => {
            triggerDust();
          }, 3500);
          return;
        }
        timeout = setTimeout(typeStep, 110);
      };

      timeout = setTimeout(typeStep, 500);
    };

    const triggerDust = () => {
      if (cancelled) return;
      const chars = titleFull.split('');
      const particles = chars.map((char, k) => {
        const factor = k / (chars.length - 1 || 1);
        const r = Math.round(56 + 199 * factor);
        const g = Math.round(189 - 112 * factor);
        const b = Math.round(248 - 139 * factor);
        const color = `rgb(${r}, ${g}, ${b})`;
        const wind = 50 + Math.random() * 80;
        const dy = -25 - Math.random() * 65;
        const rot = Math.random() * 50 - 25;
        const delay = +(k * 0.05).toFixed(2);
        return { char, color, dx: wind, dy, r: rot, d: delay };
      });

      setDustParticles(particles);
      setIsDusting(true);

      timeout = setTimeout(() => {
        setDisplayText('');
        setIsDusting(false);
        timeout = setTimeout(startTyping, 1000);
      }, chars.length * 50 + 1500);
    };

    startTyping();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const handleNewMonth = () => {
    if (!newMonthArmed) {
      setNewMonthArmed(true);
      setTimeout(() => setNewMonthArmed(false), 4500);
      return;
    }
    setNewMonthArmed(false);
    onAddNewMonth();
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      const blob = await generateJournalPDF(currentMonth);
      const cleanName = (currentMonth.nm || 'month').replace(/[^A-Za-z0-9_-]+/g, '-');
      downloadBlob(blob, `journal-${cleanName}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      setPngLoading(true);
      const blob = await generateJournalPNG(currentMonth);
      const cleanName = (currentMonth.nm || 'month').replace(/[^A-Za-z0-9_-]+/g, '-');
      downloadBlob(blob, `journal-${cleanName}.png`);
    } catch (err) {
      console.error(err);
    } finally {
      setPngLoading(false);
    }
  };

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(
        {
          app: 'mahfuj-trading-log',
          v: 2,
          saved: new Date().toISOString(),
          data: state
        },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`;
      downloadBlob(blob, `trading-log-backup-${dateStr}.json`);
      setBackupFlash('Saved ✓');
      setTimeout(() => setBackupFlash(null), 3000);
    } catch (e) {
      console.error(e);
      setBackupFlash('Failed to save');
      setTimeout(() => setBackupFlash(null), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const data = parsed.data || parsed;
        const cleaned = cleanState(data);
        setPendingRestore(cleaned);
        setRestoreFlash(`Tap again to restore ${cleaned.m.length} month(s)`);
        setTimeout(() => {
          setPendingRestore(null);
          setRestoreFlash(null);
        }, 7000);
      } catch (err) {
        console.error(err);
        setRestoreFlash('Invalid backup file');
        setTimeout(() => setRestoreFlash(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreClick = () => {
    if (pendingRestore) {
      onRestoreState(pendingRestore);
      setPendingRestore(null);
      setRestoreFlash('Restored ✓');
      setTimeout(() => setRestoreFlash(null), 3000);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <header className="mb-6 space-y-3">
      {/* Dynamic Animated Title */}
      <div className="pt-2 pb-1 min-h-[48px] flex items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight relative select-none">
          {isDusting ? (
            <span className="inline-block relative">
              {dustParticles.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-block"
                  style={
                    {
                      color: p.color,
                      '--dx': `${p.dx}px`,
                      '--dy': `${p.dy}px`,
                      '--r': `${p.r}deg`,
                      animation: `mhdust 1.3s ease-in forwards ${p.d}s`
                    } as React.CSSProperties
                  }
                >
                  {p.char === ' ' ? '\u00a0' : p.char}
                </span>
              ))}
            </span>
          ) : (
            <span className="bg-gradient-to-r from-sky-400 via-purple-300 to-rose-400 bg-clip-text text-transparent">
              {displayText}
              <span className="text-sky-400 animate-pulse ml-0.5">|</span>
            </span>
          )}
        </h1>
      </div>
      <div className="w-14 h-1 bg-gradient-to-r from-sky-400 to-rose-400 rounded-full" />

      {/* Month Selector & New Month Button */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 glass-panel neon-glow">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Month
          </label>
          <select
            value={state.c}
            onChange={e => onSelectMonth(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-100 focus:border-sky-400"
          >
            {state.m.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.nm || `Month ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <button
            onClick={handleNewMonth}
            type="button"
            className={`w-full py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
              newMonthArmed
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-900/30'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {newMonthArmed ? 'Tap: Start at $0' : '+ New month'}
            </span>
          </button>
        </div>
      </div>

      {/* Month Name Input */}
      <div className="p-3.5 glass-panel">
        <label className="text-xs font-semibold text-slate-400 block mb-1">
          Month name (rename any time)
        </label>
        <input
          type="text"
          value={currentMonth.nm || ''}
          onChange={e => onRenameMonth(e.target.value)}
          placeholder="e.g. November 2026 Challenge"
          className="w-full px-3 py-2 text-sm font-medium rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-100 focus:border-sky-400"
        />
      </div>

      {/* Action Buttons: PDF, PNG, Backup, Restore */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            type="button"
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{pdfLoading ? 'Making PDF…' : '⬇ Download PDF (all data)'}</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={pngLoading}
            type="button"
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>{pngLoading ? 'Making image…' : '⬇ Download image (PNG)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleBackup}
            type="button"
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4 shrink-0 text-sky-400" />
            <span>{backupFlash || '⬇ Backup (সব মাসের ডেটা)'}</span>
          </button>
          <button
            onClick={handleRestoreClick}
            type="button"
            className={`w-full py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
              pendingRestore
                ? 'bg-amber-600/90 border-amber-400 text-white animate-pulse'
                : 'text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70'
            }`}
          >
            <Upload className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="truncate">{restoreFlash || '⬆ Restore (ব্যাকআপ ফাইল থেকে)'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
};
