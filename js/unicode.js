/* ═══════════════════════════════════════════════════════════
   DIUSF — unicode.js
   Motor de conversión Unicode.
   Exporta: STYLES, convert(text, style)
═══════════════════════════════════════════════════════════ */
'use strict';

/** @type {Array<{id,name,use,col,cat,...}>} */
const STYLES = [
  /* ── Serif family ────────────────────────────────────── */
  { id:'serif-bold', platforms:['discord','instagram','whatsapp','steam'],        name:'Serif Bold',          use:'Word · Docs',           col:'#BF5AF2', cat:'bold',       upper:0x1D400, lower:0x1D41A, digits:0x1D7CE },
  { id:'serif-italic', platforms:['instagram','discord'],      name:'Serif Italic',        use:'Notas elegantes',       col:'#FF375F', cat:'italic',     upper:0x1D434, lower:0x1D44E, digits:null,
    lowerEx:{h:0x210E} },
  { id:'serif-bold-italic', platforms:['instagram','discord'], name:'Bold Italic',         use:'Títulos énfasis',       col:'#FF9F0A', cat:'italic',     upper:0x1D468, lower:0x1D482, digits:null },

  /* ── Script family ───────────────────────────────────── */
  { id:'script', platforms:['instagram','discord'],            name:'Script / Cursiva',    use:'Instagram · Bio',       col:'#FF375F', cat:'classic',    upper:0x1D49C, lower:0x1D4B6, digits:null,
    upperEx:{B:0x212C,E:0x2130,F:0x2131,H:0x210B,I:0x2110,L:0x2112,M:0x2133,R:0x211B},
    lowerEx:{e:0x212F,g:0x210A,o:0x2134} },
  { id:'script-bold', platforms:['instagram','discord'],       name:'Bold Script',         use:'Nombres de perfil',     col:'#FF9F0A', cat:'bold',       upper:0x1D4D0, lower:0x1D4EA, digits:null },

  /* ── Gothic / Fraktur ────────────────────────────────── */
  { id:'fraktur', platforms:['discord','steam'],           name:'Fraktur / Gótico',    use:'Discord · Gaming',      col:'#5E5CE6', cat:'classic',    upper:0x1D504, lower:0x1D51E, digits:null,
    upperEx:{C:0x212D,H:0x210C,I:0x2111,R:0x211C,Z:0x2128} },
  { id:'fraktur-bold', platforms:['discord','steam'],      name:'Bold Fraktur',        use:'Nombres épicos',        col:'#5AC8FA', cat:'bold',       upper:0x1D56C, lower:0x1D586, digits:null },

  /* ── Double Struck ───────────────────────────────────── */
  { id:'double-struck', platforms:['steam','discord','whatsapp'],     name:'Double Struck',       use:'Steam bio · Twitter',   col:'#30D158', cat:'classic',    upper:0x1D538, lower:0x1D552, digits:0x1D7D8,
    upperEx:{C:0x2102,H:0x210D,N:0x2115,P:0x2119,Q:0x211A,R:0x211D,Z:0x2124} },

  /* ── Sans-Serif family ───────────────────────────────── */
  { id:'sans', platforms:['discord','instagram','whatsapp','steam'],              name:'Sans-Serif',           use:'UI limpia',             col:'#64D2FF', cat:'classic',    upper:0x1D5A0, lower:0x1D5BA, digits:0x1D7E2 },
  { id:'sans-bold', platforms:['whatsapp','discord','instagram'],         name:'Sans Bold',            use:'WhatsApp · Telegram',  col:'#0A84FF', cat:'bold',       upper:0x1D5D4, lower:0x1D5EE, digits:0x1D7EC },
  { id:'sans-italic', platforms:['discord','instagram'],       name:'Sans Italic',          use:'Subtítulos',           col:'#BF5AF2', cat:'italic',     upper:0x1D608, lower:0x1D622, digits:null },
  { id:'sans-bold-italic', platforms:['discord','instagram'],  name:'Sans Bold Italic',     use:'Encabezados modernos', col:'#FF9F0A', cat:'italic',     upper:0x1D63C, lower:0x1D656, digits:null },

  /* ── Monospace ───────────────────────────────────────── */
  { id:'monospace', platforms:['discord'],         name:'Monospace',            use:'Twitch · Código',      col:'#30D158', cat:'classic',    upper:0x1D670, lower:0x1D68A, digits:0x1D7F6 },

  /* ── Full Width ──────────────────────────────────────── */
  { id:'fullwidth', platforms:['instagram','discord','steam'],         name:'Full Width',           use:'Vaporwave · Estético', col:'#FF375F', cat:'decorative', upper:0xFF21,  lower:0xFF41,  digits:0xFF10 },

  /* ── Enclosed / Circled ──────────────────────────────── */
  { id:'circled', platforms:['discord','instagram','whatsapp','steam'],           name:'Circled',              use:'Listas · Decoración',  col:'#FFD60A', cat:'symbols',    special:'circled' },
  { id:'neg-circled', platforms:['discord','steam'],       name:'Neg. Circled',         use:'Gaming · Iconos',      col:'#FF453A', cat:'symbols',    special:'neg-circled' },
  { id:'squared', platforms:['discord','steam'],           name:'Squared',              use:'Botones · UI',         col:'#5E5CE6', cat:'symbols',    special:'squared' },
  { id:'neg-squared', platforms:['discord','steam'],       name:'Neg. Squared',         use:'Iconos rellenos',      col:'#0A84FF', cat:'symbols',    special:'neg-squared' },
  { id:'parenthesized', platforms:['discord','instagram'],     name:'Parenthesized',        use:'Índices · Elegante',   col:'#5AC8FA', cat:'symbols',    special:'parenthesized' },

  /* ── Combining ───────────────────────────────────────── */
  { id:'strikethrough', platforms:['discord','whatsapp'],     name:'Strikethrough',        use:'Texto tachado',        col:'#636366', cat:'decorative', special:'strikethrough' },
  { id:'underline', platforms:['discord'],         name:'Subrayado',            use:'Énfasis',              col:'#5AC8FA', cat:'decorative', special:'underline' },
  { id:'double-ul', platforms:['discord'],         name:'Doble subrayado',      use:'Énfasis doble',        col:'#64D2FF', cat:'decorative', special:'double-ul' },
  { id:'overline', platforms:['discord'],          name:'Suprayado',            use:'Decorativo',           col:'#FF9F0A', cat:'decorative', special:'overline' },

  /* ── Superscript / Subscript ─────────────────────────── */
  { id:'superscript', platforms:['discord','instagram'],       name:'Superíndice',          use:'Matemáticas · Citas',  col:'#BF5AF2', cat:'symbols',    special:'superscript' },
  { id:'subscript', platforms:['discord','instagram'],         name:'Subíndice',            use:'Química · Fórmulas',   col:'#30D158', cat:'symbols',    special:'subscript' },

  /* ── Special decorative ──────────────────────────────── */
  { id:'stardeco', platforms:['instagram','discord','whatsapp'],          name:'★ Star Deco',          use:'Redes · Bio',          col:'#FFD60A', cat:'decorative', special:'stardeco' },
  { id:'upsidedown', platforms:['instagram','discord','whatsapp'],        name:'Al Revés',             use:'Humor · Meme',         col:'#FF9F0A', cat:'decorative', special:'upsidedown' },
  { id:'smallcaps', platforms:['instagram','discord'],         name:'Small Caps',           use:'Titulares elegantes',  col:'#FF375F', cat:'classic',    special:'smallcaps' },

  /* ── Decorative borders ───────────────────────────────────── */
  { id:'sparkle', platforms:['instagram','discord','whatsapp'],           name:'✦ Sparkle',            use:'Bio · Perfil',         col:'#FFD60A', cat:'decorative', special:'sparkle' },
  { id:'wave-deco', platforms:['instagram','discord'],         name:'〰 Wave',               use:'Estético · Twitter',   col:'#5AC8FA', cat:'decorative', special:'wave-deco' },
  { id:'heart-deco', platforms:['instagram','whatsapp'],        name:'♡ Heart Deco',         use:'Instagram · TikTok',   col:'#FF375F', cat:'decorative', special:'heart-deco' },
  { id:'diamond-deco', platforms:['discord','steam'],      name:'◈ Diamond',            use:'Nombres épicos',       col:'#BF5AF2', cat:'decorative', special:'diamond-deco' },
  { id:'brackets-deco', platforms:['discord','steam'],     name:'【 Brackets 】',        use:'Títulos · Gaming',     col:'#FFD60A', cat:'decorative', special:'brackets-deco' },
  { id:'double-angle', platforms:['discord','steam'],      name:'《 Double Angle 》',   use:'Títulos · Elegante',   col:'#30D158', cat:'decorative', special:'double-angle' },
  { id:'music-deco', platforms:['instagram','discord'],        name:'♪ Music Deco',         use:'Artistas · Spotify',   col:'#BF5AF2', cat:'decorative', special:'music-deco' },
  { id:'asterism', platforms:['discord','instagram'],          name:'⁂ Asterism',           use:'Separadores · Deco',   col:'#FF375F', cat:'decorative', special:'asterism' },

  /* ── Bubble / Regional ────────────────────────────────────── */
  { id:'bubble', platforms:['instagram','discord'],            name:'Bubble Letters',       use:'Kawaii · Cute',        col:'#64D2FF', cat:'symbols',    special:'bubble' },
  { id:'regional', platforms:['discord'],          name:'🇦🇧 Regional',         use:'Discord · Meme',       col:'#FF9F0A', cat:'symbols',    special:'regional' },

  /* ── More combining ───────────────────────────────────────── */
  { id:'zalgo-light', platforms:['discord'],       name:'Z̃ͅa̤l̨go Lite',        use:'Creepy · Glitch',      col:'#636366', cat:'glitch',     special:'zalgo-light' },
  { id:'slash-through', platforms:['discord'],     name:'Slash Through',        use:'Cancelado · Tachado',  col:'#FF453A', cat:'decorative', special:'slash-through' },
  { id:'dot-above', platforms:['discord','instagram'],         name:'Dot Above',            use:'Estético · Deco',      col:'#5AC8FA', cat:'decorative', special:'dot-above' },
  { id:'tilde-above', platforms:['discord'],       name:'Tilde Wave',           use:'Ondulado · Deco',      col:'#BF5AF2', cat:'decorative', special:'tilde-above' },

  /* ── Aesthetic spacing ────────────────────────────────────── */
  { id:'wide-spaced', platforms:['instagram','discord'],       name:'W i d e  S p a c e',  use:'Vaporwave · Estético', col:'#FF375F', cat:'decorative', special:'wide-spaced' },
  { id:'tiny-caps', platforms:['instagram','discord'],         name:'ᴛɪɴʏ ᴄᴀᴘs',          use:'Subtítulos · Twitter', col:'#5AC8FA', cat:'classic',    special:'tiny-caps' },
  { id:'outlined', platforms:['discord','instagram'],          name:'Outlined / Hollow',   use:'Diseño · Minimal',     col:'#64D2FF', cat:'classic',    special:'outlined' },

  /* ── Ancient / Symbols ────────────────────────────────────── */
  { id:'runic', platforms:['discord','steam'],             name:'ᚱᚢᚾᛁᚲ Runic',         use:'Gaming · Fantasy',     col:'#FF9F0A', cat:'symbols',    special:'runic' },
  { id:'old-english', platforms:['discord','steam'],       name:'𝕺𝖑𝖉 English',         use:'Tattoo · Metal',       col:'#5E5CE6', cat:'classic',    upper:0x1D504, lower:0x1D51E, digits:null,
    upperEx:{C:0x212D,H:0x210C,I:0x2111,R:0x211C,Z:0x2128} },

  /* ── Currency / Symbol wrap ───────────────────────────────── */
  { id:'currency-wrap', platforms:['discord'],     name:'₿ Currency Wrap',      use:'Cripto · Finanzas',    col:'#30D158', cat:'symbols',    special:'currency-wrap' },

  /* ── Arrow wrap ───────────────────────────────────────────── */
  { id:'arrow-deco', platforms:['discord','instagram'],        name:'➤ Arrow Deco',         use:'Listas · Redes',       col:'#30D158', cat:'decorative', special:'arrow-deco' },

  /* ══════════════════════════════════════════════════════
     NUEVOS ESTILOS
  ══════════════════════════════════════════════════════ */

  /* ── Tachado combining ───────────────────────────────── */
  { id:'long-stroke', platforms:['discord'],       name:'T̶a̶c̶h̶a̶d̶o̶',           use:'Texto cancelado',       col:'#FF453A', cat:'decorative', special:'long-stroke' },

  /* ── Subrayado combining ─────────────────────────────── */
  { id:'low-line', platforms:['discord'],          name:'S͟u͟b͟r͟a͟y͟a͟d͟o͟',          use:'Énfasis clásico',       col:'#5AC8FA', cat:'decorative', special:'low-line' },

  /* ── Espejo / Invertido ──────────────────────────────── */
  { id:'mirror', platforms:['instagram','discord'],            name:'ɹoɹɹᴉW',               use:'Humor · Sorpresa',     col:'#FF9F0A', cat:'decorative', special:'mirror' },

  /* ── Pequeño superíndice ─────────────────────────────── */
  { id:'small-super', platforms:['discord'],       name:'ˢᵐᵃˡˡ ˢᵘᵖᵉʳ',         use:'Matemáticas · Estilo', col:'#BF5AF2', cat:'symbols',    special:'small-super' },

  /* ── Zalgo / Glitch ──────────────────────────────────── */
  { id:'zalgo-glitch', platforms:['discord'],      name:'Z̴a̷l̵g̶o̸ G̷l̸i̴t̵c̶h̷',    use:'Creepy · Horror',      col:'#636366', cat:'glitch',     special:'zalgo-glitch' },

  /* ── Estrellas decoradas ──────────────────────────────── */
  { id:'star-between', platforms:['instagram','discord','whatsapp'],      name:'★S★t★a★r★',            use:'Bio · Redes sociales', col:'#FFD60A', cat:'decorative', special:'star-between' },

  /* ── Corazones decorados ──────────────────────────────── */
  { id:'heart-between', platforms:['instagram','whatsapp'],     name:'♥H♥e♥a♥r♥t♥',          use:'Instagram · TikTok',  col:'#FF375F', cat:'decorative', special:'heart-between' },

  /* ── Regional indicator ──────────────────────────────── */
  { id:'regional-flag', platforms:['discord'],     name:'🇩🇮🇺🇸🇫',              use:'Discord · Reacciones', col:'#5E5CE6', cat:'symbols',    special:'regional-flag' },
];

