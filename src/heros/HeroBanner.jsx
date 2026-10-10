import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import Img from '../components/Img'

/* Banner (adaptado del de Señorío en platform). Arriba la foto, con la marca encima;
   debajo un bloque del color principal con el titular en mayúsculas y las pestañas.
   Pestañas (solo cambian al tocarlas):
   - plats: las fotos pasan solas con fundido, con un indicador de pasos abajo a la derecha.
   - onsom: el mapa (se carga la primera vez que se toca); la dirección va en el titular.
   - horari: foto fija con el horario encima.
   - comanda: foto fija con el teléfono para llamar y, si hay, WhatsApp.
   El titular del bloque cambia con cada pestaña (titular: [primera línea, segunda línea]).
   hero: siglas, pestanas[{ tipo, texto, titular, ... }] */

const TURNO_MS = 4500

function Velo() {
  return <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
}

function Abajo({ children }) {
  return <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">{children}</div>
}

function EscenaPlats({ pestana, activa }) {
  const fotos = pestana.fotos ?? []
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
          <Img src={f.src} alt={f.alt ?? ''} className="h-full w-full object-cover" />
        </div>
      ))}
      {fotos.length > 1 && (
        <div className="absolute bottom-[0.9rem] right-[1.25rem] flex gap-[0.35rem]">
          {fotos.map((_, i) => (
            <span
              key={i}
              className={`h-[0.18rem] rounded-full transition-all duration-500 ${i === actual ? 'w-[2.25rem] bg-white' : 'w-[1rem] bg-white/45'}`}
            />
          ))}
        </div>
      )}
    </>
  )
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
  ) : null
}

function EscenaHorari({ pestana }) {
  return (
    <>
      <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <Abajo>
        <p className="font-demo-heading text-[1.6rem] uppercase leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.45rem] grid gap-[0.1rem] text-[0.85rem]">
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

function EscenaComanda({ pestana }) {
  return (
    <>
      <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <Abajo>
        <div className="flex flex-wrap items-center gap-x-[1rem] gap-y-[0.4rem]">
          <a
            href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-[0.45rem] rounded-full bg-white px-[1rem] py-[0.5rem] text-[1rem] font-semibold text-demo-primary"
          >
            <Phone className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
            {pestana.telefono}
          </a>
          {pestana.whatsapp && (
            <a href={pestana.whatsapp} target="_blank" rel="noreferrer" className="text-[0.8rem] text-white/85 underline underline-offset-[0.2em]">
              {pestana.texto_whatsapp}
            </a>
          )}
        </div>
      </Abajo>
    </>
  )
}

const ESCENAS = {
  plats: EscenaPlats,
  horari: EscenaHorari,
  comanda: EscenaComanda,
}

export default function HeroBanner({ hero, nombre, lema }) {
  const pestanas = hero.pestanas ?? []
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(false)

  const tocar = i => {
    setActiva(i)
    if (pestanas[i].tipo === 'onsom') setMapaPedido(true)
  }

  const enMapa = pestanas[activa]?.tipo === 'onsom'

  return (
    <div className="flex flex-1 flex-col">
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative min-h-[9rem] flex-1 overflow-hidden bg-demo-primary">
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
                : <Escena pestana={p} activa={i === activa} />}
            </div>
          )
        })}

        {/* Marca arriba: sello con las siglas, nombre y lema (en el mapa se desvanece) */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-center gap-[0.6rem] bg-gradient-to-b from-black/50 to-transparent px-[1.25rem] pb-[2rem] pt-[0.9rem] text-white transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          <span className="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-full bg-demo-accent font-demo-heading text-[0.95rem] text-white">
            {hero.siglas}
          </span>
          <div className="leading-tight">
            <p className="font-demo-heading text-[1rem]">{nombre}</p>
            {lema && <p className="text-[0.8rem] text-white/80">{lema}</p>}
          </div>
        </div>
      </div>

      {/* Bloque de color con el titular y las pestañas */}
      <div className="bg-demo-primary px-[1.25rem] pb-[1.1rem] pt-[1.1rem] text-demo-bg">
        {/* El titular cambia con la pestaña (fundido); todos ocupan el mismo hueco */}
        <h1 className="grid font-demo-heading text-[clamp(2rem,1.6rem+2vw,2.6rem)] uppercase leading-[1]" aria-live="polite">
          {pestanas.map((p, i) => (
            <span
              key={p.tipo}
              aria-hidden={i !== activa}
              className={`col-start-1 row-start-1 transition-opacity duration-500 ${i === activa ? 'opacity-100 delay-200' : 'opacity-0'}`}
            >
              {p.titular[0]}
              <br />
              {p.titular[1]}
            </span>
          ))}
        </h1>
        <div className="mt-[0.9rem] grid grid-cols-4 gap-[0.4rem]">
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              className={`rounded-full border py-[0.55rem] text-[0.8rem] font-semibold transition-colors duration-300 ${
                i === activa ? 'border-demo-bg bg-demo-bg text-demo-primary' : 'border-demo-bg/40 text-demo-bg hover:border-demo-bg'
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
