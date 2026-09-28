// Raíz de la app: rutas, fondo, ficha de Pokédex y teclas globales (Esc / Start).

import { useCallback, useEffect, useState } from 'react';
import { REGIONS } from './data/regions.js';
import { COVER_GAMES } from './data/scenes.js';
import { useHashRoute, useGameClock, go } from './lib/hooks.js';
import { applyPalette } from './lib/theme.js';
import { findCover } from './lib/covers.js';
import { showHomeBackdrop, showRegionBackdrop } from './lib/backdrop.js';
import Backdrop from './components/Backdrop.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import RegionSelect from './components/RegionSelect.jsx';
import RegionView from './components/RegionView.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import CoverIntro from './components/CoverIntro.jsx';

export default function App() {
  const { page, id } = useHashRoute();
  const { now, period } = useGameClock();
  const [card, setCard] = useState(null);        // { id, enc, version }
  const [dexOpen, setDexOpen] = useState(false);
  const [intro, setIntro] = useState(null);      // { src, title }

  const region = page === 'region' ? REGIONS.find(r => r.id === id) : null;
  const screen = region ? 'region' : page === 'regiones' ? 'select' : 'title';
  const openCard = useCallback((pokemonId, enc = null, version = null) => setCard({ id: pokemonId, enc, version }), []);
  const endIntro = useCallback(() => setIntro(null), []);

  // Al cambiar de pantalla: título de la pestaña, scroll arriba, fondo y portada
  useEffect(() => {
    document.title = region ? `${region.name} · PokeMove` : screen === 'select' ? 'Elige tu región · PokeMove' : 'PokeMove';
    scrollTo(0, 0);
    setDexOpen(false);
    setIntro(null);

    let alive = true;
    if (region) {
      applyPalette(region);
      showRegionBackdrop(region);                     // escena animada mientras se busca la portada
      findCover(region.id).then(cover => {
        if (!alive || !cover) return;
        showRegionBackdrop(region, cover);
        setIntro({ src: cover, title: COVER_GAMES[region.id] });
      });
    } else {
      findCover('home').then(cover => alive && showHomeBackdrop(cover, screen === 'select' ? .5 : 0));
    }
    return () => { alive = false; };
  }, [screen, region]);

  // Esc retrocede un nivel; Enter/Espacio en la portada = "pulsa START"
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (card) return setCard(null);
        if (dexOpen) return setDexOpen(false);
        if (screen === 'region') return go('#/regiones');
        if (screen === 'select') return go('#/');
      }
      if (screen === 'title' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go('#/regiones'); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [card, dexOpen, screen]);

  return (
    <>
      <Backdrop />
      {screen === 'title' && <TitleScreen />}
      {screen === 'select' && <RegionSelect onPokemon={openCard} paused={!!card} />}
      {region && (
        <RegionView
          key={region.id}
          region={region}
          now={now}
          period={period}
          dexOpen={dexOpen}
          setDexOpen={setDexOpen}
          paused={!!card || dexOpen || !!intro}
          onPokemon={openCard}
        />
      )}
      {card && <PokemonCard {...card} onOpen={openCard} onClose={() => setCard(null)} />}
      {intro && <CoverIntro {...intro} onDone={endIntro} />}
    </>
  );
}
