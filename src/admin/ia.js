import { supabase } from '../lib/supabase'
import { ALERGENOS, fotoDe, marcaDe } from '../cartas'
import { TIPOGRAFIAS } from '../asistente/tipografias'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { avisarElegida, llamar } from './comun'
import { camposDe, esColor, leerRuta, maxCampo } from './datos'

/* Lo que el asistente de IA lee y escribe: los campos que se le pasan, sus cambios ya validados y los perfiles de carta. */

export const camposParaIA = datos =>
  camposDe(datos).map(c => {
    const valor = c.clase === 'foto' ? '' : leerRuta(datos, c.ruta)
    return { ...c, valor, ...(c.clase === 'texto' || c.clase === 'largo' ? { max: maxCampo(c.ruta, valor, datos) } : {}) }
  })

// Si un texto se pasa de su máximo, se corta en la última palabra que cabe (sin puntos suspensivos)
const recortar = (texto, max) => {
  if (!max || texto.length <= max) return texto
  const corte = texto.slice(0, max + 1).lastIndexOf(' ')
  return (corte > max * 0.6 ? texto.slice(0, corte) : texto.slice(0, max)).replace(/[\s,;:]+$/, '')
}

// Por si acaso: ningún guion largo llega a la página, aunque la IA se lo salte
export const sinGuionLargo = texto => texto.replace(/\s*—\s*/g, ', ')

// Primera foto de Unsplash para una búsqueda (o null). Se avisa a Unsplash de que se ha elegido.
const primeraFoto = (busqueda, orientacion) =>
  llamar('buscar-fotos', { texto: busqueda, orientacion })
    .then(d => {
      const foto = d.fotos?.[0]
      if (foto) avisarElegida(foto)
      return foto?.url ?? null
    })
    .catch(() => null)

/* Junta cambios nuevos con los que ya había. Si un cambio nuevo sustituye un bloque entero (las secciones de la
   carta, el menú del día, la marca), los cambios sueltos de dentro de ese bloque ya no valen y se quitan.
   Cada cambio nuevo va al final, para que se aplique después de los anteriores. */
export const fusionar = (cambios, nuevos) => {
  const r = { ...cambios }
  for (const k of Object.keys(nuevos)) {
    for (const k2 of Object.keys(r)) if (k2.startsWith(`${k}.`)) delete r[k2]
    delete r[k]
  }
  return { ...r, ...nuevos }
}

// Una carta con marca propia (las copias de cartas) guarda la tipografía dentro de la marca
export const rutaTipografia = datos => (datos?.marca ? 'marca.theme.fonts' : 'theme.fonts')

/* Convierte la respuesta de la IA en cambios del editor, comprobando cada uno: solo rutas que existen en la
   página, colores bien escritos, tipografías de la lista, alérgenos de los 14 oficiales. Las fotos se buscan en
   Unsplash y se pone la primera. actual: los datos de la página tal como están ahora. */
