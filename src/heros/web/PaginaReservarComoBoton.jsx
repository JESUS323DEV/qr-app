import { enlaceWhatsapp } from '../../lib/whatsapp'
import { numeroWhatsapp } from './reserva'
import { PaginaContacto } from './PaginaContacto'

// La reserva con solo el botón de WhatsApp (hero.contactoEn: 'boton'), como la pantalla de contacto de las demás miniwebs
export function PaginaReservarComoBoton({ pestana, negocio, respaldo }) {
  return (
    <PaginaContacto
      respaldo={respaldo}
      pestana={{
        foto: pestana.foto ?? respaldo,
        titulo: pestana.titulo,
        texto_encargo: pestana.texto_reserva,
        boton: pestana.boton,
        url: enlaceWhatsapp(numeroWhatsapp(pestana.whatsapp), `Hola, quiero reservar${negocio ? ` en ${negocio}` : ''}.`),
        telefono: pestana.telefono,
      }}
    />
  )
}
