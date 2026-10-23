// Lo que comparten la IA del editor del cliente (mi-qr) y la del generador de /admin (asistente, paso colores-qr):
// las siluetas, el formato de las propuestas, las instrucciones y el mensaje con lo que pide cada uno
const FORMAS_PUNTOS = ['rounded', 'extra-rounded', 'square', 'dots', 'classy-rounded', 'classy']

// Las siluetas del QR que hay en el editor (las mismas claves que en GeneradorQR): '' es el QR cuadrado de siempre
export const SILUETAS: Record<string, string> = {
  '': 'Clásico (el QR cuadrado, sin silueta)',
  flor: 'Flor (redonda, con el borde ondulado)',
  estrella: 'Estrella (de cinco puntas)',
  rombo: 'Rombo',
  ubicacion: 'Ubicación (el pin de los mapas)',
  'flor-tallo': 'Flor con tallo y hoja',
  taza: 'Taza de café',
  pulgar: 'Me gusta (pulgar arriba)',
  corazon: 'Corazón',
  bocadillo: 'Mensaje (bocadillo de chat)',
}

export const ESQUEMA = {
  type: 'object',
  properties: {
    propuestas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          motivo: { type: 'string' },
          puntos: { type: 'string' },
          esquinas: { type: 'string' },
          fondo: { type: 'string' },
          marco: { type: 'string' },
          textoMarco: { type: 'string' },
          formaPuntos: { type: 'string', enum: FORMAS_PUNTOS },
          formaEsquinas: { type: 'string', enum: ['extra-rounded', 'square', 'dot', ...FORMAS_PUNTOS.filter(f => !['extra-rounded', 'square'].includes(f))] },
          puntoEsquinas: { type: 'string', enum: ['dot', 'square', ...FORMAS_PUNTOS.filter(f => f !== 'square')] },
          degradado: {
            type: 'object',
            properties: {
              activo: { type: 'boolean' },
              colores: { type: 'array', items: { type: 'string' } },
              tipo: { type: 'string', enum: ['linear', 'radial'] },
              angulo: { type: 'integer' },
            },
            required: ['activo', 'colores', 'tipo', 'angulo'],
            additionalProperties: false,
          },
          doble: {
            type: 'object',
            properties: { activo: { type: 'boolean' }, colores: { type: 'array', items: { type: 'string' } } },
            required: ['activo', 'colores'],
            additionalProperties: false,
          },
          placa: {
            type: 'object',
            properties: {
              esquinas: { type: 'string', enum: ['rectas', 'suaves', 'redondas'] },
              borde: { type: 'string', enum: ['fino', 'normal', 'ancho'] },
            },
            required: ['esquinas', 'borde'],
            additionalProperties: false,
          },
          // El centro del QR: su forma y sus letras (las iniciales del nombre de arriba)
          centro: {
            type: 'object',
            properties: {
              forma: { type: 'string', enum: ['circulo', 'cuadrado', 'corazon', 'recto', 'hoja', 'hexagono', 'octogono', 'rombo', 'escudo', 'gota', 'estrella', 'sello'] },
              texto: { type: 'string' },
              // Qué lleva: nada, solo su forma (sin letras) o la forma con las letras de texto
              modo: { type: 'string', enum: ['nada', 'forma', 'texto'] },
              tamano: { type: 'string', enum: ['pequeno', 'normal', 'grande'] },
            },
            required: ['forma', 'texto', 'modo', 'tamano'],
            additionalProperties: false,
          },
          // La silueta del QR ('' es el clásico, sin silueta) y el color de su borde
          silueta: { type: 'string', enum: Object.keys(SILUETAS) },
          contorno: { type: 'string' },
          tipografia: { type: 'string' },
          tamano: { type: 'string', enum: ['pequeno', 'normal', 'grande'] },
          // El título (el texto de arriba): su tamaño (xs, md o xl) y su color ('' es el mismo de los demás textos)
          titulo: {
            type: 'object',
            properties: { tamano: { type: 'string', enum: ['xs', 'md', 'xl'] }, color: { type: 'string' } },
            required: ['tamano', 'color'],
            additionalProperties: false,
          },
          // El eslogan (abajo1): su tamaño y si va bajo el título ('arriba') o abajo, junto al QR
          eslogan: {
            type: 'object',
            properties: { tamano: { type: 'string', enum: ['xs', 'md', 'xl'] }, posicion: { type: 'string', enum: ['arriba', 'abajo'] } },
            required: ['tamano', 'posicion'],
            additionalProperties: false,
          },
          // El otro texto (abajo2): su tamaño
          otroTexto: {
            type: 'object',
            properties: { tamano: { type: 'string', enum: ['xs', 'md', 'xl'] } },
            required: ['tamano'],
            additionalProperties: false,
          },
          // Iconos de redes de la placa (solo el icono, en fila bajo los textos): vacía si el cliente no ha nombrado ninguna red
          iconos: { type: 'array', items: { type: 'string', enum: ['google', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'youtube', 'twitter', 'linkedin'] } },
          // Los 3 campos de texto de la placa: uno encima del QR y dos debajo
          textos: {
            type: 'object',
            properties: { arriba: { type: 'string' }, abajo1: { type: 'string' }, abajo2: { type: 'string' } },
            required: ['arriba', 'abajo1', 'abajo2'],
            additionalProperties: false,
          },
        },
        required: ['nombre', 'motivo', 'puntos', 'esquinas', 'fondo', 'marco', 'textoMarco', 'formaPuntos', 'formaEsquinas', 'puntoEsquinas', 'degradado', 'doble', 'placa', 'centro', 'silueta', 'contorno', 'tipografia', 'tamano', 'textos', 'titulo', 'eslogan', 'otroTexto', 'iconos'],
        additionalProperties: false,
      },
    },
  },
  required: ['propuestas'],
  additionalProperties: false,
}

