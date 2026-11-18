import { beforeEach, describe, expect, it, vi } from 'vitest'

/* redactarPerfil con una carta: lo que se le enseña a la IA. La función del servidor solo le deja pedir fotos por plato en Polaroid y Galería, así que Revista e
   Inmersiva se le enseñan como Galería (lo que se guarda no cambia). La llamada al servidor va simulada. */

const llamadas = vi.hoisted(() => [])
vi.mock('../comun', () => ({
  llamar: async (funcion, cuerpo) => {
    llamadas.push({ funcion, ...cuerpo })
    return { resultado: { secciones: [], menu: { grupos: [] }, cambios: [], fotos: [], resumen: '' }, fotos: [] }
  },
  avisarElegida: () => {},
}))
vi.mock('../../lib/supabase', () => ({ supabase: null }))

import redactarPerfil from './redactarPerfil'
import { getCarta } from '../../cartas'

const datos = { cartaBase: getCarta('tumi'), cuento: 'cocina chifa', esCarta: true, infoImagen: '', producto: 'carta', referencia: null, tipoCarta: 'carta' }

beforeEach(() => {
  llamadas.length = 0
})

describe('redactarPerfil de una carta', () => {
  it.each(['revista', 'inmersiva', 'polaroid', 'galeria'])('con el estilo %s, la IA ve la carta como Galería para que pida foto de cada plato', async estilo => {
    await redactarPerfil(datos, 'tumi', { diseno: estilo }, 'Chifa', () => {}, { conColores: true })
    expect(llamadas.find(l => l.funcion === 'asistente').carta.diseno).toBe('galeria')
  })

  it('con Base, que no lleva foto por plato, la IA ve Base', async () => {
    await redactarPerfil(datos, 'tumi', { diseno: 'base' }, 'Chifa', () => {}, { conColores: true })
    expect(llamadas.find(l => l.funcion === 'asistente').carta.diseno).toBe('base')
  })
})
