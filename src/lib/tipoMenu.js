/* Qué enseña la pestaña de menú de una miniweb: 'menu' (Menú del día y Carta, lo de siempre) u 'ofertas' (Ofertas y Servicios). Se elige en el Editor (panel Menú);
   sin elegir, es el menú del día si la pestaña lo trae y, si solo trae ofertas (belleza, tiendas), las ofertas.
   La pestaña guarda su valor en `menuTipo` y puede traer los dos bloques (menuDia y ofertas) a la vez: las secciones son las mismas para la carta y para los servicios. */
export function tipoMenuDe(pestana) {
  if (!pestana?.ofertas) return 'menu'
  if (!pestana.menuDia) return 'ofertas'
  return pestana.menuTipo === 'ofertas' ? 'ofertas' : 'menu'
}

// Los cambios (ruta → valor, con las rutas de la pestaña en la posición i de hero.pestanas) que hay que escribir para pasar la pestaña a un tipo.
// Al elegir ofertas por primera vez se crea su bloque con ofertasIniciales (los textos genéricos); no se borra nada al volver al menú
// También cambia el nombre de la pestaña en el menú de arriba ("Menú" u "Ofertas"), solo si lleva uno de los de partida (uno escrito a mano no se toca)
const NOMBRES_PESTANA_MENU = ['Menú', 'Carta', 'Servicios', 'Ofertas']
export function cambiosDeTipoMenu(tipo, pestana, i, ofertasIniciales) {
  const base = `hero.pestanas.${i}`
  const cambios = {}
  if (tipo === 'ofertas' && !pestana?.ofertas) cambios[`${base}.ofertas`] = structuredClone(ofertasIniciales)
  cambios[`${base}.menuTipo`] = tipo === 'ofertas' ? 'ofertas' : 'menu'
  const nombre = tipo === 'ofertas' ? 'Ofertas' : 'Menú'
  if (NOMBRES_PESTANA_MENU.includes(pestana?.texto?.trim()) && pestana.texto.trim() !== nombre) cambios[`${base}.texto`] = nombre
  return cambios
}

// El texto del botón de la portada al pasar el menú a un tipo: "Ver ofertas" (ofertas y servicios) o "Ver menú" (menú del día y carta). Solo se cambia si el actual es uno
// de los de partida; uno escrito a mano no se toca. null: no cambia nada
const TEXTOS_BOTON_MENU = ['Ver menú', 'Ver servicios', 'Ver carta', 'Ver ofertas']
export function textoBotonSegunMenu(tipo, actual) {
  const a = actual?.trim()
  if (!TEXTOS_BOTON_MENU.includes(a)) return null
  const nuevo = tipo === 'ofertas' ? 'Ver ofertas' : 'Ver menú'
  return nuevo === a ? null : nuevo
}
