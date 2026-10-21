const loadedFonts = new Set()

export function loadFont(url) {
  if (loadedFonts.has(url)) return
  loadedFonts.add(url)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

export function applyTheme({ colors, fonts }) {
  const root = document.documentElement
  root.style.setProperty('--demo-bg', colors.bg)
  root.style.setProperty('--demo-surface', colors.surface)
  root.style.setProperty('--demo-primary', colors.primary)
  root.style.setProperty('--demo-accent', colors.accent)
  root.style.setProperty('--demo-text', colors.text)
  root.style.setProperty('--demo-muted', colors.muted)
  // Detalle del precio (la línea bajo el precio del menú): solo si la carta lo trae; si no, se quita y vale el acento
  if (colors.precio) root.style.setProperty('--demo-precio', colors.precio)
  else root.style.removeProperty('--demo-precio')
  // Color del número del precio del menú: solo si la carta lo trae; si no, se quita y vale el de cada estilo
  if (colors.precioTexto) root.style.setProperty('--demo-precio-texto', colors.precioTexto)
  else root.style.removeProperty('--demo-precio-texto')
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
  ;['bg', 'surface', 'primary', 'accent', 'text', 'muted', 'header', 'precio', 'precio-texto'].forEach(k =>
    root.style.removeProperty(`--demo-${k}`)
  )
  root.style.removeProperty('--demo-heading-font')
  root.style.removeProperty('--demo-body-font')
}
