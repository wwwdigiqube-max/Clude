// Cutout-animation stage. A video defines window.VIDEO = { duration, fps, images, shots:[...], captions:[...] }
// shot: { start, end, bg:(lt)=>html, draw:(lt,E,H)=>[html...], camera?:(lt)=>{zoom,x,y} }
// Captions: [t0, t1, 'WORD', {pop:true}]
(function () {
  const W = 1080, H = 1920;
  const E = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, p) => a + (b - a) * p,
    inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    out: (p) => 1 - Math.pow(1 - p, 3),
    inn: (p) => p * p * p,
    back: (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    elastic: (x) => (x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    prog: (lt, t0, d) => Math.max(0, Math.min(1, (lt - t0) / d)),
    pop: (lt, t0, d = 0.3) => (lt < t0 ? 0 : E.back(E.prog(lt, t0, d))),
    // springy settle: 0 at t0 → wobbles → 1
    spring: (lt, t0, d = 0.6) => (lt < t0 ? 0 : E.elastic(E.prog(lt, t0, d))),
    shake: (t, amp, f = 23) => [amp * Math.sin(t * f * 6.283 + 1.3) * Math.sin(t * 3.7 + 0.2), amp * Math.cos(t * f * 0.83 * 6.283 + 0.7) * Math.sin(t * 2.9 + 1.1)],
    blinkAt: (lt, times, d = 0.14) => { for (const b of times) { const p = (lt - b) / d; if (p >= 0 && p <= 1) return Math.sin(p * Math.PI); } return 0; },
    // continuous idle "breathing" so nothing is ever perfectly still
    breathe: (t, amp = 0.02, f = 1.6) => 1 + amp * Math.sin(t * f * 6.283),
  };
  window.E = E;

  let fid = 0;
  const svgWrap = (svg) => svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ');

  const Hh = {
    // sticker at screen coords (centre), width w
    sticker(svg, x, y, w, o = {}) {
      if (o.scale === 0 || o.opacity === 0) return '';
      return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translate(-50%,-50%) rotate(${o.rot || 0}deg) scale(${(o.flip ? -1 : 1) * (o.scale ?? 1) * (o.sx ?? 1)},${(o.scale ?? 1) * (o.sy ?? 1)});transform-origin:${o.origin || '50% 50%'};opacity:${o.opacity ?? 1};${o.shadow === false ? '' : 'filter:drop-shadow(0 6px 8px rgba(0,0,0,.35));'}">${svgWrap(svg)}</div>`;
    },
    // puppet: cutout PNG split into parts. spec = { img, w, h, parts:[{clip:[[x,y]...], pivot:[x,y], rot, dx, dy, attach:[{svg,x,y,w,rot,scale}]}] }
    // placement: x,y = screen position of the puppet's anchor (default image centre), scale, rot, flip, sx, sy (squash), blur (px, horizontal)
    puppet(spec, p) {
      const { w, h } = spec;
      const anchor = p.anchor || [w / 2, h / 2];
      const sc = p.scale ?? 1;
      let filter = '';
      let defs = '';
      if (p.blur && p.blur > 0.5) {
        const id = 'mb' + fid++;
        defs = `<svg width="0" height="0" style="position:absolute"><filter id="${id}" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="${p.blur / sc} ${(p.blurY || 0) / sc}"/></filter></svg>`;
        filter = `filter:url(#${id}) drop-shadow(0 14px 14px rgba(0,0,0,.35));`;
      } else filter = 'filter:drop-shadow(0 14px 14px rgba(0,0,0,.35));';
      let inner = '';
      for (const part of spec.parts) {
        const st = (p.parts && p.parts[part.name]) || {};
        const clip = part.clip ? `clip-path:polygon(${part.clip.map(([x, y]) => `${x}px ${y}px`).join(',')});` : '';
        const piv = part.pivot || [w / 2, h / 2];
        let att = '';
        for (const a of st.attach || []) {
          if (!a || a.scale === 0 || a.opacity === 0) continue;
          att += `<div style="position:absolute;left:${a.x}px;top:${a.y}px;width:${a.w}px;transform:translate(-50%,-50%) rotate(${a.rot || 0}deg) scale(${(a.flip ? -1 : 1) * (a.scale ?? 1)},${a.scale ?? 1});transform-origin:${a.origin || '50% 50%'};opacity:${a.opacity ?? 1}">${svgWrap(a.svg)}</div>`;
        }
        inner += `<div style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:${piv[0]}px ${piv[1]}px;transform:translate(${st.dx || 0}px,${st.dy || 0}px) rotate(${st.rot || 0}deg)">
          <img src="${spec.img}" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;${clip}${st.tint ? `filter:${st.tint};` : ''}">${att}</div>`;
      }
      return `${defs}<div style="position:absolute;left:${p.x - anchor[0]}px;top:${p.y - anchor[1]}px;width:${w}px;height:${h}px;transform-origin:${anchor[0]}px ${anchor[1]}px;transform:rotate(${p.rot || 0}deg) scale(${(p.flip ? -1 : 1) * sc * (p.sx ?? 1)},${sc * (p.sy ?? 1)});opacity:${p.opacity ?? 1};${filter}">${inner}</div>`;
    },
    flash(color, a) { return a > 0 ? `<div style="position:absolute;inset:0;background:${color};opacity:${a}"></div>` : ''; },
    photoBg(src, zoom = 1, ox = 0, oy = 0, extra = '') {
      return `<img src="${src}" style="position:absolute;left:${-W * (zoom - 1) / 2 + ox}px;top:${-H * (zoom - 1) / 2 + oy}px;width:${W * zoom}px;height:${H * zoom}px;object-fit:cover;${extra}">`;
    },
    tealBg(zoom = 1) {
      return `<div style="position:absolute;inset:0;transform:scale(${zoom});background:radial-gradient(ellipse at 50% 45%, #2C8C84 0%, #1C6762 55%, #12443F 100%)"></div>`;
    },
  };
  window.H = Hh;

  window.ready = (async () => {
    await document.fonts.ready;
    await Promise.all(Object.values(window.VIDEO.images).map((src) => new Promise((res, rej) => { const im = new Image(); im.onload = res; im.onerror = rej; im.src = src; })));
  })();

  const stage = document.getElementById('stage');
  window.renderAt = function (t) {
    fid = 0;
    const V = window.VIDEO;
    const sh = V.shots.find((s) => t >= s.start && t < s.end) || V.shots[V.shots.length - 1];
    const lt = t - sh.start;
    const cam = sh.camera ? sh.camera(lt, E) : {};
    const punch = sh.noPunch ? 1 : 1 + 0.06 * (1 - E.out(E.prog(lt, 0, 0.25)));
    const z = (cam.zoom || 1) * punch;
    let html = `<div style="position:absolute;inset:0;transform-origin:50% 50%;transform:translate(${cam.x || 0}px,${cam.y || 0}px) scale(${z})">`;
    html += sh.bg(lt, E, Hh);
    html += (sh.draw(lt, E, Hh) || []).join('');
    html += `</div>`;
    html += (sh.post ? sh.post(lt, E, Hh) : []).join('');
    html += `<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,.32) 100%)"></div>`;
    const cap = V.captions.find((c) => t >= c[0] && t < c[1]);
    if (cap) {
      const p = E.back(E.prog(t, cap[0], 0.12));
      const big = cap[3] && cap[3].pop ? 1.12 : 1;
      html += `<div class="cap" style="transform:translateX(-50%) scale(${(0.7 + 0.3 * p) * big})">${cap[2]}</div>`;
    }
    stage.innerHTML = html;
  };
})();
