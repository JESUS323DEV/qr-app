import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import Img from '../components/Img'

/* Mosaico (inspirado en el Split de Dulce Lima en platform). Fondo claro: arriba la marca y el titular,
   con un brillo suave en la segunda línea; en el centro un mosaico de tres fotos (una grande y dos pequeñas)
   que van rotando en cascada como un escaparate. Pestañas con un subrayado ondulado bajo la activa.
   Pestañas (solo cambian al tocarlas):
   - dulces: el mosaico de fotos, cada una con su etiqueta.
   - ubicacion: el mapa (se carga la primera vez que se toca) con la dirección encima.
   - horario: una tarjeta con el horario.
   - encargos: una tarjeta con el texto del encargo, WhatsApp y, si hay, teléfono.
   hero: titulo, brillo (segunda línea), pestanas[{ tipo, texto, ... }] */

const TURNO_MS = 4000
const CASILLAS = ['row-span-2', '', '']

function EscenaDulces({ pestana, activa }) {
  const fotos = pestana.fotos ?? []
  const [desfase, setDesfase] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 4) return
    const id = setInterval(() => setDesfase(d => (d + 1) % fotos.length), TURNO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] grid-rows-2 gap-[0.5rem]">
      {CASILLAS.map((clase, k) => {
        const visible = (desfase + k) % fotos.length
        return (
          <div key={k} className={`relative overflow-hidden rounded-[1.1rem] bg-demo-surface ${clase}`}>
            {fotos.map((f, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === visible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${k * 180}ms` }}
              >
                <Img src={f.src} alt={f.etiqueta} className="h-full w-full object-cover" />
                <span className="absolute bottom-[0.5rem] left-[0.5rem] rounded-full bg-white/90 px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold text-demo-text">
                  {f.etiqueta}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function EscenaUbicacion({ pestana, cargar }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[1.1rem] bg-demo-surface">
      {cargar && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <span className="absolute bottom-[0.6rem] left-[0.6rem] max-w-[calc(100%-1.2rem)] rounded-full bg-white/90 px-[0.75rem] py-[0.25rem] text-[0.75rem] font-semibold text-demo-text">
        {pestana.direccion}
      </span>
    </div>
  )
}

function EscenaHorario({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-[1.1rem] bg-demo-surface px-[1.25rem]">
      <p className="font-demo-heading text-[1.6rem] italic">{pestana.titulo}</p>
      <dl className="mt-[0.6rem] grid gap-[0.35rem] text-[0.9rem]">
        {pestana.lineas.map(l => (
          <div key={l.dias} className="flex flex-wrap justify-between gap-x-[0.75rem] border-b border-demo-text/10 pb-[0.35rem]">
            <dt className="font-semibold">{l.dias}</dt>
            <dd className="text-demo-muted">{l.horas}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function EscenaEncargos({ pestana }) {
  return (
    <div className="flex h-full flex-col items-start justify-center rounded-[1.1rem] bg-demo-primary px-[1.25rem] py-[1.1rem] text-white">
      <p className="font-demo-heading text-[1.35rem] italic leading-tight">{pestana.titulo}</p>
      <p className="mt-[0.25rem] text-[0.8rem] leading-[1.35] text-white/80">{pestana.texto_encargo}</p>
      <a
        href={pestana.url}
        target="_blank"
        rel="noreferrer"
        className="mt-[0.6rem] inline-flex min-h-[2.2rem] items-center rounded-full bg-white px-[1rem] text-[0.82rem] font-semibold text-demo-primary"
      >
        {pestana.boton}
      </a>
      {pestana.telefono && (
        <a
          href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
          className="mt-[0.45rem] flex items-center gap-[0.35rem] text-[0.75rem] text-white/85"
        >
          {pestana.texto_telefono ?? 'o por teléfono'}
          <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
          <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
        </a>
      )}
    </div>
  )
}

const ESCENAS = {
  dulces: EscenaDulces,
  horario: EscenaHorario,
  encargos: EscenaEncargos,
}

// Subrayado ondulado de la pestaña activa
function Onda({ visible }) {
  return (
    <svg
      viewBox="0 0 40 6"
      preserveAspectRatio="none"
      className={`absolute bottom-0 left-1/2 h-[0.4rem] w-[2.6rem] -translate-x-1/2 text-demo-accent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <path d="M1 3 Q 5.75 0 10.5 3 T 20 3 T 29.5 3 T 39 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function HeroMosaico({ hero, nombre, lema }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'ubicacion') setMapaPedido(true)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-[1.25rem] pt-[1rem]">
        <div className="flex items-baseline justify-between gap-[1rem]">
          <p className="font-demo-heading text-[1.05rem] font-semibold text-demo-primary">{nombre}</p>
          {lema && <p className="text-[0.78rem] text-demo-muted">{lema}</p>}
        </div>
        <h1 className="mt-[0.6rem] font-demo-heading text-[clamp(2.2rem,1.7rem+2.4vw,2.8rem)] font-semibold leading-[1.02]">
          {hero.titulo}
          <br />
          <em className="font-normal italic [text-shadow:0_0_1.4rem_color-mix(in_srgb,var(--demo-accent)_45%,transparent)]">{hero.brillo}</em>
        </h1>
      </div>

      {/* El escaparate ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mt-[0.9rem] min-h-[8rem] flex-1">
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
      </div>

      {/* Pestañas con subrayado ondulado, propias de este diseño */}
      <div className="mt-[0.4rem] flex px-[1.25rem]">
        {pestanas.map((p, i) => (
          <button
            key={p.tipo}
            type="button"
            aria-pressed={i === activa}
            onClick={() => tocar(i)}
            className={`relative flex-1 pb-[0.65rem] pt-[0.45rem] text-[0.88rem] font-semibold transition-colors duration-300 ${
              i === activa ? 'text-demo-text' : 'text-demo-muted hover:text-demo-text'
            }`}
          >
            {p.texto}
            <Onda visible={i === activa} />
          </button>
        ))}
      </div>
    </div>
  )
}
