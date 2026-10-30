/* Los textos de la portada de una miniweb que crecen cuando la pantalla es más alta de 640 px (svh): hasta esa altura salen exactamente como
   siempre (con su valor de siempre, el que dependa del ancho) y a partir de ahí crecen un poco por cada píxel de más, hasta un máximo.
   Cada uno son las clases que se le pasan al componente (TextoInicio y CtaPortada) en lugar de las de siempre. El nombre no se escala. */
export const ESCALA_TEXTO = {
  titular: 'text-[length:min(3.2rem,calc(clamp(1.8rem,1.5rem_+_1.8vw,2.3rem)_+_max(0px,100svh_-_640px)_*_0.037))]',
  descripcion: 'max-w-[26rem] text-[length:min(1.08rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0066))]',
  boton: 'min-h-[min(3rem,calc(2.5rem_+_max(0px,100svh_-_640px)_*_0.0203))] px-[min(1.35rem,calc(1.1rem_+_max(0px,100svh_-_640px)_*_0.0101))] text-[length:min(1.12rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0091))]',
  compartir: 'text-[length:min(0.95rem,calc(0.75rem_+_max(0px,100svh_-_640px)_*_0.0076))]! px-[min(1rem,calc(0.75rem_+_max(0px,100svh_-_640px)_*_0.0101))]! py-[min(0.5rem,calc(0.3rem_+_max(0px,100svh_-_640px)_*_0.0076))]!',
  extra: 'max-w-[26rem] text-[length:min(1.02rem,calc(0.85rem_+_max(0px,100svh_-_640px)_*_0.0076))]',
  // La pantalla de Horario de Fullbleed: el título y las líneas de días y horas
  horarioTitulo: 'text-[length:min(2.7rem,calc(2rem_+_max(0px,100svh_-_640px)_*_0.0354))]',
  horarioLineas: 'text-[length:min(1.15rem,calc(0.9rem_+_max(0px,100svh_-_640px)_*_0.0127))]',
}

// Fullbleed, Formatos (Editorial) y Cortes (Diagonal): el titular y la descripción crecen un poco más que en los demás diseños, pero solo a partir de 680 px de alto:
// en M (780) un poco y en L (956) bastante. Hasta ahí (XS y S) salen exactamente como los de ESCALA_TEXTO
export const ESCALA_TEXTO_GRANDE = {
  titular: 'text-[length:min(4.2rem,calc(clamp(1.8rem,1.5rem_+_1.8vw,2.3rem)_+_max(0px,100svh_-_640px)_*_0.037_+_max(0px,100svh_-_680px)_*_0.0574))]',
  descripcion: 'max-w-[26rem] text-[length:min(1.2rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0066_+_max(0px,100svh_-_680px)_*_0.0077))]',
}

// La card de reseña de Google de las miniwebs (la de tamaño normal; la compacta se queda como está): crece con el alto de la pantalla, de un 15 % menos de lo
// de siempre a 640 px de alto hasta un 14 % más a 956 px, sin saltos. Cada uno son las clases de ese elemento en lugar de las de siempre.
export const ESCALA_RESENA = {
  logo: 'h-[min(2.85rem,calc(2.125rem_+_max(0px,100svh_-_640px)_*_0.0367))] w-[min(2.85rem,calc(2.125rem_+_max(0px,100svh_-_640px)_*_0.0367))]',
  estrella: 'h-[min(1.82rem,calc(1.36rem_+_max(0px,100svh_-_640px)_*_0.0235))] w-[min(1.82rem,calc(1.36rem_+_max(0px,100svh_-_640px)_*_0.0235))]',
  texto: 'text-[length:min(1.48rem,calc(1.105rem_+_max(0px,100svh_-_640px)_*_0.0191))]',
  aire: 'gap-[min(0.51rem,calc(0.38rem_+_max(0px,100svh_-_640px)_*_0.0066))]',
  relleno: 'py-[min(1.14rem,calc(0.85rem_+_max(0px,100svh_-_640px)_*_0.0147))]',
  // El mismo relleno, para el estilo en línea de la card con tarjeta destacada
  rellenoEstilo: 'min(1.14rem, calc(0.85rem + max(0px, 100svh - 640px) * 0.0147))',
}

