import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import Img from '../components/Img'

/* Fullbleed (adaptado de platform). Foto a todo el ancho con velo oscuro y la marca arriba.
   Pestañas en una barra segmentada (solo cambian al tocarlas):
   - disenos: las fotos pasan solas con fundido y zoom lento; encima, el titular y la carta de esmaltes
     (el primero sale elegido; al tocar otro, la primera línea del titular toma su color).
   - ubicacion: el mapa (se carga la primera vez que se toca) con el contacto encima.
   - horario: foto fija con el horario encima.
   - cita: foto fija con un botón para pedir cita.
   hero: pestanas[{ tipo, texto, ... }] */

const TURNO_MS = 4500

function Velo() {
  return <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-demo-text/90 via-demo-text/45 to-demo-text/15" />
}

function Abajo({ children }) {
  return <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">{children}</div>
}

function EscenaDisenos({ pestana, activa }) {
  const fotos = pestana.fotos ?? []
  const esmaltes = pestana.esmaltes ?? []
  const [actual, setActual] = useState(0)
  // El primer esmalte sale elegido al abrir
  const [elegido, setElegido] = useState(0)
  const tinte = esmaltes[elegido]?.color

  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const id = setInterval(() => setActual(i => (i + 1) % fotos.length), TURNO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  return (
    <>
      {fotos.map((f, i) => (
        <div key={i} className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
          <Img
            src={f.src}
            alt={f.alt ?? ''}
            className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${i === actual ? 'scale-110' : 'scale-100'}`}
          />
        </div>
      ))}
      <Velo />
      <Abajo>
        <h1 className="font-demo-heading text-[clamp(2.5rem,2rem+2.4vw,3.2rem)] leading-[0.98] tracking-tight">
          <span className="transition-colors duration-500" style={{ color: tinte }}>{pestana.titulo}</span>
          {pestana.destacado && (
            <>
              <br />
              <em className="font-normal italic">{pestana.destacado}</em>
            </>
          )}
        </h1>
        {esmaltes.length > 0 && (
          <div className="mt-[0.8rem] flex gap-[0.45rem]">
            {esmaltes.map((s, i) => (
              <button
                key={s.nombre}
                type="button"
                title={s.nombre}
                aria-label={`Esmalte ${s.nombre}`}
                aria-pressed={elegido === i}
                onClick={() => setElegido(i)}
                className={`relative h-[2.1rem] w-[1.4rem] overflow-hidden rounded-[0.35rem] ring-1 transition-all duration-300 ${elegido === i ? '-translate-y-[0.25rem] ring-2 ring-white' : 'ring-white/30'}`}
                style={{ background: s.color }}
              >
                <span className="absolute left-[0.25rem] top-[0.35rem] h-[0.9rem] w-[0.12rem] rounded-full bg-white/50" />
              </button>
            ))}
          </div>
        )}
      </Abajo>
    </>
  )
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
      <div className="absolute bottom-[0.8rem] left-[1.25rem] max-w-[calc(100%-2.5rem)] rounded-[0.5rem] bg-white/75 px-[0.7rem] py-[0.45rem] text-demo-text backdrop-blur-sm">
        <p className="text-[0.75rem] font-medium">{pestana.direccion}</p>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="block text-[0.72rem] text-demo-muted underline underline-offset-[0.2em]">
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
      <Abajo>
        <p className="font-demo-heading text-[2rem] italic leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.5rem] grid gap-[0.15rem] text-[0.9rem]">
          {pestana.lineas.map(l => (
            <div key={l.dias} className="flex flex-wrap gap-x-[0.5rem]">
              <dt className="whitespace-nowrap font-semibold">{l.dias}</dt>
              <dd className="whitespace-nowrap text-white/80">{l.horas}</dd>
            </div>
          ))}
        </dl>
      </Abajo>
    </>
  )
}

function EscenaCita({ pestana }) {
  return (
    <>
      <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      {/* La foto de cita es clara: un velo más para que se lean el botón y el teléfono */}
      <div className="pointer-events-none absolute inset-0 bg-demo-text/35" />
      <Abajo>
        <p className="font-demo-heading text-[2rem] italic leading-none">{pestana.titulo}</p>
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="mt-[0.8rem] inline-flex min-h-[2.6rem] items-center rounded-full bg-white px-[1.2rem] text-[0.9rem] font-semibold text-demo-text"
        >
          {pestana.boton}
        </a>
        {pestana.telefono && (
          <a
            href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
            className="mt-[0.55rem] flex items-center gap-[0.35rem] text-[0.78rem] text-white/80"
          >
            o por teléfono
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </Abajo>
    </>
  )
}

const ESCENAS = {
  disenos: EscenaDisenos,
  horario: EscenaHorario,
  cita: EscenaCita,
}

export default function HeroFullbleed({ hero, nombre, lema }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'ubicacion') setMapaPedido(true)
  }

  const enMapa = pestanas[activa]?.tipo === 'ubicacion'

  return (
    <div className="flex flex-1 flex-col">
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative min-h-[14rem] flex-1 overflow-hidden bg-demo-text">
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

        {/* Marca arriba (en el mapa se desvanece) */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-baseline justify-between px-[1.25rem] pt-[1rem] text-white transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          <p className="font-demo-heading text-[1.5rem] leading-none">{nombre}</p>
          {lema && <p className="text-[0.82rem] text-white/75">{lema}</p>}
        </div>
      </div>

      {/* Pestañas en barra segmentada, propias de este diseño */}
      <div className="px-[1.25rem] pt-[0.9rem]">
        <div className="flex rounded-full bg-demo-surface p-[0.25rem]">
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              className={`flex-1 rounded-full py-[0.55rem] text-[0.8rem] font-semibold transition-colors duration-300 ${
                i === activa ? 'bg-demo-text text-white' : 'text-demo-muted hover:text-demo-text'
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