export async function cambiosDeIA(resultado, campos, actual) {
  const porRuta = new Map(campos.map(c => [c.ruta, c]))
  const esCarta = Array.isArray(actual?.secciones)
  const orientacion = esCarta ? 'portrait' : undefined
  const cambios = {}

  // Carta: secciones y menú del día enteros, cuando la IA los rehace (crear la carta, añadir o quitar platos)
  const secciones = esCarta && resultado.secciones?.length ? resultado.secciones.slice(0, 10) : null
  const menu = esCarta && resultado.menu?.grupos?.length ? resultado.menu : null
  if (secciones) {
    // Diseños polaroid y galería: una foto por plato, cuadrada; en los demás, una por sección (en vertical)
    const porPlato = ['polaroid', 'galeria'].includes(actual.diseno)
    const fotos = await Promise.all(secciones.map(s => (!porPlato && s.busquedaFoto?.trim() ? primeraFoto(s.busquedaFoto, orientacion) : null)))
    const fotosPlatos = porPlato
      ? await Promise.all(secciones.map(s => Promise.all((s.platos ?? []).slice(0, 20).map(p => (p.busquedaFoto?.trim() ? primeraFoto(p.busquedaFoto, 'square') : null)))))
      : []
    const todosLosPlatos = actual.secciones.flatMap(s => s.platos)
    cambios.secciones = secciones.map((s, i) => {
      // Si no hay foto nueva, la que tenía esa sección (por nombre o por posición)
      const previa = actual.secciones.find(p => p.nombre === s.nombre) ?? actual.secciones[i] ?? actual.secciones[0]
      return {
        nombre: sinGuionLargo(s.nombre),
        foto: fotos[i] ?? previa?.foto,
        platos: (s.platos ?? []).slice(0, 20).map((p, j) => {
          // La foto del plato: la nueva o la que tenía un plato con el mismo nombre
          const fotoPlato = fotosPlatos[i]?.[j] ?? todosLosPlatos.find(x => x.nombre === p.nombre)?.foto
          return {
            nombre: sinGuionLargo(p.nombre),
            descripcion: sinGuionLargo(p.descripcion ?? ''),
            precio: p.precio,
            alergenos: (p.alergenos ?? []).filter(a => ALERGENOS[a]),
            ...(fotoPlato ? { foto: fotoPlato } : {}),
          }
        }),
      }
    })
  }
  if (menu) {
    const foto = menu.busquedaFoto?.trim() ? await primeraFoto(menu.busquedaFoto, orientacion) : null
    cambios.menuDia = {
      ...actual.menuDia,
      titulo: sinGuionLargo(menu.titulo || actual.menuDia?.titulo || 'Menú del día'),
      cuando: sinGuionLargo(menu.cuando ?? ''),
      precio: menu.precio,
      incluye: sinGuionLargo(menu.incluye ?? ''),
      // Como en el panel del dueño: como mucho 5 grupos de 6 platos
      grupos: menu.grupos.slice(0, 5).map(g => ({ nombre: sinGuionLargo(g.nombre), platos: g.platos.slice(0, 6).map(sinGuionLargo) })),
      ...(foto ? { foto } : {}),
    }
  }

  for (const { ruta, valor } of resultado.cambios ?? []) {
    const campo = porRuta.get(ruta)
    if (!campo || campo.clase === 'foto' || typeof valor !== 'string') continue
    // Si la IA ha rehecho el bloque entero, sus cambios sueltos de dentro no valen
    if ((secciones && ruta.startsWith('secciones.')) || (menu && ruta.startsWith('menuDia.'))) continue
    if (campo.clase === 'color') {
      if (esColor(valor.trim())) cambios[ruta] = valor.trim().toUpperCase()
      continue
    }
    // Nunca más largo de lo que cabe en ese sitio del diseño
    cambios[ruta] = recortar(sinGuionLargo(valor), campo.max)
  }

  const tipografia = TIPOGRAFIAS.find(t => t.id === resultado.tipografia)
  if (tipografia) cambios[rutaTipografia(actual)] = tipografia.fonts

  const fotos = (resultado.fotos ?? []).filter(
    f => porRuta.get(f.ruta)?.clase === 'foto' && f.busqueda?.trim() && !(secciones && f.ruta.startsWith('secciones.')),
  )
  const encontradas = await Promise.all(fotos.map(f => primeraFoto(f.busqueda, orientacion)))
  fotos.forEach((f, i) => {
    if (encontradas[i]) cambios[f.ruta] = encontradas[i]
  })
  return cambios
}

/* Piezas de las fichas que la IA puede elegir: los diseños de arriba que van por piezas y los estilos de
   pestañas. Salen solos de heros/index.js (piezas: true) y de fichas/barras.jsx: cada hero que se convierta
   aparece aquí sin tocar nada más */
export const piezasParaIA = () => ({
  disenos: Object.entries(HEROS)
    .filter(([, h]) => h.piezas && !h.paginaCompleta)
    .map(([clave, h]) => ({ clave, nombre: h.nombre, texto: h.texto })),
  barras: Object.entries(BARRAS).map(([clave, b]) => ({ clave, nombre: b.nombre, texto: b.texto })),
})

