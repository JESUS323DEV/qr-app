import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { NuevoPerfil } from './NuevoPerfil'

/* Prueba de montaje del Editor (Nuevo perfil): que se pinte y que el recorrido de móvil funcione. Atrapa lo que el lint no ve: errores que solo saltan al
   ejecutar la pantalla (una variable usada antes de declararse dentro del componente, un hook mal puesto...). No mide el aspecto: eso se mira en la pantalla. */

// El navegador simulado no trae matchMedia ni ResizeObserver: se simulan con el ancho de pantalla que se pida
function simularPantalla(ancho) {
  window.matchMedia = query => {
    const max = /max-width:\s*(\d+)px/.exec(query)
    const min = /min-width:\s*(\d+)px/.exec(query)
    const coincide = (!max || ancho <= Number(max[1])) && (!min || ancho >= Number(min[1]))
    return { matches: coincide, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }
  }
  window.innerWidth = ancho
  window.scrollTo = () => {}
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Monta el Editor y lo abre (es un <details>: se marca como abierto y se avisa a React con el evento toggle)
function montarYAbrir() {
  const { container } = render(<NuevoPerfil filas={[]} recargar={async () => {}} abrir={() => {}} cargar={null} />)
  const detalles = container.querySelector('details')
  detalles.open = true
  fireEvent(detalles, new Event('toggle'))
  return container
}

afterEach(cleanup)

describe('Editor (Nuevo perfil) en escritorio', () => {
  it('se pinta y enseña Personalizar y Asistente', () => {
    simularPantalla(1280)
    montarYAbrir()
    expect(screen.getAllByText('Personalizar').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Asistente').length).toBeGreaterThan(0)
  })
})

describe('Editor (Nuevo perfil) en móvil', () => {
  it('entra por la pantalla de inicio, con el producto y Continuar', () => {
    simularPantalla(390)
    montarYAbrir()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Miniweb' }).length).toBeGreaterThan(0)
  })

  it('Continuar abre el editor, con copia y guardar, y un icono de ajustes abre y cierra su hoja', () => {
    simularPantalla(390)
    montarYAbrir()
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('button', { name: 'Elegir copia' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeTruthy()

    const negocio = screen.getByRole('button', { name: 'Negocio' })
    expect(negocio.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(negocio)
    expect(screen.getByRole('button', { name: 'Negocio' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Negocio' }))
    expect(screen.getByRole('button', { name: 'Negocio' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('el panelito de copia se abre y enseña "Ninguna (una nueva)"', () => {
    simularPantalla(390)
    montarYAbrir()
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Elegir copia' }))
    expect(screen.getAllByText('Ninguna (una nueva)').length).toBeGreaterThan(0)
  })

  it('con el Asistente, Continuar lleva a su pantalla y Editar al editor', () => {
    simularPantalla(390)
    montarYAbrir()
    fireEvent.click(screen.getByRole('tab', { name: 'Asistente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('button', { name: /Inicio/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Editar/ }))
    expect(screen.getByRole('button', { name: 'Elegir copia' })).toBeTruthy()
  })
})
