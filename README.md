# Juan Diego Vargas León

### 🌐 App en línea: **https://juanvrgsleo.github.io/base-pokedex-20262-JuanVargas/**

---

# PokeMove

Pokédex interactiva hecha con **React + Vite** que usa **[PokeAPI](https://pokeapi.co/)** como fuente de datos.
Elige una región por su profesor, entra a su mapa 2D (trazado según los juegos) y recorre sus rutas con Red:
cada ruta muestra sus Pokémon salvajes por juego, método de encuentro, niveles, probabilidad, horario y
objetos equipados, y cada Pokémon abre su ficha completa de Pokédex.

## Funcionalidades
- **3 pantallas con rutas por hash:** `#/` portada · `#/regiones` selección · `#/region/<id>` mapa.
- **10 regiones** (Kanto → Paldea) con mapas 2D, biomas (nieve, desierto, bosque, volcán…) y etiquetas de rutas y ciudades.
- **Datos canónicos de cada ruta** (PokeAPI GraphQL, con respaldo REST): juego, método, niveles, % y hora del día.
- **Pokédex regional** con búsqueda por nombre, número o tipo, y **formas regionales** (Alola, Galar, Hisui, Paldea).
- **Ficha de Pokémon:** tipos, descripción en español, estadísticas, habilidades, objetos, cadena evolutiva, grito y variocolor.
- Paleta de colores y portada animada por región; controles con teclado (flechas/WASD, Esc para volver) y D-pad.

## Cómo ejecutar
```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # compila a dist/
npm run deploy   # compila y publica dist/ en la rama gh-pages (GitHub Pages)
```

## Estructura
```
src/
  App.jsx               rutas, fondo, ficha y teclas globales
  components/           TitleScreen, RegionSelect, RegionView, RoutePanel, RegionDex, PokemonCard…
  services/             PokeAPI: api (fetch + caché), routes (GraphQL/REST), pokemon (ficha)
  world/                motor del mapa 2D: layout, world (canvas + Red), tiles, minimap, stops
  data/                 regiones, mapas, escenas y traducciones
  lib/                  hooks, paleta, portadas y fondo animado
public/assets/covers/   portadas de fondo de cada región
```

Datos: [PokeAPI](https://pokeapi.co/). Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company.
