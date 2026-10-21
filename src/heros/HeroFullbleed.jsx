import { useEffect, useMemo, useState } from 'react'
import TextoInicio from '../components/TextoInicio'
import CtaPortada from '../components/CtaPortada'
import NombreMarca from '../components/NombreMarca'
import { Phone } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { disposicionDe } from '../lib/disposiciones'
import { degradadoFiltro, useFiltro } from '../components/ColoresPortada'

/* Fullbleed (adaptado de platform). Foto a todo el ancho con velo oscuro y la marca arriba.
   Pestañas en una barra segmentada (solo cambian al tocarlas):
   - disenos: las fotos pasan solas con fundido y zoom lento; encima, el titular y la carta de esmaltes
     (el primero sale elegido; al tocar otro, la primera línea del titular toma su color).
   - ubicacion: el mapa (se carga la primera vez que se toca) con el contacto encima.
   - horario: foto fija con el horario encima.
   - cita: foto fija con un botón para pedir cita.
   Hero por piezas: conserva sus escenas propias para las pestañas comunes (fotos, horario, contacto, ubicación)
   y usa la pieza común para precios; la barra es una pieza (hero.barra; la suya, la segmentada). Los esmaltes
   solo salen si la pestaña de fotos los trae (Laca).
   hero: barra?, titulo?, destacado?, pestanas[{ tipo, texto, ... }] */

const TURNO_MS = 4500

function Velo() {
  const filtro = useFiltro()
  return (
    <div
      style={filtro.activo ? { backgroundImage: degradadoFiltro(filtro.color ?? 'var(--demo-text)', [90, 45], filtro.intensidad) } : undefined}
      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-demo-text/90 via-demo-text/45 to-demo-text/15"
    />
  )
}

function Abajo({ children }) {
  return <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">{children}</div>
}

function EscenaDisenos({ pestana, activa, titular }) {
  // Las fotos de cualquier demo (fotos u opciones)
  const fotos = fotosDe(pestana)
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
          <span className="transition-colors duration-500" style={{ color: tinte }}>{titular.titulo}</span>
          {titular.destacado && (
            <>
              <br />
              <em className="font-normal italic">{titular.destacado}</em>
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

function EscenaHorario({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <Abajo>
        <p className="font-demo-heading text-[2rem] italic leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.5rem] grid gap-[0.15rem] text-[0.9rem]">
          {(pestana.lineas ?? []).map(l => (
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

function EscenaCita({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      {/* La foto de cita es clara: un velo más para que se lean el botón y el teléfono */}
      <div className="pointer-events-none absolute inset-0 bg-demo-text/35" />
      <Abajo>
        <p className="font-demo-heading text-[2rem] italic leading-none">{pestana.titulo}</p>
        {pestana.texto_encargo && <p className="mt-[0.35rem] max-w-[18rem] text-[0.85rem] leading-[1.35] text-white/85">{pestana.texto_encargo}</p>}
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
            {pestana.texto_telefono ?? 'o por teléfono'}
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </Abajo>
    </>
  )
}

// Sus escenas propias, por tipo común (las demás, como precios, salen con la pieza común)
const ESCENAS = {
  fotos: EscenaDisenos,
  horario: EscenaHorario,
  contacto: EscenaCita,
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
// La disposición del texto sobre la foto (hero.disposicion) solo cuenta en la portada de una miniweb
export default function HeroFullbleed({ hero, nombre, sinBarra = false, inicio, irA }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const respaldo = fotoDeRespaldo(pestanas)
  // Titular: el de la pestaña de fotos (Laca) o el del hero (otras demos)
  const deFotos = pestanas.find(p => tipoComun(p.tipo) === 'fotos')
  const titular = { titulo: deFotos?.titulo ?? hero.titulo, destacado: deFotos?.destacado ?? hero.destacado ?? hero.brillo }
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
  // Como en Cortes: en una miniweb, el botón, compartir y la frase extra van arriba, bajo el nombre, y abajo solo el titular y la descripción
  const ctaArriba = Boolean(sinBarra && inicio?.boton && inicio?.botonA)
  const disposicion = disposicionDe(hero.disposicion)
  // El filtro que oscurece la foto bajo el texto: intensidad y color regulables (hero.filtro y hero.colores.filtroFoto)
  const filtro = useFiltro()
  const degradadoTexto =
    filtro.activo && ['clasica', 'velo'].includes(disposicion.clave)
      ? { backgroundImage: degradadoFiltro(filtro.color ?? (disposicion.clave === 'velo' ? 'var(--demo-header)' : '#000000'), [85, 55], filtro.intensidad) }
      : undefined

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className={`relative min-h-[14rem] flex-1 overflow-hidden bg-demo-text ${sinBarra ? disposicion.foto : ''}`}>
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
                <EscenaUbicacion pestana={p} cargar={mapaPedido} />
              ) : Propia ? (
                <Propia pestana={p} activa={i === activa && !enVuelta} respaldo={respaldo} titular={titular} />
              ) : (
                <Escena pestana={p} forma="foto" info="abajo" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
              )}
            </div>
          )
        })}

        {sinBarra && disposicion.velo && <div className={`pointer-events-none absolute inset-0 ${disposicion.velo}`} />}

        {/* Marca arriba y, a la derecha, compartir (en el mapa se desvanecen) */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 px-[1.25rem] pt-[1rem] text-white transition-opacity duration-700 ${ctaArriba ? 'bg-gradient-to-b from-black/60 via-black/30 to-transparent pb-[1.6rem]' : ''} ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-wrap items-center justify-between">
            <p className={`font-demo-heading leading-none ${sinBarra ? 'text-[2.1rem]' : 'text-[1.5rem]'}`}><NombreMarca nombre={nombre} tamano={sinBarra ? 'grande' : 'normal'} /></p>
            {!enMapa && <BotonCompartir titulo={nombre} className="pointer-events-auto" />}
          </div>
          {ctaArriba && !enMapa && <CtaPortada inicio={inicio} irA={irA} nombre={nombre} className="pointer-events-auto mt-[0.7rem]" />}
        </div>

        {/* Portada de una miniweb: el texto de Inicio (texto grande, pequeño y el botón) encima de la foto, abajo, sobre un degradado oscuro para que se lea */}
        {sinBarra && (
          <TextoInicio inicio={inicio} irA={irA} nombre={nombre} sinBoton={ctaArriba} color="text-white" className={disposicion.texto} estilo={degradadoTexto} />
        )}
      </div>

      {!sinBarra && (
        <div className="px-[1.25rem] pt-[0.9rem]">
          <BarraPestanas estilo={hero.barra ?? 'segmentada'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}
    </div>
  )
}
