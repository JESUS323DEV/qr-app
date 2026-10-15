import { rutaNegocio } from '../negocios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react'
import Placa from '../components/Placa'
import { SocialIcon } from '../components/SocialIcons'
import { COLORES_REDES } from '../lib/coloresRedes'
import { secuenciaDemos, tipoDe } from '../lib/tematicas'
import { cartas, marcaDe, rutaCarta } from '../cartas'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, pasos, comoFunciona, ventajas, seo, planes, precio, contactoForm, webCompleta, cartasMiniwebs, escaparate, menu } from '../landing/contenido'
import useVueltaPestanas from '../lib/useVueltaPestanas'

const contacto = enlaceWhatsapp(marca.whatsapp, marca.mensajeWhatsapp)
// Enlace de WhatsApp con el mensaje de pedir presupuesto
const pedirPresupuesto = enlaceWhatsapp(marca.whatsapp, precio.mensaje)

function BotonWhatsapp({ children, className = '', href = contacto }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro ${className}`}
    >
      {children}
    </a>
  )
}

/* Formulario de la pestaña Contacto: nombre, teléfono, la idea y aceptar la privacidad.
   Sin servidor: al enviar, abre WhatsApp con todo ya escrito. Ocupa el alto que queda en el escenario. */
function FormularioContacto() {
  const enviar = e => {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    const mensaje = `Hola, soy ${datos.get('nombre')} (${datos.get('telefono')}).\n${datos.get('idea')}`
    window.open(enlaceWhatsapp(marca.whatsapp, mensaje), '_blank', 'noopener')
  }

  const campo = 'w-full rounded-[0.7rem] border border-linea bg-papel px-[0.85rem] text-[0.92rem] text-tinta placeholder:text-suave/70 focus:border-acento focus:outline-none'

  return (
    // Más compacto: el título y el texto del presupuesto arriba, y el formulario centrado en el alto que queda
    <form onSubmit={enviar} className="flex flex-1 flex-col justify-center gap-[0.5rem] px-[1.25rem] pb-[1rem] pt-[0.9rem]">
      <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">{contactoForm.titulo}</h2>
      <p className="mb-[0.4rem] text-[0.88rem] leading-[1.45] text-suave">{precio.texto}</p>
      <input name="nombre" required autoComplete="name" placeholder={contactoForm.nombre} aria-label={contactoForm.nombre} className={`${campo} min-h-[2.5rem]`} />
      <input name="telefono" type="tel" required autoComplete="tel" placeholder={contactoForm.telefono} aria-label={contactoForm.telefono} className={`${campo} min-h-[2.5rem]`} />
      <textarea name="idea" required rows={3} placeholder={contactoForm.idea} aria-label={contactoForm.idea} className={`${campo} resize-none py-[0.6rem]`} />
      <label className="flex items-start gap-[0.55rem] text-[0.78rem] leading-[1.4] text-suave">
        <input type="checkbox" name="acepto" required className="mt-[0.15rem] h-[1rem] w-[1rem] shrink-0 accent-[var(--color-acento)]" />
        {contactoForm.acepto}
      </label>
      <button type="submit" className="min-h-[2.75rem] rounded-full bg-acento font-bold text-papel transition-colors hover:bg-acento-oscuro">
        {contactoForm.enviar}
      </button>
    </form>
  )
}

/* Menú hamburguesa de la cabecera del hero: abre una capa a pantalla completa con los apartados
   de la landing (bajan a cada sección) y el botón de WhatsApp. */
function MenuHamburguesa() {
  const [abierto, setAbierto] = useState(false)

  // Mientras está abierto, la página de detrás no se mueve
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={abierto}
        onClick={() => setAbierto(true)}
        className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-full bg-papel text-tinta transition-colors hover:text-acento"
      >
        <Menu className="h-[1.3rem] w-[1.3rem]" />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-papel transition-opacity duration-300 ${abierto ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!abierto}
      >
        <div className="mx-auto flex h-full w-full max-w-[30rem] flex-col px-[1.25rem] pb-[1.5rem] pt-[1rem]">
          <div className="flex items-center justify-between">
            <p className="font-titulo text-[1.3rem] font-black tracking-tight">{marca.nombre}</p>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setAbierto(false)}
              className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-full bg-crema text-tinta transition-colors hover:text-acento"
            >
              <X className="h-[1.3rem] w-[1.3rem]" />
            </button>
          </div>

          {/* El menú hace de pie de página: qué es, redes, textos legales y firma */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="max-w-[22rem] text-[1rem] leading-[1.55] text-suave">{menu.texto}</p>

            <p className="mt-[2rem] text-[0.8rem] text-suave">{menu.redesTexto}</p>
            <div className="mt-[0.6rem] flex gap-[0.6rem]">
              {menu.redes.map(r => (
                <a
                  key={r.platform}
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={r.platform}
                  className="flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                  style={{ background: COLORES_REDES[r.platform] }}
                >
                  <SocialIcon platform={r.platform} className="h-[1.1rem] w-[1.1rem]" />
                </a>
              ))}
            </div>

            <ul className="mt-[2rem] border-t border-linea">
              {/* Webs completas a medida, en mi otra web */}
              <li className="border-b border-linea">
                <a
                  href={webCompleta.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-[0.35rem] py-[0.8rem] text-[0.95rem] font-semibold transition-colors hover:text-acento"
                >
                  {webCompleta.texto}
                  <ArrowUpRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
                </a>
              </li>
              {menu.legales.map(l => (
                <li key={l.texto} className="border-b border-linea">
                  <a href={l.url} className="block py-[0.8rem] text-[0.95rem] transition-colors hover:text-acento">
                    {l.texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <BotonWhatsapp className="w-full">{menu.boton}</BotonWhatsapp>
          <p className="mt-[1rem] text-center text-[0.78rem] text-suave">{menu.firma}</p>
        </div>
      </div>
    </>
  )
}

/* Panel de una pestaña del hero: siempre está en el HTML (Google lee todas las pestañas) y solo se ve el de la
   elegida. contents: no añade caja, así el contenido se coloca como si estuviera directamente en el escenario */
function Panel({ clave, pestana, children }) {
  return (
    <div id={`panel-${clave}`} role="tabpanel" aria-labelledby={`tab-${clave}`} hidden={pestana !== clave} className="contents">
      {children}
    </div>
  )
}

const TURNO_DEMOS_MS = 7000
// Cada cuánto cambia sola la placa de Tu QR (color y forma de los puntos)
const CAMBIO_PLACA_MS = 2500
// Cada cuánto cambian solas las subpestañas de Ventajas
const CAMBIO_SUBPESTANA_MS = 5000

// Formas de los puntos del QR que se pueden elegir en la placa de Inicio
const FORMAS = [
  { key: 'cuadrado', texto: 'cuadrados', clase: '' },
  { key: 'redondo', texto: 'redondeados', clase: 'rounded-[0.15rem]' },
  { key: 'punto', texto: 'redondos', clase: 'rounded-full' },
]

// Capturas de las demos a tamaño de móvil (src/assets/capturas/<slug>.jpg; las cartas, <slug>-carta.jpg).
// Las demos sin captura salen igual, con el móvil en negro y su nombre dentro.
const CAPTURAS = import.meta.glob('../assets/capturas/*.jpg', { eager: true, import: 'default' })
const captura = archivo => CAPTURAS[`../assets/capturas/${archivo}.jpg`]
// Solo las destacadas (con destacada: false se quitan del escaparate; en el catálogo salen todas)
const enEscaparate = d => d.destacada !== false

// Enlace pequeño bajo el titular de Inicio y de Cartas y miniwebs, al catálogo completo
function VerTodas({ to, children }) {
  return (
    <Link to={to} className="mt-[0.45rem] inline-flex items-center gap-[0.2rem] text-[0.85rem] font-semibold text-suave underline decoration-suave/40 underline-offset-[0.25em] hover:text-tinta">
      {children}
      <ArrowRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
    </Link>
  )
}

// Inicio: las fichas
const ESCAPARATE = secuenciaDemos
  .filter(n => tipoDe(n) === 'ficha' && enEscaparate(n))
  .map(n => ({ foto: captura(n.slug), nombre: n.nombre, sector: n.sector, ruta: rutaNegocio(n) }))

// Pestaña Cartas: las cartas de demo. Las miniwebs no salen en la landing (se enseñan en /miniweb)
const WEBS_Y_CARTAS = [
  ...cartas
    .filter(c => c.demo && enEscaparate(c))
    .map(c => ({ foto: captura(`${c.slug}-carta`), nombre: marcaDe(c)?.nombre, ...cartasMiniwebs.tipos.carta, ruta: rutaCarta(c) })),
]

/* El hero es una miniweb, con la misma estructura que las de los clientes:
   escenario con la marca, el texto (cambia con la pestaña) y una fila de móviles con las capturas
   de las demos (como el catálogo, en pequeño) que se desliza con el dedo y pasa sola hasta que se toca;
   pestañas y, debajo, el botón destacado de WhatsApp. Todo en una pantalla. Los textos son provisionales. */
// Dos filas de pestañas: tres arriba y dos abajo, centradas
const PESTANAS = [
  { key: 'ejemplos', texto: 'Inicio' },
  { key: 'qr', texto: 'Tu QR' },
  { key: 'como', texto: comoFunciona.pestana },
]
const PESTANAS_ABAJO = [
  { key: 'contacto', texto: 'Contacto' },
  { key: 'cartas', texto: cartasMiniwebs.pestana },
]
// Orden de la vuelta de presentación al entrar: todas las pestañas, de arriba abajo y de izquierda a derecha
const ORDEN_PESTANAS = [...PESTANAS, ...PESTANAS_ABAJO]
const CLAVE_PESTANA = 'landing-pestana'

function HeroMiniweb() {
  const [actual, setActual] = useState(0)
  // Al volver de una demo (se abren en la misma pestaña), la landing se abre en la pestaña de donde venías.
  // Se guarda solo durante la visita (sessionStorage); al cerrar el navegador se olvida
  const [pestana, setPestana] = useState(() => {
    try {
      const guardada = sessionStorage.getItem(CLAVE_PESTANA)
      return ORDEN_PESTANAS.some(p => p.key === guardada) ? guardada : 'ejemplos'
    } catch {
      return 'ejemplos'
    }
  })
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_PESTANA, pestana)
    } catch {
      // Sin acceso al almacenamiento: al volver se empieza en Inicio, sin más
    }
  }, [pestana])
  // Al entrar, las pestañas dan una vuelta solas cada 4 s y vuelven a Inicio; cualquier toque la para.
  // Solo la primera vez en cada navegador: luego queda apuntado y la landing empieza directamente en Inicio
  const ponerPestana = useCallback(i => setPestana(ORDEN_PESTANAS[i].key), [])
  const { enVuelta, parar } = useVueltaPestanas(ORDEN_PESTANAS, ponerPestana, 'landing-vuelta-vista')
  // Subpestaña de la pestaña Planes: Planes, Ventajas, Pasos o SEO
  const [subComo, setSubComo] = useState(comoFunciona.subpestanas[0].key)
  // Igual que la placa de Tu QR: al tocar la pestaña Ventajas (no en la vuelta inicial), las subpestañas
  // van cambiando solas cada 4 s, hasta que el usuario toca algo dentro. Si ya eligió una, no vuelven a moverse.
  const [subSola, setSubSola] = useState(false)
  const [subElegida, setSubElegida] = useState(false)
  const pararSub = () => {
    setSubSola(false)
    setSubElegida(true)
  }

  useEffect(() => {
    if (pestana !== 'como' || !subSola) return
    const subs = comoFunciona.subpestanas
    const id = setInterval(() => {
      setSubComo(s => subs[(subs.findIndex(x => x.key === s) + 1) % subs.length].key)
    }, CAMBIO_SUBPESTANA_MS)
    return () => clearInterval(id)
  }, [pestana, subSola])
  const [tocado, setTocado] = useState(false)
  // Placa de Inicio: color y forma de los puntos elegidos
  const [color, setColor] = useState(0)
  const [forma, setForma] = useState('redondo')
  const paleta = hero.inicio.colores[color]
  // Placa que se prueba diseños sola: empieza cuando el usuario toca la pestaña Tu QR (no en la vuelta inicial)
  // y se para en cuanto toca la placa o sus botones. Si ya eligió algo, no vuelve a moverse.
  const [placaSola, setPlacaSola] = useState(false)
  const [placaElegida, setPlacaElegida] = useState(false)
  const pararPlaca = () => {
    setPlacaSola(false)
    setPlacaElegida(true)
  }

  useEffect(() => {
    if (pestana !== 'qr' || !placaSola) return
    const id = setInterval(() => {
      setColor(c => (c + 1) % hero.inicio.colores.length)
      setForma(f => FORMAS[(FORMAS.findIndex(x => x.key === f) + 1) % FORMAS.length].key)
    }, CAMBIO_PLACA_MS)
    return () => clearInterval(id)
  }, [pestana, placaSola])
  const fila = useRef(null)
  const demo = ESCAPARATE[actual]

  // Lleva la fila hasta un móvil concreto
  const irA = (i, suave = true) => {
    const el = fila.current?.children[i]
    if (el) fila.current.scrollTo({ left: el.offsetLeft - fila.current.offsetLeft - (fila.current.clientWidth - el.clientWidth) / 2, behavior: suave ? 'smooth' : 'instant' })
  }

  // Pasa sola al siguiente móvil hasta que el visitante toca la fila (no empieza hasta que acaba la vuelta de pestañas).
  // Solo cuenta estando en Inicio: si no, se gastaría el turno con la fila fuera de pantalla y se quedaría parada
  useEffect(() => {
    if (pestana !== 'ejemplos' || enVuelta || tocado || ESCAPARATE.length < 2) return
    const t = setTimeout(() => irA((actual + 1) % ESCAPARATE.length), TURNO_DEMOS_MS)
    return () => clearTimeout(t)
  }, [pestana, actual, tocado, enVuelta])

  // Las filas de móviles siguen en la página aunque su pestaña esté oculta: al volver a ella, empiezan otra vez
  // por el primero (antes se volvían a pintar desde cero)
  useEffect(() => {
    if (pestana === 'ejemplos') fila.current?.scrollTo({ left: 0, behavior: 'instant' })
    if (pestana === 'cartas') filaCartas.current?.scrollTo({ left: 0, behavior: 'instant' })
  }, [pestana])

  // Fila de Cartas y ofertas: el móvil del centro es el que se nombra debajo
  const [actualCarta, setActualCarta] = useState(0)
  const filaCartas = useRef(null)
  const ejemploCarta = WEBS_Y_CARTAS[actualCarta]
  const [tocadoCarta, setTocadoCarta] = useState(false)

  const irACarta = i => {
    const f = filaCartas.current
    const el = f?.children[i]
    if (el) f.scrollTo({ left: el.offsetLeft - f.offsetLeft - (f.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }

  // Como en Inicio: pasa sola al siguiente móvil mientras se está en Cartas y ofertas, hasta que se toca la fila.
  // Al volver a la pestaña empieza otra vez desde el primero
  useEffect(() => {
    if (pestana !== 'cartas' || enVuelta || tocadoCarta || WEBS_Y_CARTAS.length < 2) return
    const t = setTimeout(() => irACarta((actualCarta + 1) % WEBS_Y_CARTAS.length), TURNO_DEMOS_MS)
    return () => clearTimeout(t)
  }, [pestana, actualCarta, tocadoCarta, enVuelta])

  // El móvil que queda en el centro de la fila f es el "actual" (nombre, sector y rayitas)
  const alDeslizar = (f, fijar) => {
    if (!f) return
    const centro = f.scrollLeft + f.clientWidth / 2
    let cerca = 0
    let distancia = Infinity
    Array.from(f.children).forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - f.offsetLeft + el.clientWidth / 2 - centro)
      if (d < distancia) { distancia = d; cerca = i }
    })
    fijar(cerca)
  }

  return (
    // min-h-0: sin él, el contenido largo de una pestaña estira el hero por encima del alto de la pantalla
    // y empuja las pestañas de abajo fuera de la vista
    <div className="mx-auto flex min-h-0 w-full max-w-[30rem] flex-1 flex-col" onPointerDown={parar}>
      {/* Escenario: fondo liso de la marca; ocupa el alto que sobra */}
      <div className="relative flex min-h-[20rem] flex-1 flex-col overflow-hidden bg-crema">
        {/* Marca arriba */}
        <div className="flex items-center justify-between px-[1.25rem] pt-[1rem]">
          <p className="font-titulo text-[1.3rem] font-black tracking-tight">{marca.nombre}</p>
          <MenuHamburguesa />
        </div>

        {/* Las pestañas: todas están en el HTML (para Google y los lectores de pantalla) y solo se ve la elegida.
            Cada una es un panel (Panel) con su titular, si lo tiene, arriba */}

        {/* Pestaña Cartas y miniwebs: como Inicio, primero las miniwebs y después las cartas; tocarlos abre la demo */}
        <Panel clave="cartas" pestana={pestana}>
            <div className="px-[1.25rem] pt-[0.9rem]">
              <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {cartasMiniwebs.titulo}
              </h2>
              <VerTodas to="/catalogo?tipo=carta">{escaparate.verCartasMiniwebs}</VerTodas>
            </div>
            <div className="relative mt-[1rem] min-h-[9rem] flex-1">
              <ul
                ref={filaCartas}
                onScroll={() => alDeslizar(filaCartas.current, setActualCarta)}
                onTouchStart={() => setTocadoCarta(true)}
                onMouseDown={() => setTocadoCarta(true)}
                className="absolute inset-0 flex snap-x snap-mandatory gap-[0.9rem] overflow-x-auto px-[25%] [scrollbar-width:none]"
              >
                {WEBS_Y_CARTAS.map((d, i) => (
                  <li key={d.ruta} className="h-full shrink-0 snap-center py-[0.2rem]">
                    <Link
                      to={d.ruta}
                      aria-label={`Abrir la demo de ${d.nombre}`}
                      className={`relative block aspect-[390/844] h-full rounded-[1.2rem] border border-white/15 bg-[#1d1d1b] p-[0.3rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-[opacity,transform] duration-500 ${
                        i === actualCarta ? 'opacity-100' : 'scale-[0.92] opacity-55'
                      }`}
                    >
                      {d.foto ? (
                        <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} className="h-full w-full rounded-[0.95rem] object-cover object-top" />
                      ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center rounded-[0.95rem] bg-papel px-[0.8rem] text-center">
                          <span className="font-titulo text-[1.05rem] font-black leading-[1.1]">{d.titulo}</span>
                          <span className="mt-[0.4rem] text-[0.78rem] text-suave">{d.nombre}</span>
                        </span>
                      )}
                      <span
                        className={`pointer-events-none absolute bottom-[0.7rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.3rem] whitespace-nowrap rounded-full bg-black/75 px-[0.75rem] py-[0.3rem] text-[0.72rem] font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
                          i === actualCarta ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {hero.pista}
                        <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qué ejemplo se ve y rayitas */}
            <div className="flex items-center justify-between gap-[0.75rem] px-[1.25rem] py-[0.8rem]">
              <p className="min-w-0 truncate text-[0.82rem]">
                <span className="font-semibold">{ejemploCarta.nombre}</span>{' '}
                <span className="text-suave">· {ejemploCarta.etiqueta}</span>
              </p>
              <div className="flex shrink-0 gap-[0.3rem]">
                {WEBS_Y_CARTAS.map((d, i) => (
                  <button
                    key={d.ruta}
                    type="button"
                    aria-label={`Ver ${d.nombre}`}
                    onClick={() => { setTocadoCarta(true); irACarta(i) }}
                    className={`h-[0.2rem] rounded-full transition-all duration-500 ${i === actualCarta ? 'w-[1.3rem] bg-acento' : 'w-[0.5rem] bg-tinta/25'}`}
                  />
                ))}
              </div>
            </div>
        </Panel>

        {/* Pestaña Contacto: formulario sencillo que, al enviar, abre WhatsApp con el mensaje ya escrito */}
        <Panel clave="contacto" pestana={pestana}>
          <FormularioContacto />
        </Panel>

        {/* Pestaña Planes (clave como): arriba cuatro subpestañas (Planes, Ventajas, Pasos y SEO). Ocupa todo el alto;
            si el contenido de una subpestaña no cabe, se desliza por dentro y el resto de la pantalla no se mueve */}
        <Panel clave="como" pestana={pestana}>
          {/* Tocar algo dentro (una subpestaña, el texto, el botón) para los cambios solos */}
          <div onPointerDown={pararSub} className="flex min-h-0 flex-1 flex-col">
            <nav className="flex gap-[1.4rem] border-b border-linea px-[1.25rem] pt-[0.9rem]">
              {comoFunciona.subpestanas.map(s => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={subComo === s.key}
                  onClick={() => setSubComo(s.key)}
                  className={`relative pb-[0.5rem] text-[0.92rem] font-semibold transition-colors ${subComo === s.key ? 'text-tinta' : 'text-suave hover:text-tinta'}`}
                >
                  {s.texto}
                  <span className={`absolute inset-x-0 bottom-0 h-[0.15rem] rounded-full bg-acento transition-transform duration-300 ${subComo === s.key ? 'scale-x-100' : 'scale-x-0'}`} />
                </button>
              ))}
            </nav>

            {/* Subpestañas: también todas en el HTML, solo se ve la elegida (hidden) */}
            {/* Ventajas: cada una con su explicación */}
              <div hidden={subComo !== 'ventajas'} className="min-h-0 flex-1 overflow-y-auto px-[1.25rem] pb-[1rem] pt-[0.9rem]">
                <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">{ventajas.titulo}</h2>
                <ul className="mt-[0.6rem]">
                  {ventajas.lista.map(v => (
                    <li key={v.titulo} className="border-b border-linea py-[0.7rem] last:border-b-0">
                      <p className="font-titulo text-[1.05rem] font-bold leading-tight">{v.titulo}</p>
                      <p className="mt-[0.2rem] text-[0.85rem] leading-[1.45] text-suave">{v.texto}</p>
                    </li>
                  ))}
                </ul>
              </div>

          <div hidden={subComo !== 'pasos'} className="flex flex-1 flex-col px-[1.25rem] pb-[1rem] pt-[0.9rem]">
            <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
              {pasos.titulo}
            </h2>
            <ol className="flex flex-1 flex-col justify-evenly gap-[1rem] py-[1rem]">
              {pasos.lista.map((paso, i) => (
                <li key={paso.titulo} className="flex gap-[0.9rem]">
                  <span className="font-titulo text-[2rem] font-black leading-none text-acento">{i + 1}</span>
                  <div>
                    <p className="font-titulo text-[1.1rem] font-bold leading-tight">{paso.titulo}</p>
                    <p className="mt-[0.2rem] text-[0.85rem] leading-[1.45] text-suave">{paso.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

            {/* SEO: como Planes, en tarjetas sin precio. Arriba lo incluido; separado debajo, lo de salir en Google,
                que se pide con el botón de presupuesto. Cabe en una pantalla con el botón */}
              <div hidden={subComo !== 'seo'} className="flex min-h-0 flex-1 flex-col gap-[0.8rem] overflow-hidden px-[1.25rem] pb-[1rem] pt-[0.9rem]">
                <div>
                  <h2 className="font-titulo text-[clamp(1.6rem,1.3rem+1.6vw,2.1rem)] font-black leading-[1] tracking-tight">{seo.titulo}</h2>
                  <p className="mt-[0.4rem] text-[0.85rem] leading-[1.4] text-suave">{seo.texto}</p>
                </div>

                {/* justify-center-safe: si falta alto (móviles pequeños), no se sale por arriba tapando el subtítulo */}
                <div className="flex min-h-0 flex-1 flex-col justify-center-safe gap-[0.7rem]">
                  {/* Lo incluido, con el borde amarillo para separarlo de lo demás */}
                  <div className="mb-[0.3rem] rounded-[1rem] bg-papel px-[1rem] py-[0.8rem] ring-1 ring-acento/60">
                    <div className="flex items-baseline justify-between gap-[1rem]">
                      <p className="font-titulo text-[1.2rem] font-black leading-none">{seo.incluido.titulo}</p>
                      <p className="shrink-0 font-titulo text-[0.95rem] font-bold text-acento">{seo.incluido.etiqueta}</p>
                    </div>
                    <p className="mt-[0.4rem] text-[0.88rem] leading-[1.4] text-suave">{seo.incluido.texto}</p>
                  </div>

                  {/* Para salir en Google: aparte, se piden con el botón de presupuesto */}
                  {seo.lista.map(s => (
                    <div key={s.titulo} className="rounded-[1rem] bg-papel px-[1rem] py-[0.8rem]">
                      <p className="font-titulo text-[1.2rem] font-black leading-none">{s.titulo}</p>
                      <p className="mt-[0.4rem] text-[0.88rem] leading-[1.4] text-suave">{s.texto}</p>
                    </div>
                  ))}
                </div>

                {/* Dos botones en fila: la sección SEO de /planes y pedir presupuesto por WhatsApp */}
                <div className="grid grid-cols-2 gap-[0.6rem]">
                  <Link
                    to="/planes#seo"
                    className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-tinta/30 text-[1rem] font-bold transition-colors hover:border-acento hover:text-acento"
                  >
                    {seo.verMas}
                  </Link>
                  <BotonWhatsapp href={enlaceWhatsapp(marca.whatsapp, seo.mensaje)} className="w-full">{seo.boton}</BotonWhatsapp>
                </div>
              </div>

            {/* Planes: Ficha, Carta y Ficha + carta; debajo, lo que va bajo presupuesto. Cabe en una pantalla con el botón */}
              <div hidden={subComo !== 'planes'} className="flex min-h-0 flex-1 flex-col gap-[0.8rem] overflow-hidden px-[1.25rem] pb-[1rem] pt-[0.9rem]">
                {/* Cada tarjeta mide lo que necesita su texto (en móviles pequeños no se aprietan); el espacio que sobra queda alrededor del grupo */}
                <div className="flex min-h-0 flex-1 flex-col justify-center gap-[0.7rem]">
                  {planes.lista.map(p => (
                    <div key={p.titulo} className="flex flex-col justify-center rounded-[1rem] bg-papel px-[1rem] py-[0.8rem]">
                      <div className="flex items-baseline justify-between gap-[1rem]">
                        <p className="font-titulo text-[1.35rem] font-black leading-none">{p.titulo}</p>
                        <p className="shrink-0 font-titulo text-[1.05rem] font-bold text-acento">{p.precio}</p>
                      </div>
                      <p className="mt-[0.4rem] text-[0.88rem] leading-[1.4] text-suave">{p.texto}</p>
                    </div>
                  ))}
                </div>

                {/* Dos botones en fila: los planes en detalle (/planes) y pedir presupuesto por WhatsApp */}
                <div className="grid grid-cols-2 gap-[0.6rem]">
                  <Link
                    to="/planes"
                    className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-tinta/30 text-[1rem] font-bold transition-colors hover:border-acento hover:text-acento"
                  >
                    {planes.verDetalle}
                  </Link>
                  <BotonWhatsapp href={pedirPresupuesto} className="w-full">{planes.boton}</BotonWhatsapp>
                </div>
              </div>
          </div>
        </Panel>

        {/* Pestaña Tu QR: la placa del mostrador, personalizable con colores y forma de los puntos del QR */}
        <Panel clave="qr" pestana={pestana}>
            <div className="px-[1.25rem] pt-[0.9rem]">
              <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {hero.inicio.titulo}
              </h2>
            </div>
            {/* Tocar la placa o sus botones para los cambios solos */}
            <div onPointerDown={pararPlaca} className="flex min-h-[10rem] flex-1 items-center justify-center py-[1rem]">
              <Placa
                negocio={marca.nombre}
                texto={hero.placa.texto}
                fondo={paleta.fondo}
                colorTexto={paleta.texto}
                colorQr={paleta.qr}
                degradadoQr={paleta.degradado}
                glitchQr={paleta.glitch}
                forma={forma}
                className="w-[min(52%,13rem)] -rotate-[4deg]"
              />
            </div>

            <div onPointerDown={pararPlaca} className="flex items-center justify-between gap-[1rem] px-[1.25rem] pb-[1rem]">
              {/* Colores de la placa */}
              <div className="flex gap-[0.35rem]">
                {hero.inicio.colores.map((c, i) => (
                  <button
                    key={c.nombre}
                    type="button"
                    title={c.nombre}
                    aria-label={`Placa ${c.nombre}`}
                    aria-pressed={i === color}
                    onClick={() => setColor(i)}
                    className={`h-[1.7rem] w-[1.7rem] rounded-full border-2 transition-transform duration-300 ${i === color ? 'scale-110 border-acento' : 'border-white/15 hover:scale-105'}`}
                    style={{
                      // Placa blanca con degradado (Instagram, Facebook): el círculo enseña el degradado entero;
                      // placa de color: mitad placa y mitad color del QR
                      background: c.degradado && c.fondo.toUpperCase() === '#FFFFFF'
                        ? `linear-gradient(45deg, ${c.degradado.join(', ')})`
                        : c.glitch
                          ? `linear-gradient(135deg, ${c.glitch[0]} 0 24%, ${c.fondo} 24% 76%, ${c.glitch[1]} 76%)`
                          : `linear-gradient(135deg, ${c.fondo} 55%, ${c.qr} 55%)`,
                    }}
                  />
                ))}
              </div>
              {/* Forma de los puntos del QR */}
              <div className="flex gap-[0.3rem] rounded-full bg-papel p-[0.2rem]">
                {FORMAS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    aria-label={`Puntos ${f.texto}`}
                    aria-pressed={forma === f.key}
                    onClick={() => setForma(f.key)}
                    className={`flex h-[1.7rem] w-[1.7rem] items-center justify-center rounded-full transition-colors ${forma === f.key ? 'bg-acento text-papel' : 'text-suave hover:text-tinta'}`}
                  >
                    <span className={`block h-[0.6rem] w-[0.6rem] bg-current ${f.clase}`} />
                  </button>
                ))}
              </div>
            </div>
        </Panel>

        {/* Pestaña Inicio (clave ejemplos, la primera): fila de móviles con las capturas, como el catálogo en pequeño; se ajusta al alto que queda.
            Se desliza con el dedo; tocar un móvil abre la demo de verdad. */}
        <Panel clave="ejemplos" pestana={pestana}>
        <div className="px-[1.25rem] pt-[0.9rem]">
          <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
            {hero.titulo}
          </h1>
          <VerTodas to="/catalogo?tipo=ficha">{escaparate.verFichas}</VerTodas>
        </div>
        <div className="relative mt-[1rem] min-h-[9rem] flex-1">
          <ul
            ref={fila}
            onScroll={() => alDeslizar(fila.current, setActual)}
            onTouchStart={() => setTocado(true)}
            onMouseDown={() => setTocado(true)}
            className="absolute inset-0 flex snap-x snap-mandatory gap-[0.9rem] overflow-x-auto px-[25%] [scrollbar-width:none]"
          >
            {ESCAPARATE.map((d, i) => (
              <li key={d.nombre} className="h-full shrink-0 snap-center py-[0.2rem]">
                <Link
                  to={d.ruta}
                  aria-label={`Abrir la demo de ${d.nombre}`}
                  className={`relative block aspect-[390/844] h-full rounded-[1.2rem] border border-white/15 bg-[#1d1d1b] p-[0.3rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-[opacity,transform] duration-500 ${
                    i === actual ? 'opacity-100' : 'scale-[0.92] opacity-55'
                  }`}
                >
                  {d.foto ? (
                    <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} className="h-full w-full rounded-[0.95rem] object-cover object-top" />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center rounded-[0.95rem] bg-papel px-[0.8rem] text-center">
                      <span className="font-titulo text-[1.05rem] font-black leading-[1.1]">{d.nombre}</span>
                      <span className="mt-[0.4rem] text-[0.78rem] text-suave">{d.sector}</span>
                    </span>
                  )}
                  {/* Etiqueta dentro del móvil del centro, abajo, debajo de la card de redes */}
                  <span
                    className={`pointer-events-none absolute bottom-[0.7rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.3rem] whitespace-nowrap rounded-full bg-black/75 px-[0.75rem] py-[0.3rem] text-[0.72rem] font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
                      i === actual ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {hero.pista}
                    <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Qué demo se ve y rayitas */}
        <div className="flex items-center justify-between gap-[0.75rem] px-[1.25rem] py-[0.8rem]">
          <p className="min-w-0 truncate text-[0.82rem]">
            {demo ? (
              <>
                <span className="font-semibold">{demo.nombre}</span> <span className="text-suave">· {demo.sector}</span>
              </>
            ) : (
              <span className="text-suave">{ESCAPARATE.length} ejemplos</span>
            )}
          </p>
          <div className="flex shrink-0 gap-[0.3rem]">
            {ESCAPARATE.map((d, i) => (
              <button
                key={d.nombre}
                type="button"
                aria-label={`Ver ${d.nombre}`}
                onClick={() => { setTocado(true); irA(i) }}
                className={`h-[0.2rem] rounded-full transition-all duration-500 ${i === actual ? 'w-[1.3rem] bg-acento' : 'w-[0.5rem] bg-tinta/25'}`}
              />
            ))}
          </div>
        </div>
        </Panel>
      </div>

      {/* Pestañas: dos filas, la de abajo centrada */}
      <nav role="tablist" aria-label="Apartados" className="px-[1.25rem] pt-[0.9rem]">
        {[PESTANAS, PESTANAS_ABAJO].map((fila, f) => (
          <div key={f} role="presentation" className={`flex justify-center gap-[0.35rem] ${f > 0 ? 'mt-[0.35rem]' : ''}`}>
            {fila.map(p => (
              <button
                key={p.key}
                id={`tab-${p.key}`}
                type="button"
                role="tab"
                aria-selected={pestana === p.key}
                aria-controls={`panel-${p.key}`}
                onClick={() => {
                  setPestana(p.key)
                  // Al tocar Tu QR (también en mitad de la vuelta inicial), la placa empieza a probarse diseños sola,
                  // salvo que el usuario ya haya elegido uno
                  setPlacaSola(p.key === 'qr' && !placaElegida)
                  // Al tocar Ventajas, sus subpestañas empiezan a cambiar solas desde la primera (salvo que ya eligiera una)
                  setSubSola(p.key === 'como' && !subElegida)
                  if (p.key === 'como' && !subElegida) setSubComo(comoFunciona.subpestanas[0].key)
                  // La fila de Ejemplos empieza siempre por la primera demo
                  if (p.key === 'ejemplos') { setActual(0); setTocado(false) }
                  if (p.key === 'cartas') { setActualCarta(0); setTocadoCarta(false) }
                }}
                className={`rounded-[0.7rem] py-[0.65rem] text-[0.82rem] font-semibold transition-colors ${
                  f > 0 ? 'w-[calc((100%-0.7rem)/3*1.3)]' : 'w-[calc((100%-0.7rem)/3)]'
                } ${pestana === p.key ? 'bg-acento text-papel' : 'bg-crema text-tinta hover:bg-linea'}`}
              >
                {p.texto}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="pb-[1.25rem]" />
    </div>
  )
}

export default function LandingPage() {
  return (
    // Sin scroll vertical: la landing es solo la miniweb de la primera pantalla. Las antiguas secciones de debajo se
    // han quitado; sus textos siguen en landing/contenido.js para pasarlos a las pestañas (galería, planes...)
    <div className="h-svh overflow-hidden bg-papel font-texto text-tinta">
      {/* Primera pantalla: el hero es una miniweb, exactamente el alto de la pantalla.
          Alto fijo (h-svh, no min-h): así una pestaña con mucho contenido se desliza por dentro
          en vez de estirar la pantalla y empujar las pestañas de abajo fuera de la vista */}
      <div className="flex h-svh flex-col">
        <HeroMiniweb />
      </div>
    </div>
  )
}
