// Motor de escenas de fondo: un solo canvas a pantalla completa (~30 fps, se pausa en segundo plano)
// con efectos animados + los legendarios de la escena como imágenes a gran tamaño.

import { SCENES } from '../data/scenes.js';
import { artwork } from '../services/api.js';

const FPS_MS = 1000 / 30;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

let root, coverEl, blurEl, canvas, ctx, legendsEl;
// Sobre una portada solo se añaden partículas ligeras (el arte ya trae su propio fondo)
const OVER_COVER = new Set(['embers', 'rain', 'snow', 'lightning', 'shards']);
let cover = null, activeFx = [];

let W = 0, H = 0, scene = null, sky = null, st = {}, flash = 0, dim = 0, mode = 'home', last = 0;
const t0 = performance.now();

/* ---------- Utilidades de dibujo ---------- */

function glow(x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'transparent');
  ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

function cloudSprite(color) {
  const c = document.createElement('canvas');
  c.width = 520; c.height = 200;
  const g = c.getContext('2d');
  g.filter = 'blur(14px)'; g.fillStyle = color;
  for (let i = 0; i < 14; i++) {
    g.beginPath(); g.arc(rand(80, 440), rand(80, 130), rand(36, 70), 0, TAU); g.fill();
  }
  return c;
}

// Relámpago por desplazamiento de punto medio
function boltPath(x1, y1, x2, y2, spread, depth, out) {
  if (depth === 0) { out.push([x2, y2]); return; }
  const mx = (x1 + x2) / 2 + rand(-spread, spread), my = (y1 + y2) / 2;
  boltPath(x1, y1, mx, my, spread / 2, depth - 1, out);
  boltPath(mx, my, x2, y2, spread / 2, depth - 1, out);
}

const particles = (n, make) => Array.from({ length: n }, make);

/* ---------- Efectos: init() crea su estado, draw() lo pinta ---------- */

