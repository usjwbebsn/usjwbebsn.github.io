/* ═══════════════════════════════════════════════════════════
   DIUSF — app.js v4
   Nuevas funcionalidades:
     16. robots.txt + sitemap.xml — ya incluidos en build
     17. Aviso caracteres Unicode doble en Twitter/X
     18. Exportar todo como .txt
     19. Analytics de qué estilos se copian más
     20. Tests para unicode.js
   + features v3: 6-15 incluidas
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

/* ── Popularidad (copias por estilo) — Feature 19 ── */
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
  renderAnalytics(); // Feature 19
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
    chip.setAttribute('aria-label', `Usar texto: ${item}`);
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

/* ═════════════════════ FEATURE 17 — Twitter/X doble conteo ═════════════════════ */
/* Caracteres de plano suplementario (> U+FFFF) se cuentan como 2 en Twitter */
function twitterLength(text) {
  let len = 0;
  for (const c of text) {
    len += c.codePointAt(0) > 0xFFFF ? 2 : 1;
  }
  return len;
}

function checkTwitterWarning(result, sid) {
  const chip = document.getElementById('tw-' + sid);
  if (!chip) return;
  const tw = twitterLength(result);
  const real = [...result].length;
  const hasDouble = tw > real;
  chip.classList.toggle('show', hasDouble);
  if (hasDouble) {
    chip.textContent = `𝕏 ${tw} chars`;
    chip.title = `Twitter/X cuenta ${tw} caracteres (algunos valen 2). Límite: 280.`;
  }
}

/* ── Twitter warning dismiss state ── */
let _twWarnDismissed = false;

