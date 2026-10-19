import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import NombreMarca from '../components/NombreMarca'
import { X } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Galería (inspirado en la carta Galería de Tumi). Hero por piezas: acepta cualquier pestaña común y cualquier
   barra (hero.barra; la suya son las pastillas).
   Arriba el nombre grande y el lema. En la pestaña de fotos, un mosaico de fotos a sangre, sin marcos: la primera
   en grande y las demás de dos en dos, con su etiqueta encima; al tocar una se abre a pantalla completa y se pasa
   de lado a la siguiente. Las demás pestañas (horario, contacto, ubicación, precios) van en un bloque con las
   esquinas redondas, sobre foto, con el texto abajo.
   hero: barra?, pestanas[{ tipo, texto, ... }] (en la de fotos: fotos u opciones, ver fotosDe en fichas/escenas) */

const DEGRADADO = 'bg-gradient-to-t from-black/70 via-black/10 to-transparent'

// Mosaico de fotos en dos filas: la primera en grande, a lo ancho, y debajo dos (si solo hay una, a lo ancho).
// Al abrir una, en el visor se pueden pasar todas
function Mosaico({ fotos, abrir }) {
  const lista = fotos.slice(0, 3)
  const resto = lista.length - 1
  const filas = 1 + Math.ceil(resto / 2)
  return (
    <div
      className="grid h-full grid-cols-2 gap-[0.45rem]"
      style={{ gridTemplateRows: filas > 1 ? `1.4fr repeat(${filas - 1}, minmax(0, 1fr))` : 'minmax(0, 1fr)' }}
    >
      {lista.map((f, i) => (
        <button
          key={i}
          type="button"
          onClick={() => abrir(i)}
          className={`group relative min-h-0 overflow-hidden rounded-[0.9rem] bg-demo-surface ${i === 0 || (resto % 2 === 1 && i === lista.length - 1) ? 'col-span-2' : ''}`}
        >
          <Img src={f.src} alt={f.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {f.etiqueta && (
            <>
              <div className={`absolute inset-0 ${DEGRADADO}`} />
              <span className={`absolute bottom-[0.55rem] left-[0.65rem] right-[0.65rem] text-left font-demo-heading font-bold leading-tight text-white ${i === 0 ? 'text-[1.2rem]' : 'text-[0.9rem]'}`}>
                {f.etiqueta}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  )
}

// Fotos a pantalla completa, una al lado de otra: se pasa de lado de una a otra; empieza en la tocada
function Visor({ fotos, inicio, cerrar }) {
  const carril = useRef(null)
  const [actual, setActual] = useState(inicio)

  useLayoutEffect(() => {
    const el = carril.current
    if (el) el.scrollLeft = inicio * el.clientWidth
  }, [inicio])

  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div role="dialog" aria-modal="true" aria-label="Fotos" className="fixed inset-0 z-[60] bg-black">
      <div
        ref={carril}
        onScroll={e => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
      >
        {fotos.map((f, i) => (
          <section key={i} className="relative h-full w-full shrink-0 snap-start snap-always">
            <Img src={f.src} alt={f.alt} className="absolute inset-0 h-full w-full object-cover" />
            {f.etiqueta && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <p className="absolute inset-x-0 bottom-0 mx-auto max-w-[30rem] px-[1.25rem] pb-[2.5rem] font-demo-heading text-[2rem] font-bold leading-tight text-white">
                  {f.etiqueta}
                </p>
              </>
            )}
          </section>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-[30rem] items-center gap-[0.75rem] px-[1.25rem] pt-[1rem]">
        <div className="flex flex-1 gap-[0.25rem]">
          {fotos.map((_, i) => (
            <span key={i} className={`h-[0.15rem] flex-1 rounded-full ${i === actual ? 'bg-white' : 'bg-white/35'}`} />
          ))}
        </div>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="pointer-events-auto rounded-full bg-black/45 p-[0.45rem] text-white backdrop-blur-sm">
          <X className="h-[1.2rem] w-[1.2rem]" />
        </button>
      </div>
    </div>
  )
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroGaleria({ hero, nombre, lema, sinBarra = false }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const [activa, setActiva] = useState(0)
  const [mapaPedido, setMapaPedido] = useState(true)
  const [visor, setVisor] = useState(null)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)
  const respaldo = fotoDeRespaldo(pestanas)

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  const deFotos = pestanas.find(p => tipoComun(p.tipo) === 'fotos')

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* Nombre grande y lema; compartir a la derecha */}
      <div className="flex items-start justify-between gap-[1rem] px-[1.25rem] pt-[1rem]">
        <div className="min-w-0">
          <h1 className="font-demo-heading text-[clamp(2.3rem,1.8rem+2.4vw,2.9rem)] font-bold leading-[0.95] tracking-[-0.02em]"><NombreMarca nombre={nombre} tamano="grande" /></h1>
          {lema && <p className="mt-[0.3rem] text-[0.9rem] text-demo-muted">{lema}</p>}
        </div>
        <BotonCompartir titulo={nombre} className="mt-[0.3rem] shrink-0" />
      </div>

      {/* Lo que cambia con cada pestaña: ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mt-[0.9rem] min-h-[12rem] flex-1">
        {pestanas.map((p, i) => (
          <div
            key={`${p.tipo}-${i}`}
            aria-hidden={i !== activa}
            className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {tipoComun(p.tipo) === 'fotos' ? (
              <Mosaico fotos={fotosDe(p)} abrir={setVisor} />
            ) : (
              <div className="relative h-full overflow-hidden rounded-[0.9rem] bg-demo-surface">
                <Escena pestana={p} forma="foto" info="abajo" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
              </div>
            )}
          </div>
        ))}
      </div>

      {sinBarra ? (
        <div className="h-[1rem]" />
      ) : (
        <div className="px-[1.25rem] pt-[0.8rem]">
          <BarraPestanas estilo={hero.barra ?? 'pastillas'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}

      {visor !== null && deFotos && <Visor fotos={fotosDe(deFotos).slice(0, 5)} inicio={visor} cerrar={() => setVisor(null)} />}
    </div>
  )
}
