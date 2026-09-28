// Ficha de Pokédex en ventana modal (datos de PokeAPI vía services/pokemon.js).

import { useEffect, useState } from 'react';
import { pokemonDetail } from '../services/pokemon.js';
import { artwork, sprite, itemSprite } from '../services/api.js';
import { TYPES, VERSIONS, METHODS, CONDITIONS, STATS, GROWTH, EGG_GROUPS } from '../data/dictionaries.js';
import { cap, dexNumber, lookup } from '../utils.js';
import { TypePill } from './Pokemon.jsx';

const MAX_STAT = 200;
const versionName = v => lookup(VERSIONS, v)[0];

// "5% en 10 juegos · 50% en Oro"
function heldRarity(versions) {
  const groups = new Map();
  versions.forEach(v => groups.set(v.rarity, [...(groups.get(v.rarity) || []), versionName(v.version)]));
  return [...groups].map(([rarity, games]) => (
    <span key={rarity} title={games.join(', ')}>{rarity}% en {games.length === 1 ? games[0] : `${games.length} juegos`} </span>
  ));
}

function Gender({ rate }) {
  if (rate < 0) return <span className="muted">Sin género</span>;
  const female = rate / 8 * 100;
  return (
    <>
      <span className="gender"><i style={{ width: `${100 - female}%` }} /></span>
      <small>♂ {100 - female}% · ♀ {female}%</small>
    </>
  );
}

function Encounter({ enc, version }) {
  if (!enc || !enc.method) return null;
  const [icon, method] = lookup(METHODS, enc.method, cap(enc.method));
  const conds = enc.conds.map(c => lookup(CONDITIONS, c, cap(c)).join(' ')).join(' · ');
  return (
    <section className="card-sec here">
      <h3>En esta ruta · {versionName(version)}</h3>
      <p>{icon} {method} · Nv. {enc.min}–{enc.max} · <b>{enc.rate}%</b>{conds && ` · ${conds}`}</p>
    </section>
  );
}

function EvoButton({ id, label, active, onOpen }) {
  return (
    <button className={`evo-item${active ? ' is-on' : ''}`} onClick={() => onOpen(id)}>
      <img src={sprite(id)} alt="" width="72" height="72" loading="lazy" />
      <span>{cap(label)}</span>
    </button>
  );
}

