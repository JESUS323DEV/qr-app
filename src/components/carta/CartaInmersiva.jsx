import { estiloPrecio, ZOOM_NOMBRE } from './precio'
import { Editable } from '../../lib/edicionPanel'
import { useState } from 'react'
import { ALERGENOS } from '../../cartas'
import Img from '../Img'
import Ofertas from './Ofertas'
import EnlaceNegocio, { ladoEnlace } from './EnlaceNegocio'

/* Diseño de carta "inmersiva": la foto ocupa toda la pantalla y se queda quieta detrás.
   El overlay casi no la tapa arriba y oscurece abajo en degradado.
   Arriba a la izquierda el nombre; arriba a la derecha idioma y enlace a la miniweb. Las pestañas (Menú del día y Carta, y las secciones) van
   en una fila debajo del nombre (la base) o, con el subdiseño carta.subdiseno = 'columna', en columna debajo del nombre.
   El contenido empieza abajo, encima de la foto, y sube por encima de ella al deslizar. */

// Menú del día: cabe en una pantalla. Un solo bloque con separaciones fijas; en móviles altos
// (50rem de alto o más) el texto crece un poco. Si sobra espacio, queda abajo, debajo del precio.
function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <Ofertas menu={menu} sobreFoto estilo="inmersiva" />
  return (
    <div>
      <Editable campo="titulo" como="h1" className="text-[color:var(--c-menu-titulo,inherit)] font-demo-heading text-[1.75rem] leading-none [@media(min-height:50rem)]:text-[2.1rem]">{menu.titulo}</Editable>
      <Editable campo="cuando" como="p" className="mt-[0.25rem] text-[0.8rem] text-[color:var(--c-menu-cuando,rgb(255_255_255/0.7))] [@media(min-height:50rem)]:mt-[0.35rem] [@media(min-height:50rem)]:text-[0.88rem]">{menu.cuando}</Editable>

      <div className="mt-[0.7rem] grid gap-[0.7rem] [@media(min-height:50rem)]:mt-[0.9rem] [@media(min-height:50rem)]:gap-[0.9rem]">
        {menu.grupos.map((g, i) => (
          <Editable key={g.nombre} campo={`grupo:${menu._indices?.[i] ?? i}`} como="div" bloque className="border-t border-dashed border-white/25 pt-[0.5rem] [@media(min-height:50rem)]:pt-[0.7rem]">
            <p className="font-demo-heading text-[1rem] leading-none text-[color:var(--c-seccion,var(--demo-accent))] [@media(min-height:50rem)]:text-[1.2rem]">{g.nombre}</p>
            <ul className="mt-[0.3rem] text-[0.9rem] leading-[1.35] [@media(min-height:50rem)]:mt-[0.4rem] [@media(min-height:50rem)]:text-[1.02rem] [@media(min-height:50rem)]:leading-[1.45]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </Editable>
        ))}
      </div>

      <div className="mt-[0.7rem] flex items-end justify-between gap-[1rem] border-t border-dashed border-white/25 pt-[0.6rem] [@media(min-height:50rem)]:mt-[0.9rem] [@media(min-height:50rem)]:pt-[0.8rem]">
        <Editable campo="incluye" como="p" className="text-[0.8rem] leading-[1.4] text-white/70 [@media(min-height:50rem)]:text-[0.88rem]">{menu.incluye}</Editable>
        <Editable campo="precio" como="p" className="shrink-0 whitespace-nowrap precio-detalle font-demo-heading text-[length:calc(1.75rem*var(--demo-precio-escala,1))] leading-none text-[color:var(--demo-precio-texto,#fff)] [@media(min-height:50rem)]:text-[length:calc(2.1rem*var(--demo-precio-escala,1))]">{menu.precio}</Editable>
      </div>
    </div>
  )
}

