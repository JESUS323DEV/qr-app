import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import { rutaNegocio } from '../../negocios'
import Img from '../Img'

/* Diseño de carta "historias": como las historias de Instagram, se pasa de lado.
   La primera pantalla es el menú del día; después, cada sección de la carta (Ceviches, Arroces...) ocupa una
   pantalla con su foto de fondo y su lista de platos. Arriba, fijos: rayitas de progreso, nombre e idioma.
   En cada pantalla, justo encima de su título, Menú del día y Carta y, en la carta, sus secciones. */

// Menú del día: en móviles altos (50rem de alto o más) el texto y las separaciones crecen,
// para llenar la pantalla en vez de dejar un hueco vacío entre las pestañas y el menú
function MenuDia({ menu }) {
  return (
    <div>
      <h1 className="font-demo-heading text-[2rem] leading-none [@media(min-height:50rem)]:text-[2.6rem]">{menu.titulo}</h1>
      <p className="mt-[0.3rem] text-[0.82rem] text-white/75 [@media(min-height:50rem)]:mt-[0.45rem] [@media(min-height:50rem)]:text-[0.95rem]">{menu.cuando}</p>

      <div className="mt-[0.9rem] grid gap-[0.75rem] [@media(min-height:50rem)]:mt-[1.3rem] [@media(min-height:50rem)]:gap-[1.1rem]">
        {menu.grupos.map(g => (
          <div key={g.nombre} className="border-t border-white/20 pt-[0.6rem] [@media(min-height:50rem)]:pt-[0.85rem]">
            <p className="text-[0.75rem] font-bold text-demo-accent [@media(min-height:50rem)]:text-[0.88rem]">{g.nombre}</p>
            <ul className="mt-[0.25rem] text-[0.95rem] leading-[1.4] [@media(min-height:50rem)]:mt-[0.35rem] [@media(min-height:50rem)]:text-[1.12rem] [@media(min-height:50rem)]:leading-[1.5]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-[0.9rem] flex items-end justify-between gap-[1rem] border-t border-white/20 pt-[0.7rem] [@media(min-height:50rem)]:mt-[1.3rem] [@media(min-height:50rem)]:pt-[0.9rem]">
        <p className="text-[0.82rem] leading-[1.4] text-white/75 [@media(min-height:50rem)]:text-[0.95rem]">{menu.incluye}</p>
        <p className="shrink-0 font-demo-heading text-[2rem] leading-none text-demo-accent [@media(min-height:50rem)]:text-[2.6rem]">{menu.precio}</p>
      </div>
    </div>
  )
}

// Sección de la carta (Ceviches, Arroces...): título y lista de platos con precio; descripción y alérgenos en una línea.
// Como el menú del día, crece un poco en móviles altos.
function Seccion({ seccion }) {
  return (
    <div>
      <h2 className="font-demo-heading text-[2rem] leading-none [@media(min-height:50rem)]:text-[2.6rem]">{seccion.nombre}</h2>
      <ul className="mt-[0.7rem] border-t border-white/20 [@media(min-height:50rem)]:mt-[1rem]">
        {seccion.platos.map(p => (
          <li key={p.nombre} className="border-b border-white/20 py-[0.55rem] [@media(min-height:50rem)]:py-[0.75rem]">
            <div className="flex items-baseline justify-between gap-[1rem]">
              <p className="text-[0.98rem] font-semibold [@media(min-height:50rem)]:text-[1.1rem]">{p.nombre}</p>
              <p className="shrink-0 font-demo-heading text-[1.1rem] leading-none text-demo-accent [@media(min-height:50rem)]:text-[1.25rem]">{p.precio}</p>
            </div>
            <div className="mt-[0.15rem] flex flex-wrap items-center gap-x-[0.5rem] gap-y-[0.25rem]">
              {p.descripcion && <p className="text-[0.8rem] leading-[1.4] text-white/70 [@media(min-height:50rem)]:text-[0.88rem]">{p.descripcion}</p>}
              {p.alergenos?.length > 0 && (
                <ul className="flex gap-[0.25rem]">
                  {p.alergenos.map(a => (
                    <li key={a} title={ALERGENOS[a]?.nombre} className="rounded-full border border-white/30 px-[0.4rem] text-[0.62rem] font-semibold text-white/75">
                      {ALERGENOS[a]?.corto}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CartaHistorias({ carta, negocio }) {
  const scroller = useRef(null)
  const [actual, setActual] = useState(0)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')

  // Pantallas: el menú del día (si lo hay) y cada sección de la carta con su foto
  const pantallas = [
    ...(carta.menuDia ? [{ tipo: 'menu', foto: carta.menuDia.foto }] : []),
    ...carta.secciones.map(s => ({ tipo: 'seccion', seccion: s, foto: s.foto })),
  ]

  // Dos niveles de atajos, como en las otras cartas: Menú del día y Carta; dentro de Carta, sus secciones.
  // Cada atajo salta a su pantalla.
  const primeraSeccion = pantallas.findIndex(p => p.tipo === 'seccion')
  const principales = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto, i: 0 }] : []),
    ...(primeraSeccion !== -1 ? [{ key: 'seccion', texto: 'Carta', i: primeraSeccion }] : []),
  ]
  const secciones = pantallas.flatMap((p, i) => (p.tipo === 'seccion' ? [{ texto: p.seccion.nombre, i }] : []))

  const pastilla = activa =>
    `shrink-0 rounded-full font-semibold backdrop-blur-sm transition-colors ${
      activa ? 'bg-white text-[#141414]' : 'bg-black/40 text-white hover:bg-black/55'
    }`

  // Altura a la que quedan las pestañas en el menú del día (va pegado abajo y su alto cambia con el móvil).
  // En las secciones, pestañas y título se colocan a esa misma altura para que no salten al pasar de lado.
  const bloqueMenu = useRef(null)
  const [arriba, setArriba] = useState(null)
  useLayoutEffect(() => {
    const el = bloqueMenu.current
    if (!el) return
    const medir = () => setArriba(el.offsetTop)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    observador.observe(el.parentElement)
    return () => observador.disconnect()
  }, [])

  const alDeslizar = () => {
    const el = scroller.current
    if (el) setActual(Math.round(el.scrollLeft / el.clientWidth))
  }
  const irA = i => {
    const el = scroller.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="h-svh overflow-hidden bg-black font-demo-body text-white">
      <div className="relative mx-auto h-full w-full max-w-[30rem]">
        {/* Pantallas, una al lado de otra como las historias; se encajan solas al deslizar de lado */}
        <div ref={scroller} onScroll={alDeslizar} className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
          {pantallas.map((p, i) => {
            // Sección alineada con el menú: pestañas y título a la misma altura que en el menú del día
            const alineado = p.tipo === 'seccion' && arriba !== null
            return (
            <section
              key={i}
              className={`relative flex h-full w-full shrink-0 snap-start snap-always flex-col overflow-hidden px-[1.25rem] pb-[2.75rem] ${alineado ? 'justify-start' : 'justify-end'}`}
              style={alineado ? { paddingTop: arriba } : undefined}
            >
              <Img src={p.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {/* Degradado de arriba, donde la foto se ve bien, a abajo, oscuro bajo el texto */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/60 via-45% to-black/90" />
              <div ref={p.tipo === 'menu' ? bloqueMenu : undefined} className="relative">
                {/* Atajos justo encima del título: Menú del día y Carta y, en los platos, las secciones de la carta debajo */}
                <nav className="mb-[1rem]">
                  <div className="flex gap-[0.35rem]">
                    {principales.map(a => (
                      <button
                        key={a.key}
                        type="button"
                        aria-pressed={p.tipo === a.key}
                        onClick={() => irA(a.i)}
                        className={`${pastilla(p.tipo === a.key)} px-[1rem] py-[0.45rem] text-[0.88rem]`}
                      >
                        {a.texto}
                      </button>
                    ))}
                  </div>
                  {p.tipo === 'seccion' && (
                    <div className="-mx-[1.25rem] mt-[0.45rem] flex gap-[0.3rem] overflow-x-auto px-[1.25rem] [scrollbar-width:none]">
                      {secciones.map(s => (
                        <button
                          key={s.texto}
                          type="button"
                          aria-pressed={p.seccion.nombre === s.texto}
                          onClick={() => irA(s.i)}
                          className={`shrink-0 rounded-full border px-[0.75rem] py-[0.25rem] text-[0.75rem] font-semibold backdrop-blur-sm transition-colors ${
                            p.seccion.nombre === s.texto ? 'border-white bg-white/15 text-white' : 'border-transparent bg-black/40 text-white/80 hover:text-white'
                          }`}
                        >
                          {s.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
                {p.tipo === 'menu' ? <MenuDia menu={carta.menuDia} /> : <Seccion seccion={p.seccion} />}
              </div>

              {/* En la primera pantalla, una flecha que invita a pasar de lado */}
              {i === 0 && pantallas.length > 1 && (
                <ChevronRight className="absolute bottom-[0.7rem] left-1/2 -ml-[0.7rem] h-[1.4rem] w-[1.4rem] animate-[empuje_1.2s_ease-in-out_infinite] text-white/80" aria-hidden="true" />
              )}
            </section>
            )
          })}
        </div>

        {/* Cabecera fija encima de las pantallas */}
        <div className="pointer-events-none absolute inset-x-0 top-0 px-[1.25rem] pt-[0.6rem]">
          {/* Rayitas de progreso */}
          <div className="flex gap-[0.25rem]">
            {pantallas.map((_, i) => (
              <span key={i} className={`h-[0.15rem] flex-1 rounded-full transition-colors duration-300 ${i <= actual ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>

          <div className="mt-[0.75rem] flex items-start justify-between gap-[0.75rem]">
            <div className="min-w-0">
              <p className="font-demo-heading text-[1.5rem] leading-none">{negocio.nombre}</p>
              {negocio.lema && <p className="mt-[0.2rem] text-[0.78rem] text-white/80">{negocio.lema}</p>}
            </div>
            <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-[0.5rem]">
              <div className="flex gap-[0.2rem] rounded-full bg-black/45 p-[0.15rem] backdrop-blur-sm">
                {carta.idiomas.map(i => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={idioma === i}
                    onClick={() => setIdioma(i)}
                    className={`rounded-full px-[0.6rem] py-[0.2rem] text-[0.72rem] font-semibold transition-colors ${
                      idioma === i ? 'bg-white text-[#141414]' : 'text-white/80'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              {/* Enlace a la miniweb, solo si el negocio la tiene */}
              {carta.negocio && (
                <a
                  href={rutaNegocio(negocio)}
                  className="inline-flex items-center gap-[0.25rem] rounded-full bg-black/45 px-[0.7rem] py-[0.3rem] text-[0.75rem] font-semibold text-white backdrop-blur-sm"
                >
                  {carta.conoce ?? `Conoce ${negocio.nombre}`}
                  <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
