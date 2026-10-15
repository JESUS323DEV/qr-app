import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import Ofertas from './Ofertas'

/* Diseño de carta "ticket": la carta como un ticket de papel que flota sobre el color de la marca, con los bordes de
   arriba y abajo en zigzag, como recién cortado, y letra de máquina de escribir.
   Colores de la marca: primary es el fondo de la pantalla, surface el papel, text la tinta, accent la tinta de color
   (secciones y precios) y muted la tinta suave.
   Todo en una pantalla, sin scroll: el menú del día entero (con su "Total") y la carta sección a sección.
   Los tamaños son compactos en móviles bajos y crecen a partir de 46rem y de 56rem de alto. Las clases van escritas
   enteras (no con variables) para que Tailwind las encuentre. */

// Línea de guiones de ticket entre bloques
const GUIONES = 'border-t-2 border-dashed border-demo-text/35'

// Borde en zigzag del papel: arriba con los dientes hacia arriba y abajo hacia abajo
function Zigzag({ abajo = false }) {
  return (
    <div
      aria-hidden="true"
      className="h-[0.45rem] shrink-0"
      style={{
        background: abajo
          ? 'conic-gradient(from -45deg at bottom, var(--demo-surface) 90deg, transparent 0) 0 0 / 0.9rem 100%'
          : 'conic-gradient(from 135deg at top, var(--demo-surface) 90deg, transparent 0) 0 0 / 0.9rem 100%',
      }}
    />
  )
}

// Fila de ticket: nombre a la izquierda, precio a la derecha y puntitos entre los dos
function Fila({ nombre, precio, fuerte = false }) {
  return (
    <div className="flex items-baseline gap-[0.35rem]">
      <p className={`leading-tight ${fuerte ? 'font-bold' : ''}`}>{nombre}</p>
      <span className="mb-[0.25rem] min-w-[0.8rem] flex-1 border-b-2 border-dotted border-demo-text/30" aria-hidden="true" />
      <p className="shrink-0 font-bold text-demo-accent">{precio}</p>
    </div>
  )
}

