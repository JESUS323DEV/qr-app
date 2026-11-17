

// Hasta cuántos días por delante se puede reservar
export const DIAS_RESERVABLES = 60

export const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export const hoySinHora = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const mismoDia = (a, b) => a && b && a.getTime() === b.getTime()

export const fechaLarga = d => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

// Corto, para que quepa en media columna: "Hoy, mié 15", "Mañana, jue 16", "vie 17 oct"
const semana = d => d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')

const mes = d => d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')

export const textoDia = d => {
  const dif = Math.round((d - hoySinHora()) / 86400000)
  if (dif === 0) return `Hoy, ${semana(d)} ${d.getDate()}`
  if (dif === 1) return `Mañana, ${semana(d)} ${d.getDate()}`
  return `${semana(d)} ${d.getDate()} ${mes(d)}`
}

/* Reservar: formulario normal, bien maquetado, que ocupa toda la pantalla.
   Campos en dos columnas: nombre y teléfono; personas y día; hora y zona; y un comentario opcional.
   El día se elige en un calendario propio (los días de cierre, bloqueados) y la hora en píldoras que solo salen
   al tocar "Elige la hora", con las horas de los turnos que abren el día elegido. Se despliegan a todo el ancho,
   por encima del resto (el calendario debajo de su fila; las horas, encima de la suya), y se cierran al elegir o al tocar fuera.
   Sin servidor: al enviar abre WhatsApp con la reserva ya escrita. Más adelante se podrá conectar con Reservaq.
   pestana: titulo, texto_reserva, boton, whatsapp, turnos[{ nombre, horas, dias? }], cerrado[días de la semana, 0 = domingo], zonas[] */
// Número del negocio solo con cifras, como lo pide WhatsApp ("+34 600 00 00 00" → "34600000000")
export const numeroWhatsapp = numero => String(numero).replace(/\D/g, '')

// Teléfono del cliente ordenado: un número español de 9 cifras queda "600 123 456"; los demás, como los escribió
const telefonoOrdenado = tel => {
  const cifras = tel.replace(/\D/g, '')
  return cifras.length === 9 ? `${cifras.slice(0, 3)} ${cifras.slice(3, 6)} ${cifras.slice(6)}` : tel.trim()
}

/* Mensaje que le llega al negocio por WhatsApp, ordenado y con las etiquetas en negrita (*...* en WhatsApp):
   primero cuándo y para cuántos, después quién y, si hay, el comentario.

   Hola, quiero hacer una reserva en Chalaquita:

   *Día:* Viernes 17 de octubre
   *Hora:* 21:00
   *Personas:* 4
   *Zona:* Terraza

   *Nombre:* Ana López
   *Teléfono:* 600 123 456

   *Comentario:* Alergia a los frutos secos */
export const mensajeReserva = ({ negocio, dia, hora, datos }) => {
  const fecha = fechaLarga(dia)
  const zona = datos.get('zona')
  const comentario = datos.get('comentario')?.trim()
  return [
    `Hola, quiero hacer una reserva${negocio ? ` en ${negocio}` : ''}:`,
    '',
    `*Día:* ${fecha.charAt(0).toUpperCase()}${fecha.slice(1)}`,
    `*Hora:* ${hora}`,
    `*Personas:* ${datos.get('personas')}`,
    zona && `*Zona:* ${zona}`,
    '',
    `*Nombre:* ${datos.get('nombre').trim()}`,
    `*Teléfono:* ${telefonoOrdenado(datos.get('telefono'))}`,
    ...(comentario ? ['', `*Comentario:* ${comentario}`] : []),
  ].filter(l => l !== null && l !== undefined && l !== false).join('\n')
}

// Mensaje de una cita (o encargo) que le llega al negocio por WhatsApp, con el mismo orden que el de las reservas
export const mensajeCita = ({ negocio, dia, hora, datos, encargo }) => {
  const fecha = fechaLarga(dia)
  const comentario = datos.get('comentario')?.trim()
  return [
    `Hola, quiero ${encargo ? 'hacer un encargo' : 'pedir cita'}${negocio ? ` en ${negocio}` : ''}:`,
    '',
    `*${encargo ? 'Encargo' : 'Servicio'}:* ${datos.get('servicio').trim()}`,
    `*Día:* ${fecha.charAt(0).toUpperCase()}${fecha.slice(1)}`,
    `*Hora:* ${hora}`,
    '',
    `*Nombre:* ${datos.get('nombre').trim()}`,
    `*Teléfono:* ${telefonoOrdenado(datos.get('telefono'))}`,
    ...(comentario ? ['', `*Comentario:* ${comentario}`] : []),
  ].join('\n')
}
