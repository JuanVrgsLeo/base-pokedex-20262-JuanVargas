// Panel lateral: datos canónicos de la parada actual (por juego, método, hora y objetos).

import { useEffect, useState } from 'react';
import { routeSummary, regionalDex } from '../services/routes.js';
import { sprite, itemSprite } from '../services/api.js';
import { VERSIONS, METHODS, CONDITIONS, PERIODS } from '../data/dictionaries.js';
import { cap, dexNumber, lookup, textOn } from '../utils.js';
import { placeName } from '../world/stops.js';
import { displayName, typeColor, TypeList } from './Pokemon.jsx';

const DEBOUNCE_MS = 220; // si Red sigue caminando, no se piden rutas por las que solo pasa

function Header({ kind, label }) {
  return (
    <header className="panel-head">
      <span className="panel-kind">{kind}</span>
      <h3>{label}</h3>
    </header>
  );
}

function MonRow({ p, period, simple = false, onClick }) {
  const times = (p.conds || []).filter(c => c.startsWith('time-'));
  const available = !times.length || times.includes('time-' + period);
  return (
    <button className={`mon${available ? '' : ' is-off'}`} onClick={onClick}>
      <span className="mon-sprite" style={{ '--c': typeColor(p.types) }}>
        <img src={sprite(p.id)} alt="" loading="lazy" width="56" height="56" />
      </span>
      <span className="mon-main">
        <span className="mon-num">{dexNumber(p.id)}</span>
        <b className="mon-name">{displayName(p.name)}</b>
        <TypeList types={p.types} />
      </span>
      {!simple && (
        <span className="mon-side">
          <span className="mon-lv">Nv. {p.min === p.max ? p.min : `${p.min}–${p.max}`}</span>
          <span className="rate"><i style={{ width: `${p.rate}%` }} /></span>
          <span className="mon-pct">{p.rate}%</span>
          {p.conds.length > 0 && (
            <span className="mon-conds">
              {p.conds.map(c => { const [icon, name] = lookup(CONDITIONS, c, cap(c)); return <span key={c} title={name}>{icon}</span>; })}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

export default function RoutePanel({ stop, region, routeCount, period, onPokemon }) {
  const [state, setState] = useState({ status: 'idle' });   // loading | ready | error
  const [version, setVersion] = useState(null);
  const [tab, setTab] = useState('pokemon');

  useEffect(() => {
    if (!stop || stop.type !== 'route') { setState({ status: 'idle' }); return; }
    let alive = true;
    setState({ status: 'loading' });
    const t = setTimeout(async () => {
      try {
        const data = await routeSummary(stop.name);
        let fallback = null;
        if (!data.length && region.dexUrl) {
          const dex = await regionalDex(region.dexUrl);
          const size = Math.ceil(dex.length / routeCount);
          fallback = dex.slice(stop.idx * size, stop.idx * size + size);
        }
        if (!alive) return;
        setState({ status: 'ready', data, fallback });
        setVersion(v => (data.some(x => x.version === v) ? v
          : ((data.find(x => region.games.includes(x.version)) || data[0] || {}).version ?? null)));
      } catch (e) {
        if (alive) setState({ status: 'error', message: e.message });
      }
    }, DEBOUNCE_MS);
    return () => { alive = false; clearTimeout(t); };
  }, [stop, region, routeCount]);

  if (!stop) return <aside className="panel" />;
  const wrap = children => <aside className="panel" aria-live="polite">{children}</aside>;
  const heading = kind => <Header kind={kind} label={placeName(stop, region.id)} />;

  if (stop.type === 'travel') {
    return wrap(<>{heading('Travesía')}<div className="panel-empty"><div className="town-icons"><span>⛴️</span></div>
      <p>Camino de enlace entre zonas.</p><p className="muted">Sigue avanzando para llegar a la siguiente parada.</p></div></>);
  }
  if (stop.type === 'town') {
    return wrap(<>{heading('Ciudad / Pueblo')}<div className="panel-empty">
      <div className="town-icons"><span>🏥</span><span>🏪</span><span>🏠</span></div>
      <p>Zona urbana: aquí no aparecen Pokémon salvajes.</p>
      <p className="muted">Recupera fuerzas y sigue hacia la hierba alta de la siguiente ruta.</p></div></>);
  }
  if (state.status === 'loading' || state.status === 'idle') {
    return wrap(<>{heading('Ruta')}<div className="panel-empty"><span className="spinner" /><p className="muted">Consultando la Pokédex…</p></div></>);
  }
  if (state.status === 'error') {
    return wrap(<>{heading('Ruta')}<div className="panel-empty"><p>No se pudieron cargar los datos.</p><p className="muted">{state.message}</p></div></>);
  }
  if (state.fallback) {
    return wrap(<>{heading('Zona')}
      <p className="notice">PokeAPI no tiene registros de encuentros para esta zona. Se muestra un tramo de la Pokédex regional.</p>
      <div className="mon-list">{state.fallback.map(p => <MonRow key={p.id} p={p} period={period} simple onClick={() => onPokemon(p.id)} />)}</div></>);
  }

  const current = state.data.find(v => v.version === version) || state.data[0];
  if (!current) return wrap(<>{heading('Ruta')}<div className="panel-empty"><p>No hay Pokémon registrados aquí.</p></div></>);

  const total = current.methods.reduce((n, m) => n + m.pokemon.length, 0);
  const [pIcon, pName] = PERIODS[period];
  const open = (p, method) => onPokemon(p.id, { ...p, method }, current.version);

  return wrap(
    <>
      {heading('Ruta')}
      <nav className="versions" aria-label="Juego">
        {state.data.map(x => {
          const [vName, color] = lookup(VERSIONS, x.version);
          return (
            <button key={x.version} className={`version${x === current ? ' is-on' : ''}`}
              style={{ '--c': color, '--t': textOn(color) }} onClick={() => setVersion(x.version)}>{vName}</button>
          );
        })}
      </nav>
      <div className="tabs" role="tablist">
        <button role="tab" className={tab === 'pokemon' ? 'is-on' : ''} onClick={() => setTab('pokemon')}>Pokémon <b>{total}</b></button>
        <button role="tab" className={tab === 'items' ? 'is-on' : ''} onClick={() => setTab('items')}>Objetos <b>{current.items.length}</b></button>
      </div>

      {tab === 'pokemon' ? (
        <>
          <p className="period-note">{pIcon} Ahora es <b>{pName.toLowerCase()}</b> en el juego: los Pokémon de otra franja horaria aparecen atenuados.</p>
          {current.methods.map(m => {
            const [mIcon, mName] = lookup(METHODS, m.method, cap(m.method));
            return (
              <section className="method" key={m.method}>
                <h4><span>{mIcon}</span>{mName}</h4>
                <div className="mon-list">
                  {m.pokemon.map(p => <MonRow key={p.id} p={p} period={period} onClick={() => open(p, m.method)} />)}
                </div>
              </section>
            );
          })}
        </>
      ) : current.items.length ? (
        <>
          <p className="period-note">Objetos que pueden llevar equipados los Pokémon salvajes de esta ruta (se obtienen con Ladrón o al capturarlos).</p>
          <div className="item-list">
            {current.items.map(it => (
              <div className="item" key={it.name}>
                <img src={itemSprite(it.name)} alt="" width="40" height="40" loading="lazy" />
                <div>
                  <b>{it.nameEs || cap(it.name)}</b>
                  <span className="muted">{it.holders.map(h => `${h.name} (${h.rarity}%)`).join(' · ')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="panel-empty"><p>🎒</p><p className="muted">Ningún Pokémon salvaje de esta ruta lleva objetos en {lookup(VERSIONS, current.version)[0]}.</p></div>
      )}
    </>,
  );
}
