/* Sweats: crewneck, knitted V-neck (pullover or cardigan) and the varsity jacket.
   Same scale and silhouette as the hoodie (1 cm ≈ 3.8 units, body x 200–440,
   shoulders 176/464,196, cuffs and hem at the same heights), so the four tops
   read as one family. Necklines are built from "edges", so the rib wales and the
   tipping stripes follow the curve of each band. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  /* ── geometry helpers ─────────────────────────────────────────────────────
     An edge is a poly-cubic [p0, c1, c2, p1, c1, c2, p2, …] of [x, y] points.
     Two edges with the same structure bound a band. strip() cuts the part of the
     band between fractions f1 and f2 (0 = edge a, 1 = edge b; values past 1 give
     a parallel curve outside the band), wales() draws the rib wales across it. */
  const r2 = n => +n.toFixed(2);
  const P = p => `${r2(p[0])},${r2(p[1])}`;
  const seg = (a, b) => [[a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3],
    [a[0] + (b[0] - a[0]) * 2 / 3, a[1] + (b[1] - a[1]) * 2 / 3], b];
  const poly = (...ps) => ps.slice(1).reduce((e, p, i) => e.concat(seg(ps[i], p)), [ps[0]]);
  const sym = e => e.concat(e.slice(0, -1).reverse().map(p => [640 - p[0], p[1]]));   // left half → whole
  const mirE = e => e.map(p => [640 - p[0], p[1]]);
  const curves = e => { let s = ''; for (let i = 1; i < e.length; i += 3) s += ` C${P(e[i])} ${P(e[i + 1])} ${P(e[i + 2])}`; return s; };
  const path = e => `M${P(e[0])}` + curves(e);
  const lerp = (a, b, f) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * f, p[1] + (b[i][1] - p[1]) * f]);
  const strip = (a, b, f1 = 0, f2 = 1) => {
    const A = lerp(a, b, f1), B = lerp(a, b, f2).reverse();
    return path(A) + ` L${P(B[0])}` + curves(B) + ' Z';
  };
  const bez = (e, k, u) => {
    const v = 1 - u, [a, b, c, d] = e.slice(3 * k, 3 * k + 4);
    return [0, 1].map(j => v * v * v * a[j] + 3 * v * v * u * b[j] + 3 * v * u * u * c[j] + u * u * u * d[j]);
  };
  const segLen = (e, k) => {
    let L = 0, p = e[3 * k];
    for (let i = 1; i <= 10; i++) { const q = bez(e, k, i / 10); L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
    return L;
  };
  /* Rib wales across a curved band, same rhythm as the #g-rib pattern (4.2 units). */
  const wales = (a, b, step = 4.2) => {
    let dk = '', lt = '';
    for (let k = 0; k < (a.length - 1) / 3; k++) {
      const n = Math.max(1, Math.round((segLen(a, k) + segLen(b, k)) / 2 / step));
      for (let i = 0; i < n; i++) {
        dk += `M${P(bez(a, k, (i + .3) / n))} L${P(bez(b, k, (i + .3) / n))}`;
        lt += `M${P(bez(a, k, (i + .78) / n))} L${P(bez(b, k, (i + .78) / n))}`;
      }
    }
    return `<path d="${dk}" style="fill:none;stroke:rgba(0,0,0,.2);stroke-width:1.3"/>` +
      `<path d="${lt}" style="fill:none;stroke:rgba(255,255,255,.07);stroke-width:.9"/>`;
  };
  /* A rib band with optional knitted-in stripes [[f1, f2, fill], …].
     o.flat: straight band (cuff, hem) → the vertical rib pattern instead of wales. */
  const band = (a, b, stripes, o = {}) => {
    const d = strip(a, b), tex = o.flat ? 'rib' : null;
    let s = fab(d, { rib: true, tex, ol: '' });
    (stripes || []).forEach(([f1, f2, fill]) => { s += fab(strip(a, b, f1, f2), { fill, tex, ol: '' }); });
    if (!o.flat) s += wales(a, b);
    return s + `<path d="${d}" class="ol"/>`;
  };
  const pair = (a, b, stripes, o) => band(a, b, stripes, o) + band(mirE(a), mirE(b), stripes, o);
  const FLAT = { flat: true };

  /* ── shared pieces: the hoodie's sleeve, cuff, side panel and hem ───────── */
  const G = {
    sleeve: 'M176,196 C150,214 128,286 118,360 L98,552 L158,560 L166,420 C172,370 186,336 204,312 Q166,260 176,196 Z',
    side: 'M204,312 L217,318 L214,584 L200,584 Z',
    tail: ' L464,196 Q474,260 436,312 L440,584 L200,584 L204,312 Q166,260 176,196 Z',   // body below the neckline
  };
  const CUFF = [poly([98, 552], [158, 560]), poly([102, 606], [154, 612])];
  const HEM = [poly([200, 584], [440, 584]), poly([206, 630], [434, 630])];
  const SLEEVE_FOLDS = ['M152,262 C142,296 137,326 134,350', 'M126,446 C137,452 149,452 161,447', 'M121,486 C133,492 146,492 157,487'];
  const BODY_FOLDS = ['M219,334 C232,356 238,388 236,418'];
  const HEM_FOLDS = '<path d="M236,576 C262,569 292,570 312,577" class="fd"/><path d="M330,577 C354,570 384,569 406,575" class="fd"/>';
  const ARM_ST = 'M181,200 Q172,258 207,309', CUFF_ST = 'M101,546 L157,553';
  const body = neck => path(neck) + G.tail;          // neck: edge from the left to the right neck point
  const both = (d, cls) => `<path d="${d}" class="${cls}"/><path d="${mir(d)}" class="${cls}"/>`;
  const folds = (list, cls = 'fd') => list.map(d => both(d, cls)).join('');

  /* Inside of the garment seen through the neck opening (below the back neck band). */
  const inDef = type => `<defs><linearGradient id="${type}-in" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="290">` +
    '<stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs>';
  const inside = (type, backSeam, frontFold) => {
    const r = frontFold.slice().reverse(), d = path(backSeam) + ` L${P(r[0])}` + curves(r) + ' Z';
    return `<path d="${d}" style="fill:var(--rib)"/><path d="${d}" fill="url(#${type}-in)"/>`;
  };

  /* ── crewneck ─────────────────────────────────────────────────────────── */
  const CR = {
    fold: sym([[283, 160], [285, 184], [300, 194], [320, 194]]),   // front band, neck edge
    seam: sym([[270, 162], [272, 194], [294, 207], [320, 207]]),   // front band, body seam
    bFold: [[283, 160], [297, 166], [343, 166], [357, 160]],        // back band seen from the front (inner face)
    bSeam: [[283, 161], [298, 180], [342, 180], [357, 161]],
    kFold: [[282, 157], [296, 166], [344, 166], [358, 157]],        // back view
    kSeam: [[268, 162], [286, 179], [354, 179], [372, 162]],
  };

  FM.register('crew', {
    label: 'Mikina bez kapucne',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 382, y: 258 },            // wearer's left chest (viewer's right), emblem centre
        chestC: { x: 320, y: 304, w: 176 },    // centre chest, free from y 232 (below the V insert) to ~430
        sleeveR: { x: 136, y: 486, rot: -84.5 }, // wearer's right forearm (viewer's left)
        sleeveL: { x: 505, y: 452, rot: 84 },  // wearer's left forearm
        hipL: { x: 410, y: 566 },              // wearer's left hip just above the hem rib (small label)
      },
      back: {
        nape: { x: 320, y: 198 },              // just under the back neck band
        backC: { x: 320, y: 350, w: 210, top: 210, bottom: 560 },
        hem: { x: 320, y: 552 },               // above the hem rib
      },
    },
    /* opts: none */
    draw(view, o, deco) {
      const front = view === 'front';
      let s = inDef('crew') + fab(G.sleeve) + fab(mir(G.sleeve)) + pair(CUFF[0], CUFF[1], null, FLAT);
      s += fab(body(front ? CR.seam : CR.kSeam)) + fab(G.side, { rib: true }) + fab(mir(G.side), { rib: true }) +
        band(HEM[0], HEM[1], null, FLAT);
      s += folds(SLEEVE_FOLDS) + folds(BODY_FOLDS) + HEM_FOLDS + both(ARM_ST, 'st') + both(CUFF_ST, 'st') +
        '<path d="M203,578 L437,578" class="st"/>';
      if (front) {
        s += inside('crew', CR.bSeam, CR.fold) + band(CR.bFold, CR.bSeam);
        s += `<path d="${path(lerp(CR.fold, CR.seam, 1.3))}" class="st"/>`;
        // the small rib V insert under the collar, with its own V of coverstitch
        s += fab('M308,204 L332,204 L320,228 Z', { rib: true }) + '<path d="M313,207.5 L320,221.5 L327,207.5" class="st"/>';
        s += band(CR.fold, CR.seam);
      } else {
        s += `<path d="${path(lerp(CR.kFold, CR.kSeam, 1.3))}" class="st"/>` + band(CR.kFold, CR.kSeam);
      }
      return s + (deco || '');
    },
  });

  /* ── knitted V-neck: pullover or cardigan ─────────────────────────────── */
  const KN = (() => {
    const xo = 266, yo = 160, yp = 272, d = 15;                  // outer V: neck point → point; band width
    const len = Math.hypot(320 - xo, yp - yo), cos = (yp - yo) / len, sin = (320 - xo) / len;
    const xi = r2(xo + d / cos), yi = r2(yp - d / sin), xr = 640 - xi;
    const yc = r2(160 + (320 - xi) / (327 - xi) * 136);          // cardigan: where the two bands cross
    return {
      yi, yc,
      vIn: poly([xi, 160], [320, yi]), vOut: poly([xo, 160], [320, yp]),         // left arm of the V
      vFold: poly([xi, 160], [320, yi], [xr, 160]),
      bFold: [[xi, 160], [297, 165], [343, 165], [xr, 160]],                     // back band, inner face
      bSeam: [[xi, 161], [298, 178], [342, 178], [xr, 161]],
      kFold: [[xi, 157], [297, 166], [343, 166], [xr, 157]],                     // back view
      kSeam: [[266, 162], [286, 178], [354, 178], [374, 162]],
      lIn: poly([xi, 160], [327, 296]), lOut: poly([266, 160], [313, 296]),      // cardigan: under band (viewer's left)
      rIn: poly([xr, 160], [313, 296], [313, 630]), rOut: poly([374, 160], [327, 296], [327, 630]), // top band + placket
      cFold: poly([xi, 160], [320, yc], [xr, 160]),
    };
  })();
  const KT = { tex: 'knit' };
  const POCKET = 'M230,480 L294,480 L294,554 Q294,560 288,560 L236,560 Q230,560 230,554 Z';
  const POCKET_ST = 'M233.5,494 L233.5,553 Q233.5,556.5 237,556.5 L287,556.5 Q290.5,556.5 290.5,553 L290.5,494';
  const WELT = [poly([230, 480], [294, 480]), poly([230, 494], [294, 494])];
  const BTN_Y = [312, 374, 436, 498, 560];
  const btnDef = '<defs><radialGradient id="knit-btn" cx=".36" cy=".3" r=".75">' +
    '<stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>';
  const button = (x, y, fill) => `<circle cx="${x}" cy="${y}" r="4.1" style="fill:${fill};stroke:var(--line)" stroke-width=".8"/>` +
    `<circle cx="${x}" cy="${y}" r="4.1" fill="url(#knit-btn)"/>` +
    `<circle cx="${x}" cy="${y}" r="2.9" fill="none" style="stroke:rgba(0,0,0,.18)" stroke-width=".6"/>` +
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) =>
      `<circle cx="${x + dx * 1.05}" cy="${y + dy * 1.05}" r=".55" style="fill:rgba(0,0,0,.5)"/>`).join('');

  FM.register('knit', {
    label: 'Pletený sveter',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 386, y: 284 },            // wearer's left chest, emblem/patch centre (clear of the V band)
        chestR: { x: 254, y: 284 },            // wearer's right chest (viewer's left)
        chestC: { x: 320, y: 352, w: 150 },    // below the V point; on the cardigan split by the placket (x 313–327)
        pocketL: { x: 378, y: 524, w: 56 },    // cardigan only: wearer's left patch pocket
        pocketR: { x: 262, y: 524, w: 56 },    // cardigan only: wearer's right patch pocket
        sleeveR: { x: 136, y: 486, rot: -84.5 },
        sleeveL: { x: 505, y: 452, rot: 84 },
      },
      back: {
        nape: { x: 320, y: 196 },
        backC: { x: 320, y: 350, w: 210, top: 205, bottom: 560 },
        hem: { x: 320, y: 556 },
      },
    },
    /* opts: cardigan (bool) — button front: placket, 5 buttons, 2 patch pockets
             tipping (bool, default true) — knitted stripes in --trim and --trim2
             btn (CSS colour of the cardigan buttons; default var(--trim2), tonal var(--rib) without tipping) */
    draw(view, o, deco) {
      const front = view === 'front', card = !!o.cardigan, tip = o.tipping !== false;
      const TP = tip ? [[.1, .24, 'var(--trim)'], [.76, .9, 'var(--trim2)']] : null;      // cardigan bands
      const TV = !tip ? null : card ? TP : [[.24, .4, 'var(--trim)'], [.56, .72, 'var(--trim2)']]; // V and back neck
      const TC = tip ? [[.13, .22, 'var(--trim)'], [.3, .39, 'var(--trim2)']] : null;     // cuffs and hem
      let s = inDef('knit') + fab(G.sleeve, KT) + fab(mir(G.sleeve), KT) + pair(CUFF[0], CUFF[1], TC, FLAT);
      const neck = !front ? KN.kSeam : poly([266, 160], [320, card ? 300 : 272], [374, 160]);
      s += fab(body(neck), KT) + band(HEM[0], HEM[1], TC, FLAT);
      s += folds(SLEEVE_FOLDS) + folds(BODY_FOLDS) + HEM_FOLDS + both(ARM_ST, 'st') + both(CUFF_ST, 'st');
      if (front) {
        if (card) {
          [POCKET, mir(POCKET)].forEach((d, i) => {
            s += fab(d, KT) + band(i ? mirE(WELT[0]) : WELT[0], i ? mirE(WELT[1]) : WELT[1],
              tip ? [[.4, .62, 'var(--trim)']] : null, FLAT);
            s += `<path d="${i ? mir(POCKET_ST) : POCKET_ST}" class="st"/>`;
          });
        }
        s += inside('knit', KN.bSeam, card ? KN.cFold : KN.vFold) + band(KN.bFold, KN.bSeam, TV);
        if (card) s += band(KN.lIn, KN.lOut, TP) + band(KN.rIn, KN.rOut, TP);
        else s += pair(KN.vIn, KN.vOut, TV);
      } else {
        s += `<path d="${path(lerp(KN.kFold, KN.kSeam, 1.3))}" class="st"/>` + band(KN.kFold, KN.kSeam, TV);
      }
      s += deco || '';
      if (front && card) s += btnDef + BTN_Y.map(y => button(320, y, o.btn || (tip ? 'var(--trim2)' : 'var(--rib)'))).join('');
      return s;
    },
  });

  /* ── varsity (letterman) jacket ───────────────────────────────────────── */
  const VJ = {
    fold: sym([[282, 150], [284, 178], [300, 190], [320, 190]]),
    seam: sym([[256, 163], [258, 198], [288, 214], [320, 214]]),
    bFold: [[282, 150], [298, 156], [342, 156], [358, 150]],
    bSeam: [[282, 152], [300, 174], [340, 174], [358, 152]],
    kFold: [[280, 150], [296, 160], [344, 160], [360, 150]],
    kSeam: [[256, 163], [280, 184], [360, 184], [384, 163]],
    welt: 'M256,466 Q257,462 261,462 L268,462 Q271,462 270,466 L249,548 Q248,552 244,552 L237,552 Q234,552 235,548 Z',
    weltSt: 'M259.5,466 L266.5,466 L246,548.5 L239,548.5 Z',
    gloss: 'M170,213 C152,246 140,298 133,356 L115,537 L123,538 L141,358 C148,302 160,253 176,221 Z',
  };
  const SNAP_Y = [202, 250, 318, 386, 454, 522, 607];
  const vjDef = '<defs><radialGradient id="varsityjkt-snap" cx=".38" cy=".34" r=".72">' +
    '<stop offset="0" stop-color="#F6F3EC"/><stop offset=".55" stop-color="#C8C2B4"/><stop offset="1" stop-color="#8A8477"/></radialGradient></defs>';
  const snap = (x, y) => `<circle cx="${x}" cy="${y}" r="4.7" fill="url(#varsityjkt-snap)" style="stroke:var(--line)" stroke-width=".8"/>` +
    `<circle cx="${x}" cy="${y}" r="2.3" fill="none" style="stroke:rgba(0,0,0,.3)" stroke-width=".7"/>`;
  const leather = d => fab(d, { fill: 'var(--trim2)', grain: false });
  const LST = 'fill:none;stroke:rgba(0,0,0,.3);stroke-width:.9;stroke-dasharray:2.6 2.2';   // stitching on leather
  const LFD = 'fill:none;stroke:rgba(0,0,0,.12);stroke-width:2.6;stroke-linecap:round';     // creases on leather

  FM.register('varsityjkt', {
    label: 'Varsity bunda',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 386, y: 286 },            // wearer's left chest (viewer's right), letter patch centre
        chestR: { x: 254, y: 286 },            // wearer's right chest
        chestC: { x: 320, y: 300, w: 120 },    // split by the front opening (edge x 313, snaps x 320)
        sleeveRup: { x: 162, y: 318, rot: 8 }, // wearer's right upper arm (viewer's left), numbers
        sleeveLup: { x: 478, y: 318, rot: -8 },
        sleeveR: { x: 136, y: 486, rot: -84.5 }, // forearms, as on the hoodie
        sleeveL: { x: 505, y: 452, rot: 84 },
      },
      back: {
        nape: { x: 320, y: 206 },              // just under the collar
        backC: { x: 320, y: 360, w: 214, top: 210, bottom: 560 },
        hem: { x: 320, y: 556 },
      },
    },
    /* opts: none. Colours: body --body, sleeves --trim2 (leather look), rib stripes --trim. */
    draw(view, o, deco) {
      const front = view === 'front';
      const SR = [[.3, .42, 'var(--trim)'], [.56, .68, 'var(--trim)']];      // cuffs and hem
      const SK = [[.2, .32, 'var(--trim)'], [.44, .56, 'var(--trim)']];      // collar
      let s = vjDef + inDef('varsityjkt') + leather(G.sleeve) + leather(mir(G.sleeve));
      s += `<path d="${VJ.gloss}" style="fill:rgba(255,255,255,.13)"/><path d="${mir(VJ.gloss)}" style="fill:rgba(255,255,255,.07)"/>`;
      s += SLEEVE_FOLDS.map(d => `<path d="${d}" style="${LFD}"/><path d="${mir(d)}" style="${LFD}"/>`).join('') +
        `<path d="${CUFF_ST}" style="${LST}"/><path d="${mir(CUFF_ST)}" style="${LST}"/>`;
      s += pair(CUFF[0], CUFF[1], SR, FLAT);
      s += fab(body(front ? VJ.seam : VJ.kSeam)) + band(HEM[0], HEM[1], SR, FLAT);
      s += folds(BODY_FOLDS) + HEM_FOLDS + both(ARM_ST, 'st') + '<path d="M203,578 L437,578" class="st"/>';
      if (front) {
        [VJ.welt, mir(VJ.welt)].forEach((d, i) => {
          s += leather(d) + `<path d="${i ? mir(VJ.weltSt) : VJ.weltSt}" style="${LST}"/>`;
        });
        s += inside('varsityjkt', VJ.bSeam, VJ.fold) + band(VJ.bFold, VJ.bSeam, SK) + band(VJ.fold, VJ.seam, SK);
        // front edge of the overlapping (wearer's left) panel, with a soft shadow on the under-lap
        s += '<path d="M309,214 L313,214 L313,584 L309,584 Z" style="fill:rgba(0,0,0,.1)"/>' +
          '<path d="M313,190 L313,630" class="ol"/><path d="M317,216 L317,580" class="st"/>';
      } else {
        s += `<path d="${path(lerp(VJ.kFold, VJ.kSeam, 1.25))}" class="st"/>` + band(VJ.kFold, VJ.kSeam, SK);
      }
      s += deco || '';
      if (front) s += SNAP_Y.map(y => snap(320, y)).join('');
      return s;
    },
  });
})();
