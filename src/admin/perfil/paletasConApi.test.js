import { describe, expect, it } from 'vitest'
import { armarPaleta, armarPaletaDeModo, elegirAcento, fondoYTexto } from './paletasConApi'
import { contraste, hexAHsl, hslAHex } from '../../lib/colorMath'

describe('textos serios (título y normal)', () => {
  it('se leen: el de título con contraste 10 o más y el normal con 7 o más, en claro y en oscuro, para cualquier tono', () => {
    for (let h = 0; h < 360; h += 20) {
      const principal = hslAHex(h, 70, 40)
      for (const oscuro of [false, true]) {
        const { fondo, texto, titulo } = fondoYTexto(principal, oscuro)
        expect(contraste(fondo, titulo)).toBeGreaterThanOrEqual(10)
        expect(contraste(fondo, texto)).toBeGreaterThanOrEqual(7)
      }
    }
  })

  it('son serios: casi grises (saturación de 22 como mucho), nada chillón ni brillante', () => {
    for (let h = 0; h < 360; h += 20) {
      for (const oscuro of [false, true]) {
        const { texto, titulo } = fondoYTexto(hslAHex(h, 85, 45), oscuro)
        for (const c of [texto, titulo]) {
          if (c !== '#FFFFFF' && c !== '#000000') expect(hexAHsl(c)[1]).toBeLessThanOrEqual(23)
        }
      }
    }
  })

  it('nunca son del tono del principal (el de las barras): su tono es el opuesto', () => {
    for (const principal of ['#C1BA2D', '#4A992D', '#307B2D', '#1C2778', '#B04A8E']) {
      for (const oscuro of [false, true]) {
        const { texto, titulo } = fondoYTexto(principal, oscuro)
        for (const c of [texto, titulo]) {
          if (c === '#FFFFFF' || c === '#000000') continue
          const d = Math.abs(hexAHsl(c)[0] - hexAHsl(principal)[0])
          expect(Math.min(d, 360 - d)).toBeGreaterThan(120)
        }
      }
    }
  })

  it('el título es más fuerte que el texto normal (más contraste con el fondo)', () => {
    const { fondo, texto, titulo } = fondoYTexto('#307B2D', false)
    expect(contraste(fondo, titulo)).toBeGreaterThanOrEqual(contraste(fondo, texto))
  })
})


describe('fondoYTexto', () => {
  it('el texto se lee (contraste 7 o más) sobre el fondo, claro u oscuro, para cualquier tono', () => {
    for (let h = 0; h < 360; h += 20) {
      const principal = hslAHex(h, 60, 40)
      for (const oscuro of [false, true]) {
        const { fondo, texto } = fondoYTexto(principal, oscuro)
        expect(contraste(fondo, texto)).toBeGreaterThanOrEqual(7)
      }
    }
  })

  it('el claro tiene el fondo claro y el oscuro, oscuro', () => {
    expect(hexAHsl(fondoYTexto('#307BA9', false).fondo)[2]).toBeGreaterThan(90)
    expect(hexAHsl(fondoYTexto('#307BA9', true).fondo)[2]).toBeLessThan(15)
  })
})

describe('elegirAcento y armarPaleta', () => {
  it('elige el acento más distinto al principal entre los que se ven sobre el fondo', () => {
    const principal = '#307BA9'
    const { fondo } = fondoYTexto(principal, false)
    const acento = elegirAcento(principal, ['#2F739C', '#792D5D', '#62842E', 'mal'], fondo)
    expect(['#792D5D', '#62842E']).toContain(acento)
    expect(contraste(acento, fondo)).toBeGreaterThanOrEqual(3)
  })

  it('sin candidatos válidos, el acento es el principal; la paleta trae los cuatro colores', () => {
    expect(armarPaleta('#307BA9', ['mal']).acento).toBe('#307BA9')
    const p = armarPaleta('#307BA9', ['#792D5D'])
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto', 'titulo'])
  })
})


