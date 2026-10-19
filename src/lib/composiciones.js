/* Las composiciones del diseño Mosaico en una miniweb (hero.composicion; sin ella, 'clasica', la de siempre): dónde va el
   texto de Inicio respecto a las fotos y cómo se enmarcan. texto: 'clasica' (el titular arriba y la descripción y el botón
   debajo de las fotos), 'arriba' (todo el texto encima de las fotos) o 'abajo' (todo debajo). marco: las clases del panel
   que rodea las fotos y margen: el hueco que deja dentro (si lo hay). dibujo: su icono en un cuadro de 24 × 24 (solo contornos). */
export const COMPOSICIONES = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    texto: 'clasica',
    marco: '',
    margen: 'inset-0',
    dibujo: '<path d="M4 4h16M4 7h8"/><rect x="4" y="10" width="16" height="7"/><path d="M4 20h10"/>',
  },
  {
    clave: 'arriba',
    nombre: 'Todo el texto arriba',
    texto: 'arriba',
    marco: '',
    margen: 'inset-0',
    dibujo: '<path d="M4 4h16M4 7h12M4 10h8"/><rect x="4" y="13" width="16" height="8"/>',
  },
  {
    clave: 'abajo',
    nombre: 'Todo el texto abajo',
    texto: 'abajo',
    marco: '',
    margen: 'inset-0',
    dibujo: '<rect x="4" y="3" width="16" height="8"/><path d="M4 14h16M4 17h12M4 20h8"/>',
  },
]

export const composicionDe = clave => COMPOSICIONES.find(c => c.clave === clave) ?? COMPOSICIONES[0]
export const CLAVES_COMPOSICIONES = COMPOSICIONES.map(c => c.clave)
