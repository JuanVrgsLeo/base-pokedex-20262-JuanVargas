// Piezas pequeñas reutilizadas por el panel de ruta, la Pokédex regional y la ficha.

import { TYPES } from '../data/dictionaries.js';
import { cap, lookup } from '../utils.js';

export const displayName = name => (/^[a-z]/.test(name) ? cap(name) : name);

export const typeColor = types => (types ? lookup(TYPES, types[0])[1] : '#6b7394');

export function TypePill({ type, large = false }) {
  const [name, color] = lookup(TYPES, type);
  return <span className={`type${large ? ' lg' : ''}`} style={{ '--c': color }}>{name}</span>;
}

export function TypeList({ types, className = 'mon-types' }) {
  if (!types) return null;
  return <span className={className}>{types.map(t => <TypePill key={t} type={t} />)}</span>;
}