/* ── LOOKUP TABLES ── */
const FLIP = {
  a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ɓ',h:'ɥ',i:'ı',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',
  n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
  A:'∀',B:'𐐒',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ſ',K:'Ʞ',L:'˥',
  M:'W',N:'N',O:'O',P:'Ԁ',Q:'Ό',R:'ᴚ',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',
  '!':'¡','?':'¿','.':'˙','(':')',')':'(',
};

const SUPER = {
  a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',
  m:'ᵐ',n:'ⁿ',o:'ᵒ',p:'ᵖ',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ',
  A:'ᴬ',B:'ᴮ',C:'ᶜ',D:'ᴰ',E:'ᴱ',F:'ᶠ',G:'ᴳ',H:'ᴴ',I:'ᴵ',J:'ᴶ',K:'ᴷ',L:'ᴸ',
  M:'ᴹ',N:'ᴺ',O:'ᴼ',P:'ᴾ',Q:'Q',R:'ᴿ',S:'ˢ',T:'ᵀ',U:'ᵁ',V:'ⱽ',W:'ᵂ',X:'ˣ',Y:'ʸ',Z:'ᶻ',
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
};

const SUB = {
  a:'ₐ',e:'ₑ',h:'ₕ',i:'ᵢ',j:'ⱼ',k:'ₖ',l:'ₗ',m:'ₘ',n:'ₙ',o:'ₒ',p:'ₚ',r:'ᵣ',
  s:'ₛ',t:'ₜ',u:'ᵤ',v:'ᵥ',x:'ₓ',
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
  '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
};

