/* El catálogo de piezas de una miniweb para el asistente con IA de Nuevo perfil (pestaña Asistente). La IA no parte de ninguna
   demo ni diseña: elige un valor de cada lista cerrada de aquí (portada y su subdiseño, dónde va cada pieza, estilo del menú,
   tamaño del nombre, tipografía y colores) y el panel comprueba cada valor antes de ponerlo en los selectores. Cada lista sale
   de las mismas que usa el editor, para que las dos cosas no se separen. */
import { CORTES } from '../lib/cortes'
import { FORMATOS } from '../lib/formatos'
import { DISPOSICIONES } from '../lib/disposiciones'
import { COMPOSICIONES } from '../lib/composiciones'
import { DISTRIBUCIONES } from '../lib/distribuciones'
import { GALERIAS } from '../lib/galerias'
import { MONTAJES } from '../lib/montajes'
import { CLAVES_COLORES_MINIWEB, COLORES_MINIWEB } from '../lib/coloresMiniweb'
import { TIPOGRAFIAS } from './tipografias'
import { BARRAS } from '../fichas/barras'
import { PLANTILLAS } from '../plantillas'
import { cartas } from '../cartas'
import { DISENOS_CARTA } from './disenos'

// Las portadas de una miniweb, con cómo se ven y su lista de subdiseños (campo: la clave que se guarda en hero)
export const PORTADAS_IA = [
  { clave: 'editorial', texto: 'Foto grande arriba con el nombre encima y, debajo, el texto de Inicio (titular, descripción y botón). Revista de cocina o de marca.', campo: 'formato', lista: FORMATOS },
  { clave: 'diagonal', texto: 'La foto termina en un corte (diagonal, curva...) y debajo va el texto de Inicio. Elegante y con movimiento.', campo: 'corte', lista: CORTES },
  { clave: 'fullbleed', texto: 'La foto ocupa toda la pantalla y el texto de Inicio va encima, abajo. Directa y con mucha foto.', campo: 'disposicion', lista: DISPOSICIONES },
  { clave: 'mosaico', texto: 'Fondo claro: el nombre y el titular arriba, las fotos en una tarjeta que rota como un escaparate y la descripción con el botón. Luminosa y amable.', campo: 'composicion', lista: COMPOSICIONES },
  { clave: 'retrato', texto: 'Bloque oscuro sobre una foto con velo: círculo con el logo o las iniciales, el texto en el centro y tres fotos abajo que se abren en grande. Personal y seria.', campo: 'distribucion', lista: DISTRIBUCIONES },
  { clave: 'galeria', texto: 'Una foto con flechas que pasa sola, el titular sobre ella y la descripción con el botón. Para negocios que se venden por la foto.', campo: 'pase', lista: GALERIAS },
  { clave: 'polaroid', texto: 'Fondo del color de la marca con las fotos como polaroids pegadas y el nombre escrito a mano. Cercana, alegre, artesana.', campo: 'montaje', lista: MONTAJES },
]

// Dónde va cada pieza (las mismas listas que el panel de estructura)
export const ESTRUCTURA_IA = [
  { campo: 'redesEn', texto: 'Dónde va la barra de redes', lista: [['arriba', 'barra bajo el menú'], ['lateral', 'columna de iconos al lado de la portada'], ['medio', 'barra entre la portada y la reseña'], ['abajo', 'barra al final de la página']] },
  { campo: 'menuEn', texto: 'Dónde va el menú de navegación (Inicio, Menú, Horario...)', lista: [['arriba', 'arriba del todo'], ['abajo', 'abajo, como la barra de una app']] },
  { campo: 'compartirEn', texto: 'Dónde va el botón de compartir', lista: [['diseno', 'donde lo pone el diseño'], ['abajo', 'junto al botón principal'], ['redes', 'como un icono más en las redes']] },
]

export const TAMANOS_NOMBRE = [['xs', 'pequeño'], ['md', 'el de cada diseño'], ['xl', 'grande']]

// Los roles de color opcionales (los que ya tienen un valor automático que se lee bien; solo se tocan si hace falta)
export const ROLES_COLOR_IA = COLORES_MINIWEB.flatMap(g => g.campos).map(c => ({ clave: c.clave, texto: `${c.nombre}: ${c.ayuda}` }))

// Todo lo que se le manda a la IA: las listas con sus claves y para qué sirve cada una
export const catalogoMiniweb = () => ({
  temas: PLANTILLAS.map(p => ({ clave: p.clave, nombre: p.nombre })),
  portadas: PORTADAS_IA.map(p => ({ clave: p.clave, texto: p.texto, campo: p.campo, subdisenos: p.lista.map(s => ({ clave: s.clave, nombre: s.nombre })) })),
  estructura: ESTRUCTURA_IA.map(e => ({ campo: e.campo, texto: e.texto, opciones: e.lista.map(([clave, texto]) => ({ clave, texto })) })),
  estilosMenu: Object.entries(BARRAS).map(([clave, b]) => ({ clave, nombre: b.nombre, texto: b.texto })),
  tamanosNombre: TAMANOS_NOMBRE.map(([clave, texto]) => ({ clave, texto })),
  tipografias: TIPOGRAFIAS.map(t => ({ id: t.id, nombre: t.nombre, estilo: t.estilo })),
  rolesColor: ROLES_COLOR_IA,
  // Las cartas de muestra que puede llevar el menú de la miniweb (vacío si ninguna encaja o el negocio no tiene carta)
  cartas: cartas.map(c => ({ clave: c.slug, para: DISENOS_CARTA[c.slug]?.para ?? 'Negocios de belleza: servicios y precios.', estilo: DISENOS_CARTA[c.slug]?.estilo ?? c.diseno })),
})

const HEX = /^#[0-9a-f]{6}$/i

// Lo que devuelve la IA, comprobado contra las listas: solo pasa lo que existe (lo demás se ignora, no rompe nada)
export function validarDiseno(res) {
  const portada = PORTADAS_IA.find(p => p.clave === res.portada)
  const sub = portada?.lista.find(s => s.clave === res.subdiseno)
  const estructura = {}
  for (const e of ESTRUCTURA_IA) if (e.lista.some(([clave]) => clave === res[e.campo])) estructura[e.campo] = res[e.campo]
  return {
    nombre: String(res.nombre ?? '').replace(/—/g, ',').trim().slice(0, 40),
    tema: PLANTILLAS.some(p => p.clave === res.tema) ? res.tema : null,
    portada: portada?.clave ?? null,
    subdiseno: sub ? { campo: portada.campo, valor: sub.clave } : null,
    estructura: { ...estructura, redesVinculadas: res.redesVinculadas === true },
    estiloMenu: res.estiloMenu in BARRAS ? res.estiloMenu : null,
    carta: cartas.some(c => c.slug === res.carta) ? res.carta : '',
    tamanoNombre: TAMANOS_NOMBRE.some(([clave]) => clave === res.tamanoNombre) ? res.tamanoNombre : null,
    tipografia: TIPOGRAFIAS.some(t => t.id === res.tipografia) ? res.tipografia : null,
    colores: Object.fromEntries(['principal', 'acento', 'texto', 'fondo'].map(k => [k, HEX.test(res.colores?.[k] ?? '') ? res.colores[k] : null])),
    roles: Object.fromEntries((res.roles ?? []).filter(r => CLAVES_COLORES_MINIWEB.includes(r.rol) && HEX.test(r.color)).map(r => [r.rol, r.color])),
    resumen: String(res.resumen ?? '').replace(/—/g, ','),
  }
}
