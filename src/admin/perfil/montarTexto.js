/* Los textos para el asistente de una miniweb (modo "terminar"), armados a partir de los campos del formulario (FormularioTexto): tipo de negocio, barrio, tono y
   colores. Cada prompt de la lista usa esos cuatro datos; lo demás (el horario, por ejemplo) va fijo dentro del prompt, y lo que va entre [corchetes] se cambia a mano
   en el cuadro antes de pulsar Terminar. Sin IA ni coste: solo ordena lo escrito. Lo que se deja vacío en el formulario no sale. */

export const TONOS = ['Cercano', 'Elegante', 'Juvenil', 'Tranquilo']

export const CAMPOS_VACIOS = { tipo: '', barrio: '', tonos: [], colores: '' }

// El prompt completo: todo lo editable menos el diseño (textos, fotos, colores y las dos barras). El menú y los servicios no entran: el asistente no los ve en este modo
const LINEAS_FIJAS = [
  'Rellena todo lo editable, sin tocar el diseño:',
  '- Inicio: inventa un titular y una descripción para el negocio, y pon una foto distinta en cada hueco.',
  '- Horario: escribe su título y su nota corta, y un horario creíble para este tipo de negocio.',
  '- Pedir cita (o Reservar): escribe todos sus textos, incluidos "Lo que hacemos" y "Quiénes somos", sin inventar cifras, años ni premios. El teléfono y el WhatsApp déjalos como están.',
  '- Reseña de Google: escribe su texto.',
  'Pinta también el menú de navegación (fondo, letras, pestaña elegida y pestañas sin elegir) y la barra de redes (fondo, iconos y texto) con los colores de la marca, con buen contraste.',
]

const limpiar = ({ tipo, barrio, tonos, colores }) => ({ t: (tipo ?? '').trim(), b: (barrio ?? '').trim(), c: (colores ?? '').trim(), to: (tonos ?? []).map(x => x.toLowerCase()) })

// "tienda de uñas en Gràcia. Tono cercano y juvenil. Colores: rosa palo y crema." (lo vacío no sale)
const lineaNegocio = campos => {
  const { t, b, c, to } = limpiar(campos)
  return [t || b ? `${t || 'Negocio'}${b ? ` en ${b}` : ''}.` : '', to.length ? `Tono ${to.join(' y ')}.` : '', c ? `Colores: ${c}.` : ''].filter(Boolean).join(' ')
}

const unir = lineas => lineas.filter(Boolean).join('\n')

// El prompt de siempre (el primero de la lista): el que escribe "Generar texto"
export default function montarTexto(campos) {
  return unir([lineaNegocio(campos), ...LINEAS_FIJAS])
}

// Todos los prompts, con su título: cada uno es una función de los campos del formulario
export const PROMPTS = [
  { titulo: 'Completo: textos, fotos y colores', construir: montarTexto },
  {
    titulo: 'Solo colores',
    construir: campos => {
      const { c } = limpiar(campos)
      return unir([
        'Cambia solo los colores: no toques ningún texto ni ninguna foto.',
        c ? `Colores de la marca: ${c}.` : '',
        'Pinta también el menú de navegación (fondo, letras, pestaña elegida y pestañas sin elegir) y la barra de redes (fondo, iconos y texto), con buen contraste.',
      ])
    },
  },
  {
    titulo: 'Solo textos de Inicio',
    construir: campos => {
      const { to } = limpiar(campos)
      return unir([
        `Cambia solo los textos de Inicio (titular y descripción)${to.length ? `, con un tono ${to.join(' y ')}` : ''}.`,
        lineaNegocio({ ...campos, tonos: [], colores: '' }),
        '[Lo que ofrece, en una frase].',
        'No toques los colores, las fotos ni las demás pestañas.',
      ])
    },
  },
  {
    titulo: 'Solo fotos de Inicio',
    construir: campos => {
      const { t } = limpiar(campos)
      return unir([
        `Cambia solo las fotos de Inicio: busca fotos distintas de ${t ? `${t}: ` : ''}[lo que se ve en el negocio: manos con uñas pintadas, local, productos, herramientas].`,
        'Un plano o tema diferente en cada hueco.',
        'No toques los textos ni los colores.',
      ])
    },
  },
]
