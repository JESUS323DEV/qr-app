import { useState } from 'react'
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react'
import BotonCopiar from '../components/BotonCopiar'
import { conDominio } from '../lib/dominio'
import { supabase } from '../lib/supabase'
import { BOTON, CAMPO, Etiqueta } from '../components/panel'

/* El horario del negocio (tabla horarios, SQL 015): el dueño lo escribe por bloques (lunes a viernes, fin de semana, festivos y otro horario) y al
   publicar la pantalla Horario de su miniweb lo enseña al momento. En la base se guarda como siempre, en líneas de días y horas: los días seguidos con las
   mismas horas se juntan en una línea («Lunes a viernes»), y una línea con «Cerrado» en las horas se ve apagada. */
const MAX_LINEAS_HORARIO = 14
const NOMBRES_DIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CLAVES_DIA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const HORAS_OPCIONES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const ESTADOS_DIA = [['oculto', 'No mostrar'], ['abierto', 'Abierto'], ['cerrado', 'Cerrado']]
const SEMANA_LABORAL = [0, 1, 2, 3, 4]
const FIN_DE_SEMANA = [5, 6]

const sinTildes = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const diaNuevo = () => ({ estado: 'oculto', turnos: [{ de: '10:00', a: '20:00' }] })
const copiaDia = dia => ({ ...dia, turnos: dia.turnos.map(t => ({ ...t })) })
const horasDe = (dia, conH) => (dia.estado === 'cerrado' ? 'Cerrado' : dia.turnos.map(t => `${t.de} a ${t.a}${conH ? ' h' : ''}`).join(' y '))

// Los días que dice el texto de una línea (índices 0 a 6, o 'festivos'); null si no se entiende
function diasDeTexto(texto) {
  const t = sinTildes(texto)
  if (t === 'festivos') return 'festivos'
  if (t === 'fin de semana') return FIN_DE_SEMANA
  const rango = t.split(/\s+a\s+/)
  if (rango.length === 2) {
    const [x, y] = rango.map(p => CLAVES_DIA.indexOf(p))
    return x >= 0 && y >= x ? Array.from({ length: y - x + 1 }, (_, k) => x + k) : null
  }
  const lista = t.split(/\s*,\s*|\s+y\s+/).map(p => CLAVES_DIA.indexOf(p))
  return lista.length && lista.every(i => i >= 0) ? lista : null
}

// El estado y los turnos que dice el texto de las horas; null si no se entiende (esa línea pasa a «Otro horario» tal cual)
function horasDeTexto(horas) {
  if (/^cerrad[oa]$/.test(sinTildes(horas))) return { estado: 'cerrado' }
  const re = /(\d{1,2})[:.](\d{2})\s*a\s*(\d{1,2})[:.](\d{2})(\s*h\b)?/gi
  const encontrados = [...horas.matchAll(re)]
  const turnos = encontrados.map(m => ({ de: `${m[1].padStart(2, '0')}:${m[2]}`, a: `${m[3].padStart(2, '0')}:${m[4]}` }))
  if (!turnos.length || turnos.length > 2 || horas.replace(re, '').replace(/[\sy,]/gi, '')) return null
  return { estado: 'abierto', turnos, conH: encontrados.some(m => m[5]) }
}

// Las líneas guardadas, repartidas en los siete días, festivos y otro horario
function estadoDeLineas(lineas) {
  const dias = Array.from({ length: 7 }, diaNuevo)
  let festivos = diaNuevo()
  const otros = []
  const puestos = new Set()
  let conH = false
  for (const l of lineas) {
    const d = diasDeTexto(l.dias ?? '')
    const h = horasDeTexto(String(l.horas ?? ''))
    const libre = Array.isArray(d) ? d.every(i => !puestos.has(i)) : d === 'festivos' && !puestos.has('festivos')
    if (!d || !h || !libre) {
      otros.push({ dias: l.dias ?? '', horas: l.horas ?? '' })
      continue
    }
    const { conH: lleva, ...datos } = h
    if (lleva) conH = true
    const nuevo = { ...diaNuevo(), ...datos }
    if (d === 'festivos') {
      festivos = nuevo
      puestos.add('festivos')
    } else {
      d.forEach(i => {
        dias[i] = copiaDia(nuevo)
        puestos.add(i)
      })
    }
  }
  if (!lineas.length) SEMANA_LABORAL.forEach(i => (dias[i].estado = 'abierto'))
  const iguales = ids => ids.every(i => JSON.stringify(dias[i]) === JSON.stringify(dias[ids[0]]))
  return { dias, festivos, otros, conH, sepSemana: !iguales(SEMANA_LABORAL), sepFinde: !iguales(FIN_DE_SEMANA) }
}

