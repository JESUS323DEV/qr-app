import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FAMILIAS } from '../familias'
import { marcaDePrueba } from '../lib/prueba'

// Estilos de carta que existen (los que se pueden probar con ?diseno=)
const ESTILOS_CARTA = new Set(Object.values(FAMILIAS).map(f => f.carta).filter(Boolean))
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cartas, fotoDe, rutaCarta, ALERGENOS } from '../cartas'
import DemoPager from '../components/DemoPager'
import DemoHomeButton from '../components/DemoHomeButton'
import { rutaNegocio } from '../negocios'
import { applyTheme, resetTheme } from '../lib/applyTheme'
import Img from '../components/Img'
import { supabase } from '../lib/supabase'
import { menuActivo, textoHorario } from '../lib/horarioMenu'
import { conEdicion, useEdicion } from '../lib/ediciones'
import CartaInmersiva from '../components/carta/CartaInmersiva'
import CartaRevista from '../components/carta/CartaRevista'
import CartaPolaroid from '../components/carta/CartaPolaroid'
import CartaGaleria from '../components/carta/CartaGaleria'
import Ofertas from '../components/carta/Ofertas'

/* Carta digital (QR de la mesa), con la marca del negocio.
   Arriba una franja con foto y el nombre; debajo, fija al hacer scroll, la barra con el idioma y las pestañas
   (Menú del día y las secciones de la carta). Aquí sí hay scroll dentro de cada pestaña: una carta no cabe en una pantalla. */

const OCULTAR_FLECHAS_MS = 2500

/* Fila de pestañas que se desliza de lado, con flechas a los lados.
   Las flechas están escondidas: aparecen al tocar la fila y se esconden solas a los 2,5 s sin tocarla.
   Solo sale la que sirve (al principio solo la derecha, al final solo la izquierda). */
function FilaPestanas({ children }) {
  const fila = useRef(null)
  const timer = useRef(null)
  const [visibles, setVisibles] = useState(false)
  const [puede, setPuede] = useState({ izq: false, der: false })

  const medir = () => {
    const f = fila.current
    if (!f) return
    setPuede({ izq: f.scrollLeft > 4, der: f.scrollLeft + f.clientWidth < f.scrollWidth - 4 })
  }

  const mostrar = () => {
    medir()
    setVisibles(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisibles(false), OCULTAR_FLECHAS_MS)
  }

  useEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('resize', medir)
      clearTimeout(timer.current)
    }
  }, [])

  const mover = direccion => {
    const f = fila.current
    f?.scrollBy({ left: direccion * f.clientWidth * 0.7, behavior: 'smooth' })
    mostrar()
  }

  const flecha = (lado, activa) =>
    `absolute inset-y-0 ${lado} flex w-[2.6rem] items-center transition-opacity duration-300 ${
      visibles && activa ? 'opacity-100' : 'pointer-events-none opacity-0'
    }`

  return (
    <div className="relative" onTouchStart={mostrar} onMouseDown={mostrar}>
      <nav ref={fila} onScroll={medir} className="flex gap-[0.4rem] overflow-x-auto px-[1.25rem] py-[0.7rem] [scrollbar-width:none]">
        {children}
      </nav>
      <button
        type="button"
        aria-label="Ver pestañas anteriores"
        onClick={() => mover(-1)}
        className={`${flecha('left-0', puede.izq)} justify-start bg-gradient-to-r from-demo-bg via-demo-bg/90 to-transparent pl-[0.4rem]`}
      >
        <ChevronLeft className="h-[1.2rem] w-[1.2rem]" />
      </button>
      <button
        type="button"
        aria-label="Ver más pestañas"
        onClick={() => mover(1)}
        className={`${flecha('right-0', puede.der)} justify-end bg-gradient-to-l from-demo-bg via-demo-bg/90 to-transparent pr-[0.4rem]`}
      >
        <ChevronRight className="h-[1.2rem] w-[1.2rem]" />
      </button>
    </div>
  )
}

