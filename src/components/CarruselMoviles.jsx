import { Link } from 'react-router-dom'

/* Fila de móviles que se desliza de lado, como el carrusel de Ejemplos de la landing, pero con cada móvil casi del alto de la pantalla.
   Cada uno enseña su captura (src/assets/capturas) o, si aún no la tiene, el móvil negro con su nombre; al tocarlo abre la demo (/demo/nombre).
   lista: [{ clave, nombre, sector, ruta, foto }]. Lo usan /miniweb, /catalogo y las páginas por temática.
   El marco toma la forma de su captura (sin recortarla); sin captura, el móvil negro con la misma proporción.
   --ancho: el ancho de cada móvil, para que su alto (la de una captura, 9/16, más el marco) sea el de la pantalla menos la cabecera; como mucho el 80 % del ancho
   (en el móvil, uno a la vista con el siguiente asomando). Desde 1024 px de ancho deja de ser un carrusel y pasa a una rejilla de 3 columnas (4 desde 1280 px), como los ejemplos de la landing. */
export default function CarruselMoviles({ lista }) {
  return (
    <ul
      className="-mx-4 mt-[2rem] flex snap-x snap-mandatory gap-[1.25rem] overflow-x-auto px-[max(1rem,calc(50%-var(--ancho)/2))] pb-[1.5rem] sm:-mx-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-[2rem] lg:overflow-visible lg:px-0 xl:grid-cols-4 [scrollbar-width:none]"
      style={{ '--ancho': 'min(80vw, calc((100svh - 12rem) * 0.54))' }}
    >
      {lista.map(d => (
        <li key={d.clave ?? d.slug} className="w-[var(--ancho)] shrink-0 snap-center lg:w-auto">
          <Link
            to={d.ruta}
            aria-label={`Abrir ${d.nombre}`}
            className="block rounded-[2.4rem] border border-white/15 bg-[#1d1d1b] p-[0.45rem] shadow-[0_1.5rem_3rem_-1rem_rgb(0_0_0/0.6)]"
          >
            {d.foto ? (
              <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} loading="lazy" className="block h-auto w-full rounded-[2rem]" />
            ) : (
              <span className="flex aspect-[9/16] w-full flex-col items-center justify-center rounded-[2rem] bg-papel px-[1rem] text-center">
                <span className="font-titulo text-[1.4rem] font-black leading-[1.1]">{d.nombre}</span>
              </span>
            )}
          </Link>
          <div className="mt-[1rem] flex items-baseline justify-between gap-[1rem] px-[0.5rem]">
            <div>
              <p className="font-semibold">{d.nombre}</p>
              {d.sector && <p className="text-[0.92rem] text-suave">{d.sector}</p>}
            </div>
            <Link to={d.ruta} className="shrink-0 text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
              Abrir
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
