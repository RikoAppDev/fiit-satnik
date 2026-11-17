/* Šatník FIIT STU — košele a polokošele (type shirt from garments-shirts.js, polo from
   garments-tees.js). Sizes are real centimetres through the garment's cm (3.8 units per cm).
   Shirts carry small embroidery only; the one all-over print is the monogram camp shirt. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C, SIZES = FM.SIZES;

  const PIQUE = 'Bavlnený piké 220 g/m², plochý pletený golier a lemy rukávov';

  /* Small woven tab sewn into a seam; dir +1 sticks out to the right, -1 to the left. */
  const tab = (x, y, dir, h = 8) => {
    const x0 = dir > 0 ? x - 1.4 : x - 5.2;
    return `<rect x="${x0}" y="${y - h / 2}" width="6.6" height="${h}" rx=".8" style="fill:var(--trim2);stroke:var(--line)" stroke-width=".55"/>` +
      `<line x1="${x0 + (dir > 0 ? 5.2 : 1.4)}" y1="${y - h / 2 + .8}" x2="${x0 + (dir > 0 ? 5.2 : 1.4)}" y2="${y + h / 2 - .8}" stroke="rgba(0,0,0,.25)" stroke-width=".55"/>`;
  };

  /* Half-drop repeat of the 2 × 2 monogram over the shirt's print field, as one pattern
     tile (two monograms) so the drawing stays light. s = monogram size, H = column step,
     V = vertical repeat (each column drops by V / 2). */
  const monoRepeat = (f, s, H, V) => {
    const id = FM.uid('shirtMono');
    return `<defs><pattern id="${id}" width="${2 * H}" height="${V}" patternUnits="userSpaceOnUse" x="${320 - H / 2}" y="${f.top}">` +
      A.mono(H / 2, V / 4, s) + A.mono(1.5 * H, .75 * V, s) + '</pattern></defs>' +
      `<rect x="${f.x - f.w / 2}" y="${f.top}" width="${f.w}" height="${f.bottom - f.top}" fill="url(#${id})"/>`;
  };

  /* polo side seam at the top of the vent (garments-tees.js: front x 437.7, back x 202.4 at y 576) */
  const POLO_VENT = { front: [437.7, 575], back: [202.4, 575] };

  /* Oxford shirt ways: white and light blue with black and FIIT-blue embroidery, black with gold.
     trim2 = button colour (the shirt uses opts.btn 'var(--trim2)'). */
  const OXFORD = [
    { n: 'Biela', body: '#F4F3EF', v: { d1: C.ink, d2: C.fiit, d3: C.ink, d4: '#F4F3EF', page: '#FBFAF6', trim2: '#FBFAF7' } },
    { n: 'Svetlomodrá', body: '#C9DCEC', v: { d1: C.ink, d2: C.ink, d3: C.ink, d4: '#C9DCEC', page: '#EEF3F7', trim2: '#F6F5F1' } },
    { n: 'Čierna', body: C.black, v: { d1: C.gold, d2: C.fiit, d3: C.ivory, d4: C.black, page: C.ivory, trim2: '#2E2F34' } },
  ];

  FM.products.push(
    {
      id: 'sig-shirt', name: 'Košeľa Oxford Sigillum', col: 'sigillum', cat: 'kosele', type: 'shirt', price: 59, sizes: SIZES,
      opts: { collar: 'button-down', pocket: 1, btn: 'var(--trim2)' },
      blurb: 'Oxfordová košeľa s golierom na gombíky. Malý vyšitý emblém na vrecku, MMIII na ľavej manžete a motto pod golierom na chrbte.',
      spec: ['Oxford 140 g/m², 100 % česaná bavlna', 'Golier button-down na stojačiku, náprsné vrecko, zaoblené cípy', 'Výšivka emblému na vrecku 7 × 3,5 cm, MMIII na ľavej manžete', 'MENS ET MACHINA pod golierom na sedle, výška písma 1 cm'],
      ways: OXFORD,
      deco: {
        front: z => A.mark(z.pocketL.x, z.pocketL.y + 1, 23, { fx: 'E' }) +
          t('MMIII', z.cuffL.x, z.cuffL.y + 2.2, { f: 'm', size: 6.2, ls: 1.6, rot: z.cuffL.rot, fx: 'S' }),
        back: z => t('MENS ET MACHINA', z.nape.x, z.nape.y + 2, { f: 'm', size: 4.6, ls: 1.5, fx: 'S' }),
      },
    },
    {
      id: 'ilk-shirt', name: 'Vrchná košeľa Ilkovičova 2', col: 'ilkovicova', cat: 'kosele', type: 'shirt', price: 69, sizes: SIZES,
      opts: { collar: 'point', over: true, pocket: 2, btn: 'var(--trim)' },
      blurb: 'Hrubšia košeľa, ktorú nosíš ako ľahkú bundu. Tónová výšivka FIIT nad vreckom a jediná farba: tyrkysový tkaný štítok vo švíku vrecka.',
      spec: ['Bavlnený kepr 280 g/m², rovný spodný lem s rozparkami', 'Dve náprsné vrecká s klopou a gombíkom, dvojité prešitie', 'Tónová výšivka FIIT nad ľavým vreckom, šírka 5 cm', 'Tkaný štítok Pantone 2995 vo švíku ľavého vrecka'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.lockup(z.pocketL.x, 239, { k: .6 }) + tab(z.pocketL.x + 28, 300, 1),
        back: z => A.coords(z.hem.x, z.hem.y - 10, { k: .7 }),
      },
    },
    {
      id: 'mon-shirt', name: 'Košeľa Monogram', col: 'monogram', cat: 'kosele', type: 'shirt', price: 49, sizes: SIZES,
      opts: { collar: 'camp', short: true, btn: 'var(--trim)' },
      blurb: 'Košeľa s krátkym rukávom a rovným golierom, celá potlačená malým monogramom FI nad IT. Nosí sa rozopnutá pri krku a cez nohavice.',
      spec: ['Bavlnený popelín 130 g/m², rovný spodný lem s rozparkami', 'Celoplošná potlač monogramu, veľkosť 3 cm, raport s polovičným posunom', 'Golier camp bez stojačika, krátky rukáv s ohrnutým lemom', 'Gombíky v kontrastnej farbe'],
      ways: W.monogram,
      deco: {
        front: z => monoRepeat(z.field, 11.4, 22, 30),
        back: z => monoRepeat(z.field, 11.4, 22, 30),
      },
    },
    {
      id: 'roc-shirt', name: 'Košeľa Ročník 03', col: 'rocnik', cat: 'kosele', type: 'shirt', price: 49, sizes: SIZES,
      opts: { collar: 'camp', short: true, panels: true, btn: 'var(--trim2)' },
      blurb: 'Bowlingová košeľa s dvoma kontrastnými pruhmi cez celú prednicu. Na hrudi oválne logo ako z roku 2003, na sedle chrbta široké FIIT STU s hviezdičkami.',
      spec: ['Bavlnený popelín 130 g/m², golier camp, krátky rukáv', 'Dva našité pruhy z kontrastnej látky, šírka 6 cm', 'Oválne logo na hrudi 11 × 6 cm, metalická strieborná tlač a Pantone 2995', 'Chrbát: FIIT STU na sedle, šírka 28 cm, metalická tlač'],
      ways: W.rocnik,
      deco: {
        /* oval between the placket (x 327) and the wearer's left panel (x 384) */
        front: z => A.y2k(356, 292, 42),
        back: z => t('FIIT STU', z.yoke.x, z.yoke.y + 6.5, { f: 'w', size: 13.5, ls: 3.6, fill: 'var(--d1)' }) +
          A.star4(z.yoke.x - 84, z.yoke.y + 1.5, 7, 'var(--d2)') + A.star4(z.yoke.x + 84, z.yoke.y + 1.5, 7, 'var(--d2)') +
          A.star4(z.yoke.x - 97, z.yoke.y - 7, 2.8, 'var(--d1)') + A.star4(z.yoke.x + 96, z.yoke.y + 10, 2.8, 'var(--d1)'),
      },
    },
    {
      id: 'var-polo', name: 'Polo Varsity', col: 'varsity', cat: 'kosele', type: 'polo', price: 39, sizes: SIZES,
      opts: { tipping: true, buttons: 3 },
      blurb: 'Piké polokošeľa s dvoma prúžkami na golieri a rukávoch. Na hrudi malé FIIT z našívanej tkaniny, na pravom rukáve číslo 03.',
      spec: [PIQUE, 'Dva prúžky na golieri a rukávoch v kontrastnej farbe', 'Aplikácia FIIT z keprovej tkaniny na hrudi, šírka 8 cm', 'Aplikácia 03 na pravom rukáve, výška 3 cm'],
      ways: W.varsity,
      deco: {
        front: z => A.block('FIIT', z.chestL.x, z.chestL.y + 6, 14, { ls: .5, sw: 2.1 }) +
          /* 03 parallel to the sleeve band, lifted 9 units off it */
          `<g transform="rotate(${z.sleeveR.rot} ${z.sleeveR.x} ${z.sleeveR.y})">${A.block('03', z.sleeveR.x, z.sleeveR.y - 9, 13, { ls: 0, sw: 1.9 })}</g>`,
        back: z => t('EST. MMIII', z.nape.x, z.nape.y + 2, { f: 'g', size: 5.4, ls: 1.8, fx: 'S' }),
      },
    },
    {
      id: 'bor-polo', name: 'Polo Bordó', col: 'bordo', cat: 'kosele', type: 'polo', price: 39, sizes: SIZES,
      opts: { tipping: true, buttons: 3 },
      blurb: 'Bordová polokošeľa s tyrkysovým a ecru prúžkom na golieri. Na hrudi malá retiazková výšivka Informatika.',
      spec: ['Bavlnený piké 220 g/m², farbený v kuse', 'Prúžky na golieri a rukávoch: Pantone 2995 a ecru', 'Retiazková výšivka Informatika na hrudi, šírka 11 cm', 'Výšivka FIIT · STU pod golierom na chrbte'],
      ways: W.bordo,
      deco: {
        front: z => A.script('Informatika', z.chestL.x, z.chestL.y + 4, 9.8, { swash: false }),
        back: z => t('FIIT · STU', z.nape.x, z.nape.y + 3, { f: 's', w: 600, size: 5, ls: 2.2, fill: 'var(--d2)', fx: 'S' }),
      },
    },
    {
      id: 'mon-polo', name: 'Polo Monogram', col: 'monogram', cat: 'kosele', type: 'polo', price: 39, sizes: SIZES,
      opts: { tipping: 1, buttons: 3 },
      blurb: 'Polokošeľa v tyrkysovej fakulty s malým vyšitým monogramom na hrudi a jedným prúžkom na golieri. Pod golierom na chrbte nápis FIIT STU.',
      spec: [PIQUE, 'Výšivka monogramu na hrudi 5 × 5 cm', 'Jeden prúžok na golieri a rukávoch v kontrastnej farbe', 'Výšivka FIIT STU pod golierom, šírka 10 cm'],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.chestL.x, z.chestL.y, 19, { fx: 'S' }),
        back: z => A.word(z.nape.x, z.nape.y - 1, 6, { fx: 'S' }),
      },
    },
    {
      id: 'ilk-polo', name: 'Polo Ilkovičova 2', col: 'ilkovicova', cat: 'kosele', type: 'polo', price: 37, sizes: SIZES,
      blurb: 'Tónová polokošeľa bez prúžkov a bez nápisov. Drobná výšivka FIIT na hrudi a jediná farba: tyrkysový štítok v bočnom rozparku.',
      spec: ['Bavlnený piké 220 g/m², golier bez prúžkov', 'Tónová výšivka FIIT na hrudi, šírka 4 cm', 'Súradnice fakulty tónovo pod golierom na chrbte', 'Tkaný štítok Pantone 2995 nad ľavým bočným rozparkom'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.lockup(z.chestL.x, z.chestL.y - 2, { k: .66 }) + tab(POLO_VENT.front[0], POLO_VENT.front[1], 1),
        back: z => t('48°09′N 17°04′E', z.nape.x, z.nape.y + 2, { f: 'f', size: 4.2, ls: .8 }) + tab(POLO_VENT.back[0], POLO_VENT.back[1], -1),
      },
    }
  );
})();
