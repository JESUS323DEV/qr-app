import { describe, expect, it } from 'vitest'
import marcaVista from './marcaVista'
import instantaneaPerfil from './instantaneaPerfil'

/* Pruebas de marcaVista (lo que se le añade a la dirección de la vista previa para que enseñe el nombre, los colores y el diseño elegidos) e
   instantaneaPerfil (cómo está todo, para poder reabrir una copia tal cual). Recogen cómo se comportan hoy. */

// Los datos de partida: todo sin tocar (el diseño de siempre); cada prueba cambia lo que le importa
function datos(cambios = {}) {
  return {
    acento: '', barra: '', cabecera: '', cambiosExtra: {}, cambiosIA: null, cartaMini: '', colorFiltroCarta: '', colorPrecio: '', colorPrecioTexto: '', colorTexto: '',
    coloresCarta: {}, coloresMini: {}, composicion: 'clasica', conCabecera: false, conTextoExtra: false, corte: 'diagonal', cuento: '', detallePrecio: 'raya',
    disposicion: 'clasica', distribucion: 'clasica', enlaceNegocio: 'ninguno', esCarta: false, estilo: 'revista', estructura: {}, etiqueta: '', filtroCarta: 100,
    filtroFoto: 100, fondo: '', fondo2: '', formato: 'clasica', hero: 'polaroid', horarioMini: '', horarioVar: 'clasica', lema: null, letra: '', logo: '', logoElegido: '',
    lugares: [], montaje: 'clasica', nombre: '', nombreVista: '', pase: 'clasica', principal: '', producto: 'miniweb', resumenDiseno: '', subCarta: 'fila',
    tamanoNombre: 'md', tamanoPrecio: 'md', tema: 'restaurante', textoExtra: '', textoGrande: '', textoPequeno: '', textoSuave: '', textosEditados: false,
    textosMini: {}, textosPrevia: {}, tipoCarta: 'carta', versionExtra: 0, versionIA: 0, ...cambios,
  }
}

describe('marcaVista', () => {
  it('sin tocar nada, solo lleva el nombre de prueba', () => {
    expect(marcaVista(datos())).toBe('&nombre=Prueba')
  })

  it('con nombre, lo lleva codificado', () => {
    expect(marcaVista(datos({ nombreVista: 'Peluquería Ranita' }))).toBe('&nombre=Peluquer%C3%ADa%20Ranita')
  })

  it('los colores elegidos van sin la almohadilla', () => {
    const m = marcaVista(datos({ principal: '#112233', acento: '#AA00BB' }))
    expect(m).toContain('&principal=112233')
    expect(m).toContain('&acento=AA00BB')
  })

  it('una carta lleva su derivación y su enlace al negocio', () => {
    const m = marcaVista(datos({ esCarta: true, producto: 'carta' }))
    expect(m).toContain('&derivar=1')
    expect(m).toContain('&enlace=ninguno')
  })

  it('el corte solo se manda con el diseño Diagonal y si no es el de siempre', () => {
    expect(marcaVista(datos({ hero: 'diagonal', corte: 'ondulado' }))).toContain('&corte=ondulado')
    expect(marcaVista(datos({ hero: 'polaroid', corte: 'ondulado' }))).not.toContain('&corte=')
  })
})

describe('instantaneaPerfil', () => {
  it('guarda lo elegido para poder reabrir la copia', () => {
    const r = instantaneaPerfil(datos({ producto: 'carta', hero: 'mosaico', principal: '#112233', nombre: 'Mi negocio' }))
    expect(r.producto).toBe('carta')
    expect(r.hero).toBe('mosaico')
    expect(r.principal).toBe('#112233')
    expect(r.nombre).toBe('Mi negocio')
  })

  it('lleva todos los campos de siempre (si cambia la lista, cambia lo que se reabre)', () => {
    const claves = Object.keys(instantaneaPerfil(datos())).sort()
    expect(claves).toContain('tema')
    expect(claves).toContain('tipoCarta')
    expect(claves).toContain('horarioVar')
    expect(claves.length).toBeGreaterThan(30)
  })
})
