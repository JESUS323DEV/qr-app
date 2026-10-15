import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import Img from '../Img'
import Ofertas from './Ofertas'

/* Diseño de carta "historias": como las historias de Instagram, se pasa de lado.
   La primera pantalla es el menú del día; después, cada sección de la carta (Ceviches, Arroces...) ocupa una
   pantalla con su foto de fondo y su lista de platos. Arriba, fijos: rayitas de progreso, nombre e idioma.
   En cada pantalla, justo encima de su título, Menú del día y Carta y, en la carta, sus secciones. */

// Precio del menú como en las cartas de toda la vida: los euros grandes y los céntimos pequeños y en alto.
// Si no es un precio en euros (otra moneda, un texto), se pinta tal cual.
function Precio({ texto = '' }) {
  const m = texto.trim().match(/^(\d+)(?:[.,](\d{1,2}))?\s*(?:€|e|eur|euros?)?$/i)
  return (
    // Amarillo más vivo que el de la marca, solo aquí, y una sombra oscura suave que lo separa de la foto
    <p className="flex shrink-0 items-start border-b-[0.07em] border-current pb-[0.08em] font-demo-heading text-[2.6rem] font-bold leading-none text-[#FFC72C] [text-shadow:0_0.05em_0.4em_rgb(0_0_0/0.45)] [@media(min-height:50rem)]:text-[3.2rem]">
      {m ? (
        <>
          <span>{m[1]}</span>
          <span className="ml-[0.08em] mt-[0.1em] text-[0.45em]">,{(m[2] ?? '').padEnd(2, '0')} €</span>
        </>
      ) : (
        texto
      )}
    </p>
  )
}

// Menú del día: en móviles altos (50rem de alto o más) el texto y las separaciones crecen,
// para llenar la pantalla en vez de dejar un hueco vacío entre las pestañas y el menú
function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <Ofertas menu={menu} sobreFoto />
  return (
    <div>
      <div className="flex items-baseline justify-between gap-[1rem]">
        <h1 className="font-demo-heading text-[2rem] leading-none [@media(min-height:50rem)]:text-[2.6rem]">{menu.titulo}</h1>
        <Precio texto={menu.precio} />
      </div>
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

      {menu.incluye && (
        <p className="mt-[0.9rem] border-t border-white/20 pt-[0.7rem] text-[0.82rem] leading-[1.4] text-white/75 [@media(min-height:50rem)]:mt-[1.3rem] [@media(min-height:50rem)]:pt-[0.9rem] [@media(min-height:50rem)]:text-[0.95rem]">{menu.incluye}</p>
      )}
    </div>
  )
}

// Sección de la carta (Ceviches, Arroces...): título y lista de platos con precio; descripción y alérgenos en una línea.
// Como el menú del día, crece un poco en móviles altos.
function Seccion({ seccion, verAlergenos }) {
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
      {verAlergenos && (
        <button type="button" onClick={verAlergenos} className="mt-[0.8rem] text-[0.8rem] font-semibold text-white/75 underline underline-offset-[0.2em] hover:text-white">
          Ver alérgenos
        </button>
      )}
    </div>
  )
}

// Hoja que sube desde abajo con lo que significa cada abreviatura; solo los alérgenos que salen en la carta
function HojaAlergenos({ claves, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-alergenos"
        onClick={e => e.stopPropagation()}
        className="rounded-t-[1.25rem] bg-[#161616] px-[1.25rem] pb-[1.75rem] pt-[1.1rem]"
      >
        <div className="flex items-center justify-between gap-[1rem]">
          <h2 id="titulo-alergenos" className="font-demo-heading text-[1.5rem] leading-none">Alérgenos</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="-mr-[0.4rem] p-[0.4rem] text-white/75 hover:text-white">
            <X className="h-[1.3rem] w-[1.3rem]" />
          </button>
        </div>
        <ul className="mt-[1rem] grid grid-cols-2 gap-x-[1rem] gap-y-[0.6rem]">
          {claves.map(a => (
            <li key={a} className="flex items-center gap-[0.5rem] text-[0.9rem]">
              <span className="w-[1.9rem] shrink-0 rounded-full border border-white/30 text-center text-[0.68rem] font-semibold text-white/75">{ALERGENOS[a].corto}</span>
              {ALERGENOS[a].nombre}
            </li>
          ))}
        </ul>
        <p className="mt-[1.1rem] text-[0.8rem] leading-[1.4] text-white/60">Si tienes alguna alergia o intolerancia, pregúntanos antes de pedir.</p>
      </div>
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
    ...(primeraSeccion !== -1 ? [{ key: 'seccion', texto: carta.textoCarta ?? 'Carta', i: primeraSeccion }] : []),
  ]
  const secciones = pantallas.flatMap((p, i) => (p.tipo === 'seccion' ? [{ texto: p.seccion.nombre, i }] : []))

  // Alérgenos que salen en algún plato de la carta, en el orden oficial; la hoja solo enseña esos
  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))
  const [verAlergenos, setVerAlergenos] = useState(false)

  const pastilla = activa =>
    `shrink-0 rounded-full font-semibold backdrop-blur-sm transition-colors ${
      activa ? 'bg-white text-[#141414]' : 'bg-black/40 text-white hover:bg-black/55'
    }`

  // Alto de la cabecera fija (rayitas, nombre e idioma): ningún contenido empieza por encima de ella
  const cabecera = useRef(null)
  const [altoCabecera, setAltoCabecera] = useState(0)
  useLayoutEffect(() => {
    const el = cabecera.current
    if (!el) return
    const medir = () => setAltoCabecera(el.offsetHeight)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Altura a la que quedan las pestañas en el menú del día (va pegado abajo y su alto cambia con el móvil;
  // si es tan largo que no cabe, empieza bajo la cabecera y se desliza hacia abajo).
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
  }, [altoCabecera])

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
            <section key={i} className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden">
              <Img src={p.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {/* Degradado de arriba, donde la foto se ve bien, a abajo, oscuro bajo el texto */}
              {/* En la carta, más oscuro: la lista de platos es más larga y la foto se mezclaba con el texto */}
              <div
                className={`absolute inset-0 bg-gradient-to-b via-45% ${
                  p.tipo === 'seccion' ? 'from-black/50 via-black/75 to-black/90' : 'from-black/25 via-black/60 to-black/90'
                }`}
              />
              {/* El contenido empieza bajo la cabecera y, si no cabe, se desliza hacia abajo; al subir se difumina
                  en ese borde en vez de pasar por debajo del nombre. En el menú, mt-auto lo pega abajo cuando cabe
                  (con justify-end no se podría deslizar hasta su principio). */}
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col overflow-y-auto overscroll-contain px-[1.25rem] pb-[2.75rem] [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent,black_1rem)]"
                style={{ top: altoCabecera, paddingTop: alineado ? `max(${arriba}px, 1rem)` : '1rem' }}
              >
              <div ref={p.tipo === 'menu' ? bloqueMenu : undefined} className={`relative ${p.tipo === 'menu' ? 'mt-auto' : ''}`}>
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
                {p.tipo === 'menu' ? <MenuDia menu={carta.menuDia} /> : <Seccion seccion={p.seccion} verAlergenos={alergenos.length > 0 ? () => setVerAlergenos(true) : undefined} />}
              </div>
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
        <div ref={cabecera} className="pointer-events-none absolute inset-x-0 top-0 px-[1.25rem] pt-[0.6rem]">
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
            </div>
          </div>
        </div>

        {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
      </div>
    </div>
  )
}
