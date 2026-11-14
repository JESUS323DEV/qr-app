import { describe, expect, it } from 'vitest'
import { armarPaleta, armarPaletaDeModo, colorInactivoMenu, contraste, elegirAcento, fondoYTexto, hexAHsl, hslAHex, letrasSobre, mezclar, principalAlAzar, rolesDePaleta } from './paletasSugeridas'
import { CLAVES_COLORES_MINIWEB } from '../../lib/coloresMiniweb'

describe('texto con carácter', () => {
  it('el texto conserva el tono del principal (no es un casi negro igual en todas) y se lee', () => {
    for (const [principal, oscuro] of [['#307B2D', false], ['#292C5F', false], ['#B04A8E', false], ['#307B2D', true], ['#B04A8E', true]]) {
      const { fondo, texto } = fondoYTexto(principal, oscuro)
      expect(contraste(fondo, texto)).toBeGreaterThanOrEqual(7)
      // Del mismo tono (a unos pocos grados) y con color visible, salvo que haya tenido que caer a blanco o negro
      if (texto !== '#FFFFFF' && texto !== '#000000') {
        const dif = Math.abs(hexAHsl(texto)[0] - hexAHsl(principal)[0])
        expect(Math.min(dif, 360 - dif)).toBeLessThan(15)
        expect(hexAHsl(texto)[1]).toBeGreaterThan(20)
      }
    }
  })

  it('el texto de fondo claro es más claro que el de antes (carácter) pero sigue siendo oscuro', () => {
    const { texto } = fondoYTexto('#307B2D', false)
    expect(hexAHsl(texto)[2]).toBeLessThan(30)
  })
})

describe('letrasSobre y rolesDePaleta', () => {
  it('letrasSobre siempre llega a 4,5 de contraste', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [15, 30, 45, 55, 70, 90]) {
        const fondo = hslAHex(h, 60, l)
        expect(contraste(letrasSobre(fondo), fondo)).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  const paleta = { principal: '#B04A8E', acento: '#292C5F', fondo: '#F5F9F5', texto: '#112D10' }

  it('solo escribe claves que existen en el catálogo y todas son colores completos', () => {
    const roles = rolesDePaleta(paleta)
    for (const [clave, valor] of Object.entries(roles)) {
      expect(CLAVES_COLORES_MINIWEB).toContain(clave)
      expect(valor).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('menú y redes con el principal; botones con acento y principal; letras que se leen', () => {
    const r = rolesDePaleta(paleta)
    expect(r.menuFondo).toBe('#B04A8E')
    expect(r.redesFondo).toBe('#B04A8E')
    expect(r.botonFondo).toBe('#292C5F')
    expect(r.reservaBoton).toBe('#B04A8E')
    expect(contraste(r.menuTexto, r.menuFondo)).toBeGreaterThanOrEqual(4.5)
    expect(contraste(r.boton, r.botonFondo)).toBeGreaterThanOrEqual(4.5)
    expect(contraste(r.reservaBotonTexto, r.reservaBoton)).toBeGreaterThanOrEqual(4.5)
    expect(contraste(r.menuInactivo, r.menuFondo)).toBeGreaterThanOrEqual(4.5)
  })

  it('el subrayado usa el acento solo si se ve sobre la barra; si no, las letras de la barra', () => {
    expect(rolesDePaleta({ ...paleta, acento: '#B14F90' }).menuSubrayado).toBe(letrasSobre('#B04A8E'))
    expect(rolesDePaleta({ ...paleta, principal: '#F2C9CF', acento: '#292C5F' }).menuSubrayado).toBe('#292C5F')
  })

  it('el fondo de la portada es el de la paleta, salvo en Polaroid, que conserva el suyo', () => {
    expect(rolesDePaleta(paleta).fondoPortada).toBe('#F5F9F5')
    expect(rolesDePaleta(paleta, { polaroid: true })).not.toHaveProperty('fondoPortada')
  })

  it('los textos del Horario y Reservar usan el texto de la paleta, y lo secundario uno más suave', () => {
    const r = rolesDePaleta(paleta)
    expect(r.horarioTitulo).toBe('#112D10')
    expect(r.reservaTitulo).toBe('#112D10')
    expect(r.reservaTexto).not.toBe('#112D10')
    expect(r.reservaTelefono).toBe(r.reservaTexto)
  })
})

describe('colorInactivoMenu', () => {
  it('sobre barras oscuras o fuertes, letras claras que se leen (contraste 4,5 o más) y que no son blanco puro salvo que haga falta', () => {
    for (const barra of ['#B04A8E', '#307B2D', '#292C5F', '#6F318C', '#8B1E1E', '#1B3A57']) {
      const c = colorInactivoMenu(barra)
      expect(contraste(c, barra)).toBeGreaterThanOrEqual(4.5)
      expect(hexAHsl(c)[2]).toBeGreaterThan(hexAHsl(barra)[2])
    }
  })

  it('sobre barras claras, letras oscuras que se leen', () => {
    for (const barra of ['#F5F9F5', '#DDEFF8', '#F2C9CF']) {
      const c = colorInactivoMenu(barra)
      expect(contraste(c, barra)).toBeGreaterThanOrEqual(4.5)
      expect(hexAHsl(c)[2]).toBeLessThan(hexAHsl(barra)[2])
    }
  })

  it('mezclar: 0 es el primero y 1, el segundo', () => {
    expect(mezclar('#000000', '#FFFFFF', 0)).toBe('#000000')
    expect(mezclar('#000000', '#FFFFFF', 1)).toBe('#FFFFFF')
  })
})

describe('colores', () => {
  it('hex y hsl son inversos (con un pequeño margen de redondeo)', () => {
    for (const hex of ['#C13584', '#307BA9', '#62842E', '#792D5D', '#FFFFFF', '#000000']) {
      const [h, s, l] = hexAHsl(hex)
      const vuelta = hslAHex(h, s, l)
      expect(contraste(hex, vuelta)).toBeLessThan(1.02)
    }
  })

  it('el contraste de blanco sobre negro es 21 y el de un color consigo mismo, 1', () => {
    expect(contraste('#FFFFFF', '#000000')).toBeCloseTo(21, 0)
    expect(contraste('#307BA9', '#307BA9')).toBeCloseTo(1, 5)
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
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto'])
  })
})

describe('principalAlAzar', () => {
  it('siempre da un color completo en el que se lee la letra blanca', () => {
    for (let i = 0; i < 50; i++) {
      const c = principalAlAzar()
      expect(c).toMatch(/^#[0-9A-F]{6}$/)
      expect(contraste(c, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
    }
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
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto'])
  })
})
