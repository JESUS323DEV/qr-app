// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import CampoColor from './CampoColor'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// Un portapapeles simulado
const conPortapapeles = () => {
  const writeText = vi.fn(async () => {})
  vi.stubGlobal('navigator', { ...globalThis.navigator, clipboard: { writeText } })
  return writeText
}

describe('CampoColor (copiar el código del color)', () => {
  it('con código a la vista, hay un botón que copia el código en mayúsculas', async () => {
    const writeText = conPortapapeles()
    render(<CampoColor valor="#f4f4f4" cambiar={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Copiar el código del color'))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('#F4F4F4'))
    // Avisa de que se ha copiado
    expect(await screen.findByLabelText('Código copiado')).toBeTruthy()
  })

  it('en el color automático, que solo enseña el círculo, también se puede copiar el que se ve', async () => {
    const writeText = conPortapapeles()
    render(<CampoColor valor="#280028" auto cambiar={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Copiar el código del color'))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('#280028'))
  })

  it('en el modo solo círculo no hay botón de copiar (no hay sitio)', () => {
    render(<CampoColor valor="#280028" soloCirculo cambiar={vi.fn()} />)
    expect(screen.queryByLabelText('Copiar el código del color')).toBeNull()
  })

  it('el campo del código y el selector siguen funcionando', () => {
    const cambiar = vi.fn()
    render(<CampoColor valor="#280028" cambiar={cambiar} />)
    fireEvent.change(screen.getByDisplayValue('#280028'), { target: { value: '#112233' } })
    expect(cambiar).toHaveBeenCalledWith('#112233')
    fireEvent.click(screen.getByLabelText('Elegir color'))
    expect(screen.getByLabelText('Elegir color').getAttribute('aria-expanded')).toBe('true')
  })
})
