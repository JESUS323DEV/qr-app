import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Camera, Copy, Search, Sparkles, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { aplicar } from '../lib/ediciones'
import { getNegocio, negocios, rutaNegocio } from '../negocios'
import { ALERGENOS, cartas, fotoDe, getCarta, marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Entrar, Etiqueta, usePaginaPrivada } from '../components/panel'
import { loadFont } from '../lib/applyTheme'
import { TIPOGRAFIAS, parejaDe } from '../asistente/tipografias'
import { DISENOS_ASISTENTE, DISENOS_CARTA } from '../asistente/disenos'
import { PLANTILLAS } from '../plantillas'
import Movil from '../components/Movil'
import { pestanasDeMiniweb } from '../lib/miniweb'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { FAMILIAS } from '../familias'

/* Panel de Jesús (/admin): cambiar textos, fotos y colores de cualquier ficha, miniweb o carta desde el móvil,
   sin tocar código, y duplicar una demo para adaptarla en segundos al negocio que tiene delante.
   Los cambios se guardan en Supabase (tabla ediciones) por encima de los archivos; los permisos de Supabase
   hacen que solo un administrador (tabla admins) pueda guardarlos. El diseño y la estructura siguen en el código. */

// Direcciones que no puede usar una copia: las de las páginas de la web
const RESERVADAS = new Set(['demo', 'tematicas', 'gestion', 'catalogo', 'planes', 'panel', 'mi-carta', 'admin', 'miniweb', 'disenos'])

