// Utilidades pequeñas y puras.

export const $ = (sel, root = document) => root.querySelector(sel);

export const cap = s => String(s).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const dexNumber = n => '#' + String(n).padStart(4, '0');

export const lookup = (dict, key, fallback = cap(key)) => (dict[key] ? dict[key] : [fallback, '#888']);

// Color de texto legible (negro o blanco) sobre un fondo hex.
export function textOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#161a2e' : '#ffffff';
}

// Aclara (amt > 0) u oscurece (amt < 0) un color hex.
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + 255 * amt)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
}

// Franja horaria canónica (Gen IV): mañana 4–10, día 10–20, noche 20–4.
export function currentPeriod(date = new Date()) {
  const h = date.getHours();
  if (h >= 4 && h < 10) return 'morning';
  if (h >= 10 && h < 20) return 'day';
  return 'night';
}

// Números pseudoaleatorios con semilla: el mismo texto produce siempre la misma secuencia.
export function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}
