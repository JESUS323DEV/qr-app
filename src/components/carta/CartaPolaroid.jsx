import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import Img from '../Img'
import Ofertas from './Ofertas'

/* Diseño de carta "polaroid": cada plato es una polaroid con su foto y, debajo, su nombre y su precio escritos a mano.
   Las polaroids están pegadas un poco torcidas sobre el color de la marca, de dos en dos. Al tocar una se acerca y
   se pone recta, con la descripción y los alérgenos. Un plato sin foto sale como una polaroid escrita a mano.
   Colores de la marca: primary es el fondo de la pantalla, surface el papel, text la tinta, accent los precios
   y muted la tinta suave. heading es la letra a mano (nombre, pies de foto); body, la del resto.
   Todo en una pantalla, sin scroll: las polaroids se reparten el hueco que queda. Los tamaños crecen a partir de
   46rem y de 56rem de alto. Las clases van escritas enteras (no con variables) para que Tailwind las encuentre. */

// Inclinación de cada polaroid según su sitio, para que parezcan pegadas a mano
const GIROS = ['-rotate-[2.5deg]', 'rotate-[2deg]', 'rotate-[1.5deg]', '-rotate-[2deg]', '-rotate-[1deg]', 'rotate-[2.5deg]']

const SOMBRA = 'shadow-[0_0.5rem_1.2rem_-0.3rem_rgb(0_0_0/0.45)]'

// Una polaroid: foto (o el nombre escrito a mano si no hay foto) y el pie con nombre y precio
function Polaroid({ plato, giro = '', abrir }) {
  return (
    <button
      type="button"
      onClick={abrir}
      className={`flex h-full min-h-0 w-full flex-col bg-demo-surface p-[0.35rem] pb-0 text-left text-demo-text transition-transform duration-200 hover:rotate-0 hover:scale-[1.03] [@media(min-height:46rem)]:p-[0.45rem] [@media(min-height:46rem)]:pb-0 ${SOMBRA} ${giro}`}
    >
      {plato.foto ? (
        <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-demo-text/10">
          <Img src={plato.foto} alt={plato.nombre} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-demo-text/[0.04] px-[0.5rem] text-center">
          <span className="font-demo-heading text-[1.5rem] leading-none text-demo-muted [@media(min-height:46rem)]:text-[1.8rem]">{plato.nombre}</span>
        </div>
      )}
      <div className="flex shrink-0 items-baseline justify-between gap-[0.4rem] px-[0.15rem] pb-[0.3rem] pt-[0.15rem] [@media(min-height:46rem)]:pb-[0.45rem] [@media(min-height:46rem)]:pt-[0.25rem]">
        <span className="min-w-0 truncate font-demo-heading text-[1.15rem] font-bold leading-tight [@media(min-height:46rem)]:text-[1.35rem] [@media(min-height:56rem)]:text-[1.5rem]">{plato.nombre}</span>
        <span className="shrink-0 font-demo-heading text-[1.1rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.3rem] [@media(min-height:56rem)]:text-[1.45rem]">{plato.precio}</span>
      </div>
    </button>
  )
}

