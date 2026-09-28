// Contenedor del fondo animado. El motor (lib/backdrop.js) dibuja por su cuenta en canvas.

import { useEffect, useRef } from 'react';
import { initBackdrop } from '../lib/backdrop.js';

export default function Backdrop() {
  const ref = useRef(null);
  useEffect(() => initBackdrop(ref.current), []);
  return <div ref={ref} id="backdrop" className="backdrop" aria-hidden="true" />;
}
