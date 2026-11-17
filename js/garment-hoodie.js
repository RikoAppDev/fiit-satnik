/* Hoodie (pullover and zip) — the reference garment. New garments follow this style:
   flat technical drawing, 1.5 outline, dashed seam stitching, a few soft creases,
   ribbing as its own darker piece, floor shadow. */
(function () {
  'use strict';
  const FM = window.FM, { fab, mir } = FM;

  const G = {
    sleeve: 'M176,196 C150,214 128,286 118,360 L98,552 L158,560 L166,420 C172,370 186,336 204,312 Q166,260 176,196 Z',
    cuff:   'M98,552 L158,560 L154,612 L102,606 Z',
    body:   'M266,166 Q320,178 374,166 L464,196 Q474,260 436,312 L440,584 L200,584 L204,312 Q166,260 176,196 Z',
    side:   'M204,312 L217,318 L214,584 L200,584 Z',
    hem:    'M200,584 L440,584 L434,630 L206,630 Z',
    hoodF:  'M236,184 C220,128 240,50 320,42 C400,50 420,128 404,184 Q320,204 236,184 Z',
    hoodFo: 'M238,180 C220,128 240,50 320,42 C400,50 420,128 402,180',
    hoodB:  'M232,186 C216,128 238,48 320,40 C402,48 424,128 408,186 Q320,206 232,186 Z',
    open:   'M262,188 C252,136 272,82 320,78 C368,82 388,136 378,188 L320,234 Z',
    pocket: 'M236,452 L404,452 L424,548 Q426,566 408,566 L232,566 Q214,566 216,548 Z',
    pocketS:'M240,457 L400,457 L418,547 Q419,560 406,560 L234,560 Q221,560 222,547 Z',
    pocketZ:'M236,452 L314,452 L314,566 L232,566 Q214,566 216,548 Z',
    pocketZS:'M240,457 L309,457 L309,560 L234,560 Q221,560 222,547 Z',
  };
  const FOLDS = ['M152,262 C142,296 137,326 134,350', 'M126,446 C137,452 149,452 161,447', 'M121,486 C133,492 146,492 157,487', 'M219,334 C232,356 238,388 236,418'];
  const STITCH = ['M181,200 Q172,258 207,309', 'M101,546 L157,553'];

  FM.register('hoodie', {
    label: 'Mikina s kapucňou',
    views: ['front', 'back'],
    cm: 3.8,
    zones: {
      front: {
        chestL: { x: 386, y: 296 },            // wearer's left chest (viewer's right), emblem centre
        chestC: { x: 320, y: 400, w: 150 },    // centre chest between hood and pocket (y 350–440)
        pocket: { x: 320, y: 510, w: 150 },
        sleeveR: { x: 136, y: 486, rot: -84.5 }, // wearer's right forearm (viewer's left)
        sleeveL: { x: 505, y: 452, rot: 84 },
      },
      back: {
        nape: { x: 320, y: 232 },              // just under the hood
        backC: { x: 320, y: 360, w: 210, top: 250, bottom: 560 },
        hem: { x: 320, y: 552 },               // above the hem rib
      },
    },
    /* opts: zip (bool), cords (bool, default true) */
    draw(view, o, deco) {
      const front = view === 'front';
      let s = fab(G.sleeve) + fab(mir(G.sleeve)) + fab(G.cuff, { rib: true }) + fab(mir(G.cuff), { rib: true });
      if (front) s += fab(G.hoodF, { ol: G.hoodFo });
      s += fab(G.body) + fab(G.side, { rib: true }) + fab(mir(G.side), { rib: true }) + fab(G.hem, { rib: true });
      FOLDS.forEach(d => { s += `<path d="${d}" class="fd"/><path d="${mir(d)}" class="fd"/>`; });
      s += '<path d="M236,576 C262,569 292,570 312,577" class="fd"/><path d="M330,577 C354,570 384,569 406,575" class="fd"/>';
      STITCH.forEach(d => { s += `<path d="${d}" class="st"/><path d="${mir(d)}" class="st"/>`; });
      s += '<path d="M203,578 L437,578" class="st"/>';
      if (front) {
        if (o.zip) {
          s += fab(G.pocketZ) + fab(mir(G.pocketZ)) + `<path d="${G.pocketZS}" class="st"/><path d="${mir(G.pocketZS)}" class="st"/>`;
          s += '<rect x="316" y="226" width="8" height="404" class="zt"/><line x1="320" y1="232" x2="320" y2="628" class="zte"/>';
        } else {
          s += fab(G.pocket) + `<path d="${G.pocketS}" class="st"/>`;
        }
        s += `<path d="${G.open}" class="ln"/><path d="${G.open}" fill="url(#g-lin)"/>` +
          `<path d="${G.open}" class="bd-o"/><path d="${G.open}" class="bd"/><path d="${G.open}" class="bd-s"/><path d="${G.open}" class="st"/>`;
        if (o.zip) s += '<path d="M316.4,236 h7.2 v12 a3.6,3.6 0 0 1 -7.2,0 Z" class="zp"/><rect x="317.6" y="250" width="4.8" height="17" rx="2.4" class="zp"/>';
      } else {
        s += fab(G.hoodB) + '<path d="M320,42 C319,90 318,140 320,198" class="ol thin"/>' +
          '<path d="M315.5,46 C314.5,92 313.5,140 315.5,196" class="st"/><path d="M324.5,46 C325.5,92 326.5,140 324.5,196" class="st"/>';
      }
      s += deco || '';
      if (front && o.cords !== false) {
        s += '<circle cx="300" cy="219" r="3.4" class="ey"/><circle cx="340" cy="219" r="3.4" class="ey"/>' +
          '<path d="M300,219 C298,250 295,284 296,316" class="cd-o"/><path d="M300,219 C298,250 295,284 296,316" class="cd"/>' +
          '<path d="M340,219 C343,250 346,280 344,311" class="cd-o"/><path d="M340,219 C343,250 346,280 344,311" class="cd"/>' +
          '<rect x="292.6" y="314" width="6.8" height="15" rx="2.2" class="ag" transform="rotate(3 296 321)"/>' +
          '<rect x="340.6" y="309" width="6.8" height="15" rx="2.2" class="ag" transform="rotate(-4 344 316)"/>';
      }
      return s;
    },
  });
})();
