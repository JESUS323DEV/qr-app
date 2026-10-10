import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import Img from '../components/Img'

/* Showcase con polaroid (adaptado de platform). Fondo claro: arriba la marca y el titular,
   y debajo una foto impresa, inclinada y con cinta, que hace de escenario de cada pestaña.
   El pie de la polaroid cambia con lo que enseña. Pestañas (solo cambian al tocarlas):
   - plats: las fotos pasan solas con fundido; el pie es el nombre de cada foto.
   - onsom: el mapa (se carga la primera vez que se toca); el pie es la dirección.
   - horari: una nota con el horario.
   - comanda: el teléfono grande para llamar y, si hay, WhatsApp.
   hero: titulo (primera línea), antes, palabra (en cursiva), final, pestanas[{ tipo, texto, pie, ... }] */

const TURNO_MS = 4500

function EscenaPlats({ pestana, activa, setPie }) {
  const fotos = pestana.fotos ?? []
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const id = setInterval(() => setActual(i => (i + 1) % fotos.length), TURNO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  useEffect(() => {
    if (activa) setPie(fotos[actual]?.pie ?? '')
  }, [activa, actual])

  return fotos.map((f, i) => (
    <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
      <Img src={f.src} alt={f.pie ?? ''} className="h-full w-full object-cover" />
    </div>
  ))
}

function EscenaOnSom({ pestana, cargar }) {
  return cargar ? (
    <iframe
      title="Mapa"
      src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
      className="absolute inset-0 h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  ) : (
    <div className="absolute inset-0 bg-demo-surface" />
  )
}

function EscenaHorari({ pestana }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-[0.6rem] bg-demo-surface px-[1rem] text-center">
      {pestana.lineas.map(l => (
        <div key={l.dias}>
          <p className="text-[0.78rem] text-demo-muted">{l.dias}</p>
          <p className="font-demo-heading text-[1.05rem] leading-tight">{l.horas}</p>
        </div>
      ))}
    </div>
  )
}

function EscenaComanda({ pestana }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.7rem] bg-demo-primary px-[1rem] text-center text-demo-bg">
      <p className="text-[0.85rem] text-demo-bg/75">{pestana.texto_llamada}</p>
      <a
        href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
        className="flex items-center gap-[0.5rem] rounded-full bg-demo-bg px-[1.1rem] py-[0.6rem] font-demo-heading text-[1.25rem] text-demo-primary"
      >
        <Phone className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        {pestana.telefono}
      </a>
      {pestana.whatsapp && (
        <a href={pestana.whatsapp} target="_blank" rel="noreferrer" className="text-[0.8rem] text-demo-bg/80 underline underline-offset-[0.2em]">
          {pestana.texto_whatsapp}
        </a>
      )}
    </div>
  )
}

const ESCENAS = {
  plats: EscenaPlats,
  horari: EscenaHorari,
  comanda: EscenaComanda,
}

export default function HeroShowcase({ hero, nombre, lema }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)
  const [piePlats, setPiePlats] = useState('')

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'onsom') setMapaPedido(true)
  }

  const actual = pestanas[activa]
  const pie = actual?.tipo === 'plats' ? piePlats : actual?.pie

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-[1.25rem] pt-[1rem]">
        <div className="flex items-baseline justify-between gap-[1rem]">
          <p className="font-demo-heading text-[1.05rem] font-semibold">{nombre}</p>
          {lema && <p className="text-[0.78rem] text-demo-muted">{lema}</p>}
        </div>
        <h1 className="mt-[0.75rem] font-demo-heading text-[clamp(2.2rem,1.7rem+2.4vw,2.8rem)] leading-[0.95]">
          {hero.titulo}
          <br />
          {hero.antes}<em className="italic">{hero.palabra}</em>{hero.final}
        </h1>
      </div>

      {/* La polaroid ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative min-h-[13rem] flex-1">
        <div className="absolute left-1/2 top-[1.1rem] flex aspect-[5/6] h-[calc(100%-2.2rem)] max-w-[calc(100%-2.5rem)] -translate-x-1/2 rotate-[3deg] flex-col bg-white p-[0.55rem] pb-[0.4rem] shadow-[0_1.25rem_2.5rem_-1rem_rgb(0_0_0/0.35)]">
          <div className="absolute -top-[0.7rem] left-1/2 z-10 h-[1.4rem] w-[5.5rem] -translate-x-1/2 -rotate-3 bg-demo-accent/40" />
          <div className="relative flex-1 overflow-hidden">
            {pestanas.map((p, i) => {
              const Escena = ESCENAS[p.tipo]
              return (
                <div
                  key={p.tipo}
                  aria-hidden={i !== activa}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                  {p.tipo === 'onsom'
                    ? <EscenaOnSom pestana={p} cargar={mapaPedido} />
                    : <Escena pestana={p} activa={i === activa} setPie={setPiePlats} />}
                </div>
              )
            })}
          </div>
          <p className="truncate pt-[0.4rem] text-center font-demo-heading text-[0.95rem] text-demo-text/70">{pie}</p>
        </div>
      </div>

      {/* Pestañas con un punto bajo la activa, propias de este diseño */}
      <div className="flex px-[1.25rem]">
        {pestanas.map((p, i) => (
          <button
            key={p.tipo}
            type="button"
            aria-pressed={i === activa}
            onClick={() => tocar(i)}
            className={`relative flex-1 pb-[0.7rem] pt-[0.2rem] text-[0.88rem] font-semibold transition-colors duration-300 ${
              i === activa ? 'text-demo-primary' : 'text-demo-muted hover:text-demo-text'
            }`}
          >
            {p.texto}
            <span
              className={`absolute bottom-[0.15rem] left-1/2 h-[0.35rem] w-[0.35rem] -translate-x-1/2 rounded-full bg-demo-accent transition-opacity duration-300 ${
                i === activa ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
