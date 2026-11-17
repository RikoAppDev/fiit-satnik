/* Šatník FIIT STU — accessories (Doplnky): totes, mugs, bottle, notebooks, pins,
   stickers, lanyard and laptop sleeve. Drawings live in garments-goods.js. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;
  const mix = (base, extra) => Object.assign({}, base, extra);

  /* Woven label folded into the tote's side seam (sticks out to the right). */
  const sideTab = z => {
    const x = z.x - 3, y = z.y;
    const d = `M${x},${y - 13} L${x + 15},${y - 13} Q${x + 18},${y - 13} ${x + 18},${y - 10} L${x + 18},${y + 10} Q${x + 18},${y + 13} ${x + 15},${y + 13} L${x},${y + 13} Z`;
    return FM.fab(d, { fill: 'var(--trim2)', tex: 'weave', grain: false, shade: false }) + `<path d="M${x + 3.5},${y - 12} L${x + 3.5},${y + 12}" class="st"/>`;
  };
  /* Tonal deboss: shadow on the upper edge, light on the lower edge, letter in the tonal --d1. */
  const deboss = (s, x, y, o) =>
    t(s, x, y - .8, mix(o, { fill: 'rgba(0,0,0,.42)' })) + t(s, x, y + .9, mix(o, { fill: 'rgba(255,255,255,.16)' })) +
    t(s, x, y, mix(o, { fill: 'var(--d1)' }));

  const sigV = W.sigillum[0].v;
  const TOTE = '40 × 42 cm, uchá 65 cm';

  FM.products.push(
    /* ── totes ── */
    {
      id: 'ilk-tote', name: 'Taška Ilkovičova 2', col: 'ilkovicova', cat: 'doplnky', type: 'tote', price: 12, sizes: null,
      blurb: 'Plátenná taška z nefarbenej bavlny. Uprostred tónovo súradnice fakulty, v bočnom šve malý tyrkysový štítok.',
      spec: ['Bavlnené plátno 340 g/m², nefarbené', 'Tónová sieťotlač súradníc, šírka 20 cm', 'Tkaný štítok Pantone 2995 v bočnom šve', TOTE],
      ways: [
        { n: 'Ecru, nefarbená', body: C.ecru, v: mix(W.ilkovicova[0].v, { d1: '#9D9177' }) },
        { n: 'Grafit', body: C.graphite, v: mix(W.ilkovicova[2].v, { d1: '#7C828A' }) },
      ],
      deco: {
        front: z => A.coords(z.face.x, z.face.y - 4, { k: 1.8, fx: null }) + sideTab(z.corner),
      },
    },
    {
      id: 'sig-tote', name: 'Taška Sigillum', col: 'sigillum', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: 'Pevná plátenná taška s celou pečaťou fakulty. Zlatá na čiernom plátne alebo čierna na prírodnom.',
      spec: ['Bavlnené plátno 340 g/m², farbené v kuse', 'Sieťotlač pečate Ø 26 cm, zlatá a Pantone 2995', 'Uchá z rovnakého plátna, prešité krížom', TOTE],
      ways: [
        W.sigillum[0],
        { n: 'Prírodná', body: C.ecru, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, trim: C.ink, trim2: C.fiit, noise: .2 } },
      ],
      deco: {
        front: z => A.seal(z.face.x, z.face.y - 2, 206, { page: 'none', text: 'var(--d1)' }),
      },
    },
    {
      id: 'bor-tote', name: 'Taška Informatika', col: 'bordo', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: 'Bordová taška s retiazkovou výšivkou Informatika a tyrkysovým švihom pod ňou. Zmestí sa do nej notebook aj obed.',
      spec: ['Bavlnené plátno 340 g/m², farbené v kuse', 'Retiazková výšivka Informatika, šírka 28 cm', 'Švih a nápis FIIT · STU · MMIII v Pantone 2995', TOTE],
      ways: W.bordo,
      deco: {
        front: z => A.script('Informatika', z.face.x, z.face.y + 4, 42) +
          t('FIIT · STU · MMIII', z.face.x, z.face.y + 60, { f: 's', w: 600, size: 8, ls: 3.2, fill: 'var(--d2)', fx: 'S' }),
      },
    },
    {
      id: 'abs-tote', name: 'Taška Obhájené.', col: 'absolvent', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: 'Na deň po obhajobe. Jedno slovo veľkou antikvou, pod ním fakulta a rok.',
      spec: ['Bavlnené plátno 340 g/m², farbené v kuse', 'Sieťotlač Obhájené., šírka 29 cm, ecru', 'Linka a rok v Pantone 2995 a ecru', TOTE],
      ways: W.absolvent,
      deco: {
        front: z => t('Obhájené.', z.face.x, z.face.y + 4, { f: 'm', size: 50, ls: .4 }) +
          `<rect x="${z.face.x - 56}" y="${z.face.y + 26}" width="112" height="1.6" style="fill:var(--d2)"/>` +
          t('FIIT STU · 2026', z.face.x, z.face.y + 49, { f: 's', w: 600, size: 9, ls: 3.4 }),
      },
    },

    /* ── mugs ── */
    {
      id: 'sig-mug', name: 'Hrnček Sigillum', col: 'sigillum', cat: 'doplnky', type: 'mug', price: 14, sizes: null,
      opts: { rim: true },
      blurb: 'Smaltovaný hrnček s pečaťou fakulty a zlatým okrajom. Druhá verzia je slonovinová s tyrkysovým okrajom.',
      spec: ['Smaltovaná oceľ, 350 ml', 'Vypaľovaná potlač pečate Ø 5,6 cm', 'Valcovaný okraj v zlatej alebo Pantone 2995', 'Výška 9,5 cm, Ø 8,6 cm'],
      ways: [
        W.sigillum[0],
        { n: 'Slonovina', body: C.ivory, v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: C.ivory, trim: C.fiit, trim2: C.fiit } },
      ],
      deco: {
        front: z => A.seal(z.face.x, z.face.y - 4, 196),
      },
    },
    {
      id: 'teo-mug', name: 'Hrnček 0x7D3', col: 'teoria', cat: 'doplnky', type: 'mug', price: 12, sizes: null,
      opts: { inside: true },
      blurb: 'Čierny keramický hrnček s tyrkysovým vnútrom. Spredu páska s rokom 2003 dvojkovo, pod ňou to isté šestnástkovo.',
      spec: ['Keramika, 330 ml', 'Vnútorná glazúra Pantone 2995', 'Sieťotlač pásky, šírka 5,7 cm', 'Výška 9,5 cm, Ø 8,6 cm'],
      ways: [
        W.teoria[0],
        { n: 'Krieda', body: C.chalk, v: mix(W.teoria[2].v, { d2: C.ink }) },
      ],
      deco: {
        front: z => A.tape(z.face.x, z.face.y - 36, 200) +
          t('0x7D3', z.face.x, z.face.y + 30, { f: 'f', size: 30, ls: 2 }),
      },
    },

    /* ── bottle ── */
    {
      id: 'ilk-bottle', name: 'Fľaša Ilkovičova 2', col: 'ilkovicova', cat: 'doplnky', type: 'bottle', price: 24, sizes: null,
      opts: { steelcap: true },
      blurb: 'Termofľaša s matným povrchom a nerezovým viečkom. Nízko pri dne drobné súradnice fakulty, na viečku tyrkysové pútko.',
      spec: ['Nerez s dvojitou stenou, 750 ml', 'Matný práškový lak, tónová tlač súradníc, šírka 4,6 cm', 'Nerezové viečko, silikónové pútko Pantone 2995', 'Výška 27 cm, Ø 7,4 cm'],
      ways: [
        { n: 'Grafit', body: C.graphite, v: mix(W.ilkovicova[2].v, { d1: '#7C828A' }) },
        { n: 'Hmla', body: C.fog, v: mix(W.ilkovicova[1].v, { d1: '#848B8F' }) },
        { n: 'Ecru', body: C.ecru, v: mix(W.ilkovicova[0].v, { d1: '#A39880' }) },
      ],
      deco: {
        front: z => A.coords(z.base.x, z.base.y - 22, { k: 1.15, fx: null }),
      },
    },

    /* ── notebooks ── */
    {
      id: 'sig-notebook', name: 'Zápisník Sigillum', col: 'sigillum', cat: 'doplnky', type: 'notebook', price: 12, sizes: null,
      opts: { band: true, ribbon: true },
      blurb: 'Zápisník A5 v plátennej väzbe so zlatou ražbou pečate. Tyrkysová gumička a zlatá stužková záložka.',
      spec: ['Pevná väzba potiahnutá plátnom, 192 strán 90 g/m²', 'Ražba pečate zlatou fóliou, Ø 8,8 cm', 'Gumička Pantone 2995, stužková záložka', 'Formát A5, 15 × 21,6 cm'],
      ways: [
        { n: 'Čierna', body: C.ink, v: mix(sigV, { trim: C.fiit, trim2: C.gold }) },
        { n: 'STU bordó', body: C.bordoDeep, v: mix(sigV, { trim: C.fiit, trim2: C.gold }) },
      ],
      deco: {
        front: z => A.seal(z.cover.x, z.cover.y - 6, 220, { page: 'none', text: 'var(--d1)', on: 'var(--d1)', off: 'var(--d1)' }),
      },
    },
    {
      id: 'teo-notebook', name: 'Zápisník štvorčekový', col: 'teoria', cat: 'doplnky', type: 'notebook', price: 9, sizes: null,
      opts: { band: true },
      blurb: 'Čierny zápisník A5 so štvorčekovými stranami. Hore páska s rokom 2003, dole // poznámky.',
      spec: ['Pevná väzba, 192 strán 90 g/m², štvorček 5 mm', 'Sieťotlač pásky, šírka 10 cm, Pantone 2995 a ecru', 'Gumička Pantone 2995', 'Formát A5, 15 × 21,6 cm'],
      ways: W.teoria,
      deco: {
        front: z => A.tape(z.cover.x, 172, 250) +
          t('// poznámky', z.foot.x, z.foot.y, { f: 'f', size: 13, ls: 1.2 }),
      },
    },

    /* ── pins ── */
    {
      id: 'sig-pins', name: 'Odznaky Sigillum', col: 'sigillum', cat: 'doplnky', type: 'pins', price: 8, sizes: null,
      opts: { faces: ['var(--d4)', 'var(--d4)', 'var(--d2)'] },
      blurb: 'Tri smaltované odznaky na kartičke: kniha s páskou, MMIII a číslo 03. Na batoh, golier alebo šnúrku.',
      spec: ['Tvrdý smalt, pozlátená mosadz', 'Dva okrúhle Ø 3,1 cm, štít 3,2 × 3,6 cm', 'Dve zapínania motýlikom na každom odznaku', 'Kartička 9 × 13 cm'],
      ways: W.sigillum,
      deco: {
        front: z =>
          A.mark(z.pin1.x, z.pin1.y + 2, 78) +
          `<circle cx="${z.pin2.x}" cy="${z.pin2.y}" r="47" fill="none" style="stroke:var(--d1)" stroke-width="1.4"/>` +
          t('MMIII', z.pin2.x, z.pin2.y + 8, { f: 'm', size: 22, ls: 2.4 }) +
          `<text x="${z.pin3.x}" y="${z.pin3.y + 17}" text-anchor="middle" class="tx-g" font-size="46" stroke-width="2.4" stroke-linejoin="round" paint-order="stroke" style="fill:var(--d3);stroke:var(--d1)">03</text>` +
          t('SIGILLUM', z.head.x, z.head.y + 4, { f: 'm', size: 14, ls: 5 }) +
          `<rect x="${z.card.x - 40}" y="${z.card.y - 20}" width="80" height="1" style="fill:var(--d1)"/>` +
          t('FIIT STU · sada 3 ks', z.card.x, z.card.y + 4, { f: 's', w: 600, size: 10, ls: 2.4, fill: 'var(--d3)' }),
      },
    },

    /* ── stickers ── */
    {
      id: 'teo-stickers', name: 'Nálepky Teória', col: 'teoria', cat: 'doplnky', type: 'stickers', price: 5, sizes: null,
      blurb: 'Šesť vinylových nálepiek na notebook: λ, 0x7D3, P ≟ NP, páska, O(log n) a hradlo NAND.',
      spec: ['Matný vinyl, odolný voči vode', 'Výsek s bielym okrajom', 'Hárok A6, nálepky od 3,5 do 8,7 cm'],
      ways: [W.teoria[0], W.teoria[1]],
      deco: {
        front: z => {
          const s5 = z.s5, gx = s5.x, gy = s5.y - 9;
          const nand = `<g fill="none" style="stroke:var(--d4)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">` +
            `<path d="M${gx - 36},${gy - 9} L${gx - 20},${gy - 9} M${gx - 36},${gy + 9} L${gx - 20},${gy + 9} M${gx + 22},${gy} L${gx + 36},${gy}"/>` +
            `<path d="M${gx - 20},${gy - 17} L${gx - 4},${gy - 17} A17,17 0 0 1 ${gx - 4},${gy + 17} L${gx - 20},${gy + 17} Z"/>` +
            `<circle cx="${gx + 17.5}" cy="${gy}" r="4"/></g>`;
          return t('λ', z.s1.x, z.s1.y + 32, { f: 'm', size: 96, fill: 'var(--d2)' }) +
            t('0x7D3', z.s2.x, z.s2.y + 10, { f: 'f', size: 30, ls: 1, fill: 'var(--d4)' }) +
            A.tape(z.s3.x, z.s3.y - A.tapeH(232) / 2, 232, { off: 'var(--d4)' }) +
            `<text x="${z.s4.x}" y="${z.s4.y + 9}" text-anchor="middle" class="tx-f" font-size="26" style="fill:var(--d1)">P <tspan font-size="31" style="fill:var(--d2)">≟</tspan> NP</text>` +
            nand + t('EST. 2003', s5.x, s5.y + 30, { f: 'f', size: 9.5, ls: 1.2, fill: 'var(--d4)' }) +
            t('O(log n)', z.s6.x, z.s6.y + 8, { f: 'f', size: 24, ls: .6, fill: 'var(--d4)' }) +
            t('FIIT STU · TEÓRIA · 6 NÁLEPIEK', z.foot.x, z.foot.y, { f: 'f', size: 7, ls: 1.6, fill: 'var(--body)', op: .55 });
        },
      },
    },

    /* ── lanyard ── */
    {
      id: 'var-lanyard', name: 'Šnúrka na ISIC Varsity', col: 'varsity', cat: 'doplnky', type: 'lanyard', price: 6, sizes: null,
      blurb: 'Šnúrka na krk pre ISIC alebo kľúče. Po celej dĺžke FIIT · 03 varsity písmom, dole karabínka a priehľadné puzdro na kartu.',
      spec: ['Tkaný polyester, šírka 2,5 cm, dĺžka 45 cm', 'Sublimačná potlač po celej dĺžke', 'Kovová karabínka s otočným krúžkom', 'Priehľadné puzdro na kartu 8,6 × 5,4 cm'],
      ways: [
        W.varsity[1],
        { n: 'Tyrkysová FIIT', body: C.fiit, v: { d1: C.ink, d2: C.ink, d3: C.ink, d4: C.ivory, trim: C.ink, trim2: C.ink } },
        { n: 'STU bordó', body: C.bordo, v: { d1: '#EDE6D4', d2: C.fiit, d3: '#EDE6D4', d4: C.ink, trim: '#EDE6D4', trim2: C.fiit } },
      ],
      deco: {
        front: z => {
          const id = FM.uid('lyt'), text = Array(13).fill('FIIT').join(' · 03 · ');
          return `<path id="${id}" d="${z.loop.d}" fill="none"/>` +
            `<text class="tx-g" font-size="13" letter-spacing="1.6" dominant-baseline="central" style="fill:var(--d1)">` +
            `<textPath href="#${id}" startOffset="50%" text-anchor="middle">${FM.esc(text)}</textPath></text>` +
            A.arc('FIIT · STU', z.card.x, z.card.y - 9, 72, 6, { size: 8, ls: 1.4, fill: 'var(--body)' }) +
            t('03', z.card.x, z.card.y + 22, { f: 'g', size: 30, fill: 'var(--body)' });
        },
      },
    },

    /* ── laptop sleeve ── */
    {
      id: 'ilk-sleeve', name: 'Obal na notebook Ilkovičova 2', col: 'ilkovicova', cat: 'doplnky', type: 'sleeve', price: 32, sizes: null,
      blurb: 'Plstený obal na 14" notebook s preloženou chlopňou. V rohu slepotlač FIIT, chlopňu drží tyrkysové kožené pútko.',
      spec: ['Vlnená plsť 4 mm', 'Pútko z kože farbenej na Pantone 2995, patentka', 'Slepotlač FIIT · STU · MMIII v rohu, šírka 4 cm', 'Pre notebook do 14", 36 × 26 cm'],
      ways: [
        { n: 'Grafit', body: C.graphite, v: mix(W.ilkovicova[2].v, { trim: C.fiit, heather: .24 }) },
        { n: 'Hmla', body: C.fog, v: mix(W.ilkovicova[1].v, { d1: '#7A8185', trim: C.fiit, heather: .24 }) },
      ],
      deco: {
        front: z => deboss('FIIT', z.corner.x, z.corner.y - 4, { f: 's', w: 700, size: 17, ls: 2.4 }) +
          deboss('STU · MMIII', z.corner.x, z.corner.y + 9, { f: 's', w: 600, size: 7, ls: 2.6 }),
      },
    }
  );
})();
