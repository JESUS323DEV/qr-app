/* Las disposiciones del diseño Fullbleed en una miniweb (hero.disposicion; sin ella, 'clasica', la de siempre): cómo se
   coloca el texto de Inicio sobre la foto a pantalla completa. Cada una lleva las clases de la foto (foto), las del velo
   que oscurece la foto entera (velo, si lo lleva) y las del bloque del texto (texto). dibujo: su icono en un cuadro de
   24 × 24 (solo contornos). */
export const DISPOSICIONES = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    foto: '',
    texto: 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-[1.25rem] pb-[0.4rem] pt-[3rem]',
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15h10M7 18h6"/>',
  },
  {
    clave: 'tarjeta',
    nombre: 'Tarjeta de cristal',
    foto: '',
    texto: 'absolute inset-x-[1rem] bottom-[1rem] rounded-[1.2rem] bg-black/55 px-[1.1rem] pb-[0.2rem] pt-[1rem] backdrop-blur-md',
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="12" width="12" height="6" rx="2"/>',
  },
  {
    clave: 'velo',
    nombre: 'Velo de color',
    foto: '',
    texto: 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-demo-header via-demo-header/60 to-transparent px-[1.25rem] pb-[0.4rem] pt-[3rem]',
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 14h18M3 18h18" stroke-width="3"/>',
  },
]

export const disposicionDe = clave => DISPOSICIONES.find(d => d.clave === clave) ?? DISPOSICIONES[0]
export const CLAVES_DISPOSICIONES = DISPOSICIONES.map(d => d.clave)
