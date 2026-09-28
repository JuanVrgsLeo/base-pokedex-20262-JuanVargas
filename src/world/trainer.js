// Sprite de Red en pixel art 16x16: 4 direcciones × 3 cuadros (quieto, paso A, paso B).
// Cada cuadro se dibuja una sola vez en un canvas pequeño y luego se reutiliza.

const COLORS = { R: '#e3350d', W: '#ffffff', K: '#1c1c28', S: '#f7c89b', B: '#2f55a4', Y: '#f2c230', D: '#a3240a' };

const HEAD = {
  down: [
    '.....RRRRRR.....', '....RRRRRRRR....', '...RRRWWWRRRR...', '...RRRRRRRRRR...',
    '..DDDDDDDDDDDD..', '...KSSSSSSSSK...', '...SSKSSSSKSS...', '...SSSSSSSSSS...', '....SSSSSSSS....',
  ],
  up: [
    '.....RRRRRR.....', '....RRRRRRRR....', '...RRRRRRRRRR...', '...RRRRRRRRRR...',
    '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...SKKKKKKKKS...', '....SSSSSSSS....',
  ],
  side: [
    '.....RRRRRR.....', '....RRRRRRRR....', '....RRRRRWWRR...', '....RRRRRRRDDDD.',
    '....KKKKKKKK....', '....KKSSSSSS....', '....KSSSSKSS....', '....KSSSSSSS....', '.....SSSSSS.....',
  ],
};

const BODY = {
  down: ['...RRRRWWRRRR...', '..SRRRRWWRRRRS..', '..SRRRRRRRRRRS..', '....BBBBBBBB....'],
  up:   ['...RRYYYYYYRR...', '..SRYYYYYYYYRS..', '..SRRYYYYYYRRS..', '....BBBBBBBB....'],
  side: ['.....RRRRRR.....', '....YRRRRRRS....', '....YRRRRRRS....', '.....BBBBBB.....'],
};

const LEGS = {
  front: {
    stand: ['....BBB..BBB....', '....BBB..BBB....', '...KKK....KKK...'],
    a:     ['....BBB..BBB....', '....KKK..BBB....', '..........KKK...'],
    b:     ['....BBB..BBB....', '....BBB..KKK....', '...KKK..........'],
  },
  side: {
    stand: ['.....BBBBBB.....', '.....BB..BB.....', '.....KK..KKK....'],
    a:     ['.....BBBBBB.....', '....BB....BB....', '...KK.....KKK...'],
    b:     ['.....BBBBBB.....', '......BBBB......', '......KKKK......'],
  },
};

const cache = new Map();

function build(dir, frame) {
  const kind = dir === 'left' || dir === 'right' ? 'side' : dir;
  const legs = LEGS[kind === 'side' ? 'side' : 'front'][frame];
  const rows = [...HEAD[kind], ...BODY[kind], ...legs];

  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle = COLORS[ch];
    g.fillRect(dir === 'left' ? 15 - x : x, y, 1, 1);
  }));
  return c;
}

export function trainerFrame(dir, frame) {
  const key = dir + frame;
  if (!cache.has(key)) cache.set(key, build(dir, frame));
  return cache.get(key);
}
