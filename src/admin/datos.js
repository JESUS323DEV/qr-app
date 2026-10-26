/* Qué se puede editar de cada archivo: reparte sus datos en campos (textos, colores, fotos) y los organiza en bloques para el editor. */

// Los campos de la ficha que no se pintan en una miniweb (su titular sobre la foto, su segunda línea y su texto): se dejan vacíos al convertirla
export const LIMPIAR_FICHA = { 'hero.titulo': '', 'hero.destacado': '', 'hero.brillo': '', 'hero.texto': '' }

/* ---------- Qué se puede editar de cada archivo ---------- */

// Datos que no se tocan desde aquí: estructura, diseño, direcciones internas, tipografías...
// (barra es el estilo de pestañas: se elige en el bloque Diseño, con su selector)
const SALTAR = new Set(['slug', 'demo', 'copia', 'diseno', 'barra', 'portada', 'perfil', 'tipo', 'platform', 'tematica', 'sector', 'negocio', 'google', 'family', 'idiomas', 'alergenos', 'alt', 'botonA'])

const CLAVES_FOTO = new Set(['src', 'foto', 'fotos', 'imagen', 'img', 'logo', 'poster', 'captura'])

export const esColor = v => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)

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
export const nombreElemento = (lista, i) => {
  const e = lista[i]
  const propio = e && typeof e === 'object' ? e.texto ?? e.nombre ?? e.titulo ?? e.platform ?? e.dias : null
  return typeof propio === 'string' && propio ? propio : `${i + 1}`
}

// Recorre los datos y devuelve cada dato editable: { ruta, clase: 'texto' | 'largo' | 'color' | 'foto', grupo, etiqueta }
export function camposDe(datos) {
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

export const leerRuta = (datos, ruta) => ruta.split('.').reduce((n, p) => n?.[p], datos)

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
// Para las pestañas de ajustes por grupo: los bloques en bruto de las pestañas de la miniweb de esos tipos (Inicio, Menú, Horario, Reservar...)
export const bloquesDePestana = tipos => (b, datos) => b.clave.startsWith('pestana-') && (tipos.includes(datos.hero?.pestanas?.[Number(b.clave.slice(8))]?.tipo) || (tipos.includes('inicio') && Number(b.clave.slice(8)) === 0))

// Cómo se escribe cada red en los campos de enlace
const NOMBRES_REDES = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', whatsapp: 'WhatsApp', youtube: 'YouTube', twitter: 'X (Twitter)', linkedin: 'LinkedIn', google: 'Google', telegram: 'Telegram' }

export function organizar(datos, campos) {
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

    let etiqueta = resto.length ? resto.filter(p => !esIndice(p)).map((p, k, todos) => (k === todos.length - 1 ? etiquetaDe(p, enPestana && todos.length === 1) : nombreDato(p))).join(' · ') : c.etiqueta
    // El enlace de una red lleva el nombre de la red (Instagram, TikTok...), no solo "Enlace"
    if (partes[0] === 'redes' && esIndice(partes[1]) && partes.at(-1) === 'href') {
      const red = datos.redes?.[Number(partes[1])]?.platform
      if (red) etiqueta = `Enlace de ${NOMBRES_REDES[red] ?? red}`
    }
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

// Los campos editables con su valor actual, como se los pasa el panel a la IA (las fotos sin su enlace)
// En los textos, max: los caracteres que caben en ese sitio (el largo del texto de la demo, con un pequeño margen),
// para que la IA escriba textos nuevos sin romper el diseño
// (en los cortos, el margen es más amplio: "Valóranos en Google" tiene que poder ser "Cuéntanos qué tal en Google")
export const maxDe = texto => Math.max(Math.ceil(texto.length * 1.25), texto.length + 12)

// El nombre de una pestaña del menú (hero.pestanas.N.texto) cabe en el menú: como mucho 10 caracteres ("Pedir cita")
export const MAX_PESTANA = 10

const esNombreDePestana = ruta => /^hero\.pestanas\.\d+\.texto$/.test(ruta)

// Los textos de la portada de Inicio (el grande, el pequeño y el extra) tienen un máximo fijo, el mismo que el del editor, sea cual sea el texto de partida:
// así el asistente puede llenarlos. El grande, en una línea, hasta 47; si tiene dos, 24 cada una
const MAX_TITULAR = 47

const MAX_DESCRIPCION = 120

export const maxCampo = (ruta, valor, datos) => {
  if (esNombreDePestana(ruta)) return MAX_PESTANA
  if (/^hero\.pestanas\.0\.titular\.\d+$/.test(ruta)) return (datos?.hero?.pestanas?.[0]?.titular?.length ?? 1) > 1 ? Math.floor(MAX_TITULAR / 2) : MAX_TITULAR
  if (ruta === 'hero.pestanas.0.descripcion') return MAX_DESCRIPCION
  return maxDe(valor)
}
