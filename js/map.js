/* ==========================================================
   MERCADO DE ORIGEM · Motor do mapa
   - Ícones
   - Desenho das plantas em SVG
   - Rotas (menor caminho pelos corredores + elevador entre andares)
   ========================================================== */
window.MO_MAP = (function (D) {

  /* ---------------- ÍCONES (24x24, traço) ---------------- */
  const F = 'fill="currentColor" stroke="none"';
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    route: '<path d="M3 11 21 3l-8 18-2-8z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" ' + F + '/>',
    elevator: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m9 9.5 3-3 3 3M9 14.5l3 3 3-3"/>',
    stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
    wc: '<circle cx="7.5" cy="4.5" r="2" ' + F + '/><path d="M5.5 8h4v6.5H8.6V21H6.4v-6.5h-.9z" ' + F + '/><circle cx="16.5" cy="4.5" r="2" ' + F + '/><path d="M16.5 8 13.5 16h1.8v5h2.4v-5h1.8z" ' + F + '/>',
    wheelchair: '<circle cx="10" cy="4" r="2" ' + F + '/><path d="M10 7.5v6h6l2.2 6M10 10.5h5"/><path d="M7.2 11.2A5.5 5.5 0 1 0 15 18.6"/>',
    baby: '<circle cx="12" cy="12" r="8"/><circle cx="9.3" cy="11" r=".9" ' + F + '/><circle cx="14.7" cy="11" r=".9" ' + F + '/><path d="M9.5 14.6c1.5 1.2 3.5 1.2 5 0M12 4c-1 1.5 0 3 1.5 2.5"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    paw: '<circle cx="6.5" cy="10" r="2" ' + F + '/><circle cx="10" cy="5.8" r="2" ' + F + '/><circle cx="14" cy="5.8" r="2" ' + F + '/><circle cx="17.5" cy="10" r="2" ' + F + '/><path d="M12 11.5c-3 0-5.5 3.8-5.5 6 0 1.7 1.5 2.6 3.1 2.2 1-.3 1.5-.6 2.4-.6s1.4.3 2.4.6c1.6.4 3.1-.5 3.1-2.2 0-2.2-2.5-6-5.5-6z" ' + F + '/>',
    door: '<path d="M14 4h5v16h-5M3 12h11M10 8l4 4-4 4"/>',
    car: '<path d="M5 17v-5.5L7 6h10l2 5.5V17M3.5 17h17v2.5h-17zM5 11.5h14"/><circle cx="8" cy="14.3" r=".9" ' + F + '/><circle cx="16" cy="14.3" r=".9" ' + F + '/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" ' + F + '/>',
    cube: '<path d="m12 2.5 8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M12 21.5V12M20.5 7.3 12 12 3.5 7.3"/>',
    plan: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 10h7v11M10 3v4M14 10h7M14 10v5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    locate: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" ' + F + '/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    home: '<path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    leaf: '<path d="M5 19C5 10 11 5 20 5c0 9-5 15-14 14"/><path d="m5 19 8-8"/>',
    tower: '<path d="M8 21V9l4-6 4 6v12zM5.5 21h13"/><circle cx="12" cy="12" r="2.2"/><path d="M12 11v1.2l.8.6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    utensils: '<path d="M7 3v7.5a2 2 0 0 0 2 2V21M5 3v5.5M9 3v5.5M17 3c-2.2 2.2-2.2 7 0 8.5V21"/>',
    sofa: '<path d="M4.5 11V8.5a2.5 2.5 0 0 1 2.5-2.5h10a2.5 2.5 0 0 1 2.5 2.5V11"/><path d="M2.5 13.5a2 2 0 0 1 4 0V15h11v-1.5a2 2 0 0 1 4 0V19h-19zM5 19v2M19 19v2"/>',
    basket: '<path d="M3 10h18l-2.2 10H5.2z"/><path d="m8 10 4-6.5 4 6.5M9 14v3M12 14v3M15 14v3"/>',
    sparkle: '<path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7zM19 16c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12.5h18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    walk: '<circle cx="13" cy="4" r="2" ' + F + '/><path d="m9 21 2.5-6.5L14 17v4M7 12l2.5-4.5L13 8l3 4h3M11.5 14.5 12.8 9"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="m15 6-6 6 6 6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    print: '<path d="M7 9V3h10v6M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-5A1.5 1.5 0 0 1 4.5 9h15a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H17"/><rect x="7" y="14" width="10" height="7"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  // ícone dentro do SVG do mapa, centrado em (x,y) com tamanho s
  function mapIcon(name, x, y, s, color) {
    const k = s / 24;
    return '<g transform="translate(' + (x - s / 2) + ',' + (y - s / 2) + ') scale(' + k + ')" fill="none" stroke="' + color + '" color="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</g>';
  }

  /* ---------------- UTIL ---------------- */
  const LOJA_IMGS = ['verdemar', 'massas', 'maturei', 'comqueijo', 'nilo', 'armazem', 'petz', 'smartfit', 'contorno', 'farmacia', 'pontes', 'severinos', 'viana', 'cava', 'cadim', 'pingaefrita', 'bistrohome', 'pescador', 'doimo', 'doimo2', 'alambique'];
  function imgUrl(key) {
    if (!key) return null;
    return LOJA_IMGS.indexOf(key) >= 0 ? 'assets/img/lojas/' + key + '.jpg' : 'assets/img/espaco/' + key + '.jpg';
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const floorById = id => D.floors.find(f => f.id === id);
  const unitById = id => D.units.find(u => u.id === id);
  const isStore = u => !u.kind || u.kind === 'zona';
  const isListed = u => isStore(u) && u.cat !== 'embreve';

  // códigos das lojas (101, 102... / D1 / R1 / G1)
  (function codes() {
    const count = {};
    D.units.forEach(u => {
      if (!isStore(u)) return;
      const p = u.deck ? 'D' : (u.f === 'r' ? 'R' : u.f === 'g' ? 'G' : u.f);
      count[p] = (count[p] || 0) + 1;
      const n = count[p];
      u.code = /\d/.test(p) ? p + String(n).padStart(2, '0') : p + n;
    });
  })();

  // quebra de texto aproximada para caber no retângulo
  function wrap(text, maxW, fs) {
    const cw = fs * 0.56, words = String(text).split(' '), lines = [];
    let cur = '';
    words.forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (t.length * cw <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  /* ---------------- DESENHO DA PLANTA ---------------- */
  const C = {
    verde: '#1A2819', slab: '#FBF8F2', corredor: '#F1ECE2', palha: '#F2EFE9',
    gold: '#B68D40', tinta: '#2A2620', wall: '#1A2819'
  };

  function defs(uid) {
    return '<defs>' +
      '<filter id="sh' + uid + '" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0d150c" flood-opacity=".22"/></filter>' +
      '<filter id="ush' + uid + '" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#2a2016" flood-opacity=".16"/></filter>' +
      '<pattern id="leaf' + uid + '" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">' +
        '<rect width="34" height="34" fill="#334a31"/>' +
        '<path d="M6 10c4-6 10-6 12-2-4 5-9 5-12 2z" fill="#5f8050"/><path d="M20 26c4-6 10-6 12-2-4 5-9 5-12 2z" fill="#4c6c40"/>' +
        '<path d="M2 28c3-4 7-4 8-1-3 3-6 3-8 1z" fill="#7a9a5c"/><path d="M22 6c3-4 7-4 8-1-3 3-6 3-8 1z" fill="#6c8c52"/>' +
        '<circle cx="15" cy="20" r="1.4" fill="#a7bd84"/>' +
      '</pattern>' +
      '<pattern id="plaza' + uid + '" width="46" height="46" patternUnits="userSpaceOnUse">' +
        '<rect width="46" height="46" fill="#E4E7D8"/><circle cx="23" cy="23" r="7" fill="#fff" stroke="#b8b09c" stroke-width="1.2"/>' +
        '<circle cx="23" cy="12.5" r="2.4" fill="#cdbf9f"/><circle cx="23" cy="33.5" r="2.4" fill="#cdbf9f"/><circle cx="12.5" cy="23" r="2.4" fill="#cdbf9f"/><circle cx="33.5" cy="23" r="2.4" fill="#cdbf9f"/>' +
      '</pattern>' +
      '<pattern id="wood' + uid + '" width="40" height="12" patternUnits="userSpaceOnUse">' +
        '<rect width="40" height="12" fill="#D2B48A"/><path d="M0 11.5h40" stroke="#b8976a" stroke-width="1"/><path d="M28 0v12" stroke="#c4a379" stroke-width=".8"/>' +
      '</pattern>' +
      '<pattern id="hatch' + uid + '" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<rect width="10" height="10" fill="#EEEAE2"/><path d="M0 0v10" stroke="#d8d1c4" stroke-width="3"/>' +
      '</pattern>' +
      '<pattern id="glass' + uid + '" width="40" height="40" patternUnits="userSpaceOnUse">' +
        '<rect width="40" height="40" fill="#cfdcd6"/><path d="M0 40 40 0" stroke="#e9f0ec" stroke-width="6"/><path d="M0 0h40M0 0v40" stroke="#9fb1a8" stroke-width="1.5"/>' +
      '</pattern>' +
      '<pattern id="stall' + uid + '" width="26" height="130" patternUnits="userSpaceOnUse">' +
        '<rect width="26" height="130" fill="#E7E3DA"/><path d="M0 0v52M0 78v52" stroke="#fff" stroke-width="2"/>' +
      '</pattern>' +
      '<radialGradient id="glow' + uid + '"><stop offset="0" stop-color="#B68D40" stop-opacity=".55"/><stop offset="1" stop-color="#B68D40" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }

  function labelSVG(u, opts) {
    const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
    const vertical = u.w < 56 && u.h > u.w;
    const maxW = (vertical ? u.h : u.w) - 14;
    const maxH = (vertical ? u.w : u.h) - 12;
    let fs = Math.max(9.5, Math.min(16, (vertical ? u.h : u.w) / 7.2));
    if (u.kind === 'zona' && u.w > 300) fs = 19;
    let lines = wrap(u.n, maxW, fs);
    while ((lines.length * fs * 1.12 > maxH || lines.some(l => l.length * fs * .56 > maxW + 2)) && fs > 8) { fs -= .5; lines = wrap(u.n, maxW, fs); }
    const tagFs = Math.min(11.5, fs * .74);
    const showTag = !vertical && u.tag && u.h >= 100 && u.w >= 150 && lines.length <= 2 && !opts.numbers && u.tag.length * tagFs * .68 <= maxW;
    const total = lines.length * fs * 1.12 + (showTag ? tagFs * 1.6 : 0);
    const color = u.cat === 'embreve' ? '#8b8478' : (D.cats[u.cat] ? shade(D.cats[u.cat].cor, -0.35) : C.tinta);
    let s = '<g class="lbl" ' + (vertical ? 'transform="rotate(-90 ' + cx + ' ' + cy + ')"' : '') + '>';
    let y0 = cy - total / 2 + fs * .86;
    if (opts.numbers && isStore(u) && u.cat !== 'embreve') {
      // selo com o código da loja (versão estática)
      const by = vertical ? cy : u.y + 16;
      s = '<g class="code"><circle cx="' + (vertical ? cx : u.x + 16) + '" cy="' + (vertical ? u.y + 16 : by) + '" r="11" fill="' + D.cats[u.cat].cor + '"/>' +
        '<text x="' + (vertical ? cx : u.x + 16) + '" y="' + ((vertical ? u.y + 16 : by) + 3.8) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">' + u.code + '</text></g>' + s;
      if (vertical) { y0 += 0; }
    }
    lines.forEach((l, i) => {
      s += '<text x="' + cx + '" y="' + (y0 + i * fs * 1.12) + '" text-anchor="middle" font-size="' + fs + '" font-weight="600" fill="' + color + '">' + esc(l) + '</text>';
    });
    if (showTag) s += '<text x="' + cx + '" y="' + (y0 + (lines.length - 1) * fs * 1.12 + tagFs * 1.75) + '" text-anchor="middle" font-size="' + tagFs + '" font-weight="400" letter-spacing=".6" fill="' + color + '" opacity=".75">' + esc(u.tag.toUpperCase()) + '</text>';
    return s + '</g>';
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function doorPoint(u) {
    const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
    if (u.deck) return { x: cx, y: u.y, side: 't' };
    if (u.y + u.h <= 210) return { x: cx, y: u.y + u.h, side: 'b' };
    if (u.y >= 410 && u.y < 560) return { x: cx, y: u.y, side: 't' };
    if (u.x + u.w <= 250) return { x: u.x + u.w, y: cy, side: 'r' };
    if (u.x >= 750) return { x: u.x, y: cy, side: 'l' };
    return { x: cx, y: cy, side: 'c' };
  }

  function unitSVG(u, uid, opts) {
    const cat = D.cats[u.cat];
    let fill, stroke, sw = 1.4, dash = '', extra = '';
    if (u.kind === 'wc') { fill = '#E9E4DA'; stroke = '#cfc6b6'; }
    else if (u.kind === 'vagas') { fill = 'url(#stall' + uid + ')'; stroke = '#d6cfc1'; }
    else if (u.cat === 'embreve') { fill = 'url(#hatch' + uid + ')'; stroke = '#cfc7b9'; dash = '5 4'; }
    else if (u.kind === 'zona') { fill = cat.soft; stroke = cat.cor; dash = '7 5'; sw = 1.6; }
    else { fill = cat.soft; stroke = shade(cat.cor, .25); }
    if (u.anchor) { stroke = C.gold; sw = 3; }
    const r = u.kind === 'zona' ? 14 : 7;
    const clickable = isStore(u) && u.cat !== 'embreve';
    let s = '<g class="unit' + (clickable ? ' clickable' : '') + (u.anchor ? ' anchor' : '') + ' k-' + (u.kind || 'loja') + '" data-id="' + u.id + '" data-cat="' + (u.cat || '') + '">';
    s += '<rect class="u-bg" x="' + (u.x + 2) + '" y="' + (u.y + 2) + '" width="' + (u.w - 4) + '" height="' + (u.h - 4) + '" rx="' + r + '" fill="' + fill + '" ' + (u.kind === 'zona' ? 'fill-opacity=".72"' : '') + ' stroke="' + stroke + '" stroke-width="' + sw + '" ' + (dash ? 'stroke-dasharray="' + dash + '"' : '') + (u.kind === 'zona' || u.kind === 'vagas' ? '' : ' filter="url(#ush' + uid + ')"') + '/>';
    // porta
    if (clickable && u.kind !== 'zona') {
      const dp = doorPoint(u), dw = Math.min(22, (dp.side === 'l' || dp.side === 'r' ? u.h : u.w) * .35);
      const col = u.anchor ? C.gold : shade(cat.cor, .1);
      if (dp.side === 'b' || dp.side === 't') s += '<path d="M' + (dp.x - dw / 2) + ' ' + (dp.side === 'b' ? dp.y - 2 : dp.y + 2) + 'h' + dw + '" stroke="' + col + '" stroke-width="4" stroke-linecap="round"/>';
      else if (dp.side === 'l' || dp.side === 'r') s += '<path d="M' + (dp.side === 'r' ? dp.x - 2 : dp.x + 2) + ' ' + (dp.y - dw / 2) + 'v' + dw + '" stroke="' + col + '" stroke-width="4" stroke-linecap="round"/>';
    }
    if (u.kind === 'vagas') {
      s += '<text x="' + (u.x + u.w / 2) + '" y="' + (u.y + u.h / 2 + 5) + '" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="3" fill="#a59c8c">VAGAS</text>';
    } else if (u.kind !== 'wc') {
      s += labelSVG(u.under ? Object.assign({}, u, { h: 120 }) : u, opts);
    }
    if (u.anchor) {
      s += '<g class="star"><circle cx="' + (u.x + u.w - 14) + '" cy="' + (u.y + 14) + '" r="10" fill="' + C.gold + '"/>' + mapIcon('star', u.x + u.w - 14, u.y + 14, 13, '#fff') + '</g>';
    }
    return s + '</g>';
  }

  function render(fid, opts) {
    opts = opts || {};
    const uid = 'f' + fid + (opts.numbers ? 'n' : '');
    const W = 1000, H = 720;
    let s = '<svg class="plan" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" font-family="DM Sans, sans-serif" data-floor="' + fid + '">' + defs(uid);

    // ---- casca do prédio ----
    if (fid === '1') {
      // deck
      s += '<g class="deck"><rect x="96" y="566" width="808" height="138" rx="22" fill="url(#wood' + uid + ')" stroke="#a88a5e" stroke-width="2" filter="url(#sh' + uid + ')"/>' +
        '<path d="M110 600h780" stroke="#efe3cc" stroke-width="22" stroke-linecap="round" opacity=".55"/>' +
        // pergolado
        '<g stroke="#8a6c45" stroke-width="2" opacity=".35">' + Array.from({ length: 19 }, (_, i) => '<path d="M' + (120 + i * 41) + ' 572v128"/>').join('') + '</g>' +
        '</g>';
      // torre do relógio
      s += '<g class="torre"><rect x="10" y="66" width="46" height="78" rx="4" fill="#3A4D39" stroke="#1A2819" stroke-width="2.5"/>' +
        '<path d="M16 66l17-14 17 14" fill="#3A4D39" stroke="#1A2819" stroke-width="2.5" stroke-linejoin="round"/></g>';
    }
    s += '<rect class="slab" x="50" y="60" width="900" height="500" rx="16" fill="' + C.slab + '" filter="url(#sh' + uid + ')"/>';
    // corredores (piso)
    s += '<g class="floor-path" fill="' + C.corredor + '">' +
      '<rect x="56" y="200" width="888" height="56" rx="6"/><rect x="56" y="364" width="888" height="56" rx="6"/>' +
      '<rect x="242" y="200" width="60" height="220"/><rect x="698" y="200" width="60" height="220"/></g>';
    if (fid === '1') s += '<rect x="452" y="414" width="56" height="160" fill="' + C.corredor + '"/>';

    // ---- átrio ----
    if (fid === '1') {
      s += '<g class="atrio"><rect x="300" y="250" width="400" height="120" rx="10" fill="url(#plaza' + uid + ')"/>' +
        '<rect x="300" y="250" width="400" height="12" rx="4" fill="url(#leaf' + uid + ')"/><rect x="300" y="358" width="400" height="12" rx="4" fill="url(#leaf' + uid + ')"/>' +
        '<rect x="300" y="250" width="400" height="120" rx="10" fill="none" stroke="#a6b096" stroke-width="1.5"/>' +
        '<rect x="478" y="262" width="44" height="96" fill="' + C.corredor + '"/></g>';
    } else if (fid === '2' || fid === '3') {
      s += '<g class="atrio"><rect x="300" y="250" width="400" height="120" rx="10" fill="url(#leaf' + uid + ')"/>' +
        '<rect x="300" y="250" width="400" height="120" rx="10" fill="none" stroke="#1A2819" stroke-width="3" stroke-dasharray="1 6" stroke-linecap="round"/>' +
        '<rect x="478" y="248" width="44" height="124" fill="' + C.corredor + '" stroke="#8d8471" stroke-width="1.2"/>' +
        '<text x="610" y="352" text-anchor="middle" font-size="10" letter-spacing="3" fill="#dfe8cf" font-weight="600" opacity=".8">VAZIO DO ÁTRIO</text></g>';
    } else if (fid === 'r') {
      s += '<g class="atrio"><rect x="300" y="250" width="400" height="120" rx="10" fill="url(#glass' + uid + ')" stroke="#7d918a" stroke-width="2"/>' +
        '<rect x="478" y="250" width="44" height="120" fill="' + C.corredor + '"/></g>';
    } else if (fid === 'g') {
      s += '<g class="atrio"><rect x="440" y="276" width="270" height="68" rx="8" fill="#E9E4DA" stroke="#cfc6b6"/>' +
        '<text x="575" y="358" text-anchor="middle" font-size="10" letter-spacing="3" fill="#a59c8c" font-weight="600">HALL DOS ELEVADORES</text></g>' +
        '<g stroke="#d9cfb9" stroke-width="3" fill="none" stroke-dasharray="14 12"><path d="M70 312h360M720 312h20"/></g>';
    }
    // linhas-guia de circulação
    s += '<g class="guides" stroke="#ddd3c1" stroke-width="1.6" stroke-dasharray="2 9" stroke-linecap="round" fill="none">' +
      '<path d="M66 230h868M66 390h868M270 236v148M730 236v148"/></g>';

    // ---- unidades (zonas "under" primeiro) ----
    const us = D.units.filter(u => u.f === fid);
    us.filter(u => u.under).forEach(u => { s += unitSVG(u, uid, opts); });
    if (fid === 'r') s += '<rect x="300" y="250" width="400" height="120" rx="10" fill="url(#glass' + uid + ')" stroke="#7d918a" stroke-width="2"/><rect x="478" y="250" width="44" height="120" fill="' + C.corredor + '"/>';
    us.filter(u => !u.under).forEach(u => { s += unitSVG(u, uid, opts); });

    // ---- pontos de referência ----
    D.refs.filter(r => r.f === fid).forEach(r => {
      s += '<g class="ref" data-ref="' + r.id + '"><circle cx="' + r.x + '" cy="' + r.y + '" r="15" fill="' + C.gold + '" stroke="#FBF8F2" stroke-width="3"/>' + mapIcon(r.icon, r.x, r.y, 16, '#fff') +
        (opts.noRefLabels ? '' : '<text x="' + (r.id === 'torre' ? 6 : r.x) + '" y="' + (r.id === 'torre' ? 40 : r.y + 30) + '" text-anchor="' + (r.id === 'torre' ? 'start' : 'middle') + '" font-family="Playfair Display, serif" font-style="italic" font-size="13.5" fill="#1A2819" stroke="#FBF8F2" stroke-width="4" paint-order="stroke">' + esc(r.n) + '</text>') + '</g>';
    });

    // ---- serviços ----
    D.amen.filter(a => a.f === fid).forEach((a, i) => {
      const t = D.amenTypes[a.t];
      const big = a.t === 'elevador' || a.t === 'escada';
      const rr = big ? 15 : 12.5;
      s += '<g class="amen" data-t="' + a.t + '" data-i="' + D.amen.indexOf(a) + '"><circle class="halo" cx="' + a.x + '" cy="' + a.y + '" r="' + (rr + 10) + '" fill="url(#glow' + uid + ')" opacity="0"/>' +
        '<circle cx="' + a.x + '" cy="' + a.y + '" r="' + rr + '" fill="' + (big ? '#3A4D39' : '#1A2819') + '" stroke="#FBF8F2" stroke-width="2.5"/>' + mapIcon(t.icon, a.x, a.y, big ? 17 : 14, '#F5EBDD') +
        (a.label && !opts.noRefLabels ? '<text x="' + (a.x + (a.x < 100 ? 20 : 0)) + '" y="' + (a.y + (a.label === 'Acesso ao deck' ? 4 : -20)) + '" ' + (a.label === 'Acesso ao deck' ? 'dx="22" text-anchor="start"' : 'text-anchor="start"') + ' font-size="10.5" font-weight="600" letter-spacing="1.2" fill="#3A4D39" stroke="#FBF8F2" stroke-width="3.5" paint-order="stroke">' + esc(a.label.toUpperCase()) + '</text>' : '') + '</g>';
    });

    // camadas dinâmicas
    s += '<g class="layer-route"></g><g class="layer-pin"></g>';
    return s + '</svg>';
  }

  /* ---------------- ROTAS ---------------- */
  const graphs = {};
  function graph(fid) {
    if (graphs[fid]) return graphs[fid];
    const nodes = {}, key = (x, y) => x + ',' + y;
    const get = (x, y) => nodes[key(x, y)] || (nodes[key(x, y)] = { x, y, k: key(x, y), adj: [] });
    const segs = D.corridors.base.concat(D.corridors[fid] || []);
    segs.forEach(([a, b]) => {
      const dx = Math.sign(b[0] - a[0]) * 10, dy = Math.sign(b[1] - a[1]) * 10;
      let x = a[0], y = a[1], prev = get(x, y);
      while (x !== b[0] || y !== b[1]) {
        x += dx; y += dy;
        const n = get(x, y);
        if (prev.adj.indexOf(n) < 0) { prev.adj.push(n); n.adj.push(prev); }
        prev = n;
      }
    });
    return (graphs[fid] = Object.values(nodes));
  }
  function nearest(fid, p) {
    let best = null, bd = 1e9;
    graph(fid).forEach(n => { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < bd) { bd = d; best = n; } });
    return best;
  }
  function dijkstra(nodes, a, b) {
    const dist = new Map(), prev = new Map(), q = new Set(nodes);
    nodes.forEach(n => dist.set(n, Infinity)); dist.set(a, 0);
    while (q.size) {
      let u = null, ud = Infinity;
      q.forEach(n => { const d = dist.get(n); if (d < ud) { ud = d; u = n; } });
      if (!u || u === b) break;
      q.delete(u);
      u.adj.forEach(v => { if (!q.has(v)) return; const nd = ud + Math.hypot(u.x - v.x, u.y - v.y); if (nd < dist.get(v)) { dist.set(v, nd); prev.set(v, u); } });
    }
    const path = []; let c = b;
    while (c) { path.unshift({ x: c.x, y: c.y }); c = prev.get(c); }
    return path;
  }
  function simplify(pts) {
    const out = [];
    pts.forEach(p => {
      if (out.length && out[out.length - 1].x === p.x && out[out.length - 1].y === p.y) return;
      if (out.length >= 2) {
        const a = out[out.length - 2], b = out[out.length - 1];
        if ((a.x === b.x && b.x === p.x) || (a.y === b.y && b.y === p.y)) { out[out.length - 1] = p; return; }
      }
      out.push(p);
    });
    return out;
  }
  function leg(fid, from, to) {
    const a = nearest(fid, from), b = nearest(fid, to);
    const pts = simplify([from].concat(dijkstra(graph(fid), a, b), [to]));
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return { f: fid, pts, len };
  }
  // destino: {f, x, y}
  function route(start, dest) {
    const E = D.elevator;
    if (start.f === dest.f) return [leg(start.f, start, dest)];
    return [leg(start.f, start, E), leg(dest.f, E, dest)];
  }
  function targetOf(u) { const d = doorPoint(u); return { f: u.f, x: d.x, y: d.y }; }

  // estimativa (1 unidade ≈ 0,13 m · 1,2 m/s · +35 s por troca de andar)
  function estimate(legs) {
    const m = legs.reduce((a, l) => a + l.len, 0) * 0.13;
    const sec = m / 1.2 + (legs.length > 1 ? 35 : 0);
    return { m: Math.max(5, Math.round(m / 5) * 5), min: Math.max(1, Math.round(sec / 60)) };
  }

  return { ICONS, icon, mapIcon, render, route, targetOf, estimate, imgUrl, esc, norm, floorById, unitById, isStore, isListed, doorPoint, shade, nearest };
})(window.MO_DATA);
