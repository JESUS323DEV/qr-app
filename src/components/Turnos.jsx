import { Fragment } from 'react'

/* Las horas de una línea del horario: cada turno en su propia línea («10:00 a 14:00» y debajo «16:00 a 20:00»), para que dos turnos no hagan
   una fila larguísima. Solo parte por el «y» que va antes de una hora; «Cerrado» o un texto libre se quedan como están. */
export default function Turnos({ horas }) {
  return String(horas ?? '')
    .split(/\s+y\s+(?=\d)/)
    .map((turno, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {turno}
      </Fragment>
    ))
}
