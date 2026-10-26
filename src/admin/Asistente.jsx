import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { aplicar } from '../lib/ediciones'
import { getNegocio, negocios } from '../negocios'
import { ALERGENOS, cartas, getCarta, marcaDe } from '../cartas'
import { BOTON, CAMPO } from '../components/panel'
import { TIPOGRAFIAS } from '../asistente/tipografias'
import { DISENOS_ASISTENTE, DISENOS_CARTA } from '../asistente/disenos'
import { tipoDe } from '../lib/tematicas'
import { RESERVADAS, aSlug, llamar } from './comun'
import { PERFILES, cambiosDeIA, camposParaIA, crearCartaConDueno, estructuraCarta, fusionar, inicioCopiaCarta, piezasDeIA, piezasParaIA, sinGuionLargo } from './ia'

/* El asistente de IA del panel: el chat que crea una página desde cero y Retocar, que cambia una existente. */

// Pantalla para crear una ficha o miniweb nueva con el asistente: se elige el tipo, se escribe qué negocio es y lo monta
export function CrearConAsistente({ filas, volver, recargar, abrir }) {
  const [perfil, setPerfil] = useState('ficha')
  const [peticion, setPeticion] = useState('')
  const [paso, setPaso] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const crear = async e => {
    e.preventDefault()
    if (!peticion.trim() || paso) return
    setError('')
    setMotivo('')
    try {
      const esCarta = perfil === 'carta'
      const tipoFila = esCarta ? 'carta' : 'negocio'
      const fichas = esCarta ? DISENOS_CARTA : DISENOS_ASISTENTE

      // 1. Elegir la demo de la que parte, solo entre las de este tipo (si solo hay una, esa, sin preguntar a la IA)
      setPaso('Eligiendo el diseño...')
      const disenos = esCarta
        ? Object.entries(DISENOS_CARTA)
            .filter(([s]) => getCarta(s))
            .map(([s, ficha]) => ({ slug: s, nombre: marcaDe(getCarta(s))?.nombre ?? s, sector: `carta ${getCarta(s).diseno}`, ...ficha }))
        : Object.entries(DISENOS_ASISTENTE)
            .filter(([s]) => getNegocio(s) && tipoDe(getNegocio(s)) === perfil)
            .map(([s, ficha]) => ({ slug: s, nombre: getNegocio(s).nombre, sector: getNegocio(s).sector, ...ficha }))
      if (disenos.length === 0) throw new Error('Todavía no hay diseños de este tipo.')
      const eleccion =
        disenos.length === 1
          ? { base: disenos[0].slug, motivo: '' }
          : (await llamar('asistente', { paso: 'elegir', peticion, perfil, disenos })).resultado
      const elegido = disenos.find(d => d.slug === eleccion.base)
      if (!elegido) throw new Error('El asistente no ha elegido un diseño válido. Prueba otra vez.')
      setMotivo(`Parte de ${elegido.nombre}.${eleccion.motivo ? ` ${eleccion.motivo}` : ''}`)

      // 2. Textos, colores, tipografía, búsquedas de fotos y, en las cartas, secciones, platos y menú del día.
      // Una carta nueva nace con su propia marca (copia de la de la demo), que la IA adapta
      setPaso(esCarta ? 'Escribiendo la carta...' : 'Escribiendo textos y eligiendo colores...')
      const plantilla = esCarta ? getCarta(eleccion.base) : getNegocio(eleccion.base)
      const inicio = esCarta ? inicioCopiaCarta(plantilla) : {}
      const preparada = aplicar(plantilla, inicio)
      const campos = camposParaIA(preparada)
      const { resultado } = await llamar('asistente', {
        paso: 'rellenar',
        peticion,
        perfil,
        demo: { slug: eleccion.base, nombre: elegido.nombre, sector: elegido.sector, estilo: fichas[eleccion.base].estilo },
        campos,
        carta: estructuraCarta(preparada),
        alergenos: Object.keys(ALERGENOS),
        tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
        // En las fichas, también el aspecto: el diseño de arriba y el estilo de pestañas
        ...(perfil === 'ficha' ? { piezas: piezasParaIA(), disenoActual: plantilla.hero?.diseno } : {}),
      })

      // 3. Fotos de Unsplash
      setPaso('Buscando fotos...')
      const cambios = fusionar(inicio, { ...(await cambiosDeIA(resultado, campos, preparada)), ...(perfil === 'ficha' ? piezasDeIA(resultado, preparada) : {}) })

      // 4. La copia, en una dirección libre (si ya existe, se le añade un número)
      setPaso('Creando...')
      const ocupadas = new Set([
        ...(filas ?? []).filter(f => f.tipo === tipoFila).map(f => f.slug),
        ...(esCarta ? cartas : negocios).map(n => n.slug),
        ...RESERVADAS,
      ])
      const nombre = esCarta ? cambios['marca.nombre'] ?? cambios.marca?.nombre : cambios.nombre
      const raiz = aSlug(resultado.slug || nombre || 'nueva') || 'nueva'
      let slug = raiz
      for (let n = 2; ocupadas.has(slug); n++) slug = `${raiz}-${n}`
      const { error } = await supabase
        .from('ediciones')
        .insert({ tipo: tipoFila, slug, base: eleccion.base, cambios, historial: [{ peticion, resumen: sinGuionLargo(resultado.resumen ?? '') }] })
      if (error) throw new Error('No se ha podido guardar.')
      if (esCarta) await crearCartaConDueno(slug, aplicar(plantilla, cambios).menuDia)
      await recargar()
      abrir(`${tipoFila}:${slug}`)
    } catch (e) {
      setError(e.message)
      setPaso(null)
    }
  }

  return (
    <div className="grid gap-[1rem]">
      <button type="button" onClick={volver} className="inline-flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold">
        <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Todas
      </button>
      <div>
        <h1 className="text-[1.5rem] font-bold leading-tight">Crear con el asistente</h1>
        <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-zinc-600">
          Cuéntale qué negocio es. Elige uno de tus diseños, escribe los textos, pone colores, tipografía y fotos, y crea una copia que luego puedes retocar.
        </p>
      </div>
      <form onSubmit={crear} className="grid gap-[0.75rem]">
        {/* Qué tipo de página crea: la IA solo elige entre los diseños de ese tipo */}
        <div role="tablist" aria-label="Tipo de página" className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {PERFILES.map(p => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={perfil === p.id}
              disabled={p.desactivado || Boolean(paso)}
              onClick={() => setPerfil(p.id)}
              className={`rounded-[0.55rem] py-[0.55rem] text-[0.95rem] font-semibold transition-colors disabled:cursor-not-allowed ${
                perfil === p.id ? 'bg-white text-zinc-900 shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'
              } ${p.desactivado ? 'opacity-40' : ''}`}
            >
              {p.texto}
            </button>
          ))}
        </div>
        <p className="text-[0.82rem] text-zinc-500">
          {perfil === 'miniweb'
            ? 'Varias páginas, como una web: inicio, menú, horario y reservas.'
            : perfil === 'carta'
              ? 'Carta digital para el QR de la mesa: menú del día y carta por secciones, con su propia marca. Pásale los platos y precios que tengas.'
              : 'Una pantalla con lo esencial: pestañas, reseña de Google y redes.'}
        </p>
        <textarea
          autoFocus
          value={peticion}
          onChange={e => setPeticion(e.target.value)}
          disabled={Boolean(paso)}
          rows={5}
          placeholder={PERFILES.find(p => p.id === perfil).ejemplo}
          className={`${CAMPO} resize-y`}
        />
        <button type="submit" disabled={!peticion.trim() || Boolean(paso)} className={BOTON}>
          {paso ?? (perfil === 'miniweb' ? 'Crear miniweb' : perfil === 'carta' ? 'Crear menú y ofertas' : 'Crear ficha')}
        </button>
      </form>
      {motivo && <p className="text-[0.9rem] leading-[1.45] text-zinc-600">{motivo}</p>}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
    </div>
  )
}

