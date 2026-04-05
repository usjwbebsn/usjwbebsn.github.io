/* ═══════════════════════════════════════════════════════════
   DIUSF — app.js v5
   Alta prioridad añadidas:
     T16. Límite de caracteres por plataforma en cards
     T10. Temas visuales (Default, Discord, TikTok, Gaming, Minimal)
     T13. Vista previa en contexto (modal Discord/Instagram/TikTok/Tweet)
   + features v4: 17-20 incluidas
═══════════════════════════════════════════════════════════ */
'use strict';

/* ═════════════════════ STATE ═════════════════════ */
let _text     = 'DIUSF';
let _query    = '';
let _copied   = 0;
let _order    = null;
let _cat      = null;
let _platform = null;
let _sort     = 'default';

/* ── Favoritos ── */
let _favs;
try { _favs = new Set(JSON.parse(localStorage.getItem('diusf_favs') || '[]')); }
catch (_) { _favs = new Set(); }
function saveFavs() {
  try { localStorage.setItem('diusf_favs', JSON.stringify([..._favs])); } catch (_) {}
}

/* ── Popularidad ── */
let _popularity;
try { _popularity = JSON.parse(localStorage.getItem('diusf_pop') || '{}'); }
catch (_) { _popularity = {}; }
function savePop() {
  try { localStorage.setItem('diusf_pop', JSON.stringify(_popularity)); } catch (_) {}
}

/* ── Recientes ── */
let _recentOrder;
try { _recentOrder = JSON.parse(localStorage.getItem('diusf_recent') || '[]'); }
catch (_) { _recentOrder = []; }
function saveRecent() {
  try { localStorage.setItem('diusf_recent', JSON.stringify(_recentOrder)); } catch (_) {}
}

function trackCopy(sid) {
  _popularity[sid] = (_popularity[sid] || 0) + 1;
  savePop();
  _recentOrder = _recentOrder.filter(x => x !== sid);
  _recentOrder.unshift(sid);
  if (_recentOrder.length > 200) _recentOrder.length = 200;
  saveRecent();
  renderAnalytics();
}

/* ── Historial ── */
let _history;
try { _history = JSON.parse(localStorage.getItem('diusf_history') || '[]'); }
catch (_) { _history = []; }
function saveHistory() {
  try { localStorage.setItem('diusf_history', JSON.stringify(_history)); } catch (_) {}
}
function pushHistory(text) {
  const t = text.trim();
  if (t.length < 2) return;
  _history = _history.filter(x => x !== t);
  _history.unshift(t);
  if (_history.length > 5) _history.length = 5;
  saveHistory();
  renderHistory();
}
function renderHistory() {
  const el = document.getElementById('history-chips');
  if (!el) return;
  el.innerHTML = '';
  _history.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'history-chip';
    chip.type = 'button';
    chip.setAttribute('aria-label', 'Usar texto: ' + item);
    const span = document.createElement('span');
    span.className = 'history-chip-text';
    span.textContent = item;
    const x = document.createElement('span');
    x.className = 'history-chip-x';
    x.textContent = '✕';
    x.setAttribute('aria-label', 'Eliminar del historial');
    chip.appendChild(span);
    chip.appendChild(x);
    el.appendChild(chip);
  });
}

/* ═══════════════ T16 — LÍMITES POR PLATAFORMA ═══════════════ */
const PLATFORM_LIMITS = {
  discord:   { limit: 190,  label: 'bio Discord' },
  instagram: { limit: 150,  label: 'bio Instagram' },
  tiktok:    { limit: 80,   label: 'bio TikTok' },
  twitter:   { limit: 280,  label: 'tweet Twitter/X' },
  steam:     { limit: 100,  label: 'nombre Steam' },
  whatsapp:  { limit: 139,  label: 'estado WhatsApp' },
  telegram:  { limit: 70,   label: 'bio Telegram' },
  linkedin:  { limit: 220,  label: 'titular LinkedIn' },
};

function makeLimitChipHtml(resLen, platform) {
  if (!platform || !PLATFORM_LIMITS[platform]) return '';
  const { limit, label } = PLATFORM_LIMITS[platform];
  const pct = resLen / limit;
  const cls  = pct >= 1 ? 'limit-over' : pct >= 0.85 ? 'limit-warn' : 'limit-ok';
  const icon = pct >= 1 ? '✗' : '✓';
  return '<span class="limit-chip ' + cls + '" title="' + label + '">' + icon + ' ' + resLen + '/' + limit + '</span>';
}

