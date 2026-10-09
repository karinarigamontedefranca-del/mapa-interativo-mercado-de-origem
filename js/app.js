/* ==========================================================
   MERCADO DE ORIGEM · Mapa interativo · aplicação
   Parâmetros de URL:
     ?totem=t1|t2|t3|tr|tg  -> em qual totem a tela está ("Você está aqui")
     ?modo=totem            -> volta à tela de descanso após 90 s sem uso
     ?loja=<id>             -> abre direto em uma loja (link compartilhado)
   ========================================================== */
(function (D, M) {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  const TOTEM = D.totems[params.get('totem')] || D.totems.t1;
  const KIOSK = params.get('modo') === 'totem' || params.has('totem');
  const ORDER = D.floors.map(f => f.id);               // g,1,2,3,r
  const S = { floor: TOTEM.f, mode: '2d', s: 1, tx: 0, ty: 0, k: 1, cat: null, amen: null, q: '', sel: null, route: null, focus: null };
  const stage = $('#stage'), zoomer = $('#zoomer'), building = $('#building');

  /* ---------- helpers ---------- */
  const icon = M.icon, esc = M.esc;
  const floorName = id => M.floorById(id).nome;
  const floorHTML = id => esc(floorName(id)).replace('&amp;', '<em>&amp;</em>');
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const svgOf = f => building.querySelector('.floor[data-f="' + f + '"] svg');
  const stopWords = ['de', 'do', 'da', 'a', 'o', 'e', 'das', 'dos'];
  function initials(n) {
    const w = n.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(x => x && stopWords.indexOf(x.toLowerCase()) < 0);
    return (w[0] ? w[0][0] : '') + (w[1] ? w[1][0] : '');
  }
  function thumbHTML(u, big) {
    const url = M.imgUrl(u.img);
    if (url) return '<img src="' + url + '" alt="" loading="lazy">';
    const c = D.cats[u.cat] || D.cats.servicos;
    return '<div class="mono" style="background:' + c.cor + '"><span>' + esc(initials(u.n)) + '</span>' + (big ? icon(c.icon) : '') + '</div>';
  }
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg, ic) {
    const t = $('#toast');
    t.innerHTML = (ic ? icon(ic) : '') + '<span>' + msg + '</span>';
    t.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('on'), 2800);
  }

  /* ================= MONTAGEM ================= */
  // andares
  ORDER.forEach(id => {
    const f = M.floorById(id), d = document.createElement('div');
    d.className = 'floor'; d.dataset.f = id;
    d.innerHTML = '<div class="ftag"><b>' + f.short + '</b>' + esc(f.nome) + '</div>' + M.render(id);
    building.appendChild(d);
  });
  // painel de andares (de cima para baixo, como num elevador)
  $('#floorbar').innerHTML = ORDER.slice().reverse().map(id =>
    '<button class="fbtn" data-f="' + id + '" aria-label="' + esc(floorName(id)) + '">' + M.floorById(id).short + (id === TOTEM.f ? '<i class="here"></i>' : '') + '<span class="cnt" hidden></span></button>').join('');

  // chips
  const AMEN_CHIPS = ['wc', 'elevador', 'bebedouro', 'pet', 'fraldario', 'pcd'];
  $('#chips').innerHTML =
    '<span class="chip-label">Categorias</span>' +
    '<button class="chip" data-cat="ancora">' + icon('star') + 'Âncoras</button>' +
    Object.keys(D.cats).filter(k => k !== 'embreve').map(k => '<button class="chip" data-cat="' + k + '"><i class="dot" style="background:' + D.cats[k].cor + '"></i>' + D.cats[k].nome + '</button>').join('') +
    '<span class="chip-sep"></span><span class="chip-label">Serviços do prédio</span>' +
    AMEN_CHIPS.map(t => '<button class="chip" data-amen="' + t + '">' + icon(D.amenTypes[t].icon) + D.amenTypes[t].nome + '</button>').join('');

  /* ================= VISTA: layout, zoom e 3D ================= */
  function pads() {
    const r = remPx(), portrait = innerHeight > innerWidth || innerWidth <= 900;
    if (innerWidth <= 600) return { l: r * .6, r: r * .6, t: r * 4.6, b: r * 5.4 };
    return portrait ? { l: r * 1, r: r * 5.2, t: r * 7.2, b: r * 5.6 } : { l: r * 2, r: r * 7, t: r * 8, b: r * 5.5 };
  }
  function layout() {
    const W = stage.clientWidth, H = stage.clientHeight, p = pads();
    const aw = Math.max(100, W - p.l - p.r), ah = Math.max(100, H - p.t - p.b);
    S.k = Math.min(aw / 1000, ah / 720);
    S.area = { x: p.l + aw / 2, y: p.t + ah / 2, w: aw, h: ah };
    S.bx = S.area.x - 500 * S.k; S.by = S.area.y - 360 * S.k;
    zoomer.style.width = 1000 * S.k + 'px'; zoomer.style.height = 720 * S.k + 'px';
    building.style.fontSize = (S.k * 10) + 'px';
    if (S.focus) focusOn(S.focus.x, S.focus.y, S.focus.s, true); else resetView(true);
    applyFloors();
  }
  function applyView(instant) {
    zoomer.classList.toggle('instant', !!instant);
    if (S.mode === '3d') zoomer.style.transform = 'translate(' + S.bx + 'px,' + S.by + 'px)';
    else zoomer.style.transform = 'translate(' + S.tx + 'px,' + S.ty + 'px) scale(' + S.s + ')';
    if (instant) { void zoomer.offsetWidth; requestAnimationFrame(() => zoomer.classList.remove('instant')); }
  }
  function clampView() {
    const w = 1000 * S.k * S.s, h = 720 * S.k * S.s, a = S.area;
    S.tx = Math.min(a.x, Math.max(a.x - w, S.tx));
    S.ty = Math.min(a.y, Math.max(a.y - h, S.ty));
  }
  function resetView(instant) { S.s = 1; S.tx = S.bx; S.ty = S.by; S.focus = null; applyView(instant); }
  function focusOn(x, y, s, instant) {
    S.s = s; S.tx = S.area.x - x * S.k * s; S.ty = S.area.y - y * S.k * s;
    S.focus = { x, y, s }; clampView(); applyView(instant);
  }
  function zoomAt(px, py, factor) {
    if (S.mode === '3d') return;
    const s2 = Math.min(4, Math.max(1, S.s * factor)), r = s2 / S.s;
    S.tx = px - (px - S.tx) * r; S.ty = py - (py - S.ty) * r; S.s = s2; S.focus = null;
    clampView(); applyView(true);
  }
  function fitPoints(pts) {
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    const s = Math.min(1.6, Math.max(1, Math.min(S.area.w / ((x1 - x0 + 160) * S.k), S.area.h / ((y1 - y0 + 160) * S.k))));
    focusOn((x0 + x1) / 2, (y0 + y1) / 2, s);
  }

  function applyFloors() {
    const c = ORDER.indexOf(S.floor), gap = S.k * 185;
    $$('.floor').forEach(el => {
      const i = ORDER.indexOf(el.dataset.f);
      el.classList.toggle('cur', i === c);
      if (S.mode === '3d') {
        el.style.transform = 'translateZ(' + ((i - 2) * gap + (i === c ? S.k * 30 : 0)) + 'px)';
        el.style.opacity = 1;
      } else {
        el.style.transform = 'translateZ(' + (i === c ? 0 : (i > c ? gap * 1.4 : -gap * 1.2)) + 'px)';
        el.style.opacity = i === c ? 1 : 0;
      }
    });
    building.style.transform = S.mode === '3d' ? 'translate(' + S.k * 40 + 'px,' + S.k * 60 + 'px) rotateX(57deg) rotateZ(-34deg) scale(.55)' : 'none';
    $('#mapzone').classList.toggle('mode3d', S.mode === '3d');
    $('#b3d').classList.toggle('on', S.mode === '3d');
    $('#b3d').querySelector('b').textContent = S.mode === '3d' ? 'Ver planta' : 'Vista 3D';
    $('#b3d').querySelector('span').innerHTML = icon(S.mode === '3d' ? 'plan' : 'cube');
  }

  function setMode(m) {
    S.mode = m;
    if (m === '3d') { S.focus = null; }
    applyFloors(); applyView(false); floorHead();
  }

  function setFloor(f, keepView) {
    const changed = f !== S.floor;
    S.floor = f;
    if (S.mode === '3d') S.mode = '2d';
    applyFloors();
    if (!keepView) resetView();
    else applyView();
    $$('.fbtn').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    if (changed || true) floorHead();
    legend();
  }

  function floorHead() {
    const fh = $('#floorhead'), f = M.floorById(S.floor);
    fh.classList.remove('swap'); void fh.offsetWidth; fh.classList.add('swap');
    if (S.mode === '3d') {
      fh.innerHTML = '<div class="fh-k">Vista do prédio</div><h2>Seis pavimentos, <em>um destino</em></h2><p>Toque em um andar para entrar na planta.</p>';
    } else {
      fh.innerHTML = '<div class="fh-k">' + (S.floor === TOTEM.f ? 'Você está no' : 'Explorando o') + '</div><h2>' + floorHTML(S.floor) + '</h2><p>' + esc(f.tema) + '</p>';
    }
  }

  function legend() {
    const cats = {};
    D.units.filter(u => u.f === S.floor && M.isListed(u)).forEach(u => { cats[u.cat] = 1; });
    let h = Object.keys(cats).map(k => '<span><i style="background:' + D.cats[k].soft + ';border:1.5px solid ' + D.cats[k].cor + '"></i>' + D.cats[k].nome + '</span>').join('');
    if (D.units.some(u => u.f === S.floor && u.anchor)) h += '<span>' + icon('star') + 'Loja âncora</span>';
    if (S.floor === TOTEM.f) h += '<span><i style="background:#e05a47;border-radius:50%"></i>Você está aqui</span>';
    $('#legend').innerHTML = h;
  }

  /* ---------- "Você está aqui" ---------- */
  function drawYou() {
    const svg = svgOf(TOTEM.f), g = svg.querySelector('.layer-pin');
    const x = TOTEM.x, y = TOTEM.y;
    g.insertAdjacentHTML('beforeend',
      '<g class="you"><circle class="pulse" cx="' + x + '" cy="' + y + '" r="12" fill="#e05a47" opacity=".5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#e05a47" stroke="#fff" stroke-width="3.5"/>' +
      '<g transform="translate(' + (x + 18) + ',' + (y - 13) + ')"><rect width="128" height="26" rx="13" fill="#1A2819"/>' +
      '<text x="64" y="17.5" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="1.6" fill="#F5EBDD">VOCÊ ESTÁ AQUI</text></g></g>');
  }

  /* ================= FILTROS E LISTA ================= */
  function matchesUnit(u) {
    if (!M.isListed(u)) return false;
    if (S.cat === 'ancora') return !!u.anchor;
    if (S.cat) return u.cat === S.cat;
    if (S.q) {
      const words = M.norm([u.n, u.tag, u.kw, D.cats[u.cat].nome, u.ig].join(' ')).split(/[^a-z0-9]+/);
      return M.norm(S.q).split(/\s+/).filter(Boolean).every(t => words.some(w => w.indexOf(t) === 0));
    }
    return false;
  }
  function filtering() { return !!(S.cat || S.q); }

  function paintMap() {
    const on = filtering(), counts = {};
    $$('.plan').forEach(svg => {
      svg.classList.toggle('filtering', on);
      svg.classList.toggle('amen-filter', !!S.amen);
      svg.querySelectorAll('.unit').forEach(g => {
        const u = M.unitById(g.dataset.id), m = on && matchesUnit(u);
        g.classList.toggle('match', m);
        if (m) counts[u.f] = (counts[u.f] || 0) + 1;
      });
      svg.querySelectorAll('.amen').forEach(g => {
        const m = !!S.amen && g.dataset.t === S.amen;
        g.classList.toggle('match', m);
        if (m) { const f = svg.dataset.floor; counts[f] = (counts[f] || 0) + 1; }
      });
    });
    $$('.fbtn').forEach(b => {
      const c = b.querySelector('.cnt'), n = counts[b.dataset.f];
      c.hidden = !(on || S.amen) || !n; c.textContent = n || '';
    });
    return counts;
  }

  function itemUnit(u) {
    const f = M.floorById(u.f);
    return '<button class="item" data-u="' + u.id + '"><span class="thumb">' + thumbHTML(u) + '</span>' +
      '<span class="item-txt"><b>' + esc(u.n) + (u.anchor ? '<span class="star-s">' + icon('star') + '</span>' : '') + '</b><small>' + esc(u.tag || D.cats[u.cat].nome) + '</small></span>' +
      '<span class="fl">' + f.short + ' · ' + u.code + '</span></button>';
  }
  function itemRef(r) {
    return '<button class="item" data-ref="' + r.id + '"><span class="thumb ref-thumb">' + icon(r.icon) + '</span>' +
      '<span class="item-txt"><b>' + esc(r.n) + '</b><small>Ponto de referência</small></span><span class="fl">' + M.floorById(r.f).short + '</span></button>';
  }
  function itemAmen(a, extra) {
    const t = D.amenTypes[a.t];
    return '<button class="item" data-a="' + D.amen.indexOf(a) + '"><span class="thumb amen-thumb">' + icon(t.icon) + '</span>' +
      '<span class="item-txt"><b>' + esc(a.label || t.nome) + '</b><small>' + esc(floorName(a.f)) + (extra ? ' · ' + extra : '') + '</small></span><span class="fl">' + M.floorById(a.f).short + '</span></button>';
  }

  function renderList() {
    const v = $('#viewList');
    let h = '';
    if (S.amen) {
      const t = D.amenTypes[S.amen];
      const list = D.amen.filter(a => a.t === S.amen).map(a => ({ a, e: M.estimate(M.route(TOTEM, a)) }))
        .sort((p, q) => p.e.m - q.e.m);
      h += '<div class="sec-title"><h3>' + esc(t.nome) + '</h3><span>' + list.length + ' no prédio</span></div>';
      h += list.map((x, i) => itemAmen(x.a, (i === 0 ? 'mais próximo · ' : '') + '≈ ' + x.e.min + ' min a pé')).join('');
    } else if (filtering()) {
      const us = D.units.filter(matchesUnit);
      let refs = [], amens = [];
      if (S.q) {
        const q = M.norm(S.q);
        refs = D.refs.filter(r => M.norm(r.n + ' ' + r.d).indexOf(q) >= 0);
        amens = Object.keys(D.amenTypes).filter(k => M.norm(D.amenTypes[k].nome + ' ' + k + (k === 'wc' ? ' banheiro toalete' : '')).indexOf(q) >= 0);
      }
      const title = S.q ? 'Resultados para <em>“' + esc(S.q) + '”</em>' : (S.cat === 'ancora' ? 'Lojas <em>âncora</em>' : esc(D.cats[S.cat].nome));
      h += '<div class="sec-title"><h3>' + title + '</h3><span>' + (us.length + refs.length + amens.length) + ' encontrados</span></div>';
      if (!us.length && !refs.length && !amens.length) h += '<div class="empty"><b>Nada por aqui…</b>Tente outro nome, produto ou categoria.</div>';
      const ti = ORDER.indexOf(TOTEM.f);
      ORDER.slice().sort((a, b) => Math.abs(ORDER.indexOf(a) - ti) - Math.abs(ORDER.indexOf(b) - ti) || ORDER.indexOf(a) - ORDER.indexOf(b)).forEach(f => {
        const fu = us.filter(u => u.f === f);
        if (!fu.length) return;
        h += '<div class="group-h">' + esc(floorName(f)) + '</div>' + fu.map(itemUnit).join('');
      });
      if (amens.length) h += '<div class="group-h">Serviços do prédio</div>' + amens.map(k => '<button class="item" data-amenchip="' + k + '"><span class="thumb amen-thumb">' + icon(D.amenTypes[k].icon) + '</span><span class="item-txt"><b>' + D.amenTypes[k].nome + '</b><small>Ver os mais próximos</small></span></button>').join('');
      if (refs.length) h += '<div class="group-h">Pontos de referência</div>' + refs.map(itemRef).join('');
    } else {
      const anchors = D.units.filter(u => u.anchor);
      h += '<div class="sec-title"><h3>Lojas <em>âncora</em></h3><span>' + anchors.length + ' destaques</span></div>';
      h += '<div class="feat">' + anchors.map(u => '<button class="feat-card" data-u="' + u.id + '">' + thumbHTML(u) +
        '<span class="badge">' + icon('star') + M.floorById(u.f).short + ' andar</span><div><b>' + esc(u.n) + '</b><small>' + esc(u.tag) + '</small></div></button>').join('') + '</div>';
      h += '<div class="sec-title"><h3>Pontos de <em>referência</em></h3></div>' + D.refs.filter(r => r.id !== 'jardim2' && r.id !== 'jardim3').map(itemRef).join('');
      h += '<div class="sec-title" style="margin-top:1.4rem"><h3>Todas as <em>lojas</em></h3><span>' + D.units.filter(M.isListed).length + ' espaços</span></div>';
      Object.keys(D.cats).filter(k => k !== 'embreve').forEach(k => {
        const cu = D.units.filter(u => M.isListed(u) && u.cat === k).sort((a, b) => a.n.localeCompare(b.n));
        if (!cu.length) return;
        h += '<div class="group-h"><i class="dot" style="background:' + D.cats[k].cor + '"></i>' + D.cats[k].nome + '</div>' + cu.map(itemUnit).join('');
      });
    }
    v.innerHTML = h;
    v.scrollTop = 0;
  }

  function showList() {
    $('#viewDetail').hidden = true; $('#viewList').hidden = false;
    sheetSize('');
    paintMap(); renderList();
  }

  /* ================= SELEÇÃO ================= */
  function clearSel() {
    $$('.plan').forEach(s => { s.classList.remove('picking'); s.querySelectorAll('.unit.sel').forEach(g => g.classList.remove('sel')); });
    $$('.layer-pin .pin').forEach(p => p.remove());
    S.sel = null;
  }
  function dropPin(f, x, y) {
    const g = svgOf(f).querySelector('.layer-pin');
    g.insertAdjacentHTML('beforeend', '<g class="pin"><ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="10" ry="4" fill="#1A2819" opacity=".25"/>' +
      '<circle class="pulse" cx="' + x + '" cy="' + y + '" r="14" fill="#B68D40" opacity=".45"/>' +
      '<path class="pin-drop" d="M' + x + ' ' + y + 'c-4-8-14-13-14-23a14 14 0 1 1 28 0c0 10-10 15-14 23z" fill="#B68D40" stroke="#fff" stroke-width="3"/>' +
      '<circle class="pin-drop" cx="' + x + '" cy="' + (y - 23) + '" r="5.5" fill="#fff"/></g>');
  }

  function nearLandmark(f, x, y) {
    const c = D.refs.filter(r => r.f === f).map(r => ({ n: r.n, x: r.x, y: r.y, pre: 'Perto ' + (/^(Praça|Torre|Claraboia|Área)/.test(r.n) ? 'da ' : 'do ') }))
      .concat([{ n: 'elevadores', x: 670, y: 310, pre: 'Perto dos ' }, { n: 'escadaria central', x: 500, y: 310, pre: 'Perto da ' }]);
    c.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    return c[0].pre + c[0].n;
  }

  function selectUnit(id, fromList) {
    const u = M.unitById(id);
    if (!u || !M.isListed(u)) return;
    if (S.route && S.route.key !== 'u:' + id) clearRoute();
    clearSel();
    S.sel = { t: 'u', id };
    setFloor(u.f, true);
    const svg = svgOf(u.f);
    svg.classList.add('picking');
    svg.querySelector('.unit[data-id="' + id + '"]').classList.add('sel');
    const dp = M.doorPoint(u); dropPin(u.f, dp.side === 'c' ? dp.x : dp.x + (dp.side === 'r' ? -26 : dp.side === 'l' ? 26 : 0), dp.side === 'b' ? dp.y - 8 : dp.side === 't' ? dp.y + 46 : dp.y + 18);
    const big = u.w * u.h > 40000;
    focusOn(u.x + u.w / 2, u.y + u.h / 2, big ? 1.25 : 1.75);
    detailUnit(u);
    if (!KIOSK) history.replaceState(null, '', '?loja=' + id);
  }

  function detailShell(heroHTML, badge, info, actions, extra) {
    const v = $('#viewDetail');
    v.innerHTML = '<button class="back" id="back">' + icon('back') + 'Voltar</button>' +
      '<div class="d-detail-grid"><div class="d-hero">' + heroHTML + (badge ? '<span class="badge">' + badge + '</span>' : '') + '</div>' +
      '<div class="d-info">' + info + '<div class="d-actions">' + actions + '</div></div></div>' + (extra || '');
    $('#viewList').hidden = true; v.hidden = false;
    v.style.animation = 'none'; void v.offsetWidth; v.style.animation = '';
    v.scrollTop = 0;
    sheetSize('tall');
  }

  function routeBox() {
    if (!S.route) return '';
    const e = S.route.est;
    return '<div class="d-route"><div class="eta"><b>≈ ' + e.min + ' min</b><span>' + e.m + ' m a pé · siga a linha dourada</span></div><ol class="steps">' +
      S.route.steps.map(s => '<li><span>' + s + '</span></li>').join('') + '</ol></div>';
  }

  function detailUnit(u) {
    const c = D.cats[u.cat], routed = S.route && S.route.key === 'u:' + u.id;
    const near = D.units.filter(o => o.f === u.f && o.id !== u.id && M.isListed(o) && o.kind !== 'zona')
      .sort((a, b) => Math.hypot(a.x + a.w / 2 - u.x - u.w / 2, a.y + a.h / 2 - u.y - u.h / 2) - Math.hypot(b.x + b.w / 2 - u.x - u.w / 2, b.y + b.h / 2 - u.y - u.h / 2)).slice(0, 3);
    detailShell(
      thumbHTML(u, true),
      u.anchor ? icon('star') + 'Loja âncora · proposta' : (u.kind === 'zona' ? icon('sparkle') + 'Espaço do Mercado' : ''),
      '<span class="d-cat"><i class="dot" style="background:' + c.cor + '"></i>' + esc(c.nome) + '</span>' +
      '<h2 class="d-name">' + esc(u.n) + '</h2><p class="d-tag">' + esc(u.tag || '') + '</p>' +
      '<div class="d-where"><span>' + icon('stairs') + esc(floorName(u.f)) + '</span>' + (u.kind === 'zona' ? '' : '<span>' + icon('door') + 'Loja ' + u.code + '</span>') +
      '<span>' + icon('leaf') + esc(nearLandmark(u.f, u.x + u.w / 2, u.y + u.h / 2)) + '</span></div>' +
      '<p class="d-desc">' + esc(u.d || '') + '</p>',
      '<button class="btn btn-gold' + (routed ? ' active' : '') + '" id="goRoute">' + icon(routed ? 'x' : 'route') + (routed ? 'Encerrar rota' : 'Como chegar daqui') + '</button>' +
      '<button class="btn" id="share">' + icon('share') + 'Compartilhar</button>' +
      (u.ig ? '<a class="btn" href="https://www.instagram.com/' + u.ig + '/" target="_blank" rel="noopener">' + icon('instagram') + '@' + esc(u.ig.length > 16 ? u.ig.slice(0, 15) + '…' : u.ig) + '</a>'
        : '<button class="btn" id="seeMap">' + icon('locate') + 'Ver no mapa</button>'),
      routeBox() + (near.length ? '<div class="near"><div class="group-h">Bem pertinho</div>' + near.map(itemUnit).join('') + '</div>' : '')
    );
    $('#goRoute').onclick = () => {
      if (routed) { clearRoute(); detailUnit(u); return; }
      startRoute(M.targetOf(u), u.n, 'u:' + u.id, u.deck); detailUnit(u);
    };
    $('#share').onclick = () => share('?loja=' + u.id, u.n);
    const sm = $('#seeMap'); if (sm) sm.onclick = () => { setFloor(u.f, true); focusOn(u.x + u.w / 2, u.y + u.h / 2, 1.75); };
  }

  function selectRef(id) {
    const r = D.refs.find(x => x.id === id);
    if (S.route && S.route.key !== 'r:' + id) clearRoute();
    clearSel(); S.sel = { t: 'r', id };
    setFloor(r.f, true); focusOn(r.x, r.y, 1.6);
    const routed = S.route && S.route.key === 'r:' + id;
    detailShell('<img src="' + M.imgUrl(r.img) + '" alt="">', icon(r.icon) + 'Ponto de referência',
      '<span class="d-cat"><i class="dot" style="background:#B68D40"></i>Ponto de referência</span><h2 class="d-name">' + esc(r.n) + '</h2>' +
      '<div class="d-where"><span>' + icon('stairs') + esc(floorName(r.f)) + '</span></div><p class="d-desc">' + esc(r.d) + '</p>',
      '<button class="btn btn-gold' + (routed ? ' active' : '') + '" id="goRoute">' + icon(routed ? 'x' : 'route') + (routed ? 'Encerrar rota' : 'Como chegar daqui') + '</button>' +
      '<button class="btn" id="share" style="grid-column:1/-1">' + icon('share') + 'Compartilhar</button>', routeBox());
    $('#goRoute').onclick = () => { if (routed) { clearRoute(); } else { startRoute({ f: r.f, x: r.x, y: r.y }, r.n, 'r:' + id); } selectRef(id); };
    $('#share').onclick = () => share('?ref=' + id, r.n);
  }

  function selectAmen(i) {
    const a = D.amen[i], t = D.amenTypes[a.t];
    clearSel(); S.sel = { t: 'a', i };
    const same = D.amen.filter(x => x.t === a.t && x !== a).map(x => ({ x, e: M.estimate(M.route(TOTEM, x)) })).sort((p, q) => p.e.m - q.e.m).slice(0, 4);
    startRoute({ f: a.f, x: a.x, y: a.y }, a.label || t.nome, 'a:' + i);
    detailShell('<div class="mono" style="background:#3A4D39"><span>' + icon(t.icon) + '</span></div>', icon('locate') + 'Serviço do prédio',
      '<span class="d-cat"><i class="dot" style="background:#3A4D39"></i>Serviços do prédio</span><h2 class="d-name">' + esc(a.label || t.nome) + '</h2>' +
      '<div class="d-where"><span>' + icon('stairs') + esc(floorName(a.f)) + '</span><span>' + icon('leaf') + esc(nearLandmark(a.f, a.x, a.y)) + '</span></div>',
      '<button class="btn btn-gold active" id="goRoute">' + icon('x') + 'Encerrar rota</button>',
      routeBox() + (same.length ? '<div class="near"><div class="group-h">Outros ' + esc(t.nome.toLowerCase()) + '</div>' + same.map(s => itemAmen(s.x, '≈ ' + s.e.min + ' min a pé')).join('') + '</div>' : ''));
    $('#viewDetail .mono span').style.cssText = 'display:grid;place-items:center;transform:scale(2.6)';
    $('#goRoute').onclick = () => { clearRoute(); clearSel(); showList(); setFloor(S.floor, false); };
  }

  /* ================= ROTAS ================= */
  let legTimer;
  function startRoute(dest, name, key, deck) {
    clearRoute();
    const legs = M.route(TOTEM, dest), est = M.estimate(legs);
    const ti = ORDER.indexOf(TOTEM.f), di = ORDER.indexOf(dest.f);
    const steps = ['Você está aqui: <b>' + esc(TOTEM.n) + '</b>, ' + esc(floorName(TOTEM.f)) + '.'];
    if (legs.length > 1) {
      steps.push('Siga até os <b>elevadores</b>, ao lado do átrio (ou use a escadaria central).');
      steps.push((di > ti ? 'Suba' : 'Desça') + ' até o <b>' + esc(floorName(dest.f)) + '</b>.');
      steps.push('Ao sair do elevador, siga a linha dourada até <b>' + esc(name) + '</b>.');
    } else {
      if (deck) steps.push('Siga pelo corredor sul e atravesse a <b>passagem para o deck</b>.');
      steps.push('Siga a linha dourada até <b>' + esc(name) + '</b>.');
    }
    S.route = { legs, est, steps, key, name, leg: 0, dest };
    legs.forEach((l, i) => drawLeg(l, i, legs.length, dest));
    showLeg(0);
    if (legs.length > 1) legTimer = setTimeout(() => { if (S.route && S.route.key === key) showLeg(1, true); }, 3600);
  }
  function drawLeg(l, i, n, dest) {
    const g = svgOf(l.f).querySelector('.layer-route');
    const d = 'M' + l.pts.map(p => p.x + ' ' + p.y).join('L');
    const last = l.pts[l.pts.length - 1], first = l.pts[0];
    let h = '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
      '<path class="route-line" style="--len:' + Math.ceil(l.len + 10) + '" d="' + d + '" fill="none" stroke="#B68D40" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="route-ants" d="' + d + '" fill="none" stroke="#1A2819" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>' +
      '<circle r="6.5" fill="#1A2819" stroke="#fff" stroke-width="2.5"><animateMotion dur="' + Math.max(2.5, l.len / 110).toFixed(1) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    if (i > 0) h += '<circle cx="' + first.x + '" cy="' + first.y + '" r="9" fill="#3A4D39" stroke="#fff" stroke-width="3"/>';
    if (i < n - 1) {
      const up = ORDER.indexOf(dest.f) > ORDER.indexOf(l.f);
      const txt = (up ? 'SUBA AO ' : 'DESÇA AO ') + M.floorById(dest.f).nome.toUpperCase().replace(' & DECK', '');
      const w = txt.length * 7.4 + 26;
      h += '<g transform="translate(' + (last.x - w / 2) + ',' + (last.y - 62) + ')"><rect width="' + w + '" height="28" rx="14" fill="#B68D40"/><text x="' + w / 2 + '" y="18.5" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1.2" fill="#1A2819">' + txt + '</text></g>';
    }
    g.innerHTML = h;
  }
  function showLeg(i, auto) {
    if (!S.route) return;
    S.route.leg = i;
    const l = S.route.legs[i];
    setFloor(l.f, true);
    // reinicia animação do traçado
    const g = svgOf(l.f).querySelector('.layer-route');
    g.querySelectorAll('.route-line').forEach(p => { p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = ''; });
    g.querySelectorAll('.route-ants').forEach(p => { p.classList.remove('go'); setTimeout(() => p.classList.add('go'), 30); });
    fitPoints(l.pts);
    if (auto) toast((ORDER.indexOf(l.f) > ORDER.indexOf(S.route.legs[0].f) ? 'Suba' : 'Desça') + ' de elevador até o ' + floorName(l.f), 'elevator');
    routeBar();
  }
  function routeBar() {
    const rb = $('#routebar'), r = S.route;
    $('#mapzone').classList.toggle('routing', !!r);
    if (!r) { rb.hidden = true; return; }
    rb.hidden = false;
    rb.innerHTML = '<span class="rb-ic">' + icon('walk') + '</span><span class="rb-txt"><b>' + esc(r.name) + '</b><small>≈ ' + r.est.min + ' min · ' + r.est.m + ' m a pé</small></span>' +
      (r.legs.length > 1 ? '<span class="rb-legs">' + r.legs.map((l, i) => '<button data-leg="' + i + '" class="' + (i === r.leg ? 'on' : '') + '">' + (i + 1) + '. ' + esc(M.floorById(l.f).short) + ' andar</button>').join('') + '</span>' : '') +
      '<button class="rb-x" aria-label="Encerrar rota">' + icon('x') + '</button>';
    rb.querySelectorAll('[data-leg]').forEach(b => b.onclick = () => { clearTimeout(legTimer); showLeg(+b.dataset.leg); });
    rb.querySelector('.rb-x').onclick = () => {
      clearRoute();
      if (S.sel && S.sel.t === 'u') detailUnit(M.unitById(S.sel.id));
      else if (S.sel && S.sel.t === 'r') selectRef(S.sel.id);
      else if (S.sel && S.sel.t === 'a') { clearSel(); showList(); }
    };
  }
  function clearRoute() {
    clearTimeout(legTimer);
    $$('.layer-route').forEach(g => { g.innerHTML = ''; });
    S.route = null; routeBar();
  }

  /* ================= COMPARTILHAR ================= */
  function share(qs, title) {
    const url = location.origin + location.pathname + qs;
    if (navigator.share && matchMedia('(pointer:coarse)').matches && !KIOSK) {
      navigator.share({ title: title + ' · Mercado de Origem', url }).catch(() => {});
      return;
    }
    const done = () => toast('Link copiado: ' + title, 'check');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, () => toast(url, 'copy'));
    else {
      const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast(url, 'copy'); }
      ta.remove();
    }
  }

  /* ================= EVENTOS ================= */
  // chips
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const cat = b.dataset.cat, am = b.dataset.amen;
    clearRoute(); clearSel();
    if (cat) { S.amen = null; S.cat = S.cat === cat ? null : cat; }
    if (am) { S.cat = null; S.amen = S.amen === am ? null : am; }
    S.q = ''; $('#q').value = ''; $('.search').classList.remove('has');
    $$('.chip').forEach(c => c.classList.toggle('on', (!!c.dataset.cat && c.dataset.cat === S.cat) || (!!c.dataset.amen && c.dataset.amen === S.amen)));
    showList();
    // vai para o andar com mais resultados
    const counts = paintMap();
    if (cat || am) {
      const best = Object.keys(counts).sort((a, b) => (counts[b] - counts[a]) || (a === TOTEM.f ? -1 : 1))[0];
      if (best && !counts[S.floor]) setFloor(best); else setFloor(S.floor);
    } else setFloor(S.floor);
    if (!KIOSK) history.replaceState(null, '', location.pathname + (params.get('totem') ? '?totem=' + params.get('totem') : ''));
  });

  // busca
  let qT;
  $('#q').addEventListener('input', e => {
    clearTimeout(qT);
    qT = setTimeout(() => {
      S.q = e.target.value.trim(); S.cat = null; S.amen = null;
      $('.search').classList.toggle('has', !!S.q);
      $$('.chip').forEach(c => c.classList.remove('on'));
      clearSel(); showList();
      const counts = paintMap();
      if (S.q && !counts[S.floor]) { const best = Object.keys(counts)[0]; if (best) setFloor(best); }
    }, 160);
  });
  $('#qx').addEventListener('click', () => { $('#q').value = ''; $('#q').dispatchEvent(new Event('input')); });

  // listas
  $('.sheet').addEventListener('click', e => {
    const it = e.target.closest('[data-u],[data-ref],[data-a],[data-amenchip]');
    if (e.target.closest('#back')) { clearRoute(); clearSel(); showList(); setFloor(S.floor, false); return; }
    if (!it) return;
    if (it.dataset.u) selectUnit(it.dataset.u, true);
    else if (it.dataset.ref) selectRef(it.dataset.ref);
    else if (it.dataset.a) selectAmen(+it.dataset.a);
    else if (it.dataset.amenchip) document.querySelector('.chip[data-amen="' + it.dataset.amenchip + '"]').click();
  });

  // andares
  $('#floorbar').addEventListener('click', e => {
    const b = e.target.closest('.fbtn'); if (!b) return;
    if (S.route) clearTimeout(legTimer);
    setFloor(b.dataset.f);
  });

  // controles
  $('#b3d').onclick = () => setMode(S.mode === '3d' ? '2d' : '3d');
  $('#bIn').onclick = () => zoomAt(S.area.x, S.area.y, 1.4);
  $('#bOut').onclick = () => zoomAt(S.area.x, S.area.y, 1 / 1.4);
  $('#bLoc').onclick = () => { setFloor(TOTEM.f, true); focusOn(TOTEM.x + 150, TOTEM.y + 60, 1.6); toast('Você está aqui: ' + TOTEM.n, 'locate'); };
  $('#homeBtn').onclick = () => resetAll(true);

  // arrastar / pinça / roda do mouse no mapa
  const ptrs = new Map();
  let downT = null, downXY = null, moved = false, pinch0 = null;
  stage.addEventListener('pointerdown', e => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { downT = e.target; downXY = { x: e.clientX, y: e.clientY }; moved = false; }
    if (ptrs.size === 2) {
      const [a, b] = Array.from(ptrs.values());
      pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), s: S.s }; moved = true;
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const prev = ptrs.get(e.pointerId), cur = { x: e.clientX, y: e.clientY };
    ptrs.set(e.pointerId, cur);
    if (S.mode === '3d') return;
    if (ptrs.size === 2 && pinch0) {
      const [a, b] = Array.from(ptrs.values()), r = stage.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch0.s * d / pinch0.d) / S.s);
      return;
    }
    if (ptrs.size === 1) {
      if (!moved && Math.hypot(cur.x - downXY.x, cur.y - downXY.y) > 7) { moved = true; stage.classList.add('drag'); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
      if (moved) { S.tx += cur.x - prev.x; S.ty += cur.y - prev.y; S.focus = null; clampView(); applyView(true); }
    }
  });
  const up = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch0 = null;
    if (ptrs.size === 0) {
      stage.classList.remove('drag');
      if (!moved && downT) tapMap(downT);
      downT = null;
    }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); stage.classList.remove('drag'); });
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016));
  }, { passive: false });

  function tapMap(t) {
    if (S.mode === '3d') {
      const fl = t.closest('.floor'); if (fl) { setFloor(fl.dataset.f); }
      return;
    }
    const u = t.closest('.unit.clickable'), r = t.closest('.ref'), a = t.closest('.amen');
    if (a) selectAmen(+a.dataset.i);
    else if (r) selectRef(r.dataset.ref);
    else if (u) selectUnit(u.dataset.id);
  }

  // painel retrátil (retrato)
  function sheetSize(c) { const s = $('#sheet'); s.classList.remove('tall', 'mini'); if (c) s.classList.add(c); }
  $('#grip').addEventListener('click', () => {
    const s = $('#sheet');
    if (s.classList.contains('tall')) sheetSize('mini'); else if (s.classList.contains('mini')) sheetSize(''); else sheetSize('tall');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#viewDetail').hidden) $('#back').click(); else if (S.mode === '3d') setMode('2d'); }
  });

  // ajusta o mapa quando a área muda de tamanho
  new ResizeObserver(() => layout()).observe(stage);

  /* ================= RELÓGIO E HORÁRIO ================= */
  function tick() {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    $('#clock').textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    const open = h >= D.info.abre && h < D.info.fecha, o = $('#openStatus');
    o.classList.toggle('closed', !open);
    o.textContent = open ? 'Aberto agora · até ' + D.info.fecha + 'h' : 'Fechado · abre às ' + D.info.abre + 'h';
  }
  tick(); setInterval(tick, 15000);

  /* ================= BOAS-VINDAS ================= */
  const slides = ['hero', 'atrio', 'galeria', 'fachada', 'rooftop2', 'alambique', 'rodape'];
  $('#wSlides').innerHTML = slides.map(s => '<div style="background-image:url(' + M.imgUrl(s) + ')"></div>').join('');
  let si = 0;
  const sl = $$('#wSlides div');
  function nextSlide() { sl.forEach((d, i) => d.classList.toggle('on', i === si)); si = (si + 1) % sl.length; }
  nextSlide(); setInterval(() => { if (!$('#welcome').classList.contains('out')) nextSlide(); }, 6500);
  $('#wStats').innerHTML = D.info.numeros.map(n => '<div><b>' + n.v + '</b><span>' + n.l + '</span></div>').join('');
  const quick = [
    { l: 'Onde comer', i: 'utensils', cat: 'restaurante' },
    { l: 'Empórios & queijos', i: 'basket', cat: 'emporio' },
    { l: 'Design & Decor', i: 'sofa', cat: 'decor' },
    { l: 'Lojas âncora', i: 'star', cat: 'ancora' },
    { l: 'Sanitários', i: 'wc', amen: 'wc' },
    { l: 'Rooftop', i: 'sun', floor: 'r' }
  ];
  $('#wQuick').innerHTML = quick.map((q, i) => '<button data-q="' + i + '">' + icon(q.i) + q.l + '</button>').join('');
  function enter() { $('#welcome').classList.add('out'); poke(); }
  $('#wStart').onclick = enter;
  $('#welcome').addEventListener('click', e => {
    const b = e.target.closest('[data-q]');
    if (b) {
      const q = quick[+b.dataset.q];
      enter();
      if (q.cat) document.querySelector('.chip[data-cat="' + q.cat + '"]').click();
      else if (q.amen) document.querySelector('.chip[data-amen="' + q.amen + '"]').click();
      else if (q.floor) setFloor(q.floor);
      return;
    }
    if (!e.target.closest('button')) enter();
  });

  function resetAll(showWelcome) {
    clearRoute(); clearSel();
    S.cat = null; S.amen = null; S.q = ''; $('#q').value = ''; $('.search').classList.remove('has');
    $$('.chip').forEach(c => c.classList.remove('on'));
    S.mode = '2d'; showList(); setFloor(TOTEM.f);
    if (showWelcome) { $('#welcome').classList.remove('out'); si = 0; nextSlide(); }
    if (!KIOSK) history.replaceState(null, '', location.pathname);
  }

  // modo totem: volta à tela de descanso após 90 s sem toque
  let idleT;
  function poke() {
    clearTimeout(idleT);
    if (KIOSK) idleT = setTimeout(() => resetAll(true), 90000);
  }
  ['pointerdown', 'keydown', 'wheel'].forEach(ev => document.addEventListener(ev, poke, { passive: true }));

  /* ================= INÍCIO ================= */
  drawYou();
  showList();
  layout();
  setFloor(TOTEM.f);
  const deep = params.get('loja'), deepRef = params.get('ref');
  if (deep && M.unitById(deep)) { $('#welcome').classList.add('out'); setTimeout(() => selectUnit(deep), 400); }
  else if (deepRef && D.refs.some(r => r.id === deepRef)) { $('#welcome').classList.add('out'); setTimeout(() => selectRef(deepRef), 400); }

  window.MO_APP = { S, setFloor, setMode, selectUnit, selectRef, selectAmen, layout };
})(window.MO_DATA, window.MO_MAP);
