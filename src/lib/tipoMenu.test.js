import { describe, expect, it } from 'vitest'
import { cambiosDeTipoMenu, textoBotonSegunMenu, tipoMenuDe } from './tipoMenu'

const menuDia = { texto: 'Menú del día', grupos: [] }
const ofertas = { texto: 'Ofertas', lista: [] }

describe('tipoMenuDe (qué enseña la pestaña de menú)', () => {
  it('sin elegir y con menú del día, el menú de siempre', () => {
    expect(tipoMenuDe({ menuDia })).toBe('menu')
    expect(tipoMenuDe({ menuDia, secciones: [] })).toBe('menu')
  })

  it('con las dos cosas, manda lo que se haya elegido', () => {
    expect(tipoMenuDe({ menuDia, ofertas, menuTipo: 'ofertas' })).toBe('ofertas')
    expect(tipoMenuDe({ menuDia, ofertas, menuTipo: 'menu' })).toBe('menu')
    // Sin elegir, el menú de siempre aunque haya ofertas guardadas
    expect(tipoMenuDe({ menuDia, ofertas })).toBe('menu')
  })

  it('una pestaña que solo trae ofertas (belleza, tiendas) enseña las ofertas', () => {
    expect(tipoMenuDe({ ofertas })).toBe('ofertas')
    expect(tipoMenuDe({ ofertas, menuTipo: 'menu' })).toBe('ofertas')
  })

  it('elegir ofertas sin que existan no enseña nada raro: sigue el menú', () => {
    expect(tipoMenuDe({ menuDia, menuTipo: 'ofertas' })).toBe('menu')
    expect(tipoMenuDe(undefined)).toBe('menu')
  })
})

describe('cambiosDeTipoMenu', () => {
  const iniciales = { texto: 'Ofertas', titulo: 'Ofertas', lista: [{ nombre: 'Oferta uno', precio: '00 €' }] }

  it('a ofertas por primera vez: crea su bloque con los textos genéricos y marca el tipo', () => {
    const c = cambiosDeTipoMenu('ofertas', { menuDia }, 1, iniciales)
    expect(c['hero.pestanas.1.ofertas']).toEqual(iniciales)
    expect(c['hero.pestanas.1.ofertas']).not.toBe(iniciales)
    expect(c['hero.pestanas.1.menuTipo']).toBe('ofertas')
  })

  it('a ofertas cuando ya las tiene: solo marca el tipo, sin pisar lo escrito', () => {
    expect(cambiosDeTipoMenu('ofertas', { menuDia, ofertas }, 2, iniciales)).toEqual({ 'hero.pestanas.2.menuTipo': 'ofertas' })
  })

  it('de vuelta al menú: solo marca el tipo, sin borrar las ofertas', () => {
    expect(cambiosDeTipoMenu('menu', { menuDia, ofertas }, 1, iniciales)).toEqual({ 'hero.pestanas.1.menuTipo': 'menu' })
  })

  it('el nombre de la pestaña del menú de arriba sigue al tipo si lleva uno de los de partida', () => {
    expect(cambiosDeTipoMenu('ofertas', { menuDia, ofertas, texto: 'Menú' }, 1, iniciales)['hero.pestanas.1.texto']).toBe('Ofertas')
    expect(cambiosDeTipoMenu('ofertas', { menuDia, ofertas, texto: 'Servicios' }, 1, iniciales)['hero.pestanas.1.texto']).toBe('Ofertas')
    expect(cambiosDeTipoMenu('menu', { menuDia, ofertas, texto: 'Ofertas' }, 1, iniciales)['hero.pestanas.1.texto']).toBe('Menú')
  })

  it('un nombre escrito a mano no se toca, y si ya dice lo que toca, tampoco', () => {
    expect(cambiosDeTipoMenu('ofertas', { menuDia, ofertas, texto: 'Qué tomar' }, 1, iniciales)).not.toHaveProperty('hero.pestanas.1.texto')
    expect(cambiosDeTipoMenu('ofertas', { menuDia, ofertas, texto: 'Ofertas' }, 1, iniciales)).not.toHaveProperty('hero.pestanas.1.texto')
    expect(cambiosDeTipoMenu('menu', { menuDia, ofertas, texto: 'Menú' }, 1, iniciales)).not.toHaveProperty('hero.pestanas.1.texto')
  })
})

describe('textoBotonSegunMenu (el botón de la portada sigue al menú)', () => {
  it('a ofertas, un botón de partida pasa a "Ver ofertas"', () => {
    for (const actual of ['Ver menú', 'Ver servicios', 'Ver carta']) expect(textoBotonSegunMenu('ofertas', actual)).toBe('Ver ofertas')
  })

  it('de vuelta al menú, "Ver ofertas" o "Ver servicios" pasan a "Ver menú"', () => {
    expect(textoBotonSegunMenu('menu', 'Ver ofertas')).toBe('Ver menú')
    expect(textoBotonSegunMenu('menu', 'Ver servicios')).toBe('Ver menú')
  })

  it('un texto escrito a mano no se toca, y si ya dice lo que toca, tampoco', () => {
    expect(textoBotonSegunMenu('ofertas', 'Mira lo nuevo')).toBe(null)
    expect(textoBotonSegunMenu('menu', 'Reserva ya')).toBe(null)
    expect(textoBotonSegunMenu('ofertas', 'Ver ofertas')).toBe(null)
    expect(textoBotonSegunMenu('menu', 'Ver menú')).toBe(null)
    expect(textoBotonSegunMenu('ofertas', '')).toBe(null)
    expect(textoBotonSegunMenu('ofertas', undefined)).toBe(null)
  })
})
