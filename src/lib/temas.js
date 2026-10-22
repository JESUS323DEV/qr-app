/* Los temas de color de la landing (y de las páginas que usan sus colores: /planes, /catalogo, /mi-qr...). Cada tema es un juego de las variables de
   main.css: el azul es el de siempre (@theme) y los demás lo cambian con <html data-tema="clave"> (ver main.css). La elección se guarda en el navegador y
   index.html la pone antes de pintar, para que no parpadee. fondo y acento son los dos colores del círculo que lo elige. */
export const TEMAS = [
  { clave: 'azul', nombre: 'Azul marino y turquesa', fondo: '#0D1015', acento: '#049DB2' },
  { clave: 'amarillo', nombre: 'Negro y amarillo', fondo: '#0f0f0e', acento: '#ffd23f' },
  { clave: 'claro', nombre: 'Claro', fondo: '#E6EBF0', acento: '#0D1015' },
]

const CLAVE = 'mostraq-tema'

export function temaActual() {
  const t = document.documentElement.dataset.tema
  return TEMAS.some(x => x.clave === t) ? t : TEMAS[0].clave
}

export function ponerTema(clave) {
  const tema = TEMAS.find(t => t.clave === clave) ?? TEMAS[0]
  if (tema.clave === TEMAS[0].clave) delete document.documentElement.dataset.tema
  else document.documentElement.dataset.tema = tema.clave
  document.head.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema.fondo)
  try {
    localStorage.setItem(CLAVE, tema.clave)
  } catch {
    // Sin almacenamiento: el tema vale hasta cerrar la página, sin más
  }
}
