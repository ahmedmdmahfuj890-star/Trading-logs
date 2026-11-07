import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const KEY = 'mh-trading-log-v2';
    const OLD = 'mh-trading-log-v1';
    let ST: { c: number; m: any[] } = { c: 0, m: [] };
    let S: any;

    const EN_MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const BN_MONTHS = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const BN_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

    function getDaysInMonth(year: number, monthIndex: number): number {
      return new Date(year, monthIndex + 1, 0).getDate();
    }

    function blankDay() {
      return {
        r: [0, 0, 0, 0, 0, 0],
        t: [
          { p: '', d: '', ap: '', pl: '', pp: '' },
          { p: '', d: '', ap: '', pl: '', pp: '' },
          { p: '', d: '', ap: '', pl: '', pp: '' }
        ],
        m: '',
        n: '',
        c: [0, 0, 0, 0],
        ce: 0,
        mk: '',
        nf: ''
      };
    }

    function blank(year?: number, monthIndex?: number) {
      const now = new Date();
      const y = typeof year === 'number' ? year : now.getFullYear();
      const m = typeof monthIndex === 'number' && monthIndex >= 0 && monthIndex <= 11 ? monthIndex : now.getMonth();
      const totalDays = getDaysInMonth(y, m);
      const d = [];
      for (let i = 0; i < totalDays; i++) {
        d.push(blankDay());
      }
      const title = `${EN_MONTHS[m]} ${y}`;
      const weeksCount = Math.ceil(totalDays / 7);
      const wm = new Array(weeksCount).fill('');
      return {
        year: y,
        month: m,
        days: totalDays,
        s: 10000,
        l: 0.8,
        dt: '',
        mt: '',
        nm: title,
        d,
        lot: {},
        snap: {},
        wm
      };
    }

    function cleanMonth(m: any, i: number) {
      if (!m || typeof m !== 'object') throw new Error('Invalid month');
      const now = new Date();
      let y = typeof m.year === 'number' ? m.year : now.getFullYear();
      let monthIdx = typeof m.month === 'number' && m.month >= 0 && m.month <= 11 ? m.month : now.getMonth();

      if (typeof m.nm === 'string') {
        EN_MONTHS.forEach((name, idx) => {
          if (m.nm.includes(name)) monthIdx = idx;
        });
        const matchYear = m.nm.match(/\b(202\d|203\d)\b/);
        if (matchYear) y = parseInt(matchYear[1], 10);
      }

      const totalDays = getDaysInMonth(y, monthIdx);
      const b = blank(y, monthIdx);
      b.year = y;
      b.month = monthIdx;
      b.days = totalDays;
      b.s = m.s == null ? b.s : m.s;
      b.l = m.l == null ? b.l : m.l;
      b.dt = m.dt == null ? b.dt : m.dt;
      b.mt = m.mt == null ? b.mt : m.mt;
      b.nm = String(m.nm || `${EN_MONTHS[monthIdx]} ${y}`);
      b.lot = m.lot && typeof m.lot === 'object' ? m.lot : {};
      b.snap = m.snap && typeof m.snap === 'object' ? m.snap : {};

      const weeksCount = Math.ceil(totalDays / 7);
      b.wm = Array.isArray(m.wm) ? m.wm.slice(0, weeksCount) : [];
      while (b.wm.length < weeksCount) b.wm.push('');

      b.d = [];
      const existingDays = Array.isArray(m.d) ? m.d : [];
      for (let j = 0; j < totalDays; j++) {
        const x = existingDays[j] && typeof existingDays[j] === 'object' ? existingDays[j] : {};
        const d0 = blankDay();
        d0.r = Array.isArray(x.r)
          ? [0, 1, 2, 3, 4, 5].map((k) => {
              const v = Number(x.r[k]);
              return v === 1 || v === 2 ? v : 0;
            })
          : [0, 0, 0, 0, 0, 0];
        d0.c = Array.isArray(x.c)
          ? [0, 1, 2, 3].map((k) => {
              const v = Number(x.c[k]);
              return v === 1 || v === 2 ? v : 0;
            })
          : [0, 0, 0, 0];
        d0.ce = x.ce === 1 || x.ce === 2 ? x.ce : 0;
        d0.m = x.m == null ? '' : String(x.m);
        d0.n = x.n == null ? '' : String(x.n);
        d0.mk = x.mk == null ? '' : String(x.mk);
        d0.nf = x.nf == null ? '' : String(x.nf);
        d0.t = [0, 1, 2].map((k) => {
          const z = Array.isArray(x.t) ? x.t[k] : null;
          const zObj = z && typeof z === 'object' ? z : {};
          return {
            p: zObj.p == null ? '' : String(zObj.p),
            d: zObj.d == null ? '' : String(zObj.d),
            ap: zObj.ap === 'Yes' || zObj.ap === 'No' ? zObj.ap : '',
            pl: zObj.pl == null ? '' : String(zObj.pl),
            pp: zObj.pp == null ? '' : String(zObj.pp)
          };
        });
        b.d.push(d0);
      }
      return b;
    }

    function cleanState(x: any) {
      if (!x || !Array.isArray(x.m) || !x.m.length) throw new Error('Invalid backup');
      return {
        c: Number.isInteger(+x.c) && +x.c >= 0 && +x.c < x.m.length ? +x.c : 0,
        m: x.m.map(cleanMonth)
      };
    }

    try {
      const raw = localStorage.getItem(KEY);
      const old = localStorage.getItem(OLD);
      if (raw) {
        try {
          ST = cleanState(JSON.parse(raw));
        } catch (e) {
          ST = { c: 0, m: [] };
        }
      }
      if (!ST.m.length && old) {
        try {
          const p = JSON.parse(old);
          if (p && Array.isArray(p.d)) {
            p.nm = 'Month 1';
            ST = cleanState({ c: 0, m: [p] });
          }
        } catch (e) {}
      }
    } catch (e) {}

    if (!ST.m.length) ST.m = [blank()];
    if (ST.c >= ST.m.length) ST.c = 0;
    S = ST.m[ST.c];

    function save() {
      ST.m[ST.c] = S;
      try {
        localStorage.setItem(KEY, JSON.stringify(ST));
      } catch (e) {}
    }

    function num(v: any): number {
      if (v === '' || v === null || v === undefined) return NaN;
      const x = parseFloat(v);
      return isNaN(x) ? NaN : x;
    }

    function money(x: any): string {
      if (x === null || isNaN(x)) return '–';
      return (
        (x < 0 ? '-' : '') +
        Math.abs(x).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    }

    function fp(x: any): string {
      return (x > 0 ? '+' : '') + Math.round(x * 10) / 10;
    }

    function pct(x: any): string {
      return x === null || isNaN(x) ? '–' : (x * 100).toFixed(1) + '%';
    }

    function cls(x: any): string {
      return x > 0 ? 'pos' : x < 0 ? 'neg' : '';
    }

    function calc() {
      const start = num(S.s) || 0;
      const lim = ((num(S.l) || 0) / 100) * start;
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
      const res: any[] = [];
      const totalDays = S.d ? S.d.length : 30;
      const weeksCount = Math.ceil(totalDays / 7);
      const wk: any[] = [];
      for (let w = 0; w < weeksCount; w++) {
        wk.push({ t: 0, w: 0, n: 0, p: 0 });
      }

      S.d.forEach(function (day: any, i: number) {
        let n = 0;
        let any = false;
        let np = 0;
        let anyp = false;
        const k = Math.min(weeksCount - 1, Math.floor(i / 7));

        day.t.forEach(function (t: any) {
          const v = num(t.pl);
          const p = num(t.pp);
          const hv = !isNaN(v);
          const hp = !isNaN(p);
          if (!hv && !hp) return;
          tr++;
          wk[k].t++;
          const o = hv ? v : p;
          if (o > 0) {
            w++;
            wk[k].w++;
          } else if (o < 0) {
            l++;
          }
          if (hv) {
            any = true;
            n += v;
            if (v > 0) {
              gp += v;
              wd++;
            } else if (v < 0) {
              gl += v;
              ld++;
            }
          }
          if (hp) {
            anyp = true;
            np += p;
            tp += p;
            if (p > 0) pw += p;
            else if (p < 0) pls += p;
            wk[k].p += p;
          }
        });

        day.r.forEach(function (r: any) {
          if (r) {
            yn++;
            if (r === 1) y++;
          }
        });

        if (any) {
          bal += n;
          wk[k].n += n;
          if (bal > peak) peak = bal;
          const dd = peak - bal;
          if (dd > mdd) mdd = dd;
          if (peak > 0 && dd / peak > mddp) mddp = dd / peak;
        }

        res.push({
          any,
          net: n,
          bal,
          hit: any && lim > 0 && n <= -lim,
          anyp,
          pips: np,
          has: any || anyp,
          tone: any ? n : anyp ? np : 0
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

    function stat(lab: string, val: any, c?: string) {
      return (
        '<div class="stat"><span>' +
        lab +
        '</span><b class="' +
        (c || '') +
        '">' +
        val +
        '</b></div>'
      );
    }

    function hero(c: any, net: number) {
      const pts = [c.start];
      c.res.forEach(function (r: any) {
        if (r.any) pts.push(r.bal);
      });
      const w = 300;
      const h = 70;
      const mn = Math.min.apply(null, pts);
      const mx = Math.max.apply(null, pts);
      const rg = mx - mn || 1;
      let svg = '';
      if (pts.length > 1) {
        const xy = pts.map(function (v: any, i: number) {
          return [i * (w / (pts.length - 1)), h - 8 - ((v - mn) / rg) * (h - 18)];
        });
        const d = xy
          .map(function (p: any, i: number) {
            return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
          })
          .join(' ');
        svg =
          '<svg class="spark" viewBox="0 0 ' +
          w +
          ' ' +
          h +
          '" preserveAspectRatio="none"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a526" stop-opacity=".45"/><stop offset="1" stop-color="#e0a526" stop-opacity="0"/></linearGradient></defs><path d="' +
          d +
          ' L' +
          w +
          ' ' +
          h +
          ' L0 ' +
          h +
          ' Z" fill="url(#sg)"/><path d="' +
          d +
          '" fill="none" stroke="#e0a526" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
      }
      const pill = c.tr
        ? '<em class="pill ' +
          (net >= 0 ? 'up' : 'dn') +
          '">' +
          (net >= 0 ? '▲ +' : '▼ ') +
          money(net) +
          (c.start ? ' · ' + pct(net / c.start) : '') +
          '</em>'
        : '<em class="pill">No trades yet</em>';
      const mt = num(S.mt);
      const bar =
        mt > 0
          ? '<div class="bar"><i style="width:' +
            Math.max(0, Math.min(100, (net / mt) * 100)).toFixed(0) +
            '%"></i></div><div class="tgt">Target ' +
            money(mt) +
            ' · ' +
            pct(net / mt) +
            ' · ' +
            (net >= mt ? '🎯 পূরণ!' : 'আর ' + money(mt - net) + ' লাগবে') +
            '</div>'
          : '';
      return (
        '<div class="stat"><span>Balance</span><b>' +
        money(c.bal) +
        '</b>' +
        pill +
        svg +
        bar +
        '</div>'
      );
    }

    function amt(x: number) {
      const a = Math.abs(x);
      const s = x > 0 ? '+' : x < 0 ? '-' : '';
      return (
        s +
        (a >= 1000 ? (a / 1000).toFixed(1) + 'k' : a.toFixed(a % 1 ? 2 : 0))
      );
    }

    function renderStrip(c: any) {
      const y = S.year != null ? S.year : new Date().getFullYear();
      const m = S.month != null ? S.month : new Date().getMonth();
      const totalDays = S.d ? S.d.length : getDaysInMonth(y, m);
      const monthNameEn = EN_MONTHS[m] || 'Month';
      const monthNameBn = BN_MONTHS[m] || '';

      let s =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<div>' +
        '<label style="margin:0;font-size:13.5px;font-weight:800;color:#fff">📅 ' +
        monthNameEn +
        ' ' +
        y +
        (monthNameBn ? ' (' + monthNameBn + ')' : '') +
        '</label>' +
        '<small style="color:#94a3b8;display:block;font-size:11px;margin-top:2px">টোটাল ' +
        totalDays +
        ' দিন · যেকোনো দিনে ক্লিক করে জার্নাল এন্ট্রিতে যান</small>' +
        '</div>' +
        '<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.35)">' +
        totalDays +
        ' Days</span>' +
        '</div>' +
        '<div class="strip">';

      c.res.forEach(function (r: any, i: number) {
        const dNum = i + 1;
        const dObj = new Date(y, m, dNum);
        const dayOfWeek = EN_DAYS[dObj.getDay()];
        const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;

        s +=
          '<button class="dot ' +
          (r.has ? (r.tone > 0 ? 'w' : r.tone < 0 ? 'l' : 'z') : '') +
          (isWeekend ? ' wknd' : '') +
          '" data-i="' +
          i +
          '"><small>' +
          dayOfWeek +
          '</small><b>' +
          dNum +
          '</b>' +
          '<small class="amt">' +
          (r.any ? amt(r.net) : '') +
          '</small>' +
          (r.anyp ? '<small class="amt">' + fp(r.pips) + 'p</small>' : '') +
          '</button>';
      });

      const el = document.getElementById('strip');
      if (el) el.innerHTML = s + '</div>';
    }

    const stripEl = document.getElementById('strip');
    if (stripEl) {
      stripEl.onclick = function (e: any) {
        const b = e.target.closest('.dot');
        if (!b) return;
        const card = document.getElementById('card' + b.dataset.i);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }

    function update() {
      const c = calc();
      const net = c.bal - c.start;
      const pf =
        c.gl === 0
          ? c.gp === 0
            ? '–'
            : 'n/a'
          : (c.gp / Math.abs(c.gl)).toFixed(2);
      let apY = 0;
      let apN = 0;
      let apW = 0;
      S.d.forEach(function (d: any) {
        d.t.forEach(function (t: any) {
          if (t.ap === 'Yes') {
            apY++;
            const vv = num(t.pl);
            if (isNaN(vv) ? num(t.pp) > 0 : vv > 0) apW++;
          } else if (t.ap === 'No') apN++;
        });
      });

      const statsEl = document.getElementById('stats');
      if (statsEl) {
        statsEl.innerHTML =
          hero(c, net) +
          stat('Total trades', c.tr) +
          stat('Win rate', c.tr ? pct(c.w / c.tr) : '–') +
          stat('Avg win', c.wd ? money(c.gp / c.wd) : '–', 'pos') +
          stat('Avg loss', c.ld ? money(c.gl / c.ld) : '–', 'neg') +
          stat('Profit factor', pf) +
          stat('Return', c.start ? pct(net / c.start) : '–', cls(net)) +
          stat('Max drawdown', c.tr ? money(c.mdd) + ' (' + pct(c.mddp) + ')' : '–') +
          stat('Discipline score', pct(c.disc)) +
          stat(
            'A+ sets',
            apY + apN ? apY + ' of ' + (apY + apN) + ' (' + pct(apY / (apY + apN)) + ')' : '–'
          ) +
          stat('A+ win rate', apY ? pct(apW / apY) : '–') +
          stat(
            'Total pips',
            c.res.some(function (r: any) {
              return r.anyp;
            })
              ? fp(c.tp) + ' pips'
              : '–',
            cls(c.tp)
          ) +
          stat(
            'Pips won / lost',
            c.res.some(function (r: any) {
              return r.anyp;
            })
              ? '+' +
                  Math.round(c.pw * 10) / 10 +
                  ' / ' +
                  Math.round(c.pls * 10) / 10
              : '–'
          ) +
          stat(
            'Monthly target',
            num(S.mt) > 0
              ? money(net) + ' / ' + money(num(S.mt)) + ' (' + pct(net / num(S.mt)) + ')'
              : '–',
            cls(net)
          ) +
          stat(
            'Daily target hit',
            num(S.dt) > 0
              ? c.res.filter(function (r: any) {
                  return r.any && r.net >= num(S.dt);
                }).length + ' days'
              : '–'
          ) +
          stat(
            'টার্গেট পূরণে আর লাগবে',
            num(S.mt) > 0
              ? net >= num(S.mt)
                ? '🎯 পূরণ হয়েছে'
                : money(num(S.mt) - net)
              : '–'
          );
      }

      let h =
        '<tr><th>Week</th><th>Trades</th><th>Wins</th><th>Win %</th><th>Net P/L</th><th>Pips</th></tr>';
      c.wk.forEach(function (x: any, i: number) {
        const startDay = i * 7 + 1;
        const endDay = Math.min(S.d.length, (i + 1) * 7);
        h +=
          '<tr><td>Week ' +
          (i + 1) +
          ' <small style="color:var(--mut)">(' +
          startDay +
          '–' +
          endDay +
          ')</small></td><td>' +
          x.t +
          '</td><td>' +
          x.w +
          '</td><td>' +
          (x.t ? pct(x.w / x.t) : '–') +
          '</td><td class="' +
          cls(x.n) +
          '">' +
          money(x.n) +
          '</td><td class="' +
          cls(x.p) +
          '">' +
          (x.p ? fp(x.p) : '–') +
          '</td></tr>';
      });
      const weeksEl = document.getElementById('weeks');
      if (weeksEl) weeksEl.innerHTML = h;

      renderStrip(c);
      c.res.forEach(function (r: any, i: number) {
        const rc = S.d[i].r;
        const ys = rc.filter(function (x: any) {
          return x === 1;
        }).length;
        const ns = rc.filter(function (x: any) {
          return x === 2;
        }).length;
        const rcEl = document.getElementById('rc' + i);
        if (rcEl) rcEl.textContent = ys + '✓ ' + ns + '✗';

        const n = document.getElementById('net' + i);
        if (n) {
          const pt: string[] = [];
          if (r.any) pt.push(money(r.net) + '  ·  ' + money(r.bal));
          if (r.anyp) pt.push(fp(r.pips) + ' pips');
          const hit = num(S.dt) > 0 && r.any && r.net >= num(S.dt);
          n.textContent = (hit ? '🎯 ' : '') + (pt.length ? pt.join('  |  ') : '–');
          const tone = r.tone;
          n.className = 'net ' + cls(tone);
        }

        const cardEl = document.getElementById('card' + i);
        if (cardEl) {
          cardEl.classList.toggle('flag', r.hit);
          cardEl.classList.toggle('win', r.tone > 0);
          cardEl.classList.toggle('loss', r.tone < 0);
        }

        const warnEl = document.getElementById('warn' + i);
        if (warnEl) warnEl.style.display = r.hit ? 'block' : 'none';
      });
    }

    const RULES = [
      'Follow your trading plan',
      'Maximum 3 trades per day',
      'Daily max risk 2%',
      'Stop overtrading',
      'No revenge trading',
      'Focus on discipline, not on profit.'
    ];
    const PRE = [
      'Higher-timeframe trend checked',
      'Key support / resistance marked',
      'Setup matches my plan',
      'Stop loss set before entry'
    ];

    function pre(i: number) {
      return (
        '<details class="pre"><summary>Pre-trade checklist <b id="pc' +
        i +
        '"></b></summary><div class="chk" data-i="' +
        i +
        '">' +
        PRE.map(function (t, k) {
          return '<button data-k="' + k + '"><i></i>' + t + '</button>';
        }).join('') +
        '</div><div class="note">Any empty box = no trade.</div></details>'
      );
    }

    function emoI(v: any) {
      return v === 1 ? '✅' : v === 2 ? '❌' : '⬜';
    }
    function emoC(v: any) {
      return v === 1 ? ' on' : v === 2 ? ' no' : '';
    }
    function apc(v: any) {
      return v === 'Yes' ? ' y' : v === 'No' ? ' n' : '';
    }

    function build() {
      const box = document.getElementById('days');
      if (!box) return;
      const totalDays = S.d ? S.d.length : 30;
      const y = S.year != null ? S.year : new Date().getFullYear();
      const m = S.month != null ? S.month : new Date().getMonth();

      let h = '';
      for (let i = 0; i < totalDays; i++) {
        const dNum = i + 1;
        const dObj = new Date(y, m, dNum);
        const dayOfWeek = EN_DAYS[dObj.getDay()];
        const bnDayOfWeek = BN_DAYS[dObj.getDay()];

        if (i % 7 === 0) {
          const wkNum = Math.floor(i / 7) + 1;
          const endDay = Math.min(totalDays, i + 7);
          h +=
            '<h2 style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 10px">' +
            '<span>Week ' +
            wkNum +
            '</span>' +
            '<span style="font-size:12px;font-weight:600;color:var(--mut)">Day ' +
            dNum +
            ' – ' +
            endDay +
            '</span></h2>';
        }

        h +=
          '<div class="card" id="card' +
          i +
          '"><div class="dream">Dream big, stay disciplined</div><button class="emo' +
          emoC(S.d[i].ce) +
          '" data-i="' +
          i +
          '">' +
          emoI(S.d[i].ce) +
          ' Control your emotion</button><div class="head"><b>' +
          dayOfWeek +
          ' (' +
          bnDayOfWeek +
          ') · ' +
          dNum +
          ' ' +
          EN_MONTHS[m] +
          ' ' +
          y +
          ' · Day ' +
          dNum +
          '</b><span class="net" id="net' +
          i +
          '">–</span></div>';
        h +=
          '<details class="pre"><summary>Rules check <b id="rc' +
          i +
          '"></b></summary><div class="rules rl" data-i="' +
          i +
          '">';
        for (let k = 0; k < 6; k++)
          h += '<button data-k="' + k + '">' + (k + 1) + '. ' + RULES[k] + '</button>';
        h += '</div></details>';
        h += pre(i);
        h +=
          '<div class="warn" id="warn' +
          i +
          '">Daily loss limit hit – stop trading for the day.</div>';
        for (let t = 0; t < 3; t++) {
          h +=
            '<div class="tg"><div class="row trade"><div><label>Trade ' +
            (t + 1) +
            ' pair</label><input data-i="' +
            i +
            '" data-t="' +
            t +
            '" data-f="p" type="text"></div>' +
            '<div><label>Dir.</label><select data-i="' +
            i +
            '" data-t="' +
            t +
            '" data-f="d"><option value=""></option><option>B</option><option>S</option></select></div>' +
            '<div><label>A+ Set</label><button class="ap' +
            apc(S.d[i].t[t].ap) +
            '" data-i="' +
            i +
            '" data-t="' +
            t +
            '">' +
            (S.d[i].t[t].ap || '–') +
            '</button></div>' +
            '</div><div class="row" style="grid-template-columns:1fr 1fr"><div><label>P/L ($)</label><input data-i="' +
            i +
            '" data-t="' +
            t +
            '" data-f="pl" type="number" inputmode="decimal" step="any"></div><div><label>Pips (+/-)</label><input data-i="' +
            i +
            '" data-t="' +
            t +
            '" data-f="pp" type="number" inputmode="decimal" step="any" placeholder="e.g. 25 or -12"></div></div></div>';
        }
        h +=
          '<div class="row"><div><label>Biggest mistake today</label><input data-i="' +
          i +
          '" data-f="mk" type="text" placeholder="Write your biggest mistake"></div></div>';
        h +=
          '<div class="row"><div><label>Next day focus</label><input data-i="' +
          i +
          '" data-f="nf" type="text" placeholder="What will you focus on tomorrow?"></div></div>';
        h +=
          '<div class="row" style="grid-template-columns:auto 1fr"><div><label>Mood</label><div class="stars" data-i="' +
          i +
          '">' +
          [1, 2, 3, 4, 5]
            .map(function (k) {
              return '<button data-k="' + k + '">★</button>';
            })
            .join('') +
          '</div></div>' +
          '<div><label>Notes</label><input data-i="' +
          i +
          '" data-f="n" type="text"></div></div></div>';
      }
      box.innerHTML = h;

      box.querySelectorAll('[data-f]').forEach(function (el: any) {
        const i = +el.dataset.i;
        const f = el.dataset.f;
        const t = el.dataset.t;
        el.value = t !== undefined ? S.d[i].t[+t][f] || '' : S.d[i][f] || '';
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(ev, function () {
          if (t !== undefined) S.d[i].t[+t][f] = el.value;
          else S.d[i][f] = el.value;
          save();
          update();
        });
      });

      box.querySelectorAll('.rules').forEach(function (r: any) {
        const i = +r.dataset.i;
        function paint() {
          r.querySelectorAll('button').forEach(function (b: any) {
            const v = S.d[i].r[+b.dataset.k];
            b.className = v === 1 ? 'y' : v === 2 ? 'n' : '';
          });
        }
        paint();
        r.addEventListener('click', function (e: any) {
          const b = e.target.closest('button');
          if (!b) return;
          const k = +b.dataset.k;
          S.d[i].r[k] = (S.d[i].r[k] + 1) % 3;
          save();
          paint();
          update();
        });
      });
    }

    const st = document.getElementById('start') as HTMLInputElement;
    const ml = document.getElementById('maxl') as HTMLInputElement;
    const msel = document.getElementById('msel') as HTMLSelectElement;
    const mn = document.getElementById('mname') as HTMLInputElement;

    function mk() {
      const b = document.getElementById('mist');
      if (!b) return;
      let h = '';
      const totalDays = S.d ? S.d.length : 30;
      const weeksCount = Math.ceil(totalDays / 7);
      if (!S.wm || !Array.isArray(S.wm)) S.wm = [];
      while (S.wm.length < weeksCount) S.wm.push('');
      for (let w = 0; w < weeksCount; w++) {
        const startDay = w * 7 + 1;
        const endDay = Math.min(totalDays, (w + 1) * 7);
        h +=
          '<label>Week ' +
          (w + 1) +
          ' (Day ' +
          startDay +
          '–' +
          endDay +
          ') – biggest mistake</label><input data-w="' +
          w +
          '" type="text" placeholder="Write your biggest mistake" style="margin-bottom:8px">';
      }
      b.innerHTML = h;
      b.querySelectorAll('input').forEach(function (el: any) {
        el.value = S.wm[+el.dataset.w] || '';
        el.addEventListener('input', function () {
          S.wm[+el.dataset.w] = el.value;
          save();
        });
      });
    }

    function paintChk(w: any) {
      const i = +w.dataset.i;
      const c = S.d[i].c || [];
      let n = 0;
      let x = 0;
      w.querySelectorAll('button').forEach(function (b: any) {
        const v = +c[+b.dataset.k] || 0;
        if (v === 1) n++;
        if (v === 2) x++;
        b.className = v === 1 ? 'on' : v === 2 ? 'no' : '';
      });
      const pcEl = document.getElementById('pc' + i);
      if (pcEl) {
        pcEl.textContent =
          n +
          '/' +
          PRE.length +
          (x ? ' · ' + x + '❌' : '') +
          (n === PRE.length ? ' ✓' : '');
      }
    }

    const daysEl = document.getElementById('days');
    if (daysEl) {
      daysEl.addEventListener('click', function (e: any) {
        const b = e.target.closest('.chk button');
        if (!b) return;
        const w = b.parentNode;
        const i = +w.dataset.i;
        const k = +b.dataset.k;
        if (!S.d[i].c) S.d[i].c = [0, 0, 0, 0];
        S.d[i].c[k] = ((+S.d[i].c[k] || 0) + 1) % 3;
        save();
        paintChk(w);
      });

      daysEl.addEventListener('click', function (e: any) {
        const b = e.target.closest('.emo');
        if (!b) return;
        const i = +b.dataset.i;
        S.d[i].ce = ((+S.d[i].ce || 0) + 1) % 3;
        save();
        b.textContent = emoI(S.d[i].ce) + ' Control your emotion';
        b.className = 'emo' + emoC(S.d[i].ce);
      });

      daysEl.addEventListener('click', function (e: any) {
        const b = e.target.closest('.ap');
        if (!b) return;
        const i = +b.dataset.i;
        const t = +b.dataset.t;
        const x = S.d[i].t[t];
        x.ap = x.ap === 'Yes' ? 'No' : 'Yes';
        save();
        b.textContent = x.ap;
        b.className = 'ap' + apc(x.ap);
      });

      daysEl.addEventListener('click', function (e: any) {
        const b = e.target.closest('.stars button');
        if (!b) return;
        const w = b.parentNode;
        const i = +w.dataset.i;
        const k = String(b.dataset.k);
        S.d[i].m = String(S.d[i].m) === k ? '' : k;
        save();
        paintStars(w, i);
      });
    }

    function paintStars(w: any, i: number) {
      const v = +S.d[i].m || 0;
      w.querySelectorAll('button').forEach(function (b: any) {
        b.className = +b.dataset.k <= v ? 'on' : '';
      });
    }

    function ask(btn: any, msg: string) {
      if (btn._a) {
        clearTimeout(btn._t);
        btn._a = false;
        btn.textContent = btn._o;
        return true;
      }
      btn._a = true;
      btn._o = btn.textContent;
      btn.textContent = msg;
      btn._t = setTimeout(function () {
        btn._a = false;
        btn.textContent = btn._o;
      }, 4000);
      return false;
    }

    function switchYearMonth(targetYear: number, targetMonth: number) {
      let idx = ST.m.findIndex(function (mItem: any) {
        return mItem.year === targetYear && mItem.month === targetMonth;
      });
      if (idx < 0) {
        const newM = blank(targetYear, targetMonth);
        newM.s = S.s;
        newM.l = S.l;
        newM.dt = S.dt;
        newM.mt = S.mt;
        newM.lot = { ...S.lot };
        ST.m.push(newM);
        idx = ST.m.length - 1;
      }
      ST.c = idx;
      load();
      save();
    }

    function fillSel() {
      const curTitle = document.getElementById('cur_month_title');
      const y = S.year != null ? S.year : new Date().getFullYear();
      const m = S.month != null ? S.month : new Date().getMonth();
      const totalDays = S.d ? S.d.length : getDaysInMonth(y, m);

      if (curTitle) {
        curTitle.textContent = EN_MONTHS[m] + ' ' + y + ' (' + totalDays + ' দিন)';
      }

      const mMonthSel = document.getElementById('m_month_select') as HTMLSelectElement;
      if (mMonthSel) {
        mMonthSel.innerHTML = '';
        EN_MONTHS.forEach(function (name, idx) {
          const opt = document.createElement('option');
          opt.value = String(idx);
          opt.textContent = name + ' (' + BN_MONTHS[idx] + ')';
          mMonthSel.appendChild(opt);
        });
        mMonthSel.value = String(m);
      }

      const mYearSel = document.getElementById('m_year_select') as HTMLSelectElement;
      if (mYearSel) {
        mYearSel.innerHTML = '';
        for (let yr = 2024; yr <= 2032; yr++) {
          const opt = document.createElement('option');
          opt.value = String(yr);
          opt.textContent = String(yr);
          mYearSel.appendChild(opt);
        }
        mYearSel.value = String(y);
      }

      if (msel) {
        msel.innerHTML = '';
        ST.m.forEach(function (monthItem: any, i: number) {
          const o = document.createElement('option');
          o.value = String(i);
          const itemY = monthItem.year != null ? monthItem.year : y;
          const itemM = monthItem.month != null ? monthItem.month : m;
          o.textContent = monthItem.nm || (EN_MONTHS[itemM] + ' ' + itemY);
          msel.appendChild(o);
        });
        msel.value = String(ST.c);
      }
    }

    const md = document.getElementById('maxd') as HTMLInputElement;
    const dtg = document.getElementById('dtgt') as HTMLInputElement;
    const mtg = document.getElementById('mtgt') as HTMLInputElement;

    function syncD() {
      const s = num(S.s) || 0;
      const p = num(S.l);
      if (md) md.value = isNaN(p) ? '' : ((s * p) / 100).toFixed(2);
    }

    function load() {
      S = ST.m[ST.c];
      const y = S.year != null ? S.year : new Date().getFullYear();
      const m = S.month != null ? S.month : new Date().getMonth();
      if (!S.nm) S.nm = EN_MONTHS[m] + ' ' + y;
      if (st) st.value = S.s;
      if (ml) ml.value = S.l;
      if (mn) mn.value = S.nm;
      if (dtg) dtg.value = S.dt || '';
      if (mtg) mtg.value = S.mt || '';
      syncD();
      fillSel();
      mk();
      build();
      document.querySelectorAll('.stars').forEach(function (w: any) {
        paintStars(w, +w.dataset.i);
      });
      document.querySelectorAll('.chk').forEach(function (w: any) {
        paintChk(w);
      });
      if ((window as any).lcLoad) (window as any).lcLoad();
      if ((window as any).updStartK) (window as any).updStartK();
      update();
    }

    if (msel) {
      msel.addEventListener('change', function () {
        ST.c = +msel.value;
        load();
        save();
      });
    }

    if (mn) {
      mn.addEventListener('input', function () {
        S.nm = mn.value;
        save();
        if (msel && msel.options[ST.c]) {
          msel.options[ST.c].textContent = S.nm || 'Month ' + (ST.c + 1);
        }
      });
    }

    const mPrevBtn = document.getElementById('m_prev_btn');
    if (mPrevBtn) {
      mPrevBtn.addEventListener('click', function () {
        let prevY = S.year != null ? S.year : new Date().getFullYear();
        let prevM = (S.month != null ? S.month : new Date().getMonth()) - 1;
        if (prevM < 0) {
          prevM = 11;
          prevY--;
        }
        switchYearMonth(prevY, prevM);
      });
    }

    const mNextBtn = document.getElementById('m_next_btn');
    if (mNextBtn) {
      mNextBtn.addEventListener('click', function () {
        let nextY = S.year != null ? S.year : new Date().getFullYear();
        let nextM = (S.month != null ? S.month : new Date().getMonth()) + 1;
        if (nextM > 11) {
          nextM = 0;
          nextY++;
        }
        switchYearMonth(nextY, nextM);
      });
    }

    const mTodayBtn = document.getElementById('m_today_btn');
    if (mTodayBtn) {
      mTodayBtn.addEventListener('click', function () {
        const now = new Date();
        switchYearMonth(now.getFullYear(), now.getMonth());
      });
    }

    const mMonthSel = document.getElementById('m_month_select') as HTMLSelectElement;
    if (mMonthSel) {
      mMonthSel.addEventListener('change', function () {
        const y = S.year != null ? S.year : new Date().getFullYear();
        switchYearMonth(y, +mMonthSel.value);
      });
    }

    const mYearSel = document.getElementById('m_year_select') as HTMLSelectElement;
    if (mYearSel) {
      mYearSel.addEventListener('change', function () {
        const m = S.month != null ? S.month : new Date().getMonth();
        switchYearMonth(+mYearSel.value, m);
      });
    }

    const newm = document.getElementById('newm');
    if (newm) {
      newm.addEventListener('click', function () {
        const y = S.year != null ? S.year : new Date().getFullYear();
        const m = S.month != null ? S.month : new Date().getMonth();
        if (!ask(newm, 'Tap again: new month copy')) return;
        const n = blank(y, m);
        n.s = S.s;
        n.l = S.l;
        n.dt = S.dt;
        n.mt = S.mt;
        n.lot = { ...S.lot };
        n.nm = `${EN_MONTHS[m]} ${y} (Copy ${ST.m.length + 1})`;
        ST.m.push(n);
        ST.c = ST.m.length - 1;
        load();
        save();
        window.scrollTo(0, 0);
      });
    }

    if (dtg) {
      dtg.addEventListener('input', function () {
        S.dt = dtg.value;
        save();
        update();
      });
    }

    if (mtg) {
      mtg.addEventListener('input', function () {
        S.mt = mtg.value;
        save();
        update();
      });
    }

    if (md) {
      md.addEventListener('input', function () {
        const s = num(S.s) || 0;
        const v = num(md.value);
        if (isNaN(v) || s <= 0) {
          S.l = '';
          if (ml) ml.value = '';
        } else {
          S.l = String(+((v / s) * 100).toFixed(2));
          if (ml) ml.value = S.l;
        }
        save();
        update();
      });
    }

    if (st) {
      st.addEventListener('input', function () {
        S.s = st.value;
        syncD();
        save();
        update();
      });
    }

    if (ml) {
      ml.addEventListener('input', function () {
        S.l = ml.value;
        syncD();
        save();
        update();
      });
    }

    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (ask(resetBtn, 'Tap again to clear this month')) {
          const nmVal = S.nm;
          const s0 = S.s;
          const d0 = S.dt;
          const m0 = S.mt;
          S = blank();
          S.nm = nmVal;
          S.s = s0;
          S.dt = d0;
          S.mt = m0;
          save();
          load();
        }
      });
    }

    function esc(s: any) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function jlines() {
      const c = calc();
      const W = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const net = c.bal - c.start;
      const L: any[] = [];
      const pf =
        c.gl === 0
          ? c.gp === 0
            ? '–'
            : 'n/a'
          : (c.gp / Math.abs(c.gl)).toFixed(2);
      let apY = 0;
      let apN = 0;
      let apW = 0;
      S.d.forEach(function (d: any) {
        d.t.forEach(function (t: any) {
          if (t.ap === 'Yes') {
            apY++;
            const vv = num(t.pl);
            if (isNaN(vv) ? num(t.pp) > 0 : vv > 0) apW++;
          } else if (t.ap === 'No') apN++;
        });
      });
      L.push(['h1', 'Mahfuj’s Trading Journal – ' + S.nm], ['h2', 'Monthly numbers']);
      [
        ['Starting balance', money(c.start)],
        ['Ending balance', money(c.bal)],
        ['Net P/L', money(net)],
        ['Total pips', fp(c.tp) + ' pips'],
        ['Daily profit target', num(S.dt) > 0 ? money(num(S.dt)) : '–'],
        [
          'Total profit target',
          num(S.mt) > 0 ? money(num(S.mt)) + ' (' + pct(net / num(S.mt)) + ' done)' : '–'
        ],
        [
          'Remaining to target',
          num(S.mt) > 0 ? (net >= num(S.mt) ? 'Reached' : money(num(S.mt) - net)) : '–'
        ],
        ['Total trades', c.tr],
        ['Win rate', c.tr ? pct(c.w / c.tr) : '–'],
        ['Avg win', c.w ? money(c.gp / c.w) : '–'],
        ['Avg loss', c.l ? money(c.gl / c.l) : '–'],
        ['Profit factor', pf],
        ['Max drawdown', c.tr ? money(c.mdd) + ' (' + pct(c.mddp) + ')' : '–'],
        ['Discipline score', pct(c.disc)],
        [
          'Max daily loss',
          (num(S.l) || 0) + '% (' + money((c.start * (num(S.l) || 0)) / 100) + ')'
        ],
        [
          'A+ sets',
          apY + apN ? apY + ' of ' + (apY + apN) + ' (' + pct(apY / (apY + apN)) + ')' : '–'
        ],
        ['A+ win rate', apY ? pct(apW / apY) : '–']
      ].forEach(function (r: any) {
        L.push(['t', r[0] + ': ' + r[1]]);
      });
      L.push(['h2', 'Weekly review']);
      c.wk.forEach(function (x: any, i: number) {
        L.push([
          't',
          'Week ' +
            (i + 1) +
            ': ' +
            x.t +
            ' trades, ' +
            x.w +
            ' wins, Net ' +
            money(x.n) +
            ', Pips ' +
            fp(x.p)
        ]);
        if (S.wm && S.wm[i]) L.push(['t', '   Biggest mistake: ' + S.wm[i]]);
      });
      L.push(['h2', 'Daily journal']);
      let any = false;
      S.d.forEach(function (d: any, i: number) {
        const r = c.res[i];
        const rl = d.r
          .map(function (x: any, k: number) {
            return x ? k + 1 + '. ' + RULES[k] + ' ' + (x === 1 ? '✓' : '✗') : '';
          })
          .filter(Boolean);
        const ck = (d.c || [])
          .slice(0, PRE.length)
          .filter(function (v: any) {
            return v === 1;
          }).length;
        const ckx = (d.c || [])
          .slice(0, PRE.length)
          .filter(function (v: any) {
            return v === 2;
          }).length;
        const tl = d.t
          .map(function (t: any, k: number) {
            return t.p || t.d || t.ap || t.pl || t.pp
              ? 'Trade ' +
                  (k + 1) +
                  ': ' +
                  t.p +
                  ' ' +
                  t.d +
                  (t.ap ? ' A+ ' + t.ap : '') +
                  (t.pl ? ' P/L ' + t.pl : '') +
                  (t.pp ? ' Pips ' + t.pp : '')
              : '';
          })
          .filter(Boolean);
        const m = +d.m || 0;
        if (!(r.any || rl.length || ck || ckx || tl.length || m || d.mk || d.nf || d.n || d.ce))
          return;
        any = true;
        const pdfY = S.year != null ? S.year : new Date().getFullYear();
        const pdfM = S.month != null ? S.month : new Date().getMonth();
        const pdfDObj = new Date(pdfY, pdfM, i + 1);
        const dayOfWeek = EN_DAYS[pdfDObj.getDay()];
        L.push([
          r.has ? (r.tone < 0 ? 'n' : 'p') : 'b',
          dayOfWeek +
            ' · Day ' +
            (i + 1) +
            (r.any
              ? '  |  Net P/L ' + money(r.net) + '  |  Balance ' + money(r.bal)
              : '') +
            (r.anyp ? '  |  Pips ' + fp(r.pips) : '') +
            (num(S.dt) > 0 && r.any && r.net >= num(S.dt) ? '  🎯' : '')
        ]);
        tl.forEach(function (t: any) {
          L.push(['t', t]);
        });
        rl.forEach(function (t: any) {
          L.push(['t', 'Rule ' + t]);
        });
        if (ck || ckx)
          L.push([
            't',
            'Pre-trade checklist: ' +
              ck +
              '/' +
              PRE.length +
              (ckx ? ' (' + ckx + ' ✗ not followed)' : '')
          ]);
        if (d.ce)
          L.push([
            't',
            d.ce === 2 ? '✗ Did not control emotion' : '✓ Control your emotion'
          ]);
        if (m) L.push(['t', 'Mood: ' + '★'.repeat(m) + '☆'.repeat(5 - m)]);
        if (d.mk) L.push(['t', 'Biggest mistake: ' + d.mk]);
        if (d.nf) L.push(['t', 'Next day focus: ' + d.nf]);
        if (d.n) L.push(['t', 'Notes: ' + d.n]);
        L.push(['gap', '']);
      });
      if (!any) L.push(['t', 'No entries yet.']);
      return L;
    }

    function drawPdfRoundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      if (typeof (ctx as any).roundRect === 'function') {
        ctx.beginPath();
        (ctx as any).roundRect(x, y, w, h, r);
      } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }
    }

    function jpng(cb: any) {
      const lines = jlines();
      const W = 2000;
      const pad = 60;
      const maxW = W - 2 * pad;
      const cv = document.createElement('canvas');
      const x = cv.getContext('2d')!;
      const F =
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", "Kalpurush", "SolaimanLipi", sans-serif';
      const stMap: any = {
        h1: [46, 'bold', '#0f172a', 70],
        h2: [36, 'bold', '#1e293b', 54],
        t: [28, '', '#334155', 44],
        b: [32, 'bold', '#0f172a', 48],
        p: [32, 'bold', '#15803d', 48],
        n: [32, 'bold', '#b91c1c', 48],
        gap: [18, '', '#000', 20]
      };

      function wrap(t: any, font: string, max: number) {
        x.font = font;
        const paras = String(t == null ? '' : t).split('\n');
        const out: string[] = [];
        paras.forEach(function (para) {
          if (!para) {
            out.push('');
            return;
          }
          const words = para.split(' ');
          let cur = '';
          words.forEach(function (w) {
            const tt = cur ? cur + ' ' + w : w;
            if (x.measureText(tt).width > max && cur) {
              out.push(cur);
              cur = w;
            } else cur = tt;
          });
          if (cur) out.push(cur);
        });
        return out.length ? out : [''];
      }

      const items: any[] = [];
      let y = pad;
      lines.forEach(function (l: any) {
        const s = stMap[l[0]] || [28, '', '#334155', 44];
        const font = (s[1] ? s[1] + ' ' : '') + s[0] + 'px ' + F;
        const lh = s[3] || Math.round(s[0] * 1.5);
        const ws = l[0] === 'gap' ? [''] : wrap(l[1], font, maxW);
        if (l[0] === 'h2') y += 24;
        if (l[0] === 'p' || l[0] === 'n' || l[0] === 'b') y += 14;

        const isPill = l[0] === 'p' || l[0] === 'n' || l[0] === 'b';
        const startY = y;

        ws.forEach(function (w: string) {
          items.push({
            type: l[0],
            text: w,
            font: font,
            color: s[2],
            x: isPill ? pad + 20 : pad,
            y: y + Math.round(lh * 0.75),
            underline: l[0] === 'h2' ? y + lh + 4 : 0
          });
          y += lh;
        });

        if (isPill) {
          const pillH = y - startY + 12;
          items.splice(items.length - ws.length, 0, {
            type: 'pill_bg',
            x: pad,
            y: startY,
            w: maxW,
            h: pillH,
            bg: l[0] === 'p' ? '#f0fdf4' : l[0] === 'n' ? '#fef2f2' : '#f8fafc',
            border: l[0] === 'p' ? '#86efac' : l[0] === 'n' ? '#fca5a5' : '#cbd5e1'
          });
          y += 14;
        }
      });

      const H = y + pad;
      cv.width = W;
      cv.height = H;
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, W, H);

      items.forEach(function (it) {
        if (it.type === 'pill_bg') {
          drawPdfRoundRect(x, it.x, it.y, it.w, it.h, 10);
          x.fillStyle = it.bg;
          x.fill();
          x.strokeStyle = it.border;
          x.lineWidth = 2;
          x.stroke();
          return;
        }
        x.font = it.font;
        x.fillStyle = it.color;
        x.fillText(it.text, it.x, it.y);
        if (it.underline) {
          x.fillStyle = '#2563eb';
          x.fillRect(pad, it.underline, 120, 4);
        }
      });

      cv.toBlob(function (b) {
        cb(b, cv);
      }, 'image/png');
    }

    function mkpdf(pages: any[]) {
      const enc = new TextEncoder();
      const chunks: any[] = [];
      const off: number[] = [];
      let len = 0;
      const np = pages.length;
      const pw = 595;
      function put(x: any) {
        const b = typeof x === 'string' ? enc.encode(x) : x;
        chunks.push(b);
        len += b.length;
      }
      function obj(n: number, body: string) {
        off[n] = len;
        put(n + ' 0 obj\n' + body + '\nendobj\n');
      }
      put('%PDF-1.4\n');
      obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
      const kids: string[] = [];
      for (let k = 0; k < np; k++) kids.push(3 + 3 * k + ' 0 R');
      obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + np + ' >>');
      pages.forEach(function (p: any, k: number) {
        const ph = Math.round((pw * p.h) / p.w);
        const cs = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im0 Do Q';
        obj(
          3 + 3 * k,
          '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
            pw +
            ' ' +
            ph +
            '] /Resources << /XObject << /Im0 ' +
            (5 + 3 * k) +
            ' 0 R >> >> /Contents ' +
            (4 + 3 * k) +
            ' 0 R >>'
        );
        obj(4 + 3 * k, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
        off[5 + 3 * k] = len;
        put(
          5 +
            3 * k +
            ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' +
            p.w +
            ' /Height ' +
            p.h +
            ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
            p.bytes.length +
            ' >>\nstream\n'
        );
        put(p.bytes);
        put('\nendstream\nendobj\n');
      });
      const xr = len;
      const total = 3 + 3 * np;
      let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
      for (let n = 1; n < total; n++)
        x += ('0000000000' + off[n]).slice(-10) + ' 00000 n \n';
      put(x + 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
      return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
    }

    function jpdf(cb: any) {
      try {
        const lines = jlines();
        const PW = 2480;
        const PH = 3508;
        const PAD_X = 140;
        const PAD_Y = 140;
        const MAX_W = PW - 2 * PAD_X;
        const PAGE_BOTTOM = PH - PAD_Y - 40;

        const testCv = document.createElement('canvas');
        const tx = testCv.getContext('2d')!;
        const F =
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", "Kalpurush", "SolaimanLipi", sans-serif';

        function wrapText(t: any, font: string, maxW: number) {
          tx.font = font;
          const paras = String(t == null ? '' : t).split('\n');
          const out: string[] = [];
          paras.forEach(function (para) {
            if (!para) {
              out.push('');
              return;
            }
            const words = para.split(' ');
            let cur = '';
            words.forEach(function (w) {
              const test = cur ? cur + ' ' + w : w;
              if (tx.measureText(test).width > maxW && cur) {
                out.push(cur);
                cur = w;
              } else {
                cur = test;
              }
            });
            if (cur) out.push(cur);
          });
          return out.length ? out : [''];
        }

        const items: any[] = [];
        lines.forEach(function (l: any) {
          const type = l[0];
          const raw = l[1] || '';
          if (type === 'gap') {
            items.push({ type: 'gap', height: 22 });
            return;
          }
          if (type === 'h1') {
            const font = 'bold 54px ' + F;
            const ws = wrapText(raw, font, MAX_W - 400);
            const lh = 76;
            items.push({
              type: 'h1',
              font: font,
              color: '#0f172a',
              lines: ws,
              lineHeight: lh,
              height: ws.length * lh + 26
            });
            return;
          }
          if (type === 'h2') {
            const font = 'bold 42px ' + F;
            const ws = wrapText(raw, font, MAX_W - 40);
            const lh = 62;
            items.push({
              type: 'h2',
              font: font,
              color: '#0f172a',
              lines: ws,
              lineHeight: lh,
              height: ws.length * lh + 40
            });
            return;
          }
          if (type === 'p' || type === 'n' || type === 'b') {
            const font = 'bold 34px ' + F;
            const ws = wrapText(raw, font, MAX_W - 60);
            const lh = 52;
            const pillColor =
              type === 'p'
                ? { bg: '#f0fdf4', border: '#86efac', text: '#15803d' }
                : type === 'n'
                ? { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' }
                : { bg: '#f8fafc', border: '#cbd5e1', text: '#1e293b' };
            items.push({
              type: type,
              font: font,
              color: pillColor.text,
              pillColor: pillColor,
              lines: ws,
              lineHeight: lh,
              height: ws.length * lh + 34
            });
            return;
          }
          // Default text 't'
          const font = '30px ' + F;
          const ws = wrapText(raw, font, MAX_W - 20);
          const lh = 46;
          items.push({
            type: 't',
            font: font,
            color: '#334155',
            lines: ws,
            lineHeight: lh,
            height: ws.length * lh + 4
          });
        });

        // Group into pages with smart break
        const pageGroups: any[][] = [[]];
        let curPageY = PAD_Y;
        let curP = 0;

        items.forEach(function (it) {
          const isDayHeader = it.type === 'p' || it.type === 'n' || it.type === 'b';
          const isH2 = it.type === 'h2';
          const spaceNeeded = isDayHeader || isH2 ? it.height + 150 : it.height;

          if (curPageY + spaceNeeded > PAGE_BOTTOM && pageGroups[curP].length > 0) {
            curP++;
            pageGroups[curP] = [];
            curPageY = 200;
          }
          pageGroups[curP].push(it);
          curPageY += it.height;
        });

        const totalPages = pageGroups.length;
        const pdfPages: any[] = [];

        pageGroups.forEach(function (pageItems, pageIdx) {
          const pageNum = pageIdx + 1;
          const pc = document.createElement('canvas');
          pc.width = PW;
          pc.height = PH;
          const ctx = pc.getContext('2d')!;

          // Pure white crisp background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, PW, PH);

          // Top Header on pages 2+
          if (pageNum > 1) {
            ctx.font = 'bold 26px ' + F;
            ctx.fillStyle = '#64748b';
            ctx.fillText('MAHFUJ TRADING JOURNAL · ' + (S.nm || 'Monthly Log'), PAD_X, 115);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(PAD_X, 140);
            ctx.lineTo(PW - PAD_X, 140);
            ctx.stroke();
          }

          // Footer on every page
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(PAD_X, PH - 140);
          ctx.lineTo(PW - PAD_X, PH - 140);
          ctx.stroke();

          ctx.font = '24px ' + F;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText("Mahfuj's Trading Log · Ultra-HD 300 DPI Export", PAD_X, PH - 92);

          ctx.font = 'bold 26px ' + F;
          ctx.fillStyle = '#475569';
          const pStr = 'Page ' + pageNum + ' of ' + totalPages;
          const psw = ctx.measureText(pStr).width;
          ctx.fillText(pStr, PW - PAD_X - psw, PH - 92);

          // Content rendering
          let y = pageNum === 1 ? PAD_Y : 200;

          pageItems.forEach(function (it: any) {
            if (it.type === 'gap') {
              y += it.height;
              return;
            }

            if (it.type === 'h1') {
              ctx.font = it.font;
              ctx.fillStyle = it.color;
              let textY = y + Math.round(it.lineHeight * 0.75);
              it.lines.forEach(function (w: string) {
                ctx.fillText(w, PAD_X, textY);
                textY += it.lineHeight;
              });

              // HD 300 DPI badge
              const badgeText = '✨ ULTRA-HD · 300 DPI';
              ctx.font = 'bold 22px ' + F;
              const bw = ctx.measureText(badgeText).width + 36;
              const bx = PW - PAD_X - bw;
              const by = y + 10;
              drawPdfRoundRect(ctx, bx, by, bw, 44, 22);
              ctx.fillStyle = '#eff6ff';
              ctx.fill();
              ctx.strokeStyle = '#93c5fd';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.fillStyle = '#1d4ed8';
              ctx.fillText(badgeText, bx + 18, by + 30);

              y += it.height;
              return;
            }

            if (it.type === 'h2') {
              y += 18;
              // Modern accent marker bar
              ctx.fillStyle = '#2563eb';
              ctx.fillRect(PAD_X, y + 6, 8, it.lineHeight - 12);

              ctx.font = it.font;
              ctx.fillStyle = it.color;
              let textY = y + Math.round(it.lineHeight * 0.75);
              it.lines.forEach(function (w: string) {
                ctx.fillText(w, PAD_X + 24, textY);
                textY += it.lineHeight;
              });

              // Subtle bottom line
              ctx.fillStyle = '#e2e8f0';
              ctx.fillRect(PAD_X + 24, y + it.lineHeight + 6, MAX_W - 24, 2);

              y += it.height;
              return;
            }

            if (it.pillColor) {
              y += 10;
              const boxTop = y;
              const boxHeight = it.height - 12;

              drawPdfRoundRect(ctx, PAD_X, boxTop, MAX_W, boxHeight, 12);
              ctx.fillStyle = it.pillColor.bg;
              ctx.fill();
              ctx.strokeStyle = it.pillColor.border;
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.font = it.font;
              ctx.fillStyle = it.pillColor.text;
              let textY = boxTop + 38;
              it.lines.forEach(function (w: string) {
                ctx.fillText(w, PAD_X + 24, textY);
                textY += it.lineHeight;
              });

              y += it.height;
              return;
            }

            // Regular text
            ctx.font = it.font;
            ctx.fillStyle = it.color;
            let textY = y + Math.round(it.lineHeight * 0.75);
            it.lines.forEach(function (w: string) {
              ctx.fillText(w, PAD_X, textY);
              textY += it.lineHeight;
            });
            y += it.height;
          });

          // Ultra high quality JPEG (0.96) for razor-sharp vector-like text
          const bin = atob(pc.toDataURL('image/jpeg', 0.96).split(',')[1]);
          const u = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          pdfPages.push({ bytes: u, w: PW, h: PH });
        });

        cb(mkpdf(pdfPages));
      } catch (err) {
        console.error('Error generating HD PDF:', err);
        cb(null);
      }
    }

    function ov(h: string) {
      let o = document.getElementById('ov');
      if (!o) {
        o = document.createElement('div');
        o.id = 'ov';
        o.style.cssText =
          'position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding:12px;padding-top:calc(12px + env(safe-area-inset-top,0px))';
        document.body.appendChild(o);
      }
      o.innerHTML =
        '<button class="reset" id="ovx" style="margin:0 0 10px;width:100%">✕ Close</button>' +
        h;
      o.style.display = 'block';
      o.scrollTop = 0;
      const ovx = document.getElementById('ovx');
      if (ovx) {
        ovx.onclick = function () {
          if (o) o.style.display = 'none';
        };
      }
      const cc = document.getElementById('cc');
      if (cc) {
        cc.onclick = function () {
          const t = document.getElementById('ct') as HTMLTextAreaElement;
          let ok = false;
          if (t) {
            t.select();
            t.setSelectionRange(0, 999999);
            try {
              ok = document.execCommand('copy');
            } catch (e) {}
          }
          cc.textContent = ok ? 'Copied ✓' : 'Select all and copy manually';
        };
      }
    }

    const dl2 = document.getElementById('dl2');
    if (dl2) {
      dl2.addEventListener('click', function () {
        const lab = dl2.textContent;
        const nm = (S.nm || 'month').replace(/[^A-Za-z0-9_-]+/g, '-');
        const fn = 'journal-' + nm + '.pdf';
        function msg(t: string, ms = 2500) {
          dl2!.textContent = t;
          setTimeout(function () {
            dl2!.textContent = lab;
          }, ms);
        }
        dl2.textContent = 'Making HD PDF…';
        jpdf(function (blob: any) {
          if (!blob) {
            msg('Could not make PDF', 3000);
            return;
          }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fn;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            a.remove();
          }, 500);
          msg('Saved HD PDF ✓');
        });
      });
    }

    const dl = document.getElementById('dl');
    if (dl) {
      dl.addEventListener('click', function () {
        const lab = dl.textContent;
        const nm = (S.nm || 'month').replace(/[^A-Za-z0-9_-]+/g, '-');
        const fn = 'journal-' + nm + '.png';
        function msg(t: string, ms = 2500) {
          dl!.textContent = t;
          setTimeout(function () {
            dl!.textContent = lab;
          }, ms);
        }
        dl.textContent = 'Making HD image…';
        jpng(function (blob: any) {
          if (!blob) {
            msg('Could not make image', 3000);
            return;
          }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fn;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            a.remove();
          }, 500);
          msg('Saved ✓');
        });
      });
    }

    // Sessions setup
    const SESSIONS = [
      { n: 'Sydney', tz: 'Australia/Sydney', h: 7, c: '#00608f' },
      { n: 'Tokyo', tz: 'Asia/Tokyo', h: 9, c: '#00608f' },
      { n: 'London', tz: 'Europe/London', h: 8, c: '#00608f' },
      { n: 'New York', tz: 'America/New_York', h: 8, c: '#00608f' }
    ];
    const DUR = 540;
    const zones = [
      ['Asia/Dhaka', 'বাংলাদেশ (Dhaka)'],
      ['Asia/Kolkata', 'ভারত'],
      ['Asia/Dubai', 'দুবাই'],
      ['Asia/Riyadh', 'সৌদি আরব'],
      ['Asia/Kuala_Lumpur', 'মালয়েশিয়া'],
      ['Asia/Singapore', 'সিঙ্গাপুর'],
      ['Europe/London', 'লন্ডন'],
      ['America/New_York', 'নিউ ইয়র্ক'],
      ['UTC', 'UTC']
    ];
    const sel = document.getElementById('mstz') as HTMLSelectElement;
    let dflt = 'Asia/Dhaka';
    try {
      const b = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (b && !zones.some(z => z[0] === b)) zones.unshift([b, b + ' (আপনার ডিভাইস)']);
      else if (b) dflt = b;
    } catch (e) {}

    if (sel && sel.options.length === 0) {
      zones.forEach(z => {
        const o = document.createElement('option');
        o.value = z[0];
        o.textContent = z[1];
        sel.appendChild(o);
      });
      sel.value = dflt;
    }

    function parts(d: Date, tz: string) {
      const p: any = {};
      new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
        .formatToParts(d)
        .forEach(x => (p[x.type] = +x.value));
      return p;
    }

    function off(d: Date, tz: string) {
      const p = parts(d, tz);
      return (
        (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) -
          Math.floor(d.getTime() / 60000) * 60000) /
        60000
      );
    }

    function fmt(m: number) {
      m = ((m % 1440) + 1440) % 1440;
      let h = Math.floor(m / 60);
      const mi = m % 60;
      const s = h < 12 ? 'am' : 'pm';
      h = h % 12 || 12;
      return h + ':' + String(mi).padStart(2, '0') + s;
    }

    function renderSessions() {
      if (!sel) return;
      const tz = sel.value;
      const now = new Date();
      const ovOffset = off(now, tz);
      const p = parts(now, tz);
      const nm = p.hour * 60 + p.minute;
      const ax = document.getElementById('msaxis');
      if (ax) {
        ax.innerHTML = '';
        for (let h = 0; h < 24; h += 4) {
          const s = document.createElement('span');
          s.style.left = (h / 24) * 100 + '%';
          s.textContent = (h % 12 || 12) + (h < 12 ? 'am' : 'pm');
          ax.appendChild(s);
        }
      }

      const rows = document.getElementById('msrows');
      if (rows) {
        rows.innerHTML = '';
        for (let h = 2; h < 24; h += 2) {
          const g = document.createElement('div');
          g.className = 'msgrid';
          g.style.left = (h / 24) * 100 + '%';
          rows.appendChild(g);
        }
      }

      const list = document.getElementById('mslist');
      if (list) list.innerHTML = '';

      SESSIONS.forEach((s, i) => {
        const co = off(now, s.tz);
        const cp = parts(now, s.tz);
        const startUtc = Date.UTC(cp.year, cp.month - 1, cp.day, s.h, 0) - co * 60000;
        const startMin = ((Math.floor(startUtc / 60000) + ovOffset) % 1440 + 1440) % 1440;
        let open = false;
        for (let k = -1; k <= 0; k++) {
          const wd = new Date(Date.UTC(cp.year, cp.month - 1, cp.day + k)).getUTCDay();
          if (wd < 1 || wd > 5) continue;
          const stTime = Date.UTC(cp.year, cp.month - 1, cp.day + k, s.h, 0) - co * 60000;
          if (now.getTime() >= stTime && now.getTime() < stTime + DUR * 60000) open = true;
        }

        if (rows) {
          const row = document.createElement('div');
          row.className = 'msrow';
          row.style.top = 6 + i * 35 + 'px';
          const a = Math.min(DUR, 1440 - startMin);
          const mkSeg = (l: number, w: number) => {
            const d = document.createElement('div');
            d.className = 'msseg' + (open ? ' open' : '');
            d.style.background = open ? s.c : s.c + '44';
            d.style.borderColor = s.c;
            d.style.left = (l / 1440) * 100 + '%';
            d.style.width = (w / 1440) * 100 + '%';
            row.appendChild(d);
          };
          mkSeg(startMin, a);
          if (a < DUR) mkSeg(0, DUR - a);

          const lb = document.createElement('div');
          lb.className = 'mslbl';
          lb.style.left = ((a >= DUR / 2 || startMin === 0 ? startMin : 0) / 1440) * 100 + '%';
          lb.style.color = open ? '#fff' : 'var(--tx)';
          const cm = cp.hour * 60 + cp.minute;
          lb.innerHTML = '<b>' + s.n + '</b>' + fmt(cm);
          row.appendChild(lb);
          rows.appendChild(row);
        }

        if (list) {
          const it = document.createElement('div');
          it.className = 'msit';
          it.innerHTML =
            '<div><b>' +
            s.n +
            '</b><small>' +
            fmt(startMin) +
            ' – ' +
            fmt(startMin + DUR) +
            '</small></div><span class="msbadge' +
            (open ? ' on' : '') +
            '">' +
            (open ? 'খোলা' : 'বন্ধ') +
            '</span>';
          it.style.borderLeft = '5px solid ' + s.c;
          list.appendChild(it);
        }
      });

      if (rows) {
        const n = document.createElement('div');
        n.className = 'msnow';
        n.style.left = (nm / 1440) * 100 + '%';
        rows.appendChild(n);
      }
    }

    if (sel) sel.onchange = renderSessions;
    renderSessions();
    const sessionTimer = setInterval(renderSessions, 30000);

    // Dust title animation
    (function () {
      const el = document.getElementById('ty');
      if (!el) return;
      const T = 'MAHFUJ TRADING LOG';
      let i = 0;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = T;
        return;
      }
      function dust(done: () => void) {
        if (!el) return;
        const chars = T.split('');
        const fr = document.createDocumentFragment();
        el.textContent = '';
        el.classList.add('dusting');
        chars.forEach(function (c, k) {
          const f = k / (chars.length - 1);
          const col =
            'rgb(' +
            Math.round(56 + 199 * f) +
            ',' +
            Math.round(189 - 112 * f) +
            ',' +
            Math.round(248 - 139 * f) +
            ')';
          const sp = document.createElement('span');
          sp.className = 'dl';
          sp.textContent = c === ' ' ? '\u00a0' : c;
          sp.style.color = col;
          fr.appendChild(sp);
        });
        el.appendChild(fr);
        el.querySelectorAll('.dl').forEach(function (sp: any, k: number) {
          const wind = 60 + Math.random() * 90;
          sp.style.setProperty('--d', (k * 0.06).toFixed(2) + 's');
          sp.style.setProperty('--dx', wind + 'px');
          sp.style.setProperty('--dy', -30 - Math.random() * 70 + 'px');
          sp.style.setProperty('--r', Math.random() * 60 - 30 + 'deg');
          if (sp.textContent !== '\u00a0')
            for (let q = 0; q < 4; q++) {
              const p = document.createElement('span');
              p.className = 'dp';
              p.style.background = sp.style.color;
              p.style.left = sp.offsetLeft + Math.random() * sp.offsetWidth + 'px';
              p.style.top = sp.offsetTop + Math.random() * sp.offsetHeight * 0.8 + 'px';
              p.style.setProperty('--d', (k * 0.06 + Math.random() * 0.3).toFixed(2) + 's');
              p.style.setProperty('--dx', wind + Math.random() * 120 + 'px');
              p.style.setProperty('--dy', -60 - Math.random() * 110 + 'px');
              p.style.setProperty('--r', '0deg');
              el.appendChild(p);
            }
        });
        setTimeout(function () {
          if (!el) return;
          el.classList.remove('dusting');
          el.textContent = '';
          done();
        }, chars.length * 60 + 1600);
      }
      function step() {
        if (!el) return;
        i++;
        el.textContent = T.slice(0, i);
        if (i >= T.length) {
          setTimeout(function () {
            dust(function () {
              i = 0;
              setTimeout(step, 1200);
            });
          }, 3500);
          return;
        }
        setTimeout(step, 130);
      }
      el.textContent = '';
      setTimeout(step, 500);
    })();

    // Tour setup
    const TOUR = [
      [
        'স্বাগতম! 👋',
        'এটা আপনার <b>২০ দিনের ট্রেডিং জার্নাল</b>। প্রতিদিনের ট্রেড, নিয়ম মানা আর মনের অবস্থা লিখে রাখলে নিজের ভুল ধরা সহজ হয়। চলুন ছোট করে দেখে নিই কোথায় কী আছে।'
      ],
      [
        'মাস বেছে নিন',
        'সবার উপরে <b>Month</b> ঘর। প্রতি মাসের আলাদা লগ থাকে। মাস শেষে <b>+ New month</b> চাপলে নতুন ২০ দিনের লগ খুলবে, আর নতুন মাস ০ থেকে শুরু হবে। মাসের নাম বদলাতেও পারবেন।'
      ],
      [
        'ব্যালেন্স ও লস সীমা',
        '<b>Starting balance</b> এ আপনার ব্যালেন্স দিন। <b>Max daily loss</b> % বা $ যেকোনোটায় দিতে পারেন, অন্যটা নিজে হিসাব হবে। কোনো দিনের লস এই সীমায় পৌঁছালে সেই দিনের কার্ড লাল হয়ে সতর্ক করবে। <b>Daily / Total profit target</b> ঘরে টার্গেট লিখুন, টার্গেট ছুঁলে দিনের পাশে 🎯 আসবে আর ব্যালেন্স কার্ডে অগ্রগতির বার দেখাবে।'
      ],
      [
        'নম্বর ও ক্যালেন্ডার',
        '<b>Monthly numbers</b> এ ব্যালেন্স, গ্রাফ, Win rate, Profit factor সব নিজে নিজে হিসাব হয়। ২০ দিনের ক্যালেন্ডারে প্রফিটের দিন <b>সবুজ</b>, লসের দিন <b>লাল</b>, আর ঘরে ট্যাপ করলে সেই দিনের কার্ডে চলে যাবেন।'
      ],
      [
        'মার্কেট সেশন',
        '<b>ফরেক্স মার্কেট সেশন</b> অংশে Sydney, Tokyo, London ও New York বাজার কখন খোলা তা আপনার সময় অনুযায়ী দেখায়। সবুজ রেখা = এখনকার সময়, গাঢ় বার = সেশন খোলা। উপরের ঘর থেকে আপনার দেশের সময় বেছে নিন।'
      ],
      [
        'লট সাইজ ক্যালকুলেটর',
        '<b>🧮 লট সাইজ ক্যালকুলেটর</b> অংশে কয়টা ট্রেড নেবেন, Stop loss (pips) লিখে একটা রিস্ক মোড (Safe / Medium Risk / High Risk) বাছলে (এমাউন্ট ও ঝুঁকি % নিজে থেকে <b>Starting balance</b> ও <b>Max daily loss (%)</b> থেকে আসবে), প্রতি ট্রেডে কত লট নেওয়া ভালো তা বলে দেবে। নিচের তালিকায় বেশি এমাউন্টে কত লট হবে সেটাও দেখাবে।'
      ],
      [
        'দিনের কার্ড (১)',
        'প্রতিদিনের কার্ডে উপর থেকে: <b>Control your emotion</b> আবেগ ধরে রাখতে পারলে ট্যাপ করুন ✅। <b>Rules check</b> খুলে প্রতিটা নিয়মে একবার ট্যাপ = ✓ মেনেছি, দুবার = ✗ ভেঙেছি। <b>Pre-trade checklist</b> ট্রেডের আগে মিলিয়ে নিন: একবার ট্যাপ = ✓ মেনেছি, দুবার = ❌ মানিনি। ফাঁকা বা ❌ থাকলে ট্রেড নয়।'
      ],
      [
        'দিনের কার্ড (২)',
        'ট্রেডের ঘরে <b>Pair</b> লিখুন (যেমন XAUUSD), <b>Dir.</b> এ B = কিনেছি, S = বিক্রি। <b>A+ Set</b> এ সেরা সেটআপ হলে ট্যাপ করুন (একবার Yes, আবার No)। <b>P/L ($)</b> এ লাভ বা লস লিখুন, আর <b>Pips</b> এ কত পিপস লাভ বা লস হলো লিখুন। লস হলে দুটোতেই আগে মাইনাস (-) দিন। দিনে সর্বোচ্চ ৩টি ট্রেড।'
      ],
      [
        'দিন শেষে',
        '<b>Biggest mistake</b> এ আজকের সবচেয়ে বড় ভুল, <b>Next day focus</b> এ কাল কোন বিষয়ে মনোযোগ দেবেন, <b>Mood</b> এ তারা (১ = মন খারাপ/রাগ, ৫ = শান্ত), আর <b>Notes</b> এ যা ইচ্ছা লিখুন। সব লেখা এই ফোনের ব্রাউজারে নিজে থেকে সেভ হয়।'
      ],
      [
        'জার্নাল সেভ করুন',
        'উপরের <b>Download PDF</b> ও <b>Download image</b> বাটনে চাপলে পুরো মাসের জার্নাল সেভ হবে। অন্য ফোন বা ব্রাউজারে লগ নিতে চাইলে <b>Backup</b> বাটনে ফাইল নিয়ে সেখানে <b>Restore</b> দিন। পরে যেকোনো সময় বাম নিচের <b>?</b> বাটনে চাপলে এই গাইড আবার দেখতে পারবেন। শুভ ট্রেডিং! 🚀'
      ]
    ];

    function tour(i: number) {
      let o = document.getElementById('tour');
      if (!o) {
        o = document.createElement('div');
        o.id = 'tour';
        document.body.appendChild(o);
      }
      if (i >= TOUR.length) {
        o.style.display = 'none';
        try {
          localStorage.setItem('mh-tour-done', '1');
        } catch (e) {}
        return;
      }
      const t = TOUR[i];
      o.style.display = 'flex';
      o.innerHTML =
        '<div class="tbox"><div class="tstep">' +
        (i + 1) +
        ' / ' +
        TOUR.length +
        '</div><h3>' +
        t[0] +
        '</h3><p>' +
        t[1] +
        '</p><div class="tbtn"><button class="tskip">বাদ দিন</button><button class="tnext">' +
        (i === TOUR.length - 1 ? 'শুরু করি' : 'পরের ধাপ →') +
        '</button></div></div>';
      (o.querySelector('.tskip') as HTMLElement).onclick = function () {
        tour(99);
      };
      (o.querySelector('.tnext') as HTMLElement).onclick = function () {
        tour(i + 1);
      };
    }

    // Backup & Restore
    const bk = document.getElementById('bk');
    const rs = document.getElementById('rs') as any;
    const rf = document.getElementById('rsf') as HTMLInputElement;

    function stamp() {
      const d = new Date();
      return (
        d.getFullYear() +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + d.getDate()).slice(-2)
      );
    }
    function flash(b: any, t: string, ms = 3000) {
      if (b._o == null) b._o = b.textContent;
      b.textContent = t;
      clearTimeout(b._f);
      b._f = setTimeout(function () {
        b.textContent = b._o;
        b._o = null;
      }, ms);
    }

    if (bk) {
      bk.addEventListener('click', function () {
        save();
        const txt = JSON.stringify(
          { app: 'mahfuj-trading-log', v: 1, saved: new Date().toISOString(), data: ST },
          null,
          2
        );
        const fn = 'trading-log-backup-' + stamp() + '.json';
        const blob = new Blob([txt], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          a.remove();
        }, 500);
        flash(bk, 'Saved ✓');
      });
    }

    let pend: any = null;
    function applyRestore() {
      ST = pend;
      if (!(ST.c >= 0 && ST.c < ST.m.length)) ST.c = 0;
      pend = null;
      rs._armed = false;
      load();
      save();
      flash(rs, 'Restored ✓', 3000);
      window.scrollTo(0, 0);
    }

    if (rs && rf) {
      rs.addEventListener('click', function () {
        if (pend && rs._armed) {
          applyRestore();
          return;
        }
        rf.value = '';
        rf.click();
      });

      rf.addEventListener('change', function () {
        const f = rf.files && rf.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = function () {
          try {
            const o = JSON.parse(r.result as string);
            const d = o && o.data ? o.data : o;
            pend = cleanState(d);
            rs._armed = true;
            flash(rs, 'Tap again to restore ' + pend.m.length + ' month(s)', 6000);
            setTimeout(function () {
              pend = null;
              rs._armed = false;
            }, 6000);
          } catch (e) {
            flash(rs, 'Invalid backup file', 3500);
          }
        };
        r.readAsText(f);
      });
    }

    // Lot Size Calculator logic
    (function () {
      const E: any = {};
      ['lct', 'lcs', 'lci', 'lcp', 'lcn', 'lcnw'].forEach(function (k) {
        E[k] = document.getElementById(k);
      });
      const out = document.getElementById('lcout');
      if (!out || !E.lcp) return;

      const INST: Record<string, number> = {
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
      const MODES: Record<string, { s: number; l: string }> = {
        safe: { s: 1 / 3, l: 'Safe' },
        medium: { s: 2 / 3, l: 'Medium Risk' },
        high: { s: 1, l: 'High Risk' }
      };
      const PLAN: Record<string, { name: string; d?: number }> = {
        '1': { name: 'Phase 1' },
        '2': { name: 'Phase 2' },
        live: { d: 20, name: 'Instant' }
      };

      let mode = 'medium';
      let acct = 'live';
      let ph = '1';
      let opt = '10';
      let pt = '2';
      let dc = '7';
      let dp = '0.5';

      const startEl = document.getElementById('start') as HTMLInputElement;
      const maxdEl = document.getElementById('maxd') as HTMLInputElement;
      const dtgt = document.getElementById('dtgt') as HTMLInputElement;
      const mtgt = document.getElementById('mtgt') as HTMLInputElement;

      function dailyNow() {
        const b = (num(startEl?.value) || 10000) / 10000;
        const pc = Number(opt) || (ph === '2' ? 8 : 10);
        const base = ph === '1' ? pc * 10 : Math.max(25, Math.round((pc * 100) / 12));
        return Math.round(base * b * 100) / 100;
      }

      function lotCalc(b: number, t: number, r: number, sl: number, pv: number) {
        const tot = (b * r) / 100;
        const per = tot / t;
        const raw = per / (sl * pv);
        return { tot, per, raw, lot: Math.floor(raw * 100 + 1e-9) / 100 };
      }

      function lt(x: number) {
        return x >= 0.01 ? x.toFixed(2) : '<0.01';
      }
      function pipVal() {
        return num(E.lcp.value);
      }

      function profitDays() {
        const startBal = num(startEl?.value) || 0;
        let bal = startBal;
        let n = 0;
        let tot = 0;
        const rate = dp === '0.25' ? 0.0025 : 0.005;
        S.d.forEach(function (d: any) {
          let sum = 0;
          let any = false;
          d.t.forEach(function (t: any) {
            const v = num(t.pl);
            if (!isNaN(v)) {
              sum += v;
              any = true;
            }
          });
          if (any) {
            tot++;
            // Instant account: day counts if profit is at least selected % (0.25% or 0.5%) of balance
            const isProfitable =
              sum > 0 &&
              ((startBal > 0 && sum >= startBal * rate) ||
                (bal > 0 && sum >= bal * rate));
            if (isProfitable) n++;
          }
          bal += sum;
        });
        return { n, tot };
      }

      function renderProp() {
        const box = document.getElementById('propbox');
        if (!box) return;
        if (acct !== 'prop') {
          box.style.display = 'none';
          return;
        }
        box.style.display = '';
        const P = PLAN[ph];
        const T = num(mtgt?.value);
        const ml = num(maxdEl?.value);
        let h = '';
        let d: number;
        if (!(T > 0)) {
          box.innerHTML =
            '<div class="lcln">Enter a total profit target to see how many days it will take.</div>';
          return;
        }
        if (ph === 'live') {
          const b = num(startEl?.value) || 0;
          const rate = dp === '0.25' ? 0.0025 : 0.005;
          const instTarget = b > 0 ? Math.round(b * rate * 100) / 100 : (dp === '0.25' ? 25 : 50);
          d = pt === 'i' ? (num(dtgt?.value) > 0 ? num(dtgt.value) : instTarget) : T / (P.d || 20);
          const pctLabel = dp === '0.25' ? '০.২৫%' : '০.৫%';
          h +=
            '<div class="lcln"><b>' +
            (pt === 'i' ? 'Instant' : 'Prop Live') +
            '</b> · Monthly target <b>$' +
            money(T) +
            '</b> (5% of balance)</div>';
          h +=
            '<div class="lcln">Daily target <b>$' +
            money(d) +
            '</b> ' +
            (pt === 'i' ? '(ব্যালেন্সের ' + pctLabel + ' · ' + dc + ' দিনে)' : '(' + (P.d || 20) + ' দিনে)') +
            '</div>';
          h +=
            '<div class="lcln">To keep the funded account safe, do not trade beyond the target and do not raise the daily loss limit.</div>';
        } else {
          d = dailyNow();
          const n = Math.ceil(T / d);
          h += '<div class="lcln"><b>' + P.name + '</b> · Target <b>$' + money(T) + '</b></div>';
          h +=
            '<div class="lcln">Daily target <b>$' +
            money(d) +
            '</b> → about <b>' +
            n +
            ' days</b> to hit target</div>';
          h +=
            '<div class="lcln">Once the daily target is hit, stop trading for the day.' +
            (ph === '2' ? ' Phase 2 is usually harder, so staying steady is best.' : '') +
            '</div>';
          h +=
            '<div class="lcln">Prop firms often require a minimum number of trading days (often 4). Check your firm’s rules.</div>';
        }
        if (ph === 'live' && pt === 'i') {
          const pdays = profitDays();
          const tg = Number(dc);
          const pctLabel = dp === '0.25' ? '০.২৫%' : '০.৫%';
          h +=
            '<div class="lcln">লাভের দিন: <b>' +
            pdays.n +
            ' / ' +
            tg +
            '</b> (দিনের ব্যালেন্সের ' + pctLabel + ' লাভ হলে দিন গোনা হবে) · ' +
            (pdays.n >= tg ? '🎯 টার্গেট পূর্ণ হয়েছে' : tg - pdays.n + ' দিন বাকি') +
            '</div>';
        }
        if (ml > 0 && d > ml)
          h +=
            '<div class="lcwarn">⚠ Daily target is higher than Max daily loss. Extend the time.</div>';
        box.innerHTML = h;
      }

      function renderLot() {
        renderProp();
        const b = num(startEl?.value);
        const maxl = num((document.getElementById('maxl') as HTMLInputElement)?.value);
        const t = num(E.lct?.value);
        const sl = num(E.lcs?.value);
        const pv = pipVal();
        const mp = MODES[mode];
        const maxd = num(maxdEl?.value);
        const dayCap = maxd > 0 ? maxd : maxl > 0 && b > 0 ? (b * maxl) / 100 : 0;
        const r = b > 0 && dayCap > 0 ? ((dayCap * mp.s) / b) * 100 : 0;

        if (!out) return;
        if (!(b > 0 && t > 0 && r > 0 && sl > 0 && pv > 0)) {
          out.innerHTML =
            '<div class="nmsg" style="padding:6px 2px;color:var(--mut)">Lot size দেখতে Starting balance, trades, stop loss এবং সঠিক Pip value দিন। Custom instrument হলে Pip value নিজে লিখুন।</div>';
          return;
        }
        const c = lotCalc(b, t, r, sl, pv);
        const use = c.lot >= 0.01 ? c.lot : 0.01;
        const risk = use * sl * pv;
        let h = '';
        h +=
          '<div class="lcbig"><span>Lot size per trade</span><b>' +
          use.toFixed(2) +
          '</b><span>' +
          t +
          ' trades, each</span></div>';
        h +=
          '<div class="lcln">' +
          mp.l +
          ' mode (' +
          Math.round(mp.s * 100) +
          '% of Max daily loss): total daily risk <b>' +
          money(c.tot) +
          '</b> → risk per trade <b>' +
          money(c.per) +
          '</b></div>';
        h +=
          '<div class="lcln">এই ফলাফল আপনার দেওয়া Pip value-এর ওপর নির্ভরশীল। ব্রোকারে মিলিয়ে নিন।</div>';
        if (dayCap > 0)
          h += '<div class="lcln">Max daily loss: <b>' + money(dayCap) + '</b></div>';
        h +=
          '<div class="lcln">' +
          sl +
          ' pips stop loss, one trade loses about <b>' +
          money(risk) +
          '</b>. 1:2 target (' +
          sl * 2 +
          ' pips) profit about <b>' +
          money(risk * 2) +
          '</b>।</div>';
        if (c.lot < 0.01)
          h +=
            '<div class="lcwarn">⚠ At this amount the calculated lot is below 0.01. Taking the minimum 0.01 makes the risk ' +
            money(0.01 * sl * pv) +
            ' which is more than your set ' +
            money(c.per) +
            ' . Take fewer trades, use a smaller stop loss, or increase the amount.</div>';
        h += '<table><tr><th>Amount</th><th>Risk/trade</th><th>Lot/trade</th></tr>';
        const d2 = lotCalc(b, t, r, sl, pv);
        h +=
          '<tr style="font-weight:800"><td>' +
          money(b) +
          ' ← yours</td><td>' +
          money(d2.per) +
          '</td><td>' +
          lt(d2.lot) +
          '</td></tr>';
        h += '</table>';
        out.innerHTML = h;
      }

      function store() {
        S.lot = {
          t: E.lct?.value,
          s: E.lcs?.value,
          i: E.lci?.value,
          p: E.lcp?.value,
          n: E.lcn?.value,
          m: mode,
          a: acct,
          ph,
          o: opt,
          pt,
          dc,
          dp
        };
        save();
      }

      function markBtns() {
        document.querySelectorAll('#dcs button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-dc') === dc);
        });
        document.querySelectorAll('#idp button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-dp') === dp);
        });
        document.querySelectorAll('#lcpt button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-pt') === pt);
        });
        const tp = document.getElementById('tpct');
        if (tp)
          tp.textContent = acct === 'prop' ? (ph === 'live' ? '= 5%' : '= ' + opt + '%') : '';
        document.querySelectorAll('#lcm button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-m') === mode);
        });
        document.querySelectorAll('#lca button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-a') === acct);
        });
        document.querySelectorAll('#lcph button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-ph') === ph);
        });
        document.querySelectorAll('#tpick button').forEach(function (x: any) {
          x.classList.toggle('on', x.getAttribute('data-p') === opt);
        });

        // Update trigger texts
        const lcaTrig = document.getElementById('lca_trig');
        if (lcaTrig) {
          const txt = acct === 'prop' ? 'Prop Firm' : 'Live Capital';
          lcaTrig.innerHTML = '<span>' + txt + '</span><span class="arr">▾</span>';
        }
        const lcptTrig = document.getElementById('lcpt_trig');
        if (lcptTrig) {
          const ptMap: any = { '1': '1-Step', '2': '2-Step', 'i': 'Instant' };
          lcptTrig.innerHTML = '<span>' + (ptMap[pt] || '1-Step') + '</span><span class="arr">▾</span>';
        }
        const lcphTrig = document.getElementById('lcph_trig');
        if (lcphTrig) {
          const phMap: any = { '1': 'Phase 1', '2': 'Phase 2', 'live': 'Prop Live' };
          lcphTrig.innerHTML = '<span>' + (phMap[ph] || 'Phase 1') + '</span><span class="arr">▾</span>';
        }
        const lcmTrig = document.getElementById('lcm_trig');
        if (lcmTrig) {
          const mMap: any = { safe: 'Safe', medium: 'Medium Risk', high: 'High Risk' };
          lcmTrig.innerHTML = '<span>' + (mMap[mode] || 'Medium Risk') + '</span><span class="arr">▾</span>';
        }
        const idpTrig = document.getElementById('idp_trig');
        if (idpTrig) {
          const dpTxt = dp === '0.25' ? '০.২৫%' : '০.৫%';
          idpTrig.innerHTML = '<span>' + dpTxt + '</span><span class="arr">▾</span>';
        }
        const dcsTrig = document.getElementById('dcs_trig');
        if (dcsTrig) {
          dcsTrig.innerHTML = '<span>' + dc + ' দিন</span><span class="arr">▾</span>';
        }
      }

      function allowedPcts() {
        if (pt === '1') return [12, 10, 9, 8, 7, 6];
        if (pt === '2') return ph === '2' ? [8, 6, 5, 4] : [10, 8, 6];
        return [10, 8, 6];
      }

      function syncLot() {
        if (E.lcnw) E.lcnw.style.display = E.lci?.value === 'custom' ? '' : 'none';
        const pr = acct === 'prop';
        const lcptWrap = document.getElementById('lcpt_wrap');
        if (lcptWrap) lcptWrap.style.display = pr ? '' : 'none';
        const lcphWrap = document.getElementById('lcph_wrap');
        if (lcphWrap) lcphWrap.style.display = pr && pt !== 'i' ? '' : 'none';
        const ph2Btn = document.querySelector('#lcph [data-ph="2"]') as HTMLElement;
        if (ph2Btn) ph2Btn.style.display = pt === '2' ? '' : 'none';
        const mindwEl = document.getElementById('mindw');
        if (mindwEl) mindwEl.style.display = pr && pt === 'i' ? '' : 'none';
        const tpickEl = document.getElementById('tpick');
        if (tpickEl && !(pr && ph !== 'live')) tpickEl.style.display = 'none';
        document.querySelectorAll('#tpick button').forEach(function (x: any) {
          const pc = Number(x.getAttribute('data-p'));
          x.style.display = allowedPcts().indexOf(pc) >= 0 ? '' : 'none';
        });
      }

      function refreshPick() {
        const b = num(startEl?.value);
        document.querySelectorAll('#tpick button').forEach(function (x: any) {
          const pc = Number(x.getAttribute('data-p'));
          x.textContent = b > 0 ? pc + '% · $' + Math.round((b * pc) / 100) : pc + '%';
        });
      }

      function setLossFromDaily(d: number) {
        const bal = num(startEl?.value);
        if (!(d > 0) || !(bal > 0)) return;
        S.l = String(+((d / bal) * 100).toFixed(2));
        const maxlEl = document.getElementById('maxl') as HTMLInputElement;
        if (maxlEl) maxlEl.value = S.l;
        syncD();
      }

      function snapPct(v: number) {
        const a = allowedPcts();
        let best = a[0];
        a.forEach(function (x) {
          if (Math.abs(x - v) < Math.abs(best - v)) best = x;
        });
        return String(best);
      }

      function applyProp() {
        if (acct !== 'prop' || ph === 'live') return;
        const b = num(startEl?.value);
        if (!(b > 0)) return;
        opt = snapPct(Number(opt));
        const T = Math.round(((b * Number(opt)) / 100) * 100) / 100;
        if (mtgt) mtgt.value = String(T);
        S.mt = String(T);
        const d = dailyNow();
        if (dtgt) dtgt.value = String(d);
        S.dt = String(d);
        setLossFromDaily(d);
        save();
        refreshPick();
        update();
      }

      function autoTarget() {
        if (acct !== 'prop') return;
        if (ph === 'live') {
          const b = num(startEl?.value);
          if (!(b > 0)) return;
          const T = Math.round(b * 0.05 * 100) / 100;
          if (mtgt) mtgt.value = String(T);
          S.mt = String(T);
          const rate = dp === '0.25' ? 0.0025 : 0.005;
          const d = pt === 'i' ? Math.round(b * rate * 100) / 100 : Math.round((T / (PLAN.live.d || 20)) * 100) / 100;
          if (dtgt) dtgt.value = String(d);
          S.dt = String(d);
          setLossFromDaily(d);
          save();
          update();
          return;
        }
        if (!(num(startEl?.value) > 0)) {
          if (startEl) startEl.value = '10000';
          S.s = '10000';
          if ((window as any).updStartK) (window as any).updStartK();
        }
        applyProp();
      }

      if (startEl) {
        startEl.addEventListener('input', function () {
          if (acct === 'prop' && ph !== 'live') applyProp();
          if (acct === 'prop' && ph === 'live' && pt === 'i') autoTarget();
          refreshPick();
        });
      }

      function setPT(n: string) {
        pt = n;
        if (n === '1') ph = '1';
        if (n === 'i') ph = 'live';
        if (n === '2' && ph !== '1' && ph !== '2' && ph !== 'live') ph = '1';
        const allowed = allowedPcts();
        if (!allowed.includes(Number(opt))) {
          opt = String(allowed[0]);
        }
      }

      function saveSnap(k: string) {
        S.snap = S.snap || {};
        S.snap[k] = {
          s: startEl?.value,
          dt: dtgt?.value,
          mt: mtgt?.value,
          l: S.l
        };
      }

      function loadSnap(k: string) {
        const sn = S.snap && S.snap[k];
        if (!sn) return false;
        if (startEl) startEl.value = sn.s;
        if (dtgt) dtgt.value = sn.dt;
        if (mtgt) mtgt.value = sn.mt;
        S.s = sn.s;
        S.dt = sn.dt;
        S.mt = sn.mt;
        if (sn.l !== undefined) {
          S.l = sn.l;
          const mlEl = document.getElementById('maxl') as HTMLInputElement;
          if (mlEl) mlEl.value = sn.l;
          syncD();
        }
        if ((window as any).updStartK) (window as any).updStartK();
        return true;
      }

      function switchAcct(n: string) {
        if (n === acct) return;
        saveSnap(acct);
        acct = n;
        if (acct === 'live') {
          loadSnap('live');
        } else if (!loadSnap('prop')) {
          if (startEl) startEl.value = '10000';
          S.s = '10000';
          if ((window as any).updStartK) (window as any).updStartK();
          autoTarget();
        }
        save();
        markBtns();
        syncLot();
        store();
        renderLot();
      }

      if (E.lci) {
        E.lci.addEventListener('change', function () {
          const k = E.lci.value;
          E.lcp.value = INST[k] != null ? String(INST[k]) : '';
          syncLot();
          store();
          renderLot();
        });
      }

      ['lct', 'lcs', 'lcp', 'lcn'].forEach(function (k) {
        if (E[k]) {
          E[k].addEventListener('input', function () {
            store();
            renderLot();
          });
        }
      });

      ['start', 'maxl', 'maxd'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', function () {
            renderLot();
          });
        }
      });

      if (mtgt) {
        mtgt.addEventListener('input', function () {
          if (acct === 'prop' && ph !== 'live') {
            const T = num(mtgt.value);
            const b = num(startEl?.value);
            if (T > 0 && b > 0) {
              const pc = Math.round((T / b) * 100);
              opt = snapPct(pc);
              const d = dailyNow();
              if (dtgt) dtgt.value = String(d);
              S.dt = String(d);
              save();
            }
          }
          markBtns();
          renderLot();
        });

        mtgt.addEventListener('focus', openPick);
        mtgt.addEventListener('click', openPick);
      }

      function openPick() {
        const tpickEl = document.getElementById('tpick');
        if (tpickEl && acct === 'prop' && ph !== 'live') tpickEl.style.display = 'grid';
      }

      document.querySelectorAll('#tpick button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          opt = x.getAttribute('data-p');
          const tpickEl = document.getElementById('tpick');
          if (tpickEl) tpickEl.style.display = 'none';
          applyProp();
          store();
          markBtns();
          renderLot();
        });
      });

      document.addEventListener('click', function (e: any) {
        const tpickEl = document.getElementById('tpick');
        if (!tpickEl || tpickEl.style.display === 'none') return;
        if (mtgt && (mtgt === e.target || mtgt.contains(e.target))) return;
        if (tpickEl === e.target || tpickEl.contains(e.target)) return;
        tpickEl.style.display = 'none';
      });

      document.querySelectorAll('#lcm button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          mode = x.getAttribute('data-m');
          markBtns();
          store();
          renderLot();
        });
      });

      document.querySelectorAll('#lca button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          switchAcct(x.getAttribute('data-a'));
        });
      });

      document.querySelectorAll('#lcph button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          ph = x.getAttribute('data-ph');
          const allowed = allowedPcts();
          if (!allowed.includes(Number(opt))) {
            opt = String(allowed[0]);
          }
          markBtns();
          syncLot();
          autoTarget();
          store();
          renderLot();
        });
      });

      document.querySelectorAll('#lcpt button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          setPT(x.getAttribute('data-pt'));
          markBtns();
          syncLot();
          autoTarget();
          store();
          renderLot();
        });
      });

      document.querySelectorAll('#dcs button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          dc = x.getAttribute('data-dc');
          markBtns();
          store();
          renderLot();
        });
      });

      document.querySelectorAll('#idp button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          dp = x.getAttribute('data-dp') || '0.5';
          markBtns();
          autoTarget();
          store();
          renderLot();
        });
      });

      function setupDrop(trigId: string, bodyId: string) {
        const trig = document.getElementById(trigId);
        const body = document.getElementById(bodyId);
        if (!trig || !body) return;
        trig.addEventListener('click', function (e) {
          e.stopPropagation();
          const isOpen = body.style.display !== 'none';
          document.querySelectorAll('.drop-body').forEach(function (el: any) {
            el.style.display = 'none';
          });
          document.querySelectorAll('.drop-trig').forEach(function (el: any) {
            el.classList.remove('open');
          });
          if (!isOpen) {
            body.style.display = 'grid';
            trig.classList.add('open');
          }
        });
      }

      setupDrop('lca_trig', 'lca');
      setupDrop('lcpt_trig', 'lcpt');
      setupDrop('lcph_trig', 'lcph');
      setupDrop('lcm_trig', 'lcm');
      setupDrop('idp_trig', 'idp');
      setupDrop('dcs_trig', 'dcs');

      document.querySelectorAll('.drop-body button').forEach(function (x: any) {
        x.addEventListener('click', function () {
          const body = x.closest('.drop-body');
          if (body) (body as HTMLElement).style.display = 'none';
          const wrap = x.closest('.drop-wrap');
          if (wrap) {
            const trig = wrap.querySelector('.drop-trig');
            if (trig) trig.classList.remove('open');
          }
        });
      });

      document.addEventListener('click', function (e: any) {
        if (!e.target.closest('.drop-wrap')) {
          document.querySelectorAll('.drop-body').forEach(function (el: any) {
            (el as HTMLElement).style.display = 'none';
          });
          document.querySelectorAll('.drop-trig').forEach(function (el: any) {
            el.classList.remove('open');
          });
        }
      });

      (window as any).lcLoad = function () {
        const L = S.lot || {};
        if (E.lct) E.lct.value = L.t || 3;
        if (E.lcs) E.lcs.value = L.s || 20;
        if (E.lci) E.lci.value = L.i && (INST[L.i] != null || L.i === 'custom') ? L.i : 'eurusd';
        if (E.lcp)
          E.lcp.value =
            L.p !== undefined && L.p !== ''
              ? L.p
              : INST[E.lci?.value] != null
              ? String(INST[E.lci?.value])
              : '';
        if (E.lcn) E.lcn.value = L.n || '';
        mode = MODES[L.m] ? L.m : 'medium';
        acct = L.a === 'prop' ? 'prop' : 'live';
        opt = L.o && /^(4|5|6|7|8|9|10|12)$/.test(L.o) ? L.o : '10';
        ph = L.ph === '2' || L.ph === 'live' ? L.ph : '1';
        pt = /^(1|2|i)$/.test(L.pt) ? L.pt : '2';
        if (pt === '1' && ph === '2') ph = '1';
        if (pt === 'i') ph = 'live';
        dc = /^(7|5|4)$/.test(L.dc) ? L.dc : '7';
        dp = L.dp === '0.25' ? '0.25' : '0.5';
        markBtns();
        syncLot();
        refreshPick();
        renderLot();
      };
    })();

    // Shorthand e.g. "= 10k"
    (function () {
      const startInput = document.getElementById('start') as HTMLInputElement;
      const sk = document.getElementById('startk');
      function f() {
        if (!startInput || !sk) return;
        const v = parseFloat(startInput.value);
        sk.textContent = v >= 1000 ? '= ' + parseFloat((v / 1000).toFixed(2)) + 'k' : '';
      }
      (window as any).updStartK = f;
      if (startInput) startInput.addEventListener('input', f);
      f();
    })();

    const helpBtn = document.getElementById('help');
    if (helpBtn) {
      helpBtn.addEventListener('click', function () {
        tour(0);
      });
    }

    const totopBtn = document.getElementById('totop');
    if (totopBtn) {
      totopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    load();

    try {
      if (!localStorage.getItem('mh-tour-done')) tour(0);
    } catch (e) {}

    return () => {
      clearInterval(sessionTimer);
    };
  }, []);

  return (
    <>
      <h1 aria-label="Mahfuj’s Trading Log">
        <span id="ty">MAHFUJ TRADING LOG</span>
      </h1>

      <div className="card" style={{ marginBottom: '14px', padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mut)', fontWeight: 700 }}>
              📅 ক্যালেন্ডার ও ট্রেডিং মাস
            </div>
            <div id="cur_month_title" style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              November 2026 (30 দিন)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button type="button" className="cal-nav-btn" id="m_prev_btn" title="পূর্ববর্তী মাস">
              ◀
            </button>
            <button type="button" className="cal-nav-btn" id="m_today_btn" style={{ fontSize: '11.5px', padding: '0 10px', width: 'auto', fontWeight: 600 }}>
              📅 বর্তমান মাস
            </button>
            <button type="button" className="cal-nav-btn" id="m_next_btn" title="পরবর্তী মাস">
              ▶
            </button>
          </div>
        </div>

        <div className="two" style={{ marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '11.5px' }}>মাস (Month)</label>
            <select id="m_month_select" style={{ fontSize: '13px' }}></select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px' }}>বছর (Year)</label>
            <select id="m_year_select" style={{ fontSize: '13px' }}></select>
          </div>
        </div>

        <div className="two" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '11.5px' }}>সেভ করা মাসের ট্যাব</label>
            <select id="msel" style={{ fontSize: '13px' }}></select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px' }}>&nbsp;</label>
            <button className="reset" id="newm" style={{ margin: 0, width: '100%', height: '40px', fontSize: '12px', padding: '0 8px' }}>
              + নতুন মাস
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11.5px' }}>মাসের নাম / নোট (কাস্টমাইজ করতে পারেন)</label>
          <input id="mname" type="text" placeholder="যেমন: November 2026 - Phase 1" style={{ fontSize: '13px' }} />
        </div>
      </div>

      <div id="dls" style={{ marginBottom: '10px' }}>
        <button className="reset" id="dl2" style={{ margin: '0 0 6px', width: '100%' }}>
          ⬇ Download HD PDF (300 DPI · সব ডেটা)
        </button>
        <button className="reset" id="dl" style={{ margin: 0, width: '100%' }}>
          ⬇ Download HD Image (PNG)
        </button>
      </div>

      <h2>🌍 ফরেক্স মার্কেট সেশন</h2>
      <div id="ms">
        <select id="mstz"></select>
        <div className="msc">
          <div className="mshdr">Sessions</div>
          <div className="msaxis" id="msaxis"></div>
          <div className="msrows" id="msrows"></div>
        </div>
        <div className="mslist" id="mslist"></div>
        <div className="msnote">
          সবুজ রেখা = এখন। গাঢ় বার = সেশন খোলা। শনি ও রবিবার ফরেক্স বাজার বন্ধ থাকে।
        </div>
      </div>

      <p className="sub">
        Tap rules to cycle Y / N. Each month is saved separately on this device. A new month starts
        from 0.
      </p>

      <div className="card two" id="scard">
        <div style={{ gridColumn: '1/-1' }}>
          <label>
            Starting balance ($) <span id="startk" style={{ color: 'var(--gn)' }}></span>
          </label>
          <input id="start" type="number" inputMode="decimal" />
        </div>
        <div>
          <label>Max daily loss (%)</label>
          <input id="maxl" type="number" inputMode="decimal" step="0.1" />
        </div>
        <div>
          <label>Max daily loss ($)</label>
          <input id="maxd" type="number" inputMode="decimal" step="any" />
        </div>
        <div>
          <label>Daily profit target ($)</label>
          <input id="dtgt" type="number" inputMode="decimal" step="any" placeholder="e.g. 20" />
        </div>
        <div>
          <label>Total profit target ($)</label>
          <div style={{ position: 'relative' }}>
            <input
              id="mtgt"
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="e.g. 400"
              style={{ paddingRight: '64px' }}
            />
            <span
              id="tpct"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gn)',
                fontWeight: 700,
                pointerEvents: 'none'
              }}
            ></span>
            <div
              id="tpick"
              style={{
                display: 'none',
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '6px',
                width: '220px',
                zIndex: 30,
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                padding: '8px',
                background: 'var(--card)',
                border: '1px solid var(--bd)',
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(0,0,0,.35)'
              }}
            >
              <button data-p="12" className="pickbtn">
                12%
              </button>
              <button data-p="10" className="pickbtn">
                10%
              </button>
              <button data-p="9" className="pickbtn">
                9%
              </button>
              <button data-p="8" className="pickbtn">
                8%
              </button>
              <button data-p="7" className="pickbtn">
                7%
              </button>
              <button data-p="6" className="pickbtn">
                6%
              </button>
              <button data-p="5" className="pickbtn">
                5%
              </button>
              <button data-p="4" className="pickbtn">
                4%
              </button>
            </div>
          </div>
        </div>

        <h2 style={{ margin: '12px 0 6px', gridColumn: '1/-1', fontSize: '15px' }}>🧮 Lot Size Calculator</h2>
        <div id="lc" style={{ gridColumn: '1/-1' }}>
          <div className="two">
            <div>
              <label>Trades per day</label>
              <input id="lct" type="number" inputMode="numeric" step="1" placeholder="3" />
            </div>
            <div>
              <label>Stop loss (pips)</label>
              <input id="lcs" type="number" inputMode="decimal" step="any" placeholder="20" />
            </div>
            <div>
              <label>Instrument</label>
              <select id="lci">
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
            <div id="lcnw" style={{ display: 'none' }}>
              <label>Instrument name</label>
              <input id="lcn" type="text" placeholder="e.g. NAS100" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Pip value per 1.00 lot ($) — broker অনুযায়ী দিন</label>
              <input
                id="lcp"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="যেমন 10"
              />
            </div>
          </div>

          {/* Account Type Dropdown */}
          <div id="lca_wrap" className="drop-wrap">
            <button id="lca_trig" type="button" className="drop-trig">
              <span>Live Capital</span>
              <span className="arr">▾</span>
            </button>
            <div id="lca" className="modes drop-body" style={{ gridTemplateColumns: '1fr 1fr', display: 'none' }}>
              <button data-a="live">Live Capital</button>
              <button data-a="prop">Prop Firm</button>
            </div>
          </div>

          {/* Prop Challenge Type Dropdown */}
          <div id="lcpt_wrap" className="drop-wrap" style={{ display: 'none' }}>
            <button id="lcpt_trig" type="button" className="drop-trig">
              <span>1-Step</span>
              <span className="arr">▾</span>
            </button>
            <div
              id="lcpt"
              className="modes drop-body"
              style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'none' }}
            >
              <button data-pt="1">1-Step</button>
              <button data-pt="2">2-Step</button>
              <button data-pt="i">Instant</button>
            </div>
          </div>

          {/* Prop Phase Dropdown */}
          <div id="lcph_wrap" className="drop-wrap" style={{ display: 'none' }}>
            <button id="lcph_trig" type="button" className="drop-trig">
              <span>Phase 1</span>
              <span className="arr">▾</span>
            </button>
            <div
              id="lcph"
              className="modes drop-body"
              style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'none' }}
            >
              <button data-ph="1">Phase 1</button>
              <button data-ph="2">Phase 2</button>
              <button data-ph="live">Prop Live</button>
            </div>
          </div>

          {/* Risk Mode Dropdown */}
          <div id="lcm_wrap" className="drop-wrap">
            <button id="lcm_trig" type="button" className="drop-trig">
              <span>Medium Risk</span>
              <span className="arr">▾</span>
            </button>
            <div id="lcm" className="modes drop-body" style={{ display: 'none' }}>
              <button data-m="safe">Safe</button>
              <button data-m="medium">Medium Risk</button>
              <button data-m="high">High Risk</button>
            </div>
          </div>

          {/* Instant Settings */}
          <div id="mindw" style={{ display: 'none' }}>
            <div id="idp_wrap" className="drop-wrap">
              <button id="idp_trig" type="button" className="drop-trig">
                <span>০.৫%</span>
                <span className="arr">▾</span>
              </button>
              <div
                id="idp"
                className="modes drop-body"
                style={{ gridTemplateColumns: '1fr 1fr', display: 'none' }}
              >
                <button data-dp="0.25">০.২৫%</button>
                <button data-dp="0.5">০.৫%</button>
              </div>
            </div>

            <div id="dcs_wrap" className="drop-wrap">
              <button id="dcs_trig" type="button" className="drop-trig">
                <span>৭ দিন</span>
                <span className="arr">▾</span>
              </button>
              <div
                id="dcs"
                className="modes drop-body"
                style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'none' }}
              >
                <button data-dc="7">৭ দিন</button>
                <button data-dc="5">৫ দিন</button>
                <button data-dc="4">৪ দিন</button>
              </div>
            </div>
          </div>
          <div id="propbox" style={{ display: 'none' }}></div>
          <div id="lcout"></div>
          <p className="sub" style={{ margin: '6px 0 0', fontSize: '11px', lineHeight: '1.4' }}>
            এটি শুধু আনুমানিক হিসাব, ট্রেডিং পরামর্শ নয়। Pip value ব্রোকার, contract size, account
            currency ও instrument অনুযায়ী বদলায়। আগে আপনার ব্রোকারের হিসাব দেখে Pip value ঘরে সঠিক
            মান দিন। Gold-এর ক্ষেত্রে এখানে 1 pip = 0.10 price move ধরে নেওয়া হয়েছে।
          </p>
          <p className="sub" style={{ margin: '4px 0 0', fontSize: '11px', lineHeight: '1.4' }}>
            Prop Firm-এর Phase target, daily target, Instant preset (ব্যালেন্সের ০.৫%) এবং ০.৫%
            profitable-day rule শুধু উদাহরণভিত্তিক preset—প্রতিটি firm-এর নিয়ম আলাদা। নিজের firm's
            dashboard/rulebook-এর সঙ্গে মিলিয়ে নিন।
          </p>
        </div>
      </div>

      <h2>Monthly numbers</h2>
      <div className="grid" id="stats"></div>
      <div className="card" id="strip" style={{ marginTop: '12px' }}></div>

      <h2>Weekly review</h2>
      <div className="card">
        <table id="weeks"></table>
      </div>
      <div className="card" id="mist"></div>

      <h2>Daily log</h2>
      <p className="sub">
        Rules check: tap once = ✓ followed, tap twice = ✗ broken, third tap clears. Dir.: B =
        buy, S = sell. A+ Set: tap once = Yes, tap again = No. P/L: loss is negative. Mood: tap the
        stars, 1 star = tilted, 5 stars = calm and focused.
      </p>
      <div id="days"></div>
      <button className="reset" id="reset">
        Clear this month
      </button>

      <button id="help" aria-label="Help">
        ?
      </button>

      <button
        id="totop"
        type="button"
        aria-label="Back to top"
        style={{
          position: 'fixed',
          left: '14px',
          bottom: 'calc(70px + env(safe-area-inset-bottom,0px))',
          zIndex: 40,
          width: '44px',
          height: '44px',
          border: 0,
          borderRadius: '50%',
          font: 'inherit',
          fontSize: '20px',
          fontWeight: 800,
          color: '#fff',
          background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
          boxShadow: '0 10px 24px rgba(99,102,241,.45)',
          cursor: 'pointer'
        }}
      >
        ↑
      </button>
    </>
  );
}
