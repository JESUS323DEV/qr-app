import { useContext, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Img from '../components/Img'
import BotonCompartir from '../components/BotonCompartir'
import { LogoNegocio, useFactorNombre } from '../components/NombreMarca'
import { fotosDe } from '../fichas/escenas'

// Líneas de ejemplo para el pie de la foto abierta (inventadas, para un restaurante), mientras las fotos no traigan
// las suyas (etiqueta). Se reparten en orden
const PIES_EJEMPLO = [
  { titulo: 'El plato de la casa', linea: 'Cocina de mercado, hecha cada día con producto fresco.' },
  { titulo: 'Para compartir', linea: 'Raciones generosas para la mesa, con ingredientes de temporada.' },
  { titulo: 'Menú del día', linea: 'De martes a viernes, primero, segundo y postre por 14,90 €.' },
]

/* Retrato para miniwebs (la portada de su página de Inicio). Aparte del Retrato de las fichas, que se queda como está.
   Un bloque oscuro sobre una foto con velo:
   - Arriba, el círculo y el nombre. El círculo lleva la foto de la persona (hero.retrato); sin ella, el logo; sin
     ninguno, las iniciales (el logo, sin fondo ni aro añadidos: tal cual es). Al lado, el logo solo si el círculo ya lleva la foto de la persona; si no, el nombre
     escrito (así el logo nunca sale dos veces).
   - En el centro, lo que cuenta el negocio: titular, qué hace y un botón a otra página (los de su Inicio: titular,
     descripcion, boton y botonA). Sin titular propio, su lema.
   - Abajo, siempre tres fotos en fila (de todas sus páginas; la del fondo, la última que se usa). Al tocar una, se abre
     en grande con su título y una línea de información debajo.
   inicio: la pestaña de Inicio de la miniweb, con sus textos. irA: lleva a otra página de la miniweb */
export default function HeroRetratoWeb({ hero, nombre, lema, inicio, irA }) {
  const logo = useContext(LogoNegocio)
  const factorNombre = useFactorNombre()
  const fotosDeLaPestana = fotosDe(hero.pestanas?.[0])
  const fotos = fotosDeLaPestana.map(f => f.src)
  // La foto abierta en grande (su número en la fila) o ninguna
  const [abierta, setAbierta] = useState(null)
  useEffect(() => {
    if (abierta === null) return
    const tecla = e => e.key === 'Escape' && setAbierta(null)
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [abierta])
  const fondo = hero.fondo ?? fotos[0]
  // Las tres de abajo: si hay de sobra, sin repetir la del fondo; si hay menos de tres, se repiten para llenar la fila
  const disponibles = fotos.length > 3 ? fotos.slice(1) : fotos
  const fila = disponibles.length ? [0, 1, 2].map(i => disponibles[i % disponibles.length]) : []
  // El pie de cada foto: su etiqueta (si la trae) y, si no, una línea de ejemplo
  const pieDe = i => {
    const propia = fotosDeLaPestana.find(f => f.src === fila[i])?.etiqueta
    const ejemplo = PIES_EJEMPLO[i % PIES_EJEMPLO.length]
    return { titulo: propia ?? ejemplo.titulo, linea: ejemplo.linea }
  }
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
            <p className="font-demo-heading font-bold leading-none" style={{ fontSize: `${1.9 * factorNombre}rem` }}>{nombre}</p>
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
          <BotonCompartir titulo={nombre} alLado />
        </div>
      </div>

      {/* Abajo: siempre tres fotos en tercios */}
      {fila.length > 0 && (
        <div className="relative mx-[1.25rem] mb-[1rem] mt-[0.9rem] grid grid-cols-3 gap-[0.4rem]">
          {fila.map((src, i) => (
            <button key={i} type="button" onClick={() => setAbierta(i)} aria-label={`Ver la foto ${i + 1} en grande`} className="block overflow-hidden rounded-[0.4rem]">
              <Img src={src} alt="" className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {/* La foto abierta en grande, con su título y una línea de información; se cierra tocando fuera o con la X */}
      {abierta !== null && fila[abierta] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-[1rem]" onClick={() => setAbierta(null)} role="dialog" aria-label="Foto en grande">
          <div className="w-full max-w-[22rem] text-white" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <Img src={fila[abierta]} alt="" className="max-h-[68svh] w-full rounded-[0.6rem] object-cover" />
              <button
                type="button"
                onClick={() => setAbierta(null)}
                aria-label="Cerrar"
                className="absolute right-[0.5rem] top-[0.5rem] flex h-[2.2rem] w-[2.2rem] items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
              >
                <X className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-[0.8rem] font-demo-heading text-[1.3rem] font-bold leading-tight">{pieDe(abierta).titulo}</p>
            <p className="mt-[0.25rem] text-[0.9rem] leading-[1.4] text-white/80">{pieDe(abierta).linea}</p>
          </div>
        </div>
      )}
    </div>
  )
}
