import { useEffect, useRef, useState } from 'react'
import Img from '../components/Img'

/* Apetece (adaptado de platform). La foto grande cambia según la pestaña:
   - platos: las fotos van pasando solas con una cortina de tiras.
   - ubicacion: el mapa (se carga la primera vez que se toca) con el contacto abajo a la izquierda.
   - horario: foto fija con el horario encima.
   - reservar: foto fija con un botón para reservar.
   Las pestañas solo cambian al tocarlas.
   hero: pestanas[{ tipo, texto, ... }] */

const TIRAS = 6
const ANCHO_TIRA = 100 / TIRAS + 0.3 // un pelín de solape para que no se vean costuras
const CAMBIO_MS = 1300
const TURNO_MS = 4000

const TITULO = 'font-demo-heading text-[clamp(1.85rem,1.3rem+2.6vw,2.4rem)] leading-[1.04] tracking-tight'

// Velo sobre la foto para que el texto no se pierda
function FotoConVelo({ src, alt }) {
  return (
    <>
      <Img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
    </>
  )
}

// Bloque de texto abajo, sobre la foto
function Pie({ children }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-[1.25rem] pb-[0.8rem] pt-[3.5rem] text-white">
      {children}
    </div>
  )
}

function EscenaPlatos({ pestana, activa }) {
  const opciones = pestana.opciones ?? []
  const [actual, setActual] = useState(0)
  const [entrante, setEntrante] = useState(null)
  const [play, setPlay] = useState(false)
  const timer = useRef(null)

  const destino = entrante ?? actual

  // Pasa sola a la siguiente foto mientras la pestaña está a la vista
  useEffect(() => {
    if (!activa || entrante !== null || opciones.length < 2) return
    const t = setTimeout(() => {
      setPlay(false)
      setEntrante((actual + 1) % opciones.length)
    }, TURNO_MS)
    return () => clearTimeout(t)
  }, [activa, actual, entrante, opciones.length])

  // La cortina arranca un fotograma después de montar las tiras, para que la transición se vea
  useEffect(() => {
    if (entrante === null) return
    let r2
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPlay(true)) })
    timer.current = setTimeout(() => {
      setActual(entrante)
      setEntrante(null)
      setPlay(false)
    }, CAMBIO_MS)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      clearTimeout(timer.current)
    }
  }, [entrante])

  const fotoEntrante = entrante !== null ? opciones[entrante]?.foto : null

  return (
    <>
      <Img src={opciones[actual]?.foto} alt={opciones[actual]?.plato ?? ''} className="absolute inset-0 h-full w-full object-cover" />

      {fotoEntrante && (
        <div
          className="absolute inset-0 transition-transform duration-[1400ms] ease-out"
          style={{ transform: play ? 'scale(1)' : 'scale(1.12)' }}
        >
          {Array.from({ length: TIRAS }, (_, s) => (
            <div
              key={s}
              className="absolute inset-y-0 overflow-hidden transition-[clip-path] duration-[800ms] ease-[cubic-bezier(0.65,0,0.25,1)]"
              style={{
                left: `${(s * 100) / TIRAS}%`,
                width: `${ANCHO_TIRA}%`,
                clipPath: play ? 'inset(0 0 0 0)' : s % 2 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
                transitionDelay: `${s * 70}ms`,
              }}
            >
              <Img
                src={fotoEntrante}
                alt=""
                className="absolute inset-y-0 h-full max-w-none object-cover"
                style={{
                  width: `${(100 / ANCHO_TIRA) * 100}%`,
                  left: `${-(((s * 100) / TIRAS) / ANCHO_TIRA) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/30" />

      <Pie>
        <h1 className={TITULO}>{pestana.titulo}</h1>
        <div className="mt-[0.3rem] grid items-end" aria-live="polite">
          {opciones.map((o, i) => (
            <p
              key={i}
              aria-hidden={i !== destino}
              className={`col-start-1 row-start-1 flex items-baseline gap-[0.6rem] font-demo-heading text-[1.25rem] transition-opacity duration-500 ${i === destino ? 'opacity-100 delay-300' : 'opacity-0'}`}
            >
              {o.plato}
              {o.precio && <span className="font-demo-body text-[0.85rem] font-semibold text-white/80">{o.precio}</span>}
            </p>
          ))}
        </div>
      </Pie>
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
      <div className="absolute bottom-[0.8rem] left-[1.25rem] max-w-[calc(100%-2.5rem)] rounded-[0.9rem] bg-demo-bg/95 px-[0.95rem] py-[0.7rem] text-demo-text shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.35)]">
        <p className="text-[0.9rem] font-semibold">{pestana.direccion}</p>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.15rem] block text-[0.88rem] text-demo-muted underline underline-offset-[0.2em]">
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
      <FotoConVelo src={pestana.foto} alt="" />
      <Pie>
        <h2 className={TITULO}>{pestana.titulo}</h2>
        <dl className="mt-[0.4rem] grid gap-[0.15rem] text-[0.9rem]">
          {pestana.lineas.map(l => (
            <div key={l.dias} className="flex flex-wrap gap-x-[0.5rem]">
              <dt className="whitespace-nowrap font-semibold">{l.dias}</dt>
              <dd className="whitespace-nowrap text-white/85">{l.horas}</dd>
            </div>
          ))}
        </dl>
      </Pie>
    </>
  )
}

function EscenaReservar({ pestana }) {
  return (
    <>
      <FotoConVelo src={pestana.foto} alt="" />
      <Pie>
        <h2 className={TITULO}>{pestana.titulo}</h2>
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto mt-[0.7rem] inline-flex min-h-[2.6rem] items-center rounded-full bg-white px-[1.1rem] text-[0.9rem] font-semibold text-[#1F1F1F]"
        >
          {pestana.boton}
        </a>
      </Pie>
    </>
  )
}

const ESCENAS = {
  platos: EscenaPlatos,
  horario: EscenaHorario,
  reservar: EscenaReservar,
}

export default function HeroApetece({ hero, nombre, lema }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'ubicacion') setMapaPedido(true)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative min-h-[12.5rem] flex-1 overflow-hidden bg-demo-surface">
        {pestanas.map((p, i) => {
          const Escena = ESCENAS[p.tipo]
          return (
            <div
              key={p.tipo}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {p.tipo === 'ubicacion'
                ? <EscenaUbicacion pestana={p} cargar={mapaPedido} />
                : <Escena pestana={p} activa={i === activa} />}
            </div>
          )
        })}

        {/* Marca del negocio arriba (en el mapa se oculta para no pisarlo) */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-[1.25rem] pb-[2.5rem] pt-[1.1rem] text-white transition-opacity duration-500 ${
            pestanas[activa]?.tipo === 'ubicacion' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="font-demo-heading text-[1.6rem] leading-none">{nombre}</p>
          {lema && <p className="mt-[0.3rem] text-[0.85rem] text-white/80">{lema}</p>}
        </div>
      </div>

      <div className="px-[1.25rem] pt-[1.1rem]">
        <div className="grid gap-[0.4rem]" style={{ gridTemplateColumns: `repeat(${pestanas.length}, minmax(0, 1fr))` }}>
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              className={`rounded-full border px-[0.25rem] py-[0.6rem] text-[0.8rem] font-medium transition-colors duration-300 ${
                i === activa
                  ? 'border-demo-primary bg-demo-primary text-demo-bg'
                  : 'border-demo-text/25 hover:border-demo-primary'
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
