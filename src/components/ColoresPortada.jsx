import { createContext, useContext } from 'react'

/* Los colores de la miniweb que se eligen uno por uno (hero.colores, catálogo en lib/coloresMiniweb.js). La página
   los pone con ColoresMiniweb y cada pieza (nombre, lema, titular, descripción y botón) pide el suyo con useRol */
export const ColoresMiniweb = createContext({ colores: {}, acento: null })

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
  const elegido = colores?.[rol]
  if (elegido) return { color: elegido }
  if (rol === 'boton' && acento) return { color: esClaroHex(acento) ? '#141414' : '#FFFFFF' }
  return undefined
}
