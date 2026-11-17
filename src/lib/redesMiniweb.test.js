import { describe, expect, it } from 'vitest'
import { REDES_DISPONIBLES, redesConRed } from './redesMiniweb'
import { TRAZADOS } from '../components/SocialIcons'

const tres = [
  { platform: 'instagram', href: 'https://instagram.com/mio' },
  { platform: 'tiktok', href: 'https://tiktok.com/@mio' },
  { platform: 'facebook', href: 'https://facebook.com/mio' },
]

describe('las redes disponibles', () => {
  it('cada una tiene su icono dibujado, su nombre y un enlace de partida', () => {
    for (const [clave, nombre, enlace] of REDES_DISPONIBLES) {
      expect(TRAZADOS[clave], `icono de ${clave}`).toBeTruthy()
      expect(nombre.length).toBeGreaterThan(0)
      expect(enlace).toMatch(/^https:\/\//)
    }
  })

  it('no hay dos iguales', () => {
    expect(new Set(REDES_DISPONIBLES.map(([c]) => c)).size).toBe(REDES_DISPONIBLES.length)
  })
})

describe('redesConRed', () => {
  it('poner una red nueva la añade con su enlace de partida, sin tocar las demás', () => {
    const r = redesConRed(tres, 'youtube', true)
    expect(r).toHaveLength(4)
    expect(r.at(-1)).toEqual({ platform: 'youtube', href: 'https://youtube.com' })
    expect(r.slice(0, 3)).toEqual(tres)
  })

  it('entra en su sitio del orden, no siempre al final', () => {
    const r = redesConRed([{ platform: 'instagram', href: 'a' }, { platform: 'youtube', href: 'b' }], 'tiktok', true)
    expect(r.map(x => x.platform)).toEqual(['instagram', 'tiktok', 'youtube'])
  })

  it('quitar una red la saca con su enlace y deja las demás igual', () => {
    expect(redesConRed(tres, 'tiktok', false)).toEqual([tres[0], tres[2]])
  })

  it('poner una que ya está o quitar una que no está no cambia nada', () => {
    expect(redesConRed(tres, 'instagram', true)).toEqual(tres)
    expect(redesConRed(tres, 'youtube', false)).toEqual(tres)
  })

  it('se puede quitar todas y volver a poner desde cero', () => {
    const vacia = ['instagram', 'tiktok', 'facebook'].reduce((r, c) => redesConRed(r, c, false), tres)
    expect(vacia).toEqual([])
    expect(redesConRed(vacia, 'whatsapp', true)).toEqual([{ platform: 'whatsapp', href: 'https://wa.me/' }])
    expect(redesConRed(undefined, 'google', true)).toHaveLength(1)
  })

  it('una red que no está en la lista (como Telegram) no se pierde al tocar las demás', () => {
    const conOtra = [{ platform: 'telegram', href: 't' }, ...tres]
    expect(redesConRed(conOtra, 'youtube', true).map(r => r.platform)).toContain('telegram')
    expect(redesConRed(conOtra, 'tiktok', false).map(r => r.platform)).toContain('telegram')
  })
})
