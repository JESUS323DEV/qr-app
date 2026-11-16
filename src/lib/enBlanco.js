/* Lo común de los perfiles "Desde cero" (la temática En blanco de Nuevo perfil): una marca neutra, para empezar un diseño
   sin arrastrar los colores, textos ni fotos de ninguna demo. */

// Colores neutros (blanco roto, gris y un solo acento) y una sola letra, Inter
export const TEMA_NEUTRO = {
  colors: {
    bg: '#F7F7F5',
    surface: '#ECECE8',
    primary: '#2F2F2D',
    accent: '#C9C9C2',
    text: '#161616',
    muted: '#6B6B66',
  },
  fonts: {
    heading: {
      family: '"Inter", system-ui, sans-serif',
      google: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
    },
    body: {
      family: '"Inter", system-ui, sans-serif',
      google: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
  },
}

// Textos de prueba de los platos y servicios en blanco: largos a propósito, para comprobar cuánto aguanta cada diseño (el nombre con rayas y la descripción de unas tres líneas)
export const DESCRIPCION_PRUEBA = 'Descripción de prueba larga para ver cuántas líneas caben: ingredientes y cómo se sirve.'
export const nombrePlatoPrueba = n => `Plato ${n} ----------`
