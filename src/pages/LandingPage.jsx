import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Menu, X, QrCode } from 'lucide-react'
import { DISENOS, mascaraSilueta } from '../lib/siluetas'
import { SocialIcon } from '../components/SocialIcons'
import { COLORES_REDES } from '../lib/coloresRedes'
import { cartas, marcaDe, rutaCarta } from '../cartas'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, pasos, comoFunciona, ventajas, seo, planes, precio, contactoForm, webCompleta, cartasMiniwebs, escaparate, menu } from '../landing/contenido'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { ESCALA_LANDING } from '../lib/escalaTexto'
import { DOMINIO } from '../lib/dominio'

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

// Formas de los puntos del QR que se pueden elegir en la placa de Tu QR (puntos: la del generador)
const FORMAS = [
  { key: 'cuadrado', texto: 'cuadrados', clase: '', puntos: 'square' },
  { key: 'redondo', texto: 'redondeados', clase: 'rounded-[0.15rem]', puntos: 'rounded' },
  { key: 'punto', texto: 'redondos', clase: 'rounded-full', puntos: 'dots' },
]
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

// Pestaña Cartas: las cartas de demo. Las miniwebs no salen en la landing (se enseñan en /miniweb)
const WEBS_Y_CARTAS = [
  ...cartas
    .filter(c => c.demo && enEscaparate(c))
    .map(c => ({ foto: captura(`${c.slug}-carta`), nombre: marcaDe(c)?.nombre, ...cartasMiniwebs.tipos.carta, ruta: rutaCarta(c) })),
]
// Pestaña Ejemplos, subpestaña Miniwebs (la de por defecto): de momento, tres miniwebs hechas en el Editor (copias en Supabase, en /demo/slug)
// con su captura (src/assets/capturas/<slug>.webp)
const MINIWEBS = [
  { slug: 'lilac-nails', nombre: 'Lilac Nails', etiqueta: 'Estudio de uñas' },
  { slug: 'barberia-cuervo', nombre: 'Barbería Cuervo', etiqueta: 'Barbería' },
  { slug: 'restaurante-brasas', nombre: 'Restaurante Brasas', etiqueta: 'Restaurante' },
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
  // Placa de Tu QR: el diseño y la forma de los puntos elegidos
  const [color, setColor] = useState(0)
  const [forma, setForma] = useState('redondo')
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
      setForma(f => FORMAS[(FORMAS.findIndex(x => x.key === f) + 1) % FORMAS.length].key)
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
                <VerTodas to="/miniweb">{escaparate.verMiniwebs}</VerTodas>
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
                      aria-label={`Abrir la demo de ${d.nombre}`}
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
            <div onPointerDown={pararPlaca} className="flex min-h-[10rem] flex-1 items-center justify-center py-[1rem]">
              {/* La placa de verdad (la misma que hace el generador), con su silueta y sus colores; mientras carga, un
                  hueco del mismo tamaño */}
              <div className={`${ESCALA_LANDING.placa} -rotate-[4deg] drop-shadow-[0_1.25rem_1.5rem_rgb(0_0_0/0.5)]`}>
                <Suspense fallback={<div className="aspect-[3/4] w-full" />}>
                  <GeneradorQR
                    modo="placa"
                    url={`${DOMINIO}/`}
                    nombre={marca.nombre}
                    diseno={DISENOS_LANDING[color].clave}
                    formaPuntos={FORMAS.find(f => f.key === forma)?.puntos}
                  />
                </Suspense>
              </div>
            </div>

            <div onPointerDown={pararPlaca} className="flex items-center justify-between gap-[1rem] px-[1.25rem] pb-[1rem]">
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