function checkGlobalTwitterWarning(text) {
  if (_twWarnDismissed) return;
  const { STYLES, convert } = window.DIUSF;
  const vis = getVisible(STYLES);
  const warnEl = document.getElementById('twitter-warn-global');
  const warnText = document.getElementById('twitter-warn-text');
  if (!warnEl) return;

  let maxDouble = 0;
  let maxStyle = null;
  vis.forEach(s => {
    const result = convert(text, s) || text;
    const tw = twitterLength(result);
    const real = [...result].length;
    if (tw - real > maxDouble) {
      maxDouble = tw - real;
      maxStyle = s;
    }
  });

  if (maxDouble > 0 && maxStyle && text.length > 0) {
    const ex = convert(text, maxStyle);
    const tw = twitterLength(ex);
    // Truncate displayed text to 30 chars max to avoid overflow
    const displayText = text.length > 30 ? text.slice(0, 28) + '…' : text;
    warnText.textContent = `"${maxStyle.name}" → ${tw} chars en 𝕏 (tu texto: "${displayText}")`;
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
    `Texto: "${_text}"`,
    `Fecha: ${new Date().toLocaleString('es')}`,
    `Estilos: ${vis.length}`,
    '─'.repeat(48),
    ''
  ];
  vis.forEach(s => {
    const result = convert(_text, s) || _text;
    const tw = twitterLength(result);
    const real = [...result].length;
    const twNote = tw > real ? ` [Twitter/X: ${tw} chars]` : '';
    lines.push(`[${s.name}] — ${s.use}`);
    lines.push(result + twNote);
    lines.push('');
  });
  lines.push('─'.repeat(48));
  lines.push('Generado con DIUSF · fuentes unicode gratis');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `diusf-${_text.slice(0,20).replace(/\s+/g,'_') || 'export'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(`${vis.length} estilos exportados como .txt`, '↓');
}

/* ═════════════════════ FEATURE 19 — Analytics ═════════════════════ */
function renderAnalytics() {
  const listEl = document.getElementById('analytics-list');
  if (!listEl) return;
  const { STYLES } = window.DIUSF;

  const entries = Object.entries(_popularity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (entries.length === 0) {
    listEl.innerHTML = '<p class="analytics-empty">Aún no hay datos — ¡empieza copiando estilos!</p>';
    return;
  }

  const maxVal = entries[0][1];
  listEl.innerHTML = entries.map(([sid, count], i) => {
    const style = STYLES.find(s => s.id === sid);
    const name  = style ? style.name : sid;
    const pct   = Math.round((count / maxVal) * 100);
    const color = style?.col || '#007AFF';
    return `
      <div class="analytics-item">
        <span class="analytics-rank">${i + 1}</span>
        <span class="analytics-label">${name}</span>
        <div class="analytics-bar-track" style="flex:1">
          <div class="analytics-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,${color},#AF52DE)"></div>
        </div>
        <span class="analytics-count">${count}</span>
      </div>`;
  }).join('');
}

/* ═════════════════════ FEATURE 20 — Tests unicode.js ═════════════════════ */
const UNICODE_TESTS = [
  {
    name: 'convert() — vacio devuelve cadena vacía',
    fn: ({ convert, STYLES }) => {
      const r = convert('', STYLES[0]);
      if (r !== '') throw new Error(`Esperado '' pero got '${r}'`);
    }
  },
  {
    name: 'Serif Bold — A → 𝐀 (U+1D400)',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'serif-bold');
      if (!s) throw new Error('Estilo serif-bold no encontrado');
      const r = convert('A', s);
      if (r !== '𝐀') throw new Error(`Esperado '𝐀' pero got '${r}' (codePoint: ${r.codePointAt(0).toString(16)})`);
    }
  },
  {
    name: 'Serif Bold — dígito 1 → 𝟏 (U+1D7CF)',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'serif-bold');
      if (!s) throw new Error('Estilo serif-bold no encontrado');
      const r = convert('1', s);
      if (r !== '𝟏') throw new Error(`Esperado '𝟏' pero got '${r}'`);
    }
  },
  {
    name: 'Strikethrough — combina U+0336 en cada char',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'strikethrough');
      if (!s) throw new Error('Estilo strikethrough no encontrado');
      const r = convert('AB', s);
      if (!r.includes('\u0336')) throw new Error('No contiene U+0336');
      if ([...r].length !== 4) throw new Error(`Longitud esperada 4 (2 chars + 2 combining) pero got ${[...r].length}`);
    }
  },
  {
    name: 'Upsidedown — invierte y voltea letras',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'upsidedown');
      if (!s) throw new Error('Estilo upsidedown no encontrado');
      const r = convert('ab', s);
      // reversed: b→q, a→ɐ
      if (!r.includes('q') || !r.includes('ɐ')) throw new Error(`Resultado inesperado: '${r}'`);
    }
  },
  {
    name: 'Script — exceptions B→ℬ (U+212C)',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'script');
      if (!s) throw new Error('Estilo script no encontrado');
      const r = convert('B', s);
      if (r !== 'ℬ') throw new Error(`Esperado 'ℬ' pero got '${r}'`);
    }
  },
  {
    name: 'Circled — A → Ⓐ (U+24B6)',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'circled');
      if (!s) throw new Error('Estilo circled no encontrado');
      const r = convert('A', s);
      if (r !== 'Ⓐ') throw new Error(`Esperado 'Ⓐ' pero got '${r}'`);
    }
  },
  {
    name: 'Full Width — a → ａ (U+FF41)',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'fullwidth');
      if (!s) throw new Error('Estilo fullwidth no encontrado');
      const r = convert('a', s);
      if (r.codePointAt(0) !== 0xFF41) throw new Error(`Esperado U+FF41 pero got U+${r.codePointAt(0).toString(16).toUpperCase()}`);
    }
  },
  {
    name: 'Star Deco — añade prefijo y sufijo',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'stardeco');
      if (!s) throw new Error('Estilo stardeco no encontrado');
      const r = convert('hi', s);
      if (!r.startsWith('★') || !r.endsWith('★')) throw new Error(`Resultado sin estrellas: '${r}'`);
    }
  },
  {
    name: 'twitterLength — plano suplementario cuenta doble',
    fn: () => {
      const boldA = '𝐀'; // U+1D400 — supplementary
      const len = twitterLength(boldA);
      if (len !== 2) throw new Error(`Esperado 2 pero got ${len}`);
    }
  },
  {
    name: 'twitterLength — ASCII normal cuenta 1',
    fn: () => {
      const len = twitterLength('Hello');
      if (len !== 5) throw new Error(`Esperado 5 pero got ${len}`);
    }
  },
  {
    name: 'convert() — caracteres no mapeados pasan sin cambio',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'serif-bold');
      if (!s) throw new Error('Estilo serif-bold no encontrado');
      const r = convert('!?', s);
      if (r !== '!?') throw new Error(`Esperado '!?' pero got '${r}'`);
    }
  },
  {
    name: 'STYLES — todos tienen id, name, cat',
    fn: ({ STYLES }) => {
      const bad = STYLES.filter(s => !s.id || !s.name || !s.cat);
      if (bad.length > 0) throw new Error(`${bad.length} estilos sin id/name/cat: ${bad.map(s=>s.id||'?').join(', ')}`);
    }
  },
  {
    name: 'Runic — convierte vocales conocidas',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'runic');
      if (!s) throw new Error('Estilo runic no encontrado');
      const r = convert('a', s);
      if (r !== 'ᚨ') throw new Error(`Esperado 'ᚨ' pero got '${r}'`);
    }
  },
  {
    name: 'Wide Spaced — inserta espacios entre chars',
    fn: ({ convert, STYLES }) => {
      const s = STYLES.find(x => x.id === 'wide-spaced');
      if (!s) throw new Error('Estilo wide-spaced no encontrado');
      const r = convert('AB', s);
      if (r !== 'A B') throw new Error(`Esperado 'A B' pero got '${r}'`);
    }
  },
];

function runTests() {
  if (!window.DIUSF) { toast('unicode.js no cargado', '⚠'); return; }
  const listEl = document.getElementById('test-results-list');
  const summEl = document.getElementById('test-summary');
  if (!listEl) return;
  listEl.innerHTML = '';

  let pass = 0, fail = 0;
  UNICODE_TESTS.forEach(t => {
    const item = document.createElement('div');
    try {
      t.fn(window.DIUSF);
      item.className = 'test-result-item pass';
      item.innerHTML = `<span class="test-ico">✓</span><div><span class="test-name">${t.name}</span></div>`;
      pass++;
    } catch(e) {
      item.className = 'test-result-item fail';
      item.innerHTML = `<span class="test-ico">✗</span><div><span class="test-name">${t.name}</span><span class="test-detail">${e.message}</span></div>`;
      fail++;
    }
    listEl.appendChild(item);
  });

  if (summEl) {
    summEl.style.display = '';
    summEl.textContent = `${pass} pasados · ${fail} fallidos · ${UNICODE_TESTS.length} total`;
    summEl.style.color = fail > 0 ? '#b52020' : '#1a7a30';
  }
  toast(`Tests: ${pass}/${UNICODE_TESTS.length} ✓`, fail > 0 ? '⚠' : '✓');
}

/* ═════════════════════ TOAST ═════════════════════ */
let _toastTimer = null;
function toast(msg, ico = '✓') {
  const el   = document.getElementById('toast');
  const msg_ = document.getElementById('t-msg');
  const ico_ = document.getElementById('t-ico');
  if (!el) return;
  msg_.textContent = msg;
  ico_.textContent = ico;
  el.classList.add('on');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('on'), 2500);
}

/* ═════════════════════ CLIPBOARD ═════════════════════ */
async function copy(text, btn, cardEl, sid = null) {
  if (!text) return;
  const onOk = () => {
    _copied++;
    const sc = document.getElementById('stat-c');
    if (sc) sc.textContent = _copied;
    if (sid) trackCopy(sid);
    toast('Copiado · Pega en Discord, Instagram, Steam…', '✓');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('ok');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('ok'); }, 1700);
    }
    if (cardEl) {
      cardEl.classList.add('flash');
      setTimeout(() => cardEl.classList.remove('flash'), 700);
    }
  };
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); onOk(); return; } catch (_) {}
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    Object.assign(ta.style, { position:'fixed', top:'-999px', left:'-999px', opacity:'0' });
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    ok ? onOk() : toast('Selecciona el texto y pulsa Ctrl+C', '⚠');
  } catch (e) {
    toast('Ctrl+C para copiar manualmente', '⚠');
  }
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
    try { await navigator.share({ title: 'DIUSF — ' + _text, text: firstResult, url: shareUrl }); return; }
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
    list = [...src].sort((a, b) => (_popularity[b.id] || 0) - (_popularity[a.id] || 0));
  } else if (_sort === 'recent') {
    const idxOf = id => { const i = _recentOrder.indexOf(id); return i === -1 ? 99999 : i; };
    list = [...src].sort((a, b) => idxOf(a.id) - idxOf(b.id));
  } else if (_sort === 'alpha') {
    list = [...src].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } else if (_order) {
    list = _order;
  } else {
    list = src;
  }
  if (_platform) list = list.filter(s => s.platforms && s.platforms.includes(_platform));
  if (_cat === '__favs__') {
    list = list.filter(s => _favs.has(s.id));
  } else if (_cat) {
    list = list.filter(s => s.cat === _cat);
  }
  if (q) {
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.use.toLowerCase().includes(q)  ||
      (s.platforms || []).some(p => p.includes(q))
    );
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
  if (cntEl)  cntEl.textContent  = `${vis.length} estilo${vis.length !== 1 ? 's' : ''}`;
  if (infoEl) infoEl.textContent = (_query || _cat || _platform) ? `${vis.length} resultado${vis.length !== 1 ? 's' : ''}` : '';
  noRes.classList.toggle('show', vis.length === 0);

  // Top 3 popular IDs for badge
  const top3 = Object.entries(_popularity)
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

  const targetIds = [];
  vis.forEach((s, i) => {
    targetIds.push('card-' + s.id);
    if (i === 9) targetIds.push('ad-mid');
  });

  const existing = Array.from(list.children);
  const targetSet = new Set(targetIds);
  existing.forEach(el => {
    const id = el.dataset.nodeId;
    if (!id || !targetSet.has(id)) el.remove();
  });

  vis.forEach((s, i) => {
    const nodeId = 'card-' + s.id;
    const result = convert(_text, s) || _text;
    const isFav  = _favs.has(s.id);
    const resLen = [...result].length;
    const twLen  = twitterLength(result);
    const hasDoubleCount = twLen > resLen;
    const isTop  = top3.includes(s.id) && (_popularity[s.id] || 0) > 0;

    let el = list.querySelector(`[data-node-id="${nodeId}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'card' + (isFav ? ' faved' : '');
      el.dataset.sid    = s.id;
      el.dataset.nodeId = nodeId;
      el.style.animationDelay = `${Math.min(0.22 + i * 0.022, 0.55)}s`;
      el.setAttribute('role', 'listitem');
      el.innerHTML = `
        <div class="card-body">
          <div class="card-meta">
            <div class="meta-left">
              <div class="style-badge">
                <span class="badge-dot" style="background:${s.col}"></span>
                <span class="badge-name">${s.name}</span>
              </div>
              <span class="badge-use">${s.use}</span>
              <span class="pop-badge${isTop ? ' show' : ''}" id="pop-${s.id}">🔥 Popular</span>
            </div>
            <div class="card-actions">
              <button class="fav-btn${isFav ? ' faved' : ''}" data-sid="${s.id}"
                aria-label="${isFav ? 'Quitar favorito' : 'Guardar favorito'}">
                <span class="fav-ico" aria-hidden="true">${isFav ? '★' : '☆'}</span>
                <span class="fav-label">${isFav ? 'Guardado' : 'Favorito'}</span>
              </button>
              <button class="copy-btn" data-sid="${s.id}" aria-label="Copiar ${s.name}">Copiar</button>
            </div>
          </div>
          <div class="preview" data-sid="${s.id}" role="button" tabindex="0"
               aria-label="${s.name}: ${result}"
               id="pv-${s.id}">${result}</div>
          <div class="card-footer">
            <span class="result-chars" id="rc-${s.id}">${resLen} car.</span>
            <span class="tw-warn-chip${hasDoubleCount ? ' show' : ''}" id="tw-${s.id}"
              title="${hasDoubleCount ? `Twitter/X: ${twLen} chars (algunos valen 2)` : ''}">
              ${hasDoubleCount ? `𝕏 ${twLen}` : ''}
            </span>
          </div>
        </div>`;
    } else {
      const pv = el.querySelector('.preview');
      if (pv && pv.textContent !== result) {
        pv.textContent = result;
        const rc = el.querySelector('.result-chars');
        if (rc) rc.textContent = `${resLen} car.`;
        checkTwitterWarning(result, s.id);
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
      // Update pop badge
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
      let adEl = list.querySelector(`[data-node-id="${adId}"]`);
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

  // Global twitter warning check
  checkGlobalTwitterWarning(_text);
}

/* ═════════════════════ UPDATE PREVIEWS ═════════════════════ */
function updatePreviews() {
  const { STYLES, convert } = window.DIUSF;
  STYLES.forEach(s => {
    const el = document.getElementById('pv-' + s.id);
    if (el) {
      const result = convert(_text, s) || _text;
      el.textContent = result;
      const rc = document.getElementById('rc-' + s.id);
      if (rc) rc.textContent = `${[...result].length} car.`;
      checkTwitterWarning(result, s.id);
    }
  });
  checkGlobalTwitterWarning(_text);
}

/* ═════════════════════ RAF BATCHING ═════════════════════ */
let _rafPending = false;
function scheduleUpdate() {
  if (_rafPending) return;
  _rafPending = true;
  requestAnimationFrame(() => {
    updatePreviews();
    _rafPending = false;
  });
}

/* ═════════════════════ COPY ALL ═════════════════════ */
function copyAll() {
  const { STYLES, convert } = window.DIUSF;
  const vis = getVisible(STYLES);
  const all = vis.map(s => `${s.name}:\n${convert(_text, s) || _text}`).join('\n\n');
  copy(all, null, null);
  toast(`${vis.length} estilos copiados`, '⊕');
}

/* ═════════════════════ SHUFFLE ═════════════════════ */
function shuffle() {
  const { STYLES } = window.DIUSF;
  _order = [...STYLES].sort(() => Math.random() - .5);
  _sort  = 'default';
  updateSortChips('default');
  render();
  toast('Orden mezclado', '⇄');
}

function updateSortChips(active) {
  document.querySelectorAll('.sort-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.sort === active);
  });
}

/* ═════════════════════ CHAR COUNT ═════════════════════ */
function updateCharCount(val) {
  const el = document.getElementById('char-count');
  if (!el) return;
  const len = val.length;
  el.textContent = `${len} / 200`;
  el.style.color = len > 180 ? '#FF3B30' : '';
}

/* ═════════════════════ EVENTS ═════════════════════ */
function bindEvents() {
  const inp = document.getElementById('main-input');
  const clr = document.getElementById('clear-x');
  const syncClear = () => clr.classList.toggle('on', inp.value.length > 0);
  let _histDeb = null;

  inp.addEventListener('input', e => {
    _text = e.target.value;
    syncClear();
    updateCharCount(_text);
    scheduleUpdate();
    const url = buildShareUrl(_text);
    history.replaceState(null, '', url);
    clearTimeout(_histDeb);
    if (_text.trim().length > 1) {
      _histDeb = setTimeout(() => pushHistory(_text), 800);
    }
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      inp.value = ''; _text = '';
      syncClear(); updateCharCount(''); scheduleUpdate();
      history.replaceState(null, '', buildShareUrl(''));
    }
  });
  clr.addEventListener('click', () => {
    inp.value = ''; _text = '';
    syncClear(); updateCharCount(''); scheduleUpdate(); inp.focus();
    history.replaceState(null, '', buildShareUrl(''));
  });

  /* Search */
  const srch = document.getElementById('s-input');
  let sdeb;
  srch.addEventListener('input', e => {
    clearTimeout(sdeb);
    sdeb = setTimeout(() => { _query = e.target.value; render(); }, 100);
  });

  /* History chips */
  const histEl = document.getElementById('history-chips');
  if (histEl) {
    histEl.addEventListener('click', e => {
      if (e.target.classList.contains('history-chip-x')) {
        const chip = e.target.closest('.history-chip');
        const text = chip?.querySelector('.history-chip-text')?.textContent;
        if (text) { _history = _history.filter(x => x !== text); saveHistory(); renderHistory(); }
        return;
      }
      const chip = e.target.closest('.history-chip');
      if (!chip) return;
      const text = chip.querySelector('.history-chip-text')?.textContent;
      if (!text) return;
      inp.value = text; _text = text;
      syncClear(); updateCharCount(_text); scheduleUpdate(); inp.focus();
      history.replaceState(null, '', buildShareUrl(_text));
    });
  }

  /* Platform chips */
  const platEl = document.getElementById('platform-chips');
  if (platEl) {
    platEl.addEventListener('click', e => {
      const chip = e.target.closest('.plat-chip');
      if (!chip) return;
      platEl.querySelectorAll('.plat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _platform = chip.dataset.platform === '' ? null : chip.dataset.platform;
      render();
    });
  }

  /* Sort chips */
  const sortEl = document.getElementById('sort-chips');
  if (sortEl) {
    sortEl.addEventListener('click', e => {
      const chip = e.target.closest('.sort-chip');
      if (!chip) return;
      sortEl.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _sort  = chip.dataset.sort;
      _order = null;
      render();
    });
  }

  /* Category chips */
  const chipsEl = document.getElementById('cat-chips');
  chipsEl.addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    chipsEl.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    _cat = chip.dataset.cat === '' ? null : chip.dataset.cat;
    render();
  });

  /* Cards — delegation */
  const cardsList = document.getElementById('cards');
  cardsList.addEventListener('click', e => {
    const favBtn = e.target.closest('.fav-btn[data-sid]');
    if (favBtn) {
      const sid  = favBtn.dataset.sid;
      const card = favBtn.closest('.card');
      if (_favs.has(sid)) {
        _favs.delete(sid);
        favBtn.classList.remove('faved');
        favBtn.setAttribute('aria-label', 'Guardar favorito');
        card?.classList.remove('faved');
        const ico = favBtn.querySelector('.fav-ico');
        const lbl = favBtn.querySelector('.fav-label');
        if (ico) ico.textContent = '☆';
        if (lbl) lbl.textContent = 'Favorito';
      } else {
        _favs.add(sid);
        favBtn.classList.add('faved');
        favBtn.setAttribute('aria-label', 'Quitar favorito');
        card?.classList.add('faved');
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
    const sid  = (btn || prev)?.dataset.sid;
    if (!sid) return;
    const { STYLES, convert } = window.DIUSF;
    const s = STYLES.find(x => x.id === sid);
    if (!s) return;
    const text   = convert(_text, s) || _text;
    const cardEl = e.target.closest('.card');
    copy(text, btn ?? null, cardEl, sid);
  });

  cardsList.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const prev = e.target.closest('.preview[data-sid]');
    if (!prev) return;
    e.preventDefault();
    const { STYLES, convert } = window.DIUSF;
    const s = STYLES.find(x => x.id === prev.dataset.sid);
    if (s) copy(convert(_text, s) || _text, null, e.target.closest('.card'), s.id);
  });

  /* Toolbar */
  document.getElementById('btn-copy-all')?.addEventListener('click', copyAll);
  document.getElementById('btn-shuffle')?.addEventListener('click', shuffle);

  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) {
    if (!navigator.share && !navigator.clipboard) {
      shareBtn.style.display = 'none';
    } else {
      shareBtn.addEventListener('click', shareAll);
    }
  }

  /* Feature 18 — Export .txt */
  document.getElementById('btn-export-txt')?.addEventListener('click', exportTxt);

  /* Feature 20 — Run tests */
  document.getElementById('btn-run-tests')?.addEventListener('click', runTests);

  /* Dark/Light mode toggle */
  const themeBtn  = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const applyTheme = (dark) => {
    document.body.classList.toggle('dark', dark);
    document.documentElement.classList.remove('dark-early'); // limpiar anti-FOUC
    if (themeIcon) themeIcon.textContent = dark ? '☀️' : '🌙';
    try { localStorage.setItem('diusf_theme', dark ? 'dark' : 'light'); } catch(_) {}
  };
  // Restore saved theme
  try {
    const saved = localStorage.getItem('diusf_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved === 'dark' : prefersDark);
  } catch(_) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(!document.body.classList.contains('dark'));
    });
  }

  /* Twitter/X warning dismiss */
  const dismissBtn = document.getElementById('twitter-warn-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      _twWarnDismissed = true;
      document.getElementById('twitter-warn-global')?.classList.remove('show');
    });
  }
  // Re-show warning when user types again after dismissing
  const inp2 = document.getElementById('main-input');
  if (inp2) {
    inp2.addEventListener('input', () => { _twWarnDismissed = false; });
  }

  /* will-change on hover */
  cardsList.addEventListener('mouseover', e => {
    const c = e.target.closest('.card');
    if (c) c.style.willChange = 'transform';
  });
  cardsList.addEventListener('mouseout', e => {
    const c = e.target.closest('.card');
    if (c) c.style.willChange = 'auto';
  });
}

/* ═════════════════════ COUNT-UP ═════════════════════ */
function countUp(el, target, duration = 600) {
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
document.addEventListener('DOMContentLoaded', () => {
  if (!window.DIUSF) { console.error('DIUSF: unicode.js must load before app.js'); return; }

  const { STYLES } = window.DIUSF;
  const n = STYLES.length;

  countUp(document.getElementById('stat-total'),   n);
  countUp(document.getElementById('footer-count'), n);

  const sCount = document.getElementById('s-count');
  if (sCount) sCount.textContent = `${n} estilo${n !== 1 ? 's' : ''}`;

  const urlText = readUrlParam();
  const inp = document.getElementById('main-input');
  if (urlText && inp) { inp.value = urlText; _text = urlText; }
  if (inp) updateCharCount(inp.value);

  renderHistory();
  renderAnalytics();
  render();
  bindEvents();

  if (inp?.value) document.getElementById('clear-x')?.classList.add('on');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Nueva versión disponible — recarga para actualizar', '↻');
          }
        });
      });
    }).catch(() => {});
  }
});
