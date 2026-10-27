import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CircleHelp, Heart, Minus, Music2, Pause, Play, Plus, RotateCcw, Settings, Timer, Volume2, X } from 'lucide-react'
import { loadFont } from '../lib/applyTheme'
import BarraPestanas from '../fichas/barras'

/* Maqueta visual de Lofi Pomodoro (/pomodoro): un rediseño para enseñar, sin cuenta atrás, sin sonido y sin nada que editar desde el panel.
   El inicio es una sola pantalla sin scroll con el temporizador; Ambience y Settings se abren como una hoja desde la barra de arriba; el resto
   del texto de su web va en pestañas (con scroll). Los colores y las letras son propios de esta página, no los de ningún negocio. */

const FUENTES = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=DM+Sans:wght@400;500;700&family=Bricolage+Grotesque:wght@700;800&display=swap'
const SERIF = { fontFamily: '"Fraunces", Georgia, serif' }
// Los números del contador: una sans gruesa con carácter
const NUMEROS = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }

// Los temas de color: cada uno trae sus variables (fondo, texto, acento...) y los dos brillos de detrás. El primero es el de siempre (el que se parece al de su web)
const TEMAS = [
  {
    clave: 'lampara',
    nombre: 'Lamp',
    ruido: true,
    brillos: ['rgb(232 176 75 / 0.2)', 'rgb(170 95 45 / 0.22)'],
    vars: {
      '--p-fondo': '#15100C',
      '--p-superficie': '#221A12',
      '--p-texto': '#F4EAD6',
      '--p-suave': '#B9AA90',
      '--p-acento': '#E8B04B',
      '--p-sobre': '#1A120A',
      '--p-linea': 'rgb(244 234 214 / 0.14)',
      '--p-tenue': 'rgb(244 234 214 / 0.2)',
      '--p-hover': 'rgb(244 234 214 / 0.06)',
      '--p-velo': 'rgb(21 16 12 / 0.86)',
    },
  },
  {
    // Oscuro: tinta de noche, azul casi negro con un coral
    clave: 'noche',
    nombre: 'Night shift',
    ruido: true,
    brillos: ['rgb(240 138 106 / 0.14)', 'rgb(70 110 140 / 0.24)'],
    vars: {
      '--p-fondo': '#0F1419',
      '--p-superficie': '#18212B',
      '--p-texto': '#E9E4D8',
      '--p-suave': '#8C97A3',
      '--p-acento': '#F08A6A',
      '--p-sobre': '#1A0F0B',
      '--p-linea': 'rgb(233 228 216 / 0.14)',
      '--p-tenue': 'rgb(233 228 216 / 0.2)',
      '--p-hover': 'rgb(233 228 216 / 0.06)',
      '--p-velo': 'rgb(15 20 25 / 0.86)',
    },
  },
  {
    // Claro: papel de cuaderno con tinta y un rojo bermellón
    clave: 'papel',
    nombre: 'Paper',
    ruido: false,
    brillos: ['rgb(200 69 44 / 0.1)', 'rgb(240 200 120 / 0.28)'],
    vars: {
      '--p-fondo': '#F1EADB',
      '--p-superficie': '#E7DEC9',
      '--p-texto': '#24201A',
      '--p-suave': '#6F675A',
      '--p-acento': '#C8452C',
      '--p-sobre': '#FFF6EA',
      '--p-linea': 'rgb(36 32 26 / 0.16)',
      '--p-tenue': 'rgb(36 32 26 / 0.2)',
      '--p-hover': 'rgb(36 32 26 / 0.06)',
      '--p-velo': 'rgb(241 234 219 / 0.88)',
    },
  },
  {
    // Llamativo: mostaza que sube a casi blanco, con tinta oscura y un verde azulado profundo
    clave: 'mostaza',
    nombre: 'Mustard',
    ruido: false,
    degradado: 'linear-gradient(180deg, #FFF9E8 0%, #F8E4A8 38%, #EFC465 100%)',
    brillos: [],
    vars: {
      '--p-fondo': '#EFC465',
      '--p-superficie': '#F6D98F',
      '--p-texto': '#1E1710',
      '--p-suave': '#5B4312',
      '--p-acento': '#0F5B57',
      '--p-sobre': '#F8F0DB',
      '--p-linea': 'rgb(30 23 16 / 0.2)',
      '--p-tenue': 'rgb(30 23 16 / 0.22)',
      '--p-hover': 'rgb(30 23 16 / 0.08)',
      '--p-velo': 'rgb(255 249 232 / 0.9)',
      '--p-velo-pie': 'rgb(239 196 101 / 0.92)',
    },
  },
]

// Un poco de grano (en los temas oscuros) y dos brillos, como una habitación con una lámpara encendida
const RUIDO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0.75 0 0 0 0.07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
const fondoDe = tema => ({
  backgroundColor: tema.vars['--p-fondo'],
  backgroundImage: [
    ...(tema.degradado
      ? [tema.degradado]
      : [
          `radial-gradient(60rem 40rem at 88% -8%, ${tema.brillos[0]}, transparent 60%)`,
          `radial-gradient(44rem 32rem at -12% 108%, ${tema.brillos[1]}, transparent 60%)`,
        ]),
    ...(tema.ruido ? [RUIDO] : []),
  ].join(','),
  fontFamily: '"DM Sans", system-ui, sans-serif',
})

