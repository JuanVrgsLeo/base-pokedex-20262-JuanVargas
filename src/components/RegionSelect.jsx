// Ruta #/regiones : vitrina de la región elegida + tarjetas de profesores (inclinación 3D y teclado).

import { useEffect, useRef, useState } from 'react';
import { REGIONS } from '../data/regions.js';
import { MAPS } from '../data/maps.js';
import { VERSIONS } from '../data/dictionaries.js';
import { sprite } from '../services/api.js';
import { drawMinimap } from '../world/minimap.js';
import { applyPalette } from '../lib/theme.js';
import { go } from '../lib/hooks.js';
import { textOn } from '../utils.js';
import ProfessorPortrait from './ProfessorPortrait.jsx';

const TILT = 10; // grados máximos de inclinación

function tilt(e) {
  const card = e.currentTarget, b = card.getBoundingClientRect();
  card.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * TILT * 2 + 'deg');
  card.style.setProperty('--rx', -((e.clientY - b.top) / b.height - .5) * TILT * 2 + 'deg');
}
function untilt(e) {
  e.currentTarget.style.removeProperty('--rx');
  e.currentTarget.style.removeProperty('--ry');
}

function Spotlight({ region: r, onPokemon }) {
  const mapRef = useRef(null);
  useEffect(() => drawMinimap(mapRef.current, r), [r]);
  const map = MAPS[r.id];

  return (
    <article className="spotlight is-in" aria-live="polite">
      <div className="spot-top">
        <ProfessorPortrait region={r} size="xl" />
        <div>
          <span className="region-gen">Generación {r.gen}</span>
          <h2>{r.name}</h2>
          <p className="spot-prof">{r.professor.name}</p>
          <p className="spot-stats">
            <b>{Object.keys(map.towns).length}</b> ciudades · <b>{Object.keys(map.routes).length}</b> rutas y zonas
          </p>
        </div>
      </div>
      <div className="spot-body">
        <figure className="spot-map">
          <canvas ref={mapRef} aria-label={`Minimapa de ${r.name}`} />
          <figcaption>Mapa de la región</figcaption>
        </figure>
        <div className="spot-side">
          <h3>Iniciales</h3>
          <div className="spot-starters">
            {r.starters.map(id => (
              <button key={id} onClick={() => onPokemon(id)} aria-label="Ver ficha">
                <img src={sprite(id)} alt="" width="80" height="80" />
              </button>
            ))}
          </div>
          <h3>Juegos</h3>
          <div className="spot-games">
            {r.games.map(g => {
              const [name, color] = VERSIONS[g];
              return <span key={g} style={{ '--c': color, '--t': textOn(color) }}>{name}</span>;
            })}
          </div>
        </div>
      </div>
      <button className="spot-go" onClick={() => go(`#/region/${r.id}`)}>Explorar {r.name} →</button>
    </article>
  );
}

export default function RegionSelect({ onPokemon, paused }) {
  const [selected, setSelected] = useState(0);
  const cards = useRef([]);
  const region = REGIONS[selected];

  useEffect(() => applyPalette(region), [region]);

  // ← → cambian de región (Enter sobre la tarjeta enfocada explora)
  useEffect(() => {
    const onKey = e => {
      if (paused || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const next = (selected + (e.key === 'ArrowRight' ? 1 : -1) + REGIONS.length) % REGIONS.length;
      cards.current[next]?.focus();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [selected, paused]);

  return (
    <main id="select" className="screen">
      <header className="topbar select-bar">
        <a className="icon-btn" href="#/" aria-label="Volver a la portada">←</a>
        <h2 className="select-title">Elige tu región</h2>
      </header>

      <section className="home-grid">
        <Spotlight key={region.id} region={region} onPokemon={onPokemon} />

        <section className="case" aria-label="Profesores regionales">
          <div className="case-label">Profesores regionales · usa ← → y Enter</div>
          <div className="regions">
            {REGIONS.map((r, i) => (
              <button
                key={r.id}
                ref={el => { cards.current[i] = el; }}
                className={`region-card${i === selected ? ' is-on' : ''}`}
                style={{ '--accent': r.colors[0], '--delay': `${i * 50}ms` }}
                onPointerEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onPointerMove={tilt}
                onPointerLeave={untilt}
                onClick={() => go(`#/region/${r.id}`)}
              >
                <ProfessorPortrait region={r} />
                <span className="region-gen">Generación {r.gen}</span>
                <span className="region-name">{r.name}</span>
                <span className="region-prof">{r.professor.name}</span>
                <span className="region-games">
                  {r.games.map(g => <i key={g} style={{ '--c': VERSIONS[g][1] }} title={VERSIONS[g][0]} />)}
                </span>
                <span className="region-go">Explorar →</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <footer className="foot">Datos: PokeAPI · Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company.</footer>
    </main>
  );
}