export default function PokemonCard({ id, enc, version, onOpen, onClose }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const [shiny, setShiny] = useState(false);

  useEffect(() => {
    let alive = true;
    setP(null); setError(null); setShiny(false);
    pokemonDetail(id).then(d => alive && setP(d)).catch(e => alive && setError(e.message));
    return () => { alive = false; };
  }, [id]);

  const close = <button className="close" aria-label="Cerrar" onClick={onClose}>✕</button>;
  let body;
  if (error) body = <>{close}<p className="card-loading">Error: {error}</p></>;
  else if (!p) body = <div className="card-loading"><span className="spinner" /></div>;
  else {
    const total = p.stats.reduce((n, s) => n + s.value, 0);
    const tag = p.legendary ? 'Legendario' : p.mythical ? 'Singular' : '';
    const encounter = enc && enc.id === id ? enc : null;
    body = (
      <>
        {close}
        <div className="card-hero">
          <div className="hero-text">
            <span className="card-num">{dexNumber(p.dex)}</span>
            <h2 id="cardTitle">{p.name}</h2>
            <p className="genus">{p.genus}{tag && <> · <b>{tag}</b></>}</p>
            <div className="types">{p.types.map(t => <TypePill key={t} type={t} large />)}</div>
            <div className="hero-actions">
              {p.cry && <button className="chip" onClick={() => { const a = new Audio(p.cry); a.volume = .4; a.play(); }}>🔊 Grito</button>}
              <button className={`chip${shiny ? ' is-on' : ''}`} onClick={() => setShiny(s => !s)}>✨ Variocolor</button>
            </div>
          </div>
          <img className="hero-art" src={artwork(p.id, shiny)} alt={p.name} />
        </div>

        <div className="card-grid">
          <div>
            {p.flavor && (
              <section className="card-sec">
                <h3>Entrada de la Pokédex · {versionName(p.flavor.version)}</h3>
                <p className="flavor">{p.flavor.text}</p>
              </section>
            )}
            <Encounter enc={encounter} version={version} />
            <section className="card-sec">
              <h3>Datos</h3>
              <dl className="facts">
                <div><dt>Altura</dt><dd>{p.height} m</dd></div>
                <div><dt>Peso</dt><dd>{p.weight} kg</dd></div>
                <div><dt>Ratio captura</dt><dd>{p.capture}</dd></div>
                <div><dt>Amistad base</dt><dd>{p.happiness ?? '—'}</dd></div>
                <div><dt>Exp. base</dt><dd>{p.baseExp ?? '—'}</dd></div>
                <div><dt>Crecimiento</dt><dd>{p.growth ? GROWTH[p.growth] || cap(p.growth) : '—'}</dd></div>
                <div className="wide"><dt>Grupos huevo</dt><dd>{p.eggGroups.map(g => EGG_GROUPS[g] || cap(g)).join(', ') || '—'}</dd></div>
                <div className="wide"><dt>Género</dt><dd><Gender rate={p.genderRate} /></dd></div>
              </dl>
            </section>
          </div>

          <div>
            <section className="card-sec">
              <h3>Habilidades</h3>
              <div className="abilities">
                {p.abilities.map(a => (
                  <span key={a.name} className={`ability${a.hidden ? ' hidden-ab' : ''}`}>{a.name}{a.hidden && <small> oculta</small>}</span>
                ))}
              </div>
            </section>
            <section className="card-sec">
              <h3>Características base</h3>
              <div className="stats">
                {p.stats.map(s => (
                  <div className="stat" key={s.name}>
                    <span>{STATS[s.name] || s.name}</span><b>{s.value}</b>
                    <i><em style={{ width: `${Math.min(s.value / MAX_STAT, 1) * 100}%` }} /></i>
                  </div>
                ))}
                <div className="stat total"><span>Total</span><b>{total}</b></div>
              </div>
            </section>
            {p.held.length > 0 && (
              <section className="card-sec">
                <h3>Objetos que puede llevar</h3>
                <div className="held">
                  {p.held.map(h => (
                    <div className="item" key={h.name}>
                      <img src={itemSprite(h.name)} alt="" width="32" height="32" loading="lazy" />
                      <div><b>{h.nameEs}</b><span className="muted">{heldRarity(h.versions)}</span></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {p.chain.length > 1 && (
          <section className="card-sec evo">
            <h3>Cadena evolutiva</h3>
            <div className="evo-row">
              {p.chain.map((e, i) => (
                <span key={e.id} style={{ display: 'contents' }}>
                  {i > 0 && <span className="evo-arrow">›<small>{cap(e.how)}</small></span>}
                  <EvoButton id={e.id} label={e.name} active={e.id === p.dex} onOpen={onOpen} />
                </span>
              ))}
            </div>
          </section>
        )}

        {p.forms.length > 0 && (
          <section className="card-sec evo">
            <h3>Otras formas</h3>
            <div className="evo-row">
              {p.forms.map(f => <EvoButton key={f.id} id={f.id} label={f.label} onOpen={onOpen} />)}
            </div>
          </section>
        )}
      </>
    );
  }

  const [main, second] = p ? [p.types[0], p.types[1] || p.types[0]] : ['normal', 'normal'];
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <article className="card" role="dialog" aria-modal="true" aria-labelledby="cardTitle"
        style={{ '--type': lookup(TYPES, main)[1], '--type2': lookup(TYPES, second)[1] }}>
        {body}
      </article>
    </div>
  );
}