const FX = {
  rays: {
    draw(t, c) {
      const [fx, fy] = scene.focus, cx = W * fx, cy = H * fy, R = Math.hypot(W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU + t * .04, w = .07 + .03 * Math.sin(t + i);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .7);
        g.addColorStop(0, c.rays + '55'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
        ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
        ctx.fill();
      }
      glow(cx, cy, Math.min(W, H) * .45, c.rays, .35 + .1 * Math.sin(t * 2));
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  clouds: {
    init: c => {
      const sprites = [0, 1, 2].map(() => cloudSprite(c.cloud || '#2a2548'));
      return particles(10, (_, i) => ({ img: sprites[i % 3], x: rand(-.3, 1), y: i < 5 ? rand(-.05, .25) : rand(.7, .95), s: rand(1.2, 2.4), v: rand(.004, .012) }));
    },
    draw(t, c, s, dt) {
      for (const k of s) {
        k.x += k.v * dt; if (k.x > 1.1) k.x = -.6;
        ctx.globalAlpha = .9;
        ctx.drawImage(k.img, k.x * W, k.y * H - 100 * k.s, 520 * k.s, 200 * k.s);
      }
      ctx.globalAlpha = 1;
    },
  },

  lightning: {
    init: () => ({ next: 1.5, bolt: null, life: 0 }),
    draw(t, c, s, dt) {
      if (t > s.next) {
        const x = rand(.1, .9) * W, pts = [[x, 0]];
        boltPath(x, 0, x + rand(-200, 200), H * rand(.5, .85), 120, 6, pts);
        s.bolt = pts; s.life = .35; s.next = t + rand(2.5, 6); flash = .5;
      }
      if (s.life > 0) {
        s.life -= dt;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = c.bolt || '#fff'; ctx.shadowBlur = 24;
        ctx.strokeStyle = c.bolt || '#fff'; ctx.lineWidth = 3 * (s.life / .35) + 1;
        ctx.beginPath(); s.bolt.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.restore();
      }
    },
  },

  embers: {
    init: () => particles(90, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 3.2), v: rand(.02, .07), p: rand(0, TAU) })),
    draw(t, c, s, dt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = c.ember || '#ffcf6b';
      for (const e of s) {
        e.y -= e.v * dt; if (e.y < -.02) { e.y = 1.02; e.x = Math.random(); }
        ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 2 + e.p));
        ctx.beginPath(); ctx.arc((e.x + Math.sin(t + e.p) * .01) * W, e.y * H, e.r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    },
  },

  rain: {
    init: () => particles(180, () => ({ x: Math.random(), y: Math.random(), v: rand(1.2, 2), l: rand(14, 28) })),
    draw(t, c, s, dt) {
      ctx.strokeStyle = 'rgba(170,210,255,.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const d of s) {
        d.y += d.v * dt; d.x -= d.v * dt * .25;
        if (d.y > 1.05) { d.y = -.05; d.x = Math.random() * 1.2; }
        ctx.moveTo(d.x * W, d.y * H); ctx.lineTo(d.x * W + d.l * .3, d.y * H - d.l);
      }
      ctx.stroke();
    },
  },

  stars: {
    init: () => ({ list: particles(160, () => ({ x: Math.random(), y: Math.random() * .8, r: rand(.4, 1.6), p: rand(0, TAU), s: rand(.5, 2) })), shoot: null, next: 3 }),
    draw(t, c, s, dt) {
      ctx.fillStyle = '#fff';
      for (const k of s.list) {
        ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(t * k.s + k.p));
        ctx.fillRect(k.x * W, k.y * H, k.r, k.r);
      }
      if (t > s.next) { s.shoot = { x: rand(.2, .9), y: rand(0, .3), life: 1 }; s.next = t + rand(4, 9); }
      if (s.shoot && s.shoot.life > 0) {
        const k = s.shoot; k.life -= dt * 1.5; k.x -= dt * .5; k.y += dt * .25;
        ctx.globalAlpha = k.life; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(k.x * W, k.y * H); ctx.lineTo(k.x * W + 120, k.y * H - 60); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  },

  vortex: {
    draw(t, c) {
      const [fx, fy] = scene.focus, cx = W * fx, cy = H * fy, R = Math.max(W, H) * .8;
      ctx.globalCompositeOperation = 'lighter';
      for (let arm = 0; arm < 6; arm++) {
        ctx.strokeStyle = arm % 2 ? c.vortex + '66' : '#5a1a8a55';
        ctx.lineWidth = 18 - arm * 2;
        ctx.beginPath();
        for (let r = 20; r < R; r += 14) {
          const a = arm / 6 * TAU - t * .25 + r * .006;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .55;
          r === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      glow(cx, cy, 220, '#000', .9);
    },
  },

  rocks: {
    init: () => particles(16, () => ({ x: Math.random(), y: Math.random(), s: rand(18, 60), v: rand(.01, .03), a: rand(0, TAU), va: rand(-.3, .3) })),
    draw(t, c, s, dt) {
      for (const r of s) {
        r.y -= r.v * dt; r.a += r.va * dt; if (r.y < -.1) { r.y = 1.1; r.x = Math.random(); }
        ctx.save(); ctx.translate(r.x * W, r.y * H); ctx.rotate(r.a);
        ctx.fillStyle = c.rock; ctx.strokeStyle = c.vortex + '99'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r.s, 0); ctx.lineTo(-r.s * .3, -r.s * .6); ctx.lineTo(r.s * .8, -r.s * .3); ctx.lineTo(r.s, r.s * .4); ctx.lineTo(-r.s * .2, r.s * .5);
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    },
  },

  aurora: {
    draw(t, c) {
      ctx.globalCompositeOperation = 'lighter';
      c.aurora.forEach((col, k) => {
        const base = H * (.18 + k * .1);
        const g = ctx.createLinearGradient(0, base - 80, 0, base + 160);
        g.addColorStop(0, 'transparent'); g.addColorStop(.4, col + '55'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 24) ctx.lineTo(x, base + Math.sin(x * .004 + t * .6 + k * 2) * 70 + Math.sin(x * .011 + t) * 20);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  rainbow: {
    draw(t) {
      const cx = W * .5, cy = H * 1.05, R = Math.min(W, H) * .9;
      ['#ff4d4d', '#ff9f43', '#feca57', '#1dd1a1', '#54a0ff', '#5f27cd'].forEach((col, i) => {
        ctx.strokeStyle = col; ctx.globalAlpha = .16 + .04 * Math.sin(t);
        ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, R - i * 16, Math.PI, TAU); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    },
  },

  lava: {
    draw(t, c) {
      const g = ctx.createLinearGradient(0, H, 0, H * .5);
      g.addColorStop(0, c.lava); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = .55 + .15 * Math.sin(t * 1.5);
      ctx.fillStyle = g; ctx.fillRect(0, H * .5, W, H * .5);
      ctx.globalAlpha = 1;
    },
  },

  sunmoon: {
    draw(t) {
      const m = Math.min(W, H);
      glow(W * .18, H * .28, m * .45, '#ffb13b', .55 + .1 * Math.sin(t));
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(W * .18, H * .28, m * .07, 0, TAU); ctx.fill();
      glow(W * .82, H * .24, m * .4, '#8f6bff', .5 + .1 * Math.cos(t));
      ctx.fillStyle = '#e9e4ff'; ctx.beginPath(); ctx.arc(W * .82, H * .24, m * .06, 0, TAU); ctx.fill();
      ctx.fillStyle = '#161040'; ctx.beginPath(); ctx.arc(W * .82 + m * .025, H * .24 - m * .015, m * .055, 0, TAU); ctx.fill();
    },
  },

  rift: {
    init: () => { const pts = [[0, .18]]; for (let x = .05; x <= 1.05; x += .05) pts.push([x, .18 + rand(-.07, .07)]); return pts; },
    draw(t, c, s) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      c.rift.forEach((col, i) => {
        ctx.shadowColor = col; ctx.shadowBlur = 40;
        ctx.strokeStyle = col; ctx.lineWidth = (i ? 3 : 10) + 4 * Math.abs(Math.sin(t * 1.5));
        ctx.globalAlpha = .7;
        ctx.beginPath(); s.forEach(([x, y], k) => (k ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H))); ctx.stroke();
      });
      ctx.restore();
    },
  },

  shards: {
    init: () => particles(34, () => ({ x: Math.random(), y: Math.random(), s: rand(10, 40), a: rand(0, TAU), va: rand(-.4, .4), h: rand(0, 360), v: rand(.005, .02) })),
    draw(t, c, s, dt) {
      ctx.globalCompositeOperation = 'lighter';
      for (const k of s) {
        k.a += k.va * dt; k.y -= k.v * dt; if (k.y < -.1) { k.y = 1.1; k.x = Math.random(); }
        ctx.save(); ctx.translate(k.x * W, k.y * H); ctx.rotate(k.a);
        ctx.fillStyle = `hsla(${(k.h + t * 30) % 360}, 90%, 65%, .35)`;
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.beginPath(); ctx.moveTo(0, -k.s); ctx.lineTo(k.s * .6, 0); ctx.lineTo(0, k.s); ctx.lineTo(-k.s * .6, 0); ctx.closePath();
        ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  snow: {
    init: () => particles(130, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 3), v: rand(.03, .08), p: rand(0, TAU) })),
    draw(t, c, s, dt) {
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath();
      for (const f of s) {
        f.y += f.v * dt; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); }
        const x = (f.x + Math.sin(t * .8 + f.p) * .015) * W;
        ctx.moveTo(x, f.y * H); ctx.arc(x, f.y * H, f.r, 0, TAU);
      }
      ctx.fill();
    },
  },
};

/* ---------- Bucle ---------- */

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  if (!scene) return;
  sky = ctx.createLinearGradient(0, 0, 0, H);
  scene.sky.forEach((c, i, a) => sky.addColorStop(i / (a.length - 1), c));
}

function render(now) {
  const t = (now - t0) / 1000, dt = Math.min(.1, (now - last) / 1000 || 0);
  last = now;
  if (cover) ctx.clearRect(0, 0, W, H);             // con portada, el canvas solo aporta partículas
  else { ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H); }
  for (const name of activeFx) FX[name].draw(t, scene.colors, st[name], dt);
  if (flash > 0) { ctx.fillStyle = `rgba(255,250,230,${flash * .35})`; ctx.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 1.6); }
  if (dim > 0) { ctx.fillStyle = `rgba(4,5,14,${dim})`; ctx.fillRect(0, 0, W, H); }
}

