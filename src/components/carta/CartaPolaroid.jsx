import { estiloPrecio, ZOOM_NOMBRE } from './precio'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import Img from '../Img'
import Ofertas from './Ofertas'
import EnlaceNegocio, { ladoEnlace } from './EnlaceNegocio'

/* Diseño de carta "polaroid": el menú del día es una polaroid con su foto y la nota de los platos pegada debajo.
   La pestaña Carta (o Servicios) es una lista: cada plato es una tarjeta de papel con su nombre, precio, descripción y
   alérgenos, y su foto pequeña a la derecha si la tiene. Salen todos los platos de la sección, con scroll si no caben.
   Colores de la marca: primary es el fondo de la pantalla, surface el papel, text la tinta, accent los precios
   y muted la tinta suave. heading es la letra a mano; body, la del resto.
   Los tamaños del menú del día crecen a partir de 46rem y de 56rem de alto. Las clases van escritas enteras
   (no con variables) para que Tailwind las encuentre. */

const SOMBRA = 'shadow-[0_0.5rem_1.2rem_-0.3rem_rgb(0_0_0/0.45)]'

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
          {/* El precio, en su sitio (a la derecha del título y, si no cabe a su lado, justo debajo, a la derecha), más grande que él y con una línea gruesa debajo que lo remarca (del color "Detalle del precio" de la carta o, sin él, el de acento) */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-[0.5rem] gap-y-[0.3rem] px-[0.3rem] pb-[0.8rem] pt-[0.7rem]">
            <div className="shrink-0">
              <span className="block whitespace-nowrap text-[color:var(--c-menu-titulo,inherit)] font-demo-heading text-[1.3rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.5rem]">{menu.titulo}</span>
              {/* Cuándo vale el menú (de martes a viernes, a mediodía...), justo debajo del título */}
              {menu.cuando && <span className="mt-[0.3rem] block text-[0.82rem] leading-[1.25] text-[color:var(--c-menu-cuando,var(--demo-muted))] [@media(min-height:46rem)]:text-[0.9rem]">{menu.cuando}</span>}
            </div>
          </div>
        </div>
      )}

      <div className={`shrink-0 bg-demo-surface px-[0.9rem] py-[0.7rem] text-demo-text rotate-[1deg] [@media(min-height:46rem)]:px-[1.1rem] [@media(min-height:46rem)]:py-[0.9rem] ${SOMBRA}`}>
        {!menu.foto && (
          <div className="mb-[0.4rem] flex items-baseline justify-between gap-[0.5rem]">
            <span className="font-demo-heading text-[color:var(--c-menu-titulo,inherit)] text-[1.6rem] font-bold leading-none">{menu.titulo}</span>
            <span className="font-demo-heading text-[length:calc(2.4rem*var(--demo-precio-escala,1))] font-bold leading-none text-[color:var(--demo-precio-texto,var(--demo-primary))]">{menu.precio}</span>
          </div>
        )}
        {/* Sin foto, el cuándo va aquí, bajo el título; con foto, ya va en su polaroid */}
        {!menu.foto && menu.cuando && <p className="text-[0.8rem] text-[color:var(--c-menu-cuando,var(--demo-muted))] [@media(min-height:46rem)]:text-[0.88rem]">{menu.cuando}</p>}
        <div className={`mt-[0.35rem] grid gap-[0.35rem] [@media(min-height:46rem)]:mt-[0.5rem] [@media(min-height:46rem)]:gap-[0.5rem] ${menu.grupos.length > 3 ? 'grid-cols-2 gap-x-[0.8rem]' : ''}`}>
          {menu.grupos.map((g, i) => (
            <div key={g.nombre}>
              {/* Con foto, el precio del menú va en la línea del primer grupo, a la derecha; sin foto, junto al título */}
              <div className="flex items-baseline justify-between gap-[0.5rem]">
                <p className="font-demo-heading text-[1.15rem] font-bold leading-none text-[color:var(--c-seccion,var(--demo-accent))] [@media(min-height:46rem)]:text-[1.25rem] [@media(min-height:56rem)]:text-[1.35rem]">{g.nombre}</p>
                {i === 0 && menu.foto && (
                  <span className="shrink-0 whitespace-nowrap precio-detalle font-demo-heading text-[length:calc(1.4rem*var(--demo-precio-escala,1))] font-bold leading-none text-[color:var(--demo-precio-texto,var(--demo-primary))] [@media(min-height:46rem)]:text-[length:calc(1.6rem*var(--demo-precio-escala,1))] [@media(min-height:56rem)]:text-[length:calc(1.8rem*var(--demo-precio-escala,1))]">{menu.precio}</span>
                )}
              </div>
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
  const lado = ladoEnlace(carta, 'derecha')
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccion, setSeccion] = useState(carta.secciones[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const [verAlergenos, setVerAlergenos] = useState(false)

  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))
  const pestanas = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
  ]
  const abierta = carta.secciones.find(s => s.nombre === seccion) ?? carta.secciones[0]
  const platos = abierta?.platos ?? []

  return (
    <div className="sp h-svh overflow-hidden bg-[var(--c-fondo-polaroid,var(--demo-primary))] font-demo-body">
      <main className="mx-auto flex h-full w-full max-w-[30rem] flex-col px-[1.1rem] pb-[0.9rem] pt-[0.9rem] [@media(min-height:46rem)]:px-[1.3rem] [@media(min-height:46rem)]:pb-[1.2rem] [@media(min-height:46rem)]:pt-[1.2rem]">
        {/* Nombre a mano y lema; idioma a la derecha */}
        <header className="flex shrink-0 items-start justify-between gap-[1rem]">
          <div className="min-w-0">
            {lado === 'izquierda' && <EnlaceNegocio carta={carta} negocio={negocio} className="mb-[0.5rem] inline-flex items-center gap-[0.25rem] sp sp-fondo rounded-full px-[0.7rem] py-[0.3rem] text-[0.72rem] font-semibold" />}
            <h1 className="text-[color:var(--c-nombre,inherit)] font-demo-heading text-[2.6rem] font-bold leading-[0.85] [@media(min-height:46rem)]:text-[3rem] [@media(min-height:56rem)]:text-[3.4rem]" style={ZOOM_NOMBRE}>{negocio.nombre}</h1>
            {negocio.lema && <p className="mt-[0.25rem] text-[0.85rem] sp-80 [@media(min-height:46rem)]:text-[0.92rem]">{negocio.lema}</p>}
          </div>
          {/* A la derecha: el idioma y, debajo, el enlace a la miniweb del negocio (si la carta es de un negocio con ficha) */}
          <div className="flex shrink-0 flex-col items-end gap-[0.45rem]">
          {carta.idiomas?.length > 1 && (
            <div className="mt-[0.3rem] flex gap-[0.15rem] rounded-full sp-fondo p-[0.15rem]">
              {carta.idiomas.map(i => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={idioma === i}
                  onClick={() => setIdioma(i)}
                  className={`rounded-full px-[0.55rem] py-[0.1rem] text-[0.75rem] font-semibold transition-colors ${idioma === i ? 'sp-solido text-demo-primary' : 'sp-80'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
          {lado === 'derecha' && <EnlaceNegocio carta={carta} negocio={negocio} className="inline-flex items-center gap-[0.25rem] sp sp-fondo rounded-full px-[0.7rem] py-[0.3rem] text-[0.72rem] font-semibold" />}
          </div>
        </header>

        {/* Menú del día y Carta; en la carta, sus secciones */}
        <nav className="mt-[0.7rem] flex shrink-0 gap-[1.3rem] [@media(min-height:46rem)]:mt-[0.95rem]">
          {pestanas.map(p => (
            <button
              key={p.key}
              type="button"
              aria-pressed={modo === p.key}
              onClick={() => setModo(p.key)}
              className={`text-[0.98rem] font-semibold [@media(min-height:46rem)]:text-[1.05rem] ${modo === p.key ? 'underline decoration-2 underline-offset-[0.35em]' : 'sp-65 sp-hover'}`}
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
                className={`shrink-0 font-demo-heading text-[1.45rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.65rem] ${abierta?.nombre === s.nombre ? 'sp' : 'sp-55 sp-hover'}`}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Contenido: llena el resto de la pantalla */}
        <div className="mt-[0.9rem] flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [@media(min-height:46rem)]:mt-[1.2rem]">
          {modo === 'menu' && carta.menuDia ? (
            <MenuDia menu={carta.menuDia} />
          ) : (
            <ul key={abierta?.nombre} className="grid shrink-0 content-start gap-[0.7rem] pb-[0.4rem] [@media(min-height:46rem)]:gap-[0.9rem] [@media(min-height:56rem)]:gap-[1.1rem]">
              {platos.map(p => (
                <li key={p.nombre} className={`flex items-start gap-[0.8rem] bg-demo-surface px-[0.9rem] py-[0.8rem] text-demo-text [@media(min-height:46rem)]:gap-[1rem] [@media(min-height:46rem)]:px-[1.1rem] [@media(min-height:46rem)]:py-[1rem] [@media(min-height:56rem)]:px-[1.25rem] [@media(min-height:56rem)]:py-[1.15rem] ${SOMBRA}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-[0.6rem]">
                      <p className="min-w-0 font-demo-heading text-[1.3rem] font-bold leading-tight [@media(min-height:46rem)]:text-[1.45rem] [@media(min-height:56rem)]:text-[1.65rem]">{p.nombre}</p>
                      <p className="shrink-0 text-right font-demo-heading text-[1.2rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.35rem] [@media(min-height:56rem)]:text-[1.5rem]" style={estiloPrecio('var(--demo-accent)')}>
                        {p.precio}
                        {p.antes && <span className="mt-[0.15rem] block font-demo-body text-[0.8rem] font-normal text-demo-muted line-through [@media(min-height:46rem)]:text-[0.88rem] [@media(min-height:56rem)]:text-[0.95rem]">{p.antes}</span>}
                      </p>
                    </div>
                    {p.hasta && (
                      <p className="mt-[0.2rem] text-[0.8rem] font-semibold text-demo-muted [@media(min-height:46rem)]:text-[0.88rem] [@media(min-height:56rem)]:text-[0.95rem]">
                        Hasta el {new Date(`${p.hasta}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                    )}
                    {p.descripcion && <p className="mt-[0.2rem] text-[0.9rem] leading-[1.35] text-demo-muted [@media(min-height:46rem)]:text-[1rem] [@media(min-height:56rem)]:text-[1.1rem]">{p.descripcion}</p>}
                    {p.alergenos?.length > 0 && (
                      <p className="mt-[0.2rem] text-[0.8rem] text-demo-muted [@media(min-height:46rem)]:text-[0.88rem] [@media(min-height:56rem)]:text-[0.95rem]">Alérgenos: {p.alergenos.map(a => ALERGENOS[a]?.nombre.toLowerCase()).join(', ')}</p>
                    )}
                  </div>
                  {p.foto && (
                    <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden bg-demo-text/10 [@media(min-height:46rem)]:h-[5.5rem] [@media(min-height:46rem)]:w-[5.5rem] [@media(min-height:56rem)]:h-[6.5rem] [@media(min-height:56rem)]:w-[6.5rem]">
                      <Img src={p.foto} alt={p.nombre} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {modo === 'carta' && alergenos.length > 0 && (
          <button type="button" onClick={() => setVerAlergenos(true)} className="mt-[0.7rem] shrink-0 self-start text-[0.85rem] font-semibold sp-80 sp-hover underline underline-offset-[0.25em]">
            Ver alérgenos
          </button>
        )}
      </main>

      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
