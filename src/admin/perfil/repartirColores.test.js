import { describe, expect, it } from 'vitest'
import { conFotosDePortada } from '../TextosEditor'
import { ajustarMaximos, camposQueRellena, ordenDeColores, ordenDeFotos, ordenDeTextos, repartirColores } from './repartirColores'

describe('huecos de foto del esqueleto', () => {
  it('un Inicio sin fotos se completa con tantos huecos vacíos como pide la portada, y uno con fotos no cambia', () => {
    const vacio = { tipo: 'inicio', foto: '' }
    expect(conFotosDePortada(vacio, 4).fotos).toHaveLength(4)
    expect(conFotosDePortada(vacio, undefined)).toBe(vacio)
    const con = { tipo: 'inicio', fotos: [{ src: 'a' }, { src: 'b' }, { src: 'c' }, { src: 'd' }] }
    expect(conFotosDePortada(con, 4)).toBe(con)
  })

  it('la foto suelta vacía no se le pasa a la IA cuando ya hay huecos en la lista', () => {
    const datos = { hero: { pestanas: [{ tipo: 'inicio', foto: '', fotos: [{ src: '' }, { src: '' }] }] } }
    const campos = ['hero.pestanas.0.foto', 'hero.pestanas.0.fotos.0.src', 'hero.pestanas.0.fotos.1.src'].map(ruta => ({ ruta }))
    expect(camposQueRellena(campos, datos).map(c => c.ruta)).toEqual(['hero.pestanas.0.fotos.0.src', 'hero.pestanas.0.fotos.1.src'])
  })
})

describe('ordenDeFotos', () => {
  it('solo pide búsquedas distintas si hay varios huecos de foto', () => {
    expect(ordenDeFotos([{ ruta: 'a', clase: 'foto' }])).toBe('')
    expect(ordenDeFotos([{ ruta: 'a', clase: 'foto' }, { ruta: 'b', clase: 'foto' }])).toContain('búsqueda distinta')
  })
})

describe('ajustarMaximos', () => {
  it('da un mínimo a los grupos de texto de Pedir cita aunque estén vacíos, y no toca el resto', () => {
    const r = ajustarMaximos([
      { ruta: 'hero.pestanas.3.texto_quienes', max: 12 },
      { ruta: 'hero.pestanas.3.titulo_hacemos', max: 12 },
      { ruta: 'hero.pestanas.3.texto_hacemos', max: 300 },
      { ruta: 'hero.pestanas.0.descripcion', max: 12 },
      { ruta: 'hero.pestanas.3.foto' },
    ])
    expect(r.map(c => c.max)).toEqual([150, 24, 300, 12, undefined])
  })
})

describe('ordenDeTextos', () => {
  it('solo explica los campos que hay en el diseño', () => {
    expect(ordenDeTextos([{ ruta: 'nombre' }])).toBe('')
    const cita = ordenDeTextos([{ ruta: 'hero.pestanas.3.texto_quienes' }])
    expect(cita).toContain('Quiénes somos')
    expect(cita).not.toContain('Horario:')
    const horario = ordenDeTextos([{ ruta: 'hero.pestanas.2.lineas.0.horas' }, { ruta: 'hero.pestanas.3.turnos.0.nombre' }])
    expect(horario).toContain('10:00 a 14:00 y 17:00 a 20:00')
    expect(horario).toContain('Reservar:')
  })
})

describe('camposQueRellena', () => {
  const datos = { hero: { pestanas: [{ tipo: 'inicio' }, { tipo: 'menu' }, { tipo: 'horario' }, { tipo: 'reservar' }] } }
  const campos = ['nombre', 'hero.pestanas.0.titular', 'hero.pestanas.1.menuDia.titulo', 'hero.pestanas.2.nota', 'hero.pestanas.3.titulo', 'resena.texto'].map(ruta => ({ ruta }))

  it('quita solo los campos del menú: Inicio, Horario, Reservar y lo de fuera de las pestañas se quedan', () => {
    expect(camposQueRellena(campos, datos).map(c => c.ruta)).toEqual(['nombre', 'hero.pestanas.0.titular', 'hero.pestanas.2.nota', 'hero.pestanas.3.titulo', 'resena.texto'])
  })
})

describe('repartirColores', () => {
  it('reparte la paleta, los colores sueltos de la miniweb y el resto', () => {
    const r = repartirColores({
      'theme.colors.primary': '#112233',
      'theme.colors.bg': '#FFFFFF',
      'hero.colores.menuFondo': '#445566',
      'hero.colores.noExiste': '#000000',
      'hero.pestanas.0.titular': ['Hola'],
      'theme.colors.muted': '#777777',
    })
    expect(r.paleta).toEqual({ principal: '#112233', fondo: '#FFFFFF' })
    expect(r.sueltos).toEqual({ menuFondo: '#445566' })
    expect(r.resto).toEqual({ 'hero.colores.noExiste': '#000000', 'hero.pestanas.0.titular': ['Hola'], 'theme.colors.muted': '#777777' })
  })
})

describe('ordenDeColores', () => {
  it('sin logo, la orden sin colores; con logo, sus colores exactos', () => {
    expect(ordenDeColores(null)).not.toContain('Colores exactos del logo')
    expect(ordenDeColores(null)).toContain('menuFondo')
    expect(ordenDeColores(null)).toContain('redesIconos')
    expect(ordenDeColores({ colores: [{ hex: '#C13584', porcentaje: 60 }, { hex: 'mal', porcentaje: 5 }] })).toContain('#C13584 (60 %)')
  })
})
