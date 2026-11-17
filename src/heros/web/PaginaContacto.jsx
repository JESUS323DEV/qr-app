import { useContext } from 'react'
import { ColoresMiniweb, esClaroHex, useRol } from '../../components/ColoresPortada'
import { Franja } from './Franja'

// Contacto (cita, encargos, pedido...): foto en franja y, debajo, el título, el texto y el botón de WhatsApp
export function PaginaContacto({ pestana, respaldo }) {
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
  return (
    <div className="flex h-full flex-col">
      {/* La foto llena el hueco como siempre, pero con tope de alto: en móviles bajos no cambia nada y en los altos ya no se estira; el texto se centra en lo que sobra */}
      <Franja foto={pestana.foto ?? respaldo} className="min-h-[6rem] max-h-[min(124vw,40rem)] flex-1" />
      <div className="my-auto px-[1.25rem] pb-[1.5rem] pt-[1.1rem]">
        <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.9rem] font-extrabold leading-none">{pestana.titulo}</h2>
        {pestana.texto_encargo && <p style={rolTexto} className="escala-pagina mt-[0.5rem] text-[0.95rem] leading-[1.5] text-demo-muted">{pestana.texto_encargo}</p>}
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          style={estiloBoton}
          className="escala-pagina mt-[1rem] flex min-h-[3rem] w-full items-center justify-center rounded-[0.7rem] bg-demo-primary px-[1.1rem] text-[1rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} style={rolTelefono} className="escala-pagina mt-[0.7rem] block text-center text-[0.88rem] text-demo-muted">
            {pestana.texto_telefono ?? 'o por teléfono'} <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </div>
    </div>
  )
}
