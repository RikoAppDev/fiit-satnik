/* Tees and polo — heavyweight boxy tee (short / long sleeve, ringer) and a piqué polo.
   Same scale and stance as the hoodie: 1 cm ≈ 3.8 units, body x 196–444,
   dropped shoulders at x 178/462 y 190, hem at y 596 (polo: front 600, back tail 610). */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  const fd = d => `<path d="${d}" class="fd"/><path d="${mir(d)}" class="fd"/>`;
  const st = d => `<path d="${d}" class="st"/><path d="${mir(d)}" class="st"/>`;
  /* the inside of the garment seen through the neck opening */
  const inside = (d, id) => `<path d="${d}" style="fill:var(--rib)"/><path d="${d}" fill="url(#${id})"/><path d="${d}" class="ol"/>`;
  /* Two points d units inside a sleeve edge O→I, sliding up the sleeve's sides
     (O→U = top edge, I→V = underarm; U, V are the nearest control points). */
  const inset = (O, I, U, V, d) => {
    const ex = I[0] - O[0], ey = I[1] - O[1], el = Math.hypot(ex, ey);
    let nx = ey / el, ny = -ex / el;
    if ((U[0] - O[0]) * nx + (U[1] - O[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const pt = (A, B) => {
      const ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy), k = d / ((ux * nx + uy * ny) / ul);
      return [+(A[0] + ux / ul * k).toFixed(2), +(A[1] + uy / ul * k).toFixed(2)];
    };
    return [pt(O, U), pt(I, V)];
  };
  const line = ([a, b]) => `M${a} L${b}`;

  /* ── tee ─────────────────────────────────────────────────────────────── */
  const TS = { O: [98, 300], I: [158, 350], U: [116, 258], V: [170, 340] };   // short sleeve hem corners
  const tIn = d => inset(TS.O, TS.I, TS.U, TS.V, d);
  const T = {
    sleeve:  'M178,190 C154,204 116,258 98,300 L158,350 C170,340 186,326 200,312 Q190,250 178,190 Z',
    band:    (([a, b]) => `M98,300 L158,350 L${b} L${a} Z`)(tIn(9)),              // ringer sleeve band, 9 units
    long:    'M178,190 C154,208 132,274 122,350 L106,550 L158,556 L166,436 C172,388 186,344 200,312 Q190,250 178,190 Z',
    cuff:    'M106,550 L158,556 L156,588 L108,584 Z',
    bodyF:   'M178,190 L276,152 C278,180 296,199 320,200 C344,199 362,180 364,152 L462,190 Q450,250 440,312 L444,596 L196,596 L200,312 Q190,250 178,190 Z',
    bodyB:   'M178,190 L277,150 Q320,164 363,150 L462,190 Q450,250 440,312 L444,596 L196,596 L200,312 Q190,250 178,190 Z',
    collarF: 'M276,152 Q320,168 364,152 C362,180 344,200 320,201 C296,200 278,180 276,152 Z',
    holeF:   'M285,156 Q320,180 355,156 C352,176 338,190 320,191 C302,190 288,176 285,156 Z',
    collarB: 'M277,150 Q320,164 363,150 L369,155 Q320,180 271,155 Z',
  };
  const TEE_DEFS = '<defs><linearGradient id="tee-in" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>';

  FM.register('tee', {
    label: 'Tričko',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 382, y: 256 },                 // wearer's left chest (viewer's right), emblem centre
        chestC: { x: 320, y: 304, w: 170 },         // centre chest print; usable y 230–440 (collar above, hem below)
        sleeveR: { x: 141, y: 310, rot: 39.8, w: 44 },   // short sleeve, wearer's right: just above the hem stitching, rot = along the hem
        sleeveL: { x: 499, y: 310, rot: -39.8, w: 44 },  // short sleeve, wearer's left
        sleeveLongR: { x: 143, y: 430, rot: -82, w: 190 }, // opts.long only: wearer's right sleeve, reads upwards; w = usable length along the sleeve
        sleeveLongL: { x: 497, y: 430, rot: 82, w: 190 },  // opts.long only: wearer's left sleeve, reads downwards (shoulder → cuff)
        hem: { x: 400, y: 572 },                    // above the hem stitching, wearer's left
        seamL: { x: 444, y: 576 },                  // wearer's left side seam just above the hem (flag label)
      },
      back: {
        nape: { x: 320, y: 192 },                   // under the collar and neck tape
        backC: { x: 320, y: 330, w: 200, top: 200, bottom: 566 },
        hem: { x: 320, y: 572 },                    // above the hem stitching, centred
        seamL: { x: 196, y: 576 },                  // wearer's left side seam (viewer's left on the back)
      },
    },
    /* opts: long (long sleeves with rib cuffs), ringer (collar + sleeve bands / cuffs in var(--trim)) */
    draw(view, o, deco) {
      const front = view === 'front';
      const rib = o.ringer ? { rib: true, fill: 'var(--trim)' } : { rib: true };
      let s = TEE_DEFS;
      if (o.long) {
        s += fab(T.long) + fab(mir(T.long)) + fab(T.cuff, rib) + fab(mir(T.cuff), rib);
      } else {
        s += fab(T.sleeve) + fab(mir(T.sleeve));
        if (o.ringer) s += fab(T.band, rib) + fab(mir(T.band), rib);
      }
      s += fab(front ? T.bodyF : T.bodyB);
      if (front) s += fab(T.collarF, rib) + inside(T.holeF, 'tee-in') + '<path d="M290,161.5 Q320,185 350,161.5" class="st"/>';
      else s += fab(T.collarB, rib);

      /* creases */
      s += fd('M210,334 C226,358 234,386 233,418');
      if (o.long) s += fd('M150,244 C140,278 134,308 131,334') + fd('M124,458 C135,464 147,464 159,459') + fd('M120,500 C131,506 144,506 156,501');
      else s += fd('M166,222 C154,240 140,260 130,278');
      s += '<path d="M236,570 C260,564 288,564 306,570" class="fd"/><path d="M334,570 C354,564 380,564 404,569" class="fd"/>';

      /* stitching: armhole, shoulder, sleeve hem (twin needle) / band / cuff seam, twin-needle body hem */
      s += st('M204,310 Q194.5,250 182.5,192.5');
      s += front ? st('M275,156 L180,193.2') : st('M269,157 L180,193.2');
      if (o.long) s += st('M106.4,545.5 L158.3,551.5');
      else if (o.ringer) s += st(line(tIn(11.5)));
      else s += st(line(tIn(6))) + st(line(tIn(9.5)));
      s += '<path d="M196.8,586 L443.2,586" class="st"/><path d="M196.8,589.5 L443.2,589.5" class="st"/>';
      if (front) {
        s += '<path d="M273,157 C275.5,183 295,203.8 320,204.6 C345,203.8 364.5,183 367,157" class="st"/>';
      } else {
        /* collar seam + neck tape (shoulder to shoulder) */
        s += '<path d="M271,158.5 Q320,183.5 369,158.5" class="st"/><path d="M272,163 Q320,188.5 368,163" class="st"/>';
      }
      return s + (deco || '');
    },
  });

  /* ── polo ────────────────────────────────────────────────────────────── */
  const PS = { O: [114, 292], I: [166, 336], U: [130, 254], V: [178, 328] };  // sleeve edge corners
  const pIn = d => inset(PS.O, PS.I, PS.U, PS.V, d);
  const P = {
    sleeve: 'M190,184 C168,198 130,254 114,292 L166,336 C178,328 192,316 206,304 C204,266 196,222 190,184 Z',
    band:   (([a, b]) => `M114,292 L166,336 L${b} L${a} Z`)(pIn(11)),
    bodyF:  'M190,184 L280,152 C290,168 302,182 311,190 L329,190 C338,182 350,168 360,152 L450,184 C444,222 436,266 434,304 L437.8,584 L436,600 L204,600 L202.2,584 L206,304 C204,266 196,222 190,184 Z',
    tail:   'M202.4,578 L437.6,578 L438,610 L202,610 Z',      // longer back panel, seen under the front hem
    bodyB:  'M190,184 L284,149 Q320,139 356,149 L450,184 C444,222 436,266 434,304 L438,610 L202,610 L206,304 C204,266 196,222 190,184 Z',
    placket:'M311,190 L329,190 L329,304 L311,304 Z',
    hole:   'M290,156 Q320,148 350,156 C346,170 338,182 329,190 L311,190 C302,182 294,170 290,156 Z',
    stand:  'M290,152 Q320,140 350,152 L344,162 Q320,153 296,162 Z',
    leaf:   'M290,151 C272,152 256,160 249,174 C252,196 262,216 276,232 L311,190 C304,178 296,164 290,151 Z',
    edge:   'M290,151 C272,152 256,160 249,174 C252,196 262,216 276,232',
    /* back collar: fold line on top, ends lie on the shoulders, outer edge (with tipping) below */
    collarB:'M284,149 Q320,139 356,149 C368,150 382,155 392,162.5 C372,176 348,184 320,184 C292,184 268,176 248,162.5 C258,155 272,150 284,149 Z',
    edgeB:  'M248,162.5 C268,176 292,184 320,184 C348,184 372,176 392,162.5',
  };
  const POLO_DEFS = '<defs>' +
    '<linearGradient id="polo-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>' +
    '<pattern id="polo-pq" width="4" height="4" patternUnits="userSpaceOnUse">' +
      '<circle cx="1" cy="1" r=".75" fill="#000" fill-opacity=".13"/><circle cx="3" cy="3" r=".75" fill="#000" fill-opacity=".13"/>' +
      '<circle cx="3" cy="1" r=".45" fill="#fff" fill-opacity=".05"/><circle cx="1" cy="3" r=".45" fill="#fff" fill-opacity=".05"/></pattern>' +
    '<radialGradient id="polo-btn" cx=".38" cy=".34" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".6" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>' +
    `<clipPath id="polo-clipF"><path d="${P.leaf}"/><path d="${mir(P.leaf)}"/></clipPath>` +
    `<clipPath id="polo-clipB"><path d="${P.collarB}"/></clipPath>` +
    '</defs>';

  /* piqué: fabric + honeycomb dots, outline last */
  const pq = d => fab(d, { ol: '' }) + `<path d="${d}" fill="url(#polo-pq)"/><path d="${d}" class="ol"/>`;
  /* flat-knit piece with tipping painted under its rib texture */
  const knit = (d, stripes) => `<path d="${d}" style="fill:var(--rib)"/>` + stripes + fab(d, { rib: true, fill: 'transparent' });
  /* collar tipping: strokes centred on the outer edge, clipped to the collar, widest first */
  const collarTip = (edges, clip, n) => {
    const w = n > 1 ? [[12.8, 'var(--trim2)'], [9.6, 'var(--rib)'], [6.8, 'var(--trim)'], [3.6, 'var(--rib)']]
                    : [[6.8, 'var(--trim)'], [3.6, 'var(--rib)']];
    return `<g clip-path="url(#${clip})" fill="none">` +
      w.map(([sw, c]) => edges.map(e => `<path d="${e}" style="stroke:${c}" stroke-width="${sw}"/>`).join('')).join('') + '</g>';
  };
  /* sleeve band tipping: lines parallel to the band edge */
  const bandTip = (n, side) => (n > 1 ? [[2.6, 'var(--trim)'], [5.4, 'var(--trim2)']] : [[3, 'var(--trim)']])
    .map(([d, c]) => { const p = line(pIn(d)); return `<path d="${side ? mir(p) : p}" style="stroke:${c}" stroke-width="1.6"/>`; }).join('');
  const button = (x, y) => `<circle cx="${x}" cy="${y}" r="4.3" style="fill:var(--rib);stroke:var(--line)" stroke-width=".8"/>` +
    `<circle cx="${x}" cy="${y}" r="4.3" fill="url(#polo-btn)"/><circle cx="${x}" cy="${y}" r="2.9" fill="none" style="stroke:var(--line)" stroke-width=".35" stroke-opacity=".6"/>` +
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<circle cx="${x + a * 1.05}" cy="${y + b * 1.05}" r=".55" style="fill:var(--line)"/>`).join('');

  FM.register('polo', {
    label: 'Polokošeľa',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 382, y: 274 },                 // wearer's left chest, emblem centre (clear of the collar point)
        chestC: { x: 320, y: 364, w: 150 },         // centre chest below the placket; usable y 320–450
        sleeveR: { x: 153, y: 298, rot: 40.2, w: 40 },  // wearer's right sleeve just above the rib band, rot = along the band
        sleeveL: { x: 487, y: 298, rot: -40.2, w: 40 }, // wearer's left sleeve
        hem: { x: 398, y: 574 },                    // above the hem stitching, wearer's left
      },
      back: {
        nape: { x: 320, y: 200 },                   // just under the collar
        backC: { x: 320, y: 340, w: 200, top: 212, bottom: 572 },
        hem: { x: 320, y: 588 },                    // above the back hem stitching, centred
      },
    },
    /* opts: tipping (true → two stripes var(--trim) + var(--trim2); 1 → one stripe var(--trim)),
             buttons (2 | 3, default 3) */
    draw(view, o, deco) {
      const front = view === 'front';
      const tip = o.tipping ? (o.tipping === 1 ? 1 : 2) : 0;
      let s = POLO_DEFS;
      if (front) s += pq(P.tail);
      s += pq(P.sleeve) + pq(mir(P.sleeve));
      s += knit(P.band, tip ? bandTip(tip, 0) : '') + knit(mir(P.band), tip ? bandTip(tip, 1) : '');
      s += pq(front ? P.bodyF : P.bodyB);
      if (front) {
        s += pq(P.placket) + inside(P.hole, 'polo-in') + fab(P.stand, { rib: true });
        s += `<path d="${P.leaf}" style="fill:var(--rib)"/><path d="${mir(P.leaf)}" style="fill:var(--rib)"/>` +
          (tip ? collarTip([P.edge, mir(P.edge)], 'polo-clipF', tip) : '') +
          fab(P.leaf, { rib: true, fill: 'transparent' }) + fab(mir(P.leaf), { rib: true, fill: 'transparent' });
      } else {
        s += knit(P.collarB, tip ? collarTip([P.edgeB], 'polo-clipB', tip) : '');
      }

      /* creases */
      s += fd('M216,326 C230,350 236,380 235,412') + fd('M178,212 C166,228 152,246 142,260');
      s += '<path d="M240,566 C262,560 288,560 306,566" class="fd"/><path d="M334,566 C354,560 378,560 400,565" class="fd"/>';

      /* stitching: armhole, shoulder, band seam, hem, vent bar tacks */
      s += st('M210,302 C208,266 200,222 194,186');
      s += front ? st('M247,167.4 L191.5,187.3') : st('M245,167.2 L191.5,187.3');
      s += st(line(pIn(13.5)));
      s += '<path d="M202.6,584 L209.4,584" class="ol"/><path d="M437.4,584 L430.6,584" class="ol"/>';
      if (front) {
        s += '<path d="M205,592 L435,592" class="st"/><path d="M202.4,604 L437.6,604" class="st"/>' +
          '<path d="M313.6,192 L313.6,301.4 L326.4,301.4 L326.4,192" class="st"/><path d="M313.6,294 L326.4,294" class="st"/>';
      } else {
        s += '<path d="M202.2,602 L437.8,602" class="st"/>';
      }
      s += deco || '';
      if (front) s += (o.buttons === 2 ? [214, 258] : [208, 240, 272]).map(y => button(320, y)).join('');
      return s;
    },
  });
})();
