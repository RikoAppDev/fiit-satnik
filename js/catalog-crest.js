/* Šatník FIIT STU — products that carry the proposed coat of arms (FM.art.crest, js/art-crest.js).
   Collection Sigillum, ids erb-…. The crest drawn is FM.CREST, so switching the proposal
   in art-crest.js switches every product, and the copy below follows it.
   Placements suit a coat of arms: small embroidery on the chest, a woven patch, large prints. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;
  if (!A.crest) return;
  const SIZES = FM.SIZES;
  const CM = 3.8;                                         // tops: units per cm
  const mix = (base, extra) => Object.assign({}, base, extra);

  /* what is on the shield, in words, for the proposal that is in use */
  const ON = {
    A: 'strieborná kniha v tyrkysovom poli a v hlave štítu páska s rokom 2003 dvojkovo',
    B: 'strieborná krokva, nad ňou dva zlaté bity 1 a 0, pod ňou zlatá kniha',
    C: 'strieborný kľúč so zubami podľa čísla 2003 dvojkovo na štíte delenom na tyrkysovú a čiernu',
  }[String(FM.CREST || 'A').toUpperCase()] || '';

  /* The faculty's turquoise leads where it suits; the shield keeps its own tinctures and
     its gold rim holds it on the turquoise cloth. */
  const turq = { n: 'Tyrkysová 2995', body: C.fiit, v: { d1: '#F4F1E8', d2: C.ink, d3: '#F4F1E8', d4: C.fiit, cord: '#F4F1E8', lining: C.ink, zip: C.ink, trim: C.ink, trim2: '#F4F1E8' } };
  const sig = W.sigillum;                                 // Čierna, STU bordó, Antracit

  /* The tote shows the line version on natural canvas and the colour version on black.
     Both are drawn; the colourway shows one through --erb-col / --erb-mono (both ways set
     both, so switching colourways never leaves the wrong one visible). */
  const natural = { n: 'Prírodná', body: C.ecru, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, trim: C.ink, trim2: C.fiit, noise: .2, 'erb-col': 0, 'erb-mono': 1 } };
  const blackTote = { n: 'Čierna', body: C.black, v: mix(sig[0].v, { 'erb-col': 1, 'erb-mono': 0 }) };
  const either = (col, mono) => `<g style="opacity:var(--erb-col,1)">${col}</g><g style="opacity:var(--erb-mono,0)">${mono}</g>`;

  const NOTE = ['Erb je návrh, ktorý ešte musí schváliť fakulta.', 'Erb je zatiaľ návrh a čaká na schválenie fakultou.'];
  const SABLE = 'var(--cr-sa, #18191C)';

  FM.products.push(
    {
      id: 'erb-hoodie', name: 'Mikina Erb', col: 'sigillum', cat: 'mikiny', type: 'hoodie', price: 65, sizes: SIZES,
      blurb: `Na ľavej hrudi vyšitý erb fakulty: ${ON}, pod štítom stuha s mottom MENS ET MACHINA. ${NOTE[0]}`,
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', 'Dvojvrstvová kapucňa s kontrastnou podšívkou',
        'Výšivka erbu so stuhou, výška 8 cm, na ľavej hrudi', 'Vzadu pod kapucňou vyšité FIIT STU · MMIII'],
      ways: [turq].concat(sig),
      deco: {
        front: z => A.crest(z.chestL.x, z.chestL.y + 2, 8 * CM, { fx: 'E' }),
        back: z => t('FIIT STU · MMIII', z.nape.x, z.nape.y, { f: 'm', size: 6.4, ls: 2.2, fx: 'S' }),
      },
    },
    {
      id: 'erb-crew', name: 'Crewneck Erb', col: 'sigillum', cat: 'mikiny', type: 'crew', price: 55, sizes: SIZES,
      blurb: `Veľký erb fakulty cez celú hruď: ${ON} a pod štítom stuha s mottom. ${NOTE[1]}`,
      spec: ['Počesaný fleece 400 g/m², 100 % organická bavlna', 'Sieťotlač erbu v piatich farbách, výška 24 cm',
        'Rebrovaný golier s klinom, manžety, lem a bočné pásy', 'Chrbát bez potlače'],
      ways: sig,
      deco: {
        front: z => A.crest(z.chestC.x, z.chestC.y + 10, 24 * CM),
        back: () => '',
      },
    },
    {
      id: 'erb-knit', name: 'Sveter Erb', col: 'sigillum', cat: 'svetre', type: 'knit', price: 79, sizes: SIZES,
      opts: { tipping: false },
      blurb: `Hladký sveter s výstrihom do V, bez pásikov. Na ľavej hrudi tkaná nášivka s celým erbom fakulty. ${NOTE[0]}`,
      spec: ['Merino vlna 100 %, jemné pletenie 12 gauge', 'Tkaná nášivka erbu so stuhou, výška 7 cm, prišitá na ľavej hrudi',
        'Jemná tkaná väzba udrží aj drobné písmo motta', 'Čierny obšitý okraj nášivky'],
      ways: sig,
      deco: {
        front: z => A.crest(z.chestL.x, z.chestL.y + 2, 7 * CM, { patch: SABLE, fx: 'T' }),
        back: () => '',
      },
    },
    {
      id: 'erb-polo', name: 'Polo Erb', col: 'sigillum', cat: 'kosele', type: 'polo', price: 39, sizes: SIZES,
      opts: { buttons: 3 },
      blurb: `Piké polokošeľa s malým vyšitým štítom erbu na ľavej hrudi, bez stuhy a bez nápisov. ${NOTE[1]}`,
      spec: ['Bavlnený piké 220 g/m², plochý pletený golier a lemy rukávov', 'Výšivka štítu erbu, výška 5 cm, na ľavej hrudi',
        'Zlatá niť, Pantone 2995, biela a čierna', 'Légia s tromi gombíkmi, bočné rozparky'],
      ways: [turq].concat(sig),
      deco: {
        front: z => A.crest(z.chestL.x, z.chestL.y, 5 * CM, { ribbon: false, fx: 'E' }),
        back: () => '',
      },
    },
    {
      id: 'erb-cap', name: 'Šiltovka Erb', col: 'sigillum', cat: 'hlava', type: 'cap', price: 24, sizes: null,
      blurb: `Šiltovka so štítom erbu vyšitým vpredu: ${ON}. ${NOTE[0]}`,
      spec: ['Bavlnený keper, šesť dielov, vystužený predný diel', 'Výšivka štítu erbu, výška 6 cm, zlatá niť a Pantone 2995',
        'Vzadu nad remienkom vyšité FIIT STU · MMIII', 'Bavlnený remienok s mosadznou prackou'],
      ways: [turq].concat(sig),
      deco: {
        front: z => A.crest(z.face.x, z.face.y - 4, 6 * 22, { ribbon: false, fx: 'S' }),
        back: z => t('FIIT STU · MMIII', z.arch.x, z.arch.y + 4, { f: 'm', size: 11, ls: 2.2, fx: 'S' }),
      },
    },
    {
      id: 'erb-mug', name: 'Hrnček Erb', col: 'sigillum', cat: 'doplnky', type: 'mug', price: 14, sizes: null,
      opts: { rim: true },
      blurb: `Smaltovaný hrnček s celým erbom fakulty, štítom aj stuhou s mottom MENS ET MACHINA, a zlatým okrajom. ${NOTE[1]}`,
      spec: ['Smaltovaná oceľ, 350 ml', 'Vypaľovaná potlač erbu, výška 6 cm', 'Valcovaný okraj v zlatej', 'Výška 9,5 cm, Ø 8,6 cm'],
      ways: [
        sig[0],
        { n: 'Slonovina', body: C.ivory, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, trim: C.gold, trim2: C.fiit } },
      ],
      deco: {
        front: z => A.crest(z.face.x, z.face.y, 6 * 35),
      },
    },
    {
      id: 'erb-tote', name: 'Taška Erb', col: 'sigillum', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: `Plátenná taška s veľkým erbom: na prírodnom plátne čiernou linkou ako stará rytina, na čiernom vo farbách štítu. ${NOTE[0]}`,
      spec: ['Bavlnené plátno 340 g/m²', 'Sieťotlač erbu, výška 27 cm: jedna farba na prírodnej, päť na čiernej',
        'Uchá z rovnakého plátna, prešité krížom', '40 × 42 cm, uchá 65 cm'],
      ways: [natural, blackTote],
      deco: {
        front: z => either(A.crest(z.face.x, z.face.y, 27 * 8), A.crest(z.face.x, z.face.y, 27 * 8, { mono: 'var(--d1)' })),
      },
    }
  );
})();
