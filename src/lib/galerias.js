/* Los estilos del diseño Galería en una miniweb (hero.pase; sin él, 'clasica', el de siempre): cómo se enseña la foto y
   dónde va el texto de Inicio. foto: las clases extra del recuadro de la foto; titularSobre: el titular va sobre la foto (si no,
   debajo, con el resto del texto); textoSobre: también la descripción y el botón van sobre la foto; carrusel: se ve un trozo
   de la foto anterior y de la siguiente a los lados. dibujo: su icono en un cuadro de 24 × 24 (solo contornos). */
export const GALERIAS = [
  {
    clave: 'clasica',
    nombre: 'Clásica',
    foto: 'rounded-[0.9rem]',
    titularSobre: true,
    textoSobre: false,
    carrusel: false,
    dibujo: '<rect x="3" y="3" width="18" height="12" rx="2"/><path d="M6 11h8M4 19h10M4 22h6" /><path d="M7 9l-2 2 2 2M17 9l2 2-2 2" transform="translate(0 -1)"/>',
  },
  {
    clave: 'sobre',
    nombre: 'Todo sobre la foto',
    foto: 'rounded-[0.9rem]',
    titularSobre: true,
    textoSobre: true,
    carrusel: false,
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 13h10M7 16h6"/><rect x="7" y="18" width="5" height="1.5" rx="0.7" fill="currentColor"/>',
  },
  {
    clave: 'carrusel',
    nombre: 'Pase lateral',
    foto: '',
    titularSobre: true,
    textoSobre: false,
    carrusel: true,
    dibujo: '<rect x="7" y="4" width="10" height="14" rx="2"/><path d="M3 8v6M21 8v6M5 21h14" />',
  },
]

export const galeriaDe = clave => GALERIAS.find(g => g.clave === clave) ?? GALERIAS[0]
export const CLAVES_GALERIAS = GALERIAS.map(g => g.clave)
