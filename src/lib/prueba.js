import { TIPOGRAFIAS } from '../asistente/tipografias'

/* Marca de prueba desde la dirección, solo para las demos (vista previa del "Nuevo perfil" de /admin):
   ?nombre=Ranita&principal=E91E63&acento=F4B63E&texto=2B1A1F&letra=calida
   cambia el nombre, el color principal, el de acento, el del texto y la tipografía (una de asistente/tipografias.js).
   Nunca se usa en las páginas de clientes. */

const hex = valor => (/^[0-9a-f]{6}$/i.test(valor ?? '') ? `#${valor}` : null)

export function marcaDePrueba(marca, params) {
  if (!marca) return marca
  const nombre = params.get('nombre')?.trim()
  const principal = hex(params.get('principal'))
  const acento = hex(params.get('acento'))
  const texto = hex(params.get('texto'))
  const fondo = hex(params.get('fondo'))
  const letra = TIPOGRAFIAS.find(t => t.id === params.get('letra'))
  if (!nombre && !principal && !acento && !texto && !fondo && !letra) return marca
  return {
    ...marca,
    ...(nombre ? { nombre } : {}),
    theme: {
      ...marca.theme,
      colors: { ...marca.theme?.colors, ...(principal ? { primary: principal } : {}), ...(acento ? { accent: acento } : {}), ...(texto ? { text: texto } : {}), ...(fondo ? { bg: fondo } : {}) },
      ...(letra ? { fonts: letra.fonts } : {}),
    },
  }
}
