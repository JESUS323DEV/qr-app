import { useState } from 'react'
import { opcion } from '../../components/panel'
import { armarPaletaDeModo, esHex6, principalAlAzar, rolesDePaleta } from './paletasSugeridas'

// Sugerir paleta: propone paletas completas (principal, acento, fondo y texto) a partir de un color principal. Los colores relacionados los pide a TheColorAPI
// (gratis, sin clave), uno por cada modo; el fondo y el texto se calculan aquí con contraste comprobado. Al tocar una paleta se aplican los cuatro colores de golpe.
// "Sugerir" parte del principal actual; "Otro color al azar" parte de un principal nuevo (para que no salga siempre lo mismo)
const MODOS = [
  ['complement', 'Complementaria'],
  ['triad', 'Tríada'],
  ['analogic', 'Vecinos'],
  ['monochrome', 'Mismo tono'],
]

export default function SugerirPaleta({ principal, aplicar, bloqueado = false }) {
  const [oscuro, setOscuro] = useState(false)
  // Soltar los colores puestos a mano al aplicar (menú, fondos, botón...): así todo sigue a la paleta nueva. Marcada por defecto
  const [soltar, setSoltar] = useState(true)
  const [paletas, setPaletas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const sugerir = async semilla => {
    if (!esHex6(semilla)) return
    setCargando(true)
    setError('')
    try {
      const hex = semilla.slice(1)
      const respuestas = await Promise.all(
        MODOS.map(async ([modo, nombre]) => {
          const r = await fetch(`https://www.thecolorapi.com/scheme?hex=${hex}&mode=${modo}&count=5&format=json`)
          if (!r.ok) throw new Error('respuesta no válida')
          const datos = await r.json()
          return { nombre, modo, colores: (datos.colors ?? []).map(c => c.hex?.value).filter(Boolean) }
        }),
      )
      // Las paletas se arman con el modo claro u oscuro de ahora; al cambiar de modo se vuelven a armar con los mismos colores relacionados
      setPaletas(respuestas.map(({ nombre, modo, colores }) => ({ nombre, modo, semilla, colores })))
    } catch {
      setError('No se ha podido pedir la paleta. Prueba otra vez.')
    }
    setCargando(false)
  }

  const armadas = paletas.map(p => ({ nombre: p.nombre, ...armarPaletaDeModo(p.semilla, p.modo, p.colores, oscuro) }))

  return (
    <div className="grid gap-[0.6rem]">
      <div>
        <p className="text-[0.8rem] font-semibold text-zinc-500">Sugerir paleta</p>
        <p className="text-[0.8rem] text-zinc-400">Cada sugerencia trae los cuatro colores (principal, acento, fondo y texto). Toca una para aplicarla entera.</p>
      </div>
      <div className="flex flex-wrap gap-[0.4rem]">
        <button type="button" aria-pressed={!oscuro} onClick={() => setOscuro(false)} className={opcion(!oscuro)}>Fondo claro</button>
        <button type="button" aria-pressed={oscuro} onClick={() => setOscuro(true)} className={opcion(oscuro)}>Fondo oscuro</button>
      </div>
      <label className="flex cursor-pointer items-start gap-[0.5rem] text-[0.85rem]">
        <input type="checkbox" checked={soltar} onChange={e => setSoltar(e.target.checked)} className="mt-[0.15rem] h-[1.1rem] w-[1.1rem] shrink-0" />
        <span>
          Aplicar también a cada pieza (menú, redes, fondos, botones y textos)
          <span className="block text-[0.78rem] text-zinc-400">Escribe el color de cada pieza a partir de la paleta. Pierdes los colores que hayas puesto a mano en esas piezas.</span>
        </span>
      </label>
      <div className="flex flex-wrap gap-[0.5rem]">
        <button
          type="button"
          disabled={bloqueado || cargando || !esHex6(principal)}
          onClick={() => sugerir(principal)}
          className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40"
        >
          {cargando ? 'Pidiendo...' : 'Sugerir con mi principal'}
        </button>
        <button type="button" disabled={bloqueado || cargando} onClick={() => sugerir(principalAlAzar())} className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40">
          Otro color al azar
        </button>
      </div>
      {!esHex6(principal) && <p className="text-[0.8rem] text-zinc-400">Para partir del principal tiene que ser un color completo (#RRGGBB). El azar funciona siempre.</p>}
      {error && <p className="text-[0.8rem] font-semibold text-red-600">{error}</p>}
      {armadas.length > 0 && (
        <div className="grid grid-cols-2 gap-[0.6rem]">
          {armadas.map(p => {
            // El color exacto de cada pieza, tal como se escribirá al aplicar (los mismos que rolesDePaleta)
            const r = rolesDePaleta(p)
            return (
              <button key={p.nombre} type="button" onClick={() => aplicar(p, soltar)} aria-label={`Aplicar la paleta ${p.nombre}`} className="grid gap-[0.45rem] rounded-[0.7rem] p-[0.5rem] text-left ring-1 ring-zinc-300 hover:ring-zinc-500">
                <span className="text-[0.78rem] font-semibold text-zinc-500">{p.nombre}</span>
                {/* Maqueta: la barra del menú arriba, el cuerpo con el texto y los botones (el de la portada y Compartir) y la barra de redes abajo */}
                <span className="grid overflow-hidden rounded-[0.5rem]" style={{ background: p.fondo }}>
                  <span className="flex gap-[0.6rem] px-[0.5rem] py-[0.3rem] text-[0.6rem] font-bold" style={{ background: r.menuFondo }}>
                    <span style={{ color: r.menuTexto, boxShadow: `0 2px 0 ${r.menuSubrayado}` }}>Inicio</span>
                    <span style={{ color: r.menuInactivo }}>Menú</span>
                    <span style={{ color: r.menuInactivo }}>Horario</span>
                  </span>
                  <span className="grid gap-[0.35rem] p-[0.5rem]">
                    <span className="text-[0.9rem] font-bold leading-none" style={{ color: r.horarioTitulo }}>Aa texto</span>
                    <span className="flex items-center gap-[0.3rem]">
                      <span className="rounded-[0.3rem] px-[0.45rem] py-[0.2rem] text-[0.6rem] font-bold" style={{ background: r.botonFondo, color: r.boton }}>Ver carta</span>
                      <span className="rounded-full bg-black/45 px-[0.45rem] py-[0.2rem] text-[0.6rem] font-bold text-white">Compartir</span>
                    </span>
                  </span>
                  <span className="flex items-center justify-center gap-[0.35rem] px-[0.5rem] py-[0.3rem]" style={{ background: r.redesFondo }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="h-[0.55rem] w-[0.55rem] rounded-full" style={{ background: r.redesIconos }} />
                    ))}
                  </span>
                </span>
                {/* Lo que pinta cada color, con su código */}
                <span className="grid gap-[0.1rem] text-[0.65rem] leading-[1.3] text-zinc-500">
                  <span>Menú: barra {r.menuFondo.toUpperCase()}, letras {r.menuTexto.toUpperCase()}, sin elegir {r.menuInactivo.toUpperCase()}</span>
                  <span>Redes: barra {r.redesFondo.toUpperCase()}, iconos {r.redesIconos.toUpperCase()}</span>
                  <span>Botón: {r.botonFondo.toUpperCase()}, letras {r.boton.toUpperCase()}</span>
                  <span>Compartir: no cambia (negro translúcido, letras blancas)</span>
                  <span>Texto: {p.texto.toUpperCase()}</span>
                  <span>Fondo: {p.fondo.toUpperCase()}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
