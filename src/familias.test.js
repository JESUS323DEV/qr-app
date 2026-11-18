import { describe, expect, it } from 'vitest'
import { ESTILOS_CARTA_CON_FOTO_POR_PLATO, FAMILIAS } from './familias'

describe('estilos de carta con foto por plato', () => {
  const cartas = Object.values(FAMILIAS).filter(f => f.carta).map(f => f.carta)

  it('son estilos de carta que existen', () => {
    for (const e of ESTILOS_CARTA_CON_FOTO_POR_PLATO) expect(cartas).toContain(e)
  })

  it('son Polaroid, Galería, Revista e Inmersiva, y Base queda fuera', () => {
    expect([...ESTILOS_CARTA_CON_FOTO_POR_PLATO].sort()).toEqual(['galeria', 'inmersiva', 'polaroid', 'revista'])
    expect(ESTILOS_CARTA_CON_FOTO_POR_PLATO).not.toContain('base')
  })
})
