import { beforeEach, describe, expect, it, vi } from 'vitest'

/* cambiosDeIA con una carta: las fotos por plato (también en Revista e Inmersiva) y los topes de grupos y platos. La búsqueda de fotos va simulada: se cuenta
   cuántas se piden y con qué forma, sin llamar a ningún servidor. */

const peticiones = vi.hoisted(() => [])
// modo de la búsqueda de fotos simulada: 'ok' da una foto, 'vacio' no encuentra nada y 'limite' falla como cuando se llega al tope de Unsplash
const buscador = vi.hoisted(() => ({ modo: 'ok' }))
vi.mock('./comun', () => ({
  llamar: async (funcion, datos) => {
    peticiones.push({ funcion, ...datos })
    if (buscador.modo === 'limite') throw new Error('Has llegado al límite de búsquedas de esta hora. Espera un poco.')
    if (buscador.modo === 'vacio') return { fotos: [] }
    return { fotos: [{ url: `https://fotos.test/${peticiones.length}.jpg` }] }
  },
  avisarElegida: () => {},
}))
vi.mock('../lib/supabase', () => ({ supabase: null }))

import { cambiosDeIA, textoFotosFallidas } from './ia'

const platos = (n, prefijo) => Array.from({ length: n }, (_, i) => ({ nombre: `${prefijo} ${i + 1}`, descripcion: 'Rico', precio: '9,50 €', alergenos: [], busquedaFoto: `${prefijo} ${i + 1} dish` }))
const secciones = (g, p) => Array.from({ length: g }, (_, i) => ({ nombre: `Grupo ${i + 1}`, busquedaFoto: `grupo ${i + 1}`, platos: platos(p, `Plato ${i + 1}`) }))
const carta = diseno => ({ diseno, secciones: [{ nombre: 'Antes', foto: '', platos: [{ nombre: 'Viejo', foto: '' }] }] })

beforeEach(() => {
  peticiones.length = 0
  buscador.modo = 'ok'
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

describe('fotos que no se han podido poner', () => {
  it('si todo va bien no avisa de nada', async () => {
    const aviso = vi.fn()
    await cambiosDeIA({ secciones: secciones(2, 3), cambios: [], fotos: [] }, [], carta('galeria'), { alFallarFotos: aviso })
    expect(aviso).not.toHaveBeenCalled()
  })

  it('si se llega al límite de búsquedas, avisa de cuántas fotos faltan y del motivo, y la carta sale igual sin fotos', async () => {
    buscador.modo = 'limite'
    const aviso = vi.fn()
    const r = await cambiosDeIA({ secciones: secciones(2, 3), cambios: [], fotos: [] }, [], carta('galeria'), { alFallarFotos: aviso })
    expect(aviso).toHaveBeenCalledWith({ cantidad: 6, motivo: 'Has llegado al límite de búsquedas de esta hora. Espera un poco.' })
    expect(r.secciones).toHaveLength(2)
    expect(r.secciones.flatMap(s => s.platos).some(p => p.foto)).toBe(false)
  })

  it('si la búsqueda va bien pero no encuentra nada, lo dice con ese motivo', async () => {
    buscador.modo = 'vacio'
    const aviso = vi.fn()
    await cambiosDeIA({ secciones: secciones(1, 2), cambios: [], fotos: [] }, [], carta('polaroid'), { alFallarFotos: aviso })
    expect(aviso).toHaveBeenCalledWith({ cantidad: 2, motivo: 'sin resultados' })
  })

  it('si la IA no pide foto para los platos de un estilo con foto por plato, avisa de que no la ha pedido', async () => {
    const aviso = vi.fn()
    const sinBusquedas = [{ nombre: 'Entrantes', busquedaFoto: '', platos: [{ nombre: 'A', descripcion: '', precio: '1 €', alergenos: [], busquedaFoto: '' }, { nombre: 'B', descripcion: '', precio: '2 €', alergenos: [], busquedaFoto: '' }] }]
    await cambiosDeIA({ secciones: sinBusquedas, cambios: [], fotos: [] }, [], carta('revista'), { alFallarFotos: aviso })
    expect(aviso).toHaveBeenCalledWith({ cantidad: 2, motivo: 'sin búsqueda' })
    expect(peticiones).toHaveLength(0)
  })

  it('un error real del servidor se prefiere como motivo a "no ha pedido foto"', async () => {
    buscador.modo = 'limite'
    const aviso = vi.fn()
    const mezcla = [{ nombre: 'Entrantes', busquedaFoto: '', platos: [{ nombre: 'A', descripcion: '', precio: '1 €', alergenos: [], busquedaFoto: '' }, { nombre: 'B', descripcion: '', precio: '2 €', alergenos: [], busquedaFoto: 'b dish' }] }]
    await cambiosDeIA({ secciones: mezcla, cambios: [], fotos: [] }, [], carta('galeria'), { alFallarFotos: aviso })
    expect(aviso).toHaveBeenCalledWith({ cantidad: 2, motivo: 'Has llegado al límite de búsquedas de esta hora. Espera un poco.' })
  })

  it('el texto del aviso dice cuántas y por qué, sin guion largo', () => {
    expect(textoFotosFallidas({ cantidad: 4, motivo: 'sin búsqueda' })).toBe('El asistente ha terminado, pero no ha podido poner 4 fotos. No ha pedido foto para esos platos.')
    expect(textoFotosFallidas({ cantidad: 12, motivo: 'Has llegado al límite de búsquedas de esta hora. Espera un poco.' })).toBe(
      'El asistente ha terminado, pero no ha podido poner 12 fotos. Has llegado al límite de búsquedas de esta hora. Espera un poco.',
    )
    expect(textoFotosFallidas({ cantidad: 1, motivo: 'sin resultados' })).toBe('El asistente ha terminado, pero no ha podido poner 1 foto. La búsqueda no encontró nada.')
    expect(textoFotosFallidas({ cantidad: 3, motivo: 'x' })).not.toContain('—')
  })
})
