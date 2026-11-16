import { useState } from 'react'
import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { CampoFoto } from '../../Campos'
import { Plegable } from '../../PanelesMiniweb'
import { CAMPO } from '../../../components/panel'
import { aplicar } from '../../../lib/ediciones'
import { DESCRIPCION_PRUEBA, nombrePlatoPrueba } from '../../../lib/enBlanco'
import { leerRuta } from '../../datos'
import { GruposMenuDia, ListaOfertas } from './GruposMenuOfertas'

// Como mucho, los grupos de la carta que se pueden tener (la fila de nombres de la carta se desplaza de lado, pero más de diez no se lee)
const MAX_GRUPOS = 10

// PanelAjustesCarta: los ajustes propios de la carta (Menú y ofertas). De momento, los grupos de la pestaña de la carta y los platos de cada uno
// (para probar cuántos aguanta el diseño: los precios y datos reales los pone el dueño desde su panel).
// Recibe los datos en bruto de la carta, sus cambios y cambiarExtra (ruta, valor); preguntar abre el aviso de confirmación del Editor
export default function PanelAjustesCarta({ datosEnBruto, cambiosExtra, cambiarExtra, preguntar }) {
  // El grupo que tiene abiertos sus platos (uno cada vez), por su posición
  const [abierto, setAbierto] = useState(null)
  const datos = datosEnBruto ? aplicar(datosEnBruto, cambiosExtra) : null
  const grupos = Array.isArray(datos?.secciones) ? datos.secciones : []
  // Se guarda la lista entera de grupos (con lo ya cambiado) y se quitan los cambios sueltos de sus nombres y platos, que ya van dentro
  const guardarGrupos = nuevos => {
    for (const ruta of Object.keys(cambiosExtra)) {
      if (ruta.startsWith('secciones.')) cambiarExtra(ruta, leerRuta(datosEnBruto, ruta))
    }
    cambiarExtra('secciones', nuevos)
  }
  const cambiarNombre = (i, nombre) => guardarGrupos(grupos.map((g, k) => (k === i ? { ...g, nombre } : g)))
  const anadirGrupo = () => {
    let n = grupos.length + 1
    while (grupos.some(g => g.nombre === `Grupo ${n}`)) n++
    guardarGrupos([...grupos, { nombre: `Grupo ${n}`, foto: '', platos: [{ nombre: nombrePlatoPrueba(1), descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' }] }])
  }
  const quitarGrupo = i => {
    const g = grupos[i]
    const platos = g.platos?.length ?? 0
    preguntar({
      titulo: `¿Quitar ${g.nombre.trim() ? `el grupo ${g.nombre.trim()}` : 'este grupo'}?`,
      texto: platos ? `Se quitarán también sus ${platos} ${platos === 1 ? 'plato' : 'platos'}.` : 'Está vacío, no se pierde ningún plato.',
      boton: 'Quitar',
      peligro: true,
      accion: () => {
        setAbierto(null)
        guardarGrupos(grupos.filter((_, k) => k !== i))
      },
    })
  }
  // Los platos de un grupo: nombre cambiable, y añadir o quitar. Un plato nuevo nace con los textos de ejemplo (se ve en la carta); los reales los pone el dueño
  const guardarPlatos = (i, platos) => guardarGrupos(grupos.map((g, k) => (k === i ? { ...g, platos } : g)))
  const cambiarPlato = (i, j, nombre) => guardarPlatos(i, grupos[i].platos.map((p, k) => (k === j ? { ...p, nombre } : p)))
  const cambiarFoto = (i, j, foto) => guardarPlatos(i, grupos[i].platos.map((p, k) => (k === j ? { ...p, foto } : p)))
  const anadirPlato = i => {
    const platos = grupos[i].platos ?? []
    let n = platos.length + 1
    while (platos.some(p => p.nombre === nombrePlatoPrueba(n))) n++
    guardarPlatos(i, [...platos, { nombre: nombrePlatoPrueba(n), descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' }])
  }
  const quitarPlato = (i, j) => guardarPlatos(i, grupos[i].platos.filter((_, k) => k !== j))
  const platosRepetidos = g => {
    const n = (g.platos ?? []).map(p => p.nombre.trim())
    return new Set(n).size !== n.length || n.some(x => !x)
  }
  const nombres = grupos.map(g => g.nombre.trim())
  const hayProblema = new Set(nombres).size !== nombres.length || nombres.some(n => !n)
  if (!datos) return null
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {/* Los grupos de la carta: la fila de nombres que sale en la pestaña de la carta, y cada uno con sus platos */}
      {grupos.length > 0 && (
      <Plegable titulo={datos.ofertas ? 'Grupos de servicios' : 'Grupos de la carta'} elegido={`${grupos.length} ${grupos.length === 1 ? 'grupo' : 'grupos'}`}>
        <div className="grid gap-[0.6rem]">
          <p className="text-[0.8rem] text-zinc-500">
            {datos.ofertas
              ? 'Son los nombres de la fila que sale en la pestaña de servicios (Corte, Color, Peinados...). Abre un grupo para ver y cambiar sus servicios.'
              : 'Son los nombres de la fila que sale en la pestaña de la carta (Principales, Guisos, Sopas...). Abre un grupo para ver y cambiar sus platos.'}
          </p>
          {grupos.map((g, i) => (
            <div key={i} className="grid gap-[0.5rem]">
              <div className="flex items-center gap-[0.4rem]">
                <input value={g.nombre} onChange={e => cambiarNombre(i, e.target.value)} aria-label={`Nombre del grupo ${i + 1}`} className={CAMPO} />
                <button
                  type="button"
                  onClick={() => setAbierto(abierto === i ? null : i)}
                  aria-expanded={abierto === i}
                  aria-label={`Platos del grupo ${g.nombre.trim() || i + 1}`}
                  className="flex shrink-0 items-center gap-[0.25rem] rounded-[0.6rem] px-[0.6rem] py-[0.6rem] text-[0.85rem] font-semibold text-zinc-500 ring-1 ring-zinc-300 hover:text-zinc-900"
                >
                  {g.platos?.length ?? 0}
                  <ChevronDown className={`h-[1rem] w-[1rem] transition-transform ${abierto === i ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={grupos.length <= 1}
                  onClick={() => quitarGrupo(i)}
                  aria-label={`Quitar el grupo ${g.nombre.trim() || i + 1}`}
                  className="shrink-0 rounded-[0.6rem] p-[0.6rem] text-zinc-500 ring-1 ring-zinc-300 hover:text-zinc-900 disabled:opacity-40"
                >
                  <Trash2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                </button>
              </div>
              {abierto === i && (
                <div className="grid gap-[0.4rem] border-l-2 border-zinc-200 pl-[0.7rem]">
                  {(g.platos ?? []).map((p, j) => (
                    <div key={j} className="grid gap-[0.5rem] rounded-[0.7rem] bg-zinc-50 p-[0.5rem] ring-1 ring-zinc-200">
                      <div className="flex items-center gap-[0.4rem]">
                        <input value={p.nombre} onChange={e => cambiarPlato(i, j, e.target.value)} aria-label={`Nombre del plato ${j + 1} de ${g.nombre.trim() || `el grupo ${i + 1}`}`} className={CAMPO} />
                        <button
                          type="button"
                          disabled={g.platos.length <= 1}
                          onClick={() => quitarPlato(i, j)}
                          aria-label={`Quitar el plato ${p.nombre.trim() || j + 1}`}
                          className="shrink-0 rounded-[0.6rem] p-[0.6rem] text-zinc-500 ring-1 ring-zinc-300 hover:text-zinc-900 disabled:opacity-40"
                        >
                          <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                        </button>
                      </div>
                      {/* La foto del plato, junto a su nombre */}
                      <CampoFoto valor={p.foto ?? ''} cambiar={foto => cambiarFoto(i, j, foto)} carpeta="negocio/nuevo" sugerencia={datos.marca?.sector ?? ''} />
                    </div>
                  ))}
                  {platosRepetidos(g) && <p className="text-[0.8rem] font-semibold text-red-600">Cada plato necesita un nombre, y distinto de los demás del grupo.</p>}
                  <button
                    type="button"
                    onClick={() => anadirPlato(i)}
                    className="flex items-center justify-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.5rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300"
                  >
                    <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
                    Añadir plato
                  </button>
                </div>
              )}
            </div>
          ))}
          {hayProblema && <p className="text-[0.8rem] font-semibold text-red-600">Cada grupo necesita un nombre, y distinto de los demás.</p>}
          <button
            type="button"
            disabled={grupos.length >= MAX_GRUPOS}
            onClick={anadirGrupo}
            className="flex items-center justify-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40"
          >
            <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Añadir grupo
          </button>
        </div>
      </Plegable>
      )}
      {/* El menú del día o las ofertas de la carta: sus grupos y platos, o sus ofertas */}
      {datos.menuDia && <GruposMenuDia datos={datos} datosEnBruto={datosEnBruto} cambiosExtra={cambiosExtra} cambiarExtra={cambiarExtra} preguntar={preguntar} />}
      {datos.ofertas && <ListaOfertas datos={datos} datosEnBruto={datosEnBruto} cambiosExtra={cambiosExtra} cambiarExtra={cambiarExtra} />}
    </div>
  )
}
