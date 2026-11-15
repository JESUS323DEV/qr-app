import { describe, expect, it } from 'vitest'
import { armarPaleta, armarPaletaDeModo, coloresDeCarta, colorInactivoMenu, contraste, elegirAcento, fondoYTexto, hexAHsl, hslAHex, letrasSobre, mezclar, principalAlAzar, rolesDePaleta, tonoDistinto } from './paletasSugeridas'
import { CLAVES_COLORES_MINIWEB } from '../../lib/coloresMiniweb'

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

describe('letrasSobre y rolesDePaleta', () => {
  it('letrasSobre siempre llega a 4,5 de contraste', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [15, 30, 45, 55, 70, 90]) {
        const fondo = hslAHex(h, 60, l)
        expect(contraste(letrasSobre(fondo), fondo)).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  const paleta = { principal: '#B04A8E', acento: '#292C5F', fondo: '#F5F9F5', texto: '#3A4A44', titulo: '#1F2A26' }

  it('solo escribe claves que existen en el catálogo y todas son colores completos', () => {
    const roles = rolesDePaleta(paleta)
    for (const [clave, valor] of Object.entries(roles)) {
      expect(CLAVES_COLORES_MINIWEB).toContain(clave)
      expect(valor).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('menú con el principal y redes con un tono distinto; botones con acento y principal; letras que se leen', () => {
    const r = rolesDePaleta(paleta)
    expect(r.menuFondo).toBe('#B04A8E')
    expect(r.redesFondo).not.toBe('#B04A8E')
    expect(contraste(r.redesIconos, r.redesFondo)).toBeGreaterThanOrEqual(4.5)
    expect(contraste(r.redesTexto, r.redesFondo)).toBeGreaterThanOrEqual(4.5)
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

  it('el título (nombre, texto grande y títulos) y el texto normal (descripción, lema, extra...) usan sus dos colores, también los de la portada sobre la foto', () => {
    const r = rolesDePaleta(paleta)
    for (const clave of ['titulo', 'titular', 'horarioTitulo', 'horarioDias', 'reservaTitulo']) expect(r[clave]).toBe('#1F2A26')
    for (const clave of ['subtitulo', 'descripcion', 'extra', 'horarioHoras', 'reservaTexto', 'reservaTelefono']) expect(r[clave]).toBe('#3A4A44')
  })

  it('la tarjeta de Google tiene su zona, un tono distinto del cuerpo', () => {
    const r = rolesDePaleta(paleta)
    expect(r.fondoResena).not.toBe(paleta.fondo)
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
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto', 'titulo'])
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
    expect(Object.keys(p).sort()).toEqual(['acento', 'fondo', 'principal', 'texto', 'titulo'])
  })
})

describe('tonoDistinto (la barra de redes nunca igual que el menú)', () => {
  it('da siempre un color distinto del de partida, del mismo tono', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const [s, l] of [[60, 10], [60, 22], [60, 40], [60, 60], [60, 78], [30, 92], [60, 96]]) {
        const menu = hslAHex(h, s, l)
        const redes = tonoDistinto(menu)
        expect(redes).not.toBe(menu)
        // Se nota la diferencia (en luz) y se mantiene el color
        expect(Math.abs(hexAHsl(redes)[2] - hexAHsl(menu)[2])).toBeGreaterThanOrEqual(8)
        if (hexAHsl(menu)[1] > 20 && hexAHsl(menu)[2] > 12 && hexAHsl(menu)[2] < 90) {
          const d = Math.abs(hexAHsl(redes)[0] - hexAHsl(menu)[0])
          expect(Math.min(d, 360 - d)).toBeLessThan(12)
        }
      }
    }
  })

  it('un color oscuro se aclara y uno claro o medio se oscurece; algo que no es un color se deja igual', () => {
    expect(hexAHsl(tonoDistinto('#1A1030'))[2]).toBeGreaterThan(hexAHsl('#1A1030')[2])
    expect(hexAHsl(tonoDistinto('#B04A8E'))[2]).toBeLessThan(hexAHsl('#B04A8E')[2])
    expect(hexAHsl(tonoDistinto('#F5F9F5'))[2]).toBeLessThan(hexAHsl('#F5F9F5')[2])
    expect(tonoDistinto('red')).toBe('red')
  })
})

describe('coloresDeCarta (paletas en Menú y ofertas)', () => {
  const p = { principal: '#B04A8E', acento: '#292C5F', fondo: '#F5F9F5', texto: '#3A4A44', titulo: '#1F2A26' }

  it('escribe las tarjetas, el texto suave y el color de título del nombre y del menú del día', () => {
    const c = coloresDeCarta(p, { estilo: 'revista' })
    expect(c.fondo2).not.toBe(p.fondo)
    expect(c.textoSuave).not.toBe(p.texto)
    expect(c.coloresCarta).toEqual({ cNombre: '#1F2A26', cMenuTitulo: '#1F2A26' })
    for (const v of [c.fondo2, c.textoSuave]) expect(v).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('el texto suave se lee sobre el fondo (contraste 4,5 o más) y es más suave que el texto', () => {
    for (const oscuro of [false, true]) {
      const { fondo, texto, titulo } = fondoYTexto('#307B2D', oscuro)
      const c = coloresDeCarta({ principal: '#307B2D', acento: '#C1BA2D', fondo, texto, titulo })
      expect(contraste(c.textoSuave, fondo)).toBeGreaterThanOrEqual(4.5)
      expect(contraste(c.textoSuave, fondo)).toBeLessThan(contraste(texto, fondo))
    }
  })

  it('en Inmersiva no toca el nombre ni el título (van sobre la foto, en blanco por diseño)', () => {
    expect(coloresDeCarta(p, { estilo: 'inmersiva' }).coloresCarta).toEqual({})
  })
})
