import { useMemo, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import Img from '../components/Img'
import BotonCompartir from '../components/BotonCompartir'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Retrato (pensado para profesionales que se venden a sí mismos: psicología, terapias...).
   Todo el hero es un bloque oscuro sobre una foto con velo: arriba el retrato redondo con el nombre
   y la profesión; en el centro, lo que cambia con cada pestaña; abajo, una barra de pestañas tipo app
   (icono y nombre). Pestañas (solo cambian al tocarlas):
   - inicio: el titular grande y una frase.
   - servicios: lo que trata, en etiquetas, y cómo atiende.
   - sobremi: una presentación corta.
   - contacto: WhatsApp, teléfono, correo y dónde atiende.
   Hero por piezas: además de las suyas, pinta las pestañas comunes (fotos, horario, ubicación, precios) con su
   estilo de texto sobre oscuro; la barra es una pieza (hero.barra; la suya, la tipo app). Sin fondo, usa la
   primera foto; sin retrato, un círculo con las iniciales.
   hero: fondo?, retrato?, profesion?, barra?, pestanas[{ tipo, texto, ... }] */

// Sus pestañas propias (las de profesional); el resto, las comunes
const PROPIAS = ['inicio', 'servicios', 'sobremi']

function Titulo({ children }) {
  return children ? <p className="font-demo-heading text-[1.5rem] font-bold text-demo-primary">{children}</p> : null
}

function EscenaInicio({ pestana, nombre }) {
  return (
    <div className="flex h-full flex-col justify-end">
      {/* Compartir, encima del titular */}
      <BotonCompartir titulo={nombre} className="mb-[0.7rem] self-start" />
      <h1 className="font-demo-heading text-[clamp(2.1rem,1.6rem+2.4vw,2.7rem)] font-bold leading-[1.05] text-demo-primary">
        {(pestana.titular ?? [nombre]).map((l, i) => (
          <span key={i} className="block">{l}</span>
        ))}
      </h1>
      <p className="mt-[0.6rem] text-[1rem] leading-[1.4] text-white/85">{pestana.texto_inicio}</p>
    </div>
  )
}

function EscenaServicios({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      <ul className="mt-[0.7rem] flex flex-wrap gap-[0.45rem]">
        {(pestana.servicios ?? []).map(s => (
          <li key={s} className="rounded-[0.4rem] border border-demo-primary/60 px-[0.65rem] py-[0.3rem] text-[0.88rem] text-white">
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-[0.7rem] text-[0.88rem] text-white/75">{pestana.nota}</p>
    </div>
  )
}

function EscenaSobreMi({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      <p className="mt-[0.5rem] text-[0.95rem] leading-[1.45] text-white/85">{pestana.texto_sobremi}</p>
    </div>
  )
}

function EscenaContacto({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      {(pestana.donde ?? pestana.texto_encargo) && (
        <p className="mt-[0.3rem] text-[0.88rem] text-white/75">{pestana.donde ?? pestana.texto_encargo}</p>
      )}
      {pestana.url && pestana.boton && (
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="mt-[0.8rem] inline-flex min-h-[2.5rem] w-fit items-center gap-[0.45rem] rounded-[0.4rem] bg-demo-primary px-[1rem] text-[0.92rem] font-semibold text-neutral-900"
        >
          <MessageCircle className="h-[1rem] w-[1rem]" aria-hidden="true" />
          {pestana.boton}
        </a>
      )}
      <div className="mt-[0.6rem] flex flex-wrap gap-x-[1rem] gap-y-[0.3rem] text-[0.82rem] text-white/80">
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="flex items-center gap-[0.35rem]">
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
        {pestana.email && (
          <a href={`mailto:${pestana.email}`} className="underline underline-offset-[0.2em]">
            {pestana.email}
          </a>
        )}
      </div>
    </div>
  )
}

// Fotos (de otras demos): hasta tres en fila, con el título encima
function EscenaFotos({ pestana }) {
  const fotos = fotosDe(pestana).slice(0, 3)
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      <div className="mt-[0.7rem] grid grid-cols-3 gap-[0.4rem]">
        {fotos.map((f, i) => (
          <Img key={i} src={f.src} alt={f.alt ?? ''} className="aspect-[3/4] w-full rounded-[0.4rem] object-cover" />
        ))}
      </div>
    </div>
  )
}

function EscenaHorario({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      <dl className="mt-[0.6rem] grid gap-[0.25rem] text-[0.9rem]">
        {(pestana.lineas ?? []).map(l => (
          <div key={l.dias} className="flex items-baseline justify-between gap-[1rem] border-t border-white/15 pt-[0.3rem]">
            <dt className="font-semibold text-white">{l.dias}</dt>
            <dd className="shrink-0 text-white/75">{l.horas}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function EscenaUbicacion({ pestana, cargar }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo ?? pestana.texto}</Titulo>
      <p className="mt-[0.3rem] text-[0.88rem] text-white/75">{pestana.direccion}</p>
      <div className="mt-[0.7rem] h-[8rem] overflow-hidden rounded-[0.4rem] bg-white/10">
        {cargar && (
          <iframe
            title="Mapa"
            src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </div>
  )
}

function EscenaPrecios({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <Titulo>{pestana.titulo}</Titulo>
      <ul className="mt-[0.6rem] grid gap-[0.25rem] text-[0.9rem]">
        {(pestana.servicios ?? []).map(s => (
          <li key={s.nombre} className="flex items-baseline justify-between gap-[1rem] border-t border-white/15 pt-[0.3rem]">
            <span className="text-white">{s.nombre}</span>
            <span className="shrink-0 text-white/75">{s.precio}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ESCENAS = {
  inicio: EscenaInicio,
  servicios: EscenaServicios,
  sobremi: EscenaSobreMi,
  contacto: EscenaContacto,
  fotos: EscenaFotos,
  horario: EscenaHorario,
  ubicacion: EscenaUbicacion,
  precios: EscenaPrecios,
}

const escenaDe = tipo => (PROPIAS.includes(tipo) ? ESCENAS[tipo] : ESCENAS[tipoComun(tipo)])

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroRetrato({ hero, nombre, sinBarra = false }) {
  // Solo las pestañas que sabe pintar (las suyas y las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => escenaDe(p.tipo)), [hero.pestanas])
  const fondo = hero.fondo ?? fotoDeRespaldo(pestanas)
  const iniciales = (nombre ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  const [activa, setActiva] = useState(0)
  const { parar } = useVueltaPestanas(pestanas, setActiva)

  const tocar = i => {
    parar()
    setActiva(i)
  }

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="relative flex flex-1 flex-col overflow-hidden bg-neutral-900 text-white" onPointerDown={parar}>
      {fondo && <Img src={fondo} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_65%]" />}
      <div className="pointer-events-none absolute inset-0 bg-black/70" />

      {/* Retrato, nombre y profesión */}
      <div className="relative flex items-center gap-[0.8rem] px-[1.25rem] pt-[1rem]">
        {hero.retrato ? (
          <Img
            src={hero.retrato}
            alt={nombre}
            className="h-[3.4rem] w-[3.4rem] shrink-0 rounded-full object-cover ring-2 ring-demo-primary ring-offset-2 ring-offset-black/0"
          />
        ) : (
          <span className="flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-full font-demo-heading text-[1.2rem] font-bold ring-2 ring-demo-primary">
            {iniciales}
          </span>
        )}
        <div className="leading-tight">
          <p className="font-demo-heading text-[1.35rem] font-bold">{nombre}</p>
          {hero.profesion && <p className="text-[0.85rem] text-white/75">{hero.profesion}</p>}
        </div>
      </div>

      {/* Lo que cambia con cada pestaña: ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mb-[1rem] mt-[0.8rem] min-h-[10rem] flex-1">
        {pestanas.map((p, i) => {
          const Escena = escenaDe(p.tipo)
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-all duration-500 ${i === activa ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[0.5rem] opacity-0'}`}
            >
              <Escena pestana={p} nombre={nombre} cargar />
            </div>
          )
        })}
      </div>

      {/* Barra de pestañas (pieza); la suya, tipo app sobre el bloque oscuro */}
      {!sinBarra && (
        <div className="relative">
          <BarraPestanas estilo={hero.barra ?? 'app'} pestanas={pestanas} activa={activa} tocar={tocar} sobre="oscuro" />
        </div>
      )}
    </div>
  )
}