/* ═══════════════ T10 — TEMAS VISUALES ═══════════════ */
const THEMES = {
  default: { label:'Default', icon:'🌐', dark:false, vars:{} },
  discord: {
    label:'Discord', icon:'💬', dark:true,
    vars:{
      '--blue':'#5865F2','--blue-lo':'rgba(88,101,242,.16)','--blue-glow':'rgba(88,101,242,.28)',
      '--purple':'#9B84EE','--green':'#57F287','--red':'#ED4245',
      '--bg':'#202225','--bg1':'#2f3136','--bg2':'#40444b','--bg3':'#4f545c','--bg4':'#72767d',
      '--card-bg':'rgba(47,49,54,.97)','--card-bg-hover':'rgba(54,57,63,1)',
      '--t1':'#dcddde','--t2':'rgba(220,221,222,.80)','--t3':'rgba(220,221,222,.50)',
      '--t4':'rgba(220,221,222,.28)','--t5':'rgba(220,221,222,.10)',
      '--glass-border-light':'rgba(255,255,255,.10)','--glass-border-dark':'rgba(255,255,255,.05)',
    }
  },
  tiktok: {
    label:'TikTok', icon:'🎵', dark:true,
    vars:{
      '--blue':'#EE1D52','--blue-lo':'rgba(238,29,82,.15)','--blue-glow':'rgba(238,29,82,.30)',
      '--purple':'#69C9D0','--green':'#69C9D0','--teal':'#69C9D0',
      '--bg':'#010101','--bg1':'#161616','--bg2':'#1e1e1e','--bg3':'#282828','--bg4':'#3a3a3a',
      '--card-bg':'rgba(22,22,22,.97)','--card-bg-hover':'rgba(30,30,30,1)',
      '--t1':'#ffffff','--t2':'rgba(255,255,255,.78)','--t3':'rgba(255,255,255,.50)',
      '--t4':'rgba(255,255,255,.28)','--t5':'rgba(255,255,255,.08)',
      '--glass-border-light':'rgba(255,255,255,.12)','--glass-border-dark':'rgba(255,255,255,.05)',
    }
  },
  gaming: {
    label:'Gaming', icon:'🎮', dark:true,
    vars:{
      '--blue':'#00FF88','--blue-lo':'rgba(0,255,136,.12)','--blue-glow':'rgba(0,255,136,.25)',
      '--purple':'#FF00FF','--green':'#00FF88','--pink':'#FF006E','--teal':'#00CFFF',
      '--bg':'#06060f','--bg1':'#0c0c1a','--bg2':'#131324','--bg3':'#1a1a30','--bg4':'#24243e',
      '--card-bg':'rgba(10,10,20,.97)','--card-bg-hover':'rgba(16,16,28,1)',
      '--t1':'#e8e8ff','--t2':'rgba(232,232,255,.78)','--t3':'rgba(232,232,255,.50)',
      '--t4':'rgba(232,232,255,.28)','--t5':'rgba(232,232,255,.08)',
      '--glass-border-light':'rgba(0,255,136,.15)','--glass-border-dark':'rgba(0,255,136,.05)',
    }
  },
  minimal: {
    label:'Minimal', icon:'⬜', dark:false,
    vars:{
      '--blue':'#333333','--blue-lo':'rgba(51,51,51,.08)','--blue-glow':'rgba(51,51,51,.15)',
      '--purple':'#555555','--green':'#222222','--teal':'#444444',
      '--bg':'#fafafa','--bg1':'#ffffff','--bg2':'#f4f4f4','--bg3':'#ebebeb','--bg4':'#d6d6d6',
      '--card-bg':'rgba(255,255,255,.98)','--card-bg-hover':'rgba(255,255,255,1)',
      '--t1':'#111111','--t2':'rgba(17,17,17,.72)','--t3':'rgba(17,17,17,.45)',
      '--t4':'rgba(17,17,17,.26)','--t5':'rgba(17,17,17,.10)',
      '--glass-border-light':'rgba(0,0,0,.12)','--glass-border-dark':'rgba(0,0,0,.06)',
    }
  },
};

let _themeName = 'default';

