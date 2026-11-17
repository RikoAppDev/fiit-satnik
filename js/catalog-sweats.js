/* Šatník FIIT STU — crewnecks, knitwear and the varsity jacket.
   Garments: js/garments-sweats.js (crew, knit, varsityjkt). 1 cm ≈ 3.8 units. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C, esc = FM.esc;
  const SIZES = FM.SIZES;
  const CM = 3.8;

  /* Arched varsity appliqué: the three layers of FM.art.block laid on one curve.
     Ends of the baseline sit on y, the middle rises by `rise`. */
  const archBlock = (s, cx, y, w, rise, size, o = {}) => {
    const id = FM.uid('swab');
    const edge = o.edge || 'var(--d2)', fill = o.fill || 'var(--d1)';
    const sw = o.sw != null ? o.sw : +(size * .15).toFixed(2);
    const ls = o.ls != null ? o.ls : +(size * .04).toFixed(2);
    const tp = `<textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(s)}</textPath>`;
    const base = `class="tx-g" font-size="${size}" letter-spacing="${ls}"`;
    return `<path id="${id}" d="M${cx - w / 2},${y} Q${cx},${y - 2 * rise} ${cx + w / 2},${y}" fill="none"/>` +
      `<g ${FM.T}>` +
      `<text ${base} style="fill:${edge};stroke:${edge}" stroke-width="${sw}" stroke-linejoin="round">${tp}</text>` +
      `<text ${base} style="fill:${fill}">${tp}</text>` +
      `<text ${base} fill="none" stroke="rgba(128,128,128,.55)" stroke-width="${+(size * .011).toFixed(2)}" stroke-dasharray="${+(size * .022).toFixed(2)} ${+(size * .018).toFixed(2)}">${tp}</text>` +
      '</g>';
  };

  /* Chenille letter on a felt base (varsity letter patch).
     o: fill (pile, d1), felt (d2), rim (optional outer felt) */
  const chenille = (s, cx, y, size, o = {}) => {
    const pile = o.fill || 'var(--d1)', felt = o.felt || 'var(--d2)';
    const base = `x="${cx}" y="${y}" text-anchor="middle" class="tx-g" font-size="${size}"`, tx = esc(s);
    const layer = (c, w) => `<text ${base} style="fill:${c};stroke:${c}" stroke-width="${w}" stroke-linejoin="round">${tx}</text>`;
    return `<g ${FM.T}>` + (o.rim ? layer(o.rim, +(size * .36).toFixed(2)) : '') + layer(felt, +(size * .2).toFixed(2)) + '</g>' +
      `<g ${FM.CH}><text ${base} style="fill:${pile}">${tx}</text></g>` +
      `<text ${base} fill="none" stroke="rgba(0,0,0,.32)" stroke-width="${+(size * .012).toFixed(2)}" stroke-dasharray="${+(size * .024).toFixed(2)} ${+(size * .02).toFixed(2)}">${tx}</text>`;
  };

  /* P ≟ NP in monospace cells. The ≟ is built from = and a small ?, because the
     mono face has no U+225F and a fallback glyph would not match. */
  const pnp = (cx, y, size, o = {}) => {
    const adv = size * .6, x0 = cx - 2.5 * adv, ink = o.fill || 'var(--d1)', acc = o.acc || 'var(--d2)';
    const cell = (ch, i, fill) => t(ch, +(x0 + i * adv).toFixed(2), y, { f: 'f', size, fill });
    return cell('P', 0, ink) + cell('=', 2, acc) + cell('N', 4, ink) + cell('P', 5, ink) +
      t('?', +(x0 + 2 * adv).toFixed(2), +(y - size * .62).toFixed(2), { f: 'f', size: +(size * .4).toFixed(2), fill: acc, w: 700 });
  };

  /* Small woven flag label sewn into a seam. */
  const flag = (x, y, fill) => `<g ${FM.T}><rect x="${x - 3.6}" y="${y - 8}" width="7.2" height="16" rx=".8" style="fill:${fill}"/>` +
    `<path d="M${x - 2.4},${y - 6.4} L${x + 2.4},${y - 6.4}" style="stroke:rgba(255,255,255,.55)" stroke-width=".6"/></g>`;

  const two = (a, b) => `linear-gradient(90deg,${a} 0 58%,${b} 58% 100%)`;
  const KNIT_SPEC = 'Merino vlna 100 %, jemné pletenie 12 gauge';
  const CREW_SPEC = 'Počesaný fleece 400 g/m², 100 % organická bavlna';

  FM.products.push(
    {
      id: 'sig-crew', name: 'Crewneck Sigillum', col: 'sigillum', cat: 'mikiny', type: 'crew', price: 52, sizes: SIZES,
      blurb: 'Celá pečať fakulty cez hruď, vyšitá zlatou niťou. Na chrbte pod golierom motto MENS ET MACHINA.',
      spec: [CREW_SPEC, 'Rebrovaný golier s klinom, manžety, lem a bočné pásy', 'Výšivka pečate Ø 26 cm, zlatá niť a Pantone 2995', 'MENS ET MACHINA pod golierom na chrbte'],
      ways: W.sigillum,
      deco: {
        front: z => A.seal(z.chestC.x, z.chestC.y + 6, 26 * CM, { fx: 'E' }),
        back: z => t('MENS ET MACHINA', z.nape.x, z.nape.y + 2, { f: 'm', size: 6.4, ls: 2.2, fx: 'S' }),
      },
    },
    {
      id: 'var-crew', name: 'Crewneck Varsity', col: 'varsity', cat: 'mikiny', type: 'crew', price: 55, sizes: SIZES,
      blurb: 'FIIT do oblúka z našívanej keprovej tkaniny s tyrkysovým lemom. Nad ním SLOVENSKÁ TECHNICKÁ, pod ním INFORMATIKA a rok. Vzadu len malé 03.',
      spec: [CREW_SPEC, 'Aplikácia tackle twill FIIT, šírka 30 cm, cik-cak prešitie', 'Vyšité SLOVENSKÁ TECHNICKÁ, INFORMATIKA a EST. MMIII', 'Chrbát: aplikácia 03 pod golierom, výška 4 cm'],
      ways: W.varsity,
      deco: {
        front: z => {
          const x = z.chestC.x, y = z.chestC.y;
          return A.arc('SLOVENSKÁ TECHNICKÁ', x, y - 46, 140, 13, { size: 7.4, ls: 1.7, fill: 'var(--d3)', fx: 'S' }) +
            archBlock('FIIT', x + 1, y + 18, 150, 19, 52, { ls: 2 }) +
            t('INFORMATIKA', x, y + 38, { f: 'g', size: 9.4, ls: 3.2, fill: 'var(--d3)', fx: 'S' }) +
            t('EST. MMIII', x, y + 52, { f: 'g', size: 6.6, ls: 3, fill: 'var(--d3)', fx: 'S' });
        },
        back: z => A.block('03', z.nape.x, z.nape.y + 16, 22, { ls: 0, sw: 2.6 }),
      },
    },
    {
      id: 'ilk-crew', name: 'Crewneck Ilkovičova 2', col: 'ilkovicova', cat: 'mikiny', type: 'crew', price: 49, sizes: SIZES,
      blurb: 'Súradnice fakulty cez hruď, vyšité tónovou niťou. Jediná farba je malý tyrkysový štítok pri leme.',
      spec: ['Slučkový froté 380 g/m², nefarbená organická bavlna', 'Tónová výšivka 48°09′N 17°04′E, šírka 22 cm', 'Tónové FIIT · STU · MMIII pod golierom na chrbte', 'Tkaný štítok Pantone 2995 v bočnom švíku'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.coords(z.chestC.x, z.chestC.y - 6, { k: .95 }) + flag(z.hipL.x + 14, z.hipL.y - 4, 'var(--trim2)'),
        back: z => A.lockup(z.nape.x, z.nape.y + 2, { k: .8 }),
      },
    },
    {
      id: 'bor-crew', name: 'Crewneck Informatika', col: 'bordo', cat: 'mikiny', type: 'crew', price: 52, sizes: SIZES,
      blurb: 'Retiazková výšivka Informatika cez hruď s tyrkysovým ťahom pod ňou, ako na starých univerzitných mikinách. Pod ňou drobné FIIT · STU · MMIII.',
      spec: ['Počesaný fleece 400 g/m², farbený v kuse', 'Retiazková výšivka Informatika, šírka 28 cm', 'Ťah a FIIT · STU · MMIII v Pantone 2995', 'Malé FIIT · STU pod golierom na chrbte'],
      ways: W.bordo,
      deco: {
        front: z => A.script('Informatika', z.chestC.x, z.chestC.y + 2, 26) +
          t('FIIT · STU · MMIII', z.chestC.x, z.chestC.y + 44, { f: 's', w: 600, size: 6, ls: 2.6, fill: 'var(--d2)', fx: 'S' }),
        back: z => A.lockup(z.nape.x, z.nape.y + 2, { sub: 'STU', k: .8 }),
      },
    },
    {
      id: 'teo-crew', name: 'Crewneck P ≟ NP', col: 'teoria', cat: 'mikiny', type: 'crew', price: 49, sizes: SIZES,
      blurb: 'Veľké P ≟ NP strojovým písmom cez hruď, otáznik nad rovnítkom v tyrkysovej FIIT. Pod tým drobne: otvorené od roku 1971.',
      spec: [CREW_SPEC, 'Sieťotlač P ≟ NP, šírka 32 cm, ecru a Pantone 2995', 'Popis otvorené od roku 1971 pod nápisom', 'Na chrbte pod golierom malá λ'],
      ways: W.teoria,
      deco: {
        front: z => pnp(z.chestC.x, z.chestC.y + 12, 40) +
          t('otvorené od roku 1971', z.chestC.x, z.chestC.y + 38, { f: 'f', size: 7, ls: .9 }),
        back: z => t('λ', z.nape.x, z.nape.y + 8, { f: 'f', size: 12, fill: 'var(--d2)' }),
      },
    },
    {
      id: 'sig-knit', name: 'Sveter Akadémia', col: 'sigillum', cat: 'svetre', type: 'knit', price: 79, sizes: SIZES,
      blurb: 'Pletený sveter s výstrihom do V a dvoma pásikmi na výstrihu, manžetách a leme. Na hrudi malý vyšitý znak: kniha a páska.',
      spec: [KNIT_SPEC, 'Pásiky pletené priamo v rebrovaní, nie našité', 'Výšivka znaku 7 × 5 cm na ľavej hrudi', 'Ecru s čiernymi a tyrkysovými pásikmi, čierna so zlatou a 2995, bordó s ecru a 2995'],
      ways: [
        { n: 'Ecru', body: C.ecru, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ecru, page: '#F7F3EA', trim: C.ink, trim2: C.fiit } },
        { n: 'Čierna', body: C.ink, v: Object.assign({}, W.sigillum[0].v, { trim: C.gold, trim2: C.fiit }) },
        { n: 'STU bordó', body: C.bordoDeep, v: Object.assign({}, W.sigillum[1].v, { trim: C.ivory, trim2: C.fiit }) },
      ],
      deco: {
        front: z => A.mark(z.chestL.x, z.chestL.y, 7 * CM, { fx: 'E' }),
        back: () => '',
      },
    },
    {
      id: 'bor-cardigan', name: 'Kardigán Bordó', col: 'bordo', cat: 'svetre', type: 'knit', price: 85, sizes: SIZES,
      opts: { cardigan: true },
      blurb: 'Kardigán na päť gombíkov s tyrkysovými pásikmi FIIT pozdĺž légy, na manžetách a leme. Na hrudi žinylkové F ako na starých univerzitných svetroch.',
      spec: [KNIT_SPEC, 'Päť gombíkov, dve nášivné vrecká s rebrovaným lemom', 'Žinylková nášivka F na plsti, výška 9 cm, na ľavej hrudi', 'Pásiky Pantone 2995 a ecru pletené v rebrovaní'],
      ways: W.bordo,
      deco: {
        front: z => chenille('F', z.chestL.x, z.chestL.y + 16, 46),
        back: () => '',
      },
    },
    {
      id: 'var-jacket', name: 'Bunda Varsity 03', col: 'varsity', cat: 'svetre', type: 'varsityjkt', price: 129, sizes: SIZES,
      blurb: 'Klasická letterman bunda: vlnený trup, rukávy z umelej kože a pruhované rebrovanie. Žinylkové F na hrudi, 03 na rukáve, INFORMATIKA a FIIT na chrbte.',
      spec: ['Vlnené súkno 70 % vlna, prešívaná podšívka', 'Rukávy z umelej kože, kovové patentky, vrecká s koženým lemom', 'Žinylkové F 12 cm na hrudi, aplikácia 03 na pravom rukáve', 'Chrbát: INFORMATIKA do oblúka a FIIT, šírka 40 cm'],
      /* d3 = colour of the 03 on the sleeve (it sits on --trim2) */
      ways: [
        { n: 'Čierna a ecru', body: C.ink, sw: two(C.ink, C.ecru), v: { d1: C.ivory, d2: C.fiit, d3: C.ink, d4: C.ink, trim: C.ecru, trim2: C.ecru } },
        { n: 'STU bordó a ecru', body: C.bordo, sw: two(C.bordo, C.ecru), v: { d1: C.ivory, d2: C.fiit, d3: C.bordo, d4: C.bordo, trim: C.ecru, trim2: C.ecru } },
        { n: 'Čierna', body: C.black, v: { d1: C.ivory, d2: C.fiit, d3: C.ivory, d4: C.black, trim: C.ecru, trim2: '#1E1F23' } },
      ],
      deco: {
        front: z => chenille('F', z.chestL.x, z.chestL.y + 21, 60) +
          `<g transform="rotate(${z.sleeveRup.rot} ${z.sleeveRup.x} ${z.sleeveRup.y})">` +
          A.block('03', z.sleeveRup.x, z.sleeveRup.y + 13, 36, { ls: 0, sw: 4.2, fill: 'var(--d3)' }) + '</g>',
        back: z => archBlock('INFORMATIKA', z.backC.x, z.backC.y - 34, 214, 28, 23, { ls: 1.2, sw: 3.4 }) +
          A.block('FIIT', z.backC.x + 2, z.backC.y + 50, 76, { ls: 3 }),
      },
    }
  );
})();
