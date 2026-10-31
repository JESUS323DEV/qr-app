import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HojaCtx } from './FilaIconos'
import usePantallaMovil from './usePantallaMovil'
import usePerfilAcciones from './perfil/usePerfilAcciones'
import instantaneaPerfil from './perfil/instantaneaPerfil'
import marcaVista from './perfil/marcaVista'
import PanelAsistente from './perfil/paneles/PanelAsistente'
import PanelPortada from './perfil/paneles/PanelPortada'
import PanelAjustes from './perfil/paneles/PanelAjustes'
import PanelEstructura from './perfil/paneles/PanelEstructura'
import PanelImagenes from './perfil/paneles/PanelImagenes'
import PanelResena from './perfil/paneles/PanelResena'
import PanelReserva from './perfil/paneles/PanelReserva'
import PanelHorario from './perfil/paneles/PanelHorario'
import PanelRedes from './perfil/paneles/PanelRedes'
import PanelMenu from './perfil/paneles/PanelMenu'
import PanelNegocio from './perfil/paneles/PanelNegocio'
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
import { BarraIconosMovil, FlechaVolver, InicioMovil } from './EditorMovil'
import { ChevronDown, ChevronsDownUp } from 'lucide-react'
import { aplicar, conEdicion } from '../lib/ediciones'
import { getNegocio } from '../negocios'
import { getCarta, marcaDe } from '../cartas'
import { BOTON, CAMPO, Confirmar } from '../components/panel'
import { GRUPOS_PLANTILLAS, PLANTILLAS } from '../plantillas'
import { derivadosDeFondoYTexto } from '../lib/mezclarColores'
import { COLORES_CARTA } from '../lib/coloresCarta'
import Movil from '../components/Movil'
import { coloresAutomaticos } from '../lib/coloresMiniweb'
import { pestanasDeMiniweb } from '../lib/miniweb'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { FAMILIAS } from '../familias'
import { leerRuta, maxDe } from './datos'
import { fusionar } from './ia'
import { ESTRUCTURA_DEFECTO, PanelColoresMiniweb, Plegable, SIN_PORTADA_MINIWEB } from './PanelesMiniweb'
import { TEXTO_EXTRA_EJEMPLO, TextosHorario } from './TextosEditor'

/* Nuevo perfil: crear una miniweb o una carta desde cero, con el asistente, la vista previa en vivo y todos los ajustes. */

// Las cartas de ejemplo de cada tipo de carta (el diseño ya no depende de la temática): Carta, la de un restaurante con menú del día;
// Promociones, la de Laca, con ofertas (con su precio anterior tachado) y servicios por secciones
const CARTA_DE_TIPO = { carta: 'almendra', promociones: 'laca' }

