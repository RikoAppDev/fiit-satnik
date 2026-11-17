/* Šatník FIIT STU — collections, categories and the hoodie line.
   Other catalog-*.js files push their own products the same way. */
(function () {
  'use strict';
  const FM = window.FM, { t } = FM, A = FM.art, W = FM.ways, C = FM.C;

  FM.collections = [
    { id: 'logo', name: 'Oficiálna', tag: 'Logo FIIT STU',
      blurb: 'Oficiálne logo fakulty z grafického manuálu STU. Vždy celé, bez úprav, s ochrannou zónou a v schválenej farebnej verzii.',
      palette: ['#F6F6F3', C.fiit, C.ink, C.oxford] },
    { id: 'sigillum', name: 'Sigillum', tag: 'Pečať fakulty',
      blurb: 'Kniha a páska: myseľ a stroj. Na páske je rok 2003 zapísaný dvojkovo. Zlatá niť, čierna a tyrkysová fakulty.',
      palette: [C.ink, C.gold, C.fiit, C.ivory] },
    { id: 'varsity', name: 'Varsity MMIII', tag: 'Kampusová klasika',
      blurb: 'Našívané písmená, číslo 03 a pásiky. Na imatrikulácie, do telocvične aj na prednášku o ôsmej.',
      palette: [C.oxford, C.ink, C.fiit, '#E6DFD0'] },
    { id: 'ilkovicova', name: 'Ilkovičova 2', tag: 'Tichý luxus',
      blurb: 'Bez nápisov. Tónová výšivka, súradnice fakulty a jediná farba v podšívke.',
      palette: [C.ecru, C.fog, C.graphite, C.fiit] },
    { id: 'bordo', name: 'Bordó a 2995', tag: 'Univerzita a fakulta',
      blurb: 'Bordová STU navonok, tyrkysová FIIT vnútri. Retiazková výšivka ako na starých univerzitných bundách.',
      palette: [C.bordo, C.fiit, '#EDE6D4', C.ink] },
    { id: 'monogram', name: 'Monogram', tag: 'FI nad IT',
      blurb: 'Štyri písmená poskladané do štvorca, spodný riadok IT vo farbe fakulty. Prvá kolekcia, kde je tyrkysová 2995 na celom kuse.',
      palette: [C.fiit, C.ink, '#F4F1E8', C.chalk] },
    { id: 'rocnik', name: 'Ročník 03', tag: 'Ako v roku 2003',
      blurb: 'Fakulta vznikla v roku 2003, tak dostala logo, aké sa vtedy nosilo: široké písmo, ovál, obežná dráha a hviezdičky.',
      palette: [C.black, '#D5DADF', C.fiit, '#F3F3F0'] },
    { id: 'semester', name: 'Semester', tag: 'Študentský život',
      blurb: 'Pečiatka Započítané, odovzdanie o 23:59 a skúškové turné. Pre každého, kto to na FIIT STU prežil.',
      palette: ['#E6DFD0', '#8E2233', C.ink, C.fiit] },
    { id: 'teoria', name: 'Teória', tag: 'Pre tých, čo vedia',
      blurb: 'Lambda, 0x7D3 a P ≟ NP. Vtipy, ktorým sa zasmeje len ten, kto prešiel teóriou.',
      palette: [C.black, C.fiit, '#EAE4D4', C.chalk] },
    { id: 'absolvent', name: 'Absolvent', tag: 'Limitovaná edícia',
      blurb: 'Raz ročne, na predobjednávku. Titul, ročník a titulný list, ktorý si môžeš obliecť.',
      palette: [C.black, '#EAE4D4', C.fiit, C.ink] },
    /* not a collection: the kusovky get their own section and no collection tile */
    { id: 'solo', name: 'Kusovky', tag: 'Limitky', solo: true,
      blurb: 'Sólo kusy mimo kolekcií. Každý vyjde raz, v malom počte a s číslom.',
      palette: [C.black, C.fiit, '#F4F1E8'] },
  ];

  FM.categories = [
    { id: 'mikiny', name: 'Mikiny' },
    { id: 'svetre', name: 'Svetre a bundy' },
    { id: 'tricka', name: 'Tričká' },
    { id: 'kosele', name: 'Košele a polokošele' },
    { id: 'spodky', name: 'Tepláky a kraťasy' },
    { id: 'supravy', name: 'Súpravy' },
    { id: 'hlava', name: 'Čiapky a šály' },
    { id: 'bielizen', name: 'Trenky a boxerky' },
    { id: 'ponozky', name: 'Ponožky' },
    { id: 'doplnky', name: 'Doplnky' },
  ];

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  FM.SIZES = SIZES;
  const HOOD = 'Dvojvrstvová kapucňa, podšívka Pantone 2995';

  FM.products.push(
    {
      id: 'sig-hoodie', name: 'Mikina Sigillum', col: 'sigillum', cat: 'mikiny', type: 'hoodie', price: 65, sizes: SIZES, hero: 1,
      blurb: 'Vlajkový kus. Malá vyšitá pečať na hrudi, rok založenia na rukáve a motto pod kapucňou.',
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', HOOD, 'Výšivka emblému 7 × 5 cm, zlatá niť a Pantone 2995', 'Výšivka MMIII na pravom rukáve, MENS ET MACHINA na chrbte'],
      ways: W.sigillum,
      deco: {
        front: z => A.mark(z.chestL.x, z.chestL.y + 2, 30, { fx: 'E' }) +
          t('MMIII', z.sleeveR.x, z.sleeveR.y, { f: 'm', size: 8.5, ls: 2.4, rot: z.sleeveR.rot, fx: 'S' }),
        back: z => t('MENS ET MACHINA', z.nape.x, z.nape.y, { f: 'm', size: 6.4, ls: 2.2, fx: 'S' }),
      },
    },
    {
      id: 'var-hoodie', name: 'Mikina Varsity', col: 'varsity', cat: 'mikiny', type: 'hoodie', price: 69, sizes: SIZES, hero: 2,
      blurb: 'FIIT z našívanej keprovej tkaniny s tyrkysovým lemom. Na chrbte 03, rok, keď fakulta vznikla.',
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', HOOD, 'Aplikácia tackle twill, šírka 30 cm, cik-cak prešitie', 'Chrbát: aplikácia 03, výška 22 cm'],
      ways: W.varsity,
      deco: {
        front: z => A.arc('STU · BRATISLAVA', 320, 364, 116, 12, { size: 7.6, ls: 1.6, fill: 'var(--d3)', fx: 'S' }) +
          A.block('FIIT', 321, 410, 50, { ls: 2 }) +
          t('EST. MMIII', 321, 431, { f: 'g', size: 8, ls: 3, fill: 'var(--d3)', fx: 'S' }),
        back: z => A.arc('FIIT', 320, 282, 108, 12, { size: 13, ls: 3, fill: 'var(--d3)', fx: 'S' }) +
          A.block('03', 320, 398, 112, { ls: 0, sw: 9 }),
      },
    },
    {
      id: 'ilk-hoodie', name: 'Mikina Ilkovičova 2', col: 'ilkovicova', cat: 'mikiny', type: 'hoodie', price: 62, sizes: SIZES, hero: 3,
      opts: { cords: false },
      blurb: 'Pre tých, čo nechcú nosiť nápis. Tónová výšivka a adresa fakulty v súradniciach nad lemom.',
      spec: ['Slučkový froté 420 g/m², nefarbená organická bavlna', 'Kapucňa bez šnúrok, podšívka Pantone 2995', 'Tónová výšivka na hrudi a nad lemom chrbta', 'Tónová tlač FACULTAS INFORMATICAE na rukáve'],
      ways: W.ilkovicova,
      deco: {
        front: z => A.lockup(z.chestL.x, z.chestL.y - 3) +
          t('FACULTAS INFORMATICAE · MMIII', z.sleeveL.x, z.sleeveL.y, { f: 'f', size: 6.4, ls: 1.5, rot: z.sleeveL.rot, fill: 'var(--d2)' }),
        back: z => A.coords(z.hem.x, z.hem.y - 5),
      },
    },
    {
      id: 'bor-zip', name: 'Mikina na zips Bordó', col: 'bordo', cat: 'mikiny', type: 'hoodie', price: 72, sizes: SIZES, hero: 4,
      opts: { zip: true },
      blurb: 'Bordová STU navonok, tyrkysová FIIT v kapucni a na zipse. Na chrbte retiazková výšivka Informatika.',
      spec: ['Počesaný fleece 450 g/m², farbený v kuse', 'Kovový zips, páska Pantone 2995', 'Retiazková výšivka Informatika, šírka 34 cm', HOOD],
      ways: W.bordo,
      deco: {
        front: z => A.lockup(z.chestL.x + 2, z.chestL.y - 2, { sub: 'STU', k: .95 }),
        back: z => A.script('Informatika', 320, 350, 30) +
          t('FIIT · STU · MMIII', 320, 398, { f: 's', w: 600, size: 6, ls: 2.6, fill: 'var(--d2)', fx: 'S' }),
      },
    },
    {
      id: 'teo-hoodie', name: 'Mikina Páska', col: 'teoria', cat: 'mikiny', type: 'hoodie', price: 62, sizes: SIZES,
      blurb: 'Cez hruď beží páska s číslom 11111010011. Dvojkovo je to 2003, rok založenia fakulty.',
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', HOOD, 'Sieťotlač pásky, šírka 38 cm, Pantone 2995 a ecru', 'Na chrbte pod kapucňou EST. 0x7D3'],
      ways: W.teoria,
      deco: {
        front: z => A.tape(320, 386, 146) +
          t('0b11111010011 = 2003', 320, 412, { f: 'f', size: 6.2, ls: .8 }),
        back: z => t('EST. 0x7D3', z.nape.x, z.nape.y + 2, { f: 'f', size: 7, ls: 1.6 }),
      },
    },
    {
      id: 'abs-hoodie', name: 'Mikina Titulný list', col: 'absolvent', cat: 'mikiny', type: 'hoodie', price: 59, sizes: SIZES,
      blurb: 'Chrbát vysádzaný ako titulná strana záverečnej práce. Meno a ročník na želanie.',
      spec: ['Počesaný fleece 420 g/m², 100 % organická bavlna', HOOD, 'Sieťotlač chrbta 34 × 40 cm, ecru a Pantone 2995', 'Meno absolventa voliteľne (+ €5)'],
      ways: W.absolvent,
      deco: {
        front: z => t('FIIT-2026', 388, 292, { f: 'f', size: 5.6, ls: .8 }) +
          '<rect x="372" y="295" width="32" height="1.1" style="fill:var(--d2)"/>',
        back: () =>
          t('SLOVENSKÁ TECHNICKÁ UNIVERZITA V BRATISLAVE', 320, 252, { w: 600, size: 4.3, ls: .42 }) +
          t('FAKULTA INFORMATIKY A INFORMAČNÝCH TECHNOLÓGIÍ', 320, 260, { w: 600, size: 4.3, ls: .2 }) +
          t('FIIT-2026', 320, 276, { f: 'f', size: 4.2, ls: .4 }) +
          t('Meno Priezvisko', 320, 318, { w: 500, size: 6.4, ls: .3 }) +
          t('MENS ET MACHINA', 320, 343, { f: 'm', size: 11.5, ls: 1.1 }) +
          t('Záverečná práca', 320, 355, { it: 1, size: 5.4 }) +
          t('Študijný program: Informatika', 258, 432, { f: 'f', size: 4.2, ls: .2, anchor: 'start' }) +
          t('Rozsah: 180 kreditov ECTS', 258, 439.5, { f: 'f', size: 4.2, ls: .2, anchor: 'start' }) +
          t('Miesto: Ilkovičova 2, Bratislava', 258, 447, { f: 'f', size: 4.2, ls: .2, anchor: 'start' }) +
          '<rect x="258" y="478" width="124" height=".9" style="fill:var(--d2)"/>' +
          t('BRATISLAVA 2026', 320, 492, { w: 600, size: 5.8, ls: 1.4 }),
      },
    }
  );
})();