function applyTheme(name, skipDarkSync) {
  const theme = THEMES[name] || THEMES.default;
  const root  = document.documentElement;
  // Limpiar vars de temas anteriores
  Object.values(THEMES).forEach(t => Object.keys(t.vars).forEach(v => root.style.removeProperty(v)));
  // Aplicar vars del tema nuevo
  Object.entries(theme.vars).forEach(function(entry) { root.style.setProperty(entry[0], entry[1]); });
  // Forzar dark mode si el tema lo requiere
  if (!skipDarkSync && theme.dark) {
    document.body.classList.add('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = '☀️';
    try { localStorage.setItem('diusf_theme', 'dark'); } catch(_) {}
  }
  _themeName = name;
  document.body.dataset.diusfTheme = name;
  try { localStorage.setItem('diusf_theme_name', name); } catch(_) {}
  document.querySelectorAll('.vis-theme-chip').forEach(function(c) {
    c.classList.toggle('active', c.dataset.theme === name);
  });
}

function initThemePicker() {
  const container = document.getElementById('theme-picker');
  if (!container) return;
  Object.entries(THEMES).forEach(function(entry) {
    var key = entry[0]; var t = entry[1];
    const btn = document.createElement('button');
    btn.className = 'vis-theme-chip' + (key === _themeName ? ' active' : '');
    btn.dataset.theme = key;
    btn.title = t.label;
    btn.setAttribute('aria-label', 'Tema ' + t.label);
    btn.innerHTML = '<span class="vis-theme-icon">' + t.icon + '</span><span class="vis-theme-label">' + t.label + '</span>';
    container.appendChild(btn);
  });
}

/* ═══════════════ T13 — VISTA PREVIA EN CONTEXTO ═══════════════ */
let _ctxStyleId  = null;
let _ctxPlatform = 'discord';

function escHtml(t) {
  return String(t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function renderCtxPreview(text, platform) {
  const body = document.getElementById('ctx-body');
  if (!body) return;
  const t = escHtml(text);
  var html = '';
  if (platform === 'discord') {
    html = '<div class="ctx-discord"><div class="ctx-dc-sidebar"><div class="ctx-dc-server">D</div></div><div class="ctx-dc-main"><div class="ctx-dc-header"><span class="ctx-dc-hash">#</span> general</div><div class="ctx-dc-messages"><div class="ctx-dc-msg"><div class="ctx-dc-avatar">U</div><div class="ctx-dc-content"><div class="ctx-dc-meta"><span class="ctx-dc-name">usuario</span><span class="ctx-dc-time">hoy a las 12:00</span></div><div class="ctx-dc-text">' + t + '</div></div></div></div></div></div>';
  } else if (platform === 'instagram') {
    html = '<div class="ctx-instagram"><div class="ctx-ig-top"><div class="ctx-ig-avatar">U</div><div class="ctx-ig-info"><div class="ctx-ig-handle">usuario</div><div class="ctx-ig-bio">' + t + '</div></div></div><div class="ctx-ig-stats"><div class="ctx-ig-stat"><strong>42</strong><span>posts</span></div><div class="ctx-ig-stat"><strong>1.2K</strong><span>seguidores</span></div><div class="ctx-ig-stat"><strong>318</strong><span>siguiendo</span></div></div><div class="ctx-ig-btn">Editar perfil</div></div>';
  } else if (platform === 'tiktok') {
    html = '<div class="ctx-tiktok"><div class="ctx-tt-avatar">U</div><div class="ctx-tt-handle">@usuario</div><div class="ctx-tt-name">' + t + '</div><div class="ctx-tt-stats"><div class="ctx-tt-stat"><strong>124</strong><span>siguiendo</span></div><div class="ctx-tt-stat"><strong>4.5K</strong><span>seguidores</span></div><div class="ctx-tt-stat"><strong>18K</strong><span>♥</span></div></div><div class="ctx-tt-btn">Editar perfil</div></div>';
  } else if (platform === 'twitter') {
    html = '<div class="ctx-twitter"><div class="ctx-tw-header"><div class="ctx-tw-avatar">U</div><div class="ctx-tw-meta"><span class="ctx-tw-name">Nombre Usuario</span> <span class="ctx-tw-handle">@usuario_handle</span></div></div><div class="ctx-tw-tweet">' + t + '</div><div class="ctx-tw-actions"><span>💬 12</span><span>🔁 5</span><span>❤️ 48</span><span>📊 1.2K</span></div></div>';
  }
  body.innerHTML = html;
}

function openCtxModal(sid) {
  const modal = document.getElementById('ctx-modal');
  if (!modal) return;
  const { STYLES, convert } = window.DIUSF;
  const style = STYLES.find(function(s) { return s.id === sid; });
  if (!style) return;
  _ctxStyleId = sid;
  // Preferir plataforma del estilo que tenga template
  const ctxPlats = ['discord','instagram','tiktok','twitter'];
  const preferred = (style.platforms || []).find(function(p) { return ctxPlats.includes(p); });
  _ctxPlatform = preferred || 'discord';
  const result = convert(_text || 'DIUSF', style) || _text;
  // Header del modal
  const nameEl = document.getElementById('ctx-style-name');
  if (nameEl) nameEl.textContent = style.name;
  // Tabs
  modal.querySelectorAll('.ctx-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.platform === _ctxPlatform);
  });
  renderCtxPreview(result, _ctxPlatform);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCtxModal() {
  const modal = document.getElementById('ctx-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  _ctxStyleId = null;
}

function bindCtxModal() {
  const modal = document.getElementById('ctx-modal');
  if (!modal) return;
  modal.querySelector('.ctx-close')?.addEventListener('click', closeCtxModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeCtxModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeCtxModal(); });
  modal.querySelectorAll('.ctx-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      _ctxPlatform = tab.dataset.platform;
      modal.querySelectorAll('.ctx-tab').forEach(function(t) { t.classList.toggle('active', t === tab); });
      if (_ctxStyleId) {
        const { STYLES, convert } = window.DIUSF;
        const style = STYLES.find(function(s) { return s.id === _ctxStyleId; });
        if (style) renderCtxPreview(convert(_text || 'DIUSF', style) || _text, _ctxPlatform);
      }
    });
  });
  modal.querySelector('.ctx-copy-btn')?.addEventListener('click', function() {
    if (!_ctxStyleId) return;
    const { STYLES, convert } = window.DIUSF;
    const style = STYLES.find(function(s) { return s.id === _ctxStyleId; });
    if (style) copy(convert(_text, style) || _text, null, null, _ctxStyleId);
  });
}

/* ═════════════════════ FEATURE 17 — Twitter/X doble conteo ═════════════════════ */
function twitterLength(text) {
  let len = 0;
  for (const c of text) { len += c.codePointAt(0) > 0xFFFF ? 2 : 1; }
  return len;
}

function checkTwitterWarning(result, sid) {
  const chip = document.getElementById('tw-' + sid);
  if (!chip) return;
  const tw   = twitterLength(result);
  const real = [...result].length;
  const hasDouble = tw > real;
  chip.classList.toggle('show', hasDouble);
  if (hasDouble) {
    chip.textContent = '𝕏 ' + tw;
    chip.title = 'Twitter/X cuenta ' + tw + ' caracteres (algunos valen 2). Límite: 280.';
  }
}

let _twWarnDismissed = false;

function checkGlobalTwitterWarning(text) {
  if (_twWarnDismissed) return;
  const { STYLES, convert } = window.DIUSF;
  const vis    = getVisible(STYLES);
  const warnEl = document.getElementById('twitter-warn-global');
  const warnTx = document.getElementById('twitter-warn-text');
  if (!warnEl) return;
  let maxDouble = 0, maxStyle = null;
  vis.forEach(function(s) {
    const r    = convert(text, s) || text;
    const tw   = twitterLength(r);
    const real = [...r].length;
    if (tw - real > maxDouble) { maxDouble = tw - real; maxStyle = s; }
  });
  if (maxDouble > 0 && maxStyle && text.length > 0) {
    const ex = convert(text, maxStyle);
    const tw = twitterLength(ex);
    const displayText = text.length > 30 ? text.slice(0, 28) + '…' : text;
    warnTx.textContent = '"' + maxStyle.name + '" → ' + tw + ' chars en 𝕏 (tu texto: "' + displayText + '")';
    warnEl.classList.add('show');
  } else {
    warnEl.classList.remove('show');
  }
}

