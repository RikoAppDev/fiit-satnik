/* Šatník FIIT STU — collections Ročník 03 (roc-) and Semester (sem-).
   Products only: the garments come from garment-hoodie.js, garments-sweats.js,
   garments-tees.js, garments-bottoms.js, garments-head.js and garments-goods.js.
   Sizes in spec are real centimetres via each garment's cm
   (tops 3.8, pants 5.6, socks 9.4, cap 22, tote 8, mug 35, notebook 25, stickers 38). */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C, SIZES = FM.SIZES;
  const r2 = v => +v.toFixed(2);
  const CM = 3.8;
  /* A preset colourway with some variables changed. */
  const way = (w, v, n) => Object.assign({}, w, { n: n || w.n, v: Object.assign({}, w.v, v) });
  /* Centred text with letter-spacing: SVG adds the spacing after the last letter too,
     so shift by half of it to keep the line optically centred. */
  const ct = (s, x, y, o = {}) => t(s, r2(x + (o.ls || 0) / 2), y, o);
  const rule = (x, y, w, h, fill) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${h}" style="fill:${fill}"/>`;

  /* ── Ročník 03 helpers ─────────────────────────────────────────────────── */
  /* Wide type (Michroma). */
  const wide = (s, x, y, o = {}) => ct(s, x, y, Object.assign({ f: 'w' }, o));
  /* Wide type leaning like the FIIT inside the oval (skewed about its baseline point). */
  const wideIt = (s, x, y, o = {}) => `<g transform="translate(${r2(x)} ${r2(y)}) skewX(-12)">${wide(s, 0, 0, o)}</g>`;
  const star = (x, y, r, fill = 'var(--d2)') => A.star4(r2(x), r2(y), r, fill);
  /* Knitted-in (jacquard) motif: the yarn colour with the knit texture on top. */
  const knit = (s, x, y, o, sw = 1.2) => `<g style="stroke:${o.fill || 'var(--d1)'}" stroke-width="${sw}" stroke-linejoin="round">` +
    t(s, x, y, o) + t(s, x, y, Object.assign({}, o, { fill: 'url(#g-knit)' })) + '</g>';
  const knitStar = (x, y, r, fill) => star(x, y, r, fill) + star(x, y, r, 'url(#g-knit)');
  /* Planet with a tilted orbit ring (sticker): back of the ring, planet, front of the ring
     separated from the planet by a thin gap in the sticker colour. */
  const orbit = (cx, cy, k, ink, gap) => {
    const R = r2(46 * k), ry = r2(13 * k), sw = r2(3.4 * k);
    const front = `M${-R},0 A${R},${ry} 0 0 0 ${R},0`;
    return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(-13)" fill="none">` +
      `<ellipse rx="${R}" ry="${ry}" style="stroke:${ink}" stroke-width="${sw}"/>` +
      `<circle r="${r2(19 * k)}" style="fill:${ink}"/>` +
      `<path d="${front}" style="stroke:${gap}" stroke-width="${r2(9 * k)}"/>` +
      `<path d="${front}" style="stroke:${ink}" stroke-width="${sw}" stroke-linecap="round"/></g>` +
      star(cx + 34 * k, cy - 34 * k, 8 * k, ink) + star(cx - 38 * k, cy + 30 * k, 4.5 * k, ink);
  };

  const METAL = 'Na čiernej metalická strieborná tlač, na bielej čierna, na tyrkysovej krémová';
  const TEE = 'Česaná bavlna 240 g/m², boxy strih so zníženým ramenom';
  const CREW = 'Počesaný fleece 400 g/m², 100 % organická bavlna';
  const SOCKY = 'Česaná bavlna 80 %, polyamid 18 %, elastan 2 %';

  /* ── Semester helpers ──────────────────────────────────────────────────── */
  /* d1 = stamp ink, d2 = second ink, d3 = plain text ink (see FM.ways.semester) */
  const nape = (z, dy = 8) => ct('FIIT STU', z.nape.x, z.nape.y + dy, { w: 700, size: 4.6, ls: 1.8, fill: 'var(--d3)' });
  const HOOD = 'Dvojvrstvová kapucňa, podšívka Pantone 2995';
  /* Mugs: the inside glaze picks up the stamp ink (burgundy) or FIIT blue. */
  const semMug = [way(W.semester[0], { lining: W.semester[0].v.d1 }), way(W.semester[1], { lining: C.fiit })];
  /* Notebook: --page is the paper label, --trim2 the ink printed on it (the ribbon is not used). */
  const semNote = W.semester.map(w => way(w, { trim2: C.ink }));

  FM.products.push(
    /* ═══ Ročník 03 ═══════════════════════════════════════════════════════ */
    {
      id: 'roc-zip', name: 'Mikina na zips Ročník 03', col: 'rocnik', cat: 'mikiny', type: 'hoodie', price: 72, sizes: SIZES,
      opts: { zip: true },
      blurb: 'Mikina na zips s oválnym logom FIIT, aké by fakulta dostala v roku 2003, keď vznikla. Malé logo na hrudi, veľké cez chrbát a pod ním FAKULTA INFORMATIKY · BRATISLAVA.',
      spec: ['Počesaný fleece 450 g/m², kovový zips, kapucňa s kontrastnou podšívkou', 'Logo na hrudi 9,5 cm, na chrbte 33 cm', 'Nápis pod logom širokým písmom, šírka 38 cm', METAL],
      ways: W.rocnik,
      deco: {
        front: z => A.y2k(z.chestL.x, z.chestL.y, 36, { sub: ' ' }),
        back: z => A.y2k(z.backC.x, 334, 124) +
          wide('FAKULTA INFORMATIKY · BRATISLAVA', z.backC.x, 393, { size: 4.4, ls: .9 }),
      },
    },
    {
      id: 'roc-tee', name: 'Tričko Ročník 03', col: 'rocnik', cat: 'tricka', type: 'tee', price: 25, sizes: SIZES,
      blurb: 'Ťažké tričko s veľkým oválnym logom cez hruď, ako z katalógu športovej značky z roku 2003. Vzadu pod golierom EST. 2003.',
      spec: [TEE, 'Sieťotlač loga cez hruď, ovál široký 26 cm', 'EST. 2003 širokým písmom pod golierom na chrbte, šírka 12 cm', METAL],
      ways: W.rocnik,
      deco: {
        front: z => A.y2k(z.chestC.x, z.chestC.y - 6, 26 * CM),
        back: z => {
          const y = z.nape.y + 8;
          return wide('EST. 2003', z.nape.x, y, { size: 4.6, ls: 1.4 }) + star(z.nape.x - 30, y - 1.7, 2.6) + star(z.nape.x + 30, y - 1.7, 2.6);
        },
      },
    },
    {
      id: 'roc-crew', name: 'Crewneck Ročník 03', col: 'rocnik', cat: 'mikiny', type: 'crew', price: 55, sizes: SIZES,
      blurb: 'FIIT STU širokým písmom cez hruď medzi dvoma hviezdičkami, pod tým drobne BRATISLAVA 2003. Vzadu pod golierom malé oválne logo.',
      spec: [CREW, 'Nápis cez hruď 28 cm, s hviezdičkami 38 cm', 'Oválne logo 8 cm pod golierom na chrbte', METAL],
      ways: W.rocnik,
      deco: {
        front: z => {
          const x = z.chestC.x, y = z.chestC.y;
          return wideIt('FIIT STU', x - 1.2, y, { size: 16, ls: 1.8 }) + star(x - 64, y - 5.6, 7.5) + star(x + 65, y - 5.6, 7.5) +
            wide('BRATISLAVA 2003', x, y + 16, { size: 5.2, ls: 2, fill: 'var(--d2)' });
        },
        back: z => A.y2k(z.nape.x, z.nape.y + 15, 30, { sub: ' ' }),
      },
    },
    {
      id: 'roc-pants', name: 'Tepláky Ročník 03', col: 'rocnik', cat: 'spodky', type: 'pants', price: 49, sizes: SIZES,
      opts: { stripe: true },
      blurb: 'Tepláky s dvojitým lampasom. Na ľavom boku malé oválne logo, dolu po nohavici FIIT STU širokým písmom.',
      spec: ['Počesaný fleece 350 g/m², 100 % organická bavlna', 'Logo na boku 8 cm, nápis po nohavici 15 cm', 'Dvojitý lampas, rebrový pás s plochou šnúrkou, manžety', METAL],
      ways: W.rocnik,
      deco: {
        front: z => {
          const x = z.legL.x - 6, y = 404;
          return A.y2k(z.hipL.x, z.hipL.y, 45, { sub: ' ' }) +
            `<g transform="rotate(${z.legL.rot} ${x} ${y})">${wide('FIIT STU', x, y, { size: 11, ls: 3 })}</g>`;
        },
      },
    },
    {
      id: 'roc-cap', name: 'Šiltovka Ročník 03', col: 'rocnik', cat: 'hlava', type: 'cap', price: 24, sizes: null,
      blurb: 'Šesťdielna šiltovka s vyšitým oválnym logom vpredu. Vzadu nad remienkom rok 2003 širokým písmom.',
      spec: ['Bavlnený keper, šesť dielov, vystužený predný diel', 'Výšivka loga 8,5 × 4,5 cm, vzadu 2003 šírka 4,5 cm', 'Na čiernej metalická strieborná niť, na bielej čierna, na tyrkysovej krémová', 'Bavlnený remienok s mosadznou prackou'],
      ways: W.rocnik,
      deco: {
        front: z => A.y2k(z.face.x, z.face.y - 4, 160, { sub: ' ', fx: 'E' }),
        back: z => wide('2003', z.arch.x, z.arch.y + 9, { size: 22, ls: 3, fx: 'E' }),
      },
    },
    {
      id: 'roc-socks', name: 'Ponožky Ročník 03', col: 'rocnik', cat: 'ponozky', type: 'socks', price: 9, sizes: ['36–40', '41–46'],
      opts: { stripes: 1 },
      blurb: 'Športové ponožky s pásikom na manžete. Na každej je upletená hviezdička a FIIT širokým písmom.',
      spec: [SOCKY, 'Žakárovo upletená hviezdička a FIIT, šírka 5 cm', 'Na čiernej strieborná priadza s lurexom, rebrová manžeta s pásikom'],
      ways: W.rocnik,
      deco: {
        front: z => ['legL', 'legR'].map(k => knitStar(z[k].x, z[k].y - 30, 10, 'var(--d2)') +
          knit('FIIT', z[k].x, z[k].y + 4, { f: 'w', size: 18, ls: 1.5 })).join(''),
      },
    },
    {
      id: 'roc-stickers', name: 'Nálepky Ročník 03', col: 'rocnik', cat: 'doplnky', type: 'stickers', price: 5, sizes: null,
      blurb: 'Šesť vinylových nálepiek v štýle roku 2003: oválne logo, hviezdičky, FIIT STU, 2003, obežná dráha a EST. 2003.',
      spec: ['Matný vinyl, strieborné časti metalickou fóliou', 'Výsek s bielym okrajom', 'Hárok A6, nálepky od 3,2 do 8,3 cm'],
      ways: W.rocnik,
      deco: {
        front: z => {
          const k = 'var(--d4)';
          return A.y2k(z.s1.x, z.s1.y + 3, 98, { sub: ' ' }) +
            star(z.s2.x - 16, z.s2.y + 4, 36, k) + star(z.s2.x + 34, z.s2.y - 26, 13, k) + star(z.s2.x + 38, z.s2.y + 28, 7, k) +
            wideIt('FIIT STU', z.s3.x - 2, z.s3.y + 10.5, { size: 30, ls: 3, fill: k }) +
            wide('2003', z.s4.x - 2, z.s4.y + 11, { size: 30, ls: 2 }) + star(z.s4.x + 61, z.s4.y - 27, 7) +
            orbit(z.s5.x, z.s5.y + 2, 1, k, 'var(--trim2)') +
            wide('EST. 2003', z.s6.x, z.s6.y + 6.5, { size: 18, ls: 2, fill: k }) + star(z.s6.x - 86, z.s6.y, 5.5, k) + star(z.s6.x + 86, z.s6.y, 5.5, k) +
            ct('FIIT STU · ROČNÍK 03 · 6 NÁLEPIEK', z.foot.x, z.foot.y, { f: 'f', size: 7, ls: 1.6, fill: 'var(--line)', op: .55 });
        },
      },
    },

    /* ═══ Semester ════════════════════════════════════════════════════════ */
    {
      id: 'sem-tee-stamp', name: 'Tričko Započítané', col: 'semester', cat: 'tricka', type: 'tee', price: 24, sizes: SIZES,
      blurb: 'Na hrudi jediná pečiatka ZAPOČÍTANÉ, trochu nakrivo, ako v indexe. Vzadu pod golierom drobné FIIT STU.',
      spec: [TEE, 'Sieťotlač pečiatky Ø 22 cm s efektom vydrolenej farby', 'Bordová na ecru, krémová na čiernej, čierna na melíri', 'FIIT STU pod golierom na chrbte'],
      ways: W.semester,
      deco: {
        front: z => A.stamp(z.chestC.x, z.chestC.y - 2, 22 * CM, { rot: -8 }),
        back: z => nape(z),
      },
    },
    {
      id: 'sem-tee-2359', name: 'Tričko 23:59', col: 'semester', cat: 'tricka', type: 'tee', price: 24, sizes: SIZES,
      blurb: 'Veľké 23:59 strojovým písmom a pod ním odovzdané. Minútu pred termínom, ako vždy.',
      spec: [TEE, 'Sieťotlač 23:59 písmom monospace, šírka 26 cm', 'Pod tým odovzdané. a drobné FIIT STU v druhej farbe', 'Na chrbte pod golierom FIIT STU'],
      ways: W.semester,
      deco: {
        front: z => {
          const x = z.chestC.x, y = z.chestC.y + 2, x0 = r2(x - 2.5 * .617 * 32);
          return t('23:59', x, y, { f: 'f', size: 32 }) +
            t('odovzdané.', x0 + 1, y + 17, { f: 'f', size: 8.5, anchor: 'start', fill: 'var(--d2)' }) +
            t('FIIT STU', x0 + 1.4, y + 31, { w: 700, size: 4.6, ls: 1.8, anchor: 'start', fill: 'var(--d3)' });
        },
        back: z => nape(z),
      },
    },
    {
      id: 'sem-hoodie', name: 'Mikina Skúškové turné', col: 'semester', cat: 'mikiny', type: 'hoodie', price: 65, sizes: SIZES,
      blurb: 'Chrbát ako mikina z koncertného turné, len zastávky sú riadny termín, opravné termíny a štátnice. Vpredu drobné SKÚŠKOVÉ TURNÉ.',
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', HOOD, 'Sieťotlač chrbta 39 × 26 cm, dve farby', 'Na hrudi SKÚŠKOVÉ TURNÉ, šírka 13 cm'],
      ways: W.semester,
      deco: {
        front: z => ct('SKÚŠKOVÉ', z.chestL.x, z.chestL.y - 2, { w: 700, size: 7, ls: 1.1, fill: 'var(--d3)' }) +
          ct('TURNÉ', z.chestL.x, z.chestL.y + 7, { w: 700, size: 7, ls: 1.1, fill: 'var(--d1)' }),
        back: z => {
          const x0 = 246, x1 = 394, cx = z.backC.x, o = { w: 700, size: 4.4, ls: .25 };
          const rows = [
            ['JANUÁR', 'RIADNY TERMÍN', 'VYPREDANÉ'],
            ['JANUÁR', 'PRVÝ OPRAVNÝ', 'PRIDANÝ PRE VEĽKÝ ZÁUJEM'],
            ['FEBRUÁR', 'DRUHÝ OPRAVNÝ', 'LEN NA POZVANIE'],
            ['MÁJ', 'LETNÉ SKÚŠKOVÉ', 'REPRÍZA'],
            ['JÚN', 'ŠTÁTNICE', 'VEĽKÉ FINÁLE'],
          ];
          let s = ct('FIIT STU', cx, 261, { w: 700, size: 6, ls: 4.2, fill: 'var(--d1)' }) +
            ct('SKÚŠKOVÉ TURNÉ', cx, 281, { w: 700, size: 15, ls: .5, fill: 'var(--d3)' }) +
            rule(x0, 287.5, x1 - x0, 1, 'var(--d3)');
          rows.forEach(([m, e, st], i) => {
            const y = r2(300 + i * 9.6);
            s += t(m, x0, y, Object.assign({}, o, { anchor: 'start', fill: 'var(--d3)' })) +
              t(e, x0 + 30, y, Object.assign({}, o, { anchor: 'start', fill: 'var(--d3)' })) +
              t(st, x1 + .25, y, Object.assign({}, o, { anchor: 'end', fill: 'var(--d1)' }));
          });
          return s + rule(x0, 345, x1 - x0, 1, 'var(--d3)') +
            ct('VSTUP LEN S INDEXOM', cx, 355, { w: 600, size: 3.8, ls: 1.6, fill: 'var(--d3)' });
        },
      },
    },
    {
      id: 'sem-crew', name: 'Crewneck Schválené', col: 'semester', cat: 'mikiny', type: 'crew', price: 52, sizes: SIZES,
      blurb: 'Pečiatka SCHVÁLENÉ BEZ PRIPOMIENOK na hrudi. Pre každého, komu niekedy vrátili zadanie s pripomienkami.',
      spec: [CREW, 'Sieťotlač pečiatky Ø 19 cm s efektom vydrolenej farby', 'Bordová na ecru, krémová na čiernej, čierna na melíri', 'FIIT STU pod golierom na chrbte'],
      ways: W.semester,
      deco: {
        front: z => A.stamp(z.chestC.x, z.chestC.y - 2, 19 * CM, { word: 'SCHVÁLENÉ', sub: 'BEZ PRIPOMIENOK', rot: 6 }),
        back: z => nape(z, 9),
      },
    },
    {
      id: 'sem-mug', name: 'Hrnček 23:59', col: 'semester', cat: 'doplnky', type: 'mug', price: 12, sizes: null,
      opts: { inside: true },
      blurb: 'Na rannú prednášku aj na nočné odovzdávanie. Spredu 23:59 a pod tým ešte to stíham.',
      spec: ['Keramika, 330 ml', 'Vnútorná glazúra bordová alebo Pantone 2995', 'Vypaľovaná potlač 23:59, šírka 5 cm', 'Výška 9,5 cm, Ø 8,6 cm'],
      ways: semMug,
      deco: {
        front: z => t('23:59', z.face.x, z.face.y + 10, { f: 'f', size: 58 }) +
          t('ešte to stíham', z.face.x, z.face.y + 44, { f: 'f', size: 16, fill: 'var(--d2)' }) +
          ct('FIIT STU', z.face.x, z.face.y + 84, { w: 700, size: 9, ls: 3.4, fill: 'var(--d3)' }),
      },
    },
    {
      id: 'sem-tote', name: 'Taška Index', col: 'semester', cat: 'doplnky', type: 'tote', price: 14, sizes: null,
      blurb: 'Predná strana ako obal starého indexu: tenký rámik, INDEX antikvou, výkaz o štúdiu a cez roh pečiatka.',
      spec: ['Bavlnené plátno 340 g/m²', 'Sieťotlač rámika 22 × 27,5 cm, pečiatka Ø 9 cm', 'Čierna a bordová na ecru, krémová a Pantone 2995 na čiernej', '40 × 42 cm, uchá 65 cm'],
      ways: [W.semester[0], way(W.semester[1], { d1: C.fiit })],
      deco: {
        front: z => {
          const x = z.face.x, y0 = 372, y1 = 592, w = 176, x0 = x - w / 2, ink = 'var(--d3)';
          return `<rect x="${x0}" y="${y0}" width="${w}" height="${y1 - y0}" fill="none" style="stroke:${ink}" stroke-width="1.6"/>` +
            `<rect x="${x0 + 5}" y="${y0 + 5}" width="${w - 10}" height="${y1 - y0 - 10}" fill="none" style="stroke:${ink}" stroke-width=".7"/>` +
            ct('INDEX', x, 476, { f: 'm', size: 40, ls: 5, fill: ink }) +
            ct('výkaz o štúdiu', x, 498, { f: 'm', size: 13, ls: .6, fill: ink }) +
            ct('FIIT STU', x, 572, { f: 'm', size: 11, ls: 4, fill: ink }) +
            A.stamp(x0 + w - 6, y1 - 4, 72, { rot: -14 });
        },
      },
    },
    {
      id: 'sem-notebook', name: 'Zápisník Poznámky z prednášok', col: 'semester', cat: 'doplnky', type: 'notebook', price: 9, sizes: null,
      opts: { band: true },
      blurb: 'Obálka ako tlačivo: papierový štítok s kolónkami Predmet, Semester a Meno a pod ním pečiatka FIIT STU. Vnútri linajka.',
      spec: ['Pevná väzba potiahnutá plátnom, 192 strán 90 g/m², linajka', 'Nalepený papierový štítok 9 × 5,5 cm, dá sa popísať perom', 'Sieťotlač pečiatky Ø 4 cm', 'Gumička, formát A5, 15 × 21,6 cm'],
      ways: semNote,
      deco: {
        front: z => {
          const x0 = z.cover.x - 114, x1 = z.cover.x + 114, y0 = 192, y1 = 330, ink = 'var(--trim2)';
          let s = `<g ${FM.T}><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="9" style="fill:var(--page)"/></g>` +
            `<rect x="${x0 + 6}" y="${y0 + 6}" width="${x1 - x0 - 12}" height="${y1 - y0 - 12}" rx="5" fill="none" style="stroke:${ink}" stroke-width="1.1"/>` +
            ct('POZNÁMKY Z PREDNÁŠOK', z.cover.x, y0 + 30, { w: 700, size: 10, ls: 2, fill: ink }) +
            rule(x0 + 16, y0 + 39, x1 - x0 - 32, .8, ink);
          ['Predmet:', 'Semester:', 'Meno:'].forEach((l, i) => {
            const y = y0 + 70 + i * 26;
            s += t(l, x0 + 18, y, { w: 500, size: 11, anchor: 'start', fill: ink }) + rule(x0 + 76, y + 1.5, x1 - x0 - 94, .8, ink);
          });
          return s + A.stamp(z.cover.x + 54, 456, 104, { word: 'FIIT STU', top: 'EST. 2003 · BRATISLAVA', sub: 'POZNÁMKY', rot: -10 });
        },
      },
    }
  );
})();