describe('cada opción con su principal (armarPaletaDeModo)', () => {
  // Lo que respondió TheColorAPI para un rosa de partida (#C13584), uno por modo
  const semilla = '#C13584'
  const respuestas = {
    complement: ['#35A164', '#35AE6A', '#BB3580', '#C83588', '#CF3A8E'],
    triad: ['#74A135', '#3577AE', '#BB3580', '#C83588', '#CF3A8E'],
    analogic: ['#B4357D', '#B93558', '#BE3A35', '#C46535', '#C99335'],
    monochrome: ['#5B1B3F', '#84265B', '#AC3076', '#CC4391', '#D86AA8'],
  }
  const paletas = Object.fromEntries(Object.entries(respuestas).map(([modo, colores]) => [modo, armarPaletaDeModo(semilla, modo, colores)]))

  it('las cuatro opciones tienen un principal distinto entre sí y distinto de la semilla', () => {
    const principales = Object.values(paletas).map(p => p.principal)
    expect(new Set(principales).size).toBe(4)
    for (const p of principales) expect(p).not.toBe(semilla.toUpperCase())
  })

  it('complementaria y tríada se alejan de verdad en tono; vecinos se queda cerca; mismo tono conserva el tono con otra luz', () => {
    const dist = c => {
      const d = Math.abs(hexAHsl(c)[0] - hexAHsl(semilla)[0])
      return Math.min(d, 360 - d)
    }
    expect(dist(paletas.complement.principal)).toBeGreaterThan(100)
    expect(dist(paletas.triad.principal)).toBeGreaterThan(100)
    expect(dist(paletas.analogic.principal)).toBeLessThan(80)
    expect(dist(paletas.analogic.principal)).toBeGreaterThanOrEqual(20)
    expect(dist(paletas.monochrome.principal)).toBeLessThanOrEqual(15)
    expect(Math.abs(hexAHsl(paletas.monochrome.principal)[2] - hexAHsl(semilla)[2])).toBeGreaterThan(8)
  })

  it('el fondo y el texto salen del tono de cada principal, así que cambian entre opciones, y el texto se lee', () => {
    const fondos = Object.values(paletas).map(p => p.fondo)
    expect(new Set(fondos).size).toBeGreaterThan(2)
    for (const p of Object.values(paletas)) expect(contraste(p.fondo, p.texto)).toBeGreaterThanOrEqual(7)
  })

  it('de acento conserva el color de partida cuando se ve sobre el fondo', () => {
    for (const p of Object.values(paletas)) {
      expect(contraste(p.acento, p.fondo)).toBeGreaterThanOrEqual(3)
    }
    expect(paletas.complement.acento).toBe(semilla.toUpperCase())
  })

  it('sin candidatos usables, el principal es la semilla y la paleta sigue completa', () => {
    const p = armarPaletaDeModo(semilla, 'triad', ['mal', '#FFFFFF', '#000000'])
    expect(p.principal).toBe(semilla.toUpperCase())
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto', 'titulo'])
  })
})


describe('con un principal apagado, que dejaba sin candidatos y repetía la semilla', () => {
  // Lo que respondió TheColorAPI para un verde apagado (#376149): sus relacionados tienen la saturación por debajo de 25
  const semilla = '#376149'
  const c = (h, s, l) => hslAHex(h, s, l)
  const respuestas = {
    complement: [c(325, 22, 24), c(325, 23, 26), c(145, 26, 29), c(146, 29, 31), c(146, 31, 34)],
    triad: [c(265, 22, 24), c(27, 23, 26), c(145, 26, 29), c(146, 29, 31), c(146, 31, 34)],
    analogic: [c(146, 25, 27), c(164, 26, 28), c(181, 28, 29), c(200, 28, 30), c(218, 29, 31)],
    monochrome: [c(150, 25, 5), c(144, 26, 15), c(146, 27, 25), c(145, 28, 35), c(145, 29, 45)],
  }

  it('las cuatro opciones tienen un principal distinto, sin volver a la semilla', () => {
    const principales = Object.entries(respuestas).map(([modo, colores]) => armarPaletaDeModo(semilla, modo, colores).principal)
    expect(new Set(principales).size).toBe(4)
    expect(principales).not.toContain(semilla.toUpperCase())
  })
})
