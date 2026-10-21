import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import GeneradorQR from '../components/GeneradorQR'
import { TIPOGRAFIAS } from '../asistente/tipografias'
import { conDominio } from '../lib/dominio'

/* Editor de QR para el cliente (/mi-qr/slug), con los colores y las letras de la landing (tema-landing). Jesús le pasa el enlace y un PIN (se crean en /admin).
   Sin PIN: se ve su QR (el diseño que envió o, si aún no, uno con los colores de su marca).
   Con el PIN: el generador en modo cliente, con 2 intentos de propuestas de la IA y "Enviar mi diseño".
   Todo pasa por la función mi-qr, que comprueba el PIN, los intentos y que la sesión siga abierta. */

// Llama a la función mi-qr y, si falla, lanza su mensaje de error (o uno genérico)
async function miQr(cuerpo) {
  const { data, error } = await supabase.functions.invoke('mi-qr', { body: cuerpo })
  if (error) {
    let mensaje = 'No ha funcionado. Prueba otra vez.'
    try {
      mensaje = (await error.context.json()).error ?? mensaje
    } catch {
      // Sin mensaje propio: se queda el genérico
    }
    throw new Error(mensaje)
  }
  return data
}

export default function MiQrPage() {
  const { slug } = useParams()
  const [info, setInfo] = useState(undefined)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')
  const [dentro, setDentro] = useState(null)
  const [entrando, setEntrando] = useState(false)

  useEffect(() => {
    document.title = 'Tu QR'
    if (!supabase) return setError('El editor no está disponible ahora mismo.')
    miQr({ accion: 'ver', slug })
      .then(setInfo)
      .catch(e => {
        setInfo(null)
        setError(e.message)
      })
  }, [slug])

  const entrar = async e => {
    e.preventDefault()
    if (entrando) return
    setEntrando(true)
    setError('')
    try {
      const { intentos } = await miQr({ accion: 'entrar', slug, pin: pin.trim() })
      setDentro({ pin: pin.trim(), intentos })
    } catch (e) {
      setError(e.message)
    } finally {
      setEntrando(false)
    }
  }

  const comunes = info && { url: conDominio(info.url), nombre: info.nombre, colores: info.colores ?? undefined, fuentes: info.fuentes ?? undefined, estadoInicial: info.diseno ?? undefined }

  return (
    <div className="tema-landing min-h-svh bg-papel font-texto text-tinta">
      <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)] gap-[1.25rem] px-[1rem] pb-[3rem] pt-[1.5rem]">
        {info === undefined && !error ? (
          <p className="text-zinc-500">Cargando...</p>
        ) : !info ? (
          <p className="text-[1rem] font-semibold">{error || 'Este enlace no existe.'}</p>
        ) : dentro ? (
          <>
            <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">Diseña tu QR</h1>
            <div className="min-w-0 rounded-[1.1rem] bg-crema p-[1rem]">
              <GeneradorQR
                {...comunes}
                modo="cliente"
                intentos={dentro.intentos}
                proponer={(descripcion, siluetas) =>
                  miQr({
                    accion: 'proponer',
                    slug,
                    pin: dentro.pin,
                    descripcion,
                    siluetas,
                    tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
                  })
                }
                enviar={diseno => miQr({ accion: 'enviar', slug, pin: dentro.pin, diseno })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">El QR de {info.nombre}</h1>
              <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-suave">
                {info.abierta
                  ? 'Pon el PIN que te hemos dado para diseñar tu placa.'
                  : info.enviado
                    ? 'Este es el diseño que nos enviaste.'
                    : 'Este editor ya está cerrado.'}
              </p>
            </div>
            <GeneradorQR {...comunes} modo="vista" />
            {info.abierta && (
              <form onSubmit={entrar} className="grid gap-[0.6rem]">
                <label className="grid gap-[0.3rem]">
                  <span className="text-[0.85rem] font-semibold text-zinc-600">PIN</span>
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="block min-h-[3rem] w-full rounded-[0.75rem] border border-zinc-300 bg-white px-[0.9rem] text-center font-mono text-[1.3rem] tracking-[0.3em]"
                  />
                </label>
                <button type="submit" disabled={pin.length < 4 || entrando} className="min-h-[3.25rem] rounded-full bg-acento font-bold text-papel transition-colors hover:bg-acento-oscuro disabled:opacity-50">
                  {entrando ? 'Comprobando...' : 'Entrar'}
                </button>
                {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
