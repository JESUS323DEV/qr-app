/* Los estilos del menú de navegación de una miniweb (hero.barra; sin él, la rayita de siempre), agrupados como subpestañas: cada grupo
   es un icono que, al tocarlo, abre sus estilos. DIBUJOS_MENU: el icono de cada estilo, que dibuja solo la marca de la pestaña elegida
   (la raya, la onda, la pastilla...), grande y ocupando casi todo el cuadro de 24 × 24. La clave vacía es la rayita de siempre; las
   demás son las de BARRAS (fichas/barras.jsx). GRUPOS_MENU: cada grupo, con sus claves en orden y el dibujo de lo que tienen en común. */
export const DIBUJOS_MENU = {
  // Una raya gorda corta abajo
  '': '<path d="M7 19h10" stroke-width="3.2"/>',
  // Una raya larga abajo: una línea fina de lado a lado y, encima, la gorda de la elegida
  subrayado: '<path d="M2 19h20" stroke-width="1"/><path d="M2 19h14" stroke-width="3.2"/>',
  // Una onda abajo
  onda: '<path d="M2 17c2.2-3.2 3.8-3.2 5.5 0s3.3 3.2 5 0 3.3-3.2 5 0 2.2 2.4 4.5 0" stroke-width="2.2"/>',
  // Una raya gorda encima
  revista: '<path d="M3 5h18" stroke-width="1"/><path d="M3 5h10" stroke-width="3.2"/>',
  // Palabras separadas por barras
  barras: '<path d="M8 4v16M16 4v16" stroke-width="2"/>',
  // Una píldora con la elegida rellena
  segmentada: '<rect x="2" y="7" width="20" height="10" rx="5"/><rect x="3.6" y="8.6" width="9" height="6.8" rx="3.4" fill="currentColor"/>',
  // Pastillas separadas, la elegida rellena
  pastillas: '<rect x="2" y="7" width="6" height="10" rx="3" fill="currentColor"/><rect x="9" y="7" width="6" height="10" rx="3"/><rect x="16" y="7" width="6" height="10" rx="3"/>',
  // Bloques rectos pegados, el elegido relleno
  bloques: '<rect x="2" y="7" width="7" height="10" fill="currentColor"/><rect x="9" y="7" width="6.5" height="10"/><rect x="15.5" y="7" width="6.5" height="10"/>',
  // La pestaña de carpeta tal como es en las fichas: un bloque con solo las esquinas de arriba redondas y la base recta, rellena (la elegida)
  carpeta: '<path d="M4 19v-8q0-3.5 3.5-3.5h9q3.5 0 3.5 3.5v8z" fill="currentColor"/>',
  // Un icono y su nombre debajo, como la barra de una app
  app: '<rect x="7" y="3.5" width="10" height="10" rx="3" fill="currentColor"/><path d="M6.5 19h11" stroke-width="2"/>',
}

export const GRUPOS_MENU = [
  {
    clave: 'texto',
    nombre: 'De texto',
    claves: ['', 'subrayado', 'onda', 'revista', 'barras'],
    // Tres palabras cortas con una raya gorda debajo de la primera
    dibujo: '<path d="M3 8h4M10 8h4M17 8h4"/><path d="M3 14h4" stroke-width="3"/>',
  },
  {
    clave: 'forma',
    nombre: 'Con forma',
    claves: ['segmentada', 'pastillas', 'bloques', 'carpeta', 'app'],
    // Tres pastillas en fila, la primera rellena
    dibujo: '<rect x="2" y="8" width="6" height="8" rx="4" fill="currentColor"/><rect x="9" y="8" width="6" height="8" rx="4"/><rect x="16" y="8" width="6" height="8" rx="4"/>',
  },
]
