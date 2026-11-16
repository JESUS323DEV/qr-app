import { useState } from 'react'
import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { CampoFoto } from '../../Campos'
import { Plegable } from '../../PanelesMiniweb'
import { CAMPO } from '../../../components/panel'
import { DESCRIPCION_PRUEBA, nombrePlatoPrueba } from '../../../lib/enBlanco'
import { MAX_GRUPOS, MAX_PLATOS } from '../../../panel/utilidadesMenu'
import { leerRuta } from '../../datos'

/* Los grupos del menú del día y las ofertas, para probar cómo queda el diseño con tantos como podría crear el dueño desde su panel
   (el menú del día admite hasta MAX_GRUPOS grupos de MAX_PLATOS platos, los mismos topes que su panel; las ofertas no tienen tope).
   Aquí solo se tocan nombres y descripciones: los precios y demás datos reales los pone el dueño.
   Cada lista se guarda entera (con lo ya cambiado) y se quitan los cambios sueltos de sus elementos, que ya van dentro */

// Guarda una lista entera en su ruta (menuDia.grupos, ofertas.lista) quitando los cambios sueltos que tuviera
function useGuardarLista({ datosEnBruto, cambiosExtra, cambiarExtra }) {
  return (ruta, nueva) => {
    for (const r of Object.keys(cambiosExtra)) {
      if (r.startsWith(`${ruta}.`)) cambiarExtra(r, leerRuta(datosEnBruto, r))
    }
    cambiarExtra(ruta, nueva)
  }
}

// Cuántas fotos de ofertas enseña cada estilo: Polaroid y Revista, las 4 primeras; Galería, hasta 6 (de dos en dos)
const MAX_FOTOS_CORTAS = 4
const MAX_FOTOS = 6

const BOTON_ICONO ='shrink-0 rounded-[0.6rem] p-[0.6rem] text-zinc-500 ring-1 ring-zinc-300 hover:text-zinc-900 disabled:opacity-40'
const BOTON_ANADIR = 'flex items-center justify-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.5rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-40'

// Hay nombres vacíos o repetidos (la carta usa el nombre como identificador)
const hayProblema = nombres => {
  const n = nombres.map(x => x.trim())
  return new Set(n).size !== n.length || n.some(x => !x)
}

