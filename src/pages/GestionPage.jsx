import { useEffect, useRef, useState } from 'react'
import { Lock, Trash2 } from 'lucide-react'

/* Gestión interna, solo para Jesús. Solo existe con el servidor de desarrollo (npm run dev):
   no se publica en Netlify y sus datos viven en gestion/datos.json (fuera de git).
   Secciones:
   - Gastos: apuntar cada gasto (concepto, importe y fecha) y ver el total. Es la que se usa de momento.
   - Resumen, Inventario, Compras, Kits y Clientes: hechas pero bloqueadas (BLOQUEADAS) hasta que haya clientes.
     · Resumen: lo invertido, lo cobrado, lo que cuesta lo entregado y lo que queda.
     · Inventario: cada material, cuántos quedan (comprados menos entregados) y cuánto cuesta cada uno.
     · Compras: lo que se compra; suma al inventario y fija el coste real de cada material (media de las compras).
     · Kits: qué lleva cada plan (placas, pegatinas...) y cuánto cuesta.
     · Clientes: cada venta, con su kit; descuenta del inventario y calcula lo que queda limpio. */

const API = '/__gestion/datos'

// Secciones bloqueadas: se ven pero no se pueden abrir. Para desbloquear una, quitarla de aquí
const BLOQUEADAS = ['resumen', 'inventario', 'compras', 'kits', 'clientes']

const nuevoId = () => crypto.randomUUID()
const hoy = () => new Date().toISOString().slice(0, 10)
const euros = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

// Datos de partida la primera vez: los materiales del kit con un coste estimado (hasta que haya compras reales)
const INICIALES = () => {
  const m = (nombre, costeEstimado, minimo = 2) => ({ id: nuevoId(), nombre, costeEstimado, minimo })
  const materiales = [
    m('Impresión en cartulina', 0.75, 4),
    m('Plastificado', 0.75, 4),
    m('Expositor de metacrilato A6', 2, 2),
    m('Pegatina NFC', 0.5, 4),
    m('Pegatina de vinilo', 1.5, 4),
    m('Sobre de entrega', 0.5, 2),
  ]
  const [impresion, plastificado, expositor, nfc, vinilo, sobre] = materiales
  return {
    gastos: [],
    materiales,
    compras: [],
    kits: [
      {
        id: nuevoId(),
        nombre: 'Plan Base (2 placas)',
        piezas: [
          { materialId: impresion.id, cantidad: 2 },
          { materialId: plastificado.id, cantidad: 2 },
          { materialId: expositor.id, cantidad: 2 },
          { materialId: nfc.id, cantidad: 2 },
          { materialId: sobre.id, cantidad: 1 },
        ],
      },
      { id: nuevoId(), nombre: '2 pegatinas extra', piezas: [{ materialId: vinilo.id, cantidad: 2 }] },
    ],
    clientes: [],
  }
}

// Coste por unidad de un material: la media de lo pagado en sus compras; sin compras, el coste estimado
const costeUnidad = (datos, materialId) => {
  const compras = datos.compras.filter(c => c.materialId === materialId)
  const unidades = compras.reduce((s, c) => s + Number(c.cantidad), 0)
  if (unidades > 0) return compras.reduce((s, c) => s + Number(c.total), 0) / unidades
  return Number(datos.materiales.find(m => m.id === materialId)?.costeEstimado) || 0
}

const costeKit = (datos, kit) => (kit?.piezas ?? []).reduce((s, p) => s + costeUnidad(datos, p.materialId) * Number(p.cantidad), 0)

// Unidades de cada material que se han entregado a clientes (sumando los kits de todas las ventas)
const entregados = (datos, materialId) =>
  datos.clientes.reduce((s, c) => {
    const piezas = c.kitIds.flatMap(id => datos.kits.find(k => k.id === id)?.piezas ?? [])
    return s + piezas.filter(p => p.materialId === materialId).reduce((t, p) => t + Number(p.cantidad), 0)
  }, 0)

const comprados = (datos, materialId) =>
  datos.compras.filter(c => c.materialId === materialId).reduce((s, c) => s + Number(c.cantidad), 0)

