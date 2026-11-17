/* Šatník FIIT STU — collection "Oficiálna": the official FIIT logo from the STU graphic manual.
   The logo is never redrawn, recoloured or cropped: FM.art.logo places the official artwork
   whole, with its protective zone, in the colour, black or negative version. */
(function () {
  'use strict';
  const FM = window.FM, A = FM.art, W = FM.ways.logo, SIZES = FM.SIZES;
  const VERSIONS = 'Farebná verzia na bielej, negatívna na tmavej a tyrkysovej, čierna na melíre';
  const solid = W.slice(0, 3);   // hard goods: no heather
  /* Backs: the mark large and centred, the names of the university and the faculty under it,
     flush left with the mark (FM.art.logoBack). Official artwork in a custom arrangement. */
  const STACK = 'Znak aj názov sú z oficiálnych podkladov STU; toto usporiadanie treba dať schváliť';

  FM.products.push(
    {
      id: 'off-hoodie', name: 'Mikina Oficiálna', col: 'logo', cat: 'mikiny', type: 'hoodie', price: 62, sizes: SIZES, hero: 1,
      blurb: 'Oficiálne logo fakulty vyšité na prsiach. Na chrbte veľký znak STU FIIT na stred a pod ním celý názov univerzity a fakulty, zarovnaný vľavo.',
      spec: ['Počesaný fleece 450 g/m², 100 % organická bavlna', 'Výšivka loga na prsiach, šírka 10 cm', 'Chrbát: sieťotlač, znak STU FIIT šírka 39 cm, pod ním názov v štyroch riadkoch', STACK, VERSIONS],
      ways: W,
      deco: {
        front: z => A.logo(z.chestL.x, z.chestL.y, 54),
        back: z => A.logoBack(z.backC.x, 274, 150),
      },
    },
    {
      id: 'off-crew', name: 'Crewneck Oficiálny', col: 'logo', cat: 'mikiny', type: 'crew', price: 49, sizes: SIZES,
      blurb: 'Logo FIIT STU veľké cez hruď. Najjednoduchší kus kolekcie, vhodný aj ako darček pre hostí fakulty.',
      spec: ['Počesaný fleece 420 g/m², 100 % organická bavlna', 'Sieťotlač loga na hrudi, šírka 29 cm', VERSIONS],
      ways: W,
      deco: { front: z => A.logo(z.chestC.x, z.chestC.y + 6, 150) },
    },
    {
      id: 'off-tee', name: 'Tričko Oficiálne', col: 'logo', cat: 'tricka', type: 'tee', price: 22, sizes: SIZES,
      blurb: 'Malé logo na prsiach. Na chrbte veľký znak STU FIIT na stred a pod ním celý názov univerzity a fakulty, zarovnaný vľavo.',
      spec: ['Česaná bavlna 220 g/m²', 'Sieťotlač loga na prsiach, šírka 10 cm', 'Chrbát: sieťotlač, znak STU FIIT šírka 35 cm, pod ním názov v štyroch riadkoch', STACK, VERSIONS],
      ways: W,
      deco: {
        front: z => A.logo(z.chestL.x, z.chestL.y, 52),
        back: z => A.logoBack(z.backC.x, 238, 132),
      },
    },
    {
      id: 'off-polo', name: 'Polo Oficiálne', col: 'logo', cat: 'kosele', type: 'polo', price: 36, sizes: SIZES,
      blurb: 'Polokošeľa s vyšitým logom na hrudi. Pre zamestnancov, študijné oddelenie a reprezentáciu fakulty.',
      spec: ['Bavlnené piké 220 g/m²', 'Výšivka loga na hrudi, šírka 9 cm', VERSIONS],
      ways: W,
      deco: { front: z => A.logo(z.chestL.x, z.chestL.y + 2, 48) },
    },
    {
      id: 'off-pants', name: 'Tepláky Oficiálne', col: 'logo', cat: 'spodky', type: 'pants', price: 46, sizes: SIZES,
      blurb: 'Tepláky s malým logom pod vreckom. K mikine alebo crewnecku z tej istej kolekcie.',
      spec: ['Počesaný fleece 420 g/m², 100 % organická bavlna', 'Výšivka loga na ľavom boku, šírka 7,5 cm', VERSIONS],
      ways: W,
      deco: { front: z => A.logo(z.hipL.x - 2, z.hipL.y + 6, 58) },
    },
    {
      id: 'off-cap', name: 'Šiltovka Oficiálna', col: 'logo', cat: 'hlava', type: 'cap', price: 22, sizes: null,
      blurb: 'Šiltovka s vyšitým logom FIIT STU vpredu.',
      spec: ['Bavlnený keper, nastaviteľný remienok s kovovou prackou', 'Výšivka loga vpredu, šírka 5 cm', VERSIONS],
      ways: W,
      deco: { front: z => A.logo(z.face.x, z.face.y - 4, 150) },
    },
    {
      id: 'off-tote', name: 'Taška Oficiálna', col: 'logo', cat: 'doplnky', type: 'tote', price: 12, sizes: null,
      blurb: 'Plátenná taška s logom a celým názvom fakulty. Do konferenčných balíčkov a na dni otvorených dverí.',
      spec: ['Bavlnené plátno 340 g/m², 40 × 42 cm', 'Sieťotlač loga s názvom, šírka 27 cm', VERSIONS],
      ways: solid,
      deco: { front: z => A.logo(z.face.x, z.face.y - 20, 240, { name: 1 }) },
    },
    {
      id: 'off-mug', name: 'Hrnček Oficiálny', col: 'logo', cat: 'doplnky', type: 'mug', price: 11, sizes: null,
      blurb: 'Keramický hrnček s logom FIIT STU. Do kabinetov, zasadačiek a ako darček pre hostí.',
      spec: ['Keramika, 330 ml, vhodné do umývačky', 'Potlač loga, šírka 4 cm', VERSIONS],
      ways: solid,
      deco: { front: z => A.logo(z.face.x, z.face.y, 200) },
    },
    {
      id: 'off-bottle', name: 'Fľaša Oficiálna', col: 'logo', cat: 'doplnky', type: 'bottle', price: 22, sizes: null, opts: { steelcap: true },
      blurb: 'Termofľaša s logom FIIT STU na tele. Uzáver z nehrdzavejúcej ocele.',
      spec: ['Nehrdzavejúca oceľ, dvojitá stena, 750 ml', 'Gravírované alebo tlačené logo, šírka 4 cm', VERSIONS],
      ways: solid,
      deco: { front: z => A.logo(z.face.x, z.face.y - 30, 120) },
    },
    {
      id: 'off-notebook', name: 'Zápisník Oficiálny', col: 'logo', cat: 'doplnky', type: 'notebook', price: 9, sizes: null, opts: { band: true, ribbon: true },
      blurb: 'Zápisník A5 v plátennej väzbe s logom a názvom fakulty. Na porady, obhajoby a prijímacie pohovory.',
      spec: ['A5, plátenná väzba, 96 listov, bodkovaný papier', 'Razba alebo sieťotlač loga s názvom, šírka 9 cm', VERSIONS],
      ways: solid,
      deco: { front: z => A.logo(z.cover.x - 6, z.cover.y - 40, 236, { name: 1 }) },
    }
  );
})();
