import { useEffect, useMemo, useState } from 'react'
import NombreMarca from '../components/NombreMarca'
import { Phone } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Portada (adaptado del Cover de Navaja & Tijera en platform). Portada de revista en blanco y negro:
   una franja arriba (lema y horario, siempre a la vista), el nombre enorme y una foto en blanco y negro
   que cambia según la pestaña. Pestañas como el menú de cabecera de una revista, separadas por barras.
   Pestañas (solo cambian al tocarlas):
   - cortes: las fotos pasan solas con fundido, con el titular encima.
   - precios: la lista de servicios con su precio, como los titulares de una portada.
   - ubicacion: el mapa (se carga la primera vez que se toca) con la dirección encima.
   - cita: foto fija con el botón de WhatsApp y, si hay, teléfono.
   - horario: foto fija con el horario, como las otras.
   Hero por piezas: pinta todas las pestañas comunes con su estilo en blanco y negro; la barra es una pieza
   (hero.barra; la suya, palabras separadas por barras).
   hero: franja, horario, barra?, pestanas[{ tipo, texto, ... }] */

const TURNO_MS = 4800
const BYN = 'grayscale contrast-110'

function Velo({ clase = 'bg-gradient-to-t from-black/85 via-black/25 to-transparent' }) {
  return <div className={`pointer-events-none absolute inset-0 ${clase}`} />
}

function EscenaCortes({ pestana, activa }) {
  // Las fotos de cualquier demo (fotos u opciones)
  const fotos = fotosDe(pestana)
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const id = setInterval(() => setActual(i => (i + 1) % fotos.length), TURNO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  return (
    <>
      {fotos.map((f, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
          <Img src={f.src} alt={f.alt ?? ''} className={`h-full w-full object-cover ${BYN}`} />
        </div>
      ))}
      <Velo />
      {(pestana.titulo || pestana.destacado) && (
        <h2 className="absolute inset-x-0 bottom-0 p-[1rem] font-demo-heading text-[clamp(1.7rem,1.4rem+1.6vw,2.2rem)] leading-[1.05] text-white">
          {pestana.titulo}
          {pestana.destacado && (
            <>
              <br />
              <em className="font-normal italic">{pestana.destacado}</em>
            </>
          )}
        </h2>
      )}
    </>
  )
}

function EscenaPrecios({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className={`absolute inset-0 h-full w-full object-cover ${BYN}`} />
      <Velo clase="bg-black/80" />
      <ul className="absolute inset-0 flex flex-col justify-center gap-[0.55rem] px-[1rem] text-white">
        {(pestana.servicios ?? []).map(s => (
          <li key={s.nombre} className="flex items-baseline justify-between gap-[1rem] border-t border-white/20 pt-[0.45rem]">
            <span className="font-demo-heading text-[1.1rem] leading-tight">{s.nombre}</span>
            <span className="shrink-0 text-[0.9rem] text-white/75">{s.precio}</span>
          </li>
        ))}
      </ul>
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
          className={`absolute inset-0 h-full w-full border-0 ${BYN}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <span className="absolute bottom-[0.7rem] left-[0.7rem] max-w-[calc(100%-1.4rem)] bg-black/80 px-[0.7rem] py-[0.3rem] text-[0.75rem] text-white">
        {pestana.direccion}
      </span>
    </>
  )
}

function EscenaCita({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className={`absolute inset-0 h-full w-full object-cover ${BYN}`} />
      <Velo />
      {/* Un velo más para que el texto de la cita no se camufle con la foto */}
      <Velo clase="bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 p-[1rem] text-white">
        <p className="font-demo-heading text-[1.7rem] italic leading-none">{pestana.titulo}</p>
        {pestana.texto_encargo && <p className="mt-[0.4rem] text-[0.82rem] text-white/80">{pestana.texto_encargo}</p>}
        {pestana.url && pestana.boton && (
          <a
            href={pestana.url}
            target="_blank"
            rel="noreferrer"
            className="mt-[0.7rem] inline-flex min-h-[2.4rem] items-center bg-white px-[1rem] text-[0.85rem] font-semibold text-black"
          >
            {pestana.boton}
          </a>
        )}
        {pestana.telefono && (
          <a
            href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
            className="mt-[0.5rem] flex items-center gap-[0.35rem] text-[0.78rem] text-white/80"
          >
            {pestana.texto_telefono ?? 'o por teléfono'}
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </div>
    </>
  )
}

// Horario (de otras demos), con el mismo aire que la cita
function EscenaHorario({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className={`absolute inset-0 h-full w-full object-cover ${BYN}`} />
      <Velo />
      <Velo clase="bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 p-[1rem] text-white">
        <p className="font-demo-heading text-[1.7rem] italic leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.6rem] grid gap-[0.2rem] text-[0.85rem]">
          {(pestana.lineas ?? []).map(l => (
            <div key={l.dias} className="flex items-baseline justify-between gap-[1rem] border-t border-white/20 pt-[0.3rem]">
              <dt className="font-semibold">{l.dias}</dt>
              <dd className="shrink-0 text-white/75">{l.horas}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

// Por tipo común: todas las pestañas comunes con su estilo propio
const ESCENAS = {
  fotos: EscenaCortes,
  precios: EscenaPrecios,
  contacto: EscenaCita,
  horario: EscenaHorario,
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroPortada({ hero, nombre, sinBarra = false }) {
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

  // "Navaja & Tijera": el & va en cursiva, como en la cabecera de platform
  const partes = nombre.split(' & ')

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      <div className="px-[1.25rem] pt-[0.9rem]">
        {/* Franja de revista: compartir y horario */}
        <div className="flex items-center justify-between gap-[1rem] border-b border-demo-text/20 pb-[0.5rem] text-[0.75rem] text-demo-muted">
          <BotonCompartir titulo={nombre} estilo="suave" />
          {hero.horario && <span className="text-right">{hero.horario}</span>}
        </div>

        <h1 className="mt-[0.7rem] text-center font-demo-heading text-[clamp(2.6rem,2rem+3vw,3.4rem)] uppercase leading-[0.9] tracking-tight">
          <NombreMarca nombre={nombre} tamano="grande">
            {partes.length === 2
              ? <>{partes[0]} <em className="font-normal italic">&amp;</em> {partes[1]}</>
              : nombre}
          </NombreMarca>
        </h1>
      </div>

      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mt-[0.9rem] min-h-[9rem] flex-1 overflow-hidden bg-demo-surface">
        {pestanas.map((p, i) => {
          const tipo = tipoComun(p.tipo)
          const Escena = ESCENAS[tipo]
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {tipo === 'ubicacion'
                ? <EscenaUbicacion pestana={p} cargar={mapaPedido} />
                : <Escena pestana={p} activa={i === activa && !enVuelta} respaldo={respaldo} />}
            </div>
          )
        })}
      </div>

      {/* Barra de pestañas (pieza); la suya, como el menú de cabecera de una revista, separadas por barras */}
      {!sinBarra && (
        <div className="px-[1.25rem] pb-[0.2rem] pt-[0.7rem]">
          <BarraPestanas estilo={hero.barra ?? 'barras'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}
    </div>
  )
}
