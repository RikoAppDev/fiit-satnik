/* Šatník FIIT STU — the proposed coat of arms (erb) of the faculty. A proposal of this
   project, not an official symbol. Loaded right after core.js.

   FM.art.crest(cx, cy, h, o) draws the achievement centred on (cx, cy) (centre of its
   bounding box), h tall: a heater shield (7 : 8) and under it a ribbon with the motto.
     o.v       'A' | 'B' | 'C'  the proposal (default FM.CREST)
                 A  Kniha a páska  Azure, an open book argent edged or; on a chief argent
                                   eleven billets, the ones sable, the noughts voided sable
                                   (11111010011 = 2003, the tape of the seal)
                 B  Krokva         Azure, a chevron argent (also a capital Λ) between in chief
                                   two billets or, the first solid, the second voided (1, 0),
                                   and in base an open book or
                 C  Kľúč           Per pale azure and sable, a key palewise argent, the bow a
                                   plain ring, the wards upward and cut 11111010011 as notches
     o.ribbon  false → shield only; h is then the height of the shield
     o.mono    CSS colour → one-colour line version for tonal embroidery, engraving and foil:
               outlines and heraldic hatching (azure = horizontal lines, sable = cross-
               hatching, metals blank), solid fill only for the "1" billets
     o.hatch   mono only: true / false forces the hatching on or off. By default it is left
               out below about 65 units (58 for the shield alone), where it would print
               as a grey smudge; small crests keep their outlines only
     o.patch   CSS colour → backing cut round the achievement, as on a woven badge
     o.fx      'E' | 'S' | 'T'  embroidery, light embroidery, patch lift (FM.E / FM.S / FM.T)
   FM.art.crestW(h, o) → the width for a given height (same o).

   The tinctures are fixed, a coat of arms keeps its colours on any cloth. They are CSS
   variables so a page can retune them: --cr-az azure (FIIT 2995), --cr-sa sable,
   --cr-ar argent, --cr-or or. The shield has a gold rim with a sable keyline inside and
   out, so it stands on black, turquoise and white cloth alike.
   Everything is drawn in one local space (shield 140 × 160, top centre at 0,0) and scaled,
   so every line weight is a fixed share of the shield and nothing turns into a hairline. */
