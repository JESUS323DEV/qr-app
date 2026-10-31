import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import PaginaCita from './PaginaCita'

/* Pedir cita con la pantalla nueva: el texto de lo que hacen es opcional, y el botón, el teléfono y el nombre del negocio salen siempre. */
afterEach(cleanup)

const pestana = { titulo: 'Pide tu cita', boton: 'Pedir cita por WhatsApp', url: 'https://wa.me/34600000000', telefono: '600 000 000', foto: 'foto.jpg' }

describe('PaginaCita', () => {
  it('con los textos de lo que hacen, los enseña', () => {
    render(<PaginaCita pestana={{ ...pestana, titulo_hacemos: 'Lo que hacemos', texto_hacemos: 'Cortes y color con cita previa.' }} negocio="LadySalon" />)
    expect(screen.getByText('LadySalon')).toBeTruthy()
    expect(screen.getByText('Lo que hacemos')).toBeTruthy()
    expect(screen.getByText('Cortes y color con cita previa.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pedir cita por WhatsApp' }).getAttribute('href')).toBe('https://wa.me/34600000000')
    expect(screen.getByText('600 000 000')).toBeTruthy()
  })

  it('con los dos grupos, enseña los dos y en ese orden', () => {
    const { container } = render(
      <PaginaCita pestana={{ ...pestana, titulo_hacemos: 'Lo que hacemos', texto_hacemos: 'Cortes y color.', titulo_quienes: 'Quiénes somos', texto_quienes: 'Un equipo pequeño.' }} negocio="LadySalon" />
    )
    const texto = container.textContent
    expect(texto.indexOf('Lo que hacemos')).toBeLessThan(texto.indexOf('Quiénes somos'))
    expect(texto.indexOf('Pide tu cita')).toBeLessThan(texto.indexOf('Lo que hacemos'))
  })

  it('solo con "quiénes somos", sale ese y no el otro', () => {
    render(<PaginaCita pestana={{ ...pestana, titulo_quienes: 'Quiénes somos', texto_quienes: 'Un equipo pequeño.' }} negocio="LadySalon" />)
    expect(screen.getByText('Quiénes somos')).toBeTruthy()
    expect(screen.queryByText('Lo que hacemos')).toBeNull()
  })

  it('sin textos de lo que hacen, esa parte no sale pero lo demás sí', () => {
    render(<PaginaCita pestana={pestana} negocio="LadySalon" />)
    expect(screen.queryByText('Lo que hacemos')).toBeNull()
    expect(screen.getByText('Pide tu cita')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pedir cita por WhatsApp' })).toBeTruthy()
  })
})