const SMALL = {
  a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',
  m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'Q',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
};

/* Zalgo seed-based — resultado estable por carácter */
function zalgoSeed(c) {
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (Math.imul(31, h) + c.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Converts text to Unicode style.
 * @param {string} text
 * @param {{id,special?,upper?,lower?,digits?,upperEx?,lowerEx?}} style
 * @returns {string}
 */
function convert(text, style) {
  if (!text) return '';
  const s = style;

  /* ── Combining diacritics ── */
  if (s.special === 'strikethrough') return [...text].map(c => c + '\u0336').join('');
  if (s.special === 'underline')     return [...text].map(c => c + '\u0332').join('');
  if (s.special === 'double-ul')     return [...text].map(c => c + '\u0333').join('');
  if (s.special === 'overline')      return [...text].map(c => c + '\u0305').join('');

  /* ── Nuevos combining ── */
  if (s.special === 'long-stroke')   return [...text].map(c => c + '\u0336').join('');
  if (s.special === 'low-line')      return [...text].map(c => c + '\u0332').join('');

  /* ── Special transforms ── */
  if (s.special === 'stardeco')  return '★彡 ' + text.toUpperCase() + ' 彡★';
  if (s.special === 'upsidedown') return [...text].reverse().map(c => FLIP[c] ?? c).join('');
  if (s.special === 'mirror')     return [...text].reverse().map(c => FLIP[c] ?? c).join('');
  if (s.special === 'superscript') return [...text].map(c => SUPER[c] ?? c).join('');
  if (s.special === 'subscript')   return [...text].map(c => SUB[c]   ?? c).join('');
  if (s.special === 'small-super') return [...text].map(c => SUPER[c] ?? c).join('');
  if (s.special === 'smallcaps')   return [...text].map(c =>
    c >= 'a' && c <= 'z' ? (SMALL[c] ?? c) :
    c >= 'A' && c <= 'Z' ? c :
    c
  ).join('');

  /* ── Decorative interleave ── */
  if (s.special === 'star-between') {
    const chars = [...text];
    if (chars.length === 0) return '';
    return '★' + chars.join('★') + '★';
  }
  if (s.special === 'heart-between') {
    const chars = [...text];
    if (chars.length === 0) return '';
    return '♥' + chars.join('♥') + '♥';
  }

  /* ── Regional indicator (uppercase only, spaced) ── */
  if (s.special === 'regional-flag') {
    return [...text.toUpperCase()].map(c => {
      const n = c.charCodeAt(0) - 65;
      if (n >= 0 && n < 26) return String.fromCodePoint(0x1F1E6 + n);
      return c;
    }).join(' ');
  }

  /* ── Enclosed variants ── */
  if (s.special === 'circled') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    if (n >= 0 && n < 26)     return String.fromCodePoint(0x24B6 + n);
    if (c === '0')             return '⓪';
    if (c >= '1' && c <= '9') return String.fromCodePoint(0x245F + parseInt(c));
    return c;
  }).join('');

  if (s.special === 'neg-circled') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    return n >= 0 && n < 26 ? String.fromCodePoint(0x1F150 + n) : c;
  }).join('');

  if (s.special === 'squared') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    return n >= 0 && n < 26 ? String.fromCodePoint(0x1F130 + n) : c;
  }).join('');

  if (s.special === 'neg-squared') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    return n >= 0 && n < 26 ? String.fromCodePoint(0x1F170 + n) : c;
  }).join('');

  if (s.special === 'parenthesized') return [...text.toLowerCase()].map(c => {
    const n = c.charCodeAt(0) - 97;
    if (n >= 0 && n < 26) return String.fromCodePoint(0x249C + n);
    if (c >= '1' && c <= '9') return String.fromCodePoint(0x2473 + parseInt(c) - 1);
    if (c === '0') return '⒪';
    return c;
  }).join('');

  /* ── New decorative styles ── */
  if (s.special === 'sparkle')      return '✦ ' + text + ' ✦';
  if (s.special === 'wave-deco')    return '〰 ' + text + ' 〰';
  if (s.special === 'heart-deco')   return '♡ ' + text + ' ♡';
  if (s.special === 'diamond-deco') return '◈ ' + text + ' ◈';
  if (s.special === 'brackets-deco') return '【 ' + text + ' 】';
  if (s.special === 'double-angle') return '《 ' + text + ' 》';
  if (s.special === 'music-deco')   return '♪ ' + text + ' ♫';
  if (s.special === 'asterism')     return '⁂ ' + text + ' ⁂';
  if (s.special === 'arrow-deco')   return '➤ ' + text + ' ◀';
  if (s.special === 'currency-wrap')return '₿ ' + text + ' Ξ';

  if (s.special === 'wide-spaced')  return [...text].join(' ');
  if (s.special === 'tiny-caps')    return [...text].map(c =>
    c >= 'a' && c <= 'z' ? (SMALL[c] ?? c) :
    c >= 'A' && c <= 'Z' ? (SMALL[c.toLowerCase()] ?? c) : c
  ).join('');

  if (s.special === 'outlined') return [...text.toUpperCase()].map(c => {
    const OUTLINE = {
      A:'𝔸',B:'𝔹',C:'ℂ',D:'𝔻',E:'𝔼',F:'𝔽',G:'𝔾',H:'ℍ',I:'𝕀',J:'𝕁',K:'𝕂',L:'𝕃',M:'𝕄',
      N:'ℕ',O:'𝕆',P:'ℙ',Q:'ℚ',R:'ℝ',S:'𝕊',T:'𝕋',U:'𝕌',V:'𝕍',W:'𝕎',X:'𝕏',Y:'𝕐',Z:'ℤ'
    };
    return OUTLINE[c] ?? c;
  }).join('');

  if (s.special === 'bubble') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    if (n >= 0 && n < 26) return String.fromCodePoint(0x24B6 + n);
    if (c >= '0' && c <= '9') return ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨'][parseInt(c)];
    return c;
  }).join('');

  if (s.special === 'regional') return [...text.toUpperCase()].map(c => {
    const n = c.charCodeAt(0) - 65;
    return n >= 0 && n < 26 ? String.fromCodePoint(0x1F1E6 + n) : c;
  }).join('');

  /* ── Zalgo original (random) ── */
  if (s.special === 'zalgo-light') {
    const zalgoUp = ['\u0300','\u0301','\u0302','\u0308','\u030A','\u0303'];
    const zalgoDown = ['\u0316','\u0317','\u0330','\u0332'];
    return [...text].map(c => {
      if (c === ' ') return c;
      return c + zalgoUp[Math.floor(Math.random()*zalgoUp.length)]
               + zalgoDown[Math.floor(Math.random()*zalgoDown.length)];
    }).join('');
  }

  /* ── Zalgo Glitch — seed fija por carácter, máx 2-3 combinings ── */
  if (s.special === 'zalgo-glitch') {
    const pool = [
      '\u0300','\u0301','\u0302','\u0303','\u0304','\u0306','\u0307','\u0308',
      '\u0309','\u030A','\u030B','\u030C','\u030D','\u030E','\u030F','\u0310',
      '\u0312','\u0313','\u0315','\u031A','\u031B','\u033D','\u033E','\u033F',
      '\u0340','\u0341','\u0342','\u0343','\u0344','\u0346','\u034A','\u034B',
      '\u0316','\u0317','\u0318','\u0319','\u031C','\u031D','\u031E','\u031F',
      '\u0320','\u0321','\u0322','\u0323','\u0324','\u0325','\u0326','\u0327',
      '\u0328','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F',
      '\u0330','\u0331','\u0332','\u0333','\u0334','\u0335','\u0336','\u0337',
    ];
    return [...text].map((c, idx) => {
      if (c === ' ') return c;
      const seed = zalgoSeed(c + idx);
      const count = 2 + (seed % 2); // 2 o 3
      let out = c;
      for (let i = 0; i < count; i++) {
        out += pool[(seed * (i + 7)) % pool.length];
      }
      return out;
    }).join('');
  }

  if (s.special === 'slash-through') return [...text].map(c => c + '\u0338').join('');
  if (s.special === 'dot-above')     return [...text].map(c => c + '\u0307').join('');
  if (s.special === 'tilde-above')   return [...text].map(c => c + '\u0303').join('');

  if (s.special === 'runic') {
    const RUNE = {
      a:'ᚨ',b:'ᛒ',c:'ᚲ',d:'ᛞ',e:'ᛖ',f:'ᚠ',g:'ᚷ',h:'ᚺ',i:'ᛁ',j:'ᛃ',k:'ᚲ',l:'ᛚ',m:'ᛗ',
      n:'ᚾ',o:'ᛟ',p:'ᛈ',q:'ᛩ',r:'ᚱ',s:'ᛋ',t:'ᛏ',u:'ᚢ',v:'ᚹ',w:'ᚹ',x:'ᛪ',y:'ᚤ',z:'ᛉ',
      A:'ᚨ',B:'ᛒ',C:'ᚲ',D:'ᛞ',E:'ᛖ',F:'ᚠ',G:'ᚷ',H:'ᚺ',I:'ᛁ',J:'ᛃ',K:'ᚲ',L:'ᛚ',M:'ᛗ',
      N:'ᚾ',O:'ᛟ',P:'ᛈ',Q:'ᛩ',R:'ᚱ',S:'ᛋ',T:'ᛏ',U:'ᚢ',V:'ᚹ',W:'ᚹ',X:'ᛪ',Y:'ᚤ',Z:'ᛉ',
    };
    return [...text].map(c => RUNE[c] ?? c).join('');
  }

  /* ── Standard codepoint transform ── */
  return [...text].map(c => {
    if (c >= 'A' && c <= 'Z') {
      if (s.upperEx?.[c]) return String.fromCodePoint(s.upperEx[c]);
      if (s.upper != null) return String.fromCodePoint(s.upper + (c.charCodeAt(0) - 65));
      return c;
    }
    if (c >= 'a' && c <= 'z') {
      if (s.lowerEx?.[c]) return String.fromCodePoint(s.lowerEx[c]);
      if (s.lower != null) return String.fromCodePoint(s.lower + (c.charCodeAt(0) - 97));
      return c;
    }
    if (c >= '0' && c <= '9' && s.digits != null)
      return String.fromCodePoint(s.digits + (c.charCodeAt(0) - 48));
    return c;
  }).join('');
}

/* Export */
if (typeof module !== 'undefined') {
  module.exports = { STYLES, convert };
} else {
  window.DIUSF = { STYLES, convert };
}
