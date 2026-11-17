/* Sets: pairs of existing products at a set price. Loaded after every other catalog,
   and a set is only offered when both of its parts exist. */
(function () {
  'use strict';
  const FM = window.FM;
  const find = id => FM.products.find(p => p.id === id && FM.garments[p.type]);

  function set(id, name, col, parts, price, blurb) {
    const [a, b] = parts.map(find);
    if (!a || !b || !FM.garments.set) return;
    const shared = a.ways.filter(w => b.ways.some(x => x.n === w.n));
    FM.products.push({
      id, name, col, cat: 'supravy', type: 'set', price, sizes: FM.SIZES, opts: { parts },
      blurb,
      spec: [
        `${a.name} a ${b.name} v rovnakej farbe`,
        `Samostatne ${FM.eur(a.price + b.price)}, v súprave ${FM.eur(price)}`,
        a.spec[0],
        'Vrch a spodok sa dajú objednať v rôznych veľkostiach',
      ],
      ways: shared.length ? shared : a.ways,
    });
  }

  set('var-set', 'Tepláková súprava Varsity', 'varsity', ['var-hoodie', 'var-pants'], 109,
    'Mikina Varsity a tepláky s pásikmi. Na cestu na internát, do telocvične aj na skúškové.');
  set('ilk-set', 'Súprava Ilkovičova 2', 'ilkovicova', ['ilk-hoodie', 'ilk-pants'], 99,
    'Tónová mikina bez šnúrok a tepláky v rovnakej nefarbenej bavlne. Bez nápisov.');
  set('sig-set', 'Súprava Sigillum', 'sigillum', ['sig-crew', 'sig-pants'], 95,
    'Crewneck s pečaťou a tepláky s malým emblémom na boku.');
  set('bor-set', 'Súprava Bordó', 'bordo', ['bor-crew', 'bor-pants'], 92,
    'Bordová od hlavy po päty, s tyrkysovým pásikom fakulty.');
  set('var-summer', 'Letná súprava Varsity', 'varsity', ['var-tee', 'var-shorts'], 49,
    'Tričko s kontrastným lemom a kraťasy s číslom 03. Na leto a na fakultný turnaj.');
  set('off-set', 'Súprava Oficiálna', 'logo', ['off-hoodie', 'off-pants'], 99,
    'Mikina a tepláky s oficiálnym logom fakulty v rovnakej farbe.');
  set('mon-set', 'Súprava Monogram', 'monogram', ['mon-hoodie', 'mon-pants'], 105,
    'Mikina a tepláky s monogramom. V tyrkysovej 2995 ťa na chodbe neprehliadnu.');
  set('roc-set', 'Súprava Ročník 03', 'rocnik', ['roc-zip', 'roc-pants'], 112,
    'Mikina na zips a tepláky s oválnym logom z roku 2003.');
})();
