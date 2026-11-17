import { tipoComun } from '../../fichas/escenas'
import { agendaDeHorario } from './agenda'
import { PaginaReservar } from './PaginaReservar'

// Formulario de cita o de reserva en cualquier pestaña de contacto (hero.contactoEn: 'cita' o 'reserva'), con el mismo formulario que las
// reservas: en modo cita, el servicio en lugar de las personas; en modo reserva, las personas (y la zona, si la pestaña la trae).
// Los días y las horas salen del horario del negocio, salvo en la pestaña Reservar de comida, que trae sus propios turnos
function PaginaFormulario({ modo, pestana, heroBase, negocio }) {
  const pestanas = heroBase?.pestanas ?? []
  const propia = Boolean(pestana.turnos)
  const agenda = agendaDeHorario(pestanas.find(p => tipoComun(p.tipo) === 'horario')?.lineas)
  // Sin horario del que sacar las horas, de diez a ocho cada media hora
  const generales = [{ nombre: 'Mañana', horas: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'] }, { nombre: 'Tarde', horas: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'] }]
  const servicios = [...new Set(pestanas.filter(p => p.tipo === 'servicios').flatMap(p => (p.secciones ?? []).flatMap(s => (s.platos ?? []).map(x => x.nombre))))]
  const sintetica = {
    tipo: pestana.tipo,
    titulo: pestana.titulo,
    texto_reserva: pestana.texto_reserva ?? pestana.texto_encargo,
    // El botón de WhatsApp de una pestaña de contacto ("Pedir cita por WhatsApp") pasa a ser el de enviar el formulario
    boton: pestana.turnos ? pestana.boton : pestana.boton?.replace(/\s*por WhatsApp/i, '').trim() || 'Enviar',
    whatsapp: pestana.whatsapp ?? pestana.url?.match(/wa\.me\/(\d+)/)?.[1],
    telefono: pestana.telefono,
    zonas: pestana.zonas,
    turnos: propia ? pestana.turnos : agenda.turnos.length ? agenda.turnos : generales,
    cerrado: propia ? pestana.cerrado : agenda.cerrado,
    servicios,
  }
  return <PaginaReservar pestana={sintetica} negocio={negocio} modo={modo} />
}

export const PaginaCitaFormulario = props => <PaginaFormulario {...props} modo="cita" />

export const PaginaReservaFormulario = props => <PaginaFormulario {...props} modo="reserva" />
