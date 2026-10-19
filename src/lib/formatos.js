/* Los formatos del diseño Editorial (hero.formato; sin él, 'clasica', el de siempre): formas de unir la foto de arriba
   con el texto de abajo. Cada uno lleva las clases de la foto (foto), las del bloque de debajo (bloque), las que se
   añaden a la marca que va encima de la foto (encima, con ! para ganar a las de siempre) y el tamaño del nombre
   (nombre, si cambia). dibujo: su icono en un cuadro de 24 × 24 (solo contornos). */
export const FORMATOS = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    foto: '',
    bloque: 'px-[1.25rem] pt-[1.1rem]',
    dibujo: '<rect x="3" y="3" width="18" height="11"/><path d="M3 18h12M3 21h7"/>',
  },
  {
    clave: 'tarjeta',
    nombre: 'Tarjeta solapada',
    foto: '',
    bloque: '-mt-[1.8rem] relative z-10 mx-[1rem] rounded-[1.2rem] bg-demo-bg px-[1rem] pt-[1rem] shadow-[0_0.6rem_1.6rem_-0.5rem_rgb(0_0_0/0.35)]',
    dibujo: '<rect x="3" y="3" width="18" height="12"/><rect x="5" y="11" width="14" height="10" rx="2" fill="#fff"/><path d="M8 15h8M8 18h5"/>',
  },
  {
    clave: 'marco',
    nombre: 'Foto con marco',
    foto: 'mx-[1.25rem] mt-[0.8rem] rounded-[1.2rem]',
    bloque: 'px-[1.25rem] pt-[1.1rem]',
    dibujo: '<rect x="5" y="4" width="14" height="10" rx="3"/><path d="M5 18h14M5 21h8"/>',
  },
  {
    clave: 'franja',
    nombre: 'Franja de color',
    foto: 'border-b-[0.5rem] border-demo-accent',
    bloque: 'px-[1.25rem] pt-[1.1rem]',
    dibujo: '<rect x="3" y="3" width="18" height="10"/><path d="M3 15.5h18" stroke-width="3"/><path d="M3 20h12"/>',
  },
]

export const formatoDe = clave => FORMATOS.find(f => f.clave === clave) ?? FORMATOS[0]
export const CLAVES_FORMATOS = FORMATOS.map(f => f.clave)
