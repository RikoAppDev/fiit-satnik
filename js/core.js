/* Šatník FIIT STU — shared drawing core.
   Classic script (no modules) so the site works straight from file://.

   ── CONTRACT ────────────────────────────────────────────────────────────────
   Coordinate space: every garment is drawn in viewBox "58 22 524 664"
   (FM.BOX), centred on x = 320. Tops at "size L" use 1 cm ≈ 3.8 units.
   Smaller things (socks, mug…) pick their own scale and state it as `cm`.

   FM.register(type, {
     label,                 // Slovak name of the garment type
     views: ['front','back'],
     cm: 3.8,               // units per centimetre in this drawing
     shadow: {cx,cy,rx,ry}, // floor shadow, or false
     zones: { front:{…}, back:{…} },   // named anchor points for decoration
     draw(view, opts, deco) // → inner SVG markup (no <svg> wrapper).
   })                       //   `deco` is ready markup; place it at the right
                            //   depth (above fabric, below cords/zips/buttons).

   Product (pushed to FM.products):
     { id, name, col, cat, type, price, sizes, blurb, spec:[…],
       ways:[{ n, body, sw?, v:{…css vars…} }], opts:{…}, deco:{ front(z,p), back(z,p) } }
     deco functions receive the garment's zones for that view and return SVG.

   Colour variables (set by FM.applyWay on any ancestor element):
     --body  main fabric          --rib   ribbing (auto: darker body)
     --line  outline              --stitch seam stitching   --fold  crease
     --lining hood lining / inside (FIIT blue by default)
     --cord --aglet --zip --teeth  hardware
     --trim --trim2  contrast garment parts (stripes, tipping, patches)
     --d1 main decoration colour  --d2 accent (FIIT blue)
     --d3 secondary decoration    --d4 contrast to d1 (knock-out)
     --page  paper of the book emblem (ivory, or the body colour on light cloth)
     --noise --heather  fabric grain / melange amount (0–1)
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const FM = (window.FM = window.FM || {});

  FM.BOX = '58 22 524 664';
  FM.W = 640;
  FM.garments = {};
  FM.products = FM.products || [];

  let uidN = 0;
  FM.uid = (p = 'u') => `${p}${++uidN}`;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  FM.esc = esc;

  /* Mirror a path around x = 320. Only absolute M/L/C/Q/S/T/Z with "x,y" pairs:
     no arcs (A), no H/V, no relative commands. */
  FM.mir = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
    (m, x, y) => `${+(FM.W - parseFloat(x)).toFixed(2)},${y}`);

  /* One piece of fabric: fill + shading + texture + grain + outline.
     o.fill   CSS colour (default var(--body), or var(--rib) when o.rib)
     o.rib    true → vertical rib texture and rib colour
     o.tex    'rib' | 'ribh' | 'knit' | 'weave' | null   extra texture
     o.ol     outline path (default d; pass '' for none)
     o.grain  false → no fabric grain (hard goods)
     o.shade  false → no light/shadow gradients */
  FM.fab = (d, o = {}) => {
    const fill = o.fill || (o.rib ? 'var(--rib)' : 'var(--body)');
    const ol = o.ol === undefined ? d : o.ol;
    const tex = o.tex === undefined ? (o.rib ? 'rib' : null) : o.tex;
    let s = `<path d="${d}" style="fill:${fill}"/>`;
    if (o.shade !== false) s += `<path d="${d}" fill="url(#g-shade)"/><path d="${d}" fill="url(#g-vshade)"/>`;
    if (tex) s += `<path d="${d}" fill="url(#g-${tex})"/>`;
    if (o.grain !== false) s += `<path d="${d}" fill="url(#g-noise)" class="nz"/><path d="${d}" fill="url(#g-heather)" class="ht"/>`;
    if (ol) s += `<path d="${ol}" class="ol"/>`;
    return s;
  };

  FM.register = (type, def) => {
    FM.garments[type] = Object.assign(
      { label: type, views: ['front', 'back'], cm: 3.8, zones: {}, shadow: { cx: 320, cy: 650, rx: 236, ry: 16 } }, def);
  };

  /* Inner markup of a garment with its decoration (used directly for sets). */
  FM.inner = (type, view, opts, decoFn, p) => {
    const g = FM.garments[type];
    if (!g) return '';
    const v = g.views.includes(view) ? view : g.views[0];
    let deco = '';
    try { deco = decoFn ? decoFn(g.zones[v] || {}, p || {}) || '' : ''; }
    catch (e) { console.error('[FM] decoration failed:', (p && p.id) || type, v, e); }
    return g.draw(v, Object.assign({}, opts), deco);
  };

  /* Each rendered <svg> gets its own ids. Drawings declare clip paths, patterns and symbols
     with fixed ids, and the same product is drawn in many places at once (card, rail, product
     view, selection). A url(#id) or href="#id" resolves to the first element with that id in
     the whole document; when that one sits in a hidden part of the page (the home page is
     display:none while a product is open), the browser applies no clip at all and the art
     spills out of the garment. Ids declared inside this markup get a per-render suffix;
     references to the shared paint servers in #fm-defs are left alone. */
  let scopeN = 0;
  const scopeIds = svg => {
    const ids = new Set();
    svg.replace(/\sid="([^"]+)"/g, (m, id) => { ids.add(id); return m; });
    if (!ids.size) return svg;
    const sfx = '_' + (++scopeN).toString(36);
    return svg.replace(/(\sid="|url\(#|href="#)([^")]+)/g, (m, pre, id) => (ids.has(id) ? pre + id + sfx : m));
  };

  /* Full <svg> for a product. o.box crops (detail views), o.shadow:false hides the floor. */
  FM.render = (p, view = 'front', o = {}) => scopeIds(renderRaw(p, view, o));
  const renderRaw = (p, view, o) => {
    const g = FM.garments[p.type];
    if (!g) {
      return `<svg class="hd" viewBox="${FM.BOX}" aria-hidden="true"><rect x="170" y="200" width="300" height="300" rx="8" fill="none" stroke="rgba(21,23,27,.25)" stroke-dasharray="6 6"/><text x="320" y="356" text-anchor="middle" class="tx-f" font-size="13" fill="rgba(21,23,27,.5)">${esc(p.type)}</text></svg>`;
    }
    const sh = g.shadow;
    const floor = (!o.box && o.shadow !== false && sh)
      ? `<ellipse cx="${sh.cx}" cy="${sh.cy}" rx="${sh.rx}" ry="${sh.ry}" fill="url(#g-floor)"/>` : '';
    return `<svg class="hd" viewBox="${o.box || FM.fit(p)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
      floor + FM.inner(p.type, view, p.opts, p.deco && p.deco[view], p) + '</svg>';
  };

  /* Framing. Every garment is drawn in FM.BOX, but a crewneck has no hood and a pair of
     socks is small, so each would sit low or tiny in its card. FM.fit measures the bare
     garment once and returns a viewBox that centres it (and enlarges small items).
     Only the frame moves; the drawing space, and so the shared gradients, stay the same. */
  const fitCache = {};
  let fitHost = null;
  FM.fit = p => {
    const g = FM.garments[p.type];
    if (!g || !document.body) return FM.BOX;
    if (g.box) return g.box;
    const key = p.type + '|' + JSON.stringify(p.opts || {});
    if (fitCache[key]) return fitCache[key];
    let box = FM.BOX;
    try {
      if (!fitHost) {
        fitHost = document.createElement('div');
        fitHost.style.cssText = 'position:absolute;left:-9999px;top:0;width:524px;height:664px;visibility:hidden;pointer-events:none';
        fitHost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(fitHost);
      }
      const sh = g.shadow;
      fitHost.innerHTML = `<svg viewBox="${FM.BOX}" width="524" height="664">` +
        (sh ? `<ellipse cx="${sh.cx}" cy="${sh.cy}" rx="${sh.rx}" ry="${sh.ry}"/>` : '') +
        FM.inner(p.type, g.views[0], p.opts, null, p) + '</svg>';
      const bb = fitHost.firstChild.getBBox();
      fitHost.innerHTML = '';
      const sane = bb.width > 40 && bb.height > 40 && bb.x > 30 && bb.x + bb.width < 610 && bb.y > -10 && bb.y + bb.height < 720;
      if (sane) {
        let k = Math.min(.86 * 524 / bb.width, .86 * 664 / bb.height);
        k = k > 1.08 ? Math.min(k, 1.45) : 1;
        const w = 524 / k, h = 664 / k, cy = bb.y + bb.height / 2;
        box = `${+(320 - w / 2).toFixed(1)} ${+(cy - h / 2).toFixed(1)} ${+w.toFixed(1)} ${+h.toFixed(1)}`;
      }
    } catch (e) { box = FM.BOX; }
    return (fitCache[key] = box);
  };
  FM.views = p => (FM.garments[p.type] ? FM.garments[p.type].views : ['front']);

  /* ── colours ─────────────────────────────────────────────────────────────── */
  const C = (FM.C = {
    ink: '#18191C', /* black: navy was dropped, it reads as FEI's colour */ bordo: '#641B2A', bordoDeep: '#5B1825', anthracite: '#2D3035', black: '#18191C',
    oxford: '#A9ADB0', ecru: '#E5DECE', fog: '#BDC2C4', graphite: '#383C41', chalk: '#EFEDE6',
    fiit: '#00A9E0',   /* Pantone 2995 — FIIT */
    stu: '#971D32',    /* Pantone 201 — STU */
    gold: '#C9A54E', ivory: '#ECE5D3',
  });

  const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = h => { const [r, g, b] = hexRgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const darken = (h, k) => '#' + hexRgb(h).map(c => Math.round(c * (1 - k)).toString(16).padStart(2, '0')).join('');
  FM.lum = lum; FM.darken = darken;

  FM.wayVars = way => {
    const light = lum(way.body) > .5;
    return Object.assign({
      body: way.body,
      rib: darken(way.body, light ? .07 : .12),
      line: light ? 'rgba(22,23,27,.72)' : 'rgba(4,6,12,.95)',
      stitch: light ? 'rgba(22,23,27,.34)' : 'rgba(255,255,255,.18)',
      fold: light ? 'rgba(22,23,27,.10)' : 'rgba(0,0,0,.30)',
      lining: C.fiit, cord: way.body, aglet: '#B8B0A0', zip: C.fiit, teeth: '#B9A779',
      trim: C.fiit, trim2: C.ivory,
      noise: light ? .16 : .17, heather: 0,
      d1: light ? C.ink : C.ivory, d2: C.fiit, d3: C.ivory, d4: C.ink,
      page: light ? '#F7F3EA' : C.ivory,
      /* which version of the official logo shows (see FM.art.logo): 1 = visible */
      'lg-white': light ? 0 : 1, 'lg-color': light ? 1 : 0, 'lg-black': 0,
    }, way.v || {});
  };
  FM.applyWay = (el, way) => {
    const vars = FM.wayVars(way);
    for (const k in vars) el.style.setProperty('--' + k, vars[k]);
  };

  const heatherSw = 'repeating-linear-gradient(90deg,#9EA2A6 0 2px,#B8BCBF 2px 3px)';
  const sig = { d1: C.gold, d2: C.fiit, d3: C.ivory, d4: C.ink, cord: '#E7E0CF', trim: C.gold, trim2: C.fiit };
  /* Colourway presets per collection. Reuse them so the collections stay coherent. */
  FM.ways = {
    sigillum: [
      { n: 'Čierna', body: C.black, v: sig },
      { n: 'STU bordó', body: C.bordoDeep, v: sig },
      { n: 'Antracit', body: C.anthracite, v: sig },
    ],
    varsity: [
      { n: 'Oxford melír', body: C.oxford, sw: heatherSw, v: { heather: .5, noise: .16, d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, cord: C.ink, trim: C.ink, trim2: C.fiit } },
      { n: 'Čierna', body: C.black, v: { d1: C.ivory, d2: C.fiit, d3: C.ivory, d4: C.ink, cord: C.ivory, trim: C.ivory, trim2: C.fiit } },
      { n: 'Ecru', body: '#E6DFD0', v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, cord: C.ink, trim: C.ink, trim2: C.fiit } },
    ],
    ilkovicova: [
      { n: 'Ecru, nefarbená', body: C.ecru, v: { d1: '#B4A88E', d2: '#BDB198', d3: '#B4A88E', d4: '#B4A88E', page: C.ecru, trim: '#CFC6B2', trim2: C.fiit, noise: .2 } },
      { n: 'Hmla', body: C.fog, v: { d1: '#8C9397', d2: '#959CA0', d3: '#8C9397', d4: '#8C9397', page: C.fog, trim: '#A9AFB2', trim2: C.fiit } },
      { n: 'Grafit', body: C.graphite, v: { d1: '#6E747C', d2: '#646A72', d3: '#6E747C', d4: '#6E747C', page: C.graphite, trim: '#4A4F56', trim2: C.fiit } },
    ],
    bordo: [
      { n: 'STU bordó', body: C.bordo, v: { d1: '#EDE6D4', d2: C.fiit, d3: '#EDE6D4', d4: C.ink, cord: '#EDE6D4', trim: C.fiit, trim2: '#EDE6D4' } },
      { n: 'Čierna', body: C.black, v: { d1: '#EDE6D4', d2: C.fiit, d3: '#EDE6D4', d4: C.ink, cord: '#EDE6D4', trim: C.fiit, trim2: '#EDE6D4' } },
    ],
    teoria: [
      { n: 'Čierna', body: C.black, v: { d1: '#EAE4D4', d2: C.fiit, d3: '#EAE4D4', d4: C.black, cord: '#232428', trim: C.fiit, trim2: '#EAE4D4' } },
      { n: 'Antracit', body: C.anthracite, v: { d1: '#EAE4D4', d2: C.fiit, d3: '#EAE4D4', d4: C.anthracite, cord: '#3A3E44', trim: C.fiit, trim2: '#EAE4D4' } },
      { n: 'Krieda', body: C.chalk, v: { d1: C.ink, d2: '#0092C4', d3: C.ink, d4: C.chalk, cord: C.chalk, trim: C.ink, trim2: C.fiit } },
    ],
    /* logo: the official FIIT logo. Light cloth shows the colour version, dark cloth and
       FIIT blue the negative (white) one, heather the black one. */
    logo: [
      /* the faculty's turquoise is the primary colour, so it leads; black is today's hoodie */
      { n: 'Tyrkysová 2995', body: C.fiit, v: { 'lg-white': 1, 'lg-color': 0, d1: '#FFFFFF', cord: '#FFFFFF', lining: C.ink, zip: C.ink, trim: C.ink, trim2: '#FFFFFF' } },
      { n: 'Čierna', body: C.black, v: { d1: '#FFFFFF', cord: '#FFFFFF', trim: C.fiit, trim2: '#FFFFFF' } },
      { n: 'Biela', body: '#F6F6F3', v: { cord: '#F6F6F3', trim: C.fiit, trim2: C.ink } },
      { n: 'Oxford melír', body: C.oxford, sw: heatherSw, v: { heather: .5, noise: .16, 'lg-color': 0, 'lg-black': 1, cord: C.ink, trim: C.ink, trim2: C.fiit } },
    ],
    /* monogram: d1 = letters FI, d2 = letters IT (the accent), body may be FIIT blue itself */
    monogram: [
      { n: 'Tyrkysová 2995', body: C.fiit, v: { d1: C.ink, d2: '#F4F1E8', d3: C.ink, d4: C.fiit, cord: C.ink, lining: C.ink, zip: C.ink, trim: C.ink, trim2: '#F4F1E8' } },
      { n: 'Čierna', body: C.black, v: { d1: '#F4F1E8', d2: C.fiit, d3: '#F4F1E8', d4: C.ink, cord: '#F4F1E8', trim: C.fiit, trim2: '#F4F1E8' } },
      { n: 'Krieda', body: C.chalk, v: { d1: C.ink, d2: '#0092C4', d3: C.ink, d4: C.chalk, cord: C.ink, trim: C.ink, trim2: C.fiit } },
    ],
    /* rocnik (2003 look): d1 = silver / main, d2 = accent */
    rocnik: [
      { n: 'Čierna', body: C.black, v: { d1: '#D5DADF', d2: C.fiit, d3: '#D5DADF', d4: C.black, cord: '#D5DADF', trim: C.fiit, trim2: '#D5DADF' } },
      { n: 'Biela', body: '#F3F3F0', v: { d1: C.ink, d2: '#0092C4', d3: '#8D96A0', d4: '#F3F3F0', cord: C.ink, trim: C.fiit, trim2: C.ink } },
      { n: 'Tyrkysová 2995', body: C.fiit, v: { d1: '#F4F1E8', d2: C.ink, d3: '#F4F1E8', d4: C.fiit, cord: '#F4F1E8', lining: C.ink, zip: C.ink, trim: C.ink, trim2: '#F4F1E8' } },
    ],
    /* semester: d1 = stamp ink, d2 = second ink */
    semester: [
      { n: 'Ecru', body: '#E6DFD0', v: { d1: '#8E2233', d2: C.ink, d3: C.ink, d4: '#E6DFD0', cord: C.ink, trim: C.ink, trim2: C.fiit } },
      { n: 'Čierna', body: C.black, v: { d1: '#EDE6D4', d2: C.fiit, d3: '#EDE6D4', d4: C.ink, cord: '#EDE6D4', trim: C.fiit, trim2: '#EDE6D4' } },
      { n: 'Oxford melír', body: C.oxford, sw: heatherSw, v: { heather: .5, noise: .16, d1: C.ink, d2: '#8E2233', d3: C.ink, d4: C.ivory, cord: C.ink, trim: C.ink, trim2: C.fiit } },
    ],
    absolvent: [
      { n: 'Čierna', body: C.black, v: { d1: '#EAE4D4', d2: C.fiit, d3: '#EAE4D4', d4: C.black, cord: '#232428', trim: C.fiit, trim2: '#EAE4D4' } },
      { n: 'Antracit', body: C.anthracite, v: { d1: '#EAE4D4', d2: C.fiit, d3: '#EAE4D4', d4: C.anthracite, cord: '#3A3E44', trim: C.fiit, trim2: '#EAE4D4' } },
    ],
  };

  /* ── decoration helpers ──────────────────────────────────────────────────── */
  FM.E = 'filter="url(#g-emb)"';    // heavy embroidery (emblems, script)
  FM.S = 'filter="url(#g-embs)"';   // light embroidery (small lettering)
  FM.T = 'filter="url(#g-twill)"';  // sewn-on appliqué / patch lift
  FM.CH = 'filter="url(#g-chen)"';  // chenille (fuzzy varsity patch)
  FM.ST = 'filter="url(#g-stamp)"'; // worn rubber-stamp ink

  /* Text. o: f 'm' serif | 'g' varsity | 's' sans | 'f' mono | 'y' script,
     size, ls, w (weight), it, anchor, rot, fill, op, fx 'E'|'S'|'T'|'CH' */
  FM.t = (s, x, y, o = {}) => {
    const a = [`x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" class="tx-${o.f || 's'}" font-size="${o.size || 8}"`];
    if (o.ls != null) a.push(`letter-spacing="${o.ls}"`);
    if (o.w) a.push(`font-weight="${o.w}"`);
    if (o.it) a.push('font-style="italic"');
    if (o.rot) a.push(`transform="rotate(${o.rot} ${x} ${y})"`);
    if (o.fx) a.push(FM[o.fx]);
    a.push(`style="fill:${o.fill || 'var(--d1)'}${o.op != null ? ';opacity:' + o.op : ''}"`);
    return `<text ${a.join(' ')}>${esc(s)}</text>`;
  };

  const A = (FM.art = {});

  /* Arched text. Ends sit on baseline y, the middle rises by `rise`. */
  A.arc = (s, cx, y, w, rise, o = {}) => {
    const id = FM.uid('arc');
    const a = [`class="tx-${o.f || 'g'}" font-size="${o.size || 8}"`];
    if (o.ls != null) a.push(`letter-spacing="${o.ls}"`);
    if (o.w) a.push(`font-weight="${o.w}"`);
    if (o.fx) a.push(FM[o.fx]);
    a.push(`style="fill:${o.fill || 'var(--d1)'}"`);
    return `<path id="${id}" d="M${cx - w / 2},${y} Q${cx},${y - 2 * rise} ${cx + w / 2},${y}" fill="none"/>` +
      `<text ${a.join(' ')}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(s)}</textPath></text>`;
  };

  /* Varsity appliqué lettering: twill letters with a contrast edge and zig-zag stitch.
     o: fill (d1), edge (d2), ls, sw (edge width), f */
  A.block = (s, cx, y, size, o = {}) => {
    const base = `x="${cx}" y="${y}" text-anchor="middle" class="tx-${o.f || 'g'}" font-size="${size}" letter-spacing="${o.ls != null ? o.ls : +(size * .04).toFixed(2)}"`;
    const edge = o.edge || 'var(--d2)', fill = o.fill || 'var(--d1)';
    const sw = o.sw != null ? o.sw : +(size * .15).toFixed(2);
    const t = esc(s);
    return `<g ${FM.T}>` +
      `<text ${base} style="fill:${edge};stroke:${edge}" stroke-width="${sw}" stroke-linejoin="round">${t}</text>` +
      `<text ${base} style="fill:${fill}">${t}</text>` +
      `<text ${base} fill="none" stroke="rgba(128,128,128,.55)" stroke-width="${+(size * .011).toFixed(2)}" stroke-dasharray="${+(size * .022).toFixed(2)} ${+(size * .018).toFixed(2)}">${t}</text>` +
      '</g>';
  };

  /* Chain-stitch script with an optional swash underneath.
     o: rot (-7), swash (true), fill (d1), line (d2) */
  A.script = (s, cx, y, size, o = {}) => {
    const rot = o.rot != null ? o.rot : -7;
    const fill = o.fill || 'var(--d1)', line = o.line || 'var(--d2)';
    const hw = .228 * size * s.length, k = size;
    const base = `x="${cx}" y="${y}" text-anchor="middle" class="tx-y" font-size="${size}"`;
    const sw = o.swash === false ? '' :
      `<path d="M${cx - hw},${y + .4 * k} C${cx - .45 * hw},${y + .67 * k} ${cx + .45 * hw},${y + .6 * k} ${cx + .87 * hw},${y + .23 * k} C${cx + .97 * hw},${y + .13 * k} ${cx + 1.06 * hw},${y + .03 * k} ${cx + 1.12 * hw},${y - .13 * k}" fill="none" style="stroke:${line}" stroke-width="${+(size * .073).toFixed(2)}" stroke-linecap="round"/>`;
    return `<g transform="rotate(${rot} ${cx} ${y})" ${FM.E}>` +
      `<text ${base} style="fill:${fill}">${esc(s)}</text>` +
      `<text ${base} fill="none" stroke="rgba(0,0,0,.28)" stroke-width="${+(size * .015).toFixed(2)}" stroke-dasharray="${+(size * .033).toFixed(2)} ${+(size * .027).toFixed(2)}">${esc(s)}</text>` +
      sw + '</g>';
  };

  /* Binary tape. Default bits = 2003 (the founding year) in binary.
     w = total width, y = top edge. o: bits, on (d2), off (d1), fillOff */
  A.BITS = '11111010011';
  A.tape = (cx, y, w, o = {}) => {
    const bits = o.bits || A.BITS, n = bits.length;
    const cell = w / (n + .2 * (n - 1)), gap = cell * .2;
    const on = o.on || 'var(--d2)', off = o.off || 'var(--d1)';
    const sw = +(cell * .14).toFixed(2);
    let s = '', x = cx - w / 2;
    for (let i = 0; i < n; i++) {
      const X = +(x + i * (cell + gap)).toFixed(2);
      s += bits[i] === '1'
        ? `<rect x="${X}" y="${y}" width="${+cell.toFixed(2)}" height="${+cell.toFixed(2)}" style="fill:${on}"/>`
        : `<rect x="${+(X + sw / 2).toFixed(2)}" y="${+(y + sw / 2).toFixed(2)}" width="${+(cell - sw).toFixed(2)}" height="${+(cell - sw).toFixed(2)}" style="fill:${o.fillOff || 'none'};stroke:${off}" stroke-width="${sw}"/>`;
    }
    return s;
  };
  A.tapeH = w => w / (A.BITS.length + .2 * (A.BITS.length - 1));

  /* Open book. w = full width. o: line (d1), page (--page), text (d2) */
  A.book = (cx, cy, w, o = {}) => {
    const k = +(w / 88).toFixed(4);
    const line = o.line || 'var(--d1)', page = o.page || 'var(--page)', txt = o.text || 'var(--d2)';
    const L = 'M0,-12 C-9,-21 -27,-22 -40,-17 L-40,17 C-27,12 -9,13 0,22 Z';
    const R = 'M0,-12 C9,-21 27,-22 40,-17 L40,17 C27,12 9,13 0,22 Z';
    let lines = '';
    for (let i = 0; i < 3; i++) {
      const d = i * 8;
      lines += `<path d="M-34,${-10 + d} C-25,${-14 + d} -13,${-13 + d} -6,${-7 + d}"/><path d="M34,${-10 + d} C25,${-14 + d} 13,${-13 + d} 6,${-7 + d}"/>`;
    }
    return `<g transform="translate(${cx},${cy}) scale(${k})">` +
      `<path d="M-40,-12 L-44,-11 L-44,22 C-30,17 -10,18 0,27 C10,18 30,17 44,22 L44,-11 L40,-12" fill="none" style="stroke:${line}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<path d="${L}" style="fill:${page};stroke:${line}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="${R}" style="fill:${page};stroke:${line}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<g fill="none" style="stroke:${txt}" stroke-width="2.2" stroke-linecap="round">${lines}</g>` +
      '</g>';
  };

  /* Small emblem for chest embroidery, patches, labels: book above the tape.
     w = width. o: year (adds MMIII), fx, plus colours of book/tape */
  A.mark = (cx, cy, w, o = {}) => {
    const k = w / 88, top = cy - (o.year ? 17 : 10.5) * k;
    let s = A.book(cx, top, w, o) + A.tape(cx, +(top + 36 * k).toFixed(2), w * .98, o);
    if (o.year) s += FM.t('MMIII', cx, +(top + 36 * k + 6.9 * k + 13 * k).toFixed(2), { f: 'm', size: +(11 * k).toFixed(2), ls: +(3.4 * k).toFixed(2), fill: o.line || 'var(--d1)' });
    return o.fx ? `<g ${FM[o.fx]}>${s}</g>` : s;
  };

  /* Full faculty seal (proposal): official name around, book + tape + MMIII inside,
     motto at the bottom. d = diameter. o: disc (background fill), fx, line/page/text/on/off */
  A.seal = (cx, cy, d, o = {}) => {
    const k = +(d / 180).toFixed(4);
    const line = o.line || 'var(--d1)';
    const top = FM.uid('sealT'), bot = FM.uid('sealB');
    const ring = `fill="none" style="stroke:${line}"`;
    const s =
      (o.disc ? `<circle r="90" style="fill:${o.disc}"/>` : '') +
      `<circle r="88" ${ring} stroke-width="2.4"/><circle r="84.2" ${ring} stroke-width=".8"/><circle r="64.5" ${ring} stroke-width=".9"/>` +
      `<path id="${top}" d="M-60.2,42.2 A73.5,73.5 0 1 1 60.2,42.2" fill="none"/>` +
      `<path id="${bot}" d="M-65.1,45.6 A79.5,79.5 0 0 0 65.1,45.6" fill="none"/>` +
      `<text class="tx-m" font-size="7.5" letter-spacing=".62" style="fill:${line}"><textPath href="#${top}" startOffset="50%" text-anchor="middle">FAKULTA INFORMATIKY A INFORMAČNÝCH TECHNOLÓGIÍ STU</textPath></text>` +
      `<text class="tx-m" font-size="7.5" letter-spacing="1.5" style="fill:${line}"><textPath href="#${bot}" startOffset="50%" text-anchor="middle">MENS ET MACHINA</textPath></text>` +
      `<circle cx="-59.6" cy="48.2" r="1.5" style="fill:${line}"/><circle cx="59.6" cy="48.2" r="1.5" style="fill:${line}"/>` +
      A.book(0, -14, 76, o) + A.tape(0, 20, 74, o) +
      FM.t('MMIII', 0, 45, { f: 'm', size: 11, ls: 3.4, fill: line });
    return `<g transform="translate(${cx},${cy}) scale(${k})"${o.fx ? ' ' + FM[o.fx] : ''}>${s}</g>`;
  };

  /* Two-line wordmark for small chest embroidery. */
  A.lockup = (cx, y, o = {}) => {
    const k = o.k || 1, fill = o.fill || 'var(--d1)';
    const s = FM.t('FIIT', cx, y, { f: 's', w: 700, size: 10 * k, ls: 1.4 * k, fill }) +
      FM.t(o.sub || 'STU · MMIII', cx, +(y + 8.5 * k).toFixed(2), { f: 's', w: 600, size: 4.4 * k, ls: 2 * k, fill });
    return `<g ${FM[o.fx || 'S']}>${s}</g>`;
  };

  /* Faculty address as coordinates (Ilkovičova 2, Bratislava). */
  A.coords = (cx, y, o = {}) => {
    const k = o.k || 1, fill = o.fill || 'var(--d1)';
    const s = FM.t('48°09′N 17°04′E', cx, y, { f: 'f', size: 8 * k, ls: 1.2 * k, fill }) +
      FM.t('ILKOVIČOVA 2 · BRATISLAVA', cx, +(y + 11 * k).toFixed(2), { f: 'f', size: 5.2 * k, ls: 1.4 * k, fill });
    return o.fx === null ? s : `<g ${FM[o.fx || 'S']}>${s}</g>`;
  };

  /* ── shared paint servers ────────────────────────────────────────────────── */
  /* ── official FIIT logo (collection Oficiálna) ───────────────────────────────
     The real logo from the STU graphic manual, rasterised from the official PDFs
     (tools/make_logos.sh). It is always placed whole and unaltered, with its protective
     zone: `w` is the width INCLUDING that zone (the mark itself is about 73 % of w,
     or 90 % for the version with the faculty name). Three versions are stacked and the
     colourway shows one through --lg-white / --lg-color / --lg-black; pass o.variant
     ('color' | 'black' | 'white') to force one. o.name → horizontal version with the
     full name; o.stack → the manual's vertical version, name under the mark (83 % of w). */
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/js\/core\.js.*$/, '');
  FM.asset = p => BASE + 'assets/' + p;
  const LOGO = {
    mark: { file: 'fiit-', iw: 933, ih: 343, cw: 675 },
    name: { file: 'fiit-name-', iw: 1393, ih: 304, cw: 1343 },
    stack: { file: 'fiit-stack-', iw: 1424, ih: 820, cw: 1355 },
  };
  const logoKind = o => (o && o.stack ? 'stack' : o && o.name ? 'name' : 'mark');
  A.logoH = (w, o) => { const L = LOGO[logoKind(o)]; return w * L.ih / L.cw; };
  A.logo = (cx, cy, w, o = {}) => {
    const L = LOGO[logoKind(o)], h = w * L.ih / L.cw;
    const img = v => `<image href="${FM.asset('logo/' + L.file + v + '.png')}" width="${L.iw}" height="${L.ih}"` +
      (o.variant ? '' : ` style="opacity:var(--lg-${v},0)"`) + '/>';
    const s = `<svg x="${+(cx - w / 2).toFixed(2)}" y="${+(cy - h / 2).toFixed(2)}" width="${+w.toFixed(2)}" height="${+h.toFixed(2)}" viewBox="0 0 ${L.cw} ${L.ih}">` +
      (o.variant ? img(o.variant) : img('white') + img('color') + img('black')) + '</svg>';
    return o.rot ? `<g transform="rotate(${o.rot} ${cx} ${cy})">${s}</g>` : s;
  };

  /* Back print asked for by the faculty: the mark large and centred, the full names of the
     university and the faculty under it, flush left with the mark and as wide as it.
     Both parts are official artwork (the mark, and the name lines cut from the vertical
     version, so the type is the real Botanika). The arrangement itself is not one of the
     manual's versions and needs approval. vw = visible width, top = top edge of the dots.
     Pixel boxes of the artwork: mark x 92–583, y 92–250; name lines x 115–1240, y 415–708. */
  A.logoBack = (cx, top, vw, o = {}) => {
    const M = LOGO.mark, S = LOGO.stack, mk = vw / 491, tk = vw / 1125;
    const gap = o.gap != null ? o.gap : vw * .1;
    const ty = top + 158 * mk + gap;
    const three = L => ['white', 'color', 'black'].map(v =>
      `<image href="${FM.asset('logo/' + L.file + v + '.png')}" width="${L.iw}" height="${L.ih}" style="opacity:var(--lg-${v},0)"/>`).join('');
    const n = v => +v.toFixed(2);
    return `<svg x="${n(cx - vw / 2 - 92 * mk)}" y="${n(top - 92 * mk)}" width="${n(M.iw * mk)}" height="${n(M.ih * mk)}" viewBox="0 0 ${M.iw} ${M.ih}">${three(M)}</svg>` +
      `<svg x="${n(cx - vw / 2 - 10 * tk)}" y="${n(ty - 10 * tk)}" width="${n(1145 * tk)}" height="${n(313 * tk)}" viewBox="105 405 1145 313">${three(S)}</svg>`;
  };
  A.logoBackH = (vw, gap) => vw * 158 / 491 + (gap != null ? gap : vw * .1) + vw * 293 / 1125;

  /* ── modular FIIT STU lettering (collection Monogram) ────────────────────────
     Letters are built from bars on a grid, so they need no font. Supported: F I T S U. */
  const GLYPH = {
    F: (w, h, t) => [[0, 0, t, h], [0, 0, w, t], [0, (h - t) * .46, w * .8, t]],
    I: (w, h, t) => [[(w - t) / 2, 0, t, h], [0, 0, w, t], [0, h - t, w, t]],
    T: (w, h, t) => [[0, 0, w, t], [(w - t) / 2, 0, t, h]],
    S: (w, h, t) => [[0, 0, w, t], [0, (h - t) / 2, w, t], [0, h - t, w, t], [0, 0, t, (h + t) / 2], [w - t, (h - t) / 2, t, (h + t) / 2]],
    U: (w, h, t) => [[0, 0, t, h], [w - t, 0, t, h], [0, h - t, w, t]],
  };
  const bars = (ch, x, y, w, h, t, fill) => (GLYPH[ch] ? GLYPH[ch](w, h, t) : []).map(r =>
    `<rect x="${+(x + r[0]).toFixed(2)}" y="${+(y + r[1]).toFixed(2)}" width="${+r[2].toFixed(2)}" height="${+r[3].toFixed(2)}" style="fill:${fill}"/>`).join('');

  /* 2 × 2 monogram: FI over IT, the bottom row "IT" in the accent colour.
     size = full width and height, centred on cx, cy. o: fill (d1), accent (d2), fx, weight (.26) */
  A.mono = (cx, cy, size, o = {}) => {
    const gap = size * .1, s = (size - gap) / 2, t = s * (o.weight || .26);
    const x = cx - size / 2, y = cy - size / 2;
    const fill = o.fill || 'var(--d1)', acc = o.accent || 'var(--d2)';
    const out = bars('F', x, y, s, s, t, fill) + bars('I', x + s + gap, y, s, s, t, fill) +
      bars('I', x, y + s + gap, s, s, t, acc) + bars('T', x + s + gap, y + s + gap, s, s, t, acc);
    return o.fx ? `<g ${FM[o.fx]}>${out}</g>` : out;
  };

  /* Modular wordmark in one line, default "FIIT STU" with "IT" in the accent colour.
     h = letter height, y = top edge, centred on cx. o: text, fill (d1), accent (d2), fx.
     A.wordW(h, text) gives its width. */
  const WORD_W = { F: .74, I: .6, T: .76, S: .74, U: .74, ' ': .46 };
  A.wordW = (h, text = 'FIIT STU') => [...text].reduce((n, c) => n + (WORD_W[c] || 0) * h, 0) + (text.length - 1) * h * .15;
  A.word = (cx, y, h, o = {}) => {
    const text = o.text || 'FIIT STU', t = h * (o.weight || .24);
    const fill = o.fill || 'var(--d1)', acc = o.accent || 'var(--d2)';
    const it = text.indexOf('IT');
    let x = cx - A.wordW(h, text) / 2, out = '';
    [...text].forEach((c, i) => {
      const w = (WORD_W[c] || 0) * h;
      out += bars(c, x, y, w, h, t, (it >= 0 && (i === it || i === it + 1)) ? acc : fill);
      x += w + h * .15;
    });
    return o.fx ? `<g ${FM[o.fx]}>${out}</g>` : out;
  };

  /* ── 2003 oval logo (collection Ročník 03) ───────────────────────────────────
     Wide italic FIIT in an oval with an orbit and stars. w = oval width.
     o: main (d1), accent (d2), sub ('STU · 2003'), fx */
  const star4 = (x, y, r, fill) => `<path d="M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r} Z" style="fill:${fill}"/>`;
  A.star4 = star4;
  A.y2k = (cx, cy, w, o = {}) => {
    const k = +(w / 200).toFixed(4), main = o.main || 'var(--d1)', acc = o.accent || 'var(--d2)';
    const s =
      `<ellipse rx="118" ry="27" transform="rotate(-13)" fill="none" style="stroke:${acc}" stroke-width="3.2"/>` +
      `<ellipse rx="100" ry="52" fill="none" style="stroke:${main}" stroke-width="4.6"/>` +
      `<g transform="skewX(-12)"><text x="2" y="10" text-anchor="middle" class="tx-w" font-size="41" letter-spacing="2" paint-order="stroke" stroke-linejoin="round" stroke-width="9" style="fill:${main};stroke:var(--body)">FIIT</text></g>` +
      `<text x="0" y="33" text-anchor="middle" class="tx-w" font-size="8.6" letter-spacing="3.2" paint-order="stroke" stroke-width="5" style="fill:${acc};stroke:var(--body)">${esc(o.sub || 'STU · 2003')}</text>` +
      star4(92, -52, 14, acc) + star4(110, -30, 5.5, main) + star4(-98, 46, 8, acc);
    return `<g transform="translate(${cx},${cy}) scale(${k})"${o.fx ? ' ' + FM[o.fx] : ''}>${s}</g>`;
  };

  /* ── rubber stamp (collection Semester) ──────────────────────────────────────
     Round office stamp with a banner across. d = diameter of the ring.
     o: word ('ZAPOČÍTANÉ'), top ('FIIT STU · BRATISLAVA'), sub ('ZIMNÝ SEMESTER'), ink (d1), rot (-9) */
  A.stamp = (cx, cy, d, o = {}) => {
    const k = +(d / 180).toFixed(4), ink = o.ink || 'var(--d1)';
    const top = FM.uid('stT'), bot = FM.uid('stB');
    const ring = `fill="none" style="stroke:${ink}"`;
    const s =
      `<circle r="88" ${ring} stroke-width="3.4"/><circle r="81" ${ring} stroke-width="1.1"/><circle r="52" ${ring} stroke-width="1.1"/>` +
      `<path id="${top}" d="M-62.6,0 A62.6,62.6 0 0 1 62.6,0" fill="none"/>` +
      `<path id="${bot}" d="M-71,0 A71,71 0 0 0 71,0" fill="none"/>` +
      `<text class="tx-s" font-weight="700" font-size="9" letter-spacing="1.2" style="fill:${ink}"><textPath href="#${top}" startOffset="50%" text-anchor="middle">${esc(o.top || 'FIIT STU · BRATISLAVA')}</textPath></text>` +
      `<text class="tx-s" font-weight="700" font-size="9" letter-spacing="1.6" style="fill:${ink}"><textPath href="#${bot}" startOffset="50%" text-anchor="middle">${esc(o.sub || 'ZIMNÝ SEMESTER')}</textPath></text>` +
      `<rect x="-112" y="-19" width="224" height="38" style="fill:var(--body)"/>` +
      `<path d="M-112,-19 H112 M-112,19 H112" ${ring} stroke-width="2.6"/>` +
      `<text x="0" y="8.6" text-anchor="middle" class="tx-s" font-weight="700" font-size="24" letter-spacing="2.4" style="fill:${ink}">${esc(o.word || 'ZAPOČÍTANÉ')}</text>`;
    return `<g transform="translate(${cx},${cy}) rotate(${o.rot != null ? o.rot : -9}) scale(${k})" ${FM.ST}>${s}</g>`;
  };

  function prng(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function grainTile() {
    const n = 192, c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d'), img = g.createImageData(n, n), r = prng(7);
    for (let i = 0; i < n * n; i++) {
      const light = r() < .5, a = Math.pow(r(), 2) * 235;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = light ? 255 : 0;
      img.data[i * 4 + 3] = a;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }
  function heatherTile() {
    const n = 240, c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d'), r = prng(19);
    for (let i = 0; i < 5200; i++) {
      const x = r() * n, y = Math.floor(r() * n), len = 2 + r() * 6, light = r() < .55;
      g.fillStyle = light ? `rgba(255,255,255,${(.2 + r() * .6).toFixed(2)})` : `rgba(22,24,30,${(.15 + r() * .45).toFixed(2)})`;
      g.fillRect(x, y, len, 1);
      if (x + len > n) g.fillRect(x - n, y, len, 1);
    }
    return c.toDataURL('image/png');
  }

  FM.mountDefs = () => {
    if (document.getElementById('fm-defs')) return;
    const svg = `<svg id="fm-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="g-shade" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="550" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset=".36" stop-color="#fff" stop-opacity=".03"/>
        <stop offset=".62" stop-color="#000" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".26"/>
      </linearGradient>
      <linearGradient id="g-vshade" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="640">
        <stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".14"/>
      </linearGradient>
      <linearGradient id="g-lin" gradientUnits="userSpaceOnUse" x1="0" y1="76" x2="0" y2="236">
        <stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".5" stop-color="#000" stop-opacity=".16"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="g-floor" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#15171B" stop-opacity=".22"/><stop offset="1" stop-color="#15171B" stop-opacity="0"/>
      </radialGradient>
      <pattern id="g-rib" width="4.2" height="20" patternUnits="userSpaceOnUse">
        <rect width="1.5" height="20" fill="#000" fill-opacity=".2"/><rect x="2.2" width="1" height="20" fill="#fff" fill-opacity=".07"/>
      </pattern>
      <pattern id="g-ribh" width="20" height="4.2" patternUnits="userSpaceOnUse">
        <rect width="20" height="1.5" fill="#000" fill-opacity=".2"/><rect y="2.2" width="20" height="1" fill="#fff" fill-opacity=".07"/>
      </pattern>
      <pattern id="g-knit" width="6" height="5" patternUnits="userSpaceOnUse">
        <path d="M.5,.3 L3,4.5 L5.5,.3" fill="none" stroke="#000" stroke-opacity=".2" stroke-width=".8" stroke-linecap="round"/>
        <path d="M1.4,.3 L3,3 L4.6,.3" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width=".7" stroke-linecap="round"/>
      </pattern>
      <pattern id="g-weave" width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="3" height="1" fill="#000" fill-opacity=".09"/><rect width="1" height="3" fill="#000" fill-opacity=".07"/>
        <rect x="1.5" y="1.5" width="1.5" height="1.5" fill="#fff" fill-opacity=".06"/>
      </pattern>
      <pattern id="g-noise" width="128" height="128" patternUnits="userSpaceOnUse">
        <image href="${grainTile()}" width="128" height="128" preserveAspectRatio="none"/>
      </pattern>
      <pattern id="g-heather" width="160" height="160" patternUnits="userSpaceOnUse">
        <image href="${heatherTile()}" width="160" height="160" preserveAspectRatio="none"/>
      </pattern>
      <filter id="g-emb" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="2.4 .16" numOctaves="1" seed="2" result="t"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.3 0 0 0 -.6" result="hi"/>
        <feComposite in="hi" in2="SourceAlpha" operator="in" result="hiIn"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.1 0 0 0 .62" result="lo"/>
        <feComposite in="lo" in2="SourceAlpha" operator="in" result="loIn"/>
        <feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="hiIn"/><feMergeNode in="loIn"/></feMerge>
        <feDropShadow in="m" dx="0" dy=".55" stdDeviation=".45" flood-color="#000" flood-opacity=".55"/>
      </filter>
      <filter id="g-embs" x="-10%" y="-20%" width="120%" height="150%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="2.6 .2" numOctaves="1" seed="4" result="t"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .7 0 0 0 -.38" result="hi"/>
        <feComposite in="hi" in2="SourceAlpha" operator="in" result="hiIn"/>
        <feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="hiIn"/></feMerge>
        <feDropShadow in="m" dx="0" dy=".4" stdDeviation=".3" flood-color="#000" flood-opacity=".45"/>
      </filter>
      <filter id="g-twill" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="1.1" stdDeviation=".7" flood-color="#000" flood-opacity=".42"/>
      </filter>
      <filter id="g-stamp" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="21" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -8 0 0 0 6.1" result="m"/>
        <feComposite in="SourceGraphic" in2="m" operator="in"/>
      </filter>
      <filter id="g-chen" x="-15%" y="-15%" width="130%" height="135%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="11" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.9 0 0 0 -.9" result="hi"/>
        <feComposite in="hi" in2="d" operator="in" result="hiIn"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.7 0 0 0 .78" result="lo"/>
        <feComposite in="lo" in2="d" operator="in" result="loIn"/>
        <feMerge result="m"><feMergeNode in="d"/><feMergeNode in="hiIn"/><feMergeNode in="loIn"/></feMerge>
        <feDropShadow in="m" dx="0" dy="1.2" stdDeviation=".8" flood-color="#000" flood-opacity=".5"/>
      </filter>
    </defs></svg>`;
    document.body.insertAdjacentHTML('afterbegin', svg);
  };
  if (document.body) FM.mountDefs();
  else document.addEventListener('DOMContentLoaded', FM.mountDefs);

  FM.eur = n => '€' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
})();
