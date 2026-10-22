import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Link, useSearchParams } from 'react-router-dom'
import { Armchair, ArrowLeft, BadgePercent, List, ArrowUp, ArrowUpRight, Beer, BookImage, Camera, ChevronDown, ChevronsDownUp, CircleUser, Coffee, Copy, Croissant, Fish, Frame, GalleryHorizontal, IdCard, ImagePlus, LayoutGrid, Maximize, Menu, Minus, Newspaper, PanelTop, Pizza, Plus, QrCode, RotateCcw, Scissors, Search, Slice, Smartphone, Sparkles, Store, Trash2, UtensilsCrossed, X } from 'lucide-react'
import GeneradorQR from '../components/GeneradorQR'
import { supabase } from '../lib/supabase'
import { aplicar, conEdicion } from '../lib/ediciones'
import { getNegocio, negocios, rutaNegocio } from '../negocios'
import { ALERGENOS, cartas, fotoDe, getCarta, marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Entrar, Etiqueta, usePaginaPrivada } from '../components/panel'
import { loadFont } from '../lib/applyTheme'
import { TIPOGRAFIAS, parejaDe } from '../asistente/tipografias'
import { DISENOS_ASISTENTE, DISENOS_CARTA } from '../asistente/disenos'
import { GRUPOS_PLANTILLAS, PLANTILLAS } from '../plantillas'
import { PORTADAS_IA, catalogoMiniweb, validarDiseno } from '../asistente/miniweb'
import { TIPOS_CARTA, catalogoCarta, validarDisenoCarta } from '../asistente/carta'
import { derivadosDeFondoYTexto } from '../lib/mezclarColores'
import { DIBUJOS_MENU, GRUPOS_MENU } from '../lib/estilosMenu'
import { leerReferencia } from '../asistente/referencia'
import { ICONOS_ESTRUCTURA } from '../lib/iconosEstructura'
import { HORARIOS } from '../lib/horarios'
import Movil from '../components/Movil'
import { COLORES_MINIWEB, coloresAutomaticos } from '../lib/coloresMiniweb'
import { CORTES, puntosDeCorte } from '../lib/cortes'
import { FORMATOS } from '../lib/formatos'
import { DISPOSICIONES } from '../lib/disposiciones'
import { COMPOSICIONES } from '../lib/composiciones'
import { DISTRIBUCIONES } from '../lib/distribuciones'
import { GALERIAS } from '../lib/galerias'
import { MONTAJES } from '../lib/montajes'
import { pestanasDeMiniweb } from '../lib/miniweb'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { FAMILIAS } from '../familias'
import { DOMINIO, rutaDe, conDominio } from '../lib/dominio'

/* Panel de Jesús (/admin): cambiar textos, fotos y colores de cualquier ficha, miniweb o carta desde el móvil,
   sin tocar código, y duplicar una demo para adaptarla en segundos al negocio que tiene delante.
   Los cambios se guardan en Supabase (tabla ediciones) por encima de los archivos; los permisos de Supabase
   hacen que solo un administrador (tabla admins) pueda guardarlos. El diseño y la estructura siguen en el código. */

// Direcciones que no puede usar una copia: las de las páginas de la web
// Los campos de la ficha que no se pintan en una miniweb (su titular sobre la foto, su segunda línea y su texto): se dejan vacíos al convertirla
const LIMPIAR_FICHA = { 'hero.titulo': '', 'hero.destacado': '', 'hero.brillo': '', 'hero.texto': '' }

