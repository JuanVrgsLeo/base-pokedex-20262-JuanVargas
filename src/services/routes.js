// Datos canónicos de regiones y rutas.
// Una ruta se pide con UNA consulta GraphQL (encuentros, juego, método, rareza, horario y
// objetos equipados). Si GraphQL falla, se usa REST como respaldo.

import { rest, graphql, cached, idFromUrl } from './api.js';
import { VERSION_ORDER, isDefaultCondition } from '../data/dictionaries.js';

const ES = 7; // id del idioma español en PokeAPI

const ROUTE_QUERY = `query Route($name: String!) {
  location(where: {name: {_eq: $name}}) {
    locationareas {
      name
      encounters {
        min_level max_level
        version { name }
        encounterslot { rarity encountermethod { name } }
        encounterconditionvaluemaps { encounterconditionvalue { name } }
        pokemon {
          id name
          pokemontypes { type { name } }
          pokemonspecy { pokemonspeciesnames(where: {language_id: {_eq: ${ES}}}) { name } }
          pokemonitems { rarity version { name } item { name itemnames(where: {language_id: {_eq: ${ES}}}) { name } } }
        }
      }
    }
  }
}`;

/* ---------- Región ---------- */

export function loadRegion(name) {
  return cached('region:' + name, async () => {
    const r = await rest('region/' + name);
    return { locations: r.locations.map(l => l.name), dex: r.pokedexes[0] ? r.pokedexes[0].url : null };
  });
}

const DEX_QUERY = `query Dex($id: Int!) {
  pokemondexnumber(where: {pokedex_id: {_eq: $id}}, order_by: {pokedex_number: asc}) {
    pokedex_number
    pokemonspecy {
      id name
      pokemonspeciesnames(where: {language_id: {_eq: ${ES}}}) { name }
      pokemons(limit: 1) { pokemontypes { type { name } } }
    }
  }
}`;

const FORMS_QUERY = `query Forms($like: String!) {
  pokemon(where: {name: {_like: $like}}, order_by: {id: asc}) {
    id name
    pokemontypes { type { name } }
    pokemonspecy { id pokemonspeciesnames(where: {language_id: {_eq: ${ES}}}) { name } }
  }
}`;

// Formas regionales (Vulpix de Alola, Ponyta de Galar…) en una consulta.
export function regionalForms(regionId) {
  return cached('forms:' + regionId, async () => {
    const d = await graphql(FORMS_QUERY, { like: `%-${regionId}%` });
    return d.pokemon
      .filter(p => !/(totem|-cap)/.test(p.name))
      .map(p => ({
        id: p.id, num: p.pokemonspecy.id,
        name: (p.pokemonspecy.pokemonspeciesnames[0] || {}).name || p.name,
        types: p.pokemontypes.map(t => t.type.name),
      }));
  });
}

// Pokédex regional completa (número regional, nombre en español y tipos) en una consulta.
export function regionalDex(url) {
  return cached('dex2:' + url, async () => {
    try {
      const d = await graphql(DEX_QUERY, { id: idFromUrl(url) });
      return d.pokemondexnumber.map(({ pokedex_number: num, pokemonspecy: s }) => ({
        num, id: s.id,
        name: (s.pokemonspeciesnames[0] || {}).name || s.name,
        types: s.pokemons[0] ? s.pokemons[0].pokemontypes.map(t => t.type.name) : null,
      }));
    } catch {
      const d = await rest(url);
      return d.pokemon_entries.map(e => ({ num: e.entry_number, id: idFromUrl(e.pokemon_species.url), name: e.pokemon_species.name, types: null }));
    }
  });
}

/* ---------- Ruta ---------- */

