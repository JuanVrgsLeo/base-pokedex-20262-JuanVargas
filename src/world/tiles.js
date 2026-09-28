// Pintores de casillas (32x32) para el fondo del mapa. Todo es dibujo vectorial en canvas.

import { shade } from '../utils.js';

export const T = 32;

function blades(g, x, y, color, light) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y + 12); g.lineTo(x + 3, y); g.lineTo(x + 5, y + 8);
  g.lineTo(x + 8, y + 1); g.lineTo(x + 10, y + 12);
  g.closePath(); g.fill();
  g.fillStyle = light;
  g.fillRect(x + 3, y + 3, 1, 5);
  g.fillRect(x + 8, y + 4, 1, 4);
}

function building(g, x, y, roof, wall = '#f6f1e3') {
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 4, y + 28, 26, 3);
  g.fillStyle = wall; g.fillRect(x + 4, y + 13, 24, 16);
  g.fillStyle = roof;
  g.beginPath(); g.moveTo(x + 1, y + 15); g.lineTo(x + 6, y + 3); g.lineTo(x + 26, y + 3); g.lineTo(x + 31, y + 15); g.fill();
  g.fillStyle = shade(roof, -.15);
  for (let i = 0; i < 3; i++) g.fillRect(x + 5 + i, y + 6 + i * 3, 22 - i * 2, 1);
  g.fillStyle = '#5b3a22'; g.fillRect(x + 13, y + 20, 6, 9);
  g.fillStyle = '#8fd0ff'; g.fillRect(x + 6, y + 17, 5, 5); g.fillRect(x + 21, y + 17, 5, 5);
}

