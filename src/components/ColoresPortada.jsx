import { createContext, useContext } from 'react'

/* Los colores de la miniweb que se eligen uno por uno (hero.colores, catálogo en lib/coloresMiniweb.js). La página
   los pone con ColoresMiniweb y cada pieza (nombre, lema, titular, descripción y botón) pide el suyo con useRol */
export const ColoresMiniweb = createContext({ colores: {}, acento: null, filtro: null, cabecera: null })

// Si un color (#RRGGBB) es claro, para poner encima letras oscuras (luminancia percibida)
export const esClaroHex = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

/* El estilo de color de un rol: titulo, subtitulo, titular, descripcion o boton. Sin color elegido, no pone nada (la
   pieza se queda con el suyo del diseño), salvo el texto del botón, que sin elegir se pone solo en blanco u oscuro
   según el color del botón (el acento), para que nunca quede ilegible */
export function useRol(rol) {
  const { colores, acento } = useContext(ColoresMiniweb)
  // El texto extra, sin color propio, usa el del texto pequeño
  const elegido = colores?.[rol] ?? (rol === 'extra' ? colores?.descripcion : undefined)
  if (elegido) return { color: elegido }
  const fondoBoton = colores?.botonFondo ?? acento
  if (rol === 'boton' && fondoBoton) return { color: esClaroHex(fondoBoton) ? '#141414' : '#FFFFFF' }
  return undefined
}

/* El filtro que oscurece la foto bajo el texto de la portada: intensidad (hero.filtro, de 0 a 100; sin él, 100: el de cada diseño) y color
   (hero.colores.filtroFoto; sin él, el de cada diseño). activo: si se ha tocado alguna de las dos cosas */
export function useFiltro() {
  const { colores, filtro } = useContext(ColoresMiniweb)
  const intensidad = filtro == null ? 1 : Math.max(0, Math.min(100, Number(filtro))) / 100
  const color = colores?.filtroFoto ?? null
  return { intensidad, color, activo: intensidad !== 1 || Boolean(color) }
}

// Un degradado de abajo a arriba del color dado, con la opacidad de cada tramo (en %) multiplicada por la intensidad
export const degradadoFiltro = (color, [abajo, medio], intensidad) =>
  `linear-gradient(to top, color-mix(in srgb, ${color} ${Math.round(abajo * intensidad)}%, transparent), color-mix(in srgb, ${color} ${Math.round(medio * intensidad)}%, transparent), transparent)`

// El fondo del botón principal (hero.colores.botonFondo); sin elegir, no pone nada y el botón se queda con el acento de la marca
export function useFondoBoton() {
  const { colores } = useContext(ColoresMiniweb)
  return colores?.botonFondo ? { background: colores.botonFondo } : undefined
}
