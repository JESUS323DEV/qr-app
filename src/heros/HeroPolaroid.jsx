import { useContext, useEffect, useMemo, useState } from 'react'
import { CompartirJuntoAlBoton } from '../components/BotonCompartir'
import NombreMarca from '../components/NombreMarca'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import { loadFont } from '../lib/applyTheme'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { ColoresMiniweb, esClaroHex, useFondoBoton, useRol } from '../components/ColoresPortada'
import { montajeDe } from '../lib/montajes'

/* Polaroid (inspirado en la carta Polaroid de Forno Nonna). Hero por piezas: acepta cualquier pestaña común y
   cualquier barra (hero.barra; la suya son las pastillas, sobre el color de la marca).
   Fondo del color fuerte de la marca (primary), con el nombre escrito a mano arriba. En la pestaña de fotos, las
   fotos como polaroids pegadas un poco torcidas, de dos en dos, con su nombre a mano debajo; al tocar una se abre
   grande y recta. Las demás pestañas (horario, contacto, ubicación, precios) van en una nota de papel pegada,
   también un poco torcida.
   La letra a mano es Caveat, siempre: es parte del diseño, no de la marca.
   hero: barra?, pestanas[{ tipo, texto, ... }] */

const A_MANO = '"Caveat", "Comic Sans MS", cursive'
const FUENTE = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'

// Inclinación de cada polaroid según su sitio, para que parezcan pegadas a mano
const GIROS = ['-rotate-[2.5deg]', 'rotate-[2deg]', 'rotate-[1.5deg]', '-rotate-[2deg]']
// Inclinación (en grados) de cada foto del montón según su puesto: la de arriba casi recta y las de atrás torcidas
const PUESTOS_MONTON = [1, -6, 6]
const SOMBRA ='shadow-[0_0.5rem_1.2rem_-0.3rem_rgb(0_0_0/0.45)]'

