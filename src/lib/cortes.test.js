import { describe, expect, it } from 'vitest'
import { CORTES, clipDeCorte, clipDeCorteInvertido } from './cortes'

describe('clipDeCorteInvertido', () => {
  it('el Diagonal pasa a ser el borde de arriba: la y se voltea', () => {
    expect(clipDeCorte('diagonal')).toBe('polygon(0 0, 100% 0, 100% 100%, 0 86%)')
    expect(clipDeCorteInvertido('diagonal')).toBe('polygon(0 100.0%, 100% 100.0%, 100% 0.0%, 0 14.0%)')
  })

  it('todos los cortes se pueden voltear y siguen siendo un polígono con los mismos puntos', () => {
    for (const { clave } of CORTES) {
      const normal = clipDeCorte(clave)
      const volteado = clipDeCorteInvertido(clave)
      expect(volteado.startsWith('polygon(')).toBe(true)
      expect(volteado.endsWith(')')).toBe(true)
      expect(volteado.split(', ').length).toBe(normal.split(', ').length)
    }
  })

  it('voltear dos veces deja el corte como estaba (con los mismos números)', () => {
    const dosVeces = clave =>
      clipDeCorteInvertido(clave)
        .slice('polygon('.length, -1)
        .split(', ')
        .map(par => {
          const [x, y] = par.split(' ')
          return `${x} ${(100 - parseFloat(y)).toFixed(1)}`
        })
    const original = clave => clipDeCorte(clave).slice('polygon('.length, -1).split(', ').map(par => {
      const [x, y] = par.split(' ')
      return `${x} ${parseFloat(y).toFixed(1)}`
    })
    expect(dosVeces('onda')).toEqual(original('onda'))
  })
})
