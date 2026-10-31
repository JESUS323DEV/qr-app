import { describe, expect, it } from 'vitest'
import siguienteEtiqueta from './siguienteEtiqueta'

describe('siguienteEtiqueta', () => {
  it('"Claudia 1" pasa a "Claudia 2"', () => {
    expect(siguienteEtiqueta('Claudia 1', [])).toBe('Claudia 2')
  })
  it('salta los números que ya existen', () => {
    expect(siguienteEtiqueta('Claudia 1', ['Claudia 2', 'Claudia 3'])).toBe('Claudia 4')
  })
  it('sin número al final, se queda igual', () => {
    expect(siguienteEtiqueta('Claudia', ['Claudia 2'])).toBe('Claudia')
  })
  it('respeta el guion de "Claudia-1"', () => {
    expect(siguienteEtiqueta('Claudia-1', [])).toBe('Claudia-2')
  })
})
