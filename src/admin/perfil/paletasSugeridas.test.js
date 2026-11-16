import { describe, expect, it } from 'vitest'
import { LIBRERIA, armarDeLibreria } from './libreriaPaletas'
import { coloresDeCarta, colorInactivoMenu, letrasSobre, rolesDePaleta } from './paletasSugeridas'
import { contraste, hexAHsl, hslAHex, mezclar, tonoDistinto } from '../../lib/colorMath'
import { CLAVES_COLORES_MINIWEB } from '../../lib/coloresMiniweb'

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

  it('la portada no se toca: ni su fondo ni sus textos, que van sobre la foto y se quedan en el blanco del diseño', () => {
    const r = rolesDePaleta(paleta)
    for (const clave of ['fondoPortada', 'titulo', 'titular', 'subtitulo', 'descripcion', 'extra']) expect(r).not.toHaveProperty(clave)
  })

  it('el título y el texto normal de la paleta van a las páginas de Horario y Reservar', () => {
    const r = rolesDePaleta(paleta)
    for (const clave of ['horarioTitulo', 'horarioDias', 'reservaTitulo']) expect(r[clave]).toBe('#1F2A26')
    for (const clave of ['horarioHoras', 'reservaTexto', 'reservaTelefono']) expect(r[clave]).toBe('#3A4A44')
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
    for (const paleta of LIBRERIA) {
      for (const oscuro of [false, true]) {
        const r = armarDeLibreria(paleta, oscuro)
        const c = coloresDeCarta(r)
        expect(contraste(c.textoSuave, r.fondo)).toBeGreaterThanOrEqual(4.5)
        expect(contraste(c.textoSuave, r.fondo)).toBeLessThan(contraste(r.texto, r.fondo))
      }
    }
  })

  it('en Inmersiva no toca el nombre ni el título (van sobre la foto, en blanco por diseño)', () => {
    expect(coloresDeCarta(p, { estilo: 'inmersiva' }).coloresCarta).toEqual({})
  })
})