function Polaroid({ foto, giro, abrir }) {
  return (
    <button
      type="button"
      onClick={abrir}
      className={`flex h-full min-h-0 w-full flex-col bg-white p-[0.35rem] pb-0 text-left text-[#2A211C] transition-transform duration-200 hover:rotate-0 hover:scale-[1.03] ${SOMBRA} ${giro}`}
    >
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-black/5">
        <Img src={foto.src} alt={foto.alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <span className="block truncate px-[0.15rem] pb-[0.2rem] pt-[0.05rem] text-[1.05rem] font-bold leading-tight" style={{ fontFamily: A_MANO }}>
        {foto.etiqueta ?? ' '}
      </span>
    </button>
  )
}

// La polaroid tocada, grande y recta; se cierra tocando fuera, con la X o con Escape
function PolaroidAbierta({ foto, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-[1.5rem]" onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-label={foto.etiqueta ?? 'Foto'} onClick={e => e.stopPropagation()} className={`relative w-full max-w-[22rem] bg-white p-[0.6rem] text-[#2A211C] ${SOMBRA}`}>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="absolute -right-[0.7rem] -top-[0.7rem] z-10 rounded-full bg-white p-[0.35rem] shadow-[0_0.2rem_0.6rem_rgb(0_0_0/0.3)]">
          <X className="h-[1.1rem] w-[1.1rem]" />
        </button>
        <div className="relative aspect-square w-full overflow-hidden">
          <Img src={foto.src} alt={foto.alt} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        {foto.etiqueta && (
          <p className="px-[0.3rem] pb-[0.3rem] pt-[0.4rem] text-[1.9rem] font-bold leading-none" style={{ fontFamily: A_MANO }}>
            {foto.etiqueta}
          </p>
        )}
      </div>
    </div>
  )
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroPolaroid({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  const rolSub = useRol('subtitulo')
  const rolTitular = useRol('titular')
  const rolDescripcion = useRol('descripcion')
  // El texto sin color propio va en blanco u oscuro según el fondo de la portada (el elegido o, sin él, el color de cabecera)
  const { colores: coloresMini, cabecera } = useContext(ColoresMiniweb)
  const fondoHero = coloresMini?.fondoPortada ?? hero.fondoInicio ?? cabecera
  const textoAuto = fondoHero && esClaroHex(fondoHero) ? '#141414' : '#FFFFFF'
  const rolBoton = useRol('boton')
  const fondoBoton = useFondoBoton()
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(true)
  const [abierta, setAbierta] = useState(null)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)
  const respaldo = fotoDeRespaldo(pestanas)
  // En una miniweb con texto de Inicio: el titular, la descripción y el botón debajo de las polaroids
  const textoMiniweb = Boolean(sinBarra && (inicio?.titular?.length || inicio?.descripcion))

  // El montaje (hero.montaje): cómo se colocan las polaroids y dónde va el texto
  const montaje = montajeDe(hero.montaje)
  // En el montón: la foto de arriba (cima) y, mientras sale volando, hacia qué lado (1 derecha, -1 izquierda)
  const [cima, setCima] = useState(0)
  const [saliendo, setSaliendo] = useState(0)
  const pasarMonton = (paso, n) => {
    if (saliendo) return
    if (paso > 0) {
      // La de arriba sale volando y, al acabar, pasa al fondo
      setSaliendo(1)
      setTimeout(() => {
        setCima(c => (c + 1) % n)
        setSaliendo(0)
      }, 300)
    } else {
      setCima(c => (c - 1 + n) % n)
    }
  }
  // Titular, descripción y botón, sobre el fondo de la cabecera: debajo de las polaroids o, en 'arriba', encima
  const textoInicio = clase => (
    <div className={clase}>
      {inicio.titular?.length > 0 && (
        <h2 style={rolTitular} className="font-demo-heading text-[clamp(1.7rem,1.4rem+1.6vw,2.1rem)] font-bold leading-[1.05]">
          {inicio.titular.map((l, i) => (
            <span key={i} className="block">{l}</span>
          ))}
        </h2>
      )}
      {inicio.descripcion && <p style={rolDescripcion} className="mt-[0.4rem] max-w-[22rem] text-[0.88rem] leading-[1.4] opacity-85">{inicio.descripcion}</p>}
      {inicio.boton && inicio.botonA && (
        <div className="mt-[0.65rem] flex flex-wrap items-center gap-[0.75rem]">
          <button
            type="button"
            onClick={() => irA?.(inicio.botonA)}
            style={{ ...rolBoton, ...fondoBoton }} className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
          >
            {inicio.boton}
          </button>
          <CompartirJuntoAlBoton titulo={nombre} />
        </div>
      )}
    </div>
  )

  useEffect(() => loadFont(FUENTE), [])

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col bg-demo-header" style={{ color: textoAuto }} onPointerDown={parar}>
      {/* Nombre a mano y lema; compartir a la derecha */}
      <div className="flex items-start justify-between gap-[1rem] px-[1.25rem] pt-[0.8rem]">
        <div className="min-w-0">
          <h1 className="text-[clamp(2.2rem,1.8rem+2vw,2.8rem)] font-bold leading-[0.85]" style={{ fontFamily: A_MANO }}>
            <NombreMarca nombre={nombre} tamano="grande" />
          </h1>
          {lema && <p style={rolSub} className="mt-[0.2rem] text-[0.85rem] opacity-80">{lema}</p>}
        </div>
        <BotonCompartir titulo={nombre} className="mt-[0.4rem] shrink-0" />
      </div>

      {textoMiniweb && montaje.textoArriba && textoInicio('px-[1.25rem] pt-[0.8rem]')}

      {/* Lo que cambia con cada pestaña: ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mt-[0.7rem] min-h-[9rem] flex-1">
        {pestanas.map((p, i) => {
          const fotos = tipoComun(p.tipo) === 'fotos' ? fotosDe(p).slice(0, 4) : null
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {fotos && sinBarra && montaje.monton ? (
                // Las fotos apiladas: la de arriba recta, las otras asomando torcidas por detrás. Con las flechas, la de arriba
                // sale volando a un lado y pasa al fondo (o vuelve desde el fondo); las demás suben un puesto
                <div className="relative h-full">
                  {fotos.map((f, k) => {
                    const n = fotos.length
                    const puesto = (k - cima + n) % n
                    const sale = saliendo && puesto === 0
                    const estilo = sale
                      ? { transform: `translateX(${saliendo * 75}%) rotate(${saliendo * 14}deg)`, opacity: 0.85 }
                      : { transform: `rotate(${PUESTOS_MONTON[puesto] ?? 0}deg)${puesto > 2 ? ' scale(0.9)' : ''}`, opacity: puesto > 2 ? 0 : 1 }
                    return (
                      <div key={k} className="absolute inset-x-[14%] inset-y-[0.3rem] transition-[transform,opacity] duration-300 ease-out" style={{ zIndex: n - puesto, ...estilo }}>
                        <Polaroid foto={f} giro="" abrir={() => setAbierta(f)} />
                      </div>
                    )
                  })}
                  {fotos.length > 1 && (
                    <>
                      <button type="button" aria-label="Foto anterior" onClick={() => pasarMonton(-1, fotos.length)} className="absolute left-0 top-1/2 z-10 flex h-[2.2rem] w-[2.2rem] -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55">
                        <ChevronLeft className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="Foto siguiente" onClick={() => pasarMonton(1, fotos.length)} className="absolute right-0 top-1/2 z-10 flex h-[2.2rem] w-[2.2rem] -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55">
                        <ChevronRight className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              ) : fotos ? (
                // Polaroids de dos en dos (con una sola, sola y centrada)
                <div
                  className={`grid h-full gap-x-[0.7rem] gap-y-[0.7rem] p-[0.25rem] ${fotos.length === 1 ? 'grid-cols-1 px-[12%]' : 'grid-cols-2'}`}
                  style={{ gridTemplateRows: `repeat(${Math.ceil(fotos.length / 2) || 1}, minmax(0, 1fr))` }}
                >
                  {fotos.map((f, k) => (
                    <Polaroid key={k} foto={f} giro={(sinBarra && montaje.giros ? montaje.giros : GIROS)[k % GIROS.length]} abrir={() => setAbierta(f)} />
                  ))}
                </div>
              ) : (
                // Nota de papel pegada, un poco torcida, con la escena dentro
                <div className={`h-full -rotate-[1deg] bg-demo-bg p-[0.45rem] text-demo-text ${SOMBRA}`}>
                  <div className="relative h-full overflow-hidden rounded-[1.1rem]">
                    <Escena pestana={p} forma="tarjeta" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {textoMiniweb && !montaje.textoArriba ? (
        textoInicio('px-[1.25rem] pb-[1rem] pt-[0.9rem]')
      ) : sinBarra ? (
        <div className="h-[1rem]" />
      ) : (
        <div className="px-[1.25rem] pb-[0.8rem] pt-[0.8rem]">
          <BarraPestanas estilo={hero.barra ?? 'pastillas'} pestanas={pestanas} activa={activa} tocar={tocar} sobre="oscuro" />
        </div>
      )}

      {abierta && <PolaroidAbierta foto={abierta} cerrar={() => setAbierta(null)} />}
    </div>
  )
}
