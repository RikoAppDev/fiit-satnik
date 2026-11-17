/* Šatník FIIT STU — kusovky (solo pieces), set A.
   Five one-off graphic pieces outside every collection, each limited and numbered:
     solo-seed    Mikina Seed      generative flow field across the back, different for every piece (seeded)
     solo-vykres  Mikina Výkres    the hoodie's own sewing pattern as a technical drawing, white on turquoise
     solo-glitch  Crewneck Glitch  the modular FIIT STU wordmark sliced, shifted and channel-split (seeded)
     solo-plagat  Tričko Plagát    Swiss poster: giant cropped F and T, a hard turquoise block, captions
     solo-ascii   Taška ASCII      FIIT set in monospace characters from a density ramp
   Drawings come from garment-hoodie.js (hoodie), garments-sweats.js (crew), garments-tees.js (tee)
   and garments-goods.js (tote); no garment of our own (garments-solo-a.js is a stub).
   Seeded pieces read p.opts.seed (1 … edition, default 1) and draw with their own PRNG, never
   Math.random, so a seed always gives the same art. Ids inside the art are built from the seed
   (or are fixed for unseeded art), so two elements with the same id always hold the same content.
   Sizes are real centimetres turned into drawing units through the garment's `cm`. */
(function () {
  'use strict';
  const FM = window.FM, A = FM.art, C = FM.C, t = FM.t, esc = FM.esc;
  const SIZES = FM.SIZES || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const r1 = n => Math.round(n * 10) / 10;
  const r2 = n => +n.toFixed(2);
  const P2 = p => `${r2(p[0])},${r2(p[1])}`;
  const cm = (type, n) => r2(n * ((FM.garments[type] || {}).cm || 3.8));
  const pad2 = n => String(n).padStart(2, '0');
  const seedOf = (p, max) => {
    const s = Math.round(Number(p && p.opts && p.opts.seed) || 1);
    return Math.min(Math.max(s, 1), max);
  };
  const rect = (x, y, w, h, fill, op) =>
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" style="fill:${fill}"${op != null && op < 1 ? ` opacity="${r2(op)}"` : ''}/>`;

  /* Small seeded PRNG (mulberry32 over a hashed seed + salt), uniform in [0, 1). */
  const rng = (seed, salt) => {
    let a = (Math.imul((seed | 0) + 0x9E37, 0x85EBCA6B) ^ Math.imul((salt | 0) + 1, 0xC2B2AE35)) >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let q = Math.imul(a ^ (a >>> 15), 1 | a);
      q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ── 1. Seed: flow field ───────────────────────────────────────────────────
     A direction field (a base heading bent by 3–5 plane waves, plus 0–3 vortices, some of
     them spirals) is traced from shuffled start points with RK2. A line stops when it leaves
     the print, comes closer than `gap` to another line (or to itself), or reaches its own
     length, so the field packs evenly and some lines end early. Lines are grouped by colour and
     width into a handful of <path> elements. Everything about the look comes from the seed:
     heading, turbulence, vortices, density, width mix and the colour rule. */
  const FLOW = {};
  const flow = (seed, R) => {
    const key = `${seed}|${R.x},${R.y},${R.w},${R.h}`;
    if (FLOW[key]) return FLOW[key];
    const rnd = rng(seed, 11), U = (a, b) => a + (b - a) * rnd(), TAU = Math.PI * 2;

    const base = U(0, TAU), turb = U(.5, 1.9), nw = 3 + Math.floor(rnd() * 3), waves = [];
    for (let i = 0; i < nw; i++) {
      const d = U(0, TAU), k = TAU / U(110, 480);
      waves.push([Math.cos(d) * k, Math.sin(d) * k, U(0, TAU), turb * U(.55, 1.15) / Math.sqrt(nw) * 1.5]);
    }
    const vort = [];
    for (let i = 0, n = Math.floor(U(0, 3.4)); i < n; i++)
      vort.push([R.x + U(.15, .85) * R.w, R.y + U(.12, .88) * R.h, U(26, 78), U(1.2, 3.2) * (rnd() < .5 ? -1 : 1), U(-.4, .4)]);
    const dir = (x, y) => {
      let th = base;
      for (const w of waves) th += w[3] * Math.sin(w[0] * x + w[1] * y + w[2]);
      let vx = Math.cos(th), vy = Math.sin(th);
      for (const v of vort) {
        const dx = x - v[0], dy = y - v[1], d2 = dx * dx + dy * dy, r = Math.sqrt(d2) + 1e-6;
        const g = v[3] * Math.exp(-d2 / (v[2] * v[2])), gr = Math.abs(g) * v[4];
        vx += (-dy * g + dx * gr) / r;        // swirl, plus a little in/out → a spiral
        vy += (dx * g + dy * gr) / r;
      }
      const l = Math.hypot(vx, vy) || 1;
      return [vx / l, vy / l];
    };

    const gap = U(1.5, 2.7), STEP = 2.4, PAD = 3;
    const WID = [.55, .85, 1.25, 1.8, 2.6], OP = [.72, .84, .92, 1, 1];
    const WP = [[.44, .32, .15, .07, .02], [.26, .3, .22, .14, .08], [.14, .22, .27, .22, .15]][Math.floor(rnd() * 3)];
    const pickW = () => { let u = rnd(), i = 0; while (i < 4 && (u -= WP[i]) > 0) i++; return i; };
    const CELL = 7, gx = Math.ceil((R.w + 2 * PAD) / CELL) + 1, gy = Math.ceil((R.h + 2 * PAD) / CELL) + 1;
    const grid = []; for (let i = 0; i < gx * gy; i++) grid.push([]);
    const gcx = x => Math.floor((x - R.x + PAD) / CELL), gcy = y => Math.floor((y - R.y + PAD) / CELL);
    const inside = (x, y) => x > R.x - PAD && x < R.x + R.w + PAD && y > R.y - PAD && y < R.y + R.h + PAD;
    const free = (x, y, w, id, s) => {
      const X = gcx(x), Y = gcy(y);
      for (let j = Math.max(0, Y - 1); j <= Math.min(gy - 1, Y + 1); j++)
        for (let i = Math.max(0, X - 1); i <= Math.min(gx - 1, X + 1); i++)
          for (const q of grid[j * gx + i]) {
            if (q[3] === id && Math.abs(q[4] - s) < 14 + 3 * w) continue;
            const sep = gap + (w + q[2]) / 2, dx = q[0] - x, dy = q[1] - y;
            if (dx * dx + dy * dy < sep * sep) return false;
          }
      return true;
    };
    const put = (x, y, w, id, s, ins) => { const k = gcy(y) * gx + gcx(x); grid[k].push([x, y, w, id, s]); ins.push(k); };
    const walk = (x, y, sg, w, id, max, ins) => {
      const out = [];
      for (let s = STEP; s <= max; s += STEP) {
        const a = dir(x, y), b = dir(x + sg * a[0] * STEP / 2, y + sg * a[1] * STEP / 2);
        const nx = x + sg * b[0] * STEP, ny = y + sg * b[1] * STEP;
        if (!inside(nx, ny) || !free(nx, ny, w, id, sg * s)) break;
        x = nx; y = ny; put(x, y, w, id, sg * s, ins); out.push([x, y]);
      }
      return out;
    };

    const cand = [], SP = 5;
    for (let y = R.y; y < R.y + R.h; y += SP) for (let x = R.x; x < R.x + R.w; x += SP) cand.push([x + rnd() * SP, y + rnd() * SP]);
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const c = cand[i]; cand[i] = cand[j]; cand[j] = c; }
    const early = U(.12, .32), lines = [];
    let id = 0;
    /* second pass (only if the first found fewer than 150 lines) accepts shorter fillers */
    for (const minLen of [14, 7]) {
      if (minLen < 14 && lines.length >= 150) break;
      for (const [x, y] of cand) {
        if (minLen < 14 && lines.length >= 150) break;
        const wi = pickW(), w = WID[wi]; id++;
        if (!free(x, y, w, id, 0)) continue;
        const max = rnd() < early ? U(16, 80) : U(160, 560), ins = [];
        put(x, y, w, id, 0, ins);
        const f = walk(x, y, 1, w, id, max / 2, ins), b = walk(x, y, -1, w, id, max / 2, ins);
        const pts = b.reverse().concat([[x, y]], f);
        if ((pts.length - 1) * STEP < minLen) { for (let k = ins.length - 1; k >= 0; k--) grid[ins[k]].pop(); continue; }
        lines.push({ pts, wi, x, y, len: (pts.length - 1) * STEP });
      }
    }
    /* keep within 150–260 lines: drop the shortest ones if the packing found more */
    if (lines.length > 260) {
      const keep = lines.slice().sort((a, b) => b.len - a.len).slice(0, 260);
      lines.length = 0; lines.push(...keep);
    }

    /* colour rule: 0 = two zones split by a line, 1 = random mix, 2 = turquoise blobs, 3 = short lines turquoise */
    const mode = Math.floor(rnd() * 4), mix = U(.22, .46), ang = U(0, TAU), cut = U(-.2, .2);
    const blobs = [];
    for (let i = 0, n = 1 + Math.floor(rnd() * 2); i < n; i++) blobs.push([R.x + U(.1, .9) * R.w, R.y + U(.1, .9) * R.h, U(40, 95)]);
    const lens = lines.map(l => l.len).sort((a, b) => a - b), med = lens[Math.floor(lens.length * U(.45, .7))] || 0;
    const mx = R.x + R.w / 2, my = R.y + R.h / 2;
    const buckets = {};
    lines.forEach(l => {
      let tq;
      if (mode === 0) tq = ((l.x - mx) * Math.cos(ang) + (l.y - my) * Math.sin(ang)) / R.h > cut;
      else if (mode === 1) tq = rnd() < mix;
      else if (mode === 2) tq = blobs.some(b => Math.hypot(l.x - b[0], l.y - b[1]) < b[2]);
      else tq = l.len < med;
      if (rnd() < .07) tq = !tq;
      /* every second point, smoothed with quadratic curves through the midpoints */
      const q = l.pts.filter((p, i) => i % 2 === 0 || i === l.pts.length - 1);
      let d = `M${r1(q[0][0])},${r1(q[0][1])}`;
      for (let i = 1; i < q.length - 1; i++)
        d += `Q${r1(q[i][0])},${r1(q[i][1])} ${r1((q[i][0] + q[i + 1][0]) / 2)},${r1((q[i][1] + q[i + 1][1]) / 2)}`;
      d += `L${r1(q[q.length - 1][0])},${r1(q[q.length - 1][1])}`;
      const k = `${l.wi}${tq ? 1 : 0}`;
      (buckets[k] = buckets[k] || []).push(d);
    });
    const clip = `solo-seed-${seed}`;
    let s = `<defs><clipPath id="${clip}"><rect x="${r2(R.x)}" y="${r2(R.y)}" width="${r2(R.w)}" height="${r2(R.h)}"/></clipPath></defs>` +
      `<g clip-path="url(#${clip})" fill="none" stroke-linecap="round" stroke-linejoin="round">`;
    Object.keys(buckets).sort().forEach(k => {
      const wi = +k[0];
      s += `<path d="${buckets[k].join('')}" style="stroke:${k[1] === '1' ? 'var(--d2)' : 'var(--d3)'}" stroke-width="${WID[wi]}" opacity="${OP[wi]}"/>`;
    });
    return (FLOW[key] = { svg: s + '</g>', n: lines.length });
  };
  /* crop marks: short L-shaped ticks just outside the four corners of R */
  const crops = (R, o, l) => [[R.x, R.y, -1, -1], [R.x + R.w, R.y, 1, -1], [R.x, R.y + R.h, -1, 1], [R.x + R.w, R.y + R.h, 1, 1]]
    .map(([x, y, sx, sy]) => `M${r2(x + sx * o)},${r2(y)}h${sx * l}M${r2(x)},${r2(y + sy * o)}v${sy * l}`).join('');

  /* ── 2. Výkres: the hoodie's sewing pattern as a technical drawing ─────────
     Pieces are defined in pattern centimetres and drawn at VK units per cm. Each piece gives
     its cut line (solid), fold edges (dash-dot), a seam line 1 cm inside (dashed, computed by
     offsetting the sampled outline), notches and grain lines. Dimension lines, arrowheads and
     notches are collected into a few shared paths to keep the element count low. */
  const VK = 1.75;
  const bez = (a, b, c, d, u) => { const v = 1 - u; return [0, 1].map(j => v * v * v * a[j] + 3 * v * v * u * b[j] + 3 * v * u * u * c[j] + u * u * u * d[j]); };
  const bezD = (a, b, c, d, u) => { const v = 1 - u; return [0, 1].map(j => 3 * v * v * (b[j] - a[j]) + 6 * v * u * (c[j] - b[j]) + 3 * u * u * (d[j] - c[j])); };
  const unit = d => { const l = Math.hypot(d[0], d[1]) || 1; return [d[0] / l, d[1] / l]; };
  const arrow = (x, y, ux, uy, L = 2.8, w = .95) =>
    `M${r2(x)},${r2(y)}L${r2(x - ux * L + uy * w)},${r2(y - uy * L - ux * w)}L${r2(x - ux * L - uy * w)},${r2(y - uy * L + ux * w)}Z`;

  /* segs: ['M', x, y] then ['L', x, y, fold?] | ['C', x1, y1, x2, y2, x, y, fold?] in cm */
  const piece = (segs, ox, oy, sa = 1) => {
    const X = (x, y) => [ox + x * VK, oy + y * VK];
    const geo = [];
    let p = X(segs[0][1], segs[0][2]);
    for (let i = 1; i < segs.length; i++) {
      const s = segs[i];
      if (s[0] === 'L') { const b = X(s[1], s[2]); geo.push({ a: p, b, fold: !!s[3] }); p = b; }
      else { const b = X(s[5], s[6]); geo.push({ a: p, c1: X(s[1], s[2]), c2: X(s[3], s[4]), b, fold: !!s[7] }); p = b; }
    }
    const at = (g, u) => g.c1 ? bez(g.a, g.c1, g.c2, g.b, u) : [g.a[0] + (g.b[0] - g.a[0]) * u, g.a[1] + (g.b[1] - g.a[1]) * u];
    const tan = (g, u) => unit(g.c1 ? bezD(g.a, g.c1, g.c2, g.b, u) : [g.b[0] - g.a[0], g.b[1] - g.a[1]]);
    let cut = '', fold = '', pen = null;
    geo.forEach(g => {
      const seg = g.c1 ? `C${P2(g.c1)} ${P2(g.c2)} ${P2(g.b)}` : `L${P2(g.b)}`;
      if (g.fold) { fold += `M${P2(g.a)}${seg}`; pen = null; return; }
      if (pen !== g.a) cut += `M${P2(g.a)}`;
      cut += seg; pen = g.b;
    });
    if (!fold) cut += 'Z';
    /* seam line: offset the sampled outline inwards by sa cm (fold edges by 0) */
    const poly = [], off = [];
    geo.forEach(g => { const n = g.c1 ? 14 : 1; for (let i = 0; i < n; i++) { poly.push(at(g, i / n)); off.push(g.fold ? 0 : sa * VK); } });
    let area = 0;
    poly.forEach((a, i) => { const b = poly[(i + 1) % poly.length]; area += a[0] * b[1] - b[0] * a[1]; });
    const sg = area > 0 ? 1 : -1, N = poly.length, seam = [];
    const nIn = e => [-sg * e[1], sg * e[0]];
    for (let i = 0; i < N; i++) {
      const pa = poly[(i - 1 + N) % N], pb = poly[i], pc = poly[(i + 1) % N];
      const e1 = unit([pb[0] - pa[0], pb[1] - pa[1]]), e2 = unit([pc[0] - pb[0], pc[1] - pb[1]]);
      const n1 = nIn(e1), n2 = nIn(e2), d1 = off[(i - 1 + N) % N], d2 = off[i];
      const Aa = [pb[0] + n1[0] * d1, pb[1] + n1[1] * d1], Bb = [pb[0] + n2[0] * d2, pb[1] + n2[1] * d2];
      const cr = e1[0] * e2[1] - e1[1] * e2[0];
      if (Math.abs(cr) < .03) seam.push([(Aa[0] + Bb[0]) / 2, (Aa[1] + Bb[1]) / 2]);
      else { const s = ((Bb[0] - Aa[0]) * e2[1] - (Bb[1] - Aa[1]) * e2[0]) / cr; seam.push([Aa[0] + e1[0] * s, Aa[1] + e1[1] * s]); }
    }
    /* notch: a short tick across the cut line into the seam allowance; n = 2 → double notch */
    const notch = (i, u, n = 1) => {
      const g = geo[i], q = at(g, u), e = tan(g, u), m = nIn(e);
      let d = '';
      for (let j = 0; j < n; j++) {
        const o = (j - (n - 1) / 2) * 1.3, x = q[0] + e[0] * o, y = q[1] + e[1] * o;
        d += `M${r2(x - m[0] * .6)},${r2(y - m[1] * .6)}L${r2(x + m[0] * 2.8)},${r2(y + m[1] * 2.8)}`;
      }
      return d;
    };
    return { X, cut, fold, seam: 'M' + seam.map(P2).join('L') + 'Z', notch };
  };

  const vykres = () => {
    const L = 'var(--d1)';
    const F = { left: 226, top: 230, w: cm('hoodie', 49.5), h: cm('hoodie', 80) };      // sheet trim
    let cutD = '', foldD = '', seamD = '', notchD = '', dimD = '', arrD = '', thinD = '', tx = '';
    const lab = (x, y, s, o) => { tx += t(s, r2(x), r2(y), Object.assign({ fill: L }, o)); };
    const mono = (x, y, s, size = 2.4, o = {}) => lab(x, y, s, Object.assign({ f: 'f', size, ls: .15 }, o));
    const sans = (x, y, s, size = 4.4, o = {}) => lab(x, y, s, Object.assign({ f: 's', w: 600, size, ls: .5 }, o));
    /* dimension lines: e1/e2 = the coordinate of the object point each extension line starts from */
    const dimH = (x1, x2, y, v, e1, e2) => {
      [[x1, e1], [x2, e2]].forEach(([x, e]) => { const s = y < e ? -1 : 1; dimD += `M${r2(x)},${r2(e + s * 1.4)}V${r2(y + s * 1.8)}`; });
      dimD += `M${r2(x1)},${r2(y)}H${r2(x2)}`;
      arrD += arrow(x1, y, -1, 0) + arrow(x2, y, 1, 0);
      mono((x1 + x2) / 2, y - 1.2, v, 3.3, { ls: .2 });
    };
    const dimV = (y1, y2, x, v, e1, e2) => {
      [[y1, e1], [y2, e2]].forEach(([y, e]) => { const s = x < e ? -1 : 1; dimD += `M${r2(e + s * 1.4)},${r2(y)}H${r2(x + s * 1.8)}`; });
      dimD += `M${r2(x)},${r2(y1)}V${r2(y2)}`;
      arrD += arrow(x, y1, 0, -1) + arrow(x, y2, 0, 1);
      mono(x - 1.2, (y1 + y2) / 2, v, 3.3, { ls: .2, rot: -90 });
    };
    /* grain line: double arrow with its label alongside */
    const grain = (x, y1, y2) => {
      thinD += `M${r2(x)},${r2(y1)}V${r2(y2)}`;
      arrD += arrow(x, y1, 0, -1, 2.6, .9) + arrow(x, y2, 0, 1, 2.6, .9);
      mono(x - 1.1, (y1 + y2) / 2, 'SMER OSNOVY', 2.1, { rot: -90, ls: .3 });
    };
    /* piece label: number in a ring, name, cutting note(s) */
    const label = (x, y, n, name, notes) => {
      tx += `<circle cx="${r2(x)}" cy="${r2(y - 8.6)}" r="3.3" fill="none" style="stroke:${L}" stroke-width=".5"/>`;
      mono(x, y - 7.4, String(n), 3.4, { ls: 0 });
      sans(x, y, name);
      notes.forEach((s, i) => mono(x, y + 4.4 + i * 3.4, s));
    };
    const add = pc => { cutD += pc.cut; foldD += pc.fold; seamD += pc.seam; };

    /* 1 trup: half pattern, centre front/back on the fold */
    const trup = piece([['M', 0, 9], ['C', 5, 9, 8.5, 4.5, 8.5, 0], ['L', 25, 4.5], ['C', 24, 12, 25, 21, 29, 24],
      ['L', 29, 68], ['L', 0, 68], ['L', 0, 9, 1]], 248, 254);
    add(trup);
    seamD += `M${P2(trup.X(0, 2.2))}C${P2(trup.X(5, 2.2))} ${P2(trup.X(8, 1.4))} ${P2(trup.X(8.5, 0))}`;   // back neckline
    notchD += trup.notch(1, .5) + trup.notch(2, .55) + trup.notch(3, .5);
    dimV(254, trup.X(0, 68)[1], 240, '68', trup.X(8.5, 0)[0], 248);
    dimH(248, trup.X(29, 0)[0], trup.X(0, 68)[1] + 8, '29', trup.X(0, 68)[1], trup.X(0, 68)[1]);
    { const fx = 248, y1 = trup.X(0, 30)[1], y2 = trup.X(0, 56)[1];
      thinD += `M${fx + 1.3},${r2(y1)}H${fx + 5.6}V${r2(y2)}H${fx + 1.3}`;
      arrD += arrow(fx + 1.3, y1, -1, 0, 2.4, .85) + arrow(fx + 1.3, y2, -1, 0, 2.4, .85);
      mono(fx + 8.6, (y1 + y2) / 2, 'ZÁHYB', 2.3, { rot: -90, ls: .5 }); }
    grain(trup.X(10.5, 0)[0], trup.X(0, 26)[1], trup.X(0, 60)[1]);
    label(trup.X(19.5, 0)[0], trup.X(0, 42)[1], 1, 'TRUP', ['PREDNÝ + ZADNÝ', 'STRIH 2× NA ZÁHYB']);

    /* 2 rukáv */
    const ruk = piece([['M', 0, 15], ['C', 6, 13.5, 12, .5, 22, 0], ['C', 32, .5, 38, 13.5, 44, 15],
      ['L', 33.5, 60], ['L', 10.5, 60], ['L', 0, 15]], 318, 254);
    add(ruk);
    notchD += ruk.notch(0, .99) + ruk.notch(0, .45) + ruk.notch(1, .55, 2);
    foldD += `M${P2(ruk.X(22, -2))}L${P2(ruk.X(22, 62))}`;                                   // centre line
    dimH(318, ruk.X(44, 0)[0], 246, '44', ruk.X(0, 15)[1], ruk.X(44, 15)[1]);
    dimV(254, ruk.X(0, 60)[1], 403, '60', ruk.X(22, 0)[0], ruk.X(33.5, 0)[0]);
    dimH(ruk.X(10.5, 0)[0], ruk.X(33.5, 0)[0], ruk.X(0, 60)[1] + 7, '23', ruk.X(0, 60)[1], ruk.X(0, 60)[1]);
    grain(ruk.X(14, 0)[0], ruk.X(0, 22)[1], ruk.X(0, 52)[1]);
    label(ruk.X(29.5, 0)[0], ruk.X(0, 34)[1], 2, 'RUKÁV', ['STRIH 2×']);

    /* 3 kapucňa: side panel, face edge on the left */
    const kap = piece([['M', 0, 38], ['L', 0, 6], ['C', 0, 2, 4, 0, 12, 0], ['C', 24, 0, 33, 6, 34, 16],
      ['C', 34.5, 24, 31, 30, 26, 33], ['C', 20, 36.5, 10, 38.5, 0, 38]], 248, 405);
    add(kap);
    notchD += kap.notch(2, .45) + kap.notch(4, .5, 2) + kap.notch(3, .6);
    dimV(405, kap.X(0, 38)[1], 240, '38', kap.X(12, 0)[0], 248);
    dimH(248, kap.X(34, 0)[0], 397, '34', kap.X(0, 6)[1], kap.X(0, 16)[1]);
    grain(kap.X(9.5, 0)[0], kap.X(0, 9)[1], kap.X(0, 32)[1]);
    label(kap.X(21, 0)[0], kap.X(0, 21)[1], 3, 'KAPUCŇA', ['STRIH 2×', '+ 2× PODŠÍVKA']);

    /* 4 vrecko: kangaroo pocket, slanted hand openings */
    const vre = piece([['M', 6, 0], ['L', 30, 0], ['L', 36, 12], ['L', 36, 20], ['L', 0, 20], ['L', 0, 12], ['L', 6, 0]], 322, 389);
    add(vre);
    notchD += vre.notch(0, .5);
    dimH(322, vre.X(36, 0)[0], vre.X(0, 20)[1] + 7, '36', vre.X(0, 20)[1], vre.X(0, 20)[1]);
    dimV(389, vre.X(0, 20)[1], vre.X(36, 0)[0] + 8, '20', vre.X(30, 0)[0], vre.X(36, 0)[0]);
    grain(vre.X(9, 0)[0], vre.X(0, 4.5)[1], vre.X(0, 17)[1]);
    label(vre.X(21, 0)[0], vre.X(0, 14.5)[1], 4, 'VRECKO', ['STRIH 1×']);

    /* 5 manžeta: rib, folded in half */
    const man = piece([['M', 0, 0], ['L', 22, 0], ['L', 22, 16], ['L', 0, 16], ['L', 0, 0]], 322, 447, .6);
    add(man);
    foldD += `M${P2(man.X(-1.5, 8))}L${P2(man.X(23.5, 8))}`;
    dimH(322, man.X(22, 0)[0], 441, '22', 447, 447);
    dimV(447, man.X(0, 16)[1], man.X(22, 0)[0] + 7, '16', man.X(22, 0)[0], man.X(22, 0)[0]);
    grain(man.X(19, 0)[0], man.X(0, 2)[1], man.X(0, 14)[1]);
    sans(man.X(9.5, 0)[0], man.X(0, 6)[1], 'MANŽETA', 3.6);
    mono(man.X(9.5, 0)[0], man.X(0, 12.6)[1], '5 · STRIH 2×', 2.3);

    /* 6 pás: 96 cm long, drawn with a break in the middle */
    const ox = 248, oy = 487, brk = (x, h) => `M${r2(ox + x * VK)},${oy}V${r2(oy + h * .38)}L${r2(ox + x * VK - 1.4)},${r2(oy + h * .46)}` +
      `L${r2(ox + x * VK + 1.4)},${r2(oy + h * .58)}L${r2(ox + x * VK)},${r2(oy + h * .64)}V${r2(oy + h)}`;
    const ph = 16 * VK, pr = ox + 46 * VK;
    cutD += `M${r2(ox + 21 * VK)},${oy}H${ox}V${r2(oy + ph)}H${r2(ox + 21 * VK)}M${r2(ox + 25 * VK)},${oy}H${r2(pr)}V${r2(oy + ph)}H${r2(ox + 25 * VK)}`;
    thinD += brk(21, ph) + brk(25, ph);
    seamD += `M${r2(ox + 21 * VK)},${r2(oy + 1.05)}H${r2(ox + 1.05)}V${r2(oy + ph - 1.05)}H${r2(ox + 21 * VK)}` +
      `M${r2(ox + 25 * VK)},${r2(oy + 1.05)}H${r2(pr - 1.05)}V${r2(oy + ph - 1.05)}H${r2(ox + 25 * VK)}`;
    foldD += `M${ox - 2.5},${r2(oy + ph / 2)}H${r2(ox + 21 * VK)}M${r2(ox + 25 * VK)},${r2(oy + ph / 2)}H${r2(pr + 2.5)}`;
    dimH(ox, pr, oy + ph + 7, '96', oy + ph, oy + ph);
    sans(ox + 10.5 * VK, oy + 9.6, 'PÁS', 3.6);
    mono(ox + 10.5 * VK, oy + ph - 4.6, '6 · STRIH 1×', 2.3);
    thinD += `M${r2(ox + 36 * VK)},${oy + 3}V${r2(oy + ph - 3)}`;
    arrD += arrow(ox + 36 * VK, oy + 3, 0, -1, 2.4, .85) + arrow(ox + 36 * VK, oy + ph - 3, 0, 1, 2.4, .85);

    /* sheet frame, centring marks and the title block */
    const fr = F.left + F.w, fb = F.top + F.h, mxs = F.left + F.w / 2, mys = F.top + F.h / 2;
    let frame = `M${F.left},${F.top}H${r2(fr)}V${r2(fb)}H${F.left}Z`;
    const inner = `M${F.left + 4},${F.top + 4}H${r2(fr - 4)}V${r2(fb - 4)}H${F.left + 4}Z`;
    frame += `M${r2(mxs)},${F.top}v6M${r2(mxs)},${r2(fb)}v-6M${F.left},${r2(mys)}h6M${r2(fr)},${r2(mys)}h-6`;
    const bx = fr - 4 - 78, by = fb - 4 - 38;
    let tb = `M${r2(bx)},${r2(by)}h78M${r2(bx)},${r2(by)}V${r2(fb - 4)}` +
      `M${r2(bx)},${r2(by + 15)}h78M${r2(bx)},${r2(by + 26.5)}h78` +
      `M${r2(bx + 52)},${r2(by)}V${r2(by + 26.5)}M${r2(bx + 26)},${r2(by + 26.5)}V${r2(fb - 4)}M${r2(bx + 52)},${r2(by + 26.5)}V${r2(fb - 4)}`;
    const cell = (x, y, h, k, v, vs = 3.5) => { mono(x + 1.5, y + 3.2, k, 1.9, { anchor: 'start', ls: .3, op: .8 }); sans(x + 1.5, y + h - 2.2, v, vs, { anchor: 'start', ls: .4 }); };
    tx += A.word(bx + 26, by + 4.6, 6.4, { fill: L, accent: L });
    cell(bx + 52, by, 15, 'MIERKA', 'M 1 : 10');
    cell(bx, by + 15, 11.5, 'NÁZOV', 'MIKINA');
    cell(bx + 52, by + 15, 11.5, 'VÝKRES', 'LIST 1 / 1', 3.1);
    cell(bx, by + 26.5, 11.5, 'VEĽKOSŤ', 'M');
    cell(bx + 26, by + 26.5, 11.5, 'ROZMERY', 'CM');
    cell(bx + 52, by + 26.5, 11.5, 'ROK', '2026');

    const st = (d, w, extra = '') => `<path d="${d}" fill="none" style="stroke:${L}" stroke-width="${w}"${extra}/>`;
    return st(frame, .4, ' opacity=".8"') + st(inner, .85) + st(tb, .5) +
      st(cutD, .85, ' stroke-linejoin="round"') + st(foldD, .45, ' stroke-dasharray="7 1.6 1.2 1.6"') +
      st(seamD, .4, ' stroke-dasharray="2 1.4" opacity=".85"') + st(notchD, .55) +
      st(dimD, .3, ' opacity=".9"') + st(thinD, .4) +
      `<path d="${arrD}" style="fill:${L}"/>` + tx;
  };
  /* the same title block, small, for the chest */
  const titleSmall = (cx, cy) => {
    const L = 'var(--d1)', w = 34, h = 16, x = cx - w / 2, y = cy - h / 2;
    const d = `M${r2(x)},${r2(y)}h${w}v${h}h-${w}Z M${r2(x)},${r2(y + 8.5)}h${w}M${r2(x + 23)},${r2(y)}v${h}`;
    return `<path d="${d}" fill="none" style="stroke:${L}" stroke-width=".55"/>` +
      A.word(x + 11.5, y + 2.75, 3, { fill: L, accent: L }) +
      t('M 1:10', x + 28.5, y + 5.8, { f: 'f', size: 2.3, fill: L }) +
      t('MIKINA', x + 11.5, y + 13.9, { f: 's', w: 600, size: 3.2, ls: .5, fill: L }) +
      t('1 / 1', x + 28.5, y + 13.6, { f: 'f', size: 2.3, fill: L });
  };

  /* ── 3. Glitch: the modular wordmark sliced ────────────────────────────────
     One copy of the wordmark sits in <defs> with fill currentColor; every slice is a clipped
     group of <use> copies coloured through `color`: burgundy and turquoise offsets (channel
     split) under the off-white one. The seed sets slice heights, shifts, the split, scan bars,
     stray blocks and where the one block of repeated rows smears down (or up) from the word. */
  const GL = {};
  const glitch = (seed, cx, top, h) => {
    const key = `${seed}|${cx},${top},${h}`;
    if (GL[key]) return GL[key];
    const rnd = rng(seed, 23), U = (a, b) => a + (b - a) * rnd(), sgn = () => (rnd() < .5 ? -1 : 1);
    /* the wordmark set in two lines, FIIT over STU, so the letters can be 15 cm tall */
    const id = `solo-gl-${seed}`, W = A.wordW(h, 'FIIT'), x0 = cx - W / 2, lg = h * .24, HB = 2 * h + lg;
    const C1 = 'var(--d1)', C2 = 'var(--d2)', C3 = 'var(--d3)', cc = { fill: 'currentColor', accent: 'currentColor' };
    const use = (dx, dy, col) => `<use href="#${id}-w" transform="translate(${r2(dx)},${r2(dy)})" style="color:${col}"/>`;
    let defs = `<g id="${id}-w">${A.word(cx, top, h, Object.assign({ text: 'FIIT' }, cc))}${A.word(cx, r2(top + h + lg), h, Object.assign({ text: 'STU' }, cc))}</g>`;
    let back = '', body = '', front = '';

    /* scan bars behind the word, some broken into dashes */
    for (let i = 0, nb = 4 + Math.floor(rnd() * 4); i < nb; i++) {
      const by = top + U(-.06, 1.12) * HB, bh = U(.5, 2.4), bx = x0 + U(-.14, .55) * W, bw = Math.min(U(.2, .8) * W, x0 + W * 1.12 - bx);
      const col = [C1, C2, C3][Math.floor(rnd() * 3)];
      if (rnd() < .35) {
        for (let x = bx; x < bx + bw;) { const sw = Math.min(U(3, 16), bx + bw - x); back += rect(x, by, sw, bh, col, .9); x += sw + U(1.5, 6); }
      } else back += rect(bx, by, bw, bh, col, U(.55, .95));
    }

    /* slices: thin ones may jump far, wide ones only shift a little, so the word stays legible */
    const n = 11 + Math.floor(rnd() * 6), wts = [];
    for (let i = 0; i < n; i++) wts.push(.06 + Math.pow(rnd(), 1.7));
    const sum = wts.reduce((a, b) => a + b, 0), span = HB + 4;
    let y = top - 2, jumps = 0, last = -9;
    wts.forEach((wt, i) => {
      const hh = wt / sum * span, thin = hh < .12 * h;
      let dx = rnd() < .22 ? 0 : U(-.07, .07) * h;
      /* at most two far jumps, never on neighbouring slices */
      if (thin && jumps < 2 && i - last > 1 && rnd() < .6) { dx = sgn() * U(.18, .42) * h; jumps++; last = i; }
      const sp = rnd() < .8 ? U(.03, .1) * h : 0, dy = U(-.5, .5);
      defs += `<clipPath id="${id}-c${i}"><rect x="${r1(x0 - h * 1.5)}" y="${r2(y)}" width="${r1(W + h * 3)}" height="${r2(hh + .06)}"/></clipPath>`;
      body += `<g clip-path="url(#${id}-c${i})">` + (sp ? use(dx - sp, -dy, C3) + use(dx + sp, dy, C2) : '') + use(dx, 0, C1) + '</g>';
      y += hh;
    });

    /* one block of repeated rows: a thin row of the word copied again and again, smeared
       down from under STU (a row of the stems, so it reads as streaks) */
    /* identical rows stacked are the row stretched, so each run of k rows is one scaled copy;
       the runs step sideways between them */
    const ys = top + (rnd() < .5 ? 0 : h + lg) + U(.34, .84) * h, rh = 1.6, runs = 4 + Math.floor(rnd() * 4);
    const xa = x0 + U(.02, .42) * W, xw = U(.32, .58) * W;
    defs += `<clipPath id="${id}-r"><rect x="${r1(xa)}" y="${r2(ys)}" width="${r1(xw)}" height="${rh}"/></clipPath>`;
    let drift = 0, yy = top + HB + U(1.5, 5);
    for (let j = 0; j < runs; j++) {
      const k = 2 + Math.floor(rnd() * 7);
      body += `<g transform="translate(${r2(drift)},${r2(yy)}) scale(1,${k}) translate(0,${r2(-ys)})" opacity="${r2(1 - j / runs * .45)}">` +
        `<g clip-path="url(#${id}-r)"><use href="#${id}-w" style="color:${j % 3 === 2 ? C2 : C1}"/></g></g>`;
      yy += k * rh; drift += U(-4, 4);
    }

    /* a few stray blocks on top */
    for (let i = 0, k = 2 + Math.floor(rnd() * 3); i < k; i++)
      front += rect(x0 + U(-.06, 1) * W, top + U(-.05, 1.02) * HB, U(4, 24), U(1.6, 5.5), rnd() < .5 ? C1 : C2);
    return (GL[key] = `<defs>${defs}</defs>${back}${body}${front}`);
  };

  /* ── 4. Plagát: Swiss poster inside the print rectangle ────────────────────
     Two zones. Above: a giant modular F cropped by the top, left and right edges. Below: a hard
     turquoise block across the full width (it covers the foot of the F) with a T knocked out of
     it in the shirt colour, its foot running off the bottom. One vertical axis (just right of
     the F stem) carries the left edge of the T and every caption. Thin rules, small flush-left
     captions in the sans and a grid of registration crosses that stays clear of the type.
     Everything is clipped to the print rectangle. */
  const poster = () => {
    const W = cm('tee', 44), H = cm('tee', 63), x0 = 320 - W / 2, y0 = 226, id = 'solo-plagat-clip';
    const D1 = 'var(--d1)';
    const hF = H * 1.13, wF = A.wordW(hF, 'F'), tF = hF * .24, fx = x0 - W * .12, fy = y0 - H * .092;
    const stemR = fx + tF, barB = fy + tF, midT = fy + (hF - tF) * .46, midB = midT + tF, ax = stemR + 5;
    const by = y0 + H * .62;
    const hT = H * .58, wT = A.wordW(hT, 'T'), tT = hT * .24, ty = by + H * .06;
    const tStemL = ax + (wT - tT) / 2, tStemR = tStemL + tT, capT = ty + tT;
    let s = `<defs><clipPath id="${id}"><rect x="${r2(x0)}" y="${y0}" width="${r2(W)}" height="${r2(H)}"/></clipPath></defs><g clip-path="url(#${id})">`;
    s += A.word(fx + wF / 2, fy, hF, { text: 'F', fill: D1 });
    s += rect(x0 - 2, by, W + 4, y0 + H + 2 - by, 'var(--d2)');
    s += A.word(ax + wT / 2, ty, hT, { text: 'T', fill: 'var(--body)' });
    /* registration crosses on a 6 × 8 grid: skipped where captions sit, inside the F (where they
       would not show) and wherever an edge of a letter or of the block would cut one in half */
    const busy = [[ax - 3, barB + 3, x0 + W, midT], [ax - 3, capT + 2, tStemL, capT + 19], [tStemR, capT + 2, x0 + W, capT + 19]];
    const box = (x, y, w, h) => [x, y, x + w, y + h];
    const shapes = [
      [box(fx, fy, tF, by - fy), box(fx, fy, wF, tF), box(fx, midT, wF * .8, tF)],    // F, above the block
      [box(ax, ty, wT, tT), box(tStemL, ty, tT, hT)],                                  // T
      [box(x0 - 2, by, W + 4, H)],                                                     // block
    ];
    const inU = (g, x, y) => g.some(b => x > b[0] && x < b[2] && y > b[1] && y < b[3]);
    let cr = '';
    for (let i = 1; i < 12; i++) for (let j = 1; j < 16; j++) {
      const x = x0 + i * W / 12, y = y0 + j * H / 16, a = 2.8;
      if (busy.some(b => x > b[0] - 3 && x < b[2] + 3 && y > b[1] - 3 && y < b[3] + 3)) continue;
      const pts = [[x, y], [x - a, y], [x + a, y], [x, y - a], [x, y + a]];
      if (shapes.some((g, k) => { const n = pts.filter(q => inU(g, q[0], q[1])).length; return (n > 0 && n < 5) || (k === 0 && n === 5); })) continue;
      cr += `M${r2(x - 1.8)},${r2(y)}h3.6M${r2(x)},${r2(y - 1.8)}v3.6`;
    }
    s += `<path d="${cr}" fill="none" style="stroke:${D1}" stroke-width=".45"/>`;
    s += `<path d="M${r2(ax)},${r2(barB + 4.5)}H${r2(x0 + W)}M${r2(stemR)},${r2((midB + by) / 2)}H${r2(x0 + W)}` +
      `M${r2(ax)},${r2(capT + 5)}H${r2(tStemL - 4)}M${r2(tStemR + 4)},${r2(capT + 5)}H${r2(x0 + W)}" fill="none" style="stroke:${D1}" stroke-width=".6"/>`;
    const cap = (str, x, y, o = {}) => t(str, r2(x), r2(y), Object.assign({ f: 's', size: 3.8, ls: .3, anchor: 'start', fill: D1 }, o));
    s += cap('FAKULTA INFORMATIKY A', ax, barB + 10.5) + cap('INFORMAČNÝCH TECHNOLÓGIÍ', ax, barB + 15.4) +
      cap('FIIT STU', ax, midT - 4.4, { size: 7, w: 700, ls: .7 });
    s += cap('BRATISLAVA', ax, capT + 11.5, { w: 700 }) + cap('2003 — 2026', ax, capT + 16.9) +
      cap('48°09′N', tStemR + 5, capT + 11.5) + cap('17°04′E', tStemR + 5, capT + 16.9);
    return s + '</g>';
  };

  /* ── 5. ASCII: FIIT from a density ramp ────────────────────────────────────
     The four letters are bars on a coarse grid (F 6, I 4, I 4, T 6 cells wide, 14 tall, strokes 2).
     Every character cell samples its coverage 3 × 3: inside the letters the ramp @#%*+=-:. runs
     from dense at the top to lighter at the bottom, partly covered cells get the light end, and an
     offset copy gives a shadow. One <text> per row and ink (letters d1, shadow d2), aligned to the
     grid with textLength, blank cells as no-break spaces. */
  const ASC = {};
  const RAMP = '@#%*+=-:.', NB = ' ';
  const ascii = (cx, top, wTot) => {
    const key = `${cx},${top},${wTot}`;
    if (ASC[key]) return ASC[key];
    const COLS = 66, cw = wTot / COLS, fs = r2(cw / .6), rh = r2(fs * .98), X0 = cx - wTot / 2;
    const G = [
      [[0, 0, 2, 14], [0, 0, 6, 2], [0, 6, 5, 2]],
      [[1, 0, 2, 14], [0, 0, 4, 2], [0, 12, 4, 2]],
      [[1, 0, 2, 14], [0, 0, 4, 2], [0, 12, 4, 2]],
      [[0, 0, 6, 2], [2, 0, 2, 14]],
    ], GW = [6, 4, 4, 6], GAP = 1.5;
    const u = (COLS - 6) * cw / 24.5, wx0 = X0 + 3 * cw, LH = 14 * u;
    const rects = [];
    let ox = 0;
    G.forEach((g, i) => { g.forEach(r => rects.push([wx0 + (ox + r[0]) * u, top + r[1] * u, r[2] * u, r[3] * u])); ox += GW[i] + GAP; });
    const sdx = .85 * u, sdy = .62 * u;
    const hit = (x, y) => rects.some(r => x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]);
    const cov = (c, r, dx, dy) => {
      let k = 0;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (hit(X0 + (c + (a + .5) / 3) * cw - dx, top + (r + (b + .5) / 3) * rh - dy)) k++;
      return k / 9;
    };
    const noise = (c, r) => ((((c + 7) * 73856093) ^ ((r + 3) * 19349663)) >>> 0) % 1000 / 1000 - .5;
    const ROWS = Math.ceil((LH + sdy) / rh) + 1;
    let s = '';
    /* a thin stroke in the ink colour thickens the mono glyphs, as a screen print would spread */
    const row = (str, y, fill, sw) => `<text x="${r2(X0)}" y="${r2(y)}" class="tx-f" font-size="${fs}" textLength="${r2(wTot)}" lengthAdjust="spacing" style="fill:${fill};stroke:${fill}" stroke-width="${sw}" stroke-linejoin="round">${esc(str)}</text>`;
    for (let r = 0; r < ROWS; r++) {
      let a = '', b = '', any = [0, 0];
      for (let c = 0; c < COLS; c++) {
        const lc = cov(c, r, 0, 0);
        if (lc > .12) {
          const g = Math.min(1, Math.max(0, (r + .5) * rh / LH));
          const d = Math.min(1, lc * (1 - .32 * g) + noise(c, r) * .1);
          a += RAMP[Math.min(8, Math.max(0, Math.floor((1 - d) * 9)))]; b += NB; any[0] = 1;
          continue;
        }
        const sc = cov(c, r, sdx, sdy);
        if (sc > .12) {
          const d = .6 * sc + noise(c, r) * .08;
          b += RAMP[Math.min(8, Math.max(3, Math.floor((1 - d) * 9)))]; a += NB; any[1] = 1;
        } else { a += NB; b += NB; }
      }
      const y = top + (r + .8) * rh;
      if (any[1]) s += row(b, y, 'var(--d2)', .22);
      if (any[0]) s += row(a, y, 'var(--d1)', .34);
    }
    /* prompt line on the grid, with a block cursor */
    const py = top + (ROWS + 1.8) * rh, cmd = ' fiit stu --year 2003';
    s += `<text x="${r2(wx0)}" y="${r2(py)}" class="tx-f" font-size="${fs}" textLength="${r2((cmd.length + 1) * cw)}" lengthAdjust="spacing" style="fill:var(--d1)">` +
      `<tspan style="fill:var(--d2)">&gt;</tspan>${esc(cmd.replace(/ /g, NB))}</text>`;
    s += rect(wx0 + (cmd.length + 2) * cw, py - fs * .72, cw * .9, fs * .86, 'var(--d2)');
    return (ASC[key] = { svg: s, h: py - top });
  };

  /* ── colourways ── */
  const OFF = '#EEEAE0';
  const WAYS = {
    seed: [{ n: 'Čierna', body: C.black, v: { d1: OFF, d2: C.fiit, d3: OFF, d4: C.black, cord: '#E6E1D5', trim: C.fiit, trim2: OFF } }],
    vykres: [{ n: 'Tyrkysová 2995', body: C.fiit, v: { d1: '#FFFFFF', d2: '#FFFFFF', d3: '#FFFFFF', d4: C.fiit, cord: '#FFFFFF', lining: C.ink, zip: C.ink, trim: C.ink, trim2: '#FFFFFF' } }],
    glitch: [{ n: 'Čierna', body: C.black, v: { d1: '#F2EFE6', d2: C.fiit, d3: C.stu, d4: C.black, trim: C.fiit, trim2: '#F2EFE6' } }],
    plagat: [
      { n: 'Biela', body: '#F6F6F3', v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: '#F6F6F3', trim: C.fiit, trim2: C.ink } },
      { n: 'Čierna', body: C.black, v: { d1: '#F2EFE6', d2: C.fiit, d3: '#F2EFE6', d4: C.black, trim: C.fiit, trim2: '#F2EFE6' } },
    ],
    ascii: [
      { n: 'Prírodné plátno', body: C.ecru, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ecru, trim: C.ink, trim2: C.fiit, noise: .2 } },
      { n: 'Čierna', body: C.black, v: { d1: '#EDE6D4', d2: C.fiit, d3: '#EDE6D4', d4: C.black, trim: C.fiit, trim2: '#EDE6D4' } },
    ],
  };

  const FLEECE = 'Počesaný fleece 450 g/m², 100 % organická bavlna';

  FM.products.push(
    {
      id: 'solo-seed', name: 'Mikina Seed', col: 'solo', cat: 'mikiny', type: 'hoodie', price: 89, sizes: SIZES,
      edition: 50, seeded: true,
      blurb: 'Na chrbte stovky zakrivených čiar v tyrkysovej a lomenej bielej, ktoré tečú poľom vypočítaným z čísla kusu, takže žiadne dve mikiny nie sú rovnaké. 50 kusov, každý číslovaný, číslo seedu máš aj na hrudi.',
      spec: [FLEECE, 'Digitálna priama tlač (DTG) na chrbte 52 × 80 cm, kresba vypočítaná pre každý kus zvlášť',
        'Na ľavej hrudi SEED a číslo kusu, pod ním FIIT STU, šírka 11 cm', 'Dvojvrstvová kapucňa, podšívka Pantone 2995'],
      ways: WAYS.seed,
      deco: {
        front: (z, p) => {
          const s = seedOf(p, 50), x = z.chestL.x, y = z.chestL.y;
          return t(`SEED ${pad2(s)} / 50`, x, y - 1.5, { f: 'f', size: 5, ls: .4, fill: 'var(--d3)' }) +
            t('FIIT STU', x, y + 6.5, { f: 'f', size: 5, ls: 1.75, fill: 'var(--d2)' });
        },
        back: (z, p) => {
          const s = seedOf(p, 50), w = cm('hoodie', 52), h = cm('hoodie', 80);
          const R = { x: r2(320 - w / 2), y: 228, w, h }, f = flow(s, R), cy = r2(R.y + h + 12);
          return f.svg + `<path d="${crops(R, 3, 6)}" fill="none" style="stroke:var(--d3)" stroke-width=".5" opacity=".7"/>` +
            t('FIIT STU', R.x, cy, { f: 'f', size: 4.6, ls: 1.4, anchor: 'start', fill: 'var(--d3)' }) +
            t(`SEED ${pad2(s)} / 50 · ${f.n} ČIAR`, r2(R.x + w), cy, { f: 'f', size: 4.6, ls: .5, anchor: 'end', fill: 'var(--d2)' });
        },
      },
    },
    {
      id: 'solo-vykres', name: 'Mikina Výkres', col: 'solo', cat: 'mikiny', type: 'hoodie', price: 85, sizes: SIZES,
      edition: 60,
      blurb: 'Na chrbte je strih tejto mikiny ako technický výkres: trup, rukáv, kapucňa, vrecko, manžeta a pás s kótami v centimetroch, smerom osnovy, zárezmi a popisovým poľom v rohu. 60 kusov, každý číslovaný.',
      spec: [FLEECE + ', tyrkysová 2995', 'Sieťotlač bielou na chrbte 49,5 × 80 cm, tenké linky ako na výkrese',
        'Malé popisové pole na ľavej hrudi 9 × 4 cm', 'Dvojvrstvová kapucňa, podšívka čierna, biele šnúrky'],
      ways: WAYS.vykres,
      deco: {
        front: z => titleSmall(z.chestL.x, z.chestL.y),
        back: () => vykres(),
      },
    },
    {
      id: 'solo-glitch', name: 'Crewneck Glitch', col: 'solo', cat: 'mikiny', type: 'crew', price: 79, sizes: SIZES,
      edition: 50, seeded: true,
      blurb: 'Modulové FIIT nad STU cez celú hruď, rozrezané na vodorovné pásy, posunuté do strán a rozdvojené na tyrkysovú a bordovú STU. Rez je pri každom kuse iný, 50 kusov, každý číslovaný.',
      spec: ['Počesaný fleece 400 g/m², 100 % organická bavlna', 'Digitálna priama tlač (DTG) cez hruď, písmená 15 cm, šírka 47 cm, tri farby',
        'Rez písma vypočítaný z čísla kusu, číslo kusu aj vzadu pod golierom', 'Rebrovaný golier s klinom, manžety a lem'],
      ways: WAYS.glitch,
      deco: {
        front: (z, p) => glitch(seedOf(p, 50), z.chestC.x, 246, cm('crew', 15)),
        back: (z, p) => {
          const s = seedOf(p, 50), x = z.nape.x, y = z.nape.y + 8, str = `FIIT STU · KUS ${pad2(s)} / 50`, o = { f: 'f', size: 3.2, ls: .4 };
          return t(str, x - .5, y, Object.assign({ fill: 'var(--d3)' }, o)) + t(str, x + .5, y, Object.assign({ fill: 'var(--d2)' }, o)) +
            t(str, x, y, Object.assign({ fill: 'var(--d1)' }, o));
        },
      },
    },
    {
      id: 'solo-plagat', name: 'Tričko Plagát', col: 'solo', cat: 'tricka', type: 'tee', price: 45, sizes: SIZES,
      edition: 100,
      blurb: 'Švajčiarsky plagát cez hruď a brucho: obrie písmená F a T orezané okrajom tlače, tvrdý tyrkysový blok, tenké linky a drobné popisky fakulty. 100 kusov, každý číslovaný.',
      spec: ['Česaná bavlna 240 g/m², boxy strih so zníženým ramenom', 'Sieťotlač 44 × 63 cm, dve farby, písmená orezané okrajom tlače',
        'Vzadu pod golierom jeden riadok FIIT STU · 2003 — 2026', 'Číslo kusu na etikete v bočnom šve'],
      ways: WAYS.plagat,
      deco: {
        front: () => poster(),
        back: z => t('FIIT STU · 2003 — 2026', z.nape.x, z.nape.y + 8, { f: 's', w: 600, size: 3.6, ls: .9 }),
      },
    },
    {
      id: 'solo-ascii', name: 'Taška ASCII', col: 'solo', cat: 'doplnky', type: 'tote', price: 24, sizes: null,
      edition: 100,
      blurb: 'Plátenná taška s nápisom FIIT poskladaným zo znakov ako v termináli: zďaleka čítaš písmená, zblízka @, # a %. 100 kusov, každý číslovaný.',
      spec: ['Bavlnené plátno 340 g/m², nefarbené alebo čierne', 'Sieťotlač dvoch farieb 33 × 21 cm, tieň písmen v tyrkysovej 2995',
        'Pod nápisom riadok > fiit stu --year 2003', '40 × 42 cm, uchá 65 cm'],
      ways: WAYS.ascii,
      deco: {
        front: z => ascii(z.face.x, 394, cm('tote', 33)).svg,
      },
    }
  );
})();