// Filas normalizadas: una por (área, juego, espacio de encuentro).
async function rowsFromGraphQL(name) {
  const data = await graphql(ROUTE_QUERY, { name });
  const loc = data.location[0];
  if (!loc) return [];
  return loc.locationareas.flatMap(area => area.encounters.map(e => ({
    area: area.name,
    version: e.version.name,
    method: e.encounterslot.encountermethod.name,
    rarity: e.encounterslot.rarity || 0,
    min: e.min_level, max: e.max_level,
    conds: e.encounterconditionvaluemaps.map(c => c.encounterconditionvalue.name),
    id: e.pokemon.id,
    name: e.pokemon.name,
    nameEs: (e.pokemon.pokemonspecy.pokemonspeciesnames[0] || {}).name || null,
    types: e.pokemon.pokemontypes.map(t => t.type.name),
    items: e.pokemon.pokemonitems.map(i => ({
      name: i.item.name, nameEs: (i.item.itemnames[0] || {}).name || null, rarity: i.rarity, version: i.version.name,
    })),
  })));
}

async function rowsFromREST(name) {
  const loc = await rest('location/' + name);
  const areas = await Promise.all(loc.areas.map(a => rest(a.url)));
  return areas.flatMap(area => area.pokemon_encounters.flatMap(pe =>
    pe.version_details.flatMap(vd => vd.encounter_details.map(d => ({
      area: area.name,
      version: vd.version.name,
      method: d.method.name,
      rarity: d.chance,
      min: d.min_level, max: d.max_level,
      conds: d.condition_values.map(c => c.name),
      id: idFromUrl(pe.pokemon.url),
      name: pe.pokemon.name, nameEs: null, types: null, items: [],
    })))));
}

const getOr = (map, key, make) => (map.has(key) ? map.get(key) : map.set(key, make()).get(key));

/**
 * Agrupa las filas por juego → método → Pokémon.
 * La probabilidad de un Pokémon es la suma de sus espacios bajo las mismas condiciones
 * (ej. "noche"), tomando el máximo entre condiciones y áreas.
 */
export function summarize(rows) {
  const versions = new Map();

  for (const r of rows) {
    const v = getOr(versions, r.version, () => ({ methods: new Map(), items: new Map() }));
    const mons = getOr(v.methods, r.method, () => new Map());
    const mon = getOr(mons, r.id, () => ({
      id: r.id, name: r.nameEs || r.name, types: r.types, min: r.min, max: r.max, slots: new Map(), conds: new Set(),
    }));
    mon.min = Math.min(mon.min, r.min);
    mon.max = Math.max(mon.max, r.max);
    const key = r.area + '|' + [...r.conds].sort().join(',');
    mon.slots.set(key, (mon.slots.get(key) || 0) + r.rarity);
    r.conds.filter(c => !isDefaultCondition(c)).forEach(c => mon.conds.add(c));

    for (const it of r.items) {
      if (it.version !== r.version) continue;
      const item = getOr(v.items, it.name, () => ({ name: it.name, nameEs: it.nameEs, holders: new Map() }));
      item.holders.set(r.id, { id: r.id, name: r.nameEs || r.name, rarity: it.rarity });
    }
  }

  const order = v => { const i = VERSION_ORDER.indexOf(v); return i < 0 ? 999 : i; };
  return [...versions]
    .sort(([a], [b]) => order(a) - order(b))
    .map(([version, v]) => ({
      version,
      methods: [...v.methods].map(([method, mons]) => ({
        method,
        pokemon: [...mons.values()].map(finishMon).sort((a, b) => b.rate - a.rate || a.id - b.id),
      })),
      items: [...v.items.values()].map(i => ({ ...i, holders: [...i.holders.values()] })),
    }));
}

function finishMon({ slots, conds, ...mon }) {
  let list = [...conds];
  const times = list.filter(c => c.startsWith('time-'));
  if (times.length === 3) list = list.filter(c => !c.startsWith('time-')); // aparece a toda hora
  return { ...mon, rate: Math.min(100, Math.max(...slots.values())), conds: list };
}

export function routeSummary(name) {
  return cached('route:' + name, async () => {
    let rows;
    try { rows = await rowsFromGraphQL(name); } catch { rows = await rowsFromREST(name); }
    return summarize(rows);
  });
}
