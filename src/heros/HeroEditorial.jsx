import { useEffect, useState } from 'react'
import Img from '../components/Img'

/* Editorial (adaptado de platform). La foto, con el corte diagonal abajo, cambia según la pestaña
   y lleva encima, abajo a la izquierda, el nombre en dos líneas y una frase. Las pestañas van debajo.
   Pestañas (solo cambian al tocarlas):
   - trabajos: las fotos van pasando solas con un fundido.
   - ubicacion: el mapa (se carga la primera vez que se toca) con el contacto encima.
   - horario: foto fija con el horario encima.
   - cita: foto fija con un botón para pedir cita.
   hero: titulo, destacado (segunda línea, opcional), texto, pestanas[{ tipo, texto, ... }] */

const TURNO_MS = 4500

// Abajo van el nombre y la frase: la información de cada pestaña va arriba a la derecha
const INFO_ARRIBA = 'top-[2.25rem]'

function Velo() {
  return <div className="pointer-events-none absolute inset-0 bg-black/30" />
}

function EscenaTrabajos({ pestana, activa }) {
  const fotos = pestana.fotos ?? []
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const id = setInterval(() => setActual(i => (i + 1) % fotos.length), TURNO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  return fotos.map((f, i) => (
    <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
      <Img src={f.src} alt={f.alt ?? ''} className="h-full w-full object-cover object-top" />
    </div>
  ))
}

function EscenaUbicacion({ pestana, cargar }) {
  return (
    <>
      {cargar && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className={`absolute right-[1.25rem] ${INFO_ARRIBA} max-w-[calc(100%-2.5rem)] border-l-[0.2rem] border-demo-primary bg-demo-bg px-[0.9rem] py-[0.6rem] text-right shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.35)]`}>
        <p className="text-[0.88rem] font-semibold">{pestana.direccion}</p>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.1rem] block text-[0.85rem] text-demo-muted underline underline-offset-[0.2em]">
            {pestana.telefono}
          </a>
        )}
      </div>
    </>
  )
}

function EscenaHorario({ pestana }) {
  return (
    <>
      <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <div className={`absolute right-[1.25rem] ${INFO_ARRIBA} text-right text-white`}>
        <p className="font-demo-heading text-[1.5rem] italic leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.45rem] grid gap-[0.1rem] text-[0.88rem]">
          {pestana.lineas.map(l => (
            <div key={l.dias}>
              <dt className="inline font-semibold">{l.dias}</dt>{' '}
              <dd className="inline text-white/85">{l.horas}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

function EscenaCita({ pestana }) {
  return (
    <>
      <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
      <Velo />
      <div className={`absolute right-[1.25rem] ${INFO_ARRIBA} flex flex-col items-end text-white`}>
        <p className="font-demo-heading text-[1.5rem] italic leading-none">{pestana.titulo}</p>
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="mt-[0.6rem] inline-flex min-h-[2.5rem] items-center rounded-full bg-demo-primary px-[1.1rem] text-[0.88rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
      </div>
    </>
  )
}

const ESCENAS = {
  trabajos: EscenaTrabajos,
  horario: EscenaHorario,
  cita: EscenaCita,
}

export default function HeroEditorial({ hero }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'ubicacion') setMapaPedido(true)
  }

  const enMapa = pestanas[activa]?.tipo === 'ubicacion'

  return (
    <div>
      <div className="relative h-[calc(28svh+6.5rem)] min-h-[17.5rem] max-h-[28rem]">
        {/* El corte diagonal solo recorta la foto; el texto va fuera para que no lo corte */}
        <div
          className="absolute inset-0 overflow-hidden bg-demo-surface"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 86%)' }}
        >
          {pestanas.map((p, i) => {
            const Escena = ESCENAS[p.tipo]
            return (
              <div
                key={p.tipo}
                aria-hidden={i !== activa}
                className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              >
                {p.tipo === 'ubicacion'
                  ? <EscenaUbicacion pestana={p} cargar={mapaPedido} />
                  : <Escena pestana={p} activa={i === activa} />}
              </div>
            )
          })}
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-[10rem] bg-gradient-to-t from-demo-bg/90 via-demo-bg/55 to-transparent transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`} />
        </div>

        {/* Nombre y frase encima de la foto, abajo a la izquierda (en el mapa se desvanecen) */}
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-demo-text transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="font-demo-heading text-[clamp(2.9rem,2.3rem+2.8vw,3.6rem)] font-semibold leading-[1.02] [text-shadow:0_0_1.25rem_color-mix(in_srgb,var(--demo-bg)_70%,transparent)]">
            {hero.titulo}
            {hero.destacado && (
              <>
                <br />
                <em className="not-italic">{hero.destacado}</em>
              </>
            )}
          </h1>
          {hero.texto && <p className="mt-[0.4rem] text-[0.95rem] leading-[1.45] [text-shadow:0_0_0.5rem_color-mix(in_srgb,var(--demo-bg)_70%,transparent)]">{hero.texto}</p>}
        </div>
      </div>

      <div className="px-[1.25rem] pt-[0.5rem]">
        {/* Pestañas subrayadas, propias de este diseño */}
        <div className="mt-[0.9rem] flex border-b border-demo-text/15">
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              className={`-mb-px flex-1 border-b-[0.15rem] pb-[0.55rem] pt-[0.3rem] text-[0.85rem] font-medium transition-colors duration-300 ${
                i === activa ? 'border-demo-primary text-demo-text' : 'border-transparent text-demo-muted hover:text-demo-text'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
