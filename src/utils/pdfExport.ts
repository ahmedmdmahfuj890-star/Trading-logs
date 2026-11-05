import { MonthData } from '../types/journal';
import { calculateMonthSummary } from './calculator';
import { money, fp, pct, num, RULES, PRE_CHECKLIST } from './storage';

interface LineItem {
  type: 'h1' | 'h2' | 't' | 'b' | 'p' | 'n' | 'gap';
  text: string;
}

export function formatJournalLines(month: MonthData): LineItem[] {
  const c = calculateMonthSummary(month);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
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

  const lines: LineItem[] = [];
  lines.push({ type: 'h1', text: `Mahfuj’s Trading Journal – ${month.nm || 'Month 1'}` });
  lines.push({ type: 'h2', text: 'Monthly numbers' });

  const stats = [
    ['Starting balance', money(c.start)],
    ['Ending balance', money(c.bal)],
    ['Net P/L', `${money(net)} (${c.start ? pct(net / c.start) : '–'})`],
    ['Total pips', `${fp(c.tp)} pips`],
    ['Daily profit target', num(month.dt) > 0 ? money(num(month.dt)) : '–'],
    [
      'Total profit target',
      num(month.mt) > 0
        ? `${money(num(month.mt))} (${pct(net / num(month.mt))} done)`
        : '–'
    ],
    [
      'Remaining to target',
      num(month.mt) > 0
        ? net >= num(month.mt)
          ? 'Reached 🎯'
          : money(num(month.mt) - net)
        : '–'
    ],
    ['Total trades', `${c.tr}`],
    ['Win rate', c.tr ? pct(c.w / c.tr) : '–'],
    ['Avg win', c.wd ? money(c.gp / c.wd) : '–'],
    ['Avg loss', c.ld ? money(c.gl / c.ld) : '–'],
    ['Profit factor', pf],
    ['Max drawdown', c.tr ? `${money(c.mdd)} (${pct(c.mddp)})` : '–'],
    ['Discipline score', pct(c.disc)],
    [
      'Max daily loss',
      `${num(month.l) || 0}% (${money(((c.start || 0) * (num(month.l) || 0)) / 100)})`
    ],
    ['A+ sets', apY + apN ? `${apY} of ${apY + apN} (${pct(apY / (apY + apN))})` : '–'],
    ['A+ win rate', apY ? pct(apW / apY) : '–']
  ];

  stats.forEach(([label, val]) => {
    lines.push({ type: 't', text: `${label}: ${val}` });
  });

  lines.push({ type: 'h2', text: 'Weekly review' });
  c.wk.forEach((x, i) => {
    lines.push({
      type: 't',
      text: `Week ${i + 1}: ${x.t} trades, ${x.w} wins (${x.t ? pct(x.w / x.t) : '–'}), Net ${money(
        x.n
      )}, Pips ${fp(x.p)}`
    });
    if (month.wm && month.wm[i]) {
      lines.push({ type: 't', text: `   Biggest mistake: ${month.wm[i]}` });
    }
  });

  lines.push({ type: 'h2', text: 'Daily journal' });
  let hasEntries = false;

  month.d.forEach((d, i) => {
    const r = c.res[i];
    const rulesFollowed = d.r
      .map((x, k) => (x ? `${k + 1}. ${RULES[k]} ${x === 1 ? '✓' : '✗'}` : ''))
      .filter(Boolean);

    const ck = (d.c || []).slice(0, PRE_CHECKLIST.length).filter(v => v === 1).length;
    const ckx = (d.c || []).slice(0, PRE_CHECKLIST.length).filter(v => v === 2).length;

    const tradesList = d.t
      .map((t, k) => {
        if (!t.p && !t.d && !t.ap && !t.pl && !t.pp) return '';
        return `Trade ${k + 1}: ${t.p || 'Pair'} [${t.d || '-'}] ${
          t.ap ? `A+:${t.ap}` : ''
        } ${t.pl ? `P/L:$${t.pl}` : ''} ${t.pp ? `Pips:${t.pp}` : ''}`;
      })
      .filter(Boolean);

    const moodNum = +d.m || 0;

    if (
      !(
        r.any ||
        rulesFollowed.length ||
        ck ||
        ckx ||
        tradesList.length ||
        moodNum ||
        d.mk ||
        d.nf ||
        d.n ||
        d.ce
      )
    ) {
      return;
    }

    hasEntries = true;
    const dayHeader = `${weekDays[i % 5]} · Day ${i + 1}${
      r.any ? `  |  Net P/L ${money(r.net)}  |  Balance ${money(r.bal)}` : ''
    }${r.anyp ? `  |  Pips ${fp(r.pips)}` : ''}${
      num(month.dt) > 0 && r.any && r.net >= num(month.dt) ? '  🎯' : ''
    }`;

    lines.push({
      type: r.has ? (r.tone < 0 ? 'n' : 'p') : 'b',
      text: dayHeader
    });

    tradesList.forEach(t => lines.push({ type: 't', text: `  ${t}` }));
    rulesFollowed.forEach(t => lines.push({ type: 't', text: `  Rule: ${t}` }));

    if (ck || ckx) {
      lines.push({
        type: 't',
        text: `  Pre-trade: ${ck}/${PRE_CHECKLIST.length}${
          ckx ? ` (${ckx} ✗ unfulfilled)` : ''
        }`
      });
    }

    if (d.ce) {
      lines.push({
        type: 't',
        text: `  Emotion: ${d.ce === 2 ? '✗ Did not control emotion' : '✓ Controlled emotion'}`
      });
    }

    if (moodNum) {
      lines.push({
        type: 't',
        text: `  Mood: ${'★'.repeat(moodNum)}${'☆'.repeat(5 - moodNum)}`
      });
    }

    if (d.mk) lines.push({ type: 't', text: `  Biggest mistake: ${d.mk}` });
    if (d.nf) lines.push({ type: 't', text: `  Next day focus: ${d.nf}` });
    if (d.n) lines.push({ type: 't', text: `  Notes: ${d.n}` });
    lines.push({ type: 'gap', text: '' });
  });

  if (!hasEntries) {
    lines.push({ type: 't', text: 'No trade entries recorded yet.' });
  }

  return lines;
}

