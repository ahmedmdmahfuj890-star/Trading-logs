import React from 'react';
import { MonthData } from '../types/journal';
import { calculateMonthSummary } from '../utils/calculator';
import { amt, fp } from '../utils/storage';

interface DayStripProps {
  month: MonthData;
  onDayClick: (dayIndex: number) => void;
}

export const DayStrip: React.FC<DayStripProps> = ({ month, onDayClick }) => {
  const c = calculateMonthSummary(month);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <section className="mb-6">
      <div className="glass-panel p-3.5 neon-glow rounded-2xl">
        <label className="text-xs font-semibold text-slate-400 block mb-2.5">
          Tap a day to jump to it
        </label>
        <div className="grid grid-cols-5 gap-2">
          {c.res.map((r, i) => {
            const isWin = r.has && r.tone > 0;
            const isLoss = r.has && r.tone < 0;
            const isEven = r.has && r.tone === 0;

            let bgClasses = 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700';
            if (isWin) {
              bgClasses =
                'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.35)]';
            } else if (isLoss) {
              bgClasses =
                'bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-400 shadow-[0_4px_12px_rgba(244,63,94,0.35)]';
            } else if (isEven) {
              bgClasses = 'bg-slate-800 text-slate-200 border-slate-700';
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onDayClick(i)}
                className={`h-[78px] rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${bgClasses}`}
              >
                <small className="text-[10px] font-semibold opacity-90">
                  {weekDays[i % 5]}
                </small>
                <b className="text-base font-extrabold my-0.5 leading-none">{i + 1}</b>
                <small className="text-[11px] font-bold min-h-[14px] leading-tight">
                  {r.any ? amt(r.net) : ''}
                </small>
                {r.anyp && (
                  <small className="text-[10px] font-semibold opacity-85 leading-tight">
                    {fp(r.pips)}p
                  </small>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
