import React, { useState, useEffect } from 'react';
import { TIMEZONES, computeSessions } from '../utils/sessions';
import { Globe, Clock } from 'lucide-react';

export const MarketSessions: React.FC = () => {
  const [selectedTz, setSelectedTz] = useState<string>(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) return userTz;
    } catch (e) {
      // fallback
    }
    return 'Asia/Dhaka';
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const { currentMinute, sessions } = computeSessions(selectedTz, now);
  const nowLeftPct = Math.min(100, Math.max(0, (currentMinute / 1440) * 100));

  // Determine if it's weekend
  const utcDay = now.getUTCDay();
  const isWeekend = utcDay === 0 || (utcDay === 6 && now.getUTCHours() >= 21);

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-4 bg-gradient-to-b from-sky-400 to-rose-400 rounded-full" />
        <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>🌍 ফরেক্স মার্কেট সেশন</span>
        </h2>
      </div>

      <div className="space-y-3">
        {/* Timezone Select */}
        <div>
          <select
            value={selectedTz}
            onChange={e => setSelectedTz(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 focus:border-sky-400"
          >
            {TIMEZONES.map(z => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Visual 24h Timeline Chart */}
        <div className="glass-panel overflow-hidden border border-slate-700/60 rounded-2xl neon-glow">
          <div className="bg-gradient-to-r from-sky-600/80 to-indigo-700/80 px-3.5 py-2 font-bold text-xs text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 24-Hour Market Timeline
            </span>
            <span className="text-[11px] opacity-90">
              {isWeekend ? 'Weekend: Markets Closed' : 'Live Active Windows'}
            </span>
          </div>

          {/* Time axis */}
          <div className="relative h-6 bg-slate-800/90 text-slate-300 text-[10px] font-medium border-b border-slate-700/50 select-none">
            {[0, 4, 8, 12, 16, 20].map(h => (
              <span
                key={h}
                className="absolute top-1 -translate-x-1/2"
                style={{
                  left: h === 0 ? '4px' : `${(h / 24) * 100}%`,
                  transform: h === 0 ? 'none' : undefined
                }}
              >
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </span>
            ))}
          </div>

          {/* Session Rows */}
          <div className="relative h-[148px] bg-slate-950/60 overflow-hidden">
            {/* Grid vertical markers */}
            {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(h => (
              <div
                key={h}
                className="absolute top-0 bottom-0 w-[1px] bg-slate-800/60 pointer-events-none"
                style={{ left: `${(h / 24) * 100}%` }}
              />
            ))}

            {/* Current Time Indicator Line (Green) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] z-20 pointer-events-none"
              style={{ left: `${nowLeftPct}%` }}
              title="Current Time"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 -ml-[3px] shadow-[0_0_6px_#34d399]" />
            </div>

            {/* Render 4 Session Tracks */}
            {sessions.map((s, idx) => {
              const topPos = 6 + idx * 35;
              return (
                <div
                  key={s.name}
                  className="absolute left-0 right-0 h-7"
                  style={{ top: `${topPos}px` }}
                >
                  {/* Active segment blocks */}
                  {s.segments.map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      className={`absolute top-0 h-7 rounded-md transition-all ${
                        s.open
                          ? 'border-2 shadow-sm'
                          : 'border opacity-40'
                      }`}
                      style={{
                        left: `${seg.left}%`,
                        width: `${seg.width}%`,
                        backgroundColor: s.open ? s.color : `${s.color}33`,
                        borderColor: s.color
                      }}
                    />
                  ))}

                  {/* Label */}
                  <div
                    className="absolute top-0 leading-7 text-xs font-semibold px-2 flex items-center gap-1.5 pointer-events-none select-none z-10"
                    style={{
                      left: `${Math.max(0, Math.min(75, s.segments[0]?.left || 0))}%`,
                      color: s.open ? '#ffffff' : '#94a3b8'
                    }}
                  >
                    <b className="font-bold">{s.name}</b>
                    <span className="text-[10px] opacity-85">({s.localTimeFormatted})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session cards list */}
        <div className="grid grid-cols-2 gap-2">
          {sessions.map(s => (
            <div
              key={s.name}
              className="p-2.5 rounded-xl glass-panel border border-slate-700/60 flex items-center justify-between text-xs"
              style={{ borderLeftWidth: '4px', borderLeftColor: s.color }}
            >
              <div>
                <b className="text-white text-xs block font-bold">{s.name}</b>
                <small className="text-[11px] text-slate-400">{s.sessionRangeFormatted}</small>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  s.open
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                {s.open ? 'খোলা' : 'বন্ধ'}
              </span>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="text-[11.5px] text-slate-400 leading-relaxed px-1">
          সবুজ রেখা = এখন। গাঢ় বার = সেশন খোলা। শনি ও রবিবার ফরেক্স বাজার বন্ধ থাকে।
        </div>
      </div>
    </section>
  );
};
