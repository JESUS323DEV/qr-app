import { describe, expect, it } from 'vitest'
import armarPerfil from './armarPerfil'
import { PLANTILLAS } from '../../plantillas'
import { getNegocio } from '../../negocios'
import { getCarta } from '../../cartas'

/* Pruebas de armarPerfil: lo que se guarda al crear (la dirección, de dónde parte y los cambios del diseño elegido). Recogen cómo se comporta hoy; si cambian,
   es que ha cambiado lo que se guarda. */

// Los datos con los que se arma un perfil, con valores de partida; cada prueba cambia los que le importan
function datos(cambios = {}) {
  const plantilla = PLANTILLAS[0]
  return {
    acento: '', barra: '', cartaBase: getCarta('almendra'), cartaMini: '', cartaSlug: 'almendra', colorCabecera: '#000000', colorDelTexto: '#000000', colorFiltroCarta: '',
    colorFondo: '#FFFFFF', colorPrecio: '', colorPrecioTexto: '', colorTexto: '', coloresCarta: {}, coloresMini: {}, composicion: 'clasica', conCabecera: false,
    conTextoExtra: false, corte: 'diagonal', detallePrecio: 'raya', disposicion: 'clasica', distribucion: 'clasica', enlaceNegocio: 'ninguno', esCarta: false,
    estilo: 'revista', filas: [], filtroCarta: 100, filtroFoto: 100, fondo: '', fondo2: '', formato: 'clasica', hero: 'polaroid', horarioMini: '', horarioVar: 'clasica',
    lema: null, letra: '', logoElegido: '', lugares: [], montaje: 'clasica', negocioBase: getNegocio(plantilla.ficha), pase: 'clasica', plantilla, principal: '',
    producto: 'miniweb', subCarta: 'fila', tamanoNombre: 'md', tamanoPrecio: 'md', textoBoton: '', textoExtra: '', textoGrande: '', textoPequeno: '', textoSuave: '',
    textosMini: {}, ...cambios,
  }
}

describe('armarPerfil', () => {
  it('una miniweb: dirección a partir del nombre, de qué plantilla parte y el nombre en los cambios', () => {
    const r = armarPerfil(datos(), 'Peluquería Ranita')
    expect(r.tipoFila).toBe('negocio')
    expect(r.slug).toBe('peluqueria-ranita')
    expect(r.base).toBe(PLANTILLAS[0].miniweb ?? PLANTILLAS[0].ficha)
    expect(r.cambios.nombre).toBe('Peluquería Ranita')
  })

  it('si la dirección ya está en uso, le pone -2', () => {
    const r = armarPerfil(datos({ filas: [{ tipo: 'negocio', slug: 'peluqueria-ranita' }] }), 'Peluquería Ranita')
    expect(r.slug).toBe('peluqueria-ranita-2')
  })

  it('una dirección reservada (demo) no se usa', () => {
    expect(armarPerfil(datos(), 'demo').slug).toBe('demo-2')
  })

  it('sin nombre, la dirección es "nuevo"', () => {
    expect(armarPerfil(datos(), '').slug).toBe('nuevo')
  })

  it('los colores de la marca elegidos van a los cambios del tema', () => {
    const r = armarPerfil(datos({ principal: '#112233', acento: '#AA00BB' }), 'Prueba')
    expect(r.cambios['theme.colors.primary']).toBe('#112233')
    expect(r.cambios['theme.colors.accent']).toBe('#AA00BB')
  })

  it('una carta: parte de su carta de base, y lleva el nombre y el estilo elegidos', () => {
    const r = armarPerfil(datos({ esCarta: true, producto: 'carta', estilo: 'inmersiva' }), 'Mi carta')
    expect(r.tipoFila).toBe('carta')
    expect(r.base).toBe('almendra')
    expect(JSON.stringify(r.cambios)).toContain('Mi carta')
    expect(JSON.stringify(r.cambios)).toContain('inmersiva')
  })
})
