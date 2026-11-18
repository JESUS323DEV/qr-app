import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import FormularioTexto from './FormularioTexto'

/* El formulario "Generar texto" del asistente: en una miniweb con su lista de prompts y, en Menú y ofertas, con el texto de una carta y sin prompts. */

afterEach(cleanup)

function montar(propiedades) {
  const alGenerar = vi.fn()
  render(<FormularioTexto alGenerar={alGenerar} hayTexto={false} bloqueado={false} {...propiedades} />)
  return alGenerar
}

describe('FormularioTexto', () => {
  it('en una miniweb escribe el texto de la miniweb y tiene el botón Prompts', () => {
    const alGenerar = montar({})
    expect(screen.getByRole('button', { name: 'Prompts' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Tipo de negocio'), { target: { value: 'barbería' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generar texto' }))
    const texto = alGenerar.mock.calls[0][0]
    expect(texto).toContain('barbería')
    expect(texto).toContain('Inicio')
  })

  it('en una carta escribe el texto de la carta y no hay botón Prompts', () => {
    const alGenerar = montar({ tipoCarta: 'carta' })
    expect(screen.queryByRole('button', { name: 'Prompts' })).toBeNull()
    fireEvent.change(screen.getByLabelText('Tipo de negocio'), { target: { value: 'bar de tapas' } })
    fireEvent.change(screen.getByLabelText('Barrio'), { target: { value: 'Gràcia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cercano' }))
    fireEvent.click(screen.getByRole('button', { name: 'Generar texto' }))
    const texto = alGenerar.mock.calls[0][0]
    expect(texto).toContain('bar de tapas en Gràcia. Tono cercano.')
    expect(texto).toContain('cinco platos cada una')
    expect(texto).not.toContain('Inicio')
  })

  it('en promociones escribe ofertas y servicios', () => {
    const alGenerar = montar({ tipoCarta: 'promociones' })
    fireEvent.click(screen.getByRole('button', { name: 'Generar texto' }))
    expect(alGenerar.mock.calls[0][0]).toContain('cinco servicios cada una')
  })

  it('si el cuadro ya tenía texto, pregunta antes de sustituirlo y no lo sustituye si se dice que no', () => {
    const alGenerar = montar({ tipoCarta: 'carta', hayTexto: true })
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Generar texto' }))
    expect(confirmar).toHaveBeenCalled()
    expect(alGenerar).not.toHaveBeenCalled()
    confirmar.mockRestore()
  })
})
