// Convierte un mapa de js/data/maps.js en una cuadrícula: qué parada ocupa cada casilla
// y qué se dibuja en ella. Es lógica pura (sin DOM), por eso se puede probar en Node.

import { seeded } from '../utils.js';

const CAVE = /(cave|tunnel|mt-|mine|mountain|ruins|path$|pass|slopes|terrace|pyre)/;
const FOREST = /(forest|woods|grove|tangle|weald|park)/;

// Cada bioma cambia la decoración: cactus en el desierto, pinos nevados, charcos en el pantano…
const DECOR = {
  desert: { tree: 'cactus', flowers: 'sand', tallgrass: 'sand', grass: 'sand' },
  snow: { tree: 'pine', flowers: 'grass' },
  swamp: { flowers: 'puddle', grass: 'grass' },
  volcano: { tree: 'rock', flowers: 'rock' },
  mountain: { flowers: 'rock' },
  coast: { flowers: 'beach' },
};
function biomeDecor(k, b, r) {
  if (b === 'forest' && (k === 'grass' || k === 'flowers') && r < .75) return 'tree';
  if (b === 'swamp' && k === 'grass' && r > .8) return 'puddle';
  if (b === 'desert' && k === 'sand' && r > .93) return 'cactus';
  return (DECOR[b] && DECOR[b][k]) || k;
}

const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const isSegmentList = r => Array.isArray(r[0][0]);

// Une los puntos con tramos en L (primero horizontal, luego vertical).
function rasterize(points) {
  const cells = [];
  let [x, y] = points[0];
  cells.push([x, y]);
  for (const [tx, ty] of points.slice(1)) {
    while (x !== tx) { x += Math.sign(tx - x); cells.push([x, y]); }
    while (y !== ty) { y += Math.sign(ty - y); cells.push([x, y]); }
  }
  return cells;
}

function routeStyle(name, sea) {
  if (sea) return 'searoute';
  if (CAVE.test(name)) return 'cave';
  if (FOREST.test(name)) return 'forestpath';
  return 'route';
}

export function buildLayout(map, seed) {
  const [W, H] = map.size;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  // Terreno base: tierra o mar
  const sea = grid(W, H, map.base === 'sea');
  const paint = (rects, v) => (rects || []).forEach(([rx, ry, rw, rh]) => {
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) if (inside(x, y)) sea[y][x] = v;
  });
  paint(map.sea, true);
  paint(map.land, false);

  // Bioma de cada casilla (nieve, desierto, pantano…)
  const zones = map.zones || [];
  const biome = grid(W, H, null);
  for (const [zx, zy, zw, zh, b] of zones) {
    for (let y = zy; y < zy + zh; y++) for (let x = zx; x < zx + zw; x++) if (inside(x, y)) biome[y][x] = b;
  }

  // Paradas y dueño de cada casilla (los pueblos primero, así las rutas no los pisan)
  const stops = [];
  const owner = grid(W, H, -1);
  const claim = (k, [x, y]) => { if (inside(x, y) && owner[y][x] < 0) { owner[y][x] = k; stops[k].cells.push([x, y]); } };

  for (const [key, [cx, cy]] of Object.entries(map.towns)) {
    const k = stops.push({ type: 'town', key, center: [cx, cy], cells: [] }) - 1;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) claim(k, [cx + dx, cy + dy]);
  }
  let idx = 0;
  for (const [key, def] of Object.entries(map.routes)) {
    const k = stops.push({ type: 'route', key, idx: idx++, cells: [] }) - 1;
    (isSegmentList(def) ? def : [def]).forEach(seg => rasterize(seg).forEach(c => claim(k, c)));
  }
  for (const seg of map.links || []) {
    const k = stops.push({ type: 'travel', key: 'travel', cells: [] }) - 1;
    rasterize(seg).forEach(c => claim(k, c));
  }

  // Qué se dibuja en cada casilla
  const kind = grid(W, H, null);
  const rnd = seeded(seed);
  const free = (x, y) => inside(x, y) && owner[y][x] < 0 && !sea[y][x] && !kind[y][x];

  stops.forEach(s => s.cells.forEach(([x, y]) => {
    kind[y][x] = s.type === 'town' ? 'town'
      : s.type === 'travel' ? (sea[y][x] ? 'bridge' : 'road')
      : routeStyle(s.key, sea[y][x]);
  }));

  for (const s of stops) {
    if (s.type === 'town') {
      const [cx, cy] = s.center;
      ['house', 'center', 'mart'].forEach((b, i) => { if (free(cx - 1 + i, cy - 2)) kind[cy - 2][cx - 1 + i] = b; });
      [-1, 1].forEach(dx => { if (free(cx + dx, cy + 2)) kind[cy + 2][cx + dx] = 'house'; });
    } else if (s.type === 'route') {
      const [x, y] = s.cells[0] || [];
      const spot = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]].find(([a, b]) => free(a, b));
      if (spot && !sea[y][x]) kind[spot[1]][spot[0]] = 'sign';
    }
  }

  const near = (x, y, test) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inside(x + dx, y + dy) && test(x + dx, y + dy));
  const a = rnd() * 6, b = rnd() * 6;

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (kind[y][x]) continue;
    if (sea[y][x]) { kind[y][x] = 'water'; continue; }
    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
    const r = rnd();
    const forest = Math.sin(x * .7 + b) * Math.cos(y * .6 + a);
    kind[y][x] =
      edge ? 'tree'
      : near(x, y, (i, j) => sea[j][i] && owner[j][i] < 0) ? 'beach'
      : near(x, y, (i, j) => kind[j][i] === 'cave') ? 'rock'
      : near(x, y, (i, j) => kind[j][i] === 'forestpath') ? 'tree'
      : near(x, y, (i, j) => kind[j][i] === 'route') && r < .55 ? 'tallgrass'
      : forest > .5 || r < .08 ? 'tree'
      : r < .16 ? 'flowers'
      : 'grass';
    kind[y][x] = biomeDecor(kind[y][x], biome[y][x], r);
  }

  return { W, H, stops, owner, kind, sea, biome, zones };
}

// Busca el camino más corto entre dos casillas caminables (para ir con un clic).
export function findPath(layout, from, to) {
  const { W, H, owner } = layout;
  const key = (x, y) => y * W + x;
  const prev = new Map([[key(...from), null]]);
  const queue = [from];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === to[0] && y === to[1]) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || owner[ny][nx] < 0 || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), [x, y]);
      queue.push([nx, ny]);
    }
  }
  if (!prev.has(key(...to))) return [];
  const path = [];
  for (let c = to; c && (c[0] !== from[0] || c[1] !== from[1]); c = prev.get(key(...c))) path.unshift(c);
  return path;
}
