import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { BOTON, CAMPO } from '../../components/panel'
import Mapa, { COLORES_WEB } from './Mapa'
import { SECTORES, nombreDeSector } from './sectores'
import { consultarZona, distanciaM } from './overpass'
import { anotarUso, guardarLimites, leerUsos } from './usos'
import { estadosDe, guardadosEn, guardarProspectos, guardarZona, zonaParecida } from './guardado'

/* Buscar clientes (/admin?editar=clientes): se elige un círculo en el mapa y los sectores, y "Analizar esta zona" pregunta a OpenStreetMap qué
   negocios hay y si tienen web. "Sin web en OpenStreetMap" es solo una pista: antes de ir conviene comprobarlo en Google (el enlace de cada fila). */

const CENTRO_INICIAL = { lat: 41.4036, lon: 2.156 }
const SECTORES_INICIALES = ['peluqueria', 'barberia', 'estetica', 'unas']
const ORDEN_WEB = { sin: 0, redes: 1, con: 2 }
const TEXTO_WEB = { sin: 'Sin web en OpenStreetMap', redes: 'Solo redes', con: 'Con web' }

const hace = creado => {
  const dias = Math.floor((Date.now() - new Date(creado).getTime()) / 86400000)
  return dias <= 0 ? 'hoy' : dias === 1 ? 'ayer' : `hace ${dias} días`
}

