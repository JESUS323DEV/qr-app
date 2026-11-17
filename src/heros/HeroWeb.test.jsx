// @vitest-environment jsdom
/* Pruebas de la miniweb por dentro (HeroWeb): fijan cómo se comporta HOY cada página, para poder partir el archivo sin cambiar lo que hace.
   Se pintan con los datos de las demos (en-blanco y chalaquita) y se abren las pestañas como lo haría el cliente. Todas las páginas están pintadas a la vez
   (las inactivas, ocultas), así que se comprueba lo que sale al tocar cada pestaña. No miden el aspecto: eso lo confirma Jesús en el móvil. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import HeroWeb from './HeroWeb'
import { getNegocio } from '../negocios'
import enBlancoOfertas from '../cartas/en-blanco-ofertas'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Pinta la miniweb de un negocio; extra cambia o añade cosas a su hero
function pintar(negocio, { hero: extraHero = {}, redes = negocio.redes } = {}) {
  const hero = { ...structuredClone(negocio.hero), ...extraHero }
  return render(<HeroWeb hero={hero} nombre={negocio.nombre} lema={negocio.lema} redes={redes} cuerpo={<div>CUERPO DE PRUEBA</div>} />)
}

// La pestaña del menú de arriba (en la barra de navegación)
const pestana = nombre => within(screen.getByRole('navigation')).getByRole('button', { name: nombre })
const activa = nombre => pestana(nombre).getAttribute('aria-pressed') === 'true'

const enBlanco = getNegocio('en-blanco')
const chalaquita = getNegocio('chalaquita')

describe('HeroWeb: la barra de navegación', () => {
  it('enseña una pestaña por cada página de la miniweb, y la primera sale abierta', () => {
    pintar(enBlanco)
    for (const t of ['Inicio', 'Menú', 'Horario', 'Pedir cita']) expect(pestana(t)).toBeTruthy()
    expect(activa('Inicio')).toBe(true)
    expect(activa('Menú')).toBe(false)
  })

  it('al tocar una pestaña, pasa a ser la abierta y la anterior deja de serlo', () => {
    pintar(chalaquita)
    for (const t of ['Menú', 'Horario', 'Reservar', 'Inicio']) {
      fireEvent.click(pestana(t))
      expect(activa(t)).toBe(true)
      for (const otra of ['Inicio', 'Menú', 'Horario', 'Reservar'].filter(x => x !== t)) expect(activa(otra)).toBe(false)
    }
  })

  it('con el menú abajo (hero.menuEn), sigue habiendo las mismas pestañas', () => {
    pintar(enBlanco, { hero: { menuEn: 'abajo' } })
    expect(pestana('Horario')).toBeTruthy()
  })
})

describe('HeroWeb: Inicio', () => {
  it('enseña el titular, la descripción, el botón y el cuerpo de la miniweb', () => {
    pintar(enBlanco)
    expect(screen.getAllByText(/Titular de tu/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Una frase corta que cuenta/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('CUERPO DE PRUEBA').length).toBeGreaterThan(0)
  })

  it('el botón de la portada lleva a la pestaña que dice botonA', () => {
    pintar(enBlanco)
    fireEvent.click(screen.getByRole('button', { name: 'Ver menú' }))
    expect(activa('Menú')).toBe(true)
    expect(activa('Inicio')).toBe(false)
  })
})

describe('HeroWeb: Menú', () => {
  it('lo de siempre: Menú del día y Carta, con las secciones de la carta', () => {
    pintar(enBlanco)
    fireEvent.click(pestana('Menú'))
    expect(screen.getByRole('button', { name: 'Menú del día' })).toBeTruthy()
    expect(screen.getAllByText('Primeros').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Carta' }))
    expect(screen.getByRole('button', { name: 'Sección uno' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sección dos' })).toBeTruthy()
    expect(screen.getAllByText('Plato o servicio 1').length).toBeGreaterThan(0)
    // Al cambiar de sección se enseñan sus platos
    fireEvent.click(screen.getByRole('button', { name: 'Sección dos' }))
    expect(screen.getAllByText('Plato o servicio 3').length).toBeGreaterThan(0)
  })

  // La pestaña del menú con las ofertas añadidas, y el tipo elegido
  const conTipoMenu = menuTipo => {
    const hero = structuredClone(enBlanco.hero)
    const i = hero.pestanas.findIndex(p => p.tipo === 'menu')
    hero.pestanas[i].ofertas = structuredClone(enBlancoOfertas.ofertas)
    if (menuTipo) hero.pestanas[i].menuTipo = menuTipo
    return { hero }
  }

  it('con ofertas y servicios elegido: Ofertas y Servicios, sin menú del día ni carta', () => {
    pintar(enBlanco, conTipoMenu('ofertas'))
    fireEvent.click(pestana('Menú'))
    expect(screen.getByRole('button', { name: 'Ofertas' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Servicios' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Menú del día' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Carta' })).toBeNull()
    expect(screen.getAllByText('Oferta uno').length).toBeGreaterThan(0)
  })

  it('con las ofertas guardadas pero el menú elegido (o sin elegir), el menú de siempre', () => {
    for (const tipo of ['menu', undefined]) {
      cleanup()
      pintar(enBlanco, conTipoMenu(tipo))
      fireEvent.click(pestana('Menú'))
      expect(screen.getByRole('button', { name: 'Menú del día' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Carta' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: 'Servicios' })).toBeNull()
    }
  })

  it('con una carta de otro sitio (hero.carta), la enseña dentro de un marco', () => {
    const { container } = pintar(enBlanco, { hero: { carta: 'almendra' } })
    const marco = container.querySelector('iframe[title="Carta"]')
    expect(marco).toBeTruthy()
    expect(marco.getAttribute('src')).toContain('?incrustada=1')
    expect(marco.getAttribute('src')).toContain('almendra')
  })
})

describe('HeroWeb: Horario y Cita', () => {
  it('el horario enseña sus líneas de días y horas', () => {
    pintar(enBlanco)
    fireEvent.click(pestana('Horario'))
    expect(screen.getAllByText('Lunes a viernes').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/10:00 a 20:00/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Domingo').length).toBeGreaterThan(0)
  })

  it('pedir cita con el botón: título, los dos textos y el botón de WhatsApp con su enlace', () => {
    pintar(enBlanco)
    fireEvent.click(pestana('Pedir cita'))
    expect(screen.getAllByText('Pide tu cita').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lo que hacemos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Quiénes somos').length).toBeGreaterThan(0)
    const boton = screen.getAllByRole('link', { name: /Pedir cita por WhatsApp/ })[0]
    expect(boton.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/34600000000\?text=/)
  })
})

describe('HeroWeb: Contacto, Ubicación y Precios', () => {
  const hero = {
    diseno: 'web',
    pestanas: [
      { tipo: 'contacto', texto: 'Contacto', titulo: 'Escríbenos', texto_encargo: 'Te respondemos hoy.', boton: 'Escribir ahora', url: 'https://wa.me/34600111222', telefono: '600 111 222' },
      { tipo: 'ubicacion', texto: 'Dónde', mapa: 'Calle Mayor 1, Barcelona', direccion: 'Calle Mayor 1', telefono: '600 333 444' },
      { tipo: 'precios', texto: 'Precios', titulo: 'Tarifas', servicios: [{ nombre: 'Corte', precio: '12 €' }, { nombre: 'Tinte', precio: '30 €' }] },
    ],
  }
  const negocio = { nombre: 'Prueba', lema: 'Lema', hero, redes: [] }

  it('contacto: título, texto, botón con su enlace y teléfono', () => {
    pintar(negocio)
    expect(screen.getAllByText('Escríbenos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Te respondemos hoy.').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Escribir ahora' }).getAttribute('href')).toBe('https://wa.me/34600111222')
    expect(screen.getByRole('link', { name: /o por teléfono/ }).getAttribute('href')).toBe('tel:600111222')
  })

  it('ubicación: el mapa con su dirección, el teléfono y "Cómo llegar"', () => {
    const { container } = pintar(negocio)
    fireEvent.click(pestana('Dónde'))
    const mapa = container.querySelector('iframe[title="Mapa"]')
    expect(mapa.getAttribute('src')).toBe('https://www.google.com/maps?q=Calle%20Mayor%201%2C%20Barcelona&output=embed')
    expect(screen.getAllByText('Calle Mayor 1').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: '600 333 444' }).getAttribute('href')).toBe('tel:600333444')
    expect(screen.getByRole('link', { name: /Cómo llegar/ }).getAttribute('href')).toBe('https://www.google.com/maps/dir/?api=1&destination=Calle%20Mayor%201%2C%20Barcelona')
  })

  it('precios: el título y cada servicio con su precio', () => {
    pintar(negocio)
    fireEvent.click(pestana('Precios'))
    expect(screen.getAllByText('Tarifas').length).toBeGreaterThan(0)
    for (const t of ['Corte', '12 €', 'Tinte', '30 €']) expect(screen.getAllByText(t).length).toBeGreaterThan(0)
  })
})

describe('HeroWeb: la barra de redes', () => {
  it('enseña un enlace por cada red, con su dirección', () => {
    pintar(enBlanco)
    for (const r of enBlanco.redes) {
      const enlace = screen.getByRole('link', { name: r.platform })
      expect(enlace.getAttribute('href')).toBe(r.href)
    }
  })

  it('con otras redes, enseña esas (y todas las que haya)', () => {
    const redes = [
      { platform: 'whatsapp', href: 'https://wa.me/34600000000' },
      { platform: 'youtube', href: 'https://youtube.com/@mio' },
      { platform: 'linkedin', href: 'https://linkedin.com/in/mio' },
      { platform: 'google', href: 'https://g.page/mio' },
    ]
    pintar(enBlanco, { redes })
    for (const r of redes) expect(screen.getByRole('link', { name: r.platform }).getAttribute('href')).toBe(r.href)
    expect(screen.queryByRole('link', { name: 'instagram' })).toBeNull()
  })

  it('sin redes, no sale ningún enlace de redes', () => {
    pintar(enBlanco, { redes: [] })
    expect(screen.queryByRole('link', { name: 'instagram' })).toBeNull()
  })
})

describe('HeroWeb: Reservar (el formulario que abre WhatsApp)', () => {
  beforeEach(() => {
    // Un miércoles fijo, para que el calendario y los días abiertos sean siempre los mismos
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 10, 0, 0))
  })

  const abrir = () => {
    pintar(chalaquita)
    fireEvent.click(pestana('Reservar'))
  }
  const elegirDia = n => {
    fireEvent.click(screen.getByText('Elige el día').closest('button'))
    fireEvent.click(screen.getByRole('button', { name: String(n) }))
  }
  const elegirHora = h => {
    fireEvent.click(screen.getByText('Elige la hora').closest('button'))
    fireEvent.click(screen.getByRole('button', { name: h }))
  }
  const rellenar = (nombre, telefono) => {
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: nombre } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: telefono } })
  }
  const enviar = () => fireEvent.submit(screen.getByRole('button', { name: /Reservar por WhatsApp/ }).closest('form'))
  // Lo que se le manda al negocio: el texto del mensaje ya sin codificar
  const mensajeEnviado = abrirMock => {
    expect(abrirMock).toHaveBeenCalledTimes(1)
    const [url, destino, opciones] = abrirMock.mock.calls[0]
    expect(destino).toBe('_blank')
    expect(opciones).toBe('noopener')
    const [base, texto] = url.split('?text=')
    expect(base).toBe('https://wa.me/34600000000')
    return decodeURIComponent(texto)
  }

  it('enseña los campos y el botón de la reserva', () => {
    abrir()
    expect(screen.getByText('Reserva tu mesa')).toBeTruthy()
    expect(screen.getByLabelText('Nombre')).toBeTruthy()
    expect(screen.getByLabelText('Teléfono')).toBeTruthy()
    expect(screen.getByLabelText('Personas')).toBeTruthy()
    expect(screen.getByLabelText('Zona')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Reservar por WhatsApp/ })).toBeTruthy()
  })

  it('sin elegir el día no se envía y avisa; con el día pero sin la hora, también', () => {
    const abrirMock = vi.spyOn(window, 'open').mockImplementation(() => null)
    abrir()
    rellenar('Ana López', '600123456')
    enviar()
    expect(screen.getByText('Elige el día.')).toBeTruthy()
    elegirDia(16)
    enviar()
    expect(screen.getByText('Elige la hora.')).toBeTruthy()
    expect(abrirMock).not.toHaveBeenCalled()
  })

  it('con todo elegido abre WhatsApp con el mensaje ordenado: día, hora, personas, zona, nombre y teléfono', () => {
    const abrirMock = vi.spyOn(window, 'open').mockImplementation(() => null)
    abrir()
    rellenar('Ana López', '600123456')
    elegirDia(16) // viernes: abre mediodía y noche
    elegirHora('21:00')
    enviar()
    expect(mensajeEnviado(abrirMock)).toBe(
      ['Hola, quiero hacer una reserva en Chalaquita:', '', '*Día:* Viernes, 16 de octubre', '*Hora:* 21:00', '*Personas:* 2', '*Zona:* Interior', '', '*Nombre:* Ana López', '*Teléfono:* 600 123 456'].join('\n'),
    )
  })

  it('el comentario, si se escribe, va al final; el teléfono que no es de 9 cifras se manda tal cual', () => {
    const abrirMock = vi.spyOn(window, 'open').mockImplementation(() => null)
    abrir()
    rellenar('Pere', '+34 600 12')
    fireEvent.change(screen.getByLabelText(/Comentario/), { target: { value: 'Alergia a los frutos secos' } })
    fireEvent.change(screen.getByLabelText('Personas'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Zona'), { target: { value: 'Terraza' } })
    elegirDia(16)
    elegirHora('13:30')
    enviar()
    const texto = mensajeEnviado(abrirMock)
    expect(texto).toContain('*Personas:* 4')
    expect(texto).toContain('*Zona:* Terraza')
    expect(texto).toContain('*Teléfono:* +34 600 12')
    expect(texto.endsWith('*Comentario:* Alergia a los frutos secos')).toBe(true)
  })

  it('los turnos dependen del día: un miércoles solo hay mediodía, un viernes también la noche', () => {
    abrir()
    fireEvent.click(screen.getByText('Elige el día').closest('button'))
    fireEvent.click(screen.getByRole('button', { name: '15' })) // jueves
    fireEvent.click(screen.getByText('Elige la hora').closest('button'))
    expect(screen.getByRole('button', { name: '14:00' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '21:00' })).toBeNull()
  })

  it('el calendario no deja elegir los días pasados ni los que el negocio tiene cerrados (lunes)', () => {
    abrir()
    fireEvent.click(screen.getByText('Elige el día').closest('button'))
    expect(screen.getByRole('button', { name: '13' }).disabled).toBe(true) // ayer
    expect(screen.getByRole('button', { name: '19' }).disabled).toBe(true) // lunes
    expect(screen.getByRole('button', { name: '20' }).disabled).toBe(false) // martes
  })

  it('al cambiar de día, una hora que ese día no existe se quita', () => {
    abrir()
    elegirDia(16) // viernes
    elegirHora('21:00')
    expect(screen.queryByText('Elige la hora')).toBeNull()
    // Se vuelve a abrir el calendario (el campo del día ya dice "vie 16 oct") y se elige un jueves, que no tiene noche
    fireEvent.click(screen.getByText('vie 16 oct').closest('button'))
    fireEvent.click(screen.getByRole('button', { name: '15' }))
    expect(screen.getByText('Elige la hora')).toBeTruthy()
  })
})
