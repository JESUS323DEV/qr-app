import { getCarta } from '../cartas'
import { tipoComun } from '../fichas/escenas'

/* Una ficha convertida en miniweb, con la estructura de Chalaquita (menú de enlaces arriba, redes debajo):
   - Inicio: la portada (el hero de ficha elegido) con las fotos de la ficha, y las reseñas debajo.
   - Servicios: ofertas y servicios. De momento, de relleno, los de la carta de Laca para todas las temáticas,
     hasta que haya contenidos propios.
   - Horario: el de la ficha (o uno de relleno si no tiene), con el mapa de su pestaña de ubicación debajo
     (como Chalaquita).
   - Contacto: la pestaña de cita, encargos o pedido de la ficha.
   Las temáticas de comida no pasan por aquí: usan la miniweb de Chalaquita (plantillas.js). */

export const RELLENO_SERVICIOS = 'laca'

// Horario de relleno, para las fichas que no tienen pestaña de horario (por ejemplo, la barbería)
const RELLENO_HORARIO = [
  { dias: 'Martes a viernes', horas: '10:00 a 20:00' },
  { dias: 'Sábado', horas: '10:00 a 15:00' },
  { dias: 'Domingo y lunes', horas: 'Cerrado' },
]

// El texto de la portada de Inicio, como el de Chalaquita (titular, descripción y un botón a Servicios): el de la propia ficha (su titular y su lema)
// y, si no tiene, uno de partida con su nombre y sector. El asistente y el editor lo reescriben
const textosDeInicio = (negocio, fotos) => {
  const hero = negocio.hero ?? {}
  const titular = [hero.titulo ?? fotos?.titulo, hero.destacado ?? hero.brillo ?? fotos?.destacado].filter(Boolean)
  // Sin titular propio, el lema o el sector (nunca el nombre, que ya sale arriba)
  const base = titular.length ? titular : [negocio.lema ?? negocio.sector ?? '']
  return {
    titular: base,
    descripcion: negocio.lema && negocio.lema !== base[0] ? negocio.lema : negocio.sector && negocio.sector !== base[0] ? negocio.sector : '',
    boton: 'Ver servicios',
    botonA: 'servicios',
  }
}

export function pestanasDeMiniweb(negocio) {
  const pestanas = negocio.hero?.pestanas ?? []
  const de = tipo => pestanas.find(p => tipoComun(p.tipo) === tipo)
  const fotos = de('fotos')
  const horario = de('horario')
  const ubicacion = de('ubicacion')
  const contacto = de('contacto')
  const relleno = getCarta(RELLENO_SERVICIOS)

  // Siempre las cuatro páginas de Chalaquita: si la ficha no tiene horario, uno de relleno (con su mapa igual)
  const horarioDePagina = horario ?? { tipo: 'horario', texto: 'Horario', titulo: 'Horario', foto: contacto?.foto, lineas: RELLENO_HORARIO }

  return [
    fotos && { ...fotos, ...textosDeInicio(negocio, fotos), texto: 'Inicio' },
    relleno && { tipo: 'servicios', texto: 'Servicios', ofertas: relleno.ofertas, secciones: relleno.secciones },
    { ...horarioDePagina, ...(ubicacion ? { mapa: ubicacion.mapa, direccion: ubicacion.direccion } : {}) },
    contacto,
  ].filter(Boolean)
}

// La ficha entera como miniweb, con el hero elegido de portada
export const fichaAMiniweb = (negocio, portada) => ({
  ...negocio,
  tipo: 'miniweb',
  // El titular propio de la ficha (titulo, destacado y texto, el que iba sobre la foto) sobra en una miniweb: ya está el Texto inicio
  hero: { ...negocio.hero, diseno: 'web', portada, barra: undefined, redesArriba: true, titulo: '', destacado: '', brillo: '', texto: '', pestanas: pestanasDeMiniweb(negocio) },
})