/* ═════════════════════ FEATURE 18 — Exportar .txt ═════════════════════ */
function exportTxt() {
  const { STYLES, convert } = window.DIUSF;
  const vis = getVisible(STYLES);
  const lines = [
    'DIUSF — Exportación de estilos Unicode',
    'Texto: "' + _text + '"',
    'Fecha: ' + new Date().toLocaleString('es'),
    'Estilos: ' + vis.length,
    '─'.repeat(48), ''
  ];
  vis.forEach(function(s) {
    const result = convert(_text, s) || _text;
    const tw   = twitterLength(result);
    const real = [...result].length;
    const twNote = tw > real ? ' [Twitter/X: ' + tw + ' chars]' : '';
    lines.push('[' + s.name + '] — ' + s.use);
    lines.push(result + twNote);
    lines.push('');
  });
  lines.push('─'.repeat(48));
  lines.push('Generado con DIUSF · fuentes unicode gratis');
  const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'diusf-' + (_text.slice(0,20).replace(/\s+/g,'_') || 'export') + '.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(vis.length + ' estilos exportados como .txt', '↓');
}

/* ═════════════════════ FEATURE 19 — Analytics ═════════════════════ */
function renderAnalytics() {
  const listEl = document.getElementById('analytics-list');
  if (!listEl) return;
  const { STYLES } = window.DIUSF;
  const entries = Object.entries(_popularity).sort(function(a,b){return b[1]-a[1];}).slice(0, 8);
  if (entries.length === 0) {
    listEl.innerHTML = '<p class="analytics-empty">Aún no hay datos — ¡empieza copiando estilos!</p>';
    return;
  }
  const maxVal = entries[0][1];
  listEl.innerHTML = entries.map(function(entry, i) {
    var sid = entry[0]; var count = entry[1];
    const style = STYLES.find(function(s) { return s.id === sid; });
    const name  = style ? style.name : sid;
    const pct   = Math.round((count / maxVal) * 100);
    const color = (style && style.col) ? style.col : '#007AFF';
    return '<div class="analytics-item"><span class="analytics-rank">' + (i+1) + '</span><span class="analytics-label">' + name + '</span><div class="analytics-bar-track" style="flex:1"><div class="analytics-bar-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + color + ',#AF52DE)"></div></div><span class="analytics-count">' + count + '</span></div>';
  }).join('');
}

/* ═════════════════════ FEATURE 20 — Tests unicode.js ═════════════════════ */
const UNICODE_TESTS = [
  { name:'convert() — vacio devuelve cadena vacía', fn:function(d){ var r=d.convert('',d.STYLES[0]); if(r!=='') throw new Error("Esperado '' pero got '"+r+"'"); } },
  { name:'Serif Bold — A → 𝐀 (U+1D400)', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='serif-bold';}); if(!s) throw new Error('serif-bold no encontrado'); var r=d.convert('A',s); if(r!=='𝐀') throw new Error("got '"+r+"'"); } },
  { name:'Serif Bold — dígito 1 → 𝟏', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='serif-bold';}); if(!s) throw new Error('no encontrado'); var r=d.convert('1',s); if(r!=='𝟏') throw new Error("got '"+r+"'"); } },
  { name:'Strikethrough — combina U+0336', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='strikethrough';}); if(!s) throw new Error('no encontrado'); var r=d.convert('AB',s); if(!r.includes('\u0336')) throw new Error('No U+0336'); if([...r].length!==4) throw new Error('len '+[...r].length); } },
  { name:'Upsidedown — invierte y voltea', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='upsidedown';}); if(!s) throw new Error('no encontrado'); var r=d.convert('ab',s); if(!r.includes('q')||!r.includes('ɐ')) throw new Error("'"+r+"'"); } },
  { name:'Script — exceptions B→ℬ', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='script';}); if(!s) throw new Error('no encontrado'); var r=d.convert('B',s); if(r!=='ℬ') throw new Error("got '"+r+"'"); } },
  { name:'Circled — A → Ⓐ', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='circled';}); if(!s) throw new Error('no encontrado'); var r=d.convert('A',s); if(r!=='Ⓐ') throw new Error("got '"+r+"'"); } },
  { name:'Full Width — a → ａ (U+FF41)', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='fullwidth';}); if(!s) throw new Error('no encontrado'); var r=d.convert('a',s); if(r.codePointAt(0)!==0xFF41) throw new Error('U+'+r.codePointAt(0).toString(16)); } },
  { name:'Star Deco — prefijo y sufijo ★', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='stardeco';}); if(!s) throw new Error('no encontrado'); var r=d.convert('hi',s); if(!r.startsWith('★')||!r.endsWith('★')) throw new Error("'"+r+"'"); } },
  { name:'twitterLength — suplementario = 2', fn:function(){ if(twitterLength('𝐀')!==2) throw new Error('esperado 2'); } },
  { name:'twitterLength — ASCII = 1 por char', fn:function(){ if(twitterLength('Hello')!==5) throw new Error('esperado 5'); } },
  { name:'convert() — no-mapeados pasan sin cambio', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='serif-bold';}); if(!s) throw new Error('no encontrado'); var r=d.convert('!?',s); if(r!=='!?') throw new Error("got '"+r+"'"); } },
  { name:'STYLES — todos tienen id, name, cat', fn:function(d){ var bad=d.STYLES.filter(function(s){return !s.id||!s.name||!s.cat;}); if(bad.length>0) throw new Error(bad.length+' estilos sin campos'); } },
  { name:'Runic — convierte vocales conocidas', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='runic';}); if(!s) throw new Error('no encontrado'); var r=d.convert('a',s); if(r!=='ᚨ') throw new Error("got '"+r+"'"); } },
  { name:'Wide Spaced — inserta espacios', fn:function(d){ var s=d.STYLES.find(function(x){return x.id==='wide-spaced';}); if(!s) throw new Error('no encontrado'); var r=d.convert('AB',s); if(r!=='A B') throw new Error("got '"+r+"'"); } },
];