export async function renderJournalToCanvas(month: MonthData): Promise<HTMLCanvasElement> {
  const lines = formatJournalLines(month);
  const W = 960;
  const pad = 32;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontFamily = '"Plus Jakarta Sans", "Noto Sans Bengali", system-ui, sans-serif';

  const styles = {
    h1: { size: 24, weight: 'bold', color: '#0f172a', lh: 36 },
    h2: { size: 18, weight: 'bold', color: '#1e293b', lh: 30 },
    t: { size: 14, weight: 'normal', color: '#334155', lh: 22 },
    b: { size: 15, weight: 'bold', color: '#0f172a', lh: 24 },
    p: { size: 15, weight: 'bold', color: '#15803d', lh: 24 },
    n: { size: 15, weight: 'bold', color: '#b91c1c', lh: 24 },
    gap: { size: 10, weight: 'normal', color: '#000', lh: 12 }
  };

  function wrapText(text: string, font: string, maxWidth: number): string[] {
    ctx.font = font;
    const words = text.split(' ');
    const result: string[] = [];
    let cur = '';

    for (const w of words) {
      const candidate = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(candidate).width > maxWidth && cur) {
        result.push(cur);
        cur = w;
      } else {
        cur = candidate;
      }
    }
    if (cur) result.push(cur);
    return result;
  }

  interface RenderItem {
    text: string;
    font: string;
    color: string;
    y: number;
    underlineY?: number;
  }

  const items: RenderItem[] = [];
  let y = pad;

  lines.forEach(l => {
    const s = styles[l.type];
    const fontStr = `${s.weight} ${s.size}px ${fontFamily}`;
    const lh = s.lh;

    if (l.type === 'h2') y += 14;

    const wrapped = l.type === 'gap' ? [''] : wrapText(l.text, fontStr, W - 2 * pad);
    wrapped.forEach((wrappedLine, idx) => {
      items.push({
        text: wrappedLine,
        font: fontStr,
        color: s.color,
        y: y + Math.round(lh * 0.75),
        underlineY: l.type === 'h2' && idx === wrapped.length - 1 ? y + lh : undefined
      });
      y += lh;
    });
  });

  const H = y + pad;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Render text items
  items.forEach(it => {
    if (!it.text) return;
    ctx.font = it.font;
    ctx.fillStyle = it.color;
    ctx.fillText(it.text, pad, it.y);

    if (it.underlineY) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(pad, it.underlineY - 2, W - 2 * pad, 2);
    }
  });

  return canvas;
}

