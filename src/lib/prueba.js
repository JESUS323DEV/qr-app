import { derivadosDeFondoYTexto } from './mezclarColores'
import { TODAS_LAS_TIPOGRAFIAS } from '../asistente/tipografias'
import { CLAVES_COLORES_MINIWEB } from './coloresMiniweb'
import { CLAVES_CORTES } from './cortes'
import { CLAVES_FORMATOS } from './formatos'
import { CLAVES_DISPOSICIONES } from './disposiciones'
import { CLAVES_COMPOSICIONES } from './composiciones'
import { CLAVES_DISTRIBUCIONES } from './distribuciones'
import { CLAVES_GALERIAS } from './galerias'
import { CLAVES_MONTAJES } from './montajes'
import { cartas } from '../cartas'
import { CLAVES_HORARIOS, CLAVES_VARIANTES_HORARIO } from './horarios'

/* Marca de prueba desde la dirección, solo para las demos (vista previa del "Nuevo perfil" de /admin):
   ?nombre=Ranita&principal=E91E63&acento=F4B63E&texto=2B1A1F&letra=calida
   cambia el nombre, el color principal, el de acento, el del texto y la tipografía (una de asistente/tipografias.js).
   &redes=F2EDE4: el fondo de la barra de redes de las miniwebs. &cabecera=3D5A40: el fondo de cabecera.
   &logo=<dirección>: el logo en lugar del nombre escrito.
   &redesen=lateral|medio|abajo, &menuen=abajo, &compartiren=abajo|redes: dónde van las redes, el menú y compartir en las miniwebs.
   &col=menuFondo-3E5A3B,titulo-FFFFFF,...: los colores uno por uno de la miniweb (hero.colores, claves de lib/coloresMiniweb.js).
   &corte=punta|onda|...: el corte del borde de abajo de la foto de Diagonal (claves de lib/cortes.js).
   &disposicion=centrada|tarjeta|...: la disposición del texto de Fullbleed (claves de lib/disposiciones.js).
   &composicion=arriba|abajo|panel: la composición de Mosaico (claves de lib/composiciones.js).
   &distribucion=destacada|arriba: la distribución de las fotos de Retrato (claves de lib/distribuciones.js).
   &pase=marco|sobre|carrusel: el estilo de Galería (claves de lib/galerias.js).
   &montaje=rectas|monton|arriba: el montaje de Polaroid (claves de lib/montajes.js).
   &carta=almendra|tumi|...: la carta (de src/cartas) que pinta el menú de la miniweb (hero.carta).
   &horario=puntos|tarjetas|...: el diseño del horario de la miniweb (claves de lib/horarios.js).
   &horariovar=puntos|banda|...: la variante del diseño del horario (hero.horarioVariante, claves de lib/horarios.js).
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
  // Las predefinidas y las de más (mas-bebas...): el Editor ofrece las dos listas
  const letra = TODAS_LAS_TIPOGRAFIAS.find(t => t.id === params.get('letra'))
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
  // Disposición del texto de Fullbleed (hero.disposicion)
  const disposicion = CLAVES_DISPOSICIONES.includes(params.get('disposicion')) ? params.get('disposicion') : null
  // Composición de Mosaico (hero.composicion)
  const composicion = CLAVES_COMPOSICIONES.includes(params.get('composicion')) ? params.get('composicion') : null
  // Distribución de las fotos de Retrato (hero.distribucion)
  const distribucion = CLAVES_DISTRIBUCIONES.includes(params.get('distribucion')) ? params.get('distribucion') : null
  // Estilo de Galería (hero.pase)
  const pase = CLAVES_GALERIAS.includes(params.get('pase')) ? params.get('pase') : null
  // Montaje de Polaroid (hero.montaje)
  const montaje = CLAVES_MONTAJES.includes(params.get('montaje')) ? params.get('montaje') : null
  // La intensidad del filtro que oscurece la foto de la portada (hero.filtro, de 0 a 100)
  const filtroPedido = params.get('filtro')
  const filtro = filtroPedido !== null && /^\d{1,3}$/.test(filtroPedido) && Number(filtroPedido) <= 100 ? Number(filtroPedido) : null
  // La variante del diseño del horario (hero.horarioVariante)
  const horarioVar = CLAVES_VARIANTES_HORARIO.includes(params.get('horariovar')) ? params.get('horariovar') : null
  // El diseño del horario (hero.horario)
  const horario = CLAVES_HORARIOS.includes(params.get('horario')) ? params.get('horario') : null
  // La carta que pinta el menú de la miniweb (hero.carta)
  const carta = cartas.some(c => c.slug === params.get('carta')) ? params.get('carta') : null
  // Formato de Editorial (hero.formato)
  const formato = CLAVES_FORMATOS.includes(params.get('formato')) ? params.get('formato') : null
  // Texto grande (titular, un solo texto) y texto pequeño (descripción) de la portada de Inicio: van en la primera pestaña
  const textos = {}
  if (params.has('tg1')) textos.titular = [(params.get('tg1') ?? '').trim().slice(0, 80)].filter(Boolean)
  if (params.has('tp')) textos.descripcion = (params.get('tp') ?? '').trim().slice(0, 300)
  if (params.has('ti')) textos.info = (params.get('ti') ?? '').trim().slice(0, 100)
  // Tamaño del nombre (hero.tamanoNombre)
  const tamanoNombre = ['xxs', 'xs', 'xl'].includes(params.get('tamano')) ? params.get('tamano') : null
  // Dónde van las redes, el menú y compartir (solo los valores que existen)
  const lugares = {
    ...(['lateral', 'medio', 'abajo'].includes(params.get('redesen')) ? { redesEn: params.get('redesen') } : {}),
    ...(params.get('menuen') === 'abajo' ? { menuEn: 'abajo' } : {}),
    ...(params.get('redesvinculadas') === 'true' ? { redesVinculadas: true } : {}),
    ...(['abajo', 'redes'].includes(params.get('compartiren')) ? { compartirEn: params.get('compartiren') } : {}),
    ...(['boton', 'reserva', 'cita', 'formulario'].includes(params.get('contactoen')) ? { contactoEn: params.get('contactoen') } : {}),
  }
  const lema = params.has('lema') ? (params.get('lema') ?? '').slice(0, 40) : null
  if (lema === null && !nombre && !principal && !acento && !texto && !fondo && !letra && !redes && !cabecera && !logo && !resena && !inicio && !tamanoNombre && !corte && !formato && !disposicion && !composicion && !distribucion && !pase && !montaje && !carta && !horario && !horarioVar && filtro === null && !Object.keys(textos).length && !Object.keys(coloresElegidos).length && !Object.keys(lugares).length) return marca
  return {
    ...marca,
    ...(nombre ? { nombre } : {}),
    ...(lema !== null ? { lema } : {}),
    ...(logo ? { logo } : {}),
    ...(resena ? { cuerpo: { ...marca.cuerpo, fondo: resena, card: `color-mix(in srgb, ${resena} 90%, black)` } } : {}),
    ...((redes || inicio || tamanoNombre || corte || formato || disposicion || composicion || distribucion || pase || montaje || carta || horario || horarioVar || filtro !== null || Object.keys(textos).length || Object.keys(coloresElegidos).length || Object.keys(lugares).length) && marca.hero ? { hero: { ...marca.hero, ...(Object.keys(coloresElegidos).length ? { colores: { ...marca.hero.colores, ...coloresElegidos } } : {}), ...(redes ? { colorRedes: redes } : {}), ...(inicio ? { fondoInicio: inicio } : {}), ...(tamanoNombre ? { tamanoNombre } : {}), ...(corte ? { corte } : {}), ...(formato ? { formato } : {}), ...(disposicion ? { disposicion } : {}), ...(composicion ? { composicion } : {}), ...(distribucion ? { distribucion } : {}), ...(pase ? { pase } : {}), ...(montaje ? { montaje } : {}), ...(carta ? { carta } : {}), ...(horario ? { horario } : {}), ...(horarioVar ? { horarioVariante: horarioVar } : {}), ...(filtro !== null ? { filtro } : {}), ...(Object.keys(textos).length && marca.hero.pestanas ? { pestanas: marca.hero.pestanas.map((p, i) => (i === 0 ? { ...p, ...textos } : p)) } : {}), ...lugares } } : {}),
    theme: {
      ...marca.theme,
      colors: { ...marca.theme?.colors, ...(params.get('derivar') === '1' && (fondo || texto) ? derivadosDeFondoYTexto(fondo ?? marca.theme?.colors?.bg, texto ?? marca.theme?.colors?.text) : {}), ...(hex(params.get('precio')) ? { precio: hex(params.get('precio')) } : {}), ...(hex(params.get('ptxt')) ? { precioTexto: hex(params.get('ptxt')) } : {}), ...(principal ? { primary: principal } : {}), ...(acento ? { accent: acento } : {}), ...(texto ? { text: texto } : {}), ...(fondo ? { bg: fondo } : {}), ...(cabecera ? { header: cabecera } : {}) },
      ...(letra ? { fonts: letra.fonts } : {}),
    },
  }
}
