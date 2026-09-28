// Aplica la paleta de la región a toda la interfaz (variables CSS con transición).

import { textOn } from '../utils.js';

export function applyPalette(region) {
  const [main, second] = region.colors;
  const s = document.documentElement.style;
  s.setProperty('--accent', main);
  s.setProperty('--accent-2', second);
  s.setProperty('--accent-ink', textOn(main));
  s.setProperty('--tint-a', main + '55');
  s.setProperty('--tint-b', second + '44');
}