// La misma card de reseña, en su versión compacta (la que usan las miniwebs de página completa): de un 15 % menos a 640 px de alto a un 14 % más a 956 px
export const ESCALA_RESENA_COMPACTA = {
  logo: 'h-[min(2.17rem,calc(1.62rem_+_max(0px,100svh_-_640px)_*_0.0279))] w-[min(2.17rem,calc(1.62rem_+_max(0px,100svh_-_640px)_*_0.0279))]',
  estrella: 'h-[min(1.425rem,calc(1.06rem_+_max(0px,100svh_-_640px)_*_0.01836))] w-[min(1.425rem,calc(1.06rem_+_max(0px,100svh_-_640px)_*_0.01836))]',
  texto: 'text-[length:min(1.254rem,calc(0.935rem_+_max(0px,100svh_-_640px)_*_0.01616))]',
  aire: 'gap-[min(0.342rem,calc(0.255rem_+_max(0px,100svh_-_640px)_*_0.0044))]',
  relleno: 'py-[min(0.8rem,calc(0.595rem_+_max(0px,100svh_-_640px)_*_0.01028))]',
  rellenoEstilo: 'min(0.8rem, calc(0.595rem + max(0px, 100svh - 640px) * 0.01028))',
}

// La landing en pantallas largas (Tu QR y Planes): lo mismo que arriba, para que lo que hay en cada pestaña crezca y no quede sitio vacío
export const ESCALA_LANDING = {
  placa: 'w-[min(78%,calc(min(52%,13rem)_+_max(0px,100svh_-_640px)_*_0.38))]',
  planesGrupo: 'gap-[min(1.2rem,calc(0.7rem_+_max(0px,100svh_-_640px)_*_0.0253))]',
  planTarjeta: 'px-[min(1.3rem,calc(1rem_+_max(0px,100svh_-_640px)_*_0.0152))] py-[min(1.4rem,calc(0.8rem_+_max(0px,100svh_-_640px)_*_0.0304))]',
  planTitulo: 'text-[length:min(1.8rem,calc(1.35rem_+_max(0px,100svh_-_640px)_*_0.0228))]',
  planPrecio: 'text-[length:min(1.4rem,calc(1.05rem_+_max(0px,100svh_-_640px)_*_0.0177))]',
  pasoNumero: 'text-[length:min(3rem,calc(2rem_+_max(0px,100svh_-_640px)_*_0.0506))]',
  pasoTitulo: 'text-[length:min(1.5rem,calc(1.1rem_+_max(0px,100svh_-_640px)_*_0.0203))]',
  pasoTexto: 'text-[length:min(1.02rem,calc(0.85rem_+_max(0px,100svh_-_640px)_*_0.0086))]',
  pasoAire: 'gap-[min(1.2rem,calc(0.9rem_+_max(0px,100svh_-_640px)_*_0.0152))]',
  ventajaTitulo: 'text-[length:min(1.4rem,calc(1.05rem_+_max(0px,100svh_-_640px)_*_0.0177))]',
  ventajaFila: 'py-[min(1.2rem,calc(0.7rem_+_max(0px,100svh_-_640px)_*_0.0253))]',
  seoTitulo: 'text-[length:min(1.65rem,calc(1.2rem_+_max(0px,100svh_-_640px)_*_0.0228))]',
  seoEtiqueta: 'text-[length:min(1.2rem,calc(0.95rem_+_max(0px,100svh_-_640px)_*_0.0158))]',
  planTexto: 'text-[length:min(1.05rem,calc(0.88rem_+_max(0px,100svh_-_640px)_*_0.0086))]',
  // Formulario de Contacto
  formTitulo: 'text-[length:min(3rem,calc(clamp(1.9rem,1.5rem_+_2vw,2.5rem)_+_max(0px,100svh_-_640px)_*_0.0379))]',
  formAire: 'gap-[min(0.9rem,calc(0.5rem_+_max(0px,100svh_-_640px)_*_0.0202))]',
  formCampo: 'min-h-[min(3.4rem,calc(2.5rem_+_max(0px,100svh_-_640px)_*_0.0455))]',
  formTexto: 'text-[length:min(1.08rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0081))]',
  formArea: 'min-h-[min(7.6rem,calc(5.1rem_+_max(0px,100svh_-_640px)_*_0.1265))]',
  formAceptar: 'text-[length:min(0.92rem,calc(0.78rem_+_max(0px,100svh_-_640px)_*_0.0071))]',
  formBoton: 'min-h-[min(3.4rem,calc(2.75rem_+_max(0px,100svh_-_640px)_*_0.0329))] text-[length:min(1.1rem,calc(1rem_+_max(0px,100svh_-_640px)_*_0.005))]',
}