function loop(now) {
  requestAnimationFrame(loop);
  if (document.hidden || !scene || now - last < FPS_MS) return;
  render(now);
}

function setScene(key, newMode, coverSrc = null, dimLevel = 0) {
  if (!root) return;
  scene = SCENES[key];
  mode = newMode;
  cover = coverSrc;
  root.dataset.mode = mode;
  root.dataset.cover = cover ? 'yes' : 'no';
  root.style.setProperty('--glow', scene.colors.glow);
  coverEl.hidden = blurEl.hidden = !cover;
  if (cover && coverEl.getAttribute('src') !== cover) { coverEl.src = blurEl.src = cover; }
  // En el inicio los rayos divinos también van sobre la portada de Arceus
  activeFx = cover ? scene.fx.filter(f => OVER_COVER.has(f) || (mode === 'home' && f === 'rays')) : scene.fx;
  st = {};
  for (const name of activeFx) st[name] = FX[name].init ? FX[name].init(scene.colors) : null;
  dim = mode === 'region' ? (cover ? .3 : .5) : dimLevel;
  legendsEl.innerHTML = cover ? '' : scene.legends.map((id, i) =>
    `<img class="${i ? 'side' : 'main'}" src="${artwork(id)}" alt="" style="--i:${i}" onload="this.classList.add('is-in')">`).join('');
  resize();
  if (reduced) render(performance.now());
}