function runTests() {
  if (!window.DIUSF) { toast('unicode.js no cargado', '⚠'); return; }
  const listEl = document.getElementById('test-results-list');
  const summEl = document.getElementById('test-summary');
  if (!listEl) return;
  listEl.innerHTML = '';
  let pass = 0, fail = 0;
  UNICODE_TESTS.forEach(function(t) {
    const item = document.createElement('div');
    try {
      t.fn(window.DIUSF);
      item.className = 'test-result-item pass';
      item.innerHTML = '<span class="test-ico">✓</span><div><span class="test-name">' + t.name + '</span></div>';
      pass++;
    } catch(e) {
      item.className = 'test-result-item fail';
      item.innerHTML = '<span class="test-ico">✗</span><div><span class="test-name">' + t.name + '</span><span class="test-detail">' + e.message + '</span></div>';
      fail++;
    }
    listEl.appendChild(item);
  });
  if (summEl) {
    summEl.style.display = '';
    summEl.textContent = pass + ' pasados · ' + fail + ' fallidos · ' + UNICODE_TESTS.length + ' total';
    summEl.style.color = fail > 0 ? '#b52020' : '#1a7a30';
  }
  toast('Tests: ' + pass + '/' + UNICODE_TESTS.length + ' ✓', fail > 0 ? '⚠' : '✓');
}

/* ═════════════════════ TOAST ═════════════════════ */
let _toastTimer = null;
function toast(msg, ico) {
  ico = ico || '✓';
  const el  = document.getElementById('toast');
  const msg_ = document.getElementById('t-msg');
  const ico_ = document.getElementById('t-ico');
  if (!el) return;
  msg_.textContent = msg;
  ico_.textContent = ico;
  el.classList.add('on');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { el.classList.remove('on'); }, 2500);
}

/* ═════════════════════ CLIPBOARD ═════════════════════ */
async function copy(text, btn, cardEl, sid) {
  sid = sid || null;
  if (!text) return;
  const onOk = function() {
    _copied++;
    const sc = document.getElementById('stat-c');
    if (sc) sc.textContent = _copied;
    if (sid) trackCopy(sid);
    toast('Copiado · Pega en Discord, Instagram, Steam…', '✓');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓'; btn.classList.add('ok');
      setTimeout(function() { btn.textContent = orig; btn.classList.remove('ok'); }, 1700);
    }
    if (cardEl) { cardEl.classList.add('flash'); setTimeout(function() { cardEl.classList.remove('flash'); }, 700); }
  };
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); onOk(); return; } catch (_) {}
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    Object.assign(ta.style, { position:'fixed', top:'-999px', left:'-999px', opacity:'0' });
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    ok ? onOk() : toast('Selecciona el texto y pulsa Ctrl+C', '⚠');
  } catch(e) { toast('Ctrl+C para copiar manualmente', '⚠'); }
}

/* ═════════════════════ SHARE ═════════════════════ */
function buildShareUrl(text) {
  const base = location.origin + location.pathname.replace(/\/+$/, '') + '/';
  if (!text || text === 'DIUSF') return base;
  return base + '?t=' + encodeURIComponent(text);
}
async function shareAll() {
  const { STYLES, convert } = window.DIUSF;
  const vis = getVisible(STYLES);
  const firstResult = vis.length ? (convert(_text, vis[0]) || _text) : _text;
  const shareUrl = buildShareUrl(_text);
  if (navigator.share) {
    try { await navigator.share({ title:'DIUSF — ' + _text, text:firstResult, url:shareUrl }); return; }
    catch (_) {}
  }
  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(shareUrl); toast('URL copiada · comparte el enlace', '🔗'); return; } catch (_) {}
  }
  toast('Comparte: ' + shareUrl, '🔗');
}
function readUrlParam() {
  try {
    const t = new URLSearchParams(location.search).get('t');
    if (t && t.trim().length > 0) return t.trim().slice(0, 200);
  } catch (_) {}
  return null;
}

/* ═════════════════════ FILTER / SORT ═════════════════════ */
function getVisible(src) {
  const q = _query.toLowerCase().trim();
  let list;
  if (_sort === 'popular') {
    list = [...src].sort(function(a,b) { return (_popularity[b.id]||0) - (_popularity[a.id]||0); });
  } else if (_sort === 'recent') {
    const idxOf = function(id) { const i = _recentOrder.indexOf(id); return i === -1 ? 99999 : i; };
    list = [...src].sort(function(a,b) { return idxOf(a.id) - idxOf(b.id); });
  } else if (_sort === 'alpha') {
    list = [...src].sort(function(a,b) { return a.name.localeCompare(b.name, 'es'); });
  } else if (_order) {
    list = _order;
  } else {
    list = src;
  }
  if (_platform) list = list.filter(function(s) { return s.platforms && s.platforms.includes(_platform); });
  if (_cat === '__favs__') {
    list = list.filter(function(s) { return _favs.has(s.id); });
  } else if (_cat) {
    list = list.filter(function(s) { return s.cat === _cat; });
  }
  if (q) {
    list = list.filter(function(s) {
      return s.name.toLowerCase().includes(q) ||
             s.use.toLowerCase().includes(q) ||
             (s.platforms || []).some(function(p) { return p.includes(q); });
    });
  }
  return list;
}

