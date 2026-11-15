import { useEffect } from 'react';
import { PFP_PHOTO, PFP_LOGO } from './pfpAssets';

export default function App() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const intervals: number[] = [];
    const timeouts: number[] = [];

    const setInt = (fn: () => void, ms: number) => {
      const id = window.setInterval(fn, ms);
      intervals.push(id);
      return id;
    };
    const setTmo = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    const byId = <T extends HTMLElement = HTMLElement>(id: string) =>
      document.getElementById(id) as T;

    const KEY = "mh-trading-log-v2",
      OLD = "mh-trading-log-v1";
    let ST: any = { c: 0, m: [] },
      S: any;

    function blank(n?: number) {
      n = n || 20;
      const d = [];
      for (let i = 0; i < n; i++) {
        d.push({
          r: [0, 0, 0, 0, 0, 0],
          t: [
            { p: "", d: "", ap: "", pl: "", pp: "" },
            { p: "", d: "", ap: "", pl: "", pp: "" },
            { p: "", d: "", ap: "", pl: "", pp: "" },
          ],
          m: "",
          n: "",
        });
      }
      return { s: 1000, l: 2, dt: "", mt: "", nm: "Month 1", d: d };
    }

    try {
      const raw = localStorage.getItem(KEY),
        old = localStorage.getItem(OLD);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.m && o.m.length) ST = o;
      } else if (old) {
        const p = JSON.parse(old);
        if (p && p.d && p.d.length === 20) {
          p.nm = "Month 1";
          ST.m = [p];
        }
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

    function num(v: any) {
      if (v === "" || v === null || v === undefined) return NaN;
      const x = parseFloat(v);
      return isNaN(x) ? NaN : x;
    }

    function money(x: any) {
      if (x === null || isNaN(x)) return "–";
      return (
        (x < 0 ? "-" : "") +
        Math.abs(x).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }

    function fp(x: number) {
      return (x > 0 ? "+" : "") + Math.round(x * 10) / 10;
    }

    function pct(x: number) {
      return x === null || isNaN(x) ? "–" : (x * 100).toFixed(1) + "%";
    }

    function cls(x: number) {
      return x > 0 ? "pos" : x < 0 ? "neg" : "";
    }

    function calc() {
      const start = num(S.s) || 0,
        lim = ((num(S.l) || 0) / 100) * start;
      let bal = start,
        peak = start,
        mdd = 0,
        mddp = 0;
      let tr = 0,
        w = 0,
        l = 0,
        gp = 0,
        gl = 0,
        wd = 0,
        ld = 0,
        pw = 0,
        pls = 0,
        tp = 0,
        y = 0,
        yn = 0;
      const res: any[] = [],
        wk = [0, 1, 2, 3, 4].map(function () {
          return { t: 0, w: 0, n: 0, p: 0 };
        });

      S.d.forEach(function (day: any, i: number) {
        let n = 0,
          any = false,
          np = 0,
          anyp = false;
        const k = Math.floor(i / 7);
        day.t.forEach(function (t: any) {
          const v = num(t.pl),
            p = num(t.pp),
            hv = !isNaN(v),
            hp = !isNaN(p);
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
        day.r.forEach(function (r: number) {
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
          any: any,
          net: n,
          bal: bal,
          hit: any && lim > 0 && n <= -lim,
          anyp: anyp,
          pips: np,
          has: any || anyp,
          tone: any ? n : anyp ? np : 0,
        });
      });

      return {
        start: start,
        bal: bal,
        tr: tr,
        w: w,
        l: l,
        gp: gp,
        gl: gl,
        wd: wd,
        ld: ld,
        tp: tp,
        pw: pw,
        pls: pls,
        mdd: mdd,
        mddp: mddp,
        disc: yn ? y / yn : NaN,
        res: res,
        wk: wk,
      };
    }

    function stat(lab: string, val: any, c?: string) {
      return (
        '<div class="stat"><span>' +
        lab +
        '</span><b class="' +
        (c || "") +
        '">' +
        val +
        "</b></div>"
      );
    }

    function hero(c: any, net: number) {
      const pts = [c.start];
      c.res.forEach(function (r: any) {
        if (r.any) pts.push(r.bal);
      });
      const w = 300,
        h = 70,
        mn = Math.min.apply(null, pts),
        mx = Math.max.apply(null, pts),
        rg = mx - mn || 1;
      let svg = "";
      if (pts.length > 1) {
        const xy = pts.map(function (v, i) {
          return [i * (w / (pts.length - 1)), h - 8 - ((v - mn) / rg) * (h - 18)];
        });
        const d = xy
          .map(function (p, i) {
            return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
          })
          .join(" ");
        svg =
          '<svg class="spark" viewBox="0 0 ' +
          w +
          " " +
          h +
          '" preserveAspectRatio="none"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a526" stop-opacity=".45"/><stop offset="1" stop-color="#e0a526" stop-opacity="0"/></linearGradient></defs><path d="' +
          d +
          " L" +
          w +
          " " +
          h +
          " L0 " +
          h +
          ' Z" fill="url(#sg)"/><path d="' +
          d +
          '" fill="none" stroke="#e0a526" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
      }
      const pill = c.tr
        ? '<em class="pill ' +
          (net >= 0 ? "up" : "dn") +
          '">' +
          (net >= 0 ? "▲ +" : "▼ ") +
          money(net) +
          (c.start ? " · " + pct(net / c.start) : "") +
          "</em>"
        : '<em class="pill">No trades yet</em>';
      const mt = num(S.mt);
      const bar =
        mt > 0
          ? '<div class="bar"><i style="width:' +
            Math.max(0, Math.min(100, (net / mt) * 100)).toFixed(0) +
            '%"></i></div><div class="tgt">Target ' +
            money(mt) +
            " · " +
            pct(net / mt) +
            " · " +
            (net >= mt ? "🎯 পূরণ!" : "আর " + money(mt - net) + " লাগবে") +
            "</div>"
          : "";
      return '<div class="stat"><span>Balance</span><b>' + money(c.bal) + "</b>" + pill + svg + bar + "</div>";
    }

    function amt(x: number) {
      const a = Math.abs(x),
        s = x > 0 ? "+" : x < 0 ? "-" : "";
      return s + (a >= 1000 ? (a / 1000).toFixed(1) + "k" : a.toFixed(a % 1 ? 2 : 0));
    }

    function calLbl() {
      const y = (S.ym || "").split("-");
      return y[1]
        ? [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ][+y[1] - 1] +
            "-" +
            y[0]
        : "";
    }

    function padDays() {
      const n = monthInfo().dim;
      while (S.d.length < n) S.d.push(blank(1).d[0]);
    }

    function monthInfo() {
      const ym = (S.ym || "").split("-");
      let Y = +ym[0],
        M = +ym[1] - 1;
      if (!(Y > 0)) {
        const n = new Date();
        Y = n.getFullYear();
        M = n.getMonth();
      }
      return { Y: Y, M: M, dim: new Date(Y, M + 1, 0).getDate() };
    }

    const MFULL = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const WN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function dayHead(i: number) {
      const mi = monthInfo();
      if (i < mi.dim) {
        const wd = (new Date(mi.Y, mi.M, i + 1).getDay() + 6) % 7;
        return WN[wd] + " " + (i + 1) + " " + MN[mi.M] + " · Day " + (i + 1);
      }
      return "Day " + (i + 1);
    }

    function renderStrip(c: any) {
      const mi = monthInfo(),
        off = (new Date(mi.Y, mi.M, 1).getDay() + 6) % 7;
      let s =
        '<label>Tap a day to jump to it</label><div class="calhd">' +
        MFULL[mi.M] +
        " " +
        mi.Y +
        '</div><div class="cal">';
      for (let e = 0; e < off; e++) s += "<div></div>";
      for (let d = 1; d <= mi.dim; d++) {
        const i = d - 1,
          r = c.res[i],
          wn = WN[(off + d - 1) % 7],
          we = (off + d - 1) % 7 >= 5 ? " we" : "";
        if (!r) {
          s += '<div class="cday wk' + we + '"><small>' + wn + "</small><b>" + d + "</b></div>";
          continue;
        }
        s +=
          '<button class="cday dot' +
          we +
          " " +
          (r.has ? (r.tone > 0 ? "w" : r.tone < 0 ? "l" : "z") : "") +
          '" data-i="' +
          i +
          '"><small>' +
          wn +
          "</small><b>" +
          d +
          '</b><small class="amt">' +
          (r.any ? amt(r.net) : "") +
          "</small></button>";
      }
      byId("strip").innerHTML = s + "</div>";
    }

    const ymonthEl = byId<HTMLInputElement>("ymonth");
    ymonthEl.addEventListener("change", function () {
      if (ymonthEl.value) {
        S.ym = ymonthEl.value;
        padDays();
        save();
        load();
      }
    });

    byId("strip").addEventListener("click", function (e) {
      const target = e.target as HTMLElement | null;
      const b = target?.closest(".dot") as HTMLElement | null;
      if (!b) return;
      const el = document.getElementById("card" + b.dataset.i);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    function update() {
      const c = calc(),
        net = c.bal - c.start;
      const pf = c.gl === 0 ? (c.gp === 0 ? "–" : "n/a") : (c.gp / Math.abs(c.gl)).toFixed(2);
      let apY = 0,
        apN = 0,
        apW = 0;
      S.d.forEach(function (d: any) {
        d.t.forEach(function (t: any) {
          if (t.ap === "Yes") {
            apY++;
            const vv = num(t.pl);
            if (isNaN(vv) ? num(t.pp) > 0 : vv > 0) apW++;
          } else if (t.ap === "No") apN++;
        });
      });

      byId("stats").innerHTML =
        hero(c, net) +
        stat("Total trades", c.tr) +
        stat("Win rate", c.tr ? pct(c.w / c.tr) : "–") +
        stat("Avg win", c.wd ? money(c.gp / c.wd) : "–", "pos") +
        stat("Avg loss", c.ld ? money(c.gl / c.ld) : "–", "neg") +
        stat("Profit factor", pf) +
        stat("Return", c.start ? pct(net / c.start) : "–", cls(net)) +
        stat("Max drawdown", c.tr ? money(c.mdd) + " (" + pct(c.mddp) + ")" : "–") +
        stat("Discipline score", pct(c.disc)) +
        stat("A+ sets", apY + apN ? apY + " of " + (apY + apN) + " (" + pct(apY / (apY + apN)) + ")" : "–") +
        stat("A+ win rate", apY ? pct(apW / apY) : "–") +
        stat(
          "Total pips",
          c.res.some(function (r: any) {
            return r.anyp;
          })
            ? fp(c.tp) + " pips"
            : "–",
          cls(c.tp)
        ) +
        stat(
          "Pips won / lost",
          c.res.some(function (r: any) {
            return r.anyp;
          })
            ? "+" + Math.round(c.pw * 10) / 10 + " / " + Math.round(c.pls * 10) / 10
            : "–"
        ) +
        stat(
          "Monthly target",
          num(S.mt) > 0 ? money(net) + " / " + money(num(S.mt)) + " (" + pct(net / num(S.mt)) + ")" : "–",
          cls(net)
        ) +
        stat(
          "Daily target hit",
          num(S.dt) > 0
            ? c.res.filter(function (r: any) {
                return r.any && r.net >= num(S.dt);
              }).length + " days"
            : "–"
        ) +
        stat(
          "টার্গেট পূরণে আর লাগবে",
          num(S.mt) > 0 ? (net >= num(S.mt) ? "🎯 পূরণ হয়েছে" : money(num(S.mt) - net)) : "–"
        );

      let h = "<tr><th>Week</th><th>Trades</th><th>Wins</th><th>Win %</th><th>Net P/L</th><th>Pips</th></tr>";
      c.wk.forEach(function (x, i) {
        h +=
          "<tr><td>Week " +
          (i + 1) +
          "</td><td>" +
          x.t +
          "</td><td>" +
          x.w +
          "</td><td>" +
          (x.t ? pct(x.w / x.t) : "–") +
          '</td><td class="' +
          cls(x.n) +
          '">' +
          money(x.n) +
          '</td><td class="' +
          cls(x.p) +
          '">' +
          (x.p ? fp(x.p) : "–") +
          "</td></tr>";
      });
      byId("weeks").innerHTML = h;

      renderStrip(c);
      c.res.forEach(function (r: any, i: number) {
        const rc = S.d[i].r,
          ys = rc.filter(function (x: number) {
            return x === 1;
          }).length,
          ns = rc.filter(function (x: number) {
            return x === 2;
          }).length;
        byId("rc" + i).textContent = ys + "✓ " + ns + "✗";
        const n = byId("net" + i),
          pt: string[] = [];
        if (r.any) pt.push(money(r.net) + "  ·  " + money(r.bal));
        if (r.anyp) pt.push(fp(r.pips) + " pips");
        const hit = num(S.dt) > 0 && r.any && r.net >= num(S.dt);
        n.textContent = (hit ? "🎯 " : "") + (pt.length ? pt.join("  |  ") : "–");
        const tone = r.tone;
        n.className = "net " + cls(tone);
        byId("card" + i).classList.toggle("flag", r.hit);
        byId("card" + i).classList.toggle("win", tone > 0);
        byId("card" + i).classList.toggle("loss", tone < 0);
        byId("warn" + i).style.display = r.hit ? "block" : "none";
      });
    }

    const RULES = [
      "Follow your trading plan",
      "Maximum 3 trades per day",
      "Daily max risk 2%",
      "Stop overtrading",
      "No revenge trading",
      "Focus on discipline, not on profit.",
    ];
    const PRE = [
      "Higher-timeframe trend checked",
      "Key support / resistance marked",
      "Setup matches my plan",
      "Stop loss set before entry",
    ];

    function pre(i: number) {
      return (
        '<details class="pre"><summary>Pre-trade checklist <b id="pc' +
        i +
        '"></b></summary><div class="chk" data-i="' +
        i +
        '">' +
        PRE.map(function (t, k) {
          return '<button data-k="' + k + '"><i></i>' + t + "</button>";
        }).join("") +
        '</div><div class="note">Any empty box = no trade.</div></details>'
      );
    }

    function emoI(v: any) {
      return v === 1 ? "✅" : v === 2 ? "❌" : "⬜";
    }
    function emoC(v: any) {
      return v === 1 ? " on" : v === 2 ? " no" : "";
    }
    function apc(v: string) {
      return v === "Yes" ? " y" : v === "No" ? " n" : "";
    }

    function build() {
      const box = byId("days");
      let h = "";
      for (let i = 0; i < S.d.length; i++) {
        if (i % 7 === 0) h += "<h2>Week " + (Math.floor(i / 7) + 1) + "</h2>";
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
          dayHead(i) +
          '</b><span class="net" id="net' +
          i +
          '">–</span></div>';
        h +=
          '<details class="pre"><summary>Rules check <b id="rc' +
          i +
          '"></b></summary><div class="rules rl" data-i="' +
          i +
          '">';
        for (let k = 0; k < 6; k++) h += '<button data-k="' + k + '">' + (k + 1) + ". " + RULES[k] + "</button>";
        h += "</div></details>";
        h += pre(i);
        h += '<div class="warn" id="warn' + i + '">Daily loss limit hit – stop trading for the day.</div>';
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
            '" data-f="d"><option value=""></option><option value="B">Buy</option><option value="S">Sell</option></select></div>' +
            '<div><label>A+ Set</label><button class="ap' +
            apc(S.d[i].t[t].ap) +
            '" data-i="' +
            i +
            '" data-t="' +
            t +
            '">' +
            (S.d[i].t[t].ap || "–") +
            "</button></div>" +
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
          '<div class="row eod"><div><label>Biggest mistake today</label><textarea data-i="' +
          i +
          '" data-f="mk" rows="1" placeholder="Write your biggest mistake"></textarea></div></div>';
        h +=
          '<div class="row eod"><div><label>Next day focus</label><textarea data-i="' +
          i +
          '" data-f="nf" rows="1" placeholder="What will you focus on tomorrow?"></textarea></div></div>';
        h +=
          '<div class="row eod" style="grid-template-columns:auto 1fr"><div><label>Mood</label><div class="stars" data-i="' +
          i +
          '">' +
          [1, 2, 3, 4, 5]
            .map(function (k) {
              return '<button data-k="' + k + '">★</button>';
            })
            .join("") +
          "</div></div>" +
          '<div><label>Notes</label><textarea data-i="' +
          i +
          '" data-f="n" rows="2"></textarea></div></div></div>';
      }
      box.innerHTML = h;
      box.querySelectorAll("[data-f]").forEach(function (node) {
        const el = node as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const i = +el.dataset.i!,
          f = el.dataset.f!,
          t = el.dataset.t;
        el.value = t !== undefined ? S.d[i].t[+t][f] || "" : S.d[i][f] || "";
        const ev = el.tagName === "SELECT" ? "change" : "input";
        el.addEventListener(ev, function () {
          if (t !== undefined) S.d[i].t[+t][f] = el.value;
          else S.d[i][f] = el.value;
          save();
          update();
        });
      });
      box.querySelectorAll(".rules").forEach(function (node) {
        const r = node as HTMLElement;
        const i = +r.dataset.i!;
        function paint() {
          r.querySelectorAll("button").forEach(function (b) {
            const v = S.d[i].r[+b.dataset.k!];
            b.className = v === 1 ? "y" : v === 2 ? "n" : "";
          });
        }
        paint();
        r.addEventListener("click", function (e) {
          const b = (e.target as HTMLElement | null)?.closest("button") as HTMLButtonElement | null;
          if (!b) return;
          const k = +b.dataset.k!;
          S.d[i].r[k] = (S.d[i].r[k] + 1) % 3;
          save();
          paint();
          update();
        });
      });
    }

    const st = byId<HTMLInputElement>("start"),
      ml = byId<HTMLInputElement>("maxl");
    const msel = byId<HTMLSelectElement>("msel"),
      mn = byId<HTMLTextAreaElement>("mname");

    function mk() {
      const b = byId("mist");
      let h = "";
      if (!S.wm) S.wm = ["", "", "", "", ""];
      for (let w = 0; w < 5; w++)
        h +=
          "<label>Week " +
          (w + 1) +
          ' – biggest mistake</label><input data-w="' +
          w +
          '" type="text" placeholder="Write your biggest mistake" style="margin-bottom:8px">';
      b.innerHTML = h;
      b.querySelectorAll("input").forEach(function (el) {
        el.value = S.wm[+el.dataset.w!] || "";
        el.addEventListener("input", function () {
          S.wm[+el.dataset.w!] = el.value;
          save();
        });
      });
    }

    function paintChk(w: HTMLElement) {
      const i = +w.dataset.i!,
        c = S.d[i].c || [];
      let n = 0,
        x = 0;
      w.querySelectorAll("button").forEach(function (b) {
        const v = +c[+b.dataset.k!] || 0;
        if (v === 1) n++;
        if (v === 2) x++;
        b.className = v === 1 ? "on" : v === 2 ? "no" : "";
      });
      byId("pc" + i).textContent =
        n + "/" + PRE.length + (x ? " · " + x + "❌" : "") + (n === PRE.length ? " ✓" : "");
    }

    const daysEl = byId("days");
    daysEl.addEventListener("click", function (e) {
      const b = (e.target as HTMLElement | null)?.closest(".chk button") as HTMLButtonElement | null;
      if (!b) return;
      const w = b.parentNode as HTMLElement,
        i = +w.dataset.i!,
        k = +b.dataset.k!;
      if (!S.d[i].c) S.d[i].c = [0, 0, 0, 0, 0, 0];
      S.d[i].c[k] = ((+S.d[i].c[k] || 0) + 1) % 3;
      save();
      paintChk(w);
    });
    daysEl.addEventListener("click", function (e) {
      const b = (e.target as HTMLElement | null)?.closest(".emo") as HTMLButtonElement | null;
      if (!b) return;
      const i = +b.dataset.i!;
      S.d[i].ce = ((+S.d[i].ce || 0) + 1) % 3;
      save();
      b.textContent = emoI(S.d[i].ce) + " Control your emotion";
      b.className = "emo" + emoC(S.d[i].ce);
    });
    daysEl.addEventListener("click", function (e) {
      const b = (e.target as HTMLElement | null)?.closest(".ap") as HTMLButtonElement | null;
      if (!b) return;
      const i = +b.dataset.i!,
        t = +b.dataset.t!,
        x = S.d[i].t[t];
      x.ap = x.ap === "Yes" ? "No" : "Yes";
      save();
      b.textContent = x.ap;
      b.className = "ap" + apc(x.ap);
    });
    function paintStars(w: HTMLElement, i: number) {
      const v = +S.d[i].m || 0;
      w.querySelectorAll("button").forEach(function (b) {
        b.className = +b.dataset.k! <= v ? "on" : "";
      });
    }
    daysEl.addEventListener("click", function (e) {
      const b = (e.target as HTMLElement | null)?.closest(".stars button") as HTMLButtonElement | null;
      if (!b) return;
      const w = b.parentNode as HTMLElement,
        i = +w.dataset.i!,
        k = String(b.dataset.k);
      S.d[i].m = String(S.d[i].m) === k ? "" : k;
      save();
      paintStars(w, i);
    });

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
      btn._t = setTmo(function () {
        btn._a = false;
        btn.textContent = btn._o;
      }, 4000);
      return false;
    }

    function fillSel() {
      msel.innerHTML = "";
      ST.m.forEach(function (m: any, i: number) {
        const o = document.createElement("option");
        o.value = String(i);
        o.textContent = m.nm || "Month " + (i + 1);
        msel.appendChild(o);
      });
      msel.value = String(ST.c);
    }

    function load() {
      S = ST.m[ST.c];
      if (!S.nm) S.nm = "Month " + (ST.c + 1);
      if (!S.ym) {
        const nw = new Date();
        S.ym = nw.getFullYear() + "-" + String(nw.getMonth() + 1).padStart(2, "0");
      }
      ymonthEl.value = S.ym;
      padDays();
      if ((window as any).syncM) (window as any).syncM();
      st.value = S.s;
      ml.value = S.l;
      mn.value = S.nm;
      dtg.value = S.dt || "";
      mtg.value = S.mt || "";
      syncD();
      fillSel();
      mk();
      build();
      document.querySelectorAll(".stars").forEach(function (w) {
        paintStars(w as HTMLElement, +(w as HTMLElement).dataset.i!);
      });
      document.querySelectorAll(".chk").forEach(function (w) {
        paintChk(w as HTMLElement);
      });
      if ((window as any).lcLoad) (window as any).lcLoad();
      if ((window as any).updStartK) (window as any).updStartK();
      update();
    }

    msel.addEventListener("change", function () {
      ST.c = +msel.value;
      load();
      save();
    });
    mn.addEventListener("input", function () {
      S.nm = mn.value;
      save();
      if (msel.options[ST.c]) {
        msel.options[ST.c].textContent = S.nm || "Month " + (ST.c + 1);
      }
    });
    byId("newm").addEventListener("click", function () {
      const b = 0;
      if (!ask(byId("newm"), "Tap again: start from 0")) return;
      const n: any = blank();
      n.s = b;
      n.l = S.l;
      n.dt = S.dt;
      n.mt = S.mt;
      n.nm = "Month " + (ST.m.length + 1);
      ST.m.push(n);
      ST.c = ST.m.length - 1;
      load();
      save();
      window.scrollTo(0, 0);
    });

    const md = byId<HTMLInputElement>("maxd"),
      dtg = byId<HTMLInputElement>("dtgt"),
      mtg = byId<HTMLInputElement>("mtgt");
    dtg.addEventListener("input", function () {
      S.dt = dtg.value;
      save();
      update();
    });
    mtg.addEventListener("input", function () {
      S.mt = mtg.value;
      save();
      update();
    });
    function syncD() {
      const s = num(S.s) || 0,
        p = num(S.l);
      md.value = isNaN(p) ? "" : ((s * p) / 100).toFixed(2);
    }
    md.addEventListener("input", function () {
      const s = num(S.s) || 0,
        v = num(md.value);
      if (isNaN(v) || s <= 0) {
        S.l = "";
        ml.value = "";
      } else {
        S.l = String(+((v / s) * 100).toFixed(2));
        ml.value = S.l;
      }
      save();
      update();
    });
    st.addEventListener("input", function () {
      S.s = st.value;
      syncD();
      save();
      update();
    });
    ml.addEventListener("input", function () {
      S.l = ml.value;
      syncD();
      save();
      update();
    });
    byId("reset").addEventListener("click", function () {
      if (ask(byId("reset"), "Tap again to clear this month")) {
        const nm = S.nm,
          s0 = S.s,
          d0 = S.dt,
          m0 = S.mt;
        S = blank();
        S.nm = nm;
        S.s = s0;
        S.dt = d0;
        S.mt = m0;
        save();
        load();
      }
    });

    function esc(s: any) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function jlines() {
      const c = calc(),
        net = c.bal - c.start,
        L: any[] = [];
      const pf = c.gl === 0 ? (c.gp === 0 ? "–" : "n/a") : (c.gp / Math.abs(c.gl)).toFixed(2);
      let apY = 0,
        apN = 0,
        apW = 0;
      S.d.forEach(function (d: any) {
        d.t.forEach(function (t: any) {
          if (t.ap === "Yes") {
            apY++;
            const vv = num(t.pl);
            if (isNaN(vv) ? num(t.pp) > 0 : vv > 0) apW++;
          } else if (t.ap === "No") apN++;
        });
      });
      L.push(
        ["h1", "Mahfuj’s Trading Journal – " + S.nm + (calLbl() ? " (" + calLbl() + ")" : "")],
        ["h2", "Monthly numbers"]
      );
      [
        ["Starting balance", money(c.start)],
        ["Ending balance", money(c.bal)],
        ["Net P/L", money(net)],
        ["Total pips", fp(c.tp) + " pips"],
        ["Daily profit target", num(S.dt) > 0 ? money(num(S.dt)) : "–"],
        ["Total profit target", num(S.mt) > 0 ? money(num(S.mt)) + " (" + pct(net / num(S.mt)) + " done)" : "–"],
        ["Remaining to target", num(S.mt) > 0 ? (net >= num(S.mt) ? "Reached" : money(num(S.mt) - net)) : "–"],
        ["Total trades", c.tr],
        ["Win rate", c.tr ? pct(c.w / c.tr) : "–"],
        ["Avg win", c.w ? money(c.gp / c.w) : "–"],
        ["Avg loss", c.l ? money(c.gl / c.l) : "–"],
        ["Profit factor", pf],
        ["Max drawdown", c.tr ? money(c.mdd) + " (" + pct(c.mddp) + ")" : "–"],
        ["Discipline score", pct(c.disc)],
        ["Max daily loss", (num(S.l) || 0) + "% (" + money((c.start * (num(S.l) || 0)) / 100) + ")"],
        ["A+ sets", apY + apN ? apY + " of " + (apY + apN) + " (" + pct(apY / (apY + apN)) + ")" : "–"],
        ["A+ win rate", apY ? pct(apW / apY) : "–"],
      ].forEach(function (r) {
        L.push(["t", r[0] + ": " + r[1]]);
      });
      L.push(["h2", "Weekly review"]);
      c.wk.forEach(function (x, i) {
        L.push(["t", "Week " + (i + 1) + ": " + x.t + " trades, " + x.w + " wins, Net " + money(x.n) + ", Pips " + fp(x.p)]);
        if (S.wm && S.wm[i]) L.push(["t", "   Biggest mistake: " + S.wm[i]]);
      });
      L.push(["h2", "Daily journal"]);
      let any = false;
      S.d.forEach(function (d: any, i: number) {
        const r = c.res[i],
          rl = d.r
            .map(function (x: number, k: number) {
              return x ? k + 1 + ". " + RULES[k] + " " + (x === 1 ? "✓" : "✗") : "";
            })
            .filter(Boolean),
          ck = (d.c || []).slice(0, PRE.length).filter(function (v: number) {
            return v === 1;
          }).length,
          ckx = (d.c || []).slice(0, PRE.length).filter(function (v: number) {
            return v === 2;
          }).length,
          tl = d.t
            .map(function (t: any, k: number) {
              return t.p || t.d || t.ap || t.pl || t.pp
                ? "Trade " +
                    (k + 1) +
                    ": " +
                    t.p +
                    " " +
                    t.d +
                    (t.ap ? " A+ " + t.ap : "") +
                    (t.pl ? " P/L " + t.pl : "") +
                    (t.pp ? " Pips " + t.pp : "")
                : "";
            })
            .filter(Boolean),
          m = +d.m || 0;
        if (!(r.any || rl.length || ck || ckx || tl.length || m || d.mk || d.nf || d.n || d.ce)) return;
        any = true;
        L.push([
          r.has ? (r.tone < 0 ? "n" : "p") : "b",
          dayHead(i) +
            (r.any ? "  |  Net P/L " + money(r.net) + "  |  Balance " + money(r.bal) : "") +
            (r.anyp ? "  |  Pips " + fp(r.pips) : "") +
            (num(S.dt) > 0 && r.any && r.net >= num(S.dt) ? "  🎯" : ""),
        ]);
        tl.forEach(function (t: string) {
          L.push(["t", t]);
        });
        rl.forEach(function (t: string) {
          L.push(["t", "Rule " + t]);
        });
        if (ck || ckx)
          L.push([
            "t",
            "Pre-trade checklist: " + ck + "/" + PRE.length + (ckx ? " (" + ckx + " ✗ not followed)" : ""),
          ]);
        if (d.ce) L.push(["t", d.ce === 2 ? "✗ Did not control emotion" : "✓ Control your emotion"]);
        if (m) L.push(["t", "Mood: " + "★".repeat(m) + "☆".repeat(5 - m)]);
        if (d.mk) L.push(["t", "Biggest mistake: " + d.mk]);
        if (d.nf) L.push(["t", "Next day focus: " + d.nf]);
        if (d.n) L.push(["t", "Notes: " + d.n]);
        L.push(["gap", ""]);
      });
      if (!any) L.push(["t", "No entries yet."]);
      return L;
    }

    function jpng(cb: (b: Blob | null, cv: HTMLCanvasElement) => void) {
      const lines = jlines(),
        W = 900,
        pad = 24,
        cv = document.createElement("canvas");
      let x = cv.getContext("2d")!;
      const F = 'Arial, "Noto Sans Bengali", sans-serif';
      const st: Record<string, [number, string, string]> = {
        h1: [22, "bold", "#111827"],
        h2: [17, "bold", "#1f2937"],
        t: [15, "", "#111827"],
        b: [16, "bold", "#111827"],
        p: [16, "bold", "#15803d"],
        n: [16, "bold", "#b91c1c"],
        gap: [8, "", "#000"],
      };
      function wrap(t: string, font: string, max: number) {
        x.font = font;
        const out: string[] = [];
        let cur = "";
        String(t)
          .split(" ")
          .forEach(function (w) {
            const tt = cur ? cur + " " + w : w;
            if (x.measureText(tt).width > max && cur) {
              out.push(cur);
              cur = w;
            } else cur = tt;
          });
        out.push(cur);
        return out;
      }
      const items: any[] = [];
      let y = pad;
      lines.forEach(function (l) {
        const s = st[l[0]],
          font = (s[1] ? s[1] + " " : "") + s[0] + "px " + F,
          lh = Math.round(s[0] * 1.5),
          ws = l[0] === "gap" ? [""] : wrap(l[1], font, W - 2 * pad);
        if (l[0] === "h2") y += 12;
        ws.forEach(function (w, j) {
          items.push([w, font, s[2], y + Math.round(lh * 0.75), l[0] === "h2" && j === ws.length - 1 ? y + lh : 0]);
          y += lh;
        });
      });
      const H = y + pad,
        SC = Math.max(1, Math.min(2, Math.floor(Math.sqrt(12000000 / (W * H)) * 10) / 10));
      cv.width = Math.round(W * SC);
      cv.height = Math.round(H * SC);
      x = cv.getContext("2d")!;
      x.scale(SC, SC);
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, W, H);
      items.forEach(function (it) {
        x.font = it[1];
        x.fillStyle = it[2];
        x.fillText(it[0], pad, it[3]);
        if (it[4]) {
          x.fillRect(pad, it[4] - 2, W - 2 * pad, 2);
        }
      });
      cv.toBlob(function (b) {
        cb(b, cv);
      }, "image/png");
    }

    let DM: any = null;
    function mkpdf(pages: any[]) {
      const enc = new TextEncoder(),
        chunks: Uint8Array[] = [],
        off: number[] = [],
        np = pages.length,
        pw = 595;
      let len = 0;
      function put(x: string | Uint8Array) {
        const b = typeof x === "string" ? enc.encode(x) : x;
        chunks.push(b);
        len += b.length;
      }
      function obj(n: number, body: string) {
        off[n] = len;
        put(n + " 0 obj\n" + body + "\nendobj\n");
      }
      put("%PDF-1.4\n");
      obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
      const kids: string[] = [];
      for (let k = 0; k < np; k++) kids.push(3 + 3 * k + " 0 R");
      obj(2, "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + np + " >>");
      pages.forEach(function (p, k) {
        const ph = Math.round((pw * p.h) / p.w),
          cs = "q " + pw + " 0 0 " + ph + " 0 0 cm /Im0 Do Q";
        obj(
          3 + 3 * k,
          "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
            pw +
            " " +
            ph +
            "] /Resources << /XObject << /Im0 " +
            (5 + 3 * k) +
            " 0 R >> >> /Contents " +
            (4 + 3 * k) +
            " 0 R >>"
        );
        obj(4 + 3 * k, "<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream");
        off[5 + 3 * k] = len;
        put(
          5 +
            3 * k +
            " 0 obj\n<< /Type /XObject /Subtype /Image /Width " +
            p.w +
            " /Height " +
            p.h +
            " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
            p.bytes.length +
            " >>\nstream\n"
        );
        put(p.bytes);
        put("\nendstream\nendobj\n");
      });
      const xr = len,
        total = 3 + 3 * np;
      let x = "xref\n0 " + total + "\n0000000000 65535 f \n";
      for (let n = 1; n < total; n++) x += ("0000000000" + off[n]).slice(-10) + " 00000 n \n";
      put(x + "trailer\n<< /Size " + total + " /Root 1 0 R >>\nstartxref\n" + xr + "\n%%EOF");
      return new Blob(chunks as unknown as BlobPart[], { type: "application/pdf" });
    }

    function jpdf(cb: (blob: Blob | null) => void) {
      jpng(function (b, cv) {
        if (!b) {
          cb(null);
          return;
        }
        const W = cv.width,
          PH = Math.round(W * 1.4142),
          n = Math.max(1, Math.ceil(cv.height / PH)),
          pages: any[] = [];
        for (let k = 0; k < n; k++) {
          const pc = document.createElement("canvas");
          pc.width = W;
          pc.height = PH;
          const x = pc.getContext("2d")!;
          x.fillStyle = "#fff";
          x.fillRect(0, 0, W, PH);
          x.drawImage(cv, 0, k * PH, W, PH, 0, 0, W, PH);
          const bin = atob(pc.toDataURL("image/jpeg", 0.92).split(",")[1]),
            u = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          pages.push({ bytes: u, w: W, h: PH });
        }
        cb(mkpdf(pages));
      });
    }

    function ov(h: string) {
      let o = document.getElementById("ov");
      if (!o) {
        o = document.createElement("div");
        o.id = "ov";
        o.style.cssText =
          "position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding:12px;padding-top:calc(12px + env(safe-area-inset-top,0px))";
        document.body.appendChild(o);
      }
      o.innerHTML = '<button class="reset" id="ovx" style="margin:0 0 10px;width:100%">✕ Close</button>' + h;
      o.style.display = "block";
      o.scrollTop = 0;
      byId("ovx").onclick = function () {
        o!.style.display = "none";
      };
      const cc = document.getElementById("cc");
      if (cc)
        cc.onclick = function () {
          const t = byId<HTMLTextAreaElement>("ct");
          let ok = false;
          t.select();
          t.setSelectionRange(0, 999999);
          try {
            ok = document.execCommand("copy");
          } catch (e) {}
          cc.textContent = ok ? "Copied ✓" : "Select all and copy manually";
        };
    }

    try {
      if ((window as any).claude && (window as any).claude.use) {
        (window as any).claude
          .use("downloads")
          .then(function (m: any) {
            if (!m) return;
            DM = m;
          })
          .catch(function () {});
      }
    } catch (e) {}

    byId("dl2").addEventListener("click", function () {
      const b2 = byId("dl2"),
        lab = b2.textContent || "",
        nm = (S.nm || "month").replace(/[^A-Za-z0-9_-]+/g, "-"),
        fn = "journal-" + nm + (calLbl() ? "_" + calLbl() : "") + ".pdf";
      function msg(t: string, ms?: number) {
        b2.textContent = t;
        setTmo(function () {
          b2.textContent = lab;
        }, ms || 2500);
      }
      b2.textContent = "Making PDF…";
      jpdf(function (blob) {
        if (!blob) {
          msg("Could not make PDF", 3000);
          return;
        }
        if (DM) {
          DM.save({ filename: fn, data: blob }).then(
            function () {
              msg("Saved ✓");
            },
            function (e: any) {
              msg(e && e.code === "declined" ? lab : "Could not save, try again", 3000);
            }
          );
          return;
        }
        if (window.self !== window.top) {
          jpng(function (b) {
            if (!b) return;
            const r = new FileReader();
            r.onload = function () {
              ov(
                '<img src="' +
                  r.result +
                  '" style="width:100%;border:1px solid var(--bd)"><p class="sub">Long-press the image, then tap Download image (or take a screenshot).</p>'
              );
              b2.textContent = lab;
            };
            r.readAsDataURL(b);
          });
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        setTmo(function () {
          a.remove();
        }, 500);
        msg("Saved ✓");
      });
    });

    byId("dl").addEventListener("click", function () {
      const b2 = byId("dl"),
        lab = b2.textContent || "",
        nm = (S.nm || "month").replace(/[^A-Za-z0-9_-]+/g, "-"),
        fn = "journal-" + nm + (calLbl() ? "_" + calLbl() : "") + ".png";
      function msg(t: string, ms?: number) {
        b2.textContent = t;
        setTmo(function () {
          b2.textContent = lab;
        }, ms || 2500);
      }
      b2.textContent = "Making image…";
      jpng(function (blob) {
        if (!blob) {
          msg("Could not make image", 3000);
          return;
        }
        if (DM) {
          DM.save({ filename: fn, data: blob }).then(
            function () {
              msg("Saved ✓");
            },
            function (e: any) {
              msg(e && e.code === "declined" ? lab : "Could not save, try again", 3000);
            }
          );
          return;
        }
        if (window.self !== window.top) {
          const r = new FileReader();
          r.onload = function () {
            ov(
              '<img src="' +
                r.result +
                '" style="width:100%;border:1px solid var(--bd)"><p class="sub">Long-press the image, then tap Download image (or take a screenshot).</p>'
            );
            b2.textContent = lab;
          };
          r.readAsDataURL(blob);
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        setTmo(function () {
          a.remove();
        }, 500);
        msg("Saved ✓");
      });
    });

    // Forex market sessions
    (function () {
      const SESS = [
        { n: "Sydney", tz: "Australia/Sydney", h: 7, c: "#00608f" },
        { n: "Tokyo", tz: "Asia/Tokyo", h: 9, c: "#00608f" },
        { n: "London", tz: "Europe/London", h: 8, c: "#00608f" },
        { n: "New York", tz: "America/New_York", h: 8, c: "#00608f" },
      ];
      const DUR = 540;
      const zones: Array<[string, string]> = [
        ["Asia/Dhaka", "বাংলাদেশ (Dhaka)"],
        ["Asia/Kolkata", "ভারত"],
        ["Asia/Dubai", "দুবাই"],
        ["Asia/Riyadh", "সৌদি আরব"],
        ["Asia/Kuala_Lumpur", "মালয়েশিয়া"],
        ["Asia/Singapore", "সিঙ্গাপুর"],
        ["Europe/London", "লন্ডন"],
        ["America/New_York", "নিউ ইয়র্ক"],
        ["UTC", "UTC"],
      ];
      const sel = byId<HTMLSelectElement>("mstz");
      sel.innerHTML = "";
      let dflt = "Asia/Dhaka";
      try {
        const b = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (b && !zones.some((z) => z[0] === b)) zones.unshift([b, b + " (আপনার ডিভাইস)"]);
        else if (b) dflt = b;
      } catch (e) {}
      zones.forEach((z) => {
        const o = document.createElement("option");
        o.value = z[0];
        o.textContent = z[1];
        sel.appendChild(o);
      });
      sel.value = dflt;
      function parts(d: Date, tz: string) {
        const p: Record<string, number> = {};
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hourCycle: "h23",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
          .formatToParts(d)
          .forEach((x) => (p[x.type] = +x.value));
        return p;
      }
      function off(d: Date, tz: string) {
        const p = parts(d, tz);
        return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(d.getTime() / 60000) * 60000) / 60000;
      }
      function fmt(m: number) {
        m = ((m % 1440) + 1440) % 1440;
        let h = Math.floor(m / 60);
        const mi = m % 60,
          s = h < 12 ? "am" : "pm";
        h = h % 12 || 12;
        return h + ":" + String(mi).padStart(2, "0") + s;
      }
      function render() {
        const tz = sel.value,
          now = new Date(),
          ovv = off(now, tz);
        const p = parts(now, tz),
          nm = p.hour * 60 + p.minute;
        const ax = byId("msaxis");
        ax.innerHTML = "";
        for (let h = 0; h < 24; h += 4) {
          const sp = document.createElement("span");
          sp.style.left = (h / 24) * 100 + "%";
          sp.textContent = (h % 12 || 12) + (h < 12 ? "am" : "pm");
          ax.appendChild(sp);
        }
        const rows = byId("msrows");
        rows.innerHTML = "";
        for (let h = 2; h < 24; h += 2) {
          const g = document.createElement("div");
          g.className = "msgrid";
          g.style.left = (h / 24) * 100 + "%";
          rows.appendChild(g);
        }
        const list = byId("mslist");
        list.innerHTML = "";
        SESS.forEach((s, i) => {
          const co = off(now, s.tz),
            cp = parts(now, s.tz);
          const startUtc = Date.UTC(cp.year, cp.month - 1, cp.day, s.h, 0) - co * 60000;
          const startMin = (((Math.floor(startUtc / 60000) + ovv) % 1440) + 1440) % 1440;
          let open = false;
          for (let k = -1; k <= 0; k++) {
            const wd = new Date(Date.UTC(cp.year, cp.month - 1, cp.day + k)).getUTCDay();
            if (wd < 1 || wd > 5) continue;
            const stt = Date.UTC(cp.year, cp.month - 1, cp.day + k, s.h, 0) - co * 60000;
            if (now.getTime() >= stt && now.getTime() < stt + DUR * 60000) open = true;
          }
          const row = document.createElement("div");
          row.className = "msrow";
          row.style.top = 6 + i * 35 + "px";
          const a = Math.min(DUR, 1440 - startMin);
          const mkSeg = (l: number, w: number) => {
            const d = document.createElement("div");
            d.className = "msseg" + (open ? " open" : "");
            d.style.background = open ? s.c : s.c + "44";
            d.style.borderColor = s.c;
            d.style.left = (l / 1440) * 100 + "%";
            d.style.width = (w / 1440) * 100 + "%";
            row.appendChild(d);
          };
          mkSeg(startMin, a);
          if (a < DUR) mkSeg(0, DUR - a);
          const lb = document.createElement("div");
          lb.className = "mslbl";
          lb.style.left = ((a >= DUR / 2 || startMin === 0 ? startMin : 0) / 1440) * 100 + "%";
          lb.style.color = open ? "#fff" : "var(--tx)";
          const cm = cp.hour * 60 + cp.minute;
          lb.innerHTML = "<b>" + s.n + "</b>" + fmt(cm);
          row.appendChild(lb);
          rows.appendChild(row);
          const it = document.createElement("div");
          it.className = "msit";
          it.innerHTML =
            "<div><b>" +
            s.n +
            "</b><small>" +
            fmt(startMin) +
            " – " +
            fmt(startMin + DUR) +
            "</small></div><span class='msbadge" +
            (open ? " on" : "") +
            "'>" +
            (open ? "খোলা" : "বন্ধ") +
            "</span>";
          it.style.borderLeft = "5px solid " + s.c;
          list.appendChild(it);
        });
        const n = document.createElement("div");
        n.className = "msnow";
        n.style.left = (nm / 1440) * 100 + "%";
        rows.appendChild(n);
      }
      sel.onchange = render;
      render();
      setInt(render, 30000);
    })();

    // Typing + dust title
    (function () {
      const el = document.getElementById("ty");
      if (!el) return;
      const T = "MAHFUJ TRADING LOG";
      let i = 0;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = T;
        return;
      }
      function dust(done: () => void) {
        const chars = T.split(""),
          L: Array<[HTMLSpanElement, string]> = [],
          fr = document.createDocumentFragment();
        el!.textContent = "";
        el!.classList.add("dusting");
        chars.forEach(function (c, k) {
          const f = k / (chars.length - 1),
            col =
              "rgb(" +
              Math.round(56 + 199 * f) +
              "," +
              Math.round(189 - 112 * f) +
              "," +
              Math.round(248 - 139 * f) +
              ")",
            sp = document.createElement("span");
          sp.className = "dl";
          sp.textContent = c === " " ? "\u00a0" : c;
          sp.style.color = col;
          fr.appendChild(sp);
          L.push([sp, col]);
        });
        el!.appendChild(fr);
        L.forEach(function (x, k) {
          const sp = x[0],
            wind = 60 + Math.random() * 90;
          sp.style.setProperty("--d", (k * 0.06).toFixed(2) + "s");
          sp.style.setProperty("--dx", wind + "px");
          sp.style.setProperty("--dy", -30 - Math.random() * 70 + "px");
          sp.style.setProperty("--r", Math.random() * 60 - 30 + "deg");
          if (sp.textContent !== "\u00a0")
            for (let q = 0; q < 4; q++) {
              const p = document.createElement("span");
              p.className = "dp";
              p.style.background = x[1];
              p.style.left = sp.offsetLeft + Math.random() * sp.offsetWidth + "px";
              p.style.top = sp.offsetTop + Math.random() * sp.offsetHeight * 0.8 + "px";
              p.style.setProperty("--d", (k * 0.06 + Math.random() * 0.3).toFixed(2) + "s");
              p.style.setProperty("--dx", wind + Math.random() * 120 + "px");
              p.style.setProperty("--dy", -60 - Math.random() * 110 + "px");
              p.style.setProperty("--r", "0deg");
              el!.appendChild(p);
            }
        });
        setTmo(function () {
          el!.classList.remove("dusting");
          el!.textContent = "";
          done();
        }, chars.length * 60 + 1600);
      }
      function step() {
        i++;
        el!.textContent = T.slice(0, i);
        if (i >= T.length) {
          setTmo(function () {
            dust(function () {
              i = 0;
              setTmo(step, 1200);
            });
          }, 3500);
          return;
        }
        setTmo(step, 130);
      }
      el.textContent = "";
      setTmo(step, 500);
    })();

    const TOUR = [
      [
        "স্বাগতম! 👋",
        "এটা আপনার <b>২০ দিনের ট্রেডিং জার্নাল</b>। প্রতিদিনের ট্রেড, নিয়ম মানা আর মনের অবস্থা লিখে রাখলে নিজের ভুল ধরা সহজ হয়। চলুন ছোট করে দেখে নিই কোথায় কী আছে।",
      ],
      [
        "মাস বেছে নিন",
        "সবার উপরে <b>Month</b> ঘর। প্রতি মাসের আলাদা লগ থাকে। মাস শেষে <b>+ New month</b> চাপলে নতুন ২০ দিনের লগ খুলবে, আর নতুন মাস ০ থেকে শুরু হবে। মাসের নাম বদলাতেও পারবেন।",
      ],
      [
        "ব্যালেন্স ও লস সীমা",
        "<b>Starting balance</b> এ আপনার ব্যালেন্স দিন। <b>Max daily loss</b> % বা $ যেকোনোটায় দিতে পারেন, অন্যটা নিজে হিসাব হবে। কোনো দিনের লস এই সীমায় পৌঁছালে সেই দিনের কার্ড লাল হয়ে সতর্ক করবে। <b>Daily / Total profit target</b> ঘরে টার্গেট লিখুন, টার্গেট ছুঁলে দিনের পাশে 🎯 আসবে আর ব্যালেন্স কার্ডে অগ্রগতির বার দেখাবে।",
      ],
      [
        "নম্বর ও ক্যালেন্ডার",
        "<b>Monthly numbers</b> এ ব্যালেন্স, গ্রাফ, Win rate, Profit factor সব নিজে নিজে হিসাব হয়। ২০ দিনের ক্যালেন্ডারে প্রফিটের দিন <b>সবুজ</b>, লসের দিন <b>লাল</b>, আর ঘরে ট্যাপ করলে সেই দিনের কার্ডে চলে যাবেন।",
      ],
      [
        "মার্কেট সেশন",
        "<b>ফরেক্স মার্কেট সেশন</b> অংশে Sydney, Tokyo, London ও New York বাজার কখন খোলা তা আপনার সময় অনুযায়ী দেখায়। সবুজ রেখা = এখনকার সময়, গাঢ় বার = সেশন খোলা। উপরের ঘর থেকে আপনার দেশের সময় বেছে নিন।",
      ],
      [
        "লট সাইজ ক্যালকুলেটর",
        "<b>🧮 লট সাইজ ক্যালকুলেটর</b> অংশে কয়টা ট্রেড নেবেন, Stop loss (pips) লিখে একটা রিস্ক মোড (Safe / Medium Risk / High Risk) বাছলে (এমাউন্ট ও ঝুঁকি % নিজে থেকে <b>Starting balance</b> ও <b>Max daily loss (%)</b> থেকে আসবে), প্রতি ট্রেডে কত লট নেওয়া ভালো তা বলে দেবে। নিচের তালিকায় বেশি এমাউন্টে কত লট হবে সেটাও দেখাবে।",
      ],
      [
        "দিনের কার্ড (১)",
        "প্রতিদিনের কার্ডে উপর থেকে: <b>Control your emotion</b> আবেগ ধরে রাখতে পারলে ট্যাপ করুন ✅। <b>Rules check</b> খুলে প্রতিটা নিয়মে একবার ট্যাপ = ✓ মেনেছি, দুবার = ✗ ভেঙেছি। <b>Pre-trade checklist</b> ট্রেডের আগে মিলিয়ে নিন: একবার ট্যাপ = ✓ মেনেছি, দুবার = ❌ মানিনি। ফাঁকা বা ❌ থাকলে ট্রেড নয়।",
      ],
      [
        "দিনের কার্ড (২)",
        "ট্রেডের ঘরে <b>Pair</b> লিখুন (যেমন XAUUSD), <b>Dir.</b> এ B = কিনেছি, S = বিক্রি। <b>A+ Set</b> এ সেরা সেটআপ হলে ট্যাপ করুন (একবার Yes, আবার No)। <b>P/L ($)</b> এ লাভ বা লস লিখুন, আর <b>Pips</b> এ কত পিপস লাভ বা লস হলো লিখুন। লস হলে দুটোতেই আগে মাইনাস (-) দিন। দিনে সর্বোচ্চ ৩টি ট্রেড।",
      ],
      [
        "দিন শেষে",
        "<b>Biggest mistake</b> এ আজকের সবচেয়ে বড় ভুল, <b>Next day focus</b> এ কাল কোন বিষয়ে মনোযোগ দেবেন, <b>Mood</b> এ তারা (১ = মন খারাপ/রাগ, ৫ = শান্ত), আর <b>Notes</b> এ যা ইচ্ছা লিখুন। সব লেখা এই ফোনের ব্রাউজারে নিজে থেকে সেভ হয়।",
      ],
      [
        "জার্নাল সেভ করুন",
        "উপরের <b>Download PDF</b> ও <b>Download image</b> বাটনে চাপলে পুরো মাসের জার্নাল সেভ হবে। অন্য ফোন বা ব্রাউজারে লগ নিতে চাইলে <b>Backup</b> বাটনে ফাইল নিয়ে সেখানে <b>Restore</b> দিন। পরে যেকোনো সময় বাম নিচের <b>?</b> বাটনে চাপলে এই গাইড আবার দেখতে পারবেন। শুভ ট্রেডিং! 🚀",
      ],
    ];

    function tour(i: number) {
      let o = document.getElementById("tour");
      if (!o) {
        o = document.createElement("div");
        o.id = "tour";
        document.body.appendChild(o);
      }
      if (i >= TOUR.length) {
        o.style.display = "none";
        try {
          localStorage.setItem("mh-tour-done", "1");
        } catch (e) {}
        return;
      }
      const t = TOUR[i];
      o.style.display = "flex";
      o.innerHTML =
        '<div class="tbox"><div class="tstep">' +
        (i + 1) +
        " / " +
        TOUR.length +
        "</div><h3>" +
        t[0] +
        "</h3><p>" +
        t[1] +
        '</p><div class="tbtn"><button class="tskip">বাদ দিন</button><button class="tnext">' +
        (i === TOUR.length - 1 ? "শুরু করি" : "পরের ধাপ →") +
        "</button></div></div>";
      (o.querySelector(".tskip") as HTMLElement).onclick = function () {
        tour(99);
      };
      (o.querySelector(".tnext") as HTMLElement).onclick = function () {
        tour(i + 1);
      };
    }

    // Backup / restore handler (matches HTML reference)
    (function () {
      const bk: any = document.getElementById("bk"),
        rs: any = document.getElementById("rs"),
        rf: any = document.getElementById("rsf");
      if (!bk || !rs || !rf) return;
      let pend: any = null;
      function stamp() {
        const d = new Date();
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
      }
      function flash(b: any, t: string, ms?: number) {
        if (b._o == null) b._o = b.textContent;
        b.textContent = t;
        clearTimeout(b._f);
        b._f = setTmo(function () {
          b.textContent = b._o;
          b._o = null;
        }, ms || 3000);
      }
      bk.addEventListener("click", function () {
        save();
        const txt = JSON.stringify({ app: "mahfuj-trading-log", v: 1, saved: new Date().toISOString(), data: ST }),
          fn = "trading-log-backup-" + stamp() + ".json",
          blob = new Blob([txt], { type: "application/json" });
        if (DM) {
          DM.save({ filename: fn, data: blob }).then(
            function () {
              flash(bk, "Saved ✓");
            },
            function (e: any) {
              if (!(e && e.code === "declined")) flash(bk, "Could not save");
            }
          );
          return;
        }
        if (window.self !== window.top) {
          ov(
            '<p class="sub">সব লেখা কপি করে নিরাপদ জায়গায় রাখুন (যেমন নোট অ্যাপে)। এটাই আপনার ব্যাকআপ।</p><textarea id="ct" readonly style="width:100%;height:50vh;font:12px monospace;color:var(--tx);background:var(--card);border:1px solid var(--bd);border-radius:6px;padding:8px">' +
              esc(txt) +
              '</textarea><button class="reset" id="cc" style="width:100%;margin:8px 0 0">Copy all</button>'
          );
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        setTmo(function () {
          a.remove();
        }, 500);
        flash(bk, "Saved ✓");
      });
      function apply() {
        ST = pend;
        if (!(ST.c >= 0 && ST.c < ST.m.length)) ST.c = 0;
        pend = null;
        rs._armed = false;
        save();
        load();
        flash(rs, "Restored ✓", 3000);
        window.scrollTo(0, 0);
      }
      rs.addEventListener("click", function () {
        if (pend && rs._armed) {
          apply();
          return;
        }
        rf.value = "";
        rf.click();
      });
      rf.addEventListener("change", function () {
        const f = rf.files && rf.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = function () {
          try {
            const o = JSON.parse(String(r.result)),
              d = o && o.data ? o.data : o;
            if (
              !d ||
              !Array.isArray(d.m) ||
              !d.m.length ||
              !d.m.every(function (m: any) {
                return m && Array.isArray(m.d) && m.d.length >= 20;
              })
            )
              throw 0;
            pend = d;
            rs._armed = true;
            flash(rs, "Tap again to restore " + d.m.length + " month(s)", 6000);
            setTmo(function () {
              pend = null;
              rs._armed = false;
            }, 6000);
          } catch (e) {
            flash(rs, "Invalid backup file", 3500);
          }
        };
        r.readAsText(f);
      });
    })();

    // Lot Size Calculator & Prop Firm
    (function () {
      const E: Record<string, any> = {};
      ["lct", "lcs", "lci", "lcp", "lcn", "lcnw"].forEach(function (k) {
        E[k] = document.getElementById(k);
      });
      const out = document.getElementById("lcout");
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
        nas100: 1,
      };
      const MODES: Record<string, { s: number; l: string }> = {
        safe: { s: 1 / 3, l: "Safe" },
        medium: { s: 2 / 3, l: "Medium Risk" },
        high: { s: 1, l: "High Risk" },
      };
      const PLAN: Record<string, { d?: number; name: string }> = {
        "1": { name: "Phase 1" },
        "2": { name: "Phase 2" },
        live: { d: 20, name: "Instant" },
      };
      let mode = "medium",
        acct = "live",
        ph = "1",
        opt = "10",
        pt = "2",
        dc = "7",
        dr = "0.5";
      const dtgt = byId<HTMLInputElement>("dtgt"),
        mtgt = byId<HTMLInputElement>("mtgt"),
        maxdEl = byId<HTMLInputElement>("maxd"),
        startEl = byId<HTMLInputElement>("start");

      function dailyNow() {
        const b = (num(startEl.value) || 10000) / 10000,
          pc = Number(opt),
          base = pc * 10;
        return Math.round(base * b * 100) / 100;
      }
      function lotCalc(b: number, t: number, r: number, sl: number, pv: number) {
        const tot = (b * r) / 100,
          per = tot / t,
          raw = per / (sl * pv);
        return { tot: tot, per: per, raw: raw, lot: Math.floor(raw * 100 + 1e-9) / 100 };
      }
      function lt(x: number) {
        return x >= 0.01 ? x.toFixed(2) : "<0.01";
      }
      function pipVal() {
        return num(E.lcp.value) || 10;
      }
      function renderProp() {
        const box = byId("propbox");
        if (acct !== "prop") {
          box.style.display = "none";
          return;
        }
        box.style.display = "";
        const P = PLAN[ph],
          T = num(mtgt.value),
          ml = num(maxdEl.value);
        let h = "",
          d = 0;
        if (!(T > 0)) {
          box.innerHTML = '<div class="lcln">Enter a total profit target to see how many days it will take.</div>';
          return;
        }
        if (ph === "live") {
          d = T / (P.d || 20);
          h +=
            '<div class="lcln"><b>' +
            (pt === "i" ? "Instant" : "Prop Live") +
            "</b> · Monthly target <b>$" +
            money(T) +
            "</b> (" +
            (pt === "i" ? dr + "% of balance x 20 days" : "5% of balance") +
            ")</div>";
          h +=
            '<div class="lcln">Daily target <b>$' +
            money(d) +
            "</b> (" +
            (pt === "i" ? dr + "% of balance" : P.d + " days") +
            ")</div>";
          h +=
            '<div class="lcln">To keep the funded account safe, do not trade beyond the target and do not raise the daily loss limit.</div>';
        } else {
          d = dailyNow();
          const n = Math.ceil(T / d);
          h += '<div class="lcln"><b>' + P.name + "</b> · Target <b>$" + money(T) + "</b></div>";
          h += '<div class="lcln">Daily target <b>$' + money(d) + "</b> → about <b>" + n + " days</b> to hit target</div>";
          h +=
            '<div class="lcln">Once the daily target is hit, stop trading for the day.' +
            (ph === "2" ? " Phase 2 is usually harder, so staying steady is best." : "") +
            "</div>";
          h +=
            '<div class="lcln">Prop firms often require a minimum number of trading days (often 4). Check your firm’s rules.</div>';
        }
        if (ph === "live" && pt === "i") {
          const pdays = profitDays(),
            tg = Number(dc);
          h +=
            '<div class="lcln">লাভের দিন: <b>' +
            pdays.n +
            " / " +
            tg +
            "</b> (দিনের ব্যালেন্সের " +
            dr +
            "% লাভ হলে দিন গোনা হবে) · " +
            (pdays.n >= tg ? "টার্গেট পূর্ণ হয়েছে" : tg - pdays.n + " দিন বাকি") +
            "</div>";
        }
        if (ml > 0 && d > ml)
          h += '<div class="lcwarn">⚠ Daily target is higher than Max daily loss. Extend the time.</div>';
        box.innerHTML = h;
      }

      function render() {
        renderProp();
        const b = num(byId<HTMLInputElement>("start").value),
          maxl = num(byId<HTMLInputElement>("maxl").value),
          t = num(E.lct.value),
          sl = num(E.lcs.value),
          pv = pipVal();
        const mp = MODES[mode];
        const maxd = num(maxdEl.value);
        const dayCap = maxd > 0 ? maxd : maxl > 0 && b > 0 ? (b * maxl) / 100 : 0;
        const r = b > 0 && dayCap > 0 ? ((dayCap * mp.s) / b) * 100 : 0;
        if (!(b > 0 && t > 0 && r > 0 && sl > 0 && pv > 0)) {
          out!.innerHTML =
            '<div class="nmsg" style="padding:6px 2px;color:var(--mut)">Lot size will appear once starting balance, trades, stop loss and instrument are set.</div>';
          return;
        }
        const c = lotCalc(b, t, r, sl, pv),
          use = c.lot >= 0.01 ? c.lot : 0.01,
          risk = use * sl * pv;
        let h = "";
        h += '<div class="lcbig"><span>Lot size per trade</span><b>' + use.toFixed(2) + "</b><span>" + t + " trades, each</span></div>";
        h +=
          '<div class="lcln">' +
          mp.l +
          " mode (" +
          Math.round(mp.s * 100) +
          "% of Max daily loss): total daily risk <b>" +
          money(c.tot) +
          "</b> → risk per trade <b>" +
          money(c.per) +
          "</b></div>";
        if (dayCap > 0) h += '<div class="lcln">Max daily loss: <b>' + money(dayCap) + "</b></div>";
        h +=
          '<div class="lcln">' +
          sl +
          " pips stop loss, one trade loses about <b>" +
          money(risk) +
          "</b>. 1:2 target (" +
          sl * 2 +
          " pips) profit about <b>" +
          money(risk * 2) +
          "</b>।</div>";
        if (c.lot < 0.01)
          h +=
            '<div class="lcwarn">⚠ At this amount the calculated lot is below 0.01. Taking the minimum 0.01 makes the risk ' +
            money(0.01 * sl * pv) +
            " which is more than your set " +
            money(c.per) +
            " . Take fewer trades, use a smaller stop loss, or increase the amount.</div>";
        h += "<table><tr><th>Amount</th><th>Risk/trade</th><th>Lot/trade</th></tr>";
        const d2 = lotCalc(b, t, r, sl, pv);
        h += '<tr style="font-weight:800"><td>' + money(b) + " ← yours</td><td>" + money(d2.per) + "</td><td>" + lt(d2.lot) + "</td></tr>";
        h += "</table>";
        out!.innerHTML = h;
      }

      function store() {
        S.lot = {
          t: E.lct.value,
          s: E.lcs.value,
          i: E.lci.value,
          p: E.lcp.value,
          n: E.lcn.value,
          m: mode,
          a: acct,
          ph: ph,
          o: opt,
          pt: pt,
          dc: dc,
          dr: dr,
        };
        save();
      }
      function badgeText() {
        if (acct !== "prop") return "Live Capital";
        if (pt === "i") return "Prop Firm · Instant";
        const t = pt === "1" ? "1-Step" : "2-Step";
        const p = ph === "live" ? "Prop Live" : "Phase " + ph;
        return "Prop Firm · " + t + " · " + p;
      }
      function markBtns() {
        const bd = document.getElementById("acctbadge");
        if (bd) bd.textContent = badgeText();
        document.querySelectorAll("#drs button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-dr") === dr);
        });
        document.querySelectorAll("#dcs button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-dc") === dc);
        });
        document.querySelectorAll("#lcpt button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-pt") === pt);
        });
        const tp = document.getElementById("tpct");
        if (tp) tp.textContent = acct === "prop" ? (ph === "live" ? "= 5%" : "= " + opt + "%") : "";
        document.querySelectorAll("#lcm button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-m") === mode);
        });
        document.querySelectorAll("#lca button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-a") === acct);
        });
        document.querySelectorAll("#lcph button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-ph") === ph);
        });
        document.querySelectorAll("#tpick button").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-p") === opt);
        });
      }
      function sync() {
        E.lcnw.style.display = E.lci.value === "custom" ? "" : "none";
        const pr = acct === "prop";
        byId("lcpt").style.display = pr ? "" : "none";
        byId("lcph").style.display = pr && pt !== "i" ? "" : "none";
        (document.querySelector('#lcph [data-ph="2"]') as HTMLElement).style.display = pt === "2" ? "" : "none";
        byId("mindw").style.display = pr && pt === "i" ? "" : "none";
        if (!(pr && ph !== "live")) byId("tpick").style.display = "none";
        document.querySelectorAll("#tpick button").forEach(function (x) {
          const pc = Number(x.getAttribute("data-p"));
          (x as HTMLElement).style.display = allowedPcts().indexOf(pc) >= 0 ? "" : "none";
        });
      }
      function refreshPick() {
        const b = num(startEl.value);
        document.querySelectorAll("#tpick button").forEach(function (x) {
          const pc = Number(x.getAttribute("data-p"));
          x.textContent = b > 0 ? pc + "% · $" + Math.round((b * pc) / 100) : pc + "%";
        });
      }
      function applyProp() {
        if (acct !== "prop" || ph === "live") return;
        const b = num(startEl.value);
        if (!(b > 0)) return;
        opt = snapPct(Number(opt));
        const T = Math.round(((b * Number(opt)) / 100) * 100) / 100;
        mtgt.value = String(T);
        S.mt = String(T);
        const d = dailyNow();
        dtgt.value = String(d);
        S.dt = String(d);
        setLossFromDaily(d);
        save();
        refreshPick();
        if (typeof update === "function") update();
      }
      function autoTarget() {
        if (acct !== "prop") return;
        if (ph === "live") {
          const b = num(startEl.value);
          if (!(b > 0)) return;
          const d =
            pt === "i"
              ? Math.round(((b * Number(dr)) / 100) * 100) / 100
              : Math.round(((b * 0.05) / (PLAN.live.d || 20)) * 100) / 100;
          const T =
            pt === "i" ? Math.round(d * (PLAN.live.d || 20) * 100) / 100 : Math.round(b * 0.05 * 100) / 100;
          mtgt.value = String(T);
          S.mt = String(T);
          dtgt.value = String(d);
          S.dt = String(d);
          setLossFromDaily(d);
          save();
          if (typeof update === "function") update();
          return;
        }
        if (!(num(startEl.value) > 0)) {
          startEl.value = "10000";
          S.s = "10000";
          if ((window as any).updStartK) (window as any).updStartK();
        }
        applyProp();
      }
      startEl.addEventListener("input", function () {
        if (acct === "prop" && ph !== "live") applyProp();
        refreshPick();
      });
      function setLossFromDaily(d: number) {
        const bal = num(startEl.value);
        if (!(d > 0) || !(bal > 0)) return;
        S.l = String(+((d / bal) * 100).toFixed(2));
        byId<HTMLInputElement>("maxl").value = S.l;
        if (typeof syncD === "function") syncD();
      }
      function allowedPcts() {
        if (pt === "2") return ph === "2" ? [8, 6, 5, 4] : [10, 8, 6];
        return [12, 10, 9, 8, 7, 6];
      }
      function snapPct(v: number) {
        const a = allowedPcts();
        let best = a[0];
        a.forEach(function (x) {
          if (Math.abs(x - v) < Math.abs(best - v)) best = x;
        });
        return String(best);
      }
      function setPT(n: string) {
        pt = n;
        if (n === "1") ph = "1";
        if (n === "i") ph = "live";
        if (n === "2" && ph !== "1" && ph !== "2" && ph !== "live") ph = "1";
      }
      function profitDays() {
        let bal = num(startEl.value) || 0,
          n = 0,
          tot = 0;
        S.d.forEach(function (d: any) {
          let sum = 0,
            any = false;
          d.t.forEach(function (t: any) {
            const v = num(t.pl);
            if (!isNaN(v)) {
              sum += v;
              any = true;
            }
          });
          if (any) {
            tot++;
            if (sum > 0 && sum >= (bal * Number(dr)) / 100) n++;
          }
          bal += sum;
        });
        return { n: n, tot: tot };
      }
      function saveSnap(k: string) {
        S.snap = S.snap || {};
        S.snap[k] = { s: startEl.value, dt: dtgt.value, mt: mtgt.value, l: S.l };
      }
      function loadSnap(k: string) {
        const sn = S.snap && S.snap[k];
        if (!sn) return false;
        startEl.value = sn.s;
        dtgt.value = sn.dt;
        mtgt.value = sn.mt;
        S.s = sn.s;
        S.dt = sn.dt;
        S.mt = sn.mt;
        if (sn.l !== undefined) {
          S.l = sn.l;
          byId<HTMLInputElement>("maxl").value = sn.l;
          if (typeof syncD === "function") syncD();
        }
        if ((window as any).updStartK) (window as any).updStartK();
        return true;
      }
      function switchAcct(n: string) {
        if (n === acct) return;
        saveSnap(acct);
        acct = n;
        if (acct === "live") {
          loadSnap("live");
        } else if (!loadSnap("prop")) {
          startEl.value = "10000";
          S.s = "10000";
          if ((window as any).updStartK) (window as any).updStartK();
          autoTarget();
        }
        save();
        markBtns();
        sync();
        store();
        render();
      }
      E.lci.addEventListener("change", function () {
        if (INST[E.lci.value] != null) E.lcp.value = INST[E.lci.value];
        sync();
        store();
        render();
      });
      ["lct", "lcs", "lcp", "lcn"].forEach(function (k) {
        E[k].addEventListener("input", function () {
          store();
          render();
        });
      });
      ["start", "maxl", "maxd"].forEach(function (id) {
        byId(id).addEventListener("input", function () {
          render();
        });
      });
      mtgt.addEventListener("input", function () {
        if (acct === "prop" && ph !== "live") {
          const T = num(mtgt.value),
            b = num(startEl.value);
          if (T > 0 && b > 0) {
            const pc = Math.round((T / b) * 100);
            opt = snapPct(pc);
            const d = dailyNow();
            dtgt.value = String(d);
            S.dt = String(d);
            save();
          }
        }
        markBtns();
        render();
      });
      document.querySelectorAll("#tpick button").forEach(function (x) {
        x.addEventListener("click", function () {
          opt = x.getAttribute("data-p")!;
          byId("tpick").style.display = "none";
          applyProp();
          store();
          markBtns();
          render();
        });
      });
      mtgt.addEventListener("focus", openPick);
      mtgt.addEventListener("click", openPick);
      function openPick() {
        if (acct === "prop" && ph !== "live") byId("tpick").style.display = "grid";
      }
      document.querySelectorAll("#lcm button").forEach(function (x) {
        x.addEventListener("click", function () {
          mode = x.getAttribute("data-m")!;
          markBtns();
          store();
          render();
        });
      });
      document.querySelectorAll("#lca button").forEach(function (x) {
        x.addEventListener("click", function () {
          switchAcct(x.getAttribute("data-a")!);
        });
      });
      document.querySelectorAll("#lcph button").forEach(function (x) {
        x.addEventListener("click", function () {
          ph = x.getAttribute("data-ph")!;
          markBtns();
          sync();
          autoTarget();
          store();
          render();
        });
      });
      document.querySelectorAll("#lcpt button").forEach(function (x) {
        x.addEventListener("click", function () {
          setPT(x.getAttribute("data-pt")!);
          markBtns();
          sync();
          autoTarget();
          store();
          render();
        });
      });
      document.querySelectorAll("#dcs button").forEach(function (x) {
        x.addEventListener("click", function () {
          dc = x.getAttribute("data-dc")!;
          markBtns();
          store();
          render();
        });
      });
      document.querySelectorAll("#drs button").forEach(function (x) {
        x.addEventListener("click", function () {
          dr = x.getAttribute("data-dr")!;
          markBtns();
          store();
          autoTarget();
          render();
        });
      });
      (window as any).lcLoad = function () {
        const L = S.lot || {};
        E.lct.value = L.t || 3;
        E.lcs.value = L.s || 20;
        E.lci.value = L.i && (INST[L.i] != null || L.i === "custom") ? L.i : "eurusd";
        E.lcp.value = L.p || (INST[E.lci.value] != null ? INST[E.lci.value] : 10);
        E.lcn.value = L.n || "";
        mode = MODES[L.m] ? L.m : "medium";
        acct = L.a === "prop" ? "prop" : "live";
        opt = L.o && /^(6|7|8|9|10)$/.test(L.o) ? L.o : "10";
        ph = L.ph === "2" || L.ph === "live" ? L.ph : "1";
        pt = /^(1|2|i)$/.test(L.pt) ? L.pt : "2";
        if (pt === "1" && ph === "2") ph = "1";
        if (pt === "i") ph = "live";
        dc = /^(7|5|4)$/.test(L.dc) ? L.dc : "7";
        dr = L.dr === "0.25" || L.dr === "0.5" ? L.dr : "0.5";
        markBtns();
        sync();
        refreshPick();
        render();
      };
    })();

    (function () {
      const stEl = byId<HTMLInputElement>("start"),
        sk = byId("startk");
      function f() {
        const v = parseFloat(stEl.value);
        sk.textContent = v >= 1000 ? "= " + parseFloat((v / 1000).toFixed(2)) + "k" : "";
      }
      (window as any).updStartK = f;
      stEl.addEventListener("input", f);
      f();
    })();

    byId("help").addEventListener("click", function () {
      tour(0);
    });
    load();
    try {
      if (!localStorage.getItem("mh-tour-done")) tour(0);
    } catch (e) {}

    // Collapsible option groups
    (function () {
      ["lca", "lcpt", "lcph", "lcm", "dcs"].forEach(function (id) {
        const g = document.getElementById(id);
        if (!g) return;
        g.classList.add("grp", "collapsed");
        g.addEventListener(
          "click",
          function (e) {
            const b = (e.target as HTMLElement | null)?.closest("button");
            if (!b || !g.contains(b)) return;
            if (g.classList.contains("collapsed")) {
              if (b.classList.contains("on")) {
                g.classList.remove("collapsed");
                e.stopPropagation();
                e.preventDefault();
              }
              return;
            }
            setTmo(function () {
              g.classList.add("collapsed");
            }, 0);
          },
          true
        );
      });
    })();

    // Month & year calendar controls
    (function () {
      const MF = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const mmon = document.getElementById("mmon") as HTMLSelectElement | null,
        myr = document.getElementById("myr") as HTMLSelectElement | null,
        ymi = document.getElementById("ymonth") as HTMLInputElement | null,
        mbig = document.getElementById("mbig");
      if (!mmon || !myr || !ymi || !mbig) return;
      mmon.innerHTML = "";
      myr.innerHTML = "";
      MF.forEach(function (n, i) {
        mmon.add(new Option(n, String(i + 1).padStart(2, "0")));
      });
      for (let y = 2026; y <= 2050; y++) myr.add(new Option(String(y), String(y)));
      function cur() {
        const v = (S.ym || "").split("-");
        const n = new Date();
        return { y: +v[0] || n.getFullYear(), m: +v[1] || n.getMonth() + 1 };
      }
      function setYM(y: number, m: number) {
        S.ym = y + "-" + String(m).padStart(2, "0");
        ymi!.value = S.ym;
        padDays();
        save();
        load();
      }
      (window as any).syncM = function () {
        const c = cur();
        if (!myr.querySelector('option[value="' + c.y + '"]')) myr.add(new Option(String(c.y), String(c.y)));
        mmon.value = String(c.m).padStart(2, "0");
        myr.value = String(c.y);
        mbig!.textContent = MF[c.m - 1] + " " + c.y + "  ·  " + new Date(c.y, c.m, 0).getDate() + " days";
      };
      mmon.addEventListener("change", function () {
        const c = cur();
        setYM(c.y, +mmon.value);
      });
      myr.addEventListener("change", function () {
        const c = cur();
        setYM(+myr.value, c.m);
      });
      byId("mprev").addEventListener("click", function () {
        const c = cur(),
          d = new Date(c.y, c.m - 2, 1);
        setYM(d.getFullYear(), d.getMonth() + 1);
      });
      byId("mnext").addEventListener("click", function () {
        const c = cur(),
          d = new Date(c.y, c.m, 1);
        setYM(d.getFullYear(), d.getMonth() + 1);
      });
      byId("mtoday").addEventListener("click", function () {
        const n = new Date();
        setYM(n.getFullYear(), n.getMonth() + 1);
      });
      (window as any).syncM();
    })();

    // Daily market break
    (function () {
      const INS = [
        { n: "XAUUSD (Gold)", b: [22, 23] },
        { n: "US30", b: [22, 23] },
        { n: "NAS100", b: [22, 23] },
        { n: "BTCUSD", b: null },
        { n: "EURUSD", b: null },
        { n: "GBPUSD", b: null },
        { n: "USDJPY", b: null },
        { n: "GBPJPY", b: null },
        { n: "EURJPY", b: null },
        { n: "AUDUSD", b: null },
        { n: "NZDUSD", b: null },
        { n: "USDCAD", b: null },
        { n: "USDCHF", b: null },
      ];
      const ZN: Array<[string, string]> = [
        ["Asia/Dhaka", "বাংলাদেশ (Dhaka)"],
        ["Asia/Kolkata", "ভারত"],
        ["Asia/Dubai", "দুবাই"],
        ["Asia/Riyadh", "সৌদি আরব"],
        ["Asia/Kuala_Lumpur", "মালয়েশিয়া"],
        ["Asia/Singapore", "সিঙ্গাপুর"],
        ["Europe/London", "লন্ডন"],
        ["America/New_York", "নিউ ইয়র্ক"],
        ["UTC", "UTC"],
      ];
      const ins = document.getElementById("bkins") as HTMLSelectElement | null,
        zs = document.getElementById("bkz") as HTMLSelectElement | null,
        out = document.getElementById("bkout");
      if (!ins || !zs || !out) return;
      ins.innerHTML = "";
      zs.innerHTML = "";
      INS.forEach(function (x, i) {
        ins.add(new Option(x.n, String(i)));
      });
      ZN.forEach(function (z) {
        zs.add(new Option(z[1], z[0]));
      });
      ins.value = "0";
      zs.value = "Asia/Riyadh";
      function utcDate(h: number) {
        const d = new Date();
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, 0));
      }
      function fmt(h: number, zone: string) {
        return utcDate(h).toLocaleTimeString("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true });
      }
      function wkFmt(add: number, zone: string) {
        const n = new Date(),
          diff = (5 - n.getUTCDay() + 7) % 7,
          t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + diff + add, 22, 0));
        return t.toLocaleString("en-US", { timeZone: zone, weekday: "short", hour: "numeric", minute: "2-digit", hour12: true });
      }
      function zoneName(zone: string) {
        const f = ZN.filter(function (z) {
          return z[0] === zone;
        })[0];
        return f ? f[1] : zone;
      }
      function render() {
        const x = INS[+ins!.value],
          zone = zs!.value,
          now = new Date(),
          uh = now.getUTCHours(),
          ud = now.getUTCDay();
        let html = "";
        if (x.b) {
          const closed = uh >= x.b[0] && uh < x.b[1];
          html +=
            '<div><span class="bkstat ' +
            (closed ? "closed" : "open") +
            '">' +
            (closed ? "● Closed now (daily break)" : "● Open now") +
            "</span></div>";
          html += '<div class="bkline">Daily break: <b>' + fmt(x.b[0], zone) + " – " + fmt(x.b[1], zone) + "</b></div>";
        } else {
          const weekendClosed = ud === 6 || (ud === 0 && uh < 22) || (ud === 5 && uh >= 22);
          html +=
            '<div><span class="bkstat ' +
            (weekendClosed ? "closed" : "open") +
            '">' +
            (weekendClosed ? "● Closed (weekend)" : "● Open now") +
            "</span></div>";
          html += '<div class="bkline">No daily break</div>';
        }
        html += '<div class="sub">Local time in ' + zoneName(zone) + " (updates with daylight saving)</div>";
        if (!x.b)
          html +=
            '<div class="bkline" style="font-size:13px;color:#cbd5e1">Weekend close: <b>' +
            wkFmt(0, zone) +
            "</b> → <b>" +
            wkFmt(2, zone) +
            "</b></div>";
        out!.innerHTML = html;
      }
      ins.addEventListener("change", render);
      zs.addEventListener("change", function () {
        const ms = document.getElementById("mstz") as HTMLSelectElement | null;
        if (ms && ms.querySelector('option[value="' + zs.value + '"]') && ms.value !== zs.value) {
          ms.value = zs.value;
          ms.dispatchEvent(new Event("change"));
        }
        render();
      });
      const msel2 = document.getElementById("mstz") as HTMLSelectElement | null;
      if (msel2)
        msel2.addEventListener("change", function () {
          if (zs.querySelector('option[value="' + msel2.value + '"]')) {
            zs.value = msel2.value;
            render();
          }
        });
      render();
      setInt(render, 60000);
    })();

    // Auto-growing textareas + Hide/Show toggle
    (function () {
      function fit(t: HTMLTextAreaElement) {
        t.style.setProperty("height", "auto", "important");
        t.style.setProperty("height", Math.max(34, t.scrollHeight + 2) + "px", "important");
      }
      const onInput = function (e: Event) {
        const target = e.target as HTMLElement | null;
        if (target && target.tagName === "TEXTAREA") fit(target as HTMLTextAreaElement);
      };
      document.addEventListener("input", onInput);
      cleanups.push(() => document.removeEventListener("input", onInput));

      const mnEl = document.getElementById("mname") as HTMLTextAreaElement | null;
      if (mnEl) {
        mnEl.addEventListener("input", function () {
          fit(mnEl);
        });
      }
      setTmo(scan, 300);
      function addTog(t: HTMLTextAreaElement) {
        const prev = t.previousElementSibling;
        if (prev && prev.classList.contains("ftog")) return;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ftog";
        b.textContent = "Hide";
        b.addEventListener("click", function () {
          const hide = t.style.display !== "none";
          t.style.display = hide ? "none" : "";
          b.textContent = hide ? "Show" : "Hide";
          if (!hide) fit(t);
        });
        t.parentNode!.insertBefore(b, t);
      }
      function scan() {
        document.querySelectorAll("textarea").forEach(function (t) {
          addTog(t as HTMLTextAreaElement);
          fit(t as HTMLTextAreaElement);
        });
      }
      const mo = new MutationObserver(function () {
        scan();
      });
      const d = document.getElementById("days");
      if (d) mo.observe(d, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());
    })();

    // Motivational advice cycling
    (function () {
      const Q = [
        ["Discipline beats motivation. Follow your plan.", "শৃঙ্খলা প্রেরণার চেয়ে শক্তিশালী। পরিকল্পনা মেনে চলুন।"],
        ["Protect your capital first. Profits come second.", "আগে মূলধন রক্ষা করুন, লাভ পরে আসবে।"],
        ["One bad trade does not define your month. Stay calm.", "একটি খারাপ ট্রেডে মাস নষ্ট হয় না। শান্ত থাকুন।"],
        ["Small consistent wins build a big account.", "ছোট ছোট ধারাবাহিক জয়ই বড় একাউন্ট গড়ে।"],
        ["Plan the trade, then trade the plan.", "আগে পরিকল্পনা, তারপর পরিকল্পনা অনুযায়ী ট্রেড।"],
        ["Cut losses fast. Let winners run with rules.", "লস দ্রুত কাটুন, নিয়ম মেনে লাভকে বাড়তে দিন।"],
        ["Greed is the enemy of a good trader.", "লোভ ভালো ট্রেডারের সবচেয়ে বড় শত্রু।"],
        ["Stop trading when the daily target is hit.", "দৈনিক টার্গেট পূরণ হলে ট্রেড বন্ধ করুন।"],
      ];
      const el = document.getElementById("advtext"),
        bn = document.querySelector("#advice .adv-bn");
      if (!el || !bn) return;
      let i = 0;
      setInt(function () {
        el.classList.add("fade");
        setTmo(function () {
          i = (i + 1) % Q.length;
          el.textContent = Q[i][0];
          bn.textContent = Q[i][1];
          el.classList.remove("fade");
        }, 600);
      }, 8000);
    })();

    // Floating back-to-top button
    (function () {
      const b = document.getElementById("gtop");
      if (!b) return;
      function upd() {
        b!.classList.toggle("show", window.scrollY > 220);
      }
      window.addEventListener("scroll", upd, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", upd));
      b.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      upd();
    })();

    return () => {
      intervals.forEach((id) => clearInterval(id));
      timeouts.forEach((id) => clearTimeout(id));
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <h1 aria-label="Mahfuj’s Trading Log">
        <span id="ty">MAHFUJ TRADING LOG</span>
      </h1>
      <div className="hrow">
        <div className="pfpw" id="pfpw">
          <img className="pfp pfp1" alt="Mahfuj" src={PFP_PHOTO} />
          <img className="pfp pfp2" alt="Money Hungry Trading" src={PFP_LOGO} />
        </div>
        <div className="advice" id="advice">
          <div className="adv-text" id="advtext">
            Discipline beats motivation. Follow your plan.
          </div>
          <div className="adv-bn">আজকের মন্ত্র: পরিকল্পনা মেনে চলুন।</div>
        </div>
      </div>

      <div className="card mcal">
        <div className="mtop">
          <div>
            <label>Month</label>
            <select id="msel"></select>
          </div>
          <button className="reset" id="newm">
            + New month
          </button>
        </div>
        <div className="mtitle">📅 Calendar &amp; trading month</div>
        <div className="mbig" id="mbig">
          –
        </div>
        <div className="mnav">
          <button type="button" id="mprev" aria-label="Previous month">
            ◀
          </button>
          <button type="button" id="mtoday">
            📅 Current month
          </button>
          <button type="button" id="mnext" aria-label="Next month">
            ▶
          </button>
        </div>
        <div className="mrow">
          <div>
            <label>Month</label>
            <select id="mmon"></select>
          </div>
          <div>
            <label>Year</label>
            <select id="myr"></select>
          </div>
        </div>
        <label>Month name / note</label>
        <textarea id="mname" rows={1}></textarea>
        <div id="acctbadge" className="acctbadge"></div>
        <input id="ymonth" type="month" style={{ display: "none" }} />
      </div>

      <div id="dls" style={{ marginBottom: 10 }}>
        <button className="reset" id="dl2" style={{ margin: "0 0 6px", width: "100%" }}>
          ⬇ Download PDF (all data)
        </button>
        <button className="reset" id="dl" style={{ margin: 0, width: "100%" }}>
          ⬇ Download image (PNG)
        </button>
        <input type="file" id="rsf" accept=".json,application/json,text/plain" style={{ display: "none" }} />
      </div>

      <h2>⏸ Daily market break</h2>
      <div className="card" id="brk">
        <div className="brk-row">
          <div>
            <label>Instrument</label>
            <select id="bkins"></select>
          </div>
          <div>
            <label>Country</label>
            <select id="bkz"></select>
          </div>
        </div>
        <div id="bkout"></div>
        <p className="sub" style={{ margin: "8px 0 0" }}>
          Break times are typical for many brokers. Check your broker&apos;s own schedule.
        </p>
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
        <div className="msnote">সবুজ রেখা = এখন। গাঢ় বার = সেশন খোলা। শনি ও রবিবার ফরেক্স বাজার বন্ধ থাকে।</div>
      </div>

      <p className="sub">
        Tap rules to cycle Y / N. Each month is saved separately on this device. A new month starts from 0.
      </p>

      <div className="card two">
        <div style={{ gridColumn: "1/-1" }}>
          <label>
            Starting balance ($) <span id="startk" style={{ color: "var(--gn)" }}></span>
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
          <div style={{ position: "relative" }}>
            <input id="mtgt" type="number" inputMode="decimal" step="any" placeholder="e.g. 400" style={{ paddingRight: 64 }} />
            <span
              id="tpct"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gn)",
                fontWeight: 700,
                pointerEvents: "none",
              }}
            ></span>
            <div
              id="tpick"
              style={{
                display: "none",
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 6,
                width: 210,
                zIndex: 30,
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                padding: 8,
                background: "var(--card)",
                border: "1px solid var(--bd)",
                borderRadius: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,.35)",
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

        <h2 style={{ margin: "22px 0 12px", gridColumn: "1/-1" }}>🧮 Lot Size Calculator</h2>
        <div id="lc" style={{ gridColumn: "1/-1" }}>
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
            <div id="lcnw" style={{ display: "none" }}>
              <label>Instrument name</label>
              <input id="lcn" type="text" placeholder="e.g. NAS100" />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label>Pip value per 1.00 lot ($) — broker অনুযায়ী দিন</label>
              <input id="lcp" type="number" inputMode="decimal" step="any" />
            </div>
          </div>
          <div id="lca" className="modes" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button data-a="live">Live Capital</button>
            <button data-a="prop">Prop Firm</button>
          </div>
          <div id="lcpt" className="modes" style={{ gridTemplateColumns: "1fr 1fr 1fr", display: "none" }}>
            <button data-pt="1">1-Step</button>
            <button data-pt="2">2-Step</button>
            <button data-pt="i">Instant</button>
          </div>
          <div id="lcph" className="modes" style={{ gridTemplateColumns: "1fr 1fr 1fr", display: "none" }}>
            <button data-ph="1">Phase 1</button>
            <button data-ph="2">Phase 2</button>
            <button data-ph="live">Prop Live</button>
          </div>
          <div id="lcm" className="modes">
            <button data-m="safe">Safe</button>
            <button data-m="medium">Medium Risk</button>
            <button data-m="high">High Risk</button>
          </div>
          <div id="mindw" style={{ display: "none" }}>
            <label>Daily profit target (% of balance)</label>
            <div id="drs" className="modes" style={{ gridTemplateColumns: "1fr 1fr", margin: "6px 0 12px" }}>
              <button data-dr="0.25">0.25%</button>
              <button data-dr="0.5">0.5%</button>
            </div>
            <label>লাভের দিনের টার্গেট (দিনের ব্যালেন্সের নির্ধারিত % লাভ হলে দিন গোনা হবে)</label>
            <div id="dcs" className="modes" style={{ gridTemplateColumns: "1fr 1fr 1fr", margin: "6px 0 0" }}>
              <button data-dc="7">৭ দিন</button>
              <button data-dc="5">৫ দিন</button>
              <button data-dc="4">৪ দিন</button>
            </div>
          </div>
          <div id="propbox" style={{ display: "none" }}></div>
          <div id="lcout"></div>
          <p className="sub" style={{ margin: "10px 0 0" }}>
            This is a simple way to estimate, not trading advice. For Gold, 1 pip is assumed to be a 0.10 move. Actual
            numbers may differ slightly depending on your broker, leverage and pip value, so check on your own platform
            before trading.
          </p>
        </div>
      </div>

      <h2>Monthly numbers</h2>
      <div className="grid" id="stats"></div>
      <div className="card" id="strip" style={{ marginTop: 12 }}></div>

      <h2>Weekly review</h2>
      <div className="card">
        <table id="weeks"></table>
      </div>
      <div className="card" id="mist"></div>

      <h2>Daily log</h2>
      <p className="sub">
        Rules check: tap once = ✓ followed, tap twice = ✗ broken, third tap clears. Dir.: B = buy, S = sell. A+ Set:
        tap once = Yes, tap again = No. P/L: loss is negative. Mood: tap the stars, 1 star = tilted, 5 stars = calm and
        focused.
      </p>
      <div id="days"></div>
      <button className="reset" id="reset">
        Clear this month
      </button>

      <button id="help" aria-label="Help">
        ?
      </button>
      <button type="button" id="gtop" className="gtop" aria-label="Back to top" title="Back to top">
        ↑
      </button>
    </>
  );
}
