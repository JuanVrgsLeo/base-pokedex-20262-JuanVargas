// Motor del mapa: dibuja el plano de la región una sola vez y mueve a Red por las casillas caminables.

import { T, PAINTERS, BIOMES, expandTheme } from './tiles.js';
import { trainerFrame } from './trainer.js';
import { findPath } from './layout.js';
import { seeded } from '../utils.js';

const STEP_MS = 130;
const TINT = { morning: 'rgba(255,170,90,.10)', day: null, night: 'rgba(20,30,90,.34)' };
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function paintBackground(layout, baseTheme, seed) {
  const bg = document.createElement('canvas');
  bg.width = layout.W * T; bg.height = layout.H * T;
  const g = bg.getContext('2d');
  const rnd = seeded(seed + ':paint');
  const themes = {};                                  // una paleta por bioma, calculada una vez
  const themeOf = b => themes[b] || (themes[b] = expandTheme({ ...baseTheme, ...BIOMES[b] }));
  for (let y = 0; y < layout.H; y++) for (let x = 0; x < layout.W; x++) {
    PAINTERS[layout.kind[y][x]](g, x * T, y * T, themeOf(layout.biome[y][x] || 'grass'), rnd);
  }
  return bg;
}

/**
 * @param canvas  <canvas> donde se dibuja
 * @param opts    { layout, region, period, onEnter(stop), onHover(stop|null, event) }
 * @returns       { hold(dir|null), destroy() }
 */
export function createWorld(canvas, { layout, region, period, onEnter, onHover }) {
  const { W, H, owner, stops } = layout;
  const PW = W * T, PH = H * T;
  canvas.width = PW; canvas.height = PH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const bg = paintBackground(layout, region.theme, region.id);
  const walkable = (x, y) => x >= 0 && y >= 0 && x < W && y < H && owner[y][x] >= 0;

  // Estado de Red
  let pos = stops[0].center || stops[0].cells[0];
  let dir = 'down', steps = 0, anim = null, queue = [], held = null, alive = true;
  let current = owner[pos[1]][pos[0]];

  function draw(now = performance.now()) {
    ctx.drawImage(bg, 0, 0);

    // Tramo actual resaltado
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    for (const [x, y] of stops[current].cells) ctx.strokeRect(x * T + 3, y * T + 3, T - 6, T - 6);
    ctx.restore();

    // Red (interpolado entre casillas mientras camina)
    let [x, y] = pos, frame = 'stand';
    if (anim) {
      const k = Math.min(1, (now - anim.t0) / STEP_MS);
      x = anim.from[0] + (x - anim.from[0]) * k;
      y = anim.from[1] + (y - anim.from[1]) * k;
      if (k < 1) frame = k < .5 ? (steps % 2 ? 'a' : 'b') : 'stand';
    }
    ctx.strokeStyle = '#ffcb05'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x * T + 16, y * T + 28, 14, 6, 0, 0, 7); ctx.stroke();
    ctx.drawImage(trainerFrame(dir, frame), x * T - 8, y * T - 20, T * 1.5, T * 1.5);

    if (TINT[period]) { ctx.fillStyle = TINT[period]; ctx.fillRect(0, 0, PW, PH); }
  }

  function stepTo(next) {
    const [dx, dy] = [next[0] - pos[0], next[1] - pos[1]];
    dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    anim = { from: pos, t0: performance.now() };
    pos = next; steps++;
    const k = owner[pos[1]][pos[0]];
    if (k !== current) { current = k; onEnter(stops[k]); }
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!alive) return;
    draw(now);
    if (now - anim.t0 < STEP_MS) return requestAnimationFrame(tick);
    anim = null;
    if (queue.length) return stepTo(queue.shift());
    if (held) tryMove(held);
    if (!anim) draw();
  }

  function tryMove(d) {
    const [dx, dy] = DIRS[d];
    const next = [pos[0] + dx, pos[1] + dy];
    if (walkable(...next)) return stepTo(next);
    dir = d; draw();                                  // bloqueado: solo gira
  }

  function cellAt(e) {
    const r = canvas.getBoundingClientRect();
    return [Math.floor((e.clientX - r.left) / r.width * W), Math.floor((e.clientY - r.top) / r.height * H)];
  }

  const ac = new AbortController();
  const on = (type, fn) => canvas.addEventListener(type, fn, { signal: ac.signal });
  on('click', e => {
    const target = cellAt(e);
    if (!walkable(...target)) return;
    queue = findPath(layout, pos, target);
    if (!anim && queue.length) stepTo(queue.shift());
  });
  on('mousemove', e => {
    const [x, y] = cellAt(e);
    const ok = walkable(x, y);
    canvas.style.cursor = ok ? 'pointer' : 'default';
    onHover(ok ? stops[owner[y][x]] : null, e);
  });
  on('mouseleave', () => onHover(null));

  onEnter(stops[current]);
  draw();

  return {
    hold(d) {
      held = d;
      queue = [];
      if (d && !anim) tryMove(d);
    },
    destroy() { alive = false; ac.abort(); queue = []; held = null; },
  };
}
