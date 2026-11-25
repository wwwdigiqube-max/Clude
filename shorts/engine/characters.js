// Narrator mascot candidates. Each returns an SVG string.
// opts: { mood: 'happy'|'shock'|'laugh'|'smirk', look:[x,y], blink, pose: 'wave'|'point'|'idle'|'cheer', t }
(function (root) {
  const K = '#111', SW = 9;
  const A = root.Assets;

  // nest an <svg> string inside another at x,y,w,h
  const nest = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

  function joyEyes() {
    return `<svg viewBox="0 -10 320 210" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${K}" stroke-width="18" stroke-linecap="round">
      <path d="M40 120 Q88 40 136 120"/><path d="M184 120 Q232 40 280 120"/></g></svg>`;
  }
  function faceEyes(mood, look, blink) {
    if (mood === 'laugh') return joyEyes();
    return A.eyes({ variant: mood === 'shock' ? 'shocked' : 'normal', look, blink });
  }
  // mouth paths centred at 0,0 roughly 120 wide
  function mouthG(mood) {
    if (mood === 'shock') return `<ellipse cx="0" cy="8" rx="22" ry="30" fill="#3A0A0E" stroke="${K}" stroke-width="8"/><ellipse cx="0" cy="24" rx="12" ry="8" fill="#F25C6E"/>`;
    if (mood === 'laugh') return `<path d="M-58 -10 Q0 -14 58 -10 Q50 60 0 62 Q-50 60 -58 -10Z" fill="#3A0A0E" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
      <path d="M-50 -6 L50 -6 L46 8 L-46 8Z" fill="#fff"/><ellipse cx="0" cy="44" rx="28" ry="12" fill="#F25C6E"/>`;
    if (mood === 'smirk') return `<path d="M-40 6 Q5 30 46 -10" fill="none" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M40 -16 L52 -4" stroke="${K}" stroke-width="8" stroke-linecap="round"/>`;
    return `<path d="M-44 -4 Q0 46 44 -4 Q0 22 -44 -4Z" fill="#3A0A0E" stroke="${K}" stroke-width="8" stroke-linejoin="round"/><ellipse cx="0" cy="16" rx="16" ry="6" fill="#F25C6E"/>`;
  }

  function handOpen(fill = '#fff') {
    return `<svg viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" overflow="visible"><g fill="${fill}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round">
      <rect x="18" y="10" width="26" height="70" rx="13" transform="rotate(-14 31 45)"/><rect x="46" y="0" width="26" height="76" rx="13"/>
      <rect x="76" y="4" width="26" height="72" rx="13" transform="rotate(10 89 40)"/><rect x="104" y="40" width="26" height="60" rx="13" transform="rotate(40 117 70)"/>
      <rect x="14" y="52" width="104" height="80" rx="40"/><rect x="34" y="122" width="62" height="32" rx="8"/></g>
      <g fill="#fff"><rect x="22" y="58" width="92" height="40" rx="20"/></g></svg>`;
  }

  // hands for a pose: returns [leftHand, rightHand] as {svg,x,y,w,rot,flip} in a 400-wide frame, shoulder anchors given
  function arms(pose, lS, rS, t = 0, spread = 0) {
    const wave = Math.sin(t * 10) * 18;
    const P = {
      idle:  [{ x: lS[0] - 70, y: lS[1] + 90, rot: 160, open: true }, { x: rS[0] + 70, y: rS[1] + 90, rot: -160, open: true, flip: true }],
      wave:  [{ x: lS[0] - 70, y: lS[1] + 90, rot: 160, open: true }, { x: rS[0] + 95, y: rS[1] - 95, rot: 15 + wave, open: true, flip: true }],
      point: [{ x: lS[0] - 70, y: lS[1] + 90, rot: 160, open: true }, { x: rS[0] + 120, y: rS[1] - 10, rot: -10, open: false }],
      cheer: [{ x: lS[0] - 95, y: lS[1] - 110, rot: -15, open: true }, { x: rS[0] + 95, y: rS[1] - 110, rot: 15, open: true, flip: true }],
      shock: [{ x: lS[0] - 50, y: lS[1] - 150, rot: 20, open: true }, { x: rS[0] + 50, y: rS[1] - 150, rot: -20, open: true, flip: true }],
    }[pose] || [];
    let out = '';
    P.forEach((h, i) => {
      const s = i ? rS : lS;
      if (spread && h.y < s[1]) h.x += (i ? 1 : -1) * spread;
      const mx = (s[0] + h.x) / 2 + (i ? 20 : -20), my = (s[1] + h.y) / 2 + 20;
      out += `<path d="M${s[0]} ${s[1]} Q${mx} ${my} ${h.x} ${h.y}" fill="none" stroke="${K}" stroke-width="16" stroke-linecap="round"/>`;
      const svg = h.open ? handOpen() : A.hand();
      const w = h.open ? 86 : 120;
      out += `<g transform="translate(${h.x} ${h.y}) rotate(${h.rot}) scale(${h.flip ? -1 : 1} 1)">${nest(svg, -w / 2, -w / 2, w, w)}</g>`;
    });
    return out;
  }

  // ---------- 1. LUPO — the magnifying glass ----------
  // brand: warm orange ring, sky glass. Eyes look magnified behind the lens.
  function lupo({ mood = 'happy', look = [0, 0], blink = 0, pose = 'wave', t = 0 } = {}) {
    const ring = '#FF7A1A';
    return `<svg viewBox="-40 -40 480 700" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs><radialGradient id="lg" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#F4FDFF"/><stop offset="1" stop-color="#A9E6FA"/></radialGradient>
        <clipPath id="lc"><circle cx="200" cy="200" r="150"/></clipPath></defs>
      <!-- handle (body) -->
      <rect x="170" y="370" width="60" height="210" rx="28" fill="#8A4B2A" stroke="${K}" stroke-width="${SW}"/>
      <path d="M186 400 L186 560" stroke="#B26A3F" stroke-width="10" stroke-linecap="round"/>
      <rect x="154" y="338" width="92" height="52" rx="14" fill="#5C5F66" stroke="${K}" stroke-width="${SW}"/>
      <rect x="166" y="348" width="16" height="32" rx="6" fill="#9CA1AA"/>
      <ellipse cx="200" cy="600" rx="62" ry="22" fill="#2B2B2B" stroke="${K}" stroke-width="${SW}"/>
      <!-- lens -->
      <circle cx="200" cy="200" r="150" fill="url(#lg)"/>
      <g clip-path="url(#lc)">
        ${nest(faceEyes(mood, look, blink), 40, 70, 320, 210)}
        <g transform="translate(200 262)">${mouthG(mood)}</g>
        <ellipse cx="92" cy="240" rx="26" ry="14" fill="#FF9AA8" opacity=".7"/><ellipse cx="308" cy="240" rx="26" ry="14" fill="#FF9AA8" opacity=".7"/>
        <path d="M95 120 A120 120 0 0 1 170 70" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".85"/>
      </g>
      <circle cx="200" cy="200" r="158" fill="none" stroke="${K}" stroke-width="48"/>
      <circle cx="200" cy="200" r="158" fill="none" stroke="${ring}" stroke-width="30"/>
      <path d="M90 92 A150 150 0 0 1 200 42" fill="none" stroke="#FFB37A" stroke-width="9" stroke-linecap="round"/>
      ${arms(pose, [168, 372], [232, 372], t, 120)}
    </svg>`;
  }

  // ---------- 2. BIBI — the little beetle ----------
  // brand: violet shell with sunny spots, big friendly face.
  function bibi({ mood = 'happy', look = [0, 0], blink = 0, pose = 'wave', t = 0 } = {}) {
    const shell = '#7C4DFF', belly = '#C9B6FF';
    const legs = [-1, 1].map((s) => [0, 1, 2].map((i) => `<path d="M${200 + s * 120} ${360 + i * 50} q${s * 50} 10 ${s * 70} ${40 + i * 6}" fill="none" stroke="${K}" stroke-width="14" stroke-linecap="round"/>`).join('')).join('');
    return `<svg viewBox="-40 -60 480 640" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <!-- antennae -->
      <path d="M160 110 Q120 30 80 20" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/>
      <path d="M240 110 Q280 30 320 20" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="78" cy="18" r="24" fill="#FFD43B" stroke="${K}" stroke-width="8"/><circle cx="322" cy="18" r="24" fill="#FFD43B" stroke="${K}" stroke-width="8"/>
      ${legs}
      <!-- shell body -->
      <ellipse cx="200" cy="320" rx="175" ry="190" fill="${shell}" stroke="${K}" stroke-width="${SW}"/>
      <circle cx="78" cy="300" r="22" fill="#FFD43B" stroke="${K}" stroke-width="6"/><circle cx="322" cy="300" r="22" fill="#FFD43B" stroke="${K}" stroke-width="6"/>
      <circle cx="100" cy="410" r="16" fill="#FFD43B" stroke="${K}" stroke-width="6"/><circle cx="300" cy="410" r="16" fill="#FFD43B" stroke="${K}" stroke-width="6"/>
      <ellipse cx="200" cy="300" rx="118" ry="150" fill="${belly}" stroke="${K}" stroke-width="7"/>
      <path d="M90 190 A150 160 0 0 1 150 150" fill="none" stroke="#B49BFF" stroke-width="14" stroke-linecap="round"/>
      ${nest(faceEyes(mood, look, blink), 60, 170, 280, 184)}
      <g transform="translate(200 345)">${mouthG(mood)}</g>
      <ellipse cx="112" cy="330" rx="22" ry="12" fill="#FF8FB3" opacity=".75"/><ellipse cx="288" cy="330" rx="22" ry="12" fill="#FF8FB3" opacity=".75"/>
      ${arms(pose, [60, 330], [340, 330], t)}
    </svg>`;
  }

  // round avatar (logo) versions
  function avatar(ch, bg) {
    const inner = ch === 'lupo' ? lupo({ mood: 'happy', pose: 'idle', look: [0.15, 0.1] }) : bibi({ mood: 'happy', pose: 'idle', look: [0.15, 0.1] });
    const vb = ch === 'lupo' ? [-12, -12, 424, 424] : [-20, 90, 440, 440];
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="av${ch}"><circle cx="200" cy="200" r="196"/></clipPath></defs>
      <circle cx="200" cy="200" r="196" fill="${bg}"/>
      <g clip-path="url(#av${ch})">${inner.replace(/viewBox="[^"]+"/, `viewBox="${vb.join(' ')}" x="0" y="0" width="400" height="400"`)}</g>
      <circle cx="200" cy="200" r="194" fill="none" stroke="${K}" stroke-width="8"/></svg>`;
  }

  root.Characters = { lupo, bibi, avatar, handOpen };
})(typeof window !== 'undefined' ? window : globalThis);
