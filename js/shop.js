/* Šatník FIIT STU — shop behaviour: rail, collections, filters, product view, selection. */
(function () {
  'use strict';
  const FM = window.FM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const { eur, esc } = FM;
  FM.mountDefs();

  /* Products whose garment drawing is missing are left out rather than shown broken. */
  const P = FM.products.filter(p => FM.garments[p.type]);
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const COLS = FM.collections, CATS = FM.categories;
  const colOf = id => COLS.find(c => c.id === id) || { id, name: id };
  const catOf = id => CATS.find(c => c.id === id) || { id, name: id };
  const kus = n => (n === 1 ? 'kus' : n >= 2 && n <= 4 ? 'kusy' : 'kusov');
  const waysOf = p => (p.ways && p.ways.length ? p.ways : [{ n: 'Základná', body: FM.C.ink }]);
  const defSize = p => (!p.sizes ? null : p.sizes.includes('M') ? 'M' : p.sizes[0]);
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── selection (cart) ─────────────────────────────────────────────────────── */
  const LS = 'fiit-satnik-vyber-v1';
  let cart = [];
  try { cart = (JSON.parse(localStorage.getItem(LS)) || []).filter(l => byId[l.id] && l.q > 0); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(cart)); } catch (e) { /* private mode */ } };
  const cartCount = () => cart.reduce((n, l) => n + l.q, 0);
  const cartSum = () => cart.reduce((n, l) => n + l.q * byId[l.id].price, 0);
  const lineLabel = l => {
    const p = byId[l.id], w = waysOf(p)[l.way] || waysOf(p)[0];
    return [w.n, l.size, l.seed ? 'kus č. ' + l.seed : null].filter(Boolean).join(' · ');
  };
  /* a seeded kusovka in the selection is drawn with the seed that was picked */
  const withSeed = (p, l) => (l.seed ? Object.assign({}, p, { opts: Object.assign({}, p.opts, { seed: l.seed }) }) : p);

  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 2600);
  }

  function addToCart(id, way, size, q, seed) {
    seed = seed || null;
    const line = cart.find(l => l.id === id && l.way === way && l.size === size && (l.seed || null) === seed);
    if (line) line.q += q; else cart.push({ id, way, size, q, seed });
    save(); renderCart();
    const n = $('#cart-n');
    n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
    toast(`Pridané do výberu: ${byId[id].name}${size ? ', ' + size : ''}`);
  }

  const cartDlg = $('#cart');
  function renderCart() {
    $('#cart-n').textContent = cartCount();
    const body = $('#cart-body'), foot = $('#cart-foot');
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a2.2 2.2 0 1 1 2.2 2.2c-1.4 0-2.2.9-2.2 2.3v.9M12 9.4 3.5 15.2c-1 .7-.5 2.3.7 2.3h15.6c1.2 0 1.7-1.6.7-2.3L12 9.4Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p>Vešiak je zatiaľ prázdny.<br>Pridaj si kusy, ktoré by si nosil.</p>
        <button class="btn" type="button" data-act="browse">Prezrieť šatník</button></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = '';
    cart.forEach((l, i) => {
      const p = byId[l.id], w = waysOf(p)[l.way] || waysOf(p)[0];
      const sizeSel = p.sizes
        ? `<select data-act="size" data-i="${i}" aria-label="Veľkosť">${p.sizes.map(s => `<option${s === l.size ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select>` : '';
      const el = h(`<div class="line">
        <a class="line-pic garment" href="#/p/${p.id}" data-close aria-hidden="true" tabindex="-1">${FM.render(withSeed(p, l), FM.views(p)[0], { shadow: false })}</a>
        <div>
          <a class="line-name" href="#/p/${p.id}" data-close>${esc(p.name)}</a>
          <p class="line-opt">${esc(lineLabel(l))}</p>
          <div class="line-ctl">
            <span class="qty"><button type="button" data-act="dec" data-i="${i}" aria-label="Menej kusov">−</button><output>${l.q}</output><button type="button" data-act="inc" data-i="${i}" aria-label="Viac kusov">+</button></span>
            ${sizeSel}
          </div>
        </div>
        <div><p class="line-price">${eur(p.price * l.q)}</p><button class="line-rm" type="button" data-act="rm" data-i="${i}">Odstrániť</button></div>
      </div>`);
      FM.applyWay($('.line-pic', el), w);
      body.appendChild(el);
    });
    const n = cartCount();
    foot.innerHTML = `<p class="sum"><span>${n} ${kus(n)}</span><b>${eur(cartSum())}</b></p>
      <div class="cart-actions"><button class="btn primary" type="button" data-act="copy">Skopírovať zoznam</button><button class="btn" type="button" data-act="clear">Vyprázdniť</button></div>
      <p class="cart-fine">Toto je návrh, nie skutočný obchod. Nič sa neobjednáva ani neplatí, ceny sú orientačné. Zoznam si skopíruj a pošli tomu, kto kolekciu rieši.</p>`;
  }

  function cartText() {
    const rows = cart.map(l => `${l.q}× ${byId[l.id].name} — ${lineLabel(l)} — ${eur(byId[l.id].price * l.q)}`);
    return ['Šatník FIIT STU — môj výber', ...rows, `Spolu: ${eur(cartSum())} (orientačne, s DPH)`].join('\n');
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      cartDlg.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  cartDlg.addEventListener('click', async e => {
    if (e.target === cartDlg) { cartDlg.close(); return; }
    if (e.target.closest('[data-close]')) { cartDlg.close(); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const i = +b.dataset.i, act = b.dataset.act;
    if (act === 'inc') cart[i].q++;
    else if (act === 'dec') { cart[i].q--; if (cart[i].q < 1) cart.splice(i, 1); }
    else if (act === 'rm') cart.splice(i, 1);
    else if (act === 'clear') cart = [];
    else if (act === 'browse') { cartDlg.close(); location.hash = '#obchod'; return; }
    else if (act === 'copy') { toast((await copyText(cartText())) ? 'Zoznam je v schránke' : 'Kopírovanie sa nepodarilo, označ si zoznam ručne'); return; }
    else return;
    save(); renderCart();
  });
  cartDlg.addEventListener('change', e => {
    const s = e.target.closest('select[data-act="size"]');
    if (!s) return;
    const l = cart[+s.dataset.i];
    const twin = cart.find(x => x !== l && x.id === l.id && x.way === l.way && x.size === s.value && (x.seed || null) === (l.seed || null));
    if (twin) { twin.q += l.q; cart.splice(cart.indexOf(l), 1); } else l.size = s.value;
    save(); renderCart();
  });
  $('#cart-open').addEventListener('click', () => { renderCart(); cartDlg.showModal(); });
  $('#cart-close').addEventListener('click', () => cartDlg.close());

  /* ── product card ─────────────────────────────────────────────────────────── */
  const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  function makeCard(p) {
    const views = FM.views(p), ws = waysOf(p);
    const dots = ws.length > 1 ? ws.map((w, i) =>
      `<button type="button" class="dot" style="background:${w.sw || w.body}" aria-pressed="${i === 0}" aria-label="Farba ${esc(w.n)}" data-way="${i}"></button>`).join('') : '';
    const el = h(`<article class="card garment${views.length > 1 ? ' has-back' : ''}" data-id="${p.id}" data-way="0">
      <a class="card-stage" href="#/p/${p.id}" aria-label="${esc(p.name)}, ${eur(p.price)}">
        <span class="face f1">${FM.render(p, views[0])}</span>${views.length > 1 ? '<span class="face f2"></span>' : ''}
        ${p.edition ? `<span class="badge">Kusovka · ${p.edition} ks</span>` : ''}
      </a>
      <div class="card-meta">
        <p class="card-col">${esc(colOf(p.col).name)}</p>
        <h3 class="card-name"><a href="#/p/${p.id}">${esc(p.name)}</a></h3>
        <div class="card-row"><span class="price">${eur(p.price)}</span><span class="dots" role="group" aria-label="Farby">${dots}</span></div>
      </div>
      <button class="quick" type="button" aria-label="Pridať do výberu: ${esc(p.name)}">${PLUS}</button>
    </article>`);
    FM.applyWay(el, ws[0]);
    if (views.length > 1) {
      const fill = () => { const f2 = $('.f2', el); if (!f2.firstChild) f2.innerHTML = FM.render(p, views[1]); };
      el.addEventListener('pointerenter', fill, { once: true });
      el.addEventListener('focusin', fill, { once: true });
    }
    el.addEventListener('click', e => {
      const d = e.target.closest('.dot');
      if (d) {
        el.dataset.way = d.dataset.way;
        FM.applyWay(el, ws[+d.dataset.way]);
        $$('.dot', el).forEach(x => x.setAttribute('aria-pressed', String(x === d)));
        return;
      }
      if (e.target.closest('.quick')) addToCart(p.id, +el.dataset.way, defSize(p), 1);
    });
    return el;
  }

  /* ── hero rail ────────────────────────────────────────────────────────────── */
  const HOOK = '<svg class="hook" viewBox="0 0 34 46" aria-hidden="true"><path d="M17,46 V31 C17,24 26.5,22 26.5,13.5 A9.5,9.5 0 1 0 8.2,10" fill="none" stroke="#1C1D21" stroke-width="2.3" stroke-linecap="round"/></svg>';
  function buildRail() {
    const want = ['off-hoodie', 'var-jacket', 'sig-knit', 'mon-tee', 'var-pants', 'sig-scarf', 'roc-zip', 'bor-zip', 'sig-hoodie', 'var-tee'];
    let pick = want.map(id => byId[id]).filter(Boolean);
    for (const c of CATS) {
      if (pick.length >= 7) break;
      const p = P.find(x => x.cat === c.id && !pick.includes(x));
      if (p) pick.push(p);
    }
    for (const p of P) { if (pick.length >= 7) break; if (!pick.includes(p)) pick.push(p); }
    pick = pick.slice(0, 7);
    const rail = $('#rail');
    pick.forEach((p, i) => {
      const li = h(`<li class="hang garment" style="--i:${i}">
        <a href="#/p/${p.id}">
          <span class="hang-in">${HOOK}<span class="hang-g">${FM.render(p, FM.views(p)[0], { shadow: false })}</span></span>
          <span class="hang-cap"><b>${esc(p.name)}</b><span>${eur(p.price)}</span></span>
        </a></li>`);
      FM.applyWay(li, waysOf(p)[0]);
      /* swing on hover or focus; once started it finishes on its own */
      const inn = $('.hang-in', li);
      const sway = () => { if (!reduced && !rail.classList.contains('js-settle')) inn.classList.add('swaying'); };
      li.addEventListener('pointerenter', sway);
      li.addEventListener('focusin', sway);
      inn.addEventListener('animationend', e => { if (e.animationName === 'sway') inn.classList.remove('swaying'); });
      rail.appendChild(li);
    });
    const nCols = COLS.filter(c => !c.solo && P.some(p => p.col === c.id)).length;
    const nSolo = P.filter(p => p.col === 'solo').length;
    $('#rail-note').textContent = `${P.length} ${kus(P.length)} v ${nCols} kolekciách` +
      (nSolo ? ` a ${nSolo} ${nSolo === 1 ? 'kusovka' : nSolo < 5 ? 'kusovky' : 'kusoviek'} mimo nich` : '') +
      '. Prejdi po vešiakoch alebo otvor celý šatník.';
  }
  /* Hang every piece by its real top edge and tuck the caption under its real hem. */
  let railAligned = false, railSettled = false;
  function alignRail() {
    if (railAligned || $('#home').hidden) return;
    $$('#rail .hang').forEach(li => {
      const svg = $('.hang-g svg', li);
      let bb;
      try { bb = svg.getBBox(); } catch (e) { return; }
      if (!bb || !bb.height) return;
      const vb = svg.viewBox.baseVal;
      const lift = Math.min(.4, Math.max(0, (bb.y - vb.y) / vb.height));
      const drop = Math.min(.7, Math.max(0, (vb.y + vb.height - (bb.y + bb.height)) / vb.height));
      li.style.setProperty('--lift', lift.toFixed(4));
      li.style.setProperty('--drop', drop.toFixed(4));
    });
    railAligned = true;
    /* The arrival swing runs once. The class must go afterwards: left in place, the arrival
       animation (which starts invisible) restarts every time a hover ends, and the piece blinks. */
    if (!reduced && !railSettled) {
      railSettled = true;
      const rail = $('#rail');
      rail.classList.add('js-settle');
      setTimeout(() => rail.classList.remove('js-settle'), 2800);
    }
  }

  /* ── collections ──────────────────────────────────────────────────────────── */
  function buildCollections() {
    const box = $('#cols');
    COLS.forEach(c => {
      const items = P.filter(p => p.col === c.id);
      if (!items.length || c.solo) return;
      /* a collection is always introduced by its hoodie */
      const star = items.find(p => p.type === 'hoodie' && p.hero) || items.find(p => p.type === 'hoodie') ||
        items.find(p => p.cat === 'mikiny') || items[0];
      const el = h(`<button class="col garment" type="button" data-col="${c.id}">
        <span class="col-text">
          <span class="col-tag">${esc(c.tag)}</span>
          <span class="col-name">${esc(c.name)}</span>
          <span class="col-blurb">${esc(c.blurb)}</span>
          <span class="col-foot"><span class="pal">${c.palette.map(x => `<i style="background:${x}"></i>`).join('')}</span>${items.length} ${kus(items.length)}</span>
        </span>
        <span class="col-art" aria-hidden="true">${FM.render(star, FM.views(star)[0], { shadow: false })}</span>
      </button>`);
      FM.applyWay(el, waysOf(star)[0]);
      /* The leading (official) collection is a wide tile: show its star piece in three colours. */
      if (!box.children.length && waysOf(star).length >= 3) {
        const art = $('.col-art', el);
        art.classList.add('trio');
        art.innerHTML = '';
        [1, 0, 2].forEach(i => {
          const s = h(`<span class="garment">${FM.render(star, FM.views(star)[0], { shadow: false })}</span>`);
          FM.applyWay(s, waysOf(star)[i]);
          art.appendChild(s);
        });
      }
      el.addEventListener('click', () => { setFilter({ col: c.id, cat: 'all' }); $('#obchod').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); });
      box.appendChild(el);
    });
  }

  /* ── filters + grid ───────────────────────────────────────────────────────── */
  const F = { cat: 'all', col: 'all', sort: 'rec' };
  const cards = new Map();
  const grid = $('#grid');

  function recommended(list) {
    if (F.cat !== 'all') return list.slice().sort((a, b) => COLS.findIndex(c => c.id === a.col) - COLS.findIndex(c => c.id === b.col));
    const buckets = CATS.map(c => list.filter(p => p.cat === c.id));
    const out = [];
    for (let i = 0; buckets.some(b => b[i]); i++) buckets.forEach(b => { if (b[i]) out.push(b[i]); });
    list.forEach(p => { if (!out.includes(p)) out.push(p); });
    return out;
  }
  function applyFilters() {
    let list = P.filter(p => (F.cat === 'all' || p.cat === F.cat) && (F.col === 'all' || p.col === F.col));
    if (F.sort === 'asc') list.sort((a, b) => a.price - b.price);
    else if (F.sort === 'desc') list.sort((a, b) => b.price - a.price);
    else if (F.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'sk'));
    else list = recommended(list);
    grid.replaceChildren(...list.map(p => { if (!cards.has(p.id)) cards.set(p.id, makeCard(p)); return cards.get(p.id); }));
    $('#empty').hidden = list.length > 0;
    const bits = [];
    if (F.cat !== 'all') bits.push(catOf(F.cat).name);
    if (F.col !== 'all') bits.push('kolekcia ' + colOf(F.col).name);
    $('#count').textContent = `${list.length} ${kus(list.length)}` + (bits.length ? ' · ' + bits.join(' · ') : '');
    $$('#cat-chips .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === F.cat)));
    /* the chip row scrolls sideways: keep the active category in view */
    const row = $('#cat-chips'), on = $('#cat-chips .chip[aria-pressed="true"]');
    if (row && on) row.scrollLeft = Math.max(0, on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2);
    $('#f-col').value = F.col; $('#f-sort').value = F.sort;
  }
  function setFilter(patch) { Object.assign(F, patch); applyFilters(); }

  function buildFilters() {
    const chips = $('#cat-chips');
    const mk = (id, name, n) => h(`<button type="button" class="chip" data-cat="${id}" aria-pressed="false">${esc(name)}<small>${n}</small></button>`);
    chips.appendChild(mk('all', 'Všetko', P.length));
    CATS.forEach(c => { const n = P.filter(p => p.cat === c.id).length; if (n) chips.appendChild(mk(c.id, c.name, n)); });
    chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setFilter({ cat: b.dataset.cat }); });
    const sel = $('#f-col');
    sel.innerHTML = '<option value="all">Všetky</option>' + COLS.filter(c => P.some(p => p.col === c.id)).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    sel.addEventListener('change', () => setFilter({ col: sel.value }));
    $('#f-sort').addEventListener('change', e => setFilter({ sort: e.target.value }));
    $('#f-reset').addEventListener('click', () => setFilter({ cat: 'all', col: 'all' }));
  }

  /* ── product view ─────────────────────────────────────────────────────────── */
  const VIEW_NAMES = { front: 'Spredu', back: 'Zozadu', side: 'Zboku' };
  const ARROW = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M13 7H1M6 2 1 7l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function showProduct(id) {
    const p = byId[id], ws = waysOf(p), views = FM.views(p), col = colOf(p.col);
    const box = $('#product');
    const sizes = p.sizes
      ? `<fieldset class="opt"><legend>Veľkosť</legend><div class="sizes">${p.sizes.map(s =>
          `<label class="size"><input type="radio" name="size" value="${esc(s)}"${s === defSize(p) ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div></fieldset>`
      : '<p class="one-size opt">Jedna veľkosť</p>';
    const colour = ws.length > 1
      ? `<fieldset class="opt"><legend>Farba<b id="pv-way">${esc(ws[0].n)}</b></legend><div class="ways">${ws.map((w, i) =>
          `<button type="button" class="way" style="background:${w.sw || w.body}" aria-pressed="${i === 0}" aria-label="${esc(w.n)}" data-way="${i}"></button>`).join('')}</div></fieldset>`
      : `<p class="one-size opt">Farba: ${esc(ws[0].n)}</p>`;
    /* Kusovky: a numbered edition; seeded ones have different art on every piece. */
    let seed = (p.opts && p.opts.seed) || 1;
    const pieceUi = !p.edition ? '' : p.seeded
      ? `<fieldset class="opt"><legend>Kus č.<b id="pv-seed-n">${seed} / ${p.edition}</b></legend>
           <div class="seedrow"><span class="qty"><button type="button" data-seed="-1" aria-label="Predchádzajúci kus">−</button><output id="pv-seed">${seed}</output><button type="button" data-seed="1" aria-label="Ďalší kus">+</button></span>
           <button type="button" class="btn sm" id="pv-seed-rand">Náhodný kus</button></div>
           <p class="opt-note">Každý kus má vlastnú grafiku podľa svojho čísla. Vyber si ten svoj.</p></fieldset>`
      : `<p class="one-size opt">Kusovka: ${p.edition} číslovaných kusov</p>`;
    const related = P.filter(x => x.col === p.col && x.id !== p.id);
    const relPick = [];
    related.forEach(x => { if (relPick.length < 4 && !relPick.some(y => y.cat === x.cat)) relPick.push(x); });
    related.forEach(x => { if (relPick.length < 4 && !relPick.includes(x)) relPick.push(x); });

    box.innerHTML = `<div class="wrap pv">
      <button class="back" type="button" id="pv-back">${ARROW}Späť do šatníka</button>
      <div class="pv-grid garment" id="pv-g">
        <div class="pv-visual">
          <div class="stage" id="pv-stage">
            <div class="turn">
              <div class="face a">${FM.render(p, views[0])}</div>
              ${views.length > 1 ? `<div class="face b">${FM.render(p, views[1])}</div>` : ''}
            </div>
            <span class="stage-hint">prejdi myšou pre detail</span>
          </div>
          ${views.length > 1 ? `<div class="pv-tools"><div class="seg" role="group" aria-label="Pohľad">${views.slice(0, 2).map((v, i) =>
            `<button type="button" aria-pressed="${i === 0}" data-view="${i}">${VIEW_NAMES[v] || v}</button>`).join('')}</div></div>` : ''}
        </div>
        <div class="pv-info">
          <p class="eyebrow"><button type="button" class="linklike" id="pv-col">${esc(col.name)}</button> · ${esc(catOf(p.cat).name)}</p>
          <h1 class="pv-name" tabindex="-1">${esc(p.name)}</h1>
          <p class="pv-price">${eur(p.price)}<small>orientačná cena s DPH</small></p>
          <p class="pv-blurb">${esc(p.blurb || '')}</p>
          ${colour}${sizes}${pieceUi}
          <div class="buy">
            <span class="qty"><button type="button" data-q="-1" aria-label="Menej kusov">−</button><output id="pv-q">1</output><button type="button" data-q="1" aria-label="Viac kusov">+</button></span>
            <button class="btn primary" type="button" id="pv-add">Pridať do výberu</button>
          </div>
          <p class="pv-note">Návrh. Kus zatiaľ neexistuje, výber slúži ako podklad pre predobjednávku.</p>
          ${p.spec && p.spec.length ? `<h2 class="pv-spec-h">Materiál a vyhotovenie</h2><ul class="pv-spec">${p.spec.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
      ${relPick.length ? `<section class="related"><h2 class="h3">Z kolekcie ${esc(col.name)}</h2><div class="grid" id="pv-rel"></div></section>` : ''}
    </div>`;

    const g = $('#pv-g'), stage = $('#pv-stage');
    let way = 0, q = 1;
    FM.applyWay(g, ws[0]);
    $$('.way', box).forEach(b => b.addEventListener('click', () => {
      way = +b.dataset.way;
      FM.applyWay(g, ws[way]);
      $$('.way', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('#pv-way').textContent = ws[way].n;
    }));
    $$('.seg button', box).forEach(b => b.addEventListener('click', () => {
      stage.classList.toggle('is-back', b.dataset.view === '1');
      $$('.seg button', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    $$('.buy [data-q]', box).forEach(b => b.addEventListener('click', () => { q = Math.max(1, Math.min(20, q + +b.dataset.q)); $('#pv-q').textContent = q; }));
    $('#pv-add').addEventListener('click', () => {
      const s = $('input[name="size"]:checked', box);
      addToCart(p.id, way, s ? s.value : null, q, p.seeded ? seed : null);
    });
    if (p.seeded) {
      const setSeed = n => {
        seed = ((n - 1 + p.edition) % p.edition) + 1;
        p.opts = Object.assign({}, p.opts, { seed });
        $('#pv-seed').textContent = seed;
        $('#pv-seed-n').textContent = `${seed} / ${p.edition}`;
        $('.face.a', box).innerHTML = FM.render(p, views[0]);
        const b = $('.face.b', box);
        if (b) b.innerHTML = FM.render(p, views[1]);
      };
      $$('[data-seed]', box).forEach(b => b.addEventListener('click', () => setSeed(seed + +b.dataset.seed)));
      $('#pv-seed-rand').addEventListener('click', () => setSeed(1 + Math.floor(Math.random() * p.edition)));
    }
    $('#pv-col').addEventListener('click', () => { F.col = p.col; F.cat = 'all'; leaveTo = 'obchod'; location.hash = '#obchod'; });
    $('#pv-back').addEventListener('click', () => { leaveTo = 'restore'; location.hash = '#obchod'; });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      stage.addEventListener('pointerenter', () => stage.classList.add('zoom'));
      stage.addEventListener('pointerleave', () => stage.classList.remove('zoom'));
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        let x = (e.clientX - r.left) / r.width * 100;
        if (stage.classList.contains('is-back')) x = 100 - x;
        stage.style.setProperty('--ox', x.toFixed(1) + '%');
        stage.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
    const rel = $('#pv-rel');
    if (rel) relPick.forEach(x => rel.appendChild(makeCard(x)));
    document.title = `${p.name} · Šatník FIIT STU`;
  }

  /* ── routing ──────────────────────────────────────────────────────────────── */
  const home = $('#home'), product = $('#product');
  let homeScroll = null, leaveTo = null, inProduct = false;
  function route() {
    const m = location.hash.match(/^#\/p\/([\w-]+)/);
    if (m && byId[m[1]]) {
      if (!inProduct) homeScroll = window.scrollY;
      inProduct = true;
      home.hidden = true; product.hidden = false;
      showProduct(m[1]);
      window.scrollTo({ top: 0, behavior: 'instant' });
      const t = $('.pv-name', product); if (t) t.focus({ preventScroll: true });
      return;
    }
    const was = inProduct;
    inProduct = false;
    product.hidden = true; home.hidden = false;
    product.innerHTML = '';
    document.title = 'Šatník FIIT STU · návrh fakultnej kolekcie';
    applyFilters();
    alignRail();
    if (was) {
      const target = document.getElementById(location.hash.slice(1));
      if (leaveTo === 'restore' && homeScroll != null) window.scrollTo({ top: homeScroll, behavior: 'instant' });
      else if (target) target.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    }
    leaveTo = null;
  }
  window.addEventListener('hashchange', route);

  /* ── seal figure ──────────────────────────────────────────────────────────── */
  function buildSeal() {
    const f = $('#seal-fig');
    if (!f) return;
    FM.applyWay(f, FM.ways.sigillum[0]);
    f.innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="Návrh pečate fakulty">${FM.art.seal(100, 100, 190, { disc: 'var(--body)' })}</svg>`;
  }

  /* ── kusovky: solo pieces outside the collections ─────────────────────────── */
  function buildSolo() {
    const items = P.filter(p => p.col === 'solo');
    const sec = $('#kusovky');
    if (!sec || !items.length) return;
    sec.hidden = false;
    const grid = $('#solo-grid');
    items.forEach(p => grid.appendChild(makeCard(p)));
    $$('[data-nav-solo]').forEach(a => { a.hidden = false; });
  }

  /* ── crest proposals ──────────────────────────────────────────────────────── */
  const CRESTS = [
    { v: 'A', name: 'Kniha a páska', text: 'V tyrkysovom poli strieborná otvorená kniha. V striebornej hlave štítu páska s číslom 11111010011, teda rok 2003 dvojkovo. Rovnaké symboly ako na pečati.' },
    { v: 'B', name: 'Krokva', text: 'V tyrkysovom poli strieborná krokva, ktorá sa číta aj ako veľká lambda. Nad ňou dva zlaté bity, jednotka a nula, pod ňou zlatá kniha. Klasická univerzitná schéma.' },
    { v: 'C', name: 'Kľúč', text: 'Štít delený na tyrkysovú a čiernu, cez deliacu čiaru strieborný kľúč. Zuby má vyrezané podľa čísla 2003 v dvojkovej sústave. Kľúč k poznaniu aj šifrovací kľúč.' },
  ];
  function buildCrests() {
    const sec = $('#crests');
    if (!sec || !FM.art.crest) return;
    sec.hidden = false;
    const row = $('#crest-row'), used = FM.CREST || 'A';
    CRESTS.forEach(c => {
      let art = '';
      try { art = FM.art.crest(130, 150, 268, { v: c.v }); } catch (e) { console.error('[FM] crest', c.v, e); return; }
      row.appendChild(h(`<figure class="crest${c.v === used ? ' is-used' : ''}">
        <svg viewBox="0 0 260 300" role="img" aria-label="Návrh erbu ${c.v}: ${esc(c.name)}">${art}</svg>
        <figcaption><span class="crest-tag">Návrh ${c.v}${c.v === used ? ' · na produktoch' : ''}</span><b>${esc(c.name)}</b><span>${esc(c.text)}</span></figcaption>
      </figure>`));
    });
  }

  /* ── boot ─────────────────────────────────────────────────────────────────── */
  buildRail();
  buildCollections();
  buildSolo();
  buildFilters();
  buildSeal();
  buildCrests();
  renderCart();
  route();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { railAligned = false; alignRail(); });
  window.FMshop = { P, cart: () => cart, setFilter };
})();
