

/* Los días y las horas de una cita, sacados de las líneas del horario del negocio ("Martes a viernes" / "10:00 a 14:00 y 16:00 a 20:00"):
   turnos con sus horas cada media hora y los días de cierre, con el formato que ya usa el formulario de reservas (getDay: 0 = domingo) */
const DIA_DE = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 }

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]

const sinTildes = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const dosCifras = n => String(n).padStart(2, '0')

function diasDe(texto) {
  const dias = new Set()
  const nombres = 'lunes|martes|miercoles|jueves|viernes|sabado|domingo'
  for (const m of sinTildes(texto).matchAll(new RegExp(`(${nombres})(?:\\s+a\\s+(${nombres}))?`, 'g'))) {
    if (!m[2]) {
      dias.add(DIA_DE[m[1]])
      continue
    }
    const fin = ORDEN_SEMANA.indexOf(DIA_DE[m[2]])
    for (let k = ORDEN_SEMANA.indexOf(DIA_DE[m[1]]); ; k = (k + 1) % 7) {
      dias.add(ORDEN_SEMANA[k])
      if (k === fin) break
    }
  }
  return [...dias]
}

export function agendaDeHorario(lineas = []) {
  const turnos = []
  const abiertos = new Set()
  for (const l of lineas) {
    const dias = diasDe(l.dias ?? '')
    for (const t of String(l.horas ?? '').matchAll(/(\d{1,2})[:.](\d{2})\s*a\s*(\d{1,2})[:.](\d{2})/g)) {
      const ini = Number(t[1]) * 60 + Number(t[2])
      const fin = Number(t[3]) * 60 + Number(t[4])
      const horas = []
      for (let m = ini; m <= fin - 30; m += 30) horas.push(`${dosCifras(Math.floor(m / 60))}:${dosCifras(m % 60)}`)
      if (!horas.length || !dias.length) continue
      turnos.push({ nombre: ini < 14 * 60 ? 'Mañana' : ini < 20 * 60 ? 'Tarde' : 'Noche', horas, dias })
      dias.forEach(d => abiertos.add(d))
    }
  }
  return { turnos, cerrado: abiertos.size ? ORDEN_SEMANA.filter(d => !abiertos.has(d)) : [] }
}