// Sección de la carta abierta (Entradas, Principales...): los platos en tarjetas de cristal, de dos en dos, sobre la foto fija de fondo.
// Cada tarjeta lleva su foto arriba (si la tiene), el nombre, el precio, la descripción y los alérgenos; sin foto, solo el texto
function Seccion({ seccion }) {
  return (
    <div>
      <h2 className="font-demo-heading text-[1.6rem] leading-none">{seccion.nombre}</h2>
      <ul className="mt-[0.8rem] grid grid-cols-2 items-start gap-[0.7rem] [@media(min-height:50rem)]:gap-[0.9rem]">
        {seccion.platos.map(p => (
          <li key={p.nombre} className="overflow-hidden rounded-[0.9rem] border border-white/20 bg-black/35 backdrop-blur-md">
            {p.foto && (
              <div className="relative aspect-[4/3] w-full bg-white/10">
                <Img src={p.foto} alt={p.nombre} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <div className="px-[0.7rem] pb-[0.7rem] pt-[0.55rem] [@media(min-height:50rem)]:px-[0.85rem] [@media(min-height:50rem)]:pb-[0.85rem] [@media(min-height:50rem)]:pt-[0.7rem]">
              <p className="text-[0.95rem] font-semibold leading-tight [@media(min-height:50rem)]:text-[1.05rem]">{p.nombre}</p>
              <p className="mt-[0.2rem] font-demo-heading text-[1.05rem] font-bold leading-none text-demo-accent [@media(min-height:50rem)]:text-[1.2rem]" style={estiloPrecio('var(--demo-accent)')}>
                {p.precio}
                {p.antes && <span className="ml-[0.4rem] text-[0.8rem] font-normal text-white/60 line-through">{p.antes}</span>}
              </p>
              {p.descripcion && <p className="mt-[0.3rem] text-[0.8rem] leading-[1.35] text-white/75 [@media(min-height:50rem)]:text-[0.88rem]">{p.descripcion}</p>}
              {p.alergenos?.length > 0 && (
                <ul className="mt-[0.4rem] flex flex-wrap gap-[0.25rem]">
                  {p.alergenos.map(a => (
                    <li key={a} title={ALERGENOS[a]?.nombre} className="rounded-full border border-white/30 px-[0.4rem] py-[0.02rem] text-[0.65rem] font-semibold text-white/75">
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

export default function CartaInmersiva({ carta, negocio, foto }) {
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccionActiva, setSeccionActiva] = useState(carta.secciones?.[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const seccion = carta.secciones.find(s => s.nombre === seccionActiva)
  const columna = carta.subdiseno === 'columna'
  const lado = ladoEnlace(carta, 'derecha')
  // El velo que oscurece la foto: su intensidad (carta.filtroFoto, de 0 a 100; 100 es el de siempre) y su color (carta.colorFiltro; sin él, negro)
  const k = Math.max(0, Math.min(100, Number(carta.filtroFoto ?? 100))) / 100
  const rgb = (/^#[0-9a-f]{6}$/i.test(carta.colorFiltro ?? '') ? [1, 3, 5].map(n => parseInt(carta.colorFiltro.slice(n, n + 2), 16)) : [0, 0, 0]).join(' ')
  const velo = a => `rgb(${rgb} / ${(a * k).toFixed(3)})`

  const principales = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
  ]

  return (
    <div className="min-h-svh bg-[#0d0d0c] font-demo-body text-white">
      {/* Foto fija de fondo, con el overlay: casi limpio arriba y oscuro abajo */}
      <div className="fixed inset-y-0 left-1/2 w-full max-w-[30rem] -translate-x-1/2">
        <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to bottom, ${velo(0.3)} 0%, ${velo(0.1)} 40%, ${velo(0.9)} 100%)` }} />
      </div>

      <main className="relative mx-auto flex min-h-svh w-full max-w-[30rem] flex-col">
        {/* Nombre y pestañas arriba, sobre la foto casi limpia */}
        <div className="flex items-start justify-between gap-[0.75rem] px-[1.25rem] pb-[0.5rem] pt-[1rem]">
          <div className="min-w-0">
            {lado === 'izquierda' && <EnlaceNegocio carta={carta} negocio={negocio} className="mb-[0.5rem] inline-flex items-center gap-[0.25rem] rounded-full bg-black/45 px-[0.7rem] py-[0.3rem] text-[0.75rem] font-semibold text-white backdrop-blur-sm" />}
            <p className="text-[color:var(--c-nombre,inherit)] font-demo-heading text-[2.4rem] leading-[0.95] [text-shadow:0_0.1rem_1rem_rgb(0_0_0/0.35)]" style={ZOOM_NOMBRE}>{negocio.nombre}</p>
            {negocio.lema && <p className="mt-[0.35rem] text-[0.85rem] text-white/85">{negocio.lema}</p>}

            {/* Subdiseño en columna: Menú del día y Carta, en columna debajo del nombre */}
            {columna && (
            <nav className="mt-[1.1rem] flex flex-col items-start gap-[0.4rem]">
              {principales.map(p => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={modo === p.key}
                  onClick={() => setModo(p.key)}
                  className={`rounded-full px-[1rem] py-[0.45rem] text-[0.9rem] font-semibold backdrop-blur-sm transition-colors ${
                    modo === p.key ? 'bg-white text-[#141414]' : 'bg-black/40 text-white hover:bg-black/55'
                  }`}
                >
                  {p.texto}
                </button>
              ))}

              {/* Con la carta abierta, sus secciones debajo, más pequeñas y con una línea que las cuelga de "Carta" */}
              {modo === 'carta' && (
                <div className="ml-[0.9rem] flex flex-col items-start gap-[0.3rem] border-l border-white/30 pl-[0.6rem]">
                  {carta.secciones.map(s => (
                    <button
                      key={s.nombre}
                      type="button"
                      aria-pressed={seccionActiva === s.nombre}
                      onClick={() => setSeccionActiva(s.nombre)}
                      className={`rounded-full border px-[0.85rem] py-[0.3rem] text-[0.8rem] font-semibold backdrop-blur-sm transition-colors ${
                        seccionActiva === s.nombre ? 'border-white bg-white/15 text-white' : 'border-transparent bg-black/40 text-white/80 hover:text-white'
                      }`}
                    >
                      {s.nombre}
                    </button>
                  ))}
                </div>
              )}
            </nav>
            )}
          </div>

          {/* Idioma y enlace a la miniweb */}
          <div className="flex shrink-0 flex-col items-end gap-[0.5rem]">
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
            {/* Enlace a la miniweb, solo si la carta es de un negocio con ficha */}
            {lado === 'derecha' && <EnlaceNegocio carta={carta} negocio={negocio} className="inline-flex items-center gap-[0.25rem] rounded-full bg-black/45 px-[0.7rem] py-[0.3rem] text-[0.75rem] font-semibold text-white backdrop-blur-sm" />}
          </div>
        </div>

        {/* La base, como en los demás estilos: las pestañas (Menú del día y Carta) en texto, la elegida subrayada, y con la carta abierta sus grupos en una fila que se desplaza de lado */}
        {!columna && (
          <nav className="px-[1.25rem] pb-[0.5rem] [text-shadow:0_0.1rem_0.6rem_rgb(0_0_0/0.55)]">
            <div className="flex gap-[1.3rem]">
              {principales.map(p => (
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
            </div>
            {modo === 'carta' && (
              <div className="-mx-[1.25rem] mt-[0.5rem] flex gap-[1.1rem] overflow-x-auto px-[1.25rem] [scrollbar-width:none]">
                {carta.secciones.map(s => (
                  <button
                    key={s.nombre}
                    type="button"
                    aria-pressed={seccionActiva === s.nombre}
                    onClick={() => setSeccionActiva(s.nombre)}
                    className={`shrink-0 font-demo-heading text-[1.45rem] font-bold leading-none [@media(min-height:46rem)]:text-[1.65rem] ${seccionActiva === s.nombre ? 'text-white' : 'text-white/55 hover:text-white'}`}
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
            )}
          </nav>
        )}

        {/* Contenido justo debajo de las pestañas, encima de la foto: un oscurecido suave detrás
            deja ver la foto apagada sin pelearse con el texto */}
        <div
          className={`flex flex-1 flex-col px-[1.25rem] ${modo === 'menu' ? 'pb-[1rem] pt-[1rem]' : 'pb-[2.5rem] pt-[1.5rem]'}`}
          style={{ background: `linear-gradient(to bottom, rgb(${rgb} / 0), ${velo(0.6)} 3rem, ${velo(0.75)})` }}
        >
          {modo === 'menu' && carta.menuDia && <MenuDia menu={carta.menuDia} />}
          {modo === 'carta' && seccion && <Seccion seccion={seccion} />}
        </div>
      </main>
    </div>
  )
}
