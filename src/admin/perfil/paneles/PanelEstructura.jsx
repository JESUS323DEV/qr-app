import { useState } from 'react'
import { FilaIconos } from '../../FilaIconos'
import { Plegable } from '../../PanelesMiniweb'
import { CAMPO, claseIcono } from '../../../components/panel'
import { aplicar } from '../../../lib/ediciones'
import { leerRuta } from '../../datos'

// Lo que puede medir el texto de cada una de las dos pestañas de arriba
const MAX_TEXTO_PESTANA = 24

// El texto de una de las dos pestañas de arriba de la carta. Si se deja vacío, vuelve al original (una pestaña sin nombre no se vería)
function CampoPestana({ etiqueta, valor, original, ruta, cambiar }) {
  const [texto, setTexto] = useState(valor)
  return (
    <label className="grid gap-[0.3rem]">
      <span className="text-[0.8rem] text-zinc-500">{etiqueta}</span>
      <input
        value={texto}
        maxLength={MAX_TEXTO_PESTANA}
        onChange={e => {
          setTexto(e.target.value)
          cambiar(ruta, e.target.value.trim() ? e.target.value : original)
        }}
        onBlur={() => {
          if (!texto.trim()) setTexto(valor)
        }}
        className={CAMPO}
      />
    </label>
  )
}

// PanelEstructura: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelEstructura({ carta, esCarta, datosEnBruto, cambiosExtra, cambiarExtra }) {
  const { enlaceNegocio, setEnlaceNegocio } = carta
  const datos = datosEnBruto ? aplicar(datosEnBruto, cambiosExtra) : null
  // Las dos pestañas de arriba: la primera es el menú del día o, en Promociones, las ofertas; la segunda, la carta (o los servicios)
  const rutaPrimera = datos?.menuDia ? 'menuDia.texto' : datos?.ofertas ? 'ofertas.texto' : null
  const textoPrimera = rutaPrimera ? leerRuta(datos, rutaPrimera) ?? '' : ''
  const textoSegunda = datos?.textoCarta ?? 'Carta'
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
    {/* Carta: Estructura, dónde va cada pieza. De momento, el enlace "Conoce [negocio]" (a la miniweb del negocio) */}
    {esCarta && (
      <Plegable titulo="Estructura" elegido={{ ninguno: 'Sin enlace', izquierda: 'Enlace a la izquierda', derecha: 'Enlace a la derecha' }[enlaceNegocio]}>
        <div className="grid gap-[0.4rem]">
          <span className="text-[0.8rem] text-zinc-500">Enlace al negocio (Conoce...)</span>
          <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
            {[
              ['ninguno', 'Sin enlace', '<path d="M9 8l6 6M15 8l-6 6" stroke-width="1.4"/>'],
              ['izquierda', 'Arriba a la izquierda', '<rect x="7.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
              ['derecha', 'Arriba a la derecha', '<rect x="10.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
            ].map(([clave, nombreLado, dibujo]) => (
              <button
                key={clave}
                type="button"
                title={nombreLado}
                aria-label={`Enlace al negocio: ${nombreLado}`}
                aria-pressed={enlaceNegocio === clave}
                onClick={() => setEnlaceNegocio(clave)}
                className={claseIcono(enlaceNegocio === clave)}
              >
                <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<rect x="5.5" y="2" width="13" height="20" rx="2.5"/>' + dibujo }} />
              </button>
            ))}
          </FilaIconos>
          <p className="text-[0.85rem] font-semibold">{{ ninguno: 'Sin enlace', izquierda: 'Arriba a la izquierda', derecha: 'Arriba a la derecha' }[enlaceNegocio]}</p>
        </div>
      </Plegable>
    )}
    {/* Las dos pestañas de arriba de la carta: su texto */}
    {esCarta && datos && (
      <Plegable titulo="Pestañas de la carta" elegido={textoPrimera ? `${textoPrimera} · ${textoSegunda}` : textoSegunda}>
        <div className="grid gap-[0.7rem]">
          {rutaPrimera && <CampoPestana etiqueta="Primera pestaña" valor={textoPrimera} original={leerRuta(datosEnBruto, rutaPrimera)} ruta={rutaPrimera} cambiar={cambiarExtra} />}
          <CampoPestana etiqueta="Segunda pestaña" valor={textoSegunda} original={datosEnBruto.textoCarta} ruta="textoCarta" cambiar={cambiarExtra} />
        </div>
      </Plegable>
    )}
      </div>
  )
}
