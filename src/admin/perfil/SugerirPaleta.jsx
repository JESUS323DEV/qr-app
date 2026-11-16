import { useRef, useState } from 'react'
import { opcion } from '../../components/panel'
import { esHex6 } from '../../lib/colorMath'
import { armarDeLibreria, crearTanda } from './libreriaPaletas'
import { armarPaletaDeModo, pedirRelacionadas } from './paletasConApi'
import { coloresDeCarta, rolesDePaleta } from './paletasSugeridas'

// Sugerir paleta: enseña paletas completas (principal, acento, fondo y texto) de la librería (libreriaPaletas.js), hechas a mano. Al tocar una se aplican los cuatro
// colores de golpe. 'Ver paletas': cada pulsación saca cuatro de familias de color distintas y no repite las que ya han salido hasta que se acaben (la memoria va en una
// referencia). 'Sugerir con mi principal' (opcional): cuatro paletas a partir del principal de ahora, con TheColorAPI (paletasConApi.js)
export default function SugerirPaleta({ principal, aplicar, bloqueado = false, modo = 'miniweb' }) {
  const [oscuro, setOscuro] = useState(false)
  // Soltar los colores puestos a mano al aplicar (menú, fondos, botón...): así todo sigue a la paleta nueva. Marcada por defecto
  const [soltar, setSoltar] = useState(true)
  // Cada una es de la librería ({ nombre, libreria }) o de la API ({ nombre, api: { modo, semilla, colores } })
  const [paletas, setPaletas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const memoria = useRef({ vistos: [], ultimas: [] })

  const otras = () => {
    const tanda = crearTanda(4, memoria.current)
    memoria.current = { vistos: tanda.vistos, ultimas: tanda.ultimas }
    setError('')
    setPaletas(tanda.paletas.map(libreria => ({ nombre: libreria.nombre, libreria })))
  }

  const conMiPrincipal = async () => {
    setCargando(true)
    setError('')
    try {
      const relacionadas = await pedirRelacionadas(principal)
      setPaletas(relacionadas.map(api => ({ nombre: api.nombre, api })))
    } catch {
      setError('No se ha podido pedir la paleta. Prueba otra vez.')
    }
    setCargando(false)
  }

  // Las paletas se arman con el fondo claro u oscuro de ahora; al cambiar de fondo se vuelven a armar las mismas
  const armadas = paletas.map(p => ({ nombre: p.nombre, ...(p.libreria ? armarDeLibreria(p.libreria, oscuro) : armarPaletaDeModo(p.api.semilla, p.api.modo, p.api.colores, oscuro)) }))

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
        <button type="button" disabled={bloqueado || cargando} onClick={otras} className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40">
          {paletas.some(p => p.libreria) ? 'Otras paletas' : 'Ver paletas'}
        </button>
        <button type="button" disabled={bloqueado || cargando || !esHex6(principal)} onClick={conMiPrincipal} className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40">
          {cargando ? 'Pidiendo...' : 'Sugerir con mi principal'}
        </button>
      </div>
      <p className="text-[0.78rem] text-zinc-400">Las de «Ver paletas» están hechas a mano. «Sugerir con mi principal» parte de tu color y aplica reglas de la rueda de color: da combinaciones correctas pero más previsibles.</p>
      {!esHex6(principal) && <p className="text-[0.8rem] text-zinc-400">Para partir del principal tiene que ser un color completo (#RRGGBB).</p>}
      {error && <p className="text-[0.8rem] font-semibold text-red-600">{error}</p>}
      {armadas.length > 0 && (
        <div className="grid grid-cols-2 gap-[0.6rem]">
          {armadas.map(p => {
            // Menú y ofertas: una maqueta de carta (nombre, menú del día con su precio, sección, plato y una tarjeta) y los colores que se aplican
            if (modo === 'carta') {
              const c = coloresDeCarta(p)
              return (
                <button key={p.nombre} type="button" onClick={() => aplicar(p, soltar)} aria-label={`Aplicar la paleta ${p.nombre}`} className="grid gap-[0.45rem] rounded-[0.7rem] p-[0.5rem] text-left ring-1 ring-zinc-300 hover:ring-zinc-500">
                  <span className="text-[0.78rem] font-semibold text-zinc-500">{p.nombre}</span>
                  <span className="grid gap-[0.25rem] overflow-hidden rounded-[0.5rem] p-[0.5rem]" style={{ background: p.fondo }}>
                    <span className="text-[0.95rem] font-bold leading-none" style={{ color: p.titulo }}>Dulce Aroma</span>
                    <span className="flex items-baseline justify-between gap-[0.3rem]">
                      <span className="text-[0.7rem] font-semibold" style={{ color: p.titulo }}>Menú del día</span>
                      <span className="text-[0.8rem] font-bold" style={{ color: p.principal }}>14,90 €</span>
                    </span>
                    <span className="text-[0.62rem] font-semibold italic" style={{ color: p.acento }}>Primeros</span>
                    <span className="rounded-[0.3rem] px-[0.35rem] py-[0.25rem]" style={{ background: c.fondo2 }}>
                      <span className="block text-[0.62rem]" style={{ color: p.texto }}>Crema de calabaza</span>
                      <span className="block text-[0.55rem]" style={{ color: c.textoSuave }}>Con picatostes</span>
                    </span>
                  </span>
                  <span className="grid gap-[0.1rem] text-[0.65rem] leading-[1.3] text-zinc-500">
                    <span>Principal (botones y precios): {p.principal.toUpperCase()}</span>
                    <span>Acento (secciones): {p.acento.toUpperCase()}</span>
                    <span>Fondo: {p.fondo.toUpperCase()}, tarjetas {c.fondo2.toUpperCase()}</span>
                    <span>Texto título: {p.titulo.toUpperCase()}</span>
                    <span>Texto normal: {p.texto.toUpperCase()}, suave {c.textoSuave.toUpperCase()}</span>
                  </span>
                </button>
              )
            }
            // El color exacto de cada pieza, tal como se escribirá al aplicar (los mismos que rolesDePaleta)
            const r = rolesDePaleta(p)
            return (
              <button key={p.nombre} type="button" onClick={() => aplicar(p, soltar)} aria-label={`Aplicar la paleta ${p.nombre}`} className="grid gap-[0.45rem] rounded-[0.7rem] p-[0.5rem] text-left ring-1 ring-zinc-300 hover:ring-zinc-500">
                <span className="text-[0.78rem] font-semibold text-zinc-500">{p.nombre}</span>
                {/* Maqueta, en el orden de la página: el menú arriba; el cuerpo con el título, el texto normal y los botones; la zona de la reseña con su tarjeta; y la barra de redes */}
                <span className="grid overflow-hidden rounded-[0.5rem]" style={{ background: p.fondo }}>
                  <span className="flex gap-[0.6rem] px-[0.5rem] py-[0.3rem] text-[0.6rem] font-bold" style={{ background: r.menuFondo }}>
                    <span style={{ color: r.menuTexto, boxShadow: `0 2px 0 ${r.menuSubrayado}` }}>Inicio</span>
                    <span style={{ color: r.menuInactivo }}>Menú</span>
                    <span style={{ color: r.menuInactivo }}>Horario</span>
                  </span>
                  <span className="grid gap-[0.25rem] p-[0.5rem]">
                    <span className="text-[0.9rem] font-bold leading-none" style={{ color: r.horarioTitulo }}>Aa título</span>
                    <span className="text-[0.65rem] leading-[1.3]" style={{ color: r.horarioHoras }}>Texto normal de la descripción</span>
                    <span className="mt-[0.1rem] flex items-center gap-[0.3rem]">
                      <span className="rounded-[0.3rem] px-[0.45rem] py-[0.2rem] text-[0.6rem] font-bold" style={{ background: r.botonFondo, color: r.boton }}>Ver carta</span>
                      <span className="rounded-full bg-black/45 px-[0.45rem] py-[0.2rem] text-[0.6rem] font-bold text-white">Compartir</span>
                    </span>
                  </span>
                  <span className="px-[0.5rem] py-[0.35rem]" style={{ background: r.fondoResena }}>
                    <span className="block rounded-[0.35rem] bg-white py-[0.25rem] text-center text-[0.55rem] font-semibold text-zinc-700">Valóranos en Google</span>
                  </span>
                  <span className="flex items-center justify-center gap-[0.35rem] px-[0.5rem] py-[0.3rem]" style={{ background: r.redesFondo }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="h-[0.55rem] w-[0.55rem] rounded-full" style={{ background: r.redesIconos }} />
                    ))}
                  </span>
                </span>
                {/* Los siete colores, con su código */}
                <span className="grid gap-[0.1rem] text-[0.65rem] leading-[1.3] text-zinc-500">
                  <span>1 Menú: barra {r.menuFondo.toUpperCase()}, letras {r.menuTexto.toUpperCase()}, sin elegir {r.menuInactivo.toUpperCase()}</span>
                  <span>2 Cuerpo: {p.fondo.toUpperCase()}</span>
                  <span>3 Redes: barra {r.redesFondo.toUpperCase()}, iconos {r.redesIconos.toUpperCase()}</span>
                  <span>4 Tarjeta de Google (zona): {r.fondoResena.toUpperCase()}</span>
                  <span>5 Textos de Horario y Reservar: título {r.horarioTitulo.toUpperCase()}, normal {r.horarioHoras.toUpperCase()}</span>
                  <span>6 Botón: {r.botonFondo.toUpperCase()}, letras {r.boton.toUpperCase()}</span>
                  <span>No cambian: los textos de la portada (blancos sobre la foto) ni Compartir (negro translúcido, letras blancas)</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