export function NuevoPerfil({ filas, recargar, abrir, cargar }) {
  // La pestaña abierta: el asistente o el diseño (la vista previa se ve siempre)
  const [pestana, setPestana] = useState('personalizar')
  // El resto del estado, agrupado por temas (src/admin/perfil/)
  const diseno = usePerfilDiseno()
  const { tema, producto, hero, barra, cabecera, estructura, coloresMini, setColoresMini } = diseno
  const carta = usePerfilCarta()
  const { tipoCarta, estilo, colorPrecio, setColorPrecio, colorPrecioTexto, setColorPrecioTexto, fondo2, setFondo2, textoSuave, setTextoSuave, coloresCarta, setColoresCarta } = carta
  const negocio = usePerfilNegocio()
  const { nombre, logo, principal, acento, colorTexto, setColorTexto, fondo, setFondo, textosMini, setTextosMini, setNombreVista } = negocio
  const asistente = usePerfilAsistente()
  const { cuento, setCuento, disenando, setDisenando, resumenDiseno, cambiosIA, setCambiosIA, setVersionIA, redactando, setRedactando, referencia, setReferencia, captura, setCaptura, infoImagen, horarioIA, generado } = asistente
  const copias = usePerfilCopias()
  const { creando, aviso, error, setError, copiaCargada, huellaBase, setHuellaBase, versionBase, preguntaSalir, setPreguntaSalir, cambiosExtra, setCambiosExtra, setVersionExtra } = copias
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
  const marca = marcaVista({ ...negocio, ...diseno, ...copias, ...asistente, ...carta, conCabecera, conTextoExtra, esCarta, logoElegido, lugares, textoExtra, textoGrande, textoPequeno, textosEditados, textosPrevia })

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
  const instantanea = () => instantaneaPerfil({ ...negocio, ...diseno, ...copias, ...asistente, ...carta })

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
  // Al cerrar o recargar la pestaña con cambios sin guardar, el navegador pregunta
  useEffect(() => {
    if (!sinGuardar) return
    const avisar = e => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sinGuardar])

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

  // Las acciones del Editor (src/admin/perfil/usePerfilAcciones.js)
  const { montar, cambiarProducto, cargarCopia, guardarCopia, crear, elegirCopia } = usePerfilAcciones({ ...copias, ...asistente, ...negocio, ...diseno, ...carta, abrir, armar, cartaBase, esCarta, filas, instantanea, marcarBase, recargar, redactar, setPestana, sinGuardar, textosPrevia })
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
        <PanelAsistente diseno={diseno} carta={carta} negocio={negocio} cambiarProducto={cambiarProducto} captura={captura} creando={creando} cuento={cuento} disenando={disenando} esMovil={esMovil} montar={montar} pasoMovil={pasoMovil} referencia={referencia} resumenDiseno={resumenDiseno} setCaptura={setCaptura} setCuento={setCuento} setError={setError} setPasoMovil={setPasoMovil} setReferencia={setReferencia} setVistaMovil={setVistaMovil} />
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
              <PanelNegocio diseno={diseno} bloqueNombre={bloqueNombre} bloqueTematica={bloqueTematica} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} campoTipografia={campoTipografia} datosEnBruto={datosEnBruto} esCarta={esCarta} paletaMarca={paletaMarca} panelColoresCarta={panelColoresCarta} />
            )}
            {pestanaAjustes === 'portada' && (
              <PanelPortada diseno={diseno} carta={carta} autosColores={autosColores} bloquePortada={bloquePortada} bloqueTextoInicio={bloqueTextoInicio} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} campoTextoBoton={campoTextoBoton} datosEnBruto={datosEnBruto} esCarta={esCarta} />
            )}
            {pestanaAjustes === 'menu' && producto === 'miniweb' && (
              <PanelMenu diseno={diseno} autosColores={autosColores} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} plantilla={plantilla} />
            )}
            {pestanaAjustes === 'redes' && producto === 'miniweb' && (
              <PanelRedes diseno={diseno} autosColores={autosColores} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} plantilla={plantilla} />
            )}
            {pestanaAjustes === 'horario' && producto === 'miniweb' && (
              <PanelHorario diseno={diseno} autosColores={autosColores} bloqueTextoHorarios={bloqueTextoHorarios} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} />
            )}
            {pestanaAjustes === 'reserva' && producto === 'miniweb' && (
              <PanelReserva diseno={diseno} autosColores={autosColores} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} plantilla={plantilla} />
            )}
            {pestanaAjustes === 'resena' && producto === 'miniweb' && (
              <PanelResena diseno={diseno} autosColores={autosColores} cambiarColorMini={cambiarColorMini} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} />
            )}
          {pestanaAjustes === 'imagenes' && esCarta && (
            <PanelImagenes cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} />
          )}
          {pestanaAjustes === 'estructura' && esCarta && (
            <PanelEstructura carta={carta} esCarta={esCarta} />
          )}
          {pestanaAjustes === 'ajustes' && (
            <PanelAjustes diseno={diseno} cambiarExtra={cambiarExtra} cambiosExtra={cambiosExtra} datosEnBruto={datosEnBruto} esCarta={esCarta} filas={filas} paletaMarca={paletaMarca} />
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