export const INSTRUCCIONES = `Eres el asistente de diseño de Jesús, que hace placas con QR para negocios locales de Barcelona: el QR va impreso en una placa o pegatina en el local y abre la página del negocio. El dueño del negocio marca hasta tres diseños (siluetas) y te cuenta qué colores representan su marca y cómo quiere su placa; tú propones TRES diseños completos, distintos entre sí, que se lean siempre con cualquier móvil.
- Manda lo que pide el cliente: sus colores son la base de las tres propuestas.
- Las tres propuestas distintas: por ejemplo, una fiel a lo que pide, una más llamativa y una más sobria o elegante.

Colores (todos en #RRGGBB):
- marco: el color de la placa alrededor del QR. Es lo que más se ve.
- textoMarco: el color de los textos de la placa. Con mucho contraste sobre el marco.
- fondo: el fondo del cuadrado del QR. Casi siempre blanco o un tono muy claro.
- puntos y esquinas: oscuros sobre el fondo. Nada de amarillos, beis o pasteles en los puntos: aunque sean de la marca, van en el marco o en los textos.
- degradado (opcional, en los puntos): de 2 a 4 colores, todos oscuros; tipo "linear" o "radial"; angulo en grados (0 de izquierda a derecha, 90 de arriba abajo, 45 o 315 en diagonal). Si no lleva, activo false, colores vacía, tipo "linear" y angulo 0.
- doble (opcional): doble imagen como el logo de TikTok (dos copias de colores desplazadas por debajo). Solo si encaja (atrevido, nocturno, joven). Con doble imagen, puntos y esquinas SIEMPRE negros o casi negros (#141414 o más oscuro) y sin degradado: con puntos de color, las copias no dejan leer el QR. Si no lleva, activo false y colores vacía.

Formas (que vayan con el estilo):
- formaPuntos: rounded (redondeados), extra-rounded (muy redondeados), square (cuadrados), dots (puntos), classy-rounded (elegantes), classy (elegantes rectos).
- formaEsquinas (el marco de los tres ojos de las esquinas) y puntoEsquinas (su punto de dentro): las mismas formas, más dot (círculo) y, en formaEsquinas, extra-rounded (redondeado) y square (cuadrado). Elegante: classy-rounded y dot; moderno o alegre: dots o extra-rounded; sobrio: square.
- placa (siempre rectangular; la forma no la eliges tú): esquinas rectas, suaves o redondas; borde fino, normal o ancho alrededor del QR.
- centro: lo que va en medio del QR. texto: las iniciales del nombre que pones arriba en la placa (la primera letra de cada palabra, en mayúsculas, como mucho 3: "Hornitos" → "H", "Corte Oeste" → "CO"). forma: la que mejor vaya con la propuesta: circulo, cuadrado, corazon, recto (cuadrado de esquinas rectas), hoja, hexagono, octogono, rombo, escudo, gota, estrella o sello.
  modo: 'texto' (la forma con las iniciales, lo normal), 'forma' (solo la forma, sin letras; si el nombre es largo o las iniciales no dicen nada) o 'nada' (sin nada en medio; lo más seguro para que se lea, si el cliente pide un QR muy limpio). tamano: pequeno, normal o grande; con QR de mucho contenido o si pide máxima lectura, pequeno; normal casi siempre. Si el diseño marcado ya lleva un logo de red en el centro, deja modo 'nada'.

Silueta (la forma que rodea al QR, rellena de puntos de adorno con el color de los puntos y con su borde):
- silueta: te paso los diseños que ha marcado el cliente, en orden (de 0 a 3). La propuesta 1 va con el primero, la 2 con el segundo y la 3 con el tercero, TAL CUAL. Las que no tengan diseño marcado, con una silueta que elijas tú de la lista, distinta de las demás propuestas y que pegue con el negocio.
- Los colores de cada propuesta tienen que pegar con su forma (una estrella, en tonos de estrella; una taza, en tonos de café; un corazón, en tonos de corazón).
- contorno: el color del borde de la silueta (#RRGGBB). Puede ser claro u oscuro, no afecta a la lectura; que pegue con la forma y con los puntos. Con el clásico (sin silueta) no se ve: pon el de las esquinas.

Letra y textos:
- tipografia: el id de una de la lista que te paso, la que mejor vaya con el estilo; vacío para dejar la de la marca.
- tamano: pequeno, normal o grande (el de los textos de la placa).
- titulo (el texto de arriba): tamano xs, md o xl. xl para nombres cortos (hasta unos 12 letras), md para los medianos y xs para los largos (más de 20 letras); si dudas, md. color: '' (el mismo de los demás textos) o un #RRGGBB si el cliente pide el título de otro color o si queda mucho mejor; con mucho contraste sobre el marco.
- eslogan (abajo1): tamano xs, md o xl (xl es el normal; xs o md si es largo). posicion: 'abajo' (junto al QR, lo normal) o 'arriba' (justo bajo el título); 'arriba' solo si el cliente quiere el eslogan pegado al nombre.
- otroTexto (abajo2): tamano xs, md o xl; normalmente xs o md, que es un texto secundario.
- iconos: los iconos de redes que lleva la placa, SOLO los que el cliente ha nombrado en lo que cuenta (Google o reseñas, Instagram, TikTok, Facebook, WhatsApp, YouTube, X o Twitter, LinkedIn), en el mismo orden en que los nombra y como mucho 4. NUNCA pongas iconos que no haya pedido ni los inventes: si no ha nombrado ninguna red, lista vacía. Los iconos no llevan texto.
- textos: los 3 textos de la placa, en español correcto, con tildes y sin guiones largos, como mucho 30 caracteres cada uno:
  - arriba: lo que va encima del QR. Normalmente el nombre del negocio, tal cual; o lo que pida el cliente.
  - abajo1: debajo del QR, una llamada corta a escanear que vaya con lo que pide ("Escanea y déjanos tu reseña", "Mira nuestra carta", "Pide tu cita"...).
  - abajo2: una segunda línea debajo (un eslogan corto, el horario, la dirección...). Datos como el horario o la dirección, SOLO si el cliente los ha escrito tal cual: nunca te los inventes. Si no hace falta, vacío.
  Si el cliente dice qué texto quiere en algún sitio, ponlo tal cual.

nombre: dos o tres palabras ("Como tu marca", "Noche y oro"...). motivo: una frase corta en castellano de por qué funciona, hablando de tú al cliente, sin guiones largos.`

