import { beforeEach, describe, expect, it, vi } from 'vitest'

/* cambiosDeIA con una carta: las fotos por plato (también en Revista e Inmersiva) y los topes de grupos y platos. La búsqueda de fotos va simulada: se cuenta
   cuántas se piden y con qué forma, sin llamar a ningún servidor. */

const peticiones = vi.hoisted(() => [])
vi.mock('./comun', () => ({
  llamar: async (funcion, datos) => {
    peticiones.push({ funcion, ...datos })
    return { fotos: [{ url: `https://fotos.test/${peticiones.length}.jpg` }] }
  },
  avisarElegida: () => {},
}))
vi.mock('../lib/supabase', () => ({ supabase: null }))

import { cambiosDeIA } from './ia'

const platos = (n, prefijo) => Array.from({ length: n }, (_, i) => ({ nombre: `${prefijo} ${i + 1}`, descripcion: 'Rico', precio: '9,50 €', alergenos: [], busquedaFoto: `${prefijo} ${i + 1} dish` }))
const secciones = (g, p) => Array.from({ length: g }, (_, i) => ({ nombre: `Grupo ${i + 1}`, busquedaFoto: `grupo ${i + 1}`, platos: platos(p, `Plato ${i + 1}`) }))
const carta = diseno => ({ diseno, secciones: [{ nombre: 'Antes', foto: '', platos: [{ nombre: 'Viejo', foto: '' }] }] })

beforeEach(() => {
  peticiones.length = 0
})

describe('cambiosDeIA de una carta', () => {
  it.each(['polaroid', 'galeria', 'revista', 'inmersiva'])('en %s busca una foto cuadrada por plato y la pone en cada uno', async diseno => {
    const r = await cambiosDeIA({ secciones: secciones(2, 3), cambios: [], fotos: [] }, [], carta(diseno))
    const buscadas = peticiones.filter(p => p.funcion === 'buscar-fotos')
    expect(buscadas).toHaveLength(6)
    expect(buscadas.every(p => p.orientacion === 'square')).toBe(true)
    expect(r.secciones).toHaveLength(2)
    expect(r.secciones.flatMap(s => s.platos).every(p => p.foto?.startsWith('https://fotos.test/'))).toBe(true)
  })

  it('en un estilo sin foto por plato (base) busca una foto vertical por sección y no por plato', async () => {
    const r = await cambiosDeIA({ secciones: secciones(2, 3), cambios: [], fotos: [] }, [], carta('base'))
    const buscadas = peticiones.filter(p => p.funcion === 'buscar-fotos')
    expect(buscadas).toHaveLength(2)
    expect(buscadas.every(p => p.orientacion === 'portrait')).toBe(true)
    expect(r.secciones.flatMap(s => s.platos).some(p => p.foto)).toBe(false)
  })

  it('sin topes, hasta 10 grupos de 20 platos', async () => {
    const r = await cambiosDeIA({ secciones: secciones(12, 22), cambios: [], fotos: [] }, [], carta('base'))
    expect(r.secciones).toHaveLength(10)
    expect(r.secciones.every(s => s.platos.length === 20)).toBe(true)
  })

  it('con topes de 5 y 5 recorta lo que pase y no busca las fotos de lo recortado', async () => {
    const r = await cambiosDeIA({ secciones: secciones(7, 8), cambios: [], fotos: [] }, [], carta('galeria'), { maxSecciones: 5, maxPlatos: 5 })
    expect(r.secciones).toHaveLength(5)
    expect(r.secciones.every(s => s.platos.length === 5)).toBe(true)
    expect(peticiones.filter(p => p.funcion === 'buscar-fotos')).toHaveLength(25)
  })

  it('ningún guion largo llega a los nombres ni a las descripciones', async () => {
    const s = [{ nombre: 'Tapas — del día', busquedaFoto: '', platos: [{ nombre: 'Pulpo — gallego', descripcion: 'Rico — de verdad', precio: '12 €', alergenos: [], busquedaFoto: '' }] }]
    const r = await cambiosDeIA({ secciones: s, cambios: [], fotos: [] }, [], carta('base'))
    expect(JSON.stringify(r)).not.toContain('—')
  })
})
