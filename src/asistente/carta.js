/* El catálogo de piezas de una carta para el asistente con IA del Editor (pestaña Asistente, con Carta elegida). Igual que en las miniwebs, la IA no
   diseña desde cero: elige un valor de cada lista cerrada de aquí (tipo de carta, estilo y su subdiseño, tipografía y colores) y el panel comprueba
   cada valor antes de ponerlo en los selectores. Solo el diseño: el contenido (platos, precios, menú del día) es de /mi-carta. */
import { FAMILIAS } from '../familias'
import { TIPOGRAFIAS } from './tipografias'

// Los dos tipos de carta: lo que cambia es el contenido de ejemplo (el estilo vale para los dos)
export const TIPOS_CARTA = [
  { clave: 'carta', texto: 'Carta', descripcion: 'Menú del día y platos por secciones, con precios y alérgenos.' },
  { clave: 'promociones', texto: 'Promociones', descripcion: 'Ofertas con su precio anterior tachado y servicios por secciones.' },
]

// Cómo se ve cada estilo de carta (la clave es la del diseño de carta); el campo "para" de cada familia dice a qué negocios va
const ESTILOS_CARTA_IA = {
  base: 'La sencilla: una foto en franja arriba, pestañas fijas debajo y el contenido en tarjetas claras. Limpia y fácil de leer.',
  polaroid: 'Cada plato u oferta como una polaroid o un papelito un poco torcido, con su foto. Cercana y alegre.',
  galeria: 'Mosaico de fotos a sangre; al tocar una, el plato a pantalla completa. Para cartas que se venden por la foto.',
  revista: 'Página de revista: una foto por sección, un plato destacado grande y el resto en lista editorial. Cuidada y elegante.',
  inmersiva: 'Una foto a pantalla completa de fondo y el contenido encima, sobre cristal oscuro. Oscura y fotográfica.',
}

// Los subdiseños de cada estilo (de momento solo Inmersiva: las pestañas en fila o en columna)
const SUBDISENOS_CARTA = {
  inmersiva: [
    { clave: 'fila', texto: 'Las pestañas (Menú del día y Carta, y sus secciones) en una fila debajo del nombre.' },
    { clave: 'columna', texto: 'Las pestañas en columna debajo del nombre, con las secciones colgando de Carta.' },
  ],
}

export const estilosDeCarta = () => Object.values(FAMILIAS).filter(f => f.carta && ESTILOS_CARTA_IA[f.carta])

export function catalogoCarta() {
  return {
    tipos: TIPOS_CARTA.map(t => ({ clave: t.clave, texto: t.descripcion })),
    estilos: estilosDeCarta().map(f => ({ clave: f.carta, nombre: f.nombre, texto: ESTILOS_CARTA_IA[f.carta], para: f.para, subdisenos: SUBDISENOS_CARTA[f.carta] ?? [] })),
    tipografias: TIPOGRAFIAS.map(t => ({ id: t.id, nombre: t.nombre, estilo: t.estilo })),
  }
}

const COLOR = /^#[0-9A-Fa-f]{6}$/

// Lo que devuelve la IA, comprobado valor a valor contra el catálogo: lo que no esté en las listas se descarta
export function validarDisenoCarta(res) {
  const estilo = estilosDeCarta().find(f => f.carta === res.estilo)?.carta ?? null
  const sub = estilo ? (SUBDISENOS_CARTA[estilo] ?? []).find(s => s.clave === res.subdiseno)?.clave ?? null : null
  const color = c => (COLOR.test(c ?? '') ? String(c).toUpperCase() : null)
  const colores = res.colores ?? {}
  return {
    nombre: String(res.nombre ?? '').replace(/—/g, ',').trim().slice(0, 40),
    tipo: TIPOS_CARTA.some(t => t.clave === res.tipo) ? res.tipo : null,
    estilo,
    subdiseno: sub,
    tipografia: TIPOGRAFIAS.some(t => t.id === res.tipografia) ? res.tipografia : null,
    colores: { principal: color(colores.principal), acento: color(colores.acento), texto: color(colores.texto), fondo: color(colores.fondo) },
    resumen: String(res.resumen ?? '').replace(/—/g, ',').trim(),
  }
}
