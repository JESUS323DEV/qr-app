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