// Lo que eligió la IA de piezas, comprobado: solo diseños por piezas y barras que existen ('' = no cambiar)
export function piezasDeIA(resultado, actual) {
  const cambios = {}
  if (!actual?.hero) return cambios
  const diseno = HEROS[resultado.diseno]?.piezas && !HEROS[resultado.diseno].paginaCompleta ? resultado.diseno : null
  if (diseno && diseno !== actual.hero.diseno) cambios['hero.diseno'] = diseno
  // La barra solo vale en un diseño por piezas (el nuevo o el que ya tenía)
  if (BARRAS[resultado.barra] && HEROS[diseno ?? actual.hero.diseno]?.piezas) cambios['hero.barra'] = resultado.barra
  return cambios
}

// Lo que la IA necesita ver de una carta para rehacerla: sus secciones y su menú del día, sin fotos
export const estructuraCarta = carta =>
  Array.isArray(carta?.secciones)
    ? {
        menu: carta.menuDia ? { titulo: carta.menuDia.titulo, cuando: carta.menuDia.cuando, precio: carta.menuDia.precio, incluye: carta.menuDia.incluye, grupos: carta.menuDia.grupos } : null,
        // El diseño, para que la IA sepa si van fotos por plato (polaroid); los platos, sin los enlaces de sus fotos
        diseno: carta.diseno,
        secciones: carta.secciones.map(s => ({ nombre: s.nombre, platos: s.platos.map(({ foto, ...p }) => ({ ...p, conFoto: Boolean(foto) })) })),
      }
    : null

// Marca propia de una copia de carta, sacada de la marca de la carta de la que sale
const marcaInicial = carta => {
  const m = marcaDe(carta)
  return { nombre: m?.nombre ?? '', lema: m?.lema ?? '', sector: m?.sector ?? '', theme: structuredClone(m?.theme ?? {}) }
}

// Cambios con los que nace una copia de carta: sin negocio (lleva su marca) y con su propia foto de arriba
export const inicioCopiaCarta = carta => ({ negocio: null, marca: marcaInicial(carta), foto: carta.foto ?? fotoDe(marcaDe(carta)) })

// El menú del día tal como lo guarda el panel del dueño (tabla cartas): sin la foto ni el texto de la pestaña
export const menuDelPanel = m => (m ? { titulo: m.titulo, cuando: m.cuando ?? '', precio: m.precio ?? '', incluye: m.incluye ?? '', grupos: m.grupos ?? [] } : null)

/* Una carta nueva nace como la de Ají Limón: con su fila en la tabla cartas y un dueño (de momento, quien la crea;
   al venderla se pasa a la cuenta del restaurante). Así el dueño cambia su menú del día desde /mi-carta. */
export async function crearCartaConDueno(slug, menuDia) {
  const { data } = await supabase.auth.getUser()
  const { error } = await supabase.from('cartas').insert({ slug, dueno: data.user.id, menu_dia: menuDelPanel(menuDia), hay_menu: true })
  // Si ya existe (por ejemplo, de una copia anterior con la misma dirección), se deja como está
  if (error && error.code !== '23505') throw new Error('Se ha creado la carta, pero no su panel del menú del día.')
}

// Perfiles del asistente: qué tipo de página crea. La IA solo elige entre los diseños de ese tipo.
export const PERFILES = [
  { id: 'ficha', texto: 'Ficha', ejemplo: 'Una ficha para una peluquería en Gràcia que se llama Ranita. Colores rosa palo y negro. Cita por WhatsApp al 612 345 678.' },
  { id: 'miniweb', texto: 'Miniweb', ejemplo: 'Una miniweb para un restaurante mexicano en Sants que se llama Nopal. Colores verde y rosa. Menú del día a 13,50 € y reservas por WhatsApp al 612 345 678.' },
  {
    id: 'carta',
    texto: 'Carta',
    ejemplo:
      'Carta para una taberna gallega en Poblenou que se llama O Lar. Colores verde oscuro y crema. Pulpo a feira 16 €, zamburiñas 14 €, raxo con patatas 12 €, tarta de Santiago 5,50 €. Menú del día a 14,90 € con pan, bebida y postre.',
  },
]
