/* Los textos de la portada de una miniweb que crecen cuando la pantalla es más alta de 640 px (svh): hasta esa altura salen exactamente como
   siempre (con su valor de siempre, el que dependa del ancho) y a partir de ahí crecen un poco por cada píxel de más, hasta un máximo.
   Cada uno son las clases que se le pasan al componente (TextoInicio y CtaPortada) en lugar de las de siempre. El nombre no se escala. */
export const ESCALA_TEXTO = {
  titular: 'text-[length:min(3.2rem,calc(clamp(1.8rem,1.5rem_+_1.8vw,2.3rem)_+_max(0px,100svh_-_640px)_*_0.037))]',
  descripcion: 'max-w-[26rem] text-[length:min(1.08rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0066))]',
  boton: 'min-h-[min(3rem,calc(2.5rem_+_max(0px,100svh_-_640px)_*_0.0203))] px-[min(1.35rem,calc(1.1rem_+_max(0px,100svh_-_640px)_*_0.0101))] text-[length:min(1.12rem,calc(0.92rem_+_max(0px,100svh_-_640px)_*_0.0091))]',
  compartir: 'text-[length:min(0.95rem,calc(0.75rem_+_max(0px,100svh_-_640px)_*_0.0076))]! px-[min(1rem,calc(0.75rem_+_max(0px,100svh_-_640px)_*_0.0101))]! py-[min(0.5rem,calc(0.3rem_+_max(0px,100svh_-_640px)_*_0.0076))]!',
  extra: 'max-w-[26rem] text-[length:min(1.02rem,calc(0.85rem_+_max(0px,100svh_-_640px)_*_0.0076))]',
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
}
