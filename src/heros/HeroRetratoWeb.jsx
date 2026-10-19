import { useContext } from 'react'
import Img from '../components/Img'
import BotonCompartir from '../components/BotonCompartir'
import { LogoNegocio } from '../components/NombreMarca'
import { fotosDe } from '../fichas/escenas'

/* Retrato para miniwebs (la portada de su página de Inicio). Aparte del Retrato de las fichas, que se queda como está.
   Un bloque oscuro sobre una foto con velo:
   - Arriba, el círculo y el nombre. El círculo lleva la foto de la persona (hero.retrato); sin ella, el logo; sin
     ninguno, las iniciales (el logo, sin fondo ni aro añadidos: tal cual es). Al lado, el logo solo si el círculo ya lleva la foto de la persona; si no, el nombre
     escrito (así el logo nunca sale dos veces).
   - En el centro, lo que cuenta el negocio: titular, qué hace y un botón a otra página (los de su Inicio: titular,
     descripcion, boton y botonA). Sin titular propio, su lema.
   - Abajo, siempre tres fotos en fila (de todas sus páginas; la del fondo, la última que se usa).
   inicio: la pestaña de Inicio de la miniweb, con sus textos. irA: lleva a otra página de la miniweb */
export default function HeroRetratoWeb({ hero, nombre, lema, inicio, irA }) {
  const logo = useContext(LogoNegocio)
  const fotos = fotosDe(hero.pestanas?.[0]).map(f => f.src)
  const fondo = hero.fondo ?? fotos[0]
  // Las tres de abajo: si hay de sobra, sin repetir la del fondo; si hay menos de tres, se repiten para llenar la fila
  const disponibles = fotos.length > 3 ? fotos.slice(1) : fotos
  const fila = disponibles.length ? [0, 1, 2].map(i => disponibles[i % disponibles.length]) : []
  const iniciales = (nombre ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  const titular = inicio?.titular ?? (lema ? [lema] : [])
  const circulo = hero.retrato ?? logo

  return (
    // Crece con lo que lleva (sin recortarlo): si el texto es largo, la página baja con scroll en vez de montarse
    <div className="relative flex flex-1 flex-col bg-neutral-900 text-white">
      {/* Fondo y velo, recortados en su propia capa */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {fondo && <Img src={fondo} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_65%]" />}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Círculo (foto de la persona, logo o iniciales) y, al lado, el nombre o el logo */}
      <div className="relative flex items-center gap-[0.8rem] px-[1.25rem] pt-[1rem]">
        {circulo ? (
          <Img
            src={circulo}
            alt={hero.retrato ? '' : nombre}
            className={`h-[3.4rem] w-[3.4rem] shrink-0 rounded-full ${hero.retrato ? 'object-cover ring-2 ring-demo-primary' : 'object-contain'}`}
          />
        ) : (
          <span className="flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-full font-demo-heading text-[1.2rem] font-bold ring-2 ring-demo-primary">
            {iniciales}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          {hero.retrato && logo ? (
            <img src={logo} alt={nombre} className="max-h-[2.4rem] max-w-[9rem] object-contain" />
          ) : (
            <p className="font-demo-heading text-[1.35rem] font-bold">{nombre}</p>
          )}
          {hero.profesion && <p className="text-[0.85rem] text-white/75">{hero.profesion}</p>}
        </div>
      </div>

      {/* Centro: lo que cuenta el negocio, anclado abajo (lo que se añade crece hacia arriba) */}
      <div className="relative flex min-h-[9rem] flex-1 flex-col justify-end px-[1.25rem] pt-[1rem]">
        {titular.length > 0 && (
          <h1 className="font-demo-heading text-[clamp(2rem,1.6rem+2vw,2.5rem)] font-bold leading-[1.02] text-white">
            {titular.map((l, i) => (
              <span key={i} className="block">{l}</span>
            ))}
          </h1>
        )}
        {inicio?.descripcion && <p className="mt-[0.5rem] max-w-[22rem] text-[0.92rem] leading-[1.45] text-white/85">{inicio.descripcion}</p>}
        <div className="mt-[0.8rem] flex flex-wrap items-center gap-[0.75rem]">
          {inicio?.boton && inicio.botonA && (
            <button
              type="button"
              onClick={() => irA?.(inicio.botonA)}
              className="inline-flex min-h-[2.5rem] items-center rounded-[0.4rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
            >
              {inicio.boton}
            </button>
          )}
          <BotonCompartir titulo={nombre} />
        </div>
      </div>

      {/* Abajo: siempre tres fotos en tercios */}
      {fila.length > 0 && (
        <div className="relative mx-[1.25rem] mb-[1rem] mt-[0.9rem] grid grid-cols-3 gap-[0.4rem]">
          {fila.map((src, i) => (
            <Img key={i} src={src} alt="" className="aspect-[3/4] w-full rounded-[0.4rem] object-cover" />
          ))}
        </div>
      )}
    </div>
  )
}
