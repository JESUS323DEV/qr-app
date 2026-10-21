import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import { rutaNegocio } from '../../negocios'
import Img from '../Img'
import Ofertas from './Ofertas'

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
      <h1 className="font-demo-heading text-[1.75rem] leading-none [@media(min-height:50rem)]:text-[2.1rem]">{menu.titulo}</h1>
      <p className="mt-[0.25rem] text-[0.8rem] text-white/70 [@media(min-height:50rem)]:mt-[0.35rem] [@media(min-height:50rem)]:text-[0.88rem]">{menu.cuando}</p>

      <div className="mt-[0.7rem] grid gap-[0.7rem] [@media(min-height:50rem)]:mt-[0.9rem] [@media(min-height:50rem)]:gap-[0.9rem]">
        {menu.grupos.map(g => (
          <div key={g.nombre} className="border-t border-dashed border-white/25 pt-[0.5rem] [@media(min-height:50rem)]:pt-[0.7rem]">
            <p className="font-demo-heading text-[1rem] leading-none text-demo-accent [@media(min-height:50rem)]:text-[1.2rem]">{g.nombre}</p>
            <ul className="mt-[0.3rem] text-[0.9rem] leading-[1.35] [@media(min-height:50rem)]:mt-[0.4rem] [@media(min-height:50rem)]:text-[1.02rem] [@media(min-height:50rem)]:leading-[1.45]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-[0.7rem] flex items-end justify-between gap-[1rem] border-t border-dashed border-white/25 pt-[0.6rem] [@media(min-height:50rem)]:mt-[0.9rem] [@media(min-height:50rem)]:pt-[0.8rem]">
        <p className="text-[0.8rem] leading-[1.4] text-white/70 [@media(min-height:50rem)]:text-[0.88rem]">{menu.incluye}</p>
        <p className="shrink-0 whitespace-nowrap precio-detalle font-demo-heading text-[length:calc(1.75rem*var(--demo-precio-escala,1))] leading-none text-[color:var(--demo-precio-texto,#fff)] [@media(min-height:50rem)]:text-[length:calc(2.1rem*var(--demo-precio-escala,1))]">{menu.precio}</p>
      </div>
    </div>
  )
}

// Sección de la carta abierta (Pollastres, Acompanyaments...)
function Seccion({ seccion }) {
  return (
    <div>
      <h2 className="font-demo-heading text-[1.6rem] leading-none">{seccion.nombre}</h2>
      <ul className="mt-[0.8rem] border-t border-white/15">
        {seccion.platos.map(p => (
          <li key={p.nombre} className="border-b border-white/15 py-[0.85rem]">
            <div className="flex items-baseline justify-between gap-[1rem]">
              <p className="font-semibold">{p.nombre}</p>
              <p className="shrink-0 font-semibold">{p.precio}</p>
            </div>
            {p.descripcion && <p className="mt-[0.15rem] text-[0.88rem] leading-[1.45] text-white/70">{p.descripcion}</p>}
            {p.alergenos?.length > 0 && (
              <ul className="mt-[0.45rem] flex flex-wrap gap-[0.3rem]">
                {p.alergenos.map(a => (
                  <li key={a} title={ALERGENOS[a]?.nombre} className="rounded-full border border-white/30 px-[0.45rem] py-[0.05rem] text-[0.68rem] font-semibold text-white/75">
                    {ALERGENOS[a]?.corto}
                  </li>
                ))}
              </ul>
            )}
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

  const principales = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
  ]

  return (
    <div className="min-h-svh bg-[#0d0d0c] font-demo-body text-white">
      {/* Foto fija de fondo, con el overlay: casi limpio arriba y oscuro abajo */}
      <div className="fixed inset-y-0 left-1/2 w-full max-w-[30rem] -translate-x-1/2">
        <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 via-40% to-black/90" />
      </div>

      <main className="relative mx-auto flex min-h-svh w-full max-w-[30rem] flex-col">
        {/* Nombre y pestañas arriba, sobre la foto casi limpia */}
        <div className="flex items-start justify-between gap-[0.75rem] px-[1.25rem] pb-[0.5rem] pt-[1rem]">
          <div className="min-w-0">
            <p className="font-demo-heading text-[2.4rem] leading-[0.95] [text-shadow:0_0.1rem_1rem_rgb(0_0_0/0.35)]">{negocio.nombre}</p>
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

        {/* La base: las pestañas en una fila (Menú del día y Carta) y, con la carta abierta, sus secciones en otra fila (que salta de línea si no caben) */}
        {!columna && (
          <nav className="px-[1.25rem] pb-[0.5rem]">
            <div className="flex flex-wrap gap-[0.4rem]">
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
            </div>
            {modo === 'carta' && (
              <div className="mt-[0.4rem] flex flex-wrap gap-[0.3rem]">
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

        {/* Contenido justo debajo de las pestañas, encima de la foto: un oscurecido suave detrás
            deja ver la foto apagada sin pelearse con el texto */}
        <div
          className={`flex flex-1 flex-col px-[1.25rem] ${modo === 'menu' ? 'pb-[1rem] pt-[1rem]' : 'pb-[2.5rem] pt-[1.5rem]'}`}
          style={{ background: 'linear-gradient(to bottom, rgb(0 0 0 / 0), rgb(0 0 0 / 0.6) 3rem, rgb(0 0 0 / 0.75))' }}
        >
          {modo === 'menu' && carta.menuDia && <MenuDia menu={carta.menuDia} />}
          {modo === 'carta' && seccion && <Seccion seccion={seccion} />}
        </div>
      </main>
    </div>
  )
}
