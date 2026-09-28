// Retrato circular del profesor (cabeza recortada del sprite de entrenador de Pokémon Showdown).

const TRAINER_SPRITES = 'https://play.pokemonshowdown.com/sprites/trainers/';

export default function ProfessorPortrait({ region, size = 'lg' }) {
  return (
    <span className={`prof prof-${size}`} title={region.professor.name}>
      {region.professor.sprites.map(s => (
        <span className="prof-face" key={s}>
          <img
            src={`${TRAINER_SPRITES}${s}.png`}
            alt=""
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </span>
      ))}
    </span>
  );
}
