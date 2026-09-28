// Traducciones y colores oficiales usados en toda la app.

export const TYPES = {
  normal: ['Normal', '#A8A77A'], fire: ['Fuego', '#EE8130'], water: ['Agua', '#6390F0'], electric: ['Eléctrico', '#F7D02C'],
  grass: ['Planta', '#7AC74C'], ice: ['Hielo', '#96D9D6'], fighting: ['Lucha', '#C22E28'], poison: ['Veneno', '#A33EA1'],
  ground: ['Tierra', '#E2BF65'], flying: ['Volador', '#A98FF3'], psychic: ['Psíquico', '#F95587'], bug: ['Bicho', '#A6B91A'],
  rock: ['Roca', '#B6A136'], ghost: ['Fantasma', '#735797'], dragon: ['Dragón', '#6F35FC'], dark: ['Siniestro', '#705746'],
  steel: ['Acero', '#B7B7CE'], fairy: ['Hada', '#D685AD'], stellar: ['Astral', '#40B5A5'],
};

// [nombre en español, color de la portada] — el orden define el orden cronológico.
export const VERSIONS = {
  'red-japan': ['Rojo (Japón)', '#E3350D'], 'green-japan': ['Verde (Japón)', '#3DB54A'], 'blue-japan': ['Azul (Japón)', '#3B6FD8'],
  red: ['Rojo', '#E3350D'], blue: ['Azul', '#3B6FD8'], yellow: ['Amarillo', '#F5C518'],
  gold: ['Oro', '#C9A227'], silver: ['Plata', '#A8A8B8'], crystal: ['Cristal', '#4FC3D9'],
  ruby: ['Rubí', '#B3202A'], sapphire: ['Zafiro', '#1F4FA8'], emerald: ['Esmeralda', '#1E9E5A'],
  firered: ['Rojo Fuego', '#F2622E'], leafgreen: ['Verde Hoja', '#3DB54A'],
  diamond: ['Diamante', '#7FA7E0'], pearl: ['Perla', '#E7A3C0'], platinum: ['Platino', '#8C8C9C'],
  heartgold: ['Oro HeartGold', '#D4AF37'], soulsilver: ['Plata SoulSilver', '#B8C4D6'],
  black: ['Negro', '#3A3A3A'], white: ['Blanco', '#E6E6E6'], 'black-2': ['Negro 2', '#2A3647'], 'white-2': ['Blanco 2', '#E6D8CF'],
  x: ['X', '#1E5AA8'], y: ['Y', '#D32F4A'], 'omega-ruby': ['Rubí Omega', '#C62828'], 'alpha-sapphire': ['Zafiro Alfa', '#1565C0'],
  sun: ['Sol', '#F59E0B'], moon: ['Luna', '#6D5BD0'], 'ultra-sun': ['Ultrasol', '#F97316'], 'ultra-moon': ['Ultraluna', '#7C3AED'],
  'lets-go-pikachu': ["Let's Go, Pikachu!", '#F5C518'], 'lets-go-eevee': ["Let's Go, Eevee!", '#B7793F'],
  sword: ['Espada', '#2E8BD8'], shield: ['Escudo', '#D6336C'],
  'brilliant-diamond': ['Diamante Brillante', '#5B8DEF'], 'shining-pearl': ['Perla Reluciente', '#E68AB0'],
  'legends-arceus': ['Leyendas: Arceus', '#8C6D3F'], scarlet: ['Escarlata', '#E4572E'], violet: ['Púrpura', '#7B4FC9'],
};
export const VERSION_ORDER = Object.keys(VERSIONS);

// [icono, nombre] de cada método de encuentro.
export const METHODS = {
  walk: ['🌿', 'Hierba alta'], 'dark-grass': ['🌾', 'Hierba oscura'], 'grass-spots': ['✨', 'Hierba agitada'],
  surf: ['🌊', 'Surf'], 'surf-spots': ['💧', 'Burbujas (Surf)'], 'bubbling-spots': ['💧', 'Burbujas'],
  'old-rod': ['🎣', 'Caña Vieja'], 'good-rod': ['🎣', 'Caña Buena'], 'super-rod': ['🎣', 'Supercaña'], 'super-rod-spots': ['🎣', 'Burbujas (Supercaña)'],
  'rock-smash': ['🪨', 'Golpe Roca'], headbutt: ['🌳', 'Cabezazo'], 'cave-spots': ['💨', 'Polvo en cueva'], 'bridge-spots': ['🌉', 'Sombra en puente'],
  'yellow-flowers': ['🌼', 'Flores amarillas'], 'purple-flowers': ['🪻', 'Flores moradas'], 'red-flowers': ['🌺', 'Flores rojas'],
  'rough-terrain': ['🏜️', 'Terreno arenoso'], seaweed: ['🌿', 'Algas'], 'berry-piles': ['🍓', 'Montón de bayas'],
  gift: ['🎁', 'Regalo'], 'gift-egg': ['🥚', 'Huevo de regalo'], 'only-one': ['⭐', 'Encuentro único'], 'npc-trade': ['🔁', 'Intercambio'],
  pokeflute: ['🎶', 'Poké Flauta'], 'squirt-bottle': ['💦', 'Regadera'], 'wailmer-pail': ['💦', 'Regadera Wailmer'],
  'devon-scope': ['🔭', 'Detector Devon'], 'sos-encounter': ['📣', 'Llamada SOS'], 'island-scan': ['🛰️', 'Escáner Isla'],
};

// Condiciones de aparición (hora, estación, enjambre…). Las "por defecto" se ocultan.
export const CONDITIONS = {
  'time-morning': ['🌅', 'Mañana'], 'time-day': ['☀️', 'Día'], 'time-night': ['🌙', 'Noche'],
  'swarm-yes': ['🐝', 'Enjambre'], 'radar-on': ['📡', 'Pokéradar'],
  'season-spring': ['🌸', 'Primavera'], 'season-summer': ['🌞', 'Verano'], 'season-autumn': ['🍂', 'Otoño'], 'season-winter': ['❄️', 'Invierno'],
  'radio-hoenn': ['📻', 'Radio: Sonido Hoenn'], 'radio-sinnoh': ['📻', 'Radio: Sonido Sinnoh'],
  'headbutt-tree-common': ['🌳', 'Árbol común'], 'headbutt-tree-rare': ['🌲', 'Árbol raro'],
  'story-progress-beat-red': ['🏆', 'Tras vencer a Red'],
};
export const isDefaultCondition = c => /-(no|off|none)$/.test(c) || c === 'radio-off';

export const PERIODS = {
  morning: ['🌅', 'Mañana'], day: ['☀️', 'Día'], night: ['🌙', 'Noche'],
};

export const STATS = { hp: 'PS', attack: 'Ataque', defense: 'Defensa', 'special-attack': 'At. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidad' };

export const GROWTH = { slow: 'Lento', medium: 'Medio', fast: 'Rápido', 'medium-slow': 'Parabólico', 'slow-then-very-fast': 'Errático', 'fast-then-very-slow': 'Fluctuante' };

export const EGG_GROUPS = {
  monster: 'Monstruo', water1: 'Agua 1', water2: 'Agua 2', water3: 'Agua 3', bug: 'Bicho', flying: 'Volador', ground: 'Campo',
  fairy: 'Hada', plant: 'Planta', humanshape: 'Humanoide', mineral: 'Mineral', indeterminate: 'Amorfo', ditto: 'Ditto',
  dragon: 'Dragón', 'no-eggs': 'Desconocido',
};
