/* Bottoms: sweatpants (tepláky), fleece shorts (kraťasy) and crew socks (ponožky).
   Same flat technical style as the hoodie: 1.5 outline, dashed stitching, a few soft
   creases, ribbing as its own piece. Every draw() is pure, so FM.inner() can reuse
   pants and shorts in set drawings with any opts. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  const r2 = n => +n.toFixed(2);
  const pt = (p, dx, dy) => `${r2(p[0] + dx)},${r2(p[1] + (dy || 0))}`;

  /* Cubic chain [P0, c, c, P1, c, c, P2 …] → "M… C… C…", shifted right by dx. */
  const chain = (pts, dx = 0) => {
    let s = `M${pt(pts[0], dx)}`;
    for (let i = 1; i < pts.length; i += 3) s += ` C${pt(pts[i], dx)} ${pt(pts[i + 1], dx)} ${pt(pts[i + 2], dx)}`;
    return s;
  };
  /* Closed band between two horizontal offsets a < b of a near-vertical contour
     (side stripes). slope tilts the bottom end to follow a sloping hem. */
  const band = (pts, a, b, slope = 0) => {
    const n = pts.length - 1;
    const q = (i, dx) => pt(pts[i], dx, i === n ? -dx * slope : 0);
    let s = `M${q(0, a)}`;
    for (let i = 1; i < pts.length; i += 3) s += ` C${q(i, a)} ${q(i + 1, a)} ${q(i + 2, a)}`;
    s += ` L${q(n, b)}`;
    for (let i = n - 1; i > 0; i -= 3) s += ` C${q(i, b)} ${q(i - 1, b)} ${q(i - 2, b)}`;
    return s + ' Z';
  };
  /* Double side stripe on the outer edge of both legs: --trim outside, --trim2 inside. */
  const stripes = (out, k, slope) => {
    const w = 1.15 * k, g = .6 * k, a1 = 3.5, b1 = a1 + w, a2 = b1 + g, b2 = a2 + w;
    const one = (a, b, fill) => {
      const d = band(out, a, b, slope);
      const e1 = band(out, a + 1.1, a + 1.1, slope).split(' L')[0], e2 = band(out, b - 1.1, b - 1.1, slope).split(' L')[0];
      return fab(d, { fill, ol: '' }) + fab(mir(d), { fill, ol: '' }) +
        `<path d="${e1}" class="st"/><path d="${e2}" class="st"/><path d="${mir(e1)}" class="st"/><path d="${mir(e2)}" class="st"/>`;
    };
    return one(a1, b1, 'var(--trim)') + one(a2, b2, 'var(--trim2)');
  };

  /* Metal for eyelets and cord tips (neutral hardware). */
  const metal = id => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
    '<stop offset="0" stop-color="#8A9097"/><stop offset=".45" stop-color="#E6E8EA"/><stop offset="1" stop-color="#979DA4"/></linearGradient></defs>';
  /* Flat drawcord: two metal eyelets on the waistband at y, ends hanging, metal tips. */
  const cord = (pre, y, len) => {
    const id = pre + '-metal';
    const L = `M308,${y} C306,${y + len * .35} 301,${y + len * .7} 299,${y + len}`;
    const R = `M332,${y} C335,${y + len * .33} 340,${y + len * .62} 341,${y + len - 6}`;
    const rope = d => `<path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="7.6" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" style="stroke:var(--cord)" stroke-width="5.8"/>` +
      `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="1.1" stroke-dasharray="2 1.6"/>`;
    const tip = (x, yy, rot) => `<g transform="rotate(${rot} ${x} ${yy})"><rect x="${r2(x - 3.3)}" y="${r2(yy - 2)}" width="6.6" height="15" rx="1.8" fill="url(#${id})" style="stroke:var(--line)" stroke-width=".8"/>` +
      `<path d="M${r2(x - 3.3)},${r2(yy + 1.6)} L${r2(x + 3.3)},${r2(yy + 1.6)}" fill="none" stroke="#5E646B" stroke-width=".7"/></g>`;
    /* the cord runs into the hole, the metal ring sits on top of it */
    const hole = x => `<circle cx="${x}" cy="${y}" r="4.2" fill="#000" fill-opacity=".6"/>`;
    const ring = x => `<circle cx="${x}" cy="${y}" r="5.3" fill="none" style="stroke:var(--line)" stroke-width="4"/>` +
      `<circle cx="${x}" cy="${y}" r="5.3" fill="none" stroke="url(#${id})" stroke-width="2.6"/>`;
    return metal(id) + hole(308) + hole(332) + rope(L) + rope(R) + ring(308) + ring(332) +
      tip(299, y + len, 3) + tip(341, y + len - 6, -3);
  };

  /* ── Sweatpants ─────────────────────────────────────────────────────────────
     cm 5.6 (size L: outseam ≈ 104 cm, waist relaxed ≈ 39 cm, hip ≈ 52 cm flat).
     Left-hand paths are the wearer's right leg (viewer's left); mirror for the other. */
  const PK = 5.6;
  const PA = {
    wb: 'M204,46 L436,46 L439,86 L201,86 Z',
    out: [[201, 86], [192, 124], [182, 168], [180, 220], [176, 312], [190, 470], [204, 566]],
    outO: [[201, 86], [192, 124], [182, 168], [180, 220], [177, 322], [197, 520], [205, 630]],
    inC: ' Q205,575 213,578 L285,578 Q293,575 294,566 C300,450 306,320 313,266 Q316,246 320,238',
    inO: ' L292,630 C299,490 306,330 313,266 Q316,246 320,238',
    cuff: 'M211,574 L287,574 L285,630 L213,630 Z',
    pocket: 'M238,86 C228,120 206,164 181.5,198',
    pocketS: 'M242.5,88.3 C232.5,122.3 210.5,166.3 186,200.3',
    pocketF: 'M235,87 C226,116 208,154 188,184',
    bpocket: 'M354,112 L432,112 L431,186 Q431,198 419,198 L367,198 Q355,198 355,186 Z',
    bpocketS: 'M358.4,121 L358.6,185.5 Q358.6,194.6 367.6,194.6 L418.6,194.6 Q427.6,194.6 427.6,185.5 L427.8,121',
  };
  const PF_FRONT = ['M306,262 C294,276 282,285 267,290', 'M302,290 C292,300 282,306 271,309', 'M192,424 C208,430 228,432 250,428'];
  const PF_BACK = ['M234,250 C254,260 276,262 298,254', 'M276,214 C290,224 302,228 314,229', 'M194,430 C212,436 232,436 252,430'];
  const PF_CUFF = ['M222,565 C224,556 228,551 234,547', 'M276,565 C273,557 269,552 263,548'];
  const PF_OPEN = ['M232,500 C236,540 238,575 238,604'];

  FM.register('pants', {
    label: 'Tepláky',
    views: ['front', 'back'],
    cm: PK,
    shadow: { cx: 320, cy: 650, rx: 168, ry: 14 },
    zones: {
      front: {
        hipL: { x: 402, y: 236, w: 76 },          // wearer's left hip (viewer's right), just under the slant pocket
        hipR: { x: 238, y: 236, w: 76 },          // wearer's right hip
        thighL: { x: 386, y: 318, w: 100 },       // wearer's left thigh, clear of the side stripe
        thighR: { x: 254, y: 318, w: 100 },
        legL: { x: 428, y: 430, rot: 94 },        // down the outer wearer's left leg, inside the stripe, reads top→bottom
        cuffL: { x: 390, y: 602, w: 66 },         // wearer's left rib cuff (with opts.open: the plain hem above the stitching)
      },
      back: {
        pocket: { x: 393, y: 160, w: 76, top: 112, bottom: 198 }, // centre of the patch pocket (wearer's right seat)
        waist: { x: 320, y: 104 },                // centre back, just under the waistband
        legL: { x: 212, y: 430, rot: 86 },        // outer wearer's left leg (viewer's left in back view)
      },
    },
    /* opts: stripe (double side stripe in --trim/--trim2), open (straight hem, no rib cuffs) */
    draw(view, o, deco) {
      const front = view === 'front', open = !!o.open;
      const out = open ? PA.outO : PA.out;
      const tail = open ? PA.inO : PA.inC;
      const leg = chain(out) + tail + ' L320,86 Z';
      const legOl = chain(out) + tail;
      let s = fab(leg, { ol: legOl }) + fab(mir(leg), { ol: mir(legOl) });
      if (o.stripe) s += stripes(out, PK, 0);
      /* centre seam (front rise / back rise) */
      s += '<path d="M320,86 L320,238" class="ol thin"/><path d="M323.6,90 L323.6,232" class="st"/>';
      if (front) {
        s += `<path d="${PA.pocketF}" class="fd"/><path d="${mir(PA.pocketF)}" class="fd"/>` +
          `<path d="${PA.pocket}" class="ol"/><path d="${mir(PA.pocket)}" class="ol"/>` +
          `<path d="${PA.pocketS}" class="st"/><path d="${mir(PA.pocketS)}" class="st"/>`;
      } else {
        s += fab(PA.bpocket) + `<path d="M354.4,119.5 L431.6,119.5" class="st"/><path d="${PA.bpocketS}" class="st"/>`;
      }
      (front ? PF_FRONT : PF_BACK).concat(open ? PF_OPEN : PF_CUFF).forEach(d => { s += `<path d="${d}" class="fd"/><path d="${mir(d)}" class="fd"/>`; });
      if (open) {
        ['M205.2,614 L292.4,614', 'M205.3,618.2 L292.3,618.2'].forEach(d => { s += `<path d="${d}" class="st"/><path d="${mir(d)}" class="st"/>`; });
      } else {
        s += fab(PA.cuff, { rib: true }) + fab(mir(PA.cuff), { rib: true }) +
          '<path d="M212,577.5 L286,577.5" class="st"/>' + `<path d="${mir('M212,577.5 L286,577.5')}" class="st"/>`;
      }
      s += fab(PA.wb, { rib: true }) + '<path d="M203.5,51.5 L436.5,51.5" class="st"/><path d="M201.5,80.5 L438.5,80.5" class="st"/>';
      s += deco || '';
      if (front) s += cord('pants', 66, 86);
      return s;
    },
  });

  /* ── Fleece shorts ──────────────────────────────────────────────────────────
     Authored at 6.6 units/cm and scaled ×1.12 about (320, 340) so they fill the box:
     cm ≈ 7.4 (size L: outseam ≈ 52 cm, inseam ≈ 18 cm, hip ≈ 52 cm flat).
     The hem rises towards the inseam, so stripes and twin stitching follow that slope. */
  const SC = 1.12, SCY = 340, SK = 6.6 * SC, SLOPE = 11 / 168;
  const SX = x => r2(320 + (x - 320) * SC), SY = y => r2(SCY + (y - SCY) * SC);
  const sc = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${SX(+x)},${SY(+y)}`);
  const sz = (x, y, o = {}) => Object.assign({}, o, { x: SX(x), y: SY(y) },
    o.w ? { w: r2(o.w * SC) } : {}, o.top ? { top: SY(o.top), bottom: SY(o.bottom) } : {});
  const SH = {
    wb: 'M190,168 L450,168 L453,204 L187,204 Z',
    wbS: ['M189.5,173.5 L450.5,173.5', 'M187.5,198.5 L452.5,198.5'],
    tail: ' L304,499 C308,468 313,420 316,398 Q318,388 320,384',
    seam: 'M320,204 L320,384', seamS: 'M323.6,208 L323.6,378',
    pocket: 'M222,204 C212,236 192,268 161,294',
    pocketS: 'M226.1,206.8 C216.1,238.8 196.1,270.8 165.1,296.8',
    pocketF: 'M219,205 C210,233 194,260 170,282',
    bpocket: 'M362,228 L438,228 L437,296 Q437,306 427,306 L373,306 Q363,306 363,296 Z',
    bpocketS: 'M366.4,236 L366.6,295.5 Q366.6,302.6 373.6,302.6 L426.6,302.6 Q433.6,302.6 433.6,295.5 L433.8,236',
    bpocketH: 'M362.4,235.5 L437.6,235.5',
    hemS: ['M137.6,499 L305.4,488', 'M138.1,494.6 L305.9,483.6'],
    front: ['M305,402 C294,414 282,421 268,425', 'M171,334 C184,344 198,349 214,351', 'M200,436 C198,458 195,476 191,492'],
    back: ['M234,390 C254,398 276,400 298,394', 'M276,356 C290,366 302,370 314,371', 'M198,438 C196,460 193,478 189,494'],
  };
  (function scaleAll(o) {
    for (const k in o) o[k] = Array.isArray(o[k]) ? o[k].map(sc) : sc(o[k]);
  })(SH);
  SH.out = [[187, 204], [178, 238], [162, 278], [156, 318], [151, 362], [144, 440], [136, 510]].map(p => [SX(p[0]), SY(p[1])]);

  FM.register('shorts', {
    label: 'Kraťasy',
    views: ['front', 'back'],
    cm: r2(SK),
    shadow: { cx: 320, cy: 554, rx: 230, ry: 14 },
    zones: {
      front: {
        hipL: sz(428, 324, { w: 70 }),            // wearer's left hip (viewer's right), just under the slant pocket
        hipR: sz(212, 324, { w: 70 }),
        thighL: sz(398, 424, { w: 128 }),         // wearer's left leg, mid-thigh, clear of the stripe
        thighR: sz(242, 424, { w: 128 }),
        legL: sz(462, 410, { rot: 84 }),          // down the outer wearer's left leg, inside the stripe, reads top→bottom
        cuffL: sz(420, 470, { w: 130, rot: 3.7 }), // above the twin-stitched hem of the wearer's left leg; rot follows the hem
      },
      back: {
        pocket: sz(400, 268, { w: 74, top: 228, bottom: 306 }), // centre of the patch pocket (wearer's right seat)
        waist: sz(320, 222),                      // centre back under the waistband
        legL: sz(178, 410, { rot: 96 }),          // outer wearer's left leg (viewer's left in back view)
      },
    },
    /* opts: stripe (double side stripe in --trim/--trim2) */
    draw(view, o, deco) {
      const front = view === 'front';
      const two = (d, cls) => `<path d="${d}" class="${cls}"/><path d="${mir(d)}" class="${cls}"/>`;
      const leg = chain(SH.out) + SH.tail + ` L${SX(320)},${SY(204)} Z`;
      const legOl = chain(SH.out) + SH.tail;
      let s = fab(leg, { ol: legOl }) + fab(mir(leg), { ol: mir(legOl) });
      if (o.stripe) s += stripes(SH.out, SK, SLOPE);
      s += `<path d="${SH.seam}" class="ol thin"/><path d="${SH.seamS}" class="st"/>`;
      SH.hemS.forEach(d => { s += two(d, 'st'); });
      if (front) {
        s += two(SH.pocketF, 'fd') + two(SH.pocket, 'ol') + two(SH.pocketS, 'st');
      } else {
        s += fab(SH.bpocket) + `<path d="${SH.bpocketH}" class="st"/><path d="${SH.bpocketS}" class="st"/>`;
      }
      (front ? SH.front : SH.back).forEach(d => { s += two(d, 'fd'); });
      s += fab(SH.wb, { rib: true }) + SH.wbS.map(d => `<path d="${d}" class="st"/>`).join('');
      s += deco || '';
      if (front) s += cord('shorts', SY(186), 90);
      return s;
    },
  });

  /* ── Crew socks ─────────────────────────────────────────────────────────────
     cm 9.4 (size 41–46 laid flat: about 35 cm from cuff to heel, foot 23 cm, width 9 cm).
     A pair in profile, outer sides up: the wearer's left sock on the viewer's left with
     the toe pointing left, the right sock mirrored. Pieces: body, heel, toe, rib cuff. */
  const SO = {
    body: 'M230,178 L312,178 C313.5,260 316,340 316,426 C317,474 306,498 282,503 C267,505 252,505.6 238,505.6 C210,506 182,505.5 158,503 C124,502 100,494 100,472 C100,450 120,439 148,436 C181,431 212,420 226,398 C230,340 230,250 230,178 Z',
    heel: 'M316,426 C317,474 306,498 282,503 C267,505 252,505.6 238,505.6 C238,462 273,426 316,426 Z',
    heelB: 'M238,505.6 C238,462 273,426 316,426',
    toe: 'M158,503 C124,502 100,494 100,472 C100,450 120,439 148,436 C158,452 164,482 158,503 Z',
    toeB: 'M148,436 C158,452 164,482 158,503',
    cuff: 'M230,178 L312,178 C312.4,197 312.8,217 313.2,236 L230,236 Z',
    cuffB: 'M230,236 L313.2,236',
    leg: 'M230,236 L313.2,236 C314.6,300 316,360 316,426 C292,424 250,414 226,398 C229.6,340 230,290 230,236 Z',
  };
  const backX = y => r2(312 + (y - 178) * (1.2 / 58));
  const STRIPES = {
    1: [[201, 213, 'trim']],
    2: [[193, 202, 'trim'], [209, 218, 'trim2']],
    3: [[189, 196, 'trim'], [203, 210, 'trim2'], [217, 224, 'trim']],
  };
  const SOF = ['M235,386 C242,396 244,408 242,420', 'M248,381 C255,392 258,405 257,417'];

  FM.register('socks', {
    label: 'Ponožky',
    views: ['front'],
    cm: 9.4,
    shadow: { cx: 320, cy: 516, rx: 226, ry: 9 },
    zones: {
      front: {
        legL: { x: 272, y: 316, w: 72 },          // outer side of the left sock's leg (viewer's left), between cuff and ankle
        legR: { x: 368, y: 316, w: 72 },          // same on the right sock
        cuffL: { x: 271, y: 207, w: 78 },         // middle of the left rib cuff
        cuffR: { x: 369, y: 207, w: 78 },
        footL: { x: 202, y: 474, w: 64 },         // side of the left foot, between toe and heel
        footR: { x: 438, y: 474, w: 64 },
      },
    },
    /* opts: stripes 0–3 (cuff bands in --trim / --trim2), heeltoe (heel and toe in --trim),
             ribbed (rib texture down the leg), toeline (thin --trim2 line on the toe seam) */
    draw(view, o, deco) {
      const ht = o.heeltoe ? 'var(--trim)' : 'var(--body)';
      const bands = STRIPES[Math.max(0, Math.min(3, o.stripes | 0))] || [];
      const sock = m => {
        let s = fab(m(SO.body), { tex: 'knit', ol: '' });
        if (o.ribbed) s += `<path d="${m(SO.leg)}" fill="url(#g-rib)"/>`;
        s += fab(m(SO.heel), { fill: ht, tex: 'knit', ol: '' }) + `<path d="${m(SO.heelB)}" class="ol thin"/>`;
        s += fab(m(SO.toe), { fill: ht, tex: 'knit', ol: '' }) + `<path d="${m(SO.toeB)}" class="ol thin"/>`;
        if (o.toeline) s += `<path d="${m(SO.toeB)}" fill="none" style="stroke:var(--trim2)" stroke-width="1.7" stroke-linecap="round"/>`;
        s += fab(m(SO.cuff), { rib: true, ol: '' });
        bands.forEach(([y1, y2, c]) => {
          s += fab(m(`M230,${y1} L${backX(y1)},${y1} L${backX(y2)},${y2} L230,${y2} Z`), { rib: true, fill: `var(--${c})`, ol: '' });
        });
        s += `<path d="${m(SO.cuffB)}" class="ol thin"/>`;
        SOF.forEach(d => { s += `<path d="${m(d)}" class="fd"/>`; });
        return s + `<path d="${m(SO.body)}" class="ol"/>`;
      };
      return sock(d => d) + sock(mir) + (deco || '');
    },
  });
})();