// Un tomate (pomodoro es tomate), dibujado con el mismo trazo que los iconos de lucide, que no trae ninguno
function IconoTomate({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 8c-4.4 0-8 2.7-8 6.5S7.6 21 12 21s8-2.7 8-6.5S16.4 8 12 8z" />
      <path d="M12 8 9 5.5M12 8l3-2.5M12 8V4" />
    </svg>
  )
}

const PESTANAS = [
  { tipo: 'inicio', texto: 'Focus', icono: Timer },
  { tipo: 'beneficios', texto: 'Benefits', icono: Heart },
  { tipo: 'porque', texto: 'Why us', icono: IconoTomate },
  { tipo: 'faq', texto: 'FAQ', icono: CircleHelp },
]
// Los enlaces de escritorio (barra de arriba y pie): cada uno lleva a su sección de la misma página
const ENLACES = [
  ['focus', 'Focus'],
  ['benefits', 'Benefits'],
  ['why', 'Why us'],
  ['faq', 'FAQ'],
]
// Los diseños de la barra de abajo (los de las pestañas de Mostraq) que se pueden elegir en Ambience
const ESTILOS_BARRA = [
  ['app', 'App'],
  ['subrayado', 'Underline'],
  ['segmentada', 'Pill'],
  ['onda', 'Wave'],
]
// Esas barras pintan con los colores --demo-* de Mostraq: aquí se igualan, solo dentro de esta página, a los del tema elegido
const VARIABLES_BARRA = {
  '--demo-bg': 'var(--p-fondo)',
  '--demo-surface': 'var(--p-superficie)',
  '--demo-primary': 'var(--p-acento)',
  '--demo-accent': 'var(--p-acento)',
  '--demo-text': 'var(--p-texto)',
  '--demo-muted': 'var(--p-suave)',
  '--demo-header': 'var(--p-fondo)',
  '--demo-heading-font': '"DM Sans", system-ui, sans-serif',
}

const SONIDOS = [
  ['Rainy window', 'Rain on glass, nothing else'],
  ['Late night café', 'Low voices and cups'],
  ['Vinyl crackle', 'Warm static, no melody'],
  ['Soft piano', 'Slow notes in the next room'],
]

const BENEFICIOS = [
  ['Get into focus mode faster', 'A ready-to-use focus timer and built-in music remove the small setup decisions that often delay the first minutes of work.'],
  ['Reduce procrastination pressure', 'Short, defined sessions make large tasks feel more approachable when you only have to commit to one round at a time.'],
  ['Work in a calmer atmosphere', 'Lofi music can make study and work sessions feel less sterile, which helps many people stay steady for longer.'],
]

const CONFIANZA = [
  ['No sign-up required', 'Open the page and begin a session immediately without creating an account.'],
  ['Built for study and focused work', 'Focus and Break phases, simple Settings, and optional music support study and work sessions.'],
  ['Flexible enough for different energy levels', 'Choose a Focus duration that fits your task, and return to the same calm space for each session.'],
]

const COMPARACION = [
  {
    nombre: 'Lofi Pomodoro',
    titulo: 'Structure and atmosphere together',
    puntos: ['Focus and break rhythm already built in', 'Music and timer live in the same interface', 'Designed for study, deep work, and repeatable focus rituals'],
    destacada: true,
  },
  {
    nombre: 'A generic timer',
    titulo: 'Good for tracking time',
    puntos: ['Usually handles timing well but not the work atmosphere', 'Leaves the music and the setup to you'],
  },
  {
    nombre: 'A playlist on its own',
    titulo: 'Good for mood',
    puntos: ['Sets the atmosphere but gives your session no structure', 'No focus and break rhythm to follow'],
  },
]

const PREGUNTAS = [
  ['What is a Pomodoro timer?', 'A Pomodoro timer splits work into short, focused sessions separated by short breaks. A classic round is 25 minutes of focus followed by a 5 minute break.'],
  ['Is Lofi Pomodoro good for studying?', 'Yes. Focus and Break phases keep study sessions short and defined, and the optional music keeps the room calm without taking over.'],
  ['Can I use it for work?', 'Yes. Choose a Focus duration that fits your task, from a quick push to a longer block of deep work.'],
  ['Do I need an account?', 'No. Open the page and start a session right away.'],
  ['Does it work on mobile?', 'Yes. The timer, Ambience and Settings are designed to be used comfortably on a phone.'],
]

const PUNTO = { background: 'var(--p-acento)' }
const BOTON_AMBAR = 'flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-full text-[color:var(--p-sobre)] transition hover:brightness-110 active:scale-[0.96] lg:h-[5.8rem] lg:w-[5.8rem]'
const ICONO_BOTON = 'h-[1.5rem] w-[1.5rem] fill-current lg:h-[2.4rem] lg:w-[2.4rem]'

