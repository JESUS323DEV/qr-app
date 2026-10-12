import { useState } from 'react'
import { House, ListChecks, MessageCircle, Phone, UserRound } from 'lucide-react'
import Img from '../components/Img'
import BotonCompartir from '../components/BotonCompartir'
import useVueltaPestanas from '../lib/useVueltaPestanas'

/* Retrato (pensado para profesionales que se venden a sí mismos: psicología, terapias...).
   Todo el hero es un bloque oscuro sobre una foto con velo: arriba el retrato redondo con el nombre
   y la profesión; en el centro, lo que cambia con cada pestaña; abajo, una barra de pestañas tipo app
   (icono y nombre). Pestañas (solo cambian al tocarlas):
   - inicio: el titular grande y una frase.
   - servicios: lo que trata, en etiquetas, y cómo atiende.
   - sobremi: una presentación corta.
   - contacto: WhatsApp, teléfono, correo y dónde atiende.
   hero: fondo, retrato, profesion, pestanas[{ tipo, texto, ... }] */

const ICONOS = { inicio: House, servicios: ListChecks, sobremi: UserRound, contacto: MessageCircle }

function EscenaInicio({ pestana, nombre }) {
  return (
    <div className="flex h-full flex-col justify-end">
      {/* Compartir, encima del titular */}
      <BotonCompartir titulo={nombre} className="mb-[0.7rem] self-start" />
      <h1 className="font-demo-heading text-[clamp(2.1rem,1.6rem+2.4vw,2.7rem)] font-bold leading-[1.05] text-demo-primary">
        {pestana.titular.map((l, i) => (
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
      <p className="font-demo-heading text-[1.5rem] font-bold text-demo-primary">{pestana.titulo}</p>
      <ul className="mt-[0.7rem] flex flex-wrap gap-[0.45rem]">
        {pestana.servicios.map(s => (
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
      <p className="font-demo-heading text-[1.5rem] font-bold text-demo-primary">{pestana.titulo}</p>
      <p className="mt-[0.5rem] text-[0.95rem] leading-[1.45] text-white/85">{pestana.texto_sobremi}</p>
    </div>
  )
}

function EscenaContacto({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <p className="font-demo-heading text-[1.5rem] font-bold text-demo-primary">{pestana.titulo}</p>
      <p className="mt-[0.3rem] text-[0.88rem] text-white/75">{pestana.donde}</p>
      <a
        href={pestana.url}
        target="_blank"
        rel="noreferrer"
        className="mt-[0.8rem] inline-flex min-h-[2.5rem] w-fit items-center gap-[0.45rem] rounded-[0.4rem] bg-demo-primary px-[1rem] text-[0.92rem] font-semibold text-neutral-900"
      >
        <MessageCircle className="h-[1rem] w-[1rem]" aria-hidden="true" />
        {pestana.boton}
      </a>
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

const ESCENAS = {
  inicio: EscenaInicio,
  servicios: EscenaServicios,
  sobremi: EscenaSobreMi,
  contacto: EscenaContacto,
}

export default function HeroRetrato({ hero, nombre }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const { parar } = useVueltaPestanas(pestanas, setActiva)

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="relative flex flex-1 flex-col overflow-hidden bg-neutral-900 text-white" onPointerDown={parar}>
      <Img src={hero.fondo} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_65%]" />
      <div className="pointer-events-none absolute inset-0 bg-black/70" />

      {/* Retrato, nombre y profesión */}
      <div className="relative flex items-center gap-[0.8rem] px-[1.25rem] pt-[1rem]">
        <Img
          src={hero.retrato}
          alt={nombre}
          className="h-[3.4rem] w-[3.4rem] shrink-0 rounded-full object-cover ring-2 ring-demo-primary ring-offset-2 ring-offset-black/0"
        />
        <div className="leading-tight">
          <p className="font-demo-heading text-[1.35rem] font-bold">{nombre}</p>
          <p className="text-[0.85rem] text-white/75">{hero.profesion}</p>
        </div>
      </div>

      {/* Lo que cambia con cada pestaña: ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mb-[1rem] mt-[0.8rem] min-h-[10rem] flex-1">
        {pestanas.map((p, i) => {
          const Escena = ESCENAS[p.tipo]
          return (
            <div
              key={p.tipo}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-all duration-500 ${i === activa ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[0.5rem] opacity-0'}`}
            >
              <Escena pestana={p} nombre={nombre} />
            </div>
          )
        })}
      </div>

      {/* Barra de pestañas tipo app, propia de este diseño */}
      <div className="relative flex border-t border-white/15 bg-black/40 backdrop-blur-sm">
        {pestanas.map((p, i) => {
          const Icono = ICONOS[p.tipo]
          return (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => setActiva(i)}
              className={`flex flex-1 flex-col items-center gap-[0.2rem] py-[0.55rem] text-[0.75rem] font-medium transition-colors duration-300 ${
                i === activa ? 'text-demo-primary' : 'text-white/55 hover:text-white'
              }`}
            >
              {Icono && <Icono className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />}
              {p.texto}
            </button>
          )
        })}
      </div>
    </div>
  )
}
