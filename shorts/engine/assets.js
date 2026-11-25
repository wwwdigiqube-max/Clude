// Cartoon asset pack: flat colours, thick black outlines.
// Every function returns an SVG string. Sizes are set by the caller (CSS width).
(function (root) {
  const K = '#111';      // outline colour
  const SW = 9;          // outline width

  // ---------- EYES ----------
  // variant: normal | shocked | angry | heart | sad
  // look: [-1..1, -1..1] pupil direction; blink: 0 open .. 1 closed
  function eyes({ variant = 'normal', look = [0, 0], blink = 0, beat = 0, white = '#fff' } = {}) {
    const one = (cx, side) => {
      const cy = 100;
      if (variant === 'heart') {
        const s = 1 + 0.12 * Math.sin(beat * Math.PI * 2);
        return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(-60 -62)">
          <path d="M60 112 C20 82 2 58 2 36 C2 16 18 2 36 2 C47 2 56 8 60 18 C64 8 73 2 84 2 C102 2 118 16 118 36 C118 58 100 82 60 112Z"
            fill="#FF3B5C" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
          <ellipse cx="34" cy="30" rx="11" ry="7" fill="#fff" opacity=".85" transform="rotate(-30 34 30)"/></g>`;
      }
      const big = variant === 'shocked';
      const rx = big ? 66 : 58, ry = big ? 82 : 72;
      const pr = big ? 15 : 27;
      const px = cx + look[0] * (rx - pr - 12), py = cy + look[1] * (ry - pr - 12);
      const sy = Math.max(0.06, 1 - blink);
      let clip = '', brow = '';
      if (variant === 'angry') {
        // slanted lid: inner corner low
        const inner = side === 'L' ? 1 : -1;
        const x1 = cx - rx - 10, x2 = cx + rx + 10;
        const yIn = cy - 5, yOut = cy - ry - 10;
        const yL = inner === 1 ? yOut : yIn, yR = inner === 1 ? yIn : yOut;
        clip = `<clipPath id="c${side}"><polygon points="${x1},${yL} ${x2},${yR} ${x2},${cy + ry + 20} ${x1},${cy + ry + 20}"/></clipPath>`;
        brow = `<line x1="${x1 + 6}" y1="${yL - 4}" x2="${x2 - 6}" y2="${yR - 4}" stroke="${K}" stroke-width="16" stroke-linecap="round"/>`;
      }
      if (variant === 'sad') {
        const inner = side === 'L' ? 1 : -1;
        const x1 = cx - rx - 10, x2 = cx + rx + 10;
        const yIn = cy - ry * 0.75, yOut = cy - ry * 0.15;
        const yL = inner === 1 ? yOut : yIn, yR = inner === 1 ? yIn : yOut;
        clip = `<clipPath id="c${side}"><polygon points="${x1},${yL} ${x2},${yR} ${x2},${cy + ry + 20} ${x1},${cy + ry + 20}"/></clipPath>`;
        brow = `<line x1="${x1 + 10}" y1="${yL - 6}" x2="${x2 - 10}" y2="${yR - 6}" stroke="${K}" stroke-width="12" stroke-linecap="round"/>`;
      }
      const cp = clip ? `clip-path="url(#c${side})"` : '';
      return `<g transform="translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})">${clip}
        <g ${cp}>
          <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${white}" stroke="${K}" stroke-width="${SW}"/>
          <circle cx="${px}" cy="${py}" r="${pr}" fill="${K}"/>
          <circle cx="${px - pr * 0.35}" cy="${py - pr * 0.38}" r="${pr * 0.3}" fill="#fff"/>
        </g>${clip ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${K}" stroke-width="${SW}" ${cp}/>` : ''}${brow}</g>`;
    };
    return `<svg viewBox="0 -10 320 210" xmlns="http://www.w3.org/2000/svg" overflow="visible">${one(88, 'L')}${one(232, 'R')}</svg>`;
  }

  // ---------- WHITE GLOVE HAND (points right) ----------
  function hand() {
    return `<svg viewBox="0 0 230 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" fill="#fff">
        <rect x="112" y="52" width="108" height="36" rx="18"/>
        <rect x="58" y="40" width="88" height="104" rx="40"/>
        <path d="M96 48 C90 20 120 10 130 34 L134 56" />
        <rect x="14" y="62" width="52" height="66" rx="10"/>
      </g>
      <g stroke="${K}" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M100 98 C118 96 132 100 140 108"/>
        <path d="M98 120 C116 118 128 122 136 128"/>
        <line x1="26" y1="74" x2="26" y2="116"/><line x1="44" y1="74" x2="44" y2="116"/>
      </g></svg>`;
  }

  // ---------- STRAW HAT ----------
  function strawHat() {
    let weave = '';
    for (let i = 0; i < 7; i++) weave += `<path d="M${92 + i * 20} 40 C${90 + i * 20} 70 ${90 + i * 20} 90 ${92 + i * 20} 112" stroke="#C99A3E" stroke-width="4" fill="none"/>`;
    return `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <ellipse cx="160" cy="122" rx="150" ry="36" fill="#F2C76E" stroke="${K}" stroke-width="${SW}"/>
      <ellipse cx="160" cy="118" rx="112" ry="20" fill="#E3B257"/>
      <path d="M78 122 C76 46 108 22 160 22 C212 22 244 46 242 122 Z" fill="#F7D684" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${weave}
      <path d="M80 92 C130 104 190 104 240 92 L241 118 C190 130 130 130 79 118 Z" fill="#E0463B" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    </svg>`;
  }

  // ---------- COWBELL ----------
  function cowbell() {
    return `<svg viewBox="0 0 170 210" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M20 40 C40 -6 130 -6 150 40" fill="none" stroke="${K}" stroke-width="26" stroke-linecap="round"/>
      <path d="M20 40 C40 -6 130 -6 150 40" fill="none" stroke="#B4532A" stroke-width="12" stroke-linecap="round"/>
      <path d="M52 48 L118 48 L146 168 Q85 186 24 168 Z" fill="#E9B934" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M64 64 L74 64 L62 156 L48 154 Z" fill="#FFE58A"/>
      <rect x="46" y="38" width="78" height="18" rx="8" fill="#9C9C9C" stroke="${K}" stroke-width="7"/>
      <circle cx="85" cy="184" r="15" fill="#6B6B6B" stroke="${K}" stroke-width="7"/>
    </svg>`;
  }

  // ---------- HONEYDEW DROP ----------
  function drop() {
    return `<svg viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs><radialGradient id="dg" cx=".4" cy=".55" r=".7"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#F29A12"/></radialGradient></defs>
      <path d="M65 8 C65 8 14 80 14 112 A51 51 0 0 0 116 112 C116 80 65 8 65 8Z" fill="url(#dg)" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <ellipse cx="46" cy="104" rx="10" ry="20" fill="#fff" opacity=".85" transform="rotate(20 46 104)"/>
    </svg>`;
  }

  function sparkle(color = '#FFF6B0') {
    return `<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M0 -44 C6 -10 10 -6 44 0 C10 6 6 10 0 44 C-6 10 -10 6 -44 0 C-10 -6 -6 -10 0 -44Z" fill="${color}" stroke="${K}" stroke-width="6" stroke-linejoin="round"/></svg>`;
  }

  // ---------- SHIELD + SPEAR ----------
  function shield() {
    return `<svg viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <circle cx="85" cy="85" r="74" fill="#9A5A27" stroke="${K}" stroke-width="${SW}"/>
      <circle cx="85" cy="85" r="56" fill="#C47D3D" stroke="${K}" stroke-width="5"/>
      <line x1="58" y1="35" x2="58" y2="135" stroke="#8A4E20" stroke-width="5"/>
      <line x1="112" y1="35" x2="112" y2="135" stroke="#8A4E20" stroke-width="5"/>
      <circle cx="85" cy="85" r="18" fill="#B9B9B9" stroke="${K}" stroke-width="6"/>
    </svg>`;
  }
  function spear() {
    return `<svg viewBox="0 0 60 320" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <rect x="23" y="70" width="14" height="240" rx="6" fill="#A86A33" stroke="${K}" stroke-width="7"/>
      <path d="M30 4 L52 74 L8 74 Z" fill="#CFD6DC" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M30 18 L38 66 L30 66 Z" fill="#fff"/>
    </svg>`;
  }

  // ---------- CARTOON LADYBUG (running away) ----------
  function ladybugCartoon() {
    return `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="${K}" stroke-width="10" stroke-linecap="round"><line x1="80" y1="150" x2="60" y2="190"/><line x1="130" y1="155" x2="140" y2="195"/><line x1="175" y1="148" x2="200" y2="185"/></g>
      <circle cx="210" cy="95" r="44" fill="#1b1b1b" stroke="${K}" stroke-width="${SW}"/>
      <path d="M30 120 C30 40 90 20 130 20 C180 20 215 60 210 120 Z" fill="#E8302A" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <line x1="125" y1="22" x2="122" y2="120" stroke="${K}" stroke-width="7"/>
      <circle cx="80" cy="70" r="14" fill="${K}"/><circle cx="165" cy="60" r="13" fill="${K}"/><circle cx="95" cy="105" r="11" fill="${K}"/><circle cx="175" cy="100" r="11" fill="${K}"/>
      <line x1="20" y1="122" x2="220" y2="122" stroke="${K}" stroke-width="${SW}" stroke-linecap="round"/>
      <ellipse cx="208" cy="80" rx="15" ry="19" fill="#fff" stroke="${K}" stroke-width="5"/><ellipse cx="236" cy="82" rx="13" ry="17" fill="#fff" stroke="${K}" stroke-width="5"/>
      <circle cx="214" cy="84" r="5" fill="${K}"/><circle cx="241" cy="86" r="5" fill="${K}"/>
      <path d="M246 44 C238 58 240 68 248 70 C256 68 256 58 246 44Z" fill="#7FD3FF" stroke="${K}" stroke-width="4"/>
    </svg>`;
  }

  // ---------- SNOWFLAKE / THERMOMETER ----------
  function snowflake() {
    let arms = '';
    for (let i = 0; i < 6; i++) arms += `<g transform="rotate(${i * 60})"><line x1="0" y1="0" x2="0" y2="-40"/><line x1="0" y1="-24" x2="-11" y2="-34"/><line x1="0" y1="-24" x2="11" y2="-34"/></g>`;
    return `<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="${K}" stroke-width="12" stroke-linecap="round">${arms}</g>
      <g stroke="#fff" stroke-width="6" stroke-linecap="round">${arms}</g></svg>`;
  }
  function thermometer(level = 0.15) {
    const top = 30, bot = 200, y = bot - (bot - top) * level;
    return `<svg viewBox="0 0 100 280" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <rect x="32" y="14" width="36" height="210" rx="18" fill="#fff" stroke="${K}" stroke-width="${SW}"/>
      <rect x="42" y="${y}" width="16" height="${bot - y + 20}" fill="#2E9BFF"/>
      <circle cx="50" cy="234" r="34" fill="#2E9BFF" stroke="${K}" stroke-width="${SW}"/>
      <ellipse cx="40" cy="224" rx="8" ry="10" fill="#fff" opacity=".8"/>
      <g stroke="${K}" stroke-width="5" stroke-linecap="round"><line x1="68" y1="60" x2="82" y2="60"/><line x1="68" y1="100" x2="82" y2="100"/><line x1="68" y1="140" x2="82" y2="140"/><line x1="68" y1="180" x2="82" y2="180"/></g>
    </svg>`;
  }

  // ---------- SAD CACTUS IN POT ----------
  function cactus({ droop = 0 } = {}) {
    // droop 0..1 bends the top and arms down
    const lean = 18 * droop;
    return `<svg viewBox="0 0 220 330" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g transform="rotate(${lean} 110 230)">
        <path d="M60 150 C30 150 26 118 30 96 C34 80 52 80 54 96 L56 126" fill="#5DB862" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" transform="rotate(${-40 * droop} 56 140)"/>
        <path d="M160 140 C190 140 194 110 190 90 C186 74 168 74 166 90 L164 118" fill="#5DB862" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" transform="rotate(${60 * droop} 164 132)"/>
        <rect x="58" y="40" width="104" height="200" rx="52" fill="#6CC870" stroke="${K}" stroke-width="${SW}"/>
        <g stroke="#3F8F45" stroke-width="5" stroke-linecap="round"><line x1="88" y1="70" x2="88" y2="220"/><line x1="132" y1="70" x2="132" y2="220"/></g>
        <g stroke="${K}" stroke-width="4" stroke-linecap="round"><line x1="70" y1="90" x2="58" y2="84"/><line x1="150" y1="80" x2="164" y2="74"/><line x1="72" y1="170" x2="58" y2="172"/><line x1="148" y1="190" x2="162" y2="194"/><line x1="110" y1="44" x2="110" y2="30"/></g>
        <ellipse cx="96" cy="112" rx="9" ry="11" fill="${K}"/><ellipse cx="126" cy="112" rx="9" ry="11" fill="${K}"/>
        <path d="M96 146 C104 136 118 136 126 146" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
      </g>
      <path d="M44 232 L176 232 L160 320 L60 320 Z" fill="#D9734E" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="34" y="222" width="152" height="30" rx="8" fill="#E88A62" stroke="${K}" stroke-width="${SW}"/>
    </svg>`;
  }

  // ---------- SPEECH BUBBLE ----------
  function bubble(text) {
    return `<svg viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M30 20 H230 Q250 20 250 40 V110 Q250 130 230 130 H90 L50 165 L60 130 H30 Q10 130 10 110 V40 Q10 20 30 20Z" fill="#fff" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <text x="130" y="98" text-anchor="middle" font-family="Luckiest Guy" font-size="62" fill="${K}">${text}</text></svg>`;
  }

  function speedLines() {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="#fff" stroke-width="10" stroke-linecap="round"><line x1="10" y1="20" x2="150" y2="20"/><line x1="50" y1="60" x2="190" y2="60"/><line x1="20" y1="100" x2="140" y2="100"/></g></svg>`;
  }

  // ---------- FIGHT CLOUD (classic cartoon dust ball) ----------
  // t drives the boil of the puffs
  function fightCloud(t = 0) {
    let puffs = '';
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3 * Math.sin(t * 9 + i);
      const r = 150 + 22 * Math.sin(t * 13 + i * 2.1);
      const pr = 78 + 14 * Math.sin(t * 11 + i * 1.7);
      puffs += `<circle cx="${300 + Math.cos(a) * r}" cy="${250 + Math.sin(a) * r * 0.78}" r="${pr}"/>`;
    }
    return `<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g fill="#F4E6C8" stroke="${K}" stroke-width="${SW * 1.4}">${puffs}</g>
      <g fill="#F4E6C8">${puffs}</g>
      <ellipse cx="300" cy="250" rx="190" ry="150" fill="#F4E6C8"/>
      <g fill="#E3CFA4">${puffs.replace(/r="([\d.]+)"/g, (m, r) => `r="${r * 0.45}"`)}</g>
    </svg>`;
  }

  function star(color = '#FF9A1F') {
    let p = '';
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 20 : 46, a = (i / 10) * Math.PI * 2 - Math.PI / 2; p += `${Math.cos(a) * r},${Math.sin(a) * r} `; }
    return `<svg viewBox="-55 -55 110 110" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <polygon points="${p}" fill="${color}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/></svg>`;
  }

  // anime "anger vein" cross
  function angerVein() {
    const arc = (r) => `<path d="M-40 -14 Q-14 -14 -14 -40" transform="rotate(${r})"/>`;
    return `<svg viewBox="-55 -55 110 110" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g fill="none" stroke="${K}" stroke-width="22" stroke-linecap="round">${[0, 90, 180, 270].map(arc).join('')}</g>
      <g fill="none" stroke="#F0213B" stroke-width="12" stroke-linecap="round">${[0, 90, 180, 270].map(arc).join('')}</g></svg>`;
  }

  // shouting mouth (screaming oval), open 0..1
  function mouth(open = 1) {
    const ry = 26 + 34 * open, rx = 46 + 6 * open;
    return `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs><clipPath id="mclip"><ellipse cx="70" cy="75" rx="${rx}" ry="${ry}"/></clipPath></defs>
      <ellipse cx="70" cy="75" rx="${rx}" ry="${ry}" fill="#3A0A0E"/>
      <g clip-path="url(#mclip)">
        <rect x="0" y="${75 - ry}" width="140" height="${10 + 6 * open}" fill="#fff"/>
        <ellipse cx="70" cy="${75 + ry}" rx="${rx * 0.7}" ry="${ry * 0.55}" fill="#F25C6E"/>
      </g>
      <ellipse cx="70" cy="75" rx="${rx}" ry="${ry}" fill="none" stroke="${K}" stroke-width="${SW}"/></svg>`;
  }

  // white ring with red border (the "look here" target)
  function targetCircle() {
    return `<svg viewBox="-60 -60 120 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <circle r="50" fill="none" stroke="#E5202E" stroke-width="12"/>
      <circle r="50" fill="none" stroke="#fff" stroke-width="5"/></svg>`;
  }

  function sweat() {
    return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M30 4 C30 4 6 40 6 54 A24 24 0 0 0 54 54 C54 40 30 4 30 4Z" fill="#8FD8FF" stroke="${K}" stroke-width="6"/>
      <ellipse cx="22" cy="52" rx="6" ry="10" fill="#fff" opacity=".8"/></svg>`;
  }

  function exclaim() {
    return `<svg viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M14 8 H46 L40 104 H20 Z" fill="#fff" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <circle cx="30" cy="134" r="17" fill="#fff" stroke="${K}" stroke-width="${SW}"/></svg>`;
  }

  // ---------- SEA ANEMONE (cartoon pom-pom) ----------
  // half: 0 full, -1 left half only, 1 right half only (for the "rip in half" gag)
  function anemone({ t = 0, half = 0 } = {}) {
    let ten = '';
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI + (i / (n - 1)) * Math.PI;           // fan over the top
      const wav = 8 * Math.sin(t * 6 + i * 0.9);
      const x2 = 100 + Math.cos(a) * 82 + wav, y2 = 92 + Math.sin(a) * 78;
      const x1 = 100 + Math.cos(a) * 30, y1 = 100 + Math.sin(a) * 20;
      ten += `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + wav} ${(y1 + y2) / 2 - 10} ${x2} ${y2}"/>`;
    }
    const clip = half ? `<clipPath id="ah${half}"><rect x="${half < 0 ? 0 : 100}" y="0" width="100" height="200"/></clipPath>` : '';
    const cp = half ? `clip-path="url(#ah${half})"` : '';
    return `<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg" overflow="visible">${clip}<g ${cp}>
      <g fill="none" stroke="${K}" stroke-width="22" stroke-linecap="round">${ten}</g>
      <g fill="none" stroke="#FFF4F7" stroke-width="13" stroke-linecap="round">${ten}</g>
      <g fill="none" stroke="#FFB8CF" stroke-width="5" stroke-linecap="round" opacity=".7">${ten}</g>
      <path d="M62 100 Q100 80 138 100 L130 150 Q100 164 70 150 Z" fill="#FFD9E5" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M78 112 L76 146 M100 108 L100 152 M122 112 L124 146" stroke="#F3A5C0" stroke-width="5" stroke-linecap="round"/></g></svg>`;
  }

  function glove() {
    return `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M30 70 C20 30 50 10 80 14 C118 18 132 50 126 82 C122 104 104 116 82 116 L46 116 C34 110 30 96 30 70Z" fill="#E8282E" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M30 70 C14 66 8 86 22 96 C30 100 38 96 40 88" fill="#E8282E" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="40" y="110" width="66" height="32" rx="8" fill="#fff" stroke="${K}" stroke-width="${SW}"/>
      <path d="M56 34 C70 26 90 26 102 36" fill="none" stroke="#FF8A8E" stroke-width="10" stroke-linecap="round"/></svg>`;
  }

  function poison() {
    return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M60 6 C60 6 12 74 12 100 A48 48 0 0 0 108 100 C108 74 60 6 60 6Z" fill="#7BE33A" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <circle cx="60" cy="96" r="22" fill="#fff" stroke="${K}" stroke-width="5"/><rect x="50" y="112" width="20" height="14" rx="3" fill="#fff" stroke="${K}" stroke-width="5"/>
      <circle cx="52" cy="95" r="6" fill="${K}"/><circle cx="68" cy="95" r="6" fill="${K}"/></svg>`;
  }

  // white disc holding an icon (for the "A + B" infographic)
  function iconDisc(inner) {
    return `<svg viewBox="-80 -80 160 160" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <circle r="72" fill="#fff" stroke="${K}" stroke-width="${SW}"/>${inner.replace('<svg ', '<svg x="-48" y="-50" width="96" height="100" ')}</svg>`;
  }
  function plus() {
    return `<svg viewBox="-40 -40 80 80" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M-10 -32 H10 V-10 H32 V10 H10 V32 H-10 V10 H-32 V-10 H-10Z" fill="#fff" stroke="${K}" stroke-width="7" stroke-linejoin="round"/></svg>`;
  }

  function scissors() {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="${K}" stroke-width="${SW}" stroke-linejoin="round">
        <path d="M80 60 L196 20 L196 34 Z" fill="#D7DDE3"/><path d="M80 60 L196 100 L196 86 Z" fill="#D7DDE3"/>
        <circle cx="44" cy="30" r="24" fill="#FF6B2C"/><circle cx="44" cy="90" r="24" fill="#FF6B2C"/></g>
      <circle cx="44" cy="30" r="10" fill="#fff" stroke="${K}" stroke-width="5"/><circle cx="44" cy="90" r="10" fill="#fff" stroke="${K}" stroke-width="5"/>
      <circle cx="82" cy="60" r="7" fill="${K}"/></svg>`;
  }

  // pixel-style "deal with it" shades
  function sunglasses() {
    const px = (x, y) => `<rect x="${x * 20}" y="${y * 20}" width="20" height="20"/>`;
    let g = '';
    for (let x = 0; x < 16; x++) g += px(x, 0);
    [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [2, 2], [3, 2], [4, 2], [5, 2], [10, 2], [11, 2], [12, 2], [13, 2], [7, 1], [8, 1]].forEach(([x, y]) => (g += px(x, y)));
    return `<svg viewBox="0 0 320 70" xmlns="http://www.w3.org/2000/svg" overflow="visible"><g fill="${K}">${g}</g>
      <g fill="#fff"><rect x="40" y="20" width="20" height="20"/><rect x="220" y="20" width="20" height="20"/></g></svg>`;
  }

  function infinity() {
    const d = 'M100 60 C80 20 20 20 20 60 C20 100 80 100 100 60 C120 20 180 20 180 60 C180 100 120 100 100 60Z';
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="${d}" fill="none" stroke="${K}" stroke-width="34" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#FFD43B" stroke-width="20" stroke-linejoin="round"/></svg>`;
  }

  function warning() {
    return `<svg viewBox="0 0 140 124" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <path d="M70 8 L134 116 L6 116 Z" fill="#E5202E" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M62 44 H78 L75 84 H65 Z" fill="#fff"/><circle cx="70" cy="98" r="8" fill="#fff"/></svg>`;
  }

  // whip "crack" burst
  function crack() {
    let rays = '';
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; rays += `<line x1="${Math.cos(a) * 26}" y1="${Math.sin(a) * 26}" x2="${Math.cos(a) * (i % 2 ? 58 : 74)}" y2="${Math.sin(a) * (i % 2 ? 58 : 74)}"/>`; }
    return `<svg viewBox="-80 -80 160 160" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g stroke="${K}" stroke-width="16" stroke-linecap="round">${rays}</g><g stroke="#FFF36B" stroke-width="8" stroke-linecap="round">${rays}</g></svg>`;
  }

  function sign(text1, text2 = '') {
    return `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <rect x="138" y="120" width="24" height="140" rx="6" fill="#A86A33" stroke="${K}" stroke-width="${SW}"/>
      <rect x="10" y="10" width="280" height="140" rx="16" fill="#F7D68A" stroke="${K}" stroke-width="${SW}"/>
      <g stroke="#D9AE5E" stroke-width="5"><line x1="24" y1="60" x2="276" y2="60"/><line x1="24" y1="104" x2="276" y2="104"/></g>
      <text x="150" y="72" text-anchor="middle" font-family="Luckiest Guy" font-size="46" fill="${K}">${text1}</text>
      <text x="150" y="128" text-anchor="middle" font-family="Luckiest Guy" font-size="40" fill="#C2272D">${text2}</text></svg>`;
  }

  function badge(n) {
    return `<svg viewBox="-70 -70 140 140" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <circle r="60" fill="#FF7A1A" stroke="${K}" stroke-width="${SW}"/><circle r="47" fill="none" stroke="#FFB37A" stroke-width="5"/>
      <text y="24" text-anchor="middle" font-family="Luckiest Guy" font-size="72" fill="#fff" stroke="${K}" stroke-width="6" paint-order="stroke">#${n}</text></svg>`;
  }

  // little spiky stinger capsule (nematocyst), glowing
  function stinger() {
    return `<svg viewBox="-30 -30 60 60" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <circle r="24" fill="#5FE3FF" opacity=".35"/><ellipse rx="11" ry="15" fill="#2BB6FF" stroke="${K}" stroke-width="4"/>
      <path d="M0 -15 L0 -27 M-6 -22 L0 -27 L6 -22" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  }

  root.Assets = { eyes, hand, strawHat, cowbell, drop, sparkle, shield, spear, ladybugCartoon, snowflake, thermometer, cactus, bubble, speedLines,
    fightCloud, star, angerVein, mouth, targetCircle, sweat, exclaim,
    anemone, glove, poison, iconDisc, plus, scissors, sunglasses, infinity, warning, crack, sign, badge, stinger };
})(typeof window !== 'undefined' ? window : globalThis);
