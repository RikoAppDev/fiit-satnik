/* Shirts — the woven button-up shirt ("Košeľa"): oxford button-down, camp-collar short
   sleeve and a heavier overshirt, all from one type.
   Hoodie scale (1 cm ≈ 3.8 units). Body x 206–434 (overshirt 200–440), set-in shoulders
   at x 196/444 y 178, armpits y 306, long sleeves to the cuff at y ~590, short sleeves to
   y ~322, hem with shirt tails at y 626 front / 636 back, straight hem at y 606.

   Layers, bottom to top: lower cloth (sleeves, cuffs, body, panels, pockets) → deco
   clipped to that cloth → its outlines, seams and creases → collar → deco clipped to the
   collar leaves → collar outlines and seams → buttons. `deco` is placed once in <defs>
   and shown through two <use>, so an all-over print reads as printed cloth with the seams
   on top, and embroidery sits on whatever piece it is placed on. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  /* ── geometry helpers ─────────────────────────────────────────────────────
     An edge is a poly-cubic [p0, c1, c2, p1, c1, c2, p2, …] of [x, y] points.
     E(p0, seg, seg, …): a seg is [[x, y]] (straight line) or [c1, c2, p] (cubic). */
  const r2 = v => +v.toFixed(2);
  const P = p => `${r2(p[0])},${r2(p[1])}`;
  const E = (p0, ...segs) => segs.reduce((e, s) => {
    const a = e[e.length - 1], b = s[0];
    return e.concat(s.length === 1
      ? [[a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + (b[0] - a[0]) * 2 / 3, a[1] + (b[1] - a[1]) * 2 / 3], b]
      : s);
  }, [p0]);
  const curves = e => { let s = ''; for (let i = 1; i < e.length; i += 3) s += ` C${P(e[i])} ${P(e[i + 1])} ${P(e[i + 2])}`; return s; };
  const path = e => `M${P(e[0])}` + curves(e);
  const closed = e => path(e) + ' Z';
  const rev = e => e.slice().reverse();
  const mirE = e => e.map(p => [640 - p[0], p[1]]);
  const join = (a, b) => a.concat(b.slice(1));
  const sym = e => join(e, rev(mirE(e)));                 // left half that ends on x = 320 → whole outline
  const bz = (e, k, t) => {
    const [a, b, c, d] = e.slice(3 * k, 3 * k + 4), u = 1 - t;
    return [0, 1].map(j => u * u * u * a[j] + 3 * u * u * t * b[j] + 3 * u * t * t * c[j] + t * t * t * d[j]);
  };
  const bzd = (e, k, t) => {
    const [a, b, c, d] = e.slice(3 * k, 3 * k + 4), u = 1 - t;
    return [0, 1].map(j => 3 * u * u * (b[j] - a[j]) + 6 * u * t * (c[j] - b[j]) + 3 * t * t * (d[j] - c[j]));
  };
  /* Polyline parallel to edge e at distance d (d > 0 = right-hand side of the direction of
     travel on screen), between the fractions f0 and f1 of the whole edge. */
  const off = (e, d, f0 = 0, f1 = 1) => {
    const K = (e.length - 1) / 3, N = Math.max(3, Math.round(K * 14 * (f1 - f0))), pts = [];
    for (let i = 0; i <= N; i++) {
      const g = (f0 + (f1 - f0) * i / N) * K, k = Math.min(K - 1, Math.floor(g)), t = g - k;
      const p = bz(e, k, t), v = bzd(e, k, t), l = Math.hypot(v[0], v[1]) || 1;
      pts.push([p[0] - v[1] / l * d, p[1] + v[0] / l * d]);
    }
    return 'M' + pts.map(P).join(' L');
  };
  /* Two points d units inside a sleeve edge O→I, sliding along the sleeve's sides
     (U, V = the nearest control points of the top edge and the underarm). */
  const inset = (O, I, U, V, d) => {
    const ex = I[0] - O[0], ey = I[1] - O[1], el = Math.hypot(ex, ey);
    let nx = ey / el, ny = -ex / el;
    if ((U[0] - O[0]) * nx + (U[1] - O[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const pt = (A, B) => {
      const ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy), k = d / ((ux * nx + uy * ny) / ul);
      return [A[0] + ux / ul * k, A[1] + uy / ul * k];
    };
    return `M${P(pt(O, U))} L${P(pt(I, V))}`;
  };

  /* ── drawing helpers ──────────────────────────────────────────────────── */
  const cloth = (d, fill) => fab(d, { tex: 'weave', ol: '', fill });
  const ol = (d, cls = 'ol') => `<path d="${d}" class="${cls}"/>`;
  const st = d => `<path d="${d}" class="st"/>`;
  const fd = d => `<path d="${d}" class="fd"/>`;
  const two = (d, f) => f(d) + f(mir(d));
  const tack = d => `<path d="${d}" style="fill:none;stroke:var(--line)" stroke-width="1.3" stroke-linecap="round"/>`;
  const inside = d => `<path d="${d}" style="fill:var(--rib)"/><path d="${d}" fill="url(#shirt-in)"/><path d="${d}" class="ol"/>`;
  const button = (x, y, r, fill) => {
    const h = r * .3, hr = r2(r * .14);
    return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" style="fill:${fill};stroke:var(--line)" stroke-width=".7"/>` +
      `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="url(#shirt-btn)"/>` +
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) =>
        `<circle cx="${r2(x + a * h)}" cy="${r2(y + b * h)}" r="${hr}" style="fill:var(--line)" fill-opacity=".65"/>`).join('');
  };
  const DEFS = '<defs>' +
    '<linearGradient id="shirt-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>' +
    '<radialGradient id="shirt-btn" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>' +
    '</defs>';

  /* ── collars (left half or left leaf; mirror for the other side) ──────── */
  const N = [290, 152];                                                        // neck point
  /* collar on a stand (button-down): inner face of the back stand, the dark neck opening,
     the front stand between the leaves and the leaf itself (fold → front edge → point → outer edge) */
  const STAND = {
    band: 'M288,152 Q320,140 352,152 L346,160 Q320,150 294,160 Z',
    hole: 'M294,160 Q320,150 346,160 C342,174 332,184 320,185 C308,184 298,174 294,160 Z',
    stand: 'M294,160 C298,174 308,184 320,185 C332,184 342,174 346,160 L354,164 C350,184 336,198 320,199 C304,198 290,184 286,164 Z',
    leaf: E([288, 152], [[295, 165], [305, 178], [314, 187]], [[308, 200], [301, 214], [295, 228]],
      [[284, 210], [272, 190], [262, 172]], [[266, 160], [276, 153], [288, 152]]),
    back: 'M288,152 Q320,140 352,152 C362,154 372,160 378,168 C360,176 340,180 320,180 C300,180 280,176 262,168 C268,160 278,154 288,152 Z',
    backEdge: E([262, 168], [[280, 176], [300, 180], [320, 180]], [[340, 180], [360, 176], [378, 168]]),
  };
  /* camp collar: one piece, lies flat; the front turns back as a revers down to the
     top fastened button. campLeaf(vx, vy): left leaf with its break point at (vx, vy). */
  const campLeaf = (vx, vy) => E([vx, vy], [[vx - 12, vy - 30], [298, 186], N],
    [[276, 157], [251, 159], [249, 180]], [[248.4, 192], [249.4, 204], [251, 214]], [[266, 215.4]],
    [[260, 226]], [[280, 238], [vx - 22, vy - 8], [vx, vy]]);
  const CAMP = {
    band: 'M290,152 Q320,140 350,152 L345,161 Q320,151 295,161 Z',
    hole: 'M290,152 Q320,140 350,152 C344,186 334,218 320,246 C306,218 296,186 290,152 Z',
    under: campLeaf(326.5, 244),                          // wearer's right (viewer's left), its break hidden under the other
    over: mirE(campLeaf(326.5, 252)),                     // wearer's left (viewer's right), break at x 313.5
    back: 'M290,152 Q320,140 350,152 C368,153 386,160 398,171 C374,183 348,188 320,188 C292,188 266,183 242,171 C254,160 272,153 290,152 Z',
    backEdge: E([242, 171], [[266, 183], [292, 188], [320, 188]], [[348, 188], [374, 183], [398, 171]]),
  };

  /* ── pockets (drawn on the wearer's right, mirrored for the left) ─────── */
  const PK1 = {                                                // plain patch pocket, chamfered corners
    d: 'M238,262 L286,262 L286,314 L278,322 L246,322 L238,314 Z',
    st: ['M238.6,270 L285.4,270', 'M240.4,262.8 L240.4,313.2 L246.9,319.6 L277.1,319.6 L283.6,313.2 L283.6,262.8'],
    st2: 'M243.4,270.6 L243.4,312 L248.2,316.6 L275.8,316.6 L280.6,312 L280.6,270.6',
    tack: ['M238.8,262.8 L242.2,266.2', 'M285.2,262.8 L281.8,266.2'],
  };
  const PK2 = {                                                // overshirt pocket with a box pleat and a flap
    d: 'M234,258 L290,258 L290,320 Q290,324 286,324 L238,324 Q234,324 234,320 Z',
    ol: 'M234,279 L234,320 Q234,324 238,324 L286,324 Q290,324 290,320 L290,279',
    st: 'M236.4,279 L236.4,319.4 Q236.4,321.6 238.6,321.6 L285.4,321.6 Q287.6,321.6 287.6,319.4 L287.6,279',
    st2: 'M239.4,279 L239.4,318.6 L284.6,318.6 L284.6,279',
    pleat: ['M256,279 L256,323.4', 'M268,279 L268,323.4'],
    flap: 'M232,252 L292,252 L292,274 Q292,278 288,278 L236,278 Q232,278 232,274 Z',
    flapSt: 'M234.4,254.6 L234.4,273.4 Q234.4,275.6 236.6,275.6 L287.4,275.6 Q289.6,275.6 289.6,273.4 L289.6,254.6',
    flapSt2: 'M237.4,257.6 L237.4,272.6 L286.6,272.6 L286.6,257.6',
    btn: [262, 268],
  };

  FM.register('shirt', {
    label: 'Košeľa',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        field: { x: 320, y: 390, w: 460, top: 136, bottom: 640 },   // bounding box of all cloth, for all-over repeats (deco is clipped to the cloth)
        chestL: { x: 378, y: 296 },               // wearer's left chest (viewer's right); on the pocket face when there is one
        chestR: { x: 262, y: 296 },               // wearer's right chest (on the second pocket of pocket: 2)
        pocketL: { x: 378, y: 296, w: 42, top: 262 },  // wearer's left pocket face; top = top edge of the plain pocket (pocket: 2 → flap from y 252 to 278)
        cuffL: { x: 500, y: 569, rot: -7.1, w: 40 },   // long sleeves: wearer's left cuff (viewer's right), centre, rot = along the cuff
        hem: { x: 396, y: 584 },                  // above the hem, wearer's left, clear of both hem shapes
      },
      back: {
        field: { x: 320, y: 390, w: 460, top: 136, bottom: 640 },
        nape: { x: 320, y: 198 },                 // on the yoke just under the collar (inside-label position)
        yoke: { x: 320, y: 210, w: 210 },         // middle of the yoke band, collar bottom (180, camp 188) to yoke seam (232)
        backC: { x: 320, y: 390, w: 200, top: 244, bottom: 580 },  // below the yoke and box pleat
        hem: { x: 320, y: 588 },                  // above the hem, centred
      },
    },
    /* opts: collar 'button-down' (default; buttons under the points) | 'point' (same, no collar buttons)
                    | 'camp' (open one-piece camp collar, top unbuttoned in a soft V, no placket)
             short (bool) — short sleeves with a turned-up hem
             pocket 0 | 1 | 2 — 1: patch pocket on the wearer's left chest; 2: both chests, box pleat + button flap
             over (bool) — overshirt: body 6 units wider each side, straight hem, double top-stitching, bigger buttons
             tails (bool) — curved shirt-tail hem; default true, false for over and camp (straight hem with side vents)
             panels (bool) — two vertical contrast panels down the front in var(--trim) (bowling shirt)
             btn — CSS colour of the buttons (default var(--rib), tonal) */
    draw(view, o, deco) {
      const front = view === 'front', camp = o.collar === 'camp', over = !!o.over;
      const tails = o.tails != null ? !!o.tails : !(over || camp);
      const btnFill = o.btn || 'var(--rib)';
      const w = over ? 6 : 0, X = x => x - w;

      /* silhouette */
      const S = [X(196), 178], Y = [X(203), 232], U = [X(208), 306];
      const arm1 = [[X(198), 196], [X(201), 214], Y], arm2 = [[X(205), 256], [X(207), 284], U];
      const arm = E(S, arm1, arm2);
      const sideY = tails ? 562 : 606;
      const hemSeg = !tails ? [[320, 606]] : front ? [[X(209), 600], [250, 624], [320, 626]] : [[X(209), 608], [250, 634], [320, 636]];
      const neck = !front ? [[320, 146], [[306, 146], [296, 149], N]]
        : camp ? [[320, 246], [[310, 222], [298, 186], N]] : [[320, 199], [[304, 198], [291, 182], N]];
      const body = closed(sym(E(neck[0], neck[1], [S], arm1, arm2, [[X(206), sideY]], hemSeg)));
      const hemL = E([X(206), sideY], hemSeg), hem = join(hemL, rev(mirE(hemL)));
      const sleeve = closed(join(o.short
        ? E(S, [[X(172), 190], [X(142), 238], [X(124), 280]], [[X(178), 322]], [[X(188), 316], [X(198), 310], U])
        : E(S, [[X(170), 194], [X(146), 262], [X(136), 340]], [[X(118), 548]], [[X(166), 554]], [[X(174), 424]], [[X(178), 376], [X(192), 334], U]),
      rev(arm)));
      const cuff = `M${X(118)},548 L${X(166)},554 L${X(163.4)},585.6 Q${X(163)},590.6 ${X(158)},590 L${X(120.4)},586 Q${X(115.4)},585.4 ${X(115.6)},580.4 Z`;

      /* ── lower cloth ── */
      const lower = [sleeve, mir(sleeve), body];
      let s = DEFS, lines = '';
      const dc = deco ? FM.uid('shirt-dc') : '';
      if (deco) s += `<defs><g id="${dc}">${deco}</g></defs>`;
      const print = pieces => {
        if (!deco) return '';
        const c = FM.uid('shirt-cl');
        return `<clipPath id="${c}">${pieces.map(d => `<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${c})"><use href="#${dc}"/></g>`;
      };

      s += cloth(sleeve) + cloth(mir(sleeve));
      lines += two(sleeve, ol);
      if (!o.short) {
        s += cloth(cuff) + cloth(mir(cuff));
        lower.push(cuff, mir(cuff));
        lines += two(cuff, ol) + two(`M${X(118.4)},551.4 L${X(165.6)},557.4`, st) + two(`M${X(117.2)},582.4 L${X(160.4)},586.8`, st);
        if (over) lines += two(`M${X(118.1)},554.6 L${X(165.3)},560.6`, st);
      }
      s += cloth(body);
      lines += ol(body);

      if (front && o.panels) {                       // contrast panels, cut by the body outline
        const pc = FM.uid('shirt-pn'), a = X(236), b = X(256);
        const pn = `M${a},140 L${b},140 L${b},650 L${a},650 Z`;
        const clip = `<clipPath id="${pc}"><path d="${body}"/></clipPath>`;
        s += clip + `<g clip-path="url(#${pc})">${cloth(pn, 'var(--trim)')}${cloth(mir(pn), 'var(--trim)')}</g>`;
        lines += `<g clip-path="url(#${pc})">` +
          [a, b].map(x => two(`M${x},150 L${x},650`, d => ol(d, 'ol thin'))).join('') +
          [a + 2.4, b - 2.4].map(x => two(`M${x},150 L${x},650`, st)).join('') + '</g>';
      }

      if (!front) {                                  // yoke and centre box pleat
        const yoke = closed(sym(E([320, 146], [[306, 146], [296, 149], N], [S], arm1, [[320, 232]])));
        s += cloth(yoke);
        lines += ol(yoke) + st(`M${X(204.4)},235 L${640 - X(204.4)},235`) + (over ? st(`M${X(204.8)},238.4 L${640 - X(204.8)},238.4`) : '');
        lines += two('M311,232 C310.6,246 310.2,258 309.6,272', d => ol(d, 'ol thin')) +
          two('M309.6,276 C308.6,300 307.4,326 306,350', fd) + st('M311.4,236.6 L328.6,236.6');
      }

      /* Pockets are the same cloth as the body: outlines and stitching only (a second weave
         fill would rasterise with another phase and read as a lighter patch). */
      if (front && o.pocket) {
        const flip = o.pocket === 2 ? [0, 1] : [1];
        flip.forEach(m => {
          const M = d => (m ? mir(d) : d);
          if (o.pocket === 2) {
            lines += ol(M(PK2.ol)) + st(M(PK2.st)) + PK2.pleat.map(d => ol(M(d), 'ol thin')).join('') +
              `<path d="${M('M233,280 L291,280')}" style="fill:none;stroke:rgba(0,0,0,.13)" stroke-width="2.4"/>` +
              ol(M(PK2.flap)) + st(M(PK2.flapSt)) + (over ? st(M(PK2.st2)) + st(M(PK2.flapSt2)) : '');
          } else {
            lines += ol(M(PK1.d)) + PK1.st.map(d => st(M(d))).join('') + PK1.tack.map(d => tack(M(d))).join('') +
              (over ? st(M(PK1.st2)) : '');
          }
        });
      }

      /* lower seams, creases, placket */
      lines += two(off(arm, -2.6, .02, .98), st) + (over ? two(off(arm, -5.6, .03, .97), st) : '');
      if (front) lines += two(off(E(N, [S]), -2.4, .02, .98), st) + (over ? two(off(E(N, [S]), -5.4, .04, .96), st) : '');
      lines += st(off(hem, -3.4, .006, .994)) + (over ? st(off(hem, -6.6, .01, .99)) : '');
      if (!tails) lines += two(`M${X(207)},590 L${X(212.4)},590`, tack);
      if (o.short) {
        const O = [X(124), 280], I = [X(178), 322], Uc = [X(142), 238], Vc = [X(188), 316];
        lines += two(inset(O, I, Uc, Vc, 11), d => ol(d, 'ol thin')) + two(inset(O, I, Uc, Vc, 8.2), st) + two(inset(O, I, Uc, Vc, 2.8), st);
        lines += two(`M${X(170)},214 C${X(158)},232 ${X(147)},250 ${X(139)},264`, fd);
      } else {
        lines += two(`M${X(156)},252 C${X(147)},284 ${X(141)},316 ${X(138)},344`, fd) +
          two(`M${X(132)},452 C${X(143)},458 ${X(155)},458 ${X(167)},453`, fd) +
          two(`M${X(129)},492 C${X(140)},498 ${X(152)},498 ${X(164)},493`, fd);
      }
      lines += two(`M${X(222)},336 C${X(234)},360 ${X(240)},390 ${X(239)},420`, fd);
      lines += tails ? fd('M244,596 C264,590 286,592 304,600') + fd('M336,600 C354,592 376,590 396,596')
        : fd('M240,592 C262,586 288,586 306,592') + fd('M334,592 C354,586 378,586 400,591');

      let hw = '';                                   // hardware, drawn last
      if (!front && !o.short) {                      // sleeve placket, pleats, cuff button
        const pl = `M${X(129.2)},549.5 L${X(133)},505.7 L${X(136.6)},501 L${X(139.4)},506.3 L${X(135.6)},550.1 Z`;
        s += cloth(pl) + cloth(mir(pl));
        lines += two(pl, ol) + two(`M${X(131.4)},547 L${X(134.9)},507`, st) +
          two(`M${X(144.4)},551.3 L${X(145.6)},537.3`, d => ol(d, 'ol thin')) + two(`M${X(151.6)},552.2 L${X(152.8)},538.2`, d => ol(d, 'ol thin'));
        hw += button(X(134.6), 526, 1.9, btnFill) + button(640 - X(134.6), 526, 1.9, btnFill) +
          button(X(124.5), 569, 2.5, btnFill) + button(640 - X(124.5), 569, 2.5, btnFill);
      }
      if (front) {
        if (camp) {                                  // front edge of the overlapping side + facing stitch
          lines += ol(`M313.5,252 L313.5,${tails ? 626 : 606}`) + st(`M317,262 L317,${tails ? 622 : 602}`) +
            `<path d="M309.5,262 L313.5,262 L313.5,${tails ? 625 : 605} L309.5,${tails ? 625 : 605} Z" style="fill:rgba(0,0,0,.08)"/>`;
        } else {                                     // box placket
          const yb = tails ? 626 : 606;
          lines += `<path d="M309.5,199 L313.5,199 L313.5,${yb - 1} L309.5,${yb - 1} Z" style="fill:rgba(0,0,0,.08)"/>` +
            ol(`M313.5,198 L313.5,${yb}`) + ol(`M326.5,199 L326.5,${yb - 2}`, 'ol thin') +
            st(`M315.8,199 L315.8,${yb - 3}`) + st(`M324.2,199 L324.2,${yb - 3}`);
        }
      }

      s += print(lower) + lines;

      /* ── collar ── */
      const upper = [];
      if (front) {
        if (camp) {
          s += inside(CAMP.hole) + fab(CAMP.band, { tex: 'weave', fill: 'var(--rib)' });
          const lu = closed(CAMP.under), lo = closed(CAMP.over);
          s += cloth(lu) + cloth(lo);
          upper.push(lu, lo);
          let cl = ol(lu) + ol(lo);
          [CAMP.under, CAMP.over].forEach((e, i) => {
            const sub = e.slice(3);                  // outer edge, point, notch, revers edge (skips the roll line)
            cl += st(off(sub, i ? 2.6 : -2.6, .02, .96));
          });
          s += print(upper) + cl;
        } else {
          s += fab(STAND.band, { tex: 'weave', fill: 'var(--rib)' }) + inside(STAND.hole) + fab(STAND.stand, { tex: 'weave' }) +
            st('M291.4,166.6 C295,184 306,193.6 320,194.6 C334,193.6 345,184 348.6,166.6');
          const lf = closed(STAND.leaf), lr = mir(lf);
          s += cloth(lf) + cloth(lr);
          upper.push(lf, lr);
          const sub = STAND.leaf.slice(3, 10);       // front edge + outer edge
          s += print(upper) + ol(lf) + ol(lr) + st(off(sub, 2.4, .02, .98)) + st(mir(off(sub, 2.4, .02, .98)));
          hw += button(320, 192.4, 2.5, btnFill);
          if (o.collar !== 'point') hw += button(297.6, 221.4, 2, btnFill) + button(342.4, 221.4, 2, btnFill);
        }
        const by = camp ? [266, 334, 402, 470, 538] : [250, 312, 374, 436, 498, 560];
        hw += by.map(y => button(320, y, over ? 3.6 : 3, btnFill)).join('');
        if (o.pocket === 2) hw += button(PK2.btn[0], PK2.btn[1], 3.2, btnFill) + button(640 - PK2.btn[0], PK2.btn[1], 3.2, btnFill);
      } else {
        const c = camp ? CAMP : STAND;
        s += cloth(c.back);
        s += print([c.back]) + ol(c.back) + st(off(c.backEdge, 2.6, .03, .97));
        if (!camp && o.collar !== 'point') hw += button(320, 172.6, 1.9, btnFill);
      }
      return s + hw;
    },
  });
})();
