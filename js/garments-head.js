/* Head and neck accessories: beanie, cap, scarf, tie.
   Same drawing language as the hoodie: flat technical drawing, 1.5 outline,
   dashed stitching, a few soft creases, ribbing as its own piece.
   Each item picks its own scale (`cm`) so it fills the box. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;
  const r = v => +v.toFixed(2);
  const lerp = (a, b, f) => a + (b - a) * f;
  /* Local clip paths get a per-render id with the garment prefix, so every <svg>
     points at its own <defs> even when an earlier card is hidden or removed. */
  const clip = (prefix, d) => {
    const id = FM.uid(prefix);
    return { id, def: `<clipPath id="${id}"><path d="${d}"/></clipPath>`, url: `url(#${id})` };
  };
  const poly = pts => 'M' + pts.map(p => `${r(p[0])},${r(p[1])}`).join(' L') + ' Z';
  /* Contrast yarn (stripes, pom-pom, two-tone parts): FM.fab without the body's heather melange. */
  const fabT = (d, o = {}) => {
    const ol = o.ol === undefined ? d : o.ol;
    return fab(d, Object.assign({}, o, { grain: false, ol: '' })) + `<path d="${d}" fill="url(#g-noise)" class="nz"/>` + (ol ? `<path d="${ol}" class="ol"/>` : '');
  };

  /* ═══ BEANIE ═════════════════════════════════════════════════════════════
     cm = 19: 21 cm wide, 22 cm tall with the cuff turned up (16 cm fisherman),
     pom-pom 8.5 cm. Stands on the floor, cuff bottom at y 630. */
  const BN = { ys0: 500, yc0: 510, ys1: 618, yc1: 630, xl0: 121, xl1: 119 };
  const bnAt = f => ({ ys: lerp(BN.ys0, BN.ys1, f), yc: lerp(BN.yc0, BN.yc1, f), xl: lerp(BN.xl0, BN.xl1, f) });
  /* One line across the cuff at height f (0 = fold on top, 1 = bottom edge). */
  const bnEdge = (f, back) => {
    const { ys, yc, xl } = bnAt(f), xr = 640 - xl, k = r(ys + (yc - ys) * .8);
    return back
      ? `C${r(xr - 70)},${k} 380,${r(yc)} 320,${r(yc)} C260,${r(yc)} ${r(xl + 70)},${k} ${r(xl)},${r(ys)}`
      : `C${r(xl + 70)},${k} 260,${r(yc)} 320,${r(yc)} C380,${r(yc)} ${r(xr - 70)},${k} ${r(xr)},${r(ys)}`;
  };
  const bnBand = (f0, f1) => {
    const a = bnAt(f0), b = bnAt(f1);
    return `M${r(a.xl)},${r(a.ys)} ${bnEdge(f0)} L${r(640 - b.xl)},${r(b.ys)} ${bnEdge(f1, true)} Z`;
  };
  const BNG = {
    crown: 'M126,522 C123,440 126,364 144,316 C172,242 240,208 320,208 C400,208 468,242 496,316 C514,364 517,440 514,522 Z',
    crownF: 'M126,522 C124,470 129,416 154,380 C190,342 252,332 320,332 C388,332 450,342 486,380 C511,416 516,470 514,522 Z',
  };
  /* Crown shaping: the decreases converge on the top, two soft creases above the cuff. */
  const BN_LINES = {
    reg: { dec: ['M222,236 C250,252 288,258 320,258 C352,258 390,252 418,236', 'M320,212 L320,256'],
      fd: ['M174,488 C182,456 186,424 184,392', 'M244,490 C250,468 252,446 250,424'] },
    fish: { dec: ['M232,348 C262,360 294,364 320,364 C346,364 378,360 408,348', 'M320,334 L320,362'],
      fd: ['M184,494 C192,468 194,444 190,420'] },
  };
  /* Pom-pom: scalloped yarn ball with a few strands. */
  const rng = seed => { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };
  const pom = (cx, cy, rad) => {
    const N = 52, R = rng(5); let d = '';
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const k = i === N ? 1 : .985 + .03 * R();
      const px = cx + rad * k * Math.cos(a), py = cy + rad * k * Math.sin(a);
      if (!i) { d = `M${r(px)},${r(py)}`; continue; }
      const am = ((i - .5) / N) * Math.PI * 2 - Math.PI / 2;
      const b = rad * (1.03 + .06 * R());
      d += ` Q${r(cx + b * Math.cos(am))},${r(cy + b * Math.sin(am))} ${r(px)},${r(py)}`;
    }
    d += ' Z';
    let tufts = '';
    const T = rng(11);
    for (let i = 0; i < 64; i++) {
      const rr = rad * Math.sqrt(T()) * .9, a = T() * Math.PI * 2;
      const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      const dir = a + (T() - .5) * .9, len = 6 + 9 * T() * (.4 + rr / rad);
      const x1 = x + len * Math.cos(dir), y1 = y + len * Math.sin(dir);
      const qx = (x + x1) / 2 + 2.2 * Math.cos(dir + 1.57), qy = (y + y1) / 2 + 2.2 * Math.sin(dir + 1.57);
      const dark = i % 3 !== 0;
      tufts += `<path d="M${r(x)},${r(y)} Q${r(qx)},${r(qy)} ${r(x1)},${r(y1)}" fill="none" stroke="${dark ? 'rgba(0,0,0,.17)' : 'rgba(255,255,255,.2)'}" stroke-width="${dark ? 1.3 : 1.1}" stroke-linecap="round"/>`;
    }
    const gid = FM.uid('beanie-pom');
    return `<defs><radialGradient id="${gid}" cx=".4" cy=".36" r=".72">` +
      '<stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset=".78" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></radialGradient></defs>' +
      fabT(d, { fill: 'var(--trim)', tex: null, ol: '' }) + `<path d="${d}" fill="url(#${gid})"/>` +
      tufts + `<path d="${d}" class="ol"/>`;
  };

  FM.register('beanie', {
    label: 'Čiapka',
    views: ['front'],
    cm: 19,
    shadow: { cx: 320, cy: 647, rx: 214, ry: 14 },
    zones: {
      front: {
        cuff: { x: 320, y: 570, w: 300 },  // centre of the turned-up cuff (cuff spans y 510–630 here)
        cuffL: { x: 434, y: 566, w: 90 },  // wearer's left on the cuff (viewer's right), for a small tab
        crown: { x: 320, y: 450, w: 280 }, // knit crown just above the cuff; inside the shallow fisherman crown too
      },
    },
    /* opts: pom (bool), stripes 0|1|2 (cuff bands in --trim / --trim2), fisherman (bool) */
    draw(view, o, deco) {
      const fish = !!o.fisherman, L = fish ? BN_LINES.fish : BN_LINES.reg;
      let s = fab(fish ? BNG.crownF : BNG.crown, { tex: 'rib' });
      L.dec.forEach(d => { s += `<path d="${d}" class="ol thin" style="opacity:.45"/>`; });
      L.fd.forEach(d => { s += `<path d="${d}" class="fd"/><path d="${mir(d)}" class="fd"/>`; });
      if (o.pom) s += pom(320, fish ? 316 : 190, 80);
      const cuff = bnBand(0, 1);
      s += fab(cuff, { rib: true });
      const n = +o.stripes || 0;
      const bands = n === 1 ? [[.41, .59, 'var(--trim)']]
        : n >= 2 ? [[.12, .26, 'var(--trim2)'], [.74, .88, 'var(--trim)']] : [];
      bands.forEach(([a, b, c]) => { s += fabT(bnBand(a, b), { fill: c, tex: 'rib', ol: '' }); });
      const f7 = bnAt(.075);
      s += `<path d="${bnBand(0, .06)}" fill="rgba(255,255,255,.07)"/>` +
        `<path d="M${r(f7.xl)},${r(f7.ys)} ${bnEdge(.075)}" class="fd" style="stroke-width:1.6"/>` +
        `<path d="${cuff}" class="ol"/>`;
      return s + (deco || '');
    },
  });

  /* ═══ CAP ════════════════════════════════════════════════════════════════
     cm = 22: crown 19 cm across and 11 cm high, visor 7 cm deep. Built on a small
     3D model (half-ellipsoid crown on a head-sized base ring, seen from 20° above)
     so seams, eyelets, visor and strap opening line up. `phi` is the angle from the
     centre of the side facing us. The front view rests on the visor tip, the back
     view on its base ring, so the back model sits 70 units lower. */
  const RAD = Math.PI / 180;
  const CA = { a: 209, b: 231, H: 240, se: Math.sin(20 * RAD), ce: Math.cos(20 * RAD) };
  CA.ry = Math.hypot(CA.b * CA.se, CA.H * CA.ce);
  const CAP_CY = { front: 470, back: 540 };
  const capXYZ = (phi, t) => {
    const s = Math.cos(t * Math.PI / 2);
    return [CA.a * s * Math.sin(phi * RAD), CA.b * s * Math.cos(phi * RAD), CA.H * Math.sin(t * Math.PI / 2)];
  };
  const capSeen = (phi, t) => { const [, Y, Z] = capXYZ(phi, t); return Y * CA.ce / (CA.b * CA.b) + Z * CA.se / (CA.H * CA.H) > 0; };
  const tAtZ = z => Math.asin(Math.min(1, z / CA.H)) / (Math.PI / 2);
  const line = pts => (pts.length < 2 ? '' : 'M' + pts.map(q => `${r(q[0])},${r(q[1])}`).join(' L'));
  /* Visor outline in plan (right half, from the corner on the seam to the centre front):
     the bill flares out past the seam, then sweeps round to 7 cm in front of the crown. */
  const VB = [[196.4, 79], [222, 125], [176, 380], [0, 380]];
  const bez = (P, u) => {
    const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
  };

  const capGeo = cy => {
    const proj = (X, Y, Z) => [320 + X, cy + Y * CA.se - Z * CA.ce];
    const P = (phi, t) => proj(...capXYZ(phi, t));
    const merid = (phi, t0, t1) => {
      const p = [];
      for (let i = 0; i <= 30; i++) { const t = lerp(t0, t1, i / 30); if (capSeen(phi, t)) p.push(P(phi, t)); }
      return line(p);
    };
    const ring = (z, p0, p1, n = 24) => { const t = tAtZ(z), p = []; for (let i = 0; i <= n; i++) p.push(P(lerp(p0, p1, i / n), t)); return p; };
    /* psi 0 → 180 runs along the visor from the viewer's right corner to the left one;
       t = 0 is the outer edge, t = 1 the seam on the crown. The bill dips 10° and curves down at the sides. */
    const visorP = (psi, t) => {
      const u = psi <= 90 ? psi / 90 : (180 - psi) / 90, sg = psi <= 90 ? 1 : -1;
      const [bx, Yo] = bez(VB, u), Xo = bx * sg, fwd = Yo - 79;
      const Zo = -fwd * .07 - 26 * (bx / 200) ** 2 * Math.min(1, fwd / 110);
      const [Xi, Yi] = capXYZ(70 - psi * 140 / 180, 0);
      return proj(lerp(Xo, Xi, t), lerp(Yo, Yi, t), lerp(Zo, 0, t));
    };
    const visorRow = t => { const p = []; for (let i = 0; i <= 72; i++) p.push(visorP(i * 2.5, t)); return p; };
    const openArc = (w, h) => { const p = []; for (let i = 0; i <= 30; i++) { const s = Math.PI * i / 30; p.push(P(-w * Math.cos(s), tAtZ(h * Math.sin(s)))); } return p; };
    const g = { P, ring, merid, apex: r(cy - CA.H * CA.ce) };
    g.strap = (p0, p1, z0, z1) => line(ring(z1, p0, p1, 8).concat(ring(z0, p1, p0, 8))) + ' Z';
    g.crown = `M${320 - CA.a},${cy} A${CA.a},${r(CA.ry)} 0 0 1 ${320 + CA.a},${cy} A${CA.a},${r(CA.b * CA.se)} 0 0 1 ${320 - CA.a},${cy} Z`;
    const vo = visorRow(0), vi = visorRow(1);
    g.visor = line(vo.concat(vi.slice().reverse())) + ' Z';
    g.visorEdge = line(vo.concat(vo.slice().reverse().map(q => [q[0], q[1] + 4.5]))) + ' Z';
    g.visorRows = [.05, .1, .15, .2, .25, .3].map(t => line(visorRow(t)));
    g.visorSeam = line(visorRow(.94));
    g.openRim = line(openArc(30, 84));
    g.opening = line(openArc(30, 84).concat(ring(0, 30, -30, 16).slice(1))) + ' Z';
    g.openSt = line(openArc(34, 93));
    g.sweat = line(ring(14, -29, 29, 16));
    const A = g.apex;
    g.button = `M307,${A + 1} C307,${A - 8} 313,${A - 12} 320,${A - 12} C327,${A - 12} 333,${A - 8} 333,${A + 1} C329,${A + 5} 311,${A + 5} 307,${A + 1} Z`;
    // seams and topstitching: front/side panels at ±60, side/back at ±120, back centre at 180 (top only)
    g.seams = [60, -60, 120, -120, 180].map(p => merid(p, 0, .955));
    g.seamSt = [57.4, 62.6, -57.4, -62.6, 117.6, 122.4, -117.6, -122.4, 177.6, -177.6].map(p => merid(p, 0, .9));
    g.folds = [merid(80, .05, .3), merid(-80, .05, .3), merid(36, .03, .2), merid(-36, .03, .2)];
    const eyelet = (phi, t) => {
      const [x, y] = P(phi, t), k = Math.max(.25, Math.cos(phi * RAD));
      return `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(5.2 * (.35 + .65 * k))}" ry="4.4" class="ey"/>` +
        `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(2.3 * (.35 + .65 * k))}" ry="2" style="fill:var(--line)"/>`;
    };
    g.eyelets = eyelet(30, .6) + eyelet(-30, .6) + eyelet(90, .6) + eyelet(-90, .6);
    return g;
  };
  const CAPG = { front: capGeo(CAP_CY.front), back: capGeo(CAP_CY.back) };
  const BRASS = '#B5A273', BRASS_HI = '#E2D6AD';

  FM.register('cap', {
    label: 'Šiltovka',
    views: ['front', 'back'],
    cm: 22,
    shadow: { cx: 320, cy: 640, rx: 226, ry: 14 },
    zones: {
      front: {
        face: { x: 320, y: 410, w: 220 },  // centre of the two front panels (centre seam runs y 244–549)
        visor: { x: 320, y: 584, w: 260 }, // middle of the visor top
        panelL: { x: 396, y: 392, w: 70 }, // wearer's left front panel (viewer's right), clear of the centre seam
      },
      back: {
        arch: { x: 320, y: 496, w: 130 },  // panel area above the strap opening (opening top y 535)
        strap: { x: 372, y: 594, w: 50 },  // right part of the strap, between the buckle and the opening edge
      },
    },
    /* opts: twotone (bool) → visor and top button in --trim */
    draw(view, o, deco) {
      const front = view === 'front', g = CAPG[front ? 'front' : 'back'], tt = o.twotone ? { fill: 'var(--trim)' } : {};
      let s = fab(g.crown, { tex: 'weave' });
      g.folds.forEach(d => { s += `<path d="${d}" class="fd"/>`; });
      s += g.seams.map(d => `<path d="${d}" class="ol thin"/>`).join('') + g.seamSt.map(d => `<path d="${d}" class="st"/>`).join('');
      if (front) {
        s += `<path d="${g.merid(0, 0, .955)}" class="ol thin"/><path d="${g.merid(2.6, 0, .9)}" class="st"/><path d="${g.merid(-2.6, 0, .9)}" class="st"/>`;
        s += g.eyelets;
        s += (o.twotone ? fabT : fab)(g.visorEdge, Object.assign({ tex: null }, tt)) + `<path d="${g.visorEdge}" fill="rgba(0,0,0,.28)"/>`;
        s += (o.twotone ? fabT : fab)(g.visor, Object.assign({ tex: 'weave' }, tt));
        s += g.visorRows.map(d => `<path d="${d}" class="st"/>`).join('') + `<path d="${g.visorSeam}" class="fd" style="stroke-width:1.8"/>`;
        s += deco || '';
      } else {
        const t0 = tAtZ(84);
        s += `<path d="${g.merid(0, t0, .955)}" class="ol thin"/><path d="${g.merid(2.6, t0 + .02, .9)}" class="st"/><path d="${g.merid(-2.6, t0 + .02, .9)}" class="st"/>`;
        s += g.eyelets + `<path d="${line(g.ring(12, -90, 90, 40))}" class="st"/>`;
        // strap opening: inside of the front panels, sweatband at the bottom
        s += fab(g.opening, { fill: 'var(--rib)', shade: false }) +
          `<path d="${g.opening}" fill="url(#g-lin)" style="opacity:.9"/><path d="${g.sweat}" class="st"/>`;
        // strap: left part ends in the buckle, right part runs through it, its tail lies on top
        s += fab(g.strap(-31, -9, 6, 42), { tex: 'weave' }) + fab(g.strap(-5, 31, 6, 42), { tex: 'weave' }) +
          `<path d="${line(g.ring(10, -31, -9, 6))}" class="st"/><path d="${line(g.ring(38, -31, -9, 6))}" class="st"/>` +
          `<path d="${line(g.ring(10, -5, 31, 10))}" class="st"/><path d="${line(g.ring(38, -5, 31, 10))}" class="st"/>`;
        s += `<path d="${g.openRim}" class="bd-o" style="stroke-width:9"/><path d="${g.openRim}" class="bd" style="stroke-width:6.5"/>` +
          `<path d="${g.openRim}" class="bd-s" style="stroke-width:6.5"/><path d="${g.openSt}" class="st"/>`;
        s += deco || '';
        const [bx, by] = g.P(-7, tAtZ(24)), [tx, ty] = g.P(-26.5, tAtZ(24));
        s += fab(g.strap(-25, -7, 10, 38), { tex: 'weave' }) +
          `<path d="${line(g.ring(13.5, -25, -7, 6))}" class="st"/><path d="${line(g.ring(34.5, -25, -7, 6))}" class="st"/>` +
          `<rect x="${r(tx - 6)}" y="${r(ty - 13)}" width="12" height="26" rx="2.6" fill="${BRASS}" stroke="var(--line)" stroke-width=".9"/>` +
          `<rect x="${r(tx - 3.6)}" y="${r(ty - 10)}" width="2" height="20" rx="1" fill="${BRASS_HI}" opacity=".7"/>` +
          `<rect x="${r(bx - 8.5)}" y="${r(by - 24)}" width="17" height="48" rx="3" fill="none" stroke="${BRASS}" stroke-width="4.2"/>` +
          `<rect x="${r(bx - 10.6)}" y="${r(by - 26.1)}" width="21.2" height="52.2" rx="4.4" fill="none" stroke="var(--line)" stroke-width=".8"/>` +
          `<rect x="${r(bx - 6.4)}" y="${r(by - 21.9)}" width="12.8" height="43.8" rx="1.8" fill="none" stroke="var(--line)" stroke-width=".8"/>` +
          `<path d="M${r(bx - 9.4)},${r(by - 20)} L${r(bx - 9.4)},${r(by + 20)}" stroke="${BRASS_HI}" stroke-width="1" opacity=".7"/>`;
      }
      const A = g.apex;
      s += (o.twotone ? fabT : fab)(g.button, Object.assign({ tex: null }, tt)) +
        `<path d="M311,${A - 6} C315,${A - 9} 325,${A - 9} 329,${A - 6}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2" stroke-linecap="round"/>`;
      return s;
    },
  });

  /* ═══ SCARF ══════════════════════════════════════════════════════════════
     cm = 6.5: 26 cm wide, about 175 cm long, fringe 7 cm. Hangs folded once
     around a ghost neck: the loop behind the neck shows on top and runs into the
     outer edges of the tails; each tail folds over the shoulder (slanted top edge)
     and both hang side by side, the right one in front and 8.5 cm shorter. */
  const SC = {
    W: 170, xL: 152, xR: 318, botL: 584, botR: 528, fr: 46, leg: 340,
    arch: { cx: 320, cy: 238, ox: 168, oy: 178, ix: 62, iy: 96 },
  };
  SC.topL = 'C196,250 266,272 322,292';                 // fold over the left shoulder
  SC.tailL = `M${SC.xL},${SC.botL} L${SC.xL},238 ${SC.topL} L322,${SC.botL} Z`;
  SC.tailR = `M488,${SC.botR} L488,238 C444,250 374,272 318,292 L318,${SC.botR} Z`;
  /* Band of the loop between fractions f0..f1 of its width (0 = inner edge), legs running down behind the tails. */
  const scArc = (f0, f1) => {
    const A = SC.arch, ax = f => lerp(A.ix, A.ox, f), ay = f => lerp(A.iy, A.oy, f);
    const x0 = r(ax(f0)), y0 = r(ay(f0)), x1 = r(ax(f1)), y1 = r(ay(f1)), L = SC.leg;
    return `M${r(A.cx - x0)},${L} L${r(A.cx - x0)},${A.cy} A${x0},${y0} 0 0 1 ${r(A.cx + x0)},${A.cy} L${r(A.cx + x0)},${L} ` +
      `L${r(A.cx + x1)},${L} L${r(A.cx + x1)},${A.cy} A${x1},${y1} 0 0 0 ${r(A.cx - x1)},${A.cy} L${r(A.cx - x1)},${L} Z`;
  };
  const scSector = (a0, a1) => { // crosswise block on the loop, angles in degrees (180 = left end, 270 = top)
    const A = SC.arch, P = (rx, ry, a) => [A.cx + rx * Math.cos(a * Math.PI / 180), A.cy + ry * Math.sin(a * Math.PI / 180)];
    const o0 = P(A.ox, A.oy, a0), o1 = P(A.ox, A.oy, a1), i1 = P(A.ix, A.iy, a1), i0 = P(A.ix, A.iy, a0);
    return `M${r(o0[0])},${r(o0[1])} A${A.ox},${A.oy} 0 0 1 ${r(o1[0])},${r(o1[1])} L${r(i1[0])},${r(i1[1])} A${A.ix},${A.iy} 0 0 0 ${r(i0[0])},${r(i0[1])} Z`;
  };
  /* Lengthwise college stripes as fractions of the width (symmetric). */
  const COLLEGE = [[.17, .205, 'var(--trim2)'], [.205, .315, 'var(--trim)'], [.315, .35, 'var(--trim2)'],
    [.65, .685, 'var(--trim2)'], [.685, .795, 'var(--trim)'], [.795, .83, 'var(--trim2)']];
  const BLOCK = 78; // 12 cm crosswise blocks, counted from each end
  const scColAt = (stripes, f) => {
    if (stripes !== 'college') return null;
    const hit = COLLEGE.find(c => f >= c[0] && f < c[1]);
    return hit ? hit[2] : null;
  };
  const fringe = (x0, bot, stripes, seed) => {
    let out = '', inn = '';
    const n = 28, step = SC.W / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + step * (i + .5), len = SC.fr + 3.2 * Math.sin(i * 1.7 + seed) + 1.6 * Math.cos(i * 3.1);
      const sway = 1.6 * Math.sin(i * 2.3 + seed);
      const d = `M${r(x)},${bot - 2} C${r(x + .3)},${r(bot + len * .35)} ${r(x + sway * .5)},${r(bot + len * .7)} ${r(x + sway)},${r(bot + len)}`;
      const col = scColAt(stripes, (i + .5) / n) || 'var(--body)';
      out += `<path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="4" stroke-linecap="round"/>`;
      inn += `<path d="${d}" fill="none" style="stroke:${col}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    return out + inn + `<path d="M${x0 + 2},${bot + 5} L${x0 + SC.W - 2},${bot + 5}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2.4"/>`;
  };
  const SC_FOLD = 'M156,257 C200,266 264,286 312,304';    // crease under the shoulder fold, left tail

  FM.register('scarf', {
    label: 'Šál',
    views: ['front'],
    cm: 6.5,
    shadow: false,
    zones: {
      front: {
        endL: { x: 237, y: 532, w: 136 }, // near the bottom of the long (left) tail, above the fringe (tail ends y 584)
        endR: { x: 403, y: 476, w: 136 }, // near the bottom of the short (right, front) tail (tail ends y 528)
        mid: { x: 320, y: 88, w: 60 },    // middle of the scarf: the loop behind the neck, top centre
      },
    },
    /* opts: stripes 'college' (lengthwise: body, --trim, --trim2) | 'block' (crosswise
       body / --trim, 12 cm) | 'plain';  tex 'weave' | 'knit' (default: knit for block) */
    draw(view, o, deco) {
      const st = o.stripes || 'plain', tex = o.tex || (st === 'block' ? 'knit' : 'weave');
      const A = SC.arch, cL = clip('scarf-l', SC.tailL), cR = clip('scarf-r', SC.tailR);
      let s = `<defs>${cL.def}${cR.def}</defs>`;
      // the loop behind the neck (its inner face, in shadow)
      const loop = scArc(0, 1);
      s += fab(loop, { tex });
      if (st === 'college') COLLEGE.forEach(([a, b, c]) => { s += fabT(scArc(a, b), { fill: c, tex, ol: '' }); });
      if (st === 'block') [[214, 250], [290, 326]].forEach(([a, b]) => { s += fabT(scSector(a, b), { fill: 'var(--trim)', tex, ol: '' }); });
      s += `<path d="${loop}" fill="url(#g-lin)" style="opacity:.6"/><path d="${loop}" class="ol"/>`;
      s += `<path d="M${A.cx - 112},${A.cy - 104} C${A.cx - 76},${A.cy - 158} ${A.cx + 76},${A.cy - 158} ${A.cx + 112},${A.cy - 104}" class="fd"/>`;
      // tails: left (long) behind, right (short) in front
      const tail = (d, cp, x0, bot) => {
        let t = fab(d, { tex }), g = '';
        if (st === 'college') COLLEGE.forEach(([a, b, c]) => { g += fabT(poly([[x0 + a * SC.W, 200], [x0 + b * SC.W, 200], [x0 + b * SC.W, bot + 2], [x0 + a * SC.W, bot + 2]]), { fill: c, tex, ol: '' }); });
        if (st === 'block') for (let k = 1; bot - k * BLOCK > 200; k += 2) {
          g += fabT(poly([[x0 - 2, bot - (k + 1) * BLOCK], [x0 + SC.W + 2, bot - (k + 1) * BLOCK], [x0 + SC.W + 2, bot - k * BLOCK], [x0 - 2, bot - k * BLOCK]]), { fill: 'var(--trim)', tex, ol: '' });
        }
        if (g) t += `<g clip-path="${cp.url}">${g}</g>`;
        return t;
      };
      s += fringe(SC.xL, SC.botL, st, 0) + tail(SC.tailL, cL, SC.xL, SC.botL);
      s += `<path d="M154,240 ${SC.topL.replace('322,292', '320,291')}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3"/>` +
        `<path d="${SC_FOLD}" class="fd"/><path d="M214,350 C218,410 218,470 214,530" class="fd"/>` +
        `<path d="${SC.tailL}" class="ol"/>`;
      s += fringe(SC.xR, SC.botR, st, 2) + tail(SC.tailR, cR, SC.xR, SC.botR);
      s += `<path d="M486,240 C442,252 376,274 320,293" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3"/>` +
        `<path d="${mir(SC_FOLD)}" class="fd"/><path d="M438,340 C434,390 434,430 438,470" class="fd"/>` +
        `<path d="M318,296 L318,${SC.botR}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="5"/>` +
        `<path d="${SC.tailR}" class="ol"/>`;
      return s + (deco || '');
    },
  });

  /* ═══ TIE ════════════════════════════════════════════════════════════════
     cm = 10: blade 8.5 cm at its widest, 43 cm from the knot to the tip,
     knotted (four-in-hand) on a ghost collar, the narrow tail peeking out left. */
  const TI = {
    loop: 'M292,152 C262,128 240,104 242,84 C245,61 284,52 320,52 C356,52 395,61 398,84 C400,104 378,128 348,152 L330,149 C356,128 380,106 378,89 C375,71 350,66 320,66 C290,66 265,71 262,89 C260,106 284,128 310,149 Z',
    knot: 'M289,150 C300,142 340,142 351,150 C353,166 344,186 334,199 C326,204 314,204 306,199 C296,186 287,166 289,150 Z',
    blade: 'M304,195 L336,195 L362,588 L320,630 L278,588 Z',
    tail: 'M306,195 L330,195 L316,524 L294,546 L272,524 Z',
  };
  /* Club stripes, one group per 62 units: thin --trim, wider --trim2, thin --trim.
     The phase leaves a clean gap centred on the `crest` and `tip` zones. */
  const TP = 62, TPH = 31, TGROUP = [[0, 4, 'var(--trim)'], [8, 16, 'var(--trim2)'], [20, 24, 'var(--trim)']];
  const stripesUp = (xa, xb, ya, yb, ph) => { // "/" : x + y = c
    let s = [];
    for (let c = Math.floor((xa + ya - ph) / TP) * TP + ph - TP; c < xb + yb; c += TP) {
      TGROUP.forEach(([a, b, col]) => s.push([poly([[xa, c + a - xa], [xb, c + a - xb], [xb, c + b - xb], [xa, c + b - xa]]), col]));
    }
    return s;
  };
  const stripesDown = (xa, xb, ya, yb, ph) => { // "\" : y - x = c
    let s = [];
    for (let c = Math.floor((ya - xb - ph) / TP) * TP + ph - TP; c < yb - xa; c += TP) {
      TGROUP.forEach(([a, b, col]) => s.push([poly([[xa, xa + c + a], [xb, xb + c + a], [xb, xb + c + b], [xa, xa + c + b]]), col]));
    }
    return s;
  };

  FM.register('tie', {
    label: 'Kravata',
    views: ['front'],
    cm: 10,
    shadow: false,
    zones: {
      front: {
        blade: { x: 320, y: 412, w: 86, top: 140, bottom: 630 }, // blade (starts y 195 under the knot); a pattern fill may cover x ± w/2, top–bottom: deco is clipped to the blade and, again, to the knot
        crest: { x: 320, y: 250, w: 36 },  // on the blade just under the knot, between two stripe groups
        tip: { x: 320, y: 560, w: 80 },    // near the widest point above the tip, between two stripe groups
        knot: { x: 320, y: 172, w: 50 },   // centre of the knot
      },
    },
    /* opts: pattern 'stripe' (diagonal club stripes in --trim / --trim2) | 'dots' (the repeat comes
       through deco, clipped to the blade and the knot) | 'plain' */
    draw(view, o, deco) {
      const pat = o.pattern || 'plain';
      const cB = clip('tie-blade', TI.blade), cT = clip('tie-tail', TI.tail), cK = clip('tie-knot', TI.knot), cL = clip('tie-loop', TI.loop);
      let s = `<defs>${cB.def}${cT.def}${cK.def}${cL.def}</defs>`;
      const striped = (d, cp, list) => {
        let t = fab(d, { tex: 'weave' });
        if (pat === 'stripe') t += `<g clip-path="${cp.url}">${list.map(([p, col]) => fabT(p, { fill: col, tex: 'weave', ol: '' })).join('')}</g><path d="${d}" class="ol"/>`;
        return t;
      };
      // neck loop on the ghost collar: the back of it shows its inner face
      s += striped(TI.loop, cL, stripesDown(236, 404, 44, 158, 20)) + `<path d="${TI.loop}" fill="url(#g-lin)" style="opacity:.45"/><path d="${TI.loop}" class="ol"/>`;
      // narrow tail behind the blade
      s += striped(TI.tail, cT, stripesUp(268, 334, 190, 550, TPH + 14));
      s += '<path d="M280,470 C278,490 276,506 275,520" class="fd" style="stroke-width:1.6"/>';
      // blade
      s += striped(TI.blade, cB, stripesUp(274, 366, 190, 634, TPH));
      s += '<path d="M314,206 C316,222 318,236 320,252" class="fd"/><path d="M334,300 C338,380 342,460 344,540" class="fd"/>' +
        '<path d="M300,330 C298,390 296,450 294,500" class="fd" style="stroke-width:2"/>';
      s += '<path d="M305,199 C314,204 326,204 335,199 L337,207 C327,212 313,212 303,207 Z" fill="rgba(0,0,0,.2)"/>';
      if (deco) s += `<g clip-path="${cB.url}">${deco}</g>`;
      // knot on top
      s += striped(TI.knot, cK, stripesDown(286, 354, 140, 206, 9));
      if (deco) s += `<g clip-path="${cK.url}">${deco}</g>`; // a pattern repeat continues on the knot
      s += '<path d="M292,160 C306,168 324,182 335,198" class="ol thin"/><path d="M296,151 C312,148 330,148 346,153" class="fd" style="stroke-width:1.8"/>' +
        '<path d="M343,162 C340,176 336,186 331,195" class="fd" style="stroke-width:2"/>';
      return s;
    },
  });
})();