// Chat del editor de una copia: lo pedido antes (con lo que hizo el asistente) y el cuadro para pedir un retoque
export function Retocar({ historial, enviar }) {
  const [peticion, setPeticion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const mandar = async e => {
    e.preventDefault()
    if (!peticion.trim() || enviando) return
    setEnviando(true)
    setError('')
    try {
      await enviar(peticion.trim())
      setPeticion('')
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
      <h2 className="text-[1rem] font-bold">Asistente</h2>
      {historial.length > 0 && (
        <ol className="mt-[0.6rem] grid max-h-[14rem] gap-[0.6rem] overflow-y-auto">
          {historial.map((h, i) => (
            <li key={i} className="text-[0.88rem] leading-[1.45]">
              <p className="font-semibold">{h.peticion}</p>
              {h.resumen && <p className="text-zinc-600">{h.resumen}</p>}
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={mandar} className="mt-[0.75rem] flex gap-[0.5rem]">
        <input
          value={peticion}
          onChange={e => setPeticion(e.target.value)}
          disabled={enviando}
          placeholder="Más oscuro, lema más corto, otra foto..."
          className={CAMPO}
          enterKeyHint="send"
        />
        <button type="submit" disabled={!peticion.trim() || enviando} className={`${BOTON} shrink-0`}>
          {enviando ? 'Pensando...' : 'Pedir'}
        </button>
      </form>
      {error && <p className="mt-[0.5rem] text-[0.85rem] font-semibold text-red-600">{error}</p>}
    </section>
  )
}
