// Cliente de PokeAPI: REST + GraphQL, con caché en memoria y en localStorage.

const REST_URL = 'https://pokeapi.co/api/v2/';
const GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2';
const CACHE_PREFIX = 'cpdex:v2:';
const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/';

export const idFromUrl = url => Number(url.split('/').filter(Boolean).pop());
export const sprite = id => `${SPRITES}pokemon/${id}.png`;
export const artwork = (id, shiny = false) => `${SPRITES}pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;
export const itemSprite = name => `${SPRITES}items/${name}.png`;

// Limpia la caché de versiones anteriores de la app.
try {
  Object.keys(localStorage)
    .filter(k => k.startsWith('cpdex:') && !k.startsWith(CACHE_PREFIX))
    .forEach(k => localStorage.removeItem(k));
} catch {}

const inFlight = new Map();

// Evita repetir la misma petición mientras la app está abierta.
function request(url, init) {
  const key = url + (init ? init.body : '');
  if (!inFlight.has(key)) {
    const p = fetch(url, init).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    p.catch(() => inFlight.delete(key));
    inFlight.set(key, p);
  }
  return inFlight.get(key);
}

export const rest = path => request(path.startsWith('http') ? path : REST_URL + path);

export async function graphql(query, variables) {
  const res = await request(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (res.errors) throw new Error(res.errors[0].message);
  return res.data;
}

// Ejecuta fn() una sola vez y persiste el resultado (ya recortado) en localStorage.
export async function cached(key, fn) {
  key = CACHE_PREFIX + key;
  try {
    const hit = localStorage.getItem(key);
    if (hit) return JSON.parse(hit);
  } catch {}
  const data = await fn();
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  return data;
}
