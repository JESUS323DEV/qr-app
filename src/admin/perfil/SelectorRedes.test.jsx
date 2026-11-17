// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import SelectorRedes from './SelectorRedes'
import { REDES_DISPONIBLES } from '../../lib/redesMiniweb'

afterEach(cleanup)

const tres = [
  { platform: 'instagram', href: 'a' },
  { platform: 'tiktok', href: 'b' },
  { platform: 'facebook', href: 'c' },
]

describe('SelectorRedes (se pinta de verdad)', () => {
  it('enseña un botón por cada red disponible, marcados los que ya están', () => {
    render(<SelectorRedes redes={tres} cambiar={vi.fn()} />)
    for (const [, nombre] of REDES_DISPONIBLES) expect(screen.getByLabelText(nombre)).toBeTruthy()
    expect(screen.getByLabelText('Instagram').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByLabelText('YouTube').getAttribute('aria-pressed')).toBe('false')
  })

  it('tocar una red que no está la añade, y tocar una que está la quita', () => {
    const cambiar = vi.fn()
    render(<SelectorRedes redes={tres} cambiar={cambiar} />)
    fireEvent.click(screen.getByLabelText('YouTube'))
    expect(cambiar.mock.calls[0][0].map(r => r.platform)).toEqual(['instagram', 'tiktok', 'facebook', 'youtube'])
    fireEvent.click(screen.getByLabelText('TikTok'))
    expect(cambiar.mock.calls[1][0].map(r => r.platform)).toEqual(['instagram', 'facebook'])
  })

  it('sin redes todavía, no se rompe', () => {
    render(<SelectorRedes redes={[]} cambiar={vi.fn()} />)
    expect(screen.getByLabelText('Instagram').getAttribute('aria-pressed')).toBe('false')
  })
})
