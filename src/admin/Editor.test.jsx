import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'

/* Pruebas de montaje del Editor de una copia o demo (Editor.jsx): que se pinte y que funcionen sus recorridos (demo original, página editable con su
   guardado, copia con su información, grupo, borrar, duplicar y las pestañas de Diseño). Supabase va simulado: se apunta lo que se le pide y no se
   toca ninguna base. No miden el aspecto: eso se mira en la pantalla. */

const supa = vi.hoisted(() => ({ llamadas: [], error: null }))

vi.mock('../lib/supabase', () => {
  const hecho = (tipo, tabla, datos) => {
    supa.llamadas.push({ tipo, tabla, datos })
    return { error: supa.error }
  }
  // delete().eq().eq() se espera entero: cada eq devuelve algo con más eq y que se puede esperar
  const cadena = (tabla, filtros = []) => ({
    eq: (campo, valor) => cadena(tabla, [...filtros, [campo, valor]]),
    then: (alResolver, alFallar) => Promise.resolve(hecho('delete', tabla, Object.fromEntries(filtros))).then(alResolver, alFallar),
  })
  return {
    supabase: {
      from: tabla => ({
        upsert: async datos => hecho('upsert', tabla, datos),
        insert: async datos => hecho('insert', tabla, datos),
        delete: () => cadena(tabla),
        update: datos => ({ eq: async () => hecho('update', tabla, datos) }),
      }),
    },
  }
})

import { Editor } from './Editor'
import { getNegocio } from '../negocios'

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

const acciones = () => ({ volver: vi.fn(), recargar: vi.fn(async () => {}), abrir: vi.fn(), irANuevoPerfil: vi.fn() })

function montar(propiedades) {
  const a = acciones()
  render(<Editor filas={[]} {...a} {...propiedades} />)
  return a
}

beforeEach(() => {
  simularPantalla(1280)
  supa.llamadas.length = 0
  supa.error = null
})
afterEach(cleanup)