/* ═════════════════════ RENDER ═════════════════════ */
function render() {
  const { STYLES, convert } = window.DIUSF;
  const list   = document.getElementById('cards');
  const noRes  = document.getElementById('no-res');
  const cntEl  = document.getElementById('s-count');
  const infoEl = document.getElementById('tb-info');

  const vis = getVisible(STYLES);
  if (cntEl)  cntEl.textContent  = vis.length + ' estilo' + (vis.length !== 1 ? 's' : '');
  if (infoEl) infoEl.textContent = (_query||_cat||_platform) ? (vis.length + ' resultado' + (vis.length!==1?'s':'')) : '';
  noRes.classList.toggle('show', vis.length === 0);

  const top3 = Object.entries(_popularity).sort(function(a,b){return b[1]-a[1];}).slice(0,3).map(function(e){return e[0];});
  const platLimit = _platform && PLATFORM_LIMITS[_platform] ? PLATFORM_LIMITS[_platform] : null;

  const targetIds = [];
  vis.forEach(function(s, i) {
    targetIds.push('card-' + s.id);
    if (i === 9) targetIds.push('ad-mid');
  });

  Array.from(list.children).forEach(function(el) {
    const id = el.dataset.nodeId;
    if (!id || !targetIds.includes(id)) el.remove();
  });

  vis.forEach(function(s, i) {
    const nodeId = 'card-' + s.id;
    const result = convert(_text, s) || _text;
    const isFav  = _favs.has(s.id);
    const resLen = [...result].length;
    const twLen  = twitterLength(result);
    const hasDoubleCount = twLen > resLen;
    const isTop  = top3.includes(s.id) && (_popularity[s.id]||0) > 0;
    const limitHtml = makeLimitChipHtml(resLen, _platform);

    let el = list.querySelector('[data-node-id="' + nodeId + '"]');
    if (!el) {
      el = document.createElement('div');
      el.className = 'card' + (isFav ? ' faved' : '');
      el.dataset.sid    = s.id;
      el.dataset.nodeId = nodeId;
      el.style.animationDelay = Math.min(0.22 + i * 0.022, 0.55) + 's';
      el.setAttribute('role', 'listitem');
      el.innerHTML =
        '<div class="card-body">' +
          '<div class="card-meta">' +
            '<div class="meta-left">' +
              '<div class="style-badge">' +
                '<span class="badge-dot" style="background:' + s.col + '"></span>' +
                '<span class="badge-name">' + s.name + '</span>' +
              '</div>' +
              '<span class="badge-use">' + s.use + '</span>' +
              '<span class="pop-badge' + (isTop?' show':'') + '" id="pop-' + s.id + '">🔥 Popular</span>' +
            '</div>' +
            '<div class="card-actions">' +
              '<button class="fav-btn' + (isFav?' faved':'') + '" data-sid="' + s.id + '" aria-label="' + (isFav?'Quitar favorito':'Guardar favorito') + '">' +
                '<span class="fav-ico" aria-hidden="true">' + (isFav?'★':'☆') + '</span>' +
                '<span class="fav-label">' + (isFav?'Guardado':'Favorito') + '</span>' +
              '</button>' +
              '<button class="ctx-btn" data-sid="' + s.id + '" aria-label="Vista previa en plataforma" title="Ver en contexto">👁</button>' +
              '<button class="copy-btn" data-sid="' + s.id + '" aria-label="Copiar ' + s.name + '">Copiar</button>' +
            '</div>' +
          '</div>' +
          '<div class="preview" data-sid="' + s.id + '" role="button" tabindex="0" aria-label="' + s.name + ': ' + result + '" id="pv-' + s.id + '">' + result + '</div>' +
          '<div class="card-footer" id="card-footer-' + s.id + '">' +
            '<span class="result-chars" id="rc-' + s.id + '">' + resLen + ' car.</span>' +
            limitHtml +
            '<span class="tw-warn-chip' + (hasDoubleCount?' show':'') + '" id="tw-' + s.id + '" title="' + (hasDoubleCount?'Twitter/X: '+twLen+' chars (algunos valen 2)':'') + '">' + (hasDoubleCount?'𝕏 '+twLen:'') + '</span>' +
          '</div>' +
        '</div>';
    } else {
      const pv = el.querySelector('.preview');
      if (pv && pv.textContent !== result) {
        pv.textContent = result;
        const rc = el.querySelector('.result-chars');
        if (rc) rc.textContent = resLen + ' car.';
        checkTwitterWarning(result, s.id);
      }
      // Update limit chip
      const footer = el.querySelector('.card-footer');
      if (footer) {
        const existing = footer.querySelector('.limit-chip');
        if (existing) existing.remove();
        if (limitHtml) {
          const rc = footer.querySelector('.result-chars');
          if (rc) rc.insertAdjacentHTML('afterend', limitHtml);
        }
      }
      el.classList.toggle('faved', isFav);
      const fb = el.querySelector('.fav-btn');
      if (fb) {
        const ico = fb.querySelector('.fav-ico');
        const lbl = fb.querySelector('.fav-label');
        if (ico) ico.textContent = isFav ? '★' : '☆';
        if (lbl) lbl.textContent = isFav ? 'Guardado' : 'Favorito';
        fb.classList.toggle('faved', isFav);
        fb.setAttribute('aria-label', isFav ? 'Quitar favorito' : 'Guardar favorito');
      }
      const pb = el.querySelector('.pop-badge');
      if (pb) pb.classList.toggle('show', isTop);
    }

    const currentAt  = Array.from(list.children).indexOf(el);
    const shouldBeAt = i + (i >= 10 ? 1 : 0);
    if (currentAt !== shouldBeAt) {
      const refNode = list.children[shouldBeAt] || null;
      list.insertBefore(el, refNode);
    }

    if (i === 9) {
      const adId = 'ad-mid';
      let adEl = list.querySelector('[data-node-id="' + adId + '"]');
      if (!adEl) {
        adEl = document.createElement('div');
        adEl.className = 'ad-slot mid';
        adEl.dataset.nodeId = adId;
        adEl.setAttribute('role', 'complementary');
        adEl.setAttribute('aria-label', 'Publicidad');
        adEl.textContent = '[ AdSense — 728×90 ]';
        el.after(adEl);
      }
    }
  });

  checkGlobalTwitterWarning(_text);
}

