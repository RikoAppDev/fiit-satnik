/* Accessories (Doplnky): tote, mug, bottle, notebook, pins, stickers, lanyard, sleeve.
   One front view each, drawn in the shared box centred on x = 320, in the hoodie's
   flat technical style. Soft goods go through FM.fab with a texture; hard goods use
   FM.fab(d, { grain: false }) plus local gradients whose ids start with the type name.
   Main colour is always var(--body); details use --trim, --trim2 and --lining.
   Pieces that use A (arc) commands are never passed through FM.mir. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  const f = v => +(+v).toFixed(2);
  const pt = p => `${f(p[0])},${f(p[1])}`;
  const rr = (x, y, w, h, r) =>
    `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} A${r},${r} 0 0 1 ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} ` +
    `A${r},${r} 0 0 1 ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} A${r},${r} 0 0 1 ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} ` +
    `A${r},${r} 0 0 1 ${f(x + r)},${f(y)} Z`;
  const ell = (cx, cy, rx, ry) =>
    `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx - rx)},${f(cy)} Z`;
  const circ = (cx, cy, r) => ell(cx, cy, r, r);
  /* Brushed steel for small hardware (neutral hex is allowed for metal). */
  const steel = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
    '<stop offset="0" stop-color="#7A8086"/><stop offset=".18" stop-color="#C7CCD0"/><stop offset=".34" stop-color="#F0F2F3"/>' +
    '<stop offset=".52" stop-color="#B3B9BE"/><stop offset=".8" stop-color="#8B9197"/><stop offset="1" stop-color="#62686E"/></linearGradient>';

  /* ── 1. Tote ─────────────────────────────────────────────────────────────────
     cm = 8: body 40 × 42 cm (x 158–482, y 292–630), handles 2.5 cm wide, 65 cm long. */
  const TOTE = {
    body: 'M162,292 L478,292 C479,400 481,520 482,620 Q482,630 472,630 L168,630 Q158,630 158,620 C159,520 161,400 162,292 Z',
    hF: 'M222,352 L222,252 C222,142 262,64 320,64 C378,64 418,142 418,252 L418,352 L398,352 L398,252 C398,156 364,84 320,84 C276,84 242,156 242,252 L242,352 Z',
    hB: 'M222,300 L222,262 C222,164 264,96 320,96 C376,96 418,164 418,262 L418,300 L398,300 L398,262 C398,176 362,116 320,116 C278,116 242,176 242,262 L242,300 Z',
    stO: 'M225,349 L225,252 C225,144 264,67 320,67 C376,67 415,144 415,252 L415,349',
    stI: 'M239,349 L239,252 C239,154 274,81 320,81 C366,81 401,154 401,252 L401,349',
    box: 'M227,319 L237,319 L237,345 L227,345 Z M227,319 L237,345 M237,319 L227,345',
    folds: ['M198,388 C208,446 210,522 203,592', 'M442,388 C432,446 430,522 437,592', 'M262,617 C296,609 344,609 378,617'],
  };
  FM.register('tote', {
    label: 'Plátenná taška',
    views: ['front'],
    cm: 8,
    shadow: { cx: 320, cy: 646, rx: 196, ry: 12 },
    zones: {
      front: {
        face: { x: 320, y: 478, w: 260, top: 362, bottom: 604 }, // centre of the body below the handle anchors
        corner: { x: 481, y: 588 },                              // wearer's left bottom corner, on the side seam (a tab drawn here sticks out to the right)
      },
    },
    draw(view, o, deco) {
      let s = fab(TOTE.hB, { tex: 'weave', fill: 'var(--rib)' });
      s += fab(TOTE.body, { tex: 'weave' });
      s += '<path d="M164,298 L476,298" class="st"/><path d="M164,313 L476,313" class="st"/>';
      TOTE.folds.forEach(d => { s += `<path d="${d}" class="fd"/>`; });
      s += deco || '';
      s += fab(TOTE.hF, { tex: 'weave' });
      s += `<path d="${TOTE.stO}" class="st"/><path d="${TOTE.stI}" class="st"/>`;
      s += `<path d="${TOTE.box}" class="st"/><path d="${mir(TOTE.box)}" class="st"/>`;
      return s;
    },
  });

  /* ── 2. Mug ──────────────────────────────────────────────────────────────────
     cm = 35: Ø 8.6 cm, height 9.5 cm, handle to the right. Body centre x 262 so the
     mug with its handle sits centred in the box. */
  const MUG = {
    body: 'M112,280 L112,606 A150,26 0 0 0 412,606 L412,280 A150,22 0 0 0 112,280 Z',
    handle: 'M404,322 C470,314 532,352 532,432 C532,510 474,552 404,556 L404,526 C458,522 502,494 502,434 C502,376 460,346 404,352 Z',
    hi: 'M432,331 C488,336 520,374 522,426',
    foot: 'M112,596 A150,26 0 0 0 412,596',
    defs: '<defs>' +
      '<linearGradient id="mug-gl" gradientUnits="userSpaceOnUse" x1="112" y1="0" x2="412" y2="0">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".07" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset=".15" stop-color="#fff" stop-opacity=".28"/><stop offset=".22" stop-color="#fff" stop-opacity=".06"/>' +
      '<stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".14"/>' +
      '<stop offset=".96" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>' +
      '<linearGradient id="mug-in" gradientUnits="userSpaceOnUse" x1="0" y1="262" x2="0" y2="300">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#000" stop-opacity=".08"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>' +
      '</defs>',
  };
  FM.register('mug', {
    label: 'Hrnček',
    views: ['front'],
    cm: 35,
    shadow: { cx: 304, cy: 638, rx: 236, ry: 15 },
    zones: {
      front: {
        face: { x: 262, y: 456, w: 210, top: 330, bottom: 588 }, // front of the cup, left of the handle
      },
    },
    /* opts: inside (bool) → inside in var(--lining), else a lighter body tone;
             rim (bool) → rolled rim in var(--trim) */
    draw(view, o, deco) {
      const inner = ell(262, 281, 143, 18.5);
      let s = MUG.defs;
      s += fab(MUG.handle, { grain: false });
      s += `<path d="${MUG.hi}" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3" stroke-linecap="round"/>`;
      s += fab(MUG.body, { grain: false, ol: '' }) + `<path d="${MUG.body}" fill="url(#mug-gl)"/>`;
      s += `<path d="${MUG.foot}" class="ol thin" style="opacity:.35"/>`;
      s += deco || '';
      s += `<path d="${ell(262, 280, 150, 22)}" style="fill:var(--body)"/><path d="${ell(262, 280, 150, 22)}" fill="url(#g-shade)"/>`;
      s += `<path d="${inner}" style="fill:${o.inside ? 'var(--lining)' : 'var(--body)'}"/>`;
      if (!o.inside) s += `<path d="${inner}" fill="#fff" fill-opacity=".2"/>`;
      s += `<path d="${inner}" fill="url(#mug-in)"/>`;
      if (o.rim) {
        s += '<path d="M112,283 A150,22 0 0 0 412,283" fill="none" style="stroke:var(--trim)" stroke-width="6"/>' +
          `<path d="${ell(262, 280, 146.5, 20.2)}" fill="none" style="stroke:var(--trim)" stroke-width="5"/>`;
      }
      s += `<path d="${inner}" class="ol thin"/>`;
      s += `<path d="${MUG.body}" class="ol"/><path d="${ell(262, 280, 150, 22)}" class="ol"/>`;
      return s;
    },
  });

  /* ── 3. Bottle ───────────────────────────────────────────────────────────────
     cm = 21.5: 750 ml insulated bottle, Ø 7.4 cm, 27 cm tall with the cap loop. */
  const BOT = {
    body: 'M272,184 L368,184 C376,184 379,196 385,208 C393,223 400,234 400,256 L400,614 Q400,628 386,629 C356,633 284,633 254,629 Q240,628 240,614 L240,256 C240,234 247,223 255,208 C261,196 264,184 272,184 Z',
    neck: 'M274,170 L366,170 L366,190 L274,190 Z',
    cap: 'M266,176 L374,176 L374,104 Q374,94 364,94 L276,94 Q266,94 266,104 Z',
    loop: 'M292,100 L292,80 C292,56 304,44 320,44 C336,44 348,56 348,80 L348,100 L337,100 L337,80 C337,64 330,55 320,55 C310,55 303,64 303,80 L303,100 Z',
    defs: '<defs>' + steel('bottle-steel') +
      '<linearGradient id="bottle-cyl" gradientUnits="userSpaceOnUse" x1="240" y1="0" x2="400" y2="0">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".09" stop-color="#000" stop-opacity=".05"/>' +
      '<stop offset=".23" stop-color="#fff" stop-opacity=".13"/><stop offset=".34" stop-color="#fff" stop-opacity=".04"/>' +
      '<stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".16"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>' +
      '<linearGradient id="bottle-capc" gradientUnits="userSpaceOnUse" x1="266" y1="0" x2="374" y2="0">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".22" stop-color="#fff" stop-opacity=".2"/>' +
      '<stop offset=".4" stop-color="#fff" stop-opacity=".02"/><stop offset=".8" stop-color="#000" stop-opacity=".14"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>' +
      '</defs>',
  };
  let ridges = '';
  for (let x = 272; x <= 368; x += 6) ridges += `M${x},132 L${x},172 `;
  FM.register('bottle', {
    label: 'Termofľaša',
    views: ['front'],
    cm: 21.5,
    shadow: { cx: 320, cy: 640, rx: 124, ry: 11 },
    zones: {
      front: {
        face: { x: 320, y: 430, w: 124, top: 272, bottom: 590 }, // flat front of the body
        base: { x: 320, y: 602, w: 120 },                        // lowest 2 cm of the body
      },
    },
    /* opts: steelcap (bool) → brushed steel cap instead of var(--trim).
       The silicone carry loop is always var(--trim2). */
    draw(view, o, deco) {
      let s = BOT.defs;
      s += fab(BOT.body, { ol: '' }) + `<path d="${BOT.body}" fill="url(#bottle-cyl)"/><path d="${BOT.body}" class="ol"/>`;
      s += '<path d="M252,214 C262,200 264,190 272,188" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>';
      s += deco || '';
      s += fab(BOT.neck, { fill: 'url(#bottle-steel)', grain: false, shade: false });
      s += fab(BOT.loop, { fill: 'var(--trim2)', grain: false });
      if (o.steelcap) s += fab(BOT.cap, { fill: 'url(#bottle-steel)', grain: false, shade: false, ol: '' });
      else s += fab(BOT.cap, { fill: 'var(--trim)', grain: false, ol: '' }) + `<path d="${BOT.cap}" fill="url(#bottle-capc)"/>`;
      s += `<path d="${ridges}" stroke="#000" stroke-opacity=".2" stroke-width=".9"/>`;
      s += '<path d="M266,126 L374,126" class="ol thin"/>';
      s += `<path d="${BOT.cap}" class="ol"/>`;
      return s;
    },
  });

  /* ── 4. Notebook ─────────────────────────────────────────────────────────────
     cm = 25: A5 hardcover, cover 15.1 × 21.6 cm (x 126–504, y 60–600), seen flat
     with the page block and back board showing on the right and bottom. */
  const NB = { x0: 126, y0: 60, x1: 504, y1: 600 };
  /* area swept by the cover rectangle (inset i) moving from offset a to offset b along (1,1) */
  const slab = (a, b, i) => {
    const X0 = NB.x0 + i, Y0 = NB.y0 + i, X1 = NB.x1 - i, Y1 = NB.y1 - i;
    return 'M' + [[X0 + a, Y0 + a], [X1 + a, Y0 + a], [X1 + b, Y0 + b], [X1 + b, Y1 + b], [X0 + b, Y1 + b], [X0 + a, Y1 + a]].map(pt).join(' L') + ' Z';
  };
  let pageLines = '';
  [8, 10.5, 13].forEach(k => {
    pageLines += `M${500 + k},${64 + k} L${500 + k},${596 + k} M${130 + k},${596 + k} L${500 + k},${596 + k} `;
  });
  const NBK = {
    cover: rr(126, 60, 378, 540, 2.5),
    ribbon: 'M244,592 L258,592 C259,612 262,632 266,654 L259,646 L251,656 C249,634 246,612 244,592 Z',
    band: 'M466,60 L484,60 L484,600 L466,600 Z',
    wrap: 'M466,600 L484,600 L503,619 L485,619 Z',
    defs: '<defs><linearGradient id="notebook-spine" gradientUnits="userSpaceOnUse" x1="126" y1="0" x2="162" y2="0">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>',
  };
  FM.register('notebook', {
    label: 'Zápisník A5',
    views: ['front'],
    cm: 25,
    shadow: { cx: 326, cy: 636, rx: 222, ry: 12 },
    zones: {
      front: {
        cover: { x: 315, y: 300, w: 270, top: 96, bottom: 560 }, // centre of the cover between the hinge groove and the band
        foot: { x: 315, y: 568, w: 200 },                      // bottom centre of the cover
      },
    },
    /* opts: band (bool) → elastic band in var(--trim); ribbon (bool) → ribbon marker in var(--trim2) */
    draw(view, o, deco) {
      let s = NBK.defs;
      s += fab(slab(15, 19, 0), { fill: 'var(--rib)', tex: 'weave' });
      s += fab(slab(3, 15, 4), { fill: '#F2EEE3', grain: false, shade: false });
      s += `<path d="${pageLines}" stroke="#000" stroke-opacity=".13" stroke-width=".6"/>`;
      if (o.ribbon) s += fab(NBK.ribbon, { fill: 'var(--trim2)', grain: false });
      s += fab(slab(0, 3, 0), { fill: 'var(--rib)', tex: 'weave' });
      s += fab(NBK.cover, { tex: 'weave', ol: '' }) + `<path d="${NBK.cover}" fill="url(#notebook-spine)"/>`;
      s += '<path d="M150,62 L150,598" class="fd"/><path d="M153.5,62 L153.5,598" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1.2"/>';
      s += `<path d="${NBK.cover}" class="ol"/>`;
      s += deco || '';
      if (o.band) {
        s += fab(NBK.wrap, { fill: 'var(--trim)', grain: false }) + `<path d="${NBK.wrap}" fill="#000" fill-opacity=".22"/>`;
        s += '<path d="M484,61 L487.5,61 L487.5,599 L484,599 Z" fill="#000" fill-opacity=".18"/>';
        s += fab(NBK.band, { fill: 'var(--trim)', tex: 'rib', grain: false });
      }
      return s;
    },
  });

  /* ── 5. Pins ─────────────────────────────────────────────────────────────────
     cm = 42: backing card 9 × 13 cm (x 131–509, y 66–614) with a hang slot,
     two round pins Ø 3.1 cm and a shield 3.2 × 3.6 cm. The card is var(--body);
     the enamel faces come through deco (default face colour var(--d4)). */
  const shield = (cx, cy, w, h) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, rc = 11;
    return `M${f(x0 + rc)},${f(y0)} L${f(x1 - rc)},${f(y0)} Q${f(x1)},${f(y0)} ${f(x1)},${f(y0 + rc)} L${f(x1)},${f(y0 + h * .44)} ` +
      `C${f(x1)},${f(y0 + h * .74)} ${f(cx + w * .26)},${f(y0 + h * .9)} ${f(cx)},${f(y1)} ` +
      `C${f(cx - w * .26)},${f(y0 + h * .9)} ${f(x0)},${f(y0 + h * .74)} ${f(x0)},${f(y0 + h * .44)} L${f(x0)},${f(y0 + rc)} Q${f(x0)},${f(y0)} ${f(x0 + rc)},${f(y0)} Z`;
  };
  const PINS = [
    { k: 'round', x: 228, y: 262, r: 66 },
    { k: 'round', x: 412, y: 262, r: 66 },
    { k: 'shield', x: 320, y: 432, w: 136, h: 152 },
  ];
  const pinD = (p, i, dx = 0, dy = 0) => p.k === 'round'
    ? circ(p.x + dx, p.y + dy, p.r - i)
    : shield(p.x + dx, p.y + dy - i * .1, p.w - 2 * i, p.h - 2.25 * i);
  const pinMetal = (id, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    c.map((col, i) => `<stop offset="${f(i / (c.length - 1))}" stop-color="${col}"/>`).join('') + '</linearGradient>';
  const PINK = {
    card: rr(131, 66, 378, 548, 10) + ' M296,92 A6,6 0 0 0 296,104 L344,104 A6,6 0 0 0 344,92 Z',
    defs: '<defs>' +
      pinMetal('pins-gold', ['#F4E1A0', '#D6B35E', '#AD873A', '#E6CB7C', '#8C6927']) +
      pinMetal('pins-silver', ['#F3F5F6', '#C8CDD1', '#9BA1A6', '#E2E5E7', '#767C82']) +
      '</defs>',
  };
  FM.register('pins', {
    label: 'Sada odznakov',
    views: ['front'],
    cm: 42,
    shadow: { cx: 320, cy: 640, rx: 204, ry: 12 },
    zones: {
      front: {
        pin1: { x: 228, y: 262, w: 104 },  // round pin, top left (centre of the enamel face)
        pin2: { x: 412, y: 262, w: 104 },  // round pin, top right
        pin3: { x: 320, y: 424, w: 108 },  // shield pin, below (optical centre of the face)
        head: { x: 320, y: 146, w: 300 },  // card header under the hang slot
        card: { x: 320, y: 568, w: 300 },  // caption area at the bottom of the card
      },
    },
    /* opts: silver (bool) → nickel plating instead of gold;
             faces ([3 CSS colours]) → enamel colour of pin1–pin3, default var(--d4) */
    draw(view, o, deco) {
      const m = o.silver ? 'pins-silver' : 'pins-gold', edge = o.silver ? '#6C7278' : '#7A5C22';
      let s = PINK.defs + fab(PINK.card, { grain: false });
      PINS.forEach((p, i) => {
        s += `<path d="${pinD(p, 0, 4, 6)}" fill="#000" fill-opacity=".22"/>`;
        s += `<path d="${pinD(p, 0, 0, 3)}" fill="${edge}"/>`;
        s += `<path d="${pinD(p, 0)}" fill="url(#${m})"/>`;
        s += `<path d="${pinD(p, 6)}" style="fill:${(o.faces && o.faces[i]) || 'var(--d4)'}"/>`;
      });
      s += deco || '';
      PINS.forEach(p => {
        s += `<path d="${pinD(p, 3)}" fill="none" stroke="url(#${m})" stroke-width="6"/>`;
        s += `<path d="${pinD(p, 6)}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".8"/>`;
        const gx = p.k === 'round' ? p.x - p.r * .3 : p.x - p.w * .2, gy = p.k === 'round' ? p.y - p.r * .44 : p.y - p.h * .3;
        s += `<ellipse cx="${f(gx)}" cy="${f(gy)}" rx="${f((p.r || 60) * .4)}" ry="${f((p.r || 60) * .11)}" transform="rotate(-30 ${f(gx)} ${f(gy)})" fill="#fff" fill-opacity=".13"/>`;
        s += `<path d="${pinD(p, 0, 0, 3)}" class="ol thin"/><path d="${pinD(p, 0)}" class="ol"/>`;
      });
      return s;
    },
  });

  /* ── 6. Stickers ─────────────────────────────────────────────────────────────
     cm = 38: A6 backing sheet 10.5 × 15 cm (x 120–520, y 56–628) with six die-cut
     blanks. Each has a white vinyl border and its own fill. */
  const STK = [
    { id: 's1', k: 'circle', x: 226, y: 160, w: 140, h: 140, fill: 'var(--body)' },
    { id: 's2', k: 'rect', x: 414, y: 160, w: 150, h: 112, r: 18, fill: 'var(--trim)' },
    { id: 's3', k: 'pill', x: 320, y: 302, w: 316, h: 80, fill: 'var(--trim2)' },
    { id: 's4', k: 'rect', x: 230, y: 438, w: 164, h: 112, r: 16, fill: 'var(--body)' },
    { id: 's5', k: 'circle', x: 414, y: 438, w: 120, h: 120, fill: 'var(--trim2)' },
    { id: 's6', k: 'pill', x: 320, y: 562, w: 240, h: 64, fill: 'var(--trim)' },
  ];
  const stD = (k, b, dx = 0, dy = 0) => {
    const x = k.x + dx, y = k.y + dy;
    if (k.k === 'circle') return circ(x, y, k.w / 2 + b);
    const r = k.k === 'pill' ? k.h / 2 + b : k.r + b;
    return rr(x - k.w / 2 - b, y - k.h / 2 - b, k.w + 2 * b, k.h + 2 * b, r);
  };
  const stZones = {};
  STK.forEach(k => {
    stZones[k.id] = k.k === 'circle' ? { x: k.x, y: k.y, w: f(k.w * .74), h: f(k.h * .74) }
      : k.k === 'pill' ? { x: k.x, y: k.y, w: f(k.w - k.h * .8), h: k.h - 14 }
      : { x: k.x, y: k.y, w: k.w - 22, h: k.h - 18 };
  });
  stZones.foot = { x: 320, y: 616, w: 300 };
  FM.register('stickers', {
    label: 'Hárok nálepiek',
    views: ['front'],
    cm: 38,
    shadow: { cx: 320, cy: 644, rx: 214, ry: 12 },
    /* s1 round · s2 rounded rectangle · s3 wide pill · s4 rounded rectangle · s5 round ·
       s6 pill — centres with usable inner w × h; foot = margin under the stickers */
    zones: { front: stZones },
    draw(view, o, deco) {
      const sheet = rr(120, 56, 400, 572, 8);
      let s = '<defs><linearGradient id="stickers-sheet" gradientUnits="userSpaceOnUse" x1="120" y1="56" x2="520" y2="628">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".09"/></linearGradient></defs>';
      s += fab(sheet, { fill: '#F4F2EC', grain: false, shade: false, ol: '' }) + `<path d="${sheet}" fill="url(#stickers-sheet)"/><path d="${sheet}" class="ol"/>`;
      STK.forEach(k => {
        s += `<path d="${stD(k, 8, 1.5, 2.5)}" fill="#000" fill-opacity=".09"/>`;
        s += `<path d="${stD(k, 8)}" fill="#fff" stroke="#000" stroke-opacity=".16" stroke-width=".8"/>`;
        s += `<path d="${stD(k, 0)}" style="fill:${k.fill}"/>`;
      });
      s += deco || '';
      STK.forEach(k => { s += `<path d="${stD(k, 0)}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".6"/>`; });
      return s;
    },
  });

  /* ── 7. Lanyard ──────────────────────────────────────────────────────────────
     cm = 12: strap 2.5 cm wide, about 85 cm around, laid as a loop. Both ends meet
     in a steel crimp, then a swivel clip and a clear card holder for an 8.6 × 5.4 cm card. */
  const LY = (() => {
    const cx = 320, cy = 196, R = 132, hw = 15, P = [312, 452];
    const dx = P[0] - cx, dy = P[1] - cy, d = Math.hypot(dx, dy);
    const tL = Math.atan2(dy, dx) + Math.acos(R / d);           // left tangent point angle (~150°)
    const T = [cx + R * Math.cos(tL), cy + R * Math.sin(tL)];
    const L = Math.hypot(T[0] - P[0], T[1] - P[1]);
    const u = [(T[0] - P[0]) / L, (T[1] - P[1]) / L];            // up the left arm
    const nL = [Math.cos(tL), Math.sin(tL)];                      // outward normal of the left arm
    const half = s => { const k = Math.min(1, s / 56); return 7.5 + (hw - 7.5) * k * k * (3 - 2 * k); };
    const arm = [0, 7, 14, 21, 28, 35, 42, 49, 56, L].map(s => ({ c: [P[0] + u[0] * s, P[1] + u[1] * s], n: nL, h: half(s) }));
    const t1 = 3 * Math.PI - tL, N = 84, pts = arm.slice();
    for (let i = 1; i < N; i++) {
      const a = tL + (t1 - tL) * i / N;
      pts.push({ c: [cx + R * Math.cos(a), cy + R * Math.sin(a)], n: [Math.cos(a), Math.sin(a)], h: hw });
    }
    arm.slice().reverse().forEach(p => pts.push({ c: [640 - p.c[0], p.c[1]], n: [-p.n[0], p.n[1]], h: p.h }));
    const edge = (k, sgn) => pts.map(p => [p.c[0] + sgn * p.n[0] * (p.h - k), p.c[1] + sgn * p.n[1] * (p.h - k)]);
    const outer = edge(0, 1), inner = edge(0, -1);
    const strap = 'M' + outer.map(pt).join(' L') + ' L' + inner.reverse().map(pt).join(' L') + ' Z';
    const sel = 'M' + edge(2.6, 1).map(pt).join(' L') + ' M' + edge(2.6, -1).map(pt).join(' L');
    const s0 = 60, A0 = [P[0] + u[0] * s0, P[1] + u[1] * s0];
    const loopD = `M${pt(A0)} L${pt(T)} A${R},${R} 0 1 1 ${pt([640 - T[0], T[1]])} L${pt([640 - A0[0], A0[1]])}`;
    const sm = (56 + L) / 2, mid = [640 - (P[0] + u[0] * sm), P[1] + u[1] * sm];
    return {
      strap, sel,
      zones: {
        // wearer's left straight section (viewer's right arm): rot turns text to run down the strap, tops facing out
        strap: { x: f(mid[0]), y: f(mid[1]), w: 2 * hw, len: f(L - 56), top: f(T[1]), bottom: f(P[1] + u[1] * 56), rot: f(Math.atan2(-u[1], u[0]) * 180 / Math.PI) },
        strapR: { x: f(640 - mid[0]), y: f(mid[1]), w: 2 * hw, len: f(L - 56), top: f(T[1]), bottom: f(P[1] + u[1] * 56), rot: f(Math.atan2(u[1], -u[0]) * 180 / Math.PI) }, // wearer's right arm, text running up
        // whole strap centreline (left arm up, over the top, right arm down) for a textPath; x,y = top of the loop
        loop: { x: 320, y: cy - R, w: 2 * hw, d: loopD, len: f(2 * (L - s0) + R * (t1 - tL)) },
        card: { x: 320, y: 590, w: 96, h: 58 },               // face of the card inside the holder
      },
    };
  })();
  const LYK = {
    crimp: rr(301, 438, 38, 27, 3.5),
    swivel: rr(315.5, 478, 9, 13, 3),
    clip: 'M320,490 C334,490 339,501 339,514 C339,529 330,540 320,540 C310,540 301,529 301,514 C301,501 306,490 320,490 Z ' +
      'M320,498 C312,498 309,506 309,514 C309,524 314,532 320,532 C326,532 331,524 331,514 C331,506 328,498 320,498 Z',
    gate: 'M331,506 L338,504 L338,524 L331,522 Z',
    tab: rr(294, 534, 52, 22, 7) + ' M306,539 A3,3 0 0 0 306,545 L334,545 A3,3 0 0 0 334,539 Z',
    holder: rr(259, 550, 122, 80, 6),
    insert: rr(268, 559, 104, 63, 3),
    glare: 'M263,604 L322,553 L344,553 L280,627 L263,627 Z',
    defs: '<defs>' + steel('lanyard-steel') + '</defs>',
  };
  FM.register('lanyard', {
    label: 'Šnúrka na krk',
    views: ['front'],
    cm: 12,
    shadow: false,
    zones: { front: LY.zones },
    draw(view, o, deco) {
      let s = LYK.defs + fab(LY.strap, { tex: 'weave' });
      s += `<path d="${LY.sel}" fill="none" style="stroke:var(--fold)" stroke-width="1"/>`;
      s += `<path d="${LYK.insert}" fill="#F6F4EF"/><path d="${LYK.insert}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".8"/>`;
      s += deco || '';
      s += `<path d="${LYK.clip}" fill="url(#lanyard-steel)" fill-rule="evenodd"/><path d="${LYK.clip}" class="ol thin"/>`;
      s += `<path d="${LYK.gate}" fill="url(#lanyard-steel)"/><path d="${LYK.gate}" class="ol thin"/>`;
      s += '<circle cx="320" cy="472" r="6" fill="none" stroke="#5E646A" stroke-width="4.6"/><circle cx="320" cy="472" r="6" fill="none" stroke="#C9CED2" stroke-width="2.6"/>';
      s += `<path d="${LYK.swivel}" fill="url(#lanyard-steel)"/><path d="${LYK.swivel}" class="ol thin"/>`;
      s += `<path d="${LYK.crimp}" fill="url(#lanyard-steel)"/><path d="M303,447 L337,447 M303,456 L337,456" stroke="#000" stroke-opacity=".22" stroke-width="1"/><path d="${LYK.crimp}" class="ol thin"/>`;
      s += `<path d="${LYK.tab}" fill="#fff" fill-opacity=".58" stroke="#2A3448" stroke-opacity=".45" stroke-width="1.1"/>`;
      s += `<path d="${LYK.holder}" fill="#fff" fill-opacity=".18" stroke="#2A3448" stroke-opacity=".5" stroke-width="1.2"/>`;
      s += `<path d="${rr(262, 553, 116, 74, 4)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`;
      s += `<path d="${LYK.glare}" fill="#fff" fill-opacity=".26"/>`;
      return s;
    },
  });

  /* ── 8. Laptop sleeve ────────────────────────────────────────────────────────
     cm = 12: felt sleeve for a 14" laptop, 36 × 26 cm, fold-over flap with a
     leather tab and a press stud. */
  const SLV = {
    front: 'M104,330 L536,330 L536,616 A14,14 0 0 1 522,630 L118,630 A14,14 0 0 1 104,616 Z',
    flap: 'M104,326 C104,318 110,312 118,312 L522,312 C530,312 536,318 536,326 L536,422 A16,16 0 0 1 520,438 L120,438 A16,16 0 0 1 104,422 Z',
    flapSh: 'M106,424 L534,424 L534,428 A16,16 0 0 1 518,444 L122,444 A16,16 0 0 1 106,428 Z',
    stitch: 'M112,440 L112,614 A8,8 0 0 0 120,622 L520,622 A8,8 0 0 0 528,614 L528,440',
    edge: 'M108,423 A13,13 0 0 0 121,435 L519,435 A13,13 0 0 0 532,423',
    tab: 'M300,374 L340,374 L340,478 A20,20 0 0 1 300,478 Z',
    tabSt: 'M304.5,380 L304.5,478 A15.5,15.5 0 0 0 335.5,478 L335.5,380',
    folds: ['M136,470 C146,520 145,572 138,612', 'M504,470 C494,520 495,572 502,612', 'M142,324 C240,329 400,329 498,324'],
    defs: '<defs>' + steel('sleeve-steel') + '</defs>',
  };
  FM.register('sleeve', {
    label: 'Obal na notebook',
    views: ['front'],
    cm: 12,
    shadow: { cx: 320, cy: 646, rx: 240, ry: 13 },
    zones: {
      front: {
        face: { x: 320, y: 558, w: 330, top: 504, bottom: 612 }, // front panel below the flap and the tab
        corner: { x: 452, y: 592 },                              // wearer's left bottom corner, inside the stitching
        tab: { x: 320, y: 430, w: 30, rot: 90 },                 // leather tab between the rivets and the stud
      },
    },
    draw(view, o, deco) {
      let s = SLV.defs + fab(SLV.front);
      s += `<path d="${SLV.stitch}" class="st"/>`;
      s += `<path d="${SLV.folds[0]}" class="fd"/><path d="${SLV.folds[1]}" class="fd"/>`;
      s += `<path d="${SLV.flapSh}" fill="#000" fill-opacity=".2"/>`;
      s += fab(SLV.flap);
      s += `<path d="${SLV.edge}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/>`;
      s += `<path d="${SLV.folds[2]}" class="fd"/><path d="M120,316 L520,316" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`;
      s += deco || '';
      s += '<path d="M302,378 L342,378 L342,482 A20,20 0 0 1 302,482 Z" fill="#000" fill-opacity=".22"/>';
      s += fab(SLV.tab, { fill: 'var(--trim)', grain: false });
      s += `<path d="${SLV.tabSt}" class="st"/>`;
      [310, 330].forEach(x => { s += `<circle cx="${x}" cy="392" r="3.6" fill="url(#sleeve-steel)"/><circle cx="${x}" cy="392" r="3.6" class="ol thin"/>`; });
      s += '<circle cx="320" cy="478" r="10" fill="url(#sleeve-steel)"/><circle cx="320" cy="478" r="10" class="ol thin"/><circle cx="320" cy="478" r="5" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".8"/>';
      return s;
    },
  });
})();
