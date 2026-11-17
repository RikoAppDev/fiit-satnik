/* Šatník FIIT STU — trenky a boxerky.
   Sizes in spec are real centimetres via the garment's cm (boxers 7, briefs 10.35).
   All-over prints go through deco (the garment clips them to the cloth); waistband
   lettering goes through opts.bandArt (clipped to the band, under its knit texture). */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;
  const SIZES = FM.SIZES || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const r = n => +n.toFixed(2);
  const POPLIN = 'Bavlnený popelín 115 g/m², 100 % česaná bavlna';
  const JERSEY = 'Bavlnený úplet 190 g/m², 95 % bavlna, 5 % elastan';
  const FLY = 'Rázporok na jeden gombík, bočné rozparky';
  const POUCH = 'Tvarovaný predný diel, ploché švy';

  /* All-over half-drop repeat over z.field. The motif is drawn once around 0,0 in <defs>
     and placed with <use>, so its colours still come from the colourway of each card.
     sx = column pitch, sy = row pitch; every other column drops by sy/2. Columns straddle
     the centre line, so the fly and the centre seam fall between two motifs.
     o.rot(i, j) → optional rotation of single motifs. */
  const allover = (f, sx, sy, motif, o = {}) => {
    const id = FM.uid(o.id || 'under-rep');
    let s = `<defs><g id="${id}">${motif}</g></defs>`;
    const nc = Math.ceil(f.w / 2 / sx) + 1;
    for (let i = -nc; i < nc; i++) {
      const x = r(f.x + (i + .5) * sx), drop = (i & 1) ? sy / 2 : 0;
      for (let y = f.top - sy + drop, j = 0; y < f.bottom + sy; y += sy, j++) {
        const a = o.rot ? o.rot(i, j) : 0, Y = r(y);
        s += `<use href="#${id}" x="${x}" y="${Y}"${a ? ` transform="rotate(${a} ${x} ${Y})"` : ''}/>`;
      }
    }
    return s;
  };

  /* One line of lettering repeated all along the waistband. parts = [[text, fill], …] is
     one repeat; the band clips the ends, like a jacquard elastic cut to length. */
  const bandLine = (Z, parts, o = {}) => {
    const z = Z.waist || Z, size = o.size || 11, n = o.n || 8;
    const unit = parts.map(([s, fill]) => `<tspan style="fill:${fill}">${FM.esc(s)}</tspan>`).join('');
    return `<text x="${z.x}" y="${r(z.y + size * .36)}" text-anchor="middle" class="tx-${o.f || 's'}" font-size="${size}"` +
      (o.ls != null ? ` letter-spacing="${o.ls}"` : '') + (o.w ? ` font-weight="${o.w}"` : '') +
      ` xml:space="preserve">${Array(n).fill(unit).join('')}</text>`;
  };
  /* Modular wordmark repeated along the band (two-colour jacquard: body colour + accent). */
  const bandWord = (Z, h, gap, o = {}) => {
    const z = Z.waist || Z, pitch = A.wordW(h, o.text) + gap, k = Math.ceil(z.w / 2 / pitch) + 1;
    let s = '';
    for (let i = -k; i <= k; i++) s += A.word(r(z.x + (i + .5) * pitch), r(z.y - h / 2), h, o);
    return s;
  };

  /* Four-leaf clover: four heart-shaped leaves with a hairline gap between them and a
     short stem, about 24 units across at k = 1. */
  const LEAF = 'M0,-1.3 C-1.2,-2.8 -5.9,-4.4 -5.9,-8.1 C-5.9,-10.8 -2.9,-11.6 0,-8.7 C2.9,-11.6 5.9,-10.8 5.9,-8.1 C5.9,-4.4 1.2,-2.8 0,-1.3 Z';
  const clover = (k, fill) => `<g transform="scale(${k})">` +
    `<path d="M.4,.6 C2.6,4.2 3.9,7.8 3.3,11.6" fill="none" style="stroke:${fill}" stroke-width="1.6" stroke-linecap="round"/>` +
    [45, 135, 225, 315].map(a => `<path d="${LEAF}" transform="rotate(${a})" style="fill:${fill}"/>` +
      `<path d="M0,-2.6 L0,-7" transform="rotate(${a})" fill="none" style="stroke:var(--body)" stroke-width=".7" stroke-linecap="round" opacity=".5"/>`).join('') +
    '</g>';

  /* Oxford stripe: narrow even stripes over the whole field. */
  const oxford = (f, pitch, w, fill) => {
    let s = '';
    for (let x = f.x - pitch / 2 - Math.ceil(f.w / 2 / pitch) * pitch; x < f.x + f.w / 2 + pitch; x += pitch)
      s += `<rect x="${r(x - w / 2)}" y="${f.top}" width="${w}" height="${r(f.bottom - f.top)}" style="fill:${fill}"/>`;
    return s;
  };

  /* Small woven tab sewn into the side seam, lying on the front. */
  const sideTab = z => {
    const s = z.sideL, w = 22, h = 12, x = s.x - w + 2, y = s.y - h / 2;
    return `<g ${FM.T}><rect x="${r(x)}" y="${r(y)}" width="${w}" height="${h}" rx="1" style="fill:var(--trim2)"/></g>` +
      `<path d="M${r(x + 4)},${r(y + 2)} L${r(x + 4)},${r(y + h - 2)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".7" stroke-dasharray="1.4 1.1"/>` +
      `<path d="M${r(x + 1)},${r(y + h / 2)} L${r(x + w - 4)},${r(y + h / 2)}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".8"/>`;
  };

  /* ── colourways ── */
  /* Sigillum: black waistband and gold piping on both ways. */
  const sigWays = [W.sigillum[0], W.sigillum[1]].map(w => Object.assign({}, w, { v: Object.assign({}, w.v, { trim: C.black, trim2: C.gold }) }));
  /* Varsity: the oxford stripe (painted in --trim2) only on ecru; grey melange and black stay plain,
     so the stripe colour is set to the body there. Ecru goes first. */
  const varWays = [
    Object.assign({}, W.varsity[2], { v: Object.assign({}, W.varsity[2].v, { trim2: C.fiit }) }),
    Object.assign({}, W.varsity[0], { v: Object.assign({}, W.varsity[0].v, { trim2: W.varsity[0].body }) }),
    Object.assign({}, W.varsity[1], { v: Object.assign({}, W.varsity[1].v, { trim2: W.varsity[1].body }) }),
  ];
  /* Šťastné trenky: green clovers on ecru with a black band, ecru clovers on black with a FIIT-blue band. */
  const CLOVER = '#2F6B4F';
  const semWays = [
    { n: 'Ecru', body: '#E6DFD0', v: { d1: CLOVER, d2: C.black, d3: CLOVER, d4: '#E6DFD0', cord: C.black, trim: C.black, trim2: C.fiit } },
    { n: 'Čierna', body: C.black, v: { d1: '#E6DFD0', d2: C.fiit, d3: '#E6DFD0', d4: C.black, cord: '#E6DFD0', trim: C.fiit, trim2: '#E6DFD0' } },
  ];

  /* ── band lettering (opts.bandArt) ── */
  const varBand = z => bandLine(z, [['FIIT · ', 'var(--d4)'], ['03', 'var(--d2)'], [' · ', 'var(--d4)']], { f: 'g', size: 13, ls: 1.4 });
  const sigBand = z => bandLine(z, [['MENS ET MACHINA', 'var(--d1)'], [' · ', 'var(--d2)']], { f: 'm', size: 10.5, ls: 2.2, n: 6 });
  const monBand = h => z => bandWord(z, h, h * 1.1, { fill: 'var(--body)', accent: 'var(--trim2)' });
  const rocBand = z => bandLine(z, [['FIIT STU ', 'var(--body)'], ['2003', 'var(--d2)'], ['   ', 'var(--body)']], { f: 'w', size: 19, ls: 2.6, n: 6 });
  const ilkBand = z => bandLine(z, [['FIIT · STU · MMIII', 'var(--d1)'], ['     ', 'var(--d1)']], { size: 9.5, w: 600, ls: 2.4, n: 8 });
  const borBand = ({ waist: z }) => [-1, 1].map(s => `<rect x="${z.x - z.w / 2 - 10}" y="${r(z.y + s * 8.2 - 1.1)}" width="${z.w + 20}" height="2.2" style="fill:var(--trim2)"/>`).join('');
  const semBand = z => bandLine(z, [['ŠŤASTNÉ TRENKY · SKÚŠKOVÉ · FIIT STU · ', 'var(--body)']], { size: 11, w: 700, ls: 1.5, n: 4 });

  FM.products.push(
    /* ── Trenky ── */
    {
      id: 'var-boxers', name: 'Trenky Varsity', col: 'varsity', cat: 'bielizen', type: 'boxers', price: 16, sizes: SIZES,
      opts: { band: 'trim', bandArt: varBand },
      blurb: 'Tkané trenky, ecru v tyrkysovom pásiku ako oxfordská košeľa, sivé a čierne hladké. Na páse sa dookola opakuje FIIT · 03, na ľavej nohavici je malé našité 03.',
      spec: ['Bavlnený oxford 130 g/m², pri ecru tkaný pásik Pantone 2995', 'Žakárový elastický pás 4 cm s nápisom FIIT · 03', 'Aplikácia 03 tackle twill, výška 3,5 cm, ľavá nohavica', FLY],
      ways: varWays,
      deco: {
        front: z => oxford(z.field, 9, 1.5, 'var(--trim2)') + A.block('03', z.legL.x + 4, z.legL.y + 6, 34, { ls: 0, sw: 3.6 }),
        back: z => oxford(z.field, 9, 1.5, 'var(--trim2)'),
      },
    },
    {
      id: 'sig-boxers', name: 'Trenky Sigillum', col: 'sigillum', cat: 'bielizen', type: 'boxers', price: 18, sizes: SIZES,
      opts: { band: 'trim', piping: true, bandArt: sigBand },
      blurb: 'Trenky s drobnou potlačou knihy a pásky po celej ploche. Nohavice lemuje zlatý paspel, na čiernom páse sa opakuje MENS ET MACHINA.',
      spec: [POPLIN, 'Potlač emblému po celej ploche, motív 2,5 cm, zlatá a Pantone 2995', 'Zlatý paspel na leme a bočných rozparkoch', 'Čierny žakárový pás 4 cm, MENS ET MACHINA zlatou'],
      ways: sigWays,
      deco: {
        front: z => allover(z.field, 38, 40, A.mark(0, 0, 17.5), { id: 'sig-boxers-m' }),
        back: z => allover(z.field, 38, 40, A.mark(0, 0, 17.5), { id: 'sig-boxers-m' }),
      },
    },
    {
      id: 'mon-boxers', name: 'Trenky Monogram', col: 'monogram', cat: 'bielizen', type: 'boxers', price: 16, sizes: SIZES,
      opts: { band: 'trim', bandArt: monBand(13) },
      blurb: 'Trenky s malým monogramom FI nad IT po celej ploche. Na páse sa dookola opakuje FIIT STU.',
      spec: [POPLIN, 'Potlač monogramu po celej ploche, motív 3 cm', 'Žakárový elastický pás 4 cm so slovom FIIT STU', FLY],
      ways: W.monogram,
      deco: {
        front: z => allover(z.field, 42, 46, A.mono(0, 0, 21), { id: 'mon-boxers-m' }),
        back: z => allover(z.field, 42, 46, A.mono(0, 0, 21), { id: 'mon-boxers-m' }),
      },
    },
    {
      id: 'bor-boxers', name: 'Trenky Bordó', col: 'bordo', cat: 'bielizen', type: 'boxers', price: 16, sizes: SIZES,
      opts: { band: 'trim', piping: true, bandArt: borBand },
      blurb: 'Bordové trenky s tyrkysovým pásom FIIT a ecru paspelom na leme. Na ľavej nohavici je retiazková výšivka Informatika.',
      spec: ['Bavlnený popelín 115 g/m², farbený v kuse', 'Elastický pás 4 cm v Pantone 2995 s dvoma ecru prúžkami', 'Ecru paspel na leme a bočných rozparkoch', 'Retiazková výšivka Informatika, šírka 11 cm'],
      ways: W.bordo,
      deco: {
        front: z => A.script('Informatika', z.legL.x - 2, z.legL.y - 6, 16.5, { swash: false }),
      },
    },
    {
      id: 'sem-boxers', name: 'Šťastné trenky', col: 'semester', cat: 'bielizen', type: 'boxers', price: 16, sizes: SIZES,
      opts: { band: 'trim', bandArt: semBand },
      blurb: 'Trenky na deň skúšky, s drobnými štvorlístkami po celej ploche. Na páse dookola ŠŤASTNÉ TRENKY · SKÚŠKOVÉ · FIIT STU.',
      spec: [POPLIN, 'Potlač štvorlístkov po celej ploche, motív 2,5 cm', 'Žakárový elastický pás 4 cm s nápisom', FLY],
      ways: semWays,
      deco: {
        front: z => allover(z.field, 36, 40, clover(.74, 'var(--d1)'), { id: 'sem-boxers-c', rot: (i, j) => ((i + j) % 2 ? 16 : -12) }),
        back: z => allover(z.field, 36, 40, clover(.74, 'var(--d1)'), { id: 'sem-boxers-c', rot: (i, j) => ((i + j) % 2 ? 16 : -12) }),
      },
    },

    /* ── Boxerky ── */
    {
      id: 'mon-briefs', name: 'Boxerky Monogram', col: 'monogram', cat: 'bielizen', type: 'briefs', price: 18, sizes: SIZES,
      opts: { band: 'trim', bandArt: monBand(20) },
      blurb: 'Hladké boxerky so širokým pásom, okolo ktorého beží FIIT STU. Na ľavej nohavici je malý monogram.',
      spec: [JERSEY, 'Žakárový pás 4,8 cm so slovom FIIT STU', 'Potlač monogramu 4 × 4 cm na ľavej nohavici', POUCH],
      ways: W.monogram,
      deco: {
        front: z => A.mono(z.legL.x, z.legL.y - 26, 41),
      },
    },
    {
      id: 'roc-briefs', name: 'Boxerky Ročník 03', col: 'rocnik', cat: 'bielizen', type: 'briefs', price: 18, sizes: SIZES,
      opts: { band: 'trim2', bandArt: rocBand },
      blurb: 'Čierne boxerky so strieborným pásom, na ktorom je FIIT STU 2003 v širokom písme. Na ľavej nohavici je ovál s obežnou dráhou a dve hviezdičky.',
      spec: [JERSEY, 'Pás 4,8 cm s nápisom FIIT STU 2003, pri čiernej strieborná metalická potlač', 'Potlač oválu 8 cm na ľavej nohavici, pri čiernej strieborná metalická', POUCH],
      ways: W.rocnik,
      deco: {
        front: z => A.y2k(z.legL.x + 2, z.legL.y - 40, 84) +
          A.star4(r(z.legL.x + 22), r(z.legL.y - 106), 7.5, 'var(--d2)') + A.star4(r(z.legL.x + 44), r(z.legL.y - 122), 3.8, 'var(--d1)'),
      },
    },
    {
      id: 'ilk-briefs', name: 'Boxerky Ilkovičova 2', col: 'ilkovicova', cat: 'bielizen', type: 'briefs', price: 17, sizes: SIZES,
      opts: { band: 'body', bandArt: ilkBand },
      blurb: 'Boxerky bez nápisu na prvý pohľad. Pás vo farbe látky má drobný tónový žakár, v bočnom šve je malý tyrkysový štítok.',
      spec: ['Bavlnený úplet 190 g/m², 95 % organická bavlna, 5 % elastan', 'Pás 4,8 cm vo farbe látky, tónový žakár FIIT · STU · MMIII', 'Tkaný štítok Pantone 2995 v ľavom bočnom šve', POUCH],
      ways: W.ilkovicova,
      deco: {
        front: z => sideTab(z),
      },
    }
  );
})();
