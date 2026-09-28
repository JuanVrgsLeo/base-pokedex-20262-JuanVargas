// Hooks compartidos: ruta por hash y hora del juego.

import { useEffect, useState } from 'react';
import { currentPeriod } from '../utils.js';

const parseHash = () => {
  const [, page = '', id = ''] = location.hash.split('/');
  return { page, id };
};

// Rutas: #/ portada · #/regiones selección · #/region/<id> mapa de la región
export function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const go = hash => { location.hash = hash; };

// Hora real → franja horaria del juego (se revisa cada 30 s).
export function useGameClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return { now, period: currentPeriod(now) };
}
