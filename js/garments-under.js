/* Underwear: woven boxer shorts (trenky) and knit boxer briefs (boxerky).
   Same flat technical style as the hoodie: 1.5 outline, dashed stitching, a few soft
   creases, the elastic waistband as its own piece.

   Both garments carry two kinds of decoration:
   - `deco` (the product's front/back function) is clipped to the leg fabric, never the
     waistband, and sits under the seams, so an all-over print runs under the stitching
     and gets the fabric's shading and texture on top, like real printed cloth.
     zones.field is the rectangle such a repeat should cover.
   - `opts.bandArt` is painted on the waistband, clipped to it, under the band's own
     knit texture, so lettering reads as jacquard. It is an SVG string, a function
     (zones, view) → string, or { front, back } of either. zones.waist is the band's
     centre line (x, y, w, h).
   Every draw() is pure. Local clip paths get a per-render id with the garment prefix. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  const two = (d, cls) => `<path d="${d}" class="${cls}"/><path d="${mir(d)}" class="${cls}"/>`;
  const q2 = n => +n.toFixed(2);
  /* Cubic chain [P0, c, c, P1, c, c, P2 …] → "M… C…". */
  const chain = pts => `M${q2(pts[0][0])},${q2(pts[0][1])}` + pts.slice(1).map((p, i) =>
    (i % 3 ? ' ' : ' C') + `${q2(p[0])},${q2(p[1])}`).join('');
  /* Approximate parallel of a cubic chain at distance d (to the left of travel, i.e.
     +x when the chain runs downwards): every anchor and handle moves along the normal of
     its own handle line. Good enough for stitching a few units from a seam. */
  const offset = (pts, d) => {
    const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; };
    return pts.map((p, i) => {
      let v;
      if (i % 3 === 0) {
        const a = i > 0 ? nrm(pts[i - 1], p) : null, b = i < pts.length - 1 ? nrm(p, pts[i + 1]) : null;
        v = a && b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : (a || b);
      } else v = i % 3 === 1 ? nrm(pts[i - 1], p) : nrm(p, pts[i + 1]);
      return [p[0] + v[0] * d, p[1] + v[1] * d];
    });
  };
  const clip = (prefix, paths) => {
    const id = FM.uid(prefix);
    return { def: `<clipPath id="${id}">${paths.map(d => `<path d="${d}"/>`).join('')}</clipPath>`, url: `url(#${id})` };
  };
  const base = d => `<path d="${d}" style="fill:var(--body)"/>`;
  /* Waistband colour: 'body' is the body colour knitted a shade deeper, so it still reads as its own piece. */
  const BANDS = { body: 'var(--rib)', trim: 'var(--trim)', trim2: 'var(--trim2)' };
  const bandArt = (o, z, view, type) => {
    let a = o.bandArt;
    if (a && typeof a === 'object') a = a[view];
    try { return typeof a === 'function' ? a(z, view) || '' : (a || ''); }
    catch (e) { console.error('[FM] bandArt failed:', type, view, e); return ''; }
  };
  /* Elastic jacquard waistband: fill → lettering → knit texture, light, grain → outline.
     No heather melange on the band: it is a separate yarn even when the body is melange. */
  const waistband = (type, d, o, z, view, stitches) => {
    const c = clip(type + '-band', [d]);
    const art = bandArt(o, z, view, type);
    return `<defs>${c.def}</defs><path d="${d}" style="fill:${BANDS[o.band] || BANDS.trim}"/>` +
      (art ? `<g clip-path="${c.url}">${art}</g>` : '') +
      fab(d, { fill: 'none', tex: 'knit', grain: false, ol: '' }) + `<path d="${d}" fill="url(#g-noise)" class="nz"/>` +
      stitches.map(s => `<path d="${s}" class="st"/>`).join('') + `<path d="${d}" class="ol"/>`;
  };
  /* Small gathers where the wide body is eased into the elastic. */
  const gathers = (y, x0, x1, step, skip) => {
    let s = '';
    for (let x = x0, i = 0; x <= x1 + .1; x += step, i++) {
      if (skip && x > skip[0] && x < skip[1]) continue;
      const len = 9 + (i % 3) * 3, b = i % 2 ? 1.2 : -1.2;
      s += `M${+x.toFixed(1)},${y} c${b},${+(len * .4).toFixed(1)} ${-b},${+(len * .7).toFixed(1)} ${+(b * .4).toFixed(1)},${len} `;
    }
    return `<path d="${s.trim()}" fill="none" style="stroke:var(--fold)" stroke-width="1.3" stroke-linecap="round"/>`;
  };

  /* ═══ BOXERS (trenky) ═════════════════════════════════════════════════════
     cm 7 (size L laid flat: waistband 38 cm relaxed and 4 cm high, seat 55 cm,
     outseam 41 cm, inseam 10 cm, leg opening 27 cm, side vents 7 cm).
     Woven cotton, gathered into a jacquard elastic. The left-hand paths are the
     wearer's right leg (viewer's left in the front view); mirror for the other.
     Each side vent: the leg's rounded corner lies over the other panel's corner,
     whose sliver shows in the split. */
  const BX = {
    band: 'M187,196 L453,196 L455,224 L185,224 Z',
    bandS: ['M186.6,201 L453.4,201', 'M185.6,218.5 L454.4,218.5'],
    leg: 'M320,224 L185,224 C168,238 147,264 136,294 C127,322 120,384 115,434 C116,461 123,479 143,485 C198,489 254,488 303,483 C308,462 314,436 320,413 Z',
    legOl: 'M185,224 C168,238 147,264 136,294 C127,322 120,384 115,434 C116,461 123,479 143,485 C198,489 254,488 303,483 C308,462 314,436 320,413',
    edge: 'M115,434 C116,461 123,479 143,485 C198,489 254,488 303,483',  // piped edge: vent + hem
    sliver: 'M115,434 C112,454 107,470 108,477 Q109,486 121,486.5 L143,485 C123,479 116,461 115,434 Z',
    sliverOl: 'M115,434 C112,454 107,470 108,477 Q109,486 121,486.5 L143,485',
    sliverEdge: 'M115,434 C112,454 107,470 108,477 Q109,486 121,486.5 L146,485.5',
    hemS: 'M125,438 C126,459 131,471 146,475 C199,479 254,478 305.5,473',
    tack: 'M117,432 L123.4,433.2',                                       // bar tack at the top of the vent
    centre: 'M320,224 L320,413',
    /* button fly (front): J-stitch on the wearer's left panel, topstitched centre seam below */
    flyS: ['M343,229 L343,301 Q343,318 322,322', 'M323.6,326 L323.6,407'],
    /* back: centre seam and the full seat panel between two curved seams */
    cbS: 'M323.6,229 L323.6,407',
    seat: 'M234,224 C238,300 266,372 318,413',
    seatS: 'M238.6,226 C242.6,300 270,368 318,407.5',
  };
  const BX_FOLD = {
    front: ['M299,402 C289,413 277,420 263,424', 'M150,288 C158,308 164,328 166,350', 'M206,438 C205,453 203,466 200,476'],
    back: ['M300,399 C287,408 273,413 257,415', 'M168,300 C176,320 180,340 182,360', 'M208,438 C207,453 205,466 202,476'],
  };
  const BX_FIELD = { x: 320, y: 355, w: 440, top: 222, bottom: 490 };

  FM.register('boxers', {
    label: 'Trenky',
    views: ['front', 'back'],
    cm: 7,
    shadow: { cx: 320, cy: 516, rx: 224, ry: 13 },
    zones: {
      front: {
        field: BX_FIELD,                          // bounding box of both legs: cover it with an all-over repeat (clipped to the cloth)
        waist: { x: 320, y: 210, w: 268, h: 28 }, // centre line of the waistband, for opts.bandArt lettering
        hipL: { x: 414, y: 292, w: 110 },         // wearer's left hip (viewer's right), clear of the fly
        legL: { x: 418, y: 442, w: 150 },         // wearer's left leg (viewer's right), just above the hem stitching
      },
      back: {
        field: BX_FIELD,
        waist: { x: 320, y: 210, w: 268, h: 28 },
        hipL: { x: 186, y: 300, w: 80 },          // wearer's left hip (viewer's left in the back view), outside the seat seam
        legL: { x: 222, y: 442, w: 150 },         // wearer's left leg near the hem (viewer's left)
        seat: { x: 320, y: 300, w: 150 },         // middle of the seat panel, across the centre seam
      },
    },
    /* opts: band 'body' | 'trim' (default) | 'trim2'   waistband colour
             piping                                    thin --trim2 piping on the leg hems and vents
             bandArt                                   waistband lettering (see the header) */
    draw(view, o, deco) {
      const front = view === 'front';
      const legs = [BX.leg, mir(BX.leg)], slivers = [BX.sliver, mir(BX.sliver)];
      const all = clip('boxers-cloth', slivers.concat(legs));
      const legC = clip('boxers-legs', legs), slC = clip('boxers-vent', slivers);
      let s = `<defs>${all.def}${legC.def}${slC.def}</defs>` + slivers.map(base).join('') + legs.map(base).join('');
      if (deco) s += `<g clip-path="${all.url}">${deco}</g>`;
      /* light, weave and grain over the print; the panel in the vent sits a step deeper */
      s += slivers.map(d => fab(d, { fill: 'none', tex: 'weave', ol: '' }) + `<path d="${d}" fill="#000" fill-opacity=".14"/>`).join('');
      s += legs.map(d => fab(d, { fill: 'none', tex: 'weave', ol: '' })).join('');
      s += gathers(226, 194, 446, 12.6, front ? [306, 352] : null);
      BX_FOLD[front ? 'front' : 'back'].forEach(d => { s += two(d, 'fd'); });
      s += `<path d="${BX.centre}" class="ol thin"/>`;
      if (front) s += BX.flyS.map(d => `<path d="${d}" class="st"/>`).join('');
      else s += `<path d="${BX.cbS}" class="st"/>` + two(BX.seat, 'ol thin') + two(BX.seatS, 'st');
      if (o.piping) {
        const pipe = d => `<path d="${d}" fill="none" style="stroke:var(--line)" stroke-opacity=".45" stroke-width="7.6"/>` +
          `<path d="${d}" fill="none" style="stroke:var(--trim2)" stroke-width="6.2"/>`;
        s += `<g clip-path="${slC.url}">${pipe(BX.sliverEdge)}${pipe(mir(BX.sliverEdge))}</g>` +
          `<g clip-path="${legC.url}">${pipe(BX.edge)}${pipe(mir(BX.edge))}</g>`;
      }
      s += two(BX.hemS, 'st') + two(BX.sliverOl, 'ol') + two(BX.legOl, 'ol') + two(BX.tack, 'ol');
      s += waistband('boxers', BX.band, o, FM.garments.boxers.zones[view], view, BX.bandS);
      if (front) {
        /* one small four-hole button, neutral off-white plastic */
        s += '<circle cx="331.5" cy="246" r="4.6" fill="#F1EEE6" style="stroke:var(--line)" stroke-width=".9"/>' +
          '<circle cx="331.5" cy="246" r="3.1" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".7"/>' +
          '<g fill="#8F8A80"><circle cx="330.3" cy="244.8" r=".62"/><circle cx="332.7" cy="244.8" r=".62"/><circle cx="330.3" cy="247.2" r=".62"/><circle cx="332.7" cy="247.2" r=".62"/></g>';
      }
      return s;
    },
  });

  /* ═══ BOXER BRIEFS (boxerky) ═══════════════════════════════════════════════
     Authored at 9 units/cm and scaled ×1.15 about (320, 360) so they fill the box:
     cm ≈ 10.35 (size L laid flat: waistband 34 cm relaxed and 4.8 cm high, hip 37 cm,
     front rise 23 cm, outseam 34 cm, inseam 11 cm, leg opening 18 cm).
     Cotton–elastane jersey, so no weave and only a light grain. The body is about as
     wide as the band (stretch, nothing gathered), with a contoured two-piece front
     pouch and cover-stitched seams. The legs splay a little, so the flat hem drops
     towards the inseam (the sports shorts do the opposite). */
  const BS = 1.15, BSY = 360, r2 = n => +n.toFixed(2);
  const bx = x => r2(320 + (x - 320) * BS), by = y => r2(BSY + (y - BSY) * BS);
  const bsc = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${bx(+x)},${by(+y)}`);
  const bz = (z) => {
    const o = Object.assign({}, z, { x: bx(z.x), y: by(z.y) });
    if (z.w != null) o.w = r2(z.w * BS);
    if (z.h != null) o.h = r2(z.h * BS);
    if (z.top != null) { o.top = by(z.top); o.bottom = by(z.bottom); }
    return o;
  };
  /* left half of the pouch seam, waistband → crotch: narrow at the band, full and round below */
  const POUCH = [[272, 243], [259, 280], [251, 332], [264, 370], [276, 398], [300, 411], [320, 412]];
  const BR = {
    band: 'M168,200 L472,200 L473,243 L167,243 Z',
    bandS: ['M168.1,204.6 L471.9,204.6', 'M167.2,236.8 L472.8,236.8', 'M167.1,240.2 L472.9,240.2'],
    leg: 'M320,243 L167,243 C162,268 157,300 155,330 C152,380 149,440 146,494 L306,508 C309,478 313,446 320,412 Z',
    legOl: 'M167,243 C162,268 157,300 155,330 C152,380 149,440 146,494 L306,508 C309,478 313,446 320,412',
    hemS: ['M146.6,486 L307.2,500', 'M146.8,482 L307.7,496'],
    pouch: chain(POUCH),
    pouchA: chain(POUCH) + ' ' + chain(POUCH.slice().reverse().map(p => [640 - p[0], p[1]])).replace('M', 'L') + ' Z',
    pouchS: chain(offset(POUCH, -4.6).slice(0, -1).concat([[317.4, 416.4]])),   // cover stitch outside the seam
    pouchS2: chain(offset(POUCH, 4.4).slice(0, -1).concat([[320, 407.6]])),    // and inside it
    pcS: ['M316.6,247 L316.6,404', 'M323.4,247 L323.4,404'],
    centre: 'M320,243 L320,412',
    /* back: centre seam with cover stitch either side */
    cb: 'M320,243 C320.6,310 320.6,370 320,412',
    cbS: ['M316.4,247 C317,310 317,370 316.4,406', 'M323.6,247 C324.2,310 324.2,370 323.6,406'],
    fold: {
      front: ['M296,432 C284,440 270,444 254,445', 'M184,268 C198,275 214,279 230,280', 'M172,440 C190,446 210,448 230,447'],
      back: ['M296,432 C284,440 270,444 254,445', 'M206,300 C222,318 244,330 268,336', 'M172,440 C190,446 210,448 230,447'],
    },
  };
  (function scaleAll(o) {
    for (const k in o) o[k] = typeof o[k] === 'string' ? bsc(o[k]) : Array.isArray(o[k]) ? o[k].map(bsc) : (scaleAll(o[k]), o[k]);
  })(BR);
  const BR_FIELD = bz({ x: 320, y: 376, w: 352, top: 241, bottom: 510 });
  const BR_WAIST = bz({ x: 320, y: 221.5, w: 306, h: 43 });

  FM.register('briefs', {
    label: 'Boxerky',
    views: ['front', 'back'],
    cm: r2(9 * BS),
    shadow: { cx: 320, cy: 558, rx: 196, ry: 13 },
    zones: {
      front: {
        field: BR_FIELD,                          // bounding box of both legs: cover it with an all-over repeat (clipped to the cloth)
        waist: BR_WAIST,                          // centre line of the wide waistband, for opts.bandArt lettering
        hipL: bz({ x: 433, y: 300, w: 80 }),      // wearer's left hip (viewer's right), between pouch and side
        legL: bz({ x: 412, y: 464, w: 136, rot: -5 }), // wearer's left leg just above the hem stitching; rot follows the hem
        sideL: bz({ x: 485, y: 330, rot: 87 }),   // wearer's left side seam (the outline) at hip height; rot = seam direction
      },
      back: {
        field: BR_FIELD,
        waist: BR_WAIST,
        hipL: bz({ x: 207, y: 300, w: 80 }),      // wearer's left hip (viewer's left in the back view)
        legL: bz({ x: 228, y: 464, w: 136, rot: 5 }), // wearer's left leg above the hem (viewer's left)
        sideL: bz({ x: 155, y: 330, rot: 93 }),   // wearer's left side seam at hip height
      },
    },
    /* opts: band 'body' | 'trim' (default) | 'trim2'   waistband colour
             bandArt                                   waistband lettering (see the header) */
    draw(view, o, deco) {
      const front = view === 'front';
      const legs = [BR.leg, mir(BR.leg)];
      const cloth = clip('briefs-cloth', legs);
      let s = `<defs>${cloth.def}</defs>` + legs.map(base).join('');
      if (deco) s += `<g clip-path="${cloth.url}">${deco}</g>`;
      /* jersey: light and a light grain, no weave */
      s += legs.map(d => fab(d, { fill: 'none', grain: false, ol: '' }) +
        `<g opacity=".6"><path d="${d}" fill="url(#g-noise)" class="nz"/></g><path d="${d}" fill="url(#g-heather)" class="ht"/>`).join('');
      if (front) {
        /* the pouch catches the light: a soft highlight on its upper half */
        const pid = FM.uid('briefs-pouch');
        s += `<defs><radialGradient id="${pid}" gradientUnits="userSpaceOnUse" cx="${bx(304)}" cy="${by(306)}" r="${r2(84 * BS)}">` +
          '<stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
          `<path d="${BR.pouchA}" fill="url(#${pid})"/>`;
      }
      BR.fold[front ? 'front' : 'back'].forEach(d => { s += two(d, 'fd'); });
      if (front) {
        s += two(BR.pouch, 'ol thin') + two(BR.pouchS, 'st') + two(BR.pouchS2, 'st') +
          `<path d="${BR.centre}" class="ol thin"/>` + BR.pcS.map(d => `<path d="${d}" class="st"/>`).join('');
      } else {
        s += `<path d="${BR.cb}" class="ol thin"/>` + BR.cbS.map(d => `<path d="${d}" class="st"/>`).join('');
      }
      BR.hemS.forEach(d => { s += two(d, 'st'); });
      s += two(BR.legOl, 'ol');
      s += waistband('briefs', BR.band, o, FM.garments.briefs.zones[view], view, BR.bandS);
      return s;
    },
  });
})();
