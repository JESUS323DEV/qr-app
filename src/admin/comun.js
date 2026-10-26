import { supabase } from '../lib/supabase'
import { aplicar } from '../lib/ediciones'
import { getNegocio, negocios, rutaNegocio } from '../negocios'
import { cartas, getCarta, marcaDe, rutaCarta } from '../cartas'

/* Lo que comparten varias partes del panel de administración: direcciones reservadas, nombre a dirección, llamada a las funciones de Supabase y las páginas con QR. */

// Direcciones que no puede usar una copia: las de las páginas de la web
export const RESERVADAS = new Set(['demo', 'tematicas', 'gestion', 'catalogo', 'planes', 'panel', 'mi-carta', 'admin', 'miniweb', 'disenos', 'aviso-legal', 'privacidad', 'mi-qr', 'crear-qr', 'generador-qr'])

// "Peluquería Ranita" → "peluqueria-ranita"
export const aSlug = texto =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Llama a una función de Supabase y, si falla, lanza su mensaje de error (o uno genérico)
export async function llamar(funcion, cuerpo) {
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

/* Las páginas que pueden tener QR (copias, fichas y miniwebs, cartas), con su dirección y su marca (colores, fuentes,
   sector). sesion: el slug de su editor de QR para clientes (en las cartas, slug-carta, para no chocar con su ficha) */
export const paginasConQR = copias =>
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
    ...cartas.map(c => ({ clave: `carta:${c.slug}`, slug: c.slug, grupo: 'Menú y ofertas', nombre: marcaDe(c)?.nombre ?? c.slug, ruta: rutaCarta(c), tipo: 'carta', datos: c })),
  ].map(p => {
    const marca = p.tipo === 'carta' ? marcaDe(p.datos) : p.datos
    return { ...p, marca, colores: marca?.theme?.colors, fuentes: marca?.theme?.fonts, sesion: p.tipo === 'carta' ? `${p.slug}-carta` : p.slug }
  })

// Reduce la foto en el propio móvil antes de subirla (lado largo de 1600 px, JPEG): sube rápido y pesa poco
export const reducirFoto = archivo =>
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

/* ---------- Campos del editor ---------- */

// Las normas de Unsplash piden avisarles cuando se elige una foto; si falla, no pasa nada
export const avisarElegida = foto => {
  if (foto?.descarga) llamar('buscar-fotos', { accion: 'elegida', descarga: foto.descarga }).catch(() => {})
}

/* Logo del negocio: se sube tal cual (sin pasarlo a JPG, para que no pierda el fondo transparente), a la carpeta logos
   del almacén de fotos. PNG, SVG, WebP o JPG, de 1 MB como mucho */
export const TIPOS_LOGO = { 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/jpeg': 'jpg' }

// El nombre interno de una copia (el que solo ves tú), si lo tiene
export const nombreInterno = f => f.cambios?._nuevoPerfil?.etiqueta?.trim() || null
