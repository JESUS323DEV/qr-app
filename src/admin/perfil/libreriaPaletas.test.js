import { describe, expect, it } from 'vitest'
import { FAMILIAS, LIBRERIA, armarDeLibreria, crearTanda } from './libreriaPaletas'
import { contraste, esHex6 } from '../../lib/colorMath'

// Un azar con semilla (para que las pruebas den siempre lo mismo)
const azarCon = semilla => {
  let s = semilla
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('la librería', () => {
  it('cada paleta trae su nombre, una familia conocida y cuatro colores completos', () => {
    for (const p of LIBRERIA) {
      expect(p.nombre.length).toBeGreaterThan(0)
      expect(FAMILIAS).toContain(p.familia)
      for (const c of [p.principal, p.acento, p.claro, p.oscuro]) expect(esHex6(c)).toBe(true)
    }
  })

  it('no hay dos paletas con el mismo nombre', () => {
    const nombres = LIBRERIA.map(p => p.nombre)
    expect(new Set(nombres).size).toBe(nombres.length)
  })

  it('están repartidas: todas las familias tienen paletas y ninguna pasa de un cuarto del total', () => {
    for (const f of FAMILIAS) {
      const n = LIBRERIA.filter(p => p.familia === f).length
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(LIBRERIA.length / 4)
    }
  })

  it('cada paleta, en claro y en oscuro, tiene colores completos que se leen', () => {
    for (const p of LIBRERIA) {
      for (const oscuro of [false, true]) {
        const r = armarDeLibreria(p, oscuro)
        for (const c of Object.values(r)) expect(esHex6(c)).toBe(true)
        expect(contraste(r.principal, r.fondo)).toBeGreaterThanOrEqual(3)
        expect(contraste(r.acento, r.fondo)).toBeGreaterThanOrEqual(3)
        expect(contraste(r.texto, r.fondo)).toBeGreaterThanOrEqual(7)
        expect(contraste(r.titulo, r.fondo)).toBeGreaterThanOrEqual(10)
      }
    }
  })

  it('el fondo claro es claro y el oscuro, oscuro, y el principal y el acento no son iguales', () => {
    for (const p of LIBRERIA) {
      expect(contraste(armarDeLibreria(p, false).fondo, '#FFFFFF')).toBeLessThan(1.5)
      expect(contraste(armarDeLibreria(p, true).fondo, '#000000')).toBeLessThan(1.8)
      expect(p.principal.toUpperCase()).not.toBe(p.acento.toUpperCase())
    }
  })
})

describe('una tanda (crearTanda)', () => {
  it('trae cuatro paletas de cuatro familias distintas', () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const { paletas } = crearTanda(4, { azar: azarCon(semilla) })
      expect(paletas).toHaveLength(4)
      expect(new Set(paletas.map(p => p.familia)).size).toBe(4)
    }
  })

  it('la tanda siguiente no repite ninguna paleta ni ninguna familia de la anterior', () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const azar = azarCon(semilla)
      const una = crearTanda(4, { azar })
      const otra = crearTanda(4, { vistos: una.vistos, ultimas: una.ultimas, azar })
      for (const p of otra.paletas) {
        expect(una.paletas).not.toContain(p)
        expect(una.ultimas).not.toContain(p.familia)
      }
    }
  })

  it('no repite una paleta hasta haberlas visto todas', () => {
    const azar = azarCon(77)
    let memoria = { vistos: [], ultimas: [] }
    const vistas = []
    // Mientras queden paletas de al menos 4 familias sin ver, ninguna se repite
    for (let i = 0; i < 6; i++) {
      const t = crearTanda(4, { ...memoria, azar })
      for (const p of t.paletas) {
        expect(vistas).not.toContain(p)
        vistas.push(p)
      }
      memoria = { vistos: t.vistos, ultimas: t.ultimas }
    }
  })

  it('cuando se acaban, empieza de cero y sigue dando paletas', () => {
    const azar = azarCon(5)
    let memoria = { vistos: [], ultimas: [] }
    for (let i = 0; i < 40; i++) {
      const t = crearTanda(4, { ...memoria, azar })
      expect(t.paletas).toHaveLength(4)
      memoria = { vistos: t.vistos, ultimas: t.ultimas }
    }
  })

  it('en pocas pulsaciones salen casi todas las familias, y ninguna domina', () => {
    const azar = azarCon(33)
    let memoria = { vistos: [], ultimas: [] }
    const cuenta = Object.fromEntries(FAMILIAS.map(f => [f, 0]))
    for (let i = 0; i < 30; i++) {
      const t = crearTanda(4, { ...memoria, azar })
      for (const p of t.paletas) cuenta[p.familia]++
      memoria = { vistos: t.vistos, ultimas: t.ultimas }
    }
    const veces = Object.values(cuenta)
    // 120 paletas entre 10 familias: ninguna se queda a cero y ninguna se lleva más de un 17 %
    expect(Math.min(...veces)).toBeGreaterThan(0)
    expect(Math.max(...veces)).toBeLessThanOrEqual(120 * 0.17)
  })
})
