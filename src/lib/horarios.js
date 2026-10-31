/* Los diseños del horario de una miniweb (hero.horario; sin él, 'lista', el de siempre): cómo se juntan la foto y las líneas de días y horas
   de la página del Horario (src/heros/PaginaHorario.jsx). El título, la nota y el mapa de debajo no cambian. Cada diseño tiene sus variantes
   (hero.horarioVariante; sin ella, 'clasica', la primera), que salen como subpestañas al tocar el icono del diseño. dibujo: su icono en un
   cuadro de 24 × 24 (solo contornos). */
export const HORARIOS = [
  {
    clave: 'lista',
    nombre: 'Lista',
    dibujo: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><path d="M3 14h6M16 14h5M3 17h18M3 20.5h6M16 20.5h5"/>',
    variantes: [],
  },
  {
    clave: 'sangre',
    nombre: 'Foto a sangre',
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M6 12.5h12M6 15.5h9M6 18.5h12"/>',
    variantes: [
      { clave: 'clasica', nombre: 'Clásica', dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M6 12.5h12M6 15.5h9M6 18.5h12"/>' },
      { clave: 'centrado', nombre: 'Centrada', dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9.5h8M6 12.5h12M8 15.5h8"/>' },
      { clave: 'cristal', nombre: 'Tarjeta de cristal', dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="12" width="12" height="6.5" rx="2" fill="currentColor"/>' },
    ],
  },
  {
    clave: 'solapada',
    nombre: 'Tarjeta solapada',
    dibujo: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><rect x="5" y="9" width="14" height="12" rx="2" fill="#fff"/><path d="M8 13h8M8 16h5"/>',
    variantes: [
      { clave: 'clasica', nombre: 'Clásica', dibujo: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><rect x="5" y="9" width="14" height="12" rx="2" fill="#fff"/><path d="M8 13h8M8 16h5"/>' },
      { clave: 'banda', nombre: 'Con banda de color', dibujo: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><rect x="5" y="9" width="14" height="12" rx="2" fill="#fff"/><path d="M5 11.2h14" stroke-width="3.4"/><path d="M8 16h8M8 18.5h5"/>' },
      { clave: 'borde', nombre: 'Con barra lateral', dibujo: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><rect x="5" y="9" width="14" height="12" rx="1" fill="#fff"/><path d="M5.3 9.5v11" stroke-width="2.6"/><path d="M9 13h8M9 16h5"/>' },
    ],
  },
  {
    clave: 'columnas',
    nombre: 'Foto a un lado',
    dibujo: '<rect x="3" y="3" width="7" height="18" rx="1.2"/><path d="M13 7h8M13 11h6M13 15h8M13 19h5"/>',
    variantes: [
      { clave: 'clasica', nombre: 'Foto a la izquierda', dibujo: '<rect x="3" y="3" width="7" height="18" rx="1.2"/><path d="M13 7h8M13 11h6M13 15h8M13 19h5"/>' },
      { clave: 'derecha', nombre: 'Foto a la derecha', dibujo: '<rect x="14" y="3" width="7" height="18" rx="1.2"/><path d="M3 7h8M3 11h6M3 15h8M3 19h5"/>' },
      { clave: 'ancha', nombre: 'Foto ancha', dibujo: '<rect x="3" y="3" width="11" height="18" rx="1.2"/><path d="M17 8h4M17 12h3M17 16h4"/>' },
    ],
  },
  {
    clave: 'portada',
    nombre: 'Como la portada',
    dibujo: '<path d="M3 3h18v9L3 16z"/><path d="M3 19.5h12"/>',
    variantes: [],
  },
]

export const horarioDe = clave => HORARIOS.find(h => h.clave === clave) ?? HORARIOS[0]
export const CLAVES_HORARIOS = HORARIOS.map(h => h.clave)
export const CLAVES_VARIANTES_HORARIO = [...new Set(HORARIOS.flatMap(h => h.variantes.map(v => v.clave)))]
