const loadedFonts = new Set()

export function loadFont(url) {
  if (loadedFonts.has(url)) return
  loadedFonts.add(url)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

// Si un color #RRGGBB es claro (luminancia percibida), para poner encima letras oscuras
const esClaro = c => {
  if (!/^#[0-9a-f]{6}$/i.test(c ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

// Claves de theme.colors que la carta guarda para sus colores propios y la variable CSS que pintan
export const COLORES_PROPIOS_CARTA = {
  cNombre: '--c-nombre',
  cMenuTitulo: '--c-menu-titulo',
  cMenuCuando: '--c-menu-cuando',
  cSeccion: '--c-seccion',
  cActiva: '--c-activa',
  cAlergenos: '--c-alergenos',
  cFondoPolaroid: '--c-fondo-polaroid',
}

export function applyTheme({ colors, fonts }) {
  const root = document.documentElement
  root.style.setProperty('--demo-bg', colors.bg)
  root.style.setProperty('--demo-surface', colors.surface)
  root.style.setProperty('--demo-primary', colors.primary)
  root.style.setProperty('--demo-accent', colors.accent)
  root.style.setProperty('--demo-text', colors.text)
  root.style.setProperty('--demo-muted', colors.muted)
  // El color de las letras sobre el Principal (cuando es el fondo de la página, como en la carta Polaroid): blanco, u oscuro si el principal es claro
  root.style.setProperty('--demo-sobre-primario', esClaro(colors.primary) ? '#141414' : '#FFFFFF')
  // Detalle del precio (la línea bajo el precio del menú): solo si la carta lo trae; si no, se quita y vale el acento
  if (colors.precio) root.style.setProperty('--demo-precio', colors.precio)
  else root.style.removeProperty('--demo-precio')
  // Color del número del precio del menú: solo si la carta lo trae; si no, se quita y vale el de cada estilo
  if (colors.precioTexto) root.style.setProperty('--demo-precio-texto', colors.precioTexto)
  else root.style.removeProperty('--demo-precio-texto')
  // Los colores propios de la carta (uno por cosa que pinta): solo si la carta los trae; si no, se quitan y vale el color de siempre de cada estilo
  for (const [clave, variable] of Object.entries(COLORES_PROPIOS_CARTA)) {
    if (colors[clave]) root.style.setProperty(variable, colors[clave])
    else root.style.removeProperty(variable)
  }
  // Fondo de cabecera: solo si la marca lo trae; si no, se quita y vale el principal (main.css)
  if (colors.header) root.style.setProperty('--demo-header', colors.header)
  else root.style.removeProperty('--demo-header')

  if (fonts?.heading?.family) {
    root.style.setProperty('--demo-heading-font', fonts.heading.family)
    if (fonts.heading.google) loadFont(fonts.heading.google)
  }
  if (fonts?.body?.family) {
    root.style.setProperty('--demo-body-font', fonts.body.family)
    if (fonts.body.google) loadFont(fonts.body.google)
  }
}

export function resetTheme() {
  const root = document.documentElement
  ;['bg', 'surface', 'primary', 'accent', 'text', 'muted', 'header', 'precio', 'precio-texto', 'sobre-primario'].forEach(k =>
    root.style.removeProperty(`--demo-${k}`)
  )
  Object.values(COLORES_PROPIOS_CARTA).forEach(v => root.style.removeProperty(v))
  root.style.removeProperty('--demo-heading-font')
  root.style.removeProperty('--demo-body-font')
}
