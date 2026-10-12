import { rutaNegocio } from '../negocios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Movil from '../components/Movil'
import Placa from '../components/Placa'
import { SocialIcon } from '../components/SocialIcons'
import { COLORES_REDES } from '../lib/coloresRedes'
import { tematicasConDemos, secuenciaDemos, tematicaDe, getTematica } from '../lib/tematicas'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, porque, pasos, comoFunciona, ventajas, seo, planes, botones, ejemplos, precio, preguntas, cierre, pie, contactoForm, webCompleta, cartasOfertas, menu } from '../landing/contenido'
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

function Seccion({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[68rem] px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  )
}

function Titulo({ children, className = '' }) {
  return (
    <h2 className={`font-titulo text-[clamp(1.75rem,1.3rem+2vw,2.75rem)] font-extrabold leading-[1.05] tracking-tight text-balance ${className}`}>
      {children}
    </h2>
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

// Capturas de las demos a tamaño de móvil (src/assets/capturas/<slug>.jpg), en el orden del catálogo
const CAPTURAS = import.meta.glob('../assets/capturas/*.jpg', { eager: true, import: 'default' })
const ESCAPARATE = secuenciaDemos
  // Las demos sin captura salen igual, con el móvil en negro y su nombre dentro (como en Cartas y ofertas)
  .map(n => ({ foto: CAPTURAS[`../assets/capturas/${n.slug}.jpg`], nombre: n.nombre, sector: n.sector, ruta: rutaNegocio(n) }))

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
  { key: 'cartas', texto: cartasOfertas.pestana },
]
// Orden de la vuelta de presentación al entrar: todas las pestañas, de arriba abajo y de izquierda a derecha
const ORDEN_PESTANAS = [...PESTANAS, ...PESTANAS_ABAJO]

function HeroMiniweb() {
  const [actual, setActual] = useState(0)
  const [pestana, setPestana] = useState('ejemplos')
  // Al entrar, las pestañas dan una vuelta solas cada 4 s y vuelven a Inicio; cualquier toque la para
  const ponerPestana = useCallback(i => setPestana(ORDEN_PESTANAS[i].key), [])
  const { enVuelta, parar } = useVueltaPestanas(ORDEN_PESTANAS, ponerPestana)
  // Subpestaña de la pestaña Ventajas: Ventajas, Pasos, SEO o Planes
  const [subComo, setSubComo] = useState('ventajas')
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

  // Fila de Cartas y ofertas: el móvil del centro es el que se nombra debajo
  const [actualCarta, setActualCarta] = useState(0)
  const filaCartas = useRef(null)
  const ejemploCarta = cartasOfertas.ejemplos[actualCarta]
  const [tocadoCarta, setTocadoCarta] = useState(false)

  const irACarta = i => {
    const f = filaCartas.current
    const el = f?.children[i]
    if (el) f.scrollTo({ left: el.offsetLeft - f.offsetLeft - (f.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }

  // Como en Inicio: pasa sola al siguiente móvil mientras se está en Cartas y ofertas, hasta que se toca la fila.
  // Al volver a la pestaña empieza otra vez desde el primero
  useEffect(() => {
    if (pestana !== 'cartas' || enVuelta || tocadoCarta || cartasOfertas.ejemplos.length < 2) return
    const t = setTimeout(() => irACarta((actualCarta + 1) % cartasOfertas.ejemplos.length), TURNO_DEMOS_MS)
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

        {/* Texto: cambia con la pestaña. Solo se pinta en las que tienen titular, para no dejar hueco en las demás */}
        {['qr', 'ejemplos', 'cartas'].includes(pestana) && (
        <div className="px-[1.25rem] pt-[0.9rem]">
          {pestana === 'qr' && (
            <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
              {hero.inicio.titulo}
            </h2>
          )}
          {pestana === 'ejemplos' && (
            <>
              <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {hero.titulo}
              </h1>
            </>
          )}
          {pestana === 'cartas' && (
            <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
              {cartasOfertas.titulo}
            </h2>
          )}
        </div>
        )}

        {/* Pestaña Cartas y ofertas: como Inicio, pero con móviles que de momento enseñan un texto
            en vez de captura; tocarlos abre la demo */}
        {pestana === 'cartas' && (
          <>
            <div className="relative mt-[1rem] min-h-[9rem] flex-1">
              <ul
                ref={filaCartas}
                onScroll={() => alDeslizar(filaCartas.current, setActualCarta)}
                onTouchStart={() => setTocadoCarta(true)}
                onMouseDown={() => setTocadoCarta(true)}
                className="absolute inset-0 flex snap-x snap-mandatory gap-[0.9rem] overflow-x-auto px-[25%] [scrollbar-width:none]"
              >
                {cartasOfertas.ejemplos.map((d, i) => (
                  <li key={d.ruta} className="h-full shrink-0 snap-center py-[0.2rem]">
                    <a
                      href={d.ruta}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir la demo de ${d.nombre}`}
                      className={`relative block aspect-[390/844] h-full rounded-[1.2rem] border border-white/15 bg-[#1d1d1b] p-[0.3rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-[opacity,transform] duration-500 ${
                        i === actualCarta ? 'opacity-100' : 'scale-[0.92] opacity-55'
                      }`}
                    >
                      <span className="flex h-full w-full flex-col items-center justify-center rounded-[0.95rem] bg-papel px-[0.8rem] text-center">
                        <span className="font-titulo text-[1.05rem] font-black leading-[1.1]">{d.titulo}</span>
                        <span className="mt-[0.4rem] text-[0.78rem] text-suave">{d.nombre}</span>
                      </span>
                      <span
                        className={`pointer-events-none absolute bottom-[0.7rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.3rem] whitespace-nowrap rounded-full bg-black/75 px-[0.75rem] py-[0.3rem] text-[0.72rem] font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
                          i === actualCarta ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {hero.pista}
                        <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qué ejemplo se ve y rayitas */}
            <div className="flex items-center justify-between gap-[0.75rem] px-[1.25rem] py-[0.8rem]">
              <p className="min-w-0 truncate text-[0.82rem]">
                <span className="font-semibold">{ejemploCarta.nombre}</span>{' '}
                <span className="text-suave">· {ejemploCarta.sector}</span>
              </p>
              <div className="flex shrink-0 gap-[0.3rem]">
                {cartasOfertas.ejemplos.map((d, i) => (
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
          </>
        )}

        {/* Pestaña Contacto: formulario sencillo que, al enviar, abre WhatsApp con el mensaje ya escrito */}
        {pestana === 'contacto' && <FormularioContacto />}

        {/* Pestaña Ventajas (clave como): arriba cuatro subpestañas (Ventajas, Pasos, SEO y Planes). Ocupa todo el alto;
            si el contenido de una subpestaña no cabe, se desliza por dentro y el resto de la pantalla no se mueve */}
        {pestana === 'como' && (
          // Tocar algo dentro (una subpestaña, el texto, el botón) para los cambios solos
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

            {/* Ventajas: cada una con su explicación */}
            {subComo === 'ventajas' && (
              <div className="min-h-0 flex-1 overflow-y-auto px-[1.25rem] pb-[1rem] pt-[0.9rem]">
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
            )}

            {subComo === 'pasos' && (
          <div className="flex flex-1 flex-col px-[1.25rem] pb-[1rem] pt-[0.9rem]">
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
            )}

            {/* SEO: qué va incluido y qué es servicio aparte */}
            {subComo === 'seo' && (
              <div className="min-h-0 flex-1 overflow-y-auto px-[1.25rem] pb-[1rem] pt-[0.9rem]">
                <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">{seo.titulo}</h2>
                <ul className="mt-[0.8rem]">
                  {seo.lista.map(s => (
                    <li key={s.titulo} className="border-b border-linea py-[0.8rem] last:border-b-0">
                      <p className="font-titulo text-[1.05rem] font-bold leading-tight">{s.titulo}</p>
                      <p className="mt-[0.25rem] text-[0.85rem] leading-[1.45] text-suave">{s.texto}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Planes: Base, Premium y Personalizado. Cabe en una pantalla con el botón, sin deslizar por dentro */}
            {subComo === 'planes' && (
              <div className="flex min-h-0 flex-1 flex-col gap-[0.8rem] overflow-hidden px-[1.25rem] pb-[1rem] pt-[0.9rem]">
                {/* Las tres tarjetas se reparten el alto que queda encima del botón */}
                <div className="grid min-h-0 flex-1 auto-rows-fr gap-[0.7rem]">
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

                <BotonWhatsapp href={pedirPresupuesto} className="w-full">{planes.boton}</BotonWhatsapp>
              </div>
            )}
          </div>
        )}

        {/* Pestaña Tu QR: la placa del mostrador, personalizable con colores y forma de los puntos del QR */}
        {pestana === 'qr' && (
          <>
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
          </>
        )}

        {/* Pestaña Inicio (clave ejemplos, la primera): fila de móviles con las capturas, como el catálogo en pequeño; se ajusta al alto que queda.
            Se desliza con el dedo; tocar un móvil abre la demo de verdad. */}
        {pestana === 'ejemplos' && (
        <>
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
                <a
                  href={d.ruta}
                  target="_blank"
                  rel="noreferrer"
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
                </a>
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
        </>
        )}
      </div>

      {/* Pestañas: dos filas, la de abajo centrada */}
      <nav className="px-[1.25rem] pt-[0.9rem]">
        {[PESTANAS, PESTANAS_ABAJO].map((fila, f) => (
          <div key={f} className={`flex justify-center gap-[0.35rem] ${f > 0 ? 'mt-[0.35rem]' : ''}`}>
            {fila.map(p => (
              <button
                key={p.key}
                type="button"
                aria-pressed={pestana === p.key}
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
  const { hash } = useLocation()

  // Al volver desde una temática con /#ejemplos, baja hasta esa sección
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    // Sin scroll vertical: solo se ve la miniweb de la primera pantalla. Las secciones de debajo se quedan en el código
    <div className="h-svh overflow-hidden bg-papel font-texto text-tinta">
      {/* Primera pantalla: el hero es una miniweb, exactamente el alto de la pantalla.
          Alto fijo (h-svh, no min-h): así una pestaña con mucho contenido se desliza por dentro
          en vez de estirar la pantalla y empujar las pestañas de abajo fuera de la vista */}
      <div className="flex h-svh flex-col">
        <HeroMiniweb />
      </div>

      <main>

        <div className="border-y border-linea bg-crema">
          <Seccion className="py-[4rem] md:py-[5.5rem]">
            <Titulo className="max-w-[40rem]">{porque.titulo}</Titulo>
            <p className="mt-[1.25rem] max-w-[38rem] text-[1.07rem] leading-[1.65] text-suave">{porque.texto}</p>
          </Seccion>
        </div>

        <Seccion id="como-funciona" className="scroll-mt-[1rem] py-[4rem] md:py-[5.5rem]">
          <Titulo>{pasos.titulo}</Titulo>
          <ol className="mt-[2.5rem] grid gap-[2.25rem] md:grid-cols-3 md:gap-[2.5rem]">
            {pasos.lista.map((paso, i) => (
              <li key={paso.titulo} className="border-t border-tinta pt-[1.1rem]">
                <span className="font-titulo text-[1.1rem] text-suave">{i + 1}</span>
                <h3 className="mt-[0.4rem] text-[1.2rem] font-semibold">{paso.titulo}</h3>
                <p className="mt-[0.5rem] leading-[1.6] text-suave">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </Seccion>

        <Seccion className="pb-[4rem] md:pb-[5.5rem]">
          <div className="grid gap-[2rem] md:grid-cols-[1fr_1.4fr] md:gap-[3rem]">
            <div>
              <Titulo>{botones.titulo}</Titulo>
              <p className="mt-[1rem] max-w-[22rem] leading-[1.6] text-suave">{botones.nota}</p>
            </div>
            <ul className="grid sm:grid-cols-2 sm:gap-x-[2rem]">
              {botones.lista.map(b => (
                <li key={b} className="border-b border-linea py-[0.85rem] text-[1.02rem]">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Seccion>

        <div id="ejemplos" className="scroll-mt-[1rem] bg-tinta text-papel">
          <Seccion className="py-[4rem] md:py-[5.5rem]">
            <Titulo>{ejemplos.titulo}</Titulo>
          </Seccion>
          {/* Todas las demos, ordenadas por temática */}
          <ul className="mx-auto -mt-[1.5rem] flex w-full max-w-[68rem] snap-x snap-mandatory gap-[1.25rem] overflow-x-auto px-4 pb-[2.5rem] [scrollbar-width:none] sm:px-6 md:grid md:grid-cols-4 md:gap-[1.5rem] md:overflow-visible">
            {secuenciaDemos.map(n => {
              const t = getTematica(tematicaDe(n))
              return (
                <li key={n.slug} className="mx-auto w-[72%] max-w-[16rem] shrink-0 snap-center md:w-full">
                  <Movil src={rutaNegocio(n)} titulo={n.nombre} className="border-papel/15" />
                  <p className="mt-[1rem] font-semibold">{n.nombre}</p>
                  <p className="mt-[0.2rem] text-[0.92rem] text-papel/65">{n.sector}</p>
                  <div className="mt-[0.6rem] flex gap-[1rem] text-[0.92rem]">
                    <a
                      href={rutaNegocio(n)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline decoration-papel/30 underline-offset-[0.3em] hover:decoration-papel"
                    >
                      Abrir
                    </a>
                    <Link to={`/tematicas/${t.key}`} className="text-papel/65 hover:text-papel">
                      {t.nombre}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Acceso a cada temática */}
          <div className="mx-auto flex w-full max-w-[68rem] flex-wrap gap-x-[1.5rem] gap-y-[0.5rem] px-4 pb-[4.5rem] sm:px-6 md:pb-[5.5rem]">
            {tematicasConDemos().map(t => (
              <Link
                key={t.key}
                to={`/tematicas/${t.key}`}
                className="font-semibold underline decoration-papel/30 underline-offset-[0.3em] hover:decoration-papel"
              >
                {ejemplos.verMas} de {t.nombre.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        <Seccion id="precio" className="scroll-mt-[1rem] py-[4rem] md:py-[5.5rem]">
          <Titulo>{precio.titulo}</Titulo>
          <p className="mt-[1rem] max-w-[36rem] text-[1.07rem] leading-[1.6] text-suave">{precio.texto}</p>
          <BotonWhatsapp href={pedirPresupuesto} className="mt-[1.75rem]">{precio.boton}</BotonWhatsapp>
          <p className="mt-[1.5rem] max-w-[38rem] leading-[1.6] text-suave">{precio.nota}</p>
        </Seccion>

        <Seccion id="preguntas" className="scroll-mt-[1rem] pb-[4rem] pt-[1rem] md:pb-[5.5rem]">
          <Titulo>{preguntas.titulo}</Titulo>
          <div className="mt-[1.75rem] border-t border-linea">
            {preguntas.lista.map(p => (
              <details key={p.pregunta} className="group border-b border-linea">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-[1rem] py-[1.1rem] text-[1.07rem] font-semibold [&::-webkit-details-marker]:hidden">
                  {p.pregunta}
                  <span className="text-[1.4rem] font-normal leading-none text-suave transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-[40rem] pb-[1.25rem] leading-[1.6] text-suave">{p.respuesta}</p>
              </details>
            ))}
          </div>
        </Seccion>

        <div className="bg-acento text-papel">
          <Seccion className="py-[4rem] text-center md:py-[5.5rem]">
            <Titulo>{cierre.titulo}</Titulo>
            <p className="mx-auto mt-[1rem] max-w-[30rem] text-[1.07rem] leading-[1.6] text-papel/75">{cierre.texto}</p>
            <a
              href={contacto}
              target="_blank"
              rel="noreferrer"
              className="mt-[2rem] inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-papel px-[1.6rem] font-bold text-acento transition-colors hover:bg-crema"
            >
              {cierre.boton}
            </a>
          </Seccion>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[68rem] flex-wrap justify-between gap-[0.5rem] px-4 py-[1.75rem] text-[0.9rem] text-suave sm:px-6">
        <p>
          {marca.nombre} · {marca.ciudad}
        </p>
        <p>{pie.firma}</p>
      </footer>
    </div>
  )
}
