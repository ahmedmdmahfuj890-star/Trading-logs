import React from 'react';
import { MonthData } from '../types/journal';
import { calculateMonthSummary } from '../utils/calculator';
import { money, pct, fp } from '../utils/storage';
import { Calendar } from 'lucide-react';

interface WeeklyReviewProps {
  month: MonthData;
  onChangeMistakes: (weeklyMistakes: string[]) => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ month, onChangeMistakes }) => {
  const c = calculateMonthSummary(month);
  const wm = month.wm || ['', '', '', ''];

  const handleMistakeChange = (weekIdx: number, val: string) => {
    const updated = [...wm];
    updated[weekIdx] = val;
    onChangeMistakes(updated);
  };

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-4 bg-gradient-to-b from-sky-400 to-rose-400 rounded-full" />
        <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Weekly review</span>
        </h2>
      </div>

      {/* Weekly Stats Table */}
      <div className="glass-panel p-4 neon-glow overflow-x-auto rounded-2xl">
        <table className="w-full text-xs text-right tabular-nums">
          <thead>
            <tr className="border-b border-slate-700/60 text-slate-400 font-semibold text-[11px]">
              <th className="text-left pb-2">Week</th>
              <th className="pb-2">Trades</th>
              <th className="pb-2">Wins</th>
              <th className="pb-2">Win %</th>
              <th className="pb-2">Net P/L</th>
              <th className="pb-2">Pips</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {c.wk.map((x, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="text-left py-2.5 font-bold text-slate-200">Week {idx + 1}</td>
                <td className="py-2.5 text-slate-300">{x.t}</td>
                <td className="py-2.5 text-slate-300">{x.w}</td>
                <td className="py-2.5 text-slate-300">{x.t ? pct(x.w / x.t) : '–'}</td>
                <td
                  className={`py-2.5 font-bold ${
                    x.n > 0 ? 'text-emerald-400' : x.n < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {money(x.n)}
                </td>
                <td
                  className={`py-2.5 font-bold ${
                    x.p > 0 ? 'text-emerald-400' : x.p < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {x.p ? fp(x.p) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weekly Mistakes Inputs */}
      <div className="glass-panel p-4 neon-glow rounded-2xl space-y-3">
        {[0, 1, 2, 3].map(wIdx => (
          <div key={wIdx}>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Week {wIdx + 1} – biggest mistake
            </label>
            <input
              type="text"
              value={wm[wIdx] || ''}
              onChange={e => handleMistakeChange(wIdx, e.target.value)}
              placeholder="Write your biggest mistake"
              className="w-full px-3 py-2 text-sm font-medium rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