const costeCliente = (datos, cliente) => cliente.kitIds.reduce((s, id) => s + costeKit(datos, datos.kits.find(k => k.id === id)), 0)

const SECCIONES = [
  { key: 'gastos', texto: 'Gastos' },
  { key: 'resumen', texto: 'Resumen' },
  { key: 'inventario', texto: 'Inventario' },
  { key: 'compras', texto: 'Compras' },
  { key: 'kits', texto: 'Kits' },
  { key: 'clientes', texto: 'Clientes' },
]

const CAMPO = 'w-full min-w-0 rounded-[0.5rem] border border-zinc-300 bg-white px-[0.65rem] py-[0.5rem] text-[0.92rem] focus:border-zinc-900 focus:outline-none'
const BOTON = 'rounded-[0.5rem] bg-zinc-900 px-[1rem] py-[0.55rem] text-[0.9rem] font-semibold text-white disabled:opacity-40'

function Etiqueta({ texto, children, className = '' }) {
  return (
    <label className={`grid gap-[0.25rem] ${className}`}>
      <span className="text-[0.75rem] font-semibold text-zinc-500">{texto}</span>
      {children}
    </label>
  )
}

function Borrar({ onClick, titulo }) {
  return (
    <button type="button" onClick={onClick} aria-label={titulo} title={titulo} className="shrink-0 p-[0.3rem] text-zinc-400 hover:text-red-600">
      <Trash2 className="h-[1rem] w-[1rem]" />
    </button>
  )
}

function Dato({ texto, valor, fuerte = false }) {
  return (
    <div className="rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
      <p className="text-[0.78rem] text-zinc-500">{texto}</p>
      <p className={`mt-[0.2rem] text-[1.35rem] font-bold ${fuerte ? 'text-emerald-700' : ''}`}>{valor}</p>
    </div>
  )
}

