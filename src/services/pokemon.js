// Ficha completa de un Pokémon (REST, cacheada): especie, habilidades, objetos y evolución.

import { rest, cached, idFromUrl } from './api.js';

const REGIONAL = { alola: 'Alola', galar: 'Galar', hisui: 'Hisui', paldea: 'Paldea' };
const regionOf = name => (name.match(/-(alola|galar|hisui|paldea)/) || [])[1];

function formLabel(name, species) {
  if (name === species) return 'Forma normal';
  const r = regionOf(name);
  if (r) return `De ${REGIONAL[r]}`;
  if (/-mega/.test(name)) return name.endsWith('-x') ? 'Mega X' : name.endsWith('-y') ? 'Mega Y' : 'Mega';
  if (/-gmax$/.test(name)) return 'Gigamax';
  return name.replace(species + '-', '').replace(/-/g, ' ');
}

const inLang = (arr, lang) => arr.filter(x => x.language.name === lang);
const esName = obj => (inLang(obj.names || [], 'es')[0] || inLang(obj.names || [], 'en')[0] || { name: obj.name }).name;

function evolutionLabel(d) {
  if (!d) return '';
  if (d.min_level) return `Nv. ${d.min_level}`;
  if (d.item) return d.item.name;
  if (d.trigger.name === 'trade') return d.held_item ? `Intercambio + ${d.held_item.name}` : 'Intercambio';
  if (d.min_happiness) return 'Amistad';
  if (d.known_move) return `Mov. ${d.known_move.name}`;
  if (d.location) return d.location.name;
  return d.trigger.name;
}

function flattenChain(node, out = []) {
  out.push({ id: idFromUrl(node.species.url), name: node.species.name, how: evolutionLabel(node.evolution_details[0]) });
  node.evolves_to.forEach(n => flattenChain(n, out));
  return out;
}

export function pokemonDetail(id) {
  return cached('pk2:' + id, async () => {
    const p = await rest('pokemon/' + id);
    const [species, abilities, items] = await Promise.all([
      rest(p.species.url),
      Promise.all(p.abilities.map(a => rest(a.ability.url))),
      Promise.all(p.held_items.map(h => rest(h.item.url))),
    ]);
    const evo = species.evolution_chain ? await rest(species.evolution_chain.url) : null;

    const flavorsEs = inLang(species.flavor_text_entries, 'es');
    const flavor = flavorsEs[flavorsEs.length - 1] || inLang(species.flavor_text_entries, 'en').pop();
    const genus = inLang(species.genera, 'es')[0] || inLang(species.genera, 'en')[0];

    return {
      id: p.id,
      dex: species.id,
      name: regionOf(p.name) ? `${esName(species)} de ${REGIONAL[regionOf(p.name)]}` : esName(species),
      genus: genus ? genus.genus : '',
      flavor: flavor ? { text: flavor.flavor_text.replace(/[\n\f\r­]/g, ' '), version: flavor.version.name } : null,
      types: p.types.map(t => t.type.name),
      abilities: p.abilities.map((a, i) => ({ name: esName(abilities[i]), hidden: a.is_hidden })),
      stats: p.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      height: p.height / 10,
      weight: p.weight / 10,
      baseExp: p.base_experience,
      capture: species.capture_rate,
      happiness: species.base_happiness,
      growth: species.growth_rate ? species.growth_rate.name : null,
      eggGroups: species.egg_groups.map(g => g.name),
      genderRate: species.gender_rate,               // -1 = sin género; si no, octavos hembra
      legendary: species.is_legendary,
      mythical: species.is_mythical,
      held: p.held_items.map((h, i) => ({
        name: h.item.name,
        nameEs: esName(items[i]),
        versions: h.version_details.map(v => ({ version: v.version.name, rarity: v.rarity })),
      })),
      cry: p.cries ? p.cries.latest : null,
      chain: evo ? flattenChain(evo.chain) : [],
      forms: species.varieties
        .filter(v => v.pokemon.name !== p.name)
        .map(v => ({ id: idFromUrl(v.pokemon.url), label: formLabel(v.pokemon.name, species.name) })),
    };
  });
}
