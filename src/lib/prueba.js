import { TIPOGRAFIAS } from '../asistente/tipografias'
import { CLAVES_COLORES_MINIWEB } from './coloresMiniweb'
import { CLAVES_CORTES } from './cortes'
import { CLAVES_FORMATOS } from './formatos'

/* Marca de prueba desde la dirección, solo para las demos (vista previa del "Nuevo perfil" de /admin):
   ?nombre=Ranita&principal=E91E63&acento=F4B63E&texto=2B1A1F&letra=calida
   cambia el nombre, el color principal, el de acento, el del texto y la tipografía (una de asistente/tipografias.js).
   &redes=F2EDE4: el fondo de la barra de redes de las miniwebs. &cabecera=3D5A40: el fondo de cabecera.
   &logo=<dirección>: el logo en lugar del nombre escrito.
   &redesen=lateral|boton, &menuen=abajo, &compartiren=abajo|redes: dónde van las redes, el menú y compartir en las miniwebs.
   &col=menuFondo-3E5A3B,titulo-FFFFFF,...: los colores uno por uno de la miniweb (hero.colores, claves de lib/coloresMiniweb.js).
   &corte=punta|onda|...: el corte del borde de abajo de la foto de Diagonal (claves de lib/cortes.js).
   &formato=tarjeta|marco|...: el formato de Editorial (claves de lib/formatos.js).
   &tg1=...&tp=...&ti=...: el texto grande, el pequeño y el extra (info) de la portada de Inicio de la miniweb.
   &tamano=xs|xl: el tamaño del nombre del negocio (sin él, md, el de cada diseño).
   &inicio=FFF7EA: el fondo del bloque de texto de la portada de Inicio de las miniwebs.
   &resena=F4EFF9: el fondo de la zona de debajo de la portada de las miniwebs (reseña y tarjetas, estas algo más oscuras).
   Nunca se usa en las páginas de clientes. */

const hex = valor => (/^[0-9a-f]{6}$/i.test(valor ?? '') ? `#${valor}` : null)
// &logo=...: el logo subido en el panel (solo si está guardado en nuestro Supabase, nunca una imagen de fuera)
const deSupabase = valor => {
  const base = import.meta.env.VITE_SUPABASE_URL
  return base && valor?.startsWith(`${base}/storage/v1/object/public/`) ? valor : null
}

export function marcaDePrueba(marca, params) {
  if (!marca) return marca
  const nombre = params.get('nombre')?.trim()
  const principal = hex(params.get('principal'))
  const acento = hex(params.get('acento'))
  const texto = hex(params.get('texto'))
  const fondo = hex(params.get('fondo'))
  const letra = TIPOGRAFIAS.find(t => t.id === params.get('letra'))
  // Fondo de la barra de redes de las miniwebs (hero.colorRedes)
  const redes = hex(params.get('redes'))
  // Fondo de cabecera (Polaroid, Banner y el menú de las miniwebs)
  const cabecera = hex(params.get('cabecera'))
  const logo = deSupabase(params.get('logo'))
  const resena = hex(params.get('resena'))
  const inicio = hex(params.get('inicio'))
  // Colores uno por uno de la miniweb: clave-RRGGBB separados por comas (solo las claves del catálogo)
  const coloresElegidos = Object.fromEntries(
    (params.get('col') ?? '')
      .split(',')
      .map(par => par.split('-'))
      .filter(([clave, valor]) => CLAVES_COLORES_MINIWEB.includes(clave) && hex(valor))
      .map(([clave, valor]) => [clave, `#${valor}`]),
  )
  // Corte de la foto de Diagonal (hero.corte)
  const corte = CLAVES_CORTES.includes(params.get('corte')) ? params.get('corte') : null
  // Formato de Editorial (hero.formato)
  const formato = CLAVES_FORMATOS.includes(params.get('formato')) ? params.get('formato') : null
  // Texto grande (titular, un solo texto) y texto pequeño (descripción) de la portada de Inicio: van en la primera pestaña
  const textos = {}
  if (params.has('tg1')) textos.titular = [(params.get('tg1') ?? '').trim().slice(0, 80)].filter(Boolean)
  if (params.has('tp')) textos.descripcion = (params.get('tp') ?? '').trim().slice(0, 300)
  if (params.has('ti')) textos.info = (params.get('ti') ?? '').trim().slice(0, 100)
  // Tamaño del nombre (hero.tamanoNombre)
  const tamanoNombre = ['xs', 'xl'].includes(params.get('tamano')) ? params.get('tamano') : null
  // Dónde van las redes, el menú y compartir (solo los valores que existen)
  const lugares = {
    ...(['lateral', 'boton'].includes(params.get('redesen')) ? { redesEn: params.get('redesen') } : {}),
    ...(params.get('menuen') === 'abajo' ? { menuEn: 'abajo' } : {}),
    ...(['abajo', 'redes'].includes(params.get('compartiren')) ? { compartirEn: params.get('compartiren') } : {}),
  }
  if (!nombre && !principal && !acento && !texto && !fondo && !letra && !redes && !cabecera && !logo && !resena && !inicio && !tamanoNombre && !corte && !formato && !Object.keys(textos).length && !Object.keys(coloresElegidos).length && !Object.keys(lugares).length) return marca
  return {
    ...marca,
    ...(nombre ? { nombre } : {}),
    ...(logo ? { logo } : {}),
    ...(resena ? { cuerpo: { ...marca.cuerpo, fondo: resena, card: `color-mix(in srgb, ${resena} 90%, black)` } } : {}),
    ...((redes || inicio || tamanoNombre || corte || formato || Object.keys(textos).length || Object.keys(coloresElegidos).length || Object.keys(lugares).length) && marca.hero ? { hero: { ...marca.hero, ...(Object.keys(coloresElegidos).length ? { colores: { ...marca.hero.colores, ...coloresElegidos } } : {}), ...(redes ? { colorRedes: redes } : {}), ...(inicio ? { fondoInicio: inicio } : {}), ...(tamanoNombre ? { tamanoNombre } : {}), ...(corte ? { corte } : {}), ...(formato ? { formato } : {}), ...(Object.keys(textos).length && marca.hero.pestanas ? { pestanas: marca.hero.pestanas.map((p, i) => (i === 0 ? { ...p, ...textos } : p)) } : {}), ...lugares } } : {}),
    theme: {
      ...marca.theme,
      colors: { ...marca.theme?.colors, ...(principal ? { primary: principal } : {}), ...(acento ? { accent: acento } : {}), ...(texto ? { text: texto } : {}), ...(fondo ? { bg: fondo } : {}), ...(cabecera ? { header: cabecera } : {}) },
      ...(letra ? { fonts: letra.fonts } : {}),
    },
  }
}
