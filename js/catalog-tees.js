/* Šatník FIIT STU — tričká a polokošeľa (types tee, polo from garments-tees.js).
   Sizes are real centimetres through the garment's cm (3.8 units per cm). */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C, SIZES = FM.SIZES;

  const TEE = 'Česaná bavlna 240 g/m², boxy strih so zníženým ramenom';
  const RIB = 'Rebrový golier, lemy prešité dvojihlovým stehom';

  /* Arched varsity appliqué (same three layers as FM.art.block, set on a curve).
     Ends of the curve sit on baseline y, the middle rises by `rise`. */
  const arcBlock = (s, cx, y, w, rise, size, o = {}) => {
    const id = FM.uid('teeArc');
    const edge = o.edge || 'var(--d2)', fill = o.fill || 'var(--d1)';
    const sw = o.sw != null ? o.sw : +(size * .15).toFixed(2);
    const a = `class="tx-g" font-size="${size}" letter-spacing="${o.ls != null ? o.ls : +(size * .04).toFixed(2)}"`;
    const tp = `<textPath href="#${id}" startOffset="50%" text-anchor="middle">${FM.esc(s)}</textPath>`;
    return `<path id="${id}" d="M${cx - w / 2},${y} Q${cx},${y - 2 * rise} ${cx + w / 2},${y}" fill="none"/>` +
      `<g ${FM.T}>` +
      `<text ${a} style="fill:${edge};stroke:${edge}" stroke-width="${sw}" stroke-linejoin="round">${tp}</text>` +
      `<text ${a} style="fill:${fill}">${tp}</text>` +
      `<text ${a} fill="none" stroke="rgba(128,128,128,.55)" stroke-width="${+(size * .011).toFixed(2)}" stroke-dasharray="${+(size * .022).toFixed(2)} ${+(size * .018).toFixed(2)}">${tp}</text>` +
      '</g>';
  };

  /* Monospace-style lambda drawn as two strokes, clipped flat at top and bottom. h = height. */
  const lambda = (cx, cy, h, fill) => {
    const k = h / 62, id = FM.uid('teeLam');
    const P = (x, y) => `${+(cx + x * k).toFixed(2)},${+(cy + y * k).toFixed(2)}`;
    return `<clipPath id="${id}"><rect x="${+(cx - 40 * k).toFixed(2)}" y="${+(cy - 31 * k).toFixed(2)}" width="${+(80 * k).toFixed(2)}" height="${+(62 * k).toFixed(2)}"/></clipPath>` +
      `<g clip-path="url(#${id})" fill="none" style="stroke:${fill}" stroke-width="${+(9.5 * k).toFixed(2)}" stroke-linejoin="miter" stroke-miterlimit="8">` +
      `<path d="M${P(-22, -26.5)} L${P(-8, -26.5)} L${P(19, 40)}"/><path d="M${P(0, -8)} L${P(-24, 45)}"/></g>`;
  };

  /* Balanced binary tree, `levels` deep, leaf spacing `gap`. path = child index taken at each level. */
  const tree = (cx, y0, levels, gap, dy, path) => {
    const n = l => 2 ** l, span = gap * n(levels - 1);
    const X = (l, i) => +(cx + (i - (n(l) - 1) / 2) * (span / n(l))).toFixed(2), Y = l => y0 + l * dy;
    const hot = [0]; path.forEach((c, l) => hot.push(hot[l] * 2 + c));
    let edges = '', hotEdges = '', nodes = '';
    for (let l = 0; l < levels; l++) {
      for (let i = 0; i < n(l); i++) {
        const on = hot[l] === i;
        if (l < levels - 1) [0, 1].forEach(c => {
          const e = `<line x1="${X(l, i)}" y1="${Y(l)}" x2="${X(l + 1, i * 2 + c)}" y2="${Y(l + 1)}"/>`;
          if (on && hot[l + 1] === i * 2 + c) hotEdges += e; else edges += e;
        });
        nodes += on
          ? `<circle cx="${X(l, i)}" cy="${Y(l)}" r="3.6" style="fill:var(--d2);stroke:var(--d2)" stroke-width="1.3"/>`
          : `<circle cx="${X(l, i)}" cy="${Y(l)}" r="3.4" style="fill:var(--d4);stroke:var(--d1)" stroke-width="1.3"/>`;
      }
    }
    return `<g style="stroke:var(--d1)" stroke-width="1.25">${edges}</g><g style="stroke:var(--d2)" stroke-width="2">${hotEdges}</g>${nodes}`;
  };

  /* Tape along a rotated zone (centre of the tape on the zone point). */
  const tapeAlong = (z, w) => `<g transform="rotate(${z.rot} ${z.x} ${z.y})">${A.tape(z.x, +(z.y - A.tapeH(w) / 2).toFixed(2), w)}</g>`;
  /* Woven flag label sewn into a side seam; dir +1 sticks out to the right, -1 to the left. */
  const flag = (z, dir) => {
    const x = dir > 0 ? z.x - 1.5 : z.x - 6.5;
    return `<rect x="${x}" y="${z.y - 5.5}" width="8" height="11" rx=".9" style="fill:var(--trim2);stroke:var(--line)" stroke-width=".6"/>` +
      `<line x1="${x + (dir > 0 ? 6.4 : 1.6)}" y1="${z.y - 4.6}" x2="${x + (dir > 0 ? 6.4 : 1.6)}" y2="${z.y + 4.6}" stroke="rgba(0,0,0,.22)" stroke-width=".6"/>`;
  };
  const napeMark = z => t('FIIT · STU', z.nape.x, z.nape.y + 2, { f: 'f', size: 4.8, ls: 1.6, fill: 'var(--d1)' });

  /* chalk-white polo way with an ink emblem, gold + blue tipping kept */
  const chalkPolo = { n: 'Krieda', body: C.chalk, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.chalk, trim: C.gold, trim2: C.fiit } };

  FM.products.push(
    {
      id: 'sig-tee', name: 'Tričko Sigillum', col: 'sigillum', cat: 'tricka', type: 'tee', price: 25, sizes: SIZES,
      blurb: 'Ťažké tričko s malým vyšitým emblémom na hrudi. Na chrbte celá pečať fakulty so zlatým kruhopisom a mottom.',
      spec: [TEE, 'Výšivka emblému na hrudi 7 × 5 cm, zlatá niť a Pantone 2995', 'Sieťotlač pečate na chrbte, priemer 26 cm', RIB],
      ways: W.sigillum,
      deco: {
        front: z => A.mark(z.chestL.x, z.chestL.y, 28, { fx: 'E' }),
        back: z => A.seal(z.backC.x, 292, 99),
      },
    },
    {
      id: 'var-tee', name: 'Tričko Varsity', col: 'varsity', cat: 'tricka', type: 'tee', price: 24, sizes: SIZES,
      opts: { ringer: true },
      blurb: 'Ringer s golierom a lemami rukávov v kontrastnej farbe. Na hrudi oblúkové FIIT z našívanej tkaniny, na chrbte 03.',
      spec: ['Česaná bavlna 220 g/m², golier a lemy rukávov v kontrastnej farbe', 'Aplikácia FIIT z keprovej tkaniny, šírka 24 cm, cik-cak prešitie', 'Chrbát: aplikácia 03, výška 20 cm', 'EST. MMIII vyšité pod nápisom'],
      ways: W.varsity,
      deco: {
        front: z => arcBlock('FIIT', 320, 298, 104, 18, 34, { ls: 1.4 }) +
          t('EST. MMIII', 320, 311, { f: 'g', size: 7.6, ls: 3, fill: 'var(--d3)', fx: 'S' }),
        back: z => A.block('03', 320, 322, 104, { ls: 0, sw: 8.5 }),
      },
    },
    {
      id: 'ilk-tee', name: 'Tričko Ilkovičova 2', col: 'ilkovicova', cat: 'tricka', type: 'tee', price: 26, sizes: SIZES,
      blurb: 'Tónové tričko bez nápisov. Súradnice fakulty drobne na hrudi, adresa pod golierom a jediná farba: tyrkysový tkaný štítok v bočnom švíku.',
      spec: ['Nefarbená česaná bavlna 240 g/m², boxy strih', 'Tónová výšivka súradníc na hrudi, 8 × 3 cm', 'Tónová tlač ILKOVIČOVA 2 · BRATISLAVA pod golierom', 'Tkaný štítok Pantone 2995 v bočnom švíku nad lemom'],
      ways: W.ilkovicova,
      deco: {
        front: z => t('48°09′N', z.chestL.x, z.chestL.y - 2, { f: 'f', size: 5.4, ls: .9, fx: 'S' }) +
          t('17°04′E', z.chestL.x, z.chestL.y + 6, { f: 'f', size: 5.4, ls: .9, fx: 'S' }) +
          flag(z.seamL, 1),
        back: z => t('ILKOVIČOVA 2 · BRATISLAVA', z.nape.x, z.nape.y + 2, { f: 'f', size: 3.8, ls: .9 }) + flag(z.seamL, -1),
      },
    },
    {
      id: 'bor-tee', name: 'Tričko Informatika', col: 'bordo', cat: 'tricka', type: 'tee', price: 24, sizes: SIZES,
      blurb: 'Bordové tričko s retiazkovou výšivkou Informatika cez hruď a tyrkysovou linkou pod ňou, ako na starých univerzitných bundách.',
      spec: ['Česaná bavlna 240 g/m², farbená v kuse', 'Retiazková výšivka Informatika, šírka 24 cm, ecru a Pantone 2995', 'Malá výšivka FIIT · STU pod golierom na chrbte', RIB],
      ways: W.bordo,
      deco: {
        front: z => A.script('Informatika', 320, 300, 22.5),
        back: z => t('FIIT · STU', z.nape.x, z.nape.y + 3, { f: 's', w: 600, size: 5.2, ls: 2.2, fill: 'var(--d2)', fx: 'S' }),
      },
    },
    {
      id: 'teo-tee-lambda', name: 'Tričko Lambda', col: 'teoria', cat: 'tricka', type: 'tee', price: 22, sizes: SIZES,
      blurb: 'Jedna veľká lambda na hrudi a pod ňou drobné λx.x, funkcia identity z lambda kalkulu.',
      spec: [TEE, 'Sieťotlač λ, výška 16 cm, Pantone 2995', 'Popis λx.x v ecru, písmo monospace', 'Na chrbte pod golierom FIIT · STU'],
      ways: W.teoria,
      deco: {
        front: z => lambda(320, 292, 61, 'var(--d2)') + t('λx.x', 320, 344, { f: 'f', size: 9, ls: 1.4 }),
        back: napeMark,
      },
    },
    {
      id: 'teo-tee-hex', name: 'Tričko 0x7D3', col: 'teoria', cat: 'tricka', type: 'tee', price: 22, sizes: SIZES,
      blurb: 'Na hrudi EST. 0x7D3, rok založenia fakulty v šestnástkovej sústave. Na chrbte ten istý rok ako páska jednotiek a núl.',
      spec: [TEE, 'Sieťotlač na hrudi, šírka 25 cm, ecru a Pantone 2995', 'Chrbát: páska 11111010011, šírka 26 cm, s popisom = 2003', RIB],
      ways: W.teoria,
      deco: {
        /* Fragment Mono advances .617 em: 10 cells of 9.64 units, 0x7D3 starts after 5 cells (at x 320) */
        front: z => t('EST.', +(320 - 5 * (.617 * 14 + 1)).toFixed(2), 292, { f: 'f', size: 14, ls: 1, anchor: 'start' }) +
          t('0x7D3', 320, 292, { f: 'f', size: 14, ls: 1, anchor: 'start', fill: 'var(--d2)' }) +
          t('// 1. 10. 2003', 320, 310, { f: 'f', size: 6, ls: .8, op: .75 }),
        back: z => A.tape(320, 252, 99) + t('= 2003', 320, 252 + A.tapeH(99) + 15, { f: 'f', size: 7, ls: 1.2 }),
      },
    },
    {
      id: 'teo-tee-tree', name: 'Tričko Strom', col: 'teoria', cat: 'tricka', type: 'tee', price: 22, sizes: SIZES,
      blurb: 'Vyvážený binárny strom so zvýraznenou cestou od koreňa k listu. Pod ním O(log n), presne toľko krokov tá cesta trvá.',
      spec: [TEE, 'Sieťotlač stromu s popisom 24 × 24 cm, ecru a Pantone 2995', 'Štyri úrovne, 15 uzlov, cesta k listu v tyrkysovej', 'Na chrbte pod golierom FIIT · STU'],
      ways: W.teoria,
      deco: {
        front: z => tree(320, 258, 4, 12, 20, [0, 1, 1]) + t('O(log n)', 320, 345, { f: 'f', size: 8.5, ls: 1 }),
        back: napeMark,
      },
    },
    {
      id: 'teo-long', name: 'Tričko s dlhým rukávom Páska', col: 'teoria', cat: 'tricka', type: 'tee', price: 32, sizes: SIZES,
      opts: { long: true },
      blurb: 'Dlhý rukáv, po ktorom beží páska 11111010011, dvojkovo rok 2003. Na hrudi malé 0x7D3, na chrbte vysvetlenie.',
      spec: ['Česaná bavlna 240 g/m², rebrové manžety', 'Sieťotlač pásky na ľavom rukáve, dĺžka 45 cm, Pantone 2995 a ecru', 'Na hrudi 0x7D3, šírka 7,5 cm', 'Pod golierom na chrbte 0b11111010011 = 2003'],
      ways: W.teoria,
      deco: {
        front: z => tapeAlong(z.sleeveLongL, 170) + t('0x7D3', z.chestL.x, z.chestL.y, { f: 'f', size: 7.6, ls: 1 }),
        back: z => t('0b11111010011 = 2003', z.nape.x, z.nape.y + 2, { f: 'f', size: 4.6, ls: .6 }),
      },
    },
    {
      id: 'sig-polo', name: 'Polo Sigillum', col: 'sigillum', cat: 'kosele', type: 'polo', price: 39, sizes: SIZES,
      opts: { tipping: true, buttons: 3 },
      blurb: 'Piké polokošeľa s vyšitým emblémom na hrudi a dvoma prúžkami na golieri v zlatej a tyrkysovej fakulty. Pod golierom na chrbte motto.',
      spec: ['Bavlnený piké 220 g/m², plochý pletený golier a lemy rukávov', 'Výšivka emblému 7 × 5 cm, zlatá niť a Pantone 2995', 'Prúžky na golieri a rukávoch: zlatá a Pantone 2995', 'Légia s tromi gombíkmi, bočné rozparky'],
      ways: W.sigillum.concat([chalkPolo]),
      deco: {
        front: z => A.mark(z.chestL.x, z.chestL.y, 26, { fx: 'E' }),
        back: z => t('MENS ET MACHINA', z.nape.x, z.nape.y, { f: 'm', size: 5.6, ls: 2, fx: 'S' }),
      },
    },
    {
      id: 'abs-tee', name: 'Tričko Ing.', col: 'absolvent', cat: 'tricka', type: 'tee', price: 26, sizes: SIZES,
      blurb: 'Na chrbte veľký titul, pod ním FIIT STU a rok promócie. Titul si vyberieš pri objednávke: Bc., Ing. alebo PhD.',
      spec: [TEE, 'Sieťotlač titulu na chrbte, šírka 24 cm, ecru', 'Linka Pantone 2995 a FIIT STU · 2026 pod titulom', 'Na hrudi FIIT-2026, šírka 10 cm'],
      ways: W.absolvent,
      deco: {
        front: z => t('FIIT-2026', z.chestL.x, z.chestL.y, { f: 'f', size: 5.6, ls: .8 }) +
          `<rect x="${z.chestL.x - 16}" y="${z.chestL.y + 3}" width="32" height="1.1" style="fill:var(--d2)"/>`,
        back: z => t('Ing.', 320, 318, { f: 'm', size: 56 }) +
          '<rect x="285" y="338" width="70" height="1.2" style="fill:var(--d2)"/>' +
          t('FIIT STU · 2026', 320, 353, { w: 600, size: 6, ls: 2 }),
      },
    }
  );
})();