function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <Ofertas menu={menu} />
  // Con más de 3 grupos (hasta 5) no cabrían uno debajo de otro: van en dos columnas
  const dosColumnas = menu.grupos.length > 3
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-center font-demo-heading text-[1.5rem] leading-none [@media(min-height:46rem)]:text-[1.75rem] [@media(min-height:56rem)]:text-[2rem]">{menu.titulo}</h2>
      {menu.cuando && <p className="mt-[0.25rem] text-center text-[0.82rem] text-demo-muted [@media(min-height:46rem)]:text-[0.9rem]">{menu.cuando}</p>}

      <div
        className={`mt-[0.7rem] grid gap-y-[0.55rem] [@media(min-height:46rem)]:mt-[0.95rem] [@media(min-height:46rem)]:gap-y-[0.8rem] [@media(min-height:56rem)]:gap-y-[1rem] ${
          dosColumnas ? 'grid-cols-2 gap-x-[0.9rem]' : ''
        }`}
      >
        {menu.grupos.map(g => (
          <div key={g.nombre}>
            <p className="text-[0.85rem] font-bold text-demo-accent [@media(min-height:46rem)]:text-[0.92rem] [@media(min-height:56rem)]:text-[1rem]">{g.nombre}</p>
            <ul
              className={`mt-[0.15rem] ${
                dosColumnas
                  ? 'text-[0.82rem] leading-[1.25] [@media(min-height:46rem)]:text-[0.88rem] [@media(min-height:56rem)]:text-[0.95rem]'
                  : 'text-[0.92rem] leading-[1.3] [@media(min-height:46rem)]:text-[1rem] [@media(min-height:46rem)]:leading-[1.38] [@media(min-height:56rem)]:text-[1.08rem] [@media(min-height:56rem)]:leading-[1.45]'
              }`}
            >
              {g.platos.map(p => (
                <li key={p} className="flex gap-[0.4rem]">
                  <span className="text-demo-muted" aria-hidden="true">1x</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* El precio, como el total del ticket, con lo que incluye debajo */}
      <div className={`${GUIONES} mt-auto pt-[0.6rem] [@media(min-height:46rem)]:pt-[0.8rem]`}>
        <div className="text-[1.15rem] [@media(min-height:46rem)]:text-[1.3rem] [@media(min-height:56rem)]:text-[1.45rem]">
          <Fila nombre="Total" precio={menu.precio} fuerte />
        </div>
        {menu.incluye && <p className="mt-[0.2rem] text-[0.82rem] text-demo-muted [@media(min-height:46rem)]:text-[0.9rem]">Incluye: {menu.incluye}</p>}
      </div>
    </div>
  )
}

// Una sección de la carta: platos con el precio alineado con puntitos; descripción y alérgenos debajo
function Seccion({ seccion }) {
  return (
    <ul className="grid gap-[0.5rem] [@media(min-height:46rem)]:gap-[0.75rem] [@media(min-height:56rem)]:gap-[0.95rem]">
      {seccion.platos.map(p => (
        <li key={p.nombre}>
          <div className="text-[0.95rem] [@media(min-height:46rem)]:text-[1.02rem] [@media(min-height:56rem)]:text-[1.1rem]">
            <Fila nombre={p.nombre} precio={p.precio} fuerte />
          </div>
          {(p.descripcion || p.alergenos?.length > 0) && (
            <p className="mt-[0.05rem] text-[0.8rem] leading-[1.3] text-demo-muted [@media(min-height:46rem)]:text-[0.86rem] [@media(min-height:56rem)]:text-[0.92rem]">
              {p.descripcion}
              {p.alergenos?.length > 0 && (
                <span className="whitespace-nowrap">
                  {p.descripcion ? ' ' : ''}({p.alergenos.map(a => ALERGENOS[a]?.corto).join(' · ')})
                </span>
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// Hoja con lo que significa cada abreviatura, también de papel; solo los alérgenos que salen en la carta
function HojaAlergenos({ claves, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50" onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-alergenos" onClick={e => e.stopPropagation()} className="w-full max-w-[26rem]">
        <Zigzag />
        <div className="bg-demo-surface px-[1.25rem] pb-[1.75rem] pt-[0.8rem] text-demo-text">
          <div className="flex items-center justify-between gap-[1rem]">
            <h2 id="titulo-alergenos" className="font-demo-heading text-[1.4rem] leading-none">Alérgenos</h2>
            <button type="button" onClick={cerrar} aria-label="Cerrar" className="-mr-[0.4rem] p-[0.4rem] text-demo-muted hover:text-demo-text">
              <X className="h-[1.3rem] w-[1.3rem]" />
            </button>
          </div>
          <ul className="mt-[0.8rem] grid grid-cols-2 gap-x-[1rem] gap-y-[0.35rem] text-[0.95rem]">
            {claves.map(a => (
              <li key={a}>
                <span className="font-bold text-demo-accent">{ALERGENOS[a].corto}</span> {ALERGENOS[a].nombre}
              </li>
            ))}
          </ul>
          <p className="mt-[0.9rem] text-[0.88rem] leading-[1.4] text-demo-muted">Si tienes alguna alergia o intolerancia, pregúntanos antes de pedir.</p>
        </div>
      </div>
    </div>
  )
}

export default function CartaTicket({ carta, negocio }) {
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
  // La fecha de hoy, como en un ticket de verdad
  const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="h-svh overflow-hidden bg-demo-primary px-[0.9rem] py-[1rem] font-demo-body text-demo-text [@media(min-height:46rem)]:py-[1.5rem]">
      {/* El ticket: zigzag arriba, papel y zigzag abajo, con sombra para que flote sobre el fondo */}
      <div className="mx-auto flex h-full w-full max-w-[26rem] flex-col [filter:drop-shadow(0_0.6rem_1.2rem_rgb(0_0_0/0.28))]">
        <Zigzag />
        <main className="flex min-h-0 flex-1 flex-col bg-demo-surface px-[1.1rem] pb-[0.8rem] pt-[0.6rem] [@media(min-height:46rem)]:px-[1.3rem] [@media(min-height:46rem)]:pb-[1rem]">
          {/* Cabecera del ticket: fecha e idioma, y el nombre centrado */}
          <div className="flex shrink-0 items-center justify-between gap-[0.75rem] text-[0.78rem] text-demo-muted">
            <span>{hoy}</span>
            {carta.idiomas?.length > 1 && (
              <span className="flex gap-[0.55rem]">
                {carta.idiomas.map(i => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={idioma === i}
                    onClick={() => setIdioma(i)}
                    className={idioma === i ? 'font-bold text-demo-text underline underline-offset-[0.25em]' : 'hover:text-demo-text'}
                  >
                    {i}
                  </button>
                ))}
              </span>
            )}
          </div>
          <header className="mt-[0.5rem] shrink-0 text-center [@media(min-height:46rem)]:mt-[0.8rem]">
            <h1 className="font-demo-heading text-[1.9rem] leading-none [@media(min-height:46rem)]:text-[2.2rem] [@media(min-height:56rem)]:text-[2.5rem]">{negocio.nombre}</h1>
            {negocio.lema && <p className="mt-[0.25rem] text-[0.82rem] text-demo-muted [@media(min-height:46rem)]:text-[0.9rem]">{negocio.lema}</p>}
          </header>

          {/* Menú del día y Carta */}
          <nav className={`${GUIONES} mt-[0.6rem] flex shrink-0 justify-center gap-[1.4rem] pt-[0.55rem] [@media(min-height:46rem)]:mt-[0.85rem] [@media(min-height:46rem)]:pt-[0.75rem]`}>
            {pestanas.map(p => (
              <button
                key={p.key}
                type="button"
                aria-pressed={modo === p.key}
                onClick={() => setModo(p.key)}
                className={`text-[1rem] [@media(min-height:46rem)]:text-[1.08rem] ${
                  modo === p.key ? 'font-bold underline decoration-2 underline-offset-[0.3em]' : 'text-demo-muted hover:text-demo-text'
                }`}
              >
                {p.texto}
              </button>
            ))}
          </nav>

          {/* Contenido: llena el resto del papel. Si algo no cabe (una carta muy larga), se puede deslizar solo
              esta parte, sin barra; con los contenidos normales no hace falta */}
          <div className={`${GUIONES} mt-[0.55rem] flex min-h-0 flex-1 flex-col overflow-y-auto pt-[0.7rem] [scrollbar-width:none] [@media(min-height:46rem)]:mt-[0.75rem] [@media(min-height:46rem)]:pt-[0.95rem]`}>
            {modo === 'menu' && carta.menuDia ? (
              <MenuDia menu={carta.menuDia} />
            ) : (
              <>
                <div className="-mx-[1.1rem] flex shrink-0 gap-[1rem] overflow-x-auto px-[1.1rem] [scrollbar-width:none]">
                  {carta.secciones.map(s => (
                    <button
                      key={s.nombre}
                      type="button"
                      aria-pressed={abierta?.nombre === s.nombre}
                      onClick={() => setSeccion(s.nombre)}
                      className={`shrink-0 text-[0.92rem] [@media(min-height:46rem)]:text-[1rem] ${
                        abierta?.nombre === s.nombre ? 'font-bold text-demo-accent underline decoration-2 underline-offset-[0.3em]' : 'text-demo-muted hover:text-demo-text'
                      }`}
                    >
                      {s.nombre}
                    </button>
                  ))}
                </div>
                <div className="mt-[0.75rem] [@media(min-height:46rem)]:mt-[1rem]">{abierta && <Seccion seccion={abierta} />}</div>
              </>
            )}
          </div>

          {/* Pie del ticket: código de barras de adorno, despedida y alérgenos */}
          <footer className={`${GUIONES} mt-[0.6rem] flex shrink-0 items-end justify-between gap-[1rem] pt-[0.6rem] [@media(min-height:46rem)]:mt-[0.8rem] [@media(min-height:46rem)]:pt-[0.8rem]`}>
            <div>
              <div
                aria-hidden="true"
                className="h-[1.6rem] w-[7.5rem] text-demo-text/80 [@media(min-height:46rem)]:h-[2rem]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, currentColor 0 0.12rem, transparent 0.12rem 0.25rem, currentColor 0.25rem 0.31rem, transparent 0.31rem 0.45rem, currentColor 0.45rem 0.64rem, transparent 0.64rem 0.76rem)',
                }}
              />
              <p className="mt-[0.2rem] text-[0.75rem] text-demo-muted">Gracias por venir</p>
            </div>
            {alergenos.length > 0 && modo === 'carta' && (
              <button type="button" onClick={() => setVerAlergenos(true)} className="text-[0.85rem] font-bold text-demo-muted underline underline-offset-[0.25em] hover:text-demo-text">
                Ver alérgenos
              </button>
            )}
          </footer>
        </main>
        <Zigzag abajo />
      </div>

      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
