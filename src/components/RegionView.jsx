// Ruta #/region/<id> : mapa 2D con Red, panel de la ruta y Pokédex regional.

import { useEffect, useMemo, useRef, useState } from 'react';
import { MAPS } from '../data/maps.js';
import { PERIODS } from '../data/dictionaries.js';
import { loadRegion } from '../services/routes.js';
import { buildLayout } from '../world/layout.js';
import { createWorld } from '../world/world.js';
import { resolveStopNames, placeName, mapBadge } from '../world/stops.js';
import { go } from '../lib/hooks.js';
import ProfessorPortrait from './ProfessorPortrait.jsx';
import RoutePanel from './RoutePanel.jsx';
import RegionDex from './RegionDex.jsx';

const KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
const DPAD = [['up', '▲', 'Arriba'], ['left', '◀', 'Izquierda'], ['right', '▶', 'Derecha'], ['down', '▼', 'Abajo']];

// Nombres de ciudades, números de ruta y zonas encima del mapa (HTML, para que el texto sea nítido)
function MapLabels({ layout, regionId }) {
  const { W, H, stops, zones } = layout;
  const at = ([x, y]) => ({ left: `${(x + .5) / W * 100}%`, top: `${(y + .5) / H * 100}%` });
  return (
    <div className="labels" aria-hidden="true">
      {zones.map(([x, y, w, , , name]) => <span key={name} className="lbl lbl-zone" style={at([x + w / 2, y + .4])}>{name}</span>)}
      {stops.map((s, i) => {
        if (s.type === 'town') {
          return <span key={i} className="lbl lbl-town" style={at([s.center[0], s.center[1] + 1.6])}>{placeName(s, regionId)}</span>;
        }
        const num = mapBadge(s);
        return num && <span key={i} className="lbl lbl-route" style={at(s.cells[Math.floor(s.cells.length / 2)])}>{num}</span>;
      })}
    </div>
  );
}

export default function RegionView({ region, now, period, dexOpen, setDexOpen, paused, onPokemon }) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const [data, setData] = useState(null);          // { layout, routeCount, dexUrl }
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [stop, setStop] = useState(null);
  const [hover, setHover] = useState(null);
  const [banner, setBanner] = useState(false);

  // Carga la región y arma el plano
  useEffect(() => {
    let alive = true;
    setError(null);
    loadRegion(region.id)
      .then(d => {
        if (!alive) return;
        region.dexUrl = d.dex;
        const layout = buildLayout(MAPS[region.id], region.id);
        resolveStopNames(layout.stops, region.id, d.locations);
        setData({ layout, routeCount: layout.stops.filter(s => s.type === 'route').length, dexUrl: d.dex });
      })
      .catch(e => alive && setError(e.message));
    return () => { alive = false; };
  }, [region, attempt]);

  // Crea el mundo en el canvas (se rehace si cambia la franja horaria)
  useEffect(() => {
    if (!data) return;
    const world = createWorld(canvasRef.current, {
      layout: data.layout,
      region,
      period,
      onEnter: setStop,
      onHover: (s, e) => {
        if (!s) return setHover(null);
        const box = canvasRef.current.parentElement.getBoundingClientRect();
        setHover({ text: placeName(s, region.id), x: e.clientX - box.left, y: e.clientY - box.top });
      },
    });
    worldRef.current = world;
    return () => { world.destroy(); worldRef.current = null; };
  }, [data, period, region]);

  // Teclado: caminar manteniendo la tecla
  useEffect(() => {
    let held = null;
    const release = () => { held = null; worldRef.current?.hold(null); };
    const down = e => {
      const dir = KEYS[e.key.toLowerCase()];
      if (!dir || paused || !worldRef.current) return;
      e.preventDefault();
      if (held !== dir) { held = dir; worldRef.current.hold(dir); }
    };
    const up = e => { if (KEYS[e.key.toLowerCase()] === held) release(); };
    addEventListener('keydown', down);
    addEventListener('keyup', up);
    addEventListener('blur', release);
    if (paused) release();
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', release); };
  }, [paused]);

  // Cartel de ubicación al entrar en una zona
  useEffect(() => {
    if (!stop) return;
    setBanner(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setBanner(true)));
    const t = setTimeout(() => setBanner(false), 1900);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [stop]);

  const labels = useMemo(() => data && <MapLabels layout={data.layout} regionId={region.id} />, [data, region.id]);
  const place = stop ? placeName(stop, region.id) : '—';
  const [periodIcon, periodName] = PERIODS[period];
  const hold = dir => worldRef.current?.hold(dir);

  return (
    <main id="world" className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go('#/regiones')} aria-label="Volver a las regiones">←</button>
        <h2 className="region-title">
          <ProfessorPortrait region={region} size="sm" />
          <span><small>Generación {region.gen} · {region.professor.name}</small>{region.name}</span>
        </h2>
        <div className="topbar-chips">
          <button className="chip chip-dex" onClick={() => setDexOpen(!dexOpen)}>
            {dexOpen ? '🗺️ Volver al mapa' : `📕 Pokédex de ${region.name}`}
          </button>
          <span className="chip">{periodIcon} {periodName} · {now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="chip chip-place">📍 {place}</span>
        </div>
      </header>

      {dexOpen && <RegionDex region={region} dexUrl={data?.dexUrl} onPokemon={onPokemon} />}

      <div className="layout" hidden={dexOpen}>
        <section className="map-card">
          <div className="map-frame">
            <canvas id="map" ref={canvasRef} aria-label="Mapa de la región" />
            {labels}
            <div className={`banner${banner ? ' is-in' : ''}`} data-type={stop?.type}>{place}</div>
            {hover && <div className="tooltip" style={{ left: hover.x, top: hover.y }}>{hover.text}</div>}
            {!data && (
              <div className="map-loading">
                {error ? (
                  <>
                    <p>No se pudo cargar {region.name}.<br /><small>{error}</small></p>
                    <button className="chip" onClick={() => setAttempt(n => n + 1)}>Reintentar</button>
                  </>
                ) : (
                  <><span className="spinner" /><p>Viajando a {region.name}…</p></>
                )}
              </div>
            )}
          </div>

          <div className="controls">
            <div className="dpad" aria-label="Controles">
              {DPAD.map(([dir, icon, label]) => (
                <button
                  key={dir}
                  data-d={dir}
                  aria-label={label}
                  onPointerDown={e => { e.preventDefault(); hold(dir); }}
                  onPointerUp={() => hold(null)}
                  onPointerLeave={() => hold(null)}
                  onPointerCancel={() => hold(null)}
                >{icon}</button>
              ))}
            </div>
            <ul className="legend">
              <li><kbd>←↑→↓</kbd> / <kbd>WASD</kbd> caminar (mantén presionado)</li>
              <li><b>Clic</b> en el camino para ir hasta allí</li>
              <li><i className="sw route" /> Ruta · <i className="sw cave" /> Cueva/monte · <i className="sw sea" /> Ruta marina · <i className="sw town" /> Ciudad</li>
            </ul>
          </div>
        </section>

        <RoutePanel stop={stop} region={region} routeCount={data?.routeCount} period={period} onPokemon={onPokemon} />
      </div>
    </main>
  );
}