// La polaroid tocada, grande y recta, con la descripción y los alérgenos; se cierra tocando fuera o con la X
function PolaroidAbierta({ plato, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-[1.5rem]" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={plato.nombre}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-[22rem] bg-demo-surface p-[0.6rem] text-demo-text ${SOMBRA}`}
      >
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="absolute -right-[0.7rem] -top-[0.7rem] z-10 rounded-full bg-demo-surface p-[0.35rem] text-demo-text shadow-[0_0.2rem_0.6rem_rgb(0_0_0/0.3)]">
          <X className="h-[1.1rem] w-[1.1rem]" />
        </button>
        {plato.foto ? (
          <div className="relative aspect-square w-full overflow-hidden">
            <Img src={plato.foto} alt={plato.nombre} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-demo-text/[0.04] px-[1rem] text-center">
            <span className="font-demo-heading text-[2.4rem] leading-none text-demo-muted">{plato.nombre}</span>
          </div>
        )}
        <div className="px-[0.3rem] pb-[0.6rem] pt-[0.5rem]">
          <div className="flex items-baseline justify-between gap-[0.75rem]">
            <p className="font-demo-heading text-[1.9rem] font-bold leading-none">{plato.nombre}</p>
            <p className="shrink-0 text-right font-demo-heading text-[1.7rem] font-bold leading-none text-demo-accent">
              {plato.precio}
              {plato.antes && <span className="mt-[0.2rem] block font-demo-body text-[0.9rem] font-normal text-demo-muted line-through">{plato.antes}</span>}
            </p>
          </div>
          {plato.hasta && (
            <p className="mt-[0.35rem] text-[0.85rem] font-semibold text-demo-muted">
              Hasta el {new Date(`${plato.hasta}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
          )}
          {plato.descripcion && <p className="mt-[0.4rem] text-[0.95rem] leading-[1.4] text-demo-muted">{plato.descripcion}</p>}
          {plato.alergenos?.length > 0 && (
            <p className="mt-[0.35rem] text-[0.85rem] text-demo-muted">Alérgenos: {plato.alergenos.map(a => ALERGENOS[a]?.nombre.toLowerCase()).join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Menú del día: la foto del día en una polaroid grande y, debajo, la nota con los platos, como un papel pegado
// El menú del día con foto es como una polaroid de verdad: la foto casi cuadrada y más pequeña, y debajo el borde grueso con el título y el precio grandes
function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <Ofertas menu={menu} estilo="polaroid" />
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[0.9rem] [@media(min-height:46rem)]:gap-[1.2rem]">
      {menu.foto && (
        <div className={`mx-auto flex min-h-0 w-[96%] flex-col bg-demo-surface p-[0.6rem] pb-0 text-demo-text -rotate-[1.5deg] ${SOMBRA}`}>
          <div className="relative aspect-[5/4] min-h-[5rem] overflow-hidden">
            <Img src={menu.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {/* El precio, en su sitio (a la derecha del título), más grande que él y con una línea gruesa debajo que lo remarca (del color "Detalle del precio" de la carta o, sin él, el de acento) */}
          <div className="flex shrink-0 items-center justify-between gap-[0.5rem] px-[0.3rem] pb-[0.8rem] pt-[0.7rem]">
            <div className="min-w-0 flex-1">
              <span className="block whitespace-nowrap font-demo-heading text-[1.3rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.5rem]">{menu.titulo}</span>
              {/* Cuándo vale el menú (de martes a viernes, a mediodía...), justo debajo del título */}
              {menu.cuando && <span className="mt-[0.3rem] block text-[0.82rem] leading-[1.25] text-demo-muted [@media(min-height:46rem)]:text-[0.9rem]">{menu.cuando}</span>}
            </div>
            <span className="shrink-0 whitespace-nowrap precio-detalle font-demo-heading text-[length:calc(1.9rem*var(--demo-precio-escala,1))] font-bold leading-none text-[color:var(--demo-precio-texto,var(--demo-primary))] [@media(min-height:46rem)]:text-[length:calc(2.2rem*var(--demo-precio-escala,1))] [@media(min-height:56rem)]:text-[length:calc(2.5rem*var(--demo-precio-escala,1))]">{menu.precio}</span>
          </div>
        </div>
      )}

      <div className={`shrink-0 bg-demo-surface px-[0.9rem] py-[0.7rem] text-demo-text rotate-[1deg] [@media(min-height:46rem)]:px-[1.1rem] [@media(min-height:46rem)]:py-[0.9rem] ${SOMBRA}`}>
        {!menu.foto && (
          <div className="mb-[0.4rem] flex items-baseline justify-between gap-[0.5rem]">
            <span className="font-demo-heading text-[1.6rem] font-bold leading-none">{menu.titulo}</span>
            <span className="font-demo-heading text-[length:calc(2.4rem*var(--demo-precio-escala,1))] font-bold leading-none text-[color:var(--demo-precio-texto,var(--demo-primary))]">{menu.precio}</span>
          </div>
        )}
        {/* Sin foto, el cuándo va aquí, bajo el título; con foto, ya va en su polaroid */}
        {!menu.foto && menu.cuando && <p className="text-[0.8rem] text-demo-muted [@media(min-height:46rem)]:text-[0.88rem]">{menu.cuando}</p>}
        <div className={`mt-[0.35rem] grid gap-[0.35rem] [@media(min-height:46rem)]:mt-[0.5rem] [@media(min-height:46rem)]:gap-[0.5rem] ${menu.grupos.length > 3 ? 'grid-cols-2 gap-x-[0.8rem]' : ''}`}>
          {menu.grupos.map(g => (
            <div key={g.nombre}>
              <p className="font-demo-heading text-[1.15rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.25rem] [@media(min-height:56rem)]:text-[1.35rem]">{g.nombre}</p>
              <ul className="mt-[0.2rem] text-[0.98rem] leading-[1.32] [@media(min-height:46rem)]:text-[1.08rem] [@media(min-height:56rem)]:text-[1.16rem]">
                {g.platos.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        {menu.incluye && <p className="mt-[0.35rem] text-[0.8rem] text-demo-muted [@media(min-height:46rem)]:mt-[0.5rem] [@media(min-height:46rem)]:text-[0.88rem]">Incluye {menu.incluye.charAt(0).toLowerCase() + menu.incluye.slice(1)}</p>}
      </div>
    </div>
  )
}

// Hoja con lo que significa cada alérgeno; solo los que salen en la carta
function HojaAlergenos({ claves, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-alergenos"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[30rem] rounded-t-[1.25rem] bg-demo-surface px-[1.25rem] pb-[1.75rem] pt-[1rem] text-demo-text"
      >
        <div className="flex items-center justify-between gap-[1rem]">
          <h2 id="titulo-alergenos" className="font-demo-heading text-[2rem] font-bold leading-none">Alérgenos</h2>
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

export default function CartaPolaroid({ carta, negocio }) {
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccion, setSeccion] = useState(carta.secciones[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const [abierto, setAbierto] = useState(null)
  const [verAlergenos, setVerAlergenos] = useState(false)

  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))
  const pestanas = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
  ]
  const abierta = carta.secciones.find(s => s.nombre === seccion) ?? carta.secciones[0]
  // Hasta 6 polaroids por pantalla, de dos en dos (con una sola, sola y centrada)
  const platos = abierta?.platos.slice(0, 6) ?? []
  const filas = Math.ceil(platos.length / 2)

  return (
    <div className="h-svh overflow-hidden bg-demo-primary font-demo-body text-white">
      <main className="mx-auto flex h-full w-full max-w-[30rem] flex-col px-[1.1rem] pb-[0.9rem] pt-[0.9rem] [@media(min-height:46rem)]:px-[1.3rem] [@media(min-height:46rem)]:pb-[1.2rem] [@media(min-height:46rem)]:pt-[1.2rem]">
        {/* Nombre a mano y lema; idioma a la derecha */}
        <header className="flex shrink-0 items-start justify-between gap-[1rem]">
          <div className="min-w-0">
            <h1 className="font-demo-heading text-[2.6rem] font-bold leading-[0.85] [@media(min-height:46rem)]:text-[3rem] [@media(min-height:56rem)]:text-[3.4rem]">{negocio.nombre}</h1>
            {negocio.lema && <p className="mt-[0.25rem] text-[0.85rem] text-white/80 [@media(min-height:46rem)]:text-[0.92rem]">{negocio.lema}</p>}
          </div>
          {carta.idiomas?.length > 1 && (
            <div className="mt-[0.3rem] flex shrink-0 gap-[0.15rem] rounded-full bg-black/20 p-[0.15rem]">
              {carta.idiomas.map(i => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={idioma === i}
                  onClick={() => setIdioma(i)}
                  className={`rounded-full px-[0.55rem] py-[0.1rem] text-[0.75rem] font-semibold transition-colors ${idioma === i ? 'bg-white text-demo-primary' : 'text-white/80'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Menú del día y Carta; en la carta, sus secciones */}
        <nav className="mt-[0.7rem] flex shrink-0 gap-[1.3rem] [@media(min-height:46rem)]:mt-[0.95rem]">
          {pestanas.map(p => (
            <button
              key={p.key}
              type="button"
              aria-pressed={modo === p.key}
              onClick={() => setModo(p.key)}
              className={`text-[0.98rem] font-semibold [@media(min-height:46rem)]:text-[1.05rem] ${modo === p.key ? 'underline decoration-2 underline-offset-[0.35em]' : 'text-white/65 hover:text-white'}`}
            >
              {p.texto}
            </button>
          ))}
        </nav>
        {modo === 'carta' && (
          <div className="-mx-[1.1rem] mt-[0.4rem] flex shrink-0 gap-[1.1rem] overflow-x-auto px-[1.1rem] [scrollbar-width:none] [@media(min-height:46rem)]:mt-[0.55rem]">
            {carta.secciones.map(s => (
              <button
                key={s.nombre}
                type="button"
                aria-pressed={abierta?.nombre === s.nombre}
                onClick={() => setSeccion(s.nombre)}
                className={`shrink-0 font-demo-heading text-[1.45rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.65rem] ${abierta?.nombre === s.nombre ? 'text-white' : 'text-white/55 hover:text-white'}`}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Contenido: llena el resto de la pantalla */}
        <div className="mt-[0.9rem] flex min-h-0 flex-1 flex-col [@media(min-height:46rem)]:mt-[1.2rem]">
          {modo === 'menu' && carta.menuDia ? (
            <MenuDia menu={carta.menuDia} />
          ) : (
            <div
              key={abierta?.nombre}
              className={`grid min-h-0 flex-1 gap-x-[0.9rem] gap-y-[1rem] [@media(min-height:46rem)]:gap-x-[1.1rem] [@media(min-height:46rem)]:gap-y-[1.3rem] ${platos.length === 1 ? 'grid-cols-1 px-[12%]' : 'grid-cols-2'}`}
              style={{ gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))` }}
            >
              {platos.map((p, i) => (
                <Polaroid key={p.nombre} plato={p} giro={GIROS[i % GIROS.length]} abrir={() => setAbierto(p)} />
              ))}
            </div>
          )}
        </div>

        {modo === 'carta' && alergenos.length > 0 && (
          <button type="button" onClick={() => setVerAlergenos(true)} className="mt-[0.7rem] shrink-0 self-start text-[0.85rem] font-semibold text-white/80 underline underline-offset-[0.25em] hover:text-white">
            Ver alérgenos
          </button>
        )}
      </main>

      {abierto && <PolaroidAbierta plato={abierto} cerrar={() => setAbierto(null)} />}
      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
