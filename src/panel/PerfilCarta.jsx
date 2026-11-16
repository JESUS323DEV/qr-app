import { useCallback, useState } from 'react'
import { Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Confirmar } from '../components/panel'

/* Lo que cambia el dueño en su carta: el menú del día o las ofertas. Lo elige la primera vez que entra y, una vez elegido, la otra pestaña
   queda bloqueada. Se guarda en cartas.perfil (supabase/013_perfil_carta.sql); sin elegir, el panel se lo pide */
const PERFILES = [
  { clave: 'menu', texto: 'Menú del día', ayuda: 'Cambias cada día los platos y el precio de tu menú.' },
  { clave: 'ofertas', texto: 'Ofertas', ayuda: 'Pones tus ofertas con su precio, el de antes tachado y sus fechas.' },
]

export function ElegirPerfil({ fila, alElegir }) {
  const [pregunta, setPregunta] = useState(null)
  const [error, setError] = useState('')
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  const elegir = async clave => {
    setError('')
    const { error: fallo } = await supabase.from('cartas').update({ perfil: clave }).eq('slug', fila.slug)
    if (fallo) return setError('No se ha podido guardar tu elección. Prueba otra vez.')
    alElegir(clave)
  }

  return (
    <div className="grid gap-[0.9rem]">
      <div>
        <h1 className="text-[1.5rem] font-bold">¿Qué vas a cambiar en tu carta?</h1>
        <p className="mt-[0.3rem] text-[0.95rem] text-zinc-600">Elige una. Después la otra opción queda bloqueada.</p>
      </div>
      {PERFILES.map(p => (
        <button
          key={p.clave}
          type="button"
          onClick={() => setPregunta({ titulo: `¿Elegir ${p.texto}?`, texto: 'Después no podrás cambiarlo desde aquí. Si te equivocas, escríbeme.', boton: 'Elegir', accion: () => elegir(p.clave) })}
          className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left ring-1 ring-zinc-200"
        >
          <span className="block text-[1.05rem] font-bold">{p.texto}</span>
          <span className="block text-[0.9rem] text-zinc-500">{p.ayuda}</span>
        </button>
      ))}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

// Las dos pestañas: la elegida, activa; la otra, bloqueada. Con alCambiar (el administrador), las dos están libres y se puede pasar de una a otra
export function PestanasPerfil({ perfil, alCambiar }) {
  return (
    <div className="mb-[1rem] grid grid-cols-2 gap-[0.3rem] rounded-[0.8rem] bg-zinc-200 p-[0.25rem]">
      {PERFILES.map(p =>
        alCambiar ? (
          <button
            key={p.clave}
            type="button"
            aria-pressed={p.clave === perfil}
            onClick={() => alCambiar(p.clave)}
            className={`rounded-[0.6rem] py-[0.55rem] text-center text-[0.95rem] ${p.clave === perfil ? 'bg-white font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'font-semibold text-zinc-500'}`}
          >
            {p.texto}
          </button>
        ) : p.clave === perfil ? (
          <span key={p.clave} aria-current="page" className="rounded-[0.6rem] bg-white py-[0.55rem] text-center text-[0.95rem] font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]">
            {p.texto}
          </span>
        ) : (
          <span key={p.clave} aria-disabled="true" title="Bloqueada: ya elegiste la otra" className="flex items-center justify-center gap-[0.35rem] rounded-[0.6rem] py-[0.55rem] text-[0.95rem] font-semibold text-zinc-400">
            <Lock className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            {p.texto}
          </span>
        ),
      )}
    </div>
  )
}
