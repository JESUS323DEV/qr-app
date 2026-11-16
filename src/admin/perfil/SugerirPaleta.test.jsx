// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import SugerirPaleta from './SugerirPaleta'

afterEach(cleanup)

describe('SugerirPaleta (se pinta de verdad)', () => {
  for (const modo of ['miniweb', 'carta']) {
    it(`en ${modo}: enseña cuatro paletas, en claro y en oscuro, y las siguientes no repiten, sin romperse`, () => {
      render(<SugerirPaleta aplicar={vi.fn()} modo={modo} />)
      expect(screen.queryAllByLabelText(/^Aplicar la paleta/)).toHaveLength(0)
      fireEvent.click(screen.getByText('Ver paletas'))
      const primeras = screen.getAllByLabelText(/^Aplicar la paleta/).map(b => b.getAttribute('aria-label'))
      expect(primeras).toHaveLength(4)
      // Cambiar entre fondo claro y oscuro vuelve a pintar las mismas cuatro
      fireEvent.click(screen.getByText('Fondo oscuro'))
      expect(screen.getAllByLabelText(/^Aplicar la paleta/).map(b => b.getAttribute('aria-label'))).toEqual(primeras)
      fireEvent.click(screen.getByText('Fondo claro'))
      // Otra pulsación: otras cuatro, ninguna de las anteriores
      fireEvent.click(screen.getByText('Otras paletas'))
      const segundas = screen.getAllByLabelText(/^Aplicar la paleta/).map(b => b.getAttribute('aria-label'))
      expect(segundas).toHaveLength(4)
      for (const s of segundas) expect(primeras).not.toContain(s)
    })

    it(`en ${modo}: «Sugerir con mi principal» pide a la API y enseña sus cuatro opciones, sin romperse`, async () => {
      // Una respuesta simulada de TheColorAPI: cinco colores relacionados por cada modo
      const respuesta = { colors: ['#35A164', '#BB3580', '#74A135', '#3577AE', '#C83588'].map(hex => ({ hex: { value: hex } })) }
      vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => respuesta })))
      try {
        render(<SugerirPaleta principal="#C13584" aplicar={vi.fn()} modo={modo} />)
        fireEvent.click(screen.getByText('Sugerir con mi principal'))
        const botones = await screen.findAllByLabelText(/^Aplicar la paleta/)
        expect(botones.map(b => b.getAttribute('aria-label'))).toEqual(['Aplicar la paleta Complementaria', 'Aplicar la paleta Tríada', 'Aplicar la paleta Vecinos', 'Aplicar la paleta Mismo tono'])
        fireEvent.click(screen.getByText('Fondo oscuro'))
        expect(screen.getAllByLabelText(/^Aplicar la paleta/)).toHaveLength(4)
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it(`en ${modo}: si la API falla, avisa y no se rompe`, async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
      try {
        render(<SugerirPaleta principal="#C13584" aplicar={vi.fn()} modo={modo} />)
        fireEvent.click(screen.getByText('Sugerir con mi principal'))
        expect(await screen.findByText(/No se ha podido pedir la paleta/)).toBeTruthy()
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it(`en ${modo}: al tocar una paleta se aplica con sus cuatro colores`, () => {
      const aplicar = vi.fn()
      render(<SugerirPaleta aplicar={aplicar} modo={modo} />)
      fireEvent.click(screen.getByText('Ver paletas'))
      fireEvent.click(screen.getAllByLabelText(/^Aplicar la paleta/)[0])
      expect(aplicar).toHaveBeenCalledTimes(1)
      const [paleta, soltar] = aplicar.mock.calls[0]
      for (const clave of ['principal', 'acento', 'fondo', 'texto', 'titulo']) expect(paleta[clave]).toMatch(/^#[0-9A-F]{6}$/)
      expect(soltar).toBe(true)
    })
  }
})