const enlaceGoogle = n => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([n.nombre, n.direccion, 'Barcelona'].filter(Boolean).join(' '))}`

export default function Prospeccion({ volver }) {
  const [centro, setCentro] = useState(CENTRO_INICIAL)
  const [radio, setRadio] = useState(400)
  const [sectores, setSectores] = useState(SECTORES_INICIALES)
  const [negocios, setNegocios] = useState(null)
  // El centro con el que se analizó: las distancias de la lista no cambian si luego mueves el círculo
  const [centroAnalizado, setCentroAnalizado] = useState(CENTRO_INICIAL)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState(null)
  const [usos, setUsos] = useState(null)
  const [editandoLimites, setEditandoLimites] = useState(false)
  const [limites, setLimites] = useState({ diario: '', mensual: '' })

  const cargarUsos = useCallback(() => leerUsos().then(setUsos).catch(() => {}), [])
  useEffect(() => {
    cargarUsos()
  }, [cargarUsos])

  const sinCupo = usos && (usos.hoy >= usos.limiteDiario || usos.mes >= usos.limiteMensual)
  const elegirCentro = nuevo => {
    setCentro(nuevo)
    setAviso(null)
  }
  const cambiarSector = clave => {
    setAviso(null)
    setSectores(s => (s.includes(clave) ? s.filter(x => x !== clave) : [...s, clave]))
  }

  // Los negocios con el estado que ya tenían guardado
  const conEstados = async lista => {
    const estados = await estadosDe(lista.map(n => n.id))
    return lista.map(n => ({ ...n, ...(estados.get(n.id) ?? {}) }))
  }

  const analizar = async (repetir = false) => {
    if (cargando || !sectores.length || sinCupo) return
    setError('')
    setAviso(null)
    setCargando(true)
    try {
      if (!repetir) {
        const parecida = await zonaParecida({ centro, radio, sectores })
        if (parecida) {
          setAviso(parecida)
          return
        }
      }
      const encontrados = await consultarZona({ ...centro, radio, sectores })
      await anotarUso('zona')
      const zonaId = await guardarZona({ centro, radio, sectores, total: encontrados.length })
      await guardarProspectos(encontrados, zonaId)
      setCentroAnalizado(centro)
      setNegocios(await conEstados(encontrados))
    } catch (e) {
      setError(e.message || 'No se ha podido analizar la zona.')
    } finally {
      setCargando(false)
      cargarUsos()
    }
  }

  const verGuardado = async () => {
    setAviso(null)
    setError('')
    setCargando(true)
    try {
      setCentroAnalizado(centro)
      setNegocios(await guardadosEn({ centro, radio, sectores }))
    } catch (e) {
      setError(e.message || 'No se ha podido leer lo guardado.')
    } finally {
      setCargando(false)
    }
  }

  const guardarCambioDeLimites = async () => {
    const diario = Number(limites.diario)
    const mensual = Number(limites.mensual)
    if (!(diario >= 1 && mensual >= 1)) return setError('Los límites tienen que ser números de 1 en adelante.')
    try {
      await guardarLimites({ diario, mensual })
      setEditandoLimites(false)
      setError('')
      cargarUsos()
    } catch {
      setError('No se han podido guardar los límites.')
    }
  }

  const ordenados = useMemo(
    () => (negocios ?? []).map(n => ({ ...n, metros: distanciaM(centroAnalizado, n) })).sort((a, b) => ORDEN_WEB[a.webEstado] - ORDEN_WEB[b.webEstado] || a.metros - b.metros),
    [negocios, centroAnalizado]
  )
  const cuenta = clave => ordenados.filter(n => n.webEstado === clave).length

  return (
    <div className="grid gap-[1rem]">
      <div className="flex items-center gap-[0.6rem]">
        <button type="button" onClick={volver} aria-label="Volver" className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] hover:bg-zinc-200">
          <ArrowLeft className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </button>
        <h1 className="text-[1.4rem] font-bold">Buscar clientes</h1>
      </div>

      <div className="grid gap-[1rem] lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="grid gap-[0.5rem]">
          <Mapa centro={centro} radio={radio} negocios={negocios} alElegirCentro={elegirCentro} />
          <p className="text-[0.85rem] text-zinc-500">Toca el mapa para mover el centro del círculo.</p>
        </div>

        <div className="grid gap-[1rem]">
          <div className="grid gap-[0.4rem] rounded-[0.9rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
            <label className="grid gap-[0.3rem]">
              <span className="text-[0.9rem] font-semibold">Radio: {radio} m</span>
              <input type="range" min="100" max="1500" step="50" value={radio} onChange={e => (setAviso(null), setRadio(Number(e.target.value)))} />
            </label>
            <div className="mt-[0.4rem] flex flex-wrap gap-[0.4rem]" role="group" aria-label="Sectores">
              {SECTORES.map(s => (
                <button
                  key={s.clave}
                  type="button"
                  aria-pressed={sectores.includes(s.clave)}
                  onClick={() => cambiarSector(s.clave)}
                  className={`rounded-full px-[0.8rem] py-[0.35rem] text-[0.85rem] font-semibold ${sectores.includes(s.clave) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300'}`}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => analizar(false)} disabled={cargando || !sectores.length || sinCupo} className={`${BOTON} mt-[0.6rem]`}>
              {cargando ? 'Analizando...' : sinCupo ? 'Has llegado al límite de consultas' : 'Analizar esta zona'}
            </button>
            {!sectores.length && <p className="text-[0.85rem] text-zinc-500">Elige al menos un sector.</p>}
          </div>

          {usos && (
            <div className="rounded-[0.9rem] bg-white p-[0.9rem] text-[0.85rem] ring-1 ring-zinc-200">
              <p>
                Consultas hoy: <b>{usos.hoy}</b> de {usos.limiteDiario}. Este mes: <b>{usos.mes}</b> de {usos.limiteMensual}.
              </p>
              {editandoLimites ? (
                <div className="mt-[0.5rem] grid gap-[0.5rem]">
                  <div className="grid grid-cols-2 gap-[0.5rem]">
                    <input type="number" min="1" value={limites.diario} onChange={e => setLimites(l => ({ ...l, diario: e.target.value }))} className={CAMPO} aria-label="Límite diario" placeholder="Por día" />
                    <input type="number" min="1" value={limites.mensual} onChange={e => setLimites(l => ({ ...l, mensual: e.target.value }))} className={CAMPO} aria-label="Límite mensual" placeholder="Por mes" />
                  </div>
                  <div className="flex gap-[0.8rem]">
                    <button type="button" onClick={guardarCambioDeLimites} className="font-semibold underline underline-offset-[0.2em]">
                      Guardar límites
                    </button>
                    <button type="button" onClick={() => setEditandoLimites(false)} className="text-zinc-500 underline underline-offset-[0.2em]">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLimites({ diario: String(usos.limiteDiario), mensual: String(usos.limiteMensual) })
                    setEditandoLimites(true)
                  }}
                  className="mt-[0.3rem] font-semibold underline underline-offset-[0.2em]"
                >
                  Cambiar límites
                </button>
              )}
            </div>
          )}

          {aviso && (
            <div className="grid gap-[0.5rem] rounded-[0.9rem] bg-amber-50 p-[0.9rem] text-[0.9rem] ring-1 ring-amber-300">
              <p>Ya analizaste una zona parecida {hace(aviso.creado)}. No hace falta gastar otra consulta si no ha cambiado nada.</p>
              <div className="flex flex-wrap gap-[0.8rem]">
                <button type="button" onClick={verGuardado} className="font-semibold underline underline-offset-[0.2em]">
                  Ver lo guardado
                </button>
                <button type="button" onClick={() => analizar(true)} className="font-semibold underline underline-offset-[0.2em]">
                  Repetir la consulta
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
        </div>
      </div>

      {negocios && (
        <section className="grid gap-[0.6rem]">
          <div>
            <h2 className="text-[1.2rem] font-bold">{ordenados.length} negocios</h2>
            <p className="text-[0.85rem] text-zinc-500">
              {cuenta('sin')} sin web en OpenStreetMap, {cuenta('redes')} solo redes y {cuenta('con')} con web. Comprueba en Google antes de ir: que aquí no tengan web no
              significa que no la tengan.
            </p>
          </div>
          {ordenados.length === 0 && <p className="text-zinc-500">No hay negocios de estos sectores en esa zona.</p>}
          <ul className="grid gap-[0.5rem]">
            {ordenados.map(n => (
              <li key={n.id} className="flex items-start gap-[0.7rem] rounded-[0.9rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
                <span className="mt-[0.35rem] h-[0.8rem] w-[0.8rem] shrink-0 rounded-full" style={{ background: COLORES_WEB[n.webEstado] }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{n.nombre}</p>
                  <p className="text-[0.85rem] text-zinc-500">
                    {nombreDeSector(n.sector)} · {n.metros} m{n.direccion ? ` · ${n.direccion}` : ''}
                  </p>
                  <p className="text-[0.85rem] font-semibold">{TEXTO_WEB[n.webEstado]}</p>
                  <a href={enlaceGoogle(n)} target="_blank" rel="noreferrer" className="mt-[0.2rem] inline-flex items-center gap-[0.2rem] text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
                    Comprobar en Google
                    <ArrowUpRight className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
