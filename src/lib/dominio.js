/* La dirección de la web. Los QR, los enlaces que se mandan a los clientes y el texto legal llevan siempre esta, no la de donde se abra el
   Editor (localhost o la dirección de Netlify): lo que se imprime tiene que funcionar para siempre. */
export const DOMINIO = 'https://mostraq.es'

// La ruta (con su ?...) de una dirección guardada: sesiones de QR creadas antes del dominio llevan localhost o la dirección de Netlify
export function rutaDe(direccion) {
  try {
    const u = new URL(direccion, DOMINIO)
    return `${u.pathname}${u.search}`
  } catch {
    return direccion
  }
}

// La misma dirección pero con el dominio de verdad
export const conDominio = direccion => `${DOMINIO}${rutaDe(direccion)}`
