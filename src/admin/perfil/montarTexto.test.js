import { describe, expect, it } from 'vitest'
import montarTexto, { CAMPOS_VACIOS, PROMPTS, montarTextoCarta } from './montarTexto'

const FIJAS = [
  'Rellena todo lo editable, sin tocar el diseño:',
  '- Inicio: inventa un titular y una descripción para el negocio, y pon una foto distinta en cada hueco.',
  '- Horario: escribe su título y su nota corta, y un horario creíble para este tipo de negocio.',
  '- Pedir cita (o Reservar): escribe todos sus textos, incluidos "Lo que hacemos" y "Quiénes somos", sin inventar cifras, años ni premios. El teléfono y el WhatsApp déjalos como están.',
  '- Reseña de Google: escribe su texto.',
  'Pinta también el menú de navegación (fondo, letras, pestaña elegida y pestañas sin elegir) y la barra de redes (fondo, iconos y texto) con los colores de la marca, con buen contraste.',
]

describe('PROMPTS', () => {
  const campos = { tipo: 'tienda de uñas', barrio: 'Gràcia', tonos: ['Cercano'], colores: 'rosa palo y crema' }

  it('son cuatro y el primero es el completo, el de "Generar texto"', () => {
    expect(PROMPTS).toHaveLength(4)
    expect(PROMPTS[0].construir(campos)).toBe(montarTexto(campos))
  })

  it('todos usan los datos del formulario y ninguno lleva guion largo', () => {
    for (const p of PROMPTS) {
      const texto = p.construir(campos)
      expect(texto).not.toContain('—')
      expect(texto.length).toBeGreaterThan(40)
    }
    expect(PROMPTS[1].construir(campos)).toContain('Colores de la marca: rosa palo y crema.')
    expect(PROMPTS[3].construir(campos)).toContain('fotos distintas de tienda de uñas:')
  })

  it('con el formulario vacío funcionan igual, sin las líneas de lo que falta', () => {
    expect(PROMPTS[1].construir(CAMPOS_VACIOS)).not.toContain('Colores de la marca')
    expect(PROMPTS[2].construir(CAMPOS_VACIOS)).not.toContain('Negocio')
  })
})

describe('montarTexto', () => {
  it('con todos los campos, la plantilla completa', () => {
    expect(montarTexto({ tipo: 'tienda de uñas', barrio: 'Gràcia', tonos: ['Cercano', 'Juvenil'], colores: 'rosa palo y crema' })).toBe(
      ['tienda de uñas en Gràcia. Tono cercano y juvenil. Colores: rosa palo y crema.', ...FIJAS].join('\n'),
    )
  })

  it('con los campos vacíos, solo las líneas fijas', () => {
    expect(montarTexto(CAMPOS_VACIOS)).toBe(FIJAS.join('\n'))
  })

  it('sin tipo pero con barrio, "Negocio en ..."; sin barrio, solo el tipo; los espacios se recortan', () => {
    expect(montarTexto({ ...CAMPOS_VACIOS, barrio: ' Sants ' }).split('\n')[0]).toBe('Negocio en Sants.')
    expect(montarTexto({ ...CAMPOS_VACIOS, tipo: ' peluquería ' }).split('\n')[0]).toBe('peluquería.')
  })
})

describe('montarTextoCarta', () => {
  const campos = { tipo: 'bar de tapas', barrio: 'Gràcia', tonos: ['Cercano'], colores: 'rojo y crema' }

  it('empieza por el negocio, con su barrio, tono y colores, y sigue con lo que se rellena en una carta', () => {
    const texto = montarTextoCarta(campos, 'carta')
    expect(texto.split('\n')[0]).toBe('bar de tapas en Gràcia. Tono cercano. Colores: rojo y crema.')
    expect(texto).toContain('de cuatro a cinco secciones con cinco platos cada una')
    expect(texto).toContain('Menú del día')
    expect(texto).toContain('sin tocar el diseño')
  })

  it('en promociones habla de ofertas y servicios, no de platos', () => {
    const texto = montarTextoCarta(campos, 'promociones')
    expect(texto).toContain('Ofertas')
    expect(texto).toContain('cinco servicios cada una')
    expect(texto).not.toContain('cinco platos')
  })

  it('lo que se deja vacío no sale y ninguno lleva guion largo', () => {
    for (const t of ['carta', 'promociones']) {
      expect(montarTextoCarta(CAMPOS_VACIOS, t).split('\n')[0]).toMatch(/^Monta /)
      expect(montarTextoCarta(campos, t)).not.toContain('—')
    }
  })
})