export const PAINTERS = {
  grass(g, x, y, th, rnd) {
    g.fillStyle = th.grass; g.fillRect(x, y, T, T);
    g.fillStyle = th.grassDark;
    for (let i = 0; i < 3; i++) g.fillRect(x + 2 + rnd() * 26, y + 2 + rnd() * 26, 3, 1);
  },

  tallgrass(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
      blades(g, x + 3 + i * 15, y + 3 + j * 15, th.tall, th.grassLight);
  },

  flowers(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    ['#ffffff', '#ffd23f', '#ff6b9a', '#ffffff'].forEach((c, k) => {
      const fx = x + 4 + (k % 2) * 14 + rnd() * 6, fy = y + 4 + (k >> 1) * 14 + rnd() * 6;
      g.fillStyle = c; g.fillRect(fx, fy + 1, 4, 2); g.fillRect(fx + 1, fy, 2, 4);
      g.fillStyle = '#e8a33d'; g.fillRect(fx + 1, fy + 1, 2, 2);
    });
  },

  tree(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    g.fillStyle = 'rgba(0,0,0,.2)';
    g.beginPath(); g.ellipse(x + 16, y + 28, 11, 3.5, 0, 0, 7); g.fill();
    g.fillStyle = '#6b4a2b'; g.fillRect(x + 13, y + 21, 6, 8);
    g.fillStyle = th.treeDark;
    g.beginPath(); g.arc(x + 16, y + 14, 13, 0, 7); g.fill();
    g.fillStyle = th.tree;
    g.beginPath(); g.arc(x + 15, y + 12, 11, 0, 7); g.fill();
    g.fillStyle = th.treeLight;
    g.beginPath(); g.arc(x + 11, y + 8, 4, 0, 7); g.fill();
  },

  water(g, x, y) {
    g.fillStyle = '#3f95db'; g.fillRect(x, y, T, T);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5;
    [[5, 10], [16, 22]].forEach(([wx, wy]) => {
      g.beginPath(); g.moveTo(x + wx, y + wy); g.quadraticCurveTo(x + wx + 5, y + wy - 4, x + wx + 10, y + wy); g.stroke();
    });
  },

  route(g, x, y) {
    g.fillStyle = '#d4b877'; g.fillRect(x, y, T, T);
    g.fillStyle = '#e6cf94'; g.fillRect(x + 2, y + 2, T - 4, T - 4);
    g.fillStyle = '#c7a863';
    g.fillRect(x + 8, y + 9, 2, 2); g.fillRect(x + 21, y + 18, 3, 2); g.fillRect(x + 12, y + 25, 2, 1);
  },

  town(g, x, y) {
    g.fillStyle = '#d9d2bf'; g.fillRect(x, y, T, T);
    g.fillStyle = '#e8e2d2';
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(x + 1 + i * 16, y + 1 + j * 16, 14, 14);
  },

  house(g, x, y, th, rnd) { PAINTERS.grass(g, x, y, th, rnd); building(g, x, y, th.roof); },

  center(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    building(g, x, y, '#e2453c');
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 16, y + 9, 4, 0, 7); g.fill();
    g.fillStyle = '#e2453c'; g.fillRect(x + 12, y + 8.5, 8, 1);
  },

  mart(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    building(g, x, y, '#3f7fd9');
    g.fillStyle = '#fff'; g.fillRect(x + 11, y + 6, 10, 5);
    g.fillStyle = '#3f7fd9'; g.fillRect(x + 13, y + 8, 6, 1);
  },

  searoute(g, x, y) {
    PAINTERS.water(g, x, y);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 4, y + 4, T - 8, T - 8);
  },

  bridge(g, x, y) {
    PAINTERS.water(g, x, y);
    g.fillStyle = '#8b5e34'; g.fillRect(x + 6, y, 20, T);
    g.fillStyle = '#b07c48';
    for (let i = 0; i < 4; i++) g.fillRect(x + 6, y + 1 + i * 8, 20, 6);
  },

  road(g, x, y) {
    g.fillStyle = '#b9b3a3'; g.fillRect(x, y, T, T);
    g.fillStyle = '#cfc9b8'; g.fillRect(x + 2, y + 2, T - 4, T - 4);
  },

  cave(g, x, y) {
    g.fillStyle = '#8a6a4a'; g.fillRect(x, y, T, T);
    g.fillStyle = '#a27f5a'; g.fillRect(x + 2, y + 2, T - 4, T - 4);
    g.fillStyle = '#6f5238';
    g.fillRect(x + 7, y + 8, 4, 3); g.fillRect(x + 20, y + 19, 5, 3); g.fillRect(x + 13, y + 25, 3, 2);
  },

  forestpath(g, x, y, th) {
    g.fillStyle = th.treeDark; g.fillRect(x, y, T, T);
    g.fillStyle = '#b89a62'; g.fillRect(x + 4, y + 4, T - 8, T - 8);
    g.fillStyle = th.tall; g.fillRect(x + 8, y + 10, 3, 3); g.fillRect(x + 20, y + 20, 3, 3);
  },

  beach(g, x, y, th, rnd) {
    g.fillStyle = '#f0dea4'; g.fillRect(x, y, T, T);
    g.fillStyle = '#e2cb86';
    for (let i = 0; i < 3; i++) g.fillRect(x + 3 + rnd() * 24, y + 3 + rnd() * 24, 2, 2);
  },

  rock(g, x, y) {
    g.fillStyle = '#7a6552'; g.fillRect(x, y, T, T);
    g.fillStyle = '#9a8269';
    g.beginPath(); g.moveTo(x + 2, y + 30); g.lineTo(x + 12, y + 6); g.lineTo(x + 20, y + 16); g.lineTo(x + 26, y + 8); g.lineTo(x + 31, y + 30); g.fill();
    g.fillStyle = '#c2ad94'; g.fillRect(x + 11, y + 8, 2, 5);
  },

  sand(g, x, y, th) {
    g.fillStyle = th.grass; g.fillRect(x, y, T, T);
    g.strokeStyle = th.grassDark; g.lineWidth = 1.5;
    [[4, 10], [14, 22]].forEach(([dx, dy]) => {
      g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + 7, y + dy - 4, x + dx + 14, y + dy); g.stroke();
    });
  },

  cactus(g, x, y, th, rnd) {
    PAINTERS.sand(g, x, y, th, rnd);
    g.fillStyle = '#3f8a3a';
    g.fillRect(x + 13, y + 5, 6, 23); g.fillRect(x + 6, y + 11, 4, 9); g.fillRect(x + 22, y + 9, 4, 8);
    g.fillRect(x + 6, y + 18, 8, 3); g.fillRect(x + 18, y + 15, 8, 3);
    g.fillStyle = '#6fbf5a'; g.fillRect(x + 14, y + 6, 1, 20);
  },

  pine(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    g.fillStyle = '#6b4a2b'; g.fillRect(x + 14, y + 24, 4, 6);
    [[16, 3, 7, 11], [16, 9, 10, 17], [16, 15, 13, 24]].forEach(([cx, top, half, bottom], i) => {
      g.fillStyle = th.tree;
      g.beginPath(); g.moveTo(x + cx, y + top); g.lineTo(x + cx - half, y + bottom); g.lineTo(x + cx + half, y + bottom); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.moveTo(x + cx, y + top); g.lineTo(x + cx - half * .45, y + top + (bottom - top) * .45); g.lineTo(x + cx + half * .45, y + top + (bottom - top) * .45); g.fill();
    });
  },

  puddle(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    g.fillStyle = '#4d6b5a';
    g.beginPath(); g.ellipse(x + 16, y + 17, 12, 7, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 10, y + 14, 6, 1);
  },

  sign(g, x, y, th, rnd) {
    PAINTERS.grass(g, x, y, th, rnd);
    g.fillStyle = '#6b4a2b'; g.fillRect(x + 14, y + 16, 4, 12);
    g.fillStyle = '#8b5e34'; g.fillRect(x + 6, y + 6, 20, 12);
    g.fillStyle = '#b07c48'; g.fillRect(x + 7, y + 7, 18, 10);
    g.fillStyle = '#5b3a22'; g.fillRect(x + 10, y + 10, 12, 1); g.fillRect(x + 10, y + 13, 9, 1);
  },
};

// Paletas por bioma: sustituyen los colores base de la región en esa zona del mapa.
export const BIOMES = {
  grass: {},
  forest: { grass: '#4f9a4a', tree: '#1f5a2a' },
  wild: { grass: '#8fcf6a' },
  tropical: { grass: '#6fd08a', tree: '#1c8a55' },
  coast: { grass: '#b9d88a', tree: '#2f7d5a' },
  swamp: { grass: '#6b8a45', tree: '#34502e' },
  mountain: { grass: '#a3a88f', tree: '#4a6247' },
  desert: { grass: '#e2c47a', tree: '#7d8f3e' },
  volcano: { grass: '#8c6f62', tree: '#4f5a3a', roof: '#6b3a2a' },
  snow: { grass: '#e6eef5', tree: '#3b6b66', roof: '#5a7fb0' },
};

// Deriva los tonos secundarios del tema de la región.
export function expandTheme(theme) {
  return {
    ...theme,
    grassDark: shade(theme.grass, -.08),
    grassLight: shade(theme.grass, .18),
    tall: shade(theme.grass, -.22),
    treeDark: shade(theme.tree, -.1),
    treeLight: shade(theme.tree, .14),
  };
}
