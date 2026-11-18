import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { GruposMenuDia, ListaOfertas } from './GruposMenuOfertas'

/* Los editores de Grupos del menú del día y de Ofertas (panel Grupos de una carta): que enseñen todos los datos (título, cuándo, precio, qué incluye;
   en las ofertas, el precio y el precio de antes de cada una) y que cada cambio llegue a su ruta. */

afterEach(cleanup)

const menuDia = { titulo: 'Menú del día', cuando: 'De lunes a viernes', precio: '14,90 €', incluye: 'Bebida y postre', foto: '', grupos: [{ nombre: 'Primeros', platos: ['Sopa'] }] }
const ofertas = {
  titulo: 'Ofertas',
  cuando: 'Pídelas al reservar',
  fotos: [],
  lista: [
    { nombre: 'Corte', descripcion: 'Con lavado', precio: '12 €', antes: '18 €' },
    { nombre: 'Tinte', descripcion: 'Completo', precio: '-10 %' },
  ],
}

function montarMenu() {
  const cambiarExtra = vi.fn()
  render(<GruposMenuDia datos={{ menuDia }} datosEnBruto={{ menuDia }} cambiosExtra={{}} cambiarExtra={cambiarExtra} preguntar={() => {}} />)
  return cambiarExtra
}

function montarOfertas() {
  const cambiarExtra = vi.fn()
  render(<ListaOfertas datos={{ ofertas }} datosEnBruto={{ ofertas }} cambiosExtra={{}} cambiarExtra={cambiarExtra} />)
  return cambiarExtra
}

describe('Grupos del menú del día', () => {
  it('enseña el título, el precio, cuándo y qué incluye con sus valores', () => {
    montarMenu()
    expect(screen.getByLabelText('Título').value).toBe('Menú del día')
    expect(screen.getByLabelText('Precio').value).toBe('14,90 €')
    expect(screen.getByLabelText('Cuándo').value).toBe('De lunes a viernes')
    expect(screen.getByLabelText('Qué incluye').value).toBe('Bebida y postre')
  })

  it('cada dato cambia su ruta del menú del día', () => {
    const cambiarExtra = montarMenu()
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '16 €' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('menuDia.precio', '16 €')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Menú' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('menuDia.titulo', 'Menú')
    fireEvent.change(screen.getByLabelText('Cuándo'), { target: { value: 'Sábados' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('menuDia.cuando', 'Sábados')
    fireEvent.change(screen.getByLabelText('Qué incluye'), { target: { value: 'Café' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('menuDia.incluye', 'Café')
  })
})

describe('Ofertas', () => {
  it('enseña el título y cuándo, y el precio y el precio de antes de cada oferta', () => {
    montarOfertas()
    expect(screen.getByLabelText('Título').value).toBe('Ofertas')
    expect(screen.getByLabelText('Cuándo').value).toBe('Pídelas al reservar')
    expect(screen.getByLabelText('Precio de la oferta 1').value).toBe('12 €')
    expect(screen.getByLabelText('Precio de antes de la oferta 1').value).toBe('18 €')
    expect(screen.getByLabelText('Precio de la oferta 2').value).toBe('-10 %')
    expect(screen.getByLabelText('Precio de antes de la oferta 2').value).toBe('')
  })

  it('cambiar el precio de una oferta guarda la lista entera con ese cambio y las demás igual', () => {
    const cambiarExtra = montarOfertas()
    fireEvent.change(screen.getByLabelText('Precio de la oferta 2'), { target: { value: '-20 %' } })
    const [ruta, lista] = cambiarExtra.mock.calls.at(-1)
    expect(ruta).toBe('ofertas.lista')
    expect(lista[1]).toEqual({ nombre: 'Tinte', descripcion: 'Completo', precio: '-20 %' })
    expect(lista[0]).toEqual(ofertas.lista[0])
  })

  it('poner el precio de antes a una oferta que no lo tenía lo añade', () => {
    const cambiarExtra = montarOfertas()
    fireEvent.change(screen.getByLabelText('Precio de antes de la oferta 2'), { target: { value: '25 €' } })
    expect(cambiarExtra.mock.calls.at(-1)[1][1].antes).toBe('25 €')
  })

  it('el título y cuándo cambian su ruta', () => {
    const cambiarExtra = montarOfertas()
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Promos' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('ofertas.titulo', 'Promos')
    fireEvent.change(screen.getByLabelText('Cuándo'), { target: { value: 'Hasta el 30' } })
    expect(cambiarExtra).toHaveBeenLastCalledWith('ofertas.cuando', 'Hasta el 30')
  })

  it('el nombre y la descripción de cada oferta siguen editándose', () => {
    const cambiarExtra = montarOfertas()
    fireEvent.change(screen.getByLabelText('Nombre de la oferta 1'), { target: { value: 'Corte pro' } })
    expect(cambiarExtra.mock.calls.at(-1)[1][0].nombre).toBe('Corte pro')
    fireEvent.change(screen.getByLabelText('Descripción de la oferta 1'), { target: { value: 'Nueva' } })
    expect(cambiarExtra.mock.calls.at(-1)[1][0].descripcion).toBe('Nueva')
  })
})
