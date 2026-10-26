import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, QrCode } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getNegocio, negocios, rutaNegocio } from '../negocios'
import { cartas, getCarta, marcaDe, rutaCarta } from '../cartas'
import { Confirmar } from '../components/panel'
import { PLANTILLAS } from '../plantillas'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { FAMILIAS } from '../familias'
import { nombreInterno } from './comun'
import { MoverCopias, NuevoGrupo } from './Grupos'
import { CambiarQR, CopiasQR, EditorClientes, PedirNombre, QRSuelto } from './Qr'
import { NuevoPerfil } from './NuevoPerfil'

/* La lista de /admin: copias para enseñar, carpetas y grupos, copias de QR y editor de clientes. */

export function Lista({ filas, abrir, recargar, copia }) {
  const editadas = new Set((filas ?? []).map(f => `${f.tipo}:${f.slug}`))
  // Las copias marcadas con su casilla (para moverlas a un grupo)
  const [marcadas, setMarcadas] = useState([])
  // Copias de fichas, miniwebs y cartas, con el nombre que les has puesto
  const copias = (filas ?? [])
    .filter(f => f.base)
    .map(f =>
      f.tipo === 'carta'
        ? {
            ...f,
            nombre: nombreInterno(f) ?? f.cambios?.['marca.nombre'] ?? f.cambios?.marca?.nombre ?? f.slug,
            detalle: `Carta, copia de ${marcaDe(getCarta(f.base) ?? {})?.nombre ?? f.base}`,
            ruta: `/demo/${f.slug}/carta`,
          }
        : { ...f, nombre: nombreInterno(f) ?? f.cambios?.nombre ?? f.slug, detalle: `Copia de ${getNegocio(f.base)?.nombre ?? f.base}`, ruta: f.cambios?._cliente ? `/${f.slug}` : `/demo/${f.slug}` },
    )

  /* La ficha de una copia en una fila (en vez de "Copia de ..."): una rueda partida con sus dos colores (principal y acento), el producto, su
     diseño (la portada de una miniweb o el estilo de una carta) y su temática. Las copias antiguas, sin ficha, siguen con su texto de siempre */
  const infoCopia = f => {
    const i = f.cambios?._nuevoPerfil
    if (!i) return null
    const esCarta = f.tipo === 'carta'
    const datos = esCarta ? getCarta(f.base) : getNegocio(f.base)
    const colores = (esCarta ? marcaDe(datos ?? {}) : datos)?.theme?.colors
    const a = i.principal || colores?.primary
    const b = i.acento || colores?.accent
    const producto = esCarta ? (i.tipoCarta === 'promociones' ? 'Ofertas' : 'Menú del día') : 'Miniweb'
    const diseno = esCarta ? Object.values(FAMILIAS).find(x => x.carta === i.estilo)?.nombre : HEROS[i.hero]?.nombre
    const tematica = PLANTILLAS.find(p => p.clave === i.tema)?.nombre
    // La carta que pinta el menú de una miniweb: una de las hechas, una exportada o, sin elegir, el menú propio de la miniweb
    const cartaDelMenu = !esCarta
      ? i.cartaMini
        ? `Carta: ${(getCarta(i.cartaMini) ? marcaDe(getCarta(i.cartaMini))?.nombre : null) ?? (filas ?? []).find(x => x.tipo === 'carta' && x.slug === i.cartaMini)?.cambios?.['marca.nombre'] ?? i.cartaMini}`
        : 'Menú propio'
      : null
    // Con nombre interno, el del negocio pasa aquí abajo como un dato más
    const nombreNegocio = i.etiqueta?.trim() ? (esCarta ? f.cambios?.['marca.nombre'] ?? f.cambios?.marca?.nombre : f.cambios?.nombre) : null
    // La última vez que se guardó
    const modificada = f.actualizado ? new Date(f.actualizado).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' }) : null
    return (
      <span className="flex flex-wrap items-center gap-x-[0.5rem]">
        {a && b && <span aria-hidden="true" className="inline-block h-[0.95rem] w-[0.95rem] shrink-0 rounded-full ring-1 ring-black/25" style={{ background: `conic-gradient(${a} 0 50%, ${b} 0 100%)` }} />}
        {[producto, diseno, tematica, nombreNegocio && `Nombre: ${nombreNegocio}`, cartaDelMenu, modificada && `Modificada ${modificada}`].filter(Boolean).join(' · ')}
      </span>
    )
  }

  const Fila = ({ clave, nombre, detalle, info, ruta, marcable }) => (
    <li key={clave} className="flex items-center gap-[0.75rem] border-b border-zinc-200 last:border-b-0">
      {marcable && (
        <input
          type="checkbox"
          aria-label={`Marcar ${nombre}`}
          checked={marcadas.includes(clave)}
          onChange={() => setMarcadas(m => (m.includes(clave) ? m.filter(x => x !== clave) : [...m, clave]))}
          className="h-[1.1rem] w-[1.1rem] shrink-0 accent-zinc-900"
        />
      )}
      <button type="button" onClick={() => abrir(clave)} className="min-w-0 flex-1 py-[0.8rem] text-left">
        <span className="block truncate font-semibold">{nombre}</span>
        <span className="block text-[0.82rem] text-zinc-500">
          {info ?? (
            <>
              {detalle}
              {editadas.has(clave) ? ' · con cambios' : ''}
            </>
          )}
        </span>
      </button>
      <Link to={ruta} target="_blank" aria-label={`Ver ${nombre}`} className="shrink-0 p-[0.4rem] text-zinc-500 hover:text-zinc-900">
        <ArrowUpRight className="h-[1.1rem] w-[1.1rem]" />
      </Link>
    </li>
  )

  // Grupo desplegable: cerrado, con su número; al tocarlo se abre la lista. Con secciones (titulo + filas), la lista se separa en partes con su título
  // Disolver un grupo: se borra el grupo y sus copias se quedan (sin grupo)
  const [preguntaGrupo, setPreguntaGrupo] = useState(null)
  const cerrarPreguntaGrupo = useCallback(() => setPreguntaGrupo(null), [])
  const [pedirNombre, setPedirNombre] = useState(null)
  const cerrarPedirNombre = useCallback(() => setPedirNombre(null), [])
  // La pestaña abierta de Demos base: miniwebs, menu o fichas
  const [pestanaBase, setPestanaBase] = useState('miniwebs')
  // Renombrar un grupo: todas sus copias pasan a llamarse con el nombre nuevo
  const renombrarGrupo = nombre =>
    setPedirNombre({
      titulo: `Renombrar «${nombre}»`,
      valor: nombre,
      boton: 'Guardar',
      accion: async nuevo => {
        if (nuevo === nombre) return
        if (copias.some(c => c.cambios?._grupo === nuevo)) {
          setPreguntaGrupo({ titulo: 'Ese nombre ya existe', texto: 'Ya hay un grupo con ese nombre. Elige otro.', boton: 'Vale', accion: () => {} })
          return
        }
        const resultados = await Promise.all(
          copias
            .filter(c => c.cambios?._grupo === nombre)
            .map(c => supabase.from('ediciones').upsert({ tipo: c.tipo, slug: c.slug, base: c.base ?? null, cambios: { ...c.cambios, _grupo: nuevo } })),
        )
        if (resultados.some(r => r.error)) setPreguntaGrupo({ titulo: 'No se ha podido', texto: 'No se han podido renombrar todas las copias del grupo.', boton: 'Vale', accion: () => {} })
        recargar()
      },
    })
  const disolverGrupo = nombre =>
    setPreguntaGrupo({
      titulo: `¿Disolver el grupo «${nombre}»?`,
      texto: 'Sus copias no se borran: se quedan sin grupo.',
      boton: 'Disolver',
      peligro: true,
      accion: async () => {
        const resultados = await Promise.all(
          copias
            .filter(c => c.cambios?._grupo === nombre)
            .map(c => {
              const cambios = { ...c.cambios }
              delete cambios._grupo
              return supabase.from('ediciones').upsert({ tipo: c.tipo, slug: c.slug, base: c.base ?? null, cambios })
            }),
        )
        if (resultados.some(r => r.error)) setPreguntaGrupo({ titulo: 'No se ha podido', texto: 'No se han podido sacar todas las copias del grupo.', boton: 'Vale', accion: () => {} })
        recargar()
      },
    })

  const Grupo = ({ titulo, filas: lista, secciones, carpetas, cabecera }) =>
    lista.length > 0 && secciones ? (
      <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
        <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
          <span className="text-[1.05rem] font-bold">{titulo}</span>
          <span className="text-[0.9rem] text-zinc-500">{lista.length}</span>
        </summary>
        {cabecera}
        {/* Los grupos (carpetas con nombre, con sus copias dentro), antes de lo que no tiene grupo */}
        {(carpetas ?? []).map(c => (
          <details key={c.titulo} className="border-b border-zinc-200">
            <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] bg-zinc-50 px-[1rem] py-[0.6rem] text-[0.9rem] font-bold">
              {c.titulo}
              <span className="flex items-baseline gap-[0.9rem]">
                {/* Vistazo: abre la primera demo del grupo y las flechas pasan por las demás (las que no son de un cliente) */}
                {(() => {
                  const demos = c.filas.filter(f => f.ruta.startsWith('/demo/')).sort((a, b) => a.clave.split(':')[1].localeCompare(b.clave.split(':')[1]))
                  return demos.length > 1 ? (
                    <Link to={`${demos[0].ruta}?grupo=${encodeURIComponent(c.titulo)}`} target="_blank" onClick={e => e.stopPropagation()} className="text-[0.78rem] font-semibold underline underline-offset-[0.2em]">
                      Vistazo
                    </Link>
                  ) : null
                })()}
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    renombrarGrupo(c.titulo)
                  }}
                  className="text-[0.78rem] font-semibold underline underline-offset-[0.2em]"
                >
                  Renombrar
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    disolverGrupo(c.titulo)
                  }}
                  className="text-[0.78rem] font-semibold text-red-600 underline underline-offset-[0.2em]"
                >
                  Disolver grupo
                </button>
                <span className="text-[0.8rem] font-normal text-zinc-500">{c.filas.length}</span>
              </span>
            </summary>
            <ul className="px-[1rem]">
              {c.filas.map(f => Fila(f))}
            </ul>
          </details>
        ))}
        {secciones
          .filter(s => s.filas.length > 0)
          .map(s => (
            <div key={s.titulo}>
              <p className="flex items-baseline justify-between border-y border-zinc-200 bg-zinc-50 px-[1rem] py-[0.5rem] text-[0.9rem] font-bold first:border-t-0">
                {s.titulo}
                <span className="text-[0.8rem] font-normal text-zinc-500">{s.filas.length}</span>
              </p>
              <ul className="px-[1rem]">
                {s.filas.map(f => Fila(f))}
              </ul>
            </div>
          ))}
      </details>
    ) : (
      lista.length > 0 && (
      <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
        <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
          <span className="text-[1.05rem] font-bold">{titulo}</span>
          <span className="text-[0.9rem] text-zinc-500">{lista.length}</span>
        </summary>
        <ul className="px-[1rem]">
          {lista.map(f => Fila(f))}
        </ul>
      </details>
      )
    )

  // Copias de QR: la que se abre en el Editor QR (y se despliega), y un contador para recargar la lista al guardar
  const [qrAbierto, setQrAbierto] = useState(false)
  const [qrCargado, setQrCargado] = useState(null)
  const [versionQR, setVersionQR] = useState(0)

  const aFila = n => ({ clave: `negocio:${n.slug}`, nombre: n.nombre, detalle: n.demo ? 'Demo' : 'Cliente', ruta: rutaNegocio(n) })
  const aFilaCopia = f => ({ clave: `${f.tipo}:${f.slug}`, nombre: f.nombre, detalle: f.detalle, info: infoCopia(f), ruta: f.ruta, marcable: true })
  // Las copias como elementos de grupo (nuevo grupo y mover): poner(grupo) guarda cambios._grupo en la copia (null, la saca del grupo)
  const elementosCopias = copias.map(c => ({
    clave: `${c.tipo}:${c.slug}`,
    nombre: c.nombre,
    detalle: c.detalle,
    grupo: c.cambios?._grupo,
    poner: grupo => {
      const cambios = { ...c.cambios }
      if (grupo) cambios._grupo = grupo
      else delete cambios._grupo
      return supabase.from('ediciones').upsert({ tipo: c.tipo, slug: c.slug, base: c.base ?? null, cambios })
    },
  }))
  // Los grupos de las copias (cambios._grupo), por orden alfabético; lo que no tiene grupo sigue en Miniwebs y Cartas
  const carpetasCopias = Object.entries(
    copias.reduce((acc, c) => {
      const g = c.cambios?._grupo
      if (g) (acc[g] ??= []).push(aFilaCopia(c))
      return acc
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([titulo, filas]) => ({ titulo, filas }))
  // Una copia exportada a muestras (botón de Nuevo perfil): sale en Miniwebs y no en Copias para enseñar
  const esMuestra = f => f.tipo === 'negocio' && f.cambios?.muestra === true

  return (
    <div className="grid gap-[1.75rem]">
      <Confirmar pregunta={preguntaGrupo} alCerrar={cerrarPreguntaGrupo} />
      <PedirNombre pregunta={pedirNombre} alCerrar={cerrarPedirNombre} />
      {/* Crear: el Editor de miniwebs y cartas y el Editor QR */}
      <div className="grid gap-[0.75rem]">
      <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">Crear</h2>
      {/* Panel principal: crear un perfil nuevo eligiendo temática, producto, diseño y marca */}
      <NuevoPerfil filas={filas} recargar={recargar} abrir={abrir} cargar={copia} />

      {/* El botón "Crear con el asistente" (el primer asistente) está oculto: el Editor ya lo hace todo. Su pantalla (CrearConAsistente) sigue en el código */}

      {/* Generador de QR, aparte: se elige la página o se hace uno suelto */}
      <details id="editor-qr" open={qrAbierto} onToggle={e => setQrAbierto(e.currentTarget.open)} className="group/qr rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Editor QR</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/qr:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <QRSuelto copias={copias} cargada={qrCargado} alGuardar={() => setVersionQR(v => v + 1)} />
        </div>
      </details>
      </div>

      {/* QR en marcha: cambiar lo que enseña un QR ya impreso y el editor de QR de los clientes */}
      <div className="grid gap-[0.75rem]">
      <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">QR en marcha</h2>
      {/* Cambiar lo que enseña un QR ya impreso: se elige la página y la dirección del QR */}
      <details className="group/cambiar rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Cambiar un QR impreso</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/cambiar:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <CambiarQR copias={copias} />
        </div>
      </details>

      {/* Editor de QR para clientes: enlace con PIN para que el cliente diseñe su placa */}
      <details className="group/clientes rounded-[1rem] bg-white ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.5rem] px-[1rem] py-[0.9rem] [&::-webkit-details-marker]:hidden">
          <QrCode className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          <span className="text-[1.05rem] font-bold">Editor de QR para clientes</span>
          <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 transition-transform group-open/clientes:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-zinc-200 px-[1rem] py-[1rem]">
          <EditorClientes copias={copias} />
        </div>
      </details>
      </div>

      {/* Páginas: arriba lo que se trabaja (copias para enseñar y copias de QR); abajo, las demos base en un bloque plegado con pestañas */}
      <div className="grid gap-[0.6rem]">
        <h2 className="px-[0.25rem] text-[0.85rem] font-semibold text-zinc-500">Páginas</h2>
        {/* Las copias, separadas en Miniwebs y Cartas: cada copia que se guarda cae sola en el suyo, según lo que sea */}
        {Grupo({
          titulo: 'Copias para enseñar',
          filas: copias.map(aFilaCopia),
          carpetas: carpetasCopias,
          cabecera: (
            <>
              <NuevoGrupo elementos={elementosCopias} recargar={recargar} />
              <MoverCopias marcadas={marcadas} elementos={elementosCopias} recargar={recargar} limpiar={() => setMarcadas([])} />
            </>
          ),
          secciones: [
            { titulo: 'Miniwebs', filas: copias.filter(c => c.tipo !== 'carta' && !c.cambios?._grupo).map(aFilaCopia) },
            { titulo: 'Menú y ofertas', filas: copias.filter(c => c.tipo === 'carta' && !c.cambios?._grupo).map(aFilaCopia) },
          ],
        })}
        {/* Copias de QR, justo debajo de las copias para enseñar */}
        <CopiasQR
          version={versionQR}
          abrir={f => {
            setQrCargado(f)
            setQrAbierto(true)
            setTimeout(() => document.getElementById('editor-qr')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
          }}
        />
        {/* Demos base: lo que no se toca a diario (las miniwebs de siempre y las que se exportan a muestras, las cartas de ejemplo y las fichas),
            en un solo bloque siempre plegado, con una pestaña por tipo */}
        {(() => {
          const demosBase = [
            ['miniwebs', 'Miniwebs', negocios.filter(n => tipoDe(n) === 'miniweb').map(aFila)],
            ['menu', 'Menú y ofertas', cartas.map(c => ({ clave: `carta:${c.slug}`, nombre: marcaDe(c)?.nombre ?? c.slug, detalle: c.demo ? 'Demo' : 'Cliente', ruta: rutaCarta(c) }))],
            ['fichas', 'Fichas', negocios.filter(n => tipoDe(n) === 'ficha').map(aFila)],
          ]
          const total = demosBase.reduce((a, [, , filas]) => a + filas.length, 0)
          const [, , filasBase] = demosBase.find(([clave]) => clave === pestanaBase) ?? demosBase[0]
          return (
            <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
              <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
                <span className="text-[1.05rem] font-bold">Demos base</span>
                <span className="text-[0.9rem] text-zinc-500">{total}</span>
              </summary>
              <div className="flex gap-[0.4rem] overflow-x-auto px-[1rem] pt-[0.8rem]" role="tablist" aria-label="Tipo de demo base">
                {demosBase.map(([clave, texto, filas]) => (
                  <button
                    key={clave}
                    type="button"
                    role="tab"
                    aria-selected={pestanaBase === clave}
                    onClick={() => setPestanaBase(clave)}
                    className={`shrink-0 rounded-full px-[0.85rem] py-[0.35rem] text-[0.85rem] font-semibold transition-colors ${pestanaBase === clave ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'}`}
                  >
                    {texto} · {filas.length}
                  </button>
                ))}
              </div>
              <ul className="px-[1rem]">{filasBase.map(fila => Fila(fila))}</ul>
            </details>
          )
        })()}
      </div>
    </div>
  )
}
