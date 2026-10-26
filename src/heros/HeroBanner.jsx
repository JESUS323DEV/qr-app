import Turnos from '../components/Turnos'
import { useEffect, useMemo, useState } from 'react'
import TextoInicio from '../components/TextoInicio'
import NombreMarca from '../components/NombreMarca'
import { Phone } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Banner (adaptado del de Señorío en platform). Arriba la foto, con la marca encima;
   debajo un bloque del color principal con el titular en mayúsculas y las pestañas.
   Pestañas (solo cambian al tocarlas):
   - plats: las fotos pasan solas con fundido, con un indicador de pasos abajo a la derecha.
   - onsom: el mapa (se carga la primera vez que se toca); la dirección va en el titular.
   - horari: foto fija con el horario encima.
   - comanda: foto fija con el teléfono para llamar y, si hay, WhatsApp.
   El titular del bloque cambia con cada pestaña (titular: [primera línea, segunda línea]).
   Hero por piezas: conserva sus escenas propias para las pestañas comunes (fotos, horario, contacto, ubicación)
   y usa la pieza común para precios; la barra es una pieza (hero.barra; la suya, los bloques sobre el color).
   Con datos de otras demos (sin titular), el titular es el título de la pestaña y su segunda línea; sin siglas,
   las iniciales del nombre.
   hero: siglas?, barra?, pestanas[{ tipo, texto, titular?, ... }] */

const TURNO_MS = 4500

function Velo() {
  return <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
}

function Abajo({ children }) {
  return <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">{children}</div>
}

function EscenaPlats({ pestana, activa }) {
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

function EscenaHorari({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <Abajo>
        <p className="font-demo-heading text-[1.6rem] uppercase leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.45rem] grid gap-[0.1rem] text-[0.85rem]">
          {(pestana.lineas ?? []).map(l => (
            <div key={l.dias} className="flex flex-wrap gap-x-[0.5rem]">
              <dt className="whitespace-nowrap font-semibold">{l.dias}</dt>
              <dd className="whitespace-nowrap text-white/80"><Turnos horas={l.horas} /></dd>
            </div>
          ))}
        </dl>
      </Abajo>
    </>
  )
}

// Contacto: llamar (El Pollastre) o, en otras demos, su botón de WhatsApp (cita, encargos, reservar)
function EscenaComanda({ pestana, respaldo }) {
  const conBoton = Boolean(pestana.url && pestana.boton)
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <Abajo>
        <div className="flex flex-wrap items-center gap-x-[1rem] gap-y-[0.4rem]">
          {conBoton && (
            <a
              href={pestana.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-white px-[1rem] py-[0.5rem] text-[1rem] font-semibold text-demo-primary"
            >
              {pestana.boton}
            </a>
          )}
          {pestana.telefono && (
            <a
              href={`tel:${pestana.telefono.replace(/\s/g, '')}`}
              className={
                conBoton
                  ? 'inline-flex items-center gap-[0.35rem] text-[0.85rem] text-white/85'
                  : 'inline-flex items-center gap-[0.45rem] rounded-full bg-white px-[1rem] py-[0.5rem] text-[1rem] font-semibold text-demo-primary'
              }
            >
              <Phone className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              {pestana.telefono}
            </a>
          )}
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

// Sus escenas propias, por tipo común (las demás, como precios, salen con la pieza común)
const ESCENAS = {
  fotos: EscenaPlats,
  horario: EscenaHorari,
  contacto: EscenaComanda,
}

// Titular del bloque de color: el propio (El Pollastre) o, con datos de otras demos, título y segunda línea
const titularDe = (p, nombre) =>
  p.titular ?? (tipoComun(p.tipo) === 'ubicacion' ? [p.texto, p.direccion] : [p.titulo ?? nombre, p.destacado ?? p.texto])

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroBanner({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const respaldo = fotoDeRespaldo(pestanas)
  const siglas = hero.siglas ?? (nombre ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  const [activa, setActiva] = useState(0)
  // El mapa se carga desde el principio, en segundo plano, para que esté listo cuando la vuelta llegue a él
  const [mapaPedido, setMapaPedido] = useState(true)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  const enMapa = tipoComun(pestanas[activa]?.tipo) === 'ubicacion'

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative min-h-[9rem] flex-1 overflow-hidden bg-demo-header">
        {pestanas.map((p, i) => {
          const tipo = tipoComun(p.tipo)
          const Propia = ESCENAS[tipo]
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {tipo === 'ubicacion' ? (
                <EscenaOnSom pestana={p} cargar={mapaPedido} />
              ) : Propia ? (
                <Propia pestana={p} activa={i === activa && !enVuelta} respaldo={respaldo} />
              ) : (
                <Escena pestana={p} forma="foto" info="abajo" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
              )}
            </div>
          )
        })}

        {/* Marca arriba: sello con las siglas, nombre y lema (en el mapa se desvanece) */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-center gap-[0.6rem] bg-gradient-to-b from-black/50 to-transparent px-[1.25rem] pb-[2rem] pt-[0.9rem] text-white transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          <span className="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-full bg-demo-accent font-demo-heading text-[0.95rem] text-white">
            {siglas}
          </span>
          <div className="leading-tight">
            <p className="font-demo-heading text-[1rem]"><NombreMarca nombre={nombre} tamano="pequeno" /></p>
            {lema && <p className="text-[0.8rem] text-white/80">{lema}</p>}
          </div>
          {/* Compartir, arriba a la derecha; en todas las pestañas menos en la del mapa ("Compartir" es igual en catalán) */}
          {!enMapa && <BotonCompartir titulo={nombre} className="pointer-events-auto ml-auto shrink-0" />}
        </div>
      </div>

      {/* Bloque de color con el titular y las pestañas */}
      <div className="bg-demo-header px-[1.25rem] pb-[1.1rem] pt-[1.1rem] text-demo-bg">
        {/* El titular cambia con la pestaña (fundido); todos ocupan el mismo hueco */}
        {inicio && (inicio.titular?.length || inicio.descripcion) ? (
          <TextoInicio inicio={inicio} irA={irA} />
        ) : (
        <h1 className="grid font-demo-heading text-[clamp(2rem,1.6rem+2vw,2.6rem)] uppercase leading-[1]" aria-live="polite">
          {pestanas.map((p, i) => {
            const titular = titularDe(p, nombre)
            return (
              <span
                key={`${p.tipo}-${i}`}
                aria-hidden={i !== activa}
                className={`col-start-1 row-start-1 transition-opacity duration-500 ${i === activa ? 'opacity-100 delay-200' : 'opacity-0'}`}
              >
                {titular[0]}
                {titular[1] && (
                  <>
                    <br />
                    {titular[1]}
                  </>
                )}
              </span>
            )
          })}
        </h1>
        )}
        {/* Barra de pestañas (pieza); la suya, bloques rectos sobre el color */}
        {!sinBarra && (
          <div className="mt-[0.9rem]">
            <BarraPestanas estilo={hero.barra ?? 'bloques'} pestanas={pestanas} activa={activa} tocar={tocar} sobre="primario" />
          </div>
        )}
      </div>
    </div>
  )
}
