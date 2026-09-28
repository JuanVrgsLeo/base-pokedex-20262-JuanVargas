// Pokédex regional completa (y formas regionales), con búsqueda por nombre, número o tipo.

import { useEffect, useMemo, useState } from 'react';
import { regionalDex, regionalForms } from '../services/routes.js';
import { sprite } from '../services/api.js';
import { TYPES } from '../data/dictionaries.js';
import { lookup } from '../utils.js';
import { displayName, typeColor, TypeList } from './Pokemon.jsx';

const FORM_REGIONS = ['alola', 'galar', 'hisui', 'paldea'];

const matches = q => p => !q || p.name.toLowerCase().includes(q) || String(p.num) === q ||
  (p.types || []).some(t => t.startsWith(q) || lookup(TYPES, t)[0].toLowerCase().startsWith(q));

function Entry({ p, suffix = '', onClick }) {
  return (
    <button className="dex-entry" style={{ '--c': typeColor(p.types) }} onClick={onClick}>
      <span className="dex-num">#{String(p.num).padStart(3, '0')}</span>
      <img src={sprite(p.id)} alt="" width="72" height="72" loading="lazy" />
      <b>{displayName(p.name)}{suffix}</b>
      <TypeList types={p.types} />
    </button>
  );
}

export default function RegionDex({ region, dexUrl, onPokemon }) {
  const [entries, setEntries] = useState(null);
  const [forms, setForms] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      dexUrl ? regionalDex(dexUrl) : [],
      FORM_REGIONS.includes(region.id) ? regionalForms(region.id).catch(() => []) : [],
    ])
      .then(([dex, regional]) => { if (alive) { setEntries(dex); setForms(regional); } })
      .catch(e => alive && setError(e.message));
    return () => { alive = false; };
  }, [region.id, dexUrl]);

  const test = useMemo(() => matches(query.trim().toLowerCase()), [query]);
  const list = (entries || []).filter(test);
  const formList = forms.filter(test);

  return (
    <section className="region-dex">
      <header className="dex-head">
        <div><span className="panel-kind">Pokédex regional</span><h3>{region.name}</h3></div>
        <input className="dex-search" type="search" placeholder="Buscar por nombre, número o tipo…" aria-label="Buscar"
          value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        <span className="dex-count chip">{entries ? `${list.length} de ${entries.length}` : '…'}</span>
      </header>

      {formList.length > 0 && (
        <div className="dex-forms">
          <h4 className="dex-sub">Formas regionales de {region.name} <b>{formList.length}</b></h4>
          <div className="dex-grid">
            {formList.map(p => <Entry key={p.id} p={p} suffix={` de ${region.name}`} onClick={() => onPokemon(p.id)} />)}
          </div>
          <h4 className="dex-sub">Pokédex regional <b>{list.length}</b></h4>
        </div>
      )}

      <div className="dex-grid main">
        {error ? <p className="panel-empty">Error: {error}</p>
          : !entries ? <div className="panel-empty"><span className="spinner" /></div>
          : list.map(p => <Entry key={p.id} p={p} onClick={() => onPokemon(p.id)} />)}
      </div>
    </section>
  );
}
