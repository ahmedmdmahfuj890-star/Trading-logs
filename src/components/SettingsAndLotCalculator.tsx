import React, { useState, useEffect } from 'react';
import { MonthData, LotConfig } from '../types/journal';
import { num, money, INSTRUMENT_PIP_VALUES } from '../utils/storage';
import { calculateProfitDays } from '../utils/calculator';
import { Calculator, Target, ShieldAlert, DollarSign } from 'lucide-react';

interface SettingsProps {
  month: MonthData;
  onChange: (updatedMonth: MonthData) => void;
}

export const SettingsAndLotCalculator: React.FC<SettingsProps> = ({ month, onChange }) => {
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggleMenu = (key: string) => setOpenMenu(prev => (prev === key ? null : key));

  // Lot config state with safe defaults
  const lot: LotConfig = {
    t: month.lot?.t ?? 3,
    s: month.lot?.s ?? 20,
    i: month.lot?.i ?? 'eurusd',
    p: month.lot?.p ?? 10,
    n: month.lot?.n ?? '',
    m: (month.lot?.m as 'safe' | 'medium' | 'high') ?? 'medium',
    a: (month.lot?.a as 'live' | 'prop') ?? 'live',
    ph: (month.lot?.ph as '1' | '2' | 'live') ?? '1',
    o: month.lot?.o ?? '10',
    pt: (month.lot?.pt as '1' | '2' | 'i') ?? '2',
    dc: (month.lot?.dc as '7' | '5' | '4') ?? '7',
    dp: (month.lot?.dp as '0.25' | '0.5') ?? '0.5'
  };

  const startingBalanceNum = num(month.s) || 0;
  const maxLossPercentNum = num(month.l);
  const maxLossDollar = !isNaN(maxLossPercentNum) && startingBalanceNum > 0
    ? (startingBalanceNum * maxLossPercentNum) / 100
    : 0;

  // Shorthand e.g. "= 10k"
  const startK = startingBalanceNum >= 1000
    ? `= ${(startingBalanceNum / 1000).toFixed(1)}k`
    : '';

  const updateField = (field: keyof MonthData, value: any) => {
    onChange({
      ...month,
      [field]: value
    });
  };

  const updateLot = (patch: Partial<LotConfig>) => {
    const updatedLot: LotConfig = { ...lot, ...patch };
    onChange({
      ...month,
      lot: updatedLot
    });
  };

  // Synchronize Max Daily Loss ($) changes
  const handleMaxDollarChange = (valStr: string) => {
    const val = num(valStr);
    if (isNaN(val) || startingBalanceNum <= 0) {
      updateField('l', '');
    } else {
      const calcPct = +((val / startingBalanceNum) * 100).toFixed(2);
      updateField('l', String(calcPct));
    }
  };

  // Instrument change handler
  const handleInstrumentChange = (inst: string) => {
    const defaultPip = INSTRUMENT_PIP_VALUES[inst] ?? 10;
    updateLot({
      i: inst,
      p: defaultPip
    });
  };

  // Modes definitions
  const RISK_MODES = {
    safe: { factor: 1 / 3, label: 'Safe' },
    medium: { factor: 2 / 3, label: 'Medium Risk' },
    high: { factor: 1, label: 'High Risk' }
  };

  // Prop firm calculation helpers
  const allowedPcts = lot.pt === '2' ? [10, 8, 6] : [10, 9, 8, 7, 6];

  const dailyNow = () => {
    const b = (num(month.s) || 10000) / 10000;
    const pc = Number(lot.o || 10);
    const base = lot.ph === '1' ? pc * 10 : 60 - (pc - 8) * 5;
    return Math.round(base * b * 100) / 100;
  };

  const applyPropSettings = (newOpt = lot.o, newPh = lot.ph, newPt = lot.pt) => {
    const b = num(month.s);
    if (!(b > 0)) return;

    if (newPh === 'live') {
      const T = Math.round(b * 0.05 * 100) / 100;
      const d = Math.round((T / 20) * 100) / 100;
      const lossPct = String(+((d / b) * 100).toFixed(2));
      onChange({
        ...month,
        mt: String(T),
        dt: String(d),
        l: lossPct,
        lot: { ...lot, o: newOpt, ph: newPh, pt: newPt }
      });
      return;
    }

    const T = Math.round((b * Number(newOpt)) / 100 * 100) / 100;
    const d = dailyNow();
    const lossPct = String(+((d / b) * 100).toFixed(2));
    onChange({
      ...month,
      mt: String(T),
      dt: String(d),
      l: lossPct,
      lot: { ...lot, o: newOpt, ph: newPh, pt: newPt }
    });
  };

  const handleAccountTypeSwitch = (type: 'live' | 'prop') => {
    if (type === lot.a) return;
    // Save snapshot of current
    const currentSnap = month.snap || {};
    const updatedSnap = {
      ...currentSnap,
      [lot.a]: {
        s: String(month.s || ''),
        dt: String(month.dt || ''),
        mt: String(month.mt || ''),
        l: String(month.l || '')
      }
    };

    if (type === 'live') {
      const liveSnap = updatedSnap.live;
      if (liveSnap) {
        onChange({
          ...month,
          s: liveSnap.s,
          dt: liveSnap.dt,
          mt: liveSnap.mt,
          l: liveSnap.l,
          snap: updatedSnap,
          lot: { ...lot, a: 'live' }
        });
      } else {
        onChange({
          ...month,
          snap: updatedSnap,
          lot: { ...lot, a: 'live' }
        });
      }
    } else {
      const propSnap = updatedSnap.prop;
      if (propSnap) {
        onChange({
          ...month,
          s: propSnap.s,
          dt: propSnap.dt,
          mt: propSnap.mt,
          l: propSnap.l,
          snap: updatedSnap,
          lot: { ...lot, a: 'prop' }
        });
      } else {
        const defaultPropBalance = '10000';
        const b = 10000;
        const T = Math.round((b * Number(lot.o || 10)) / 100 * 100) / 100;
        const d = 100;
        const lossPct = String(+((d / b) * 100).toFixed(2));
        onChange({
          ...month,
          s: defaultPropBalance,
          mt: String(T),
          dt: String(d),
          l: lossPct,
          snap: updatedSnap,
          lot: { ...lot, a: 'prop' }
        });
      }
    }
  };

  // Lot size computation
  const tCount = num(lot.t);
  const slPips = num(lot.s);
  const pvVal = num(lot.p);
  const modeParam = RISK_MODES[lot.m] || RISK_MODES.medium;

  const dayCap = maxLossDollar > 0
    ? maxLossDollar
    : startingBalanceNum > 0 && !isNaN(maxLossPercentNum)
    ? (startingBalanceNum * maxLossPercentNum) / 100
    : 0;

  const totalDailyRisk = dayCap * modeParam.factor;
  const riskPerTrade = tCount > 0 ? totalDailyRisk / tCount : 0;
  const rawLot = (slPips > 0 && pvVal > 0) ? riskPerTrade / (slPips * pvVal) : 0;
  const calcLot = Math.floor(rawLot * 100 + 1e-9) / 100;
  const lotToUse = calcLot >= 0.01 ? calcLot : 0.01;
  const actualTradeRisk = lotToUse * slPips * pvVal;

  const isCalcValid = startingBalanceNum > 0 && tCount > 0 && dayCap > 0 && slPips > 0 && pvVal > 0;

  // Prop firm info box calculations
  const totalTargetNum = num(month.mt);
  const profitDaysData = calculateProfitDays(month);

  return (
    <section className="mb-6 space-y-4">
      {/* Account Balance & Target Card */}
      <div className="glass-panel p-4 space-y-3.5 neon-glow">
        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            ব্যালেন্স ও রিস্ক ম্যানেজমেন্ট
          </h3>
        </div>

        <div className="space-y-3">
          {/* Starting balance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Starting balance ($)
              </label>
              {startK && (
                <span className="text-xs font-bold text-emerald-400">{startK}</span>
              )}
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={month.s ?? ''}
              onChange={e => {
                const val = e.target.value;
                updateField('s', val);
              }}
              placeholder="e.g. 1000 or 10000"
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            />
          </div>

          {/* Daily loss row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Max daily loss (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={month.l ?? ''}
                onChange={e => updateField('l', e.target.value)}
                placeholder="e.g. 2.0"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Max daily loss ($)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={maxLossDollar > 0 ? maxLossDollar.toFixed(2) : ''}
                onChange={e => handleMaxDollarChange(e.target.value)}
                placeholder="e.g. 20.00"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
              />
            </div>
          </div>

          {/* Profit targets row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Daily profit target ($)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={month.dt ?? ''}
                onChange={e => updateField('dt', e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
              />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Total profit target ($)
                </label>
                {lot.a === 'prop' && (
                  <span className="text-[11px] font-bold text-emerald-400">
                    {lot.ph === 'live' ? '= 5%' : `= ${lot.o}%`}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={month.mt ?? ''}
                  onFocus={() => {
                    if (lot.a === 'prop' && lot.ph !== 'live') setShowTargetPicker(true);
                  }}
                  onChange={e => {
                    updateField('mt', e.target.value);
                  }}
                  placeholder="e.g. 400"
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
                />

                {/* Target percentage pick popover for Prop Firm */}
                {showTargetPicker && lot.a === 'prop' && lot.ph !== 'live' && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 z-30 grid grid-cols-2 gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                    {allowedPcts.map(pctVal => {
                      const dollarAmt = Math.round((startingBalanceNum * pctVal) / 100);
                      return (
                        <button
                          key={pctVal}
                          type="button"
                          onClick={() => {
                            updateLot({ o: String(pctVal) });
                            applyPropSettings(String(pctVal));
                            setShowTargetPicker(false);
                          }}
                          className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                            lot.o === String(pctVal)
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent'
                              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {pctVal}% · ${dollarAmt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lot Size Calculator */}
      <div className="glass-panel p-4 space-y-4 neon-glow">
        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            🧮 Lot Size Calculator
          </h3>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Trades per day
            </label>
            <input
              type="number"
              inputMode="numeric"
              step="1"
              value={lot.t ?? ''}
              onChange={e => updateLot({ t: e.target.value })}
              placeholder="3"
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Stop loss (pips)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={lot.s ?? ''}
              onChange={e => updateLot({ s: e.target.value })}
              placeholder="20"
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            />
          </div>

          <div className={lot.i === 'custom' ? 'col-span-1' : 'col-span-2'}>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Instrument
            </label>
            <select
              value={lot.i}
              onChange={e => handleInstrumentChange(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            >
              <option value="eurusd">EURUSD</option>
              <option value="gbpusd">GBPUSD</option>
              <option value="xauusd">XAUUSD (Gold)</option>
              <option value="usdjpy">USDJPY</option>
              <option value="gbpjpy">GBPJPY</option>
              <option value="eurjpy">EURJPY</option>
              <option value="audusd">AUDUSD</option>
              <option value="nzdusd">NZDUSD</option>
              <option value="usdcad">USDCAD</option>
              <option value="usdchf">USDCHF</option>
              <option value="btcusd">BTCUSD</option>
              <option value="us30">US30</option>
              <option value="nas100">NAS100</option>
              <option value="custom">Other (custom)</option>
            </select>
          </div>

          {lot.i === 'custom' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Instrument name
              </label>
              <input
                type="text"
                value={lot.n ?? ''}
                onChange={e => updateLot({ n: e.target.value })}
                placeholder="e.g. NAS100"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Pip value per 1.00 lot ($) — broker অনুযায়ী দিন
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={lot.p ?? ''}
              onChange={e => updateLot({ p: e.target.value })}
              placeholder="যেমন 10"
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100"
            />
          </div>
        </div>

        {/* Live Capital vs Prop Firm Mode */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => toggleMenu('account')}
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>{lot.a === 'prop' ? 'Prop Firm' : 'Live Capital'}</span>
            <span className={`transition-transform text-xs ${openMenu === 'account' ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {openMenu === 'account' && (
            <div className="grid grid-cols-2 gap-2 p-2 mt-1.5 rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
              <button
                type="button"
                onClick={() => { handleAccountTypeSwitch('live'); setOpenMenu(null); }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  lot.a === 'live'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                }`}
              >
                Live Capital
              </button>
              <button
                type="button"
                onClick={() => { handleAccountTypeSwitch('prop'); setOpenMenu(null); }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  lot.a === 'prop'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                }`}
              >
                Prop Firm
              </button>
            </div>
          )}
        </div>

        {/* Prop Firm Sub-options */}
        {lot.a === 'prop' && (
          <div className="space-y-2 pt-0.5">
            {/* 1-Step, 2-Step, Instant Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('challenge')}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>{lot.pt === '1' ? '1-Step' : lot.pt === '2' ? '2-Step' : 'Instant'}</span>
                <span className={`transition-transform text-xs ${openMenu === 'challenge' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openMenu === 'challenge' && (
                <div className="grid grid-cols-3 gap-2 p-2 mt-1.5 rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
                  {[
                    { key: '1', label: '1-Step' },
                    { key: '2', label: '2-Step' },
                    { key: 'i', label: 'Instant' }
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        const nextPh = item.key === 'i' ? 'live' : '1';
                        updateLot({ pt: item.key as any, ph: nextPh });
                        applyPropSettings(lot.o, nextPh, item.key as any);
                        setOpenMenu(null);
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                        lot.pt === item.key
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                          : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phases Dropdown */}
            {lot.pt !== 'i' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu('phase')}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <span>{lot.ph === '1' ? 'Phase 1' : lot.ph === '2' ? 'Phase 2' : 'Prop Live'}</span>
                  <span className={`transition-transform text-xs ${openMenu === 'phase' ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {openMenu === 'phase' && (
                  <div className="grid grid-cols-3 gap-2 p-2 mt-1.5 rounded-xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
                    {[
                      { key: '1', label: 'Phase 1' },
                      ...(lot.pt === '2' ? [{ key: '2', label: 'Phase 2' }] : []),
                      { key: 'live', label: 'Prop Live' }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          updateLot({ ph: item.key as any });
                          applyPropSettings(lot.o, item.key as any, lot.pt);
                          setOpenMenu(null);
                        }}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                          lot.ph === item.key
                            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instant Profitable Days Requirement */}
            {lot.pt === 'i' && (
              <div className="space-y-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu('rate')}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <span>{lot.dp === '0.25' ? '০.২৫%' : '০.৫%'}</span>
                    <span className={`transition-transform text-xs ${openMenu === 'rate' ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {openMenu === 'rate' && (
                    <div className="grid grid-cols-2 gap-2 p-2 mt-1.5 rounded-xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
                      {[
                        { key: '0.25', label: '০.২৫%' },
                        { key: '0.5', label: '০.৫%' }
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            updateLot({ dp: opt.key as any });
                            setOpenMenu(null);
                          }}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                            (lot.dp || '0.5') === opt.key
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                              : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu('days')}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <span>{lot.dc} দিন</span>
                    <span className={`transition-transform text-xs ${openMenu === 'days' ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {openMenu === 'days' && (
                    <div className="grid grid-cols-3 gap-2 p-2 mt-1.5 rounded-xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
                      {['7', '5', '4'].map(dayCount => (
                        <button
                          key={dayCount}
                          type="button"
                          onClick={() => {
                            updateLot({ dc: dayCount as any });
                            setOpenMenu(null);
                          }}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                            lot.dc === dayCount
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                              : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                          }`}
                        >
                          {dayCount} দিন
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Risk Profile Selection: Safe / Medium / High */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('risk')}
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/30 border border-white/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>{RISK_MODES[lot.m].label}</span>
            <span className={`transition-transform text-xs ${openMenu === 'risk' ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {openMenu === 'risk' && (
            <div className="grid grid-cols-3 gap-2 p-2 mt-1.5 rounded-xl bg-slate-950/95 border border-sky-500/40 shadow-2xl animate-fadeIn">
              {(['safe', 'medium', 'high'] as const).map(rk => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => {
                    updateLot({ m: rk });
                    setOpenMenu(null);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    lot.m === rk
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-white/30 shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/40'
                      : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40'
                  }`}
                >
                  {RISK_MODES[rk].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prop Firm Projection & Status Box */}
        {lot.a === 'prop' && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1.5 text-xs">
            {totalTargetNum > 0 ? (
              <>
                {lot.ph === 'live' ? (
                  <>
                    <div className="text-slate-200">
                      <b>{lot.pt === 'i' ? 'Instant' : 'Prop Live'}</b> · Monthly target{' '}
                      <b className="text-emerald-400">${money(totalTargetNum)}</b> (5% of balance)
                    </div>
                    <div className="text-slate-300">
                      Daily target{' '}
                      <b>
                        $
                        {money(
                          lot.pt === 'i'
                            ? startingBalanceNum > 0
                              ? Math.round(startingBalanceNum * (lot.dp === '0.25' ? 0.0025 : 0.005) * 100) / 100
                              : num(month.dt) || (lot.dp === '0.25' ? 25 : 50)
                            : totalTargetNum / 20
                        )}
                      </b>{' '}
                      {lot.pt === 'i' ? `(ব্যালেন্সের ${lot.dp === '0.25' ? '০.২৫%' : '০.৫%'} · ${lot.dc} দিনে)` : '(20 দিনে)'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      To keep the funded account safe, do not trade beyond the target and do not raise the daily loss limit.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-200">
                      <b>{lot.ph === '2' ? 'Phase 2' : 'Phase 1'}</b> · Target{' '}
                      <b className="text-emerald-400">${money(totalTargetNum)}</b>
                    </div>
                    {dailyNow() > 0 && (
                      <div className="text-slate-300">
                        Daily target <b>${money(dailyNow())}</b> → about{' '}
                        <b className="text-sky-400">{Math.ceil(totalTargetNum / dailyNow())} days</b> to hit target
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">
                      Once the daily target is hit, stop trading for the day. Prop firms often require a minimum number of trading days.
                    </div>
                  </>
                )}

                {lot.pt === 'i' && (
                  <div className="text-slate-300 pt-1 border-t border-slate-800 text-[11.5px]">
                    লাভের দিন: <b className="text-emerald-400">{profitDaysData.count} / {lot.dc}</b>{' '}
                    (দিনের ব্যালেন্সের {lot.dp === '0.25' ? '০.২৫%' : '০.৫%'} লাভ হলে দিন গোনা হবে) ·{' '}
                    {profitDaysData.count >= Number(lot.dc)
                      ? '🎯 টার্গেট পূর্ণ হয়েছে'
                      : `আর ${Number(lot.dc) - profitDaysData.count} দিন বাকি`}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400">
                Enter a total profit target to see how many days it will take.
              </div>
            )}
          </div>
        )}

        {/* Lot Size Calculation Output Box */}
        {isCalcValid ? (
          <div className="space-y-3 pt-1">
            <div className="text-center bg-slate-900/90 border border-slate-700/70 rounded-2xl p-4 shadow-inner">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lot size per trade
              </span>
              <b className="block text-4xl sm:text-5xl font-extrabold text-transparent bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text leading-none py-1">
                {lotToUse.toFixed(2)}
              </b>
              <span className="text-xs font-semibold text-slate-400 mt-1 block">
                {tCount} trades, each
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed px-1">
              <div>
                {modeParam.label} mode ({Math.round(modeParam.factor * 100)}% of Max daily loss):
                total daily risk <b className="text-white">{money(totalDailyRisk)}</b> → risk per trade{' '}
                <b className="text-white">{money(riskPerTrade)}</b>
              </div>

              <div>
                Max daily loss: <b className="text-rose-400">{money(dayCap)}</b>
              </div>

              <div>
                {slPips} pips stop loss, one trade loses about{' '}
                <b className="text-rose-400">{money(actualTradeRisk)}</b>. 1:2 target ({slPips * 2}{' '}
                pips) profit about <b className="text-emerald-400">{money(actualTradeRisk * 2)}</b>।
              </div>

              {calcLot < 0.01 && (
                <div className="text-amber-400 font-bold bg-amber-950/40 p-2.5 rounded-xl border border-amber-600/40 text-[11px]">
                  ⚠ At this amount the calculated lot is below 0.01. Taking the minimum 0.01 makes the
                  risk {money(0.01 * slPips * pvVal)} which is more than your set {money(riskPerTrade)}.
                  Take fewer trades, use a smaller stop loss, or increase the amount.
                </div>
              )}
            </div>

            {/* Quick table */}
            <div className="border border-slate-700/60 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800/80 text-slate-400 text-[11px] font-bold">
                  <tr>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3 text-right">Risk/trade</th>
                    <th className="py-2 px-3 text-right">Lot/trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="font-extrabold bg-slate-900/60 text-sky-400">
                    <td className="py-2 px-3">{money(startingBalanceNum)} ← yours</td>
                    <td className="py-2 px-3 text-right">{money(riskPerTrade)}</td>
                    <td className="py-2 px-3 text-right">
                      {calcLot >= 0.01 ? calcLot.toFixed(2) : '<0.01'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
            Lot size দেখতে Starting balance, trades, stop loss এবং সঠিক Pip value দিন। Custom instrument
            হলে Pip value নিজে লিখুন।
          </div>
        )}

        {/* Bengali footnotes */}
        <div className="space-y-1.5 pt-1 text-[11px] text-slate-400 leading-normal">
          <p>
            এটি শুধু আনুমানিক হিসাব, ট্রেডিং পরামর্শ নয়। Pip value ব্রোকার, contract size, account
            currency ও instrument অনুযায়ী বদলায়। আগে আপনার ব্রোকারের হিসাব দেখে Pip value ঘরে সঠিক
            মান দিন। Gold-এর ক্ষেত্রে এখানে 1 pip = 0.10 price move ধরে নেওয়া হয়েছে।
          </p>
          <p>
            Prop Firm-এর Phase target, daily target, Instant preset (ব্যালেন্সের ০.৫%) এবং ০.৫%
            profitable-day rule শুধু উদাহরণভিত্তিক preset—প্রতিটি firm-এর নিয়ম আলাদা। নিজের firm's
            dashboard/rulebook-এর সঙ্গে মিলিয়ে নিন।
          </p>
        </div>
      </div>
    </section>
  );
};