export const showHomeBackdrop = (coverSrc, dimLevel = 0) => setScene('home', 'home', coverSrc, dimLevel);
export const showRegionBackdrop = (region, coverSrc) => setScene(region.id, 'region', coverSrc);

// Monta el motor dentro del elemento dado (una sola vez, desde el componente <Backdrop>).
export function initBackdrop(el) {
  if (root) return;
  root = el;
  root.innerHTML = '<img class="scene-cover-blur" alt="" hidden><img class="scene-cover" alt="" hidden><canvas class="scene-canvas"></canvas><div class="scene-legends"></div><div class="scene-vignette"></div>';
  coverEl = root.querySelector('.scene-cover');
  blurEl = root.querySelector('.scene-cover-blur');
  canvas = root.querySelector('canvas');
  ctx = canvas.getContext('2d');
  legendsEl = root.querySelector('.scene-legends');
  // Portadas verticales: completas al centro sobre una copia desenfocada, sin agrandarse más de 1.1x
  coverEl.addEventListener('load', () => {
    root.dataset.shape = coverEl.naturalHeight > coverEl.naturalWidth * 1.05 ? 'portrait' : 'landscape';
    coverEl.style.maxHeight = root.dataset.shape === 'portrait' ? coverEl.naturalHeight * 1.1 + 'px' : '';
  });
  addEventListener('resize', () => { resize(); if (reduced && scene) render(performance.now()); });
  addEventListener('pointermove', e => {
    root.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
    root.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
  }, { passive: true });
  resize();
  if (!reduced) requestAnimationFrame(loop);
}
