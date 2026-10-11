import { rutaNegocio } from '../negocios'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Movil from '../components/Movil'
import Placa from '../components/Placa'
import { tematicasConDemos, secuenciaDemos, tematicaDe, getTematica } from '../lib/tematicas'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, porque, pasos, botones, ejemplos, precio, preguntas, cierre, pie } from '../landing/contenido'

const contacto = enlaceWhatsapp(marca.whatsapp, marca.mensajeWhatsapp)

function BotonWhatsapp({ children, className = '' }) {
  return (
    <a
      href={contacto}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro ${className}`}
    >
      {children}
    </a>
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

// Formas de los puntos del QR que se pueden elegir en la placa de Inicio
const FORMAS = [
  { key: 'cuadrado', texto: 'cuadrados', clase: '' },
  { key: 'redondo', texto: 'redondeados', clase: 'rounded-[0.15rem]' },
  { key: 'punto', texto: 'redondos', clase: 'rounded-full' },
]

// Capturas de las demos a tamaño de móvil (src/assets/capturas/<slug>.jpg), en el orden del catálogo
const CAPTURAS = import.meta.glob('../assets/capturas/*.jpg', { eager: true, import: 'default' })
const ESCAPARATE = secuenciaDemos
  .map(n => ({ foto: CAPTURAS[`../assets/capturas/${n.slug}.jpg`], nombre: n.nombre, sector: n.sector, ruta: rutaNegocio(n) }))
  .filter(d => d.foto)

/* El hero es una miniweb, con la misma estructura que las de los clientes:
   escenario con la marca, el texto (cambia con la pestaña) y una fila de móviles con las capturas
   de las demos (como el catálogo, en pequeño) que se desliza con el dedo y pasa sola hasta que se toca;
   pestañas y, debajo, el botón destacado de WhatsApp. Todo en una pantalla. Los textos son provisionales. */
function HeroMiniweb() {
  const [actual, setActual] = useState(0)
  const [pestana, setPestana] = useState('inicio')
  const [tocado, setTocado] = useState(false)
  // Placa de Inicio: color y forma de los puntos elegidos
  const [color, setColor] = useState(0)
  const [forma, setForma] = useState('redondo')
  const paleta = hero.inicio.colores[color]
  const fila = useRef(null)
  const demo = ESCAPARATE[actual]

  // Lleva la fila hasta un móvil concreto
  const irA = i => {
    const el = fila.current?.children[i]
    if (el) fila.current.scrollTo({ left: el.offsetLeft - fila.current.offsetLeft - (fila.current.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }

  // Pasa sola al siguiente móvil hasta que el visitante toca la fila
  useEffect(() => {
    if (tocado || ESCAPARATE.length < 2) return
    const t = setTimeout(() => irA((actual + 1) % ESCAPARATE.length), TURNO_DEMOS_MS)
    return () => clearTimeout(t)
  }, [actual, tocado])

  // El móvil que queda en el centro es el "actual" (nombre, sector y rayitas)
  const alDeslizar = () => {
    const f = fila.current
    if (!f) return
    const centro = f.scrollLeft + f.clientWidth / 2
    let cerca = 0
    let distancia = Infinity
    Array.from(f.children).forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - f.offsetLeft + el.clientWidth / 2 - centro)
      if (d < distancia) { distancia = d; cerca = i }
    })
    setActual(cerca)
  }

  const PESTANAS = [
    { key: 'inicio', texto: 'Inicio' },
    { key: 'ejemplos', texto: 'Ejemplos' },
    { key: 'precio', texto: 'Precio' },
    { key: 'contacto', texto: 'Contacto' },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col">
      {/* Escenario: fondo liso de la marca; ocupa el alto que sobra */}
      <div className="relative flex min-h-[20rem] flex-1 flex-col overflow-hidden bg-crema">
        {/* Marca arriba */}
        <div className="flex items-center justify-between px-[1.25rem] pt-[1rem]">
          <p className="font-titulo text-[1.3rem] font-black tracking-tight">{marca.nombre}</p>
          <p className="text-[0.8rem] text-suave">{marca.ciudad}</p>
        </div>

        {/* Texto: cambia con la pestaña */}
        <div className="px-[1.25rem] pt-[0.9rem]">
          {pestana === 'inicio' && (
            <>
              <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {hero.inicio.titulo}
              </h1>
            </>
          )}
          {pestana === 'ejemplos' && (
            <>
              <p className="text-[0.85rem] text-acento">Para tu {demo?.sector.toLowerCase()}</p>
              <h2 className="mt-[0.3rem] font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">
                {hero.titulo}
              </h2>
            </>
          )}
          {pestana === 'precio' && (
            <>
              <h2 className="font-titulo text-[1.8rem] font-black leading-[1.05] tracking-tight">Lorem ipsum 000 €</h2>
              <p className="mt-[0.4rem] text-[0.9rem] text-suave">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </>
          )}
          {pestana === 'contacto' && (
            <>
              <h2 className="font-titulo text-[1.8rem] font-black leading-[1.05] tracking-tight">Lorem ipsum dolor.</h2>
              <p className="mt-[0.4rem] text-[0.9rem] text-suave">Lorem ipsum dolor sit amet, consectetur.</p>
            </>
          )}

        </div>

        {/* Pestaña Inicio: la placa del mostrador, personalizable con colores y forma de los puntos del QR */}
        {pestana === 'inicio' && (
          <>
            <div className="flex min-h-[10rem] flex-1 items-center justify-center py-[1rem]">
              <Placa
                negocio={marca.nombre}
                texto={hero.placa.texto}
                fondo={paleta.fondo}
                colorTexto={paleta.texto}
                colorQr={paleta.qr}
                degradadoQr={paleta.degradado}
                forma={forma}
                className="w-[min(52%,13rem)] -rotate-[4deg]"
              />
            </div>

            <div className="flex items-center justify-between gap-[1rem] px-[1.25rem] pb-[1rem]">
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
                      background: c.degradado
                        ? `linear-gradient(45deg, ${c.degradado.join(', ')})`
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

        {/* Pestaña Ejemplos: fila de móviles con las capturas, como el catálogo en pequeño; se ajusta al alto que queda.
            Se desliza con el dedo; tocar un móvil abre la demo de verdad. */}
        {pestana === 'ejemplos' && (
        <>
        <div className="relative mt-[1rem] min-h-[9rem] flex-1">
          <ul
            ref={fila}
            onScroll={alDeslizar}
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
                  className={`block aspect-[390/844] h-full rounded-[1.2rem] border border-white/15 bg-[#1d1d1b] p-[0.3rem] shadow-[0_1rem_2rem_-0.8rem_rgb(0_0_0/0.7)] transition-[opacity,transform] duration-500 ${
                    i === actual ? 'opacity-100' : 'scale-[0.92] opacity-55'
                  }`}
                >
                  <img src={d.foto} alt={`Ejemplo: ${d.nombre}`} className="h-full w-full rounded-[0.95rem] object-cover object-top" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Qué demo se ve y rayitas */}
        <div className="flex items-center justify-between gap-[0.75rem] px-[1.25rem] py-[0.8rem]">
          <p className="min-w-0 truncate text-[0.82rem]">
            <span className="font-semibold">{demo?.nombre}</span> <span className="text-suave">· {demo?.sector}</span>
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

      {/* Pestañas */}
      <nav className="grid grid-cols-4 gap-[0.35rem] px-[1.25rem] pt-[0.9rem]">
        {PESTANAS.map(p => (
          <button
            key={p.key}
            type="button"
            aria-pressed={pestana === p.key}
            onClick={() => {
              setPestana(p.key)
              // La fila de Ejemplos empieza siempre por la primera demo
              if (p.key === 'ejemplos') { setActual(0); setTocado(false) }
            }}
            className={`rounded-[0.7rem] py-[0.65rem] text-[0.82rem] font-semibold transition-colors ${
              pestana === p.key ? 'bg-acento text-papel' : 'bg-crema text-tinta hover:bg-linea'
            }`}
          >
            {p.texto}
          </button>
        ))}
      </nav>

      {/* Cuerpo: botón destacado */}
      <div className="px-[1.25rem] pb-[1.25rem] pt-[0.9rem]">
        <BotonWhatsapp className="w-full">{hero.boton}</BotonWhatsapp>
      </div>
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
    <div className="min-h-svh bg-papel font-texto text-tinta">
      {/* Primera pantalla: el hero es una miniweb, exactamente el alto de la pantalla */}
      <div className="flex min-h-svh flex-col">
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
          <div className="mt-[2.25rem] grid gap-[1rem] md:grid-cols-2 md:gap-[1.5rem]">
            {precio.partes.map(p => (
              <div key={p.nombre} className="rounded-[1.25rem] border border-linea bg-crema p-[1.5rem] md:p-[2rem]">
                <p className="text-suave">{p.nombre}</p>
                <p className="mt-[0.3rem] font-titulo text-[clamp(2rem,1.7rem+1.4vw,2.75rem)] leading-none">{p.cifra}</p>
                <p className="mt-[1rem] leading-[1.6] text-suave">{p.detalle}</p>
              </div>
            ))}
          </div>
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
