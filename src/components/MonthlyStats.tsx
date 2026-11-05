import React from 'react';
import { MonthData } from '../types/journal';
import { calculateMonthSummary } from '../utils/calculator';
import { money, pct, fp, num } from '../utils/storage';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface MonthlyStatsProps {
  month: MonthData;
}

export const MonthlyStats: React.FC<MonthlyStatsProps> = ({ month }) => {
  const c = calculateMonthSummary(month);
  const net = c.bal - c.start;
  const pf = c.gl === 0 ? (c.gp === 0 ? '–' : 'n/a') : (c.gp / Math.abs(c.gl)).toFixed(2);

  let apY = 0;
  let apN = 0;
  let apW = 0;
  month.d.forEach(d => {
    d.t.forEach(t => {
      if (t.ap === 'Yes') {
        apY++;
        const vv = num(t.pl);
        if (isNaN(vv) ? num(t.pp) > 0 : vv > 0) apW++;
      } else if (t.ap === 'No') {
        apN++;
      }
    });
  });

  // Sparkline computation
  const pts = [c.start];
  c.res.forEach(r => {
    if (r.any) pts.push(r.bal);
  });

  const sparkWidth = 320;
  const sparkHeight = 70;
  const minVal = Math.min(...pts);
  const maxVal = Math.max(...pts);
  const range = maxVal - minVal || 1;

  let sparkSvg = null;
  if (pts.length > 1) {
    const coords = pts.map((v, i) => [
      i * (sparkWidth / (pts.length - 1)),
      sparkHeight - 8 - ((v - minVal) / range) * (sparkHeight - 20)
    ]);
    const linePath = coords
      .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(' ');
    const areaPath = `${linePath} L${sparkWidth} ${sparkHeight} L0 ${sparkHeight} Z`;

    sparkSvg = (
      <svg
        className="w-full h-16 mt-3 overflow-visible"
        viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const targetNum = num(month.mt);
  const targetPct = targetNum > 0 ? (net / targetNum) * 100 : 0;
  const clampedTargetPct = Math.max(0, Math.min(100, targetPct));

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-4 bg-gradient-to-b from-sky-400 to-rose-400 rounded-full" />
        <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <span>Monthly numbers</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Big Balance Hero Card */}
        <div className="col-span-2 p-5 rounded-2xl glass-panel neon-glow bg-gradient-to-br from-sky-950/80 via-slate-900/90 to-purple-950/70 border border-slate-700/60 shadow-xl">
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">
            Balance
          </span>
          <b className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums block mt-1">
            {money(c.bal)}
          </b>

          {/* Net Pill */}
          <div className="mt-2">
            {c.tr ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  net >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {net >= 0 ? '▲ +' : '▼ '}
                {money(net)}
                {c.start ? ` · ${pct(net / c.start)}` : ''}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                No trades yet
              </span>
            )}
          </div>

          {/* Equity sparkline */}
          {sparkSvg}

          {/* Target Progress Bar */}
          {targetNum > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  style={{ width: `${clampedTargetPct}%` }}
                />
              </div>
              <div className="text-[11.5px] font-semibold text-slate-300 mt-1.5 flex justify-between items-center">
                <span>
                  Target {money(targetNum)} · {targetPct.toFixed(1)}%
                </span>
                <span className={net >= targetNum ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {net >= targetNum ? '🎯 পূরণ!' : `আর ${money(targetNum - net)} লাগবে`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Total trades */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Total trades</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">{c.tr}</b>
        </div>

        {/* Win rate */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Win rate</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">
            {c.tr ? pct(c.w / c.tr) : '–'}
          </b>
        </div>

        {/* Avg win */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Avg win</span>
          <b className="text-xl font-bold text-emerald-400 tabular-nums block mt-1">
            {c.wd ? money(c.gp / c.wd) : '–'}
          </b>
        </div>

        {/* Avg loss */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Avg loss</span>
          <b className="text-xl font-bold text-rose-400 tabular-nums block mt-1">
            {c.ld ? money(c.gl / c.ld) : '–'}
          </b>
        </div>

        {/* Profit factor */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Profit factor</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">{pf}</b>
        </div>

        {/* Return */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Return</span>
          <b
            className={`text-xl font-bold tabular-nums block mt-1 ${
              net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {c.start ? pct(net / c.start) : '–'}
          </b>
        </div>

        {/* Max drawdown */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Max drawdown</span>
          <b className="text-xl font-bold text-slate-200 tabular-nums block mt-1">
            {c.tr ? `${money(c.mdd)} (${pct(c.mddp)})` : '–'}
          </b>
        </div>

        {/* Discipline score */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Discipline score</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">{pct(c.disc)}</b>
        </div>

        {/* A+ sets */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">A+ sets</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">
            {apY + apN ? `${apY} of ${apY + apN} (${pct(apY / (apY + apN))})` : '–'}
          </b>
        </div>

        {/* A+ win rate */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">A+ win rate</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">
            {apY ? pct(apW / apY) : '–'}
          </b>
        </div>

        {/* Total pips */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Total pips</span>
          <b
            className={`text-xl font-bold tabular-nums block mt-1 ${
              c.tp > 0 ? 'text-emerald-400' : c.tp < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {c.res.some(r => r.anyp) ? `${fp(c.tp)} pips` : '–'}
          </b>
        </div>

        {/* Pips won / lost */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Pips won / lost</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">
            {c.res.some(r => r.anyp)
              ? `+${Math.round(c.pw * 10) / 10} / ${Math.round(c.pls * 10) / 10}`
              : '–'}
          </b>
        </div>

        {/* Monthly target */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Monthly target</span>
          <b
            className={`text-xl font-bold tabular-nums block mt-1 ${
              net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {targetNum > 0 ? `${money(net)} / ${money(targetNum)}` : '–'}
          </b>
        </div>

        {/* Daily target hit */}
        <div className="p-3.5 rounded-2xl glass-panel neon-glow">
          <span className="text-[11.5px] font-semibold text-slate-400 block">Daily target hit</span>
          <b className="text-xl font-bold text-white tabular-nums block mt-1">
            {num(month.dt) > 0
              ? `${c.res.filter(r => r.any && r.net >= num(month.dt)).length} days`
              : '–'}
          </b>
        </div>

        {/* Remaining to target big card */}
        <div className="col-span-2 p-4 text-center rounded-2xl glass-panel neon-glow border border-slate-700/60 bg-slate-900/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            টার্গেট পূরণে আর লাগবে
          </span>
          <b className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text block mt-1 tabular-nums">
            {targetNum > 0
              ? net >= targetNum
                ? '🎯 পূরণ হয়েছে'
                : money(targetNum - net)
              : '–'}
          </b>
        </div>
      </div>
    </section>
  );
};