/* ═════════════════════ UPDATE PREVIEWS ═════════════════════ */
function updatePreviews() {
  const { STYLES, convert } = window.DIUSF;
  const platLimit = _platform && PLATFORM_LIMITS[_platform] ? PLATFORM_LIMITS[_platform] : null;
  STYLES.forEach(function(s) {
    const pvEl = document.getElementById('pv-' + s.id);
    if (!pvEl) return;
    const result = convert(_text, s) || _text;
    pvEl.textContent = result;
    const rc = document.getElementById('rc-' + s.id);
    if (rc) rc.textContent = [...result].length + ' car.';
    checkTwitterWarning(result, s.id);
    // Actualizar limit chip
    const footer = document.getElementById('card-footer-' + s.id);
    if (footer) {
      const existing = footer.querySelector('.limit-chip');
      if (existing) existing.remove();
      const html = makeLimitChipHtml([...result].length, _platform);
      if (html) {
        const rcEl = footer.querySelector('.result-chars');
        if (rcEl) rcEl.insertAdjacentHTML('afterend', html);
      }
    }
  });
  checkGlobalTwitterWarning(_text);
}

/* ═════════════════════ RAF BATCHING ═════════════════════ */
let _rafPending = false;
function scheduleUpdate() {
  if (_rafPending) return;
  _rafPending = true;
  requestAnimationFrame(function() { updatePreviews(); _rafPending = false; });
}

/* ═════════════════════ COPY ALL ═════════════════════ */
function copyAll() {
  const { STYLES, convert } = window.DIUSF;
  const vis = getVisible(STYLES);
  const all = vis.map(function(s) { return s.name + ':\n' + (convert(_text, s) || _text); }).join('\n\n');
  copy(all, null, null);
  toast(vis.length + ' estilos copiados', '⊕');
}

/* ═════════════════════ SHUFFLE ═════════════════════ */
function shuffle() {
  const { STYLES } = window.DIUSF;
  _order = [...STYLES].sort(function() { return Math.random() - .5; });
  _sort  = 'default';
  updateSortChips('default');
  render();
  toast('Orden mezclado', '⇄');
}

function updateSortChips(active) {
  document.querySelectorAll('.sort-chip').forEach(function(c) {
    c.classList.toggle('active', c.dataset.sort === active);
  });
}

/* ═════════════════════ CHAR COUNT ═════════════════════ */
function updateCharCount(val) {
  const el = document.getElementById('char-count');
  if (!el) return;
  const len = val.length;
  el.textContent = len + ' / 200';
  el.style.color = len > 180 ? '#FF3B30' : '';
}

