import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Entrar, usePaginaPrivada } from '../components/panel'
import { CrearConAsistente } from '../admin/Asistente'
import { Editor } from '../admin/Editor'
import { Lista } from '../admin/Lista'
import { BarraAdmin, SubirArriba } from '../admin/Barra'

/* Panel de Jesús (/admin): cambiar textos, fotos y colores de cualquier ficha, miniweb o carta desde el móvil,
   sin tocar código, y duplicar una demo para adaptarla en segundos al negocio que tiene delante.
   Los cambios se guardan en Supabase (tabla ediciones) por encima de los archivos; los permisos de Supabase
   hacen que solo un administrador (tabla admins) pueda guardarlos. El diseño y la estructura siguen en el código.
   El código está repartido en src/admin: Lista (la lista de copias), Editor (una copia), NuevoPerfil, Asistente (la IA), Qr, Grupos, Campos,
   PanelesMiniweb y TextosEditor (los ajustes), datos e ia (qué se edita y qué cambia la IA) y comun (lo que comparten). */

export default function AdminPage() {
  const sesion = usePaginaPrivada('Administración')
  const [esAdmin, setEsAdmin] = useState(undefined)
  const [filas, setFilas] = useState(null)
  const [params, setParams] = useSearchParams()
  // Lo que se está editando va en la dirección (?editar=negocio:laca): el botón atrás del móvil vuelve a la lista
  const editar = params.get('editar')
  // ?copia=negocio:slug: la copia que se carga en Nuevo perfil (botón Editar de su pantalla de información)
  const copia = params.get('copia')

  // En tablet vertical (md) la lista del panel crece (ver .admin-tablet en main.css); el Editor, con su diseño de escritorio, se queda a su tamaño
  useEffect(() => {
    if (editar) return
    document.documentElement.classList.add('admin-tablet')
    return () => document.documentElement.classList.remove('admin-tablet')
  }, [editar])

  // ¿Esta cuenta es de administrador?
  useEffect(() => {
    if (!sesion) {
      setEsAdmin(undefined)
      return
    }
    supabase
      .from('admins')
      .select('usuario')
      .eq('usuario', sesion.user.id)
      .maybeSingle()
      .then(({ data }) => setEsAdmin(Boolean(data)))
  }, [sesion])

  // Devuelve la promesa: al crear una copia se espera a tenerla antes de abrirla
  const recargar = useCallback(() => {
    return supabase
      .from('ediciones')
      .select('tipo, slug, base, cambios, historial, actualizado')
      .order('actualizado', { ascending: false })
      .then(({ data }) => setFilas(data ?? []))
  }, [])

  useEffect(() => {
    if (esAdmin) recargar()
  }, [esAdmin, recargar])

  const abrir = clave => {
    setParams(clave ? { editar: clave } : {})
    window.scrollTo(0, 0)
  }

  const [tipo, slug] = editar?.split(':') ?? []
  const fila = filas?.find(f => f.tipo === tipo && f.slug === slug) ?? null

  return (
    <div className="tema-admin min-h-svh font-sans">
      <div className={`mx-auto w-full max-w-[32rem] px-[1rem] pb-[2rem] pt-[1rem] ${editar === 'asistente' ? '' : 'md:max-w-[64rem]'}`}>
        {!supabase ? (
          <p className="mt-[3rem] text-center text-zinc-500">El panel no está disponible ahora mismo.</p>
        ) : sesion === undefined ? null : !sesion ? (
          <Entrar titulo="Administración" texto="Entra para editar las fichas, miniwebs y cartas." />
        ) : (
          <>
            <BarraAdmin email={sesion.user.email} />
            <SubirArriba />

            {esAdmin === undefined || (esAdmin && !filas) ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : !esAdmin ? (
              <p className="text-zinc-500">Esta cuenta no tiene acceso a este panel.</p>
            ) : editar === 'asistente' ? (
              <CrearConAsistente filas={filas} volver={() => abrir(null)} recargar={recargar} abrir={abrir} />
            ) : editar && (tipo === 'negocio' || tipo === 'carta') ? (
              // key: al abrir otra (por ejemplo, la copia recién creada) el editor empieza de cero
              <Editor
                key={`${editar}-${Boolean(fila)}`}
                tipo={tipo}
                slug={slug}
                fila={fila}
                filas={filas}
                volver={() => abrir(null)}
                recargar={recargar}
                abrir={abrir}
                irANuevoPerfil={clave => {
                  setParams({ copia: clave })
                  window.scrollTo(0, 0)
                }}
              />
            ) : (
              <Lista filas={filas} abrir={abrir} recargar={recargar} copia={copia} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
