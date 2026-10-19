import { TIPOGRAFIAS } from '../asistente/tipografias'

/* Marca de prueba desde la dirección, solo para las demos (vista previa del "Nuevo perfil" de /admin):
   ?nombre=Ranita&principal=E91E63&acento=F4B63E&texto=2B1A1F&letra=calida
   cambia el nombre, el color principal, el de acento, el del texto y la tipografía (una de asistente/tipografias.js).
   &redes=F2EDE4: el fondo de la barra de redes de las miniwebs. &cabecera=3D5A40: el fondo de cabecera.
   &logo=<dirección>: el logo en lugar del nombre escrito.
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
  if (!nombre && !principal && !acento && !texto && !fondo && !letra && !redes && !cabecera && !logo) return marca
  return {
    ...marca,
    ...(nombre ? { nombre } : {}),
    ...(logo ? { logo } : {}),
    ...(redes && marca.hero ? { hero: { ...marca.hero, colorRedes: redes } } : {}),
    theme: {
      ...marca.theme,
      colors: { ...marca.theme?.colors, ...(principal ? { primary: principal } : {}), ...(acento ? { accent: acento } : {}), ...(texto ? { text: texto } : {}), ...(fondo ? { bg: fondo } : {}), ...(cabecera ? { header: cabecera } : {}) },
      ...(letra ? { fonts: letra.fonts } : {}),
    },
  }
}