// La demo: el contador sale de la duración elegida y la cuenta atrás dura solo 5 minutos reales, porque es una maqueta para enseñar
const DURACIONES = [25, 30, 40]
const DEMO_MS = 5 * 60 * 1000
const formato = ms => {
  const s = Math.ceil(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// Un botón redondo con icono para la barra de arriba, con su nombre pequeño debajo
function BotonIcono({ icono: Icono, etiqueta, activo, alTocar }) {
  return (
    <div className="grid justify-items-center gap-[0.3rem]">
      <button
        type="button"
        onClick={alTocar}
        aria-label={etiqueta}
        aria-expanded={activo}
        className={`flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full ring-1 transition ${activo ? 'bg-[color:var(--p-acento)] text-[color:var(--p-sobre)] ring-transparent' : 'ring-[color:var(--p-linea)] hover:bg-[color:var(--p-hover)]'}`}
      >
        <Icono className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      </button>
      <span className="text-[0.6rem] leading-none text-[color:var(--p-suave)]" aria-hidden="true">
        {etiqueta}
      </span>
    </div>
  )
}

// Un control segmentado, como el de los ajustes de una app: las opciones pegadas en una pista y la elegida levantada. Solo cambia de aspecto
function Segmentado({ valores, elegido, alElegir, nombre, etiqueta = v => v }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-[0.2rem] rounded-[0.8rem] bg-[color:var(--p-hover)] p-[0.2rem]" role="group" aria-label={nombre}>
      {valores.map(v => (
        <button
          key={v}
          type="button"
          aria-pressed={elegido === v}
          onClick={() => alElegir(v)}
          style={{ fontVariantNumeric: 'tabular-nums' }}
          className={`rounded-[0.6rem] py-[0.55rem] text-[0.95rem] font-medium transition ${elegido === v ? 'bg-[color:var(--p-texto)] text-[color:var(--p-fondo)] shadow-[0_0.1rem_0.4rem_rgb(0_0_0/0.25)]' : 'text-[color:var(--p-suave)]'}`}
        >
          {etiqueta(v)}
        </button>
      ))}
    </div>
  )
}

// Las hojas de Ambience y Settings. En el móvil suben desde abajo; en escritorio salen de la derecha y ocupan todo el alto del navegador, con el contenido más grande
function Hoja({ titulo, cerrar, children }) {
  const [entrada, setEntrada] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntrada(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close" onClick={cerrar} className="absolute inset-0 bg-black/55" />
      <div
        role="dialog"
        aria-label={titulo}
        style={{ background: 'var(--p-superficie)' }}
        className={`absolute inset-x-0 bottom-0 mx-auto max-h-[88svh] w-full max-w-[32rem] overflow-y-auto rounded-t-[1.75rem] px-[1.5rem] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[0.7rem] shadow-[0_-1rem_3rem_rgb(0_0_0/0.5)] transition-transform duration-300 ease-out lg:bottom-0 lg:left-auto lg:right-0 lg:top-0 lg:mx-0 lg:max-h-none lg:w-[30rem] lg:max-w-[30rem] lg:rounded-none lg:rounded-l-[1.75rem] lg:px-[2.25rem] lg:py-[2rem] lg:shadow-[-1rem_0_3rem_rgb(0_0_0/0.5)] ${entrada ? 'translate-x-0 translate-y-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'}`}
      >
        <div className="lg:[zoom:1.2]">
          <div className="mx-auto mb-[0.9rem] h-[0.3rem] w-[2.6rem] rounded-full bg-[color:var(--p-tenue)] lg:hidden" aria-hidden="true" />
          <div className="mb-[1.25rem] flex items-center justify-between">
            <h2 style={SERIF} className="text-[1.6rem]">
              {titulo}
            </h2>
            <button type="button" onClick={cerrar} aria-label="Close" className="flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-full ring-1 ring-[color:var(--p-linea)] hover:bg-[color:var(--p-hover)]">
              <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function HojaAmbience({ volumen, setVolumen, tema, alTema, barra, alBarra }) {
  const [sonido, setSonido] = useState(0)
  return (
    <div className="grid gap-[1.5rem]">
      <div className="grid gap-[0.7rem]">
        <p className="text-[0.95rem] text-[color:var(--p-suave)]">Theme</p>
        <div className="flex flex-wrap gap-[1rem]" role="group" aria-label="Theme">
          {TEMAS.map(m => (
            <button key={m.clave} type="button" onClick={() => alTema(m.clave)} aria-pressed={tema === m.clave} className="grid justify-items-center gap-[0.45rem]">
              <span
                className={`relative h-[2.7rem] w-[2.7rem] rounded-full ring-2 ring-offset-2 ring-offset-[color:var(--p-superficie)] transition ${tema === m.clave ? 'ring-[color:var(--p-texto)]' : 'ring-[color:var(--p-linea)]'}`}
                style={{ background: m.vars['--p-fondo'] }}
              >
                <span className="absolute inset-[0.7rem] rounded-full" style={{ background: m.vars['--p-acento'] }} />
              </span>
              <span className={`text-[0.75rem] ${tema === m.clave ? 'text-[color:var(--p-texto)]' : 'text-[color:var(--p-suave)]'}`}>{m.nombre}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-[0.7rem] lg:opacity-45 lg:[&_button]:pointer-events-none">
        <p className="text-[0.95rem] text-[color:var(--p-suave)]">
          Tabs <span className="hidden text-[0.8rem] lg:inline">(mobile only)</span>
        </p>
        <Segmentado valores={ESTILOS_BARRA.map(e => e[0])} elegido={barra} alElegir={alBarra} nombre="Tabs style" etiqueta={v => ESTILOS_BARRA.find(e => e[0] === v)[1]} />
      </div>
      <ul>
        {SONIDOS.map(([nombre, detalle], i) => (
          <li key={nombre} className="border-t border-[color:var(--p-linea)] first:border-t-0">
            <button type="button" onClick={() => setSonido(i)} aria-pressed={sonido === i} className="flex w-full items-center gap-[1rem] py-[0.9rem] text-left">
              <span className={`h-[0.7rem] w-[0.7rem] shrink-0 rounded-full ring-1 ${sonido === i ? 'ring-transparent' : 'ring-[color:var(--p-suave)]'}`} style={sonido === i ? PUNTO : undefined} />
              <span className="min-w-0 flex-1">
                <span className="block text-[1.05rem] font-medium">{nombre}</span>
                <span className="block text-[0.9rem] text-[color:var(--p-suave)]">{detalle}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <label className="grid gap-[0.6rem]">
        <span className="flex justify-between text-[0.95rem] text-[color:var(--p-suave)]">
          Volume <span>{volumen}%</span>
        </span>
        <input type="range" min="0" max="100" value={volumen} onChange={e => setVolumen(Number(e.target.value))} className="accent-[color:var(--p-acento)]" />
      </label>
    </div>
  )
}

// Settings como una lista de ajustes de app: un grupo con filas separadas por una línea fina, el nombre a la izquierda y el control a la derecha
function HojaSettings() {
  const [foco, setFoco] = useState(25)
  const [pausa, setPausa] = useState(5)
  const [rondas, setRondas] = useState(4)
  const [auto, setAuto] = useState(false)
  const fila = 'border-t border-[color:var(--p-linea)] px-[1rem] py-[0.9rem] first:border-t-0'
  const etiqueta = 'text-[1.02rem]'
  return (
    <div className="grid gap-[1.5rem]">
      <div className="flex justify-center gap-[1.2rem] px-[0.25rem] text-[0.75rem] text-[color:var(--p-suave)] lg:hidden">
        {['Privacy', 'Terms', 'Cookies'].map(nombre => (
          <span key={nombre} className="flex items-center gap-[0.2rem]">
            {nombre}
            <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
          </span>
        ))}
      </div>
      <div className="overflow-hidden rounded-[1.1rem] bg-[color:var(--p-hover)]">
        <div className={`${fila} grid gap-[0.7rem]`}>
          <div className="flex items-baseline justify-between">
            <p className={etiqueta}>Focus</p>
            <p className="text-[0.8rem] text-[color:var(--p-suave)]">minutes</p>
          </div>
          <Segmentado valores={[25, 50, 90, 120]} elegido={foco} alElegir={setFoco} nombre="Focus minutes" />
        </div>
        <div className={`${fila} grid gap-[0.7rem]`}>
          <div className="flex items-baseline justify-between">
            <p className={etiqueta}>Break</p>
            <p className="text-[0.8rem] text-[color:var(--p-suave)]">minutes</p>
          </div>
          <Segmentado valores={[5, 10, 15]} elegido={pausa} alElegir={setPausa} nombre="Break minutes" />
        </div>
      </div>
      <div className="overflow-hidden rounded-[1.1rem] bg-[color:var(--p-hover)]">
        <div className={`${fila} flex items-center justify-between gap-[1rem]`}>
          <p className={etiqueta}>Rounds before a long break</p>
          <div className="flex shrink-0 items-center rounded-[0.8rem] bg-[color:var(--p-hover)]">
            <button type="button" aria-label="Fewer rounds" onClick={() => setRondas(r => Math.max(1, r - 1))} className="flex h-[2.4rem] w-[2.4rem] items-center justify-center">
              <Minus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </button>
            <span className="w-[1.6rem] text-center text-[1.05rem] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {rondas}
            </span>
            <button type="button" aria-label="More rounds" onClick={() => setRondas(r => Math.min(8, r + 1))} className="flex h-[2.4rem] w-[2.4rem] items-center justify-center">
              <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={`${fila} flex items-center justify-between gap-[1rem]`}>
          <p className={etiqueta}>Start the next session automatically</p>
          <button
            type="button"
            role="switch"
            aria-checked={auto}
            aria-label="Start the next session automatically"
            onClick={() => setAuto(a => !a)}
            className={`relative h-[1.85rem] w-[3.1rem] shrink-0 rounded-full transition ${auto ? '' : 'bg-[color:var(--p-tenue)]'}`}
            style={auto ? PUNTO : undefined}
          >
            <span className={`absolute top-[0.175rem] h-[1.5rem] w-[1.5rem] rounded-full bg-[color:var(--p-texto)] shadow-[0_0.1rem_0.3rem_rgb(0_0_0/0.3)] transition-all ${auto ? 'left-[1.425rem]' : 'left-[0.175rem]'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

function BarraVolumen({ volumen, alVolumen }) {
  const [activa, setActiva] = useState(true)
  useEffect(() => {
    if (!activa) return
    const id = setTimeout(() => setActiva(false), 3000)
    return () => clearTimeout(id)
  }, [activa, volumen])
  return (
    <label
      onPointerDown={() => setActiva(true)}
      className={`flex w-[min(14rem,70vw)] lg:w-[18rem] items-center gap-[0.8rem] text-[color:var(--p-suave)] transition-opacity duration-700 ${activa ? 'opacity-100' : 'opacity-[0.18]'}`}
    >
      <Volume2 className="h-[1.2rem] w-[1.2rem] shrink-0" aria-hidden="true" />
      <input
        type="range"
        min="0"
        max="100"
        value={volumen}
        onChange={e => {
          setActiva(true)
          alVolumen(Number(e.target.value))
        }}
        onFocus={() => setActiva(true)}
        aria-label="Volume"
        className="w-full accent-[color:var(--p-acento)]"
      />
    </label>
  )
}

// El temporizador de la pantalla de inicio: el contador es el protagonista, con un anillo fino y las cuatro rondas. Al empezar, la pantalla pasa al modo
// inmersivo: el anillo crece, desaparece todo lo demás y solo quedan el contador y los botones
function Inicio({ fase, restante, total, duracion, alElegir, volumen, alVolumen, alPulsar, alParar, claseExtra = '' }) {
  const inmersivo = fase !== 'reposo'
  // Lo que llevas de sesión, como en su web ("Time this cycle: 2m 48s")
  const segundos = Math.round((total - restante) / 1000)
  const [etiquetaBoton, IconoBoton] = { reposo: ['Start focus', Play], corriendo: ['Pause', Pause], pausa: ['Resume', Play], fin: ['Back to start', RotateCcw] }[fase]
  return (
    <main id="focus" className={`flex flex-1 flex-col items-center justify-center gap-[clamp(1.4rem,5svh,2.6rem)] px-[1.25rem] transition-[padding] duration-700 lg:pb-[3rem] ${inmersivo ? 'pb-[2rem]' : 'pb-[5.5rem] lg:min-h-[calc(100svh-5rem)]'} ${claseExtra}`}>
      <div
        className={`relative grid w-[var(--anillo)] place-items-center transition-[width] duration-700 ease-out ${inmersivo ? '[--anillo:min(88vw,56svh,32rem)] lg:[--anillo:min(60svh,60vw,40rem)]' : '[--anillo:min(74vw,42svh,23rem)] lg:[--anillo:min(46svh,44vw,34rem)]'}`}
        style={{ aspectRatio: '1' }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" strokeWidth="0.7" style={{ stroke: 'var(--p-linea)' }} />
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${(restante / total) * 100} 100`}
            style={{ stroke: 'var(--p-acento)', transition: 'stroke-dasharray 0.3s linear' }}
          />
        </svg>
        <div className="relative grid justify-items-center gap-[0.9rem]">
          <div className="grid justify-items-center gap-[0.25rem] text-[color:var(--p-suave)]">
            <p className="text-[clamp(0.85rem,3.4vw,1rem)] lg:text-[calc(var(--anillo)*0.036)]">{fase === 'fin' ? 'Session complete' : 'Focus 1 of 4'}</p>
            {inmersivo && (
              <p className="text-[clamp(0.75rem,3vw,0.9rem)] opacity-80 lg:text-[calc(var(--anillo)*0.032)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                Time this cycle: {Math.floor(segundos / 60)}m {segundos % 60}s
              </p>
            )}
          </div>
          <p
            style={{ ...NUMEROS, fontVariantNumeric: 'tabular-nums' }}
            className={`leading-none transition-[font-size] duration-700 lg:text-[calc(var(--anillo)*0.23)] ${inmersivo ? 'text-[clamp(4rem,21vw,8.5rem)]' : 'text-[clamp(3.4rem,16.5vw,6rem)]'}`}
          >
            {formato(restante)}
          </p>
          <div className="flex gap-[0.5rem] lg:gap-[0.7rem]" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
              <span key={i} className={`h-[0.45rem] w-[0.45rem] rounded-full lg:h-[0.6rem] lg:w-[0.6rem] ${i === 0 ? '' : 'bg-[color:var(--p-tenue)]'}`} style={i === 0 ? PUNTO : undefined} />
            ))}
          </div>
        </div>
      </div>
      {!inmersivo && (
        <div className="grid justify-items-center gap-[0.8rem]">
          <p className="max-w-[18rem] text-center text-[1rem] leading-[1.5] text-[color:var(--p-suave)] lg:max-w-[28rem] lg:text-[1.35rem]">A calm place to focus with music.</p>
          <div className="flex gap-[0.4rem] lg:gap-[0.6rem]" role="group" aria-label="Duration">
            {DURACIONES.map(d => (
              <button
                key={d}
                type="button"
                aria-pressed={duracion === d}
                onClick={() => alElegir(d)}
                style={{ fontVariantNumeric: 'tabular-nums' }}
                className={`rounded-[0.5rem] px-[0.6rem] py-[0.2rem] text-[0.8rem] font-medium ring-1 transition lg:px-[0.9rem] lg:py-[0.35rem] lg:text-[1rem] ${duracion === d ? 'bg-[color:var(--p-texto)] text-[color:var(--p-fondo)] ring-transparent' : 'text-[color:var(--p-suave)] ring-[color:var(--p-linea)] hover:text-[color:var(--p-texto)]'}`}
              >
                {d}:00
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-[1.75rem]">
        <div className="grid justify-items-center gap-[0.5rem]">
          <button type="button" onClick={alPulsar} aria-label={etiquetaBoton} title={etiquetaBoton} className={BOTON_AMBAR} style={PUNTO}>
            <IconoBoton className={`${ICONO_BOTON} ${IconoBoton === RotateCcw ? 'fill-none' : ''}`} aria-hidden="true" />
          </button>
          <span className="text-[0.8rem] text-[color:var(--p-suave)] lg:text-[1.15rem]" aria-hidden="true">
            {etiquetaBoton}
          </span>
        </div>
        {fase === 'pausa' && (
          <div className="grid justify-items-center gap-[0.5rem]">
            <button type="button" onClick={alParar} aria-label="End session" title="End session" className={BOTON_AMBAR} style={PUNTO}>
              <RotateCcw className="h-[1.5rem] w-[1.5rem] lg:h-[2.4rem] lg:w-[2.4rem]" aria-hidden="true" />
            </button>
            <span className="text-[0.8rem] text-[color:var(--p-suave)] lg:text-[1.15rem]" aria-hidden="true">
              End session
            </span>
          </div>
        )}
      </div>
      {(fase === 'corriendo' || fase === 'pausa') && (
        <BarraVolumen volumen={volumen} alVolumen={alVolumen} />
      )}
    </main>
  )
}

// Una lista de ideas: título y texto, separados por una línea fina, sin tarjetas
function Lista({ items }) {
  return (
    <ul className="mt-[1.5rem] lg:mt-0">
      {items.map(([titulo, texto]) => (
        <li key={titulo} className="border-t border-[color:var(--p-linea)] py-[1.25rem]">
          <h3 style={SERIF} className="text-[1.3rem] leading-[1.25]">
            {titulo}
          </h3>
          <p className="mt-[0.5rem] text-[1.02rem] leading-[1.65] text-[color:var(--p-suave)]">{texto}</p>
        </li>
      ))}
    </ul>
  )
}

const Titular = ({ children }) => (
  <h2 style={SERIF} className="text-[clamp(1.9rem,8vw,2.6rem)] leading-[1.1] lg:text-[clamp(2rem,3.2vw,2.8rem)]">
    {children}
  </h2>
)
const Entrada = ({ children }) => <p className="mt-[1rem] text-[1.08rem] leading-[1.65] text-[color:var(--p-suave)]">{children}</p>

// Una sección de contenido. En el móvil, el título y debajo lo suyo; en escritorio, el título a la izquierda y el contenido a la derecha (o, si es
// ancha, el contenido debajo), con una línea fina arriba y mucho aire
function Seccion({ id, titulo, entrada, ancha = false, children }) {
  return (
    <section id={id} className="mt-[3.5rem] scroll-mt-[5rem] first:mt-0 lg:mt-0 lg:border-t lg:border-[color:var(--p-linea)] lg:py-[5rem]">
      <div className={ancha ? '' : 'lg:grid lg:grid-cols-[2fr_3fr] lg:gap-[4rem]'}>
        <div className={ancha ? 'lg:max-w-[42rem]' : ''}>
          <Titular>{titulo}</Titular>
          <Entrada>{entrada}</Entrada>
        </div>
        <div>{children}</div>
      </div>
    </section>
  )
}

function Beneficios() {
  return (
    <>
      <Seccion id="benefits" titulo="Clear benefits, not just features" entrada="The goal is not to add more complexity to your setup. The goal is to make it easier to begin, stay on task, and come back for the next session.">
        <Lista items={BENEFICIOS} />
      </Seccion>
      <Seccion id="trust" titulo="Honest trust signals" entrada="No invented testimonials, inflated usage numbers, or fake logos. These are the product qualities you can actually verify on the page.">
        <Lista items={CONFIANZA} />
      </Seccion>
    </>
  )
}

function Porque() {
  return (
    <Seccion
      id="why"
      ancha
      titulo="Why use this instead of a generic timer or a playlist on its own"
      entrada="A timer alone gives you structure, and a playlist alone gives you atmosphere. Lofi Pomodoro combines both in one place so you can move from intention to focused work with less setup friction."
    >
      <div className="mt-[1.5rem] grid gap-[2rem] lg:mt-[3rem] lg:grid-cols-3 lg:gap-[2.5rem]">
        {COMPARACION.map(c => (
          <div key={c.nombre} className={c.destacada ? 'border-l-2 pl-[1.1rem]' : 'pl-[1.1rem] opacity-80'} style={c.destacada ? { borderColor: 'var(--p-acento)' } : undefined}>
            <p className="text-[0.95rem] font-medium" style={c.destacada ? { color: 'var(--p-acento)' } : { color: 'var(--p-suave)' }}>
              {c.nombre}
            </p>
            <h3 style={SERIF} className="mt-[0.3rem] text-[1.5rem] leading-[1.2]">
              {c.titulo}
            </h3>
            <ul className="mt-[0.8rem] grid gap-[0.5rem]">
              {c.puntos.map(p => (
                <li key={p} className="text-[1.02rem] leading-[1.6] text-[color:var(--p-suave)]">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Preguntas() {
  return (
    <Seccion id="faq" titulo="Answers to common objections" entrada="These answers are written for the questions people usually ask before they try a Pomodoro timer with lofi music.">
      <div className="mt-[1.5rem] lg:mt-0">
        {PREGUNTAS.map(([pregunta, respuesta]) => (
          <details key={pregunta} className="group border-t border-[color:var(--p-linea)] py-[1.1rem]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-[1rem] [&::-webkit-details-marker]:hidden">
              <span style={SERIF} className="text-[1.2rem] leading-[1.3]">
                {pregunta}
              </span>
              <Plus className="h-[1.2rem] w-[1.2rem] shrink-0 text-[color:var(--p-suave)] transition group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="mt-[0.8rem] text-[1.02rem] leading-[1.65] text-[color:var(--p-suave)]">{respuesta}</p>
          </details>
        ))}
      </div>
    </Seccion>
  )
}

// El pie de página, solo en escritorio: la marca, los enlaces a las secciones y las etiquetas legales (sin enlace, como en Settings)
function Pie({ ir }) {
  return (
    <footer className="hidden border-t border-[color:var(--p-linea)] lg:block">
      <div className="mx-auto grid max-w-[72rem] grid-cols-[2fr_1fr_1fr] gap-[3rem] px-[2.5rem] py-[3.5rem]">
        <div>
          <p style={SERIF} className="text-[1.4rem] italic">
            Lofi Pomodoro
          </p>
          <p className="mt-[0.8rem] max-w-[22rem] text-[0.95rem] leading-[1.6] text-[color:var(--p-suave)]">A calm place to focus with music.</p>
        </div>
        <div>
          <p className="text-[0.95rem] font-medium">Product</p>
          <ul className="mt-[1rem] grid gap-[0.6rem] text-[0.95rem] text-[color:var(--p-suave)]">
            {ENLACES.map(([id, texto]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={e => {
                    e.preventDefault()
                    ir(id)
                  }}
                  className="transition hover:text-[color:var(--p-texto)]"
                >
                  {texto}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.95rem] font-medium">Legal</p>
          <ul className="mt-[1rem] grid gap-[0.6rem] text-[0.95rem] text-[color:var(--p-suave)]">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--p-linea)]">
        <p className="mx-auto max-w-[72rem] px-[2.5rem] py-[1.3rem] text-[0.8rem] text-[color:var(--p-suave)]">Lofi Pomodoro</p>
      </div>
    </footer>
  )
}

export default function PomodoroPage() {
  const [vista, setVista] = useState('inicio')
  const [hoja, setHoja] = useState(null)
  // El temporizador (fase: reposo, corriendo, pausa o fin). Se calcula con la hora real, para que no se desajuste si la pestaña va en segundo plano
  const [fase, setFase] = useState('reposo')
  const [transcurrido, setTranscurrido] = useState(0)
  const marca = useRef({ desde: 0, base: 0 })
  const [duracion, setDuracion] = useState(25)
  const [volumen, setVolumen] = useState(55)
  const [tema, setTema] = useState(TEMAS[0].clave)
  const [estiloBarra, setEstiloBarra] = useState('app')
  const temaActual = TEMAS.find(m => m.clave === tema) ?? TEMAS[0]
  // La barra de arriba durante la sesión: se ve al empezar y a los 3 segundos se queda casi invisible, como la barra de volumen; al tocarla vuelve
  const [cabeceraActiva, setCabeceraActiva] = useState(true)
  // En escritorio la página es una sola con todas las secciones: cuál se está viendo y cómo ir a una
  const [seccion, setSeccion] = useState('focus')
  const ir = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  useEffect(() => {
    const observador = new IntersectionObserver(entradas => entradas.forEach(e => e.isIntersecting && setSeccion(e.target.id === 'trust' ? 'benefits' : e.target.id)), {
      rootMargin: '-35% 0px -60% 0px',
    })
    ;['focus', 'benefits', 'trust', 'why', 'faq'].forEach(id => {
      const el = document.getElementById(id)
      if (el) observador.observe(el)
    })
    return () => observador.disconnect()
  }, [])
  const total = duracion * 60 * 1000

  // Las letras, el título y el color de fondo de la página (también detrás al hacer scroll de más); al salir se deja todo como estaba
  useEffect(() => {
    loadFont(FUENTES)
    const titulo = document.title
    const fondo = document.documentElement.style.backgroundColor
    document.title = 'Lofi Pomodoro'
    return () => {
      document.title = titulo
      document.documentElement.style.backgroundColor = fondo
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.backgroundColor = temaActual.vars['--p-fondo']
  }, [temaActual])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [vista])

  useEffect(() => {
    if (fase === 'reposo' || !cabeceraActiva) return
    const id = setTimeout(() => setCabeceraActiva(false), 3000)
    return () => clearTimeout(id)
  }, [fase, cabeceraActiva])

  // Al volver al inicio, o al cerrar una hoja, la barra vuelve a verse del todo
  useEffect(() => {
    if (fase === 'reposo' || !hoja) setCabeceraActiva(true)
  }, [fase, hoja])

  useEffect(() => {
    if (fase !== 'corriendo') return
    const id = setInterval(() => {
      const t = marca.current.base + (Date.now() - marca.current.desde)
      if (t >= DEMO_MS) {
        setTranscurrido(DEMO_MS)
        setFase('fin')
      } else setTranscurrido(t)
    }, 200)
    return () => clearInterval(id)
  }, [fase])

  const parar = () => {
    setFase('reposo')
    setTranscurrido(0)
  }
  const pulsar = () => {
    if (fase === 'reposo') {
      marca.current = { desde: Date.now(), base: 0 }
      setTranscurrido(0)
      setFase('corriendo')
    } else if (fase === 'corriendo') {
      const t = Math.min(DEMO_MS, marca.current.base + (Date.now() - marca.current.desde))
      marca.current.base = t
      setTranscurrido(t)
      setFase('pausa')
    } else if (fase === 'pausa') {
      marca.current.desde = Date.now()
      setFase('corriendo')
    } else parar()
  }

  useEffect(() => {
    if (!hoja) return
    const tecla = e => e.key === 'Escape' && setHoja(null)
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [hoja])

  const enInicio = vista === 'inicio'
  const inmersivo = fase !== 'reposo'
  return (
    <div style={{ ...temaActual.vars, ...VARIABLES_BARRA, ...fondoDe(temaActual) }} className={`relative flex flex-col text-[color:var(--p-texto)] ${inmersivo ? 'h-svh overflow-hidden' : enInicio ? 'h-svh overflow-hidden lg:h-auto lg:min-h-svh lg:overflow-visible' : 'min-h-svh'}`}>
      <header
        onPointerDown={() => setCabeceraActiva(true)}
        onFocus={() => setCabeceraActiva(true)}
        className={`sticky top-0 z-20 flex items-center justify-between px-[1.25rem] py-[0.9rem] transition-opacity duration-500 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:bg-[color:var(--p-velo)] lg:px-[2.5rem] lg:backdrop-blur-md ${inmersivo && !cabeceraActiva ? 'opacity-[0.18]' : ''}`}
        style={enInicio ? undefined : { background: 'var(--p-velo)', backdropFilter: 'blur(10px)' }}
      >
        <h1 style={SERIF} className="text-[1.25rem] italic">
          Lofi Pomodoro
        </h1>
        <nav aria-label="Main" className={`hidden items-center gap-[2.2rem] text-[0.95rem] ${inmersivo ? "" : "lg:flex"}`}>
          {ENLACES.map(([id, texto]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={e => {
                e.preventDefault()
                ir(id)
              }}
              className={`relative py-[0.45rem] transition ${seccion === id ? 'text-[color:var(--p-texto)]' : 'text-[color:var(--p-suave)] hover:text-[color:var(--p-texto)]'}`}
            >
              {texto}
              <span
                className={`absolute inset-x-[-0.6rem] bottom-0 h-[0.15rem] origin-left rounded-full transition-transform duration-300 ${seccion === id ? 'scale-x-100' : 'scale-x-0'}`}
                style={PUNTO}
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>
        <div className="flex gap-[0.6rem] lg:justify-self-end">
          <BotonIcono icono={Music2} etiqueta="Ambience" activo={hoja === 'ambience'} alTocar={() => setHoja('ambience')} />
          <BotonIcono icono={Settings} etiqueta="Settings" activo={hoja === 'settings'} alTocar={() => setHoja('settings')} />
        </div>
      </header>

      <Inicio
        fase={fase}
        restante={total - transcurrido}
        total={total}
        duracion={duracion}
        alElegir={setDuracion}
        volumen={volumen}
        alVolumen={setVolumen}
        alPulsar={pulsar}
        alParar={parar}
        claseExtra={inmersivo || enInicio ? '' : 'hidden lg:flex'}
      />
      <main className={`mx-auto w-full max-w-[40rem] px-[1.5rem] pb-[7rem] pt-[1.5rem] lg:max-w-[72rem] lg:px-[2.5rem] lg:pb-0 lg:pt-0 ${inmersivo ? 'hidden' : enInicio ? 'hidden lg:block' : ''}`}>
        <div className={vista === 'beneficios' ? '' : 'hidden lg:block'}>
          <Beneficios />
        </div>
        <div className={vista === 'porque' ? '' : 'hidden lg:block'}>
          <Porque />
        </div>
        <div className={vista === 'faq' ? '' : 'hidden lg:block'}>
          <Preguntas />
        </div>
        <div className="mt-[3.5rem] flex justify-center gap-[1.4rem] text-[0.8rem] text-[color:var(--p-suave)] lg:hidden">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
      </main>
      {!inmersivo && <Pie ir={ir} />}

      <nav
        className={`fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] lg:hidden transition duration-500 ${estiloBarra === 'app' ? '' : 'border-t border-[color:var(--p-linea)]'} ${inmersivo ? 'pointer-events-none translate-y-full opacity-0' : ''}`}
        style={estiloBarra === 'app' ? { background: 'var(--p-superficie)' } : { background: 'var(--p-velo-pie, var(--p-velo))', backdropFilter: 'blur(10px)' }}
        aria-label="Sections"
      >
        <div className={`mx-auto max-w-[40rem] ${estiloBarra === 'app' ? '' : 'px-[0.75rem] pb-[0.3rem] pt-[0.5rem]'} ${estiloBarra === 'segmentada' ? '[&_[aria-pressed=true]]:text-[color:var(--p-fondo)]' : ''}`}>
          <BarraPestanas estilo={estiloBarra} pestanas={PESTANAS} activa={PESTANAS.findIndex(p => p.tipo === vista)} tocar={i => setVista(PESTANAS[i].tipo)} />
        </div>
      </nav>

      {hoja === 'ambience' && (
        <Hoja titulo="Ambience" cerrar={() => setHoja(null)}>
          <HojaAmbience volumen={volumen} setVolumen={setVolumen} tema={tema} alTema={setTema} barra={estiloBarra} alBarra={setEstiloBarra} />
        </Hoja>
      )}
      {hoja === 'settings' && (
        <Hoja titulo="Settings" cerrar={() => setHoja(null)}>
          <HojaSettings />
        </Hoja>
      )}
    </div>
  )
}
