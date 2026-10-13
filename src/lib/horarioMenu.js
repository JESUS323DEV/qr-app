/* Horario del menú del día: días de la semana (0 = domingo ... 6 = sábado) y horas, desde y hasta ("12:00").
   La carta lo usa para enseñar el menú solo en ese horario y para escribir solo el "cuándo se sirve".
   Las horas son siempre las de España, aunque el cliente tenga el móvil en otra zona horaria. */

const NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
// Orden de la semana empezando en lunes
export const SEMANA = [1, 2, 3, 4, 5, 6, 0]
export const INICIALES = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' }

const mayuscula = t => t.charAt(0).toUpperCase() + t.slice(1)

// "12:00" → "12"; "12:30" → "12:30"
const hora = h => (h.endsWith(':00') ? String(Number(h.slice(0, 2))) : h.replace(/^0/, ''))

// Días: "Todos los días", "De lunes a viernes", "Lunes y miércoles", "Martes, jueves y sábado"
function textoDias(dias) {
  const orden = SEMANA.filter(d => dias.includes(d))
  if (orden.length === 7) return 'Todos los días'
  const posiciones = orden.map(d => SEMANA.indexOf(d))
  const seguidos = posiciones.every((p, i) => i === 0 || p === posiciones[i - 1] + 1)
  if (seguidos && orden.length >= 3) return `De ${NOMBRES[orden[0]]} a ${NOMBRES[orden.at(-1)]}`
  const nombres = orden.map(d => NOMBRES[d])
  const lista = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0]
  return mayuscula(lista)
}

// "De lunes a viernes, de 12 a 17 h"
export function textoHorario(horario) {
  if (!horario?.dias?.length) return ''
  return `${textoDias(horario.dias)}, de ${hora(horario.desde)} a ${hora(horario.hasta)} h`
}

// Día de la semana y minutos desde medianoche, en hora de España
function ahoraEnEspana(fecha) {
  const espana = new Date(fecha.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }))
  return { dia: espana.getDay(), minutos: espana.getHours() * 60 + espana.getMinutes() }
}

const aMinutos = h => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))

// ¿Se sirve el menú ahora? Sin horario, siempre. Si acaba pasada la medianoche (20:00 a 01:00), cuenta para el día en que empieza
export function menuActivo(horario, fecha = new Date()) {
  if (!horario?.dias?.length || !horario.desde || !horario.hasta) return true
  const { dia, minutos } = ahoraEnEspana(fecha)
  const desde = aMinutos(horario.desde)
  const hasta = aMinutos(horario.hasta)
  if (desde < hasta) return horario.dias.includes(dia) && minutos >= desde && minutos < hasta
  const ayer = (dia + 6) % 7
  return (horario.dias.includes(dia) && minutos >= desde) || (horario.dias.includes(ayer) && minutos < hasta)
}
