// Portadas de los juegos (archivos en public/assets/covers/<región>.jpg|png|webp).
// Si no existe la portada, se usa la escena animada de data/scenes.js.

const EXTENSIONS = ['jpg', 'png', 'webp'];
const found = new Map();

const tryLoad = src => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve(src);
  img.onerror = () => resolve(null);
  img.src = src;
});

export function findCover(id) {
  if (!found.has(id)) {
    found.set(id, (async () => {
      for (const ext of EXTENSIONS) {
        const src = await tryLoad(`${import.meta.env.BASE_URL}assets/covers/${id}.${ext}`);
        if (src) return src;
      }
      return null;
    })());
  }
  return found.get(id);
}
