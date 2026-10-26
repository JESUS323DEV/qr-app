import { useState } from 'react'
import CampoColor from '../components/CampoColor'
import { Armchair, Beer, BookImage, Camera, ChevronDown, CircleUser, Coffee, Croissant, Fish, GalleryHorizontal, IdCard, LayoutGrid, Maximize, Minus, Newspaper, PanelTop, Pizza, Plus, RotateCcw, Scissors, Slice, Smartphone, Sparkles, UtensilsCrossed } from 'lucide-react'
import { cartas, marcaDe } from '../cartas'
import { CAMPO, Etiqueta } from '../components/panel'
import { DIBUJOS_MENU, GRUPOS_MENU } from '../lib/estilosMenu'
import { ICONOS_ESTRUCTURA } from '../lib/iconosEstructura'
import { HORARIOS } from '../lib/horarios'
import { COLORES_MINIWEB } from '../lib/coloresMiniweb'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { nombreInterno } from './comun'

/* Los paneles de ajustes de la miniweb: colores, estilo del menú, horario, carta que abre y estructura. */

/* ---------- Lista de todo ---------- */

/* Nuevo perfil: se elige la temática (pone el contenido de ejemplo: pestañas, fotos y textos), el producto
   (ficha, miniweb o carta), el diseño y la marca (nombre, colores y letra), viéndolo en un móvil. Al crearlo se
   guarda como una copia de la demo de esa temática con el diseño y la marca elegidos, y se abre en el editor.
   La vista previa enseña todo al momento: el contenido, el diseño y la marca (con la marca de prueba de lib/prueba.js). */
// Apartado de Nuevo perfil que se pliega: cerrado, el título y lo elegido; al tocarlo se abren las opciones
export function Plegable({ titulo, elegido, children, abierto = false }) {
  return (
    <details open={abierto} className="group rounded-[0.75rem] ring-1 ring-zinc-200">
      <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.7rem] [&::-webkit-details-marker]:hidden">
        <span className="text-[0.85rem] font-semibold text-zinc-500">{titulo}</span>
        <span className="ml-auto min-w-0 truncate text-[0.9rem] font-semibold">{elegido}</span>
        <ChevronDown className="h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">{children}</div>
    </details>
  )
}

// El icono de cada temática en la fila de Nuevo perfil
export const ICONOS_TEMA = {
  restaurante: UtensilsCrossed,
  bar: Beer,
  pizzeria: Pizza,
  'cocina-visual': Fish,
  cafeteria: Coffee,
  pasteleria: Croissant,
  peluqueria: Scissors,
  unas: Sparkles,
  barberia: Armchair,
}

/* El editor de colores de una miniweb (catálogo en lib/coloresMiniweb.js), por grupos: menú, redes, fondos, textos y botón. Cada color es
   un círculo con el color que se pinta ahora (con borde de rayitas si es el automático, el que se pone solo según el diseño); al
   tocarlo se abre el cuadro de colores y, elegido uno, aparece su código y un enlace para volver a automático.
   valores: lo elegido; autos: el color automático de cada rol; cambiar(clave, color) y cambiar(clave, undefined) para volver a él */
