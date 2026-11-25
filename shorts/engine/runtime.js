// Tiny deterministic video runtime: renderAt(t) draws the frame for time t (seconds).
// A video defines window.VIDEO = { duration, fps, images:{name:url}, scenes:[...], captions:[...] }
(function () {
  const W = 1080, H = 1920;
  const E = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, p) => a + (b - a) * p,
    inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    out: (p) => 1 - Math.pow(1 - p, 3),
    back: (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    bounce: (x) => { const n = 7.5625, d = 2.75;
      if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
      if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; },
    prog: (lt, t0, d) => Math.max(0, Math.min(1, (lt - t0) / d)),
    // scale-in with overshoot; 0 before t0
    pop: (lt, t0, d = 0.32) => (lt < t0 ? 0 : E.back(E.prog(lt, t0, d))),
    // deterministic pseudo-random shake
    shake: (t, amp, f = 23) => [amp * Math.sin(t * f * 6.283 + 1.3) * Math.sin(t * 3.7 + 0.2), amp * Math.cos(t * (f * 0.83) * 6.283 + 0.7) * Math.sin(t * 2.9 + 1.1)],
    blinkAt: (lt, times, d = 0.16) => { for (const b of times) { const p = (lt - b) / d; if (p >= 0 && p <= 1) return Math.sin(p * Math.PI); } return 0; },
  };
  window.E = E;

  const root = document.getElementById('stage');
  const imgs = {};

  window.ready = (async () => {
    await document.fonts.ready;
    const V = window.VIDEO;
    await Promise.all(Object.entries(V.images).map(([k, src]) => new Promise((res, rej) => {
      const im = new Image(); im.onload = () => { imgs[k] = im; res(); }; im.onerror = rej; im.src = src;
    })));
  })();

  // camera: {cx, cy, h} in image px; viewport rect on screen
  function camAt(sc, lt) {
    const d = sc.end - sc.start;
    const p = (sc.ease || E.inOut)(E.clamp(lt / d, 0, 1));
    const a = sc.from, b = sc.to || sc.from;
    return { cx: E.lerp(a.cx, b.cx, p), cy: E.lerp(a.cy, b.cy, p), h: E.lerp(a.h, b.h, p) };
  }

  window.renderAt = function (t) {
    const V = window.VIDEO;
    const sc = V.scenes.find((s) => t >= s.start && t < s.end) || V.scenes[V.scenes.length - 1];
    const lt = t - sc.start;
    const im = imgs[sc.img];
    const vp = sc.viewport || { x: 0, y: 0, w: W, h: H };
    const cam = camAt(sc, lt);
    // punch-in on every cut
    const punch = sc.noPunch ? 1 : 1 + 0.07 * (1 - E.out(E.prog(lt, 0, 0.28)));
    const s = (vp.h / cam.h) * punch;
    const cw = vp.w / s, ch = vp.h / s;
    const ox = cam.cx - cw / 2, oy = cam.cy - ch / 2;
    const toScreen = (x, y) => [vp.x + (x - ox) * s, vp.y + (y - oy) * s];

    let html = '';
    if (sc.viewport) {
      html += `<img src="${im.src}" style="position:absolute;left:-60px;top:-60px;width:${W + 120}px;height:${H + 120}px;object-fit:cover;filter:blur(34px) brightness(.55) saturate(1.2)">`;
      html += `<div style="position:absolute;left:${vp.x - 10}px;top:${vp.y - 10}px;width:${vp.w + 20}px;height:${vp.h + 20}px;background:#fff;border-radius:28px;box-shadow:0 20px 60px rgba(0,0,0,.5)"></div>`;
    }
    html += `<div style="position:absolute;left:${vp.x}px;top:${vp.y}px;width:${vp.w}px;height:${vp.h}px;overflow:hidden;border-radius:${sc.viewport ? 20 : 0}px">
      <img src="${im.src}" style="position:absolute;left:${(-ox) * s}px;top:${(-oy) * s}px;width:${im.naturalWidth * s}px;height:${im.naturalHeight * s}px;filter:saturate(1.15) contrast(1.06)">
      ${sc.tint ? `<div style="position:absolute;inset:0;background:${sc.tint(lt)}"></div>` : ''}</div>`;
    html += `<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)"></div>`;

    // overlays: {svg, x, y, w, rot, scale, opacity, world:true|false}
    for (const o of sc.overlays(lt, E) || []) {
      if (!o || o.scale === 0 || o.opacity === 0) continue;
      let x = o.x, y = o.y, w = o.w;
      if (o.world !== false) { [x, y] = toScreen(o.x, o.y); w = o.w * s; }
      html += `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translate(-50%,-50%) rotate(${o.rot || 0}deg) scale(${o.scale ?? 1});transform-origin:${o.origin || '50% 50%'};opacity:${o.opacity ?? 1};filter:drop-shadow(0 6px 8px rgba(0,0,0,.35))">${o.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div>`;
    }

    // captions
    const cap = V.captions.find((c) => t >= c[0] && t < c[1]);
    if (cap) {
      const p = E.back(E.prog(t, cap[0], 0.14));
      const words = cap[2].replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
      html += `<div class="cap" style="transform:translateX(-50%) scale(${0.75 + 0.25 * p})">${words}</div>`;
    }
    root.innerHTML = html;
  };
})();