export async function generateJournalPNG(month: MonthData): Promise<Blob> {
  const canvas = await renderJournalToCanvas(month);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create PNG blob'));
    }, 'image/png');
  });
}

function createPdfBlobFromPages(
  pages: { bytes: Uint8Array; w: number; h: number }[]
): Blob {
  const enc = new TextEncoder();
  const chunks: (string | Uint8Array)[] = [];
  const off: number[] = [];
  let len = 0;
  const np = pages.length;
  const pw = 595; // A4 standard width

  function put(x: string | Uint8Array) {
    const b = typeof x === 'string' ? enc.encode(x) : x;
    chunks.push(b);
    len += b.length;
  }

  function obj(n: number, body: string) {
    off[n] = len;
    put(`${n} 0 obj\n${body}\nendobj\n`);
  }

  put('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');

  const kids: string[] = [];
  for (let k = 0; k < np; k++) {
    kids.push(`${3 + 3 * k} 0 R`);
  }
  obj(2, `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${np} >>`);

  pages.forEach((p, k) => {
    const ph = Math.round((pw * p.h) / p.w);
    const cs = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    obj(
      3 + 3 * k,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${
        5 + 3 * k
      } 0 R >> >> /Contents ${4 + 3 * k} 0 R >>`
    );
    obj(4 + 3 * k, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    off[5 + 3 * k] = len;
    put(
      `${5 + 3 * k} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${
        p.h
      } /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${
        p.bytes.length
      } >>\nstream\n`
    );
    put(p.bytes);
    put('\nendstream\nendobj\n');
  });

  const xr = len;
  const total = 3 + 3 * np;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let n = 1; n < total; n++) {
    x += ('0000000000' + off[n]).slice(-10) + ' 00000 n \n';
  }
  put(`${x}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);

  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

export async function generateJournalPDF(month: MonthData): Promise<Blob> {
  const canvas = await renderJournalToCanvas(month);
  const W = canvas.width;
  const PH = Math.round(W * 1.4142); // A4 aspect ratio height
  const numPages = Math.max(1, Math.ceil(canvas.height / PH));
  const pages: { bytes: Uint8Array; w: number; h: number }[] = [];

  for (let k = 0; k < numPages; k++) {
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = W;
    pageCanvas.height = PH;
    const pctx = pageCanvas.getContext('2d')!;

    pctx.fillStyle = '#ffffff';
    pctx.fillRect(0, 0, W, PH);
    pctx.drawImage(canvas, 0, k * PH, W, PH, 0, 0, W, PH);

    const jpegDataUrl = pageCanvas.toDataURL('image/jpeg', 0.92);
    const base64Data = jpegDataUrl.split(',')[1];
    const binary = atob(base64Data);
    const u8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      u8[i] = binary.charCodeAt(i);
    }
    pages.push({ bytes: u8, w: W, h: PH });
  }

  return createPdfBlobFromPages(pages);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}