/* ═════════════════════ EVENTS ═════════════════════ */
function bindEvents() {
  const inp = document.getElementById('main-input');
  const clr = document.getElementById('clear-x');
  const syncClear = function() { clr.classList.toggle('on', inp.value.length > 0); };
  let _histDeb = null;

  inp.addEventListener('input', function(e) {
    _text = e.target.value;
    syncClear();
    updateCharCount(_text);
    scheduleUpdate();
    history.replaceState(null, '', buildShareUrl(_text));
    clearTimeout(_histDeb);
    if (_text.trim().length > 1) _histDeb = setTimeout(function() { pushHistory(_text); }, 800);
  });
  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      inp.value = ''; _text = '';
      syncClear(); updateCharCount(''); scheduleUpdate();
      history.replaceState(null, '', buildShareUrl(''));
    }
  });
  clr.addEventListener('click', function() {
    inp.value = ''; _text = '';
    syncClear(); updateCharCount(''); scheduleUpdate(); inp.focus();
    history.replaceState(null, '', buildShareUrl(''));
  });

  /* Search */
  const srch = document.getElementById('s-input');
  let sdeb;
  srch.addEventListener('input', function(e) {
    clearTimeout(sdeb);
    sdeb = setTimeout(function() { _query = e.target.value; render(); }, 100);
  });

  /* History chips */
  const histEl = document.getElementById('history-chips');
  if (histEl) {
    histEl.addEventListener('click', function(e) {
      if (e.target.classList.contains('history-chip-x')) {
        const chip = e.target.closest('.history-chip');
        const text = chip && chip.querySelector('.history-chip-text') && chip.querySelector('.history-chip-text').textContent;
        if (text) { _history = _history.filter(function(x) { return x !== text; }); saveHistory(); renderHistory(); }
        return;
      }
      const chip = e.target.closest('.history-chip');
      if (!chip) return;
      const text = chip.querySelector('.history-chip-text') && chip.querySelector('.history-chip-text').textContent;
      if (!text) return;
      inp.value = text; _text = text;
      syncClear(); updateCharCount(_text); scheduleUpdate(); inp.focus();
      history.replaceState(null, '', buildShareUrl(_text));
    });
  }

  /* Platform chips */
  const platEl = document.getElementById('platform-chips');
  if (platEl) {
    platEl.addEventListener('click', function(e) {
      const chip = e.target.closest('.plat-chip');
      if (!chip) return;
      platEl.querySelectorAll('.plat-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      _platform = chip.dataset.platform === '' ? null : chip.dataset.platform;
      render();
    });
  }

  /* Sort chips */
  const sortEl = document.getElementById('sort-chips');
  if (sortEl) {
    sortEl.addEventListener('click', function(e) {
      const chip = e.target.closest('.sort-chip');
      if (!chip) return;
      sortEl.querySelectorAll('.sort-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      _sort = chip.dataset.sort;
      _order = null;
      render();
    });
  }

  /* Category chips */
  const chipsEl = document.getElementById('cat-chips');
  chipsEl.addEventListener('click', function(e) {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    chipsEl.querySelectorAll('.cat-chip').forEach(function(c) { c.classList.remove('active'); });
    chip.classList.add('active');
    _cat = chip.dataset.cat === '' ? null : chip.dataset.cat;
    render();
  });

  /* Cards — delegation */
  const cardsList = document.getElementById('cards');
  cardsList.addEventListener('click', function(e) {
    // T13 ctx preview
    const ctxBtn = e.target.closest('.ctx-btn[data-sid]');
    if (ctxBtn) { openCtxModal(ctxBtn.dataset.sid); return; }

    const favBtn = e.target.closest('.fav-btn[data-sid]');
    if (favBtn) {
      const sid  = favBtn.dataset.sid;
      const card = favBtn.closest('.card');
      if (_favs.has(sid)) {
        _favs.delete(sid);
        favBtn.classList.remove('faved');
        favBtn.setAttribute('aria-label', 'Guardar favorito');
        if (card) card.classList.remove('faved');
        const ico = favBtn.querySelector('.fav-ico');
        const lbl = favBtn.querySelector('.fav-label');
        if (ico) ico.textContent = '☆';
        if (lbl) lbl.textContent = 'Favorito';
      } else {
        _favs.add(sid);
        favBtn.classList.add('faved');
        favBtn.setAttribute('aria-label', 'Quitar favorito');
        if (card) card.classList.add('faved');
        const ico = favBtn.querySelector('.fav-ico');
        const lbl = favBtn.querySelector('.fav-label');
        if (ico) ico.textContent = '★';
        if (lbl) lbl.textContent = 'Guardado';
        toast('★ Guardado en favoritos', '★');
      }
      saveFavs();
      if (_cat === '__favs__') render();
      return;
    }

    const btn  = e.target.closest('.copy-btn[data-sid]');
    const prev = e.target.closest('.preview[data-sid]');
    const sid  = (btn || prev) && (btn || prev).dataset.sid;
    if (!sid) return;
    const { STYLES, convert } = window.DIUSF;
    const s = STYLES.find(function(x) { return x.id === sid; });
    if (!s) return;
    const text   = convert(_text, s) || _text;
    const cardEl = e.target.closest('.card');
    copy(text, btn || null, cardEl, sid);
  });

  cardsList.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const prev = e.target.closest('.preview[data-sid]');
    if (!prev) return;
    e.preventDefault();
    const { STYLES, convert } = window.DIUSF;
    const s = STYLES.find(function(x) { return x.id === prev.dataset.sid; });
    if (s) copy(convert(_text, s) || _text, null, e.target.closest('.card'), s.id);
  });

  /* Toolbar */
  document.getElementById('btn-copy-all') && document.getElementById('btn-copy-all').addEventListener('click', copyAll);
  document.getElementById('btn-shuffle')  && document.getElementById('btn-shuffle').addEventListener('click', shuffle);

  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) {
    if (!navigator.share && !navigator.clipboard) { shareBtn.style.display = 'none'; }
    else shareBtn.addEventListener('click', shareAll);
  }

  /* Feature 18 — Export .txt */
  document.getElementById('btn-export-txt') && document.getElementById('btn-export-txt').addEventListener('click', exportTxt);

  /* Feature 20 — Run tests */
  document.getElementById('btn-run-tests') && document.getElementById('btn-run-tests').addEventListener('click', runTests);

  /* Dark/Light toggle */
  const themeBtn  = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const applyDark = function(dark) {
    document.body.classList.toggle('dark', dark);
    document.documentElement.classList.remove('dark-early');
    if (themeIcon) themeIcon.textContent = dark ? '☀️' : '🌙';
    try { localStorage.setItem('diusf_theme', dark ? 'dark' : 'light'); } catch(_) {}
  };
  try {
    const saved = localStorage.getItem('diusf_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDark(saved ? saved === 'dark' : prefersDark);
  } catch(_) {}
  if (themeBtn) themeBtn.addEventListener('click', function() { applyDark(!document.body.classList.contains('dark')); });

  /* Twitter dismiss */
  const dismissBtn = document.getElementById('twitter-warn-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', function() {
      _twWarnDismissed = true;
      const el = document.getElementById('twitter-warn-global');
      if (el) el.classList.remove('show');
    });
  }
  const inp2 = document.getElementById('main-input');
  if (inp2) inp2.addEventListener('input', function() { _twWarnDismissed = false; });

  /* will-change on hover */
  cardsList.addEventListener('mouseover', function(e) { const c = e.target.closest('.card'); if (c) c.style.willChange = 'transform'; });
  cardsList.addEventListener('mouseout',  function(e) { const c = e.target.closest('.card'); if (c) c.style.willChange = 'auto'; });

  /* T10 — Theme picker */
  const pickerEl = document.getElementById('theme-picker');
  if (pickerEl) {
    pickerEl.addEventListener('click', function(e) {
      const chip = e.target.closest('.vis-theme-chip');
      if (chip) applyTheme(chip.dataset.theme);
    });
  }

  /* T13 — Context preview modal */
  bindCtxModal();
}

/* ═════════════════════ COUNT-UP ═════════════════════ */
function countUp(el, target, duration) {
  duration = duration || 600;
  if (!el || target === 0) { if (el) el.textContent = target; return; }
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ═════════════════════ INIT ═════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  if (!window.DIUSF) { console.error('DIUSF: unicode.js must load before app.js'); return; }

  const { STYLES } = window.DIUSF;
  const n = STYLES.length;

  countUp(document.getElementById('stat-total'),   n);
  countUp(document.getElementById('footer-count'), n);

  const sCount = document.getElementById('s-count');
  if (sCount) sCount.textContent = n + ' estilo' + (n !== 1 ? 's' : '');

  const urlText = readUrlParam();
  const inp = document.getElementById('main-input');
  if (urlText && inp) { inp.value = urlText; _text = urlText; }
  if (inp) updateCharCount(inp.value);

  /* T10 — Restaurar tema */
  try {
    const savedTheme = localStorage.getItem('diusf_theme_name');
    if (savedTheme && THEMES[savedTheme]) applyTheme(savedTheme, true);
  } catch(_) {}
  initThemePicker();

  renderHistory();
  renderAnalytics();
  render();
  bindEvents();

  if (inp && inp.value) {
    const cx = document.getElementById('clear-x');
    if (cx) cx.classList.add('on');
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      reg.addEventListener('updatefound', function() {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', function() {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Nueva versión disponible — recarga para actualizar', '↻');
          }
        });
      });
    }).catch(function() {});
  }
});
