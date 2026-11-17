/* Šatník FIIT STU — collection Monogram (FI nad IT).
   Products only: the drawings come from garment-hoodie.js, garments-sweats.js (crew),
   garments-tees.js (tee), garments-bottoms.js (pants, shorts, socks), garments-head.js
   (beanie, cap) and garments-goods.js (tote, bottle). Every size below is given in real
   centimetres and turned into drawing units through the garment's own `cm`. */
(function () {
  'use strict';
  const FM = window.FM, A = FM.art, W = FM.ways;
  const SIZES = FM.SIZES || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const r2 = n => +n.toFixed(2);

  /* n centimetres in the drawing units of a garment type (read when the deco runs). */
  const cm = (type, n) => r2(n * ((FM.garments[type] || {}).cm || 3.8));
  /* Letter height that makes the one-line wordmark w units wide. */
  const hFor = (w, text) => r2(w / A.wordW(1, text));
  /* Wordmark centred on (cx, cy); o.rot turns it about that point. */
  const wordAt = (cx, cy, h, o = {}) => {
    const s = A.word(cx, r2(cy - h / 2), h, o);
    return o.rot ? `<g transform="rotate(${o.rot} ${cx} ${cy})">${s}</g>` : s;
  };
  /* Knitted-in (jacquard) monogram: yarn colours with the knit texture laid over them. */
  const knitMono = (cx, cy, size, tex = 'knit') =>
    A.mono(cx, cy, size) + A.mono(cx, cy, size, { fill: `url(#g-${tex})`, accent: `url(#g-${tex})` });
  /* Screen print on canvas: the weave shows through the ink. */
  const canvasMono = (cx, cy, size) =>
    A.mono(cx, cy, size) + A.mono(cx, cy, size, { fill: 'url(#g-weave)', accent: 'url(#g-weave)' });
  /* F, I, I, T stacked in one column (the last two in the accent), centred on (cx, cy). */
  const column = (cx, cy, h) => {
    const gap = h * .2, top = cy - (4 * h + 3 * gap) / 2;
    return ['F', 'I', 'I', 'T'].map((c, i) =>
      A.word(cx, r2(top + i * (h + gap)), h, { text: c, fill: i < 2 ? 'var(--d1)' : 'var(--d2)' })).join('');
  };

  /* Socks: the cuff stripe takes the accent colour of each way (the colour of IT). */
  const accentTrim = W.monogram.map(w => Object.assign({}, w, { v: Object.assign({}, w.v, { trim: w.v.d2 }) }));

  const FLEECE = 'Počesaný fleece 450 g/m², 100 % organická bavlna';
  const CREW = 'Počesaný fleece 400 g/m², 100 % organická bavlna';
  const TEE = 'Česaná bavlna 240 g/m², boxy strih so zníženým ramenom';
  const RIB = 'Rebrový golier, lemy prešité dvojihlovým stehom';
  const PANTS = 'Počesaný fleece 350 g/m², 100 % organická bavlna';
  const SOCKY = 'Česaná bavlna 80 %, polyamid 18 %, elastan 2 %';
  const KNIT = 'Rebrový úplet 2 × 2, 50 % merino vlna, 50 % akryl';
  const ONE = 'Jedna veľkosť, obvod hlavy 54–60 cm';

  FM.products.push(
    /* ── mikiny ── */
    {
      id: 'mon-hoodie', name: 'Mikina Monogram', col: 'monogram', cat: 'mikiny', type: 'hoodie', price: 65, sizes: SIZES,
      blurb: 'Na hrudi malý vyšitý monogram FI nad IT, na chrbte ten istý cez pol chrbta. Prvá mikina, ktorá je celá v tyrkysovej 2995.',
      spec: [FLEECE, 'Dvojvrstvová kapucňa, pri tyrkysovej je podšívka čierna, inak Pantone 2995', 'Výšivka monogramu na ľavej hrudi 6 × 6 cm', 'Sieťotlač monogramu na chrbte 34 × 34 cm'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.chestL.x, z.chestL.y, cm('hoodie', 6), { fx: 'S' }),
        back: z => A.mono(z.backC.x, 340, cm('hoodie', 34)),
      },
    },
    {
      id: 'mon-crew', name: 'Crewneck Monogram', col: 'monogram', cat: 'mikiny', type: 'crew', price: 55, sizes: SIZES,
      blurb: 'Jeden veľký monogram uprostred hrude a nič iné. Vzadu pod golierom drobné FIIT STU.',
      spec: [CREW, 'Sieťotlač monogramu na hrudi 24 × 24 cm', 'FIIT STU pod golierom na chrbte, šírka 10 cm', 'Rebrovaný golier s klinom, manžety a lem'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.chestC.x, 300, cm('crew', 24)),
        back: z => wordAt(z.nape.x, z.nape.y + 6, cm('crew', 1.5)),
      },
    },

    /* ── tričká ── */
    {
      id: 'mon-tee', name: 'Tričko Monogram', col: 'monogram', cat: 'tricka', type: 'tee', price: 25, sizes: SIZES,
      blurb: 'Ťažké tričko s monogramom FI nad IT uprostred hrude. Na chrbte len drobné FIIT STU pod golierom.',
      spec: [TEE, 'Sieťotlač monogramu na hrudi 18 × 18 cm', 'FIIT STU pod golierom na chrbte, šírka 7,5 cm', RIB],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.chestC.x, 278, cm('tee', 18)),
        back: z => wordAt(z.nape.x, z.nape.y + 6, cm('tee', 1.2)),
      },
    },
    {
      id: 'mon-tee-word', name: 'Tričko FIIT STU', col: 'monogram', cat: 'tricka', type: 'tee', price: 25, sizes: SIZES,
      blurb: 'FIIT STU v jednom riadku cez celú hruď, písmená poskladané z rovných pásov. Vzadu pod golierom malý monogram.',
      spec: [TEE, 'Sieťotlač FIIT STU cez hruď, šírka 40 cm, výška písmen 6 cm', 'Monogram pod golierom na chrbte 4 × 4 cm', RIB],
      ways: W.monogram,
      deco: {
        front: z => wordAt(z.chestC.x, 268, hFor(cm('tee', 40))),
        back: z => A.mono(z.nape.x, z.nape.y + 12, cm('tee', 4)),
      },
    },

    /* ── spodky ── */
    {
      id: 'mon-pants', name: 'Tepláky Monogram', col: 'monogram', cat: 'spodky', type: 'pants', price: 49, sizes: SIZES,
      blurb: 'Tepláky s našitým monogramom na ľavom stehne. Po vonkajšej strane ľavej nohavice beží FIIT STU.',
      spec: [PANTS, 'Našitý monogram z keprovej tkaniny na ľavom stehne 9 × 9 cm', 'Sieťotlač FIIT STU po ľavej nohavici, dĺžka 18 cm', 'Rebrový pás s plochou šnúrkou, manžety na členkoch'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.thighL.x, z.thighL.y - 14, cm('pants', 9), { fx: 'T' }) +
          wordAt(z.legL.x, z.legL.y + 40, cm('pants', 2.8), { rot: z.legL.rot }),
      },
    },
    {
      id: 'mon-shorts', name: 'Kraťasy Monogram', col: 'monogram', cat: 'spodky', type: 'shorts', price: 32, sizes: SIZES,
      blurb: 'Fleecové kraťasy s malým vyšitým monogramom nad lemom ľavej nohavice. Inak čisté.',
      spec: [PANTS, 'Výšivka monogramu nad lemom ľavej nohavice 5,5 × 5,5 cm', 'Rebrový pás s plochou šnúrkou', 'Bočné vrecká a zadné nášivné vrecko'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.cuffL.x, z.cuffL.y - 8, cm('shorts', 5.5), { fx: 'S' }),
      },
    },

    /* ── ponožky ── */
    {
      id: 'mon-socks', name: 'Ponožky Monogram', col: 'monogram', cat: 'ponozky', type: 'socks', price: 9, sizes: ['36–40', '41–46'],
      opts: { stripes: 1 },
      blurb: 'Na každej ponožke jeden upletený monogram FI nad IT. Pásik na manžete má farbu písmen IT.',
      spec: [SOCKY, 'Žakárovo upletený monogram 5,5 × 5,5 cm na každej ponožke', 'Rebrová manžeta s pásikom, zosilnená päta a špička'],
      ways: accentTrim,
      deco: {
        front: z => knitMono(z.legL.x, z.legL.y - 4, cm('socks', 5.5)) + knitMono(z.legR.x, z.legR.y - 4, cm('socks', 5.5)),
      },
    },

    /* ── hlava ── */
    {
      id: 'mon-beanie', name: 'Čiapka Monogram', col: 'monogram', cat: 'hlava', type: 'beanie', price: 19, sizes: null,
      blurb: 'Rebrovaná čiapka s ohrnutým lemom. Monogram nie je našitý, je upletený priamo do lemu.',
      spec: [KNIT, 'Žakárovo upletený monogram na leme 4,4 × 4,4 cm', 'Ohrnutý lem, bez brmbolca', ONE],
      ways: W.monogram,
      deco: {
        front: z => knitMono(z.cuff.x, z.cuff.y + 2, cm('beanie', 4.4), 'rib'),
      },
    },
    {
      id: 'mon-cap', name: 'Šiltovka Monogram', col: 'monogram', cat: 'hlava', type: 'cap', price: 24, sizes: null,
      blurb: 'Šesťdielna šiltovka s monogramom vyšitým vpredu cez oba diely. Vzadu nad remienkom malé FIIT STU.',
      spec: ['Bavlnený keper, šesť dielov, vystužený predný diel', 'Výšivka monogramu vpredu 5,5 × 5,5 cm', 'Výšivka FIIT STU vzadu nad remienkom, šírka 5 cm', 'Bavlnený remienok s mosadznou prackou'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.face.x, z.face.y - 6, cm('cap', 5.5), { fx: 'S' }),
        back: z => wordAt(z.arch.x, z.arch.y + 4, hFor(cm('cap', 5)), { fx: 'S' }),
      },
    },

    /* ── doplnky ── */
    {
      id: 'mon-tote', name: 'Taška Monogram', col: 'monogram', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: 'Plátenná taška, na ktorej je len jeden obrovský monogram. Zmestí sa do nej notebook aj obed.',
      spec: ['Bavlnené plátno 340 g/m², farbené v kuse', 'Sieťotlač monogramu 25 × 25 cm', 'Uchá z rovnakého plátna, prešité krížom', '40 × 42 cm, uchá 65 cm'],
      ways: W.monogram,
      deco: {
        front: z => canvasMono(z.face.x, z.face.y + 4, cm('tote', 25)),
      },
    },
    {
      id: 'mon-bottle', name: 'Fľaša Monogram', col: 'monogram', cat: 'doplnky', type: 'bottle', price: 24, sizes: null,
      blurb: 'Termofľaša s písmenami F, I, I, T poskladanými nad sebou po celej výške. V tyrkysovej 2995 s čiernym viečkom, v čiernej alebo kriedovej.',
      spec: ['Nerez s dvojitou stenou, 750 ml', 'Matný práškový lak, potlač písmen nad sebou, výška 14 cm', 'Viečko v kontrastnej farbe, silikónové pútko', 'Výška 27 cm, Ø 7,4 cm'],
      ways: W.monogram,
      deco: {
        front: z => column(z.face.x, z.face.y, cm('bottle', 3)),
      },
    }
  );
})();
