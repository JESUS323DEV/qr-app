/* Los diseños del horario de una miniweb (hero.horario; sin él, 'lista', el de siempre): cómo se juntan la foto y las líneas de días y horas
   de la página del Horario (src/heros/PaginaHorario.jsx). El título, la nota y el mapa de debajo no cambian. dibujo: su icono en un cuadro de
   24 × 24 (solo contornos). */
export const HORARIOS = [
  {
    clave: 'lista',
    nombre: 'Lista',
    dibujo: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><path d="M3 14h6M16 14h5M3 17h18M3 20.5h6M16 20.5h5"/>',
  },
  {
    clave: 'sangre',
    nombre: 'Foto a sangre',
    dibujo: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M6 12.5h12M6 15.5h9M6 18.5h12"/>',
  },
  {
    clave: 'solapada',
    nombre: 'Tarjeta solapada',
    dibujo: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><rect x="5" y="9" width="14" height="12" rx="2" fill="#fff"/><path d="M8 13h8M8 16h5"/>',
  },
  {
    clave: 'cartel',
    nombre: 'Cartel de puerta',
    dibujo: '<rect x="3" y="3" width="18" height="4" rx="1"/><path d="M9 11h6M5 14.5h14M8 18h8" stroke-width="1.8"/>',
  },
  {
    clave: 'columnas',
    nombre: 'Foto a un lado',
    dibujo: '<rect x="3" y="3" width="7" height="18" rx="1.2"/><path d="M13 7h8M13 11h6M13 15h8M13 19h5"/>',
  },
  {
    clave: 'portada',
    nombre: 'Como la portada',
    dibujo: '<path d="M3 3h18v9L3 16z"/><path d="M3 19.5h12"/>',
  },
]

export const horarioDe = clave => HORARIOS.find(h => h.clave === clave) ?? HORARIOS[0]
export const CLAVES_HORARIOS = HORARIOS.map(h => h.clave)
