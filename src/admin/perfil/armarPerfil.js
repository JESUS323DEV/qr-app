import { FOTOS_PORTADA, conFotosDePortada } from '../TextosEditor'
import { LIMPIAR_FICHA } from '../datos'
import { RESERVADAS, aSlug } from '../comun'
import { TODAS_LAS_TIPOGRAFIAS } from '../../asistente/tipografias'
import { cartas } from '../../cartas'
import { derivadosDeFondoYTexto } from '../../lib/mezclarColores'
import { fusionar, inicioCopiaCarta } from '../ia'
import { getNegocio, negocios } from '../../negocios'
import { pestanasDeMiniweb } from '../../lib/miniweb'

/* Arma lo que se guarda al crear (el perfil de partida, su dirección y los cambios del diseño elegido), sin tocar Supabase. Es una función pura: solo lee los datos que
   se le pasan (todo el estado de NuevoPerfil, que sale de sus hooks, y lo que se deduce de él) y devuelve { tipoFila, slug, base, cambios }. */
export default function armarPerfil(datos, nombreCrear) {
  const { acento, barra, cartaBase, cartaMini, cartaSlug, colorCabecera, colorDelTexto, colorFiltroCarta, colorFondo, colorPrecio, colorPrecioTexto, colorTexto, coloresCarta, coloresMini, composicion, conCabecera, conTextoExtra, corte, detallePrecio, disposicion, distribucion, enlaceNegocio, esCarta, estilo, filas, filtroCarta, filtroFoto, fondo, fondo2, formato, hero, horarioMini, horarioVar, lema, letra, logoElegido, lugares, montaje, negocioBase, pase, plantilla, principal, producto, subCarta, tamanoNombre, tamanoPrecio, textoBoton, textoExtra, textoGrande, textoPequeno, textoSuave, textosMini } = datos
  const tipoFila = esCarta ? 'carta' : 'negocio'
  const ocupadas = new Set([
    ...(filas ?? []).filter(f => f.tipo === tipoFila).map(f => f.slug),
    ...(esCarta ? cartas : negocios).map(n => n.slug),
    ...RESERVADAS,
  ])
  const raiz = aSlug(nombreCrear) || 'nuevo'
  let slug = raiz
  for (let n = 2; ocupadas.has(slug); n++) slug = `${raiz}-${n}`

  const tipografia = TODAS_LAS_TIPOGRAFIAS.find(t => t.id === letra)
  // Los textos de la portada que se han escrito: en la copia de Chalaquita, sobre su primera pestaña; en las demás, sobre la
  // primera pestaña de su miniweb (más abajo)
  const textosEscritos = {
    ...(textosMini.titular !== undefined ? { titular: [textoGrande.trim()].filter(Boolean) } : {}),
    ...(textosMini.descripcion !== undefined ? { descripcion: textoPequeno.trim() } : {}),
    ...(conTextoExtra ? { info: textoExtra.trim() } : {}),
    ...(textosMini.boton !== undefined ? { boton: textoBoton.trim() } : {}),
  }
  const inicioCambio = {
    ...(producto === 'miniweb' && barra ? { 'hero.barra': barra } : {}),
    ...(!esCarta && tamanoNombre !== 'md' ? { 'hero.tamanoNombre': tamanoNombre } : {}),
    ...(!esCarta && hero === 'diagonal' && corte !== 'diagonal' ? { 'hero.corte': corte } : {}),
    ...(!esCarta && hero === 'editorial' && formato !== 'clasica' ? { 'hero.formato': formato } : {}),
    ...(!esCarta && hero === 'fullbleed' && disposicion !== 'clasica' ? { 'hero.disposicion': disposicion } : {}),
    ...(!esCarta && hero === 'mosaico' && composicion !== 'clasica' ? { 'hero.composicion': composicion } : {}),
    ...(!esCarta && hero === 'retrato' && distribucion !== 'clasica' ? { 'hero.distribucion': distribucion } : {}),
    ...(!esCarta && hero === 'galeria' && pase !== 'clasica' ? { 'hero.pase': pase } : {}),
    ...(!esCarta && hero === 'polaroid' && montaje !== 'clasica' ? { 'hero.montaje': montaje } : {}),
    ...(producto === 'miniweb' && cartaMini ? { 'hero.carta': cartaMini } : {}),
    ...(producto === 'miniweb' && horarioMini ? { 'hero.horario': horarioMini } : {}),
    ...(producto === 'miniweb' && horarioVar !== 'clasica' ? { 'hero.horarioVariante': horarioVar } : {}),
    ...(producto === 'miniweb' && filtroFoto !== 100 ? { 'hero.filtro': filtroFoto } : {}),
    // Los colores uno por uno que se han elegido (los demás, en automático)
    ...(producto === 'miniweb' && Object.keys(coloresMini).length ? { 'hero.colores': coloresMini } : {}),
    ...(producto === 'miniweb' ? Object.fromEntries(lugares.map(([clave, valor]) => [`hero.${clave}`, valor])) : {}),
  }
  let cambios
  let base
  if (esCarta) {
    base = cartaSlug
    const inicio = inicioCopiaCarta(cartaBase)
    cambios = fusionar(inicio, {
      'marca.nombre': nombreCrear,
      ...(lema !== null ? { 'marca.lema': lema.trim() } : {}),
      diseno: estilo,
      ...(estilo === 'inmersiva' && subCarta === 'columna' ? { subdiseno: 'columna' } : {}),
      ...(principal ? { 'marca.theme.colors.primary': principal } : {}),
      ...(acento ? { 'marca.theme.colors.accent': acento } : {}),
      ...(colorTexto ? { 'marca.theme.colors.text': colorTexto } : {}),
      ...(fondo ? { 'marca.theme.colors.bg': fondo } : {}),
      ...(colorPrecio ? { 'marca.theme.colors.precio': colorPrecio } : {}),
      ...(colorPrecioTexto ? { 'marca.theme.colors.precioTexto': colorPrecioTexto } : {}),
      ...(tamanoPrecio !== 'md' ? { tamanoPrecio } : {}),
      ...(tamanoNombre !== 'md' ? { tamanoNombre } : {}),
      // Una copia no enlaza a la miniweb de la demo de la que sale: sin enlace salvo que se elija
      enlaceNegocio,
      ...(estilo === 'inmersiva' && filtroCarta !== 100 ? { filtroFoto: filtroCarta } : {}),
      ...(estilo === 'inmersiva' && colorFiltroCarta ? { colorFiltro: colorFiltroCarta } : {}),
      ...(detallePrecio !== 'raya' ? { detallePrecio } : {}),
      // La superficie de las tarjetas y el texto suave salen del fondo y del texto elegidos (no se quedan con los de la plantilla)
      ...(fondo || colorTexto ? { 'marca.theme.colors.surface': derivadosDeFondoYTexto(colorFondo, colorDelTexto).surface, 'marca.theme.colors.muted': derivadosDeFondoYTexto(colorFondo, colorDelTexto).muted } : {}),
      // Fondo secundario y texto suave elegidos (mandan sobre los que salen del fondo y del texto) y los colores propios de la carta
      ...(fondo2 ? { 'marca.theme.colors.surface': fondo2 } : {}),
      ...(textoSuave ? { 'marca.theme.colors.muted': textoSuave } : {}),
      ...Object.fromEntries(Object.entries(coloresCarta).map(([clave, valor]) => [`marca.theme.colors.${clave}`, valor])),
      ...(tipografia ? { 'marca.theme.fonts': tipografia.fonts } : {}),
    })
  } else {
    // Miniweb de comida: copia de Chalaquita con la portada elegida. El resto: su ficha como miniweb
    const deChalaquita = producto === 'miniweb' && plantilla.miniweb
    base = deChalaquita ? plantilla.miniweb : plantilla.ficha
    cambios = {
      nombre: nombreCrear,
      ...(logoElegido ? { logo: logoElegido } : {}),
      // El enlace de "escribir reseña" del Google del negocio: vacío al principio, para que salga el campo en Reseña de Google y se pueda pegar
      ...(getNegocio(base)?.resena?.url ? {} : { 'resena.url': '' }),
      ...(principal ? { 'theme.colors.primary': principal } : {}),
      ...(acento ? { 'theme.colors.accent': acento } : {}),
      ...(colorTexto ? { 'theme.colors.text': colorTexto } : {}),
      ...(fondo ? { 'theme.colors.bg': fondo } : {}),
      // Con cabecera, se guarda siempre (aunque sea el principal), para que salga en el editor y se pueda cambiar
      ...(conCabecera ? { 'theme.colors.header': colorCabecera } : {}),
      ...(tipografia ? { 'theme.fonts': tipografia.fonts } : {}),
      ...(producto === 'ficha'
        ? { 'hero.diseno': hero, ...(barra ? { 'hero.barra': barra } : {}), ...(hero === 'diagonal' && corte !== 'diagonal' ? { 'hero.corte': corte } : {}), ...(hero === 'editorial' && formato !== 'clasica' ? { 'hero.formato': formato } : {}), ...(hero === 'fullbleed' && disposicion !== 'clasica' ? { 'hero.disposicion': disposicion } : {}), ...(hero === 'mosaico' && composicion !== 'clasica' ? { 'hero.composicion': composicion } : {}), ...(hero === 'retrato' && distribucion !== 'clasica' ? { 'hero.distribucion': distribucion } : {}), ...(hero === 'galeria' && pase !== 'clasica' ? { 'hero.pase': pase } : {}), ...(hero === 'polaroid' && montaje !== 'clasica' ? { 'hero.montaje': montaje } : {}) }
        : deChalaquita
          ? { 'hero.portada': hero, ...inicioCambio, ...Object.fromEntries(Object.entries(textosEscritos).map(([clave, valor]) => [`hero.pestanas.0.${clave}`, valor])), ...(conFotosDePortada(getNegocio(plantilla.miniweb)?.hero?.pestanas?.[0], FOTOS_PORTADA[hero])?.fotos ? { 'hero.pestanas.0.fotos': conFotosDePortada(getNegocio(plantilla.miniweb).hero.pestanas[0], FOTOS_PORTADA[hero]).fotos } : {}) }
          : {
              'hero.diseno': 'web',
              'hero.portada': hero,
              'hero.redesArriba': true,
              // El titular propio de la ficha (el que iba sobre la foto) sobra en una miniweb: ya está el Texto inicio
              ...LIMPIAR_FICHA,
              ...inicioCambio,
              'hero.pestanas': pestanasDeMiniweb(negocioBase).map((p, i) => (i === 0 ? conFotosDePortada({ ...p, ...textosEscritos }, FOTOS_PORTADA[hero]) : p)),
              tipo: 'miniweb',
            }),
    }
  }

  return { tipoFila, slug, base, cambios }
}
