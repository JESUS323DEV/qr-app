/* Los iconos de "Estructura: dónde va cada pieza" de una miniweb: cada opción dibuja un móvil con la pieza en su sitio. Dentro de un cuadro de
   24 × 24: el marco del móvil y, rellena, la pieza (la barra de redes, el menú o el botón de compartir). Se indexan por el campo de la
   estructura (redesEn, menuEn, compartirEn) y el valor de la opción. */
const MOVIL = '<rect x="5.5" y="2" width="13" height="20" rx="2.5"/>'

export const ICONOS_ESTRUCTURA = {
  redesEn: {
    // Una barra de redes horizontal pegada arriba, en el medio o abajo; o una columna al lado derecho
    arriba: `${MOVIL}<rect x="7.5" y="4" width="9" height="3" rx="1" fill="currentColor"/>`,
    lateral: `${MOVIL}<rect x="14" y="7" width="2.6" height="10" rx="1.2" fill="currentColor"/>`,
    medio: `${MOVIL}<rect x="7.5" y="10.5" width="9" height="3" rx="1" fill="currentColor"/>`,
    abajo: `${MOVIL}<rect x="7.5" y="17" width="9" height="3" rx="1" fill="currentColor"/>`,
  },
  menuEn: {
    // El menú de navegación (una barra con sus pestañas) arriba del todo o abajo, como una app
    arriba: `${MOVIL}<rect x="7.5" y="4" width="9" height="3.4" rx="1"/><path d="M9.3 5.7h1M11.5 5.7h1M13.7 5.7h1" stroke-width="1.3"/>`,
    abajo: `${MOVIL}<rect x="7.5" y="16.6" width="9" height="3.4" rx="1"/><path d="M9.3 18.3h1M11.5 18.3h1M13.7 18.3h1" stroke-width="1.3"/>`,
  },
  compartirEn: {
    // Como el diseño: un icono de compartir arriba a la derecha; junto al botón: un botón y su icono al lado; en las redes: una barra de redes con el icono al final
    diseno: `${MOVIL}<circle cx="15" cy="5.6" r="1" fill="currentColor"/><circle cx="12.6" cy="6.8" r="1"/><circle cx="15" cy="8.2" r="1"/>`,
    abajo: `${MOVIL}<rect x="7.5" y="15" width="6" height="3.4" rx="1.2" fill="currentColor"/><circle cx="16" cy="16.7" r="1.2"/>`,
    redes: `${MOVIL}<rect x="7.5" y="4" width="9" height="3.4" rx="1"/><circle cx="9.6" cy="5.7" r="0.6" fill="currentColor"/><circle cx="11.8" cy="5.7" r="0.6" fill="currentColor"/><circle cx="14.4" cy="5.7" r="0.9" fill="currentColor"/>`,
  },
}
