/* Šatník FIIT STU — beanies, caps, scarves and the tie (garments-head.js). */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;
  const r = v => +v.toFixed(2);

  /* A preset colourway with some variables changed. */
  const way = (w, v, n) => Object.assign({}, w, { n: n || w.n, v: Object.assign({}, w.v, v) });

  /* Woven label: flat rectangle with a weave, lifted off the knit, stitched round the edge. */
  const label = (x, y, w, h, bg, edge) =>
    `<g ${FM.T}><rect x="${r(x - w / 2)}" y="${r(y - h / 2)}" width="${w}" height="${h}" rx="2.4" style="fill:${bg}"/>` +
    `<rect x="${r(x - w / 2)}" y="${r(y - h / 2)}" width="${w}" height="${h}" rx="2.4" fill="url(#g-weave)"/></g>` +
    (edge ? `<rect x="${r(x - w / 2 + 3)}" y="${r(y - h / 2 + 3)}" width="${w - 6}" height="${h - 6}" rx="1.4" fill="none" style="stroke:${edge}" stroke-width=".9" stroke-dasharray="2.4 1.8"/>` : '');

  /* λ drawn as strokes (monospace shape), so it does not depend on a font with Greek. */
  const lambda = (cx, cy, s, col) =>
    `<path d="M${r(cx - .3 * s)},${r(cy - .5 * s)} L${r(cx - .1 * s)},${r(cy - .5 * s)} L${r(cx + .32 * s)},${r(cy + .5 * s)} M${r(cx + .04 * s)},${r(cy - .16 * s)} L${r(cx - .32 * s)},${r(cy + .5 * s)}" ` +
    `fill="none" style="stroke:${col}" stroke-width="${r(s * .13)}" stroke-linejoin="round" ${FM.S}/>`;

  /* Chenille letter on a felt base: flat felt outline, fuzzy chenille face. */
  const chenille = (s, x, y, size) => {
    const base = `x="${x}" y="${y}" text-anchor="middle" class="tx-g" font-size="${size}"`;
    return `<g ${FM.T}><text ${base} style="fill:var(--d2);stroke:var(--d2)" stroke-width="${r(size * .1)}" stroke-linejoin="round">${s}</text></g>` +
      `<text ${base} fill="none" stroke="rgba(128,128,128,.6)" stroke-width="${r(size * .008)}" stroke-dasharray="${r(size * .02)} ${r(size * .016)}" style="paint-order:stroke">${s}</text>` +
      `<text ${base} style="fill:var(--d1)" ${FM.CH}>${s}</text>`;
  };

  const KNIT = 'Rebrový úplet 2 × 2, 50 % merino vlna, 50 % akryl';
  const ONE = 'Jedna veľkosť, obvod hlavy 54–60 cm';
  const TWILL = 'Bavlnený keper, šesť dielov, vystužený predný diel';
  const STRAP = 'Bavlnený remienok s mosadznou prackou';
  const sigScarf = { trim: C.fiit, trim2: C.ivory };

  FM.products.push(
    {
      id: 'var-beanie', name: 'Čiapka Varsity', col: 'varsity', cat: 'hlava', type: 'beanie', price: 19, sizes: null,
      opts: { pom: true, stripes: 2 },
      blurb: 'Rebrovaná čiapka s ohrnutým lemom, dvoma pásikmi a brmbolcom. Vpredu je tkaná nášivka s FIIT a číslom 03.',
      spec: [KNIT, 'Tkaná nášivka 5,5 × 3 cm, prišitá po obvode', 'Dva pletené pásiky na leme, brmbolec s priemerom 8 cm', ONE],
      ways: [
        way(W.varsity[1], { trim: C.fiit, trim2: '#E6DFD0' }),
        way(W.varsity[0], { trim: C.ink, trim2: C.fiit }),
        way(W.varsity[2], { trim: C.ink, trim2: C.fiit }),
      ],
      deco: {
        front: z => label(z.cuff.x, z.cuff.y, 104, 54, 'var(--d1)', 'var(--d4)') +
          t('FIIT', z.cuff.x, z.cuff.y - 4, { f: 'g', size: 19, ls: 2.2, fill: 'var(--d4)' }) +
          t('03', z.cuff.x, z.cuff.y + 18.5, { f: 'g', size: 17, ls: 1.4, fill: 'var(--d2)' }),
      },
    },
    {
      id: 'ilk-beanie', name: 'Čiapka Ilkovičova 2', col: 'ilkovicova', cat: 'hlava', type: 'beanie', price: 19, sizes: null,
      opts: { fisherman: true },
      blurb: 'Plytká rybárska čiapka, ktorá sedí nad ušami. Žiadny nápis, len malý tyrkysový štítok na ľavej strane lemu.',
      spec: ['Rebrový úplet 2 × 2, 100 % merino vlna', 'Plytký strih so širokým ohrnutým lemom', 'Tkaný štítok Pantone 2995, 2 × 1,2 cm, s drobným FIIT', ONE],
      ways: W.ilkovicova,
      deco: {
        front: z => label(z.cuffL.x, z.cuffL.y, 40, 22, 'var(--trim2)') +
          t('FIIT', z.cuffL.x, z.cuffL.y + 2.9, { f: 's', w: 700, size: 8, ls: 1.2, fill: 'var(--body)' }),
      },
    },
    {
      id: 'teo-beanie', name: 'Čiapka Lambda', col: 'teoria', cat: 'hlava', type: 'beanie', price: 19, sizes: null,
      blurb: 'Obyčajná rebrovaná čiapka s ohrnutým lemom. Vpredu malá okrúhla nášivka s tyrkysovou λ.',
      spec: [KNIT, 'Tkaná nášivka s priemerom 3,6 cm, obšitý okraj v ecru', 'λ vyšitá v Pantone 2995', ONE],
      ways: [W.teoria[0], W.teoria[1]],
      deco: {
        front: z => `<g ${FM.T}><circle cx="${z.cuff.x}" cy="${z.cuff.y}" r="34" style="fill:var(--d4)"/>` +
          `<circle cx="${z.cuff.x}" cy="${z.cuff.y}" r="34" fill="url(#g-weave)"/></g>` +
          `<circle cx="${z.cuff.x}" cy="${z.cuff.y}" r="32.4" fill="none" style="stroke:var(--d1)" stroke-width="3.2"/>` +
          `<circle cx="${z.cuff.x}" cy="${z.cuff.y}" r="32.4" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3.2" stroke-dasharray=".7 1.3"/>` +
          lambda(z.cuff.x, z.cuff.y, 34, 'var(--d2)'),
      },
    },
    {
      id: 'var-cap', name: 'Šiltovka Varsity', col: 'varsity', cat: 'hlava', type: 'cap', price: 24, sizes: null,
      opts: { twotone: true },
      blurb: 'Šesťdielna šiltovka so šiltom a gombíkom v kontrastnej farbe. Vpredu veľké žinylkové F, vzadu nad remienkom vyšité 03.',
      spec: [TWILL, 'Žinylkové F na plsti, výška 5 cm', 'Výšivka 03 vzadu, šilt a gombík v kontrastnej farbe', STRAP],
      ways: W.varsity,
      deco: {
        front: z => chenille('F', z.face.x, z.face.y + 52, 150),
        back: z => t('03', z.arch.x, z.arch.y + 13, { f: 'g', size: 36, ls: 1.5, fill: 'var(--d1)', fx: 'E' }),
      },
    },
    {
      id: 'sig-cap', name: 'Šiltovka Sigillum', col: 'sigillum', cat: 'hlava', type: 'cap', price: 24, sizes: null,
      blurb: 'Tmavá šiltovka s emblémom fakulty vyšitým zlatou niťou. Vzadu nad remienkom rok založenia MMIII.',
      spec: [TWILL, 'Výšivka emblému 5 × 3,5 cm, zlatá niť a Pantone 2995', 'Výšivka MMIII vzadu nad remienkom', STRAP],
      ways: W.sigillum,
      deco: {
        front: z => A.mark(z.face.x, z.face.y - 4, 110, { fx: 'E' }),
        back: z => t('MMIII', z.arch.x, z.arch.y + 7, { f: 'm', size: 20, ls: 5, fx: 'S' }),
      },
    },
    {
      id: 'ilk-cap', name: 'Šiltovka Ilkovičova 2', col: 'ilkovicova', cat: 'hlava', type: 'cap', price: 22, sizes: null,
      blurb: 'Šiltovka bez kontrastného loga. Vpredu na ľavom dieli drobná tónová výšivka FIIT, vzadu na remienku malý tyrkysový štítok.',
      spec: ['Pratý bavlnený keper, šesť dielov', 'Tónová výšivka FIIT · STU · MMIII na ľavom prednom dieli, šírka 2,5 cm', 'Tkaný štítok Pantone 2995 na remienku', 'Remienok s kovovou prackou'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.lockup(z.panelL.x, z.panelL.y, { k: 1.9 }),
        back: z => label(z.strap.x, z.strap.y, 20, 26, 'var(--trim2)'),
      },
    },
    {
      id: 'sig-scarf', name: 'Šál Sigillum', col: 'sigillum', cat: 'hlava', type: 'scarf', price: 32, sizes: null,
      opts: { stripes: 'college' },
      blurb: 'Dlhý univerzitný šál s pozdĺžnymi pásmi v tyrkysovej FIIT a slonovinovej. Pri jednom konci je našitý emblém.',
      spec: ['Tkaná jahňacia vlna, 175 × 26 cm, strapce 7 cm', 'Pásy Pantone 2995 a slonovinová', 'Našitý emblém 9 × 8 cm, výšivka zlatou niťou'],
      ways: [way(W.sigillum[0], sigScarf), way(W.sigillum[1], sigScarf)],
      deco: {
        front: z => `<g ${FM.T}><rect x="${z.endL.x - 29}" y="${z.endL.y - 32}" width="58" height="52" rx="6" style="fill:var(--d4)"/>` +
          `<rect x="${z.endL.x - 29}" y="${z.endL.y - 32}" width="58" height="52" rx="6" fill="url(#g-weave)"/></g>` +
          `<rect x="${z.endL.x - 27.6}" y="${z.endL.y - 30.6}" width="55.2" height="49.2" rx="4.8" fill="none" style="stroke:var(--d1)" stroke-width="2.4"/>` +
          A.mark(z.endL.x, z.endL.y - 6, 40, { fx: 'E' }),
      },
    },
    {
      id: 'bor-scarf', name: 'Šál Bordó a 2995', col: 'bordo', cat: 'hlava', type: 'scarf', price: 29, sizes: null,
      opts: { stripes: 'block' },
      blurb: 'Pletený šál so širokými pruhmi bordovej STU a tyrkysovej FIIT. Na jednom konci je retiazková výšivka Informatika.',
      spec: ['Pletená merino vlna, dvojitý úplet, 175 × 26 cm', 'Pruhy po 12 cm, bordová a Pantone 2995', 'Retiazková výšivka Informatika, šírka 15 cm', 'Strapce 7 cm'],
      ways: [W.bordo[0]],
      deco: {
        front: z => A.script('Informatika', z.endL.x, z.endL.y + 16, 20, { swash: false, rot: -6 }),
      },
    },
    {
      id: 'sig-tie', name: 'Kravata Sigillum', col: 'sigillum', cat: 'doplnky', type: 'tie', price: 28, sizes: null,
      opts: { pattern: 'stripe' },
      blurb: 'Klubová kravata s tenkými zlatými a tyrkysovými pásikmi. Pod uzlom je jeden malý vyšitý emblém.',
      spec: ['Hodvábny keper, šírka 8,5 cm, dĺžka 148 cm', 'Tkané šikmé pásiky, zlatá a Pantone 2995', 'Výšivka emblému 2,2 cm pod uzlom'],
      ways: [W.sigillum[0], W.sigillum[1]],
      deco: {
        front: z => A.mark(z.crest.x, z.crest.y, 22, { fx: 'S' }),
      },
    }
  );
})();
