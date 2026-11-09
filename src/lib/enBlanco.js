/* Lo común de los perfiles "Desde cero" (la temática En blanco de Nuevo perfil): una marca neutra y fotos de relleno, para empezar un diseño
   sin arrastrar los colores, textos ni fotos de ninguna demo. */

// Una caja gris con la palabra "Foto" (imagen SVG en la propia dirección): nunca falla y se cambia con Subir o Buscar
export const cajaFoto = (ancho = 1000, alto = 900) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}"><rect width="100%" height="100%" fill="#D9D9D4"/><text x="50%" y="50%" fill="#8C8C86" font-family="Arial, sans-serif" font-size="${Math.round(Math.min(ancho, alto) / 9)}" text-anchor="middle" dominant-baseline="middle">Foto</text></svg>`
  )}`

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
