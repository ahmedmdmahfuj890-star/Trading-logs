export interface ForexSession {
  n: string; // Name (e.g. Sydney)
  tz: string; // Timezone string
  h: number; // Opening hour in local time (e.g. 7:00)
  c: string; // Theme color
}

export const FOREX_SESSIONS: ForexSession[] = [
  { n: 'Sydney', tz: 'Australia/Sydney', h: 7, c: '#0ea5e9' },
  { n: 'Tokyo', tz: 'Asia/Tokyo', h: 9, c: '#06b6d4' },
  { n: 'London', tz: 'Europe/London', h: 8, c: '#6366f1' },
  { n: 'New York', tz: 'America/New_York', h: 8, c: '#ec4899' }
];

export const SESSION_DURATION_MINUTES = 540; // 9 hours

export const TIMEZONES = [
  { value: 'Asia/Dhaka', label: 'বাংলাদেশ (Dhaka)' },
  { value: 'Asia/Kolkata', label: 'ভারত (Kolkata)' },
  { value: 'Asia/Dubai', label: 'দুবাই (Dubai)' },
  { value: 'Asia/Riyadh', label: 'সৌদি আরব (Riyadh)' },
  { value: 'Asia/Kuala_Lumpur', label: 'মালয়েশিয়া (Kuala Lumpur)' },
  { value: 'Asia/Singapore', label: 'সিঙ্গাপুর (Singapore)' },
  { value: 'Europe/London', label: 'লন্ডন (London)' },
  { value: 'America/New_York', label: 'নিউ ইয়র্ক (New York)' },
  { value: 'UTC', label: 'UTC' }
];

interface TimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function getTimeParts(date: Date, tz: string): TimeParts {
  const p: Record<string, number> = {};
  new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
    .formatToParts(date)
    .forEach(x => {
      p[x.type] = +x.value;
    });

  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute
  };
}

export function getTimezoneOffsetMinutes(date: Date, tz: string): number {
  const p = getTimeParts(date, tz);
  return (
    (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) -
      Math.floor(date.getTime() / 60000) * 60000) /
    60000
  );
}

export function formatMinutesToTime(m: number): string {
  const normalized = ((m % 1440) + 1440) % 1440;
  let h = Math.floor(normalized / 60);
  const mi = normalized % 60;
  const s = h < 12 ? 'am' : 'pm';
  h = h % 12 || 12;
  return `${h}:${String(mi).padStart(2, '0')}${s}`;
}

export interface ComputedSessionData {
  name: string;
  color: string;
  startMin: number;
  open: boolean;
  localTimeFormatted: string;
  sessionRangeFormatted: string;
  segments: { left: number; width: number }[];
}

export function computeSessions(selectedTz: string, now: Date = new Date()): {
  currentMinute: number;
  sessions: ComputedSessionData[];
} {
  const selectedTzOffset = getTimezoneOffsetMinutes(now, selectedTz);
  const selectedParts = getTimeParts(now, selectedTz);
  const currentMinute = selectedParts.hour * 60 + selectedParts.minute;

  const sessions = FOREX_SESSIONS.map(s => {
    const cityOffset = getTimezoneOffsetMinutes(now, s.tz);
    const cityParts = getTimeParts(now, s.tz);

    const startUtc =
      Date.UTC(cityParts.year, cityParts.month - 1, cityParts.day, s.h, 0) -
      cityOffset * 60000;
    const startMin =
      ((Math.floor(startUtc / 60000) + selectedTzOffset) % 1440 + 1440) % 1440;

    let open = false;
    // Check if open in the current or previous day
    for (let k = -1; k <= 0; k++) {
      const wd = new Date(
        Date.UTC(cityParts.year, cityParts.month - 1, cityParts.day + k)
      ).getUTCDay();
      // Forex market is closed on Saturday (6) and Sunday (0)
      if (wd < 1 || wd > 5) continue;

      const st =
        Date.UTC(cityParts.year, cityParts.month - 1, cityParts.day + k, s.h, 0) -
        cityOffset * 60000;
      if (now.getTime() >= st && now.getTime() < st + SESSION_DURATION_MINUTES * 60000) {
        open = true;
      }
    }

    const segments: { left: number; width: number }[] = [];
    const firstSegmentWidth = Math.min(SESSION_DURATION_MINUTES, 1440 - startMin);
    segments.push({
      left: (startMin / 1440) * 100,
      width: (firstSegmentWidth / 1440) * 100
    });

    if (firstSegmentWidth < SESSION_DURATION_MINUTES) {
      const remainingWidth = SESSION_DURATION_MINUTES - firstSegmentWidth;
      segments.push({
        left: 0,
        width: (remainingWidth / 1440) * 100
      });
    }

    const cityCurrentMinutes = cityParts.hour * 60 + cityParts.minute;

    return {
      name: s.n,
      color: s.c,
      startMin,
      open,
      localTimeFormatted: formatMinutesToTime(cityCurrentMinutes),
      sessionRangeFormatted: `${formatMinutesToTime(startMin)} – ${formatMinutesToTime(
        startMin + SESSION_DURATION_MINUTES
      )}`,
      segments
    };
  });

  return { currentMinute, sessions };
}