const RESERVADAS = new Set(['demo', 'tematicas', 'gestion', 'catalogo', 'planes', 'panel', 'mi-carta', 'admin', 'miniweb', 'disenos', 'aviso-legal', 'privacidad', 'mi-qr'])

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
const SALTAR = new Set(['slug', 'demo', 'copia', 'diseno', 'barra', 'portada', 'perfil', 'tipo', 'platform', 'tematica', 'sector', 'negocio', 'google', 'family', 'idiomas', 'alergenos', 'alt', 'botonA'])

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
  bg: 'Fondo', surface: 'Superficie', primary: 'Principal', header: 'Fondo de cabecera', accent: 'Acento', text: 'Texto', muted: 'Texto suave',
  pestanas: 'Pestaña', secciones: 'Sección', platos: 'Plato', lineas: 'Línea', redes: 'Red', carrusel: 'Tarjeta',
  extras: 'Botón', esmaltes: 'Esmalte', colors: 'Colores', redesTexto: 'Texto de redes', colorRedes: 'Color de la barra de redes',
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
// En los textos, max: los caracteres que caben en ese sitio (el largo del texto de la demo, con un pequeño margen),
// para que la IA escriba textos nuevos sin romper el diseño
// (en los cortos, el margen es más amplio: "Valóranos en Google" tiene que poder ser "Cuéntanos qué tal en Google")
const maxDe = texto => Math.max(Math.ceil(texto.length * 1.25), texto.length + 12)
// El nombre de una pestaña del menú (hero.pestanas.N.texto) cabe en el menú: como mucho 10 caracteres ("Pedir cita")
const MAX_PESTANA = 10
const esNombreDePestana = ruta => /^hero\.pestanas\.\d+\.texto$/.test(ruta)
// Los textos de la portada de Inicio (el grande, el pequeño y el extra) tienen un máximo fijo, el mismo que el del editor, sea cual sea el texto de partida:
// así el asistente puede llenarlos. El grande, en una línea, hasta 47; si tiene dos, 24 cada una
const MAX_TITULAR = 47
const MAX_DESCRIPCION = 120
const maxCampo = (ruta, valor, datos) => {
  if (esNombreDePestana(ruta)) return MAX_PESTANA
  if (/^hero\.pestanas\.0\.titular\.\d+$/.test(ruta)) return (datos?.hero?.pestanas?.[0]?.titular?.length ?? 1) > 1 ? Math.floor(MAX_TITULAR / 2) : MAX_TITULAR
  if (ruta === 'hero.pestanas.0.descripcion') return MAX_DESCRIPCION
  return maxDe(valor)
}
const camposParaIA = datos =>
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
// auto: el color que se pone solo (borde de rayitas); soloCirculo: sin el campo del código, para que al elegir un color solo cambie el círculo
function CampoColor({ valor, cambiar, auto = false, soloCirculo = false }) {
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
        className={`h-[2.75rem] w-[2.75rem] shrink-0 rounded-full border p-[0.2rem] ${auto ? 'border-dashed border-zinc-400' : 'border-zinc-300'}`}
      >
        <span className="block h-full w-full rounded-full" style={{ background: seis }} />
      </button>
      {!auto && !soloCirculo && <input value={valor} onChange={e => cambiar(e.target.value)} className={`${CAMPO} font-mono`} spellCheck={false} />}
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

/* Logo del negocio: se sube tal cual (sin pasarlo a JPG, para que no pierda el fondo transparente), a la carpeta logos
   del almacén de fotos. PNG, SVG, WebP o JPG, de 1 MB como mucho */
const TIPOS_LOGO = { 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/jpeg': 'jpg' }
function CampoLogo({ valor, cambiar }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const subir = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    const extension = TIPOS_LOGO[archivo.type]
    if (!extension) return setError('Tiene que ser PNG, SVG, WebP o JPG.')
    if (archivo.size > 1024 * 1024) return setError('Pesa demasiado: como mucho 1 MB.')
    setSubiendo(true)
    setError('')
    try {
      const ruta = `logos/${Date.now()}.${extension}`
      const { error } = await supabase.storage.from('fotos').upload(ruta, archivo, { contentType: archivo.type })
      if (error) throw error
      cambiar(supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl)
    } catch {
      setError('No se ha podido subir el logo. Prueba otra vez.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="grid gap-[0.4rem]">
      <div className="flex items-center gap-[0.75rem]">
        {/* Sobre cuadros, para ver si tiene fondo transparente */}
        <div className="flex h-[4.5rem] w-[7rem] shrink-0 items-center justify-center rounded-[0.6rem] bg-[repeating-conic-gradient(#e4e4e7_0_25%,#fff_0_50%)] bg-[length:0.75rem_0.75rem] p-[0.4rem] ring-1 ring-zinc-200">
          {valor ? <img src={valor} alt="Logo" className="max-h-full max-w-full object-contain" /> : <span className="text-[0.75rem] text-zinc-400">Sin logo</span>}
        </div>
        <label className={`inline-flex min-h-[2.5rem] cursor-pointer items-center rounded-[0.6rem] bg-white px-[0.9rem] text-[0.9rem] font-semibold ring-1 ring-zinc-300 ${subiendo ? 'pointer-events-none opacity-50' : ''}`}>
          {subiendo ? 'Subiendo...' : valor ? 'Cambiar logo' : 'Subir logo'}
          <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" onChange={subir} className="sr-only" />
        </label>
      </div>
      {error && <p className="text-[0.8rem] font-semibold text-red-600">{error}</p>}
      <p className="text-[0.8rem] text-zinc-500">Mejor en PNG o SVG con fondo transparente. Sale en lugar del nombre, a un tamaño fijo según el diseño.</p>
    </div>
  )
}

function CampoFoto({ valor, cambiar, carpeta, sugerencia, orientacion, quitar }) {
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
          {/* Quitar esta foto de la lista (solo en los diseños donde puede haber más o menos) */}
          {quitar && (
            <button type="button" onClick={quitar} title="Quitar esta foto" aria-label="Quitar esta foto" className="inline-flex items-center justify-center rounded-[0.6rem] px-[0.7rem] py-[0.55rem] text-zinc-600 ring-1 ring-zinc-300">
              <X className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </button>
          )}
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
  // Para miniwebs, de momento sin Banner, Ficha, Portada ni Historias (se mantiene la que el perfil ya lleve)
  const portadas = Object.entries(HEROS).filter(([clave, h]) => h.piezas && !h.paginaCompleta && (!SIN_PORTADA_MINIWEB.includes(clave) || clave === hero?.portada))
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
            <EstructuraMiniweb contactoPorDefecto={hero.pestanas?.some(p => p.tipo === 'reservar') ? 'reserva' : 'boton'} valores={hero} cambiar={(clave, valor) => cambiar(`hero.${clave}`, valor === ESTRUCTURA_DEFECTO[clave] ? undefined : valor)} />
            {hero.portada === 'editorial' && (
              <Etiqueta texto="Formato (Formatos)">
                <select value={hero.formato ?? 'clasica'} onChange={e => cambiar('hero.formato', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {FORMATOS.map(f => (
                    <option key={f.clave} value={f.clave}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            <SelectorCartaMiniweb valor={hero.carta} cambiar={valor => cambiar('hero.carta', valor)} />
            {hero.portada === 'polaroid' && (
              <Etiqueta texto="Montaje de las polaroids">
                <select value={hero.montaje ?? 'clasica'} onChange={e => cambiar('hero.montaje', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {MONTAJES.map(m => (
                    <option key={m.clave} value={m.clave}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'galeria' && (
              <Etiqueta texto="Estilo de la galería">
                <select value={hero.pase ?? 'clasica'} onChange={e => cambiar('hero.pase', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {GALERIAS.map(g => (
                    <option key={g.clave} value={g.clave}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'retrato' && (
              <Etiqueta texto="Distribución de las fotos (Distribuciones)">
                <select value={hero.distribucion ?? 'clasica'} onChange={e => cambiar('hero.distribucion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {DISTRIBUCIONES.map(d => (
                    <option key={d.clave} value={d.clave}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'mosaico' && (
              <Etiqueta texto="Composición (Composiciones)">
                <select value={hero.composicion ?? 'clasica'} onChange={e => cambiar('hero.composicion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {COMPOSICIONES.map(c => (
                    <option key={c.clave} value={c.clave}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'fullbleed' && (
              <Etiqueta texto="Disposición del texto (Disposiciones)">
                <select value={hero.disposicion ?? 'clasica'} onChange={e => cambiar('hero.disposicion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {DISPOSICIONES.map(d => (
                    <option key={d.clave} value={d.clave}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'diagonal' && (
              <Etiqueta texto="Forma del corte (Cortes)">
                <select value={hero.corte ?? 'diagonal'} onChange={e => cambiar('hero.corte', e.target.value === 'diagonal' ? undefined : e.target.value)} className={CAMPO}>
                  {CORTES.map(c => (
                    <option key={c.clave} value={c.clave}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            <PanelColoresMiniweb
              valores={hero.colores ?? {}}
              autos={coloresAutomaticos(vista?.theme, vista?.hero, vista?.hero?.colores)}
              cambiar={(clave, valor) => {
                const nuevo = { ...(hero.colores ?? {}), [clave]: valor }
                if (valor === undefined) delete nuevo[clave]
                cambiar('hero.colores', Object.keys(nuevo).length ? nuevo : undefined)
              }}
            />
            <Etiqueta texto="Estilo del menú de navegación">
              <select value={hero.barra ?? ''} onChange={e => cambiar('hero.barra', e.target.value || undefined)} className={CAMPO}>
                <option value="">La rayita (la de siempre)</option>
                {Object.entries(BARRAS).map(([clave, b]) => (
                  <option key={clave} value={clave}>
                    {b.nombre}
                  </option>
                ))}
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
        {diseno === 'editorial' && (
          <Etiqueta texto="Formato">
            <select value={hero?.formato ?? 'clasica'} onChange={e => cambiar('hero.formato', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
              {FORMATOS.map(f => (
                <option key={f.clave} value={f.clave}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        )}
        {diseno === 'diagonal' && (
          <Etiqueta texto="Forma del corte">
            <select value={hero?.corte ?? 'diagonal'} onChange={e => cambiar('hero.corte', e.target.value === 'diagonal' ? undefined : e.target.value)} className={CAMPO}>
              {CORTES.map(c => (
                <option key={c.clave} value={c.clave}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        )}
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

// La tarjeta de información de una copia para enseñar (nada se edita aquí): de qué trata, su sector, su estilo, sus colores y cómo se creó.
// Debajo, el botón para pasar al editor
function InfoCopia({ vista, tipo, fila, historial, ruta, onEditar, onExportar }) {
  const esCarta = tipo === 'carta'
  const marca = esCarta ? marcaDe(vista) : vista
  const colores = marca?.theme?.colors ?? {}
  const hero = vista.hero ?? {}
  const portada = PORTADAS_IA.find(p => p.clave === hero.portada)
  const sub = portada ? portada.lista.find(x => x.clave === (hero[portada.campo] ?? portada.lista[0].clave)) : null
  const esMiniweb = !esCarta && tipoDe(vista) === 'miniweb'
  const base = esCarta ? marcaDe(getCarta(fila?.base) ?? {})?.nombre : getNegocio(fila?.base)?.nombre
  const barra = hero.barra ?? HEROS[hero.diseno]?.barra
  const filas = [
    ['Tipo', esCarta ? 'Carta' : esMiniweb ? 'Miniweb' : 'Ficha'],
    ['Sector', marca?.sector],
    ['Parte de', base],
    [
      esCarta ? 'Estilo de carta' : 'Diseño',
      esCarta ? vista.diseno : esMiniweb ? [portada?.clave ? HEROS[portada.clave]?.nombre : null, sub?.nombre].filter(Boolean).join(' · ') : HEROS[hero.diseno]?.nombre,
    ],
    ...(esCarta ? [] : [['Estilo del menú', barra ? BARRAS[barra]?.nombre : 'La rayita']]),
    ['Tipografía', parejaDe(marca?.theme?.fonts)?.nombre ?? 'La de la plantilla'],
  ].filter(([, valor]) => valor)
  const paleta = [
    ['Principal', colores.primary],
    ['Acento', colores.accent],
    ['Fondo', colores.bg],
    ['Texto', colores.text],
    ...(colores.header ? [['Cabecera', colores.header]] : []),
  ].filter(([, c]) => c)
  const creacion = historial?.[0]
  return (
    <div className="grid gap-[1rem] rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
      <p className="text-[1rem] font-bold">Información de la copia</p>
      <dl className="grid gap-[0.45rem] text-[0.9rem]">
        {filas.map(([nombreFila, valor]) => (
          <div key={nombreFila} className="flex justify-between gap-[1rem]">
            <dt className="text-zinc-500">{nombreFila}</dt>
            <dd className="text-right font-semibold">{valor}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-[1rem]">
          <dt className="text-zinc-500">Dirección</dt>
          <dd className="text-right font-semibold">{ruta}</dd>
        </div>
      </dl>
      {paleta.length > 0 && (
        <div className="grid gap-[0.4rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Colores</p>
          <div className="flex flex-wrap gap-[0.9rem]">
            {paleta.map(([nombreColor, c]) => (
              <div key={nombreColor} className="grid justify-items-center gap-[0.2rem]">
                <span className="h-[2.2rem] w-[2.2rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
                <span className="text-[0.72rem] text-zinc-500">{nombreColor}</span>
                <span className="font-mono text-[0.72rem] text-zinc-400">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {creacion && (
        <div className="grid gap-[0.3rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Cómo se creó</p>
          <p className="text-[0.9rem] leading-[1.45]">{creacion.peticion}</p>
          {creacion.resumen && <p className="text-[0.88rem] leading-[1.45] text-zinc-600">{creacion.resumen}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-[0.6rem]">
        <button type="button" onClick={onEditar} className={BOTON}>
          Editar
        </button>
        {/* Solo las miniwebs y fichas: pasan de demo a página de un cliente, en la dirección corta del QR */}
        {onExportar && (
          <button type="button" onClick={onExportar} className="rounded-[0.6rem] bg-white px-[1rem] py-[0.75rem] text-[1rem] font-semibold text-zinc-900 ring-1 ring-zinc-300">
            {fila?.cambios?._cliente ? 'Volver a demo' : 'Exportar para cliente'}
          </button>
        )}
      </div>
      {fila?.cambios?._cliente && (
        <p className="text-[0.85rem] leading-[1.45] text-zinc-600">
          Es la página de un cliente: su dirección es <span className="font-semibold">{ruta}</span>, la que va en el QR. No cambies nunca su dirección una vez impreso.
        </p>
      )}
    </div>
  )
}

function Editor({ tipo, slug, fila, volver, recargar, abrir, irANuevoPerfil }) {
  const buscar = tipo === 'negocio' ? getNegocio : getCarta
  const original = buscar(slug) ?? (fila?.base ? buscar(fila.base) : null)
  const esCopia = Boolean(fila?.base)
  const [cambios, setCambios] = useState(fila?.cambios ?? {})
  const [guardados, setGuardados] = useState(fila?.cambios ?? {})
  const [estado, setEstado] = useState(null)
  const [pregunta, setPregunta] = useState(null)
  const [duplicando, setDuplicando] = useState(null)
  // Una copia se abre con su información; el editor entero se ve al pulsar Editar
  const [editando, setEditando] = useState(false)
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
  const verInfo = esCopia && !editando
  const nombre = tipo === 'negocio' ? vista.nombre : marcaDe(vista)?.nombre ?? slug
  const ruta =
    tipo === 'negocio' ? (esCopia ? (fila?.cambios?._cliente ? `/${slug}` : `/demo/${slug}`) : rutaNegocio(original)) : esCopia ? (fila?.cambios?._cliente ? `/${slug}/carta` : `/demo/${slug}/carta`) : rutaCarta(original)

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
    // Los mismos campos (con su máximo de caracteres) para pedir y para comprobar lo que devuelve
    const camposIA = camposParaIA(vista)
    const { resultado } = await llamar('asistente', {
      paso: 'retocar',
      peticion,
      perfil: tipo === 'carta' ? 'carta' : tipoDe(vista),
      historial: historial.map(h => h.peticion),
      campos: camposIA,
      // En las cartas, también sus secciones y su menú, por si piden añadir, quitar o mover platos
      carta: estructuraCarta(vista),
      alergenos: Object.keys(ALERGENOS),
      tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
      tipografiaActual: parejaDe(fonts)?.id ?? '',
      // En las fichas, también el aspecto (por si piden "otras pestañas" o "otro estilo")
      ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? { piezas: piezasParaIA(), disenoActual: vista.hero?.diseno, barraActual: vista.hero?.barra ?? HEROS[vista.hero?.diseno]?.barra } : {}),
    })
    const deLaIA = { ...(await cambiosDeIA(resultado, camposIA, vista)), ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? piezasDeIA(resultado, vista) : {}) }
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

  // Exportar para cliente: la copia pasa de demo (/demo/slug) a página de cliente (/slug, la dirección corta del QR); o vuelve a demo.
  // Se guarda como la marca _cliente de sus cambios
  const marcarCliente = async valor => {
    const nuevos = { ...cambios }
    if (valor) nuevos._cliente = true
    else delete nuevos._cliente
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios: nuevos })
    if (error) return setEstado('error')
    setCambios(nuevos)
    setGuardados(nuevos)
    setVersion(v => v + 1)
    recargar()
  }

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

      {/* Una copia se abre con su información y un botón Editar; el chat con el asistente y los ajustes solo con Editar */}
      {verInfo && <InfoCopia
          vista={vista}
          tipo={tipo}
          fila={{ ...fila, cambios }}
          historial={historial}
          ruta={ruta}
          onEditar={() => irANuevoPerfil(`${tipo}:${slug}`)}
          onExportar={() => {
            // La dirección: la de una miniweb o ficha es /slug; la de una carta, /slug/carta
            const fin = tipo === 'carta' ? '/carta' : ''
            return cambios._cliente
              ? setPregunta({ titulo: '¿Volver a demo?', texto: `Dejará de abrirse en /${slug}${fin} y pasará a /demo/${slug}${fin}.${tipo === 'carta' ? ' Las miniwebs que la usen en su menú dejarán de enseñarla.' : ''} Si ya has impreso el QR con la dirección corta, dejaría de funcionar.`, boton: 'Volver a demo', peligro: true, accion: () => marcarCliente(false) })
              : setPregunta({ titulo: '¿Exportar para cliente?', texto: `Pasa a /${slug}${fin}, la dirección corta del QR, y deja de verse en /demo/${slug}${fin}.${tipo === 'carta' ? ' Así podrás elegirla en el menú de una miniweb.' : ''} Una vez impreso el QR, no cambies nunca esta dirección.`, boton: 'Exportar', accion: () => marcarCliente(true) })
          }}
        />}
      {esCopia && editando && <Retocar historial={historial} enviar={retocar} />}

      {/* En las cartas, el menú del día no se edita aquí: es del dueño */}
      {tipo === 'carta' && !verInfo && (
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
      {!verInfo && (
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
      )}
    </div>

      {/* Vista previa: la página tal cual está guardada, del tamaño de un móvil; se recarga al guardar */}
      <aside className="sticky top-[1rem] hidden lg:block">
        {/* La página a 360 px de ancho (el móvil bajo), reducida entera para caber en el marco */}
        <Movil key={version} src={ruta} titulo="Vista previa" ancho={360} className="mx-auto w-full max-w-[21rem]" />
        <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500">Vista previa de lo guardado</p>
      </aside>

      {/* Guardar, siempre a mano abajo (no en las demos originales, que no se guardan) */}
      {!soloLectura && !verInfo && (
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
// Apartado de Nuevo perfil que se pliega: cerrado, el título y lo elegido; al tocarlo se abren las opciones
function Plegable({ titulo, elegido, children, abierto = false }) {
  return (
    <details open={abierto} className="group rounded-[0.75rem] ring-1 ring-zinc-200">
      <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.7rem] [&::-webkit-details-marker]:hidden">
        <span className="text-[0.85rem] font-semibold text-zinc-500">{titulo}</span>
        <span className="ml-auto min-w-0 truncate text-[0.9rem] font-semibold">{elegido}</span>
        <ChevronDown className="h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">{children}</div>
    </details>
  )
}

// El icono de cada temática en la fila de Nuevo perfil
const ICONOS_TEMA = {
  restaurante: UtensilsCrossed,
  bar: Beer,
  pizzeria: Pizza,
  'cocina-visual': Fish,
  cafeteria: Coffee,
  pasteleria: Croissant,
  peluqueria: Scissors,
  unas: Sparkles,
  barberia: Armchair,
}

/* El editor de colores de una miniweb (catálogo en lib/coloresMiniweb.js), por grupos: menú, redes, fondos, textos y botón. Cada color es
   un círculo con el color que se pinta ahora (con borde de rayitas si es el automático, el que se pone solo según el diseño); al
   tocarlo se abre el cuadro de colores y, elegido uno, aparece su código y un enlace para volver a automático.
   valores: lo elegido; autos: el color automático de cada rol; cambiar(clave, color) y cambiar(clave, undefined) para volver a él */
function PanelColoresMiniweb({ valores, cambiar, autos = {}, sinTitulo = false }) {
  return (
    <div className="grid gap-[1rem] lg:grid-cols-2 lg:items-start lg:gap-x-[1.75rem]">
      {!sinTitulo && <span className="text-[0.8rem] font-semibold text-zinc-500 lg:col-span-2">Colores</span>}
      {COLORES_MINIWEB.map(g => (
        <div key={g.grupo} className={`grid gap-[0.5rem] ${g.ancho ? "lg:col-span-2" : ""}`}>
          <p className="text-[0.85rem] font-bold">{g.grupo}</p>
          <div className="flex flex-wrap items-start gap-x-[1.2rem] gap-y-[0.8rem]">
            {g.campos.map(c => {
              const valor = valores[c.clave]
              return (
                <div key={c.clave} className="grid justify-items-center gap-[0.25rem]" title={c.ayuda}>
                  <p className="text-[0.8rem] font-semibold text-zinc-500">{c.corto}</p>
                  <CampoColor valor={valor ?? autos[c.clave] ?? '#FFFFFF'} auto={!valor} soloCirculo cambiar={v => cambiar(c.clave, v)} />
                  {valor && (
                    <button type="button" title="Volver a automático" aria-label={`Volver a automático: ${c.nombre}`} onClick={() => cambiar(c.clave, undefined)} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                      <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Cuántas fotos usa la portada de cada diseño en la pestaña Inicio: Retrato, la del fondo y tres abajo; Polaroid y Galería, cuatro;
// Mosaico, tres que rotan; Fullbleed y Editorial, tres que pasan. Cortes (Diagonal) usa una sola
const FOTOS_PORTADA = { retrato: 4, polaroid: 4, galeria: 4, mosaico: 3, fullbleed: 3, editorial: 3 }

// Cuántas fotos admite cada diseño en Inicio, de un mínimo a un máximo (con X para quitar y Añadir foto en Imágenes); los demás, un número fijo
const RANGO_FOTOS = { galeria: [1, 8], fullbleed: [2, 8], editorial: [2, 8], polaroid: [1, 4] }

// Completa las fotos de una pestaña de Inicio hasta las que pide su portada, repitiendo las que hay (son de relleno: se cambian en Imágenes).
// Sin ninguna foto, no hay con qué rellenar y se deja como está
function conFotosDePortada(pestana, cuantas) {
  const base = pestana?.fotos?.length ? pestana.fotos : pestana?.foto ? [{ src: pestana.foto, alt: '' }] : []
  if (!cuantas || !base.length || base.length >= cuantas) return pestana
  const fotos = [...base]
  for (let i = 0; fotos.length < cuantas; i++) fotos.push({ ...base[i % base.length] })
  return { ...pestana, fotos }
}

// El texto extra con el que empiezan Editorial, Cortes (Diagonal) y Fullbleed
const TEXTO_EXTRA_EJEMPLO = 'De martes a domingo, de 13:00 a 23:00'

// Las piezas que se pueden mover en una miniweb (hero.redesEn, hero.menuEn y hero.compartirEn), con su valor de siempre primero
const ESTRUCTURA_MINIWEB = [
  ['redesEn', 'Redes', [['arriba', 'Arriba'], ['lateral', 'Lateral'], ['medio', 'Medio'], ['abajo', 'Abajo']]],
  ['menuEn', 'Menú de navegación (Inicio, Menú, Horario...)', [['arriba', 'Arriba'], ['abajo', 'Abajo']]],
  ['compartirEn', 'Compartir', [['diseno', 'Como el diseño'], ['abajo', 'Junto al botón'], ['redes', 'En las redes']]],
  ['contactoEn', 'Contacto (Reservar, Cita, Encargos...)', [['boton', 'Botón de WhatsApp'], ['reserva', 'Formulario de reserva (restauración)'], ['cita', 'Formulario de cita (estética)']]],
]
const ESTRUCTURA_DEFECTO = { redesVinculadas: false, redesEn: 'arriba', menuEn: 'arriba', compartirEn: 'diseno' }

// Esas piezas, cada una con sus opciones. valores: lo elegido (sin elegir, lo de siempre); cambiar(clave, valor)
// El estilo del menú de navegación de una miniweb, con subpestañas como Portada: un icono por grupo (De texto, Con forma) y, al tocarlo,
// los iconos de sus estilos; debajo, el nombre del elegido. valor: la clave de BARRAS o '' (la rayita de siempre)
function FilaEstiloMenu({ valor, cambiar }) {
  const [abierta, setAbierta] = useState(true)
  const nombres = { '': 'La rayita (la de siempre)', ...Object.fromEntries(Object.entries(BARRAS).map(([clave, b]) => [clave, b.nombre])) }
  const grupo = GRUPOS_MENU.find(g => g.claves.includes(valor)) ?? GRUPOS_MENU[0]
  const icono = 'flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300'
  const dibujar = trazos => (
    <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: trazos }} />
  )
  return (
    <div className="grid gap-[0.45rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">Estilo del menú de navegación</span>
      <div className="flex flex-wrap items-center gap-[0.4rem]">
        {GRUPOS_MENU.map(g => (
          <button
            key={g.clave}
            type="button"
            title={g.nombre}
            aria-label={`Menú ${g.nombre}`}
            aria-pressed={grupo.clave === g.clave}
            onClick={() => {
              // Tocar otra vez el grupo elegido abre o cierra sus estilos; tocar otro, elige su primero
              if (grupo.clave === g.clave) setAbierta(v => !v)
              else {
                cambiar(g.claves[0])
                setAbierta(true)
              }
            }}
            className={`${icono} ${grupo.clave === g.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
          >
            {dibujar(g.dibujo)}
          </button>
        ))}
      </div>
      <p className="text-[0.85rem] font-semibold">{grupo.nombre}</p>
      {abierta && (
        <div className="grid gap-[0.4rem]">
          <div className="flex flex-wrap gap-[0.4rem]">
            {grupo.claves.map(clave => (
              <button
                key={clave || 'rayita'}
                type="button"
                title={nombres[clave]}
                aria-label={`Estilo ${nombres[clave]}`}
                aria-pressed={valor === clave}
                onClick={() => cambiar(clave)}
                className={`${icono} ${valor === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
              >
                {dibujar(DIBUJOS_MENU[clave])}
              </button>
            ))}
          </div>
          <p className="text-[0.8rem] text-zinc-500">{nombres[valor]}</p>
        </div>
      )}
    </div>
  )
}

// El diseño del horario de una miniweb, con la fila de iconos de Portada (5 y un + en el móvil, todos en ordenador) y el nombre del elegido
// debajo. Al tocar el diseño elegido se abre o se cierra la lista de sus variantes (subpestañas). valor: la clave de lib/horarios.js o ''
// (la lista de siempre); variante: la clave de la variante ('clasica' es la primera)
function FilaHorario({ valor, cambiar, variante, cambiarVariante }) {
  const [mas, setMas] = useState(false)
  const [abierta, setAbierta] = useState(true)
  const actual = valor || 'lista'
  const diseno = HORARIOS.find(h => h.clave === actual)
  const variantes = diseno?.variantes ?? []
  return (
    <div className="grid gap-[0.45rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">Diseño del horario</span>
      <div className="flex flex-wrap items-center gap-[0.4rem]">
        {HORARIOS.map((h, i) => (
          <button
            key={h.clave}
            type="button"
            title={h.nombre}
            aria-label={`Horario ${h.nombre}`}
            aria-pressed={actual === h.clave}
            onClick={() => {
              // Al tocar otra vez el diseño elegido, la lista de sus variantes se cierra o se abre; al elegir otro, vuelve a la primera
              if (actual === h.clave) setAbierta(v => !v)
              else {
                cambiar(h.clave === 'lista' ? '' : h.clave)
                cambiarVariante('clasica')
                setAbierta(true)
              }
            }}
            className={`${i >= 5 && !mas ? 'hidden lg:flex' : 'flex'} h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${actual === h.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
          >
            <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: h.dibujo }} />
          </button>
        ))}
        <button
          type="button"
          aria-label={mas ? 'Ver menos diseños' : 'Ver más diseños'}
          aria-expanded={mas}
          onClick={() => setMas(v => !v)}
          className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105 lg:hidden"
          style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
        >
          {mas ? <Minus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" />}
        </button>
      </div>
      <p className="text-[0.85rem] font-semibold">{diseno?.nombre}</p>
      {/* Las variantes del diseño elegido, como subpestañas con su icono */}
      {abierta && variantes.length > 0 && (
        <div className="grid gap-[0.4rem]">
          <div className="flex flex-wrap gap-[0.4rem]">
            {variantes.map(v => (
              <button
                key={v.clave}
                type="button"
                title={v.nombre}
                aria-label={`Variante ${v.nombre}`}
                aria-pressed={variante === v.clave}
                onClick={() => cambiarVariante(v.clave)}
                className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${variante === v.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
              >
                <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: v.dibujo }} />
              </button>
            ))}
          </div>
          <p className="text-[0.8rem] text-zinc-500">{variantes.find(v => v.clave === variante)?.nombre}</p>
        </div>
      )}
    </div>
  )
}

// La carta que pinta el menú de la miniweb: una de las cartas hechas (con su diseño) o, sin elegir, el menú propio de la miniweb
function SelectorCartaMiniweb({ valor, cambiar, exportadas = [] }) {
  return (
    <Etiqueta texto="Carta del menú">
      <select value={valor ?? ''} onChange={e => cambiar(e.target.value || undefined)} className={CAMPO}>
        <option value="">El menú de la miniweb (el de siempre)</option>
        {cartas.map(c => (
          <option key={c.slug} value={c.slug}>
            {marcaDe(c)?.nombre ?? c.slug} ({c.diseno})
          </option>
        ))}
        {/* Las cartas que has diseñado y exportado para cliente (Exportar para cliente en su pantalla de información) */}
        {exportadas.map(f => (
          <option key={f.slug} value={f.slug}>
            {f.cambios?.['marca.nombre'] ?? f.cambios?.marca?.nombre ?? f.slug} ({f.cambios?.diseno ?? 'carta'}, exportada)
          </option>
        ))}
      </select>
    </Etiqueta>
  )
}

// contactoPorDefecto: lo que hace la miniweb si no se elige nada (las de comida, el formulario de reserva; las demás, el botón de WhatsApp)
function EstructuraMiniweb({ valores, cambiar, sinTitulo = false, contactoPorDefecto = 'boton' }) {
  return (
    <div className="grid gap-[0.9rem] lg:grid-cols-2 lg:items-start lg:gap-x-[1.75rem]">
      {!sinTitulo && <span className="text-[0.8rem] font-semibold text-zinc-500 lg:col-span-2">Estructura: dónde va cada pieza</span>}
      {ESTRUCTURA_MINIWEB.map(([clave, texto, opciones]) => {
        // Los valores viejos de las redes ('barra' y 'boton') son 'arriba' y 'medio'
        const actual = clave === 'contactoEn' ? (valores[clave] === 'formulario' ? (contactoPorDefecto === 'reserva' ? 'reserva' : 'cita') : valores[clave] ?? contactoPorDefecto) : ({ barra: 'arriba', boton: 'medio' })[valores[clave]] ?? valores[clave] ?? ESTRUCTURA_DEFECTO[clave]
        // Con las redes vinculadas al menú, su sitio lo decide el menú: las opciones se bloquean
        const bloqueada = clave === 'redesEn' && Boolean(valores.redesVinculadas)
        return (
          <div key={clave} className={`grid gap-[0.4rem] ${clave === 'compartirEn' ? 'lg:col-span-2' : ''}`}>
            <span className="text-[0.8rem] text-zinc-500">{texto}</span>
            {/* Un icono por opción (un móvil con la pieza en su sitio) y, debajo, el nombre de la elegida */}
            <div className={`flex flex-wrap items-center gap-[0.4rem] ${bloqueada ? 'opacity-50' : ''}`}>
              {opciones.map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  title={etiqueta}
                  aria-label={`${texto}: ${etiqueta}`}
                  aria-pressed={actual === valor}
                  disabled={bloqueada}
                  onClick={() => cambiar(clave, valor)}
                  className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 disabled:cursor-not-allowed ${actual === valor ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                >
                  <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONOS_ESTRUCTURA[clave]?.[valor] ?? '' }} />
                </button>
              ))}
            </div>
            <p className="text-[0.85rem] font-semibold">{opciones.find(([valor]) => valor === actual)?.[1]}</p>
            {/* Redes: pegarlas siempre al menú de navegación (debajo de él si está arriba y encima si está abajo) */}
            {clave === 'redesEn' && (
              <label className="flex cursor-pointer items-center gap-[0.5rem] text-[0.85rem] font-semibold">
                <input type="checkbox" checked={Boolean(valores.redesVinculadas)} onChange={e => cambiar('redesVinculadas', e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
                Vincular al menú de navegación
              </label>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Diseños de arriba que de momento no salen como portada de una miniweb
const SIN_PORTADA_MINIWEB = ['banner', 'ficha', 'portada', 'historias']

// El nombre de cada diseño en la fila de Nuevo perfil: Diagonal se llama Cortes (tiene varios cortes)
const nombreDeDiseno = clave => (clave === 'diagonal' ? 'Cortes' : clave === 'editorial' ? 'Formatos' : HEROS[clave]?.nombre)

// El icono de cada diseño de arriba en la fila de Nuevo perfil
const ICONOS_DISENO = {
  editorial: Newspaper,
  banner: PanelTop,
  diagonal: Slice,
  fullbleed: Maximize,
  mosaico: LayoutGrid,
  portada: BookImage,
  retrato: CircleUser,
  ficha: IdCard,
  galeria: GalleryHorizontal,
  polaroid: Camera,
  historias: Smartphone,
}

/* Todos los datos editables de la página, en bruto: los mismos desplegables del editor de un perfil (Pestaña Inicio, Reseña de Google, Redes,
   Carrusel...), para tocar cualquier cosa de la miniweb o la ficha que se está montando. original: los datos sin estos cambios; cambios: los de
   aquí (ruta → valor); cambiar(ruta, valor). El editor de un perfil sigue como está: esto es una copia de su forma de enseñarlos */
function EditorEnBruto({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const campos = useMemo(() => camposDe(datos), [datos])
  const bloques = useMemo(() => organizar(datos, campos), [datos, campos])
  const campo = (c, enTarjeta = false) => {
    const valor = leerRuta(datos, c.ruta) ?? ''
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
          <CampoFoto valor={valor} cambiar={v => cambiar(c.ruta, v)} carpeta="negocio/nuevo" sugerencia={datos.sector ?? ''} />
        ) : c.clase === 'largo' ? (
          <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
        ) : (
          <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
        )}
      </div>
    )
  }
  campo.volverTarjeta = t => t.campos.forEach(c => cambiar(c.ruta, leerRuta(original, c.ruta)))
  campo.tarjetaCambiada = t => t.campos.some(c => c.ruta in cambios)
  return (
    <div className="grid gap-[0.75rem]">
      {/* Redes y Reseña de Google, tal cual */}
      {bloques
        .filter(b => ['Redes', 'Reseña de Google'].includes(b.titulo))
        .map(b => (
          <Bloque key={b.clave} bloque={b} abierto={false} campo={campo} />
        ))}
      {/* Debajo, Ajustes personalizados: todo lo demás del editor de un perfil (Datos, Arriba, Colores de la marca, las pestañas, Tarjeta destacada, Carrusel...), para los ajustes que aún no están extraídos */}
      <details className="group/ajustes rounded-[0.75rem] ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
          <span className="text-[1rem] font-bold">Ajustes personalizados</span>
          <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/ajustes:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-[0.75rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          {bloques
            .filter(b => !['Redes', 'Reseña de Google'].includes(b.titulo))
            .map(b => (
              <Bloque key={b.clave} bloque={b} abierto={false} campo={campo} />
            ))}
        </div>
      </details>
    </div>
  )
}

/* Las imágenes de la página, solo ellas, por pestaña (Inicio, Menú, Horario...): para cada una, su miniatura con el buscador de fotos y el
   botón de subir la tuya. Salen de los mismos datos que los desplegables en bruto (original y cambios, con cambiar(ruta, valor)) */
function ImagenesPorPestana({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const grupos = useMemo(() => {
    const fotos = camposDe(datos).filter(c => c.clase === 'foto')
    const pestanas = datos.hero?.pestanas ?? []
    const porPestana = new Map()
    const otras = []
    // Una carta (con secciones): sus fotos por zonas, la portada, el menú del día, las ofertas y cada sección con sus platos
    const deCarta = Array.isArray(datos.secciones)
    const zonas = new Map()
    const zonaDe = ruta => {
      const [primero, indice] = ruta.split('.')
      if (primero === 'foto') return ['0', 'Portada']
      if (primero === 'menuDia') return ['1', 'Menú del día']
      if (primero === 'ofertas') return ['2', 'Ofertas']
      if (primero === 'secciones') return [`3-${indice}`, datos.secciones[Number(indice)]?.nombre ?? `Sección ${Number(indice) + 1}`]
      return ['9', 'Otras imágenes']
    }
    for (const c of fotos) {
      const m = c.ruta.match(/^hero\.pestanas\.(\d+)\./)
      if (m) porPestana.set(Number(m[1]), [...(porPestana.get(Number(m[1])) ?? []), c])
      else if (deCarta) {
        const [clave, titulo] = zonaDe(c.ruta)
        zonas.set(clave, { clave, titulo, campos: [...(zonas.get(clave)?.campos ?? []), c] })
      } else otras.push(c)
    }
    if (deCarta) return [...zonas.values()].sort((x, y) => x.clave.localeCompare(y.clave, 'es', { numeric: true }))
    return [
      ...[...porPestana.entries()].sort((a, b) => a[0] - b[0]).map(([i, campos]) => ({ clave: `p${i}`, titulo: pestanas[i]?.texto ?? `Pestaña ${i + 1}`, campos })),
      ...(otras.length ? [{ clave: 'otras', titulo: 'Otras imágenes', campos: otras }] : []),
    ]
  }, [datos])
  if (!grupos.length) return <p className="text-[0.8rem] text-zinc-500">Esta página no tiene imágenes que cambiar.</p>
  // Las fotos de Inicio (hero.pestanas.0.fotos) pueden ser más o menos según el diseño: se quitan con la X y se añaden con Añadir foto.
  // Se guarda la lista entera (con lo ya cambiado) y se quitan los cambios sueltos de cada foto, que ya no valdrían
  const listaInicio = datos.hero?.pestanas?.[0]?.fotos
  const rango = RANGO_FOTOS[datos.hero?.portada]
  const puedeEditarLista = Boolean(rango && Array.isArray(listaInicio) && listaInicio.length > 0 && listaInicio.every(f => f && typeof f === 'object'))
  const guardarLista = nuevas => {
    for (const ruta of Object.keys(cambios)) {
      if (ruta.startsWith('hero.pestanas.0.fotos.')) cambiar(ruta, leerRuta(original, ruta))
    }
    cambiar('hero.pestanas.0.fotos', nuevas)
  }
  const quitarFoto = i => guardarLista(listaInicio.filter((_, k) => k !== i))
  const anadirFoto = () => guardarLista([...listaInicio, { ...listaInicio[0] }])
  return (
    <div className="grid gap-[1.1rem]">
      {grupos.map(g => (
        <div key={g.clave} className="grid gap-[0.7rem]">
          <p className="text-[0.95rem] font-bold">{g.titulo}</p>
          {g.campos.map(c => (
            <div key={c.ruta} className="grid gap-[0.3rem]">
              <div className="flex items-baseline justify-between gap-[0.75rem]">
                <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
                {c.ruta in cambios && (
                  <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                    Volver al original
                  </button>
                )}
              </div>
              <CampoFoto
                valor={leerRuta(datos, c.ruta) ?? ''}
                cambiar={v => cambiar(c.ruta, v)}
                carpeta="negocio/nuevo"
                sugerencia={datos.sector ?? ''}
                quitar={(() => {
                  const m = c.ruta.match(/^hero\.pestanas\.0\.fotos\.(\d+)\.src$/)
                  return puedeEditarLista && m && listaInicio.length > rango[0] ? () => quitarFoto(Number(m[1])) : undefined
                })()}
              />
            </div>
          ))}
          {/* Añadir una foto más a Inicio, hasta el máximo del diseño: empieza repitiendo la primera, para cambiarla con Buscar o Subir */}
          {g.clave === 'p0' && puedeEditarLista && listaInicio.length < rango[1] && (
            <button type="button" onClick={anadirFoto} className="inline-flex items-center gap-[0.4rem] justify-self-start rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300">
              <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
              Añadir foto
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/* Las horas de una línea del horario: se escriben como texto ("13:00 a 16:30 y 20:00 a 23:30" o "Cerrado"), y aquí se editan con selectores de
   hora (desde y hasta, uno o dos tramos) y una casilla de Cerrado. Si el texto no se puede entender como horas (por ejemplo, "Con cita
   previa"), se edita como texto normal */
const TRAMO_HORAS = /(\d{1,2}):(\d{2})\s*(?:a|-|–)\s*(\d{1,2}):(\d{2})/g
const dosCifras = (h, m) => `${String(h).padStart(2, '0')}:${m}`
const leerHoras = texto => {
  const t = texto.trim()
  if (/^cerrad/i.test(t)) return { cerrado: true, tramos: [] }
  const tramos = [...t.matchAll(TRAMO_HORAS)].map(m => ({ d: dosCifras(m[1], m[2]), h: dosCifras(m[3], m[4]) }))
  // Solo vale si, quitados los tramos, no queda más que "y" y separadores
  const resto = t.replace(TRAMO_HORAS, '').replace(/[\sy,]/g, '')
  return tramos.length && !resto ? { cerrado: false, tramos } : null
}
const escribirHoras = ({ cerrado, tramos }) => (cerrado || !tramos.length ? 'Cerrado' : tramos.map(t => `${t.d} a ${t.h}`).join(' y '))

function HorasLinea({ valor, cambiar }) {
  const horas = leerHoras(valor)
  if (!horas) return <input value={valor} onChange={e => cambiar(e.target.value)} className={CAMPO} />
  const poner = nuevo => cambiar(escribirHoras(nuevo))
  const hora = 'h-[2.4rem] w-[6.2rem] rounded-[0.5rem] border border-zinc-300 bg-white px-[0.4rem] text-[0.9rem]'
  const cambiarTramo = (k, campo, v) => poner({ ...horas, tramos: horas.tramos.map((t, n) => (n === k ? { ...t, [campo]: v || t[campo] } : t)) })
  return (
    <div className="flex flex-wrap items-center gap-x-[0.7rem] gap-y-[0.4rem]">
      {horas.cerrado ? (
        <span className="text-[0.88rem] font-semibold text-zinc-500">Cerrado</span>
      ) : (
        horas.tramos.map((t, k) => (
          <div key={k} className="flex items-center gap-[0.3rem]">
            <input type="time" value={t.d} onChange={e => cambiarTramo(k, 'd', e.target.value)} className={hora} aria-label="Desde" />
            <span className="text-[0.85rem] text-zinc-500">a</span>
            <input type="time" value={t.h} onChange={e => cambiarTramo(k, 'h', e.target.value)} className={hora} aria-label="Hasta" />
            {horas.tramos.length > 1 && (
              <button type="button" aria-label="Quitar este tramo" onClick={() => poner({ ...horas, tramos: horas.tramos.filter((_, n) => n !== k) })} className="rounded-full p-[0.25rem] text-zinc-500 hover:text-zinc-900">
                <X className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.5} aria-hidden="true" />
              </button>
            )}
          </div>
        ))
      )}
      {!horas.cerrado && horas.tramos.length < 2 && (
        <button type="button" onClick={() => poner({ ...horas, tramos: [...horas.tramos, { d: '20:00', h: '23:00' }] })} className="rounded-full bg-zinc-100 px-[0.7rem] py-[0.3rem] text-[0.8rem] font-semibold text-zinc-600 hover:bg-zinc-200">
          + Otro tramo
        </button>
      )}
      <label className="flex cursor-pointer items-center gap-[0.35rem] text-[0.85rem] font-semibold">
        <input
          type="checkbox"
          checked={horas.cerrado}
          onChange={e => poner({ cerrado: e.target.checked, tramos: horas.tramos.length ? horas.tramos : [{ d: '10:00', h: '14:00' }] })}
          className="h-[1.1rem] w-[1.1rem]"
        />
        Cerrado
      </label>
    </div>
  )
}

/* Todos los textos editables de la pestaña del Horario: el título, la nota, la dirección... y cada línea de días y horas (el día como texto y las
   horas con selectores). Sin fotos ni el nombre de la pestaña en la barra. Salen de los mismos datos que los desplegables en bruto (original y
   cambios, con cambiar(ruta, valor)) */
function TextosHorario({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const i = (datos.hero?.pestanas ?? []).findIndex(p => p.tipo === 'horario')
  const campos = useMemo(() => {
    if (i < 0) return []
    return camposDe(datos).filter(
      c => c.ruta.startsWith(`hero.pestanas.${i}.`) && (c.clase === 'texto' || c.clase === 'largo') && !c.ruta.endsWith('.texto') && !c.ruta.includes('.lineas.'),
    )
  }, [datos, i])
  if (i < 0) return <p className="text-[0.8rem] text-zinc-500">Esta página no tiene pestaña de horario.</p>
  const lineas = datos.hero.pestanas[i].lineas ?? []
  const volver = ruta => (
    <button type="button" onClick={() => cambiar(ruta, leerRuta(original, ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
      Volver al original
    </button>
  )
  return (
    <div className="grid gap-[1rem]">
      {campos.map(c => {
        const valor = leerRuta(datos, c.ruta) ?? ''
        return (
          <div key={c.ruta} className="grid gap-[0.3rem]">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
              {c.ruta in cambios && volver(c.ruta)}
            </div>
            {c.clase === 'largo' ? (
              <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
            ) : (
              <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
            )}
          </div>
        )
      })}
      {lineas.length > 0 && (
        <div className="grid gap-[0.7rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Líneas del horario</p>
          {lineas.map((l, j) => {
            const rutaDias = `hero.pestanas.${i}.lineas.${j}.dias`
            const rutaHoras = `hero.pestanas.${i}.lineas.${j}.horas`
            return (
              <div key={j} className="grid gap-[0.4rem] rounded-[0.8rem] bg-zinc-50 p-[0.8rem] ring-1 ring-zinc-200">
                <div className="flex items-baseline justify-between gap-[0.75rem]">
                  <span className="text-[0.78rem] text-zinc-500">Días</span>
                  {(rutaDias in cambios || rutaHoras in cambios) && (
                    <button
                      type="button"
                      onClick={() => {
                        cambiar(rutaDias, leerRuta(original, rutaDias))
                        cambiar(rutaHoras, leerRuta(original, rutaHoras))
                      }}
                      className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]"
                    >
                      Volver al original
                    </button>
                  )}
                </div>
                <input value={l.dias ?? ''} onChange={e => cambiar(rutaDias, e.target.value)} className={CAMPO} />
                <span className="text-[0.78rem] text-zinc-500">Horas</span>
                <HorasLinea valor={l.horas ?? ''} cambiar={v => cambiar(rutaHoras, v)} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Un campo para subir una imagen al asistente (solo la lee): botón con su texto o, subida, su miniatura (con los colores que ha sacado, si los
// saca) y una x para quitarla. valor: { imagen, tipo, miniatura, colores } o null
function CampoImagenAsistente({ titulo, valor, cambiar, conColores = false, bloqueado, avisar }) {
  if (valor)
    return (
      <div className="flex items-center gap-[0.5rem]">
        <img src={valor.miniatura} alt={titulo} className="h-[2.75rem] w-[2.75rem] rounded-[0.5rem] border border-zinc-300 object-contain" />
        {conColores && valor.colores.length > 0 && (
          <div className="flex items-center gap-[0.25rem]" aria-label="Colores que ha sacado de la imagen">
            {valor.colores.map(c => (
              <span key={c.hex} title={`${c.hex} (${c.porcentaje}%)`} className="h-[1.4rem] w-[1.4rem] rounded-full ring-1 ring-zinc-300" style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <button type="button" aria-label={`Quitar: ${titulo}`} onClick={() => cambiar(null)} className="rounded-full p-[0.25rem] text-zinc-500 hover:text-zinc-900">
          <X className="h-[1rem] w-[1rem]" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    )
  return (
    <label className={`inline-flex min-h-[2.5rem] cursor-pointer items-center gap-[0.4rem] rounded-[0.6rem] bg-white px-[0.9rem] text-[0.9rem] font-semibold ring-1 ring-zinc-300 ${bloqueado ? 'pointer-events-none opacity-50' : ''}`}>
      <ImagePlus className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      {titulo}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={async e => {
          const archivo = e.target.files?.[0]
          e.target.value = ''
          if (!archivo) return
          try {
            cambiar(await leerReferencia(archivo, { colores: conColores }))
          } catch (err) {
            avisar(err.message)
          }
        }}
      />
    </label>
  )
}

// Los nombres de las pestañas del menú (Inicio, Menú, Horario, Reservar...): un campo por pestaña, de 10 caracteres como mucho para que quepan.
// Salen de los mismos datos que los desplegables en bruto (original y cambios, con cambiar(ruta, valor))
const NOMBRE_DE_TIPO = { inicio: 'Inicio', menu: 'Menú', servicios: 'Servicios', horario: 'Horario', reservar: 'Reservar' }
function TextosPestanas({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const pestanas = datos.hero?.pestanas ?? []
  if (!pestanas.length) return <p className="text-[0.8rem] text-zinc-500">Esta página no tiene pestañas.</p>
  return (
    <div className="grid gap-[0.9rem]">
      <p className="text-[0.8rem] text-zinc-500">El nombre que sale en el menú de navegación. Corto, de una o dos palabras.</p>
      {pestanas.map((p, i) => {
        const ruta = `hero.pestanas.${i}.texto`
        const valor = p.texto ?? ''
        return (
          <div key={ruta} className="grid gap-[0.3rem]">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <span className="text-[0.8rem] font-semibold text-zinc-500">{NOMBRE_DE_TIPO[p.tipo] ?? `Pestaña ${i + 1}`}</span>
              {ruta in cambios && (
                <button type="button" onClick={() => cambiar(ruta, leerRuta(original, ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                  Volver al original
                </button>
              )}
            </div>
            <input value={valor} maxLength={MAX_PESTANA} onChange={e => cambiar(ruta, e.target.value)} className={CAMPO} />
            <span className="justify-self-end text-[0.75rem] text-zinc-500">
              {valor.length}/{MAX_PESTANA}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Las cartas de ejemplo de cada tipo de carta (el diseño ya no depende de la temática): Carta, la de un restaurante con menú del día;
// Promociones, la de Laca, con ofertas (con su precio anterior tachado) y servicios por secciones
const CARTA_DE_TIPO = { carta: 'almendra', promociones: 'laca' }
// Un icono por estilo de carta (la clave es la del diseño de carta) y por tipo de carta, como en la fila de portadas de las miniwebs
const ICONOS_ESTILO_CARTA = { polaroid: Camera, galeria: GalleryHorizontal, revista: Newspaper, inmersiva: Maximize, base: List }
const ICONOS_TIPO_CARTA = { carta: UtensilsCrossed, promociones: BadgePercent }

function NuevoPerfil({ filas, recargar, abrir, cargar }) {
  const [tema, setTema] = useState(PLANTILLAS[0].clave)
  // La pestaña abierta: el asistente o el diseño (la vista previa se ve siempre)
  const [pestana, setPestana] = useState('personalizar')
  // Qué temáticas se ven en la fila de iconos: 5, o todas con el +
  // Si la lista de temáticas del grupo elegido (Restauración, Belleza...) está abierta
  const [subTemas, setSubTemas] = useState(true)
  const [producto, setProducto] = useState('miniweb')
  // En el modo Carta, el tipo de carta (en lugar de la temática): 'carta' (menú del día y platos) o 'promociones' (ofertas y servicios)
  const [tipoCarta, setTipoCarta] = useState('carta')
  // El subdiseño del estilo de carta (Inmersiva): 'fila' (la base) o 'columna'
  const [subCarta, setSubCarta] = useState('fila')
  // El color del detalle del precio del menú de la carta ('' : el de acento)
  const [colorPrecio, setColorPrecio] = useState('')
  // El color del número del precio del menú ('' : el de cada estilo)
  const [colorPrecioTexto, setColorPrecioTexto] = useState('')
  // El tamaño del precio del menú de la carta: 'xs', 'md' (el de cada estilo) o 'xl'
  const [tamanoPrecio, setTamanoPrecio] = useState('md')
  // Dónde va el enlace "Conoce [negocio]" de la carta: 'ninguno' (no sale), 'derecha' o 'izquierda'
  const [enlaceNegocio, setEnlaceNegocio] = useState('ninguno')
  // El velo de la foto de Inmersiva: intensidad (de 0 a 100; 100 es el de siempre) y color ('' : negro)
  const [filtroCarta, setFiltroCarta] = useState(100)
  const [colorFiltroCarta, setColorFiltroCarta] = useState('')
  // El diseño del detalle del precio del menú: 'raya' (el de siempre), 'ondulada', 'pincelada' o 'doble' (líneas); 'ovalo', 'repasado', 'arco', 'sello' o 'estrella' (círculos); o 'ninguno'
  const [detallePrecio, setDetallePrecio] = useState('raya')
  const [hero, setHero] = useState('polaroid')
  const [barra, setBarra] = useState('')
  const [estilo, setEstilo] = useState('revista')
  const [nombre, setNombre] = useState('')
  // Cómo sale el nombre arriba (fichas y miniwebs): escrito ('texto', lo de siempre) o con su logo ('logo')
  // Si el campo para subir el logo está abierto (el logo se sube junto al nombre; con uno subido, se usa)
  const [logoAbierto, setLogoAbierto] = useState(false)
  const [logo, setLogo] = useState('')
  const [principal, setPrincipal] = useState('')
  const [acento, setAcento] = useState('')
  const [colorTexto, setColorTexto] = useState('')
  const [fondo, setFondo] = useState('')
  const [letra, setLetra] = useState('')
  // Solo en miniwebs: los colores uno por uno (clave del catálogo → color); los que no están, en automático
  const [coloresMini, setColoresMini] = useState({})
  // Solo en miniwebs: los textos de la portada que se han escrito (titular1, titular2 y descripcion); los que no están, los de la demo
  const [textosMini, setTextosMini] = useState({})
  const cambiarColorMini = (clave, valor) =>
    setColoresMini(actual => {
      const nuevo = { ...actual, [clave]: valor }
      if (valor === undefined) delete nuevo[clave]
      return nuevo
    })
  // Solo en miniwebs: dónde van las redes, el menú y compartir (lo no tocado, como siempre)
  const [estructura, setEstructura] = useState({})
  // El corte de la foto de Diagonal ('diagonal' es el de siempre)
  const [corte, setCorte] = useState('diagonal')
  // Si la lista de subpestañas (cortes o formatos) está abierta bajo el diseño elegido
  const [subAbierta, setSubAbierta] = useState(true)
  // El formato de Editorial ('clasica' es el de siempre)
  const [formato, setFormato] = useState('clasica')
  // La disposición del texto de Fullbleed ('clasica' es la de siempre)
  const [disposicion, setDisposicion] = useState('clasica')
  // La composición de Mosaico ('clasica' es la de siempre)
  const [composicion, setComposicion] = useState('clasica')
  // La distribución de las fotos de Retrato ('clasica' es la de siempre)
  const [distribucion, setDistribucion] = useState('clasica')
  // El estilo de Galería ('clasica' es el de siempre)
  const [pase, setPase] = useState('clasica')
  // El montaje de Polaroid ('clasica' es el de siempre)
  const [montaje, setMontaje] = useState('clasica')
  // La carta que pinta el menú de la miniweb ('' : el menú de la propia miniweb)
  const [cartaMini, setCartaMini] = useState('')
  // El diseño del horario ('' : la lista de siempre)
  const [horarioMini, setHorarioMini] = useState('')
  // La variante del diseño del horario ('clasica' : la primera de cada diseño)
  const [horarioVar, setHorarioVar] = useState('clasica')
  // La intensidad del filtro que oscurece la foto de la portada, de 0 a 100 (100: el de cada diseño)
  const [filtroFoto, setFiltroFoto] = useState(100)
  // El tamaño del nombre del negocio arriba: 'xxs', 'xs', 'md' (el de cada diseño) o 'xl'
  const [tamanoNombre, setTamanoNombre] = useState('md')
  const lugares = Object.entries(estructura).filter(([clave, valor]) => valor !== ESTRUCTURA_DEFECTO[clave])
  // Fondo de cabecera: solo en los diseños que la tienen (sin elegir, el principal, como siempre)
  const [cabecera, setCabecera] = useState('')
  // Lo que se le cuenta al asistente del negocio: con esto se inventa el copy y busca las fotos al crear
  const [cuento, setCuento] = useState('')
  // Qué está haciendo al crear (null: nada)
  const [creando, setCreando] = useState(null)
  // El aviso de que el diseño se ha exportado a las muestras
  const [aviso, setAviso] = useState('')
  // El asistente montando el diseño de la miniweb (texto de lo que hace; null: nada) y lo que cuenta de lo que ha elegido
  const [disenando, setDisenando] = useState(null)
  const [resumenDiseno, setResumenDiseno] = useState('')
  // Los textos y fotos que ha hecho el asistente (cambios e historial), su versión (para recargar la vista previa) y el aviso de que toca hacerlos
  const [cambiosIA, setCambiosIA] = useState(null)
  const [versionIA, setVersionIA] = useState(0)
  const [redactando, setRedactando] = useState(false)
  // La imagen de referencia de la marca para el asistente (solo se lee; no se coloca): { imagen, tipo, miniatura, colores }
  const [referencia, setReferencia] = useState(null)
  // Una captura con información del negocio (la bio de Instagram, una carta...): el asistente solo lee su texto, sin sacar colores: { imagen, tipo, miniatura }
  const [captura, setCaptura] = useState(null)
  // Los datos que el asistente ha leído en esa imagen (nombre, teléfonos, dirección...): van con lo que se le cuenta al escribir los textos
  const [infoImagen, setInfoImagen] = useState('')
  // Las líneas del horario que ha sacado el asistente de lo que se le ha contado (días y horas)
  const [horarioIA, setHorarioIA] = useState([])
  // Si el asistente ya ha generado algo alguna vez: hasta entonces, en su pestaña el móvil sale vacío
  const [generado, setGenerado] = useState(false)
  // La copia que se ha cargado para retocarla ({ tipo, slug }) o null si se está montando una nueva, y si todo Nuevo perfil está abierto
  const [copiaCargada, setCopiaCargada] = useState(null)
  const [abierto, setAbierto] = useState(false)
  // Los cambios hechos a mano en los datos en bruto (ruta → valor) y su versión (para recargar la vista previa, con un pequeño retraso al escribir)
  const [cambiosExtra, setCambiosExtra] = useState({})
  const [versionExtra, setVersionExtra] = useState(0)
  const [error, setError] = useState('')

  const plantilla = PLANTILLAS.find(p => p.clave === tema)
  // El grupo de la temática elegida
  const grupoTema = GRUPOS_PLANTILLAS.find(g => g.claves.includes(tema)) ?? GRUPOS_PLANTILLAS[0]
  const negocioBase = getNegocio(plantilla.ficha)
  const cartaSlug = CARTA_DE_TIPO[tipoCarta]
  const cartaBase = getCarta(cartaSlug)
  const esCarta = producto === 'carta'
  // Colores de partida: los de la demo de la temática
  // En miniweb, los colores de partida son los de la misma base que la vista previa (la miniweb de la temática, si la tiene; si no, su ficha)
  const marcaBase = esCarta ? marcaDe(cartaBase ?? {}) : producto === 'miniweb' && plantilla.miniweb ? getNegocio(plantilla.miniweb) : negocioBase
  const colorPrincipal = principal || marcaBase?.theme?.colors?.primary || '#000000'
  const colorAcento = acento || marcaBase?.theme?.colors?.accent || '#000000'
  // La portada de Inicio de la miniweb de partida (la de Chalaquita en comida; si no, la primera pestaña de la ficha) y sus
  // textos: el titular en dos líneas y la descripción. Los máximos de caracteres, los de ahora con un margen
  const inicioBase = producto === 'miniweb' ? (plantilla.miniweb ? getNegocio(plantilla.miniweb)?.hero?.pestanas?.[0] : pestanasDeMiniweb(negocioBase)?.[0]) : null
  const titularBase = inicioBase?.titular ?? []
  const textoGrande = textosMini.titular ?? titularBase.join(' ')
  const maxGrande = maxDe(titularBase.join(' ') || 'Texto grande de la portada')
  const textoPequeno = textosMini.descripcion ?? inicioBase?.descripcion ?? ''
  // El texto extra (un horario o lo que se quiera): solo lo pintan Editorial, Cortes (Diagonal) y Fullbleed
  // Con esas tres portadas, el texto extra empieza con uno de ejemplo (se ve y se guarda aunque no lo toques)
  const textoExtra = textosMini.info ?? inicioBase?.info ?? TEXTO_EXTRA_EJEMPLO
  const conTextoExtra = ['editorial', 'diagonal', 'fullbleed'].includes(hero)
  const MAX_TEXTO_EXTRA = 60
  const textosEditados = Object.keys(textosMini).length > 0
  // Los textos escritos de la portada, tal como pasan a la vista previa (la primera pestaña, Inicio): igual que al crear, pero al momento
  const textosPrevia = producto === 'miniweb'
    ? {
        ...(textosMini.titular !== undefined ? { 'hero.pestanas.0.titular': [textoGrande.trim()].filter(Boolean) } : {}),
        ...(textosMini.descripcion !== undefined ? { 'hero.pestanas.0.descripcion': textoPequeno.trim() } : {}),
        ...(textosMini.info !== undefined ? { 'hero.pestanas.0.info': textoExtra.trim() } : {}),
      }
    : {}
  const colorDelTexto = colorTexto || marcaBase?.theme?.colors?.text || '#000000'
  const colorFondo = fondo || marcaBase?.theme?.colors?.bg || '#FFFFFF'
  const colorCabecera = cabecera || marcaBase?.theme?.colors?.header || colorPrincipal
  // Diseños con cabecera de color: Polaroid y Banner de una ficha (en una miniweb, el menú tiene su propio color)
  const conCabecera = producto === 'ficha' && ['polaroid', 'banner'].includes(hero)

  // El logo solo cuenta con "Logo" elegido, uno subido y en una ficha o una miniweb (las cartas llevan el nombre)
  const logoElegido = !esCarta && logo ? logo : ''

  const heros = Object.entries(HEROS).filter(([, h]) => h.piezas && !h.paginaCompleta)
  // Los 5 primeros de la fila de iconos (el resto, detrás del +), en este orden y después los demás
  const primerosDisenos = ['editorial', 'banner', 'diagonal', 'fullbleed', 'portada']
  const herosEnOrden = [...primerosDisenos.map(c => heros.find(([k]) => k === c)).filter(Boolean), ...heros.filter(([k]) => !primerosDisenos.includes(k))].filter(([k]) => producto !== 'miniweb' || !SIN_PORTADA_MINIWEB.includes(k))
  const [masDisenos, setMasDisenos] = useState(false)
  const estilos = Object.values(FAMILIAS).filter(f => f.carta)

  // El nombre llega a la vista previa medio segundo después de dejar de escribir (si no, se recargaría a cada letra)
  const [nombreVista, setNombreVista] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setNombreVista(nombre.trim()), 500)
    return () => clearTimeout(t)
  }, [nombre])
  // Marca de prueba en la dirección: la vista previa enseña el nombre, los colores y la tipografía al momento
  const marca = [
    // Con el nombre vacío, la vista previa enseña "Prueba" (y no el de la demo, Chalaquita, Almendra...)
    `nombre=${encodeURIComponent(nombreVista || 'Prueba')}`,
    principal && `principal=${principal.slice(1)}`,
    acento && `acento=${acento.slice(1)}`,
    colorTexto && `texto=${colorTexto.slice(1)}`,
    fondo && `fondo=${fondo.slice(1)}`,
    letra && `letra=${letra}`,
    ...(producto === 'miniweb' && textosEditados ? [`tg1=${encodeURIComponent(textoGrande)}`, `tp=${encodeURIComponent(textoPequeno)}`] : []),
    producto === 'miniweb' && conTextoExtra && `ti=${encodeURIComponent(textoExtra)}`,
    producto === 'miniweb' && Object.keys(coloresMini).length > 0 && `col=${Object.entries(coloresMini).map(([clave, valor]) => `${clave}-${valor.slice(1)}`).join(',')}`,
    !esCarta && tamanoNombre !== 'md' && `tamano=${tamanoNombre}`,
    !esCarta && hero === 'diagonal' && corte !== 'diagonal' && `corte=${corte}`,
    !esCarta && hero === 'editorial' && formato !== 'clasica' && `formato=${formato}`,
    !esCarta && hero === 'fullbleed' && disposicion !== 'clasica' && `disposicion=${disposicion}`,
    !esCarta && hero === 'mosaico' && composicion !== 'clasica' && `composicion=${composicion}`,
    !esCarta && hero === 'retrato' && distribucion !== 'clasica' && `distribucion=${distribucion}`,
    !esCarta && hero === 'galeria' && pase !== 'clasica' && `pase=${pase}`,
    !esCarta && hero === 'polaroid' && montaje !== 'clasica' && `montaje=${montaje}`,
    producto === 'miniweb' && cartaMini && `carta=${cartaMini}`,
    producto === 'miniweb' && horarioMini && `horario=${horarioMini}`,
    producto === 'miniweb' && horarioVar !== 'clasica' && `horariovar=${horarioVar}`,
    esCarta && estilo === 'inmersiva' && subCarta === 'columna' && 'sub=columna',
    esCarta && 'derivar=1',
    esCarta && colorPrecio && `precio=${colorPrecio.slice(1)}`,
    esCarta && colorPrecioTexto && `ptxt=${colorPrecioTexto.slice(1)}`,
    esCarta && tamanoPrecio !== 'md' && `tprecio=${tamanoPrecio}`,
    esCarta && `enlace=${enlaceNegocio}`,
    esCarta && estilo === 'inmersiva' && filtroCarta !== 100 && `filtro=${filtroCarta}`,
    esCarta && estilo === 'inmersiva' && colorFiltroCarta && `cfiltro=${colorFiltroCarta.slice(1)}`,
    esCarta && detallePrecio !== 'raya' && `dprecio=${detallePrecio}`,
    producto === 'miniweb' && filtroFoto !== 100 && `filtro=${filtroFoto}`,
    ...(producto === 'miniweb' ? lugares.map(([clave, valor]) => `${clave.toLowerCase()}=${valor}`) : []),
    producto === 'miniweb' && barra && `barra=${barra}`,
    conCabecera && cabecera && `cabecera=${cabecera.slice(1)}`,
    logoElegido && `logo=${encodeURIComponent(logoElegido)}`,
    (cambiosIA || Object.keys(cambiosExtra).length > 0 || Object.keys(textosPrevia).length > 0) && `ia=${versionIA}-${versionExtra}`,
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
          ? `/demo/${cartaSlug}/carta?diseno=${estilo}${marca}`
          : null

  // Arma lo que se guarda al crear (el perfil de partida, su dirección y los cambios del diseño elegido), sin tocar Supabase
  const armar = nombreCrear => {
    const tipoFila = esCarta ? 'carta' : 'negocio'
    const ocupadas = new Set([
      ...(filas ?? []).filter(f => f.tipo === tipoFila).map(f => f.slug),
      ...(esCarta ? cartas : negocios).map(n => n.slug),
      ...RESERVADAS,
    ])
    const raiz = aSlug(nombreCrear) || 'nuevo'
    let slug = raiz
    for (let n = 2; ocupadas.has(slug); n++) slug = `${raiz}-${n}`

    const tipografia = TIPOGRAFIAS.find(t => t.id === letra)
    // Los textos de la portada que se han escrito: en la copia de Chalaquita, sobre su primera pestaña; en las demás, sobre la
    // primera pestaña de su miniweb (más abajo)
    const textosEscritos = {
      ...(textosMini.titular !== undefined ? { titular: [textoGrande.trim()].filter(Boolean) } : {}),
      ...(textosMini.descripcion !== undefined ? { descripcion: textoPequeno.trim() } : {}),
      ...(conTextoExtra ? { info: textoExtra.trim() } : {}),
    }
    const inicioCambio = {
      ...(producto === 'miniweb' && barra ? { 'hero.barra': barra } : {}),
      ...(!esCarta && tamanoNombre !== 'md' ? { 'hero.tamanoNombre': tamanoNombre } : {}),
      ...(!esCarta && hero === 'diagonal' && corte !== 'diagonal' ? { 'hero.corte': corte } : {}),
      ...(!esCarta && hero === 'editorial' && formato !== 'clasica' ? { 'hero.formato': formato } : {}),
      ...(!esCarta && hero === 'fullbleed' && disposicion !== 'clasica' ? { 'hero.disposicion': disposicion } : {}),
      ...(!esCarta && hero === 'mosaico' && composicion !== 'clasica' ? { 'hero.composicion': composicion } : {}),
      ...(!esCarta && hero === 'retrato' && distribucion !== 'clasica' ? { 'hero.distribucion': distribucion } : {}),
      ...(!esCarta && hero === 'galeria' && pase !== 'clasica' ? { 'hero.pase': pase } : {}),
      ...(!esCarta && hero === 'polaroid' && montaje !== 'clasica' ? { 'hero.montaje': montaje } : {}),
      ...(producto === 'miniweb' && cartaMini ? { 'hero.carta': cartaMini } : {}),
      ...(producto === 'miniweb' && horarioMini ? { 'hero.horario': horarioMini } : {}),
      ...(producto === 'miniweb' && horarioVar !== 'clasica' ? { 'hero.horarioVariante': horarioVar } : {}),
      ...(producto === 'miniweb' && filtroFoto !== 100 ? { 'hero.filtro': filtroFoto } : {}),
      // Los colores uno por uno que se han elegido (los demás, en automático)
      ...(producto === 'miniweb' && Object.keys(coloresMini).length ? { 'hero.colores': coloresMini } : {}),
      ...(producto === 'miniweb' ? Object.fromEntries(lugares.map(([clave, valor]) => [`hero.${clave}`, valor])) : {}),
    }
    let cambios
    let base
    if (esCarta) {
      base = cartaSlug
      const inicio = inicioCopiaCarta(cartaBase)
      cambios = fusionar(inicio, {
        'marca.nombre': nombreCrear,
        diseno: estilo,
        ...(estilo === 'inmersiva' && subCarta === 'columna' ? { subdiseno: 'columna' } : {}),
        ...(principal ? { 'marca.theme.colors.primary': principal } : {}),
        ...(acento ? { 'marca.theme.colors.accent': acento } : {}),
        ...(colorTexto ? { 'marca.theme.colors.text': colorTexto } : {}),
        ...(fondo ? { 'marca.theme.colors.bg': fondo } : {}),
        ...(colorPrecio ? { 'marca.theme.colors.precio': colorPrecio } : {}),
        ...(colorPrecioTexto ? { 'marca.theme.colors.precioTexto': colorPrecioTexto } : {}),
        ...(tamanoPrecio !== 'md' ? { tamanoPrecio } : {}),
        // Una copia no enlaza a la miniweb de la demo de la que sale: sin enlace salvo que se elija
        enlaceNegocio,
        ...(estilo === 'inmersiva' && filtroCarta !== 100 ? { filtroFoto: filtroCarta } : {}),
        ...(estilo === 'inmersiva' && colorFiltroCarta ? { colorFiltro: colorFiltroCarta } : {}),
        ...(detallePrecio !== 'raya' ? { detallePrecio } : {}),
        // La superficie de las tarjetas y el texto suave salen del fondo y del texto elegidos (no se quedan con los de la plantilla)
        ...(fondo || colorTexto ? { 'marca.theme.colors.surface': derivadosDeFondoYTexto(colorFondo, colorDelTexto).surface, 'marca.theme.colors.muted': derivadosDeFondoYTexto(colorFondo, colorDelTexto).muted } : {}),
        ...(tipografia ? { 'marca.theme.fonts': tipografia.fonts } : {}),
      })
    } else {
      // Miniweb de comida: copia de Chalaquita con la portada elegida. El resto: su ficha como miniweb
      const deChalaquita = producto === 'miniweb' && plantilla.miniweb
      base = deChalaquita ? plantilla.miniweb : plantilla.ficha
      cambios = {
        nombre: nombreCrear,
        ...(logoElegido ? { logo: logoElegido } : {}),
        // El enlace de "escribir reseña" del Google del negocio: vacío al principio, para que salga el campo en Reseña de Google y se pueda pegar
        ...(getNegocio(base)?.resena?.url ? {} : { 'resena.url': '' }),
        ...(principal ? { 'theme.colors.primary': principal } : {}),
        ...(acento ? { 'theme.colors.accent': acento } : {}),
        ...(colorTexto ? { 'theme.colors.text': colorTexto } : {}),
        ...(fondo ? { 'theme.colors.bg': fondo } : {}),
        // Con cabecera, se guarda siempre (aunque sea el principal), para que salga en el editor y se pueda cambiar
        ...(conCabecera ? { 'theme.colors.header': colorCabecera } : {}),
        ...(tipografia ? { 'theme.fonts': tipografia.fonts } : {}),
        ...(producto === 'ficha'
          ? { 'hero.diseno': hero, ...(barra ? { 'hero.barra': barra } : {}), ...(hero === 'diagonal' && corte !== 'diagonal' ? { 'hero.corte': corte } : {}), ...(hero === 'editorial' && formato !== 'clasica' ? { 'hero.formato': formato } : {}), ...(hero === 'fullbleed' && disposicion !== 'clasica' ? { 'hero.disposicion': disposicion } : {}), ...(hero === 'mosaico' && composicion !== 'clasica' ? { 'hero.composicion': composicion } : {}), ...(hero === 'retrato' && distribucion !== 'clasica' ? { 'hero.distribucion': distribucion } : {}), ...(hero === 'galeria' && pase !== 'clasica' ? { 'hero.pase': pase } : {}), ...(hero === 'polaroid' && montaje !== 'clasica' ? { 'hero.montaje': montaje } : {}) }
          : deChalaquita
            ? { 'hero.portada': hero, ...inicioCambio, ...Object.fromEntries(Object.entries(textosEscritos).map(([clave, valor]) => [`hero.pestanas.0.${clave}`, valor])), ...(conFotosDePortada(getNegocio(plantilla.miniweb)?.hero?.pestanas?.[0], FOTOS_PORTADA[hero])?.fotos ? { 'hero.pestanas.0.fotos': conFotosDePortada(getNegocio(plantilla.miniweb).hero.pestanas[0], FOTOS_PORTADA[hero]).fotos } : {}) }
            : {
                'hero.diseno': 'web',
                'hero.portada': hero,
                'hero.redesArriba': true,
                // El titular propio de la ficha (el que iba sobre la foto) sobra en una miniweb: ya está el Texto inicio
                ...LIMPIAR_FICHA,
                ...inicioCambio,
                'hero.pestanas': pestanasDeMiniweb(negocioBase).map((p, i) => (i === 0 ? conFotosDePortada({ ...p, ...textosEscritos }, FOTOS_PORTADA[hero]) : p)),
                tipo: 'miniweb',
              }),
      }
    }

    return { tipoFila, slug, base, cambios }
  }

  // El asistente escribe los textos y busca las fotos sobre el diseño armado: devuelve los cambios (sin tocar nombre, diseño ni portada)
  const redactar = async (base, cambios, nombreCrear, avisar) => {
    const datosBase = esCarta ? cartaBase : getNegocio(base)
    const preparada = aplicar(datosBase, cambios)
    const campos = camposParaIA(preparada)
    avisar('Escribiendo los textos...')
    const { resultado } = await llamar('asistente', {
      paso: 'copy',
      peticion: infoImagen ? `${cuento.trim()}\n\nDatos leídos de la imagen de referencia de la marca (úsalos tal cual):\n${infoImagen}`.trim() : cuento.trim() || 'Sin más indicaciones.',
      perfil: producto,
      nombre: nombreCrear,
      campos,
      carta: estructuraCarta(preparada),
      alergenos: Object.keys(ALERGENOS),
    })
    avisar('Buscando fotos...')
    const deIA = await cambiosDeIA({ ...resultado, tipografia: '' }, campos, preparada)
    for (const ruta of ['nombre', 'marca.nombre', 'hero.diseno', 'hero.barra', 'hero.portada']) delete deIA[ruta]
    return { deIA, historial: [{ peticion: cuento.trim(), resumen: sinGuionLargo(resultado.resumen ?? '') }] }
  }

  // El botón del asistente, en dos tiempos: 1) elige el diseño (y el nombre, si falta) y lo pone en los selectores; 2) con esos
  // selectores ya puestos (efecto de más abajo), escribe los textos y busca las fotos. La vista previa lo enseña todo
  const montar = async () => {
    if (!(nombre.trim() || cuento.trim() || referencia || captura) || disenando) return
    setDisenando('Montando el diseño...')
    setError('')
    setResumenDiseno('')
    setCambiosIA(null)
    setCambiosExtra({})
    try {
      // Con Carta elegida, solo el diseño: tipo, estilo (y subdiseño), tipografía, colores y nombre. El contenido es de /mi-carta
      if (producto === 'carta') {
        const { resultado: res } = await llamar('asistente', { paso: 'diseno-carta', tipo: tipoCarta, peticion: cuento.trim() || 'Sin más indicaciones: decide tú el estilo.', nombre: nombre.trim(), catalogo: catalogoCarta(), ...(referencia ? { referencia: { imagen: referencia.imagen, tipo: referencia.tipo, colores: referencia.colores } } : {}), ...(captura ? { captura: { imagen: captura.imagen, tipo: captura.tipo } } : {}) })
        const c = validarDisenoCarta(res)
        if (c.estilo) setEstilo(c.estilo)
        setSubCarta(c.subdiseno ?? 'fila')
        if (c.tipografia) setLetra(c.tipografia)
        if (c.colores.principal) setPrincipal(c.colores.principal)
        if (c.colores.acento) setAcento(c.colores.acento)
        if (c.colores.texto) setColorTexto(c.colores.texto)
        if (c.colores.fondo) setFondo(c.colores.fondo)
        if (c.nombre && !nombre.trim()) setNombre(c.nombre)
        setFiltroCarta(c.filtro)
        setColorFiltroCarta(c.colorFiltro ?? '')
        setDetallePrecio(c.detallePrecio)
        setColorPrecio(c.colorDetallePrecio ?? '')
        setColorPrecioTexto(c.colorPrecio ?? '')
        setTamanoPrecio(c.tamanoPrecio)
        setGenerado(true)
        setResumenDiseno(c.resumen)
        setDisenando(null)
        return
      }
      const { resultado } = await llamar('asistente', { paso: 'diseno-miniweb', peticion: cuento.trim() || 'Sin más indicaciones: decide tú el estilo.', nombre: nombre.trim(), catalogo: catalogoMiniweb(), ...(referencia ? { referencia: { imagen: referencia.imagen, tipo: referencia.tipo, colores: referencia.colores } } : {}), ...(captura ? { captura: { imagen: captura.imagen, tipo: captura.tipo } } : {}) })
      const d = validarDiseno(resultado)
      setProducto('miniweb')
      if (d.tema) setTema(d.tema)
      if (d.portada) setHero(d.portada)
      if (d.subdiseno) ({ corte: setCorte, formato: setFormato, disposicion: setDisposicion, composicion: setComposicion, distribucion: setDistribucion, pase: setPase, montaje: setMontaje })[d.subdiseno.campo]?.(d.subdiseno.valor)
      setEstructura(d.estructura)
      if (d.estiloMenu !== null) setBarra(d.estiloMenu)
      if (d.textoExtra) setTextosMini(t => ({ ...t, info: d.textoExtra }))
      if (d.tamanoNombre) setTamanoNombre(d.tamanoNombre)
      if (d.tipografia) setLetra(d.tipografia)
      if (d.colores.principal) setPrincipal(d.colores.principal)
      if (d.colores.acento) setAcento(d.colores.acento)
      if (d.colores.texto) setColorTexto(d.colores.texto)
      if (d.colores.fondo) setFondo(d.colores.fondo)
      setColoresMini(d.roles)
      if (d.nombre && !nombre.trim()) setNombre(d.nombre)
      setCartaMini(d.carta ?? '')
      if (d.horario !== null) {
        setHorarioMini(d.horario)
        setHorarioVar(d.horarioVariante)
      }
      setHorarioIA(d.horarioLineas)
      setInfoImagen(d.infoImagen)
      setGenerado(true)
      setResumenDiseno(d.resumen)
      setRedactando(true)
    } catch (e) {
      setError(e.message)
      setDisenando(null)
    }
  }
  useEffect(() => {
    if (!redactando) return
    setRedactando(false)
    ;(async () => {
      try {
        const nombreHecho = nombre.trim() || 'Prueba'
        const { base, cambios } = armar(nombreHecho)
        const hecho = await redactar(base, cambios, nombreHecho, setDisenando)
        // La vista previa los lee de aquí (la misma pestaña del navegador, el mismo origen)
        try {
          localStorage.setItem('mostraq-vista-ia', JSON.stringify(hecho.deIA))
        } catch {
          // Sin almacenamiento: la vista previa se queda sin textos ni fotos nuevos, pero al crear sí se guardan
        }
        setCambiosIA({ cambios: hecho.deIA, historial: hecho.historial })
        // Las líneas del horario, sobre la pestaña del horario de la miniweb (como un cambio a mano, para poder retocarlas)
        if (horarioIA.length) {
          const idx = (aplicar(getNegocio(base), cambios).hero?.pestanas ?? []).findIndex(p => p.tipo === 'horario')
          if (idx >= 0) setCambiosExtra(c => ({ ...c, [`hero.pestanas.${idx}.lineas`]: horarioIA }))
        }
        setVersionIA(v => v + 1)
      } catch (e) {
        setError(e.message)
      }
      setDisenando(null)
    })()
  }, [redactando]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cómo está todo ahora (lo elegido en cada selector, los textos y lo que ha hecho el asistente), para poder reabrir la copia tal cual
  const instantanea = () => ({
    producto,
    tema,
    tipoCarta,
    subCarta,
    colorPrecio,
    colorPrecioTexto,
    tamanoPrecio,
    enlaceNegocio,
    filtroCarta,
    colorFiltroCarta,
    detallePrecio,
    hero,
    barra,
    estilo,
    nombre,
    logo,
    principal,
    acento,
    colorTexto,
    fondo,
    letra,
    cabecera,
    coloresMini,
    textosMini,
    estructura,
    corte,
    formato,
    disposicion,
    composicion,
    distribucion,
    pase,
    montaje,
    tamanoNombre,
    cartaMini,
    horarioMini,
    horarioVar,
    filtroFoto,
    cuento,
    cambiosExtra,
    cambiosIA,
    resumenDiseno,
  })

  // Cambios sin guardar: la huella de todo lo elegido ahora comparada con la de la última vez que se abrió el editor, se cargó una copia o se guardó.
  // marcarBase pide que la próxima huella pase a ser la de partida (versionBase hace que se compruebe aunque la huella no cambie)
  const huella = JSON.stringify(instantanea())
  const [huellaBase, setHuellaBase] = useState(null)
  const [versionBase, setVersionBase] = useState(0)
  const marcarBase = useRef(true)
  useEffect(() => {
    if (!marcarBase.current) return
    marcarBase.current = false
    setHuellaBase(huella)
  }, [huella, versionBase]) // eslint-disable-line react-hooks/exhaustive-deps
  const sinGuardar = huellaBase !== null && huella !== huellaBase
  const empezarDeNuevo = () => {
    marcarBase.current = true
    setVersionBase(v => v + 1)
  }
  // Al cerrar o recargar la pestaña con cambios sin guardar, el navegador pregunta
  useEffect(() => {
    if (!sinGuardar) return
    const avisar = e => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sinGuardar])

  // Carga una copia en Nuevo perfil a partir de su instantánea. Las copias antiguas (de antes de Nuevo perfil) no la tienen y no se pueden abrir aquí
  const cargarCopia = fila => {
    const i = fila?.cambios?._nuevoPerfil
    if (!i) {
      setError('Esta copia es antigua (se creó antes del editor) y no se puede abrir aquí.')
      return
    }
    setError('')
    setAviso('')
    setPestana('personalizar')
    setProducto(i.producto ?? 'miniweb')
    setTema(i.tema ?? PLANTILLAS[0].clave)
    // Las copias de antes de este selector: la carta de la temática que tenían decide el tipo (Laca, promociones; el resto, carta)
    setSubCarta(i.subCarta ?? 'fila')
    setColorPrecio(i.colorPrecio ?? '')
    setColorPrecioTexto(i.colorPrecioTexto ?? '')
    setTamanoPrecio(i.tamanoPrecio ?? 'md')
    setEnlaceNegocio(i.enlaceNegocio ?? 'ninguno')
    setFiltroCarta(i.filtroCarta ?? 100)
    setColorFiltroCarta(i.colorFiltroCarta ?? '')
    setDetallePrecio(i.detallePrecio ?? 'raya')
    setTipoCarta(i.tipoCarta ?? (PLANTILLAS.find(p => p.clave === i.tema)?.carta === 'laca' ? 'promociones' : 'carta'))
    setHero(i.hero ?? 'polaroid')
    setBarra(i.barra ?? '')
    setEstilo(i.estilo ?? 'revista')
    setNombre(i.nombre ?? '')
    setLogo(i.logo ?? '')
    setPrincipal(i.principal ?? '')
    setAcento(i.acento ?? '')
    setColorTexto(i.colorTexto ?? '')
    setFondo(i.fondo ?? '')
    setLetra(i.letra ?? '')
    setCabecera(i.cabecera ?? '')
    setColoresMini(i.coloresMini ?? {})
    setTextosMini(i.textosMini ?? {})
    setEstructura(i.estructura ?? {})
    setCorte(i.corte ?? 'diagonal')
    setFormato(i.formato ?? 'clasica')
    setDisposicion(i.disposicion ?? 'clasica')
    setComposicion(i.composicion ?? 'clasica')
    setDistribucion(i.distribucion ?? 'clasica')
    setPase(i.pase ?? 'clasica')
    setMontaje(i.montaje ?? 'clasica')
    setTamanoNombre(i.tamanoNombre ?? 'md')
    setCartaMini(i.cartaMini ?? '')
    setHorarioMini(i.horarioMini ?? '')
    setHorarioVar(i.horarioVar ?? 'clasica')
    setFiltroFoto(i.filtroFoto ?? 100)
    setCuento(i.cuento ?? '')
    setCambiosExtra(i.cambiosExtra ?? {})
    setCambiosIA(i.cambiosIA ?? null)
    setResumenDiseno(i.resumenDiseno ?? '')
    setGenerado(true)
    setVersionIA(v => v + 1)
    try {
      localStorage.setItem('mostraq-vista-ia', JSON.stringify({ ...(i.cambiosIA?.cambios ?? {}), ...(i.cambiosExtra ?? {}) }))
    } catch {
      // Sin almacenamiento, la vista previa no enseña lo del asistente, pero al guardar sí se conserva
    }
    setCopiaCargada({ tipo: fila.tipo, slug: fila.slug })
    empezarDeNuevo()
  }

  // Si se llega con ?copia=tipo:slug (botón Editar de la pantalla de información), se abre Nuevo perfil con esa copia
  useEffect(() => {
    if (!cargar || !filas) return
    const [t, sl] = cargar.split(':')
    const fila = filas.find(f => f.tipo === t && f.slug === sl)
    if (!fila) return
    setAbierto(true)
    cargarCopia(fila)
    abrir(null)
  }, [cargar, filas]) // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar cambios: actualiza la copia cargada (misma dirección) con lo que hay ahora
  const guardarCopia = async () => {
    if (!copiaCargada || creando) return
    setAviso('')
    setError('')
    setCreando('Guardando...')
    let guardado = false
    try {
      const nombreGuardar = nombre.trim() || 'Prueba'
      const { base, cambios: cambiosBase } = armar(nombreGuardar)
      let cambios = cambiosBase
      let historial = []
      if (cambiosIA) {
        cambios = fusionar(cambios, cambiosIA.cambios)
        historial = cambiosIA.historial
      }
      if (Object.keys(cambiosExtra).length) cambios = fusionar(cambios, cambiosExtra)
      cambios = { ...cambios, _nuevoPerfil: instantanea() }
      // La marca de cliente (Exportar para cliente) se conserva
      if ((filas ?? []).find(f => f.tipo === copiaCargada.tipo && f.slug === copiaCargada.slug)?.cambios?._cliente) cambios._cliente = true
      // El menú del día de una carta vive en su panel (tabla cartas) y manda sobre el de la copia: se cambia también allí, para que lo que se
      // guarda sea lo que se ve en su dirección (y en su QR)
      if (copiaCargada.tipo === 'carta') {
        const { error: errorMenu } = await supabase.from('cartas').update({ menu_dia: menuDelPanel(aplicar(cartaBase, cambios).menuDia) }).eq('slug', copiaCargada.slug)
        if (errorMenu) throw new Error('No se ha podido cambiar el menú del día de la carta.')
      }
      const { error } = await supabase
        .from('ediciones')
        .update({ base, cambios, ...(historial.length ? { historial } : {}) })
        .eq('tipo', copiaCargada.tipo)
        .eq('slug', copiaCargada.slug)
      if (error) throw new Error('No se han podido guardar los cambios.')
      await recargar()
      empezarDeNuevo()
      setAviso(`Cambios guardados en «${nombreGuardar}».`)
      guardado = true
    } catch (e) {
      setError(e.message)
    }
    setCreando(null)
    return guardado
  }

  // muestra (true): exporta el diseño a las muestras, en la lista de Miniwebs (con el nombre escrito o, sin él, «Muestra») en lugar de crear un perfil
  const crear = async muestra => {
    const esMuestra = muestra === true
    const nombreCrear = nombre.trim() || (esMuestra ? 'Muestra' : '')
    if (!nombreCrear || creando) return
    setAviso('')
    setCreando('Creando...')
    setError('')
    try {
      const { tipoFila, slug, base, cambios: cambiosBase } = armar(nombreCrear)
      let cambios = cambiosBase

      // Una muestra va marcada: /miniweb la enseña junto a las demás miniwebs de ejemplo
      if (esMuestra) cambios = { ...cambios, muestra: true }

      // Si el asistente ya ha montado la miniweb (botón Montar), sus textos y fotos ya están hechos y se guardan tal cual. Si no, con
      // lo que se le ha contado del negocio se inventa el copy y busca las fotos sobre el diseño ya montado (colores, solo si se piden)
      // Lo cambiado a mano en los datos en bruto va el último, para que mande sobre lo del asistente
      let historial = []
      if (cambiosIA) {
        cambios = fusionar(cambios, cambiosIA.cambios)
        historial = cambiosIA.historial
      } else if (cuento.trim()) {
        const hecho = await redactar(base, cambios, nombreCrear, setCreando)
        cambios = fusionar(cambios, hecho.deIA)
        historial = hecho.historial
        setCreando('Creando...')
      }

      if (Object.keys(cambiosExtra).length) cambios = fusionar(cambios, cambiosExtra)
      // La instantánea de Nuevo perfil, para poder reabrir la copia y retocarla
      cambios = { ...cambios, _nuevoPerfil: instantanea() }
      const { error } = await supabase.from('ediciones').insert({ tipo: tipoFila, slug, base, cambios, ...(historial.length ? { historial } : {}) })
      if (error) throw new Error('No se ha podido crear.')
      if (esCarta) await crearCartaConDueno(slug, aplicar(cartaBase, cambios).menuDia)
      await recargar()
      if (esMuestra) {
        setCreando(null)
        setAviso(`Exportada a las muestras como «${nombreCrear}»: ya sale en Miniwebs`)
      } else abrir(`${tipoFila}:${slug}`)
    } catch (e) {
      setError(e.message)
      setCreando(null)
    }
  }

  const titulo = 'text-[0.8rem] font-semibold text-zinc-500'
  const opcion = activa => `rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${activa ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`

  // El nombre del negocio (obligatorio), el icono del logo (abre el campo para subirlo) y el tamaño del nombre
  const bloqueNombre = (
          <div className="grid gap-[0.75rem]">
            <Etiqueta texto="Nombre del negocio">
              <div className="flex items-center gap-[0.5rem]">
                <input value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Peluquería Ranita" />
                {!esCarta && (
                  <button
                    type="button"
                    title="Logo"
                    aria-label="Logo del negocio"
                    aria-expanded={logoAbierto}
                    onClick={() => setLogoAbierto(v => !v)}
                    className={`flex h-[2.75rem] w-[2.75rem] shrink-0 items-center justify-center overflow-hidden rounded-[0.5rem] border-2 bg-white p-[0.2rem] transition-transform duration-300 ${logoAbierto ? 'scale-105 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                  >
                    {logo ? <img src={logo} alt="" className="max-h-full max-w-full object-contain" /> : <ImagePlus className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />}
                  </button>
                )}
              </div>
            </Etiqueta>
            {!esCarta && logoAbierto && <CampoLogo valor={logo} cambiar={setLogo} />}
            {/* El tamaño del nombre arriba (XS, MD, el de cada diseño, o XL): cápsulas pequeñas bajo el campo */}
            {!esCarta && (
              <div className="grid justify-items-start gap-[0.25rem]">
                <div className="flex gap-[0.4rem]">
                  {['xxs', 'xs', 'md', 'xl'].map(t => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tamanoNombre === t}
                      onClick={() => setTamanoNombre(t)}
                      className={`rounded-full px-[0.8rem] py-[0.25rem] text-[0.78rem] font-semibold uppercase ring-1 transition-colors ${tamanoNombre === t ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
  )

  // Los datos de la página tal como están ahora (la base con el diseño elegido y, si lo hay, lo que ha hecho el asistente), sin los cambios a mano
  const datosEnBruto = useMemo(() => {
    try {
      const { base, cambios } = armar(nombre.trim() || 'Prueba')
      return aplicar(esCarta ? getCarta(base) : getNegocio(base), cambiosIA ? fusionar(cambios, cambiosIA.cambios) : cambios)
    } catch {
      return null
    }
  }, [vista, cambiosIA, producto]) // eslint-disable-line react-hooks/exhaustive-deps
  const cambiarExtra = (ruta, valor) =>
    setCambiosExtra(c => {
      const nuevo = { ...c }
      if (valor === leerRuta(datosEnBruto, ruta)) delete nuevo[ruta]
      else nuevo[ruta] = valor
      return nuevo
    })
  // Los cambios a mano pasan a la vista previa (junto a lo del asistente) medio segundo después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('mostraq-vista-ia', JSON.stringify({ ...(cambiosIA?.cambios ?? {}), ...textosPrevia, ...cambiosExtra }))
      } catch {
        // Sin almacenamiento, la vista previa no enseña estos cambios, pero al crear sí se guardan
      }
      setVersionExtra(v => v + 1)
    }, 600)
    return () => clearTimeout(t)
  }, [cambiosExtra, textosMini]) // eslint-disable-line react-hooks/exhaustive-deps

  // La tipografía (la pareja de fuentes de la marca)
  const campoTipografia = (
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
  )

  // La paleta base de la marca (principal, acento, fondo y texto)
  const paletaMarca = (
          <Plegable
            titulo={producto === 'miniweb' ? 'Personalizado' : 'Colores'}
            elegido={
              <span className="flex justify-end gap-[0.25rem]">
                {[colorPrincipal, ...(conCabecera ? [colorCabecera] : []), colorAcento, colorFondo, colorDelTexto].map((c, i) => (
                  <span key={i} className="h-[1.1rem] w-[1.1rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
                ))}
              </span>
            }
          >
          <div className="grid gap-[0.9rem]">
            {[
              ['Color principal', 'Botones, precios y lo que tiene que destacar.', colorPrincipal, setPrincipal],
              // Solo en los diseños con cabecera de color
              ...(conCabecera
                ? [['Fondo de cabecera', producto === 'miniweb' ? 'La barra del menú de arriba y, con las portadas Polaroid y Banner, el fondo de toda la portada.' : 'La parte de arriba, detrás de las fotos y el titular.', colorCabecera, setCabecera]]
                : []),
              ['Color de acento', 'Precios, subrayados de las pestañas y detalles.', colorAcento, setAcento],
              ['Color de fondo', 'El fondo de la página: claro u oscuro.', colorFondo, setFondo],
              ['Color del texto', 'Las letras sobre el fondo.', colorDelTexto, setColorTexto],
            ].map(([nombreColor, ayuda, valor, poner]) => (
              <div key={nombreColor} className="grid gap-[0.3rem]">
                <div>
                  <p className="text-[0.8rem] font-semibold text-zinc-500">{nombreColor}</p>
                  <p className="text-[0.8rem] text-zinc-400">{ayuda}</p>
                </div>
                <CampoColor valor={valor} cambiar={poner} />
              </div>
            ))}
          </div>
          </Plegable>
  )

  return (
    // peer: abierto, se oculta el botón de "Crear con el asistente" que va justo debajo (en Lista)
    <details open={abierto} onToggle={e => setAbierto(e.currentTarget.open)} className="group/perfil peer rounded-[1rem] bg-white ring-1 ring-zinc-200">
      {/* Cerrado: "Nuevo perfil" con una flecha para abrir. Abierto: solo un icono pequeño de plegar, para que la
          vista previa empiece casi arriba */}
      <summary
        aria-label="Editor"
        className="flex cursor-pointer list-none items-center px-[1rem] py-[0.9rem] group-open/perfil:justify-center group-open/perfil:pb-0 group-open/perfil:pt-[0.4rem] [&::-webkit-details-marker]:hidden"
      >
        <span className="text-[1.05rem] font-bold group-open/perfil:hidden">Editor</span>
        <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 group-open/perfil:hidden" aria-hidden="true" />
        <ChevronsDownUp className="hidden h-[1.1rem] w-[1.1rem] text-zinc-400 group-open/perfil:block" aria-hidden="true" />
      </summary>
      {/* En una columna: vista previa, asistente, diseño y crear */}
      <div className="mx-auto grid w-full max-w-[32rem] gap-[1rem] px-[1rem] py-[1rem] lg:max-w-[60rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-x-[2.5rem]">
        {/* En el móvil, en una columna: pestañas, vista previa y lo de cada pestaña. En pantalla grande, las pestañas y su contenido a la
            izquierda y, a la derecha, la vista previa (fija al bajar) (display: contents lo reparte en el móvil) */}
        <div className="contents lg:col-start-1 lg:row-start-1 lg:grid lg:gap-[1rem]">
        {/* Dos pestañas arriba: Personalizar y Asistente. La vista previa se ve siempre, y debajo, lo de cada una */}
        <div role="tablist" aria-label="Editor" className="order-1 grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem] lg:order-none">
          {[
            ['personalizar', 'Personalizar'],
            ['asistente', 'Asistente'],
          ].map(([clave, texto]) => (
            <button
              key={clave}
              type="button"
              role="tab"
              aria-selected={pestana === clave}
              onClick={() => setPestana(clave)}
              className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold ${pestana === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {texto}
            </button>
          ))}
        </div>

        {/* El asistente: un cuadro donde pedirle lo que sea y un solo botón que lo monta todo (diseño, nombre, textos y fotos) */}
        {pestana === 'asistente' && (
        <div className="order-3 grid gap-[0.6rem] lg:order-none">
          {/* Qué diseña el asistente: una miniweb o una carta (la ficha ya no se vende) */}
          <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
            {[
              ['miniweb', 'Miniweb'],
              ['carta', 'Carta'],
              ['ficha', 'Ficha'],
            ].map(([clave, texto]) => (
              <button
                key={clave}
                type="button"
                aria-pressed={producto === clave}
                disabled={clave === 'ficha' || Boolean(disenando) || Boolean(creando)}
                onClick={() => {
                  setProducto(clave)
                  if (clave === 'miniweb' && SIN_PORTADA_MINIWEB.includes(hero)) setHero('editorial')
                }}
                className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
              >
                {texto}
              </button>
            ))}
          </div>
          {/* Con Carta elegida, qué tipo: cada uno con sus reglas en el asistente (es el mismo tipo del selector del Editor) */}
          {producto === 'carta' && (
            <div className="grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
              {TIPOS_CARTA.map(t => (
                <button
                  key={t.clave}
                  type="button"
                  aria-pressed={tipoCarta === t.clave}
                  disabled={Boolean(disenando) || Boolean(creando)}
                  onClick={() => setTipoCarta(t.clave)}
                  className={`rounded-[0.55rem] py-[0.45rem] text-[0.9rem] font-semibold disabled:opacity-40 ${tipoCarta === t.clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {t.clave === 'carta' ? 'Carta' : 'Ofertas'}
                </button>
              ))}
            </div>
          )}
          {/* Lo único seguro: el nombre. Si se escribe, el asistente lo usa tal cual; si no, lo saca de la captura o se lo inventa */}
          <Etiqueta texto="Nombre del negocio">
            <input value={nombre} onChange={e => setNombre(e.target.value)} disabled={Boolean(disenando) || Boolean(creando)} className={CAMPO} placeholder="Peluquería Ranita" />
          </Etiqueta>
          <textarea
            value={cuento}
            onChange={e => setCuento(e.target.value)}
            disabled={Boolean(disenando) || Boolean(creando)}
            rows={3}
            aria-label="Pídele al asistente lo que quieras"
            placeholder="Opcional: lo que quieras añadir (estilo, colores, datos). Con el nombre y una captura de su Instagram ya basta."
            className={`${CAMPO} resize-y`}
          />
          {/* Dos imágenes opcionales para el asistente, que solo las mira (no se colocan en la miniweb): el logo de referencia (colores y carácter
              de la marca) y una captura con información (solo se lee su texto: nombre, teléfonos, dirección, horario...) */}
          <div className="flex flex-wrap items-center gap-x-[1.2rem] gap-y-[0.6rem]">
            <CampoImagenAsistente titulo="Añadir logo de referencia" valor={referencia} cambiar={setReferencia} conColores bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
            <CampoImagenAsistente titulo="Añadir captura con información" valor={captura} cambiar={setCaptura} bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
          </div>
          <button type="button" onClick={montar} disabled={!(nombre.trim() || cuento.trim() || referencia || captura) || Boolean(disenando) || Boolean(creando)} className={BOTON}>
            {disenando ?? 'Montar el diseño con el asistente'}
          </button>
          {resumenDiseno && <p className="text-[0.85rem] font-semibold text-zinc-800">{resumenDiseno}</p>}
        </div>
        )}

        <div className="order-3 grid gap-[1rem] lg:order-none">
          {/* Personalizar: el producto y, debajo, desplegables independientes (de momento solo el primero, Diseño y estilos) */}
          {pestana === 'personalizar' && (
          <div className="grid gap-[1rem]">
          {/* 1. Temática: pone el contenido de ejemplo */}
          {/* 1. Producto */}
          <div className="grid gap-[0.4rem]">
            <span className={titulo}>Producto</span>
            <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
              {[
                ['miniweb', 'Miniweb'],
                ['carta', 'Carta'],
                ['ficha', 'Ficha'],
              ].map(([clave, texto]) => (
                <button
                  key={clave}
                  type="button"
                  aria-pressed={producto === clave}
                  onClick={() => {
                    setProducto(clave)
                    // Banner y Ficha no valen de portada de una miniweb: si estaba uno elegido, pasa a Editorial
                    if (clave === 'miniweb' && SIN_PORTADA_MINIWEB.includes(hero)) setHero('editorial')
                  }}
                  className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {/* Primer desplegable, abierto: Diseño y estilos (temática, portada y estilo del menú de navegación) */}
          <details open className="group/diseno rounded-[0.75rem] ring-1 ring-zinc-200">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className="text-[1rem] font-bold">Diseño y estilos</span>
              <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/diseno:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-[1rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          {/* Una fila de iconos: 5 a la vista y un + que abre el resto, con el nombre de la elegida debajo */}
          {esCarta ? (
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Tipo de carta</span>
              <div className="flex flex-wrap items-center gap-[0.4rem]">
                {TIPOS_CARTA.map(t => {
                  const Icono = ICONOS_TIPO_CARTA[t.clave] ?? Store
                  return (
                    <button
                      key={t.clave}
                      type="button"
                      title={t.texto}
                      aria-label={`Tipo de carta ${t.texto}`}
                      aria-pressed={tipoCarta === t.clave}
                      onClick={() => setTipoCarta(t.clave)}
                      className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${tipoCarta === t.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
              <p className="text-[0.85rem] font-semibold">{TIPOS_CARTA.find(t => t.clave === tipoCarta)?.texto}</p>
              <p className="text-[0.8rem] text-zinc-500">{TIPOS_CARTA.find(t => t.clave === tipoCarta)?.descripcion}</p>
            </div>
          ) : (
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Temática del negocio</span>
            {/* Los grupos (Restauración, Belleza...): al tocar uno, sus temáticas salen debajo como subpestañas; tocarlo otra vez las cierra */}
            <div className="flex flex-wrap items-center gap-[0.4rem]">
              {GRUPOS_PLANTILLAS.map(g => {
                const Icono = ICONOS_TEMA[g.claves[0]] ?? Store
                return (
                  <button
                    key={g.clave}
                    type="button"
                    title={g.nombre}
                    aria-label={`Grupo ${g.nombre}`}
                    aria-pressed={grupoTema.clave === g.clave}
                    onClick={() => {
                      if (grupoTema.clave === g.clave) setSubTemas(v => !v)
                      else {
                        setTema(g.claves[0])
                        setSubTemas(true)
                      }
                    }}
                    className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${grupoTema.clave === g.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                  >
                    <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                  </button>
                )
              })}
            </div>
            <p className="text-[0.85rem] font-semibold">{grupoTema.nombre}</p>
            {subTemas && (
              <div className="grid gap-[0.4rem]">
                <div className="flex flex-wrap gap-[0.4rem]">
                  {grupoTema.claves.map(clave => {
                    const p = PLANTILLAS.find(x => x.clave === clave)
                    const Icono = ICONOS_TEMA[clave] ?? Store
                    return (
                      <button
                        key={clave}
                        type="button"
                        title={p.nombre}
                        aria-label={`Temática ${p.nombre}`}
                        aria-pressed={tema === clave}
                        onClick={() => setTema(clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${tema === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
                <p className="text-[0.8rem] text-zinc-500">{plantilla.nombre}</p>
              </div>
            )}
          </div>
          )}


          {/* 3. Diseño, según el producto */}
          {!esCarta ? (
            // Una fila de iconos: 5 a la vista y un + que abre el resto, con el nombre del elegido debajo
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>{producto === 'miniweb' ? 'Portada' : 'Diseño de arriba'}</span>
              <div className="flex flex-wrap items-center gap-[0.4rem]">
                {/* En el móvil, 5 a la vista y un + que abre el resto; en pantalla grande, la lista completa y sin el + */}
                {herosEnOrden.map(([clave, h], i) => {
                  const Icono = ICONOS_DISENO[clave] ?? Frame
                  return (
                    <button
                      key={clave}
                      type="button"
                      title={nombreDeDiseno(clave)}
                      aria-label={`Diseño ${nombreDeDiseno(clave)}`}
                      aria-pressed={hero === clave}
                      onClick={() => {
                        // Al tocar otra vez el diseño elegido (Cortes o Formatos), su lista de subpestañas se cierra o se abre
                        if (hero === clave) setSubAbierta(v => !v)
                        else {
                          setHero(clave)
                          setSubAbierta(true)
                        }
                      }}
                      className={`${i >= 5 && !masDisenos ? 'hidden lg:flex' : 'flex'} h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${hero === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
                <button
                  type="button"
                  aria-label={masDisenos ? 'Ver menos diseños' : 'Ver más diseños'}
                  aria-expanded={masDisenos}
                  onClick={() => setMasDisenos(v => !v)}
                  className="flex h-[2.5rem] lg:hidden w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105"
                  style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
                >
                  {masDisenos ? <Minus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" />}
                </button>
              </div>
              <p className="text-[0.85rem] font-semibold">{nombreDeDiseno(hero)}</p>
              {/* Con Formatos (Editorial) elegido, sus formatos con icono: la Clásica de siempre primero */}
              {hero === 'editorial' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {FORMATOS.map(f => (
                      <button
                        key={f.clave}
                        type="button"
                        title={f.nombre}
                        aria-label={`Formato ${f.nombre}`}
                        aria-pressed={formato === f.clave}
                        onClick={() => setFormato(f.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${formato === f.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: f.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{FORMATOS.find(f => f.clave === formato)?.nombre}</p>
                </div>
              )}
              {/* Con Polaroid elegido, sus montajes con icono: el Clásico de siempre primero */}
              {hero === 'polaroid' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {MONTAJES.map(m => (
                      <button
                        key={m.clave}
                        type="button"
                        title={m.nombre}
                        aria-label={`Montaje ${m.nombre}`}
                        aria-pressed={montaje === m.clave}
                        onClick={() => setMontaje(m.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${montaje === m.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: m.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{MONTAJES.find(m => m.clave === montaje)?.nombre}</p>
                </div>
              )}
              {/* Con una galería elegida, sus estilos con icono: la Clásica de siempre primero */}
              {hero === 'galeria' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {GALERIAS.map(g => (
                      <button
                        key={g.clave}
                        type="button"
                        title={g.nombre}
                        aria-label={`Estilo ${g.nombre}`}
                        aria-pressed={pase === g.clave}
                        onClick={() => setPase(g.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${pase === g.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: g.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{GALERIAS.find(g => g.clave === pase)?.nombre}</p>
                </div>
              )}
              {/* Con Distribuciones (Retrato) elegido, sus distribuciones con icono: la Clásica de siempre primero */}
              {hero === 'retrato' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {DISTRIBUCIONES.map(d => (
                      <button
                        key={d.clave}
                        type="button"
                        title={d.nombre}
                        aria-label={`Distribución ${d.nombre}`}
                        aria-pressed={distribucion === d.clave}
                        onClick={() => setDistribucion(d.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${distribucion === d.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{DISTRIBUCIONES.find(d => d.clave === distribucion)?.nombre}</p>
                </div>
              )}
              {/* Con Composiciones (Mosaico) elegido, sus composiciones con icono: la Clásica de siempre primero */}
              {hero === 'mosaico' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {COMPOSICIONES.map(c => (
                      <button
                        key={c.clave}
                        type="button"
                        title={c.nombre}
                        aria-label={`Composición ${c.nombre}`}
                        aria-pressed={composicion === c.clave}
                        onClick={() => setComposicion(c.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${composicion === c.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{COMPOSICIONES.find(c => c.clave === composicion)?.nombre}</p>
                </div>
              )}
              {/* Con Disposiciones (Fullbleed) elegido, sus disposiciones con icono: la Clásica de siempre primero */}
              {hero === 'fullbleed' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {DISPOSICIONES.map(d => (
                      <button
                        key={d.clave}
                        type="button"
                        title={d.nombre}
                        aria-label={`Disposición ${d.nombre}`}
                        aria-pressed={disposicion === d.clave}
                        onClick={() => setDisposicion(d.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${disposicion === d.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d.dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{DISPOSICIONES.find(d => d.clave === disposicion)?.nombre}</p>
                </div>
              )}
              {/* Con Cortes (Diagonal) elegido, la lista de cortes: la Diagonal de siempre primero */}
              {hero === 'diagonal' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {CORTES.map(c => (
                      <button
                        key={c.clave}
                        type="button"
                        title={c.nombre}
                        aria-label={`Corte ${c.nombre}`}
                        aria-pressed={corte === c.clave}
                        onClick={() => setCorte(c.clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${corte === c.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        {/* La foto con la forma de su corte abajo */}
                        <svg viewBox="0 0 100 100" className="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
                          <polygon points={puntosDeCorte(c.clave)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{CORTES.find(c => c.clave === corte)?.nombre}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Estilo de carta</span>
              <div className="flex flex-wrap items-center gap-[0.4rem]">
                {estilos.map(f => {
                  const Icono = ICONOS_ESTILO_CARTA[f.carta] ?? Frame
                  return (
                    <button
                      key={f.carta}
                      type="button"
                      title={f.nombre}
                      aria-label={`Estilo de carta ${f.nombre}`}
                      aria-pressed={estilo === f.carta}
                      onClick={() => setEstilo(f.carta)}
                      className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${estilo === f.carta ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
              <p className="text-[0.85rem] font-semibold">{estilos.find(f => f.carta === estilo)?.nombre}</p>
              {/* Subdiseños de Inmersiva: las pestañas en fila (la base) o en columna */}
              {estilo === 'inmersiva' && (
                <div className="grid gap-[0.4rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {[
                      ['fila', 'Pestañas en fila', '<rect x="3" y="9" width="5" height="6" rx="3"/><rect x="9.5" y="9" width="5" height="6" rx="3"/><rect x="16" y="9" width="5" height="6" rx="3"/>'],
                      ['columna', 'Pestañas en columna', '<rect x="7" y="3" width="10" height="5" rx="2.5"/><rect x="7" y="9.5" width="10" height="5" rx="2.5"/><rect x="7" y="16" width="10" height="5" rx="2.5"/>'],
                    ].map(([clave, nombreSub, dibujo]) => (
                      <button
                        key={clave}
                        type="button"
                        title={nombreSub}
                        aria-label={nombreSub}
                        aria-pressed={subCarta === clave}
                        onClick={() => setSubCarta(clave)}
                        className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${subCarta === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: dibujo }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-zinc-500">{subCarta === 'columna' ? 'Pestañas en columna' : 'Pestañas en fila'}</p>
                </div>
              )}
              {/* El velo que oscurece la foto de Inmersiva: de 0 (sin velo) a 100 (el de siempre) y su color (sin elegir, negro) */}
              {estilo === 'inmersiva' && (
                <div className="grid gap-[0.35rem]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.8rem] font-semibold text-zinc-500">Filtro de la foto</span>
                    <span className="text-[0.8rem] font-semibold">{filtroCarta === 100 ? 'El de siempre' : filtroCarta === 0 ? 'Sin filtro' : `${filtroCarta} %`}</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={filtroCarta} onChange={e => setFiltroCarta(Number(e.target.value))} aria-label="Intensidad del filtro de la foto" className="w-full accent-zinc-900" />
                  <div className="flex items-center gap-[0.75rem]">
                    <span className="text-[0.8rem] font-semibold text-zinc-500">Color del filtro</span>
                    <CampoColor valor={colorFiltroCarta || '#000000'} auto={!colorFiltroCarta} soloCirculo cambiar={setColorFiltroCarta} />
                    {colorFiltroCarta && (
                      <button type="button" title="Volver a negro" aria-label="Volver al color negro del filtro" onClick={() => setColorFiltroCarta('')} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                        <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* El estilo del menú de navegación, debajo de la portada, con la misma fila de iconos */}
          {/* El filtro que oscurece la foto de la portada bajo el texto: de 0 (sin filtro) a 100 (el de cada diseño). El color, en Colores generales */}
          {producto === 'miniweb' && (
            <div className="grid gap-[0.35rem]">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.8rem] font-semibold text-zinc-500">Filtro de la foto</span>
                <span className="text-[0.8rem] font-semibold">{filtroFoto === 100 ? 'El de cada diseño' : filtroFoto === 0 ? 'Sin filtro' : `${filtroFoto} %`}</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={filtroFoto} onChange={e => setFiltroFoto(Number(e.target.value))} aria-label="Intensidad del filtro de la foto" className="w-full accent-zinc-900" />
              {/* El color del filtro, debajo de su barra: solo en Cortes (todos sus cortes) y en Fullbleed con el Velo de color, que son los que lo usan.
                  Sin elegir, el de cada diseño (el círculo con borde de rayitas) */}
              {(hero === 'diagonal' || (hero === 'fullbleed' && disposicion === 'velo')) && (
                <div className="flex items-center gap-[0.75rem]">
                  <span className="text-[0.8rem] font-semibold text-zinc-500">Color del filtro</span>
                  <CampoColor
                    valor={coloresMini.filtroFoto ?? (hero === 'fullbleed' ? colorCabecera : coloresAutomaticos({ colors: { ...marcaBase?.theme?.colors, bg: colorFondo, primary: colorPrincipal, accent: colorAcento, text: colorDelTexto, header: colorCabecera } }, { barra, portada: hero }, coloresMini).filtroFoto) ?? '#000000'}
                    auto={!coloresMini.filtroFoto}
                    soloCirculo
                    cambiar={v => cambiarColorMini('filtroFoto', v)}
                  />
                  {coloresMini.filtroFoto && (
                    <button type="button" title="Volver al color de cada diseño" aria-label="Volver al color del filtro de cada diseño" onClick={() => cambiarColorMini('filtroFoto', undefined)} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                      <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {producto === 'miniweb' && <FilaEstiloMenu valor={barra} cambiar={setBarra} />}
          {producto === 'miniweb' && <FilaHorario valor={horarioMini} cambiar={setHorarioMini} variante={horarioVar} cambiarVariante={setHorarioVar} />}
            </div>
          </details>
          {/* Segundo desplegable: Colores */}
          {producto === 'miniweb' && (
          <details className="group/colores rounded-[0.75rem] ring-1 ring-zinc-200">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className="text-[1rem] font-bold">Colores generales</span>
              <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/colores:rotate-180" aria-hidden="true" />
            </summary>
            <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
            <PanelColoresMiniweb
              sinTitulo
              valores={coloresMini}
              cambiar={cambiarColorMini}
              autos={coloresAutomaticos({ colors: { ...marcaBase?.theme?.colors, bg: colorFondo, primary: colorPrincipal, accent: colorAcento, text: colorDelTexto, header: colorCabecera } }, { barra, portada: hero }, coloresMini)}
            />
            <div className="mt-[1rem]">{paletaMarca}</div>
            </div>
          </details>
          )}
          {/* Tercer desplegable: Estructura, dónde va cada pieza (redes, menú de navegación y compartir) */}
          {producto === 'miniweb' && (
          <details className="group/estructura rounded-[0.75rem] ring-1 ring-zinc-200">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className="text-[1rem] font-bold">Estructura</span>
              <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/estructura:rotate-180" aria-hidden="true" />
            </summary>
            <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
              <EstructuraMiniweb sinTitulo contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
            </div>
          </details>
          )}
          {producto === 'ficha' && (
            <Plegable titulo={producto === 'miniweb' ? 'Estilo del menú de navegación' : 'Estilo de pestañas'} elegido={barra ? BARRAS[barra]?.nombre : producto === 'miniweb' ? 'La rayita' : 'El suyo'}>
              <div className="flex flex-wrap gap-[0.4rem]">
                {[['', { nombre: producto === 'miniweb' ? 'La rayita (la de siempre)' : 'El suyo' }], ...Object.entries(BARRAS)].map(([clave, b]) => (
                  <button key={clave || 'suyo'} type="button" aria-pressed={barra === clave} onClick={() => setBarra(clave)} className={opcion(barra === clave)}>
                    {b.nombre}
                  </button>
                ))}
              </div>
            </Plegable>
          )}

          {/* 4. Marca: el nombre del negocio, el icono del logo y el tamaño. En ficha y carta, aquí suelto; en miniweb, dentro de Textos */}
          {producto !== 'miniweb' && bloqueNombre}
          {/* La paleta base de la marca: suelta en ficha y carta; en miniweb va dentro de Colores generales, como Personalizado */}
          {producto === 'ficha' && paletaMarca}
          {/* Carta: sus colores en un desplegable Colores generales, con un círculo por color, como en las miniwebs */}
          {esCarta && (
            <details className="group/colores rounded-[0.75rem] ring-1 ring-zinc-200">
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-bold">Colores generales</span>
                <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/colores:rotate-180" aria-hidden="true" />
              </summary>
              <div className="flex flex-wrap items-start gap-x-[1.2rem] gap-y-[0.8rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                {[
                  ['Principal', 'Botones, precios y lo que tiene que destacar.', colorPrincipal, setPrincipal],
                  ['Acento', 'Precios, subrayados y detalles.', colorAcento, setAcento],
                  ['Fondo', 'El fondo de la carta: claro u oscuro.', colorFondo, setFondo],
                  ['Texto', 'Las letras sobre el fondo.', colorDelTexto, setColorTexto],
                ].map(([nombreColor, ayuda, valor, poner]) => (
                  <div key={nombreColor} className="grid justify-items-center gap-[0.25rem]" title={ayuda}>
                    <p className="text-[0.8rem] font-semibold text-zinc-500">{nombreColor}</p>
                    <CampoColor valor={valor} cambiar={poner} soloCirculo />
                  </div>
                ))}
                {/* El color del número del precio del menú: su color propio; con el borde de rayitas, el de cada estilo (el principal, el de acento o blanco) */}
                <div className="grid justify-items-center gap-[0.25rem]" title="El color del número del precio del menú del día. Sin elegir, el de cada estilo.">
                  <p className="text-[0.8rem] font-semibold text-zinc-500">Color del precio</p>
                  <CampoColor valor={colorPrecioTexto || (estilo === 'galeria' ? colorAcento : estilo === 'inmersiva' ? '#FFFFFF' : colorPrincipal)} auto={!colorPrecioTexto} soloCirculo cambiar={setColorPrecioTexto} />
                  {colorPrecioTexto && (
                    <button type="button" title="Volver al color del estilo" aria-label="Volver al color del precio de cada estilo" onClick={() => setColorPrecioTexto('')} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                      <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                </div>
                {/* El detalle del precio del menú (la línea bajo el precio): su color propio; con el borde de rayitas, el de acento */}
                <div className="grid justify-items-center gap-[0.25rem]" title="La línea que remarca el precio del menú del día. Sin elegir, el color de acento.">
                  <p className="text-[0.8rem] font-semibold text-zinc-500">Detalle del precio</p>
                  <CampoColor valor={colorPrecio || colorAcento} auto={!colorPrecio} soloCirculo cambiar={setColorPrecio} />
                  {colorPrecio && (
                    <button type="button" title="Volver al color de acento" aria-label="Volver al color de acento en el detalle del precio" onClick={() => setColorPrecio('')} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                      <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </details>
          )}
          {/* Los textos de la portada: el grande (en dos líneas) y el pequeño, con su máximo de caracteres (el de ahora con margen) */}
          {/* Cuarto desplegable (solo miniweb): Textos, con el nombre del negocio y los textos de la miniweb, tal como estaban */}
          {producto === 'miniweb' && (
          <details className="group/textos rounded-[0.75rem] ring-1 ring-zinc-200">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className="text-[1rem] font-bold">Textos</span>
              <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/textos:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-[1rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
            {bloqueNombre}
            {/* Tipografía, encima de Texto inicio, directamente en Textos (sin desplegable propio) */}
            {campoTipografia}
            <Plegable titulo="Texto inicio" elegido={textosEditados ? 'Cambiados' : 'Los de la plantilla'}>
              <div className="grid gap-[0.9rem]">
                <div className="grid gap-[0.3rem]">
                  <div>
                    <p className="text-[0.8rem] font-semibold text-zinc-500">Texto grande</p>
                    <p className="text-[0.8rem] text-zinc-400">El titular de la portada. Si no cabe en una línea, baja solo a la siguiente.</p>
                  </div>
                  <input value={textoGrande} maxLength={maxGrande} onChange={e => setTextosMini(t => ({ ...t, titular: e.target.value }))} className={CAMPO} />
                  <span className="justify-self-end text-[0.75rem] text-zinc-500">
                    {textoGrande.length}/{maxGrande}
                  </span>
                </div>
                <div className="grid gap-[0.3rem]">
                  <div>
                    <p className="text-[0.8rem] font-semibold text-zinc-500">Texto pequeño</p>
                    <p className="text-[0.8rem] text-zinc-400">La descripción de debajo del titular.</p>
                  </div>
                  <textarea
                    value={textoPequeno}
                    maxLength={maxDe(inicioBase?.descripcion ?? 'Descripción de la portada del negocio, en pocas palabras')}
                    onChange={e => setTextosMini(t => ({ ...t, descripcion: e.target.value }))}
                    rows={3}
                    className={`${CAMPO} resize-y`}
                  />
                  <span className="justify-self-end text-[0.75rem] text-zinc-500">
                    {textoPequeno.length}/{maxDe(inicioBase?.descripcion ?? 'Descripción de la portada del negocio, en pocas palabras')}
                  </span>
                </div>
                {conTextoExtra && (
                  <div className="grid gap-[0.3rem]">
                    <div>
                      <p className="text-[0.8rem] font-semibold text-zinc-500">Texto extra</p>
                      <p className="text-[0.8rem] text-zinc-400">Un horario o lo que quieras, debajo del botón. Solo lo pintan Editorial, Cortes y Fullbleed.</p>
                    </div>
                    <input
                      value={textoExtra}
                      maxLength={MAX_TEXTO_EXTRA}
                      onChange={e => setTextosMini(t => ({ ...t, info: e.target.value }))}
                      placeholder="De martes a domingo, de 13:00 a 23:00"
                      className={CAMPO}
                    />
                    <span className="justify-self-end text-[0.75rem] text-zinc-500">
                      {textoExtra.length}/{MAX_TEXTO_EXTRA}
                    </span>
                  </div>
                )}
                {textosEditados && (
                  <button type="button" onClick={() => setTextosMini({})} className="justify-self-start text-[0.8rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                    Volver a los textos de la plantilla
                  </button>
                )}
              </div>
            </Plegable>
            {/* Debajo, los textos de la página del Horario */}
            {datosEnBruto && (
              <Plegable titulo="Texto horarios">
                <TextosHorario original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
              </Plegable>
            )}
            {/* Debajo, los nombres de las pestañas del menú */}
            {datosEnBruto && (
              <Plegable titulo="Texto pestañas">
                <TextosPestanas original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
              </Plegable>
            )}
            </div>
          </details>
          )}
          {/* Carta: Estructura, dónde va cada pieza. De momento, el enlace "Conoce [negocio]" (a la miniweb del negocio) */}
          {esCarta && (
            <details className="group/estructuracarta rounded-[0.75rem] ring-1 ring-zinc-200">
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-bold">Estructura</span>
                <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/estructuracarta:rotate-180" aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.4rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                <span className="text-[0.8rem] text-zinc-500">Enlace al negocio (Conoce...)</span>
                <div className="flex flex-wrap items-center gap-[0.4rem]">
                  {[
                    ['ninguno', 'Sin enlace', '<path d="M9 8l6 6M15 8l-6 6" stroke-width="1.4"/>'],
                    ['izquierda', 'Arriba a la izquierda', '<rect x="7.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
                    ['derecha', 'Arriba a la derecha', '<rect x="10.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
                  ].map(([clave, nombreLado, dibujo]) => (
                    <button
                      key={clave}
                      type="button"
                      title={nombreLado}
                      aria-label={`Enlace al negocio: ${nombreLado}`}
                      aria-pressed={enlaceNegocio === clave}
                      onClick={() => setEnlaceNegocio(clave)}
                      className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${enlaceNegocio === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                    >
                      <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<rect x="5.5" y="2" width="13" height="20" rx="2.5"/>' + dibujo }} />
                    </button>
                  ))}
                </div>
                <p className="text-[0.85rem] font-semibold">{{ ninguno: 'Sin enlace', izquierda: 'Arriba a la izquierda', derecha: 'Arriba a la derecha' }[enlaceNegocio]}</p>
              </div>
            </details>
          )}
          {/* Carta: Tamaños de texto. De momento, solo el del precio del menú (MD es el de cada estilo) */}
          {esCarta && (
            <details className="group/tamanos rounded-[0.75rem] ring-1 ring-zinc-200">
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-bold">Tamaño de textos</span>
                <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/tamanos:rotate-180" aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.4rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                <span className="text-[0.8rem] font-semibold text-zinc-500">Precio</span>
                <div className="flex gap-[0.4rem]">
                  {['xs', 'md', 'xl'].map(t => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tamanoPrecio === t}
                      onClick={() => setTamanoPrecio(t)}
                      className={`rounded-full px-[0.8rem] py-[0.25rem] text-[0.78rem] font-semibold uppercase ring-1 transition-colors ${tamanoPrecio === t ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          )}
          {/* Carta: Diseño del precio, el detalle que remarca el precio del menú. Primero la familia (Sin estilo, Líneas o Círculos) y debajo sus subestilos */}
          {esCarta && (
            <details className="group/dprecio rounded-[0.75rem] ring-1 ring-zinc-200">
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-bold">Diseño del precio</span>
                <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/dprecio:rotate-180" aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                {(() => {
                  const TEXTO = '<text x="12" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none">12€</text>'
                  const SUBESTILOS = {
                    lineas: [
                      ['raya', 'Raya', '<path d="M4 18h16" stroke-width="2.5"/>'],
                      ['ondulada', 'Ondulada', '<path d="M3 18c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 2.2 1.4 2.6 0"/>'],
                      ['pincelada', 'Pincelada', '<path d="M3.5 18.5c4.5-2.2 9 1.2 17-1.2" stroke-width="2.2"/>'],
                      ['doble', 'Doble línea', '<path d="M4 17h16M4 20h16" stroke-width="1.2"/>'],
                    ],
                    circulos: [
                      ['ovalo', 'Óvalo a mano', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>'],
                      ['repasado', 'Óvalo repasado', '<ellipse cx="12" cy="12" rx="9.5" ry="6" transform="rotate(-4 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="6.6" transform="rotate(4 12 12)"/>'],
                      ['arco', 'Arco abierto', '<path d="M6 17A9.5 6.2 0 1 0 5.5 8.5"/>'],
                      ['sello', 'Sello de puntos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" stroke-dasharray="0.1 2.4"/>'],
                    ],
                    formas: [
                      ['estrella', 'Estrella de oferta', '<path d="M12 3l1.6 2.2 2.6-.7.5 2.7 2.6 1-1.2 2.4 1.2 2.4-2.6 1-.5 2.7-2.6-.7L12 21l-1.6-2.2-2.6.7-.5-2.7-2.6-1L5.9 13 4.7 10.6l2.6-1 .5-2.7 2.6.7z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['pastilla', 'Pastilla', '<rect x="2.5" y="6.5" width="19" height="11" rx="5.5" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['etiqueta', 'Etiqueta de precio', '<path d="M2.5 12l3.5-5.5h15v11H6z" fill="currentColor" opacity=".2" stroke="none"/><circle cx="6.2" cy="12" r=".9" fill="white" stroke="none"/>'],
                      ['cinta', 'Cinta', '<path d="M2 6.5h20l-1.8 5.5 1.8 5.5H2l1.8-5.5z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['burbuja', 'Burbuja', '<path d="M3.5 5.5h17v9.5H10l-3.5 3.5V15h-3z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['rombo', 'Rombo', '<path d="M5 6.5h14l3 5.5-3 5.5H5L2 12z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['escudo', 'Escudo', '<path d="M4.5 5.5h15v8l-7.5 6-7.5-6z" fill="currentColor" opacity=".2" stroke="none"/>'],
                    ],
                  }
                  const familia = detallePrecio === 'ninguno' ? 'sin' : SUBESTILOS.lineas.some(([c]) => c === detallePrecio) ? 'lineas' : SUBESTILOS.formas.some(([c]) => c === detallePrecio) ? 'formas' : 'circulos'
                  const nombreDe = [...SUBESTILOS.lineas, ...SUBESTILOS.circulos, ...SUBESTILOS.formas].find(([c]) => c === detallePrecio)?.[1]
                  const boton = (clave, nombreBoton, dibujo, activo, alTocar) => (
                    <button
                      key={clave}
                      type="button"
                      title={nombreBoton}
                      aria-label={nombreBoton}
                      aria-pressed={activo}
                      onClick={alTocar}
                      className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${activo ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                    >
                      <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: TEXTO + dibujo }} />
                    </button>
                  )
                  return (
                    <>
                      <div className="grid gap-[0.35rem]">
                        <div className="flex gap-[0.4rem]">
                          {boton('sin', 'Sin estilo', '', familia === 'sin', () => setDetallePrecio('ninguno'))}
                          {boton('lineas', 'Líneas', '<path d="M4 18h16" stroke-width="2.5"/>', familia === 'lineas', () => familia !== 'lineas' && setDetallePrecio('raya'))}
                          {boton('circulos', 'Círculos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>', familia === 'circulos', () => familia !== 'circulos' && setDetallePrecio('ovalo'))}
                          {boton('formas', 'Formas', '<path d="M4 6.5h16l2 5.5-2 5.5H4l-2-5.5z" fill="currentColor" opacity=".2" stroke="none"/>', familia === 'formas', () => familia !== 'formas' && setDetallePrecio('estrella'))}
                        </div>
                        <p className="text-[0.85rem] font-semibold">{{ sin: 'Sin estilo', lineas: 'Líneas', circulos: 'Círculos', formas: 'Formas' }[familia]}</p>
                      </div>
                      {familia !== 'sin' && (
                        <div className="grid gap-[0.35rem]">
                          <div className="flex flex-wrap gap-[0.4rem]">
                            {SUBESTILOS[familia].map(([clave, nombreSub, dibujo]) => boton(clave, nombreSub, dibujo, detallePrecio === clave, () => setDetallePrecio(clave)))}
                          </div>
                          <p className="text-[0.8rem] text-zinc-500">{nombreDe}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </details>
          )}
          {/* La tipografía: en miniweb va dentro de Textos de la miniweb, abajo del todo */}
          {producto !== 'miniweb' && campoTipografia}
            {/* Imágenes: todas las de la página, por pestaña, con el buscador de fotos y para subir la tuya */}
            {datosEnBruto && (
              <details className="group/imagenes rounded-[0.75rem] ring-1 ring-zinc-200">
                <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                  <span className="text-[1rem] font-bold">Imágenes</span>
                  <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/imagenes:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                  <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
                </div>
              </details>
            )}
            {/* Todos los datos editables en bruto, en sus desplegables (los del editor de un perfil) */}
            {!esCarta && datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />}
            {/* La carta del menú, abajo del todo */}
            {producto === 'miniweb' && <SelectorCartaMiniweb valor={cartaMini} cambiar={valor => setCartaMini(valor ?? '')} exportadas={(filas ?? []).filter(f => f.tipo === 'carta' && f.base && f.cambios?._cliente)} />}
          </div>
          )}

        </div>
        </div>

        {/* Vista previa: el contenido de la temática con el diseño elegido. A 360 px de ancho por dentro, como el móvil bajo:
            se ve lo mismo que verá el cliente. En pantalla grande, a la derecha y fija al bajar */}
        <div className="order-2 lg:sticky lg:top-[1rem] lg:order-none lg:col-start-2 lg:row-start-1">
          {/* Las copias para enseñar (sin las demos originales) del producto elegido, para cargarlas aquí y retocarlas */}
          <label className="mx-auto mb-[0.7rem] grid w-full max-w-[20rem] gap-[0.25rem]">
            <span className="text-[0.8rem] font-semibold text-zinc-500">Copia</span>
            <select
              value={copiaCargada ? `${copiaCargada.tipo}:${copiaCargada.slug}` : ''}
              onChange={e => {
                if (!e.target.value) return setCopiaCargada(null)
                // Con cambios sin guardar, cargar otra copia los perdería: se pregunta antes (si se cancela, el desplegable se queda como estaba)
                if (sinGuardar && !window.confirm('Tienes cambios sin guardar. Si cambias de copia, se pierden. ¿Quieres cambiar de todos modos?')) return
                const [t, sl] = e.target.value.split(':')
                cargarCopia((filas ?? []).find(f => f.tipo === t && f.slug === sl))
              }}
              className={CAMPO}
            >
              <option value="">Ninguna (una nueva)</option>
              {(filas ?? [])
                .filter(f => f.base && (f.tipo === 'carta' ? producto === 'carta' : producto !== 'carta' && (f.cambios?._nuevoPerfil?.producto ?? tipoDe(conEdicion('negocio', f.slug, f) ?? {})) === producto))
                .map(f => {
                  const antigua = !f.cambios?._nuevoPerfil
                  const nombreFila = f.cambios?._nuevoPerfil?.nombre || f.cambios?.nombre || f.cambios?.['marca.nombre'] || f.slug
                  return (
                    <option key={`${f.tipo}:${f.slug}`} value={`${f.tipo}:${f.slug}`} disabled={antigua}>
                      {nombreFila}
                      {antigua ? ' (antigua, no se abre aquí)' : ''}
                    </option>
                  )
                })}
            </select>
          </label>
          {pestana === 'asistente' && !generado ? (
            <Movil ancho={360} className="mx-auto w-full max-w-[20rem]">
              <div className="flex h-full items-center justify-center bg-black px-[1.5rem] text-center text-[0.95rem] font-semibold text-[rgb(255_255_255/0.6)]">Genera algo con el asistente y aparecerá aquí</div>
            </Movil>
          ) : (
            vista && <Movil key={vista} src={vista} titulo="Vista previa" ancho={360} className="mx-auto w-full max-w-[20rem]" />
          )}
          <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500">Con el contenido de ejemplo de la temática</p>
          {/* Debajo del móvil: Añadir a copias (crea la copia) o, con una copia cargada, Guardar cambios y Guardar como nueva */}
          <div className="mx-auto mt-[0.9rem] grid w-full max-w-[20rem] gap-[0.5rem]">
            {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
            {(pestana !== 'asistente' || cambiosIA || copiaCargada) &&
              (copiaCargada ? (
                <div className="grid gap-[0.5rem]">
                  <button type="button" onClick={guardarCopia} disabled={Boolean(creando) || Boolean(disenando)} className={BOTON}>
                    {creando ?? 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => crear()}
                    disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)}
                    className="rounded-[0.7rem] bg-white px-[1rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500 disabled:opacity-50"
                  >
                    Guardar como nueva
                  </button>
                </div>
              ) : (
                <button type="button" onClick={crear} disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)} className={BOTON}>
                  {creando ?? 'Añadir a copias'}
                </button>
              ))}
          </div>
          {/* Ya no hay muestras: todo lo que se crea es una copia para enseñar. El aviso de Guardar cambios sale aquí */}
          {aviso && <p className="mt-[0.7rem] text-center text-[0.8rem] font-semibold text-emerald-700">{aviso}</p>}
        </div>
      </div>
    </details>
  )
}

/* Las páginas que pueden tener QR (copias, fichas y miniwebs, cartas), con su dirección y su marca (colores, fuentes,
   sector). sesion: el slug de su editor de QR para clientes (en las cartas, slug-carta, para no chocar con su ficha) */
const paginasConQR = copias =>
  [
    // Las copias cuya demo sigue existiendo (sin ella no hay datos de los que sacar los colores)
    ...copias
      .filter(f => (f.tipo === 'carta' ? getCarta(f.base) : getNegocio(f.base)))
      .map(f => ({
        clave: `${f.tipo}:${f.slug}`,
        slug: f.slug,
        grupo: 'Copias',
        nombre: f.nombre,
        ruta: f.ruta,
        tipo: f.tipo,
        datos: aplicar(f.tipo === 'carta' ? getCarta(f.base) : getNegocio(f.base), f.cambios ?? {}),
      })),
    ...negocios.map(n => ({ clave: `negocio:${n.slug}`, slug: n.slug, grupo: 'Fichas y miniwebs', nombre: n.nombre, ruta: rutaNegocio(n), tipo: 'negocio', datos: n })),
    ...cartas.map(c => ({ clave: `carta:${c.slug}`, slug: c.slug, grupo: 'Cartas', nombre: marcaDe(c)?.nombre ?? c.slug, ruta: rutaCarta(c), tipo: 'carta', datos: c })),
  ].map(p => {
    const marca = p.tipo === 'carta' ? marcaDe(p.datos) : p.datos
    return { ...p, marca, colores: marca?.theme?.colors, fuentes: marca?.theme?.fonts, sesion: p.tipo === 'carta' ? `${p.slug}-carta` : p.slug }
  })

// Desplegable para elegir una de esas páginas, por grupos
function ElegirPagina({ paginas, valor, cambiar, vacio }) {
  return (
    <select value={valor} onChange={e => cambiar(e.target.value)} className={CAMPO}>
      <option value="">{vacio}</option>
      {['Copias', 'Fichas y miniwebs', 'Cartas'].map(g => (
        <optgroup key={g} label={g}>
          {paginas
            .filter(p => p.grupo === g)
            .map(p => (
              <option key={p.clave} value={p.clave}>
                {p.nombre}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}

/* Generador de QR de la página principal. Arriba se elige la página: pone su dirección, su inicial y sus colores
   ("Su marca" y el asistente los tienen en cuenta). Sin elegir, el QR es suelto: la dirección se escribe a mano y el
   asistente trabaja con lo que se le cuente. */
function QRSuelto({ copias }) {
  const [clave, setClave] = useState('')
  const paginas = paginasConQR(copias)
  const pagina = paginas.find(p => p.clave === clave)

  return (
    <div className="grid gap-[1rem]">
      <label className="mx-auto grid w-full max-w-[32rem] gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Página</span>
        <ElegirPagina paginas={paginas} valor={clave} cambiar={setClave} vacio="Ninguna (QR suelto)" />
      </label>
      {/* key: al cambiar de página, el generador empieza de cero con lo de esa página */}
      <GeneradorQR
        key={clave || 'suelto'}
        url={`${DOMINIO}${pagina?.ruta ?? '/'}`}
        nombre={pagina?.nombre ?? ''}
        colores={pagina?.colores}
        fuentes={pagina?.fuentes}
        proponer={(descripcion, siluetas) =>
          llamar('asistente', {
            paso: 'colores-qr',
            descripcion,
            siluetas,
            tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
            nombre: pagina?.nombre ?? '',
            sector: pagina?.marca?.sector ?? '',
            colores: pagina?.colores,
          })
        }
      />
    </div>
  )
}

/* Cambiar lo que enseña un QR ya impreso: el QR lleva una dirección fija (por ejemplo prueba-1) y aquí se elige qué página enseña. Se hace con una
   página ya montada en el Editor; no se copia nada: el QR pasa a enseñar esa página (y si luego se retoca, el QR enseña lo retocado). */
function CambiarQR({ copias }) {
  const paginas = paginasConQR(copias)
  const [clave, setClave] = useState('')
  const [qr, setQr] = useState('')
  const [lista, setLista] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    supabase
      .from('qr_destinos')
      .select('tipo, slug, destino')
      .order('actualizado', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('No se pueden leer los QR. ¿Has ejecutado el SQL 011_qr_destinos.sql en Supabase?')
        setLista(data ?? [])
      })
  }, [])
  useEffect(cargar, [cargar])

  const [tipo, destino] = clave.split(':')
  const slugQr = aSlug(qr)
  const pagina = paginas.find(p => p.clave === clave)
  const direccion = (t, s) => `${DOMINIO}/${s}${t === 'carta' ? '/carta' : ''}`

  const publicar = async () => {
    if (!pagina || !slugQr || guardando) return
    setError('')
    setAviso('')
    if (RESERVADAS.has(slugQr)) {
      setError('Esa dirección está reservada: usa otra.')
      return
    }
    setGuardando(true)
    const { error } = await supabase.from('qr_destinos').upsert({ tipo, slug: slugQr, destino })
    setGuardando(false)
    if (error) {
      setError('No se ha podido publicar en el QR.')
      return
    }
    setAviso(`Listo: ${direccion(tipo, slugQr)} ahora enseña «${pagina.nombre}».`)
    cargar()
  }
  const quitar = async f => {
    await supabase.from('qr_destinos').delete().eq('tipo', f.tipo).eq('slug', f.slug)
    cargar()
  }

  return (
    <div className="mx-auto grid w-full max-w-[32rem] gap-[0.75rem]">
      <p className="text-[0.88rem] leading-[1.45] text-zinc-600">Elige la página que ya has montado y la dirección del QR impreso: el QR pasa a enseñar esa página, sin tocar la placa.</p>
      <label className="grid gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Qué página enseña</span>
        <ElegirPagina paginas={paginas} valor={clave} cambiar={setClave} vacio="Elige una página" />
      </label>
      <Etiqueta texto="Dirección del QR impreso (lo que va después de mostraq.es/)">
        <input value={qr} onChange={e => setQr(e.target.value)} list="qr-impresos" className={CAMPO} placeholder="prueba-1" autoCapitalize="none" autoCorrect="off" />
        <datalist id="qr-impresos">
          {(lista ?? []).map(f => (
            <option key={`${f.tipo}:${f.slug}`} value={f.slug} />
          ))}
        </datalist>
      </Etiqueta>
      <button type="button" onClick={publicar} disabled={!pagina || !slugQr || guardando} className={BOTON}>
        {guardando ? 'Publicando...' : 'Publicar en el QR'}
      </button>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}
      {aviso && <p className="text-[0.88rem] font-semibold text-emerald-700">{aviso}</p>}
      {lista?.length > 0 && (
        <ul className="grid gap-[0.4rem]">
          {lista.map(f => (
            <li key={`${f.tipo}:${f.slug}`} className="flex items-center justify-between gap-[0.75rem] rounded-[0.75rem] bg-white p-[0.7rem] text-[0.85rem] ring-1 ring-zinc-200">
              <span className="min-w-0 break-all">
                <span className="font-semibold">{direccion(f.tipo, f.slug).replace(`${DOMINIO}/`, '/')}</span> enseña {f.destino}
              </span>
              <button type="button" onClick={() => quitar(f)} className="shrink-0 text-red-600 underline underline-offset-[0.2em]">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* Editor de QR para clientes: Jesús elige la página y se crea el enlace (/mi-qr/slug) con un PIN, que se ve solo
   una vez (se guarda cifrado). Debajo, las sesiones: si siguen abiertas, los intentos de IA que le quedan al cliente y
   el diseño que ha enviado (se abre en el generador para descargarlo e imprimirlo). Se pueden cerrar, renovar con
   un PIN nuevo y borrar. */
function EditorClientes({ copias }) {
  const paginas = paginasConQR(copias)
  const [clave, setClave] = useState('')
  const [creando, setCreando] = useState(false)
  const [nueva, setNueva] = useState(null)
  const [error, setError] = useState('')
  const [sesiones, setSesiones] = useState(null)
  const [viendo, setViendo] = useState(null)

  const cargar = useCallback(() => {
    supabase
      .from('qr_sesiones')
      .select('slug, nombre, url, colores, fuentes, intentos_ia, caduca, activa, diseno, enviado, creado')
      .order('creado', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('No se pueden leer las sesiones. ¿Has ejecutado el SQL 009_mi_qr.sql en Supabase?')
        setSesiones(data ?? [])
      })
  }, [])
  useEffect(cargar, [cargar])

  const enlaceDe = slug => `${DOMINIO}/mi-qr/${slug}`

  // Crea (o renueva) la sesión de una página con un PIN nuevo
  const crear = async p => {
    setCreando(true)
    setError('')
    try {
      const { pin, caduca } = await llamar('mi-qr', {
        accion: 'crear',
        slug: p.sesion,
        nombre: p.nombre,
        url: `${DOMINIO}${p.ruta}`,
        colores: p.colores ?? null,
        fuentes: p.fuentes ?? null,
      })
      setNueva({ nombre: p.nombre, enlace: enlaceDe(p.sesion), pin, caduca })
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreando(false)
    }
  }

  const cerrar = async slug => {
    await supabase.from('qr_sesiones').update({ activa: false }).eq('slug', slug)
    cargar()
  }
  const borrar = async slug => {
    await supabase.from('qr_sesiones').delete().eq('slug', slug)
    if (viendo?.slug === slug) setViendo(null)
    cargar()
  }

  // Mensaje para mandar al cliente por WhatsApp
  const mensaje = n => `Hola, aquí puedes diseñar la placa con el QR de ${n.nombre}: ${n.enlace}\nTu PIN es ${n.pin}. Cuando te guste, dale a "Enviar mi diseño".`

  const pagina = paginas.find(p => p.clave === clave)
  const estadoDe = s => (!s.activa ? 'Cerrada' : s.caduca && new Date(s.caduca) < new Date() ? 'Caducada' : 'Abierta')

  return (
    <div className="mx-auto grid w-full max-w-[32rem] gap-[1rem]">
      <p className="text-[0.88rem] leading-[1.45] text-zinc-600">
        Crea un enlace con PIN para que el cliente diseñe su placa (con 2 propuestas de la IA). Sin el PIN, el enlace solo enseña su QR. Caduca a los 7 días.
      </p>
      <div className="grid gap-[0.5rem]">
        <ElegirPagina paginas={paginas} valor={clave} cambiar={setClave} vacio="Elige la página del cliente" />
        <button type="button" onClick={() => pagina && crear(pagina)} disabled={!pagina || creando} className={BOTON}>
          {creando ? 'Creando...' : 'Crear enlace y PIN'}
        </button>
      </div>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}

      {/* El PIN recién creado: solo se ve ahora */}
      {nueva && (
        <div className="grid gap-[0.5rem] rounded-[0.75rem] bg-emerald-50 p-[0.9rem] ring-1 ring-emerald-200">
          <p className="text-[0.9rem] font-semibold">Para {nueva.nombre}</p>
          <p className="break-all text-[0.85rem]">{nueva.enlace}</p>
          <p className="font-mono text-[1.4rem] tracking-[0.25em]">{nueva.pin}</p>
          <p className="text-[0.8rem] text-zinc-600">Apúntalo o mándalo ya: el PIN solo se ve ahora.</p>
          <div className="flex flex-wrap gap-[0.5rem]">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(mensaje(nueva))}
              className="min-h-[2.5rem] rounded-[0.6rem] bg-white px-[0.9rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300"
            >
              Copiar mensaje
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensaje(nueva))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-white px-[0.9rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300"
            >
              Mandar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Las sesiones */}
      {sesiones?.length > 0 && (
        <ul className="grid gap-[0.5rem]">
          {sesiones.map(s => (
            <li key={s.slug} className="grid gap-[0.4rem] rounded-[0.75rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
              <div className="flex items-baseline justify-between gap-[0.75rem]">
                <p className="min-w-0 truncate font-semibold">{s.nombre}</p>
                <p className="shrink-0 text-[0.8rem] text-zinc-500">{estadoDe(s)}</p>
              </div>
              <p className="text-[0.8rem] text-zinc-500">
                {s.enviado ? `Diseño enviado el ${new Date(s.enviado).toLocaleDateString('es-ES')}` : 'Sin diseño enviado'} · IA: le quedan {s.intentos_ia}
              </p>
              <div className="flex flex-wrap gap-x-[1rem] gap-y-[0.3rem] text-[0.85rem] font-semibold">
                {s.diseno && (
                  <button type="button" onClick={() => setViendo(viendo?.slug === s.slug ? null : s)} className="underline underline-offset-[0.2em]">
                    {viendo?.slug === s.slug ? 'Ocultar diseño' : 'Ver diseño'}
                  </button>
                )}
                <a href={enlaceDe(s.slug)} target="_blank" rel="noreferrer" className="underline underline-offset-[0.2em]">
                  Abrir enlace
                </a>
                {estadoDe(s) === 'Abierta' && (
                  <button type="button" onClick={() => cerrar(s.slug)} className="underline underline-offset-[0.2em]">
                    Cerrar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => crear({ sesion: s.slug, nombre: s.nombre, ruta: rutaDe(s.url), colores: s.colores, fuentes: s.fuentes })}
                  className="underline underline-offset-[0.2em]"
                >
                  PIN nuevo
                </button>
                <button type="button" onClick={() => borrar(s.slug)} className="text-red-600 underline underline-offset-[0.2em]">
                  Borrar
                </button>
              </div>
              {/* El diseño del cliente, en el generador: se revisa, se retoca si hace falta y se descarga */}
              {viendo?.slug === s.slug && (
                <div className="mt-[0.5rem] border-t border-zinc-200 pt-[0.75rem]">
                  <GeneradorQR key={`${s.slug}-${s.enviado}`} url={conDominio(s.url)} nombre={s.nombre} colores={s.colores ?? undefined} fuentes={s.fuentes ?? undefined} estadoInicial={s.diseno} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Lista({ filas, abrir, recargar, copia }) {
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
        : { ...f, nombre: f.cambios?.nombre ?? f.slug, detalle: `Copia de ${getNegocio(f.base)?.nombre ?? f.base}`, ruta: f.cambios?._cliente ? `/${f.slug}` : `/demo/${f.slug}` },
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

  // Grupo desplegable: cerrado, con su número; al tocarlo se abre la lista. Con secciones (titulo + filas), la lista se separa en partes con su título
  const Grupo = ({ titulo, filas: lista, secciones }) =>
    lista.length > 0 && secciones ? (
      <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
        <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
          <span className="text-[1.05rem] font-bold">{titulo}</span>
          <span className="text-[0.9rem] text-zinc-500">{lista.length}</span>
        </summary>
        {secciones
          .filter(s => s.filas.length > 0)
          .map(s => (
            <div key={s.titulo}>
              <p className="flex items-baseline justify-between border-y border-zinc-200 bg-zinc-50 px-[1rem] py-[0.5rem] text-[0.9rem] font-bold first:border-t-0">
                {s.titulo}
                <span className="text-[0.8rem] font-normal text-zinc-500">{s.filas.length}</span>
              </p>
              <ul className="px-[1rem]">
                {s.filas.map(f => (
                  <Fila key={f.clave} {...f} />
                ))}
              </ul>
            </div>
          ))}
      </details>
    ) : (
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
    )

  const aFila = n => ({ clave: `negocio:${n.slug}`, nombre: n.nombre, detalle: n.demo ? 'Demo' : 'Cliente', ruta: rutaNegocio(n) })
  const aFilaCopia = f => ({ clave: `${f.tipo}:${f.slug}`, nombre: f.nombre, detalle: f.detalle, ruta: f.ruta })
  // Una copia exportada a muestras (botón de Nuevo perfil): sale en Miniwebs y no en Copias para enseñar
  const esMuestra = f => f.tipo === 'negocio' && f.cambios?.muestra === true

  return (
    <div className="grid gap-[1.75rem]">
      {/* Crear: el Editor de miniwebs y cartas y el Editor QR */}
      <div className="grid gap-[0.75rem]">
      <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">Crear</h2>
      {/* Panel principal: crear un perfil nuevo eligiendo temática, producto, diseño y marca */}
      <NuevoPerfil filas={filas} recargar={recargar} abrir={abrir} cargar={copia} />

      {/* El botón "Crear con el asistente" (el primer asistente) está oculto: el Editor ya lo hace todo. Su pantalla (CrearConAsistente) sigue en el código */}

      {/* Generador de QR, aparte: se elige la página o se hace uno suelto */}
      <details className="group/qr rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Editor QR</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/qr:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <QRSuelto copias={copias} />
        </div>
      </details>
      </div>

      {/* QR en marcha: cambiar lo que enseña un QR ya impreso y el editor de QR de los clientes */}
      <div className="grid gap-[0.75rem]">
      <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">QR en marcha</h2>
      {/* Cambiar lo que enseña un QR ya impreso: se elige la página y la dirección del QR */}
      <details className="group/cambiar rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Cambiar un QR impreso</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/cambiar:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <CambiarQR copias={copias} />
        </div>
      </details>

      {/* Editor de QR para clientes: enlace con PIN para que el cliente diseñe su placa */}
      <details className="group/clientes rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Editor de QR para clientes</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/clientes:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <EditorClientes copias={copias} />
        </div>
      </details>
      </div>

      {/* Páginas: todo lo que hay, por producto, en desplegables cerrados (las fichas, que ya no se venden, al final) */}
      <div className="grid gap-[0.6rem]">
        <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">Páginas</h2>
        {/* Las copias, separadas en Miniwebs y Cartas: cada copia que se guarda cae sola en el suyo, según lo que sea */}
        <Grupo
          titulo="Copias para enseñar"
          filas={copias.map(aFilaCopia)}
          secciones={[
            { titulo: 'Miniwebs', filas: copias.filter(c => c.tipo !== 'carta').map(aFilaCopia) },
            { titulo: 'Cartas', filas: copias.filter(c => c.tipo === 'carta').map(aFilaCopia) },
          ]}
        />
        {/* Las miniwebs de siempre y, con ellas, las que se exportan a muestras desde Nuevo perfil */}
        <Grupo titulo="Miniwebs" filas={negocios.filter(n => tipoDe(n) === 'miniweb').map(aFila)} />
        <Grupo
          titulo="Cartas"
          filas={cartas.map(c => ({ clave: `carta:${c.slug}`, nombre: marcaDe(c)?.nombre ?? c.slug, detalle: c.demo ? 'Demo' : 'Cliente', ruta: rutaCarta(c) }))}
        />
        <Grupo titulo="Fichas" filas={negocios.filter(n => tipoDe(n) === 'ficha').map(aFila)} />
      </div>
    </div>
  )
}

/* Barra de arriba de /admin, en todas sus pantallas: el título y un menú hamburguesa con el correo y Salir.
   El menú se cierra tocando fuera o con Escape. */
function BarraAdmin({ email }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = e => {
      if (!caja.current?.contains(e.target)) setAbierto(false)
    }
    const tecla = e => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  return (
    <nav className="mb-[0.5rem] flex items-center justify-between gap-[1rem]">
      <p className="text-[1.1rem] font-bold">Generador</p>
      <div ref={caja} className="relative">
        <button
          type="button"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          onClick={() => setAbierto(a => !a)}
          className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] text-zinc-900 hover:bg-zinc-200"
        >
          {abierto ? <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" /> : <Menu className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />}
        </button>
        {abierto && (
          <div className="absolute right-0 top-[calc(100%+0.4rem)] z-20 grid w-[16rem] max-w-[calc(100vw-2rem)] gap-[0.6rem] rounded-[0.9rem] bg-white p-[0.9rem] shadow-[0_0.3rem_1.2rem_rgb(0_0_0/0.15)] ring-1 ring-zinc-200">
            <p className="truncate text-[0.85rem] text-zinc-500">{email}</p>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-[0.6rem] bg-zinc-100 py-[0.55rem] text-[0.92rem] font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

// Flecha fija abajo a la derecha para volver arriba del todo; sale al bajar un poco (arriba no hace falta)
function SubirArriba() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > 300)
    mirar()
    window.addEventListener('scroll', mirar, { passive: true })
    return () => window.removeEventListener('scroll', mirar)
  }, [])

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-[1rem] right-[1rem] z-30 flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full bg-zinc-900 text-white shadow-[0_0.2rem_0.8rem_rgb(0_0_0/0.25)] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ArrowUp className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    </button>
  )
}

export default function AdminPage() {
  const sesion = usePaginaPrivada('Administración')
  const [esAdmin, setEsAdmin] = useState(undefined)
  const [filas, setFilas] = useState(null)
  const [params, setParams] = useSearchParams()
  // Lo que se está editando va en la dirección (?editar=negocio:laca): el botón atrás del móvil vuelve a la lista
  const editar = params.get('editar')
  // ?copia=negocio:slug: la copia que se carga en Nuevo perfil (botón Editar de su pantalla de información)
  const copia = params.get('copia')

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
    <div className="tema-admin min-h-svh font-sans">
      <div className={`mx-auto w-full max-w-[32rem] px-[1rem] pb-[2rem] pt-[1rem] ${editar === 'asistente' ? '' : 'lg:max-w-[64rem]'}`}>
        {!supabase ? (
          <p className="mt-[3rem] text-center text-zinc-500">El panel no está disponible ahora mismo.</p>
        ) : sesion === undefined ? null : !sesion ? (
          <Entrar titulo="Administración" texto="Entra para editar las fichas, miniwebs y cartas." />
        ) : (
          <>
            <BarraAdmin email={sesion.user.email} />
            <SubirArriba />

            {esAdmin === undefined || (esAdmin && !filas) ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : !esAdmin ? (
              <p className="text-zinc-500">Esta cuenta no tiene acceso a este panel.</p>
            ) : editar === 'asistente' ? (
              <CrearConAsistente filas={filas} volver={() => abrir(null)} recargar={recargar} abrir={abrir} />
            ) : editar && (tipo === 'negocio' || tipo === 'carta') ? (
              // key: al abrir otra (por ejemplo, la copia recién creada) el editor empieza de cero
              <Editor
                key={`${editar}-${Boolean(fila)}`}
                tipo={tipo}
                slug={slug}
                fila={fila}
                volver={() => abrir(null)}
                recargar={recargar}
                abrir={abrir}
                irANuevoPerfil={clave => {
                  setParams({ copia: clave })
                  window.scrollTo(0, 0)
                }}
              />
            ) : (
              <Lista filas={filas} abrir={abrir} recargar={recargar} copia={copia} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