(function () {
  'use strict';
  const FM = window.FM, A = FM.art;
  /* The proposal used on the products. B: the classic collegiate scheme, the boldest at
     3 cm, and the clearest in one colour. Change this one letter to switch every product. */
  FM.CREST = FM.CREST || 'B';

  const TC = { az: 'var(--cr-az, #00A9E0)', sa: 'var(--cr-sa, #18191C)', ar: 'var(--cr-ar, #F4F1E8)', or: 'var(--cr-or, #C9A54E)' };
  const f = v => +(+v).toFixed(2);
  const P = p => `${f(p[0])},${f(p[1])}`;
  const poly = pts => 'M' + pts.map(P).join(' L') + ' Z';
  const rect = (x, y, w, h, fill) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" style="fill:${fill}"/>`;

  /* ── line weights (local units; the shield is 140 wide) ── */
  const RIM = 6.4;            // gold rim, centred on the shield line
  const KL = 1.4;             // sable keyline round every tincture
  const IN = RIM / 2 + KL;    // outer edge of the rim, and inner edge of its keyline
  const ML = 1.7;             // mono outline
  const HS = 5.6, HL = 1.25;  // mono hatching: pitch and line

  /* ── the shield: heater, 140 × 160, straight sides to y 62, then a curve to the point.
     shieldD(i) is the same outline moved inwards by i (outwards for i < 0), built by
     offsetting the control polygon (Tiller–Hanson), so rims and hatching stay parallel. */
  const HW = 70, SY = 62;
  const CURVE = [[70, 62], [70, 115], [37, 141], [0, 160]];
  const off = (p, d, i) => { const l = Math.hypot(d[0], d[1]); return [[p[0] - d[1] / l * i, p[1] + d[0] / l * i], d]; };
  const meet = ([p, d], [q, e]) => {
    const den = d[0] * e[1] - d[1] * e[0], t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den;
    return [p[0] + t * d[0], p[1] + t * d[1]];
  };
  const shieldPts = i => {
    const [, p1, p2, p3] = CURVE;
    const l12 = off(p1, [p2[0] - p1[0], p2[1] - p1[1]], i), l23 = off(p2, [p3[0] - p2[0], p3[1] - p2[1]], i);
    return [[HW - i, SY], meet([[HW - i, 0], [0, 1]], l12), meet(l12, l23), meet(l23, [[0, 0], [0, 1]])];
  };
  const shieldD = (i = 0) => {
    const [a, b, c, d] = shieldPts(i), m = p => [-p[0], p[1]];
    return `M${f(i - HW)},${f(i)} L${f(HW - i)},${f(i)} L${P(a)} C${P(b)} ${P(c)} ${P(d)} C${P(m(c))} ${P(m(b))} ${P(m(a))} Z`;
  };
  const S0 = shieldD(0);
  const TIP = shieldPts(-IN)[3][1];   // lowest point of the rim

  /* ── the ribbon: a band bent on a circle (concentric edges, so the motto sits evenly),
     radial ends, and behind each end a lower tail with a swallowtail and a fold that shows
     the reverse (azure). */
  const RB = (() => {
    const yU = 169, hb = 22, E = 62, rise = 12;               // top edge: centre y, half chord, rise of the ends
    const R = (E * E + rise * rise) / (2 * rise), yc = yU - R, phi = Math.asin(E / R);
    const s = Math.sin(phi), c = Math.cos(phi), R2 = R + hb;
    const at = (r, sg) => [sg * r * s, yc + r * c];
    const band = `M${P(at(R, -1))} A${f(R)},${f(R)} 0 0 0 ${P(at(R, 1))} L${P(at(R2, 1))} A${f(R2)},${f(R2)} 0 0 1 ${P(at(R2, -1))} Z`;
    const o = at(R, 1);                                          // end frame: u along the band, v across it
    const fr = (sg, u, v) => [sg * (o[0] + u * c + v * s), o[1] - u * s + v * c];
    const a = 9, d = 8, L = 19, nd = 7.5;                        // fold width, tail drop, tail length, notch
    const tail = sg => [[0, d], [L, d], [L - nd, d + hb / 2], [L, d + hb], [0, d + hb]].map(([u, v]) => fr(sg, u, v));
    const fold = sg => [[-a, hb], [0, hb], [0, hb + d]].map(([u, v]) => fr(sg, u, v));
    const fs = 13, ls = .35, Rt = R + hb / 2 + .35 * fs;        // baseline: band middle + half the cap height
    const text = `M${P(at(Rt, -1))} A${f(Rt)},${f(Rt)} 0 0 0 ${P(at(Rt, 1))}`;
    const pts = [...tail(1), at(R2, 1), [0, yc + R2]];
    return {
      band, text, fs, ls, tails: [poly(tail(-1)), poly(tail(1))], folds: [poly(fold(-1)), poly(fold(1))],
      half: Math.max(...pts.map(p => Math.abs(p[0]))) + KL / 2, bottom: Math.max(...pts.map(p => p[1])) + KL / 2,
    };
  })();

  /* ── charges ── */
  /* open book in its own 100-wide space: boards (cover) behind, two pages, three lines a page.
     Same silhouette family as FM.art.book on the seal. */
  const BK = {
    cover: 'M-46,-11 L-50,-10 L-50,24 C-34,19 -12,20 0,30 C12,20 34,19 50,24 L50,-10 L46,-11 Z',
    pageL: 'M0,-13 C-10,-23 -30,-25 -46,-19 L-46,19 C-30,14 -10,15 0,25 Z',
    pageR: 'M0,-13 C10,-23 30,-25 46,-19 L46,19 C30,14 10,15 0,25 Z',
    lines: [0, 9, 18].map(y => `M-39,${y - 12} C-29,${y - 16} -16,${y - 15} -7,${y - 9} M39,${y - 12} C29,${y - 16} 16,${y - 15} 7,${y - 9}`).join(' '),
  };
  const bookG = (b, s) => `<g transform="translate(${f(b.x)},${f(b.y)}) scale(${f(b.w / 100)})">${s}</g>`;
  const book = (b, page, cover, line) => {
    const k = b.w / 100;
    return bookG(b, `<g style="stroke:${TC.sa}" stroke-width="${f(KL / k)}" stroke-linejoin="round">` +
      `<path d="${BK.cover}" style="fill:${cover}"/><path d="${BK.pageL}" style="fill:${page}"/><path d="${BK.pageR}" style="fill:${page}"/></g>` +
      `<path d="${BK.lines}" fill="none" style="stroke:${line}" stroke-width="2.6" stroke-linecap="round"/>`);
  };
  const bookMono = (b, m) => {
    const k = b.w / 100;
    return bookG(b, `<g fill="none" style="stroke:${m}" stroke-width="${f(ML / k)}" stroke-linejoin="round">` +
      `<path d="${BK.cover}"/><path d="${BK.pageL}"/><path d="${BK.pageR}"/></g>` +
      `<path d="${BK.lines}" fill="none" style="stroke:${m}" stroke-width="${f(ML * .9 / k)}" stroke-linecap="round"/>`);
  };
  const bookSil = b => bookG(b, `<path d="${BK.cover}"/><path d="${BK.pageL}"/><path d="${BK.pageR}"/>`);

  /* billet: '1' solid, '0' voided (a frame). keyline optional */
  const billet = (x, y, w, h, bit, ink, fw, key) => {
    const st = key ? `;stroke:${TC.sa};stroke-width:${KL}` : '';
    if (bit === '1') return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" style="fill:${ink}${st}"/>`;
    return `<path d="M${f(x)},${f(y)} h${f(w)} v${f(h)} h${f(-w)} Z M${f(x + fw)},${f(y + fw)} v${f(h - 2 * fw)} h${f(w - 2 * fw)} v${f(2 * fw - h)} Z" fill-rule="evenodd" style="fill:${ink}${st}"/>`;
  };

  /* A — chief with the tape, book in the field */
  const GA = { chief: 33, bw: 7.8, bh: 10.5, gap: 2.9, by: 13, fw: 2.2, book: { x: 0, y: 91, w: 92 } };
  const tapeA = ink => {
    const x0 = -(11 * GA.bw + 10 * GA.gap) / 2;
    return [...A.BITS].map((b, i) => billet(x0 + i * (GA.bw + GA.gap), GA.by, GA.bw, GA.bh, b, ink, GA.fw)).join('');
  };

  /* B — chevron, two billets, book in base */
  const GB = { apex: 31, ang: 42, band: 24, bw: 15, bh: 26, bx: 40, by: 32, book: { x: 0, y: 110, w: 62 } };
  const chevD = (() => {
    const t = Math.tan(GB.ang * Math.PI / 180), lo = GB.apex + GB.band / Math.cos(GB.ang * Math.PI / 180), X = 110;
    return poly([[-X, GB.apex + X * t], [0, GB.apex], [X, GB.apex + X * t], [X, lo + X * t], [0, lo], [-X, lo + X * t]]);
  })();
  const billetsB = (ink, key) => billet(-GB.bx - GB.bw / 2, GB.by - GB.bh / 2, GB.bw, GB.bh, '1', ink, 0, key) +
    billet(GB.bx - GB.bw / 2, GB.by - GB.bh / 2, GB.bw, GB.bh, '0', ink, GB.bw * .27, key);

  /* C — the key: one outline (pin, bit with notches, shank, collar, ring) and the ring's hole.
     The bit is read from the pin down: 1 = full tooth, 0 = notch. */
  const GC = { hs: 5.5, pin: 12, top: 16, cell: 4.3, bw: 23, nd: 10, c0: 79, c1: 86, cw: 9.5, cy: 113, R: 21, r: 12 };
  const keyD = (() => {
    const { hs, pin, top, cell, bw, nd, c0, c1, cw, cy, R, r } = GC, bx = hs + bw;
    let d = `M${-hs},${pin} L${hs},${pin} L${hs},${top} L${bx},${top}`;
    [...A.BITS].forEach((b, i) => { const x = b === '1' ? bx : bx - nd; d += ` L${x},${f(top + i * cell)} L${x},${f(top + (i + 1) * cell)}`; });
    const yr = f(cy - Math.sqrt(R * R - hs * hs));
    d += ` L${hs},${f(top + A.BITS.length * cell)} L${hs},${c0} L${cw},${c0} L${cw},${c1} L${hs},${c1} L${hs},${yr}` +
      ` A${R},${R} 0 1 1 ${-hs},${yr} L${-hs},${c1} L${-cw},${c1} L${-cw},${c0} L${-hs},${c0} Z`;
    return d + ` M${-r},${cy} A${r},${r} 0 1 0 ${r},${cy} A${r},${r} 0 1 0 ${-r},${cy} Z`;
  })();

  const FIELD = [-80, -10, 160, 180];

  /* ── colour version ── */
  const shieldColour = (v, id) => {
    let field = rect(...FIELD, TC.az), over = '';
    if (v === 'A') {
      field += rect(-80, -10, 160, 10 + GA.chief, TC.ar) + `<path d="M-80,${GA.chief} H80" style="stroke:${TC.sa}" stroke-width="${KL}"/>`;
      over = tapeA(TC.sa) + book(GA.book, TC.ar, TC.or, TC.az);
    } else if (v === 'B') {
      field += `<path d="${chevD}" style="fill:${TC.ar};stroke:${TC.sa}" stroke-width="${KL}" stroke-linejoin="miter"/>`;
      over = billetsB(TC.or, true) + book(GB.book, TC.or, TC.or, TC.az);
    } else {
      field = rect(-80, -10, 80, 180, TC.az) + rect(0, -10, 80, 180, TC.sa);
      over = `<path d="${keyD}" fill-rule="evenodd" style="fill:${TC.ar};stroke:${TC.sa}" stroke-width="${KL}" stroke-linejoin="round"/>`;
    }
    return `<defs><clipPath id="${id}c"><path d="${S0}"/></clipPath></defs><g clip-path="url(#${id}c)">${field}</g>${over}` +
      `<path d="${S0}" fill="none" style="stroke:${TC.sa}" stroke-width="${RIM + 2 * KL}"/>` +
      `<path d="${S0}" fill="none" style="stroke:${TC.or}" stroke-width="${RIM}"/>`;
  };

  /* ── one-colour line version ── */
  const MO = 3.2, MI = 2.6;   // mono rim: outer rule (outer edge on the colour rim's edge), inner rule
  const shieldMono = (v, m, id, hatchOn) => {
    const hz = `url(#${id}h)`, hx = `url(#${id}x)`;
    let hatch = rect(...FIELD, hz), sil = '', clipped = '', lines = '';
    if (v === 'A') {
      hatch = rect(-80, GA.chief, 160, 140, hz);
      sil = bookSil(GA.book);
      clipped = `<path d="M-80,${GA.chief} H80" style="stroke:${m}" stroke-width="${ML}"/>`;
      lines = tapeA(m) + bookMono(GA.book, m);
    } else if (v === 'B') {
      sil = `<path d="${chevD}"/>` + [-1, 1].map(s => rect(s * GB.bx - GB.bw / 2, GB.by - GB.bh / 2, GB.bw, GB.bh, '#000')).join('') + bookSil(GB.book);
      clipped = `<path d="${chevD}" fill="none" style="stroke:${m}" stroke-width="${ML}"/>`;
      lines = billetsB(m) + bookMono(GB.book, m);
    } else {
      hatch = rect(-80, -10, 80, 180, hz) + rect(0, -10, 80, 180, hx);
      sil = `<path d="${keyD}" fill-rule="evenodd"/>`;
      lines = `<path d="${keyD}" fill="none" style="stroke:${m}" stroke-width="${ML}" stroke-linejoin="round"/>`;
    }
    if (!hatchOn) hatch = '';
    if (v === 'C') hatch += `<path d="M0,-10 V170" style="stroke:${m}" stroke-width="${ML}"/>`;   // the pale line, hidden under the key
    const defs = `<defs><clipPath id="${id}c"><path d="${shieldD(MI + ML * .4)}"/></clipPath>` +
      `<pattern id="${id}h" width="8" height="${HS}" patternUnits="userSpaceOnUse"><rect width="8" height="${HL}" style="fill:${m}"/></pattern>` +
      `<pattern id="${id}x" width="${HS}" height="${HS}" patternUnits="userSpaceOnUse"><rect width="${HS}" height="${HL}" style="fill:${m}"/><rect width="${HL}" height="${HS}" style="fill:${m}"/></pattern>` +
      `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-80" y="-10" width="160" height="180"><rect x="-80" y="-10" width="160" height="180" fill="#fff"/>` +
      `<g fill="#000" stroke="#000" stroke-width="${2 * ML}" stroke-linejoin="round">${sil}</g></mask></defs>`;
    return defs + `<g clip-path="url(#${id}c)"><g mask="url(#${id}m)">${hatch}</g>${clipped}</g>${lines}` +
      `<path d="${shieldD(MO / 2 - IN)}" fill="none" style="stroke:${m}" stroke-width="${MO}"/>` +
      `<path d="${shieldD(MI)}" fill="none" style="stroke:${m}" stroke-width="${f(ML * .8)}"/>`;
  };

  /* ── ribbon ── */
  const ribbon = (m, id, hatchOn) => {
    const ink = m || TC.sa, w = m ? ML : KL;
    const face = m ? 'none' : TC.ar, back = m ? (hatchOn ? `url(#${id}h)` : 'none') : TC.az;
    const sh = (d, fill) => `<path d="${d}" style="fill:${fill};stroke:${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
    return RB.tails.map(d => sh(d, face)).join('') + RB.folds.map(d => sh(d, back)).join('') + sh(RB.band, face) +
      `<path id="${id}t" d="${RB.text}" fill="none"/>` +
      `<text class="tx-m" font-size="${RB.fs}" letter-spacing="${RB.ls}" style="fill:${ink}"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">MENS ET MACHINA</textPath></text>`;
  };

  /* ── backing for a woven or embroidered badge: the outline grown by PO ── */
  const PO = 3.6;
  const patch = (fill, rib) => `<g style="fill:${fill};stroke:${fill}" stroke-width="${2 * PO}" stroke-linejoin="round">` +
    `<path d="${shieldD(-IN)}"/>` + (rib ? `<path d="${RB.band}"/>${RB.tails.map(d => `<path d="${d}"/>`).join('')}${RB.folds.map(d => `<path d="${d}"/>`).join('')}` : '') + '</g>';

  const box = o => {
    const rib = !o || o.ribbon !== false, pad = o && o.patch ? PO : 0;
    const top = -IN - pad, bot = (rib ? Math.max(RB.bottom, TIP) : TIP) + pad;
    const half = (rib ? Math.max(HW + IN, RB.half) : HW + IN) + pad;
    return { top, bot, half };
  };

  A.crest = (cx, cy, h, o = {}) => {
    const v = String(o.v || FM.CREST || 'A').toUpperCase(), rib = o.ribbon !== false, m = o.mono || null;
    const b = box(o), k = h / (b.bot - b.top), id = FM.uid('crest');
    /* mono hatching only where it can be cut, stitched or foiled; finer than ~1.9 units it
       would print as a grey smudge, so small crests keep their outlines only */
    const hatchOn = o.hatch != null ? !!o.hatch : HS * k >= 1.9;
    const s = (o.patch ? patch(o.patch, rib) : '') + (m ? shieldMono(v, m, id, hatchOn) : shieldColour(v, id)) + (rib ? ribbon(m, id, hatchOn) : '');
    const g = `<g transform="translate(${f(cx)},${f(cy - (b.top + b.bot) / 2 * k)}) scale(${+k.toFixed(5)})">${s}</g>`;
    return o.fx ? `<g ${FM[o.fx]}>${g}</g>` : g;
  };
  A.crestW = (h, o = {}) => { const b = box(o); return h * 2 * b.half / (b.bot - b.top); };
})();
