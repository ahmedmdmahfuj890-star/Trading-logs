import React, { useState } from 'react';
import { MonthData, DayLog, Trade } from '../types/journal';
import { calculateMonthSummary } from '../utils/calculator';
import { money, fp, num, RULES, PRE_CHECKLIST } from '../utils/storage';
import { BookOpen, AlertTriangle, RotateCcw } from 'lucide-react';

interface DailyLogProps {
  month: MonthData;
  onUpdateDay: (dayIndex: number, updatedDay: DayLog) => void;
  onClearMonth: () => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({ month, onUpdateDay, onClearMonth }) => {
  const c = calculateMonthSummary(month);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const [clearArmed, setClearArmed] = useState(false);

  const handleClearClick = () => {
    if (!clearArmed) {
      setClearArmed(true);
      setTimeout(() => setClearArmed(false), 4500);
      return;
    }
    setClearArmed(false);
    onClearMonth();
  };

  // Helper for emotion toggle
  const toggleEmotion = (dayIndex: number, currentCe = 0) => {
    const nextCe = ((currentCe || 0) + 1) % 3;
    const day = month.d[dayIndex];
    onUpdateDay(dayIndex, { ...day, ce: nextCe });
  };

  // Helper for rule click
  const toggleRule = (dayIndex: number, ruleIdx: number) => {
    const day = month.d[dayIndex];
    const rules = [...day.r];
    rules[ruleIdx] = (rules[ruleIdx] + 1) % 3;
    onUpdateDay(dayIndex, { ...day, r: rules });
  };

  // Helper for pre-trade check
  const togglePreCheck = (dayIndex: number, checkIdx: number) => {
    const day = month.d[dayIndex];
    const checks = [...(day.c || [0, 0, 0, 0])];
    checks[checkIdx] = (checks[checkIdx] + 1) % 3;
    onUpdateDay(dayIndex, { ...day, c: checks });
  };

  // Helper for A+ set toggle
  const toggleAPlus = (dayIndex: number, tradeIdx: number) => {
    const day = month.d[dayIndex];
    const trades = [...day.t] as [Trade, Trade, Trade];
    const current = trades[tradeIdx].ap;
    const next = current === 'Yes' ? 'No' : 'Yes';
    trades[tradeIdx] = { ...trades[tradeIdx], ap: next };
    onUpdateDay(dayIndex, { ...day, t: trades });
  };

  // Helper for trade field change
  const updateTradeField = (
    dayIndex: number,
    tradeIdx: number,
    field: keyof Trade,
    value: string
  ) => {
    const day = month.d[dayIndex];
    const trades = [...day.t] as [Trade, Trade, Trade];
    trades[tradeIdx] = { ...trades[tradeIdx], [field]: value };
    onUpdateDay(dayIndex, { ...day, t: trades });
  };

  // Helper for mood star
  const setMood = (dayIndex: number, starVal: string) => {
    const day = month.d[dayIndex];
    const currentMood = String(day.m || '');
    const nextMood = currentMood === starVal ? '' : starVal;
    onUpdateDay(dayIndex, { ...day, m: nextMood });
  };

  return (
    <section className="mb-8 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gradient-to-b from-sky-400 to-rose-400 rounded-full" />
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Daily log</span>
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Rules check: tap once = ✓ followed, tap twice = ✗ broken, third tap clears. Dir.: B =
          buy, S = sell. A+ Set: tap once = Yes, tap again = No. P/L: loss is negative. Mood: tap
          the stars, 1 star = tilted, 5 stars = calm and focused.
        </p>
      </div>

      {/* 20 Days grouped in 4 weeks */}
      <div className="space-y-6">
        {[0, 1, 2, 3].map(weekIdx => (
          <div key={weekIdx} className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider pl-1">
              Week {weekIdx + 1}
            </h3>

            {[0, 1, 2, 3, 4].map(dayOffset => {
              const i = weekIdx * 5 + dayOffset;
              const day = month.d[i];
              const r = c.res[i];

              // Tone classes
              const isWin = r.has && r.tone > 0;
              const isLoss = r.has && r.tone < 0;
              const isFlag = r.hit;

              let cardBorderClass = 'border-slate-700/60';
              if (isFlag) {
                cardBorderClass = 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
              } else if (isWin) {
                cardBorderClass = 'border-emerald-500/70 bg-emerald-950/15 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
              } else if (isLoss) {
                cardBorderClass = 'border-rose-500/70 bg-rose-950/15';
              }

              // Counts
              const rulesY = day.r.filter(x => x === 1).length;
              const rulesN = day.r.filter(x => x === 2).length;
              const preY = (day.c || []).slice(0, PRE_CHECKLIST.length).filter(x => x === 1).length;
              const preN = (day.c || []).slice(0, PRE_CHECKLIST.length).filter(x => x === 2).length;

              // Net text
              const parts: string[] = [];
              if (r.any) parts.push(`${money(r.net)}  ·  ${money(r.bal)}`);
              if (r.anyp) parts.push(`${fp(r.pips)} pips`);
              const dailyTargetHit = num(month.dt) > 0 && r.any && r.net >= num(month.dt);
              const netText =
                (dailyTargetHit ? '🎯 ' : '') + (parts.length ? parts.join('  |  ') : '–');

              return (
                <div
                  key={i}
                  id={`card${i}`}
                  className={`glass-panel p-4 rounded-2xl border transition-all duration-300 space-y-3.5 neon-glow ${cardBorderClass}`}
                >
                  {/* Dream big quote */}
                  <div className="text-center text-xs font-semibold text-slate-400 italic">
                    Dream big, stay disciplined
                  </div>

                  {/* Emotion Control Button */}
                  <button
                    type="button"
                    onClick={() => toggleEmotion(i, day.ce)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 ${
                      day.ce === 1
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : day.ce === 2
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                        : 'border-dashed border-rose-400/50 text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{day.ce === 1 ? '✅' : day.ce === 2 ? '❌' : '⬜'}</span>
                    <span>Control your emotion</span>
                  </button>

                  {/* Day Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                    <b className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm">
                      {weekDays[i % 5]} · Day {i + 1}
                    </b>
                    <span
                      className={`text-xs font-extrabold tabular-nums ${
                        r.tone > 0
                          ? 'text-emerald-400'
                          : r.tone < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {netText}
                    </span>
                  </div>

                  {/* Collapsible Rules Check */}
                  <details className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs">
                    <summary className="font-semibold text-slate-200 cursor-pointer flex items-center justify-between select-none py-0.5">
                      <span>Rules check</span>
                      <b className="text-slate-400 font-bold">
                        {rulesY}✓ {rulesN}✗
                      </b>
                    </summary>
                    <div className="pt-2 space-y-1.5">
                      {RULES.map((ruleText, k) => {
                        const val = day.r[k];
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => toggleRule(i, k)}
                            className={`w-full py-2 px-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all ${
                              val === 1
                                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                                : val === 2
                                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                                : 'bg-slate-900 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>
                              {k + 1}. {ruleText}
                            </span>
                            <span className="font-bold">
                              {val === 1 ? '✓ Followed' : val === 2 ? '✗ Broken' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>

                  {/* Collapsible Pre-trade Checklist */}
                  <details className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs">
                    <summary className="font-semibold text-slate-200 cursor-pointer flex items-center justify-between select-none py-0.5">
                      <span>Pre-trade checklist</span>
                      <b className="text-slate-400 font-bold">
                        {preY}/{PRE_CHECKLIST.length}
                        {preN ? ` · ${preN}❌` : ''}
                        {preY === PRE_CHECKLIST.length ? ' ✓' : ''}
                      </b>
                    </summary>
                    <div className="pt-2 space-y-1.5">
                      {PRE_CHECKLIST.map((chkText, k) => {
                        const val = (day.c || [])[k];
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => togglePreCheck(i, k)}
                            className="w-full py-1.5 px-2 rounded-lg flex items-center gap-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 transition-all"
                          >
                            <span
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 font-bold text-xs ${
                                val === 1
                                  ? 'bg-emerald-500 border-emerald-400 text-white'
                                  : val === 2
                                  ? 'border-rose-400 text-rose-400 text-[10px]'
                                  : 'border-slate-600'
                              }`}
                            >
                              {val === 1 ? '✓' : val === 2 ? '❌' : ''}
                            </span>
                            <span>{chkText}</span>
                          </button>
                        );
                      })}
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold text-center">
                        Any empty box = no trade.
                      </div>
                    </div>
                  </details>

                  {/* Daily loss limit warning banner */}
                  {r.hit && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>Daily loss limit hit – stop trading for the day.</span>
                    </div>
                  )}

                  {/* 3 Trades */}
                  <div className="space-y-2.5">
                    {[0, 1, 2].map(tIdx => {
                      const trade = day.t[tIdx];
                      return (
                        <div
                          key={tIdx}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-2.5"
                        >
                          <div className="grid grid-cols-12 gap-2">
                            {/* Pair */}
                            <div className="col-span-6">
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] mr-1">
                                  Trade {tIdx + 1}
                                </span>
                                Pair
                              </label>
                              <input
                                type="text"
                                value={trade.p}
                                onChange={e =>
                                  updateTradeField(i, tIdx, 'p', e.target.value)
                                }
                                placeholder="e.g. XAUUSD"
                                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                              />
                            </div>

                            {/* Direction */}
                            <div className="col-span-3">
                              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                Dir.
                              </label>
                              <select
                                value={trade.d}
                                onChange={e =>
                                  updateTradeField(i, tIdx, 'd', e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                              >
                                <option value=""></option>
                                <option value="B">B</option>
                                <option value="S">S</option>
                              </select>
                            </div>

                            {/* A+ Set */}
                            <div className="col-span-3">
                              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                A+ Set
                              </label>
                              <button
                                type="button"
                                onClick={() => toggleAPlus(i, tIdx)}
                                className={`w-full py-1.5 px-1 rounded-lg text-xs font-bold border transition-all ${
                                  trade.ap === 'Yes'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : trade.ap === 'No'
                                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                    : 'bg-slate-950 border-slate-700 text-slate-400'
                                }`}
                              >
                                {trade.ap || '–'}
                              </button>
                            </div>
                          </div>

                          {/* P/L & Pips */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                P/L ($)
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                value={trade.pl}
                                onChange={e =>
                                  updateTradeField(i, tIdx, 'pl', e.target.value)
                                }
                                placeholder="e.g. 45 or -20"
                                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                Pips (+/-)
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                value={trade.pp}
                                onChange={e =>
                                  updateTradeField(i, tIdx, 'pp', e.target.value)
                                }
                                placeholder="e.g. 25 or -12"
                                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Day Reflection: Mistake & Focus */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Biggest mistake today
                      </label>
                      <input
                        type="text"
                        value={day.mk || ''}
                        onChange={e =>
                          onUpdateDay(i, { ...day, mk: e.target.value })
                        }
                        placeholder="Write your biggest mistake"
                        className="w-full px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Next day focus
                      </label>
                      <input
                        type="text"
                        value={day.nf || ''}
                        onChange={e =>
                          onUpdateDay(i, { ...day, nf: e.target.value })
                        }
                        placeholder="What will you focus on tomorrow?"
                        className="w-full px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Mood & Notes Row */}
                  <div className="grid grid-cols-12 gap-2 pt-1 items-end">
                    <div className="col-span-5">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Mood
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(starNum => {
                          const currentStar = +day.m || 0;
                          return (
                            <button
                              key={starNum}
                              type="button"
                              onClick={() => setMood(i, String(starNum))}
                              className={`text-xl transition-all leading-none ${
                                starNum <= currentStar
                                  ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                                  : 'text-slate-700 hover:text-slate-500'
                              }`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-7">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={day.n || ''}
                        onChange={e =>
                          onUpdateDay(i, { ...day, n: e.target.value })
                        }
                        placeholder="Quick notes..."
                        className="w-full px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Clear this month button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleClearClick}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
            clearArmed
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'glass-panel text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{clearArmed ? 'Tap again to clear this month' : 'Clear this month'}</span>
        </button>
      </div>
    </section>
  );
};
