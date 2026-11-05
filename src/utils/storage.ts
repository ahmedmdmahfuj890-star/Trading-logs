import { AppState, MonthData, DayLog, Trade } from '../types/journal';

export const KEY = 'mh-trading-log-v2';
export const OLD_KEY = 'mh-trading-log-v1';

export const RULES = [
  'Follow your trading plan',
  'Maximum 3 trades per day',
  'Daily max risk 2%',
  'Stop overtrading',
  'No revenge trading',
  'Focus on discipline, not on profit.'
];

export const PRE_CHECKLIST = [
  'Higher-timeframe trend checked',
  'Key support / resistance marked',
  'Setup matches my plan',
  'Stop loss set before entry'
];

export const INSTRUMENT_PIP_VALUES: Record<string, number> = {
  eurusd: 10,
  gbpusd: 10,
  audusd: 10,
  nzdusd: 10,
  xauusd: 10,
  usdjpy: 6.5,
  gbpjpy: 6.5,
  eurjpy: 6.5,
  usdcad: 7.4,
  usdchf: 11,
  btcusd: 1,
  us30: 1,
  nas100: 1
};

export function createBlankTrade(): Trade {
  return { p: '', d: '', ap: '', pl: '', pp: '' };
}

export function createBlankDay(): DayLog {
  return {
    r: [0, 0, 0, 0, 0, 0],
    c: [0, 0, 0, 0],
    ce: 0,
    t: [createBlankTrade(), createBlankTrade(), createBlankTrade()],
    m: '',
    mk: '',
    nf: '',
    n: ''
  };
}

export function createBlankMonth(name = 'Month 1', startingBalance: number | string = 1000): MonthData {
  const d: DayLog[] = [];
  for (let i = 0; i < 20; i++) {
    d.push(createBlankDay());
  }
  return {
    s: startingBalance,
    l: 2,
    dt: '',
    mt: '',
    nm: name,
    wm: ['', '', '', ''],
    lot: {
      t: 3,
      s: 20,
      i: 'eurusd',
      p: 10,
      n: '',
      m: 'medium',
      a: 'live',
      ph: '1',
      o: '10',
      pt: '2',
      dc: '7'
    },
    snap: {},
    d
  };
}

export function cleanMonth(m: any, index: number): MonthData {
  const b = createBlankMonth(`Month ${index + 1}`);
  if (!m || typeof m !== 'object') return b;

  b.s = m.s != null ? m.s : b.s;
  b.l = m.l != null ? m.l : b.l;
  b.dt = m.dt != null ? m.dt : b.dt;
  b.mt = m.mt != null ? m.mt : b.mt;
  b.nm = String(m.nm || `Month ${index + 1}`);
  b.wm = Array.isArray(m.wm) && m.wm.length >= 4 ? m.wm : ['', '', '', ''];
  b.lot = m.lot && typeof m.lot === 'object' ? { ...b.lot, ...m.lot } : b.lot;
  b.snap = m.snap && typeof m.snap === 'object' ? m.snap : {};

  if (Array.isArray(m.d)) {
    b.d = b.d.map((defaultDay, j) => {
      const src = m.d[j] && typeof m.d[j] === 'object' ? m.d[j] : {};
      const day: DayLog = { ...defaultDay };

      if (Array.isArray(src.r)) {
        day.r = day.r.map((_, k) => {
          const v = Number(src.r[k]);
          return v === 1 || v === 2 ? v : 0;
        });
      }

      if (Array.isArray(src.c)) {
        day.c = [0, 1, 2, 3].map(k => {
          const v = Number(src.c[k]);
          return v === 1 || v === 2 ? v : 0;
        });
      } else {
        day.c = [0, 0, 0, 0];
      }

      day.ce = src.ce === 1 || src.ce === 2 ? src.ce : 0;
      day.m = src.m != null ? String(src.m) : '';
      day.mk = src.mk != null ? String(src.mk) : '';
      day.nf = src.nf != null ? String(src.nf) : '';
      day.n = src.n != null ? String(src.n) : '';

      if (Array.isArray(src.t)) {
        day.t = [0, 1, 2].map(k => {
          const t = src.t[k] || {};
          return {
            p: t.p != null ? String(t.p) : '',
            d: t.d === 'B' || t.d === 'S' ? t.d : '',
            ap: t.ap === 'Yes' || t.ap === 'No' ? t.ap : '',
            pl: t.pl != null ? String(t.pl) : '',
            pp: t.pp != null ? String(t.pp) : ''
          };
        }) as [Trade, Trade, Trade];
      }

      return day;
    });
  }

  return b;
}

export function cleanState(raw: any): AppState {
  if (!raw || !Array.isArray(raw.m) || raw.m.length === 0) {
    throw new Error('Invalid state');
  }
  const months = raw.m.map((m: any, i: number) => cleanMonth(m, i));
  const activeIdx = Number.isInteger(+raw.c) && +raw.c >= 0 && +raw.c < months.length ? +raw.c : 0;
  return {
    c: activeIdx,
    m: months
  };
}

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return cleanState(parsed);
      } catch (e) {
        console.error('Failed to parse state v2', e);
      }
    }

    const oldRaw = localStorage.getItem(OLD_KEY);
    if (oldRaw) {
      try {
        const parsedOld = JSON.parse(oldRaw);
        if (parsedOld && Array.isArray(parsedOld.d) && parsedOld.d.length === 20) {
          parsedOld.nm = 'Month 1';
          return cleanState({ c: 0, m: [parsedOld] });
        }
      } catch (e) {
        console.error('Failed to parse state v1', e);
      }
    }
  } catch (e) {
    console.error('Storage access error', e);
  }

  return {
    c: 0,
    m: [createBlankMonth('Month 1', 1000)]
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function num(v: string | number | undefined | null): number {
  if (v === '' || v === null || v === undefined) return NaN;
  const x = parseFloat(String(v));
  return isNaN(x) ? NaN : x;
}

export function money(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  return (x < 0 ? '-' : '') + '$' + Math.abs(x).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function moneyNoSign(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  return Math.abs(x).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function fp(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '0';
  return (x > 0 ? '+' : '') + (Math.round(x * 10) / 10);
}

export function pct(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  return (x * 100).toFixed(1) + '%';
}

export function amt(x: number): string {
  const a = Math.abs(x);
  const s = x > 0 ? '+' : x < 0 ? '-' : '';
  return s + '$' + (a >= 1000 ? (a / 1000).toFixed(1) + 'k' : a.toFixed(a % 1 ? 2 : 0));
}
