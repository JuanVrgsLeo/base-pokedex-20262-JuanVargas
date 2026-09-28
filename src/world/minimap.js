// Minimapa: un píxel por casilla, con los colores del bioma. Se genera una vez por región.

import { MAPS } from '../data/maps.js';
import { buildLayout } from './layout.js';
import { BIOMES } from './tiles.js';

const PATH_COLORS = {
  water: '#3f95db', searoute: '#8cc8f2', bridge: '#b07c48', route: '#f2dfa6', road: '#d8d2c2',
  cave: '#b08a60', forestpath: '#c9ab70', town: '#ffffff', house: '#e2453c', center: '#e2453c', mart: '#3f7fd9',
  beach: '#f0dea4', rock: '#8f7a64', sign: '#b07c48',
};
const TALL = new Set(['tree', 'pine', 'cactus']);
const cache = new Map();

export function drawMinimap(canvas, region) {
  if (!cache.has(region.id)) cache.set(region.id, buildLayout(MAPS[region.id], region.id));
  const { W, H, kind, biome } = cache.get(region.id);
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = kind[y][x];
    const theme = { ...region.theme, ...BIOMES[biome[y][x] || 'grass'] };
    g.fillStyle = PATH_COLORS[k] || (TALL.has(k) ? theme.tree : theme.grass);
    g.fillRect(x, y, 1, 1);
  }
}
