import { useContext } from 'react'
import NombreMarca from '../components/NombreMarca'
import { ColoresMiniweb, esClaroHex, useRol } from '../components/ColoresPortada'

/* Pedir cita (la pestaña de tipo cita, con el botón de WhatsApp): aquí manda el texto y la foto acompaña.
   De arriba abajo: el logo y el nombre del negocio; hasta dos grupos de texto, "lo que hacemos" (titulo_hacemos, texto_hacemos) y "quiénes somos" (titulo_quienes,
   texto_quienes), todos opcionales: sin ellos no salen;
   y "Pide tu cita" con el botón de WhatsApp y el teléfono, "Pide tu cita" arriba, pegado bajo el nombre, y los textos debajo. Sin foto: las otras pestañas ya la llevan. Los textos crecen con el alto de la pantalla (svh).
   pestana: titulo, titulo_hacemos, texto_hacemos, titulo_quienes, texto_quienes, boton, url, telefono, texto_telefono */
// El espacio entre el nombre, "Pide tu cita" y cada texto: 1,7rem en el móvil más bajo y hasta 2,6rem en los altos (crece con el alto de la pantalla, como los textos)
const PT = 'pt-[min(2.6rem,calc(1.7rem_+_max(0px,100svh_-_640px)_*_0.0456))]'
const PB = 'pb-[min(1.6rem,calc(1.2rem_+_max(0px,100svh_-_640px)_*_0.0203))]'

export default function PaginaCita({ pestana, negocio }) {
  // Colores propios de cada pieza (hero.colores): sin elegir, no ponen nada y se queda el de siempre
  const rolTitulo = useRol('reservaTitulo')
  const rolTexto = useRol('reservaTexto')
  const rolTelefono = useRol('reservaTelefono')
  const { colores } = useContext(ColoresMiniweb)
  const estiloBoton = colores?.reservaBoton
    ? { background: colores.reservaBoton, color: colores.reservaBotonTexto ?? (esClaroHex(colores.reservaBoton) ? '#141414' : '#FFFFFF') }
    : colores?.reservaBotonTexto
      ? { color: colores.reservaBotonTexto }
      : undefined
  // Los grupos de texto que se han escrito (los vacíos no salen)
  const grupos = [
    [pestana.titulo_hacemos, pestana.texto_hacemos],
    [pestana.titulo_quienes, pestana.texto_quienes],
  ].filter(([titulo, texto]) => titulo || texto)
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="px-[1.25rem] pt-[1.1rem] font-demo-heading text-[1.3rem] font-bold leading-none">
        <NombreMarca nombre={negocio} />
      </p>

      <div>
      <div className={`escala-pagina px-[1.25rem] ${PT} ${PB}`}>
        <h3 style={rolTitulo} className="font-demo-heading text-[1.5rem] font-bold leading-none">
          {pestana.titulo}
        </h3>
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          style={estiloBoton}
          className="mt-[0.8rem] flex min-h-[3rem] w-full items-center justify-center rounded-[0.7rem] bg-demo-primary px-[1.1rem] text-[1rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} style={rolTelefono} className="mt-[0.7rem] block text-center text-[0.88rem] text-demo-muted">
            {pestana.texto_telefono ?? 'o por teléfono'} <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </div>

      {grupos.map(([titulo, texto], i) => (
        <div key={i} className={`px-[1.25rem] ${PT}`}>
          {titulo && (
            <h2 style={rolTitulo} className="font-demo-heading text-[length:min(3.2rem,calc(1.8rem_+_max(0px,100svh_-_640px)_*_0.0709))] font-extrabold leading-[1.02]">
              {titulo}
            </h2>
          )}
          {texto && (
            <p style={rolTexto} className="mt-[0.5rem] text-[length:min(1.5rem,calc(1rem_+_max(0px,100svh_-_640px)_*_0.0253))] leading-[1.5] text-demo-muted">
              {texto}
            </p>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}