// Gastos: concepto, importe y fecha; la lista y el total
function Gastos({ datos, cambiar }) {
  const [fecha, setFecha] = useState(hoy())
  const [concepto, setConcepto] = useState('')
  const [importe, setImporte] = useState('')

  const anadir = e => {
    e.preventDefault()
    cambiar(d => ({ ...d, gastos: [...d.gastos, { id: nuevoId(), fecha, concepto: concepto.trim(), importe: Number(importe) }] }))
    setConcepto('')
    setImporte('')
  }

  const lista = [...datos.gastos].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const total = lista.reduce((s, g) => s + Number(g.importe), 0)

  return (
    <div>
      <form onSubmit={anadir} className="grid gap-[0.6rem] rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
        <input required value={concepto} onChange={e => setConcepto(e.target.value)} className={CAMPO} placeholder="Concepto (expositores, pegatinas NFC...)" aria-label="Concepto" />
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <input type="number" step="0.01" min="0" required value={importe} onChange={e => setImporte(e.target.value)} className={CAMPO} placeholder="Importe (€)" aria-label="Importe" />
          <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className={CAMPO} aria-label="Fecha" />
        </div>
        <button type="submit" className={BOTON}>Añadir gasto</button>
      </form>

      <div className="mt-[1rem] flex items-baseline justify-between px-[0.2rem]">
        <p className="text-[0.85rem] text-zinc-500">Total gastado</p>
        <p className="text-[1.4rem] font-bold">{euros(total)}</p>
      </div>

      {lista.length > 0 && (
        <ul className="mt-[0.5rem] divide-y divide-zinc-200 rounded-[0.75rem] bg-white ring-1 ring-zinc-200">
          {lista.map(g => (
            <li key={g.id} className="flex items-center gap-[0.75rem] px-[0.9rem] py-[0.65rem]">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.concepto}</p>
                <p className="text-[0.78rem] text-zinc-500">{g.fecha}</p>
              </div>
              <p className="font-bold">{euros(g.importe)}</p>
              <Borrar titulo={`Borrar ${g.concepto}`} onClick={() => cambiar(d => ({ ...d, gastos: d.gastos.filter(x => x.id !== g.id) }))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Resumen({ datos }) {
  const invertido = datos.compras.reduce((s, c) => s + Number(c.total), 0)
  const cobrado = datos.clientes.reduce((s, c) => s + Number(c.precio), 0)
  const costeEntregado = datos.clientes.reduce((s, c) => s + costeCliente(datos, c), 0)
  const bajos = datos.materiales.filter(m => comprados(datos, m.id) - entregados(datos, m.id) <= Number(m.minimo))

  return (
    <div className="grid gap-[0.75rem]">
      <div className="grid grid-cols-2 gap-[0.6rem]">
        <Dato texto="Invertido en material" valor={euros(invertido)} />
        <Dato texto="Cobrado" valor={euros(cobrado)} />
        <Dato texto="Coste de lo entregado" valor={euros(costeEntregado)} />
        <Dato texto="Te queda limpio" valor={euros(cobrado - costeEntregado)} fuerte />
      </div>
      <div className="grid grid-cols-2 gap-[0.6rem]">
        <Dato texto="Clientes" valor={datos.clientes.length} />
        <Dato texto="Margen medio por cliente" valor={euros(datos.clientes.length ? (cobrado - costeEntregado) / datos.clientes.length : 0)} />
      </div>
      <p className="text-[0.8rem] text-zinc-500">
        Caja (cobrado menos todo lo invertido, incluido el material que aún tienes en casa): <strong className="text-zinc-900">{euros(cobrado - invertido)}</strong>
      </p>
      {bajos.length > 0 && (
        <div className="rounded-[0.75rem] bg-amber-50 p-[0.9rem] text-[0.88rem] ring-1 ring-amber-200">
          <p className="font-semibold text-amber-800">Toca reponer</p>
          <ul className="mt-[0.3rem] list-disc pl-[1.1rem] text-amber-900">
            {bajos.map(m => <li key={m.id}>{m.nombre}: quedan {comprados(datos, m.id) - entregados(datos, m.id)}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function Inventario({ datos, cambiar }) {
  const [nombre, setNombre] = useState('')
  const [coste, setCoste] = useState('')
  const [minimo, setMinimo] = useState('2')

  const anadir = e => {
    e.preventDefault()
    cambiar(d => ({ ...d, materiales: [...d.materiales, { id: nuevoId(), nombre: nombre.trim(), costeEstimado: Number(coste) || 0, minimo: Number(minimo) || 0 }] }))
    setNombre('')
    setCoste('')
  }

  const borrar = id => {
    if (datos.compras.some(c => c.materialId === id) || datos.kits.some(k => k.piezas.some(p => p.materialId === id))) {
      alert('Este material tiene compras o va en algún kit. Quítalo de ahí primero.')
      return
    }
    cambiar(d => ({ ...d, materiales: d.materiales.filter(m => m.id !== id) }))
  }

  return (
    <div className="grid gap-[1rem]">
      <ul className="divide-y divide-zinc-200 rounded-[0.75rem] bg-white ring-1 ring-zinc-200">
        {datos.materiales.map(m => {
          const quedan = comprados(datos, m.id) - entregados(datos, m.id)
          const conCompras = comprados(datos, m.id) > 0
          return (
            <li key={m.id} className="flex items-center gap-[0.75rem] px-[0.9rem] py-[0.7rem]">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.nombre}</p>
                <p className="text-[0.78rem] text-zinc-500">
                  {euros(costeUnidad(datos, m.id))} la unidad {conCompras ? '(según tus compras)' : '(estimado)'}
                </p>
              </div>
              <p className={`text-right text-[0.95rem] font-bold ${quedan <= Number(m.minimo) ? 'text-amber-700' : ''}`}>
                {quedan}
                <span className="block text-[0.7rem] font-normal text-zinc-500">quedan</span>
              </p>
              <Borrar titulo={`Borrar ${m.nombre}`} onClick={() => borrar(m.id)} />
            </li>
          )
        })}
      </ul>

      <form onSubmit={anadir} className="grid gap-[0.6rem] rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
        <p className="font-semibold">Nuevo material</p>
        <Etiqueta texto="Nombre">
          <input required value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Por ejemplo, cinta de doble cara" />
        </Etiqueta>
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <Etiqueta texto="Coste estimado por unidad (€)">
            <input type="number" step="0.01" min="0" value={coste} onChange={e => setCoste(e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Avisar cuando queden">
            <input type="number" min="0" value={minimo} onChange={e => setMinimo(e.target.value)} className={CAMPO} />
          </Etiqueta>
        </div>
        <button type="submit" className={BOTON}>Añadir material</button>
      </form>
    </div>
  )
}

function Compras({ datos, cambiar }) {
  const [fecha, setFecha] = useState(hoy())
  const [materialId, setMaterialId] = useState(datos.materiales[0]?.id ?? '')
  const [cantidad, setCantidad] = useState('')
  const [total, setTotal] = useState('')
  const [tienda, setTienda] = useState('')

  const anadir = e => {
    e.preventDefault()
    cambiar(d => ({ ...d, compras: [...d.compras, { id: nuevoId(), fecha, materialId, cantidad: Number(cantidad), total: Number(total), tienda: tienda.trim() }] }))
    setCantidad('')
    setTotal('')
  }

  const nombreDe = id => datos.materiales.find(m => m.id === id)?.nombre ?? 'Material borrado'
  const lista = [...datos.compras].sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="grid gap-[1rem]">
      <form onSubmit={anadir} className="grid gap-[0.6rem] rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
        <p className="font-semibold">Nueva compra</p>
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <Etiqueta texto="Fecha">
            <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Tienda">
            <input value={tienda} onChange={e => setTienda(e.target.value)} className={CAMPO} placeholder="Amazon, copistería..." />
          </Etiqueta>
        </div>
        <Etiqueta texto="Material">
          <select required value={materialId} onChange={e => setMaterialId(e.target.value)} className={CAMPO}>
            {datos.materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </Etiqueta>
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <Etiqueta texto="Unidades">
            <input type="number" min="1" required value={cantidad} onChange={e => setCantidad(e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Total pagado (€)">
            <input type="number" step="0.01" min="0" required value={total} onChange={e => setTotal(e.target.value)} className={CAMPO} />
          </Etiqueta>
        </div>
        {cantidad > 0 && total > 0 && <p className="text-[0.8rem] text-zinc-500">Sale a {euros(total / cantidad)} la unidad.</p>}
        <button type="submit" className={BOTON} disabled={!materialId}>Añadir compra</button>
      </form>

      {lista.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-[0.75rem] bg-white ring-1 ring-zinc-200">
          {lista.map(c => (
            <li key={c.id} className="flex items-center gap-[0.75rem] px-[0.9rem] py-[0.7rem]">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.cantidad} × {nombreDe(c.materialId)}</p>
                <p className="text-[0.78rem] text-zinc-500">{c.fecha}{c.tienda && ` · ${c.tienda}`}</p>
              </div>
              <p className="font-bold">{euros(c.total)}</p>
              <Borrar titulo="Borrar compra" onClick={() => cambiar(d => ({ ...d, compras: d.compras.filter(x => x.id !== c.id) }))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Kits({ datos, cambiar }) {
  const [nombre, setNombre] = useState('')

  const cambiarKit = (id, f) => cambiar(d => ({ ...d, kits: d.kits.map(k => (k.id === id ? f(k) : k)) }))

  const nuevoKit = e => {
    e.preventDefault()
    cambiar(d => ({ ...d, kits: [...d.kits, { id: nuevoId(), nombre: nombre.trim(), piezas: [] }] }))
    setNombre('')
  }

  const borrarKit = id => {
    if (datos.clientes.some(c => c.kitIds.includes(id))) {
      alert('Este kit está en alguna venta. Quítalo de ahí primero.')
      return
    }
    cambiar(d => ({ ...d, kits: d.kits.filter(k => k.id !== id) }))
  }

  return (
    <div className="grid gap-[1rem]">
      {datos.kits.map(k => (
        <div key={k.id} className="rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
          <div className="flex items-center gap-[0.75rem]">
            <p className="min-w-0 flex-1 font-semibold">{k.nombre}</p>
            <p className="font-bold">{euros(costeKit(datos, k))}</p>
            <Borrar titulo={`Borrar ${k.nombre}`} onClick={() => borrarKit(k.id)} />
          </div>
          <ul className="mt-[0.5rem] divide-y divide-zinc-100">
            {k.piezas.map((p, i) => (
              <li key={i} className="flex items-center gap-[0.6rem] py-[0.4rem] text-[0.88rem]">
                <input
                  type="number"
                  min="1"
                  value={p.cantidad}
                  onChange={e => cambiarKit(k.id, kit => ({ ...kit, piezas: kit.piezas.map((x, j) => (j === i ? { ...x, cantidad: Number(e.target.value) || 1 } : x)) }))}
                  aria-label="Cantidad"
                  className={`${CAMPO} w-[3.6rem] py-[0.3rem]`}
                />
                <span className="min-w-0 flex-1">{datos.materiales.find(m => m.id === p.materialId)?.nombre ?? 'Material borrado'}</span>
                <span className="text-zinc-500">{euros(costeUnidad(datos, p.materialId) * p.cantidad)}</span>
                <Borrar titulo="Quitar del kit" onClick={() => cambiarKit(k.id, kit => ({ ...kit, piezas: kit.piezas.filter((_, j) => j !== i) }))} />
              </li>
            ))}
          </ul>
          <select
            value=""
            onChange={e => e.target.value && cambiarKit(k.id, kit => ({ ...kit, piezas: [...kit.piezas, { materialId: e.target.value, cantidad: 1 }] }))}
            className={`${CAMPO} mt-[0.5rem] text-zinc-500`}
            aria-label="Añadir material al kit"
          >
            <option value="">+ Añadir material al kit</option>
            {datos.materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
      ))}

      <form onSubmit={nuevoKit} className="flex gap-[0.6rem]">
        <input required value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Nombre del kit nuevo" aria-label="Nombre del kit nuevo" />
        <button type="submit" className={`${BOTON} shrink-0`}>Crear kit</button>
      </form>
    </div>
  )
}

function Clientes({ datos, cambiar }) {
  const [fecha, setFecha] = useState(hoy())
  const [negocio, setNegocio] = useState('')
  const [kitIds, setKitIds] = useState(datos.kits[0] ? [datos.kits[0].id] : [])
  const [precio, setPrecio] = useState('')
  const [nota, setNota] = useState('')

  const alternarKit = id => setKitIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))

  const anadir = e => {
    e.preventDefault()
    cambiar(d => ({ ...d, clientes: [...d.clientes, { id: nuevoId(), fecha, negocio: negocio.trim(), kitIds, precio: Number(precio), nota: nota.trim() }] }))
    setNegocio('')
    setPrecio('')
    setNota('')
  }

  const lista = [...datos.clientes].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const costeNuevo = kitIds.reduce((s, id) => s + costeKit(datos, datos.kits.find(k => k.id === id)), 0)

  return (
    <div className="grid gap-[1rem]">
      <form onSubmit={anadir} className="grid gap-[0.6rem] rounded-[0.75rem] bg-white p-[0.9rem] ring-1 ring-zinc-200">
        <p className="font-semibold">Nueva venta</p>
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <Etiqueta texto="Negocio">
            <input required value={negocio} onChange={e => setNegocio(e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Fecha">
            <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className={CAMPO} />
          </Etiqueta>
        </div>
        <div className="grid gap-[0.25rem]">
          <span className="text-[0.75rem] font-semibold text-zinc-500">Qué se lleva</span>
          {datos.kits.map(k => (
            <label key={k.id} className="flex items-center gap-[0.5rem] text-[0.9rem]">
              <input type="checkbox" checked={kitIds.includes(k.id)} onChange={() => alternarKit(k.id)} className="h-[1rem] w-[1rem] accent-zinc-900" />
              <span className="flex-1">{k.nombre}</span>
              <span className="text-zinc-500">{euros(costeKit(datos, k))}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <Etiqueta texto="Precio cobrado (€)">
            <input type="number" step="0.01" min="0" required value={precio} onChange={e => setPrecio(e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Nota">
            <input value={nota} onChange={e => setNota(e.target.value)} className={CAMPO} placeholder="Plan, extras..." />
          </Etiqueta>
        </div>
        <p className="text-[0.8rem] text-zinc-500">
          Coste del material: {euros(costeNuevo)}
          {precio > 0 && <> · Te queda: <strong className="text-zinc-900">{euros(precio - costeNuevo)}</strong></>}
        </p>
        <button type="submit" className={BOTON}>Añadir venta</button>
      </form>

      {lista.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-[0.75rem] bg-white ring-1 ring-zinc-200">
          {lista.map(c => {
            const coste = costeCliente(datos, c)
            return (
              <li key={c.id} className="flex items-center gap-[0.75rem] px-[0.9rem] py-[0.7rem]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.negocio}</p>
                  <p className="text-[0.78rem] text-zinc-500">
                    {c.fecha} · {c.kitIds.map(id => datos.kits.find(k => k.id === id)?.nombre ?? 'Kit borrado').join(' + ') || 'Sin material'}
                    {c.nota && ` · ${c.nota}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{euros(c.precio)}</p>
                  <p className="text-[0.75rem] text-emerald-700">+{euros(c.precio - coste)}</p>
                </div>
                <Borrar titulo={`Borrar ${c.negocio}`} onClick={() => cambiar(d => ({ ...d, clientes: d.clientes.filter(x => x.id !== c.id) }))} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function GestionPage() {
  const [datos, setDatos] = useState(null)
  const [seccion, setSeccion] = useState('gastos')
  const [estado, setEstado] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    document.title = 'Gestión'
    // Que ningún buscador la guarde, por si acaso
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    fetch(API)
      .then(r => r.json())
      .then(d => {
        // Lo que falte (la primera vez, o si el archivo solo tenía gastos) se completa con los datos de partida
        const completos = { ...INICIALES(), ...(d ?? {}) }
        setDatos(completos)
        if (!d?.materiales) guardar(completos)
      })
      .catch(() => setEstado('No se han podido leer los datos. ¿Está abierto npm run dev?'))

    return () => {
      meta.remove()
      clearTimeout(timer.current)
    }
  }, [])

  const guardar = d =>
    fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(r => {
        if (!r.ok) throw new Error()
        setEstado('Guardado')
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setEstado(''), 1500)
      })
      .catch(() => setEstado('No se ha podido guardar'))

  // Cada cambio se guarda al momento en gestion/datos.json
  const cambiar = f =>
    setDatos(d => {
      const nuevo = f(d)
      guardar(nuevo)
      return nuevo
    })

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-[40rem] px-[1rem] pb-[3rem] pt-[1.25rem]">
        <div className="flex items-baseline justify-between gap-[1rem]">
          <h1 className="text-[1.5rem] font-bold">Gestión</h1>
          <p className="text-[0.8rem] text-zinc-500" aria-live="polite">{estado}</p>
        </div>

        {/* Pestañas; las bloqueadas se ven con un candado y no se pueden abrir */}
        <nav className="mt-[1rem] flex gap-[1.1rem] overflow-x-auto border-b border-zinc-300 [scrollbar-width:none]">
          {SECCIONES.map(s => {
            const bloqueada = BLOQUEADAS.includes(s.key)
            return (
              <button
                key={s.key}
                type="button"
                disabled={bloqueada}
                aria-pressed={seccion === s.key}
                onClick={() => setSeccion(s.key)}
                title={bloqueada ? 'Bloqueada de momento' : undefined}
                className={`-mb-px flex shrink-0 items-center gap-[0.3rem] border-b-2 pb-[0.5rem] text-[0.92rem] font-semibold ${
                  seccion === s.key ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500'
                } disabled:cursor-not-allowed disabled:text-zinc-400`}
              >
                {bloqueada && <Lock className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />}
                {s.texto}
              </button>
            )
          })}
        </nav>

        <div className="mt-[1rem]">
          {!datos ? (
            <p className="text-zinc-500">{estado || 'Cargando...'}</p>
          ) : (
            <>
              {seccion === 'gastos' && <Gastos datos={datos} cambiar={cambiar} />}
              {seccion === 'resumen' && <Resumen datos={datos} />}
              {seccion === 'inventario' && <Inventario datos={datos} cambiar={cambiar} />}
              {seccion === 'compras' && <Compras datos={datos} cambiar={cambiar} />}
              {seccion === 'kits' && <Kits datos={datos} cambiar={cambiar} />}
              {seccion === 'clientes' && <Clientes datos={datos} cambiar={cambiar} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
