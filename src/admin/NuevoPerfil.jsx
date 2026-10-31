import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilaIconos, HojaCtx } from './FilaIconos'
import usePantallaMovil from './usePantallaMovil'
import BloqueTextoInicio from './perfil/BloqueTextoInicio'
import BloqueTematica from './perfil/BloqueTematica'
import PaletaMarca from './perfil/PaletaMarca'
import BloqueNombre from './perfil/BloqueNombre'
import CampoTipografia from './perfil/CampoTipografia'
import BloquePortada from './perfil/BloquePortada'
import armarPerfil from './perfil/armarPerfil'
import redactarPerfil from './perfil/redactarPerfil'
import usePerfilDiseno from './perfil/usePerfilDiseno'
import usePerfilCarta from './perfil/usePerfilCarta'
import usePerfilNegocio from './perfil/usePerfilNegocio'
import usePerfilAsistente from './perfil/usePerfilAsistente'
import usePerfilCopias from './perfil/usePerfilCopias'
import { BarraAsistenteMovil, BarraIconosMovil, FlechaVolver, InicioMovil } from './EditorMovil'
import { ChevronDown, ChevronsDownUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { aplicar, conEdicion } from '../lib/ediciones'
import { getNegocio } from '../negocios'
import { getCarta, marcaDe } from '../cartas'
import { BOTON, CAMPO, Confirmar, Etiqueta, claseIcono, opcion } from '../components/panel'
import { GRUPOS_PLANTILLAS, PLANTILLAS } from '../plantillas'
import { catalogoMiniweb, validarDiseno } from '../asistente/miniweb'
import { TIPOS_CARTA, catalogoCarta, validarDisenoCarta } from '../asistente/carta'
import { derivadosDeFondoYTexto } from '../lib/mezclarColores'
import { COLORES_CARTA } from '../lib/coloresCarta'
import Movil from '../components/Movil'
import { coloresAutomaticos } from '../lib/coloresMiniweb'
import { pestanasDeMiniweb } from '../lib/miniweb'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { FAMILIAS } from '../familias'
import { llamar, nombreInterno } from './comun'
import { bloquesDePestana, leerRuta, maxDe } from './datos'
import { crearCartaConDueno, fusionar, menuDelPanel } from './ia'
import { ESTRUCTURA_DEFECTO, EstructuraMiniweb, FilaEstiloMenu, FilaHorario, PanelColoresMiniweb, Plegable, SIN_PORTADA_MINIWEB, SelectorCartaMiniweb } from './PanelesMiniweb'
import { CampoImagenAsistente, EditorEnBruto, ImagenesPorPestana, TEXTO_EXTRA_EJEMPLO, TextosHorario, TextosPestanas } from './TextosEditor'

/* Nuevo perfil: crear una miniweb o una carta desde cero, con el asistente, la vista previa en vivo y todos los ajustes. */

// Las cartas de ejemplo de cada tipo de carta (el diseño ya no depende de la temática): Carta, la de un restaurante con menú del día;
// Promociones, la de Laca, con ofertas (con su precio anterior tachado) y servicios por secciones
const CARTA_DE_TIPO = { carta: 'almendra', promociones: 'laca' }


export function NuevoPerfil({ filas, recargar, abrir, cargar }) {
  // La pestaña abierta: el asistente o el diseño (la vista previa se ve siempre)
  const [pestana, setPestana] = useState('personalizar')
  // El resto del estado, agrupado por temas (src/admin/perfil/)
  const diseno = usePerfilDiseno()
  const { tema, setTema, producto, setProducto, hero, setHero, barra, setBarra, corte, setCorte, formato, setFormato, disposicion, setDisposicion, composicion, setComposicion, distribucion, setDistribucion, pase, setPase, montaje, setMontaje, horarioMini, setHorarioMini, horarioVar, setHorarioVar, filtroFoto, setFiltroFoto, tamanoNombre, setTamanoNombre, cabecera, setCabecera, estructura, setEstructura, cartaMini, setCartaMini, coloresMini, setColoresMini } = diseno
  const carta = usePerfilCarta()
  const { tipoCarta, setTipoCarta, subCarta, setSubCarta, estilo, setEstilo, colorPrecio, setColorPrecio, colorPrecioTexto, setColorPrecioTexto, fondo2, setFondo2, textoSuave, setTextoSuave, coloresCarta, setColoresCarta, tamanoPrecio, setTamanoPrecio, enlaceNegocio, setEnlaceNegocio, filtroCarta, setFiltroCarta, colorFiltroCarta, setColorFiltroCarta, detallePrecio, setDetallePrecio } = carta
  const negocio = usePerfilNegocio()
  const { nombre, setNombre, etiqueta, setEtiqueta, lema, setLema, logo, setLogo, principal, setPrincipal, acento, setAcento, colorTexto, setColorTexto, fondo, setFondo, letra, setLetra, textosMini, setTextosMini, nombreVista, setNombreVista } = negocio
  const { cuento, setCuento, disenando, setDisenando, resumenDiseno, setResumenDiseno, cambiosIA, setCambiosIA, versionIA, setVersionIA, redactando, setRedactando, referencia, setReferencia, captura, setCaptura, infoImagen, setInfoImagen, horarioIA, setHorarioIA, generado, setGenerado } = usePerfilAsistente()
  const { creando, setCreando, aviso, setAviso, error, setError, copiaCargada, setCopiaCargada, huellaBase, setHuellaBase, versionBase, setVersionBase, preguntaSalir, setPreguntaSalir, cambiosExtra, setCambiosExtra, versionExtra, setVersionExtra } = usePerfilCopias()
  // En tablet vertical (768 a 1023 px) Ficha queda bloqueada en el selector de Producto
  const [tabletVertical, setTabletVertical] = useState(() => window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches)
  useEffect(() => {
    const medida = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const alCambiar = () => setTabletVertical(medida.matches)
    medida.addEventListener('change', alCambiar)
    return () => medida.removeEventListener('change', alCambiar)
  }, [])
  // El tamaño del móvil de la vista previa (lo visible dentro del navegador de un móvil, aproximado); se recuerda en este navegador
  const [tamanoMovil, setTamanoMovil] = useState(() => {
    try {
      const guardado = localStorage.getItem('mostraq-tamano-movil')
      return TAMANOS_MOVIL.some(t => t.clave === guardado) ? guardado : 'normal'
    } catch {
      return 'normal'
    }
  })
  // Pestañas de ajustes por grupo (en prueba, encima de los desplegables de siempre): cada una junta todo lo de un grupo
  const [pestanaAjustes, setPestanaAjustes] = useState(null)
  const medidaMovil = TAMANOS_MOVIL.find(t => t.clave === tamanoMovil) ?? TAMANOS_MOVIL[1]
  const elegirTamanoMovil = clave => {
    setTamanoMovil(clave)
    try {
      localStorage.setItem('mostraq-tamano-movil', clave)
    } catch {
      // Sin almacenamiento, vale solo hasta recargar
    }
  }
  const cambiarColorMini = (clave, valor) =>
    setColoresMini(actual => {
      const nuevo = { ...actual, [clave]: valor }
      if (valor === undefined) delete nuevo[clave]
      return nuevo
    })
  const lugares = Object.entries(estructura).filter(([clave, valor]) => valor !== ESTRUCTURA_DEFECTO[clave])
  const [abierto, setAbierto] = useState(false)
  // Abierto, el Editor ocupa toda la pantalla desde arriba, en cualquier dispositivo (tapa el título del panel y el menú); la página de debajo no se mueve
  useEffect(() => {
    if (!abierto) return
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = antes
    }
  }, [abierto])
  // Las pantallas del Editor en móvil (inicio, Asistente, editor, hoja de ajustes) y su temporizador
  const { vistaMovil, setVistaMovil, pasoMovil, setPasoMovil, popover, setPopover, hojaAbierta, setHojaAbierta, esMovil, flechasVisibles, hoja, enInicio, enAsistenteMovil } = usePantallaMovil({ abierto, pestanaAjustes })

  const plantilla = PLANTILLAS.find(p => p.clave === tema)
  // El grupo de la temática elegida
  const grupoTema = GRUPOS_PLANTILLAS.find(g => g.claves.includes(tema)) ?? GRUPOS_PLANTILLAS[0]
  const negocioBase = getNegocio(plantilla.ficha)
  const cartaSlug = CARTA_DE_TIPO[tipoCarta]
  const cartaBase = getCarta(cartaSlug)
  const esCarta = producto === 'carta'
  // Colores de partida: los de la demo de la temática
  // En miniweb, los colores de partida son los de la misma base que la vista previa (la miniweb de la temática, si la tiene; si no, su ficha)
  const marcaBase = esCarta ? marcaDe(cartaBase ?? {}) : producto === 'miniweb' && plantilla.miniweb ? getNegocio(plantilla.miniweb) : negocioBase
  const colorPrincipal = principal || marcaBase?.theme?.colors?.primary || '#000000'
  const colorAcento = acento || marcaBase?.theme?.colors?.accent || '#000000'
  // La portada de Inicio de la miniweb de partida (la de Chalaquita en comida; si no, la primera pestaña de la ficha) y sus
  // textos: el titular en dos líneas y la descripción. Los máximos de caracteres, los de ahora con un margen
  const inicioBase = producto === 'miniweb' ? (plantilla.miniweb ? getNegocio(plantilla.miniweb)?.hero?.pestanas?.[0] : pestanasDeMiniweb(negocioBase)?.[0]) : null
  const titularBase = inicioBase?.titular ?? []
  const textoGrande = textosMini.titular ?? titularBase.join(' ')
  const maxGrande = maxDe(titularBase.join(' ') || 'Texto grande de la portada')
  const textoPequeno = textosMini.descripcion ?? inicioBase?.descripcion ?? ''
  // El texto extra (un horario o lo que se quiera): solo lo pintan Editorial, Cortes (Diagonal) y Fullbleed
  // Con esas tres portadas, el texto extra empieza con uno de ejemplo (se ve y se guarda aunque no lo toques)
  const textoExtra = textosMini.info ?? inicioBase?.info ?? TEXTO_EXTRA_EJEMPLO
  // El texto del botón de la portada ("Ver menú", "Ver servicios"...): solo si la portada de partida lleva botón
  const hayBotonPortada = Boolean(inicioBase?.boton && inicioBase?.botonA)
  const textoBoton = textosMini.boton ?? inicioBase?.boton ?? ''
  const conTextoExtra = ['editorial', 'diagonal', 'fullbleed'].includes(hero)
  const MAX_TEXTO_EXTRA = 60
  const textosEditados = Object.keys(textosMini).length > 0
  // Los textos escritos de la portada, tal como pasan a la vista previa (la primera pestaña, Inicio): igual que al crear, pero al momento
  const textosPrevia = producto === 'miniweb'
    ? {
        ...(textosMini.titular !== undefined ? { 'hero.pestanas.0.titular': [textoGrande.trim()].filter(Boolean) } : {}),
        ...(textosMini.descripcion !== undefined ? { 'hero.pestanas.0.descripcion': textoPequeno.trim() } : {}),
        ...(textosMini.info !== undefined ? { 'hero.pestanas.0.info': textoExtra.trim() } : {}),
        ...(textosMini.boton !== undefined ? { 'hero.pestanas.0.boton': textoBoton.trim() } : {}),
      }
    : {}
  const colorDelTexto = colorTexto || marcaBase?.theme?.colors?.text || '#000000'
  const colorFondo = fondo || marcaBase?.theme?.colors?.bg || '#FFFFFF'
  const colorCabecera = cabecera || marcaBase?.theme?.colors?.header || colorPrincipal
  // Diseños con cabecera de color: Polaroid y Banner de una ficha (en una miniweb, el menú tiene su propio color)
  const conCabecera = producto === 'ficha' && ['polaroid', 'banner'].includes(hero)

  // El logo solo cuenta con "Logo" elegido, uno subido y en una ficha o una miniweb (las cartas llevan el nombre)
  const logoElegido = !esCarta && logo ? logo : ''

  const heros = Object.entries(HEROS).filter(([, h]) => h.piezas && !h.paginaCompleta)
  // Los 5 primeros de la fila de iconos (el resto, detrás del +), en este orden y después los demás
  const primerosDisenos = ['editorial', 'banner', 'diagonal', 'fullbleed', 'portada']
  const herosEnOrden = [...primerosDisenos.map(c => heros.find(([k]) => k === c)).filter(Boolean), ...heros.filter(([k]) => !primerosDisenos.includes(k))].filter(([k]) => producto !== 'miniweb' || !SIN_PORTADA_MINIWEB.includes(k))
  const estilos = Object.values(FAMILIAS).filter(f => f.carta)

  useEffect(() => {
    const t = setTimeout(() => setNombreVista(nombre.trim()), 500)
    return () => clearTimeout(t)
  }, [nombre])
  // Marca de prueba en la dirección: la vista previa enseña el nombre, los colores y la tipografía al momento
  const marca = [
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

  const vista =
    producto === 'ficha'
      ? `/demo/${plantilla.ficha}?diseno=${hero}${barra ? `&barra=${barra}` : ''}${marca}`
      : producto === 'miniweb'
        ? // Comida: la miniweb de Chalaquita con la portada elegida; el resto, su ficha como miniweb
          plantilla.miniweb
          ? `/demo/${plantilla.miniweb}?diseno=${hero}${marca}`
          : `/demo/${plantilla.ficha}?diseno=${hero}&miniweb=1${marca}`
        : cartaBase
          ? `/demo/${cartaSlug}/carta?diseno=${estilo}${marca}`
          : null

  // Arma lo que se guarda al crear (el perfil de partida, su dirección y los cambios del diseño elegido), sin tocar Supabase
  const armar = nombreCrear => armarPerfil({ ...diseno, ...carta, ...negocio, cartaBase, cartaSlug, colorCabecera, colorDelTexto, colorFondo, conCabecera, conTextoExtra, esCarta, filas, logoElegido, lugares, negocioBase, plantilla, textoBoton, textoExtra, textoGrande, textoPequeno }, nombreCrear)

  // El asistente escribe los textos y busca las fotos sobre el diseño armado: devuelve los cambios (sin tocar nombre, diseño ni portada)
  const redactar = (base, cambios, nombreCrear, avisar) => redactarPerfil({ cartaBase, cuento, esCarta, infoImagen, producto }, base, cambios, nombreCrear, avisar)

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
  useEffect(() => {
    if (!redactando) return
    setRedactando(false)
    ;(async () => {
      try {
        const nombreHecho = nombre.trim() || 'Prueba'
        const { base, cambios } = armar(nombreHecho)
        const hecho = await redactar(base, cambios, nombreHecho, setDisenando)
        // La vista previa los lee de aquí (la misma pestaña del navegador, el mismo origen)
        try {
          localStorage.setItem('mostraq-vista-ia', JSON.stringify(hecho.deIA))
        } catch {
          // Sin almacenamiento: la vista previa se queda sin textos ni fotos nuevos, pero al crear sí se guardan
        }
        setCambiosIA({ cambios: hecho.deIA, historial: hecho.historial })
        // Las líneas del horario, sobre la pestaña del horario de la miniweb (como un cambio a mano, para poder retocarlas)
        if (horarioIA.length) {
          const idx = (aplicar(getNegocio(base), cambios).hero?.pestanas ?? []).findIndex(p => p.tipo === 'horario')
          if (idx >= 0) setCambiosExtra(c => ({ ...c, [`hero.pestanas.${idx}.lineas`]: horarioIA }))
        }
        setVersionIA(v => v + 1)
      } catch (e) {
        setError(e.message)
      }
      setDisenando(null)
    })()
  }, [redactando]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cómo está todo ahora (lo elegido en cada selector, los textos y lo que ha hecho el asistente), para poder reabrir la copia tal cual
  const instantanea = () => ({
    producto,
    tema,
    tipoCarta,
    subCarta,
    colorPrecio,
    colorPrecioTexto,
    fondo2,
    textoSuave,
    coloresCarta,
    tamanoPrecio,
    enlaceNegocio,
    filtroCarta,
    colorFiltroCarta,
    detallePrecio,
    hero,
    barra,
    estilo,
    nombre,
    etiqueta,
    lema,
    logo,
    principal,
    acento,
    colorTexto,
    fondo,
    letra,
    cabecera,
    coloresMini,
    textosMini,
    estructura,
    corte,
    formato,
    disposicion,
    composicion,
    distribucion,
    pase,
    montaje,
    tamanoNombre,
    cartaMini,
    horarioMini,
    horarioVar,
    filtroFoto,
    cuento,
    cambiosExtra,
    cambiosIA,
    resumenDiseno,
  })

  // Cambios sin guardar: la huella de todo lo elegido ahora comparada con la de la última vez que se abrió el editor, se cargó una copia o se guardó.
  // marcarBase pide que la próxima huella pase a ser la de partida (versionBase hace que se compruebe aunque la huella no cambie)
  const huella = JSON.stringify(instantanea())
  const marcarBase = useRef(true)
  useEffect(() => {
    if (!marcarBase.current) return
    marcarBase.current = false
    setHuellaBase(huella)
  }, [huella, versionBase]) // eslint-disable-line react-hooks/exhaustive-deps
  const sinGuardar = huellaBase !== null && huella !== huellaBase
  /* Cada producto (miniweb, carta, ficha) guarda lo suyo: la copia cargada es de un solo producto. Al cambiar de producto se suelta, y
     Guardar cambios no puede escribir una carta encima de una miniweb (ni al revés); lo que se guarda después es una copia nueva */
  const cerrarPreguntaSalir = useCallback(() => setPreguntaSalir(null), [])
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
  // Al cerrar o recargar la pestaña con cambios sin guardar, el navegador pregunta
  useEffect(() => {
    if (!sinGuardar) return
    const avisar = e => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sinGuardar])

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

  // Si se llega con ?copia=tipo:slug (botón Editar de la pantalla de información), se abre Nuevo perfil con esa copia
  useEffect(() => {
    if (!cargar || !filas) return
    const [t, sl] = cargar.split(':')
    const fila = filas.find(f => f.tipo === t && f.slug === sl)
    if (!fila) return
    setAbierto(true)
    cargarCopia(fila)
    abrir(null)
  }, [cargar, filas]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const titulo = 'text-[0.8rem] font-semibold text-zinc-500'

  // El nombre del negocio (obligatorio), el icono del logo (abre el campo para subirlo) y el tamaño del nombre
  const bloqueNombre = (
    <BloqueNombre
      diseno={diseno}
      negocio={negocio}
      cartaBase={cartaBase}
      esCarta={esCarta}
    />
  )

  // Los datos de la página tal como están ahora (la base con el diseño elegido y, si lo hay, lo que ha hecho el asistente), sin los cambios a mano
  const datosEnBruto = useMemo(() => {
    try {
      const { base, cambios } = armar(nombre.trim() || 'Prueba')
      return aplicar(esCarta ? getCarta(base) : getNegocio(base), cambiosIA ? fusionar(cambios, cambiosIA.cambios) : cambios)
    } catch {
      return null
    }
  }, [vista, cambiosIA, producto]) // eslint-disable-line react-hooks/exhaustive-deps
  const cambiarExtra = (ruta, valor) =>
    setCambiosExtra(c => {
      const nuevo = { ...c }
      if (valor === leerRuta(datosEnBruto, ruta)) delete nuevo[ruta]
      else nuevo[ruta] = valor
      return nuevo
    })
  // Los cambios a mano pasan a la vista previa (junto a lo del asistente) medio segundo después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('mostraq-vista-ia', JSON.stringify({ ...(cambiosIA?.cambios ?? {}), ...textosPrevia, ...cambiosExtra }))
      } catch {
        // Sin almacenamiento, la vista previa no enseña estos cambios, pero al crear sí se guardan
      }
      setVersionExtra(v => v + 1)
    }, 600)
    return () => clearTimeout(t)
  }, [cambiosExtra, textosMini]) // eslint-disable-line react-hooks/exhaustive-deps

  // La tipografía (la pareja de fuentes de la marca)
  const campoTipografia = (
    <CampoTipografia
      negocio={negocio}
    />
  )

  // La paleta base de la marca (principal, acento, fondo y texto)
  const paletaMarca = (
    <PaletaMarca
      diseno={diseno}
      carta={carta}
      negocio={negocio}
      colorAcento={colorAcento}
      colorCabecera={colorCabecera}
      colorDelTexto={colorDelTexto}
      colorFondo={colorFondo}
      colorPrincipal={colorPrincipal}
      conCabecera={conCabecera}
      esCarta={esCarta}
    />
  )

  // Tipo (menú y ofertas) o temática del negocio: se usa en Diseño y estilos y en la pestaña Negocio
  const bloqueTematica = (
    <BloqueTematica
      diseno={diseno}
      carta={carta}
      esCarta={esCarta}
      grupoTema={grupoTema}
      plantilla={plantilla}
      titulo={titulo}
    />
  )

  // Lo que se enseña en dos sitios (los desplegables de siempre y las pestañas de ajustes por grupo)
  const bloquePortada = (
    <BloquePortada
      diseno={diseno}
      carta={carta}
      cambiarColorMini={cambiarColorMini}
      colorAcento={colorAcento}
      colorCabecera={colorCabecera}
      colorDelTexto={colorDelTexto}
      colorFondo={colorFondo}
      colorPrincipal={colorPrincipal}
      esCarta={esCarta}
      estilos={estilos}
      herosEnOrden={herosEnOrden}
      hoja={hoja}
      marcaBase={marcaBase}
      titulo={titulo}
    />
  )
  // El texto del botón de la portada: va en el grupo del botón (junto a sus colores), no en Texto inicio
  const campoTextoBoton = hayBotonPortada ? (
    <div className="grid gap-[0.3rem]">
      <div>
        <p className="text-[0.8rem] font-semibold text-zinc-500">Texto del botón</p>
        <p className="text-[0.8rem] text-zinc-400">Lo que pone el botón de la portada (por ejemplo, Ver menú o Ver servicios).</p>
      </div>
      <input value={textoBoton} maxLength={24} onChange={e => setTextosMini(t => ({ ...t, boton: e.target.value }))} className={CAMPO} />
      <span className="justify-self-end text-[0.75rem] text-zinc-500">{textoBoton.length}/24</span>
    </div>
  ) : null
  const bloqueTextoInicio = (
    <BloqueTextoInicio
      negocio={negocio}
      MAX_TEXTO_EXTRA={MAX_TEXTO_EXTRA}
      campoTipografia={campoTipografia}
      conTextoExtra={conTextoExtra}
      inicioBase={inicioBase}
      maxGrande={maxGrande}
      textoExtra={textoExtra}
      textoGrande={textoGrande}
      textoPequeno={textoPequeno}
      textosEditados={textosEditados}
    />
  )
  const bloqueTextoHorarios = datosEnBruto && (
              <Plegable titulo="Texto horarios">
                <TextosHorario original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
              </Plegable>
  )
  // Los colores de Menú y ofertas: lo elegido (cada uno en su estado) y el color que lleva si no se elige
  const derivadosCarta = derivadosDeFondoYTexto(colorFondo, colorDelTexto)
  const PROPIOS_CARTA = { nombre: 'cNombre', fondoPolaroid: 'cFondoPolaroid', menuTitulo: 'cMenuTitulo', menuCuando: 'cMenuCuando', seccion: 'cSeccion', activa: 'cActiva', alergenos: 'cAlergenos' }
  const valoresCarta = {
    fondo,
    fondo2,
    texto: colorTexto,
    textoSuave,
    precio: colorPrecioTexto,
    detalle: colorPrecio,
    ...Object.fromEntries(Object.entries(PROPIOS_CARTA).map(([clave, propio]) => [clave, coloresCarta[propio]])),
  }
  const autosCarta = {
    nombre: colorDelTexto,
    fondo: colorFondo,
    fondo2: derivadosCarta.surface,
    fondoPolaroid: colorPrincipal,
    texto: colorDelTexto,
    textoSuave: derivadosCarta.muted,
    menuTitulo: colorDelTexto,
    menuCuando: derivadosCarta.muted,
    precio: estilo === 'galeria' ? colorAcento : estilo === 'inmersiva' ? '#FFFFFF' : colorPrincipal,
    detalle: colorAcento,
    seccion: colorAcento,
    activa: estilo === 'galeria' ? colorAcento : colorPrincipal,
    alergenos: colorPrincipal,
  }
  const cambiarColorCarta = (clave, valor) => {
    const v = valor || ''
    if (clave === 'fondo') setFondo(v)
    else if (clave === 'fondo2') setFondo2(v)
    else if (clave === 'texto') setColorTexto(v)
    else if (clave === 'textoSuave') setTextoSuave(v)
    else if (clave === 'precio') setColorPrecioTexto(v)
    else if (clave === 'detalle') setColorPrecio(v)
    else if (PROPIOS_CARTA[clave]) {
      setColoresCarta(c => {
        const n = { ...c }
        if (v) n[PROPIOS_CARTA[clave]] = v
        else delete n[PROPIOS_CARTA[clave]]
        return n
      })
    }
  }
  const panelColoresCarta = (
    <PanelColoresMiniweb sinTitulo detalle catalogo={COLORES_CARTA} estilo={estilo} valores={valoresCarta} cambiar={cambiarColorCarta} autos={autosCarta} />
  )
  const autosColores = coloresAutomaticos({ colors: { ...marcaBase?.theme?.colors, bg: colorFondo, primary: colorPrincipal, accent: colorAcento, text: colorDelTexto, header: colorCabecera } }, { barra, portada: hero }, coloresMini)

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
  // Las copias para enseñar del producto elegido (las antiguas no se abren aquí)
  const copiasDisponibles = (filas ?? [])
    .filter(f => f.base && (f.tipo === 'carta' ? producto === 'carta' : producto !== 'carta' && (f.cambios?._nuevoPerfil?.producto ?? tipoDe(conEdicion('negocio', f.slug, f) ?? {})) === producto))
    .map(f => ({
      valor: `${f.tipo}:${f.slug}`,
      antigua: !f.cambios?._nuevoPerfil,
      nombre: f.cambios?._nuevoPerfil?.etiqueta?.trim() || f.cambios?._nuevoPerfil?.nombre || f.cambios?.nombre || f.cambios?.['marca.nombre'] || f.slug,
    }))

  // Los grupos de ajustes de cada producto (las pestañas de ajustes y los iconos de la vista previa del móvil)
  const gruposAjustes = (producto === 'miniweb'
                ? [['negocio', 'Negocio'], ['portada', 'Portada'], ['menu', 'Menú'], ['redes', 'Redes'], ['horario', 'Horario'], ['reserva', 'Reserva'], ['resena', 'Reseña'], ['ajustes', 'Ajustes personalizados']]
                : esCarta
                  ? [['negocio', 'Negocio'], ['portada', 'Estilo'], ['imagenes', 'Imágenes'], ['estructura', 'Estructura'], ['ajustes', 'Ajustes personalizados']]
                  : [['negocio', 'Negocio'], ['portada', 'Diseño'], ['ajustes', 'Ajustes personalizados']]
              )

  return (
    // peer: abierto, se oculta el botón de "Crear con el asistente" que va justo debajo (en Lista)
    <HojaCtx.Provider value={hoja}>
    <details open={abierto} onToggle={e => setAbierto(e.currentTarget.open)} className="group/perfil peer rounded-[1rem] bg-white ring-1 ring-zinc-200 open:fixed open:inset-0 open:z-40 open:overflow-y-auto open:rounded-none open:ring-0">
      {/* Cerrado: "Nuevo perfil" con una flecha para abrir. Abierto: solo un icono pequeño de plegar, para que la
          vista previa empiece casi arriba */}
      <summary
        aria-label="Editor"
        className="flex cursor-pointer list-none items-center px-[1rem] py-[0.9rem] group-open/perfil:justify-center group-open/perfil:pb-0 group-open/perfil:pt-[0.4rem] [&::-webkit-details-marker]:hidden"
      >
        <span className="text-[1.05rem] font-bold group-open/perfil:hidden">Editor</span>
        <ChevronDown className="ml-auto h-[1.1rem] w-[1.1rem] text-zinc-500 group-open/perfil:hidden" aria-hidden="true" />
        <ChevronsDownUp className="hidden h-[1.1rem] w-[1.1rem] text-zinc-400 group-open/perfil:block" aria-hidden="true" />
      </summary>
      {/* En una columna: vista previa, asistente, diseño y crear */}
      <div className={`mx-auto grid w-full max-w-[32rem] gap-[1rem] px-[1rem] py-[1rem] md:max-lg:pb-[9rem] ${pestana === 'asistente' ? 'lg:max-w-[60rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-x-[2.5rem]' : 'md:max-w-[60rem] md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] md:items-start md:gap-x-[2.5rem]'}`}>
        {/* En el móvil, en una columna: pestañas, vista previa y lo de cada pestaña. En pantalla grande, las pestañas y su contenido a la
            izquierda y, a la derecha, la vista previa (fija al bajar) (display: contents lo reparte en el móvil) */}
        <div className={`contents ${pestana === 'asistente' ? 'lg:col-start-1 lg:row-start-1 lg:grid lg:gap-[1rem]' : 'lg:col-start-1 lg:row-start-1 lg:grid lg:min-w-0 lg:gap-[1rem]'}`}>
        {/* Dos pestañas arriba: Personalizar y Asistente. La vista previa se ve siempre, y debajo, lo de cada una */}
        <div role="tablist" aria-label="Editor" className={`order-1 grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem] ${pestana === 'asistente' ? 'lg:order-none' : 'md:order-none md:max-lg:col-span-2 md:max-lg:row-start-1'} ${enAsistenteMovil ? 'hidden' : ''}`}>
          {[
            ['personalizar', 'Personalizar'],
            ['asistente', 'Asistente'],
          ].map(([clave, texto]) => (
            <button
              key={clave}
              type="button"
              role="tab"
              aria-selected={pestana === clave}
              onClick={() => setPestana(clave)}
              className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold ${pestana === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {texto}
            </button>
          ))}
        </div>
        {/* Móvil: la pantalla de inicio, con el producto y Continuar (al editor nuevo o, con el Asistente, a su pantalla) */}
        {enInicio && (
          <InicioMovil
            producto={producto}
            pestana={pestana}
            cambiarProducto={cambiarProducto}
            alContinuar={() => (pestana === 'asistente' ? setPasoMovil('asistente') : setVistaMovil(true))}
          />
        )}

        {/* El asistente: un cuadro donde pedirle lo que sea y un solo botón que lo monta todo (diseño, nombre, textos y fotos) */}
        {pestana === 'asistente' && (
        <div className={`order-3 grid gap-[0.6rem] lg:order-none ${esMovil && pasoMovil !== 'asistente' ? 'hidden' : ''}`}>
          {esMovil && <BarraAsistenteMovil alInicio={() => setPasoMovil('inicio')} alEditar={() => setVistaMovil(true)} />}
          {/* Qué diseña el asistente: una miniweb o una carta (la ficha ya no se vende) */}
          <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
            {[
              ['miniweb', 'Miniweb'],
              ['carta', 'Menú y ofertas'],
              ['ficha', 'Ficha'],
            ].map(([clave, texto]) => (
              <button
                key={clave}
                type="button"
                aria-pressed={producto === clave}
                disabled={clave === 'ficha' || Boolean(disenando) || Boolean(creando)}
                onClick={() => cambiarProducto(clave)}
                className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 max-md:whitespace-nowrap max-md:px-[0.15rem] max-md:text-[0.78rem] ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
              >
                {texto}
              </button>
            ))}
          </div>
          {/* Con Carta elegida, qué tipo: cada uno con sus reglas en el asistente (es el mismo tipo del selector del Editor) */}
          {producto === 'carta' && (
            <div className="grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
              {TIPOS_CARTA.map(t => (
                <button
                  key={t.clave}
                  type="button"
                  aria-pressed={tipoCarta === t.clave}
                  disabled={Boolean(disenando) || Boolean(creando)}
                  onClick={() => setTipoCarta(t.clave)}
                  className={`rounded-[0.55rem] py-[0.45rem] text-[0.9rem] font-semibold disabled:opacity-40 ${tipoCarta === t.clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {t.clave === 'carta' ? 'Menú del día' : 'Ofertas'}
                </button>
              ))}
            </div>
          )}
          {/* Lo único seguro: el nombre. Si se escribe, el asistente lo usa tal cual; si no, lo saca de la captura o se lo inventa */}
          <Etiqueta texto="Nombre del negocio">
            <input value={nombre} onChange={e => setNombre(e.target.value)} disabled={Boolean(disenando) || Boolean(creando)} className={CAMPO} placeholder="Peluquería Ranita" />
          </Etiqueta>
          <textarea
            value={cuento}
            onChange={e => setCuento(e.target.value)}
            disabled={Boolean(disenando) || Boolean(creando)}
            rows={3}
            aria-label="Pídele al asistente lo que quieras"
            placeholder="Opcional: lo que quieras añadir (estilo, colores, datos). Con el nombre y una captura de su Instagram ya basta."
            className={`${CAMPO} resize-y`}
          />
          {/* Dos imágenes opcionales para el asistente, que solo las mira (no se colocan en la miniweb): el logo de referencia (colores y carácter
              de la marca) y una captura con información (solo se lee su texto: nombre, teléfonos, dirección, horario...) */}
          <div className="flex flex-wrap items-center gap-x-[1.2rem] gap-y-[0.6rem]">
            <CampoImagenAsistente titulo="Añadir logo de referencia" valor={referencia} cambiar={setReferencia} conColores bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
            <CampoImagenAsistente titulo="Añadir captura con información" valor={captura} cambiar={setCaptura} bloqueado={Boolean(disenando) || Boolean(creando)} avisar={setError} />
          </div>
          <button type="button" onClick={montar} disabled={!(nombre.trim() || cuento.trim() || referencia || captura) || Boolean(disenando) || Boolean(creando)} className={BOTON}>
            {disenando ?? 'Montar el diseño con el asistente'}
          </button>
          {resumenDiseno && <p className="text-[0.85rem] font-semibold text-zinc-800">{resumenDiseno}</p>}
        </div>
        )}

        <div className="order-3 grid gap-[1rem] md:order-none md:max-lg:col-start-1 md:max-lg:row-start-2 md:max-lg:min-w-0">
          {/* Personalizar: el producto y, debajo, desplegables independientes (todos cerrados al entrar) */}
          {pestana === 'personalizar' && (
          <div className={`grid gap-[1rem] ${hoja ? `fixed inset-x-0 top-[4rem] z-30 max-h-[60svh] overflow-y-auto rounded-b-[1.25rem] bg-white px-[1rem] pb-[1.5rem] pt-[1rem] shadow-[0_0.5rem_1.5rem_rgb(0_0_0/0.4)] ring-1 ring-zinc-300 [&>*]:[zoom:0.85] transition-opacity duration-500 ${flechasVisibles ? '' : 'pointer-events-none opacity-0'}` : 'max-md:hidden'}`}>
          {/* En la hoja de ajustes del móvil, el nombre del grupo abierto como título, para saber dónde estás */}
          {hoja && <p className="text-[1.1rem] font-bold">{gruposAjustes.find(([clave]) => clave === pestanaAjustes)?.[1]}</p>}
          {/* 1. Temática: pone el contenido de ejemplo */}
          {/* 1. Producto */}
          <div className={`grid gap-[0.4rem] ${hoja ? 'hidden' : ''}`}>
            <span className={titulo}>Producto</span>
            <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem] md:max-lg:grid-cols-1">
              {[
                ['miniweb', 'Miniweb'],
                ['carta', 'Menú y ofertas'],
                ['ficha', 'Ficha'],
              ].map(([clave, texto]) => (
                <button
                  key={clave}
                  type="button"
                  aria-pressed={producto === clave}
                  disabled={clave === 'ficha' && tabletVertical}
                  onClick={() => cambiarProducto(clave)}
                  className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 max-md:whitespace-nowrap max-md:px-[0.15rem] max-md:text-[0.78rem] ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {/* Pestañas de ajustes por grupo: cada una junta todo lo de un grupo (diseño, colores y textos). Pulsar la abierta la cierra. Los desplegables de siempre siguen debajo */}
          <div className="grid gap-[0.6rem]">
            <div role="tablist" aria-label="Ajustes por grupo" className={`flex flex-wrap gap-[0.4rem] md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:[&>*:last-child:nth-child(odd)]:col-span-2 ${hoja ? 'hidden' : ''}`}>
              {gruposAjustes.map(([clave, texto]) => (
                <button
                  key={clave}
                  type="button"
                  role="tab"
                  aria-selected={pestanaAjustes === clave}
                  onClick={() => setPestanaAjustes(actual => (actual === clave ? null : clave))}
                  className={`shrink-0 rounded-full px-[0.9rem] py-[0.35rem] text-[0.85rem] font-semibold transition-colors md:max-lg:leading-tight ${pestanaAjustes === clave ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'}`}
                >
                  {texto}
                </button>
              ))}
            </div>
            {pestanaAjustes === 'negocio' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                {bloqueTematica}
                {bloqueNombre}
                {producto !== 'miniweb' && campoTipografia}
                {/* En miniweb esos cuatro colores (Personalizado) van en Ajustes personalizados; en Menú y ofertas y Ficha, aquí */}
                {producto === 'ficha' && paletaMarca}
                {esCarta && panelColoresCarta}
                {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloOtras />}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={b => b.clave === 'datos'} />}
              </div>
            )}
            {pestanaAjustes === 'portada' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                {bloquePortada}
          {/* Carta: Diseño del precio, el detalle que remarca el precio del menú. Primero la familia (Sin estilo, Líneas o Círculos) y debajo sus subestilos */}
          {esCarta && (
            <details className="group/dprecio rounded-[0.75rem] ring-1 ring-zinc-200">
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-bold">Diseño del precio</span>
                <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/dprecio:rotate-180" aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                <div className="grid gap-[0.4rem]">
                <span className="text-[0.8rem] font-semibold text-zinc-500">Tamaño del precio</span>
                <div className="flex gap-[0.4rem]">
                  {['xs', 'md', 'xl'].map(t => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tamanoPrecio === t}
                      onClick={() => setTamanoPrecio(t)}
                      className={`rounded-full px-[0.8rem] py-[0.25rem] text-[0.78rem] font-semibold uppercase ring-1 transition-colors ${tamanoPrecio === t ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                </div>
                {(() => {
                  const TEXTO = '<text x="12" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none">12€</text>'
                  const SUBESTILOS = {
                    lineas: [
                      ['raya', 'Raya', '<path d="M4 18h16" stroke-width="2.5"/>'],
                      ['ondulada', 'Ondulada', '<path d="M3 18c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 2.2 1.4 2.6 0"/>'],
                      ['pincelada', 'Pincelada', '<path d="M3.5 18.5c4.5-2.2 9 1.2 17-1.2" stroke-width="2.2"/>'],
                      ['doble', 'Doble línea', '<path d="M4 17h16M4 20h16" stroke-width="1.2"/>'],
                    ],
                    circulos: [
                      ['ovalo', 'Óvalo a mano', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>'],
                      ['repasado', 'Óvalo repasado', '<ellipse cx="12" cy="12" rx="9.5" ry="6" transform="rotate(-4 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="6.6" transform="rotate(4 12 12)"/>'],
                      ['arco', 'Arco abierto', '<path d="M6 17A9.5 6.2 0 1 0 5.5 8.5"/>'],
                      ['sello', 'Sello de puntos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" stroke-dasharray="0.1 2.4"/>'],
                    ],
                    formas: [
                      ['estrella', 'Estrella de oferta', '<path d="M12 3l1.6 2.2 2.6-.7.5 2.7 2.6 1-1.2 2.4 1.2 2.4-2.6 1-.5 2.7-2.6-.7L12 21l-1.6-2.2-2.6.7-.5-2.7-2.6-1L5.9 13 4.7 10.6l2.6-1 .5-2.7 2.6.7z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['pastilla', 'Pastilla', '<rect x="2.5" y="6.5" width="19" height="11" rx="5.5" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['etiqueta', 'Etiqueta de precio', '<path d="M2.5 12l3.5-5.5h15v11H6z" fill="currentColor" opacity=".2" stroke="none"/><circle cx="6.2" cy="12" r=".9" fill="white" stroke="none"/>'],
                      ['cinta', 'Cinta', '<path d="M2 6.5h20l-1.8 5.5 1.8 5.5H2l1.8-5.5z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['burbuja', 'Burbuja', '<path d="M3.5 5.5h17v9.5H10l-3.5 3.5V15h-3z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['rombo', 'Rombo', '<path d="M5 6.5h14l3 5.5-3 5.5H5L2 12z" fill="currentColor" opacity=".2" stroke="none"/>'],
                      ['escudo', 'Escudo', '<path d="M4.5 5.5h15v8l-7.5 6-7.5-6z" fill="currentColor" opacity=".2" stroke="none"/>'],
                    ],
                  }
                  const familia = detallePrecio === 'ninguno' ? 'sin' : SUBESTILOS.lineas.some(([c]) => c === detallePrecio) ? 'lineas' : SUBESTILOS.formas.some(([c]) => c === detallePrecio) ? 'formas' : 'circulos'
                  const nombreDe = [...SUBESTILOS.lineas, ...SUBESTILOS.circulos, ...SUBESTILOS.formas].find(([c]) => c === detallePrecio)?.[1]
                  const boton = (clave, nombreBoton, dibujo, activo, alTocar) => (
                    <button
                      key={clave}
                      type="button"
                      title={nombreBoton}
                      aria-label={nombreBoton}
                      aria-pressed={activo}
                      onClick={alTocar}
                      className={claseIcono(activo)}
                    >
                      <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: TEXTO + dibujo }} />
                    </button>
                  )
                  return (
                    <>
                      <div className="grid gap-[0.35rem]">
                        <FilaIconos className="flex gap-[0.4rem]">
                          {boton('sin', 'Sin estilo', '', familia === 'sin', () => setDetallePrecio('ninguno'))}
                          {boton('lineas', 'Líneas', '<path d="M4 18h16" stroke-width="2.5"/>', familia === 'lineas', () => familia !== 'lineas' && setDetallePrecio('raya'))}
                          {boton('circulos', 'Círculos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>', familia === 'circulos', () => familia !== 'circulos' && setDetallePrecio('ovalo'))}
                          {boton('formas', 'Formas', '<path d="M4 6.5h16l2 5.5-2 5.5H4l-2-5.5z" fill="currentColor" opacity=".2" stroke="none"/>', familia === 'formas', () => familia !== 'formas' && setDetallePrecio('estrella'))}
                        </FilaIconos>
                        <p className="text-[0.85rem] font-semibold">{{ sin: 'Sin estilo', lineas: 'Líneas', circulos: 'Círculos', formas: 'Formas' }[familia]}</p>
                      </div>
                      {familia !== 'sin' && (
                        <div className="grid gap-[0.35rem]">
                          <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                            {SUBESTILOS[familia].map(([clave, nombreSub, dibujo]) => boton(clave, nombreSub, dibujo, detallePrecio === clave, () => setDetallePrecio(clave)))}
                          </FilaIconos>
                          <p className="text-[0.8rem] text-zinc-500">{nombreDe}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </details>
          )}
                {producto === 'miniweb' && (
                  <>
                    <PanelColoresMiniweb sinTitulo detalle claves={['fondoPortada', 'botonFondo', 'boton', 'titulo', 'titular', 'descripcion', 'subtitulo', 'extra']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} extrasPorGrupo={{ 'Botón "Ver menú"': campoTextoBoton }} />
                    {bloqueTextoInicio}
                  </>
                )}
                {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['inicio']} />}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['inicio'])} />}
              </div>
            )}
            {pestanaAjustes === 'menu' && producto === 'miniweb' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                <EstructuraMiniweb sinTitulo claves={['menuEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
                <FilaEstiloMenu valor={barra} cambiar={setBarra} />
                <PanelColoresMiniweb sinTitulo detalle claves={['menuFondo', 'menuTexto', 'menuSubrayado']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
                {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['menu']} />}
                {datosEnBruto && (
                  <Plegable titulo="Texto pestañas">
                    <TextosPestanas original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
                  </Plegable>
                )}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['menu'])} />}
              </div>
            )}
            {pestanaAjustes === 'redes' && producto === 'miniweb' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                <EstructuraMiniweb sinTitulo claves={['redesEn', 'compartirEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
                <PanelColoresMiniweb sinTitulo detalle claves={['redesFondo', 'redesIconos']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={['Redes']} />}
              </div>
            )}
            {pestanaAjustes === 'horario' && producto === 'miniweb' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                <FilaHorario valor={horarioMini} cambiar={setHorarioMini} variante={horarioVar} cambiarVariante={setHorarioVar} />
                <PanelColoresMiniweb sinTitulo detalle claves={['horarioTitulo', 'horarioDias', 'horarioHoras', 'horarioMapa']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
                {bloqueTextoHorarios}
                {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['horario']} />}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['horario'])} />}
              </div>
            )}
            {pestanaAjustes === 'reserva' && producto === 'miniweb' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                <PanelColoresMiniweb sinTitulo detalle claves={['reservaTitulo', 'reservaTexto', 'reservaBoton', 'reservaBotonTexto', 'reservaTelefono']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
                <EstructuraMiniweb sinTitulo claves={['contactoEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
                {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['reservar', 'contacto', 'cita', 'encargos', 'comanda', 'precios']} />}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['reservar', 'contacto', 'cita', 'encargos', 'comanda', 'precios'])} />}
              </div>
            )}
            {pestanaAjustes === 'resena' && producto === 'miniweb' && (
              <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
                <PanelColoresMiniweb sinTitulo detalle claves={['fondoResena']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={['Reseña de Google']} />}
                {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={b => ['destacada', 'carrusel'].includes(b.clave)} />}
              </div>
            )}
          {pestanaAjustes === 'imagenes' && esCarta && (
            <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
              {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />}
            </div>
          )}
          {pestanaAjustes === 'estructura' && esCarta && (
            <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
          {/* Carta: Estructura, dónde va cada pieza. De momento, el enlace "Conoce [negocio]" (a la miniweb del negocio) */}
          {esCarta && (
            <Plegable titulo="Estructura" elegido={{ ninguno: 'Sin enlace', izquierda: 'Enlace a la izquierda', derecha: 'Enlace a la derecha' }[enlaceNegocio]}>
              <div className="grid gap-[0.4rem]">
                <span className="text-[0.8rem] text-zinc-500">Enlace al negocio (Conoce...)</span>
                <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
                  {[
                    ['ninguno', 'Sin enlace', '<path d="M9 8l6 6M15 8l-6 6" stroke-width="1.4"/>'],
                    ['izquierda', 'Arriba a la izquierda', '<rect x="7.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
                    ['derecha', 'Arriba a la derecha', '<rect x="10.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
                  ].map(([clave, nombreLado, dibujo]) => (
                    <button
                      key={clave}
                      type="button"
                      title={nombreLado}
                      aria-label={`Enlace al negocio: ${nombreLado}`}
                      aria-pressed={enlaceNegocio === clave}
                      onClick={() => setEnlaceNegocio(clave)}
                      className={claseIcono(enlaceNegocio === clave)}
                    >
                      <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<rect x="5.5" y="2" width="13" height="20" rx="2.5"/>' + dibujo }} />
                    </button>
                  ))}
                </FilaIconos>
                <p className="text-[0.85rem] font-semibold">{{ ninguno: 'Sin enlace', izquierda: 'Arriba a la izquierda', derecha: 'Arriba a la derecha' }[enlaceNegocio]}</p>
              </div>
            </Plegable>
          )}
            </div>
          )}
          {pestanaAjustes === 'ajustes' && (
            <div role="tabpanel" className="grid gap-[0.75rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
              {/* Lo que no se puede cambiar desde las otras pestañas: la carta del menú, los ajustes de Menú y ofertas y de la Ficha, y los datos en bruto. En miniweb, también los colores de partida (Personalizado) */}
              {(producto === 'miniweb' || esCarta) && paletaMarca}
          {producto === 'ficha' && (
            <Plegable titulo={producto === 'miniweb' ? 'Estilo del menú de navegación' : 'Estilo de pestañas'} elegido={barra ? BARRAS[barra]?.nombre : producto === 'miniweb' ? 'La rayita' : 'El suyo'}>
              <div className="flex flex-wrap gap-[0.4rem]">
                {[['', { nombre: producto === 'miniweb' ? 'La rayita (la de siempre)' : 'El suyo' }], ...Object.entries(BARRAS)].map(([clave, b]) => (
                  <button key={clave || 'suyo'} type="button" aria-pressed={barra === clave} onClick={() => setBarra(clave)} className={opcion(barra === clave)}>
                    {b.nombre}
                  </button>
                ))}
              </div>
            </Plegable>
          )}

            {/* Imágenes: todas las de la página, por pestaña, con el buscador de fotos y para subir la tuya */}
            {producto === 'ficha' && datosEnBruto && (
              <details className="group/imagenes rounded-[0.75rem] ring-1 ring-zinc-200">
                <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                  <span className="text-[1rem] font-bold">Imágenes</span>
                  <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/imagenes:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
                  <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
                </div>
              </details>
            )}
            {/* Todos los datos editables en bruto, en sus desplegables (los del editor de un perfil) */}
            {!esCarta && datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloAjustes />}
            {/* La carta del menú, abajo del todo */}
            {producto === 'miniweb' && <SelectorCartaMiniweb valor={cartaMini} cambiar={valor => setCartaMini(valor ?? '')} exportadas={(filas ?? []).filter(f => f.tipo === 'carta' && f.base && f.cambios?._cliente)} />}
            </div>
          )}
          </div>
          </div>
          )}

        </div>
        </div>

        {/* Vista previa: el contenido de la temática con el diseño elegido. A 360 px de ancho por dentro, como el móvil bajo:
            se ve lo mismo que verá el cliente. En pantalla grande, a la derecha y fija al bajar */}
        <div className={`${pestana === 'asistente' ? 'order-2' : 'order-4'} ${pestana === 'asistente' ? 'lg:sticky lg:top-[1rem] lg:order-none lg:col-start-2 lg:row-start-1' : 'md:sticky md:top-[1rem] md:order-none md:col-start-2 md:max-lg:row-start-2 lg:row-start-1'}`}>
          {/* En móvil: la vista previa a pantalla completa cuando se abre (vistaMovil) y, si no, escondida. Desde 768 px, en su sitio de siempre */}
          <div className={vistaMovil ? 'max-md:fixed max-md:inset-0 max-md:z-20 max-md:flex max-md:flex-col max-md:overflow-hidden max-md:bg-white max-md:px-[1rem] max-md:pb-[2rem] max-md:pt-[1rem]' : 'max-md:hidden'}>
            {/* Dos iconos arriba: la copia (abre la lista de copias) y el tamaño del móvil (con la letra elegida; abre XS, S, M y L). El panelito se cierra al elegir o al tocar fuera */}
            <BarraIconosMovil
              popover={popover}
              setPopover={setPopover}
              hojaAbierta={hojaAbierta}
              setHojaAbierta={setHojaAbierta}
              pestanaAjustes={pestanaAjustes}
              setPestanaAjustes={setPestanaAjustes}
              gruposAjustes={gruposAjustes}
              copiaCargada={copiaCargada}
              copiasDisponibles={copiasDisponibles}
              elegirCopia={elegirCopia}
              creando={creando}
              disenando={disenando}
              nombre={nombre}
              crear={crear}
              guardarCopia={guardarCopia}
            />
            {vistaMovil && (
              <FlechaVolver
                flechasVisibles={flechasVisibles}
                alVolver={() => {
                  setVistaMovil(false)
                  setHojaAbierta(false)
                  setPasoMovil('inicio')
                }}
              />
            )}
            {/* Las copias para enseñar (sin las demos originales) del producto elegido, para cargarlas aquí y retocarlas */}
            <label className="mx-auto mb-[0.7rem] grid w-full max-w-[20rem] gap-[0.25rem] max-md:hidden">
              <span className="text-[0.8rem] font-semibold text-zinc-500">Copia</span>
              <select
                value={copiaCargada ? `${copiaCargada.tipo}:${copiaCargada.slug}` : ''}
                onChange={e => elegirCopia(e.target.value)}
                className={CAMPO}
              >
                <option value="">Ninguna (una nueva)</option>
                {copiasDisponibles.map(c => (
                  <option key={c.valor} value={c.valor} disabled={c.antigua}>
                    {c.nombre}
                    {c.antigua ? ' (antigua, no se abre aquí)' : ''}
                  </option>
                ))}
              </select>
            </label>
            {/* El tamaño del móvil: para ver la miniweb en un móvil bajo, normal o largo sin tener el real delante (siempre aproximado) */}
            <div role="group" aria-label="Tamaño del móvil" className="mx-auto mb-[0.6rem] flex w-full max-w-[20rem] flex-wrap justify-center gap-[0.35rem] max-md:hidden">
              {TAMANOS_MOVIL.map(t => (
                <button
                  key={t.clave}
                  type="button"
                  title={t.ayuda}
                  aria-pressed={tamanoMovil === t.clave}
                  onClick={() => elegirTamanoMovil(t.clave)}
                  className={`rounded-full px-[0.7rem] py-[0.25rem] text-[0.78rem] font-semibold ring-1 transition-colors ${tamanoMovil === t.clave ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
            {/* Sin copia cargada y sin nada generado, el móvil va vacío: solo se llena al elegir una copia (o al generar con el asistente) */}
            {esMovil ? (
              <div className="absolute inset-x-0 top-[3.6rem] h-svh bg-black">
                {(error || aviso) && (
                  <p className={`absolute inset-x-[1rem] top-[0.6rem] z-10 rounded-[0.6rem] bg-white px-[0.8rem] py-[0.5rem] text-[0.85rem] font-semibold ring-1 ring-zinc-300 ${error ? 'text-red-600' : 'text-emerald-700'}`}>{error || aviso}</p>
                )}
                {!copiaCargada && !generado ? (
                  <div className="flex h-full items-center justify-center px-[1.5rem] text-center text-[0.95rem] font-semibold text-[rgb(255_255_255/0.6)]">
                    {pestana === 'asistente' ? 'Genera algo con el asistente y aparecerá aquí' : 'Elige una copia y aparecerá aquí'}
                  </div>
                ) : (
                  vista && <iframe key={vista} src={vista} title="Vista previa" className="h-full w-full border-0" />
                )}
                {/* Con la hoja de ajustes abierta pero invisible, una capa transparente sobre la miniweb recoge el toque (un toque dentro del iframe no llega a esta página) y la hace reaparecer */}
                {hoja && !flechasVisibles && <div className="absolute inset-0 z-[5]" aria-hidden="true" />}
              </div>
            ) : !copiaCargada && !generado ? (
              <Movil ancho={medidaMovil.ancho} alto={medidaMovil.alto} className={`mx-auto w-full max-w-[20rem] max-md:order-1`}>
                <div className="flex h-full items-center justify-center bg-black px-[1.5rem] text-center text-[0.95rem] font-semibold text-[rgb(255_255_255/0.6)]">{pestana === 'asistente' ? 'Genera algo con el asistente y aparecerá aquí' : 'Elige una copia y aparecerá aquí'}</div>
              </Movil>
            ) : (
              vista && <Movil key={vista} src={vista} titulo="Vista previa" ancho={medidaMovil.ancho} alto={medidaMovil.alto} className={`mx-auto w-full max-w-[20rem] max-md:order-1`} />
            )}
            {(copiaCargada || generado) && <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500 max-md:hidden">Con el contenido de ejemplo de la temática</p>}
          {/* Debajo del móvil en dos columnas (escritorio); en tablet, una barra fija abajo para tener siempre a mano Guardar; en móvil, debajo de los tamaños. Ya no hay muestras: todo lo que se crea es una copia para enseñar */}
          {(error || aviso || pestana !== 'asistente' || cambiosIA || copiaCargada) && (
            <div className="md:max-lg:fixed md:max-lg:inset-x-0 md:max-lg:bottom-0 md:max-lg:z-30 md:max-lg:border-t md:max-lg:border-zinc-200 md:max-lg:bg-white/95 md:max-lg:px-[1rem] md:max-lg:py-[0.7rem] md:max-lg:backdrop-blur max-md:hidden">
              <div className="mx-auto mt-[0.9rem] grid w-full max-w-[20rem] gap-[0.5rem] md:max-lg:mt-0 md:max-lg:max-w-[32rem]">
                {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
                {(pestana !== 'asistente' || cambiosIA || copiaCargada) &&
                  (copiaCargada ? (
                    <div className="grid gap-[0.5rem] max-lg:grid-cols-2">
                      <button type="button" onClick={guardarCopia} disabled={Boolean(creando) || Boolean(disenando)} className={BOTON}>
                        {creando ?? 'Guardar cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => crear()}
                        disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)}
                        className="rounded-[0.7rem] bg-white px-[1rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500 disabled:opacity-50"
                      >
                        Guardar como nueva
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={crear} disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)} className={BOTON}>
                      {creando ?? 'Añadir a copias'}
                    </button>
                  ))}
                {aviso && <p className="text-center text-[0.8rem] font-semibold text-emerald-700">{aviso}</p>}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      <Confirmar pregunta={preguntaSalir} alCerrar={cerrarPreguntaSalir} />
    </details>
    </HojaCtx.Provider>
  )
}

// Desplegable para elegir una de esas páginas, por grupos
// Tamaños del móvil de la vista previa de Nuevo perfil: lo que ve de la página (alto = lo visible dentro del navegador, no la pantalla entera)
const TAMANOS_MOVIL = [
  { clave: 'bajo', nombre: 'XS', ancho: 360, alto: 640, ayuda: 'XS: móvil bajo, 360 × 640' },
  { clave: 'normal', nombre: 'S', ancho: 360, alto: 680, ayuda: 'S: móvil normal con la barra del navegador (como un S23), 360 × 680' },
  { clave: 'completo', nombre: 'M', ancho: 360, alto: 780, ayuda: 'M: móvil normal a pantalla completa, 360 × 780' },
  { clave: 'alto', nombre: 'L', ancho: 440, alto: 956, ayuda: 'L: móvil largo y grande (como un iPhone Pro Max), 440 × 956' },
]

// El número siguiente de un nombre interno que acaba en número ("Claudia 1" pasa a "Claudia 2"), saltando los que ya existen; sin número, igual
const siguienteEtiqueta = (etiqueta, usadas) => {
  const m = etiqueta.match(/^(.*?)(\d+)\s*$/)
  if (!m) return etiqueta
  const ocupadas = new Set(usadas)
  let n = Number(m[2])
  do n++
  while (ocupadas.has(`${m[1]}${n}`))
  return `${m[1]}${n}`
}
