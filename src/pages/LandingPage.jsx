import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Menu, X, QrCode } from 'lucide-react'
import { DISENOS, mascaraSilueta } from '../lib/siluetas'
import { SocialIcon } from '../components/SocialIcons'
import { COLORES_REDES } from '../lib/coloresRedes'
import { cartas, marcaDe, rutaCarta } from '../cartas'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, porque, pasos, comoFunciona, ventajas, seo, planes, planesDetalle, preguntas, cierre, contactoForm, webCompleta, cartasMiniwebs, escaparate, menu, generadorQr } from '../landing/contenido'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { ESCALA_LANDING } from '../lib/escalaTexto'
import { DOMINIO } from '../lib/dominio'
import { TEMAS, temaActual, ponerTema } from '../lib/temas'

/* El selector de tema: un círculo pequeño abajo a la derecha, justo encima de las pestañas, con el color del tema elegido (mitad fondo, mitad acento).
   Al tocarlo se abre hacia la izquierda con todos los temas; al elegir uno se cierra (también al tocar fuera o con Escape). La elección se guarda en el navegador. */
function SelectorTema({ enLinea = false }) {
  const [tema, setTema] = useState(temaActual)
  const [abierto, setAbierto] = useState(false)
  // A los 4 s sin tocarlo, el círculo se queda casi transparente (se queda así hasta que se toca)
  const [tenue, setTenue] = useState(false)
  const [toques, setToques] = useState(0)
  const caja = useRef(null)

  useEffect(() => {
    setTenue(false)
    if (abierto || enLinea) return
    const t = setTimeout(() => setTenue(true), 4000)
    return () => clearTimeout(t)
  }, [abierto, tema, toques, enLinea])

  useEffect(() => {
    if (!abierto) return
    const fuera = e => {
      if (!caja.current?.contains(e.target)) setAbierto(false)
    }
    const tecla = e => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const elegir = clave => {
    ponerTema(clave)
    setTema(clave)
    setAbierto(false)
  }
  // El elegido siempre el último (a la derecha): los demás salen hacia la izquierda
  const ordenados = [...TEMAS.filter(t => t.clave !== tema), TEMAS.find(t => t.clave === tema)]

  const grupo = (
    <div
      ref={caja}
      role="group"
      aria-label="Colores de la página"
      onPointerDown={() => setToques(n => n + 1)}
      className={`${enLinea ? 'absolute right-0 top-1/2 z-10 -translate-y-1/2' : 'absolute bottom-[0.7rem] right-[1.25rem] z-10'} flex items-center rounded-full p-[0.25rem] transition-[background-color,opacity] duration-500 ${tenue && !abierto ? 'opacity-25' : 'opacity-100'} ${abierto ? 'bg-crema shadow-[0_0.1rem_0.6rem_rgb(0_0_0/0.25)] ring-1 ring-linea' : ''}`}
    >
      {ordenados.map((t, i) => {
        const actual = t.clave === tema
        const visible = abierto || actual
        return (
          <button
            key={t.clave}
            type="button"
            title={t.nombre}
            aria-label={actual ? `${t.nombre} (elegido)` : t.nombre}
            aria-expanded={actual ? abierto : undefined}
            tabIndex={visible ? 0 : -1}
            onClick={() => (actual ? setAbierto(a => !a) : elegir(t.clave))}
            className={`relative shrink-0 rounded-full transition-all duration-200 ${visible ? 'h-[1rem] w-[1rem] opacity-100' : 'pointer-events-none h-[1rem] w-0 opacity-0'} ${visible && i < ordenados.length - 1 ? 'mr-[0.45rem]' : ''} ${actual ? 'ring-1 ring-tinta ring-offset-1 ring-offset-crema' : visible ? 'ring-1 ring-linea hover:scale-110' : ''}`}
          >
            {/* A los 4 s todo el círculo baja al 25 % (anillo incluido) y el color de dentro, además, a un 40 % de eso */}
            <span
              className="absolute inset-0 rounded-full transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${t.fondo} 50%, ${t.acento} 50%)`, opacity: actual && tenue && !abierto ? 0.4 : 1 }}
            />
          </button>
        )
      })}
    </div>
  )
  // En la cabecera de escritorio ocupa un hueco fijo de 1,5 rem y los demás círculos salen hacia la izquierda sin mover el menú
  return enLinea ? <div className="relative h-[1.5rem] w-[1.5rem] shrink-0">{grupo}</div> : grupo
}

/* Formulario de la pestaña Contacto: nombre, teléfono, la idea y aceptar la privacidad.
   Sin servidor: al enviar, abre WhatsApp con el mensaje ya ordenado (quién es, su teléfono, el motivo y su idea).
   motivo: de dónde viene (presupuesto, salir en Google...), una clave de contactoForm.motivos. Ocupa el alto que queda en el escenario. */
function FormularioContacto({ motivo = 'contacto' }) {
  const m = contactoForm.motivos[motivo] ?? contactoForm.motivos.contacto
  const enviar = e => {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    const mensaje = [
      `Hola, soy ${datos.get('nombre').trim()}.`,
      '',
      `Teléfono: ${datos.get('telefono').trim()}`,
      `Motivo: ${m.texto}`,
      `Mi negocio y lo que busco: ${datos.get('idea').trim()}`,
      '',
      `Enviado desde ${marca.nombre}`,
    ].join('\n')
    window.open(enlaceWhatsapp(marca.whatsapp, mensaje), '_blank', 'noopener')
  }

  const campo = 'w-full rounded-[0.7rem] border border-linea bg-papel px-[0.85rem] text-tinta placeholder:text-suave/70 focus:border-acento focus:outline-none'

  return (
    // Más compacto: el título y el texto del presupuesto arriba, y el formulario centrado en el alto que queda
    <form onSubmit={enviar} className={`flex flex-1 flex-col justify-center ${ESCALA_LANDING.formAire} px-[1.25rem] pb-[1rem] pt-[0.9rem]`}>
      <h2 className={`font-titulo ${ESCALA_LANDING.formTitulo} font-black leading-[1] tracking-tight`}>{contactoForm.titulo}</h2>
      <p className={`mb-[0.4rem] ${ESCALA_LANDING.planTexto} leading-[1.45] text-suave`}>{m.intro}</p>
      <input name="nombre" required autoComplete="name" placeholder={contactoForm.nombre} aria-label={contactoForm.nombre} className={`${campo} ${ESCALA_LANDING.formCampo} ${ESCALA_LANDING.formTexto}`} />
      <input name="telefono" type="tel" required autoComplete="tel" placeholder={contactoForm.telefono} aria-label={contactoForm.telefono} className={`${campo} ${ESCALA_LANDING.formCampo} ${ESCALA_LANDING.formTexto}`} />
      <textarea name="idea" required rows={3} defaultValue={m.idea} placeholder={contactoForm.idea} aria-label={contactoForm.idea} className={`${campo} ${ESCALA_LANDING.formTexto} ${ESCALA_LANDING.formArea} resize-none py-[0.6rem]`} />
      <label className={`flex items-start gap-[0.55rem] ${ESCALA_LANDING.formAceptar} leading-[1.4] text-suave`}>
        <input type="checkbox" name="acepto" required className="mt-[0.15rem] h-[1rem] w-[1rem] shrink-0 accent-[var(--color-acento)]" />
        {contactoForm.acepto}
      </label>
      <button type="submit" className={`${ESCALA_LANDING.formBoton} rounded-full bg-acento font-bold text-papel transition-colors hover:bg-acento-oscuro`}>
        {contactoForm.enviar}
      </button>
    </form>
  )
}

/* Menú hamburguesa de la cabecera del hero: abre una capa a pantalla completa con los apartados
   de la landing (bajan a cada sección) y el botón de WhatsApp. */
function MenuHamburguesa({ alContacto }) {
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
              {/* El editor de QR gratis, debajo de las webs completas */}
              <li className="border-b border-linea">
                <Link to={generadorQr.url} onClick={() => setAbierto(false)} className="flex items-center gap-[0.35rem] py-[0.8rem] text-[0.95rem] font-semibold transition-colors hover:text-acento">
                  {generadorQr.texto}
                  <ArrowUpRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
                </Link>
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

          <button
            type="button"
            onClick={() => {
              setAbierto(false)
              alContacto()
            }}
            className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro"
          >
            {menu.boton}
          </button>
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

// Diseños de la placa de Tu QR: los 5 primeros del editor (el clásico y las primeras siluetas con sus colores)
const DISENOS_LANDING = DISENOS.slice(0, 5)
// La placa de verdad (la del generador), cargada solo al abrir Tu QR: lleva la librería del QR
const GeneradorQR = lazy(() => import('../components/GeneradorQR'))

// Capturas de las demos a tamaño de móvil (src/assets/capturas/<slug>.jpg; las cartas, <slug>-carta.jpg).
// Las demos sin captura salen igual, con el móvil en negro y su nombre dentro.
const CAPTURAS = import.meta.glob('../assets/capturas/*.webp', { eager: true, import: 'default' })
const captura = archivo => CAPTURAS[`../assets/capturas/${archivo}.webp`]
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

// Pestaña Cartas: las cartas de demo. Las miniwebs no salen en la landing (se enseñan en /catalogo)
const WEBS_Y_CARTAS = [
  ...cartas
    .filter(c => c.demo && enEscaparate(c))
    .map(c => ({ foto: captura(`${c.slug}-carta`), nombre: marcaDe(c)?.nombre, ...cartasMiniwebs.tipos.carta, ruta: rutaCarta(c) })),
]
// Pestaña Ejemplos, subpestaña Miniwebs (la de por defecto): miniwebs hechas en el Editor (copias en Supabase, en /demo/slug)
// con su captura (src/assets/capturas/<slug>.webp)
const MINIWEBS = [
  { slug: 'lilac-nails', nombre: 'Lilac Nails', etiqueta: 'Estudio de uñas' },
  { slug: 'barberia-cuervo', nombre: 'Barbería Cuervo', etiqueta: 'Barbería' },
  { slug: 'restaurante-brasas', nombre: 'Restaurante Brasas', etiqueta: 'Restaurante' },
  { slug: 'peluqueria-styles', nombre: 'Peluquería Styles', etiqueta: 'Peluquería' },
  { slug: 'delicias-de-barcelona', nombre: 'Delicias de Barcelona', etiqueta: 'Pastelería' },
].map(m => ({ foto: captura(m.captura ?? m.slug), nombre: m.nombre, titulo: m.nombre, etiqueta: m.etiqueta, ruta: `/demo/${m.slug}` }))

/* El hero es una miniweb, con la misma estructura que las de los clientes:
   escenario con la marca, el texto (cambia con la pestaña) y una fila de móviles con las capturas
   de las demos (como el catálogo, en pequeño) que se desliza con el dedo y pasa sola hasta que se toca;
   pestañas y, debajo, el botón destacado de WhatsApp. Todo en una pantalla. Los textos son provisionales. */
// Dos filas de pestañas: tres arriba y dos abajo, centradas
const PESTANAS = [
  { key: 'ejemplos', texto: 'Inicio' },
  { key: 'qr', texto: 'Tu QR' },
  { key: 'cartas', texto: cartasMiniwebs.pestana },
]
const PESTANAS_ABAJO = [
  { key: 'contacto', texto: 'Contacto' },
]
// Orden de la vuelta de presentación al entrar: todas las pestañas, de arriba abajo y de izquierda a derecha
const ORDEN_PESTANAS = [...PESTANAS, ...PESTANAS_ABAJO]
const CLAVE_PESTANA = 'landing-pestana'

// El hero de Inicio: un móvil con la captura de una miniweb hecha en el Editor y, a su derecha y apoyado en él, un QR de verdad.
// Ocupa el hueco que sobra y, si no hay, se recorta o desaparece.
function QrMostraq() {
  const caja = useRef(null)
  useEffect(() => {
    let vivo = true
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!vivo || !caja.current) return
      caja.current.replaceChildren()
      new QRCodeStyling({
        width: 220,
        height: 220,
        type: 'svg',
        data: 'https://mostraq.es',
        margin: 0,
        qrOptions: { errorCorrectionLevel: 'M' },
        dotsOptions: { type: 'rounded', color: '#141414' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#141414' },
        cornersDotOptions: { type: 'dot', color: '#141414' },
        backgroundOptions: { color: '#FFFFFF' },
      }).append(caja.current)
    })
    return () => {
      vivo = false
    }
  }, [])
  return <div ref={caja} className="aspect-square w-full [&_svg]:h-full [&_svg]:w-full" />
}

// Las capturas que pasan una tras otra en el móvil del hero, y cada cuánto cambian
const CAPTURAS_HERO = ['lilac-nails', 'barberia-cuervo', 'restaurante-brasas']
const CAMBIO_CAPTURA_MS = 4000

function MockupMiniweb({ activo }) {
  const [actual, setActual] = useState(0)
  // Cambian solas mientras se ve la pestaña Inicio; con la opción de reducir animaciones, se queda la primera
  useEffect(() => {
    if (!activo || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActual(a => (a + 1) % CAPTURAS_HERO.length), CAMBIO_CAPTURA_MS)
    return () => clearInterval(id)
  }, [activo])
  return (
    <div aria-hidden="true" className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-[1.2rem]">
      {/* --ancho: el ancho del móvil. 13,2 rem como siempre y, solo en pantallas largas (cuando el hueco es mayor que el móvil), crece hasta llenarlo, con
          un máximo; my-auto lo centra en el hueco y, si no cabe, se queda arriba y se recorta por abajo. El QR y el desplazamiento, proporcionales */}
      <div
        className="relative mx-auto my-auto"
        style={{ '--ancho': 'clamp(13.2rem, calc((100svh - 25rem) * 0.462), 22rem)', width: 'var(--ancho)', transform: 'translateX(calc(var(--ancho) * -0.12))' }}
      >
        {/* Móvil con la captura de una miniweb */}
        <div className="rounded-[1.6rem] border border-white/20 bg-[#1d1d1b] p-[0.35rem] shadow-[0_1.2rem_2.4rem_-0.8rem_rgb(0_0_0/0.8)]">
          {/* Apiladas en el mismo sitio (el marco toma el alto de la más alta) y con un fundido al pasar */}
          <div className="grid overflow-hidden rounded-[1.3rem]">
            {CAPTURAS_HERO.map((slug, i) => (
              <img key={slug} src={captura(slug)} alt="" className={`col-start-1 row-start-1 block h-auto w-full transition-opacity duration-700 ${i === actual ? 'opacity-100' : 'opacity-0'}`} />
            ))}
          </div>
        </div>
        {/* El QR, a la derecha del móvil y apoyado en él, un poco inclinado */}
        <div
          className="absolute rotate-[7deg] rounded-[0.6rem] bg-white p-[0.35rem] shadow-[0_0.9rem_1.8rem_-0.5rem_rgb(0_0_0/0.75)]"
          style={{ width: 'calc(var(--ancho) * 0.348)', right: 'calc(var(--ancho) * -0.227)', top: 'calc(var(--ancho) * 0.12)' }}
        >
          <QrMostraq />
        </div>
      </div>
    </div>
  )
}

function HeroMiniweb() {
  // Si llega desde un botón de presupuesto (/?contacto=presupuesto o /?contacto=google), se abre directamente la pestaña Contacto
  const { search } = useLocation()
  const llegaConMotivo = new URLSearchParams(search).get('contacto')
  const [motivo, setMotivo] = useState(() => (llegaConMotivo && contactoForm.motivos[llegaConMotivo] ? llegaConMotivo : 'contacto'))
  const abreContacto = Boolean(llegaConMotivo && contactoForm.motivos[llegaConMotivo])
  // Al volver de una demo (se abren en la misma pestaña), la landing se abre en la pestaña de donde venías.
  // Se guarda solo durante la visita (sessionStorage); al cerrar el navegador se olvida
  const [pestana, setPestana] = useState(() => {
    if (abreContacto) return 'contacto'
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
  const { enVuelta, parar } = useVueltaPestanas(ORDEN_PESTANAS, ponerPestana, 'landing-vuelta-vista', abreContacto)
  // Subpestaña de la pestaña Planes: Planes, Ventajas, Pasos o SEO
  const [, setSubComo] = useState(comoFunciona.subpestanas[0].key)
  // Igual que la placa de Tu QR: al tocar la pestaña Ventajas (no en la vuelta inicial), las subpestañas
  // van cambiando solas cada 4 s, hasta que el usuario toca algo dentro. Si ya eligió una, no vuelven a moverse.
  const [subSola] = useState(false)

  useEffect(() => {
    if (pestana !== 'como' || !subSola) return
    const subs = comoFunciona.subpestanas
    const id = setInterval(() => {
      setSubComo(s => subs[(subs.findIndex(x => x.key === s) + 1) % subs.length].key)
    }, CAMBIO_SUBPESTANA_MS)
    return () => clearInterval(id)
  }, [pestana, subSola])
  // Placa de Tu QR: el diseño y la forma de los puntos elegidos
  const [color, setColor] = useState(0)
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
      setColor(c => (c + 1) % DISENOS_LANDING.length)
    }, CAMBIO_PLACA_MS)
    return () => clearInterval(id)
  }, [pestana, placaSola])
  // Las filas de móviles siguen en la página aunque su pestaña esté oculta: al volver a ella, empiezan otra vez
  // por el primero (antes se volvían a pintar desde cero)
  useEffect(() => {
    if (pestana === 'cartas') filaCartas.current?.scrollTo({ left: 0, behavior: 'instant' })
  }, [pestana])

  // Fila de Cartas y ofertas: el móvil del centro es el que se nombra debajo
  const [actualCarta, setActualCarta] = useState(0)
  const filaCartas = useRef(null)
  // Subpestaña de Ejemplos: Miniwebs (por defecto) o Cartas
  const [subEj, setSubEj] = useState(cartasMiniwebs.subpestanas[0].key)
  const listaEj = subEj === 'cartas' ? WEBS_Y_CARTAS : MINIWEBS
  const ejemploCarta = listaEj[actualCarta] ?? listaEj[0]
  const [tocadoCarta, setTocadoCarta] = useState(false)

  const irACarta = i => {
    const f = filaCartas.current
    const el = f?.children[i]
    if (el) f.scrollTo({ left: el.offsetLeft - f.offsetLeft - (f.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }

  // Como en Inicio: pasa sola al siguiente móvil mientras se está en Cartas y ofertas, hasta que se toca la fila.
  // Al volver a la pestaña empieza otra vez desde el primero
  useEffect(() => {
    if (pestana !== 'cartas' || enVuelta || tocadoCarta || listaEj.length < 2) return
    const t = setTimeout(() => irACarta((actualCarta + 1) % listaEj.length), TURNO_DEMOS_MS)
    return () => clearTimeout(t)
  }, [pestana, actualCarta, tocadoCarta, enVuelta, listaEj])

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
          <MenuHamburguesa alContacto={() => { setMotivo('presupuesto'); setPestana('contacto') }} />
        </div>

        {/* Las pestañas: todas están en el HTML (para Google y los lectores de pantalla) y solo se ve la elegida.
            Cada una es un panel (Panel) con su titular, si lo tiene, arriba */}

        {/* Pestaña Cartas y miniwebs: como Inicio, primero las miniwebs y después las cartas; tocarlos abre la demo */}
        <Panel clave="cartas" pestana={pestana}>
            <nav className="flex gap-[1.4rem] border-b border-linea px-[1.25rem] pt-[0.9rem]">
              {cartasMiniwebs.subpestanas.map(s => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={subEj === s.key}
                  onClick={() => { setSubEj(s.key); setActualCarta(0); setTocadoCarta(false) }}
                  className={`relative pb-[0.5rem] text-[0.92rem] font-semibold transition-colors ${subEj === s.key ? 'text-tinta' : 'text-suave hover:text-tinta'}`}
                >
                  {s.texto}
                  <span className={`absolute inset-x-0 bottom-0 h-[0.15rem] rounded-full bg-acento transition-transform duration-300 ${subEj === s.key ? 'scale-x-100' : 'scale-x-0'}`} />
                </button>
              ))}
            </nav>
            <div className="px-[1.25rem] pt-[0.9rem]">
              <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {subEj === 'cartas' ? cartasMiniwebs.titulo : cartasMiniwebs.tituloMiniwebs}
              </h2>
              {subEj === 'cartas' ? (
                <VerTodas to="/catalogo?tipo=carta">{escaparate.verCartasMiniwebs}</VerTodas>
              ) : (
                <VerTodas to="/catalogo">{escaparate.verMiniwebs}</VerTodas>
              )}
            </div>
            <div className="relative mt-[1rem] min-h-[9rem] flex-1">
              <ul
                key={subEj}
                ref={filaCartas}
                onScroll={() => alDeslizar(filaCartas.current, setActualCarta)}
                onTouchStart={() => setTocadoCarta(true)}
                onMouseDown={() => setTocadoCarta(true)}
                className="absolute inset-0 flex snap-x snap-mandatory gap-[0.9rem] overflow-x-auto px-[25%] [scrollbar-width:none]"
              >
                {listaEj.map((d, i) => (
                  <li key={d.ruta} className="h-full shrink-0 snap-center py-[0.2rem]">
                    <Link
                      to={d.ruta}
                      aria-label={`Abrir el ejemplo de ${d.nombre}`}
                      className={`relative block ${d.foto ? '' : 'aspect-[390/844]'} h-full rounded-[1.2rem] border border-white/15 bg-[#1d1d1b] p-[0.3rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-[opacity,transform] duration-500 ${
                        i === actualCarta ? 'opacity-100' : 'scale-[0.92] opacity-55'
                      }`}
                    >
                      {d.foto ? (
                        <span className="block h-full overflow-hidden rounded-[0.95rem]">
                          <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} className="block h-full w-auto max-w-none" />
                        </span>
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
                <span className="font-semibold">{ejemploCarta?.nombre}</span>{' '}
                <span className="text-suave">· {ejemploCarta?.etiqueta}</span>
              </p>
              <div className="flex shrink-0 gap-[0.3rem]">
                {listaEj.map((d, i) => (
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
          <FormularioContacto key={motivo} motivo={motivo} />
        </Panel>

        {/* Pestaña Tu QR: la placa del mostrador, personalizable con colores y forma de los puntos del QR */}
        <Panel clave="qr" pestana={pestana}>
            <div className="px-[1.25rem] pt-[0.9rem]">
              <h2 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {hero.inicio.titulo}
              </h2>
            </div>
            {/* Tocar la placa o sus botones para los cambios solos */}
            <div onPointerDown={pararPlaca} className="flex min-h-[10rem] flex-1 items-center py-[1rem]">
              <div className="flex w-full items-stretch gap-[0.9rem]">
                {/* Izquierda: la placa (recta) y, debajo, sus estilos. El ancho de esta columna es el de la placa */}
                <div className={`${ESCALA_LANDING.placa} ml-[1.25rem] shrink-0`}>
                  {/* La placa de verdad (la misma que hace el generador), con su silueta y sus colores; mientras carga, un
                      hueco del mismo tamaño */}
                  <div className="drop-shadow-[0_1.25rem_1.5rem_rgb(0_0_0/0.5)]">
                    <Suspense fallback={<div className="aspect-[3/4] w-full" />}>
                      <GeneradorQR
                        modo="placa"
                        url={`${DOMINIO}/`}
                        nombre={hero.placa.nombre}
                        textoAbajo={hero.placa.texto}
                        redes={hero.placa.redes}
                        diseno={DISENOS_LANDING[color].clave}
                      />
                    </Suspense>
                  </div>
                  <div className="mt-[0.9rem]">
              {/* Diseños de la placa: cada uno con su silueta en sus colores (el clásico, un QR) */}
                  <div className="flex gap-[0.35rem]">
                    {DISENOS_LANDING.map((d, i) => (
                      <button
                        key={d.clave}
                        type="button"
                        title={d.nombre}
                        aria-label={`Diseño ${d.nombre}`}
                        aria-pressed={i === color}
                        onClick={() => setColor(i)}
                        className={`flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.4rem] border-2 transition-transform duration-300 ${i === color ? 'scale-110 border-acento' : 'border-white/15 hover:scale-105'}`}
                      >
                        {!d.silueta ? (
                          <span className="flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-[0.2rem]" style={{ background: '#FFFFFF', color: d.qr }}>
                            <QrCode className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.5} aria-hidden="true" />
                          </span>
                        ) : (
                          <span
                            className="block h-[1.35rem] w-[1.35rem]"
                            style={{
                              background: d.degradado ? `linear-gradient(45deg, ${d.degradado.join(', ')})` : (d.muestra ?? d.qr),
                              maskImage: mascaraSilueta(d.silueta),
                              WebkitMaskImage: mascaraSilueta(d.silueta),
                              maskSize: 'contain',
                              WebkitMaskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              WebkitMaskRepeat: 'no-repeat',
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
                {/* Derecha: el subtítulo y "Leer más", a la altura de la placa */}
                <div className="mr-[1.25rem] flex min-w-0 flex-1 flex-col items-start justify-between">
                  <div>
                    <p className="text-[0.9rem] leading-[1.35] text-suave">{hero.inicio.subtitulo}</p>
                    <VerTodas to="/crear-qr">{hero.inicio.leerMas}</VerTodas>
                  </div>
                </div>
              </div>
            </div>
        </Panel>

        {/* Pestaña Inicio (clave ejemplos, la primera): el hero de Mostraq, con fondo oscuro liso, el titular grande y, debajo,
            qué hace Mostraq y el móvil con una miniweb y un QR */}
        <Panel clave="ejemplos" pestana={pestana}>
          <div className="relative mt-[0.5rem] flex min-h-[12rem] flex-1 flex-col justify-between px-[1.25rem] pt-[1.4rem]">
            <div className="relative">
            <h1 className="font-titulo text-[clamp(2.6rem,2rem+4vw,3.6rem)] font-black leading-[0.98] tracking-tight">
              {hero.titulo}
            </h1>
            <p className="mt-[0.6rem] text-[0.82rem] font-semibold leading-[1.3] text-tinta">{hero.lema}</p>
            <p className="mt-[0.5rem] max-w-[26rem] text-[clamp(0.92rem,0.85rem+0.3vw,1.02rem)] leading-[1.5] text-suave">
              {hero.texto}
            </p>
            </div>
            <MockupMiniweb activo={pestana === 'ejemplos'} />
          </div>
        </Panel>
        {pestana === 'ejemplos' && <SelectorTema />}
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
                  if (p.key === 'cartas') { setActualCarta(0); setTocadoCarta(false) }
                }}
                className={`rounded-[0.7rem] py-[0.65rem] text-[0.82rem] font-semibold transition-colors ${
                  f > 0 ? 'w-[calc((100%-0.7rem)/3*1.3)]' : 'w-[calc((100%-0.7rem)/3)]'
                } ${pestana === p.key ? 'bg-acento text-papel' : 'bg-crema text-tinta hover:bg-linea'}`}
              >
                {p.texto}
              </button>
            ))}
            {/* Planes ya no es una pantalla de la landing: lleva a la página con todo explicado y con scroll (/planes) */}
            {f > 0 && (
              <Link to="/planes" className="w-[calc((100%-0.7rem)/3*1.3)] rounded-[0.7rem] bg-crema py-[0.65rem] text-center text-[0.82rem] font-semibold text-tinta transition-colors hover:bg-linea">
                {comoFunciona.pestana}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="pb-[1.25rem]" />
    </div>
  )
}

/* ---------- Versión de escritorio ----------
   Desde 1024 px de ancho la landing es una página completa con scroll y secciones (la de móvil sigue siendo la pantalla única de arriba). Las dos se pintan
   siempre en el HTML y el CSS enseña la que toca (lg:hidden / hidden lg:block): así Google lee el texto de todas las secciones. Los textos son los de
   landing/contenido.js. Los ids de las secciones no se repiten con los del móvil (panel-, tab-). */
const SECCIONES = [
  { id: 'ejemplos', texto: 'Ejemplos' },
  { id: 'tu-qr', texto: 'Tu QR' },
  { id: 'como-funciona', texto: 'Cómo funciona' },
  { id: 'planes', texto: 'Planes' },
  { id: 'preguntas', texto: 'Dudas' },
]
const BOTON_LLENO = 'inline-flex min-h-[3.1rem] items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro'
const BOTON_VACIO = 'inline-flex min-h-[3.1rem] items-center justify-center rounded-full border border-tinta/30 px-[1.6rem] text-[1rem] font-bold transition-colors hover:border-acento hover:text-acento'

// ¿Pantalla ancha (desde 1024 px)? Para no cargar en el móvil lo que solo usa el escritorio (la placa de Tu QR, las animaciones)
function useEscritorio() {
  const [si, setSi] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(min-width: 1024px)').matches))
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const cambiar = () => setSi(m.matches)
    cambiar()
    m.addEventListener('change', cambiar)
    return () => m.removeEventListener('change', cambiar)
  }, [])
  return si
}

function Seccion({ id, fondo = false, children }) {
  return (
    <section id={id} className={`scroll-mt-[4.25rem] py-[5.5rem] ${fondo ? 'bg-crema' : ''}`}>
      <div className="mx-auto w-full max-w-[72rem] px-[2rem]">{children}</div>
    </section>
  )
}

function TituloSeccion({ children, texto }) {
  return (
    <div className="max-w-[42rem]">
      <h2 className="font-titulo text-[clamp(2rem,1.3rem+2vw,3.2rem)] font-black leading-[1.05] tracking-tight">{children}</h2>
      {texto && <p className="mt-[1rem] text-[1.1rem] leading-[1.6] text-suave">{texto}</p>}
    </div>
  )
}

// La barra de arriba de escritorio (desde 1024 px). En la landing los enlaces bajan a su sección; en las demás páginas (Planes, Catálogo, Crea tu QR y los textos
// legales) llevan a la landing, a esa sección. En móvil no se ve (cada página tiene su cabecera sencilla)
export function CabeceraEscritorio({ enLanding = false }) {
  const aSeccion = id => (enLanding ? { href: `#${id}` } : { to: `/#${id}` })
  const Enlace = enLanding ? 'a' : Link
  return (
    <header className="sticky top-0 z-40 hidden border-b border-linea bg-papel/90 backdrop-blur lg:block">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[72rem] items-center gap-[2rem] px-[2rem]">
        <Enlace {...(enLanding ? { href: '#inicio' } : { to: '/' })} className="font-titulo text-[1.4rem] font-black tracking-tight">
          {marca.nombre}
        </Enlace>
        <nav aria-label="Secciones" className="ml-auto flex items-center gap-[1.75rem]">
          {SECCIONES.map(s => (
            <Enlace key={s.id} {...aSeccion(s.id)} className="text-[0.95rem] font-semibold text-suave transition-colors hover:text-tinta">
              {s.texto}
            </Enlace>
          ))}
        </nav>
        <SelectorTema enLinea />
        <Enlace {...(enLanding ? { href: '#contacto' } : { to: '/?contacto=presupuesto' })} className="inline-flex min-h-[2.6rem] items-center rounded-full bg-acento px-[1.3rem] text-[0.95rem] font-bold text-papel transition-colors hover:bg-acento-oscuro">
          {menu.boton}
        </Enlace>
      </div>
    </header>
  )
}

// Una captura de móvil con su nombre debajo, que lleva al ejemplo
function TarjetaEjemplo({ d }) {
  return (
    <li>
      <Link to={d.ruta} className="group block">
        <span className="block overflow-hidden rounded-[1.4rem] border border-white/15 bg-[#1d1d1b] p-[0.35rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-transform duration-300 group-hover:-translate-y-[0.3rem]">
          {d.foto ? (
            <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} loading="lazy" className="block h-auto w-full rounded-[1.1rem]" />
          ) : (
            <span className="flex aspect-[390/844] w-full flex-col items-center justify-center rounded-[1.1rem] bg-papel px-[1rem] text-center">
              <span className="font-titulo text-[1.2rem] font-black leading-[1.1]">{d.titulo}</span>
            </span>
          )}
        </span>
        <span className="mt-[0.9rem] flex items-baseline justify-between gap-[0.5rem]">
          <span>
            <span className="block font-semibold">{d.nombre}</span>
            {d.etiqueta && <span className="block text-[0.85rem] text-suave">{d.etiqueta}</span>}
          </span>
          <span className="inline-flex shrink-0 items-center gap-[0.25rem] text-[0.85rem] font-semibold text-suave transition-colors group-hover:text-acento">
            {hero.pista}
            <ArrowUpRight className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </li>
  )
}

function LandingEscritorio() {
  const escritorio = useEscritorio()
  const { search, hash } = useLocation()
  // Llegando de otra página con un enlace a una sección (/#planes...), baja a esa sección
  useEffect(() => {
    if (escritorio && hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
  }, [escritorio, hash])
  // Llegando de un botón de presupuesto (/?contacto=presupuesto o google), baja directamente al formulario de contacto
  const motivoUrl = new URLSearchParams(search).get('contacto')
  const motivo = motivoUrl && contactoForm.motivos[motivoUrl] ? motivoUrl : 'contacto'
  useEffect(() => {
    if (escritorio && motivoUrl && contactoForm.motivos[motivoUrl]) document.getElementById('contacto')?.scrollIntoView()
  }, [escritorio, motivoUrl])

  // La placa de Tu QR: el diseño y la forma de los puntos elegidos
  const [color, setColor] = useState(0)

  return (
    <div className="hidden bg-papel font-texto text-tinta lg:block">
      <CabeceraEscritorio enLanding />

      {/* Inicio */}
      <section id="inicio" className="scroll-mt-[4.25rem]">
        <div className="mx-auto grid w-full max-w-[72rem] grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-[3rem] px-[2rem] py-[4rem]">
          <div>
            <h1 className="font-titulo text-[clamp(3rem,1.8rem+3.2vw,5rem)] font-black leading-[0.98] tracking-tight">{hero.titulo}</h1>
            <p className="mt-[1.5rem] text-[1.1rem] font-semibold">{hero.lema}</p>
            <p className="mt-[0.6rem] max-w-[30rem] text-[1.25rem] leading-[1.5] text-suave">{hero.texto}</p>
            <div className="mt-[2.25rem] flex flex-wrap gap-[0.8rem]">
              <a href="#contacto" className={BOTON_LLENO}>
                {menu.botonPresupuesto}
              </a>
              <a href="#ejemplos" className={BOTON_VACIO}>
                {hero.enlace}
              </a>
            </div>
          </div>
          <div className="relative flex h-[36rem] flex-col">
            <MockupMiniweb activo={escritorio} />
          </div>
        </div>
      </section>

      {/* Por qué */}
      <Seccion id="por-que" fondo>
        <div className="mx-auto max-w-[46rem] text-center">
          <h2 className="font-titulo text-[clamp(2rem,1.3rem+2vw,3.2rem)] font-black leading-[1.05] tracking-tight">{porque.titulo}</h2>
          <p className="mt-[1.25rem] text-[1.2rem] leading-[1.65] text-suave">{porque.texto}</p>
        </div>
      </Seccion>

      {/* Ejemplos */}
      <Seccion id="ejemplos">
        <TituloSeccion>{cartasMiniwebs.tituloMiniwebs}</TituloSeccion>
        <h3 className="mt-[2.5rem] font-titulo text-[1.3rem] font-black">{cartasMiniwebs.subpestanas[0].texto}</h3>
        <ul className="mt-[1.25rem] grid grid-cols-3 gap-[2rem]">
          {MINIWEBS.map(d => (
            <TarjetaEjemplo key={d.ruta} d={d} />
          ))}
        </ul>
        <VerTodas to="/catalogo">{escaparate.verMiniwebs}</VerTodas>
        {WEBS_Y_CARTAS.length > 0 && (
          <>
            <h3 className="mt-[3.5rem] font-titulo text-[1.3rem] font-black">{cartasMiniwebs.subpestanas[1].texto}</h3>
            <ul className="mt-[1.25rem] grid grid-cols-4 gap-[1.75rem]">
              {WEBS_Y_CARTAS.map(d => (
                <TarjetaEjemplo key={d.ruta} d={d} />
              ))}
            </ul>
            <VerTodas to="/catalogo?tipo=carta">{escaparate.verCartasMiniwebs}</VerTodas>
          </>
        )}
      </Seccion>

      {/* Tu QR */}
      <Seccion id="tu-qr" fondo>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-[4rem]">
          <div>
            <TituloSeccion texto={hero.inicio.subtitulo}>{hero.inicio.titulo}</TituloSeccion>
            {/* Diseños de la placa: cada uno con su silueta en sus colores (el clásico, un QR) */}
            <div className="mt-[2rem] flex flex-wrap gap-[0.5rem]">
              {DISENOS_LANDING.map((d, i) => (
                <button
                  key={d.clave}
                  type="button"
                  title={d.nombre}
                  aria-label={`Diseño ${d.nombre}`}
                  aria-pressed={i === color}
                  onClick={() => setColor(i)}
                  className={`flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-[0.6rem] border-2 transition-transform duration-300 ${i === color ? 'scale-110 border-acento' : 'border-linea hover:scale-105'}`}
                >
                  {!d.silueta ? (
                    <span className="flex h-[1.8rem] w-[1.8rem] items-center justify-center rounded-[0.3rem]" style={{ background: '#FFFFFF', color: d.qr }}>
                      <QrCode className="h-[1.4rem] w-[1.4rem]" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  ) : (
                    <span
                      className="block h-[1.8rem] w-[1.8rem]"
                      style={{
                        background: d.degradado ? `linear-gradient(45deg, ${d.degradado.join(', ')})` : (d.muestra ?? d.qr),
                        maskImage: mascaraSilueta(d.silueta),
                        WebkitMaskImage: mascaraSilueta(d.silueta),
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-[1.5rem]">
              <VerTodas to="/crear-qr">{hero.inicio.leerMas}</VerTodas>
              <VerTodas to={generadorQr.url}>{generadorQr.textoGratis}</VerTodas>
            </div>
          </div>
          <div className="flex justify-center py-[1rem]">
            <div className="w-[min(20rem,100%)] -rotate-[4deg] drop-shadow-[0_1.25rem_1.5rem_rgb(0_0_0/0.5)]">
              {escritorio && (
                <Suspense fallback={<div className="aspect-[3/4] w-full" />}>
                  <GeneradorQR modo="placa" url={`${DOMINIO}/`} nombre={hero.placa.nombre} textoAbajo={hero.placa.texto} redes={hero.placa.redes} diseno={DISENOS_LANDING[color].clave} />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </Seccion>

      {/* Cómo funciona */}
      <Seccion id="como-funciona">
        <TituloSeccion>{pasos.titulo}</TituloSeccion>
        <ol className="mt-[2.5rem] grid grid-cols-3 gap-[1.5rem]">
          {pasos.lista.map((p, i) => (
            <li key={p.titulo} className="rounded-[1.25rem] border border-linea bg-crema p-[1.75rem]">
              <span className="font-titulo text-[2.8rem] font-black leading-none text-acento">{i + 1}</span>
              <h3 className="mt-[0.9rem] font-titulo text-[1.35rem] font-black leading-[1.15]">{p.titulo}</h3>
              <p className="mt-[0.6rem] leading-[1.6] text-suave">{p.texto}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-[4rem] font-titulo text-[1.8rem] font-black tracking-tight">{ventajas.titulo}</h3>
        <ul className="mt-[1.5rem] grid grid-cols-2 gap-x-[3rem] border-t border-linea">
          {ventajas.lista.map(v => (
            <li key={v.titulo} className="border-b border-linea py-[1.25rem]">
              <p className="font-titulo text-[1.2rem] font-black">{v.titulo}</p>
              <p className="mt-[0.3rem] leading-[1.55] text-suave">{v.texto}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      {/* Planes */}
      <Seccion id="planes" fondo>
        <TituloSeccion texto={planesDetalle.texto}>{planesDetalle.titulo}</TituloSeccion>
        <div className="mt-[2.5rem] grid grid-cols-2 gap-[1.5rem]">
          {planesDetalle.lista.map(p => (
            <article key={p.titulo} className="flex flex-col rounded-[1.25rem] border border-linea bg-papel p-[2rem]">
              <div className="flex items-baseline justify-between gap-[1rem]">
                <h3 className="font-titulo text-[1.7rem] font-black leading-[1.1]">{p.titulo}</h3>
                <p className="shrink-0 font-titulo text-[1.3rem] font-black text-acento">{p.precio}</p>
              </div>
              <p className="mt-[0.75rem] leading-[1.6] text-suave">{p.texto}</p>
              <ul className="mt-[1.25rem] grid gap-[0.6rem]">
                {p.incluye.map(i => (
                  <li key={i} className="flex gap-[0.6rem] leading-[1.5]">
                    <span aria-hidden="true" className="mt-[0.55rem] h-[0.4rem] w-[0.4rem] shrink-0 rounded-full bg-acento" />
                    {i}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-[2rem] flex flex-wrap gap-[0.8rem]">
          <a href="#contacto" className={BOTON_LLENO}>
            {planes.boton}
          </a>
          <Link to="/planes" className={BOTON_VACIO}>
            {planes.verDetalle}
          </Link>
        </div>
      </Seccion>

      {/* Que te encuentren (SEO) */}
      <Seccion id="seo">
        <TituloSeccion texto={seo.texto}>{seo.titulo}</TituloSeccion>
        <div className="mt-[2.5rem] grid grid-cols-3 gap-[1.5rem]">
          <div className="rounded-[1.25rem] border border-acento/60 bg-crema p-[1.75rem]">
            <p className="text-[0.85rem] font-bold text-acento">{seo.incluido.etiqueta}</p>
            <h3 className="mt-[0.4rem] font-titulo text-[1.3rem] font-black leading-[1.15]">{seo.incluido.titulo}</h3>
            <p className="mt-[0.6rem] leading-[1.6] text-suave">{seo.incluido.texto}</p>
          </div>
          {seo.lista.map(s => (
            <div key={s.titulo} className="rounded-[1.25rem] border border-linea bg-crema p-[1.75rem]">
              <h3 className="font-titulo text-[1.3rem] font-black leading-[1.15]">{s.titulo}</h3>
              <p className="mt-[0.6rem] leading-[1.6] text-suave">{s.texto}</p>
            </div>
          ))}
        </div>
        <div className="mt-[2rem] flex flex-wrap gap-[0.8rem]">
          <a href="#contacto" className={BOTON_VACIO}>
            {seo.boton}
          </a>
          <Link to="/planes#seo" className={BOTON_VACIO}>
            {seo.verMas}
          </Link>
        </div>
      </Seccion>

      {/* Preguntas */}
      <Seccion id="preguntas" fondo>
        <TituloSeccion>{preguntas.titulo}</TituloSeccion>
        <div className="mt-[2rem] max-w-[48rem] border-t border-linea">
          {preguntas.lista.map(p => (
            <details key={p.pregunta} className="group border-b border-linea py-[1.1rem]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-[1rem] font-titulo text-[1.2rem] font-black [&::-webkit-details-marker]:hidden">
                {p.pregunta}
                <span aria-hidden="true" className="text-[1.5rem] font-normal text-acento transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-[0.75rem] max-w-[42rem] leading-[1.65] text-suave">{p.respuesta}</p>
            </details>
          ))}
        </div>
      </Seccion>

      {/* Contacto */}
      <Seccion id="contacto">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,28rem)] items-center gap-[4rem]">
          <TituloSeccion texto={cierre.texto}>{cierre.titulo}</TituloSeccion>
          <div className="rounded-[1.25rem] border border-linea bg-crema py-[1rem]">
            <FormularioContacto key={motivo} motivo={motivo} />
          </div>
        </div>
      </Seccion>

      {/* Pie */}
      <footer className="border-t border-linea">
        <div className="mx-auto grid w-full max-w-[72rem] grid-cols-[minmax(0,1.4fr)_auto_auto] items-start gap-[4rem] px-[2rem] py-[3rem]">
          <div>
            <p className="font-titulo text-[1.4rem] font-black tracking-tight">{marca.nombre}</p>
            <p className="mt-[0.75rem] max-w-[26rem] leading-[1.6] text-suave">{menu.texto}</p>
            <p className="mt-[1.5rem] text-[0.85rem] text-suave">{menu.firma}</p>
          </div>
          <div>
            <p className="text-[0.85rem] font-semibold text-suave">{menu.redesTexto}</p>
            <div className="mt-[0.75rem] flex gap-[0.6rem]">
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
          </div>
          <ul className="grid gap-[0.6rem] text-[0.95rem]">
            <li>
              <a href={webCompleta.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.35rem] font-semibold transition-colors hover:text-acento">
                {webCompleta.texto}
                <ArrowUpRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
              </a>
            </li>
            {/* El editor de QR gratis, debajo de la web completa */}
            <li>
              <Link to={generadorQr.url} className="inline-flex items-center gap-[0.35rem] font-semibold transition-colors hover:text-acento">
                {generadorQr.texto}
                <ArrowUpRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
              </Link>
            </li>
            {menu.legales.map(l => (
              <li key={l.texto}>
                <a href={l.url} className="text-suave transition-colors hover:text-tinta">
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    // Móvil: sin scroll vertical, la landing es la miniweb de la primera pantalla. Escritorio (desde 1024 px): la página completa con secciones
    <>
    <div className="h-svh overflow-hidden bg-papel font-texto text-tinta lg:hidden">
      {/* Primera pantalla: el hero es una miniweb, exactamente el alto de la pantalla.
          Alto fijo (h-svh, no min-h): así una pestaña con mucho contenido se desliza por dentro
          en vez de estirar la pantalla y empujar las pestañas de abajo fuera de la vista */}
      <div className="flex h-svh flex-col">
        <HeroMiniweb />
      </div>
    </div>
    <LandingEscritorio />
    </>
  )
}
