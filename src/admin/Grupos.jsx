import { useState } from 'react'
import { BOTON, CAMPO } from '../components/panel'

/* Los grupos de copias: elegir una página, crear un grupo y mover copias a una carpeta. */

export function ElegirPagina({ paginas, valor, cambiar, vacio, grupos = [] }) {
  return (
    <select value={valor} onChange={e => cambiar(e.target.value)} className={CAMPO}>
      <option value="">{vacio}</option>
      {/* Grupos de copias (Cambiar un QR impreso): el QR abre la primera copia del grupo con las flechas del Vistazo */}
      {grupos.length > 0 && (
        <optgroup label="Grupos (con flechas)">
          {grupos.map(g => (
            <option key={g} value={`grupo:${g}`}>
              {g}
            </option>
          ))}
        </optgroup>
      )}
      {['Copias', 'Fichas y miniwebs', 'Menú y ofertas'].map(g => (
        <optgroup key={g} label={g}>
          {paginas
            .filter(p => p.grupo === g)
            .map(p => (
              <option key={p.clave} value={p.clave}>
                {p.nombre}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}

/* Nuevo grupo, al principio de Copias para enseñar (y de Copias de QR): se escribe el nombre y se marcan las copias que entran. El grupo nace con ellas.
   Trabaja con elementos genéricos: { clave, nombre, detalle, grupo, poner(grupo) }, donde poner guarda el grupo en su copia (en las de páginas, cambios._grupo;
   en las de QR, diseno._grupo) y devuelve el resultado de Supabase. Solo salen las que no tienen grupo; para pasar una de un grupo a otro, se marca en su
   fila y se usa "Mover a...". Si el nombre ya existe, se suman al que hay. */
export function NuevoGrupo({ elementos: todos, recargar }) {
  const copias = todos.filter(c => !c.grupo)
  // El desplegable se cierra al crear el grupo
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [elegidas, setElegidas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const alternar = c => setElegidas(e => (e.includes(c.clave) ? e.filter(x => x !== c.clave) : [...e, c.clave]))
  // Los chips Miniwebs y Cartas: con uno solo activo se ven solo las copias de ese tipo, con los dos se ven todas; nunca quedan los dos apagados
  const [verMiniwebs, setVerMiniwebs] = useState(true)
  const [verCartas, setVerCartas] = useState(true)
  const alternarTipo = tipo => {
    if (tipo === 'miniwebs') {
      if (verMiniwebs && !verCartas) return
      setVerMiniwebs(v => !v)
    } else {
      if (verCartas && !verMiniwebs) return
      setVerCartas(v => !v)
    }
  }
  const esCarta = c => c.clave.startsWith('carta:')
  const visibles = copias.filter(c => (esCarta(c) ? verCartas : verMiniwebs))

  const crear = async () => {
    if (!nombre.trim() || !elegidas.length || guardando) return
    setGuardando(true)
    setError('')
    const resultados = await Promise.all(copias.filter(c => elegidas.includes(c.clave)).map(c => c.poner(nombre.trim())))
    setGuardando(false)
    if (resultados.some(r => r.error)) return setError('No se han podido guardar todas las copias en el grupo.')
    setNombre('')
    setElegidas([])
    setAbierto(false)
    recargar()
  }

  return (
    <details open={abierto} onToggle={e => setAbierto(e.currentTarget.open)} className="border-b border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.75rem] text-[0.95rem] font-semibold">+ Nuevo grupo</summary>
      <div className="grid gap-[0.7rem] px-[1rem] pb-[1rem]">
        <input value={nombre} onChange={e => setNombre(e.target.value)} className={`${CAMPO} ${elegidas.length && !nombre.trim() ? 'border-red-500!' : ''}`} placeholder="Nombre del grupo" />
        <p className="text-[0.8rem] font-semibold text-zinc-500">{copias.length ? 'Elige las copias que entran (las que no tienen grupo)' : 'Todas las copias están ya en un grupo'}</p>
        <div role="group" aria-label="Tipo de copias" className="flex flex-wrap gap-[0.4rem]">
          {[
            ['miniwebs', 'Miniwebs', verMiniwebs, copias.filter(c => !esCarta(c)).length],
            ['cartas', 'Cartas', verCartas, copias.filter(esCarta).length],
          ].map(([clave, texto, activo, cuantas]) => (
            <button
              key={clave}
              type="button"
              aria-pressed={activo}
              onClick={() => alternarTipo(clave)}
              className={`rounded-full px-[0.85rem] py-[0.3rem] text-[0.85rem] font-semibold transition-colors ${activo ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'}`}
            >
              {texto} · {cuantas}
            </button>
          ))}
        </div>
        <ul className="max-h-[18rem] overflow-y-auto rounded-[0.6rem] ring-1 ring-zinc-200">
          {visibles.map(c => (
            <li key={c.clave} className="border-b border-zinc-200 last:border-b-0">
              <label className="flex cursor-pointer items-center gap-[0.7rem] px-[0.8rem] py-[0.6rem]">
                <input type="checkbox" checked={elegidas.includes(c.clave)} onChange={() => alternar(c)} className="h-[1.1rem] w-[1.1rem] shrink-0 accent-zinc-900" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.nombre}</span>
                  <span className="block truncate text-[0.8rem] text-zinc-500">{c.detalle}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {error && <p className="text-[0.85rem] font-semibold text-red-600">{error}</p>}
        <button type="button" onClick={crear} disabled={!nombre.trim() || !elegidas.length || guardando} className={BOTON}>
          {guardando ? 'Creando...' : !nombre.trim() ? 'Falta el nombre del grupo' : !elegidas.length ? 'Elige alguna copia' : `Crear grupo con ${elegidas.length}`}
        </button>
      </div>
    </details>
  )
}

/* Mover las copias marcadas (casillas) a un grupo que ya existe, o sacarlas de su grupo. Solo se ve con alguna marcada. Mismos elementos que NuevoGrupo. */
export function MoverCopias({ marcadas, elementos, recargar, limpiar }) {
  const [destino, setDestino] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  if (!marcadas.length) return null
  const grupos = [...new Set(elementos.map(c => c.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))

  const mover = async () => {
    if (!destino || guardando) return
    setGuardando(true)
    setError('')
    const resultados = await Promise.all(elementos.filter(c => marcadas.includes(c.clave)).map(c => c.poner(destino === '__ninguno' ? null : destino)))
    setGuardando(false)
    if (resultados.some(r => r.error)) return setError('No se han podido mover todas las copias.')
    setDestino('')
    limpiar()
    recargar()
  }

  return (
    <div className="grid gap-[0.5rem] border-b border-zinc-200 bg-zinc-50 px-[1rem] py-[0.7rem]">
      <div className="flex flex-wrap items-center gap-[0.6rem]">
        <span className="text-[0.88rem] font-semibold">{marcadas.length === 1 ? '1 marcada' : `${marcadas.length} marcadas`}</span>
        <select value={destino} onChange={e => setDestino(e.target.value)} className={`${CAMPO} max-w-[15rem]`} aria-label="Mover las marcadas a un grupo">
          <option value="">Mover a...</option>
          {grupos.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="__ninguno">Sin grupo</option>
        </select>
        <button type="button" onClick={mover} disabled={!destino || guardando} className={BOTON}>
          {guardando ? 'Moviendo...' : 'Mover'}
        </button>
        <button type="button" onClick={limpiar} className="text-[0.85rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
          Quitar marcas
        </button>
      </div>
      {error && <p className="text-[0.85rem] font-semibold text-red-600">{error}</p>}
    </div>
  )
}