/* El mensaje para la IA: el nombre del negocio, los diseños marcados (hasta 3, en orden), lo que cuenta y las
   tipografías que hay. colores: los de su página, solo en el panel de Jesús (de referencia, si no dice otros) */
export function mensaje({
  nombre,
  descripcion,
  siluetas: marcadas,
  tipografias,
  colores,
}: {
  nombre: string
  descripcion: string
  siluetas: unknown
  tipografias: unknown
  colores?: any
}) {
  const siluetas = [...new Set((Array.isArray(marcadas) ? marcadas : []).filter((x: unknown) => typeof x === 'string' && x in SILUETAS))].slice(0, 3) as string[]
  const lista = Array.isArray(tipografias) ? tipografias.slice(0, 30) : []
  const c = colores ?? {}
  return [
    `Negocio: ${nombre}`,
    `${
      siluetas.length
        ? `Diseños marcados, en orden:\n${siluetas.map((k, i) => `${i + 1}. "${k}" (${SILUETAS[k]})`).join('\n')}${siluetas.length < 3 ? `\nLas propuestas ${siluetas.length + 1} a 3, con siluetas que elijas tú.` : ''}`
        : 'No hay ningún diseño marcado: elige tú una silueta distinta para cada propuesta.'
    }\nSiluetas que hay (clave: forma):\n${Object.entries(SILUETAS).map(([k, v]) => `"${k}": ${v}`).join('\n')}`,
    descripcion ? `Lo que quiere:\n${descripcion}` : 'No ha dicho nada concreto: guíate por los colores de su página.',
    colores
      ? `Colores de su página (de referencia, si no dice otros):\n- fondo: ${c.bg}\n- superficies: ${c.surface}\n- principal: ${c.primary}\n- acento: ${c.accent}\n- texto: ${c.text}${c.header ? `\n- cabecera: ${c.header}` : ''}`
      : '',
    lista.length ? `Tipografías (id: nombre. estilo):\n${lista.map((t: any) => `${t.id}: ${t.nombre}. ${t.estilo}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
