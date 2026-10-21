/* Las distribuciones del diseño Retrato en una miniweb (hero.distribucion; sin ella, 'clasica', la de siempre): cómo se
   colocan las tres fotos. arriba: la fila va bajo el nombre y no al final; rejilla: las clases de la rejilla de fotos;
   boton(i) e imagen(i): las clases del recuadro y de la foto número i. contenedor: las clases de la fila para que ocupe el espacio que sobra
   (la foto se coloca encima, a todo el recuadro, con un alto mínimo y un máximo). dibujo: su icono en un cuadro de 24 × 24 (solo contornos).
   «Fotos redondas» está desactivada (quitada de la lista): una fila de tres círculos no puede crecer en alto sin crecer en ancho. */
const CRECE = 'min-h-[5.5rem] max-h-[26rem] flex-[2_1_0%]'
export const DISTRIBUCIONES = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    arriba: false,
    rejilla: 'grid-cols-3 gap-[0.4rem]',
    contenedor: CRECE,
    boton: () => 'relative rounded-[0.4rem]',
    imagen: () => 'absolute inset-0 h-full w-full',
    dibujo: '<circle cx="12" cy="6" r="2.5"/><path d="M4 11h16"/><rect x="4" y="14" width="4.5" height="7"/><rect x="9.8" y="14" width="4.5" height="7"/><rect x="15.5" y="14" width="4.5" height="7"/>',
  },
  {
    clave: 'destacada',
    nombre: 'Una grande y dos pequeñas',
    arriba: false,
    rejilla: 'grid-cols-2 grid-rows-2 gap-[0.4rem]',
    contenedor: 'min-h-[10rem] max-h-[28rem] flex-[2_1_0%]',
    boton: i => `relative rounded-[0.4rem] ${i === 0 ? 'row-span-2' : ''}`,
    imagen: () => 'absolute inset-0 h-full w-full',
    dibujo: '<circle cx="12" cy="6" r="2.5"/><path d="M4 11h16"/><rect x="4" y="14" width="8" height="7"/><rect x="13.5" y="14" width="6.5" height="3"/><rect x="13.5" y="18" width="6.5" height="3"/>',
  },
  {
    clave: 'arriba',
    nombre: 'Fotos arriba',
    arriba: true,
    rejilla: 'grid-cols-3 gap-[0.4rem]',
    contenedor: CRECE,
    boton: () => 'relative rounded-[0.4rem]',
    imagen: () => 'absolute inset-0 h-full w-full',
    dibujo: '<circle cx="6" cy="5" r="2"/><rect x="4" y="9" width="4.5" height="5"/><rect x="9.8" y="9" width="4.5" height="5"/><rect x="15.5" y="9" width="4.5" height="5"/><path d="M4 18h16M4 21h9"/>',
  },
]

export const distribucionDe = clave => DISTRIBUCIONES.find(d => d.clave === clave) ?? DISTRIBUCIONES[0]
export const CLAVES_DISTRIBUCIONES = DISTRIBUCIONES.map(d => d.clave)
