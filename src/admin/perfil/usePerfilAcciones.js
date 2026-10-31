import { llamar, nombreInterno } from '../comun'
import { catalogoCarta, validarDisenoCarta } from '../../asistente/carta'
import { catalogoMiniweb, validarDiseno } from '../../asistente/miniweb'
import { SIN_PORTADA_MINIWEB } from '../PanelesMiniweb'
import { PLANTILLAS } from '../../plantillas'
import { fusionar, menuDelPanel, crearCartaConDueno } from '../ia'
import { supabase } from '../../lib/supabase'
import { aplicar } from '../../lib/ediciones'
import siguienteEtiqueta from '../perfil/siguienteEtiqueta'

// usePerfilAcciones: sacado de NuevoPerfil.jsx. Las acciones del Editor (abrir una copia, guardar, crear, cambiar de producto...). Recibe en "datos" el estado de los hooks y lo que
// se deduce de él, y devuelve las funciones.
export default function usePerfilAcciones(datos) {
  const { abrir, armar, cambiosExtra, cambiosIA, captura, cartaBase, copiaCargada, creando, cuento, disenando, esCarta, etiqueta, filas, hero, instantanea, marcarBase, nombre, producto, recargar, redactar, referencia, setAcento, setAviso, setBarra, setCabecera, setCambiosExtra, setCambiosIA, setCartaMini, setColorFiltroCarta, setColorPrecio, setColorPrecioTexto, setColorTexto, setColoresCarta, setColoresMini, setComposicion, setCopiaCargada, setCorte, setCreando, setCuento, setDetallePrecio, setDisenando, setDisposicion, setDistribucion, setEnlaceNegocio, setError, setEstilo, setEstructura, setEtiqueta, setFiltroCarta, setFiltroFoto, setFondo, setFondo2, setFormato, setGenerado, setHero, setHorarioIA, setHorarioMini, setHorarioVar, setInfoImagen, setLema, setLetra, setLogo, setMontaje, setNombre, setPase, setPestana, setPreguntaSalir, setPrincipal, setProducto, setRedactando, setResumenDiseno, setSubCarta, setTamanoNombre, setTamanoPrecio, setTema, setTextoSuave, setTextosMini, setTipoCarta, setVersionBase, setVersionIA, sinGuardar, textosPrevia, tipoCarta } = datos

  // El botón del asistente, en dos tiempos: 1) elige el diseño (y el nombre, si falta) y lo pone en los selectores; 2) con esos
  // selectores ya puestos (efecto de más abajo), escribe los textos y busca las fotos. La vista previa lo enseña todo
  const montar = async () => {
    if (!(nombre.trim() || cuento.trim() || referencia || captura) || disenando) return
    setDisenando('Montando el diseño...')
    setError('')
    setResumenDiseno('')
    setCambiosIA(null)
    setCambiosExtra({})
    try {
      // Con Carta elegida, solo el diseño: tipo, estilo (y subdiseño), tipografía, colores y nombre. El contenido es de /mi-carta
      if (producto === 'carta') {
        const { resultado: res } = await llamar('asistente', { paso: 'diseno-carta', tipo: tipoCarta, peticion: cuento.trim() || 'Sin más indicaciones: decide tú el estilo.', nombre: nombre.trim(), catalogo: catalogoCarta(), ...(referencia ? { referencia: { imagen: referencia.imagen, tipo: referencia.tipo, colores: referencia.colores } } : {}), ...(captura ? { captura: { imagen: captura.imagen, tipo: captura.tipo } } : {}) })
        const c = validarDisenoCarta(res)
        if (c.estilo) setEstilo(c.estilo)
        setSubCarta(c.subdiseno ?? 'fila')
        if (c.tipografia) setLetra(c.tipografia)
        if (c.colores.principal) setPrincipal(c.colores.principal)
        if (c.colores.acento) setAcento(c.colores.acento)
        if (c.colores.texto) setColorTexto(c.colores.texto)
        if (c.colores.fondo) setFondo(c.colores.fondo)
        if (c.nombre && !nombre.trim()) setNombre(c.nombre)
        setFiltroCarta(c.filtro)
        setColorFiltroCarta(c.colorFiltro ?? '')
        setDetallePrecio(c.detallePrecio)
        setColorPrecio(c.colorDetallePrecio ?? '')
        setColorPrecioTexto(c.colorPrecio ?? '')
        setTamanoPrecio(c.tamanoPrecio)
        setGenerado(true)
        setResumenDiseno(c.resumen)
        setDisenando(null)
        return
      }
      const { resultado } = await llamar('asistente', { paso: 'diseno-miniweb', peticion: cuento.trim() || 'Sin más indicaciones: decide tú el estilo.', nombre: nombre.trim(), catalogo: catalogoMiniweb(), ...(referencia ? { referencia: { imagen: referencia.imagen, tipo: referencia.tipo, colores: referencia.colores } } : {}), ...(captura ? { captura: { imagen: captura.imagen, tipo: captura.tipo } } : {}) })
      const d = validarDiseno(resultado)
      if (producto !== 'miniweb') setCopiaCargada(null)
      setProducto('miniweb')
      if (d.tema) setTema(d.tema)
      if (d.portada) setHero(d.portada)
      if (d.subdiseno) ({ corte: setCorte, formato: setFormato, disposicion: setDisposicion, composicion: setComposicion, distribucion: setDistribucion, pase: setPase, montaje: setMontaje })[d.subdiseno.campo]?.(d.subdiseno.valor)
      setEstructura(d.estructura)
      if (d.estiloMenu !== null) setBarra(d.estiloMenu)
      if (d.textoExtra) setTextosMini(t => ({ ...t, info: d.textoExtra }))
      if (d.tamanoNombre) setTamanoNombre(d.tamanoNombre)
      if (d.tipografia) setLetra(d.tipografia)
      if (d.colores.principal) setPrincipal(d.colores.principal)
      if (d.colores.acento) setAcento(d.colores.acento)
      if (d.colores.texto) setColorTexto(d.colores.texto)
      if (d.colores.fondo) setFondo(d.colores.fondo)
      setColoresMini(d.roles)
      if (d.nombre && !nombre.trim()) setNombre(d.nombre)
      setCartaMini(d.carta ?? '')
      if (d.horario !== null) {
        setHorarioMini(d.horario)
        setHorarioVar(d.horarioVariante)
      }
      setHorarioIA(d.horarioLineas)
      setInfoImagen(d.infoImagen)
      setGenerado(true)
      setResumenDiseno(d.resumen)
      setRedactando(true)
    } catch (e) {
      setError(e.message)
      setDisenando(null)
    }
  }

  const cambiarProducto = clave => {
    if (clave === producto) return
    if (copiaCargada && sinGuardar) {
      setPreguntaSalir({
        titulo: '¿Cambiar de producto?',
        texto: 'Tienes cambios sin guardar en esta copia. Si cambias de producto, dejas de editarla y no se guardan en ella.',
        boton: 'Cambiar',
        peligro: true,
        accion: () => pasarAProducto(clave),
      })
      return
    }
    pasarAProducto(clave)
  }

  const pasarAProducto = clave => {
    if (copiaCargada) setCopiaCargada(null)
    setProducto(clave)
    // Banner y Ficha no valen de portada de una miniweb: si estaba uno elegido, pasa a Editorial
    if (clave === 'miniweb' && SIN_PORTADA_MINIWEB.includes(hero)) setHero('editorial')
    // Cambiar de producto no es un cambio sin guardar: lo de partida pasa a ser el del producto nuevo (si no, salía el aviso al elegir una copia sin haber tocado nada)
    empezarDeNuevo()
  }

  const empezarDeNuevo = () => {
    marcarBase.current = true
    setVersionBase(v => v + 1)
  }

  // Carga una copia en Nuevo perfil a partir de su instantánea. Las copias antiguas (de antes de Nuevo perfil) no la tienen y no se pueden abrir aquí
  const cargarCopia = fila => {
    const i = fila?.cambios?._nuevoPerfil
    if (!i) {
      setError('Esta copia es antigua (se creó antes del editor) y no se puede abrir aquí.')
      return
    }
    setError('')
    setAviso('')
    setPestana('personalizar')
    setProducto(i.producto ?? 'miniweb')
    setTema(i.tema ?? PLANTILLAS[0].clave)
    // Las copias de antes de este selector: la carta de la temática que tenían decide el tipo (Laca, promociones; el resto, carta)
    setSubCarta(i.subCarta ?? 'fila')
    setColorPrecio(i.colorPrecio ?? '')
    setColorPrecioTexto(i.colorPrecioTexto ?? '')
    setFondo2(i.fondo2 ?? '')
    setTextoSuave(i.textoSuave ?? '')
    setColoresCarta(i.coloresCarta ?? {})
    setTamanoPrecio(i.tamanoPrecio ?? 'md')
    setEnlaceNegocio(i.enlaceNegocio ?? 'ninguno')
    setFiltroCarta(i.filtroCarta ?? 100)
    setColorFiltroCarta(i.colorFiltroCarta ?? '')
    setDetallePrecio(i.detallePrecio ?? 'raya')
    setTipoCarta(i.tipoCarta ?? (PLANTILLAS.find(p => p.clave === i.tema)?.carta === 'laca' ? 'promociones' : 'carta'))
    setHero(i.hero ?? 'polaroid')
    setBarra(i.barra ?? '')
    setEstilo(i.estilo ?? 'revista')
    setNombre(i.nombre ?? '')
    setEtiqueta(i.etiqueta ?? '')
    setLema(i.lema ?? null)
    setLogo(i.logo ?? '')
    setPrincipal(i.principal ?? '')
    setAcento(i.acento ?? '')
    setColorTexto(i.colorTexto ?? '')
    setFondo(i.fondo ?? '')
    setLetra(i.letra ?? '')
    setCabecera(i.cabecera ?? '')
    setColoresMini(i.coloresMini ?? {})
    setTextosMini(i.textosMini ?? {})
    setEstructura(i.estructura ?? {})
    setCorte(i.corte ?? 'diagonal')
    setFormato(i.formato ?? 'clasica')
    setDisposicion(i.disposicion ?? 'clasica')
    setComposicion(i.composicion ?? 'clasica')
    setDistribucion(i.distribucion ?? 'clasica')
    setPase(i.pase ?? 'clasica')
    setMontaje(i.montaje ?? 'clasica')
    setTamanoNombre(i.tamanoNombre ?? 'md')
    setCartaMini(i.cartaMini ?? '')
    setHorarioMini(i.horarioMini ?? '')
    setHorarioVar(i.horarioVar ?? 'clasica')
    setFiltroFoto(i.filtroFoto ?? 100)
    setCuento(i.cuento ?? '')
    setCambiosExtra(i.cambiosExtra ?? {})
    setCambiosIA(i.cambiosIA ?? null)
    setResumenDiseno(i.resumenDiseno ?? '')
    setGenerado(true)
    setVersionIA(v => v + 1)
    try {
      localStorage.setItem('mostraq-vista-ia', JSON.stringify({ ...(i.cambiosIA?.cambios ?? {}), ...(i.cambiosExtra ?? {}) }))
    } catch {
      // Sin almacenamiento, la vista previa no enseña lo del asistente, pero al guardar sí se conserva
    }
    setCopiaCargada({ tipo: fila.tipo, slug: fila.slug })
    empezarDeNuevo()
  }

  // Guardar cambios: actualiza la copia cargada (misma dirección) con lo que hay ahora
  const guardarCopia = async () => {
    if (!copiaCargada || creando) return
    setAviso('')
    setError('')
    setCreando('Guardando...')
    let guardado = false
    try {
      const nombreGuardar = nombre.trim() || 'Prueba'
      const { base, cambios: cambiosBase } = armar(nombreGuardar)
      let cambios = cambiosBase
      let historial = []
      if (cambiosIA) {
        cambios = fusionar(cambios, cambiosIA.cambios)
        historial = cambiosIA.historial
      }
      // Los textos escritos de la portada mandan sobre los del asistente (como en la vista previa), y lo cambiado a mano en los datos en bruto va el último
      if (Object.keys(textosPrevia).length) cambios = fusionar(cambios, textosPrevia)
      if (Object.keys(cambiosExtra).length) cambios = fusionar(cambios, cambiosExtra)
      cambios = { ...cambios, _nuevoPerfil: instantanea() }
      // La marca de cliente (Exportar para cliente) se conserva
      const previa = (filas ?? []).find(f => f.tipo === copiaCargada.tipo && f.slug === copiaCargada.slug)?.cambios
      if (previa?._cliente) cambios._cliente = true
      // Y su grupo
      if (previa?._grupo) cambios._grupo = previa._grupo
      // El menú del día de una carta vive en su panel (tabla cartas) y manda sobre el de la copia: se cambia también allí, para que lo que se
      // guarda sea lo que se ve en su dirección (y en su QR)
      if (copiaCargada.tipo === 'carta') {
        const { error: errorMenu } = await supabase.from('cartas').update({ menu_dia: menuDelPanel(aplicar(cartaBase, cambios).menuDia) }).eq('slug', copiaCargada.slug)
        if (errorMenu) throw new Error('No se ha podido cambiar el menú del día de la carta.')
      }
      const { error } = await supabase
        .from('ediciones')
        .update({ base, cambios, ...(historial.length ? { historial } : {}) })
        .eq('tipo', copiaCargada.tipo)
        .eq('slug', copiaCargada.slug)
      if (error) throw new Error('No se han podido guardar los cambios.')
      await recargar()
      empezarDeNuevo()
      setAviso(`Cambios guardados en «${nombreGuardar}».`)
      guardado = true
    } catch (e) {
      setError(e.message)
    }
    setCreando(null)
    return guardado
  }

  // muestra (true): exporta el diseño a las muestras, en la lista de Miniwebs (con el nombre escrito o, sin él, «Muestra») en lugar de crear un perfil
  const crear = async muestra => {
    const esMuestra = muestra === true
    const nombreCrear = nombre.trim() || (esMuestra ? 'Muestra' : '')
    if (!nombreCrear || creando) return
    setAviso('')
    setCreando('Creando...')
    setError('')
    try {
      const { tipoFila, slug, base, cambios: cambiosBase } = armar(nombreCrear)
      let cambios = cambiosBase

      // Una muestra va marcada: /miniweb la enseña junto a las demás miniwebs de ejemplo
      if (esMuestra) cambios = { ...cambios, muestra: true }

      // Si el asistente ya ha montado la miniweb (botón Montar), sus textos y fotos ya están hechos y se guardan tal cual. Si no, con
      // lo que se le ha contado del negocio se inventa el copy y busca las fotos sobre el diseño ya montado (colores, solo si se piden)
      // Lo cambiado a mano en los datos en bruto va el último, para que mande sobre lo del asistente
      let historial = []
      if (cambiosIA) {
        cambios = fusionar(cambios, cambiosIA.cambios)
        historial = cambiosIA.historial
      } else if (cuento.trim()) {
        const hecho = await redactar(base, cambios, nombreCrear, setCreando)
        cambios = fusionar(cambios, hecho.deIA)
        historial = hecho.historial
        setCreando('Creando...')
      }

      // Los textos escritos de la portada mandan sobre los del asistente (como en la vista previa), y lo cambiado a mano en los datos en bruto va el último
      if (Object.keys(textosPrevia).length) cambios = fusionar(cambios, textosPrevia)
      if (Object.keys(cambiosExtra).length) cambios = fusionar(cambios, cambiosExtra)
      // La instantánea de Nuevo perfil, para poder reabrir la copia y retocarla. Si se parte de una copia abierta y se deja su nombre interno,
      // la nueva toma el siguiente número ("Claudia 1" pasa a "Claudia 2")
      const etiquetaAbierta = copiaCargada ? (filas ?? []).find(x => x.tipo === copiaCargada.tipo && x.slug === copiaCargada.slug)?.cambios?._nuevoPerfil?.etiqueta?.trim() : null
      const etiquetaNueva = etiquetaAbierta && etiquetaAbierta === etiqueta.trim() ? siguienteEtiqueta(etiquetaAbierta, (filas ?? []).map(nombreInterno).filter(Boolean)) : etiqueta.trim()
      cambios = { ...cambios, _nuevoPerfil: { ...instantanea(), etiqueta: etiquetaNueva } }
      const { error } = await supabase.from('ediciones').insert({ tipo: tipoFila, slug, base, cambios, ...(historial.length ? { historial } : {}) })
      if (error) throw new Error('No se ha podido crear.')
      if (esCarta) await crearCartaConDueno(slug, aplicar(cartaBase, cambios).menuDia)
      await recargar()
      if (esMuestra) {
        setCreando(null)
        setAviso(`Exportada a las muestras como «${nombreCrear}»: ya sale en Miniwebs`)
      } else abrir(`${tipoFila}:${slug}`)
    } catch (e) {
      setError(e.message)
      setCreando(null)
    }
  }

  // Elegir una copia para cargarla aquí (valor "tipo:slug"; vacío, una nueva)
  const elegirCopia = valor => {
    if (!valor) return setCopiaCargada(null)
    const [t, sl] = valor.split(':')
    const abrirCopia = () => cargarCopia((filas ?? []).find(f => f.tipo === t && f.slug === sl))
    // Con cambios sin guardar, cargar otra copia los perdería: se pregunta antes (si se cancela, se queda como estaba)
    if (sinGuardar) {
      setPreguntaSalir({ titulo: '¿Cambiar de copia?', texto: 'Tienes cambios sin guardar. Si cambias de copia, se pierden.', boton: 'Cambiar', peligro: true, accion: abrirCopia })
      return
    }
    abrirCopia()
  }

  return { montar, cambiarProducto, pasarAProducto, empezarDeNuevo, cargarCopia, guardarCopia, crear, elegirCopia }
}