// "Peluquería Ranita" → "peluqueria-ranita"
const aSlug = texto =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Reduce la foto en el propio móvil antes de subirla (lado largo de 1600 px, JPEG): sube rápido y pesa poco
const reducirFoto = archivo =>
  new Promise((resolver, rechazar) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const escala = Math.min(1, 1600 / Math.max(img.width, img.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      lienzo.toBlob(b => (b ? resolver(b) : rechazar(new Error('No se ha podido preparar la foto'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No se ha podido abrir la foto'))
    }
    img.src = url
  })

/* ---------- Qué se puede editar de cada archivo ---------- */

// Datos que no se tocan desde aquí: estructura, diseño, direcciones internas, tipografías...
// (barra es el estilo de pestañas: se elige en el bloque Diseño, con su selector)
const SALTAR = new Set(['slug', 'demo', 'copia', 'diseno', 'barra', 'portada', 'perfil', 'tipo', 'platform', 'tematica', 'sector', 'negocio', 'google', 'family', 'idiomas', 'alergenos', 'alt'])

const CLAVES_FOTO = new Set(['src', 'foto', 'fotos', 'imagen', 'img', 'logo', 'poster', 'captura'])
const esColor = v => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)
const esFoto = (clave, v) =>
  CLAVES_FOTO.has(clave) || /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(v) || v.includes('images.pexels.com') || v.includes('images.unsplash.com') || v.startsWith('data:image')

// Nombres en castellano de los datos más habituales
const NOMBRES = {
  nombre: 'Nombre', lema: 'Lema', titulo: 'Título', destacado: 'Título destacado', titular: 'Titular', texto: 'Texto',
  descripcion: 'Descripción', boton: 'Botón', url: 'Enlace', href: 'Enlace', telefono: 'Teléfono', whatsapp: 'WhatsApp',
  direccion: 'Dirección', mapa: 'Dirección del mapa', zona: 'Zona', foto: 'Foto', fotos: 'Fotos', src: 'Foto', precio: 'Precio',
  dias: 'Días', horas: 'Horas', color: 'Color', fondo: 'Fondo', card: 'Tarjeta', cuando: 'Cuándo', incluye: 'Incluye',
  bg: 'Fondo', surface: 'Superficie', primary: 'Principal', accent: 'Acento', text: 'Texto', muted: 'Texto suave',
  pestanas: 'Pestaña', secciones: 'Sección', platos: 'Plato', lineas: 'Línea', redes: 'Red', carrusel: 'Tarjeta',
  extras: 'Botón', esmaltes: 'Esmalte', colors: 'Colores', redesTexto: 'Texto de redes',
}
const GRUPOS = {
  theme: 'Colores de la marca', hero: 'Hero y pestañas', resena: 'Reseña de Google', destacada: 'Tarjeta destacada',
  cuerpo: 'Colores del cuerpo', redes: 'Redes', carrusel: 'Carrusel', extras: 'Botones extra', galeriaVideos: 'Vídeos',
  menuDia: 'Menú del día', secciones: 'Secciones de la carta', marca: 'Marca',
}
const nombreDato = clave => NOMBRES[clave] ?? clave.charAt(0).toUpperCase() + clave.slice(1)

// Nombre de un elemento de una lista (una pestaña, un plato...) para la etiqueta del campo
const nombreElemento = (lista, i) => {
  const e = lista[i]
  const propio = e && typeof e === 'object' ? e.texto ?? e.nombre ?? e.titulo ?? e.platform ?? e.dias : null
  return typeof propio === 'string' && propio ? propio : `${i + 1}`
}

// Recorre los datos y devuelve cada dato editable: { ruta, clase: 'texto' | 'largo' | 'color' | 'foto', grupo, etiqueta }
function camposDe(datos) {
  const campos = []
  const visitar = (valor, ruta, etiqueta) => {
    const clave = ruta.at(-1)
    if (SALTAR.has(clave)) return
    // Del menú del día solo la foto: lo demás lo cambia el dueño desde su panel (/mi-carta)
    if (ruta[0] === 'menuDia' && typeof valor === 'string' && clave !== 'foto') return
    if (typeof valor === 'string') {
      // La clave del dato es la de la lista si está dentro de una (fotos: ['...'])
      const claveReal = /^\d+$/.test(clave) ? ruta.at(-2) : clave
      const clase = esColor(valor) ? 'color' : esFoto(claveReal, valor) ? 'foto' : valor.length > 60 || valor.includes('\n') ? 'largo' : 'texto'
      const grupo = ruta.length === 1 ? 'Datos' : GRUPOS[ruta[0]] ?? nombreDato(ruta[0])
      campos.push({ ruta: ruta.join('.'), clase, grupo, etiqueta: etiqueta.join(' · ') })
      return
    }
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => {
        const nombre = `${nombreDato(clave)} ${nombreElemento(valor, i)}`
        visitar(v, [...ruta, String(i)], [...etiqueta, nombre])
      })
      return
    }
    if (valor && typeof valor === 'object') {
      // Los datos sueltos llevan su nombre en la etiqueta ("Pestaña Inicio · Título"); los bloques no
      // (el primer nivel ya es el grupo y las listas ponen el nombre de cada elemento)
      for (const [k, v] of Object.entries(valor)) {
        visitar(v, [...ruta, k], typeof v === 'string' ? [...etiqueta, nombreDato(k)] : etiqueta)
      }
    }
  }
  visitar(datos, [], [])
  return campos
}

const leerRuta = (datos, ruta) => ruta.split('.').reduce((n, p) => n?.[p], datos)

/* ---------- Cómo se enseñan los campos en el editor ---------- */

// Etiquetas en lenguaje normal (las de camposDe son para la IA)
const ETIQUETAS = {
  titulo: 'Titular', titular: 'Titular', destacado: 'Segunda línea del titular', brillo: 'Segunda línea del titular',
  texto: 'Texto', boton: 'Texto del botón', url: 'Enlace del botón', href: 'Enlace', mapa: 'Dirección para el mapa',
  direccion: 'Dirección que se ve', telefono: 'Teléfono', texto_telefono: 'Texto antes del teléfono', texto_encargo: 'Texto',
  etiqueta: 'Nombre', plato: 'Nombre', frase: 'Frase', alt: 'Descripción de la foto (para buscadores)',
  dias: 'Días', horas: 'Horas', nombre: 'Nombre', descripcion: 'Descripción', precio: 'Precio', foto: 'Foto', src: 'Foto',
  lema: 'Lema', profesion: 'Profesión', franja: 'Franja de arriba',
}
// Nombre de cada elemento de una lista, para el título de su tarjeta
const ELEMENTO = {
  fotos: 'Foto', opciones: 'Foto', platos: 'Plato', lineas: 'Línea', servicios: 'Servicio', esmaltes: 'Esmalte', redes: 'Red',
  carrusel: 'Tarjeta', extras: 'Botón', grupos: 'Grupo', secciones: 'Sección', titular: 'Línea',
}
// Datos técnicos: se tocan poco, van plegados en "Más opciones"
const TECNICOS = new Set(['url', 'href', 'mapa', 'alt'])

const esIndice = p => /^\d+$/.test(p)
const etiquetaDe = (clave, enPestana) => (enPestana && clave === 'texto' ? 'Nombre en la barra' : ETIQUETAS[clave] ?? nombreDato(clave))

/* Ordena los campos para el editor: un bloque por cosa (datos, arriba, colores, cada pestaña, cada sección de la
   carta...), y dentro de cada bloque los campos sueltos, las tarjetas (cada foto, cada plato... con todos sus datos
   juntos) y lo técnico aparte. orden: dónde va el bloque (más arriba lo que más se toca) */
function organizar(datos, campos) {
  const bloques = new Map()
  const bloque = (clave, titulo, orden) => {
    if (!bloques.has(clave)) bloques.set(clave, { clave, titulo, orden, sueltos: [], tarjetas: new Map(), tecnicos: [] })
    return bloques.get(clave)
  }

  for (const c of campos) {
    const partes = c.ruta.split('.')
    let b
    let resto
    let enPestana = false
    if (partes[0] === 'hero' && partes[1] === 'pestanas' && esIndice(partes[2])) {
      const p = datos.hero.pestanas[Number(partes[2])]
      b = bloque(`pestana-${partes[2]}`, `Pestaña ${p?.texto ?? Number(partes[2]) + 1}`, 50 + Number(partes[2]))
      resto = partes.slice(3)
      enPestana = true
    } else if (partes[0] === 'hero') {
      b = bloque('arriba', 'Arriba', 10)
      resto = partes.slice(1)
    } else if (partes[0] === 'secciones' && esIndice(partes[1])) {
      b = bloque(`seccion-${partes[1]}`, `Sección ${datos.secciones[Number(partes[1])]?.nombre ?? Number(partes[1]) + 1}`, 50 + Number(partes[1]))
      resto = partes.slice(2)
    } else if ((partes[0] === 'marca' && partes[1] === 'theme') || partes[0] === 'theme') {
      b = bloque('colores', 'Colores de la marca', 30)
      resto = partes.slice(partes[0] === 'marca' ? 3 : 2)
    } else if (partes.length === 1 || partes[0] === 'marca') {
      b = bloque('datos', 'Datos', 0)
      resto = partes.slice(partes[0] === 'marca' ? 1 : 0)
    } else {
      b = bloque(partes[0], GRUPOS[partes[0]] ?? nombreDato(partes[0]), partes[0] === 'menuDia' ? 40 : 70)
      resto = partes.slice(1)
    }

    const tecnico = TECNICOS.has(partes.at(-1))
    // ¿Es parte de un elemento de una lista (una foto, un plato...)? Entonces va en su tarjeta
    const j = resto.findIndex((p, k) => k > 0 && esIndice(p))
    if (j > 0) {
      const lista = resto[j - 1]
      const n = Number(resto[j])
      const prefijo = partes.slice(0, partes.length - resto.length + j + 1).join('.')
      const elemento = leerRuta(datos, prefijo)
      const propio = elemento && typeof elemento === 'object' ? elemento.etiqueta ?? elemento.plato ?? elemento.nombre ?? elemento.dias ?? elemento.platform : null
      const titulo = `${ELEMENTO[lista] ?? nombreDato(lista)} ${n + 1}${propio ? ` · ${propio}` : ''}`
      const etiqueta = resto.length > j + 1 ? etiquetaDe(resto.at(-1), false) : ELEMENTO[lista] ?? nombreDato(lista)
      if (tecnico) {
        b.tecnicos.push({ ...c, etiqueta: `${titulo} · ${etiqueta}` })
      } else {
        if (!b.tarjetas.has(prefijo)) b.tarjetas.set(prefijo, { clave: prefijo, titulo, campos: [] })
        b.tarjetas.get(prefijo).campos.push({ ...c, etiqueta })
      }
      continue
    }

    const etiqueta = resto.length ? resto.filter(p => !esIndice(p)).map((p, k, todos) => (k === todos.length - 1 ? etiquetaDe(p, enPestana && todos.length === 1) : nombreDato(p))).join(' · ') : c.etiqueta
    ;(tecnico ? b.tecnicos : b.sueltos).push({ ...c, etiqueta })
  }

  return [...bloques.values()]
    .map(b => ({
      ...b,
      // En cada tarjeta, la foto primero
      tarjetas: [...b.tarjetas.values()].map(t => ({ ...t, campos: [...t.campos].sort((x, y) => (y.clase === 'foto') - (x.clase === 'foto')) })),
    }))
    .sort((a, b) => a.orden - b.orden)
}

/* ---------- Asistente con IA ---------- */

// Llama a una función de Supabase y, si falla, lanza su mensaje de error (o uno genérico)
async function llamar(funcion, cuerpo) {
  const { data, error } = await supabase.functions.invoke(funcion, { body: cuerpo })
  if (error) {
    let mensaje = 'No ha funcionado. Prueba otra vez.'
    try {
      mensaje = (await error.context.json()).error ?? mensaje
    } catch {
      // Sin mensaje propio: se queda el genérico
    }
    throw new Error(mensaje)
  }
  return data
}

// Los campos editables con su valor actual, como se los pasa el panel a la IA (las fotos sin su enlace)
const camposParaIA = datos => camposDe(datos).map(c => ({ ...c, valor: c.clase === 'foto' ? '' : leerRuta(datos, c.ruta) }))

// Por si acaso: ningún guion largo llega a la página, aunque la IA se lo salte
const sinGuionLargo = texto => texto.replace(/\s*—\s*/g, ', ')

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
const fusionar = (cambios, nuevos) => {
  const r = { ...cambios }
  for (const k of Object.keys(nuevos)) {
    for (const k2 of Object.keys(r)) if (k2.startsWith(`${k}.`)) delete r[k2]
    delete r[k]
  }
  return { ...r, ...nuevos }
}

// Una carta con marca propia (las copias de cartas) guarda la tipografía dentro de la marca
const rutaTipografia = datos => (datos?.marca ? 'marca.theme.fonts' : 'theme.fonts')

/* Convierte la respuesta de la IA en cambios del editor, comprobando cada uno: solo rutas que existen en la
   página, colores bien escritos, tipografías de la lista, alérgenos de los 14 oficiales. Las fotos se buscan en
   Unsplash y se pone la primera. actual: los datos de la página tal como están ahora. */
async function cambiosDeIA(resultado, campos, actual) {
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
    cambios[ruta] = sinGuionLargo(valor)
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
const piezasParaIA = () => ({
  disenos: Object.entries(HEROS)
    .filter(([, h]) => h.piezas && !h.paginaCompleta)
    .map(([clave, h]) => ({ clave, nombre: h.nombre, texto: h.texto })),
  barras: Object.entries(BARRAS).map(([clave, b]) => ({ clave, nombre: b.nombre, texto: b.texto })),
})

// Lo que eligió la IA de piezas, comprobado: solo diseños por piezas y barras que existen ('' = no cambiar)
function piezasDeIA(resultado, actual) {
  const cambios = {}
  if (!actual?.hero) return cambios
  const diseno = HEROS[resultado.diseno]?.piezas && !HEROS[resultado.diseno].paginaCompleta ? resultado.diseno : null
  if (diseno && diseno !== actual.hero.diseno) cambios['hero.diseno'] = diseno
  // La barra solo vale en un diseño por piezas (el nuevo o el que ya tenía)
  if (BARRAS[resultado.barra] && HEROS[diseno ?? actual.hero.diseno]?.piezas) cambios['hero.barra'] = resultado.barra
  return cambios
}

// Lo que la IA necesita ver de una carta para rehacerla: sus secciones y su menú del día, sin fotos
const estructuraCarta = carta =>
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
const inicioCopiaCarta = carta => ({ negocio: null, marca: marcaInicial(carta), foto: carta.foto ?? fotoDe(marcaDe(carta)) })

// El menú del día tal como lo guarda el panel del dueño (tabla cartas): sin la foto ni el texto de la pestaña
const menuDelPanel = m => (m ? { titulo: m.titulo, cuando: m.cuando ?? '', precio: m.precio ?? '', incluye: m.incluye ?? '', grupos: m.grupos ?? [] } : null)

/* Una carta nueva nace como la de Ají Limón: con su fila en la tabla cartas y un dueño (de momento, quien la crea;
   al venderla se pasa a la cuenta del restaurante). Así el dueño cambia su menú del día desde /mi-carta. */
async function crearCartaConDueno(slug, menuDia) {
  const { data } = await supabase.auth.getUser()
  const { error } = await supabase.from('cartas').insert({ slug, dueno: data.user.id, menu_dia: menuDelPanel(menuDia), hay_menu: true })
  // Si ya existe (por ejemplo, de una copia anterior con la misma dirección), se deja como está
  if (error && error.code !== '23505') throw new Error('Se ha creado la carta, pero no su panel del menú del día.')
}

// Perfiles del asistente: qué tipo de página crea. La IA solo elige entre los diseños de ese tipo.
const PERFILES = [
  { id: 'ficha', texto: 'Ficha', ejemplo: 'Una ficha para una peluquería en Gràcia que se llama Ranita. Colores rosa palo y negro. Cita por WhatsApp al 612 345 678.' },
  { id: 'miniweb', texto: 'Miniweb', ejemplo: 'Una miniweb para un restaurante mexicano en Sants que se llama Nopal. Colores verde y rosa. Menú del día a 13,50 € y reservas por WhatsApp al 612 345 678.' },
  {
    id: 'carta',
    texto: 'Carta',
    ejemplo:
      'Carta para una taberna gallega en Poblenou que se llama O Lar. Colores verde oscuro y crema. Pulpo a feira 16 €, zamburiñas 14 €, raxo con patatas 12 €, tarta de Santiago 5,50 €. Menú del día a 14,90 € con pan, bebida y postre.',
  },
]

// Pantalla para crear una ficha o miniweb nueva con el asistente: se elige el tipo, se escribe qué negocio es y lo monta
function CrearConAsistente({ filas, volver, recargar, abrir }) {
  const [perfil, setPerfil] = useState('ficha')
  const [peticion, setPeticion] = useState('')
  const [paso, setPaso] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const crear = async e => {
    e.preventDefault()
    if (!peticion.trim() || paso) return
    setError('')
    setMotivo('')
    try {
      const esCarta = perfil === 'carta'
      const tipoFila = esCarta ? 'carta' : 'negocio'
      const fichas = esCarta ? DISENOS_CARTA : DISENOS_ASISTENTE

      // 1. Elegir la demo de la que parte, solo entre las de este tipo (si solo hay una, esa, sin preguntar a la IA)
      setPaso('Eligiendo el diseño...')
      const disenos = esCarta
        ? Object.entries(DISENOS_CARTA)
            .filter(([s]) => getCarta(s))
            .map(([s, ficha]) => ({ slug: s, nombre: marcaDe(getCarta(s))?.nombre ?? s, sector: `carta ${getCarta(s).diseno}`, ...ficha }))
        : Object.entries(DISENOS_ASISTENTE)
            .filter(([s]) => getNegocio(s) && tipoDe(getNegocio(s)) === perfil)
            .map(([s, ficha]) => ({ slug: s, nombre: getNegocio(s).nombre, sector: getNegocio(s).sector, ...ficha }))
      if (disenos.length === 0) throw new Error('Todavía no hay diseños de este tipo.')
      const eleccion =
        disenos.length === 1
          ? { base: disenos[0].slug, motivo: '' }
          : (await llamar('asistente', { paso: 'elegir', peticion, perfil, disenos })).resultado
      const elegido = disenos.find(d => d.slug === eleccion.base)
      if (!elegido) throw new Error('El asistente no ha elegido un diseño válido. Prueba otra vez.')
      setMotivo(`Parte de ${elegido.nombre}.${eleccion.motivo ? ` ${eleccion.motivo}` : ''}`)

      // 2. Textos, colores, tipografía, búsquedas de fotos y, en las cartas, secciones, platos y menú del día.
      // Una carta nueva nace con su propia marca (copia de la de la demo), que la IA adapta
      setPaso(esCarta ? 'Escribiendo la carta...' : 'Escribiendo textos y eligiendo colores...')
      const plantilla = esCarta ? getCarta(eleccion.base) : getNegocio(eleccion.base)
      const inicio = esCarta ? inicioCopiaCarta(plantilla) : {}
      const preparada = aplicar(plantilla, inicio)
      const campos = camposParaIA(preparada)
      const { resultado } = await llamar('asistente', {
        paso: 'rellenar',
        peticion,
        perfil,
        demo: { slug: eleccion.base, nombre: elegido.nombre, sector: elegido.sector, estilo: fichas[eleccion.base].estilo },
        campos,
        carta: estructuraCarta(preparada),
        alergenos: Object.keys(ALERGENOS),
        tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
        // En las fichas, también el aspecto: el diseño de arriba y el estilo de pestañas
        ...(perfil === 'ficha' ? { piezas: piezasParaIA(), disenoActual: plantilla.hero?.diseno } : {}),
      })

      // 3. Fotos de Unsplash
      setPaso('Buscando fotos...')
      const cambios = fusionar(inicio, { ...(await cambiosDeIA(resultado, campos, preparada)), ...(perfil === 'ficha' ? piezasDeIA(resultado, preparada) : {}) })

      // 4. La copia, en una dirección libre (si ya existe, se le añade un número)
      setPaso('Creando...')
      const ocupadas = new Set([
        ...(filas ?? []).filter(f => f.tipo === tipoFila).map(f => f.slug),
        ...(esCarta ? cartas : negocios).map(n => n.slug),
        ...RESERVADAS,
      ])
      const nombre = esCarta ? cambios['marca.nombre'] ?? cambios.marca?.nombre : cambios.nombre
      const raiz = aSlug(resultado.slug || nombre || 'nueva') || 'nueva'
      let slug = raiz
      for (let n = 2; ocupadas.has(slug); n++) slug = `${raiz}-${n}`
      const { error } = await supabase
        .from('ediciones')
        .insert({ tipo: tipoFila, slug, base: eleccion.base, cambios, historial: [{ peticion, resumen: sinGuionLargo(resultado.resumen ?? '') }] })
      if (error) throw new Error('No se ha podido guardar.')
      if (esCarta) await crearCartaConDueno(slug, aplicar(plantilla, cambios).menuDia)
      await recargar()
      abrir(`${tipoFila}:${slug}`)
    } catch (e) {
      setError(e.message)
      setPaso(null)
    }
  }

  return (
    <div className="grid gap-[1rem]">
      <button type="button" onClick={volver} className="inline-flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold">
        <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Todas
      </button>
      <div>
        <h1 className="text-[1.5rem] font-bold leading-tight">Crear con el asistente</h1>
        <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-zinc-600">
          Cuéntale qué negocio es. Elige uno de tus diseños, escribe los textos, pone colores, tipografía y fotos, y crea una copia que luego puedes retocar.
        </p>
      </div>
      <form onSubmit={crear} className="grid gap-[0.75rem]">
        {/* Qué tipo de página crea: la IA solo elige entre los diseños de ese tipo */}
        <div role="tablist" aria-label="Tipo de página" className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {PERFILES.map(p => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={perfil === p.id}
              disabled={p.desactivado || Boolean(paso)}
              onClick={() => setPerfil(p.id)}
              className={`rounded-[0.55rem] py-[0.55rem] text-[0.95rem] font-semibold transition-colors disabled:cursor-not-allowed ${
                perfil === p.id ? 'bg-white text-zinc-900 shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'
              } ${p.desactivado ? 'opacity-40' : ''}`}
            >
              {p.texto}
            </button>
          ))}
        </div>
        <p className="text-[0.82rem] text-zinc-500">
          {perfil === 'miniweb'
            ? 'Varias páginas, como una web: inicio, menú, horario y reservas.'
            : perfil === 'carta'
              ? 'Carta digital para el QR de la mesa: menú del día y carta por secciones, con su propia marca. Pásale los platos y precios que tengas.'
              : 'Una pantalla con lo esencial: pestañas, reseña de Google y redes.'}
        </p>
        <textarea
          autoFocus
          value={peticion}
          onChange={e => setPeticion(e.target.value)}
          disabled={Boolean(paso)}
          rows={5}
          placeholder={PERFILES.find(p => p.id === perfil).ejemplo}
          className={`${CAMPO} resize-y`}
        />
        <button type="submit" disabled={!peticion.trim() || Boolean(paso)} className={BOTON}>
          {paso ?? (perfil === 'miniweb' ? 'Crear miniweb' : perfil === 'carta' ? 'Crear carta' : 'Crear ficha')}
        </button>
      </form>
      {motivo && <p className="text-[0.9rem] leading-[1.45] text-zinc-600">{motivo}</p>}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
    </div>
  )
}

// Chat del editor de una copia: lo pedido antes (con lo que hizo el asistente) y el cuadro para pedir un retoque
function Retocar({ historial, enviar }) {
  const [peticion, setPeticion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const mandar = async e => {
    e.preventDefault()
    if (!peticion.trim() || enviando) return
    setEnviando(true)
    setError('')
    try {
      await enviar(peticion.trim())
      setPeticion('')
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
      <h2 className="text-[1rem] font-bold">Asistente</h2>
      {historial.length > 0 && (
        <ol className="mt-[0.6rem] grid max-h-[14rem] gap-[0.6rem] overflow-y-auto">
          {historial.map((h, i) => (
            <li key={i} className="text-[0.88rem] leading-[1.45]">
              <p className="font-semibold">{h.peticion}</p>
              {h.resumen && <p className="text-zinc-600">{h.resumen}</p>}
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={mandar} className="mt-[0.75rem] flex gap-[0.5rem]">
        <input
          value={peticion}
          onChange={e => setPeticion(e.target.value)}
          disabled={enviando}
          placeholder="Más oscuro, lema más corto, otra foto..."
          className={CAMPO}
          enterKeyHint="send"
        />
        <button type="submit" disabled={!peticion.trim() || enviando} className={`${BOTON} shrink-0`}>
          {enviando ? 'Pensando...' : 'Pedir'}
        </button>
      </form>
      {error && <p className="mt-[0.5rem] text-[0.85rem] font-semibold text-red-600">{error}</p>}
    </section>
  )
}

/* ---------- Campos del editor ---------- */

/* Color: una muestra que, al tocarla, abre un selector propio (cuadrado de tono e intensidad y barra de color,
   react-colorful), igual en el móvil que en el ordenador; al lado, el código para escribirlo o pegarlo.
   Se cierra tocando fuera o con Escape. */
function CampoColor({ valor, cambiar }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)
  // El selector solo entiende #rrggbb
  const seis = valor.length === 4 ? `#${[...valor.slice(1)].map(c => c + c).join('')}` : valor.slice(0, 7)

  useEffect(() => {
    if (!abierto) return
    const fuera = e => caja.current && !caja.current.contains(e.target) && setAbierto(false)
    const escape = e => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    window.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      window.removeEventListener('keydown', escape)
    }
  }, [abierto])

  return (
    <div ref={caja} className="relative flex items-center gap-[0.5rem]">
      <button
        type="button"
        aria-label="Elegir color"
        aria-expanded={abierto}
        onClick={() => setAbierto(a => !a)}
        className="h-[2.75rem] w-[3.25rem] shrink-0 rounded-[0.6rem] border border-zinc-300 p-[0.2rem]"
      >
        <span className="block h-full w-full rounded-[0.4rem]" style={{ background: seis }} />
      </button>
      <input value={valor} onChange={e => cambiar(e.target.value)} className={`${CAMPO} font-mono`} spellCheck={false} />
      {abierto && (
        // En el móvil, abajo y a todo el ancho (para que no se salga de la pantalla); en el ordenador, debajo de la muestra
        <div className="fixed inset-x-[1rem] bottom-[1rem] z-50 rounded-[0.9rem] bg-white p-[0.8rem] shadow-[0_0.6rem_1.6rem_-0.4rem_rgb(0_0_0/0.35)] ring-1 ring-zinc-200 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-[calc(100%+0.4rem)] sm:z-30 sm:w-[15rem] sm:p-[0.7rem] [&_.react-colorful]:!h-[13rem] [&_.react-colorful]:!w-full sm:[&_.react-colorful]:!h-[11rem]">
          <HexColorPicker color={seis} onChange={c => cambiar(c.toUpperCase())} />
        </div>
      )}
    </div>
  )
}

// Las normas de Unsplash piden avisarles cuando se elige una foto; si falla, no pasa nada
const avisarElegida = foto => {
  if (foto?.descarga) llamar('buscar-fotos', { accion: 'elegida', descarga: foto.descarga }).catch(() => {})
}

// Hoja para buscar fotos en Unsplash (función buscar-fotos de Supabase) y elegir una tocándola
function BuscarFoto({ sugerencia, orientacion, elegir, cerrar }) {
  const [texto, setTexto] = useState(sugerencia)
  const [fotos, setFotos] = useState([])
  const [pagina, setPagina] = useState(1)
  const [hayMas, setHayMas] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const conEscape = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [cerrar])

  const buscar = async (numero = 1) => {
    if (!texto.trim()) return
    setBuscando(true)
    setError('')
    const { data, error } = await supabase.functions.invoke('buscar-fotos', { body: { texto, pagina: numero, orientacion } })
    setBuscando(false)
    if (error) {
      let mensaje = 'No se ha podido buscar. Prueba otra vez.'
      try {
        mensaje = (await error.context.json()).error ?? mensaje
      } catch {
        // Sin mensaje propio: se queda el genérico
      }
      setError(mensaje)
      return
    }
    setFotos(f => (numero === 1 ? data.fotos : [...f, ...data.fotos]))
    setPagina(numero)
    setHayMas(data.hayMas)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar foto"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[90svh] w-full max-w-[32rem] flex-col rounded-t-[1.25rem] bg-white sm:rounded-[1.25rem]"
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            buscar(1)
          }}
          className="flex gap-[0.5rem] border-b border-zinc-200 p-[1rem]"
        >
          <input autoFocus value={texto} onChange={e => setTexto(e.target.value)} placeholder="Peluquería, ceviche, café..." className={CAMPO} enterKeyHint="search" />
          <button type="submit" disabled={buscando || !texto.trim()} className={`${BOTON} shrink-0`}>Buscar</button>
        </form>

        <div className="min-h-[12rem] overflow-y-auto overscroll-contain p-[1rem]">
          {error && <p className="mb-[0.75rem] text-[0.88rem] font-semibold text-red-600">{error}</p>}
          {fotos.length === 0 ? (
            <p className="text-[0.92rem] text-zinc-500">{buscando ? 'Buscando...' : 'Escribe qué quieres y pulsa Buscar. Mejor en pocas palabras: "barbería", "uñas rosa", "pan de masa madre".'}</p>
          ) : (
            <>
              <ul className="grid grid-cols-3 gap-[0.4rem]">
                {fotos.map(f => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        avisarElegida(f)
                        elegir(f.url)
                      }}
                      className="block w-full overflow-hidden rounded-[0.5rem] bg-zinc-200"
                    >
                      <img src={f.miniatura} alt={f.alt} loading="lazy" className={`w-full object-cover ${orientacion === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`} />
                    </button>
                    {/* Unsplash pide nombrar al fotógrafo */}
                    {f.autor && <p className="mt-[0.15rem] truncate text-[0.68rem] text-zinc-500">{f.autor}</p>}
                  </li>
                ))}
              </ul>
              {hayMas && (
                <button type="button" onClick={() => buscar(pagina + 1)} disabled={buscando} className="mt-[0.75rem] w-full rounded-[0.6rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
                  {buscando ? 'Buscando...' : 'Ver más'}
                </button>
              )}
              <p className="mt-[0.75rem] text-[0.78rem] text-zinc-400">Fotos de Unsplash, gratis para usar.</p>
            </>
          )}
        </div>

        <div className="border-t border-zinc-200 p-[1rem]">
          <button type="button" onClick={cerrar} className="w-full rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function CampoFoto({ valor, cambiar, carpeta, sugerencia, orientacion }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const cerrarBusqueda = useCallback(() => setBuscando(false), [])

  const subir = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setSubiendo(true)
    setError('')
    try {
      const foto = await reducirFoto(archivo)
      const ruta = `${carpeta}/${Date.now()}.jpg`
      const { error } = await supabase.storage.from('fotos').upload(ruta, foto, { contentType: 'image/jpeg' })
      if (error) throw error
      cambiar(supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl)
    } catch {
      setError('No se ha podido subir la foto. Prueba otra vez.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex items-center gap-[0.75rem]">
      <img src={valor} alt="" className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-[0.6rem] bg-zinc-200 object-cover" />
      <div className="grid gap-[0.3rem]">
        <div className="flex flex-wrap gap-[0.4rem]">
          <label className={`inline-flex cursor-pointer items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300 ${subiendo ? 'opacity-50' : ''}`}>
            <Camera className="h-[1rem] w-[1rem]" aria-hidden="true" />
            {subiendo ? 'Subiendo...' : 'Subir'}
            <input type="file" accept="image/*" disabled={subiendo} onChange={subir} className="hidden" />
          </label>
          <button type="button" onClick={() => setBuscando(true)} className="inline-flex items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300">
            <Search className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Buscar
          </button>
        </div>
        {error && <p className="text-[0.82rem] font-semibold text-red-600">{error}</p>}
      </div>
      {buscando && (
        <BuscarFoto
          sugerencia={sugerencia}
          orientacion={orientacion}
          cerrar={cerrarBusqueda}
          elegir={url => {
            cambiar(url)
            setBuscando(false)
          }}
        />
      )}
    </div>
  )
}

// Tipografía de una copia: una de las parejas de la lista cerrada, o la que trae la demo.
// Cada opción se ve con su propia letra.
function ElegirTipografia({ actual, original, elegir }) {
  useEffect(() => {
    for (const t of TIPOGRAFIAS) {
      loadFont(t.fonts.heading.google)
      loadFont(t.fonts.body.google)
    }
    if (original?.heading?.google) loadFont(original.heading.google)
  }, [original])

  const elegida = parejaDe(actual)?.id ?? 'demo'
  const opciones = [
    // La de la demo, si no es ya una de la lista
    ...(parejaDe(original) ? [] : [{ id: 'demo', nombre: 'La de la demo', estilo: original?.heading?.family?.split(',')[0].replaceAll('"', '') ?? '', fonts: original }]),
    ...TIPOGRAFIAS,
  ]

  return (
    <div className="grid gap-[0.5rem]">
      {opciones.map(t => (
        <button
          key={t.id}
          type="button"
          aria-pressed={elegida === t.id}
          onClick={() => elegir(t.id === 'demo' || t.fonts === original ? null : t.fonts)}
          className={`rounded-[0.75rem] px-[0.9rem] py-[0.7rem] text-left ring-1 ${elegida === t.id ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300'}`}
        >
          <span className="block text-[1.35rem] leading-tight" style={{ fontFamily: t.fonts?.heading?.family }}>{t.nombre}</span>
          <span className="mt-[0.15rem] block text-[0.85rem] opacity-75" style={{ fontFamily: t.fonts?.body?.family }}>{t.estilo}</span>
        </button>
      ))}
    </div>
  )
}

/* Un bloque del editor (Datos, Arriba, una pestaña, una sección de la carta...): sus campos sueltos, sus tarjetas
   (cada foto con su nombre, cada plato con su precio...) y lo técnico plegado en "Más opciones" */
function Bloque({ bloque, abierto, campo }) {
  return (
    <details open={abierto} className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">{bloque.titulo}</summary>
      <div className="grid gap-[1rem] px-[1rem] py-[1rem]">
        {bloque.sueltos.map(c => campo(c))}

        {bloque.tarjetas.map(t => (
          <div key={t.clave} className="grid gap-[0.7rem] rounded-[0.8rem] bg-zinc-50 p-[0.8rem] ring-1 ring-zinc-200">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <p className="min-w-0 truncate text-[0.9rem] font-bold">{t.titulo}</p>
              {campo.tarjetaCambiada(t) && (
                <button type="button" onClick={() => campo.volverTarjeta(t)} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                  Volver al original
                </button>
              )}
            </div>
            {t.campos.map(c => campo(c, true))}
          </div>
        ))}

        {bloque.tecnicos.length > 0 && (
          <details className="rounded-[0.8rem] ring-1 ring-zinc-200">
            <summary className="cursor-pointer px-[0.8rem] py-[0.6rem] text-[0.88rem] font-semibold text-zinc-600">Más opciones</summary>
            <div className="grid gap-[0.9rem] px-[0.8rem] pb-[0.8rem] pt-[0.3rem]">{bloque.tecnicos.map(c => campo(c))}</div>
          </details>
        )}
      </div>
    </details>
  )
}

/* Diseño de una página, con una pestaña por producto:
   - Ficha: el diseño de arriba (los heros por piezas, más el que trae) y el estilo de las pestañas. Al cambiar de
     diseño, las pestañas comunes (fotos, horario, contacto, ubicación, precios) se pintan en el nuevo; las propias
     de un diseño (esmaltes, youtube...) solo salen en el suyo.
   - Miniweb: la estructura (de momento, la Clásica de Chalaquita: menú de enlaces arriba, redes debajo, portada
     grande con las reseñas debajo) y el hero de ficha que hace de portada.
   - Carta: el estilo de carta y el perfil (restaurante con menú del día; belleza o tienda con ofertas).
   La ficha (o miniweb) y la carta de un negocio son dos páginas distintas: desde una, la pestaña de la otra lleva a
   su editor. */
const PERFILES_CARTA = [
  { clave: 'restaurante', nombre: 'Restaurante (menú del día)' },
  { clave: 'belleza', nombre: 'Belleza (ofertas y servicios)' },
  { clave: 'tienda', nombre: 'Tienda (ofertas y productos)' },
]

function Diseno({ tipo, slug, vista, original, cambiar, abrir }) {
  const hero = vista.hero
  const miniweb = tipo === 'negocio' && Boolean(HEROS[hero?.diseno]?.paginaCompleta)
  const producto = tipo === 'carta' ? 'carta' : miniweb ? 'miniweb' : 'ficha'
  const portadas = Object.entries(HEROS).filter(([, h]) => h.piezas && !h.paginaCompleta)
  // La otra página del mismo negocio: su carta (desde la ficha) o su ficha (desde la carta)
  const suCarta = tipo === 'negocio' ? cartas.find(c => c.negocio === slug) : null
  const suFicha = tipo === 'carta' ? vista.negocio : null

  // Pasar de ficha a miniweb y al revés: la portada de la miniweb es el diseño de la ficha (si va por piezas)
  const pasarA = destino => {
    if (destino === producto) return
    if (destino === 'carta') return suCarta && abrir(`carta:${suCarta.slug}`)
    if (tipo === 'carta') return suFicha && abrir(`negocio:${suFicha}`)
    if (destino === 'miniweb') {
      // Estructura de Chalaquita: Inicio con la portada, Servicios, Horario con el mapa y Contacto
      cambiar('hero.diseno', 'web')
      cambiar('hero.portada', HEROS[hero.diseno]?.piezas ? hero.diseno : 'galeria')
      cambiar('hero.redesArriba', true)
      cambiar('hero.pestanas', pestanasDeMiniweb(vista))
      cambiar('tipo', 'miniweb')
    } else {
      const disenoOriginal = original.hero?.diseno
      cambiar('hero.diseno', hero.portada ?? (HEROS[disenoOriginal]?.paginaCompleta ? 'galeria' : disenoOriginal))
      cambiar('hero.portada', original.hero?.portada)
      cambiar('hero.redesArriba', original.hero?.redesArriba)
      cambiar('hero.pestanas', original.hero?.pestanas)
      cambiar('tipo', original.tipo === 'miniweb' ? 'ficha' : original.tipo)
    }
  }
  const pestanas = [
    { clave: 'ficha', texto: 'Ficha', vale: tipo === 'negocio' || Boolean(suFicha) },
    { clave: 'miniweb', texto: 'Miniweb', vale: tipo === 'negocio' || Boolean(suFicha) },
    { clave: 'carta', texto: 'Carta', vale: tipo === 'carta' || Boolean(suCarta) },
  ]

  return (
    <details open className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">Diseño</summary>
      <div className="grid gap-[1rem] px-[1rem] py-[1rem]">
        <div role="tablist" aria-label="Producto" className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {pestanas.map(p => (
            <button
              key={p.clave}
              type="button"
              role="tab"
              aria-selected={producto === p.clave}
              disabled={!p.vale}
              onClick={() => pasarA(p.clave)}
              className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 ${producto === p.clave ? 'bg-white text-zinc-900 shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {p.texto}
            </button>
          ))}
        </div>
        {tipo === 'negocio' && !suCarta && <p className="text-[0.82rem] text-zinc-500">Este negocio no tiene carta.</p>}
        {tipo === 'carta' && !suFicha && <p className="text-[0.82rem] text-zinc-500">Esta carta no tiene ficha: lleva su propia marca.</p>}

        {producto === 'ficha' && <DisenoFicha hero={hero} cambiar={cambiar} />}

        {producto === 'miniweb' && (
          <>
            <Etiqueta texto="Estructura">
              <select value="clasica" onChange={() => {}} className={CAMPO}>
                <option value="clasica">Clásica: menú arriba, redes debajo y portada con las reseñas</option>
              </select>
            </Etiqueta>
            <Etiqueta texto="Portada">
              <select value={hero.portada ?? ''} onChange={e => cambiar('hero.portada', e.target.value || undefined)} className={CAMPO}>
                {!hero.portada && <option value="">La suya</option>}
                {portadas.map(([clave, h]) => (
                  <option key={clave} value={clave}>
                    {h.nombre}
                  </option>
                ))}
              </select>
            </Etiqueta>
          </>
        )}

        {producto === 'carta' && (
          <>
            <Etiqueta texto="Estilo de carta">
              <select value={vista.diseno} onChange={e => cambiar('diseno', e.target.value)} className={CAMPO}>
                {Object.values(FAMILIAS)
                  .filter(f => f.carta)
                  .map(f => (
                    <option key={f.carta} value={f.carta}>
                      {f.nombre}
                    </option>
                  ))}
              </select>
            </Etiqueta>
            <Etiqueta texto="Perfil">
              <select
                value={vista.perfil ?? 'restaurante'}
                onChange={e => cambiar('perfil', e.target.value === 'restaurante' && !original.perfil ? undefined : e.target.value)}
                className={CAMPO}
              >
                {PERFILES_CARTA.map(p => (
                  <option key={p.clave} value={p.clave}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Etiqueta>
          </>
        )}
      </div>
    </details>
  )
}

// La pestaña Ficha del bloque Diseño: el diseño de arriba y el estilo de pestañas
function DisenoFicha({ hero, cambiar }) {
  const diseno = hero?.diseno
  const opciones = Object.entries(HEROS).filter(([clave, h]) => (h.piezas || clave === diseno) && !h.paginaCompleta)
  const porPiezas = Boolean(HEROS[diseno]?.piezas)
  const barra = hero?.barra ?? HEROS[diseno]?.barra

  return (
      <>
        <Etiqueta texto="Diseño de arriba">
          <select value={diseno} onChange={e => cambiar('hero.diseno', e.target.value)} className={CAMPO}>
            {opciones.map(([clave, h]) => (
              <option key={clave} value={clave}>
                {h.nombre}
                {h.piezas ? '' : ' (el de la demo)'}
              </option>
            ))}
          </select>
        </Etiqueta>
        {porPiezas ? (
          <Etiqueta texto="Estilo de pestañas">
            <select value={barra} onChange={e => cambiar('hero.barra', e.target.value)} className={CAMPO}>
              {Object.entries(BARRAS).map(([clave, b]) => (
                <option key={clave} value={clave}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        ) : (
          <p className="text-[0.85rem] text-zinc-500">Este diseño todavía lleva sus propias pestañas. Elige uno de los otros para cambiarlas.</p>
        )}
      </>
  )
}

/* ---------- Editor de una ficha, miniweb o carta ---------- */

function Editor({ tipo, slug, fila, volver, recargar, abrir }) {
  const buscar = tipo === 'negocio' ? getNegocio : getCarta
  const original = buscar(slug) ?? (fila?.base ? buscar(fila.base) : null)
  const esCopia = Boolean(fila?.base)
  const [cambios, setCambios] = useState(fila?.cambios ?? {})
  const [guardados, setGuardados] = useState(fila?.cambios ?? {})
  const [estado, setEstado] = useState(null)
  const [pregunta, setPregunta] = useState(null)
  const [duplicando, setDuplicando] = useState(null)
  const [historial, setHistorial] = useState(fila?.historial ?? [])
  // Sube cada vez que se guarda: la vista previa se recarga con lo nuevo
  const [version, setVersion] = useState(0)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  const vista = useMemo(() => aplicar(original, cambios), [original, cambios])
  const campos = useMemo(() => (vista ? camposDe(vista) : []), [vista])
  const bloques = useMemo(() => (vista ? organizar(vista, campos) : []), [vista, campos])

  if (!original) return <p className="text-zinc-500">No se encuentra esta página.</p>

  // Las demos originales no se editan: son las plantillas. Para adaptarlas a un negocio se duplican.
  // Las páginas de clientes y las copias sí se editan.
  const soloLectura = !esCopia && Boolean(original.demo)
  const sinGuardar = JSON.stringify(cambios) !== JSON.stringify(guardados)
  const nombre = tipo === 'negocio' ? vista.nombre : marcaDe(vista)?.nombre ?? slug
  const ruta =
    tipo === 'negocio' ? (esCopia ? `/demo/${slug}` : rutaNegocio(original)) : esCopia ? `/demo/${slug}/carta` : rutaCarta(original)

  // Un cambio que deja el dato como en el archivo se quita (así el archivo manda si luego se corrige allí)
  const cambiar = (r, valor) =>
    setCambios(c => {
      const nuevo = { ...c }
      if (valor === leerRuta(original, r)) delete nuevo[r]
      else nuevo[r] = valor
      return nuevo
    })

  const guardar = async () => {
    setEstado('guardando')
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios })
    if (error) return setEstado('error')
    setGuardados(cambios)
    setEstado('guardado')
    setVersion(v => v + 1)
    recargar()
  }

  // Retoque con el asistente: le pasa los campos con su valor actual y lo pedido antes; sus cambios se suman
  // a los del editor y se guardan al momento, para verlos ya en la vista previa
  const retocar = async peticion => {
    const fonts = leerRuta(vista, rutaTipografia(vista))
    const { resultado } = await llamar('asistente', {
      paso: 'retocar',
      peticion,
      perfil: tipo === 'carta' ? 'carta' : tipoDe(vista),
      historial: historial.map(h => h.peticion),
      campos: camposParaIA(vista),
      // En las cartas, también sus secciones y su menú, por si piden añadir, quitar o mover platos
      carta: estructuraCarta(vista),
      alergenos: Object.keys(ALERGENOS),
      tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
      tipografiaActual: parejaDe(fonts)?.id ?? '',
      // En las fichas, también el aspecto (por si piden "otras pestañas" o "otro estilo")
      ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? { piezas: piezasParaIA(), disenoActual: vista.hero?.diseno, barraActual: vista.hero?.barra ?? HEROS[vista.hero?.diseno]?.barra } : {}),
    })
    const deLaIA = { ...(await cambiosDeIA(resultado, campos, vista)), ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? piezasDeIA(resultado, vista) : {}) }
    // El menú del día de una carta vive en su panel (tabla cartas): si la IA lo cambia, se cambia allí
    if (tipo === 'carta' && deLaIA.menuDia) {
      const { error } = await supabase.from('cartas').update({ menu_dia: menuDelPanel(deLaIA.menuDia) }).eq('slug', slug)
      if (error) throw new Error('No se ha podido cambiar el menú del día.')
    }
    const nuevos = fusionar(cambios, deLaIA)
    const nuevoHistorial = [...historial, { peticion, resumen: sinGuionLargo(resultado.resumen ?? '') }]
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios: nuevos, historial: nuevoHistorial })
    if (error) throw new Error('No se han podido guardar los cambios del asistente.')
    setCambios(nuevos)
    setGuardados(nuevos)
    setHistorial(nuevoHistorial)
    setEstado('guardado')
    setVersion(v => v + 1)
    recargar()
  }

  // Un campo del editor: su etiqueta, "Volver al original" si se ha cambiado y la casilla según su clase
  // (enTarjeta: sin "Volver al original", que lo lleva la tarjeta entera)
  const campo = (c, enTarjeta = false) => {
    const valor = leerRuta(vista, c.ruta) ?? ''
    const cambiado = c.ruta in cambios
    return (
      <div key={c.ruta} className="grid gap-[0.3rem]">
        <div className="flex items-baseline justify-between gap-[0.75rem]">
          <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
          {cambiado && !enTarjeta && (
            <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
              Volver al original
            </button>
          )}
        </div>
        {c.clase === 'color' ? (
          <CampoColor valor={valor} cambiar={v => cambiar(c.ruta, v)} />
        ) : c.clase === 'foto' ? (
          // Búsqueda que sale ya escrita: el sector del negocio (Pollería, Estudio de uñas...).
          // En las cartas, fotos en vertical, que llenan la pantalla del móvil
          <CampoFoto
            valor={valor}
            cambiar={v => cambiar(c.ruta, v)}
            carpeta={`${tipo}/${slug}`}
            sugerencia={(tipo === 'negocio' ? vista.sector : marcaDe(vista)?.sector) ?? ''}
            orientacion={tipo === 'carta' ? 'portrait' : undefined}
          />
        ) : c.clase === 'largo' ? (
          <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
        ) : (
          <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
        )}
      </div>
    )
  }
  // Deshacer todos los cambios de una tarjeta (una foto con su nombre, un plato...)
  campo.volverTarjeta = t => t.campos.forEach(c => cambiar(c.ruta, leerRuta(original, c.ruta)))
  campo.tarjetaCambiada = t => t.campos.some(c => c.ruta in cambios)

  const tipografia = (
    <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">Tipografía</summary>
      <div className="px-[1rem] py-[1rem]">
        <ElegirTipografia
          actual={leerRuta(vista, rutaTipografia(vista))}
          original={(tipo === 'carta' ? marcaDe(original) : original)?.theme?.fonts}
          elegir={fonts =>
            setCambios(c => {
              const nuevo = { ...c }
              delete nuevo[rutaTipografia(vista)]
              if (fonts) nuevo[rutaTipografia(vista)] = fonts
              return nuevo
            })
          }
        />
      </div>
    </details>
  )

  const borrarCopia = async () => {
    const { error } = await supabase.from('ediciones').delete().eq('tipo', tipo).eq('slug', slug)
    if (error) return setEstado('error')
    // Una copia de carta se lleva también su fila del panel del dueño (menú del día)
    if (tipo === 'carta') await supabase.from('cartas').delete().eq('slug', slug)
    recargar()
    volver()
  }

  return (
    // En el ordenador, el editor a la izquierda y la vista previa a la derecha; en el móvil, "Ver página"
    <div className="pb-[6rem] lg:grid lg:grid-cols-[minmax(0,1fr)_23.3rem] lg:items-start lg:gap-[2rem]">
    <div className="grid gap-[1rem]">
      <button type="button" onClick={volver} className="inline-flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold">
        <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Todas
      </button>

      <div>
        <p className="text-[0.8rem] text-zinc-500">
          {esCopia
            ? `${tipo === 'carta' ? 'Carta, copia de' : 'Copia de'} ${(tipo === 'carta' ? marcaDe(getCarta(fila.base) ?? {}) : getNegocio(fila.base))?.nombre ?? fila.base}`
            : tipo === 'carta'
              ? 'Carta de'
              : 'Ficha de'}
        </p>
        <h1 className="text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        <div className="mt-[0.6rem] flex flex-wrap gap-x-[1.1rem] gap-y-[0.4rem] text-[0.9rem] font-semibold">
          <a href={ruta} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em]">
            Ver página
            <ArrowUpRight className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
          </a>
          {!soloLectura && (
            <button type="button" onClick={() => setDuplicando({ nombre: '', slug: '', error: '' })} className="inline-flex items-center gap-[0.3rem] underline underline-offset-[0.2em]">
              <Copy className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Duplicar
            </button>
          )}
          {esCopia && (
            <button
              type="button"
              onClick={() => setPregunta({ titulo: '¿Borrar esta copia?', texto: 'Su dirección dejará de funcionar. La demo original no se toca.', boton: 'Borrar', peligro: true, accion: borrarCopia })}
              className="inline-flex items-center gap-[0.3rem] text-red-600 underline underline-offset-[0.2em]"
            >
              <Trash2 className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Borrar copia
            </button>
          )}
        </div>
      </div>

      {/* Chat con el asistente: en las copias (fichas, miniwebs y cartas) */}
      {esCopia && <Retocar historial={historial} enviar={retocar} />}

      {/* En las cartas, el menú del día no se edita aquí: es del dueño */}
      {tipo === 'carta' && (
        <p className="text-[0.88rem] leading-[1.45] text-zinc-600">
          El menú del día se cambia desde el panel del dueño,{' '}
          <a href="/mi-carta" target="_blank" rel="noreferrer" className="font-semibold text-zinc-900 underline underline-offset-[0.2em]">
            /mi-carta
          </a>
          , con la foto de la pizarra incluida. El asistente también puede cambiarlo.
        </p>
      )}

      {soloLectura && (
        <div className="rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
          <p className="text-[0.95rem] leading-[1.45] text-zinc-700">
            {tipo === 'negocio'
              ? 'Es una demo original: aquí solo se puede ver. Para adaptarla a un negocio, duplícala y edita la copia.'
              : 'Es una carta de demo: aquí solo se puede ver. Para adaptarla a un restaurante, duplícala y edita la copia.'}
          </p>
          <button type="button" onClick={() => setDuplicando({ nombre: '', slug: '', error: '' })} className={`${BOTON} mt-[0.75rem] inline-flex items-center gap-[0.4rem]`}>
            <Copy className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Duplicar
          </button>
        </div>
      )}

      {/* En una demo original, todos los campos y botones quedan desactivados (fieldset disabled) */}
      <fieldset disabled={soloLectura} className="contents">
      {bloques.map((b, i) => (
        <Fragment key={b.clave}>
          {/* Diseño (ficha, miniweb o carta) justo después de Arriba */}
          {b.orden > 10 && (bloques[i - 1]?.orden ?? 0) <= 10 && (
            <Diseno tipo={tipo} slug={slug} vista={vista} original={original} cambiar={cambiar} abrir={abrir} />
          )}
          {/* Tipografía, justo después de los colores de la marca (las cartas de una ficha usan la de su ficha) */}
          {(tipo === 'negocio' || vista.marca) && b.orden > 30 && (bloques[i - 1]?.orden ?? 0) <= 30 && tipografia}
          <Bloque bloque={b} abierto={b.orden <= 10} campo={campo} />
        </Fragment>
      ))}
      {/* Si no hay bloques después de los colores (raro), la tipografía va al final */}
      {(tipo === 'negocio' || vista.marca) && (bloques.at(-1)?.orden ?? 0) <= 30 && tipografia}
      </fieldset>
    </div>

      {/* Vista previa: la página tal cual está guardada, del tamaño de un móvil; se recarga al guardar */}
      <aside className="sticky top-[1rem] hidden lg:block">
        {/* La página a 360 px de ancho (el móvil bajo), reducida entera para caber en el marco */}
        <Movil key={version} src={ruta} titulo="Vista previa" ancho={360} className="mx-auto w-full max-w-[21rem]" />
        <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500">Vista previa de lo guardado</p>
      </aside>

      {/* Guardar, siempre a mano abajo (no en las demos originales, que no se guardan) */}
      {!soloLectura && (
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-[1rem] py-[0.75rem] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[32rem] items-center gap-[0.75rem]">
          <p className="min-w-0 flex-1 text-[0.85rem] text-zinc-500">
            {estado === 'error' ? (
              <span className="font-semibold text-red-600">No se ha podido guardar. Prueba otra vez.</span>
            ) : sinGuardar ? (
              'Hay cambios sin guardar.'
            ) : estado === 'guardado' ? (
              'Guardado. Ya se ve en la página.'
            ) : (
              'Sin cambios.'
            )}
          </p>
          <button type="button" onClick={guardar} disabled={!sinGuardar || estado === 'guardando'} className={`${BOTON} shrink-0`}>
            {estado === 'guardando' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      )}

      {duplicando && (
        <Duplicar
          tipo={tipo}
          datos={duplicando}
          setDatos={setDuplicando}
          crear={async ({ nombre: nuevoNombre, slug: nuevoSlug }) => {
            // Una copia de carta lleva su propia marca (si aún no la tiene, la de la carta de la que sale)
            const deLaCopia =
              tipo === 'carta'
                ? fusionar(vista.marca ? cambios : fusionar(cambios, inicioCopiaCarta(original)), { 'marca.nombre': nuevoNombre })
                : fusionar(cambios, { nombre: nuevoNombre })
            const { error } = await supabase
              .from('ediciones')
              .insert({ tipo, slug: nuevoSlug, base: fila?.base ?? slug, cambios: deLaCopia })
            if (error) {
              setDuplicando(d => ({ ...d, error: error.code === '23505' ? 'Ya hay una copia con esa dirección.' : 'No se ha podido crear la copia.' }))
              return
            }
            // La carta nueva, con su dueño y el menú del día que tenía la que se duplica
            if (tipo === 'carta') {
              try {
                await crearCartaConDueno(nuevoSlug, vista.menuDia)
              } catch (e) {
                setDuplicando(d => ({ ...d, error: e.message }))
                return
              }
            }
            setDuplicando(null)
            await recargar()
            abrir(`${tipo}:${nuevoSlug}`)
          }}
        />
      )}

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

// Hoja para duplicar: el nombre del negocio nuevo y su dirección (se rellena sola a partir del nombre)
function Duplicar({ tipo, datos, setDatos, crear }) {
  const [enviando, setEnviando] = useState(false)
  const slug = datos.slug || aSlug(datos.nombre)
  // Una ficha y su carta pueden compartir dirección (/demo/casa-pepe y /demo/casa-pepe/carta)
  const ocupada = RESERVADAS.has(slug) || Boolean(tipo === 'carta' ? getCarta(slug) : getNegocio(slug))
  const valida = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !ocupada

  const enviar = async e => {
    e.preventDefault()
    if (!valida || !datos.nombre.trim()) return
    setEnviando(true)
    await crear({ nombre: datos.nombre.trim(), slug })
    setEnviando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setDatos(null)}>
      <form
        onSubmit={enviar}
        onClick={e => e.stopPropagation()}
        className="grid w-full max-w-[26rem] gap-[0.9rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] sm:rounded-[1.25rem]"
      >
        <div>
          <h2 className="text-[1.15rem] font-bold">Duplicar para otro negocio</h2>
          <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-zinc-600">Se crea una copia con este diseño y tus cambios. La demo original no se toca.</p>
        </div>
        <Etiqueta texto="Nombre del negocio">
          <input autoFocus required value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value, error: '' }))} className={CAMPO} />
        </Etiqueta>
        <Etiqueta texto="Dirección">
          <div className="flex items-center gap-[0.3rem]">
            <span className="shrink-0 text-[0.92rem] text-zinc-500">/demo/</span>
            <input
              value={slug}
              onChange={e => setDatos(d => ({ ...d, slug: aSlug(e.target.value) || e.target.value.toLowerCase(), error: '' }))}
              className={CAMPO}
              spellCheck={false}
              autoCapitalize="none"
              aria-label={tipo === 'carta' ? 'Dirección (termina en /carta)' : 'Dirección'}
            />
            {tipo === 'carta' && <span className="shrink-0 text-[0.92rem] text-zinc-500">/carta</span>}
          </div>
        </Etiqueta>
        {(ocupada || datos.error) && (
          <p className="text-[0.88rem] font-semibold text-red-600">{datos.error || 'Esa dirección ya está en uso.'}</p>
        )}
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={() => setDatos(null)} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
          <button type="submit" disabled={!valida || !datos.nombre.trim() || enviando} className={BOTON}>
            {enviando ? 'Creando...' : 'Crear copia'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---------- Lista de todo ---------- */

/* Nuevo perfil: se elige la temática (pone el contenido de ejemplo: pestañas, fotos y textos), el producto
   (ficha, miniweb o carta), el diseño y la marca (nombre, colores y letra), viéndolo en un móvil. Al crearlo se
   guarda como una copia de la demo de esa temática con el diseño y la marca elegidos, y se abre en el editor.
   La vista previa enseña todo al momento: el contenido, el diseño y la marca (con la marca de prueba de lib/prueba.js). */
function NuevoPerfil({ filas, recargar, abrir }) {
  const [tema, setTema] = useState(PLANTILLAS[0].clave)
  const [producto, setProducto] = useState('ficha')
  const [hero, setHero] = useState('polaroid')
  const [barra, setBarra] = useState('')
  const [estilo, setEstilo] = useState('revista')
  const [nombre, setNombre] = useState('')
  const [principal, setPrincipal] = useState('')
  const [acento, setAcento] = useState('')
  const [colorTexto, setColorTexto] = useState('')
  const [letra, setLetra] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')

  const plantilla = PLANTILLAS.find(p => p.clave === tema)
  const negocioBase = getNegocio(plantilla.ficha)
  const cartaBase = plantilla.carta ? getCarta(plantilla.carta) : null
  const esCarta = producto === 'carta'
  // Colores de partida: los de la demo de la temática
  const marcaBase = esCarta ? marcaDe(cartaBase ?? {}) : negocioBase
  const colorPrincipal = principal || marcaBase?.theme?.colors?.primary || '#000000'
  const colorAcento = acento || marcaBase?.theme?.colors?.accent || '#000000'
  const colorDelTexto = colorTexto || marcaBase?.theme?.colors?.text || '#000000'

  const heros = Object.entries(HEROS).filter(([, h]) => h.piezas && !h.paginaCompleta)
  const estilos = Object.values(FAMILIAS).filter(f => f.carta)

  // El nombre llega a la vista previa medio segundo después de dejar de escribir (si no, se recargaría a cada letra)
  const [nombreVista, setNombreVista] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setNombreVista(nombre.trim()), 500)
    return () => clearTimeout(t)
  }, [nombre])
  // Marca de prueba en la dirección: la vista previa enseña el nombre, los colores y la tipografía al momento
  const marca = [
    nombreVista && `nombre=${encodeURIComponent(nombreVista)}`,
    principal && `principal=${principal.slice(1)}`,
    acento && `acento=${acento.slice(1)}`,
    colorTexto && `texto=${colorTexto.slice(1)}`,
    letra && `letra=${letra}`,
  ]
    .filter(Boolean)
    .map(p => `&${p}`)
    .join('')

  const vista =
    producto === 'ficha'
      ? `/demo/${plantilla.ficha}?diseno=${hero}${barra ? `&barra=${barra}` : ''}${marca}`
      : producto === 'miniweb'
        ? // Comida: la miniweb de Chalaquita con la portada elegida; el resto, su ficha como miniweb
          plantilla.miniweb
          ? `/demo/${plantilla.miniweb}?diseno=${hero}${marca}`
          : `/demo/${plantilla.ficha}?diseno=${hero}&miniweb=1${marca}`
        : cartaBase
          ? `/demo/${plantilla.carta}/carta?diseno=${estilo}${marca}`
          : null

  const crear = async () => {
    if (!nombre.trim() || creando) return
    setCreando(true)
    setError('')
    try {
      const tipoFila = esCarta ? 'carta' : 'negocio'
      const ocupadas = new Set([
        ...(filas ?? []).filter(f => f.tipo === tipoFila).map(f => f.slug),
        ...(esCarta ? cartas : negocios).map(n => n.slug),
        ...RESERVADAS,
      ])
      const raiz = aSlug(nombre) || 'nuevo'
      let slug = raiz
      for (let n = 2; ocupadas.has(slug); n++) slug = `${raiz}-${n}`

      const tipografia = TIPOGRAFIAS.find(t => t.id === letra)
      let cambios
      let base
      if (esCarta) {
        base = plantilla.carta
        const inicio = inicioCopiaCarta(cartaBase)
        cambios = fusionar(inicio, {
          'marca.nombre': nombre.trim(),
          diseno: estilo,
          ...(principal ? { 'marca.theme.colors.primary': principal } : {}),
          ...(acento ? { 'marca.theme.colors.accent': acento } : {}),
          ...(colorTexto ? { 'marca.theme.colors.text': colorTexto } : {}),
          ...(tipografia ? { 'marca.theme.fonts': tipografia.fonts } : {}),
        })
      } else {
        // Miniweb de comida: copia de Chalaquita con la portada elegida. El resto: su ficha como miniweb
        const deChalaquita = producto === 'miniweb' && plantilla.miniweb
        base = deChalaquita ? plantilla.miniweb : plantilla.ficha
        cambios = {
          nombre: nombre.trim(),
          ...(principal ? { 'theme.colors.primary': principal } : {}),
          ...(acento ? { 'theme.colors.accent': acento } : {}),
          ...(colorTexto ? { 'theme.colors.text': colorTexto } : {}),
          ...(tipografia ? { 'theme.fonts': tipografia.fonts } : {}),
          ...(producto === 'ficha'
            ? { 'hero.diseno': hero, ...(barra ? { 'hero.barra': barra } : {}) }
            : deChalaquita
              ? { 'hero.portada': hero }
              : {
                  'hero.diseno': 'web',
                  'hero.portada': hero,
                  'hero.redesArriba': true,
                  'hero.pestanas': pestanasDeMiniweb(negocioBase),
                  tipo: 'miniweb',
                }),
        }
      }

      const { error } = await supabase.from('ediciones').insert({ tipo: tipoFila, slug, base, cambios })
      if (error) throw new Error('No se ha podido crear.')
      if (esCarta) await crearCartaConDueno(slug, aplicar(cartaBase, cambios).menuDia)
      await recargar()
      abrir(`${tipoFila}:${slug}`)
    } catch (e) {
      setError(e.message)
      setCreando(false)
    }
  }

  const titulo = 'text-[0.8rem] font-semibold text-zinc-500'
  const opcion = activa => `rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${activa ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`

  return (
    <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.9rem] text-[1.05rem] font-bold">Nuevo perfil</summary>
      <div className="grid gap-[1.25rem] px-[1rem] py-[1rem] lg:grid-cols-[minmax(0,1fr)_23.3rem] lg:items-start">
        <div className="grid gap-[1rem]">
          {/* 1. Temática: pone el contenido de ejemplo */}
          <div className="grid gap-[0.4rem]">
            <span className={titulo}>Temática del negocio</span>
            <div className="flex flex-wrap gap-[0.4rem]">
              {PLANTILLAS.map(p => (
                <button key={p.clave} type="button" aria-pressed={tema === p.clave} onClick={() => setTema(p.clave)} className={opcion(tema === p.clave)}>
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Producto */}
          <div className="grid gap-[0.4rem]">
            <span className={titulo}>Producto</span>
            <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
              {[
                ['ficha', 'Ficha'],
                ['miniweb', 'Miniweb'],
                ['carta', 'Carta'],
              ].map(([clave, texto]) => (
                <button
                  key={clave}
                  type="button"
                  aria-pressed={producto === clave}
                  disabled={clave === 'carta' && !cartaBase}
                  onClick={() => setProducto(clave)}
                  className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {texto}
                </button>
              ))}
            </div>
            {!cartaBase && <p className="text-[0.82rem] text-zinc-500">Esta temática todavía no tiene carta de ejemplo.</p>}
          </div>

          {/* 3. Diseño, según el producto */}
          {!esCarta ? (
            <div className="grid gap-[0.4rem]">
              <span className={titulo}>{producto === 'miniweb' ? 'Portada' : 'Diseño de arriba'}</span>
              <div className="flex flex-wrap gap-[0.4rem]">
                {heros.map(([clave, h]) => (
                  <button key={clave} type="button" aria-pressed={hero === clave} onClick={() => setHero(clave)} className={opcion(hero === clave)}>
                    {h.nombre}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-[0.4rem]">
              <span className={titulo}>Estilo de carta</span>
              <div className="flex flex-wrap gap-[0.4rem]">
                {estilos.map(f => (
                  <button key={f.carta} type="button" aria-pressed={estilo === f.carta} onClick={() => setEstilo(f.carta)} className={opcion(estilo === f.carta)}>
                    {f.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
          {producto === 'ficha' && (
            <div className="grid gap-[0.4rem]">
              <span className={titulo}>Estilo de pestañas</span>
              <div className="flex flex-wrap gap-[0.4rem]">
                {[['', { nombre: 'El suyo' }], ...Object.entries(BARRAS)].map(([clave, b]) => (
                  <button key={clave || 'suyo'} type="button" aria-pressed={barra === clave} onClick={() => setBarra(clave)} className={opcion(barra === clave)}>
                    {b.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Marca */}
          <Etiqueta texto="Nombre del negocio">
            <input value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Peluquería Ranita" />
          </Etiqueta>
          <div className="grid grid-cols-2 gap-[0.6rem]">
            <Etiqueta texto="Color principal">
              <CampoColor valor={colorPrincipal} cambiar={setPrincipal} />
            </Etiqueta>
            <Etiqueta texto="Color de acento">
              <CampoColor valor={colorAcento} cambiar={setAcento} />
            </Etiqueta>
            <Etiqueta texto="Color del texto">
              <CampoColor valor={colorDelTexto} cambiar={setColorTexto} />
            </Etiqueta>
          </div>
          <Etiqueta texto="Tipografía">
            <select value={letra} onChange={e => setLetra(e.target.value)} className={CAMPO}>
              <option value="">La de la plantilla</option>
              {TIPOGRAFIAS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>

          {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
          <button type="button" onClick={crear} disabled={!nombre.trim() || creando} className={BOTON}>
            {creando ? 'Creando...' : `Crear ${producto === 'carta' ? 'carta' : producto === 'miniweb' ? 'miniweb' : 'ficha'}`}
          </button>
        </div>

        {/* Vista previa: el contenido de la temática con el diseño elegido.
            A 360 px de ancho por dentro, como el móvil bajo: se ve lo mismo que verá el cliente */}
        <div className="lg:sticky lg:top-[1rem]">
          {vista && <Movil key={vista} src={vista} titulo="Vista previa" ancho={360} className="mx-auto w-full max-w-[20rem]" />}
          <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500">Con el contenido de ejemplo de la temática</p>
        </div>
      </div>
    </details>
  )
}

function Lista({ filas, abrir, recargar }) {
  const editadas = new Set((filas ?? []).map(f => `${f.tipo}:${f.slug}`))
  // Copias de fichas, miniwebs y cartas, con el nombre que les has puesto
  const copias = (filas ?? [])
    .filter(f => f.base)
    .map(f =>
      f.tipo === 'carta'
        ? {
            ...f,
            nombre: f.cambios?.['marca.nombre'] ?? f.cambios?.marca?.nombre ?? f.slug,
            detalle: `Carta, copia de ${marcaDe(getCarta(f.base) ?? {})?.nombre ?? f.base}`,
            ruta: `/demo/${f.slug}/carta`,
          }
        : { ...f, nombre: f.cambios?.nombre ?? f.slug, detalle: `Copia de ${getNegocio(f.base)?.nombre ?? f.base}`, ruta: `/demo/${f.slug}` },
    )

  const Fila = ({ clave, nombre, detalle, ruta }) => (
    <li className="flex items-center gap-[0.75rem] border-b border-zinc-200 last:border-b-0">
      <button type="button" onClick={() => abrir(clave)} className="min-w-0 flex-1 py-[0.8rem] text-left">
        <span className="block truncate font-semibold">{nombre}</span>
        <span className="block text-[0.82rem] text-zinc-500">
          {detalle}
          {editadas.has(clave) ? ' · con cambios' : ''}
        </span>
      </button>
      <Link to={ruta} target="_blank" aria-label={`Ver ${nombre}`} className="shrink-0 p-[0.4rem] text-zinc-500 hover:text-zinc-900">
        <ArrowUpRight className="h-[1.1rem] w-[1.1rem]" />
      </Link>
    </li>
  )

  // Grupo desplegable: cerrado, con su número; al tocarlo se abre la lista
  const Grupo = ({ titulo, filas: lista }) =>
    lista.length > 0 && (
      <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
        <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
          <span className="text-[1.05rem] font-bold">{titulo}</span>
          <span className="text-[0.9rem] text-zinc-500">{lista.length}</span>
        </summary>
        <ul className="px-[1rem]">
          {lista.map(f => (
            <Fila key={f.clave} {...f} />
          ))}
        </ul>
      </details>
    )

  const aFila = n => ({ clave: `negocio:${n.slug}`, nombre: n.nombre, detalle: n.demo ? 'Demo' : 'Cliente', ruta: rutaNegocio(n) })

  return (
    <div className="grid gap-[1.25rem]">
      <h1 className="text-[1.5rem] font-bold">Administración</h1>

      {/* Panel principal: crear un perfil nuevo eligiendo temática, producto, diseño y marca */}
      <NuevoPerfil filas={filas} recargar={recargar} abrir={abrir} />

      <button type="button" onClick={() => abrir('asistente')} className={`${BOTON} inline-flex items-center justify-center gap-[0.4rem]`}>
        <Sparkles className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        Crear con el asistente
      </button>

      {/* Todo lo que hay, por producto, en desplegables cerrados */}
      <div className="grid gap-[0.6rem]">
        <Grupo titulo="Copias para enseñar" filas={copias.map(f => ({ clave: `${f.tipo}:${f.slug}`, nombre: f.nombre, detalle: f.detalle, ruta: f.ruta }))} />
        <Grupo titulo="Fichas" filas={negocios.filter(n => tipoDe(n) === 'ficha').map(aFila)} />
        <Grupo titulo="Miniwebs" filas={negocios.filter(n => tipoDe(n) === 'miniweb').map(aFila)} />
        <Grupo
          titulo="Cartas"
          filas={cartas.map(c => ({ clave: `carta:${c.slug}`, nombre: marcaDe(c)?.nombre ?? c.slug, detalle: c.demo ? 'Demo' : 'Cliente', ruta: rutaCarta(c) }))}
        />
      </div>
    </div>
  )
}

export default function AdminPage() {
  const sesion = usePaginaPrivada('Administración')
  const [esAdmin, setEsAdmin] = useState(undefined)
  const [filas, setFilas] = useState(null)
  const [params, setParams] = useSearchParams()
  // Lo que se está editando va en la dirección (?editar=negocio:laca): el botón atrás del móvil vuelve a la lista
  const editar = params.get('editar')

  // ¿Esta cuenta es de administrador?
  useEffect(() => {
    if (!sesion) {
      setEsAdmin(undefined)
      return
    }
    supabase
      .from('admins')
      .select('usuario')
      .eq('usuario', sesion.user.id)
      .maybeSingle()
      .then(({ data }) => setEsAdmin(Boolean(data)))
  }, [sesion])

  // Devuelve la promesa: al crear una copia se espera a tenerla antes de abrirla
  const recargar = useCallback(() => {
    return supabase
      .from('ediciones')
      .select('tipo, slug, base, cambios, historial')
      .order('actualizado', { ascending: false })
      .then(({ data }) => setFilas(data ?? []))
  }, [])

  useEffect(() => {
    if (esAdmin) recargar()
  }, [esAdmin, recargar])

  const abrir = clave => {
    setParams(clave ? { editar: clave } : {})
    window.scrollTo(0, 0)
  }

  const [tipo, slug] = editar?.split(':') ?? []
  const fila = filas?.find(f => f.tipo === tipo && f.slug === slug) ?? null

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className={`mx-auto w-full max-w-[32rem] px-[1rem] pb-[2rem] pt-[1rem] ${editar === 'asistente' ? '' : 'lg:max-w-[64rem]'}`}>
        {!supabase ? (
          <p className="mt-[3rem] text-center text-zinc-500">El panel no está disponible ahora mismo.</p>
        ) : sesion === undefined ? null : !sesion ? (
          <Entrar titulo="Administración" texto="Entra para editar las fichas, miniwebs y cartas." />
        ) : (
          <>
            <div className="mb-[1rem] flex items-center justify-between gap-[1rem] text-[0.85rem] text-zinc-500">
              <span className="truncate">{sesion.user.email}</span>
              <button type="button" onClick={() => supabase.auth.signOut()} className="shrink-0 font-semibold text-zinc-900 underline underline-offset-[0.2em]">
                Salir
              </button>
            </div>

            {esAdmin === undefined || (esAdmin && !filas) ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : !esAdmin ? (
              <p className="text-zinc-500">Esta cuenta no tiene acceso a este panel.</p>
            ) : editar === 'asistente' ? (
              <CrearConAsistente filas={filas} volver={() => abrir(null)} recargar={recargar} abrir={abrir} />
            ) : editar && (tipo === 'negocio' || tipo === 'carta') ? (
              // key: al abrir otra (por ejemplo, la copia recién creada) el editor empieza de cero
              <Editor key={`${editar}-${Boolean(fila)}`}tipo={tipo} slug={slug} fila={fila} volver={() => abrir(null)} recargar={recargar} abrir={abrir} />
            ) : (
              <Lista filas={filas} abrir={abrir} recargar={recargar} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
