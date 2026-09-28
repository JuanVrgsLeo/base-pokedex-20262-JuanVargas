// Juego cuya portada representa a cada región (archivo: assets/covers/<región>.jpg|png|webp).
export const COVER_GAMES = {
  kanto: 'Pokémon Rojo', johto: 'Pokémon Oro', hoenn: 'Pokémon Esmeralda', sinnoh: 'Pokémon Platino',
  unova: 'Pokémon Negro', kalos: 'Pokémon X', alola: 'Pokémon Sol', galar: 'Pokémon Espada',
  hisui: 'Leyendas Pokémon: Arceus', paldea: 'Pokémon Púrpura',
};

// Escenas de portada: cielo, efectos animados y legendarios (el primero es el protagonista).
// Inspiradas en las portadas / escenas icónicas de cada juego.
//
// fx disponibles: rays, clouds, lightning, embers, rain, stars, vortex, rocks, aurora,
//                 rainbow, lava, sunmoon, rift, shards, snow

export const SCENES = {
  // Arceus: el origen, entre nubes de tormenta, rayos divinos y relámpagos
  home: {
    sky: ['#05040f', '#1b1438', '#4a3418'], focus: [.5, .42],
    fx: ['rays', 'clouds', 'lightning', 'embers'],
    colors: { rays: '#ffd66b', cloud: '#2a2548', ember: '#ffcf6b', bolt: '#fff4c2', glow: '#ffd66b' },
    legends: [493],
  },
  // Mewtwo en la Cueva Celeste: energía psíquica y las aves legendarias
  kanto: {
    sky: ['#0a0414', '#2a0b45', '#0d0620'], focus: [.5, .45],
    fx: ['rays', 'stars', 'embers', 'lightning'],
    colors: { rays: '#b77bff', ember: '#d9a6ff', bolt: '#e8cfff', glow: '#b77bff' },
    legends: [150, 146, 145, 144],
  },
  // Ho-Oh sobre la Torre Campana al atardecer, con arcoíris; Lugia en el mar
  johto: {
    sky: ['#2a0c24', '#b8402c', '#f6b35e'], focus: [.5, .38],
    fx: ['rainbow', 'rays', 'clouds', 'embers'],
    colors: { rays: '#ffe29a', cloud: '#7a2f3a', ember: '#ffb347', glow: '#ff8a3d' },
    legends: [250, 249],
  },
  // Rayquaza calma la batalla de Groudon (lava) y Kyogre (lluvia torrencial)
  hoenn: {
    sky: ['#03101a', '#0b3444', '#2b140a'], focus: [.5, .35],
    fx: ['lava', 'rain', 'clouds', 'lightning'],
    colors: { cloud: '#123040', lava: '#ff5a1f', bolt: '#c8f7ff', glow: '#36e07a' },
    legends: [384, 383, 382],
  },
  // Giratina en el Mundo Distorsión (Platino): vórtice, rocas flotantes, Dialga y Palkia
  sinnoh: {
    sky: ['#040208', '#1c0a2e', '#3a0c26'], focus: [.5, .45],
    fx: ['vortex', 'stars', 'rocks', 'embers'],
    colors: { vortex: '#b0306a', ember: '#ff5a8a', rock: '#1a0f24', glow: '#d0306a' },
    legends: [487, 483, 484],
  },
  // Reshiram (llama blanca) y Zekrom (relámpago negro)
  unova: {
    sky: ['#040408', '#15182a', '#2a2018'], focus: [.5, .45],
    fx: ['clouds', 'lightning', 'embers'],
    colors: { cloud: '#1c2034', ember: '#fff1d6', bolt: '#7fd0ff', glow: '#9fd8ff' },
    legends: [643, 644],
  },
  // Xerneas (vida, aurora) e Yveltal (destrucción)
  kalos: {
    sky: ['#030816', '#0c2446', '#2a0a18'], focus: [.5, .45],
    fx: ['aurora', 'stars', 'embers'],
    colors: { aurora: ['#3de0ff', '#b46bff', '#ff4d6d'], ember: '#9ff0ff', glow: '#3de0ff' },
    legends: [716, 717],
  },
  // Solgaleo y Lunala: el sol y la luna en el cielo del Altar
  alola: {
    sky: ['#02030a', '#161040', '#3a1646'], focus: [.5, .45],
    fx: ['stars', 'sunmoon', 'rays'],
    colors: { rays: '#ffc857', glow: '#ffc857' },
    legends: [791, 792],
  },
  // Zacian y Zamazenta en la Noche Oscura (cielo Dinamax)
  galar: {
    sky: ['#140106', '#4d0816', '#b0281f'], focus: [.5, .3],
    fx: ['rays', 'clouds', 'embers'],
    colors: { rays: '#ff3a5c', cloud: '#3a0612', ember: '#ff6b8a', glow: '#ff3a5c' },
    legends: [888, 889],
  },
  // La grieta espaciotemporal sobre Hisui: Dialga y Palkia (forma origen)
  hisui: {
    sky: ['#07040f', '#231236', '#0c1624'], focus: [.5, .3],
    fx: ['rift', 'stars', 'snow'],
    colors: { rift: ['#ff4fd8', '#5ad7ff'], glow: '#b06bff' },
    legends: [10245, 10246],
  },
  // Koraidon y Miraidon en la Zona Cero: cristales teracristal
  paldea: {
    sky: ['#040410', '#0f1838', '#2a0e38'], focus: [.5, .5],
    fx: ['shards', 'stars', 'rays'],
    colors: { rays: '#7afcff', glow: '#ff7ad9' },
    legends: [1007, 1008],
  },
};
