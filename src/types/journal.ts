export interface Trade {
  p: string; // pair (e.g. XAUUSD)
  d: string; // direction ('B' | 'S' | '')
  ap: string; // A+ set ('Yes' | 'No' | '')
  pl: string; // P/L dollar amount (e.g. '45.50' or '-20')
  pp: string; // Pips (+/-) (e.g. '25' or '-15')
}

export interface DayLog {
  r: number[]; // 6 rules check: 0 = unselected, 1 = followed (✓), 2 = broken (✗)
  c?: number[]; // 4 pre-trade checks: 0 = unselected, 1 = checked (✓), 2 = not checked (❌)
  ce?: number;  // Control emotion: 0 = unselected (⬜), 1 = controlled (✅), 2 = not controlled (❌)
  t: [Trade, Trade, Trade]; // 3 trades per day
  m: string; // Mood: 1 to 5 (or empty)
  mk?: string; // Biggest mistake today
  nf?: string; // Next day focus tomorrow
  n: string; // Notes
}

export interface LotConfig {
  t: number | string; // trades per day
  s: number | string; // stop loss pips
  i: string; // instrument ('eurusd', 'xauusd', etc.)
  p: number | string; // pip value per 1 lot
  n?: string; // custom instrument name
  m: 'safe' | 'medium' | 'high'; // risk mode
  a: 'live' | 'prop'; // account type
  ph: '1' | '2' | 'live'; // prop phase
  o: string; // target percent '10', '9', '8', '7', '6'
  pt: '1' | '2' | 'i'; // prop firm type: 1-Step, 2-Step, Instant
  dc: '7' | '5' | '4'; // profitable days target count
}

export interface MonthData {
  nm: string; // Month name, e.g. "Month 1"
  s: number | string; // Starting balance ($)
  l: number | string; // Max daily loss (%)
  dt: number | string; // Daily profit target ($)
  mt: number | string; // Total profit target ($)
  wm?: string[]; // Week 1 to 4 biggest mistakes
  lot?: Partial<LotConfig>;
  snap?: Record<string, { s: string; dt: string; mt: string; l: string }>;
  d: DayLog[]; // 20 days
}

export interface AppState {
  c: number; // active month index
  m: MonthData[]; // months
}

export interface DayCalcResult {
  any: boolean;
  net: number;
  bal: number;
  hit: boolean;
  anyp: boolean;
  pips: number;
  has: boolean;
  tone: number;
}

export interface WeekCalcResult {
  t: number;
  w: number;
  n: number;
  p: number;
}

export interface CalcSummary {
  start: number;
  bal: number;
  tr: number;
  w: number;
  l: number;
  gp: number;
  gl: number;
  wd: number;
  ld: number;
  tp: number;
  pw: number;
  pls: number;
  mdd: number;
  mddp: number;
  disc: number;
  res: DayCalcResult[];
  wk: WeekCalcResult[];
}