function Alergenos({ lista }) {
  if (!lista?.length) return null
  return (
    <ul className="mt-[0.45rem] flex flex-wrap gap-[0.3rem]">
      {lista.map(a => (
        <li
          key={a}
          title={ALERGENOS[a]?.nombre}
          className="rounded-full border border-demo-text/20 px-[0.45rem] py-[0.05rem] text-[0.68rem] font-semibold text-demo-muted"
        >
          {ALERGENOS[a]?.corto}
        </li>
      ))}
    </ul>
  )
}

function MenuDia({ menu }) {
  // Perfil de belleza o de tienda: en el hueco del menú del día van las ofertas
  if (menu.ofertas) return <div className="rounded-[1.1rem] bg-demo-surface px-[1rem] py-[1rem]"><Ofertas menu={menu} /></div>
  return (
    <div className="rounded-[1.1rem] bg-demo-surface px-[1rem] py-[0.8rem]">
      <h1 className="font-demo-heading text-[1.5rem] leading-none">{menu.titulo}</h1>
      <p className="mt-[0.25rem] text-[0.8rem] text-demo-muted">{menu.cuando}</p>

      <div className="mt-[0.6rem] grid gap-[0.45rem]">
        {menu.grupos.map(g => (
          <div key={g.nombre} className="border-t border-dashed border-demo-text/20 pt-[0.4rem]">
            <p className="font-demo-heading text-[1rem] leading-[1.2] text-demo-accent">{g.nombre}</p>
            <ul className="mt-[0.15rem] grid gap-0 text-[0.88rem] leading-[1.35]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-[0.6rem] flex items-end justify-between gap-[1rem] border-t border-dashed border-demo-text/20 pt-[0.5rem]">
        <p className="text-[0.8rem] leading-[1.4] text-demo-muted">{menu.incluye}</p>
        <p className="shrink-0 font-demo-heading text-[1.5rem] leading-none text-demo-primary">{menu.precio}</p>
      </div>
    </div>
  )
}

function Seccion({ seccion }) {
  return (
    <div>
      <h2 className="font-demo-heading text-[1.6rem] leading-none">{seccion.nombre}</h2>
      <ul className="mt-[0.8rem] border-t border-demo-text/10">
        {seccion.platos.map(p => (
          <li key={p.nombre} className="border-b border-demo-text/10 py-[0.85rem]">
            <div className="flex items-baseline justify-between gap-[1rem]">
              <p className="font-semibold">{p.nombre}</p>
              <p className="shrink-0 font-semibold text-demo-primary">{p.precio}</p>
            </div>
            {p.descripcion && <p className="mt-[0.15rem] text-[0.88rem] leading-[1.45] text-demo-muted">{p.descripcion}</p>}
            <Alergenos lista={p.alergenos} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Lo que el dueño cambia desde el panel vive en Supabase (tabla cartas): el menú del día, si hoy hay menú
   y, más adelante, la carta por secciones. Se junta con el archivo de la carta (diseño, marca, fotos...).
   Si la carta no está en Supabase, o Supabase no responde, se usa tal cual el archivo. */
function useCartaRemota(slug) {
  // Se guarda de qué carta es lo leído: al pasar a otra con las flechas, se espera a la nueva (no se usa la anterior)
  const [leido, setLeido] = useState({ slug: null, fila: null })

  useEffect(() => {
    if (!supabase) return
    let vivo = true

    const leer = () =>
      supabase
        .from('cartas')
        // Todo: así sirve tenga o no la columna de ofertas (supabase/008_ofertas.sql)
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
        .then(({ data }) => vivo && setLeido({ slug, fila: data ?? null }))
        .catch(() => vivo && setLeido({ slug, fila: null }))
    leer()

    // En directo: cuando el dueño publica desde el panel, la carta abierta se actualiza sola, sin recargar
    const canal = supabase
      .channel(`carta-${slug}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cartas', filter: `slug=eq.${slug}` }, ({ new: fila }) => {
        if (vivo) setLeido({ slug, fila })
      })
      .subscribe()

    // Al volver a la pestaña (móvil bloqueado, otra app...) se vuelve a leer, por si se cortó la conexión en directo
    const alVolver = () => document.visibilityState === 'visible' && leer()
    document.addEventListener('visibilitychange', alVolver)

    return () => {
      vivo = false
      supabase.removeChannel(canal)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [slug])

  return { cargando: Boolean(supabase) && leido.slug !== slug, fila: leido.slug === slug ? leido.fila : null }
}

const juntar = (carta, fila) => {
  if (!carta || !fila) return carta
  return {
    ...carta,
    // Del archivo se quedan las cosas fijas del menú (su texto de pestaña, su foto); lo editable viene de Supabase
    menuDia: fila.hay_menu === false ? null : fila.menu_dia ? { ...carta.menuDia, ...fila.menu_dia } : carta.menuDia,
    secciones: fila.secciones ?? carta.secciones,
    // Ofertas (perfil de belleza o de tienda): las del dueño, si las ha publicado; si no, las del archivo
    ofertas: fila.ofertas ? { ...carta.ofertas, ...fila.ofertas } : carta.ofertas,
  }
}

// Fecha de hoy en España, como "2026-10-15"
const hoyEnEspana = ahora => ahora.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

/* Perfil de belleza o de tienda: el hueco del menú del día lo ocupan las ofertas que están en fecha
   (desde y hasta, si las tienen). Las caducadas desaparecen solas; si no queda ninguna, la pestaña tampoco sale.
   ofertas: { texto (pestaña), titulo, cuando?, foto?, lista[{ nombre, descripcion?, precio, antes?, desde?, hasta? }] } */
const conOfertas = (carta, ahora) => {
  if (!carta?.ofertas) return carta
  const hoy = hoyEnEspana(ahora)
  const vigentes = (carta.ofertas.lista ?? []).filter(o => (!o.desde || o.desde <= hoy) && (!o.hasta || o.hasta >= hoy))
  if (vigentes.length === 0) return { ...carta, menuDia: null }
  const o = carta.ofertas
  return { ...carta, menuDia: { texto: o.texto ?? 'Ofertas', titulo: o.titulo ?? 'Ofertas', cuando: o.cuando, foto: o.foto, fotos: o.fotos, ofertas: vigentes } }
}

/* Horario del menú del día: fuera de él, la carta no lo enseña; dentro, el "cuándo se sirve" se escribe solo
   a partir del horario ("De lunes a viernes, de 12 a 17 h"), para que nunca diga una cosa y haga otra */
const conHorario = (carta, ahora) => {
  const menu = carta?.menuDia
  if (!menu?.horario?.dias?.length) return carta
  if (!menuActivo(menu.horario, ahora)) return { ...carta, menuDia: null }
  return { ...carta, menuDia: { ...menu, cuando: textoHorario(menu.horario) } }
}

// La hora actual, que se renueva cada minuto: así, a la hora en que acaba el menú, la carta abierta lo quita sola
function useAhora() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  return ahora
}

// Al pasar de una carta a otra con las flechas, la página empieza de cero (pestañas, sección e idioma)
export default function CartaPage(props) {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const pruebaDiseno = params.get('diseno')
  // ?incrustada=1: la carta dentro de la pestaña del menú de una miniweb (sin flechas de demos ni enlace de vuelta a la miniweb)
  const incrustada = params.get('incrustada') === '1'
  const { cargando, fila } = useCartaRemota(slug)
  const ahora = useAhora()
  // Cambios de /admin: los de la carta (textos, fotos, platos; o una copia, que solo vive en Supabase)
  // y los de la marca de su negocio (nombre, colores). Una carta sin negocio lleva su propia marca (marca).
  const edicionCarta = useEdicion('carta', slug)
  const conCambios = useMemo(
    () => (edicionCarta.cargando ? null : conEdicion('carta', slug, edicionCarta.fila)),
    [slug, edicionCarta.cargando, edicionCarta.fila],
  )
  const edicionMarca = useEdicion('negocio', conCambios?.negocio)
  const negocio = useMemo(() => {
    if (!conCambios) return null
    const marca = conCambios.negocio ? conEdicion('negocio', conCambios.negocio, edicionMarca.fila) : conCambios.marca ?? null
    // En las demos: nombre, colores y tipografía de prueba desde la dirección (vista previa de /admin)
    return conCambios.demo ? marcaDePrueba(marca, params) : marca
  }, [conCambios, edicionMarca.fila, params])
  // Mientras llega lo de Supabase no se pinta nada, para no enseñar un momento el menú antiguo
  if (cargando || edicionCarta.cargando || edicionMarca.cargando) return null
  let carta = conOfertas(conHorario(juntar(conCambios, fila), ahora), ahora)
  // En las demos, el estilo de carta se puede probar desde la dirección (?diseno=polaroid): lo usa /admin
  if (carta?.demo && ESTILOS_CARTA.has(pruebaDiseno)) carta = { ...carta, diseno: pruebaDiseno }
  if (incrustada && carta) carta = { ...carta, negocio: null }
  // La clave cambia si el menú del día aparece o desaparece (horario, interruptor): la carta empieza de cero
  // en lo que toca, y no se queda en blanco en la pestaña del menú que ya no existe
  return <Carta key={`${slug}-${Boolean(carta?.menuDia)}`} carta={carta} negocio={negocio} incrustada={incrustada} {...props} />
}

function Carta({ carta, negocio, demo = false, incrustada = false }) {
  // Dos niveles: Menú del día o Carta; dentro de Carta, las secciones
  const [modo, setModo] = useState(carta?.menuDia ? 'menu' : 'carta')
  const [seccionActiva, setSeccionActiva] = useState(carta?.secciones?.[0]?.nombre)
  const [idioma, setIdioma] = useState(carta?.idiomas?.[0] ?? 'ES')
  const [verAlergenos, setVerAlergenos] = useState(false)

  useEffect(() => {
    if (!negocio) return
    applyTheme(negocio.theme)
    document.title = `Carta · ${negocio.nombre}`
    return resetTheme
  }, [negocio])

  if (!carta || !negocio || (demo && !carta.demo)) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-center">
        <p>Esta carta no existe.</p>
      </main>
    )
  }

  // En las demos, las mismas flechas y botón de inicio que en las miniwebs, para pasar de una carta a otra
  const navegacion = demo && !incrustada && (
    <>
      {/* Las copias para enseñar a un negocio no llevan flechas: no están en el catálogo */}
      {!carta.copia && <DemoPager negocio={carta} secuencia={cartas.filter(c => c.demo)} rutaDe={rutaCarta} conTransicion={false} />}
      <DemoHomeButton slug={carta.slug} />
    </>
  )

  // Diseño inmersiva: foto a pantalla completa y el contenido encima
  if (carta.diseno === 'inmersiva') {
    return (
      <>
        <CartaInmersiva carta={carta} negocio={negocio} foto={carta.foto ?? fotoDe(negocio)} />
        {navegacion}
      </>
    )
  }
  // Diseño galería: mosaico de fotos a sangre; al tocar una, los platos a pantalla completa
  if (carta.diseno === 'galeria') {
    return (
      <>
        <CartaGaleria carta={carta} negocio={negocio} />
        {navegacion}
      </>
    )
  }
  // Diseño polaroid: cada plato es una polaroid con su foto, pegada un poco torcida
  if (carta.diseno === 'polaroid') {
    return (
      <>
        <CartaPolaroid carta={carta} negocio={negocio} />
        {navegacion}
      </>
    )
  }
  // Diseño revista: como una página de revista de cocina, con un plato destacado con foto por sección
  if (carta.diseno === 'revista') {
    return (
      <>
        <CartaRevista carta={carta} negocio={negocio} />
        {navegacion}
      </>
    )
  }

  // Pestañas principales: Menú del día (si lo hay) y Carta
  const principales = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: carta.textoCarta ?? 'Carta' },
  ]
  const seccion = modo === 'carta' ? carta.secciones.find(s => s.nombre === seccionActiva) : null

  return (
    <div className="min-h-svh bg-demo-surface font-demo-body text-demo-text">
      <main className="mx-auto flex h-svh w-full max-w-[30rem] flex-col overflow-hidden bg-demo-bg">
        {/* Foto protagonista, con el idioma arriba y el título ("Carta" y el nombre) abajo */}
        {/* La franja de la foto ocupa el alto que sobra después del menú (entre 7 y 18 rem): así el menú siempre cabe y la foto se queda con el resto */}
        <div className="relative min-h-[7rem] max-h-[18rem] flex-[1_1_0%] overflow-hidden">
          <Img src={carta.foto ?? fotoDe(negocio)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/25" />

          {/* Idioma y enlace a la miniweb, superpuestos arriba a la derecha */}
          <div className="absolute right-[1.25rem] top-[0.9rem] flex flex-col items-end gap-[0.5rem]">
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
                Conoce {negocio.nombre}
                <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">
            <p className="text-[0.85rem] text-white/80">Carta</p>
            <p className="mt-[0.15rem] font-demo-heading text-[2.2rem] leading-none">{negocio.nombre}</p>
            {negocio.lema && <p className="mt-[0.3rem] text-[0.85rem] text-white/80">{negocio.lema}</p>}
          </div>
        </div>

        {/* Barra fija: pestañas principales y, en la carta, sus secciones debajo */}
        <div className="sticky top-0 z-10 shrink-0 border-b border-demo-text/10 bg-demo-bg/95 backdrop-blur-sm">
          <div className="flex gap-[0.4rem] px-[1.25rem] pt-[0.8rem]">
            {principales.map(p => (
              <button
                key={p.key}
                type="button"
                aria-pressed={modo === p.key}
                onClick={() => setModo(p.key)}
                className={`flex-1 rounded-[0.8rem] py-[0.7rem] text-[0.95rem] font-semibold transition-colors ${
                  modo === p.key ? 'bg-demo-primary text-demo-bg' : 'bg-demo-surface hover:bg-demo-text/10'
                }`}
              >
                {p.texto}
              </button>
            ))}
          </div>

          {modo === 'carta' ? (
            <FilaPestanas>
              {carta.secciones.map(sec => (
                <button
                  key={sec.nombre}
                  type="button"
                  aria-pressed={seccionActiva === sec.nombre}
                  onClick={() => setSeccionActiva(sec.nombre)}
                  className={`shrink-0 rounded-full border px-[0.8rem] py-[0.35rem] text-[0.82rem] font-medium transition-colors ${
                    seccionActiva === sec.nombre ? 'border-demo-text bg-demo-text text-demo-bg' : 'border-demo-text/20 hover:border-demo-text'
                  }`}
                >
                  {sec.nombre}
                </button>
              ))}
            </FilaPestanas>
          ) : (
            <div className="h-[0.8rem]" />
          )}
        </div>

        {/* Contenido de la pestaña: ocupa el hueco que queda y, solo si no cabe, hace scroll por dentro (la foto y la barra se quedan fijas) */}
        <div className="min-h-0 flex-[0_1_auto] overflow-y-auto px-[1.25rem] py-[0.9rem] [scrollbar-width:none]">
          {modo === 'menu' && carta.menuDia && <MenuDia menu={carta.menuDia} />}
          {seccion && <Seccion seccion={seccion} />}

          {/* Leyenda de alérgenos */}
          {seccion && (
            <div className="mt-[1.25rem]">
              <button
                type="button"
                onClick={() => setVerAlergenos(v => !v)}
                className="text-[0.85rem] font-semibold underline underline-offset-[0.25em]"
              >
                {verAlergenos ? 'Ocultar alérgenos' : 'Ver qué significa cada alérgeno'}
              </button>
              {verAlergenos && (
                <ul className="mt-[0.7rem] grid grid-cols-2 gap-x-[1rem] gap-y-[0.35rem] text-[0.82rem] text-demo-muted">
                  {Object.values(ALERGENOS).map(a => (
                    <li key={a.corto} className="flex items-center gap-[0.45rem]">
                      <span className="rounded-full border border-demo-text/20 px-[0.45rem] text-[0.68rem] font-semibold">{a.corto}</span>
                      {a.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

      </main>
      {navegacion}
    </div>
  )
}
