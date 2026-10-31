import { useMemo } from 'react'
import CampoColor from '../components/CampoColor'
import { tipoComun } from '../fichas/escenas'
import { ChevronDown, ImagePlus, Plus, X } from 'lucide-react'
import { aplicar } from '../lib/ediciones'
import { CAMPO } from '../components/panel'
import { leerReferencia } from '../asistente/referencia'
import { CampoFoto } from './Campos'
import { MAX_PESTANA, camposDe, leerRuta, nombreElemento, organizar } from './datos'

/* Los editores de textos, imágenes y horas de cada pestaña, y el editor en bruto de los datos de una página. */

/* Un bloque del editor (Datos, Arriba, una pestaña, una sección de la carta...): sus campos sueltos, sus tarjetas
   (cada foto con su nombre, cada plato con su precio...) y lo técnico plegado en "Más opciones" */
export function Bloque({ bloque, abierto, campo }) {
  return (
    <details open={abierto} className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">{bloque.titulo}</summary>
      <div className="grid gap-[1rem] px-[1rem] py-[1rem]">
        {bloque.sueltos.map(c => campo(c))}

        {bloque.tarjetas.map(t => (
          <div key={t.clave} className="grid gap-[0.7rem] rounded-[0.8rem] bg-zinc-50 p-[0.8rem] ring-1 ring-zinc-200">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <p className="min-w-0 truncate text-[0.9rem] font-bold">{t.titulo}</p>
              {campo.tarjetaCambiada(t) && (
                <button type="button" onClick={() => campo.volverTarjeta(t)} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                  Volver al original
                </button>
              )}
            </div>
            {t.campos.map(c => campo(c, true))}
          </div>
        ))}

        {bloque.tecnicos.length > 0 && (
          <details className="rounded-[0.8rem] ring-1 ring-zinc-200">
            <summary className="cursor-pointer px-[0.8rem] py-[0.6rem] text-[0.88rem] font-semibold text-zinc-600">Más opciones</summary>
            <div className="grid gap-[0.9rem] px-[0.8rem] pb-[0.8rem] pt-[0.3rem]">{bloque.tecnicos.map(c => campo(c))}</div>
          </details>
        )}
      </div>
    </details>
  )
}

// Cuántas fotos usa la portada de cada diseño en la pestaña Inicio: Retrato, la del fondo y tres abajo; Polaroid y Galería, cuatro;
// Mosaico, tres que rotan; Fullbleed y Editorial, tres que pasan. Cortes (Diagonal) usa una sola
export const FOTOS_PORTADA = { retrato: 4, polaroid: 4, galeria: 4, mosaico: 3, fullbleed: 3, editorial: 3 }

// Cuántas fotos admite cada diseño en Inicio, de un mínimo a un máximo (con X para quitar y Añadir foto en Imágenes); los demás, un número fijo
const RANGO_FOTOS = { galeria: [1, 8], fullbleed: [2, 8], editorial: [2, 8], polaroid: [1, 4] }

// Completa las fotos de una pestaña de Inicio hasta las que pide su portada, repitiendo las que hay (son de relleno: se cambian en Imágenes).
// Sin ninguna foto, no hay con qué rellenar y se deja como está
export function conFotosDePortada(pestana, cuantas) {
  const base = pestana?.fotos?.length ? pestana.fotos : pestana?.foto ? [{ src: pestana.foto, alt: '' }] : []
  if (!cuantas || !base.length || base.length >= cuantas) return pestana
  const fotos = [...base]
  for (let i = 0; fotos.length < cuantas; i++) fotos.push({ ...base[i % base.length] })
  return { ...pestana, fotos }
}

// El texto extra con el que empiezan Editorial, Cortes (Diagonal) y Fullbleed
export const TEXTO_EXTRA_EJEMPLO = 'De martes a domingo, de 13:00 a 23:00'

/* Todos los datos editables de la página, en bruto: los mismos desplegables del editor de un perfil (Pestaña Inicio, Reseña de Google, Redes,
   Carrusel...), para tocar cualquier cosa de la miniweb o la ficha que se está montando. original: los datos sin estos cambios; cambios: los de
   aquí (ruta → valor); cambiar(ruta, valor). El editor de un perfil sigue como está: esto es una copia de su forma de enseñarlos */
