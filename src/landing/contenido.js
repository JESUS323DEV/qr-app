// Todo el texto y los datos de la landing están aquí para cambiarlos sin tocar el diseño.
// Provisional: nombre de la marca, número de WhatsApp y precios.

export const marca = {
  nombre: 'Mostrador',
  ciudad: 'Barcelona',
  whatsapp: '34600000000',
  mensajeWhatsapp: 'Hola, he visto Mostrador y me interesa para mi negocio.',
}

export const hero = {
  titulo: 'Que los clientes que ya entran te dejen reseña y vuelvan.',
  texto:
    'Una placa con un QR en tu mostrador. Al escanearla se abre una página con tu marca: reseña en Google, Instagram, WhatsApp, citas o la carta. Yo la diseño, la instalo y la cambio cuando haga falta.',
  boton: 'Pídela por WhatsApp',
  enlace: 'Ver ejemplos',
  placa: {
    negocio: 'Peluquería Olivo',
    texto: 'Reseñas, citas y redes',
  },
}

export const porque = {
  titulo: 'Cada día entra gente que te dejaría cinco estrellas.',
  texto:
    'Pero nadie busca tu ficha de Google para escribir una reseña, ni apunta tu Instagram de memoria. Con la placa basta con sacar el móvil y apuntar con la cámara. En dos toques están dentro.',
}

export const pasos = {
  titulo: 'Cómo funciona',
  lista: [
    {
      titulo: 'Me cuentas qué te importa',
      texto: 'Más reseñas, más citas, que te pidan por WhatsApp. Lo que más te importe va arriba y en grande.',
    },
    {
      titulo: 'Diseño tu página y tu placa',
      texto: 'Con tus colores, tus fotos y tu logo. Te llevo la placa al local y la dejamos puesta.',
    },
    {
      titulo: 'La mantengo al día',
      texto: 'Si cambias el horario, la carta o cierras en agosto, me escribes y lo cambio. El QR es el mismo y no hay que reimprimir nada.',
    },
  ],
}

export const botones = {
  titulo: 'Qué puede llevar tu página',
  nota: 'Solo lo que tú quieras. Mejor pocas cosas y claras que muchas.',
  lista: [
    'Reseña en Google',
    'WhatsApp, con un formulario para que te escriban ordenado',
    'Instagram, TikTok y tus redes',
    'Pedir cita',
    'La carta o tus precios',
    'Cómo llegar',
    'Horario',
    'La clave del wifi',
    'Tu web, si la tienes',
  ],
}

// Cuando existan las miniwebs, cada ejemplo llevará el slug de la suya.
export const ejemplos = {
  titulo: 'Así se ve en el móvil',
  lista: [
    { sector: 'Peluquería', texto: 'Lo primero, pedir cita.', slug: null },
    { sector: 'Cafetería', texto: 'Lo primero, la carta.', slug: null },
    { sector: 'Tienda de barrio', texto: 'Lo primero, escribir por WhatsApp.', slug: null },
  ],
}

export const precio = {
  titulo: 'Precio',
  partes: [
    {
      nombre: 'Para empezar',
      cifra: '129 €',
      detalle: 'Diseño de la página, montaje y la placa con tu marca.',
    },
    {
      nombre: 'Después',
      cifra: '9 € al mes',
      detalle: 'La página online, los cambios que necesites y un resumen de cuánta gente la usa.',
    },
  ],
  nota: '¿Quieres otra placa para el escaparate o una pegatina para la puerta? Te la hago aparte.',
}

export const preguntas = {
  titulo: 'Preguntas',
  lista: [
    {
      pregunta: '¿No es lo mismo que un Linktree gratis?',
      respuesta:
        'Linktree es una lista de enlaces que montas tú. Aquí tienes una página con la imagen de tu negocio, una placa física con buen acabado y alguien que lo monta y lo cambia por ti.',
    },
    {
      pregunta: '¿Necesito tener página web?',
      respuesta:
        'No. Muchos negocios solo tienen Instagram y les basta. Si algún día quieres una web completa, también la hago.',
    },
    {
      pregunta: '¿Mis clientes tienen que descargar algo?',
      respuesta: 'No. Apuntan con la cámara del móvil y se abre la página.',
    },
    {
      pregunta: '¿Y si cambio el horario o la carta?',
      respuesta: 'Me escribes y lo cambio. La placa no se toca.',
    },
  ],
}

export const cierre = {
  titulo: '¿Lo quieres para tu negocio?',
  texto: 'Escríbeme y te enseño un ejemplo en persona.',
  boton: 'Escribir por WhatsApp',
}

export const pie = {
  firma: 'Hecho por JesúsDev',
}
