// Ruta #/ : portada con el logo y "PULSA START".

export default function TitleScreen() {
  return (
    <main id="title" className="screen">
      <header className="hero">
        <h1>Poke<b>Move</b></h1>
        <p>
          Elige a un profesor, viaja a su región y recorre sus rutas con Red.<br />
          Cada paso por la hierba alta abre los registros oficiales de los juegos.
        </p>
        <a className="start" href="#/regiones">▶ PULSA START</a>
      </header>
    </main>
  );
}
