// "Abre" la portada del juego como una caja: aparece, se abre y hace zoom hasta ser el fondo.

import { useCallback, useEffect, useState } from 'react';

const AUTO_OPEN_MS = 2200, OPEN_MS = 900;

export default function CoverIntro({ src, title, onDone }) {
  const [opening, setOpening] = useState(false);
  const open = useCallback(() => setOpening(true), []);

  useEffect(() => {
    const t = setTimeout(open, AUTO_OPEN_MS);
    addEventListener('keydown', open);
    return () => { clearTimeout(t); removeEventListener('keydown', open); };
  }, [open]);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onDone, OPEN_MS);
    return () => clearTimeout(t);
  }, [opening, onDone]);

  return (
    <div className={`cover-intro${opening ? ' is-opening' : ''}`} onClick={open}>
      <div className="cover-case">
        <img src={src} alt={title} />
        <span className="cover-shine" />
      </div>
      <p className="cover-title">{title}</p>
      <p className="cover-hint">Clic para abrir</p>
    </div>
  );
}
