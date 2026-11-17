/* Šatník FIIT STU — tepláky, kraťasy a ponožky.
   Sizes in spec are real centimetres via the garment's cm (pants 5.6, shorts 7.4, socks 9.4). */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;
  const SIZES = FM.SIZES || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const SOCK = ['36–40', '41–46'];
  const FLEECE = 'Počesaný fleece 350 g/m², 100 % organická bavlna';
  const SOCKY = 'Česaná bavlna 80 %, polyamid 18 %, elastan 2 %';

  /* Knitted-in (jacquard) lettering: chunky letters in the yarn colour, knit texture on top. */
  const knit = (s, x, y, o, sw = 1.2) => `<g style="stroke:${o.fill || 'var(--d1)'}" stroke-width="${sw}" stroke-linejoin="round">` +
    t(s, x, y, o) + t(s, x, y, Object.assign({}, o, { fill: 'url(#g-knit)' })) + '</g>';
  /* Small woven tab sewn into the outer side seam of the back pocket. */
  const tab = z => {
    const x = z.pocket.x + z.pocket.w / 2, y = z.pocket.top + 14;
    return `<g ${FM.T}><rect x="${x - 2.5}" y="${y}" width="8.5" height="14" rx="1" style="fill:var(--trim2)"/></g>` +
      `<path d="M${x + 3},${y + 2} L${x + 3},${y + 12}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".7" stroke-dasharray="1.4 1.1"/>`;
  };
  /* Bordó ways with both stripes in FIIT blue. */
  const borBlue = W.bordo.map(w => Object.assign({}, w, { v: Object.assign({}, w.v, { trim2: C.fiit }) }));

  FM.products.push(
    /* ── Tepláky ── */
    {
      id: 'var-pants', name: 'Tepláky Varsity', col: 'varsity', cat: 'spodky', type: 'pants', price: 49, sizes: SIZES,
      opts: { stripe: true },
      blurb: 'Tepláky s dvojitým lampasom na boku. Na ľavom stehne našité FIIT, pod ním malé 03.',
      spec: [FLEECE, 'Aplikácia FIIT tackle twill, šírka 12 cm, cik-cak prešitie', 'Dvojitý lampas po celej dĺžke nohavíc', 'Rebrový pás s plochou šnúrkou, manžety na členkoch'],
      ways: W.varsity,
      deco: {
        front: z => A.block('FIIT', z.thighL.x, z.thighL.y, 33, { ls: 1.4 }) +
          A.block('03', z.thighL.x, z.thighL.y + 24, 15, { ls: .6, sw: 2 }),
      },
    },
    {
      id: 'ilk-pants', name: 'Tepláky Ilkovičova 2', col: 'ilkovicova', cat: 'spodky', type: 'pants', price: 49, sizes: SIZES,
      blurb: 'Tepláky bez nápisu. Tónová výšivka na ľavom boku a malý tyrkysový štítok na zadnom vrecku.',
      spec: ['Slučkový froté 380 g/m², nefarbená organická bavlna', 'Tónová výšivka FIIT · STU · MMIII, šírka 7 cm', 'Tkaný štítok Pantone 2995 v boku zadného vrecka', 'Plochá šnúrka vo farbe látky, kovové koncovky'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.lockup(z.hipL.x, z.hipL.y, { k: .8 }),
        back: z => tab(z),
      },
    },
    {
      id: 'sig-pants', name: 'Tepláky Sigillum', col: 'sigillum', cat: 'spodky', type: 'pants', price: 52, sizes: SIZES,
      blurb: 'Tmavé tepláky s malým vyšitým emblémom na boku. Na zadnom vrecku MMIII zlatou niťou.',
      spec: ['Počesaný fleece 380 g/m², 100 % organická bavlna', 'Výšivka emblému, šírka 5 cm, zlatá niť a Pantone 2995', 'Výšivka MMIII na zadnom vrecku, šírka 7 cm', 'Plochá šnúrka v ecru, kovové koncovky'],
      ways: [W.sigillum[0], W.sigillum[2]],
      deco: {
        front: z => A.mark(z.hipL.x, z.hipL.y, 28, { fx: 'E' }),
        back: z => t('MMIII', z.pocket.x, z.pocket.y + 4, { f: 'm', size: 9, ls: 2.6, fx: 'S' }),
      },
    },
    {
      id: 'bor-pants', name: 'Tepláky Bordó', col: 'bordo', cat: 'spodky', type: 'pants', price: 49, sizes: SIZES,
      opts: { stripe: true },
      blurb: 'Dvojitý lampas v tyrkysovej FIIT a retiazková výšivka Informatika na boku. V bordovej STU alebo čiernej.',
      spec: ['Počesaný fleece 350 g/m², farbený v kuse', 'Dvojitý lampas Pantone 2995 po celej dĺžke', 'Retiazková výšivka Informatika, šírka 12 cm', 'Rebrový pás a manžety, plochá šnúrka v ecru'],
      ways: borBlue,
      deco: {
        front: z => A.script('Informatika', z.hipL.x - 2, z.hipL.y, 14, { swash: false }),
      },
    },

    /* ── Kraťasy ── */
    {
      id: 'var-shorts', name: 'Kraťasy Varsity', col: 'varsity', cat: 'spodky', type: 'shorts', price: 32, sizes: SIZES,
      opts: { stripe: true },
      blurb: 'Fleecové kraťasy s dvojitým lampasom. Nad lemom ľavej nohavice našité 03.',
      spec: [FLEECE, 'Aplikácia 03 tackle twill, výška 7 cm', 'Dvojitý lampas, lem s dvojitým prešitím', 'Rebrový pás s plochou šnúrkou, bočné a zadné vrecko'],
      ways: W.varsity,
      deco: {
        front: z => A.block('03', z.cuffL.x - 6, z.cuffL.y - 8, 44, { ls: 0, sw: 4.5 }),
      },
    },
    {
      id: 'ilk-shorts', name: 'Kraťasy Ilkovičova 2', col: 'ilkovicova', cat: 'spodky', type: 'shorts', price: 29, sizes: SIZES,
      blurb: 'Kraťasy bez nápisu. Nad lemom ľavej nohavice tónová výšivka so súradnicami fakulty.',
      spec: ['Slučkový froté 380 g/m², nefarbená organická bavlna', 'Tónová výšivka 48°09′N 17°04′E, šírka 10 cm', 'Plochá šnúrka vo farbe látky, kovové koncovky', 'Bočné vrecká a zadné nášivné vrecko'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.coords(z.cuffL.x - 4, z.cuffL.y - 12, { k: .65 }),
      },
    },
    {
      id: 'teo-shorts', name: 'Kraťasy Páska', col: 'teoria', cat: 'spodky', type: 'shorts', price: 29, sizes: SIZES,
      blurb: 'Kraťasy s páskou 11111010011 nad lemom ľavej nohavice. Dvojkovo je to 2003, rok založenia fakulty.',
      spec: [FLEECE, 'Sieťotlač pásky, šírka 10 cm, Pantone 2995', 'Rebrový pás s plochou šnúrkou', 'Bočné vrecká a zadné nášivné vrecko'],
      ways: W.teoria,
      deco: {
        front: z => A.tape(z.cuffL.x - 4, z.cuffL.y - 14, 74),
      },
    },

    /* ── Ponožky ── */
    {
      id: 'var-socks', name: 'Ponožky Varsity', col: 'varsity', cat: 'ponozky', type: 'socks', price: 9, sizes: SOCK,
      opts: { stripes: 2 },
      blurb: 'Športové ponožky s dvoma pásikmi na manžete a nápisom FIIT upleteným do lýtka.',
      spec: [SOCKY, 'Žakárovo upletený nápis FIIT, šírka 6 cm', 'Rebrová manžeta s dvoma pásikmi, zosilnená päta a špička'],
      ways: [W.varsity[2], W.varsity[1], W.varsity[0]],
      deco: {
        front: z => ['legL', 'legR'].map(k => knit('FIIT', z[k].x, z[k].y - 12, { f: 'g', size: 25, ls: 2 })).join(''),
      },
    },
    {
      id: 'sig-socks', name: 'Ponožky Sigillum', col: 'sigillum', cat: 'ponozky', type: 'socks', price: 10, sizes: SOCK,
      opts: { heeltoe: true },
      blurb: 'Ponožky so zlatou pätou a špičkou. Na každej je malý emblém knihy a pásky.',
      spec: [SOCKY, 'Vyšitý emblém, šírka 3,5 cm, zlatá niť a Pantone 2995', 'Päta a špička v zlatej farbe, rebrová manžeta'],
      ways: W.sigillum,
      deco: {
        front: z => A.mark(z.legL.x, z.legL.y - 20, 33, { fx: 'S' }) + A.mark(z.legR.x, z.legR.y - 20, 33, { fx: 'S' }),
      },
    },
    {
      id: 'teo-socks', name: 'Ponožky Bit', col: 'teoria', cat: 'ponozky', type: 'socks', price: 9, sizes: SOCK,
      blurb: 'Na ľavej ponožke je veľká 0, na pravej 1. Obe číslice sú upletené v tyrkysovej FIIT.',
      spec: [SOCKY, 'Žakárovo upletené číslice, výška 6 cm, Pantone 2995', 'Rebrová manžeta, zosilnená päta a špička'],
      ways: W.teoria,
      deco: {
        front: z => knit('0', z.legL.x, z.legL.y + 26, { f: 'f', size: 80, fill: 'var(--d2)' }, 2.2) +
          knit('1', z.legR.x, z.legR.y + 26, { f: 'f', size: 80, fill: 'var(--d2)' }, 2.2),
      },
    },
    {
      id: 'bor-socks', name: 'Ponožky Bordó', col: 'bordo', cat: 'ponozky', type: 'socks', price: 9, sizes: SOCK,
      opts: { heeltoe: true, stripes: 1 },
      blurb: 'Bordová STU a tyrkysová FIIT na jednom páre: tyrkysová päta, špička a pásik na manžete.',
      spec: [SOCKY, 'Päta, špička a pásik na manžete v Pantone 2995', 'Rebrová manžeta, plochý šev na špičke'],
      ways: W.bordo,
      deco: {},
    },
    {
      id: 'ilk-socks', name: 'Ponožky Ilkovičova 2', col: 'ilkovicova', cat: 'ponozky', type: 'socks', price: 9, sizes: SOCK,
      opts: { ribbed: true, toeline: true },
      blurb: 'Rebrované ponožky bez nápisu. Jediná farba je tenká tyrkysová linka na šve špičky.',
      spec: [SOCKY, 'Rebrový úplet po celej dĺžke lýtka', 'Linka Pantone 2995 na šve špičky'],
      ways: W.ilkovicova,
      deco: {},
    }
  );
})();
