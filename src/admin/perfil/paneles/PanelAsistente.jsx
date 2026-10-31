import { BOTON, CAMPO, Etiqueta } from '../../../components/panel'
import { BarraAsistenteMovil } from '../../EditorMovil'
import { CampoImagenAsistente } from '../../TextosEditor'
import { TIPOS_CARTA } from '../../../asistente/carta'

// PanelAsistente: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelAsistente({ diseno, carta, negocio, cambiarProducto, captura, creando, cuento, disenando, esMovil, montar, pasoMovil, referencia, resumenDiseno, setCaptura, setCuento, setError, setPasoMovil, setReferencia, setVistaMovil }) {
  const { producto } = diseno
  const { setTipoCarta, tipoCarta } = carta
  const { nombre, setNombre } = negocio
  return (
    <div className={`order-3 grid gap-[0.6rem] lg:order-none ${esMovil && pasoMovil !== 'asistente' ? 'hidden' : ''}`}>
      {esMovil && <BarraAsistenteMovil alInicio={() => setPasoMovil('inicio')} alEditar={() => setVistaMovil(true)} />}
      {/* Qué diseña el asistente: una miniweb o una carta (la ficha ya no se vende) */}
      <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
        {[
          ['miniweb', 'Miniweb'],
          ['carta', 'Menú y ofertas'],
          ['ficha', 'Ficha'],
        ].map(([clave, texto]) => (
          <button
            key={clave}
            type="button"
            aria-pressed={producto === clave}
            disabled={clave === 'ficha' || Boolean(disenando) || Boolean(creando)}
            onClick={() => cambiarProducto(clave)}
            className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 max-md:whitespace-nowrap max-md:px-[0.15rem] max-md:text-[0.78rem] ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
          >
            {texto}
          </button>
        ))}
      </div>
      {/* Con Carta elegida, qué tipo: cada uno con sus reglas en el asistente (es el mismo tipo del selector del Editor) */}
      {producto === 'carta' && (
        <div className="grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {TIPOS_CARTA.map(t => (
            <button
              key={t.clave}
              type="button"
              aria-pressed={tipoCarta === t.clave}
              disabled={Boolean(disenando) || Boolean(creando)}
              onClick={() => setTipoCarta(t.clave)}
              className={`rounded-[0.55rem] py-[0.45rem] text-[0.9rem] font-semibold disabled:opacity-40 ${tipoCarta === t.clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {t.clave === 'carta' ? 'Menú del día' : 'Ofertas'}
            </button>
          ))}
        </div>
      )}
      {/* Lo único seguro: el nombre. Si se escribe, el asistente lo usa tal cual; si no, lo saca de la captura o se lo inventa */}
      <Etiqueta texto="Nombre del negocio">
        <input value={nombre} onChange={e => setNombre(e.target.value)} disabled={Boolean(disenando) || Boolean(creando)} className={CAMPO} placeholder="Peluquería Ranita" />
      </Etiqueta>
      <textarea
        value={cuento}
        onChange={e => setCuento(e.target.value)}
        disabled={Boolean(disenando) || Boolean(creando)}
        rows={3}
        aria-label="Pídele al asistente lo que quieras"
        placeholder="Opcional: lo que quieras añadir (estilo, colores, datos). Con el nombre y una captura de su Instagram ya basta."
        className={`${CAMPO} resize-y`}
      />
      {/* Dos imágenes opcionales para el asistente, que solo las mira (no se colocan en la miniweb): el logo de referencia (colores y carácter
          de la marca) y una captura con información (solo se lee su texto: nombre, teléfonos, dirección, horario...) */}
      <div className="flex flex-wrap items-center gap-x-[1.2rem] gap-y-[0.6rem]">
        <CampoImagenAsistente titulo="Añadir logo de referencia" valor={referencia} cambiar={setReferencia} conColores bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
        <CampoImagenAsistente titulo="Añadir captura con información" valor={captura} cambiar={setCaptura} bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
      </div>
      <button type="button" onClick={montar} disabled={!(nombre.trim() || cuento.trim() || referencia || captura) || Boolean(disenando) || Boolean(creando)} className={BOTON}>
        {disenando ?? 'Montar el diseño con el asistente'}
      </button>
      {resumenDiseno && <p className="text-[0.85rem] font-semibold text-zinc-800">{resumenDiseno}</p>}
    </div>
  )
}
