/* Estilo del precio de un plato o de una oferta: el color "Texto del precio" del Editor (--demo-precio-texto; sin él, el de cada estilo)
   y el tamaño XS, MD o XL (--demo-precio-escala), los mismos ajustes que el precio del menú del día */
export const estiloPrecio = colorPorDefecto => ({
  color: `var(--demo-precio-texto, ${colorPorDefecto})`,
  zoom: 'var(--demo-precio-escala, 1)',
})

// El tamaño del nombre del negocio en la cabecera de la carta (el XS, MD o XL del Editor: --demo-nombre-escala, que pone CartaPage)
export const ZOOM_NOMBRE = { zoom: 'var(--demo-nombre-escala, 1)' }