describe('Editor de una demo original', () => {
  it('se pinta con su nombre, sin Guardar, y avisa de que solo se puede ver', () => {
    montar({ tipo: 'negocio', slug: 'almendra' })
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(getNegocio('almendra').nombre)
    expect(screen.getByText(/Es una demo original/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Duplicar' }).length).toBeGreaterThan(0)
  })

  it('"Todas" vuelve a la lista', () => {
    const a = montar({ tipo: 'negocio', slug: 'almendra' })
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
    expect(a.volver).toHaveBeenCalled()
  })

  it('una página que no existe lo dice', () => {
    montar({ tipo: 'negocio', slug: 'no-existe' })
    expect(screen.getByText('No se encuentra esta página.')).toBeTruthy()
  })

  it('una carta de demo se pinta con su estilo y su perfil', () => {
    montar({ tipo: 'carta', slug: 'tumi' })
    expect(screen.getByText(/Es una carta de demo/)).toBeTruthy()
    expect(screen.getByText('Estilo')).toBeTruthy()
    expect(screen.getByText('Perfil')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Menú y ofertas' }).getAttribute('aria-selected')).toBe('true')
  })
})

describe('Editor de una página que se puede editar (vanessa)', () => {
  const nombre = getNegocio('vanessa').nombre

  it('arranca sin cambios; al escribir avisa y al pulsar Guardar lo guarda en ediciones', async () => {
    const a = montar({ tipo: 'negocio', slug: 'vanessa' })
    expect(screen.getByText('Sin cambios.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(true)

    const campo = screen.getAllByRole('textbox').find(t => t.value === nombre)
    fireEvent.change(campo, { target: { value: `${nombre} Sol` } })
    expect(screen.getByText('Hay cambios sin guardar.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await screen.findByText('Guardado. Ya se ve en la página.')
    const guardado = supa.llamadas.find(l => l.tipo === 'upsert')
    expect(guardado.tabla).toBe('ediciones')
    expect(guardado.datos).toMatchObject({ tipo: 'negocio', slug: 'vanessa', base: null })
    expect(Object.values(guardado.datos.cambios)).toContain(`${nombre} Sol`)
    expect(a.recargar).toHaveBeenCalled()
  })

  it('si Supabase falla, lo dice y no da el cambio por guardado', async () => {
    supa.error = { code: 'x' }
    montar({ tipo: 'negocio', slug: 'vanessa' })
    fireEvent.change(screen.getAllByRole('textbox').find(t => t.value === nombre), { target: { value: 'Otro' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await screen.findByText('No se ha podido guardar. Prueba otra vez.')
  })

  it('"Volver al original" deshace el cambio de un campo', () => {
    montar({ tipo: 'negocio', slug: 'vanessa' })
    fireEvent.change(screen.getAllByRole('textbox').find(t => t.value === nombre), { target: { value: 'Otro' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Volver al original' })[0])
    expect(screen.getByText('Sin cambios.')).toBeTruthy()
  })

  it('el bloque Diseño tiene sus tres pestañas, Ficha abierta, y pasar a Miniweb enseña sus ajustes', () => {
    montar({ tipo: 'negocio', slug: 'vanessa' })
    expect(screen.getByRole('tab', { name: 'Ficha' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Diseño de arriba')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Miniweb' }))
    expect(screen.getByRole('tab', { name: 'Miniweb' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Estilo del menú de navegación')).toBeTruthy()
    expect(screen.getAllByText('Portada').length).toBeGreaterThan(0)
    expect(screen.getByText('Hay cambios sin guardar.')).toBeTruthy()
  })

  it('en la pestaña Menú y ofertas, sin carta, no se puede pulsar', () => {
    montar({ tipo: 'negocio', slug: 'vanessa' })
    expect(screen.getByRole('tab', { name: 'Menú y ofertas' }).disabled).toBe(true)
    expect(screen.getByText('Este negocio no tiene carta.')).toBeTruthy()
  })

  it('con carta, su pestaña lleva a la carta', () => {
    const a = montar({ tipo: 'negocio', slug: 'almendra' })
    fireEvent.click(screen.getByRole('tab', { name: 'Menú y ofertas' }))
    expect(a.abrir).toHaveBeenCalledWith('carta:almendra')
  })
})

describe('Editor de una copia', () => {
  const copia = (extra = {}) => ({ base: 'almendra', cambios: {}, historial: [{ peticion: 'peluquería en Gràcia', resumen: 'Montada en rosa' }], ...extra })

  it('se abre con su información, cómo se creó y el botón Editar que lleva a Nuevo perfil', () => {
    const a = montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia() })
    expect(screen.getByText('Información de la copia')).toBeTruthy()
    expect(screen.getByText('peluquería en Gràcia')).toBeTruthy()
    expect(screen.getByText('Montada en rosa')).toBeTruthy()
    expect(screen.getByText('/demo/mi-copia')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(a.irANuevoPerfil).toHaveBeenCalledWith('negocio:mi-copia')
  })

  it('Exportar para cliente abre la hoja con la dirección y, con otra dirección, crea la página de cliente', async () => {
    const a = montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia() })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar para cliente' }))
    expect(screen.getByRole('heading', { name: 'Exportar para cliente' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'clienta-sol' } })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    // El nombre ya viene puesto (el de la copia), así que se puede exportar sin escribir nada
    await waitFor(() => expect(a.abrir).toHaveBeenCalledWith('negocio:clienta-sol'))
    const nueva = supa.llamadas.find(l => l.tipo === 'insert')
    expect(nueva.datos).toMatchObject({ tipo: 'negocio', slug: 'clienta-sol', base: 'almendra' })
    expect(nueva.datos.cambios._cliente).toBe(true)
  })

  it('"Usar esta misma copia" la marca como de cliente, sin crear otra', async () => {
    montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia() })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar para cliente' }))
    fireEvent.click(screen.getByRole('button', { name: /Usar esta misma copia/ }))
    await waitFor(() => expect(supa.llamadas.some(l => l.tipo === 'upsert')).toBe(true))
    expect(supa.llamadas.some(l => l.tipo === 'insert')).toBe(false)
    expect(supa.llamadas.find(l => l.tipo === 'upsert').datos.cambios._cliente).toBe(true)
  })

  it('una copia que ya es de cliente enseña su dirección corta y pregunta antes de volver a demo', async () => {
    montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia({ cambios: { _cliente: true } }) })
    expect(screen.getAllByText('/mi-copia').length).toBeGreaterThan(0)
    expect(screen.getByText(/No cambies nunca su dirección/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Volver a demo' }))
    const pregunta = screen.getByRole('dialog')
    expect(within(pregunta).getByText('¿Volver a demo?')).toBeTruthy()
    fireEvent.click(within(pregunta).getByRole('button', { name: 'Volver a demo' }))
    await waitFor(() => expect(supa.llamadas.some(l => l.tipo === 'upsert')).toBe(true))
    expect(supa.llamadas.find(l => l.tipo === 'upsert').datos.cambios._cliente).toBeUndefined()
  })

  it('el grupo: se crea uno nuevo escribiendo su nombre y se guarda en cambios._grupo', async () => {
    montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia() })
    fireEvent.change(screen.getByLabelText('Grupo'), { target: { value: '__nuevo' } })
    fireEvent.change(screen.getByPlaceholderText('Claudia Holguin'), { target: { value: '  Claudia  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))
    await waitFor(() => expect(supa.llamadas.some(l => l.tipo === 'upsert')).toBe(true))
    expect(supa.llamadas.find(l => l.tipo === 'upsert').datos.cambios._grupo).toBe('Claudia')
  })

  it('los grupos que ya existen en otras copias salen para elegir', () => {
    const filas = [{ cambios: { _grupo: 'Vanessa' } }, { cambios: { _grupo: 'Ana' } }, { cambios: {} }]
    montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia(), filas })
    const opciones = [...screen.getByLabelText('Grupo').querySelectorAll('option')].map(o => o.textContent)
    expect(opciones).toEqual(['Sin grupo', 'Ana', 'Vanessa', 'Nuevo grupo...'])
  })

  it('Borrar copia pregunta, y al confirmar la borra de ediciones y vuelve a la lista', async () => {
    const a = montar({ tipo: 'negocio', slug: 'mi-copia', fila: copia() })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar copia' }))
    const pregunta = screen.getByRole('dialog')
    expect(within(pregunta).getByText('¿Borrar esta copia?')).toBeTruthy()
    fireEvent.click(within(pregunta).getByRole('button', { name: 'Borrar' }))
    await waitFor(() => expect(a.volver).toHaveBeenCalled())
    expect(supa.llamadas).toEqual([{ tipo: 'delete', tabla: 'ediciones', datos: { tipo: 'negocio', slug: 'mi-copia' } }])
    expect(a.recargar).toHaveBeenCalled()
  })

  it('borrar la copia de una carta se lleva también su fila del panel del dueño', async () => {
    const a = montar({ tipo: 'carta', slug: 'mi-carta-copia', fila: copia({ base: 'tumi' }) })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar copia' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))
    await waitFor(() => expect(a.volver).toHaveBeenCalled())
    expect(supa.llamadas.map(l => l.tabla)).toEqual(['ediciones', 'cartas'])
  })
})

describe('Duplicar', () => {
  const abrirHoja = () => fireEvent.click(screen.getAllByRole('button', { name: 'Duplicar' })[0])

  it('la dirección se rellena sola con el nombre y Crear copia la inserta y la abre', async () => {
    const a = montar({ tipo: 'negocio', slug: 'almendra' })
    abrirHoja()
    const hoja = screen.getByRole('heading', { name: 'Duplicar para otro negocio' }).closest('form')
    fireEvent.change(hoja.querySelector('input[required]'), { target: { value: 'Peluquería Sol' } })
    expect(screen.getByLabelText('Dirección').value).toBe('peluqueria-sol')
    fireEvent.click(screen.getByRole('button', { name: 'Crear copia' }))
    await waitFor(() => expect(a.abrir).toHaveBeenCalledWith('negocio:peluqueria-sol'))
    const nueva = supa.llamadas.find(l => l.tipo === 'insert')
    expect(nueva.datos).toMatchObject({ tipo: 'negocio', slug: 'peluqueria-sol', base: 'almendra' })
    expect(nueva.datos.cambios.nombre).toBe('Peluquería Sol')
    expect(a.recargar).toHaveBeenCalled()
  })

  it('una dirección ya usada o reservada no se deja crear', () => {
    montar({ tipo: 'negocio', slug: 'almendra' })
    abrirHoja()
    const hoja = screen.getByRole('heading', { name: 'Duplicar para otro negocio' }).closest('form')
    fireEvent.change(hoja.querySelector('input[required]'), { target: { value: 'Laca' } })
    expect(screen.getByText('Esa dirección ya está en uso.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Crear copia' }).disabled).toBe(true)
    fireEvent.change(hoja.querySelector('input[required]'), { target: { value: 'Demo' } })
    expect(screen.getByRole('button', { name: 'Crear copia' }).disabled).toBe(true)
  })

  it('si ya hay una copia con esa dirección (error 23505) lo dice y no abre nada', async () => {
    supa.error = { code: '23505' }
    const a = montar({ tipo: 'negocio', slug: 'almendra' })
    abrirHoja()
    const hoja = screen.getByRole('heading', { name: 'Duplicar para otro negocio' }).closest('form')
    fireEvent.change(hoja.querySelector('input[required]'), { target: { value: 'Peluquería Sol' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear copia' }))
    await screen.findByText('Ya hay una copia con esa dirección.')
    expect(a.abrir).not.toHaveBeenCalled()
  })

  it('Cancelar cierra la hoja', () => {
    montar({ tipo: 'negocio', slug: 'almendra' })
    abrirHoja()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('heading', { name: 'Duplicar para otro negocio' })).toBeNull()
  })
})
