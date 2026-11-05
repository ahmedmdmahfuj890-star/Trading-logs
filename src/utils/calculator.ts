import { MonthData, CalcSummary, DayCalcResult, WeekCalcResult } from '../types/journal';
import { num } from './storage';

export function calculateMonthSummary(month: MonthData): CalcSummary {
  const start = num(month.s) || 0;
  const lim = ((num(month.l) || 0) / 100) * start;
  let bal = start;
  let peak = start;
  let mdd = 0;
  let mddp = 0;

  let tr = 0;
  let w = 0;
  let l = 0;
  let gp = 0;
  let gl = 0;
  let wd = 0;
  let ld = 0;
  let pw = 0;
  let pls = 0;
  let tp = 0;
  let y = 0;
  let yn = 0;

  const res: DayCalcResult[] = [];
  const wk: WeekCalcResult[] = [0, 1, 2, 3].map(() => ({ t: 0, w: 0, n: 0, p: 0 }));

  month.d.forEach((day, i) => {
    let dayNet = 0;
    let anyTradeDollars = false;
    let dayPips = 0;
    let anyTradePips = false;
    const weekIdx = Math.floor(i / 5);

    day.t.forEach(t => {
      const v = num(t.pl);
      const p = num(t.pp);
      const hasValue = !isNaN(v);
      const hasPips = !isNaN(p);

      if (!hasValue && !hasPips) return;

      tr++;
      wk[weekIdx].t++;
      const outcome = hasValue ? v : p;
      if (outcome > 0) {
        w++;
        wk[weekIdx].w++;
      } else if (outcome < 0) {
        l++;
      }

      if (hasValue) {
        anyTradeDollars = true;
        dayNet += v;
        if (v > 0) {
          gp += v;
          wd++;
        } else if (v < 0) {
          gl += v;
          ld++;
        }
      }

      if (hasPips) {
        anyTradePips = true;
        dayPips += p;
        tp += p;
        if (p > 0) pw += p;
        else if (p < 0) pls += p;
        wk[weekIdx].p += p;
      }
    });

    day.r.forEach(r => {
      if (r) {
        yn++;
        if (r === 1) y++;
      }
    });

    if (anyTradeDollars) {
      bal += dayNet;
      wk[weekIdx].n += dayNet;
      if (bal > peak) peak = bal;
      const dd = peak - bal;
      if (dd > mdd) mdd = dd;
      if (peak > 0 && dd / peak > mddp) mddp = dd / peak;
    }

    const hitLossLimit = anyTradeDollars && lim > 0 && dayNet <= -lim;
    const hasData = anyTradeDollars || anyTradePips;
    const tone = anyTradeDollars ? dayNet : anyTradePips ? dayPips : 0;

    res.push({
      any: anyTradeDollars,
      net: dayNet,
      bal,
      hit: hitLossLimit,
      anyp: anyTradePips,
      pips: dayPips,
      has: hasData,
      tone
    });
  });

  return {
    start,
    bal,
    tr,
    w,
    l,
    gp,
    gl,
    wd,
    ld,
    tp,
    pw,
    pls,
    mdd,
    mddp,
    disc: yn ? y / yn : NaN,
    res,
    wk
  };
}

export function calculateProfitDays(month: MonthData) {
  let bal = num(month.s) || 0;
  let count = 0;
  let totalTradedDays = 0;

  month.d.forEach(day => {
    let sum = 0;
    let any = false;
    day.t.forEach(t => {
      const v = num(t.pl);
      if (!isNaN(v)) {
        sum += v;
        any = true;
      }
    });
    if (any) {
      totalTradedDays++;
      if (sum > 0 && sum >= bal * 0.005) {
        count++;
      }
    }
    bal += sum;
  });

  return { count, totalTradedDays };
}