function nombreGrupo(indices) {
  const n = indices.map(i => NOMBRES_DIA[i])
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} y ${n[1].toLowerCase()}`
  return `${n[0]} a ${n[n.length - 1].toLowerCase()}`
}

// Del estado del editor a las líneas que se guardan: los días seguidos del mismo bloque con las mismas horas van en una sola línea
function lineasDeEstado({ dias, festivos, otros, conH }) {
  const lineas = []
  for (const bloque of [SEMANA_LABORAL, FIN_DE_SEMANA]) {
    let grupo = []
    const cerrar = () => {
      if (grupo.length) lineas.push({ dias: nombreGrupo(grupo), horas: horasDe(dias[grupo[0]], conH) })
      grupo = []
    }
    for (const i of bloque) {
      if (dias[i].estado === 'oculto') {
        cerrar()
        continue
      }
      if (grupo.length && horasDe(dias[grupo[0]], conH) !== horasDe(dias[i], conH)) cerrar()
      grupo.push(i)
    }
    cerrar()
  }
  if (festivos.estado !== 'oculto') lineas.push({ dias: 'Festivos', horas: horasDe(festivos, conH) })
  for (const o of otros) {
    const dias2 = o.dias.trim()
    const horas = o.horas.trim()
    if (dias2 && horas) lineas.push({ dias: dias2, horas })
  }
  return lineas
}

function Hora({ valor, alCambiar, etiqueta }) {
  const opciones = HORAS_OPCIONES.includes(valor) ? HORAS_OPCIONES : [...HORAS_OPCIONES, valor].sort()
  return (
    <select value={valor} onChange={e => alCambiar(e.target.value)} aria-label={etiqueta} className={CAMPO}>
      {opciones.map(h => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  )
}

// Un día, un bloque de días o los festivos: No mostrar, Abierto o Cerrado y, si está abierto, sus horas (hasta dos turnos)
function TarjetaHorario({ titulo, dia, alCambiar }) {
  const ponerTurno = (k, campo, valor) => alCambiar({ ...dia, turnos: dia.turnos.map((t, j) => (j === k ? { ...t, [campo]: valor } : t)) })
  return (
    <div className="grid gap-[0.6rem] rounded-[0.9rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
      <p className="font-bold">{titulo}</p>
      <div role="group" aria-label={`Estado de ${titulo}`} className="grid grid-cols-3 gap-[0.25rem] rounded-[0.7rem] bg-zinc-200/70 p-[0.2rem]">
        {ESTADOS_DIA.map(([clave, texto]) => (
          <button
            key={clave}
            type="button"
            aria-pressed={dia.estado === clave}
            onClick={() => alCambiar({ ...dia, estado: clave })}
            className={`rounded-[0.5rem] py-[0.4rem] text-[0.85rem] ${dia.estado === clave ? 'bg-white font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'font-semibold text-zinc-600'}`}
          >
            {texto}
          </button>
        ))}
      </div>
      {dia.estado === 'abierto' && (
        <>
          {dia.turnos.map((t, k) => (
            <div key={k} className="grid grid-cols-[1fr_auto_1fr] items-center gap-[0.4rem]">
              <Hora valor={t.de} alCambiar={v => ponerTurno(k, 'de', v)} etiqueta={`${titulo}: abre`} />
              <span className="text-[0.9rem] text-zinc-500">a</span>
              <Hora valor={t.a} alCambiar={v => ponerTurno(k, 'a', v)} etiqueta={`${titulo}: cierra`} />
            </div>
          ))}
          {dia.turnos.length < 2 ? (
            <button type="button" onClick={() => alCambiar({ ...dia, turnos: [...dia.turnos, { de: '16:00', a: '20:00' }] })} className="justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
              Añadir segundo turno
            </button>
          ) : (
            <button type="button" onClick={() => alCambiar({ ...dia, turnos: dia.turnos.slice(0, 1) })} className="justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
              Quitar segundo turno
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Lunes a viernes o el fin de semana: un solo horario para todos los días, o cada día por separado
function BloqueDias({ titulo, indices, dias, separado, alSeparar, alCambiar }) {
  const enlace = 'justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]'
  if (!separado) {
    return (
      <div className="grid gap-[0.5rem]">
        <TarjetaHorario titulo={titulo} dia={dias[indices[0]]} alCambiar={nuevo => alCambiar(indices, nuevo)} />
        <button type="button" onClick={() => alSeparar(true)} className={enlace}>
          Separar por días
        </button>
      </div>
    )
  }
  return (
    <div className="grid gap-[0.5rem]">
      {indices.map(i => (
        <TarjetaHorario key={i} titulo={NOMBRES_DIA[i]} dia={dias[i]} alCambiar={nuevo => alCambiar([i], nuevo)} />
      ))}
      <button
        type="button"
        onClick={() => {
          alCambiar(indices, dias[indices[0]])
          alSeparar(false)
        }}
        className={enlace}
      >
        Juntar en un solo horario ({titulo.toLowerCase()})
      </button>
    </div>
  )
}

function EditorHorarios({ fila, alGuardar }) {
  const [est, setEst] = useState(() => estadoDeLineas(fila.lineas ?? []))
  const [nota, setNota] = useState(fila.nota ?? '')
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')
  const poner = cambios => {
    setAviso('')
    setEst(e => ({ ...e, ...(typeof cambios === 'function' ? cambios(e) : cambios) }))
  }
  const ponerDias = (indices, nuevo) => poner(e => ({ dias: e.dias.map((d, k) => (indices.includes(k) ? copiaDia(nuevo) : d)) }))
  const ponerOtro = (i, campo, valor) => poner(e => ({ otros: e.otros.map((o, k) => (k === i ? { ...o, [campo]: valor } : o)) }))
  const limpias = lineasDeEstado(est)
  const demasiadas = limpias.length > MAX_LINEAS_HORARIO

  const guardar = async () => {
    if (!limpias.length || demasiadas || guardando) return
    setGuardando(true)
    setAviso('')
    setError('')
    const { error: fallo } = await supabase.from('horarios').update({ lineas: limpias, nota: nota.trim() || null }).eq('slug', fila.slug)
    setGuardando(false)
    if (fallo) return setError('No se ha podido publicar el horario. Inténtalo otra vez.')
    setAviso('Publicado: tu miniweb ya enseña este horario.')
    alGuardar?.({ ...fila, lineas: limpias, nota: nota.trim() || null })
  }

  return (
    <div className="grid gap-[1rem]">
      <div>
        <h2 className="text-[1.3rem] font-bold">Horario del negocio</h2>
        <p className="mt-[0.2rem] text-[0.9rem] text-zinc-500">Es el que sale en la pantalla Horario de tu miniweb. Lo que pongas en «No mostrar» no aparece.</p>
      </div>
      <label className="flex items-center gap-[0.6rem] font-semibold">
        <input type="checkbox" checked={est.conH} onChange={e => poner({ conH: e.target.checked })} className="h-[1.1rem] w-[1.1rem]" />
        Poner «h» detrás de las horas
      </label>
      <BloqueDias titulo="Lunes a viernes" indices={SEMANA_LABORAL} dias={est.dias} separado={est.sepSemana} alSeparar={v => poner({ sepSemana: v })} alCambiar={ponerDias} />
      <BloqueDias titulo="Sábado y domingo" indices={FIN_DE_SEMANA} dias={est.dias} separado={est.sepFinde} alSeparar={v => poner({ sepFinde: v })} alCambiar={ponerDias} />
      <TarjetaHorario titulo="Festivos" dia={est.festivos} alCambiar={nuevo => poner({ festivos: copiaDia(nuevo) })} />
      <div className="grid gap-[0.7rem]">
        <div>
          <h3 className="font-bold">Otro horario</h3>
          <p className="text-[0.85rem] text-zinc-500">Para casos especiales, como «Agosto» o «Lunes y miércoles».</p>
        </div>
        {est.otros.map((o, i) => (
          <div key={i} className="grid gap-[0.4rem] rounded-[0.9rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
            <input value={o.dias} onChange={e => ponerOtro(i, 'dias', e.target.value)} maxLength={40} className={CAMPO} placeholder="Días (por ejemplo, Agosto)" aria-label={`Días del otro horario ${i + 1}`} />
            <input value={o.horas} onChange={e => ponerOtro(i, 'horas', e.target.value)} maxLength={40} className={CAMPO} placeholder="Horas (por ejemplo, 10:00 a 14:00)" aria-label={`Horas del otro horario ${i + 1}`} />
            <div className="flex items-center justify-between gap-[0.5rem]">
              <button type="button" onClick={() => ponerOtro(i, 'horas', 'Cerrado')} className="text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
                Poner «Cerrado»
              </button>
              <button type="button" onClick={() => poner(e => ({ otros: e.otros.filter((_, k) => k !== i) }))} aria-label={`Quitar el otro horario ${i + 1}`} className="flex items-center gap-[0.3rem] text-[0.85rem] font-semibold text-red-600">
                <Trash2 className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
                Quitar
              </button>
            </div>
          </div>
        ))}
        {limpias.length < MAX_LINEAS_HORARIO && (
          <button type="button" onClick={() => poner(e => ({ otros: [...e.otros, { dias: '', horas: '' }] }))} className="flex items-center justify-center gap-[0.4rem] rounded-[0.8rem] py-[0.7rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500">
            <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Añadir otro horario
          </button>
        )}
      </div>
      <Etiqueta texto="Nota bajo el horario (opcional)">
        <input value={nota} onChange={e => (setAviso(''), setNota(e.target.value))} maxLength={200} className={CAMPO} placeholder="La cocina cierra media hora antes" />
      </Etiqueta>
      <button type="button" onClick={guardar} disabled={!limpias.length || demasiadas || guardando} className={BOTON}>
        {guardando ? 'Publicando...' : !limpias.length ? 'Pon al menos un día' : 'Publicar horario'}
      </button>
      {demasiadas && <p className="text-[0.9rem] font-semibold text-red-600">Hay demasiadas líneas. Junta días con el mismo horario o quita alguna.</p>}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
      {aviso && <p className="text-[0.9rem] font-semibold text-emerald-700">{aviso}</p>}
      <div className="flex flex-wrap items-center gap-x-[1.1rem] gap-y-[0.4rem] justify-self-start text-[0.9rem] font-semibold">
        <a href={`/${fila.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em]">
          Ver mi miniweb
          <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
        </a>
        <BotonCopiar enlace={conDominio(`/${fila.slug}`)} />
      </div>
    </div>
  )
}

// Los horarios de la cuenta: con uno solo, su editor; con varios (un negocio por horario), se elige cuál
export function PanelHorarios({ filas, alGuardar }) {
  const [elegido, setElegido] = useState(filas.length === 1 ? filas[0].slug : null)
  const fila = filas.find(f => f.slug === elegido)
  if (!fila) {
    return (
      <div className="grid gap-[0.6rem]">
        <h2 className="text-[1.3rem] font-bold">Tus horarios</h2>
        {filas.map(f => (
          <button key={f.slug} type="button" onClick={() => setElegido(f.slug)} className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left font-semibold ring-1 ring-zinc-200">
            {f.slug}
          </button>
        ))}
      </div>
    )
  }
  return (
    <>
      {filas.length > 1 && (
        <button type="button" onClick={() => setElegido(null)} className="mb-[0.75rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
          Volver a tus horarios
        </button>
      )}
      <EditorHorarios key={fila.slug} fila={fila} alGuardar={alGuardar} />
    </>
  )
}