// soloBloques: si se da, solo esos bloques (por su título, abiertos) y sin Ajustes personalizados: las pestañas de ajustes por grupo enseñan los suyos
export function EditorEnBruto({ original, cambios, cambiar, soloBloques, soloAjustes = false }) {
  const porFuncion = typeof soloBloques === 'function'
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const campos = useMemo(() => camposDe(datos), [datos])
  const bloques = useMemo(() => organizar(datos, campos), [datos, campos])
  const campo = (c, enTarjeta = false) => {
    const valor = leerRuta(datos, c.ruta) ?? ''
    const cambiado = c.ruta in cambios
    return (
      <div key={c.ruta} className="grid gap-[0.3rem]">
        <div className="flex items-baseline justify-between gap-[0.75rem]">
          <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
          {cambiado && !enTarjeta && (
            <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
              Volver al original
            </button>
          )}
        </div>
        {c.clase === 'color' ? (
          <CampoColor valor={valor} cambiar={v => cambiar(c.ruta, v)} />
        ) : c.clase === 'foto' ? (
          <CampoFoto valor={valor} cambiar={v => cambiar(c.ruta, v)} carpeta="negocio/nuevo" sugerencia={datos.sector ?? ''} />
        ) : c.clase === 'largo' ? (
          <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
        ) : (
          <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
        )}
      </div>
    )
  }
  campo.volverTarjeta = t => t.campos.forEach(c => cambiar(c.ruta, leerRuta(original, c.ruta)))
  campo.tarjetaCambiada = t => t.campos.some(c => c.ruta in cambios)
  // soloAjustes: todo lo que no tiene su pestaña (menos Redes y Reseña de Google, que ya están en las suyas), cerrado y sin desplegable propio
  if (soloAjustes) {
    return (
      <div className="grid gap-[0.75rem]">
        {bloques.filter(b => !['Redes', 'Reseña de Google'].includes(b.titulo)).map(b => (
          <Bloque key={b.clave} bloque={b} abierto={false} campo={campo} />
        ))}
      </div>
    )
  }
  if (soloBloques) {
    const elegidos = bloques.filter(b => (porFuncion ? soloBloques(b, datos) : soloBloques.includes(b.titulo)))
    if (!elegidos.length) return null
    return (
      <div className="grid gap-[0.75rem]">
        {elegidos.map(b => (
          <Bloque key={b.clave} bloque={b} abierto={!porFuncion} campo={campo} />
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-[0.75rem]">
      {/* Redes y Reseña de Google, tal cual */}
      {bloques
        .filter(b => ['Redes', 'Reseña de Google'].includes(b.titulo))
        .map(b => (
          <Bloque key={b.clave} bloque={b} abierto={false} campo={campo} />
        ))}
      {/* Debajo, Ajustes personalizados: todo lo demás del editor de un perfil (Datos, Arriba, Colores de la marca, las pestañas, Tarjeta destacada, Carrusel...), para los ajustes que aún no están extraídos */}
      <details className="group/ajustes rounded-[0.75rem] ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
          <span className="text-[1rem] font-bold">Ajustes personalizados</span>
          <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/ajustes:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-[0.75rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          {bloques
            .filter(b => !['Redes', 'Reseña de Google'].includes(b.titulo))
            .map(b => (
              <Bloque key={b.clave} bloque={b} abierto={false} campo={campo} />
            ))}
        </div>
      </details>
    </div>
  )
}

/* Las imágenes de la página, solo ellas, por pestaña (Inicio, Menú, Horario...): para cada una, su miniatura con el buscador de fotos y el
   botón de subir la tuya. Salen de los mismos datos que los desplegables en bruto (original y cambios, con cambiar(ruta, valor)) */
// tipos: si se da, solo las imágenes de las pestañas de esos tipos (las pestañas de ajustes por grupo enseñan las de su página)
// soloOtras: solo las imágenes que no son de ninguna pestaña (un logo suelto...)
export function ImagenesPorPestana({ original, cambios, cambiar, tipos, soloOtras = false }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const grupos = useMemo(() => {
    const pestanas = datos.hero?.pestanas ?? []
    // Las páginas de contacto (con el botón de WhatsApp) y de precios llevan una foto en franja aunque la pestaña aún no tenga el dato foto: se enseña su fila igualmente, para poder cambiarla
    const contactoEn = datos.hero?.contactoEn
    // Pedir cita con el botón de WhatsApp (PaginaCita) ya no lleva foto: no se enseña su fila
    const sinFotoPropia = i => pestanas[i]?.tipo === 'cita' && (contactoEn === undefined || contactoEn === 'boton')
    const sinFoto = pestanas.flatMap((p, i) => {
      if (!p || typeof p !== 'object' || 'foto' in p || sinFotoPropia(i)) return []
      const comun = tipoComun(p.tipo)
      const llevaFoto = p.tipo === 'horario' || (p.tipo === 'reservar' ? contactoEn === 'boton' : comun === 'contacto' ? contactoEn === undefined || contactoEn === 'boton' : comun === 'precios')
      // Sin foto guardada, la pestaña enseña la primera de Inicio: esa es la que se ve en su fila hasta que se cambie
      const inicio = pestanas.find(x => x?.tipo === 'inicio')
      const porDefecto = inicio?.fotos?.[0]?.src ?? inicio?.foto ?? ''
      return llevaFoto ? [{ ruta: `hero.pestanas.${i}.foto`, clase: 'foto', grupo: 'Hero y pestañas', etiqueta: `Pestaña ${nombreElemento(pestanas, i)} · Foto`, porDefecto }] : []
    })
    const fotos = [
      ...camposDe(datos).filter(c => {
        if (c.clase !== 'foto') return false
        const m = c.ruta.match(/^hero\.pestanas\.(\d+)\./)
        return !(m && sinFotoPropia(Number(m[1])))
      }),
      ...sinFoto,
    ]
    const porPestana = new Map()
    const otras = []
    // Una carta (con secciones): sus fotos por zonas, la portada, el menú del día, las ofertas y cada sección con sus platos
    const deCarta = Array.isArray(datos.secciones)
    const zonas = new Map()
    const zonaDe = ruta => {
      const [primero, indice] = ruta.split('.')
      if (primero === 'foto') return ['0', 'Foto de fondo']
      if (primero === 'menuDia') return ['1', 'Menú del día']
      if (primero === 'ofertas') return ['2', 'Ofertas']
      if (primero === 'secciones') return [`3-${indice}`, datos.secciones[Number(indice)]?.nombre ?? `Sección ${Number(indice) + 1}`]
      return ['9', 'Otras imágenes']
    }
    // Con lista de fotos en las ofertas (ofertas.fotos), los estilos usan la lista y la "Foto" suelta no se ve: no se enseña
    const hayListaOfertas = Array.isArray(datos.ofertas?.fotos) && datos.ofertas.fotos.length > 0
    for (const c of fotos) {
      if (hayListaOfertas && c.ruta === 'ofertas.foto') continue
      const m = c.ruta.match(/^hero\.pestanas\.(\d+)\./)
      if (m) porPestana.set(Number(m[1]), [...(porPestana.get(Number(m[1])) ?? []), c])
      else if (deCarta) {
        const [clave, titulo] = zonaDe(c.ruta)
        zonas.set(clave, { clave, titulo, campos: [...(zonas.get(clave)?.campos ?? []), c] })
      } else otras.push(c)
    }
    // En Menú y ofertas solo se cambian las fotos del menú del día y de las ofertas, y la del fondo cuando el estilo es Inmersiva (la única que la pinta); no las secciones de la carta de platos (zonas '3-...')
    if (deCarta) return [...zonas.values()].filter(z => (z.clave !== '0' || datos.diseno === 'inmersiva') && !z.clave.startsWith('3-')).sort((x, y) => x.clave.localeCompare(y.clave, 'es', { numeric: true }))
    const todos = [
      ...[...porPestana.entries()].sort((a, b) => a[0] - b[0]).map(([i, campos]) => ({ clave: `p${i}`, titulo: pestanas[i]?.texto ?? `Pestaña ${i + 1}`, campos })),
      ...(otras.length ? [{ clave: 'otras', titulo: 'Otras imágenes', campos: otras }] : []),
    ]
    if (soloOtras) return todos.filter(g => g.clave === 'otras')
    // La pestaña Inicio es la primera (en las miniwebs que vienen de una ficha, su tipo es el de fotos y no 'inicio')
    return tipos ? todos.filter(g => g.clave.startsWith('p') && (tipos.includes(pestanas[Number(g.clave.slice(1))]?.tipo) || (tipos.includes('inicio') && Number(g.clave.slice(1)) === 0))) : todos
  }, [datos, tipos?.join(','), soloOtras]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!grupos.length) return tipos || soloOtras ? null : <p className="text-[0.8rem] text-zinc-500">Esta página no tiene imágenes que cambiar.</p>
  // Las fotos de Inicio (hero.pestanas.0.fotos) pueden ser más o menos según el diseño: se quitan con la X y se añaden con Añadir foto.
  // Se guarda la lista entera (con lo ya cambiado) y se quitan los cambios sueltos de cada foto, que ya no valdrían
  const listaInicio = datos.hero?.pestanas?.[0]?.fotos
  const rango = RANGO_FOTOS[datos.hero?.portada]
  const puedeEditarLista = Boolean(rango && Array.isArray(listaInicio) && listaInicio.length > 0 && listaInicio.every(f => f && typeof f === 'object'))
  const guardarLista = nuevas => {
    for (const ruta of Object.keys(cambios)) {
      if (ruta.startsWith('hero.pestanas.0.fotos.')) cambiar(ruta, leerRuta(original, ruta))
    }
    cambiar('hero.pestanas.0.fotos', nuevas)
  }
  const quitarFoto = i => guardarLista(listaInicio.filter((_, k) => k !== i))
  const anadirFoto = () => guardarLista([...listaInicio, { ...listaInicio[0] }])
  // Las fotos de las ofertas de una carta (ofertas.fotos, direcciones sueltas): de dos en dos (la galería las enseña por parejas), hasta 6
  const MAX_FOTOS_OFERTAS = 6
  const fotosOfertas = Array.isArray(datos.secciones) && datos.ofertas ? (Array.isArray(datos.ofertas.fotos) ? datos.ofertas.fotos : datos.ofertas.foto ? [datos.ofertas.foto] : []) : null
  const guardarFotosOfertas = nuevas => {
    for (const ruta of Object.keys(cambios)) {
      if (ruta.startsWith('ofertas.fotos.')) cambiar(ruta, leerRuta(original, ruta))
    }
    cambiar('ofertas.fotos', nuevas)
  }
  return (
    <div className="grid gap-[1.1rem]">
      {grupos.map(g => (
        <div key={g.clave} className="grid gap-[0.7rem]">
          <p className="text-[0.95rem] font-bold">{g.titulo}</p>
          {g.campos.map(c => (
            <div key={c.ruta} className="grid gap-[0.3rem]">
              <div className="flex items-baseline justify-between gap-[0.75rem]">
                <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
                {c.ruta in cambios && (
                  <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                    Volver al original
                  </button>
                )}
              </div>
              <CampoFoto
                valor={leerRuta(datos, c.ruta) ?? c.porDefecto ?? ''}
                cambiar={v => cambiar(c.ruta, v)}
                carpeta="negocio/nuevo"
                sugerencia={datos.sector ?? ''}
                quitar={(() => {
                  const m = c.ruta.match(/^hero\.pestanas\.0\.fotos\.(\d+)\.src$/)
                  const o = c.ruta.match(/^ofertas\.fotos\.(\d+)$/)
                  // Las fotos de las ofertas se añaden y se quitan de dos en dos (botones de abajo), sin X suelta
                  if (o) return undefined
                  return puedeEditarLista && m && listaInicio.length > rango[0] ? () => quitarFoto(Number(m[1])) : undefined
                })()}
              />
            </div>
          ))}
          {/* Fotos de las ofertas, de dos en dos (hasta 6): las nuevas empiezan repitiendo las primeras, para cambiarlas con Buscar o Subir.
              Si hay un número impar, el primer botón añade solo una para completar la pareja */}
          {g.clave === '2' && fotosOfertas && fotosOfertas.length > 0 && (
            <div className="flex flex-wrap gap-[0.5rem]">
              {fotosOfertas.length < MAX_FOTOS_OFERTAS && (
                <button
                  type="button"
                  onClick={() => guardarFotosOfertas([...fotosOfertas, ...(fotosOfertas.length % 2 ? [fotosOfertas[0]] : [fotosOfertas[0], fotosOfertas[1] ?? fotosOfertas[0]])])}
                  className="inline-flex items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500"
                >
                  <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
                  {fotosOfertas.length % 2 ? 'Completar la pareja' : 'Añadir dos fotos'}
                </button>
              )}
              {fotosOfertas.length > 2 && (
                <button
                  type="button"
                  onClick={() => guardarFotosOfertas(fotosOfertas.slice(0, fotosOfertas.length % 2 ? fotosOfertas.length - 1 : fotosOfertas.length - 2))}
                  className="inline-flex items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500"
                >
                  <X className="h-[1rem] w-[1rem]" aria-hidden="true" />
                  {fotosOfertas.length % 2 ? 'Quitar la última' : 'Quitar las dos últimas'}
                </button>
              )}
            </div>
          )}
          {/* Añadir una foto más a Inicio, hasta el máximo del diseño: empieza repitiendo la primera, para cambiarla con Buscar o Subir */}
          {g.clave === 'p0' && puedeEditarLista && listaInicio.length < rango[1] && (
            <button type="button" onClick={anadirFoto} className="inline-flex items-center gap-[0.4rem] justify-self-start rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300">
              <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
              Añadir foto
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/* Las horas de una línea del horario: se escriben como texto ("13:00 a 16:30 y 20:00 a 23:30" o "Cerrado"), y aquí se editan con selectores de
   hora (desde y hasta, uno o dos tramos) y una casilla de Cerrado. Si el texto no se puede entender como horas (por ejemplo, "Con cita
   previa"), se edita como texto normal */
const TRAMO_HORAS = /(\d{1,2}):(\d{2})\s*(?:a|-|–)\s*(\d{1,2}):(\d{2})/g

const dosCifras = (h, m) => `${String(h).padStart(2, '0')}:${m}`

const leerHoras = texto => {
  const t = texto.trim()
  if (/^cerrad/i.test(t)) return { cerrado: true, tramos: [] }
  const tramos = [...t.matchAll(TRAMO_HORAS)].map(m => ({ d: dosCifras(m[1], m[2]), h: dosCifras(m[3], m[4]) }))
  // Solo vale si, quitados los tramos, no queda más que "y" y separadores
  const resto = t.replace(TRAMO_HORAS, '').replace(/[\sy,]/g, '')
  return tramos.length && !resto ? { cerrado: false, tramos } : null
}

const escribirHoras = ({ cerrado, tramos }) => (cerrado || !tramos.length ? 'Cerrado' : tramos.map(t => `${t.d} a ${t.h}`).join(' y '))

function HorasLinea({ valor, cambiar }) {
  const horas = leerHoras(valor)
  if (!horas) return <input value={valor} onChange={e => cambiar(e.target.value)} className={CAMPO} />
  const poner = nuevo => cambiar(escribirHoras(nuevo))
  const hora = 'h-[2.4rem] w-[6.2rem] rounded-[0.5rem] border border-zinc-300 bg-white px-[0.4rem] text-[0.9rem]'
  const cambiarTramo = (k, campo, v) => poner({ ...horas, tramos: horas.tramos.map((t, n) => (n === k ? { ...t, [campo]: v || t[campo] } : t)) })
  return (
    <div className="flex flex-wrap items-center gap-x-[0.7rem] gap-y-[0.4rem]">
      {horas.cerrado ? (
        <span className="text-[0.88rem] font-semibold text-zinc-500">Cerrado</span>
      ) : (
        horas.tramos.map((t, k) => (
          <div key={k} className="flex items-center gap-[0.3rem]">
            <input type="time" value={t.d} onChange={e => cambiarTramo(k, 'd', e.target.value)} className={hora} aria-label="Desde" />
            <span className="text-[0.85rem] text-zinc-500">a</span>
            <input type="time" value={t.h} onChange={e => cambiarTramo(k, 'h', e.target.value)} className={hora} aria-label="Hasta" />
            {horas.tramos.length > 1 && (
              <button type="button" aria-label="Quitar este tramo" onClick={() => poner({ ...horas, tramos: horas.tramos.filter((_, n) => n !== k) })} className="rounded-full p-[0.25rem] text-zinc-500 hover:text-zinc-900">
                <X className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.5} aria-hidden="true" />
              </button>
            )}
          </div>
        ))
      )}
      {!horas.cerrado && horas.tramos.length < 2 && (
        <button type="button" onClick={() => poner({ ...horas, tramos: [...horas.tramos, { d: '20:00', h: '23:00' }] })} className="rounded-full bg-zinc-100 px-[0.7rem] py-[0.3rem] text-[0.8rem] font-semibold text-zinc-600 hover:bg-zinc-200">
          + Otro tramo
        </button>
      )}
      <label className="flex cursor-pointer items-center gap-[0.35rem] text-[0.85rem] font-semibold">
        <input
          type="checkbox"
          checked={horas.cerrado}
          onChange={e => poner({ cerrado: e.target.checked, tramos: horas.tramos.length ? horas.tramos : [{ d: '10:00', h: '14:00' }] })}
          className="h-[1.1rem] w-[1.1rem]"
        />
        Cerrado
      </label>
    </div>
  )
}

/* Todos los textos editables de la pestaña del Horario: el título, la nota, la dirección... y cada línea de días y horas (el día como texto y las
   horas con selectores). Sin fotos ni el nombre de la pestaña en la barra. Salen de los mismos datos que los desplegables en bruto (original y
   cambios, con cambiar(ruta, valor)) */
export function TextosHorario({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const i = (datos.hero?.pestanas ?? []).findIndex(p => p.tipo === 'horario')
  const campos = useMemo(() => {
    if (i < 0) return []
    return camposDe(datos).filter(
      c => c.ruta.startsWith(`hero.pestanas.${i}.`) && (c.clase === 'texto' || c.clase === 'largo') && !c.ruta.endsWith('.texto') && !c.ruta.includes('.lineas.'),
    )
  }, [datos, i])
  if (i < 0) return <p className="text-[0.8rem] text-zinc-500">Esta página no tiene pestaña de horario.</p>
  const lineas = datos.hero.pestanas[i].lineas ?? []
  const volver = ruta => (
    <button type="button" onClick={() => cambiar(ruta, leerRuta(original, ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
      Volver al original
    </button>
  )
  return (
    <div className="grid gap-[1rem]">
      {campos.map(c => {
        const valor = leerRuta(datos, c.ruta) ?? ''
        return (
          <div key={c.ruta} className="grid gap-[0.3rem]">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
              {c.ruta in cambios && volver(c.ruta)}
            </div>
            {c.clase === 'largo' ? (
              <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
            ) : (
              <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
            )}
          </div>
        )
      })}
      {lineas.length > 0 && (
        <div className="grid gap-[0.7rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Líneas del horario</p>
          {lineas.map((l, j) => {
            const rutaDias = `hero.pestanas.${i}.lineas.${j}.dias`
            const rutaHoras = `hero.pestanas.${i}.lineas.${j}.horas`
            return (
              <div key={j} className="grid gap-[0.4rem] rounded-[0.8rem] bg-zinc-50 p-[0.8rem] ring-1 ring-zinc-200">
                <div className="flex items-baseline justify-between gap-[0.75rem]">
                  <span className="text-[0.78rem] text-zinc-500">Días</span>
                  {(rutaDias in cambios || rutaHoras in cambios) && (
                    <button
                      type="button"
                      onClick={() => {
                        cambiar(rutaDias, leerRuta(original, rutaDias))
                        cambiar(rutaHoras, leerRuta(original, rutaHoras))
                      }}
                      className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]"
                    >
                      Volver al original
                    </button>
                  )}
                </div>
                <input value={l.dias ?? ''} onChange={e => cambiar(rutaDias, e.target.value)} className={CAMPO} />
                <span className="text-[0.78rem] text-zinc-500">Horas</span>
                <HorasLinea valor={l.horas ?? ''} cambiar={v => cambiar(rutaHoras, v)} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Un campo para subir una imagen al asistente (solo la lee): botón con su texto o, subida, su miniatura (con los colores que ha sacado, si los
// saca) y una x para quitarla. valor: { imagen, tipo, miniatura, colores } o null
export function CampoImagenAsistente({ titulo, valor, cambiar, conColores = false, bloqueado, avisar }) {
  if (valor)
    return (
      <div className="flex items-center gap-[0.5rem]">
        <img src={valor.miniatura} alt={titulo} className="h-[2.75rem] w-[2.75rem] rounded-[0.5rem] border border-zinc-300 object-contain" />
        {conColores && valor.colores.length > 0 && (
          <div className="flex items-center gap-[0.25rem]" aria-label="Colores que ha sacado de la imagen">
            {valor.colores.map(c => (
              <span key={c.hex} title={`${c.hex} (${c.porcentaje}%)`} className="h-[1.4rem] w-[1.4rem] rounded-full ring-1 ring-zinc-300" style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <button type="button" aria-label={`Quitar: ${titulo}`} onClick={() => cambiar(null)} className="rounded-full p-[0.25rem] text-zinc-500 hover:text-zinc-900">
          <X className="h-[1rem] w-[1rem]" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    )
  return (
    <label className={`inline-flex min-h-[2.5rem] cursor-pointer items-center gap-[0.4rem] rounded-[0.6rem] bg-white px-[0.9rem] text-[0.9rem] font-semibold ring-1 ring-zinc-300 ${bloqueado ? 'pointer-events-none opacity-50' : ''}`}>
      <ImagePlus className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      {titulo}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={async e => {
          const archivo = e.target.files?.[0]
          e.target.value = ''
          if (!archivo) return
          try {
            cambiar(await leerReferencia(archivo, { colores: conColores }))
          } catch (err) {
            avisar(err.message)
          }
        }}
      />
    </label>
  )
}

// Los nombres de las pestañas del menú (Inicio, Menú, Horario, Reservar...): un campo por pestaña, de 10 caracteres como mucho para que quepan.
// Salen de los mismos datos que los desplegables en bruto (original y cambios, con cambiar(ruta, valor))
const NOMBRE_DE_TIPO = { inicio: 'Inicio', menu: 'Menú', servicios: 'Servicios', horario: 'Horario', reservar: 'Reservar' }

export function TextosPestanas({ original, cambios, cambiar }) {
  const datos = useMemo(() => aplicar(original, cambios), [original, cambios])
  const pestanas = datos.hero?.pestanas ?? []
  if (!pestanas.length) return <p className="text-[0.8rem] text-zinc-500">Esta página no tiene pestañas.</p>
  return (
    <div className="grid gap-[0.9rem]">
      <p className="text-[0.8rem] text-zinc-500">El nombre que sale en el menú de navegación. Corto, de una o dos palabras.</p>
      {pestanas.map((p, i) => {
        const ruta = `hero.pestanas.${i}.texto`
        const valor = p.texto ?? ''
        return (
          <div key={ruta} className="grid gap-[0.3rem]">
            <div className="flex items-baseline justify-between gap-[0.75rem]">
              <span className="text-[0.8rem] font-semibold text-zinc-500">{NOMBRE_DE_TIPO[p.tipo] ?? `Pestaña ${i + 1}`}</span>
              {ruta in cambios && (
                <button type="button" onClick={() => cambiar(ruta, leerRuta(original, ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                  Volver al original
                </button>
              )}
            </div>
            <input value={valor} maxLength={MAX_PESTANA} onChange={e => cambiar(ruta, e.target.value)} className={CAMPO} />
            <span className="justify-self-end text-[0.75rem] text-zinc-500">
              {valor.length}/{MAX_PESTANA}
            </span>
          </div>
        )
      })}
    </div>
  )
}