// Menú del día: grupos (Primeros, Segundos, Postres...) con sus platos. Los platos del menú son solo texto
export function GruposMenuDia({ datos, datosEnBruto, cambiosExtra, cambiarExtra, preguntar }) {
  const [abierto, setAbierto] = useState(null)
  const guardar = useGuardarLista({ datosEnBruto, cambiosExtra, cambiarExtra })
  const grupos = datos.menuDia.grupos ?? []
  const poner = nuevos => guardar('menuDia.grupos', nuevos)
  const ponerGrupo = (i, cambio) => poner(grupos.map((g, k) => (k === i ? { ...g, ...cambio } : g)))
  const anadirGrupo = () => {
    let n = grupos.length + 1
    while (grupos.some(g => g.nombre === `Grupo ${n}`)) n++
    poner([...grupos, { nombre: `Grupo ${n}`, platos: [nombrePlatoPrueba(1)] }])
  }
  const quitarGrupo = i => {
    const platos = grupos[i].platos?.length ?? 0
    preguntar({
      titulo: `¿Quitar ${grupos[i].nombre.trim() ? `el grupo ${grupos[i].nombre.trim()}` : 'este grupo'}?`,
      texto: platos ? `Se quitarán también sus ${platos} ${platos === 1 ? 'plato' : 'platos'}.` : 'Está vacío, no se pierde ningún plato.',
      boton: 'Quitar',
      peligro: true,
      accion: () => {
        setAbierto(null)
        poner(grupos.filter((_, k) => k !== i))
      },
    })
  }
  const anadirPlato = i => {
    const platos = grupos[i].platos ?? []
    let n = platos.length + 1
    while (platos.includes(nombrePlatoPrueba(n))) n++
    ponerGrupo(i, { platos: [...platos, nombrePlatoPrueba(n)] })
  }
  return (
    <Plegable titulo="Grupos del menú del día" elegido={`${grupos.length} ${grupos.length === 1 ? 'grupo' : 'grupos'}`}>
      <div className="grid gap-[0.6rem]">
        {/* La foto del menú del día, justo arriba */}
        <div className="grid gap-[0.4rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Foto del menú del día</p>
          <CampoFoto
            valor={datos.menuDia.foto ?? ''}
            cambiar={v => cambiarExtra('menuDia.foto', v)}
            carpeta="negocio/nuevo"
            sugerencia={datos.marca?.sector ?? ''}
            quitar={datos.menuDia.foto ? () => cambiarExtra('menuDia.foto', '') : undefined}
          />
        </div>
        <p className="text-[0.8rem] text-zinc-500">Primeros, Segundos, Postres... con sus platos. El dueño puede tener hasta {MAX_GRUPOS} grupos de {MAX_PLATOS} platos.</p>
        {grupos.map((g, i) => (
          <div key={i} className="grid gap-[0.5rem]">
            <div className="flex items-center gap-[0.4rem]">
              <input value={g.nombre} onChange={e => ponerGrupo(i, { nombre: e.target.value })} aria-label={`Nombre del grupo ${i + 1} del menú`} className={CAMPO} />
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
              <button type="button" disabled={grupos.length <= 1} onClick={() => quitarGrupo(i)} aria-label={`Quitar el grupo ${g.nombre.trim() || i + 1}`} className={BOTON_ICONO}>
                <Trash2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              </button>
            </div>
            {abierto === i && (
              <div className="grid gap-[0.4rem] border-l-2 border-zinc-200 pl-[0.7rem]">
                {(g.platos ?? []).map((p, j) => (
                  <div key={j} className="flex items-center gap-[0.4rem]">
                    <input
                      value={p}
                      onChange={e => ponerGrupo(i, { platos: g.platos.map((x, k) => (k === j ? e.target.value : x)) })}
                      aria-label={`Plato ${j + 1} de ${g.nombre.trim() || `el grupo ${i + 1}`}`}
                      className={CAMPO}
                    />
                    <button type="button" disabled={g.platos.length <= 1} onClick={() => ponerGrupo(i, { platos: g.platos.filter((_, k) => k !== j) })} aria-label={`Quitar el plato ${p.trim() || j + 1}`} className={BOTON_ICONO}>
                      <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {hayProblema(g.platos ?? []) && <p className="text-[0.8rem] font-semibold text-red-600">Cada plato necesita un nombre, y distinto de los demás del grupo.</p>}
                <button type="button" disabled={(g.platos?.length ?? 0) >= MAX_PLATOS} onClick={() => anadirPlato(i)} className={BOTON_ANADIR}>
                  <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
                  Añadir plato
                </button>
              </div>
            )}
          </div>
        ))}
        {hayProblema(grupos.map(g => g.nombre)) && <p className="text-[0.8rem] font-semibold text-red-600">Cada grupo necesita un nombre, y distinto de los demás.</p>}
        <button type="button" disabled={grupos.length >= MAX_GRUPOS} onClick={anadirGrupo} className={BOTON_ANADIR}>
          <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
          Añadir grupo
        </button>
      </div>
    </Plegable>
  )
}

// Ofertas: cada una con su nombre y su descripción (el precio no se toca aquí)
export function ListaOfertas({ datos, datosEnBruto, cambiosExtra, cambiarExtra }) {
  const guardar = useGuardarLista({ datosEnBruto, cambiosExtra, cambiarExtra })
  const lista = datos.ofertas.lista ?? []
  const poner = nueva => guardar('ofertas.lista', nueva)
  // Las fotos de las ofertas (ofertas.fotos; sin lista, la foto suelta ofertas.foto): pasan solas en la carta. Las nuevas empiezan repitiendo la primera, para cambiarlas con Buscar o Subir
  const fotos = Array.isArray(datos.ofertas.fotos) ? datos.ofertas.fotos : datos.ofertas.foto ? [datos.ofertas.foto] : []
  const ponerFotos = nuevas => {
    guardar('ofertas.fotos', nuevas)
    // Sin ninguna, tampoco queda la foto suelta de respaldo
    if (!nuevas.length) cambiarExtra('ofertas.foto', '')
  }
  const ponerOferta = (i, cambio) => poner(lista.map((o, k) => (k === i ? { ...o, ...cambio } : o)))
  const anadir = () => {
    let n = lista.length + 1
    while (lista.some(o => o.nombre === `Oferta ${n}`)) n++
    poner([...lista, { nombre: `Oferta ${n}`, descripcion: DESCRIPCION_PRUEBA, precio: '00 €' }])
  }
  return (
    <Plegable titulo="Ofertas" elegido={`${lista.length} ${lista.length === 1 ? 'oferta' : 'ofertas'}`}>
      <div className="grid gap-[0.6rem]">
        {/* Las fotos de las ofertas, justo arriba */}
        <div className="grid gap-[0.5rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Fotos de las ofertas</p>
          <p className="text-[0.8rem] text-zinc-400">Pasan solas, una tras otra. Polaroid y Revista enseñan las {MAX_FOTOS_CORTAS} primeras; Galería, hasta {MAX_FOTOS}, de dos en dos.</p>
          {fotos.map((f, i) => (
            <CampoFoto
              key={i}
              valor={f}
              cambiar={v => ponerFotos(fotos.map((x, k) => (k === i ? v : x)))}
              carpeta="negocio/nuevo"
              sugerencia={datos.marca?.sector ?? ''}
              quitar={() => ponerFotos(fotos.filter((_, k) => k !== i))}
            />
          ))}
          <button type="button" disabled={fotos.length >= MAX_FOTOS} onClick={() => ponerFotos([...fotos, fotos[0] ?? ''])} className={BOTON_ANADIR}>
            <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Añadir foto
          </button>
        </div>
        <label className="flex cursor-pointer items-start gap-[0.5rem] text-[0.88rem]">
          <input
            type="checkbox"
            checked={datos.ofertas.precioTachado !== false}
            onChange={e => cambiarExtra('ofertas.precioTachado', e.target.checked)}
            className="mt-[0.15rem] h-[1.1rem] w-[1.1rem] shrink-0"
          />
          <span>
            Mostrar el precio tachado
            <span className="block text-[0.78rem] text-zinc-400">El precio de antes, junto al de la oferta. Desactivado, no se ve en ninguna oferta.</span>
          </span>
        </label>
        <p className="text-[0.8rem] text-zinc-500">Nombre y descripción de cada oferta. Los precios los pone el dueño.</p>
        {lista.map((o, i) => (
          <div key={i} className="grid gap-[0.4rem] rounded-[0.7rem] bg-zinc-50 p-[0.5rem] ring-1 ring-zinc-200">
            <div className="flex items-center gap-[0.4rem]">
              <input value={o.nombre} onChange={e => ponerOferta(i, { nombre: e.target.value })} aria-label={`Nombre de la oferta ${i + 1}`} className={CAMPO} />
              <button type="button" disabled={lista.length <= 1} onClick={() => poner(lista.filter((_, k) => k !== i))} aria-label={`Quitar la oferta ${o.nombre.trim() || i + 1}`} className={BOTON_ICONO}>
                <Trash2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              </button>
            </div>
            <textarea value={o.descripcion ?? ''} onChange={e => ponerOferta(i, { descripcion: e.target.value })} rows={2} aria-label={`Descripción de la oferta ${i + 1}`} className={`${CAMPO} resize-y`} />
          </div>
        ))}
        {hayProblema(lista.map(o => o.nombre)) && <p className="text-[0.8rem] font-semibold text-red-600">Cada oferta necesita un nombre, y distinto de los demás.</p>}
        <button type="button" onClick={anadir} className={BOTON_ANADIR}>
          <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
          Añadir oferta
        </button>
      </div>
    </Plegable>
  )
}
