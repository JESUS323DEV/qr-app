/* Las distribuciones del diseño Retrato en una miniweb (hero.distribucion; sin ella, 'clasica', la de siempre): cómo se
   colocan las tres fotos. arriba: la fila va bajo el nombre y no al final; rejilla: las clases de la rejilla de fotos;
   boton(i) e imagen(i): las clases del recuadro y de la foto número i. dibujo: su icono en un cuadro de 24 × 24 (solo contornos). */
export const DISTRIBUCIONES = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    arriba: false,
    rejilla: 'grid-cols-3 gap-[0.4rem]',
    boton: () => 'rounded-[0.4rem]',
    imagen: () => 'h-[clamp(5.5rem,17svh,9.5rem)]',
    dibujo: '<circle cx="12" cy="6" r="2.5"/><path d="M4 11h16"/><rect x="4" y="14" width="4.5" height="7"/><rect x="9.8" y="14" width="4.5" height="7"/><rect x="15.5" y="14" width="4.5" height="7"/>',
  },
  {
    clave: 'redondas',
    nombre: 'Fotos redondas',
    arriba: false,
    rejilla: 'grid-cols-3 gap-[0.8rem] px-[1.2rem]',
    boton: () => 'rounded-full',
    imagen: () => 'aspect-square',
    dibujo: '<circle cx="12" cy="6" r="2.5"/><path d="M4 11h16"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="12" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  },
  {
    clave: 'destacada',
    nombre: 'Una grande y dos pequeñas',
    arriba: false,
    rejilla: 'grid-cols-2 grid-rows-2 gap-[0.4rem]',
    boton: i => `rounded-[0.4rem] ${i === 0 ? 'row-span-2' : ''}`,
    imagen: i => (i === 0 ? 'h-full min-h-[10rem]' : 'aspect-[4/3]'),
    dibujo: '<circle cx="12" cy="6" r="2.5"/><path d="M4 11h16"/><rect x="4" y="14" width="8" height="7"/><rect x="13.5" y="14" width="6.5" height="3"/><rect x="13.5" y="18" width="6.5" height="3"/>',
  },
  {
    clave: 'arriba',
    nombre: 'Fotos arriba',
    arriba: true,
    rejilla: 'grid-cols-3 gap-[0.4rem]',
    boton: () => 'rounded-[0.4rem]',
    imagen: () => 'h-[clamp(5rem,15svh,8.5rem)]',
    dibujo: '<circle cx="6" cy="5" r="2"/><rect x="4" y="9" width="4.5" height="5"/><rect x="9.8" y="9" width="4.5" height="5"/><rect x="15.5" y="9" width="4.5" height="5"/><path d="M4 18h16M4 21h9"/>',
  },
]

export const distribucionDe = clave => DISTRIBUCIONES.find(d => d.clave === clave) ?? DISTRIBUCIONES[0]
export const CLAVES_DISTRIBUCIONES = DISTRIBUCIONES.map(d => d.clave)
