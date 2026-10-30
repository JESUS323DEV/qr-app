import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CompartirJuntoAlBoton } from '../components/BotonCompartir'
import NombreMarca from '../components/NombreMarca'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Img from '../components/Img'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { useFondoBoton, useRol } from '../components/ColoresPortada'
import { galeriaDe } from '../lib/galerias'

/* Galería (inspirado en la carta Galería de Tumi). Hero por piezas: acepta cualquier pestaña común y cualquier
   barra (hero.barra; la suya son las pastillas).
   Arriba el nombre grande y el lema. En la pestaña de fotos, un mosaico de fotos a sangre, sin marcos: la primera
   en grande y las demás de dos en dos, con su etiqueta encima; al tocar una se abre a pantalla completa y se pasa
   de lado a la siguiente. Las demás pestañas (horario, contacto, ubicación, precios) van en un bloque con las
   esquinas redondas, sobre foto, con el texto abajo.
   hero: barra?, pestanas[{ tipo, texto, ... }] (en la de fotos: fotos u opciones, ver fotosDe en fichas/escenas) */

const DEGRADADO = 'bg-gradient-to-t from-black/70 via-black/10 to-transparent'

// Galería de una miniweb: una sola foto con el titular grande pegado abajo y una flecha a cada lado; debajo de la foto,
// fuera de ella, la descripción y el botón. Solo cambia la foto de fondo, que pasa sola cada 4 s o al tocar una flecha;
// el titular no se mueve
const TURNO_GALERIA_MS = 4000
function GaleriaMiniweb({ fotos, inicio, irA, nombre, estilo }) {
  const rolTitular = useRol('titular')
  const rolDescripcion = useRol('descripcion')
  const rolBoton = useRol('boton')
  const fondoBoton = useFondoBoton()
  const [actual, setActual] = useState(0)
  const n = fotos.length
  // Cada cambio, también el manual, reinicia los 4 s
  useEffect(() => {
    if (n < 2) return
    const id = setTimeout(() => setActual(i => (i + 1) % n), TURNO_GALERIA_MS)
    return () => clearTimeout(id)
  }, [actual, n])
  const pasar = paso => setActual(i => (i + paso + n) % n)
  const flecha = (paso, Icono, texto, lado) => (
    <button
      type="button"
      aria-label={texto}
      onClick={() => pasar(paso)}
      className={`absolute top-1/2 ${lado} z-10 flex h-[2.2rem] w-[2.2rem] -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55`}
    >
      <Icono className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
  // El titular (en líneas), sobre la foto o debajo de ella según el estilo
  const titularEl = (clase, tamano) =>
    inicio.titular?.length > 0 && (
      <h2 style={rolTitular} className={clase}>
        {inicio.titular.map((l, i) => (
          <span key={i} className={`block font-demo-heading font-bold leading-[1.05] ${tamano}`}>{l}</span>
        ))}
      </h2>
    )
  const descripcionEl = inicio.descripcion && <p style={rolDescripcion} className="text-[length:calc(0.9rem_+_max(0px,100svh_-_680px)_*_0.0065)] leading-[1.4] opacity-85">{inicio.descripcion}</p>
  const botonEl = inicio.boton && inicio.botonA && (
    <div className={`flex flex-wrap items-center gap-[0.75rem] ${inicio.descripcion ? 'mt-[0.6rem]' : ''}`}>
      <button
        type="button"
        onClick={() => irA?.(inicio.botonA)}
        style={{ ...rolBoton, ...fondoBoton }} className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
      >
        {inicio.boton}
      </button>
      <CompartirJuntoAlBoton titulo={nombre} />
    </div>
  )
  // El titular pegado abajo sobre un degradado oscuro (y, en 'sobre', también la descripción y el botón)
  const textoSobreFoto = (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-[0.9rem] pb-[0.8rem] pt-[3rem] text-left text-white">
      {estilo.titularSobre && titularEl('pointer-events-none', 'text-[length:calc(1.5rem_+_max(0px,100svh_-_680px)_*_0.0288)]')}
      {estilo.textoSobre && (
        <>
          {inicio.descripcion && <p style={rolDescripcion} className="mt-[0.35rem] text-[0.85rem] leading-[1.35] opacity-90">{inicio.descripcion}</p>}
          {botonEl}
        </>
      )}
    </div>
  )
  const hayTextoFuera = !estilo.titularSobre || (!estilo.textoSobre && (inicio.descripcion || (inicio.boton && inicio.botonA)))
  return (
    <div className="flex h-full flex-col">
      {/* La foto (una sola, o en carrusel con un trozo de las de al lado), con el texto sobre ella según el estilo */}
      <div className={`relative min-h-0 flex-1 overflow-hidden bg-demo-surface ${estilo.carrusel ? 'rounded-[0.9rem] bg-transparent!' : estilo.foto}`}>
        {estilo.carrusel ? (
          <div
            className="flex h-full gap-[0.5rem] transition-transform duration-500"
            style={{ transform: `translateX(calc(10% - ${actual} * (80% + 0.5rem)))` }}
          >
            {fotos.map((f, i) => (
              <div key={i} className={`relative h-full w-[80%] shrink-0 overflow-hidden rounded-[0.9rem] bg-demo-surface transition-opacity duration-500 ${i === actual ? 'opacity-100' : 'opacity-60'}`}>
                <Img src={f.src} alt={f.alt} className="h-full w-full object-cover" />
                {estilo.titularSobre && inicio.titular?.length > 0 && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-[0.9rem] pb-[0.8rem] pt-[3rem] text-white">
                    {titularEl('pointer-events-none text-left', 'text-[length:calc(1.35rem_+_max(0px,100svh_-_680px)_*_0.026)]')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {fotos.map((f, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
                <Img src={f.src} alt={f.alt} className="h-full w-full object-cover" />
              </div>
            ))}
            {(estilo.titularSobre || estilo.textoSobre) && textoSobreFoto}
          </>
        )}
        {n > 1 && (
          <>
            {flecha(-1, ChevronLeft, 'Foto anterior', 'left-[0.5rem]')}
            {flecha(1, ChevronRight, 'Foto siguiente', 'right-[0.5rem]')}
          </>
        )}
      </div>
      {/* Fuera de la foto: el titular (si no va sobre ella), la descripción y el botón */}
      {hayTextoFuera && (
        <div className="shrink-0 pt-[0.7rem] text-demo-text">
          {!estilo.titularSobre && titularEl('', 'text-[length:calc(1.5rem_+_max(0px,100svh_-_680px)_*_0.0288)]')}
          {!estilo.textoSobre && (
            <>
              {descripcionEl}
              {botonEl}
            </>
          )}
        </div>
      )}
    </div>
  )
}

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
export default function HeroGaleria({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  const rolSub = useRol('subtitulo')
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
  // En una miniweb con texto de Inicio: la galería de verdad (una foto con el texto encima y flechas)
  const galeriaMiniweb = Boolean(sinBarra && (inicio?.titular?.length || inicio?.descripcion))

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* Nombre grande y lema; compartir a la derecha */}
      <div className="flex items-start justify-between gap-[1rem] px-[1.25rem] pt-[1rem]">
        <div className="min-w-0">
          <h1 className="font-demo-heading text-[clamp(2.3rem,1.8rem+2.4vw,2.9rem)] font-bold leading-[0.95] tracking-[-0.02em]"><NombreMarca nombre={nombre} tamano="grande" /></h1>
          {lema && <p style={rolSub} className="mt-[0.3rem] text-[0.9rem] text-demo-muted">{lema}</p>}
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
            {tipoComun(p.tipo) === 'fotos' && galeriaMiniweb ? (
              <GaleriaMiniweb fotos={fotosDe(p)} inicio={inicio} irA={irA} nombre={nombre} estilo={galeriaDe(hero.pase)} />
            ) : tipoComun(p.tipo) === 'fotos' ? (
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
