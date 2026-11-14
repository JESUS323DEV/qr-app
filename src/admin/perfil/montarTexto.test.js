import { describe, expect, it } from 'vitest'
import montarTexto, { CAMPOS_VACIOS, PROMPTS } from './montarTexto'

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
