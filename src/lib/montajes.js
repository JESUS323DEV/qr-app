/* Los montajes del diseño Polaroid en una miniweb (hero.montaje; sin él, 'clasica', el de siempre): cómo se colocan las
   polaroids y dónde va el texto de Inicio. giros: la inclinación de cada polaroid (vacía, rectas); monton: las fotos
   apiladas, la primera encima; textoArriba: el texto va encima de las polaroids y no debajo. dibujo: su icono en un cuadro
   de 24 × 24 (solo contornos). */
export const MONTAJES = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    giros: null,
    monton: false,
    textoArriba: false,
    dibujo: '<rect x="3" y="3" width="8" height="9" transform="rotate(-4 7 7)"/><rect x="13" y="3" width="8" height="9" transform="rotate(4 17 7)"/><path d="M4 17h16M4 20h9"/>',
  },
  {
    clave: 'monton',
    nombre: 'Montón de fotos',
    giros: ['rotate-[1deg]', '-rotate-[6deg]', 'rotate-[6deg]'],
    monton: true,
    textoArriba: false,
    dibujo: '<rect x="4" y="3" width="11" height="10" transform="rotate(-8 9 8)"/><rect x="9" y="3" width="11" height="10" transform="rotate(6 14 8)" fill="#fff"/><path d="M4 17h16M4 20h9"/>',
  },
  {
    clave: 'arriba',
    nombre: 'Texto arriba',
    giros: null,
    monton: false,
    textoArriba: true,
    dibujo: '<path d="M4 4h16M4 7h9"/><rect x="3" y="11" width="8" height="9" transform="rotate(-4 7 15)"/><rect x="13" y="11" width="8" height="9" transform="rotate(4 17 15)"/>',
  },
]

export const montajeDe = clave => MONTAJES.find(m => m.clave === clave) ?? MONTAJES[0]
export const CLAVES_MONTAJES = MONTAJES.map(m => m.clave)