// detalle: en pantalla ancha (desde 1024 px), cada grupo de colores en un desplegable y, dentro, cada color en columna con su nombre, su ayuda, el círculo y el
// código, como en Personalizado (en móvil, solo los círculos). claves: si se da, solo esos colores
// extrasPorGrupo: contenido que va dentro de un grupo, por su nombre (por ejemplo el texto del botón en el grupo del botón)
// catalogo: los grupos de colores (por defecto, los de la miniweb); estilo: el estilo de carta elegido, para avisar de los colores que no usa
export function PanelColoresMiniweb({ valores, cambiar, autos = {}, sinTitulo = false, claves, detalle = false, extrasPorGrupo, catalogo = COLORES_MINIWEB, estilo }) {
  const grupos = (claves ? catalogo.map(g => ({ ...g, campos: g.campos.filter(c => claves.includes(c.clave)) })) : catalogo).filter(g => g.campos.length > 0)
  const sinUso = c => Boolean(estilo && c.estilos && !c.estilos.includes(estilo))
  return (
    <>
      {detalle && (
        <div className="hidden gap-[0.75rem] lg:grid">
          {grupos.map(g => (
            <Plegable
              key={g.grupo}
              titulo={g.grupo}
              elegido={
                <span className="flex justify-end gap-[0.25rem]">
                  {g.campos.map(c => (
                    <span key={c.clave} className="h-[1.1rem] w-[1.1rem] rounded-full ring-1 ring-zinc-300" style={{ background: valores[c.clave] ?? autos[c.clave] ?? '#FFFFFF' }} />
                  ))}
                </span>
              }
            >
              <div className="grid gap-[0.9rem]">
                {extrasPorGrupo?.[g.grupo]}
                {g.campos.map(c => {
                  const valor = valores[c.clave]
                  return (
                    <div key={c.clave} className="grid gap-[0.3rem]">
                      <div>
                        <p className="text-[0.8rem] font-semibold text-zinc-500">
                          {c.nombre}
                          {!valor && <span className="font-normal text-zinc-400"> · automático (aproximado)</span>}
                        </p>
                        <p className="text-[0.8rem] text-zinc-400">{c.ayuda}{sinUso(c) ? ' No se usa en este estilo, pero puedes cambiarlo.' : ''}</p>
                      </div>
                      <div className="flex items-center gap-[0.5rem]">
                        <div className="min-w-0 flex-1">
                          <CampoColor valor={valor ?? autos[c.clave] ?? '#FFFFFF'} cambiar={v => cambiar(c.clave, v)} />
                        </div>
                        {valor && (
                          <button type="button" title="Volver a automático" aria-label={`Volver a automático: ${c.nombre}`} onClick={() => cambiar(c.clave, undefined)} className="shrink-0 rounded-full p-[0.4rem] text-zinc-500 hover:text-zinc-900">
                            <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Plegable>
          ))}
        </div>
      )}
      <div className={`grid gap-[1rem] ${detalle ? 'lg:hidden' : 'lg:grid-cols-2 lg:items-start lg:gap-x-[1.75rem]'}`}>
        {!sinTitulo && <span className="text-[0.8rem] font-semibold text-zinc-500 lg:col-span-2">Colores</span>}
        {grupos.map(g => (
          <div key={g.grupo} className={`grid gap-[0.5rem] ${g.ancho ? 'lg:col-span-2' : ''}`}>
            <p className="text-[0.85rem] font-bold">{g.grupo}</p>
            {extrasPorGrupo?.[g.grupo]}
            <div className="flex flex-wrap items-start gap-x-[1.2rem] gap-y-[0.8rem]">
              {g.campos.map(c => {
                const valor = valores[c.clave]
                return (
                  <div key={c.clave} className="grid justify-items-center gap-[0.25rem]" title={c.ayuda}>
                    <p className="text-[0.8rem] font-semibold text-zinc-500">{c.corto}</p>
                    <CampoColor valor={valor ?? autos[c.clave] ?? '#FFFFFF'} auto={!valor} soloCirculo cambiar={v => cambiar(c.clave, v)} />
                    {valor && (
                      <button type="button" title="Volver a automático" aria-label={`Volver a automático: ${c.nombre}`} onClick={() => cambiar(c.clave, undefined)} className="rounded-full p-[0.2rem] text-zinc-500 hover:text-zinc-900">
                        <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// Las piezas que se pueden mover en una miniweb (hero.redesEn, hero.menuEn y hero.compartirEn), con su valor de siempre primero
const ESTRUCTURA_MINIWEB = [
  ['redesEn', 'Redes', [['arriba', 'Arriba'], ['lateral', 'Lateral'], ['medio', 'Medio'], ['abajo', 'Abajo']]],
  ['menuEn', 'Menú de navegación (Inicio, Menú, Horario...)', [['arriba', 'Arriba'], ['abajo', 'Abajo']]],
  ['compartirEn', 'Compartir', [['diseno', 'Como el diseño'], ['abajo', 'Junto al botón'], ['redes', 'En las redes']]],
  ['contactoEn', 'Contacto (Reservar, Cita, Encargos...)', [['boton', 'Botón de WhatsApp'], ['reserva', 'Formulario de reserva (restauración)'], ['cita', 'Formulario de cita (estética)']]],
]

export const ESTRUCTURA_DEFECTO = { redesVinculadas: false, redesEn: 'arriba', menuEn: 'arriba', compartirEn: 'diseno' }

// Esas piezas, cada una con sus opciones. valores: lo elegido (sin elegir, lo de siempre); cambiar(clave, valor)
// El estilo del menú de navegación de una miniweb, con subpestañas como Portada: un icono por grupo (De texto, Con forma) y, al tocarlo,
// los iconos de sus estilos; debajo, el nombre del elegido. valor: la clave de BARRAS o '' (la rayita de siempre)
export function FilaEstiloMenu({ valor, cambiar }) {
  const [abierta, setAbierta] = useState(true)
  const nombres = { '': 'La rayita (la de siempre)', ...Object.fromEntries(Object.entries(BARRAS).map(([clave, b]) => [clave, b.nombre])) }
  const grupo = GRUPOS_MENU.find(g => g.claves.includes(valor)) ?? GRUPOS_MENU[0]
  const icono = 'flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300'
  const dibujar = trazos => (
    <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: trazos }} />
  )
  return (
    <div className="grid gap-[0.45rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">Estilo del menú de navegación</span>
      <div className="flex flex-wrap items-center gap-[0.4rem]">
        {GRUPOS_MENU.map(g => (
          <button
            key={g.clave}
            type="button"
            title={g.nombre}
            aria-label={`Menú ${g.nombre}`}
            aria-pressed={grupo.clave === g.clave}
            onClick={() => {
              // Tocar otra vez el grupo elegido abre o cierra sus estilos; tocar otro, elige su primero
              if (grupo.clave === g.clave) setAbierta(v => !v)
              else {
                cambiar(g.claves[0])
                setAbierta(true)
              }
            }}
            className={`${icono} ${grupo.clave === g.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
          >
            {dibujar(g.dibujo)}
          </button>
        ))}
      </div>
      <p className="text-[0.85rem] font-semibold">{grupo.nombre}</p>
      {abierta && (
        <div className="grid gap-[0.4rem]">
          <div className="flex flex-wrap gap-[0.4rem]">
            {grupo.claves.map(clave => (
              <button
                key={clave || 'rayita'}
                type="button"
                title={nombres[clave]}
                aria-label={`Estilo ${nombres[clave]}`}
                aria-pressed={valor === clave}
                onClick={() => cambiar(clave)}
                className={`${icono} ${valor === clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
              >
                {dibujar(DIBUJOS_MENU[clave])}
              </button>
            ))}
          </div>
          <p className="text-[0.8rem] text-zinc-500">{nombres[valor]}</p>
        </div>
      )}
    </div>
  )
}

// El diseño del horario de una miniweb, con la fila de iconos de Portada (5 y un + en el móvil, todos en ordenador) y el nombre del elegido
// debajo. Al tocar el diseño elegido se abre o se cierra la lista de sus variantes (subpestañas). valor: la clave de lib/horarios.js o ''
// (la lista de siempre); variante: la clave de la variante ('clasica' es la primera)
export function FilaHorario({ valor, cambiar, variante, cambiarVariante }) {
  const [mas, setMas] = useState(false)
  const [abierta, setAbierta] = useState(true)
  const actual = valor || 'lista'
  const diseno = HORARIOS.find(h => h.clave === actual)
  const variantes = diseno?.variantes ?? []
  return (
    <div className="grid gap-[0.45rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">Diseño del horario</span>
      <div className="flex flex-wrap items-center gap-[0.4rem]">
        {HORARIOS.map((h, i) => (
          <button
            key={h.clave}
            type="button"
            title={h.nombre}
            aria-label={`Horario ${h.nombre}`}
            aria-pressed={actual === h.clave}
            onClick={() => {
              // Al tocar otra vez el diseño elegido, la lista de sus variantes se cierra o se abre; al elegir otro, vuelve a la primera
              if (actual === h.clave) setAbierta(v => !v)
              else {
                cambiar(h.clave === 'lista' ? '' : h.clave)
                cambiarVariante('clasica')
                setAbierta(true)
              }
            }}
            className={`${i >= 5 && !mas ? 'hidden lg:flex' : 'flex'} h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${actual === h.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
          >
            <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: h.dibujo }} />
          </button>
        ))}
        <button
          type="button"
          aria-label={mas ? 'Ver menos diseños' : 'Ver más diseños'}
          aria-expanded={mas}
          onClick={() => setMas(v => !v)}
          className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105 lg:hidden"
          style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
        >
          {mas ? <Minus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" />}
        </button>
      </div>
      <p className="text-[0.85rem] font-semibold">{diseno?.nombre}</p>
      {/* Las variantes del diseño elegido, como subpestañas con su icono */}
      {abierta && variantes.length > 0 && (
        <div className="grid gap-[0.4rem]">
          <div className="flex flex-wrap gap-[0.4rem]">
            {variantes.map(v => (
              <button
                key={v.clave}
                type="button"
                title={v.nombre}
                aria-label={`Variante ${v.nombre}`}
                aria-pressed={variante === v.clave}
                onClick={() => cambiarVariante(v.clave)}
                className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 ${variante === v.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
              >
                <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: v.dibujo }} />
              </button>
            ))}
          </div>
          <p className="text-[0.8rem] text-zinc-500">{variantes.find(v => v.clave === variante)?.nombre}</p>
        </div>
      )}
    </div>
  )
}

// La carta que pinta el menú de la miniweb: una de las cartas hechas (con su diseño) o, sin elegir, el menú propio de la miniweb
export function SelectorCartaMiniweb({ valor, cambiar, exportadas = [] }) {
  return (
    <Etiqueta texto="Carta del menú">
      <select value={valor ?? ''} onChange={e => cambiar(e.target.value || undefined)} className={CAMPO}>
        <option value="">El menú de la miniweb (el de siempre)</option>
        {cartas.map(c => (
          <option key={c.slug} value={c.slug}>
            {marcaDe(c)?.nombre ?? c.slug} ({c.diseno})
          </option>
        ))}
        {/* Las cartas que has diseñado y exportado para cliente (Exportar para cliente en su pantalla de información) */}
        {exportadas.map(f => (
          <option key={f.slug} value={f.slug}>
            {/* El nombre interno de la copia (el que solo ves tú); sin él, el de la marca */}
            {nombreInterno(f) ?? f.cambios?.['marca.nombre'] ?? f.cambios?.marca?.nombre ?? f.slug} ({f.cambios?.diseno ?? 'carta'}, exportada)
          </option>
        ))}
      </select>
    </Etiqueta>
  )
}

// contactoPorDefecto: lo que hace la miniweb si no se elige nada (las de comida, el formulario de reserva; las demás, el botón de WhatsApp)
export function EstructuraMiniweb({ valores, cambiar, sinTitulo = false, contactoPorDefecto = 'boton' }) {
  return (
    <div className="grid gap-[0.9rem] lg:grid-cols-2 lg:items-start lg:gap-x-[1.75rem]">
      {!sinTitulo && <span className="text-[0.8rem] font-semibold text-zinc-500 lg:col-span-2">Estructura: dónde va cada pieza</span>}
      {ESTRUCTURA_MINIWEB.map(([clave, texto, opciones]) => {
        // Los valores viejos de las redes ('barra' y 'boton') son 'arriba' y 'medio'
        const actual = clave === 'contactoEn' ? (valores[clave] === 'formulario' ? (contactoPorDefecto === 'reserva' ? 'reserva' : 'cita') : valores[clave] ?? contactoPorDefecto) : ({ barra: 'arriba', boton: 'medio' })[valores[clave]] ?? valores[clave] ?? ESTRUCTURA_DEFECTO[clave]
        // Con las redes vinculadas al menú, su sitio lo decide el menú: las opciones se bloquean
        const bloqueada = clave === 'redesEn' && Boolean(valores.redesVinculadas)
        return (
          <div key={clave} className={`grid gap-[0.4rem] ${clave === 'compartirEn' ? 'lg:col-span-2' : ''}`}>
            <span className="text-[0.8rem] text-zinc-500">{texto}</span>
            {/* Un icono por opción (un móvil con la pieza en su sitio) y, debajo, el nombre de la elegida */}
            <div className={`flex flex-wrap items-center gap-[0.4rem] ${bloqueada ? 'opacity-50' : ''}`}>
              {opciones.map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  title={etiqueta}
                  aria-label={`${texto}: ${etiqueta}`}
                  aria-pressed={actual === valor}
                  disabled={bloqueada}
                  onClick={() => cambiar(clave, valor)}
                  className={`flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 bg-white transition-transform duration-300 disabled:cursor-not-allowed ${actual === valor ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                >
                  <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONOS_ESTRUCTURA[clave]?.[valor] ?? '' }} />
                </button>
              ))}
            </div>
            <p className="text-[0.85rem] font-semibold">{opciones.find(([valor]) => valor === actual)?.[1]}</p>
            {/* Redes: pegarlas siempre al menú de navegación (debajo de él si está arriba y encima si está abajo) */}
            {clave === 'redesEn' && (
              <label className="flex cursor-pointer items-center gap-[0.5rem] text-[0.85rem] font-semibold">
                <input type="checkbox" checked={Boolean(valores.redesVinculadas)} onChange={e => cambiar('redesVinculadas', e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
                Vincular al menú de navegación
              </label>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Diseños de arriba que de momento no salen como portada de una miniweb
export const SIN_PORTADA_MINIWEB = ['banner', 'ficha', 'portada', 'historias']

// El nombre de cada diseño en la fila de Nuevo perfil: Diagonal se llama Cortes (tiene varios cortes)
export const nombreDeDiseno = clave => (clave === 'diagonal' ? 'Cortes' : clave === 'editorial' ? 'Formatos' : HEROS[clave]?.nombre)

// El icono de cada diseño de arriba en la fila de Nuevo perfil
export const ICONOS_DISENO = {
  editorial: Newspaper,
  banner: PanelTop,
  diagonal: Slice,
  fullbleed: Maximize,
  mosaico: LayoutGrid,
  portada: BookImage,
  retrato: CircleUser,
  ficha: IdCard,
  galeria: GalleryHorizontal,
  polaroid: Camera,
  historias: Smartphone,
}
