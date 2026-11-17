/* Kusovky (solo-b): garment types whose art has to follow the cloth.
     fairisle    knitted crew-neck sweater with wide bands of pixel ornament across the chest and
                 round both upper sleeves (narrow bands above hem and cuffs). Hoodie scale, 1 cm ≈ 3.8.
     fairbeanie  rib beanie with the same ornament band knitted round the turned-up cuff. cm = 19.
     scarflay    knitted scarf laid flat in a loose S, so a print along its whole length reads.
                 cm = 5.4. Its centreline is exposed (FM.garments.scarflay.geo) for decoration
                 that has to run along the cloth.
   Ornament: small pixel matrices (eight-point star, diamond, wolf teeth, chain) on one square grid,
   assembled into one band tile and repeated through an SVG <pattern>, so a band costs a handful
   of elements. Letters are 3 × 5 pixel glyphs set into the star row as a medallion. The motifs are
   our own construction on the grid, in the spirit of Slovak cross-stitch and Čičmany painting. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;
  const r2 = n => +n.toFixed(2);

  /* ═══ PIXEL ORNAMENT ════════════════════════════════════════════════════
     Matrices: 'X' main yarn, 'o' accent yarn, '.' ground. */

  /* Eight-point star, 13 × 13: a square and a diamond laid over each other, hollow diamond
     centre with a dot, slits on the diagonals so the eight points read as petals. */
  const STAR = (() => {
    const out = [];
    for (let y = -6; y <= 6; y++) {
      let row = '';
      for (let x = -6; x <= 6; x++) {
        const ax = Math.abs(x), ay = Math.abs(y);
        let on = Math.max(ax, ay) <= 4 || ax + ay <= 6;
        if (ax + ay <= 2 && (ax || ay)) on = false;            // hollow centre, dot stays
        if (ax === ay && ax >= 2 && ax <= 3) on = false;        // diagonal slits
        row += on ? 'X' : '.';
      }
      out.push(row);
    }
    return out;
  })();
  const DIAMOND = ['..X..', '.X.X.', 'X.X.X', '.X.X.', '..X..'];   // small diamond, dot inside
  const TEETH = ['XXXXX', '.XXX.', '..X..'];                       // wolf teeth hanging from a line
  const CHAIN = ['.o..', 'o.o.', '.o..'];                          // chain of small rings (accent)
  const SALTIRE = ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'];   // cross-stitch crosses
  const PLUS = ['..X..', '..X..', 'XXXXX', '..X..', '..X..'];

  /* 3 × 5 pixel glyphs for the medallion. */
  const GL = {
    F: ['XXX', 'X..', 'XX.', 'X..', 'X..'], I: ['XXX', '.X.', '.X.', '.X.', 'XXX'],
    T: ['XXX', '.X.', '.X.', '.X.', '.X.'], S: ['XXX', 'X..', 'XXX', '..X', 'XXX'],
    U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'], '0': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
    '2': ['XXX', '..X', 'XXX', 'X..', 'XXX'], '3': ['XXX', '..X', '.XX', '..X', 'XXX'],
  };
  const glyphRow = (word, y) => [...word].map(c => (GL[c] || GL.I)[y]).join('.');

  /* A band row group: motif lines repeated every `period` columns, first copy at column `at`.
     Columns are counted from the left edge of a star (star centre = column 6). */
  const grp = (lines, period, at) => ({ lines, period, at, h: lines.length });
  const BLANK = grp(['.'], 1, 0), SOLID = grp(['X'], 1, 0);
  const STAR_ROW = grp(STAR.map((l, i) => l + '...' + (i >= 4 && i <= 8 ? DIAMOND[i - 4] : '.....') + '...'), 24, 0);
  /* plus over every star and diamond, saltire between them */
  const CROSS_ROW = grp(SALTIRE.map((l, i) => l + '.' + PLUS[i] + '.'), 12, 10);
  /* Wide band, 33 rows: line, teeth, crosses, star row, chain (the one accent row), teeth, line. */
  const WIDE = [SOLID, grp(TEETH, 6, 4), BLANK, CROSS_ROW, BLANK, STAR_ROW, BLANK, grp(CHAIN, 4, 5), BLANK,
    grp(TEETH.slice().reverse(), 6, 4), SOLID];
  /* Narrow band, 9 rows: line, teeth down, gap, teeth up (offset half a tooth), line. */
  const NARROW = [SOLID, grp(TEETH, 6, 4), BLANK, grp(TEETH.slice().reverse(), 6, 1), SOLID];
  const STAR_TOP = 11;                                  // first row of the star row in WIDE

  const mod = (a, n) => ((a % n) + n) % n;
  /* Band as an array of strings, columns c0 … c0 + n − 1. */
  const bandRows = (spec, c0, n) => {
    const rows = [];
    spec.forEach(g => g.lines.forEach(line => {
      let s = '';
      for (let c = c0; c < c0 + n; c++) { const k = mod(c - g.at, g.period); s += k < line.length ? line[k] : '.'; }
      rows.push(s);
    }));
    return rows;
  };
  /* Stamp a two-line medallion (3 × 5 glyphs) over the star at column 6 of the star row. */
  const medallion = (rows, c0, lines) => {
    const out = rows.slice(), y0 = STAR_TOP;
    for (let y = 0; y < 13; y++) {                     // clear the star and its gaps (cols −3 … 15)
      const row = out[y0 + y].split('');
      for (let c = -3; c <= 15; c++) if (c - c0 >= 0 && c - c0 < row.length) row[c - c0] = '.';
      out[y0 + y] = row.join('');
    }
    lines.forEach((word, li) => {
      const w = word.length * 4 - 1, left = 6 - Math.floor(w / 2);
      for (let y = 0; y < 5; y++) {
        const row = out[y0 + 1 + li * 6 + y].split(''), g = glyphRow(word, y);
        for (let i = 0; i < g.length; i++) if (g[i] === 'X' && left + i - c0 >= 0 && left + i - c0 < row.length) row[left + i - c0] = 'X';
        out[y0 + 1 + li * 6 + y] = row.join('');
      }
    });
    return out;
  };
  /* Pixel matrix → one path per yarn, horizontal runs merged. */
  const pixPath = (rows, x0, y0, p, ch) => {
    let d = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] !== ch) continue;
        let e = x; while (e + 1 < row.length && row[e + 1] === ch) e++;
        d += `M${r2(x0 + x * p)},${r2(y0 + y * p)}h${r2((e - x + 1) * p)}v${p}h${r2(-(e - x + 1) * p)}z`;
        x = e;
      }
    });
    return d;
  };
  const yarns = (rows, x0, y0, p, o) => {
    const a = pixPath(rows, x0, y0, p, 'X'), b = pixPath(rows, x0, y0, p, 'o');
    return (a ? `<path d="${a}" style="fill:${o.yarn}"/>` : '') + (b ? `<path d="${b}" style="fill:${o.accent}"/>` : '');
  };
  const TILE = { wide: bandRows(WIDE, 0, 24), narrow: bandRows(NARROW, 0, 24) };
  const bandH = (spec, p) => spec.reduce((n, g) => n + g.h, 0) * p;

  /* Knitted piece with ornament inside: ground, ornament, then the knit shading on top, so the
     ornament shares the knit texture and grain. */
  const piece = (d, inner, o = {}) => `<path d="${d}" style="fill:${o.fill || 'var(--body)'}"/>` + (inner || '') +
    (o.shade === false ? '' : `<path d="${d}" fill="url(#g-shade)"/><path d="${d}" fill="url(#g-vshade)"/>`) +
    `<path d="${d}" fill="url(#g-${o.tex || 'knit'})"/>` +
    `<path d="${d}" fill="url(#g-noise)" class="nz"/><path d="${d}" fill="url(#g-heather)" class="ht"/>` +
    (o.ol === '' ? '' : `<path d="${o.ol || d}" class="ol"/>`);

  /* ═══ FAIRISLE: knitted crew-neck sweater ═══════════════════════════════
     Geometry from garments-sweats (crew neck, hoodie sleeve, cuffs and hem). */
  const P = p => `${r2(p[0])},${r2(p[1])}`;
  const seg = (a, b) => [[a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3],
    [a[0] + (b[0] - a[0]) * 2 / 3, a[1] + (b[1] - a[1]) * 2 / 3], b];
  const poly = (...ps) => ps.slice(1).reduce((e, p, i) => e.concat(seg(ps[i], p)), [ps[0]]);
  const sym = e => e.concat(e.slice(0, -1).reverse().map(p => [640 - p[0], p[1]]));
  const mirE = e => e.map(p => [640 - p[0], p[1]]);
  const curves = e => { let s = ''; for (let i = 1; i < e.length; i += 3) s += ` C${P(e[i])} ${P(e[i + 1])} ${P(e[i + 2])}`; return s; };
  const path = e => `M${P(e[0])}` + curves(e);
  const lerpE = (a, b, f) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * f, p[1] + (b[i][1] - p[1]) * f]);
  const strip = (a, b, f1 = 0, f2 = 1) => {
    const A = lerpE(a, b, f1), B = lerpE(a, b, f2).reverse();
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
  const band = (a, b, flat) => {
    const d = strip(a, b);
    return fab(d, { rib: true, tex: flat ? 'rib' : null, ol: '' }) + (flat ? '' : wales(a, b)) + `<path d="${d}" class="ol"/>`;
  };

  const SLEEVE = 'M176,196 C150,214 128,286 118,360 L98,552 L158,560 L166,420 C172,370 186,336 204,312 Q166,260 176,196 Z';
  const TAIL = ' L464,196 Q474,260 436,312 L440,584 L200,584 L204,312 Q166,260 176,196 Z';
  const CUFF = [poly([98, 552], [158, 560]), poly([102, 606], [154, 612])];
  const HEM = [poly([200, 584], [440, 584]), poly([206, 630], [434, 630])];
  const CR = {
    fold: sym([[283, 160], [285, 184], [300, 194], [320, 194]]),
    seam: sym([[270, 162], [272, 194], [294, 207], [320, 207]]),
    bFold: [[283, 160], [297, 166], [343, 166], [357, 160]],
    bSeam: [[283, 161], [298, 180], [342, 180], [357, 161]],
    kFold: [[282, 157], [296, 166], [344, 166], [358, 157]],
    kSeam: [[268, 162], [286, 179], [354, 179], [372, 162]],
  };
  const FOLDS = ['M152,262 C142,296 137,326 134,350', 'M126,446 C137,452 149,452 161,447', 'M121,486 C133,492 146,492 157,487', 'M219,334 C232,356 238,388 236,418'];
  const both = (d, cls) => `<path d="${d}" class="${cls}"/><path d="${mir(d)}" class="${cls}"/>`;
  const inside = (backSeam, frontFold, id) => {
    const r = frontFold.slice().reverse(), d = path(backSeam) + ` L${P(r[0])}` + curves(r) + ' Z';
    return `<path d="${d}" style="fill:var(--rib)"/><path d="${d}" fill="url(#${id})"/>`;
  };

  const FI = { p: 3.2, top: 222 };                      // pixel 3.2 units (0.84 cm); chest band top
  FI.h = bandH(WIDE, FI.p);                             // 105.6 units, 28 cm
  FI.mid = FI.top + FI.h / 2;
  FI.pivot = [181, FI.mid];                             // armhole at the band's mid height
  FI.rot = 8.4;                                         // sleeve axis leans 8.4° off vertical
  FI.slvC = -24;                                        // sleeve centre, along the band from the pivot
  FI.hem = 548;                                         // narrow band above the hem rib
  FI.cuff = [128, 556];                                 // cuff seam centre (left sleeve)

  FM.register('fairisle', {
    label: 'Pletený sveter s ornamentom',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 386, y: 356 },            // wearer's left chest, below the band (band y 222–328)
        chestC: { x: 320, y: 275, w: 230 },    // centre of the chest band; the medallion sits here
        band: { x: 320, y: 275, w: 236, top: 222, bottom: 328 },  // the wide band on the body
        hipL: { x: 410, y: 534 },              // wearer's left hip above the narrow hem band (small label)
        sleeveR: { x: 136, y: 486, rot: -84.5 }, // forearms, as on the hoodie
        sleeveL: { x: 505, y: 452, rot: 84 },
      },
      back: {
        nape: { x: 320, y: 196 },              // under the back neck band, above the ornament
        backC: { x: 320, y: 436, w: 210, top: 336, bottom: 540 }, // plain knit between the bands
        hem: { x: 320, y: 538 },               // above the narrow hem band
      },
    },
    /* opts: medallion ['FIIT', '2003'] → two lines of pixel letters in place of the centre star
             (front only); yarn / accent → CSS colours of the ornament (default var(--d1), var(--d2));
             narrow (default true) → narrow bands above hem and cuffs */
    draw(view, o, deco) {
      const front = view === 'front', p = FI.p;
      const col = { yarn: o.yarn || 'var(--d1)', accent: o.accent || 'var(--d2)' };
      const id = FM.uid('fairisle-');
      const tw = 24 * p;
      const pat = (name, rows) => `<pattern id="${id}${name}" patternUnits="userSpaceOnUse" width="${r2(tw)}" height="${r2(rows.length * p)}">` +
        yarns(rows, 0, 0, p, col) + '</pattern>';
      const body = path(front ? CR.seam : CR.kSeam) + TAIL;
      let s = `<defs><linearGradient id="${id}in" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="290">` +
        '<stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>' +
        pat('w', TILE.wide) + pat('n', TILE.narrow) +
        `<clipPath id="${id}b"><path d="${body}"/></clipPath>` +
        `<clipPath id="${id}l"><path d="${SLEEVE}"/></clipPath><clipPath id="${id}r"><path d="${mir(SLEEVE)}"/></clipPath></defs>`;
      /* Pattern tiles start at local x = 0, so each band is shifted until a star column is
         centred on cx; the rect spans x0…x1 (it is clipped to the piece anyway). */
      const tiled = (name, y, h, cx, x0, x1) => {
        const shift = r2(mod(cx - 6.5 * p, tw));
        return `<g transform="translate(${shift} ${r2(y)})"><rect x="${r2(x0 - shift)}" y="0" width="${r2(x1 - x0)}" height="${r2(h)}" fill="url(#${id}${name})"/></g>`;
      };
      const nH = bandH(NARROW, p);
      const sleeveBands = side => {
        const sx = side ? -1 : 1, pv = side ? [640 - FI.pivot[0], FI.pivot[1]] : FI.pivot;
        const cf = side ? [640 - FI.cuff[0], FI.cuff[1]] : FI.cuff;
        const rot = sx * FI.rot;
        /* bands in a frame rotated about the pivot: local x along the band, star on the sleeve axis */
        const wide = `<g transform="rotate(${rot} ${pv[0]} ${pv[1]})">` +
          tiled('w', pv[1] - FI.h / 2, FI.h, pv[0] + sx * FI.slvC, pv[0] - 130, pv[0] + 130) + '</g>';
        const narrow = o.narrow === false ? '' : `<g transform="rotate(${rot} ${cf[0]} ${cf[1]})">` +
          tiled('n', cf[1] - 10 - nH, nH, cf[0], cf[0] - 70, cf[0] + 70) + '</g>';
        return `<g clip-path="url(#${id}${side ? 'r' : 'l'})">${wide}${narrow}</g>`;
      };
      s += piece(SLEEVE, sleeveBands(0)) + piece(mir(SLEEVE), sleeveBands(1));
      s += band(CUFF[0], CUFF[1], 1) + band(mirE(CUFF[0]), mirE(CUFF[1]), 1);

      /* body: wide band across the chest, narrow band above the hem */
      let orn = tiled('w', FI.top, FI.h, 320, 160, 480);
      if (front && o.medallion) {
        const c0 = -3, rows = medallion(bandRows(WIDE, c0, 19), c0, o.medallion).slice(STAR_TOP, STAR_TOP + 13);
        const x0 = 320 - 6.5 * p + c0 * p, y0 = FI.top + STAR_TOP * p;
        orn += `<rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(19 * p)}" height="${r2(13 * p)}" style="fill:var(--body)"/>` +
          yarns(rows, x0, y0, p, col);
      }
      if (o.narrow !== false) orn += tiled('n', FI.hem, nH, 320, 160, 480);
      s += piece(body, `<g clip-path="url(#${id}b)">${orn}</g>`);
      s += band(HEM[0], HEM[1], 1);

      FOLDS.forEach(d => { s += both(d, 'fd'); });
      if (o.narrow === false) s += '<path d="M236,576 C262,569 292,570 312,577" class="fd"/><path d="M330,577 C354,570 384,569 406,575" class="fd"/>';
      s += both('M181,200 Q172,258 207,309', 'st') + both('M101,546 L157,553', 'st');
      if (front) {
        s += inside(CR.bSeam, CR.fold, `${id}in`) + band(CR.bFold, CR.bSeam);
        s += `<path d="${path(lerpE(CR.fold, CR.seam, 1.3))}" class="st"/>` + band(CR.fold, CR.seam);
      } else {
        s += `<path d="${path(lerpE(CR.kFold, CR.kSeam, 1.3))}" class="st"/>` + band(CR.kFold, CR.kSeam);
      }
      return s + (deco || '');
    },
  });

  /* ═══ FAIRBEANIE: rib beanie, ornament round the cuff ═══════════════════
     Geometry from garments-head (beanie): 21 cm wide, 22 cm tall, cuff y 500/510 → 618/630.
     The band follows the curve of the cuff: every pixel column sits on the cuff's own rows. */
  const lerp = (a, b, f) => a + (b - a) * f;
  const BN = { ys0: 500, yc0: 510, ys1: 618, yc1: 630, xl0: 121, xl1: 119 };
  const bnAt = f => ({ ys: lerp(BN.ys0, BN.ys1, f), yc: lerp(BN.yc0, BN.yc1, f), xl: lerp(BN.xl0, BN.xl1, f) });
  const bnEdge = (f, back) => {
    const { ys, yc, xl } = bnAt(f), xr = 640 - xl, k = r2(ys + (yc - ys) * .8);
    return back
      ? `C${r2(xr - 70)},${k} 380,${r2(yc)} 320,${r2(yc)} C260,${r2(yc)} ${r2(xl + 70)},${k} ${r2(xl)},${r2(ys)}`
      : `C${r2(xl + 70)},${k} 260,${r2(yc)} 320,${r2(yc)} C380,${r2(yc)} ${r2(xr - 70)},${k} ${r2(xr)},${r2(ys)}`;
  };
  const bnBand = (f0, f1) => {
    const a = bnAt(f0), b = bnAt(f1);
    return `M${r2(a.xl)},${r2(a.ys)} ${bnEdge(f0)} L${r2(640 - b.xl)},${r2(b.ys)} ${bnEdge(f1, true)} Z`;
  };
  /* y of the cuff line at fraction f, for a given x (left half of the curve, mirrored) */
  const bnY = (f, x) => {
    const { ys, yc, xl } = bnAt(f), k = ys + (yc - ys) * .8, X = x > 320 ? 640 - x : x;
    const cx = [xl, xl + 70, 260, 320], cy = [ys, k, yc, yc];
    const B = (c, t) => { const v = 1 - t; return v * v * v * c[0] + 3 * v * v * t * c[1] + 3 * v * t * t * c[2] + t * t * t * c[3]; };
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (B(cx, m) < X) lo = m; else hi = m; }
    return B(cy, (lo + hi) / 2);
  };
  const BNG = 'M126,522 C123,440 126,364 144,316 C172,242 240,208 320,208 C400,208 468,242 496,316 C514,364 517,440 514,522 Z';
  const rngLCG = seed => { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };
  const fabT = (d, o = {}) => {
    const ol = o.ol === undefined ? d : o.ol;
    return fab(d, Object.assign({}, o, { grain: false, ol: '' })) + `<path d="${d}" fill="url(#g-noise)" class="nz"/>` + (ol ? `<path d="${ol}" class="ol"/>` : '');
  };
  /* Pom-pom (as on the beanie in garments-head), in var(--trim). */
  const pom = (cx, cy, rad) => {
    const N = 52, R = rngLCG(5); let d = '';
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2, k = i === N ? 1 : .985 + .03 * R();
      const px = cx + rad * k * Math.cos(a), py = cy + rad * k * Math.sin(a);
      if (!i) { d = `M${r2(px)},${r2(py)}`; continue; }
      const am = ((i - .5) / N) * Math.PI * 2 - Math.PI / 2, b = rad * (1.03 + .06 * R());
      d += ` Q${r2(cx + b * Math.cos(am))},${r2(cy + b * Math.sin(am))} ${r2(px)},${r2(py)}`;
    }
    d += ' Z';
    let dk = '', lt = '';
    const T = rngLCG(11);
    for (let i = 0; i < 64; i++) {
      const rr = rad * Math.sqrt(T()) * .9, a = T() * Math.PI * 2;
      const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      const dir = a + (T() - .5) * .9, len = 6 + 9 * T() * (.4 + rr / rad);
      const x1 = x + len * Math.cos(dir), y1 = y + len * Math.sin(dir);
      const qx = (x + x1) / 2 + 2.2 * Math.cos(dir + 1.57), qy = (y + y1) / 2 + 2.2 * Math.sin(dir + 1.57);
      const t = `M${r2(x)},${r2(y)} Q${r2(qx)},${r2(qy)} ${r2(x1)},${r2(y1)}`;
      if (i % 3) dk += t; else lt += t;
    }
    const gid = FM.uid('fairbeanie-pom');
    return `<defs><radialGradient id="${gid}" cx=".4" cy=".36" r=".72">` +
      '<stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset=".78" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></radialGradient></defs>' +
      fabT(d, { fill: 'var(--trim)', tex: null, ol: '' }) + `<path d="${d}" fill="url(#${gid})"/>` +
      `<path d="${dk}" fill="none" stroke="rgba(0,0,0,.17)" stroke-width="1.3" stroke-linecap="round"/>` +
      `<path d="${lt}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.1" stroke-linecap="round"/>` +
      `<path d="${d}" class="ol"/>`;
  };
  /* Ornament on the cuff: column by column, each pixel row on the cuff's own curve. */
  const BB = { fa: .115, fb: .955, pw: 3.06 };            // band clear of the fold crease at the top
  const cuffOrnament = (o, col) => {
    const c0 = Math.floor((114 - (320 - 6.5 * BB.pw)) / BB.pw), nc = Math.ceil(412 / BB.pw) + 2;
    const rows0 = bandRows(WIDE, c0, nc), n = rows0.length;
    const rows = o.medallion ? medallion(rows0, c0, o.medallion) : rows0;
    const x0 = 320 - 6.5 * BB.pw + c0 * BB.pw;
    let dX = '', dO = '';
    for (let c = 0; c < rows[0].length; c++) {
      const x = x0 + c * BB.pw, xm = x + BB.pw / 2;
      if (x + BB.pw < 114 || x > 526) continue;
      const yt = bnY(0, xm), yb = bnY(1, xm), yr = k => yt + (yb - yt) * (BB.fa + (BB.fb - BB.fa) * k / n);
      for (let y = 0; y < n; y++) {
        const ch = rows[y][c];
        if (ch !== 'X' && ch !== 'o') continue;
        let e = y; while (e + 1 < n && rows[e + 1][c] === ch) e++;
        const t = `M${r2(x)},${r2(yr(y))}h${BB.pw}V${r2(yr(e + 1))}h${-BB.pw}z`;
        if (ch === 'X') dX += t; else dO += t;
        y = e;
      }
    }
    return `<path d="${dX}" style="fill:${col.yarn}"/>` + (dO ? `<path d="${dO}" style="fill:${col.accent}"/>` : '');
  };

  FM.register('fairbeanie', {
    label: 'Čiapka s ornamentom',
    views: ['front'],
    cm: 19,
    shadow: { cx: 320, cy: 647, rx: 214, ry: 14 },
    zones: {
      front: {
        cuff: { x: 320, y: 570, w: 300 },   // middle of the cuff (the ornament band fills about y 515–625)
        crown: { x: 320, y: 450, w: 280 },  // plain rib crown just above the cuff
        crownL: { x: 418, y: 470, w: 60 },  // wearer's left on the crown (small woven tab)
      },
    },
    /* opts: pom (bool), medallion ['FIIT', 'STU'] → pixel letters in place of the centre star,
             yarn / accent → ornament colours (default var(--d1), var(--d2)); pom in var(--trim) */
    draw(view, o, deco) {
      const col = { yarn: o.yarn || 'var(--d1)', accent: o.accent || 'var(--d2)' };
      const id = FM.uid('fairbeanie-');
      const cuff = bnBand(0, 1);
      let s = `<defs><clipPath id="${id}c"><path d="${cuff}"/></clipPath></defs>`;
      s += fab(BNG, { tex: 'rib' });
      s += '<path d="M222,236 C250,252 288,258 320,258 C352,258 390,252 418,236" class="ol thin" style="opacity:.45"/>' +
        '<path d="M320,212 L320,256" class="ol thin" style="opacity:.45"/>';
      ['M174,488 C182,456 186,424 184,392', 'M244,490 C250,468 252,446 250,424'].forEach(d => { s += both(d, 'fd'); });
      if (o.pom) s += pom(320, 190, 80);
      s += piece(cuff, `<g clip-path="url(#${id}c)">${cuffOrnament(o, col)}</g>`, { fill: 'var(--rib)', tex: 'rib', ol: '' });
      const f7 = bnAt(.075);
      s += `<path d="${bnBand(0, .06)}" fill="rgba(255,255,255,.07)"/>` +
        `<path d="M${r2(f7.xl)},${r2(f7.ys)} ${bnEdge(.075)}" class="fd" style="stroke-width:1.6"/>` +
        `<path d="${cuff}" class="ol"/>`;
      return s + (deco || '');
    },
  });

  /* ═══ SCARFLAY: knitted scarf laid flat in a loose S ════════════════════
     cm = 5.4: 24 cm wide, about 172 cm long, fringe 7 cm. The centreline is three straight legs
     (bottom → right, diagonal ↖, top → right) joined by two 135° bends, point-symmetric about
     (320, 345). Arc length s runs from the start (bottom left) to the end (top right), so a print
     along it climbs the S; offsets are measured to the left of travel, i.e. towards the top of the
     cloth as it reads. Both straight legs read left to right; the diagonal reads upside down. */
  const SL = (() => {
    const W = 130, H = W / 2, R = 95, Y1 = 130, Y3 = 560, X0 = 140, X3 = 500, s45 = Math.SQRT1_2;
    const dxc = 4 * R * s45 - ((Y3 - R) - (Y1 + R));
    const C1 = [320 - dxc / 2, Y3 - R], C2 = [320 + dxc / 2, Y1 + R];
    const E1 = [C1[0] + R * s45, C1[1] - R * s45], S2 = [C2[0] - R * s45, C2[1] + R * s45];
    const segs = [
      { k: 'L', a: [X0, Y3], b: [C1[0], Y3] },
      { k: 'A', c: C1, R, a0: Math.PI / 2, cw: false, sw: 3 * Math.PI / 4 },
      { k: 'L', a: E1, b: S2 },
      { k: 'A', c: C2, R, a0: 3 * Math.PI / 4, cw: true, sw: 3 * Math.PI / 4 },
      { k: 'L', a: [C2[0], Y1], b: [X3, Y1] },
    ];
    let s = 0;
    segs.forEach(g => { g.len = g.k === 'L' ? Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) : g.R * g.sw; g.s0 = s; s += g.len; });
    return { W, H, R, segs, L: s, C1, C2, fr: 38 };
  })();
  const segAt = s => SL.segs.find(g => s <= g.s0 + g.len + 1e-6) || SL.segs[SL.segs.length - 1];
  /* Point at arc length s, offset `off` to the left of travel: {x, y, tx, ty, deg}. */
  const at = (s, off = 0) => {
    s = Math.max(0, Math.min(SL.L, s));
    const g = segAt(s), u = s - g.s0;
    let x, y, tx, ty;
    if (g.k === 'L') {
      tx = (g.b[0] - g.a[0]) / g.len; ty = (g.b[1] - g.a[1]) / g.len;
      x = g.a[0] + tx * u + ty * off; y = g.a[1] + ty * u - tx * off;
    } else {
      const sg = g.cw ? 1 : -1, a = g.a0 + sg * u / g.R, rr = g.R + sg * off;
      tx = -Math.sin(a) * sg; ty = Math.cos(a) * sg;
      x = g.c[0] + rr * Math.cos(a); y = g.c[1] + rr * Math.sin(a);
    }
    return { x, y, tx, ty, deg: Math.atan2(ty, tx) * 180 / Math.PI };
  };
  /* Path along the cloth from s0 to s1 (either direction) at a constant offset, exact arcs. */
  const edge = (s0, s1, off = 0, cmd = 'M') => {
    const fwd = s1 >= s0, lo = Math.min(s0, s1), hi = Math.max(s0, s1);
    const cuts = SL.segs.map(g => g.s0).filter(c => c > lo + 1e-6 && c < hi - 1e-6);
    const pts = [s0].concat(fwd ? cuts : cuts.reverse(), [s1]);
    const p0 = at(s0, off);
    let d = `${cmd}${r2(p0.x)},${r2(p0.y)}`;
    for (let i = 1; i < pts.length; i++) {
      const g = segAt((pts[i - 1] + pts[i]) / 2), p = at(pts[i], off);
      if (g.k === 'L') d += ` L${r2(p.x)},${r2(p.y)}`;
      else { const rr = r2(g.R + (g.cw ? off : -off)); d += ` A${rr},${rr} 0 0 ${g.cw === fwd ? 1 : 0} ${r2(p.x)},${r2(p.y)}`; }
    }
    return d;
  };
  /* Closed region of the cloth between arc lengths s0…s1 and offsets o0…o1. */
  const region = (s0, s1, o0, o1) => edge(s0, s1, o1) + edge(s1, s0, o0, ' L') + ' Z';

  const scFringe = (s, dir, seed) => {
    let out = '', inn = '';
    const n = 28, step = SL.W / n;
    for (let i = 0; i < n; i++) {
      const off = -SL.H + step * (i + .5), b = at(s, off), tx = b.tx * dir, ty = b.ty * dir, nx = ty, ny = -tx;
      const len = SL.fr + 3.2 * Math.sin(i * 1.7 + seed) + 1.6 * Math.cos(i * 3.1), sw = 1.8 * Math.sin(i * 2.3 + seed);
      const pt = (f, k) => `${r2(b.x + tx * len * f + nx * sw * k)},${r2(b.y + ty * len * f + ny * sw * k)}`;
      const d = `M${r2(b.x - tx * 2)},${r2(b.y - ty * 2)} C${pt(.35, .1)} ${pt(.7, .5)} ${pt(1, 1)}`;
      out += d; inn += d;
    }
    const e0 = at(s, -SL.H + 2), e1 = at(s, SL.H - 2);
    return `<path d="${out}" fill="none" style="stroke:var(--line)" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="${inn}" fill="none" style="stroke:var(--body)" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M${r2(e0.x + e0.tx * dir * 5)},${r2(e0.y + e0.ty * dir * 5)} L${r2(e1.x + e1.tx * dir * 5)},${r2(e1.y + e1.ty * dir * 5)}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2.4"/>`;
  };
  /* Bunching on the inside of each bend: short creases fanning from the inner edge. */
  const scCreases = () => {
    let d = '';
    const fan = (C, angs, r0, r1) => angs.forEach(a => {
      const t = a * Math.PI / 180, b = t + .12;
      d += `M${r2(C[0] + r0 * Math.cos(t))},${r2(C[1] + r0 * Math.sin(t))} Q${r2(C[0] + (r0 + r1) / 2 * Math.cos(b))},${r2(C[1] + (r0 + r1) / 2 * Math.sin(b))} ${r2(C[0] + r1 * Math.cos(t))},${r2(C[1] + r1 * Math.sin(t))}`;
    });
    fan(SL.C1, [62, 22, -16], SL.R - SL.H + 4, SL.R - SL.H + 30);
    fan(SL.C2, [162, 202, 240], SL.R - SL.H + 4, SL.R - SL.H + 30);
    return `<path d="${d}" class="fd"/>`;
  };

  FM.register('scarflay', {
    label: 'Šál',
    views: ['front'],
    cm: 5.4,
    shadow: false,
    geo: { L: SL.L, H: SL.H, W: SL.W, at, edge, region },
    zones: {
      front: (() => {
        const z = (s, note) => { const p = at(s); return { x: r2(p.x), y: r2(p.y), rot: r2(p.deg), w: SL.W - 20, s: r2(s), note }; };
        return {
          start: z(14),               // start of the cloth (bottom left), reading left → right
          end: z(SL.L - 14),          // end of the cloth (top right)
          mid: z(SL.L / 2),           // middle of the diagonal leg (reads upside down, rot −135)
          legBottom: z(84),           // centre of the bottom leg (the start)
          legTop: z(SL.L - 84),       // centre of the top leg (the end)
        };
      })(),
    },
    /* opts: none. Decoration that follows the cloth uses geo: at(s, off), edge(s0, s1, off),
       region(s0, s1, o0, o1); s in 0…L along the scarf, off in −H…H (+ = top of the cloth). */
    draw(view, o, deco) {
      const outline = region(0, SL.L, -SL.H, SL.H);
      let s = scFringe(0, -1, 0) + scFringe(SL.L, 1, 2);
      s += fab(outline, { tex: 'knit' });
      s += scCreases();
      s += `<path d="${edge(0, SL.L, SL.H - 5)}" class="st"/><path d="${edge(0, SL.L, -SL.H + 5)}" class="st"/>`;
      s += '<path d="M196,586 C240,590 270,589 300,584" class="fd" style="stroke-width:2"/>' +
        '<path d="M444,104 C400,100 370,101 340,106" class="fd" style="stroke-width:2"/>';
      return s + (deco || '');
    },
  });
})();
