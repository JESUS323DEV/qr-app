import { useEffect, useMemo, useRef, useState } from 'react'
import TextoInicio from '../components/TextoInicio'
import NombreMarca from '../components/NombreMarca'
import { Phone } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { useRol } from '../components/ColoresPortada'
import { formatoDe } from '../lib/formatos'
import CtaPortada from '../components/CtaPortada'

/* Editorial (adaptado del Apetece de platform). La foto grande cambia según la pestaña:
   - platos: las fotos van pasando solas con una cortina de tiras.
   - ubicacion: el mapa (se carga la primera vez que se toca) con el contacto abajo a la izquierda.
   - horario: foto fija con el horario encima.
   - reservar: foto fija con un botón para reservar.
   Las pestañas solo cambian al tocarlas.
   Hero por piezas: conserva sus escenas propias (la cortina de tiras, el texto abajo con degradado) para las
   pestañas comunes (fotos, horario, contacto, ubicación) y usa la pieza común para precios; la barra es una
   pieza (hero.barra; la suya, el índice de revista).
   hero: barra?, pestanas[{ tipo, texto, ... }] */

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
  // Las fotos de la pestaña: las de Almendra (opciones, con su plato) o las de cualquier otra demo
  const opciones = pestana.opciones?.length ? pestana.opciones : fotosDe(pestana).map(f => ({ foto: f.src, plato: f.etiqueta }))
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
        <h1 className="font-demo-heading text-[clamp(2.3rem,1.8rem+2.6vw,2.9rem)] font-semibold leading-[1.02] tracking-tight">{pestana.titulo}</h1>
        <div className="mt-[0.3rem] grid items-end" aria-live="polite">
          {opciones.map((o, i) => (
            <p
              key={i}
              aria-hidden={i !== destino}
              className={`col-start-1 row-start-1 flex items-baseline gap-[0.6rem] font-demo-heading text-[1.5rem] font-semibold transition-opacity duration-500 ${i === destino ? 'opacity-100 delay-300' : 'opacity-0'}`}
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

function EscenaHorario({ pestana, respaldo }) {
  return (
    <>
      <FotoConVelo src={pestana.foto ?? respaldo} alt="" />
      <Pie>
        <h2 className={TITULO}>{pestana.titulo}</h2>
        <dl className="mt-[0.4rem] grid gap-[0.15rem] text-[0.9rem]">
          {(pestana.lineas ?? []).map(l => (
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

function EscenaReservar({ pestana, respaldo }) {
  return (
    <>
      <FotoConVelo src={pestana.foto ?? respaldo} alt="" />
      <Pie>
        <h2 className={TITULO}>{pestana.titulo}</h2>
        {pestana.texto_encargo && <p className="mt-[0.3rem] max-w-[18rem] text-[0.85rem] leading-[1.35] text-white/85">{pestana.texto_encargo}</p>}
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto mt-[0.7rem] inline-flex min-h-[2.6rem] items-center rounded-full bg-white px-[1.1rem] text-[0.9rem] font-semibold text-[#1F1F1F]"
        >
          {pestana.boton}
        </a>
        {pestana.telefono && (
          <a
            href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
            className="pointer-events-auto mt-[0.55rem] flex w-fit items-center gap-[0.35rem] text-[0.78rem] text-white/80"
          >
            {pestana.texto_telefono ?? 'o por teléfono'}
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </Pie>
    </>
  )
}

// Sus escenas propias, por tipo común (las demás, como precios, salen con la pieza común)
const ESCENAS = {
  fotos: EscenaPlatos,
  horario: EscenaHorario,
  contacto: EscenaReservar,
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroEditorial({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  const rolSub = useRol('subtitulo')
  // El formato (hero.formato): cómo se une la foto con el texto de abajo
  const formato = formatoDe(hero.formato)
  // En una miniweb con botón de portada: el botón va encima de la foto, debajo del nombre, y no abajo con el texto
  const ctaArriba = Boolean(sinBarra && inicio?.boton && inicio?.botonA)
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const respaldo = fotoDeRespaldo(pestanas)
  const [activa, setActiva] = useState(0)
  // El mapa se carga desde el principio, en segundo plano, para que esté listo cuando la vuelta llegue a él
  const [mapaPedido, setMapaPedido] = useState(true)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className={`relative min-h-[12.5rem] flex-1 overflow-hidden bg-demo-surface ${formato.foto}`}>
        {pestanas.map((p, i) => {
          const tipo = tipoComun(p.tipo)
          const Propia = ESCENAS[tipo]
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {tipo === 'ubicacion' ? (
                <EscenaUbicacion pestana={p} cargar={mapaPedido} />
              ) : Propia ? (
                <Propia pestana={p} activa={i === activa && !enVuelta} respaldo={respaldo} />
              ) : (
                <Escena pestana={p} forma="foto" info="abajo" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
              )}
            </div>
          )
        })}

        {/* Marca del negocio arriba (en el mapa se oculta para no pisarlo) */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-[1.25rem] pb-[2.5rem] pt-[1.1rem] text-white transition-opacity duration-500 ${
            tipoComun(pestanas[activa]?.tipo) === 'ubicacion' ? 'opacity-0' : 'opacity-100'
          } ${formato.encima ?? ''}`}
        >
          <p className={`font-demo-heading leading-none ${formato.tamanoNombre ?? (sinBarra ? 'text-[2.2rem]' : 'text-[1.6rem]')}`}><NombreMarca nombre={nombre} tamano={sinBarra ? 'grande' : 'normal'} /></p>
          {lema && <p style={rolSub} className="mt-[0.3rem] text-[0.85rem] text-white/80">{lema}</p>}
          {/* Compartir, en todas las pestañas menos en la del mapa (ahí la marca se oculta) */}
          {tipoComun(pestanas[activa]?.tipo) !== 'ubicacion' &&
            (ctaArriba ? (
              <>
                <CtaPortada inicio={inicio} irA={irA} nombre={nombre} className="pointer-events-auto mt-[0.7rem]" />
                <BotonCompartir titulo={nombre} className="pointer-events-auto absolute right-[1.25rem] top-[1.1rem]" />
              </>
            ) : (
              <BotonCompartir titulo={nombre} className="pointer-events-auto mt-[0.6rem]" />
            ))}
        </div>
      </div>

      {sinBarra && <TextoInicio inicio={inicio} irA={irA} nombre={nombre} sinBoton={ctaArriba} fondo={hero.fondoInicio} color="text-demo-text" className={`${formato.bloque} pb-[1.6rem]! pt-[1.6rem]!`} />}
      {!sinBarra && (
        <div className={formato.bloque}>
          <BarraPestanas estilo={hero.barra ?? 'revista'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}
    </div>
  )
}
