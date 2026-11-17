/* Šatník FIIT STU — kusovky (solo-b): five one-off pieces outside the collections.
   Garments: tee (garments-tees.js), varsityjkt (garments-sweats.js) and the solo-b types
   fairisle, fairbeanie, scarflay (garments-solo-b.js). 1 cm ≈ 3.8 units on tops. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, C = FM.C, esc = FM.esc;
  const r2 = n => +n.toFixed(2);
  const SIZES = FM.SIZES;
  /* units of a garment → centimetres, for the spec lines */
  const cmOf = (type, units, dec = 0) => {
    const v = units / FM.garments[type].cm;
    return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
  };
  /* small deterministic PRNG (mulberry32) */
  const rng = seed => {
    let a = (seed >>> 0) || 1;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  };
  const circ = (x, y, r) => `M${r2(x - r)},${r2(y)}a${r},${r} 0 1 0 ${r2(2 * r)},0a${r},${r} 0 1 0 ${r2(-2 * r)},0z`;
  const rect = (x, y, w, h) => `M${r2(x)},${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}z`;

  /* ═══ TYRKYSOVÁ OBRAZOVKA ═══════════════════════════════════════════════
     The full-screen system error, set in the faculty's turquoise. Left-aligned block, 44 cm wide:
     a big :( , the message in three lines, the percentage, then a QR-like square with the small
     print beside it. Proportions follow the real screen: :( ≈ 6× the message size, small print ½. */
  const QR = (x, y, size) => {
    const n = 21, m = size / (n + 2), R = rng(2003), M = [];
    for (let i = 0; i < n; i++) { M.push([]); for (let j = 0; j < n; j++) M[i].push(R() < .48); }
    const finder = (r0, c0) => {
      for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
        const r = r0 + i, c = c0 + j;
        if (r < 0 || c < 0 || r >= n || c >= n) continue;
        const e = Math.max(Math.abs(i - 3), Math.abs(j - 3));
        M[r][c] = e === 3 || e <= 1;
      }
    };
    finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
    for (let k = 8; k < n - 8; k++) { M[6][k] = k % 2 === 0; M[k][6] = k % 2 === 0; }
    /* printed: the light modules and a one-module quiet zone; dark modules stay unprinted */
    const light = (i, c) => i < 0 || i >= n || c < 0 || c >= n || !M[i][c];
    let d = '';
    for (let i = -1; i <= n; i++) {
      for (let j = -1; j <= n; j++) {
        if (!light(i, j)) continue;
        let e = j; while (e + 1 <= n && light(i, e + 1)) e++;
        d += rect(x + (j + 1) * m, y + (i + 1) * m, (e - j + 1) * m, m);
        j = e;
      }
    }
    return `<path d="${d}" style="fill:var(--d1)"/>`;
  };
  /* Block 48 × 54 cm, its left edge set so the longest message line is centred on the chest.
     Message 10.6 units (2.8 cm type), leading 1.4; :( six times that; small print half. */
  const SCREEN = {
    x: 228, w: 184, top: 232, bottom: 439,
    face: { y: 279, size: 63.7 },
    msg: { y: 324, size: 10.6, lead: 14.9, lines: ['Tvoj semester narazil na problém', 'a musí sa reštartovať. Zbierame údaje', 'o chybe, potom to skúsiš znova.'] },
    pct: { y: 378.5, text: '100 % dokončené' },
    qr: { y: 395, size: 37.8 },
    small: { size: 5.2, lead: 7.7, lines: ['Viac o tejto chybe a možných riešeniach nájdeš', 'v termínoch opravných skúšok.', '', 'Ak voláš na študijné FIIT STU, povedz im toto:', 'Kód zastavenia: SKUSKOVE_OBDOBIE', 'Čo zlyhalo: spanok.sys'] },
  };
  const screen = () => {
    const S = SCREEN, L = (s, x, y, size) => t(s, x, y, { anchor: 'start', size, fill: 'var(--d1)' });
    let s = L(':(', S.x - 2.5, S.face.y, S.face.size);
    S.msg.lines.forEach((l, i) => { s += L(l, S.x, r2(S.msg.y + i * S.msg.lead), S.msg.size); });
    s += L(S.pct.text, S.x, S.pct.y, S.msg.size);
    s += QR(S.x, S.qr.y, S.qr.size);
    const sx = r2(S.x + S.qr.size + 9.4), sy = S.qr.y + 5.2;
    S.small.lines.forEach((l, i) => { if (l) s += L(l, sx, r2(sy + i * S.small.lead), S.small.size); });
    return s;
  };

  /* ═══ PLOŠNÝ SPOJ ═══════════════════════════════════════════════════════
     A printed circuit board on the back panel of the varsity jacket, different on every piece.
     Chip U1 in the middle, ten pins a side. Each side's pins form two buses that run out, turn
     45° towards the nearest corner (bends staggered by tan 22.5° × pitch, so the spacing stays
     even), sometimes jog a second time, and run on at right angles to the edge. Buses that fan
     away from each other cannot cross, so the board stays tidy for every seed. Traces end in pads,
     vias or edge connector J1; an inline part (R, C, D) may sit on a bus's outer trace. Everything
     drawn is marked on an occupancy grid, and the extra parts (crystal, capacitors, a small IC,
     test points, via fences) are only placed where the grid is free. */
  /* routing area inside backC (x 213–427, y 210–560); with its outline 54 × 79 cm */
  const BOARD = { cx: 320, cy: 373, S: 80, N: 10, PIN: 5, box: { x0: 226, x1: 414, y0: 230, y1: 516 } };
  const pcb = seed => {
    const R = rng(seed * 7919 + 17), B = BOARD.box, { cx, cy, S, N, PIN } = BOARD;
    const p = S / (N + 1), K = Math.tan(Math.PI / 8);
    const SIDES = [
      { u: [0, -1], v: [1, 0], dEnd: cy - B.y0, lMax: 76, vert: true },
      { u: [1, 0], v: [0, 1], dEnd: B.x1 - cx, lMax: 136, vert: false },
      { u: [0, 1], v: [-1, 0], dEnd: B.y1 - cy, lMax: 76, vert: true },
      { u: [-1, 0], v: [0, -1], dEnd: cx - B.x0, lMax: 136, vert: false },
    ];
    const W = (sd, d, l) => [cx + d * sd.u[0] + l * sd.v[0], cy + d * sd.u[1] + l * sd.v[1]];
    const pt = q => `${r2(q[0])},${r2(q[1])}`;
    let tr = '', pads = '', vias = '', ol = '', labels = '', ink = '';
    const cnt = { R: 0, C: 0, D: 0, U: 1, Y: 0, TP: 0 };

    /* occupancy grid, 3-unit cells */
    const GC = 3, gx0 = B.x0 - 12, gy0 = B.y0 - 12;
    const gnx = Math.ceil((B.x1 - B.x0 + 24) / GC), gny = Math.ceil((B.y1 - B.y0 + 24) / GC);
    const occ = new Uint8Array(gnx * gny);
    const cells = (x0, y0, x1, y1, f) => {
      const a = Math.max(0, Math.floor((x0 - gx0) / GC)), b = Math.min(gnx - 1, Math.floor((x1 - gx0) / GC));
      const c = Math.max(0, Math.floor((y0 - gy0) / GC)), d = Math.min(gny - 1, Math.floor((y1 - gy0) / GC));
      for (let gy = c; gy <= d; gy++) for (let gx = a; gx <= b; gx++) if (f(gy * gnx + gx)) return true;
      return false;
    };
    const mark = (x0, y0, x1, y1) => { cells(x0, y0, x1, y1, i => { occ[i] = 1; }); };
    const free = (x0, y0, x1, y1) => x0 >= B.x0 && x1 <= B.x1 && y0 >= B.y0 && y1 <= B.y1 && !cells(x0, y0, x1, y1, i => occ[i]);
    const markLine = (pts, r) => {
      for (let k = 1; k < pts.length; k++) {
        const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
        for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; mark(x - r, y - r, x + r, y + r); }
      }
    };
    const lab = (s, x, y, rot) => {
      const w = s.length * 3.3 + 1;
      if (rot) mark(x - 4, y - w / 2, x + 2, y + w / 2); else mark(x - w / 2, y - 5, x + w / 2, y + 1.5);
      return t(s, r2(x), r2(y), { f: 'f', size: 5.2, ls: .3, fill: 'var(--d1)', rot });
    };
    /* chip and mounting holes first */
    mark(cx - S / 2 - PIN - 3, cy - S / 2 - PIN - 3, cx + S / 2 + PIN + 3, cy + S / 2 + PIN + 3);
    const HOLES = [[B.x0 + 6, B.y0 + 6], [B.x1 - 6, B.y0 + 6], [B.x0 + 6, B.y1 - 6], [B.x1 - 6, B.y1 - 6]];
    let holes = '';
    HOLES.forEach(([x, y]) => { holes += circ(x, y, 5); mark(x - 9, y - 9, x + 9, y + 9); });
    labels += lab('U1', cx - S / 2 - 7, cy - S / 2 - 4, 0);

    /* ── the buses ── */
    const conn = Math.floor(R() * 8);                     // the half-bus that ends in edge connector J1
    SIDES.forEach((sd, si) => [-1, 1].forEach((sg, hi) => {
      const ts = [];
      for (let j = 0; j < N; j++) { const v = (j + 1) * p - S / 2; if (Math.sign(v) === sg) ts.push(v); }
      ts.sort((a, b) => sg * (b - a));                    // innermost of the turn (nearest the corner) first
      const n = ts.length, d0 = S / 2 + PIN, room = sd.dEnd - d0 - (n - 1) * K * p - 16;
      const two = sd.vert && R() < .6;                    // long buses may jog twice
      const a = 3 + R() * Math.min(16, room * .25);
      const isConn = si * 2 + hi === conn;
      const lMax = sd.lMax - (isConn ? 12 : 0);           // the connector and its label keep clear of the corner hole
      let bt = Math.max(0, Math.min(lMax - Math.abs(ts[0]), room - a - (two ? 20 : 0)));
      bt = R() < .15 ? 0 : (.4 + .6 * R()) * bt;
      const b1 = two ? bt * (.35 + .3 * R()) : bt, b2 = bt - b1;
      const c = two ? 8 + R() * Math.max(0, room - a - bt - 8) * .6 : 0;
      let part = null;                                    // [d0, d1] of the inline part on trace 0
      let lastVia = -99;                                  // d of the previous trace's via, to stagger them
      ts.forEach((tt, i) => {
        const dA = d0 + a + i * K * p, dB = dA + b1, dC = dB + c, dD = dC + b2, lf = tt + sg * bt;
        const roll = R();
        if (!isConn && roll < .06) return;                // an unconnected pin
        const pts = [W(sd, d0, tt), W(sd, dA, tt)];
        if (b1 > .5) pts.push(W(sd, dB, tt + sg * b1));
        if (two && b2 > .5) pts.push(W(sd, dC, tt + sg * b1), W(sd, dD, lf));
        let dE = sd.dEnd - 3.6, end = 'pad';
        if (isConn) { dE = sd.dEnd - 13; end = 'finger'; }
        else if (roll < .24 && sd.dEnd - dD > 30) { dE = dD + 8 + R() * (sd.dEnd - dD - 26); end = 'via'; }
        if (end === 'via' && i === 1 && part && dE > part[0] - 6 && dE < part[1] + 6) { dE = sd.dEnd - 3.6; end = 'pad'; }
        if (end === 'via' && Math.abs(dE - lastVia) < 10) {
          if (lastVia + 10 < sd.dEnd - 14) dE = lastVia + 10; else { dE = sd.dEnd - 3.6; end = 'pad'; }
        }
        lastVia = end === 'via' ? dE : -99;
        /* an inline part on the outer trace, on the final straight run */
        if (i === 0 && !isConn && dE - dD > 44 && R() < .7) {
          const dc = dD + 14 + R() * (dE - dD - 34), kind = ['R', 'R', 'C', 'D'][Math.floor(R() * 4)];
          cnt[kind]++;
          part = [dc - 10, dc + 10];
          const cor = (x, y) => pt(W(sd, dc + x, lf + y)), hw = 3.7;
          ol += `M${cor(-10, -hw)} L${cor(10, -hw)} L${cor(10, hw)} L${cor(-10, hw)} Z`;
          if (kind === 'C') ol += `M${cor(-6.8, -hw)} L${cor(-6.8, hw)}`;
          if (kind === 'D') ol += `M${cor(5, -hw)} L${cor(5, hw)}M${cor(6.6, -hw)} L${cor(6.6, hw)}`;
          [-1, 1].forEach(k => {
            const q = W(sd, dc + k * 6.2, lf);
            pads += sd.vert ? rect(q[0] - 2.3, q[1] - 2.1, 4.6, 4.2) : rect(q[0] - 2.1, q[1] - 2.3, 4.2, 4.6);
          });
          const lq = W(sd, dc, lf + sg * 10.5);
          labels += sd.vert ? lab(kind + cnt[kind], lq[0] + 1.8, lq[1], -90) : lab(kind + cnt[kind], lq[0], lq[1] + 1.9, 0);
          pts.push(W(sd, dc - 9, lf));
          tr += 'M' + pts.map(pt).join(' L');
          markLine(pts, 4.2);
          const rest = [W(sd, dc + 9, lf), W(sd, dE, lf)];
          tr += 'M' + rest.map(pt).join(' L');
          markLine(rest, 4.2);
          const q0 = W(sd, dc - 11, lf - 6), q1 = W(sd, dc + 11, lf + 6);
          mark(Math.min(q0[0], q1[0]), Math.min(q0[1], q1[1]), Math.max(q0[0], q1[0]), Math.max(q0[1], q1[1]));
        } else {
          pts.push(W(sd, dE, lf));
          tr += 'M' + pts.map(pt).join(' L');
          markLine(pts, 4.2);
        }
        const E = W(sd, dE, lf);
        if (end === 'pad') { pads += circ(E[0], E[1], 3.3); mark(E[0] - 5.5, E[1] - 5.5, E[0] + 5.5, E[1] + 5.5); }
        else if (end === 'via') { vias += circ(E[0], E[1], 2.7); mark(E[0] - 5.5, E[1] - 5.5, E[0] + 5.5, E[1] + 5.5); }
        else {
          const F1 = W(sd, sd.dEnd, lf);
          pads += sd.vert ? rect(E[0] - 2.6, Math.min(E[1], F1[1]), 5.2, Math.abs(F1[1] - E[1]))
            : rect(Math.min(E[0], F1[0]), E[1] - 2.6, Math.abs(F1[0] - E[0]), 5.2);
          markLine([E, F1], 4.5);
          if (i === 0) { const lq = W(sd, sd.dEnd - 7, lf + sg * 10); labels += lab('J1', lq[0] + (sd.vert ? 1.8 : 0), lq[1] + (sd.vert ? 0 : 1.9), sd.vert ? -90 : 0); }
        }
      });
    }));

    /* ── via fences on the chip's diagonals, where the corridor between two buses is free ── */
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
      if (R() < .45) return;
      for (let k = 0; k < 6; k++) {
        const dd = S / 2 + 16 + k * 8.5, x = cx + sx * dd, y = cy + sy * dd;
        if (!free(x - 4.5, y - 4.5, x + 4.5, y + 4.5)) break;
        vias += circ(x, y, 2.4); mark(x - 4.5, y - 4.5, x + 4.5, y + 4.5);
      }
    });

    /* ── extra parts in free space ── */
    const PARTS = {
      Y: { box: [-24, -14, 24, 6], draw: (x, y) => {           // crystal with two stubs to vias
        cnt.Y++;
        ol += `M${r2(x - 7)},${r2(y - 4)} h14 a4,4 0 0 1 0,8 h-14 a4,4 0 0 1 0,-8 z`;
        pads += circ(x - 6, y, 1.9) + circ(x + 6, y, 1.9);
        tr += `M${r2(x - 6)},${r2(y)} L${r2(x - 18)},${r2(y)}M${r2(x + 6)},${r2(y)} L${r2(x + 18)},${r2(y)}`;
        vias += circ(x - 20.5, y, 2.4) + circ(x + 20.5, y, 2.4);
        labels += lab('Y' + cnt.Y, x, y - 8, 0);
      } },
      C: { box: [-10, -10, 26, 10], draw: (x, y) => {           // radial capacitor, polarity mark
        cnt.C++;
        ol += circ(x, y, 7.4) + `M${r2(x - 6.2)},${r2(y - 9.6)} h3 M${r2(x - 4.7)},${r2(y - 11.1)} v3`;
        pads += circ(x - 3, y, 1.9) + circ(x + 3, y, 1.9);
        labels += lab('C' + cnt.C, x + 17, y + 1.9, 0);
      } },
      U: { box: [-13, -18, 13, 12], draw: (x, y) => {           // small 8-pin IC
        cnt.U++;
        let pn = '';
        for (let k = 0; k < 4; k++) pn += rect(x - 10, y - 7.2 + k * 4.4, 4.4, 2.2) + rect(x + 5.6, y - 7.2 + k * 4.4, 4.4, 2.2);
        pads += pn;
        ink += `<rect x="${r2(x - 6)}" y="${r2(y - 9.5)}" width="12" height="19" rx="1" style="fill:var(--d4);stroke:var(--d1)" stroke-width=".6" stroke-opacity=".5"/>` +
          `<circle cx="${r2(x - 3.4)}" cy="${r2(y - 6.6)}" r="1" style="fill:var(--d1)" opacity=".7"/>`;
        labels += lab('U' + cnt.U, x, y - 12.5, 0);
      } },
      TP: { box: [-6, -6, 22, 6], draw: (x, y) => {             // test point
        cnt.TP++;
        vias += circ(x, y, 3.2);
        labels += lab('TP' + cnt.TP, x + 13, y + 1.9, 0);
      } },
    };
    const order = ['Y', 'C', 'U', 'TP', 'C', 'TP'];
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.length = 3 + Math.floor(R() * 3);
    order.forEach(k => {
      const P = PARTS[k];
      for (let tries = 0; tries < 80; tries++) {
        const x = B.x0 + 8 + R() * (B.x1 - B.x0 - 16), y = B.y0 + 8 + R() * (B.y1 - B.y0 - 16);
        const [a, b, c, d] = P.box;
        if (!free(x + a, y + b, x + c, y + d)) continue;
        mark(x + a - 2, y + b - 2, x + c + 2, y + d + 2);
        P.draw(x, y);
        break;
      }
    });

    /* ── the chip ── */
    let pins = '';
    SIDES.forEach(sd => { for (let j = 0; j < N; j++) { const l = (j + 1) * p - S / 2, q = W(sd, S / 2 + PIN / 2 - .5, l); pins += sd.vert ? rect(q[0] - 1.5, q[1] - 3.2, 3, 6.4) : rect(q[0] - 3.2, q[1] - 1.5, 6.4, 3); } });
    const chip = `<g ${FM.S}><path d="${pins}" style="fill:var(--d3)"/>` +
      `<rect x="${cx - S / 2}" y="${cy - S / 2}" width="${S}" height="${S}" rx="3" style="fill:var(--d4);stroke:var(--d1)" stroke-width=".9" stroke-opacity=".45"/>` +
      `<circle cx="${cx - S / 2 + 8}" cy="${cy - S / 2 + 8}" r="2.4" style="fill:var(--d1)" opacity=".75"/>` +
      t('FIIT STU', cx, cy + 2, { size: 12, w: 700, ls: 1.3, fill: 'var(--d1)' }) +
      t('2003', cx, cy + 17, { f: 'f', size: 8.8, ls: 2.4, fill: 'var(--d1)' }) + '</g>';
    const edgeD = `M${B.x0 - 2},${B.y0 - 8} H${B.x1 + 2} Q${B.x1 + 8},${B.y0 - 8} ${B.x1 + 8},${B.y0 - 2} V${B.y1 + 2} Q${B.x1 + 8},${B.y1 + 8} ${B.x1 + 2},${B.y1 + 8} H${B.x0 - 2} Q${B.x0 - 8},${B.y1 + 8} ${B.x0 - 8},${B.y1 + 2} V${B.y0 - 2} Q${B.x0 - 8},${B.y0 - 8} ${B.x0 - 2},${B.y0 - 8} Z`;
    const title = t(`FIIT STU · KUS ${String(seed).padStart(2, '0')}/25`, cx, B.y1 + 19, { f: 'f', size: 5.2, ls: 1.2, fill: 'var(--d1)' });
    return `<path d="${edgeD}" fill="none" style="stroke:var(--d1)" stroke-width=".8" stroke-opacity=".55" stroke-dasharray="3 2"/>` +
      `<path d="${tr}" fill="none" style="stroke:var(--d2)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<path d="${tr}" fill="none" stroke="rgba(0,0,0,.32)" stroke-width=".7" stroke-dasharray="1.5 1.3"/>` +
      `<path d="${ol}" fill="none" style="stroke:var(--d1)" stroke-width=".9" stroke-linejoin="round"/>` +
      ink + `<path d="${pads}" style="fill:var(--d3)"/>` +
      `<path d="${vias}" fill="none" style="stroke:var(--d3)" stroke-width="1.7"/>` +
      `<path d="${holes}" fill="none" style="stroke:var(--d3)" stroke-width="2.4"/>` +
      chip + labels + title;
  };
  /* Small chip for the left chest, in place of the letter patch. */
  const chipSmall = (x, y) => {
    const S = 26, N = 4, p = S / (N + 1);
    let pins = '';
    for (let j = 0; j < N; j++) {
      const l = (j + 1) * p - S / 2;
      pins += rect(x + l - 1.1, y - S / 2 - 4, 2.2, 4.4) + rect(x + l - 1.1, y + S / 2 - .4, 2.2, 4.4) +
        rect(x - S / 2 - 4, y + l - 1.1, 4.4, 2.2) + rect(x + S / 2 - .4, y + l - 1.1, 4.4, 2.2);
    }
    /* four traces from the right-hand pins to the side seam, as if the board ran on round the body
       to the back: out, 45° down (bends staggered like the buses on the back), on to the seam */
    const K = Math.tan(Math.PI / 8), x0 = x + S / 2 + 4, b = 12, xe = x + 51;
    let tr = '';
    for (let j = 0; j < N; j++) {
      const l = (j + 1) * p - S / 2, i = N - 1 - j, xa = x0 + 3 + i * K * p;
      tr += `M${r2(x0)},${r2(y + l)} L${r2(xa)},${r2(y + l)} L${r2(xa + b)},${r2(y + l + b)} L${r2(xe)},${r2(y + l + b)}`;
    }
    return `<path d="${tr}" fill="none" style="stroke:var(--d2)" stroke-width="1.7" stroke-linejoin="round"/>` +
      `<path d="${tr}" fill="none" stroke="rgba(0,0,0,.32)" stroke-width=".55" stroke-dasharray="1.2 1"/>` +
      `<g ${FM.S}><path d="${pins}" style="fill:var(--d3)"/>` +
      `<rect x="${x - S / 2}" y="${y - S / 2}" width="${S}" height="${S}" rx="1.6" style="fill:var(--d4);stroke:var(--d1)" stroke-width=".7" stroke-opacity=".5"/>` +
      `<circle cx="${x - S / 2 + 3.6}" cy="${y - S / 2 + 3.6}" r="1.2" style="fill:var(--d1)" opacity=".75"/>` +
      t('FIIT', x, y + 1.6, { size: 7, w: 700, ls: .6, fill: 'var(--d1)' }) +
      t('STU', x, y + 7.6, { f: 'f', size: 3.8, ls: 1, fill: 'var(--d2)' }) + '</g>';
  };

  /* ═══ NAČÍTAVAM ═════════════════════════════════════════════════════════
     A progress bar along the whole scarf, following the cloth through both bends. The fill
     is different on every piece (piece 1 is at 83 %). */
  /* a fixed shuffle of 4…99 %, so all 80 pieces stop at a different percentage; piece 1 at 83 % */
  const PCTS = (() => {
    const a = [], R = rng(8080);
    for (let v = 4; v <= 99; v++) a.push(v);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    const k = a.indexOf(83); [a[0], a[k]] = [a[k], a[0]];
    return a;
  })();
  const pctOf = seed => PCTS[(Math.max(1, seed) - 1) % PCTS.length];
  const tpath = (d, s, o) => {
    const id = FM.uid('solob-tp');
    return `<path id="${id}" d="${d}" fill="none"/>` +
      `<text class="tx-${o.f || 's'}" font-size="${o.size}"${o.w ? ` font-weight="${o.w}"` : ''} letter-spacing="${o.ls || 0}" style="fill:${o.fill || 'var(--d1)'}">` +
      `<textPath href="#${id}" startOffset="${o.at || 0}" text-anchor="${o.anchor || 'start'}">${esc(s)}</textPath></text>`;
  };
  const loading = (z, p) => {
    const G = FM.garments.scarflay.geo, L = G.L;
    const pct = pctOf((p.opts && p.opts.seed) || 1);
    const s0 = 22, s1 = L - 22, hb = 22, pad = 4.6, gap = 4.4, N = 40;
    const pitch = (s1 - s0 - 2 * pad + gap) / N, nf = Math.round(pct / 100 * N);
    let fill = '', empty = '';
    for (let i = 0; i < N; i++) {
      const a = s0 + pad + i * pitch, b = a + pitch - gap;
      if (i < nf) fill += G.region(a, b, -(hb - pad), hb - pad);
      else empty += G.region(a + .6, b - .6, -(hb - pad - .6), hb - pad - .6);
    }
    /* ŠTÚDIUM above the bar at the start (bottom left), FIIT STU above it at the end (top right),
       the percentage under the bar where the fill ends, so the three can never collide. */
    const sz = 15, cap = sz * .72, top = hb + 7, bot = -(hb + 7 + cap);
    const sf = s0 + pad + nf * pitch - gap;                   // where the fill ends
    let s = `<path d="${G.region(s0, s1, -hb, hb)}" fill="none" style="stroke:var(--d1)" stroke-width="2.6" stroke-linejoin="round"/>` +
      (fill ? `<path d="${fill}" style="fill:var(--d2)"/><path d="${fill}" fill="url(#g-knit)"/>` : '') +
      (empty ? `<path d="${empty}" fill="none" style="stroke:var(--d1)" stroke-width="1.2" stroke-opacity=".8"/>` : '');
    s += tpath(G.edge(s0 + 1, s0 + 260, top), 'ŠTÚDIUM', { size: sz, w: 700, ls: 2.6 });
    /* the percentage is set upright where the cloth runs right to left (the diagonal), else 66 % would
       read as 99 %; it stays in the same margin, ending where the fill ends */
    const pctO = { size: sz, w: 700, ls: 1, fill: 'var(--d2)' };
    s += G.at(sf).tx < -.05
      ? tpath(G.edge(sf, Math.max(0, sf - 260), -(hb + 7)), `${pct} %`, pctO)
      : tpath(G.edge(Math.max(0, sf - 260), sf, bot), `${pct} %`, Object.assign({ at: '100%', anchor: 'end' }, pctO));
    s += tpath(G.edge(s1 - 260, s1 - 1, top), 'FIIT STU', { size: sz, w: 700, ls: 3, at: '100%', anchor: 'end' });
    return s;
  };

  /* Woven label sewn on the knit: flat, stitched round the edge. */
  const label = (x, y, w, h, lines) =>
    `<g ${FM.T}><rect x="${r2(x - w / 2)}" y="${r2(y - h / 2)}" width="${w}" height="${h}" rx="1.4" style="fill:var(--d1)"/>` +
    `<rect x="${r2(x - w / 2)}" y="${r2(y - h / 2)}" width="${w}" height="${h}" rx="1.4" fill="url(#g-weave)"/></g>` +
    `<rect x="${r2(x - w / 2 + 1.6)}" y="${r2(y - h / 2 + 1.6)}" width="${r2(w - 3.2)}" height="${r2(h - 3.2)}" rx=".8" fill="none" style="stroke:var(--d4)" stroke-width=".5" stroke-dasharray="1.4 1"/>` +
    lines.map(([s, dy, size, f]) => t(s, x, r2(y + dy), { f: f || 's', w: f ? null : 700, size, ls: .5, fill: 'var(--d4)' })).join('');

  const KNIT = 'Merino vlna 100 %, žakárové pletenie, 7 gauge';
  const FI = { band: 105.6, star: 13 * 3.2, glyph: 5 * 3.2 };

  FM.products.push(
    {
      id: 'solo-obrazovka', name: 'Tričko Tyrkysová obrazovka', col: 'solo', cat: 'tricka', type: 'tee', price: 45, sizes: SIZES, edition: 100,
      blurb: 'Cez celú hruď známa obrazovka so systémovou chybou a smutným :(, len v tyrkysovej fakulty, a namiesto počítača na nej spadol semester. 100 kusov, každý číslovaný.',
      spec: ['Česaná bavlna 240 g/m², boxy strih so zníženým ramenom',
        `Veľkoplošná sieťotlač bielou na hrudi, ${cmOf('tee', SCREEN.w)} × ${cmOf('tee', SCREEN.bottom - SCREEN.top)} cm`,
        'Kód zastavenia: SKUSKOVE_OBDOBIE drobným písmom pod textom',
        'Na chrbte pod golierom len CTRL + ALT + DEL'],
      ways: [{ n: 'Tyrkysová 2995', body: C.fiit, v: { d1: '#FFFFFF', d2: '#FFFFFF', d3: '#FFFFFF', d4: C.fiit, cord: '#FFFFFF', trim: C.ink, trim2: '#FFFFFF' } }],
      deco: {
        front: () => screen(),
        back: z => t('CTRL + ALT + DEL', z.nape.x, z.nape.y + 10, { f: 'f', size: 5.4, ls: 1.4 }),
      },
    },
    {
      id: 'solo-krizik', name: 'Sveter Krížik', col: 'solo', cat: 'svetre', type: 'fairisle', price: 119, sizes: SIZES, edition: 40,
      opts: { medallion: ['FIIT', '2003'] },
      blurb: 'Pletený sveter so širokým pásom ornamentu cez hruď a oba rukávy: osemcípe hviezdy, krížiky a vlčie zuby ako z krížikovej výšivky, v strede schované FIIT a 2003. 40 kusov, každý číslovaný.',
      spec: [KNIT,
        `Ornament upletený, nie tlačený: pás ${cmOf('fairisle', FI.band)} cm cez hruď a ramená, úzke pásy nad lemom a manžetami`,
        `Bod mriežky ${cmOf('fairisle', 3.2, 1)} cm, hviezda ${cmOf('fairisle', FI.star)} cm, písmená FIIT a 2003 vysoké ${cmOf('fairisle', FI.glyph)} cm`,
        'Biela a čierna, jeden rad v Pantone 2995, tkaný štítok FIIT STU pri leme'],
      ways: [{ n: 'Čierna', body: C.black, v: { d1: '#F1ECE0', d2: C.fiit, d3: '#F1ECE0', d4: C.black } }],
      deco: {
        front: z => label(z.hipL.x + 2, z.hipL.y - 2, 32, 16, [['FIIT STU', 1.2, 4.6], ['EDÍCIA 40', 5.8, 2.7, 'f']]),
        back: () => '',
      },
    },
    {
      id: 'solo-krizik-ciapka', name: 'Čiapka Krížik', col: 'solo', cat: 'hlava', type: 'fairbeanie', price: 29, sizes: null, edition: 40,
      opts: { pom: true, medallion: ['FIIT', 'STU'] },
      blurb: 'Čiapka k svetru Krížik: ten istý pás hviezd a krížikov dookola ohrnutého lemu, vpredu v ňom FIIT nad STU, navrchu tyrkysový brmbolec. 40 kusov, každý číslovaný.',
      spec: ['Merino vlna 100 %, rebrový úplet 2 × 2, žakárový lem',
        `Ornament upletený dookola lemu, pás ${cmOf('fairbeanie', 101, 1)} cm, písmená FIIT a STU vysoké ${cmOf('fairbeanie', 5 * 3.06, 1)} cm`,
        'Brmbolec v Pantone 2995, priemer 8 cm',
        'Jedna veľkosť, obvod hlavy 54–60 cm'],
      ways: [{ n: 'Čierna', body: C.black, v: { d1: '#F1ECE0', d2: C.fiit, d3: '#F1ECE0', d4: C.black, trim: C.fiit } }],
      deco: { front: () => '' },
    },
    {
      id: 'solo-plosny-spoj', name: 'Bunda Plošný spoj', col: 'solo', cat: 'svetre', type: 'varsityjkt', price: 189, sizes: SIZES, edition: 25, seeded: true,
      opts: { seed: 1 },
      blurb: 'Čierna varsity bunda, na chrbte vyšitý plošný spoj: čip FIIT STU 2003 v strede a od neho tyrkysové cesty k okrajom. Každý z 25 kusov má iné vedenie ciest a svoje číslo.',
      spec: ['Vlnené súkno 70 % vlna, rukávy z čiernej umelej kože, prešívaná podšívka',
        `Retiazková výšivka ciest v Pantone 2995, plôšky a priechody zlatou niťou, plocha ${cmOf('varsityjkt', BOARD.box.x1 - BOARD.box.x0 + 16)} × ${cmOf('varsityjkt', BOARD.box.y1 - BOARD.box.y0 + 16)} cm`,
        `Čip ${cmOf('varsityjkt', BOARD.S)} × ${cmOf('varsityjkt', BOARD.S)} cm s nápisom FIIT STU a 2003, popisy súčiastok (U1, R1, C2…) a číslo kusu ecru`,
        'Na hrudi namiesto písmena malý vyšitý čip 7 × 7 cm, jeho štyri cesty miznú v ramennom švíku'],
      ways: [{ n: 'Čierna', body: C.black, v: { d1: '#E9E4D6', d2: C.fiit, d3: C.gold, d4: '#2C2F34', trim: '#3A3E44', trim2: '#1E1F23' } }],
      deco: {
        front: z => chipSmall(z.chestL.x, z.chestL.y),
        back: (z, p) => pcb((p.opts && p.opts.seed) || 1),
      },
    },
    {
      id: 'solo-nacitavam', name: 'Šál Načítavam', col: 'solo', cat: 'hlava', type: 'scarflay', price: 39, sizes: null, edition: 80, seeded: true,
      opts: { seed: 1 },
      blurb: 'Pletený šál, po ktorého celej dĺžke beží načítavací pruh od slova ŠTÚDIUM po FIIT STU. Každý z 80 kusov sa zastavil na inom percente, prvý na 83 %.',
      spec: ['Merino vlna 100 %, obojstranný žakár, 172 × 24 cm, strapce 7 cm',
        'Pruh 40 dielikov po celej dĺžke, výška 8 cm, tyrkysová Pantone 2995 a ecru',
        'Nápisy ŠTÚDIUM, percento a FIIT STU upletené, výška písma 2 cm',
        'Číslo kusu na tkanom štítku pri strapcoch'],
      ways: [{ n: 'Čierna', body: C.black, v: { d1: '#ECE7DA', d2: C.fiit, d3: '#ECE7DA', d4: C.black } }],
      deco: { front: (z, p) => loading(z, p) },
    }
  );
})();
