// marcaVista: sacado de NuevoPerfil.jsx. Es una función pura: solo lee los datos que se le pasan (el estado de los hooks y lo que se deduce de él)
export default function marcaVista(datos) {
  const { acento, barra, cabecera, cambiosExtra, cambiosIA, cartaMini, colorFiltroCarta, colorPrecio, colorPrecioTexto, colorTexto, coloresCarta, coloresMini, composicion, conCabecera, conTextoExtra, corte, detallePrecio, disposicion, distribucion, enlaceNegocio, esCarta, estilo, filtroCarta, filtroFoto, fondo, fondo2, formato, hero, horarioMini, horarioVar, lema, letra, logoElegido, lugares, montaje, nombreVista, pase, principal, producto, subCarta, tamanoNombre, tamanoPrecio, textoExtra, textoGrande, textoPequeno, textoSuave, textosEditados, textosPrevia, versionExtra, versionIA } = datos
  return (
    [
  // Con el nombre vacío, la vista previa enseña "Prueba" (y no el de la demo, Chalaquita, Almendra...)
  `nombre=${encodeURIComponent(nombreVista || 'Prueba')}`,
  esCarta && lema !== null && `lema=${encodeURIComponent(lema)}`,
  principal && `principal=${principal.slice(1)}`,
  acento && `acento=${acento.slice(1)}`,
  colorTexto && `texto=${colorTexto.slice(1)}`,
  fondo && `fondo=${fondo.slice(1)}`,
  letra && `letra=${letra}`,
  ...(producto === 'miniweb' && textosEditados ? [`tg1=${encodeURIComponent(textoGrande)}`, `tp=${encodeURIComponent(textoPequeno)}`] : []),
  producto === 'miniweb' && conTextoExtra && `ti=${encodeURIComponent(textoExtra)}`,
  producto === 'miniweb' && Object.keys(coloresMini).length > 0 && `col=${Object.entries(coloresMini).map(([clave, valor]) => `${clave}-${valor.slice(1)}`).join(',')}`,
  !esCarta && tamanoNombre !== 'md' && `tamano=${tamanoNombre}`,
  esCarta && tamanoNombre !== 'md' && `tnombre=${tamanoNombre}`,
  !esCarta && hero === 'diagonal' && corte !== 'diagonal' && `corte=${corte}`,
  !esCarta && hero === 'editorial' && formato !== 'clasica' && `formato=${formato}`,
  !esCarta && hero === 'fullbleed' && disposicion !== 'clasica' && `disposicion=${disposicion}`,
  !esCarta && hero === 'mosaico' && composicion !== 'clasica' && `composicion=${composicion}`,
  !esCarta && hero === 'retrato' && distribucion !== 'clasica' && `distribucion=${distribucion}`,
  !esCarta && hero === 'galeria' && pase !== 'clasica' && `pase=${pase}`,
  !esCarta && hero === 'polaroid' && montaje !== 'clasica' && `montaje=${montaje}`,
  producto === 'miniweb' && cartaMini && `carta=${cartaMini}`,
  producto === 'miniweb' && horarioMini && `horario=${horarioMini}`,
  producto === 'miniweb' && horarioVar !== 'clasica' && `horariovar=${horarioVar}`,
  esCarta && estilo === 'inmersiva' && subCarta === 'columna' && 'sub=columna',
  esCarta && 'derivar=1',
  esCarta && colorPrecio && `precio=${colorPrecio.slice(1)}`,
  esCarta && colorPrecioTexto && `ptxt=${colorPrecioTexto.slice(1)}`,
  esCarta && fondo2 && `f2=${fondo2.slice(1)}`,
  esCarta && textoSuave && `ts=${textoSuave.slice(1)}`,
  esCarta && Object.keys(coloresCarta).length > 0 && `colcarta=${Object.entries(coloresCarta).map(([clave, valor]) => `${clave}-${valor.slice(1)}`).join(',')}`,
  esCarta && tamanoPrecio !== 'md' && `tprecio=${tamanoPrecio}`,
  esCarta && `enlace=${enlaceNegocio}`,
  esCarta && estilo === 'inmersiva' && filtroCarta !== 100 && `filtro=${filtroCarta}`,
  esCarta && estilo === 'inmersiva' && colorFiltroCarta && `cfiltro=${colorFiltroCarta.slice(1)}`,
  esCarta && detallePrecio !== 'raya' && `dprecio=${detallePrecio}`,
  producto === 'miniweb' && filtroFoto !== 100 && `filtro=${filtroFoto}`,
  ...(producto === 'miniweb' ? lugares.map(([clave, valor]) => `${clave.toLowerCase()}=${valor}`) : []),
  producto === 'miniweb' && barra && `barra=${barra}`,
  conCabecera && cabecera && `cabecera=${cabecera.slice(1)}`,
  logoElegido && `logo=${encodeURIComponent(logoElegido)}`,
  (cambiosIA || Object.keys(cambiosExtra).length > 0 || Object.keys(textosPrevia).length > 0) && `ia=${versionIA}-${versionExtra}`,
]
  .filter(Boolean)
  .map(p => `&${p}`)
  .join('')
  )
}
