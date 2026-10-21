import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import Img from '../Img'
import Ofertas from './Ofertas'

/* Diseño de carta "galería": las fotos de los platos son las protagonistas. Cada sección es un mosaico de fotos a
   sangre, sin marcos: el primer plato en grande arriba y los demás de dos en dos, con el nombre y el precio encima.
   Al tocar una foto se abre a pantalla completa, con la descripción y los alérgenos, y se pasa de lado al plato
   siguiente. Un plato sin foto sale como una pieza de color con su nombre.
   Si hay menú del día, arriba se elige Menú del día o Carta; el menú va con su foto grande y los platos debajo.
   Colores de la marca: bg es el fondo, surface las piezas sin foto, text el texto, accent los precios y la sección
   elegida, y muted el texto suave.
   Todo en una pantalla, sin scroll: el mosaico se reparte el hueco que queda. Los tamaños crecen a partir de 46rem
   y de 56rem de alto. Las clases van escritas enteras (no con variables) para que Tailwind las encuentre. */

const DEGRADADO = 'bg-gradient-to-t from-black/80 via-black/25 to-transparent'

// Una pieza del mosaico: la foto con el nombre y el precio encima (o el nombre sobre color, si no hay foto)
function Pieza({ plato, grande, abrir, className = '' }) {
  return (
    <button type="button" onClick={abrir} className={`group relative min-h-0 overflow-hidden rounded-[0.9rem] bg-demo-surface text-left ${className}`}>
      {plato.foto ? (
        <>
          <Img src={plato.foto} alt={plato.nombre} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className={`absolute inset-0 ${DEGRADADO}`} />
        </>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-[0.6rem] [@media(min-height:46rem)]:p-[0.75rem]">
        <p
          className={`font-demo-heading font-bold leading-[1.05] text-white ${
            grande
              ? 'text-[1.35rem] [@media(min-height:46rem)]:text-[1.6rem] [@media(min-height:56rem)]:text-[1.85rem]'
              : 'text-[0.95rem] [@media(min-height:46rem)]:text-[1.05rem] [@media(min-height:56rem)]:text-[1.15rem]'
          }`}
        >
          {plato.nombre}
        </p>
        <p className={`mt-[0.15rem] font-bold text-demo-accent ${grande ? 'text-[1rem] [@media(min-height:46rem)]:text-[1.1rem]' : 'text-[0.85rem] [@media(min-height:46rem)]:text-[0.92rem]'}`}>{plato.precio}</p>
      </div>
    </button>
  )
}

// Platos a pantalla completa, uno al lado de otro: se pasa de lado de uno a otro; empieza en el tocado
function Visor({ platos, inicio, cerrar }) {
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
    <div role="dialog" aria-modal="true" aria-label="Platos" className="fixed inset-0 z-[60] bg-black">
      <div
        ref={carril}
        onScroll={e => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
      >
        {platos.map(p => (
          <section key={p.nombre} className="relative h-full w-full shrink-0 snap-start snap-always">
            {p.foto ? (
              <Img src={p.foto} alt={p.nombre} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-demo-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[30rem] px-[1.25rem] pb-[2.5rem]">
              <h2 className="font-demo-heading text-[2.2rem] font-bold leading-[1.02] text-white">{p.nombre}</h2>
              <p className="mt-[0.3rem] text-[1.3rem] font-bold text-demo-accent">{p.precio}</p>
              {p.descripcion && <p className="mt-[0.5rem] text-[1rem] leading-[1.45] text-white/85">{p.descripcion}</p>}
              {p.alergenos?.length > 0 && (
                <p className="mt-[0.4rem] text-[0.88rem] text-white/65">Alérgenos: {p.alergenos.map(a => ALERGENOS[a]?.nombre.toLowerCase()).join(', ')}</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Arriba: en qué plato vas, rayitas y cerrar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-[30rem] items-center gap-[0.75rem] px-[1.25rem] pt-[1rem]">
        <div className="flex flex-1 gap-[0.25rem]">
          {platos.map((p, i) => (
            <span key={p.nombre} className={`h-[0.15rem] flex-1 rounded-full ${i === actual ? 'bg-white' : 'bg-white/35'}`} />
          ))}
        </div>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="pointer-events-auto rounded-full bg-black/45 p-[0.45rem] text-white backdrop-blur-sm">
          <X className="h-[1.2rem] w-[1.2rem]" />
        </button>
      </div>
    </div>
  )
}

// Menú del día en galería: su foto grande con el título y el precio encima (llena el hueco que queda) y, debajo,
// los grupos de platos y lo que incluye
function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <Ofertas menu={menu} estilo="galeria" />
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[0.5rem] [@media(min-height:46rem)]:gap-[0.6rem]">
      <div className="relative min-h-[5rem] flex-1 overflow-hidden rounded-[0.9rem] bg-demo-surface">
        {menu.foto && <Img src={menu.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className={`absolute inset-0 ${DEGRADADO}`} />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-[0.75rem] p-[0.75rem] [@media(min-height:46rem)]:p-[0.9rem]">
          <div className="min-w-0">
            <p className="font-demo-heading text-[1.6rem] font-bold leading-none text-white [@media(min-height:46rem)]:text-[1.9rem] [@media(min-height:56rem)]:text-[2.2rem]">{menu.titulo}</p>
            {menu.cuando && <p className="mt-[0.25rem] text-[0.82rem] text-white/80 [@media(min-height:46rem)]:text-[0.9rem]">{menu.cuando}</p>}
          </div>
          <p className="shrink-0 whitespace-nowrap precio-detalle font-demo-heading text-[length:calc(1.6rem*var(--demo-precio-escala,1))] font-bold leading-none text-[color:var(--demo-precio-texto,var(--demo-accent))] [@media(min-height:46rem)]:text-[length:calc(1.9rem*var(--demo-precio-escala,1))] [@media(min-height:56rem)]:text-[length:calc(2.2rem*var(--demo-precio-escala,1))]">{menu.precio}</p>
        </div>
      </div>

      <div className="shrink-0 rounded-[0.9rem] bg-demo-surface px-[0.85rem] py-[0.7rem] [@media(min-height:46rem)]:px-[1rem] [@media(min-height:46rem)]:py-[0.85rem]">
        {/* Cada grupo con su nombre y sus platos uno debajo de otro; con más de 3 grupos, en dos columnas */}
        <div className={`grid gap-[0.5rem] [@media(min-height:46rem)]:gap-[0.7rem] ${menu.grupos.length > 3 ? 'grid-cols-2 gap-x-[0.8rem]' : ''}`}>
          {menu.grupos.map(g => (
            <div key={g.nombre}>
              <p className="font-demo-heading text-[1.1rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.2rem] [@media(min-height:56rem)]:text-[1.3rem]">{g.nombre}</p>
              <ul className="mt-[0.2rem] text-[0.98rem] leading-[1.3] [@media(min-height:46rem)]:mt-[0.3rem] [@media(min-height:46rem)]:text-[1.08rem] [@media(min-height:56rem)]:text-[1.16rem] [@media(min-height:56rem)]:leading-[1.38]">
                {g.platos.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        {menu.incluye && (
          <p className="mt-[0.4rem] text-[0.8rem] text-demo-muted [@media(min-height:46rem)]:mt-[0.55rem] [@media(min-height:46rem)]:text-[0.88rem]">
            Incluye {menu.incluye.charAt(0).toLowerCase() + menu.incluye.slice(1)}
          </p>
        )}
      </div>
    </div>
  )
}

// Hoja con los alérgenos de la carta
function HojaAlergenos({ claves, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-alergenos"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[30rem] rounded-t-[1.25rem] bg-demo-surface px-[1.25rem] pb-[1.75rem] pt-[1rem] text-demo-text"
      >
        <div className="flex items-center justify-between gap-[1rem]">
          <h2 id="titulo-alergenos" className="font-demo-heading text-[1.6rem] font-bold leading-none">Alérgenos</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="-mr-[0.4rem] p-[0.4rem] text-demo-muted hover:text-demo-text">
            <X className="h-[1.3rem] w-[1.3rem]" />
          </button>
        </div>
        <p className="mt-[0.3rem] text-[0.9rem] text-demo-muted">Toca cada plato para ver los suyos. En esta carta hay:</p>
        <p className="mt-[0.5rem] text-[1rem] leading-[1.5]">{claves.map(a => ALERGENOS[a].nombre).join(', ')}.</p>
        <p className="mt-[0.9rem] text-[0.88rem] leading-[1.4] text-demo-muted">Si tienes alguna alergia o intolerancia, pregúntanos antes de pedir.</p>
      </div>
    </div>
  )
}

export default function CartaGaleria({ carta, negocio }) {
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccion, setSeccion] = useState(carta.secciones[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const [visor, setVisor] = useState(null)
  const [verAlergenos, setVerAlergenos] = useState(false)

  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))
  const abierta = carta.secciones.find(s => s.nombre === seccion) ?? carta.secciones[0]
  // Mosaico: el primero en grande, arriba y a lo ancho; los demás de dos en dos (si sobra uno, a lo ancho)
  const platos = abierta?.platos.slice(0, 7) ?? []
  const resto = platos.length - 1
  const filas = 1 + Math.ceil(resto / 2)

  return (
    <div className="h-svh overflow-hidden bg-demo-bg font-demo-body text-demo-text">
      <main className="mx-auto flex h-full w-full max-w-[30rem] flex-col px-[0.9rem] pb-[0.9rem] pt-[0.9rem] [@media(min-height:46rem)]:px-[1.1rem] [@media(min-height:46rem)]:pb-[1.1rem] [@media(min-height:46rem)]:pt-[1.2rem]">
        {/* Nombre y lema; idioma a la derecha */}
        <header className="flex shrink-0 items-start justify-between gap-[1rem] px-[0.2rem]">
          <div className="min-w-0">
            <h1 className="font-demo-heading text-[2.2rem] font-extrabold leading-[0.9] tracking-[-0.03em] [@media(min-height:46rem)]:text-[2.6rem] [@media(min-height:56rem)]:text-[3rem]">{negocio.nombre}</h1>
            {negocio.lema && <p className="mt-[0.25rem] text-[0.85rem] text-demo-muted [@media(min-height:46rem)]:text-[0.92rem]">{negocio.lema}</p>}
          </div>
          {carta.idiomas?.length > 1 && (
            <div className="mt-[0.25rem] flex shrink-0 gap-[0.15rem] rounded-full bg-demo-surface p-[0.15rem]">
              {carta.idiomas.map(i => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={idioma === i}
                  onClick={() => setIdioma(i)}
                  className={`rounded-full px-[0.55rem] py-[0.1rem] text-[0.75rem] font-semibold transition-colors ${idioma === i ? 'bg-demo-text text-demo-bg' : 'text-demo-muted'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Menú del día y Carta (solo si hay menú del día) */}
        {carta.menuDia && (
          <div className="mt-[0.75rem] grid shrink-0 grid-cols-2 gap-[0.3rem] rounded-full bg-demo-surface p-[0.2rem] [@media(min-height:46rem)]:mt-[0.95rem]">
            {[
              { key: 'menu', texto: carta.menuDia.texto },
              { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
            ].map(p => (
              <button
                key={p.key}
                type="button"
                aria-pressed={modo === p.key}
                onClick={() => setModo(p.key)}
                className={`rounded-full py-[0.4rem] text-[0.92rem] font-semibold transition-colors [@media(min-height:46rem)]:py-[0.5rem] [@media(min-height:46rem)]:text-[1rem] ${
                  modo === p.key ? 'bg-demo-text text-demo-bg' : 'text-demo-muted hover:text-demo-text'
                }`}
              >
                {p.texto}
              </button>
            ))}
          </div>
        )}

        {modo === 'menu' && carta.menuDia ? (
          <div className="mt-[0.7rem] flex min-h-0 flex-1 flex-col [@media(min-height:46rem)]:mt-[0.9rem]">
            <MenuDia menu={carta.menuDia} />
          </div>
        ) : (
        <>
        {/* Secciones: la elegida en el color de la marca y subrayada */}
        <nav className="-mx-[0.9rem] mt-[0.8rem] flex shrink-0 gap-[1.2rem] overflow-x-auto px-[1.1rem] [scrollbar-width:none] [@media(min-height:46rem)]:-mx-[1.1rem] [@media(min-height:46rem)]:mt-[1rem] [@media(min-height:46rem)]:px-[1.3rem]">
          {carta.secciones.map(s => (
            <button
              key={s.nombre}
              type="button"
              aria-pressed={abierta?.nombre === s.nombre}
              onClick={() => setSeccion(s.nombre)}
              className={`shrink-0 pb-[0.25rem] font-demo-heading text-[1.1rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.25rem] ${
                abierta?.nombre === s.nombre ? 'border-b-2 border-demo-accent text-demo-accent' : 'border-b-2 border-transparent text-demo-muted hover:text-demo-text'
              }`}
            >
              {s.nombre}
            </button>
          ))}
        </nav>

        {/* Mosaico de la sección: llena el resto de la pantalla */}
        <div
          key={abierta?.nombre}
          className="mt-[0.8rem] grid min-h-0 flex-1 grid-cols-2 gap-[0.5rem] [@media(min-height:46rem)]:mt-[1rem] [@media(min-height:46rem)]:gap-[0.6rem]"
          style={{ gridTemplateRows: filas > 1 ? `1.5fr repeat(${filas - 1}, minmax(0, 1fr))` : 'minmax(0, 1fr)' }}
        >
          {platos.map((p, i) => (
            <Pieza
              key={p.nombre}
              plato={p}
              grande={i === 0}
              abrir={() => setVisor(i)}
              // El primero y, si los demás son impares, el último ocupan las dos columnas
              className={i === 0 || (resto % 2 === 1 && i === platos.length - 1) ? 'col-span-2' : ''}
            />
          ))}
        </div>

        {alergenos.length > 0 && (
          <button type="button" onClick={() => setVerAlergenos(true)} className="mt-[0.6rem] shrink-0 self-start px-[0.2rem] text-[0.85rem] font-semibold text-demo-muted underline underline-offset-[0.25em] hover:text-demo-text">
            Ver alérgenos
          </button>
        )}
        </>
        )}
      </main>

      {visor !== null && <Visor platos={platos} inicio={visor} cerrar={() => setVisor(null)} />}
      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
