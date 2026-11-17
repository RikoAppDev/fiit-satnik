/* Set (súprava): two existing products drawn together, top in front of bottom.
   opts.parts = [topProductId, bottomProductId]. Both share the colourway of the set. */
(function () {
  'use strict';
  const FM = window.FM;

  FM.register('set', {
    label: 'Súprava',
    views: ['front', 'back'],
    shadow: { cx: 320, cy: 668, rx: 250, ry: 13 },
    zones: { front: {}, back: {} },
    draw(view, o) {
      const parts = (o.parts || []).map(id => FM.products.find(p => p.id === id)).filter(Boolean);
      if (parts.length < 2) return '';
      const piece = (p, x, y, k) => {
        const vs = FM.views(p), v = vs.includes(view) ? view : vs[0];
        return `<svg x="${x}" y="${y}" width="${+(524 * k).toFixed(1)}" height="${+(664 * k).toFixed(1)}" viewBox="${FM.BOX}" overflow="visible">` +
          FM.inner(p.type, v, p.opts, p.deco && p.deco[v], p) + '</svg>';
      };
      return piece(parts[1], 258, 246, .65) + piece(parts[0], 44, 24, .66);
    },
  });
})();
