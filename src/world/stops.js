// Nombres de las paradas: se enlazan con los nombres reales de PokeAPI y se muestran bonitos.

// Asigna a cada parada su nombre en PokeAPI ("route-1" → "kanto-route-1").
export function resolveStopNames(stops, regionId, apiLocations) {
  const known = new Set(apiLocations);
  for (const s of stops) {
    if (s.type === 'travel') { s.name = 'travel'; continue; }
    s.name = [`${regionId}-${s.key}`, s.key, `${s.key}-${regionId}`].find(n => known.has(n)) || s.key;
  }
}

// "kanto-route-1" → "Ruta 1", "pallet-town" → "Pallet Town"
export function placeName(stop, regionId) {
  if (stop.type === 'travel') return 'Travesía';
  const n = stop.key
    .replace(regionId + '-', '')
    .replace(/^kanto-/, '')
    .replace(/^sea-route-(\d+)/, 'ruta-marina-$1')
    .replace(/^route-(\d+)/, 'ruta-$1');
  return n.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Etiqueta corta para dibujar sobre el mapa (número de ruta), o null.
export function mapBadge(stop) {
  const m = stop.type === 'route' && stop.key.match(/route-(\d+)$/);
  return m ? m[1] : null;
}
