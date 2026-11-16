import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Camera, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import BotonCopiar from '../components/BotonCopiar'
import { conDominio } from '../lib/dominio'
import { supabase } from '../lib/supabase'
import { marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Etiqueta } from '../components/panel'
import { reducirFoto, limpiarOfertas } from './utilidadesMenu'

const OFERTA_VACIA = { nombre: '', descripcion: '', precio: '', antes: '', desde: '', hasta: '' }
// Como mucho, las ofertas que se rellenan de una foto (la función leer-pizarra nunca devuelve más)
const MAX_OFERTAS_FOTO = 8
const hoy = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

/* Editor de ofertas (perfil de belleza o de tienda): cada oferta con su nombre, precio, precio de antes (sale
   tachado) y, si quiere, desde y hasta cuándo. Las que pasan de fecha desaparecen solas de la carta. */
export function EditorOfertas({ fila, alBorrador }) {
  const carta = fila.carta
  const nombre = (carta && marcaDe(carta)?.nombre) || fila.slug
  const [ofertas, setOfertas] = useState(() => {
    const base = fila.ofertas ?? carta?.ofertas ?? { texto: 'Ofertas', titulo: 'Ofertas', lista: [] }
    return { ...base, lista: (base.lista ?? []).map(o => ({ ...OFERTA_VACIA, ...o })) }
  })
  const [estado, setEstado] = useState('')
  const [pregunta, setPregunta] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  // El borrador para la vista previa de al lado (lo mismo que se guardaría al publicar) y si hay cambios sin publicar
  const borradorOfertas = JSON.stringify({ perfil: 'ofertas', ofertas: { lista: limpiarOfertas(ofertas.lista) } })
  const publicado = useRef(borradorOfertas)
  useEffect(() => {
    alBorrador?.({ datos: JSON.parse(borradorOfertas), sinPublicar: borradorOfertas !== publicado.current })
  }, [borradorOfertas])
  useEffect(() => () => alBorrador?.(null), [])

  // Foto de un cartel o lista de ofertas: se reduce en el móvil, la lee la función leer-pizarra (Claude, modo ofertas) y se rellena la lista (no publica)
  const entradaFoto = useRef(null)
  const [leyendo, setLeyendo] = useState(false)
  const [foto, setFoto] = useState(null)
  const leerFoto = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setLeyendo(true)
    setFoto(null)
    setEstado('')
    try {
      const imagen = await reducirFoto(archivo)
      const { data, error } = await supabase.functions.invoke('leer-pizarra', { body: { slug: fila.slug, imagen, tipo: 'image/jpeg', modo: 'ofertas' } })
      if (error) {
        let mensaje = 'No se ha podido leer la foto. Prueba otra vez.'
        try {
          mensaje = (await error.context?.json())?.error ?? mensaje
        } catch {
          // Sin mensaje propio: se queda el genérico
        }
        setFoto({ error: mensaje })
        return
      }
      const leido = data.lectura
      if (!leido?.ofertas?.length) {
        setFoto({ error: leido?.dudas?.[0] ?? 'No he encontrado ofertas en la foto. Prueba con otra más clara.' })
        return
      }
      setOfertas(o => ({ ...o, lista: leido.ofertas.slice(0, MAX_OFERTAS_FOTO).map(x => ({ ...OFERTA_VACIA, ...x })) }))
      setFoto({ ok: true, abierto: true, dudas: leido.dudas ?? [] })
    } catch {
      setFoto({ error: 'No se ha podido leer la foto. Prueba otra vez.' })
    } finally {
      setLeyendo(false)
    }
  }

  const cambiarLista = lista => {
    setOfertas(o => ({ ...o, lista }))
    setEstado('')
  }
  const cambiarOferta = (i, campo, valor) => cambiarLista(ofertas.lista.map((o, j) => (j === i ? { ...o, [campo]: valor } : o)))
  const mover = (i, paso) => {
    const lista = [...ofertas.lista]
    ;[lista[i], lista[i + paso]] = [lista[i + paso], lista[i]]
    cambiarLista(lista)
  }

  const publicar = async () => {
    setEstado('guardando')
    // Fuera las vacías; los precios en euros con el formato de la carta ("19,00 €"); sin campos vacíos
    const lista = limpiarOfertas(ofertas.lista)
    // Solo se guarda la lista: lo demás de las ofertas (fotos, título, texto de la pestaña) es del Editor y no se congela aquí
    const { error } = await supabase.from('cartas').update({ ofertas: { lista } }).eq('slug', fila.slug)
    if (error) return setEstado('error')
    publicado.current = JSON.stringify({ perfil: 'ofertas', ofertas: { lista: limpiarOfertas(lista.map(o => ({ ...OFERTA_VACIA, ...o }))) } })
    setOfertas({ ...ofertas, lista: lista.map(o => ({ ...OFERTA_VACIA, ...o })) })
    setEstado('publicado')
  }

  return (
    <div className="grid gap-[1rem]">
      <div className="flex items-end justify-between gap-[1rem]">
        <div className="min-w-0">
          <p className="text-[0.8rem] text-zinc-500">Ofertas de</p>
          <h1 className="truncate text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        </div>
        {carta && (
          <div className="flex shrink-0 flex-col items-end gap-[0.3rem] text-[0.9rem] font-semibold">
            <a href={rutaCarta(carta)} target="_blank" rel="noreferrer" className="flex items-center gap-[0.2rem] underline underline-offset-[0.2em]">
              Ver mis ofertas
              <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            </a>
            <BotonCopiar enlace={conDominio(rutaCarta(carta))} />
          </div>
        )}
      </div>

      <p className="text-[0.9rem] leading-[1.45] text-zinc-600">
        Las ofertas salen arriba en tu carta. Si les pones fecha de fin, desaparecen solas ese día por la noche.
      </p>

      {/* Rellenar con una foto de un cartel o lista de ofertas: la IA lee las ofertas y las pone en la lista (no publica) */}
      <div className="grid gap-[0.6rem]">
        <input ref={entradaFoto} type="file" accept="image/*" capture="environment" onChange={leerFoto} className="hidden" />
        <button
          type="button"
          disabled={leyendo}
          onClick={() => entradaFoto.current?.click()}
          className="flex items-center justify-center gap-[0.5rem] rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-60"
        >
          <Camera className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          {leyendo ? 'Leyendo tus ofertas...' : 'Rellenar con una foto'}
        </button>
        {!leyendo && !foto && (
          <p className="text-center text-[0.8rem] text-zinc-500">Haz una foto a tu cartel de ofertas, de frente y sin reflejos. Se rellena la lista (cambia la que tienes ahora) y la revisas antes de publicar.</p>
        )}
        {foto?.error && <p className="rounded-[0.6rem] bg-red-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] font-semibold text-red-700">{foto.error}</p>}
        {foto?.ok && (
          <div className="rounded-[0.6rem] bg-emerald-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] text-emerald-800">
            <div className="flex items-start justify-between gap-[0.75rem]">
              <p className="font-semibold">
                Ofertas rellenadas. Revísalas y pulsa Publicar.
                {!foto.abierto && foto.dudas?.length > 0 && (
                  <span className="font-normal text-amber-800"> {foto.dudas.length} {foto.dudas.length === 1 ? 'cosa' : 'cosas'} para revisar.</span>
                )}
              </p>
              <button
                type="button"
                aria-expanded={foto.abierto}
                onClick={() => setFoto(f => ({ ...f, abierto: !f.abierto }))}
                className="shrink-0 font-semibold underline underline-offset-[0.2em]"
              >
                {foto.abierto ? 'Leer menos' : 'Leer más'}
              </button>
            </div>
            {foto.abierto && foto.dudas?.length > 0 && (
              <>
                <p className="mt-[0.4rem] font-semibold text-amber-800">Mira bien esto, no se leía claro:</p>
                <ul className="mt-[0.2rem] list-disc pl-[1.1rem] text-amber-900">
                  {foto.dudas.map(d => <li key={d}>{d}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {ofertas.lista.map((o, i) => {
        const caducada = o.hasta && o.hasta < hoy()
        return (
          <div key={i} className="grid gap-[0.75rem] rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
            <div className="flex items-center justify-between gap-[0.5rem]">
              <p className="text-[0.95rem] font-bold">Oferta {i + 1}</p>
              <div className="flex items-center gap-[0.3rem]">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="rounded-[0.5rem] p-[0.4rem] ring-1 ring-zinc-300 disabled:opacity-25">
                  <ChevronUp className="h-[1rem] w-[1rem]" />
                </button>
                <button type="button" aria-label="Bajar" disabled={i === ofertas.lista.length - 1} onClick={() => mover(i, 1)} className="rounded-[0.5rem] p-[0.4rem] ring-1 ring-zinc-300 disabled:opacity-25">
                  <ChevronDown className="h-[1rem] w-[1rem]" />
                </button>
                <button
                  type="button"
                  aria-label="Borrar oferta"
                  onClick={() => setPregunta({ titulo: '¿Borrar esta oferta?', texto: o.nombre || 'Está vacía.', boton: 'Borrar', peligro: true, accion: () => cambiarLista(ofertas.lista.filter((_, j) => j !== i)) })}
                  className="p-[0.4rem] text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-[1rem] w-[1rem]" />
                </button>
              </div>
            </div>
            {caducada && <p className="text-[0.85rem] font-semibold text-amber-700">Ya ha pasado su fecha: no sale en tu carta.</p>}
            <Etiqueta texto="Nombre">
              <input value={o.nombre} onChange={e => cambiarOferta(i, 'nombre', e.target.value)} className={CAMPO} placeholder="Manicura semipermanente" />
            </Etiqueta>
            <Etiqueta texto="Descripción (opcional)">
              <input value={o.descripcion} onChange={e => cambiarOferta(i, 'descripcion', e.target.value)} className={CAMPO} />
            </Etiqueta>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              <Etiqueta texto="Precio de oferta">
                <input value={o.precio} onChange={e => cambiarOferta(i, 'precio', e.target.value)} className={CAMPO} placeholder="19" inputMode="decimal" />
              </Etiqueta>
              <Etiqueta texto="Precio de antes">
                <input value={o.antes} onChange={e => cambiarOferta(i, 'antes', e.target.value)} className={CAMPO} placeholder="25" inputMode="decimal" />
              </Etiqueta>
            </div>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              <Etiqueta texto="Desde (opcional)">
                <input type="date" value={o.desde} onChange={e => cambiarOferta(i, 'desde', e.target.value)} className={CAMPO} />
              </Etiqueta>
              <Etiqueta texto="Hasta (opcional)">
                <input type="date" value={o.hasta} onChange={e => cambiarOferta(i, 'hasta', e.target.value)} className={CAMPO} />
              </Etiqueta>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => cambiarLista([...ofertas.lista, { ...OFERTA_VACIA }])}
        className="flex items-center justify-center gap-[0.3rem] rounded-[0.8rem] border border-dashed border-zinc-400 py-[0.8rem] text-[0.95rem] font-semibold text-zinc-700"
      >
        <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Añadir oferta
      </button>

      {/* Publicar: fijo abajo para tenerlo siempre a mano en el móvil */}
      <div className="sticky bottom-0 -mx-[1rem] border-t border-zinc-200 bg-zinc-100/95 px-[1rem] pb-[1rem] pt-[0.75rem] backdrop-blur-sm">
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Ya se ven estas ofertas.</p>}
        {estado === 'error' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-red-600">No se ha podido publicar. Prueba otra vez.</p>}
        <button
          type="button"
          onClick={() => setPregunta({ titulo: '¿Publicar estas ofertas?', texto: 'Tus clientes las verán al momento en tu carta.', boton: 'Publicar', accion: publicar })}
          disabled={estado === 'guardando'}
          className={`${BOTON} w-full`}
        >
          {estado === 'guardando' ? 'Publicando...' : 'Publicar'}
        </button>
      </div>

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}
