import { useState } from 'react'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { HEROS } from './index'
import PaginaHorario from './PaginaHorario'
import PaginaCita from './PaginaCita'
import { PaginaReservar } from './web/PaginaReservar'
import { PaginaCitaFormulario, PaginaReservaFormulario } from './web/PaginaFormulario'
import { PaginaInicio } from './web/PaginaInicio'
import { PaginaContacto } from './web/PaginaContacto'
import { PaginaReservarComoBoton } from './web/PaginaReservarComoBoton'
import { PaginaUbicacion } from './web/PaginaUbicacion'
import { PaginaPrecios } from './web/PaginaPrecios'
import { PaginaMenu } from './web/PaginaMenu'
import { esClaro, lugarRedes, BarraRedes } from './web/redes'
import { PaginaPortada } from './web/PaginaPortada'

/* Web (plan premium). Parece una web de verdad dentro del móvil: arriba una barra de navegación del color de la marca,
   con las pestañas como enlaces de menú (raya bajo la activa). Debajo, cada pestaña es una "página" completa
   (de la barra hasta el final de la pantalla), que aparece con un fundido rápido al cambiar, como al navegar en una web.
   Es un diseño de página completa: recibe el cuerpo de la miniweb (reseña y redes) y decide en qué página va.
   - inicio: portada con una foto grande y, abajo, el nombre en pequeño, el titular, qué hace el negocio (descripcion)
     y un botón que lleva a otra pestaña (botonA); debajo, el cuerpo (con redesArriba,
     solo la reseña: las redes van en una barra fina debajo del menú, en todas las páginas).
   - horario: foto en franja, el horario en tabla y, debajo, la ubicación (mapa con dirección y "Cómo llegar").
   - reservar: formulario de reserva a pantalla completa (nombre, teléfono, personas, día con calendario,
     hora en píldoras, zona y comentario) que abre WhatsApp.
   - menu: el menú del día y la carta por secciones, como en las cartas digitales.
   hero: pestanas[{ tipo, texto, ... }] */

const PAGINAS = {
  inicio: PaginaInicio,
  horario: PaginaHorario,
  reservar: PaginaReservar,
  menu: PaginaMenu,
  // Belleza y tiendas: ofertas y servicios (la misma página que el menú)
  servicios: PaginaMenu,
}

// Pestaña sin página propia
function PaginaVacia() {
  return <div className="h-full" />
}

// Página de cada pestaña: la propia de la miniweb (inicio, horario, reservar, menu) o la común de su tipo
// contactoEn (hero.contactoEn) para las pestañas de reserva, cita y encargos: 'boton' (la pantalla con el botón de WhatsApp), 'reserva' (el
// formulario de restauración) o 'cita' (el de estética). Sin él, la reserva es el formulario de reserva y el resto, el botón.
// 'formulario' es el valor de antes: el formulario de siempre de cada pestaña
const paginaDe = (tipo, portada, contactoEn) => {
  // Con portada elegida, también el Inicio de las miniwebs propias (Chalaquita) es la portada
  if (tipo === 'inicio' && portada) return PaginaPortada
  const modo = contactoEn === 'formulario' ? (tipo === 'reservar' ? 'reserva' : 'cita') : contactoEn
  if (tipo === 'reservar') return modo === 'boton' ? PaginaReservarComoBoton : modo === 'cita' ? PaginaCitaFormulario : PaginaReservar
  if (PAGINAS[tipo]) return PAGINAS[tipo]
  // Pedir cita con el botón de WhatsApp: la pantalla con el texto de lo que hacen y la barra de foto (Encargos y Pedido siguen con la de siempre)
  if (tipo === 'cita' && (!modo || modo === 'boton')) return PaginaCita
  const comun = tipoComun(tipo)
  if (comun === 'fotos') return portada ? PaginaPortada : PaginaVacia
  if (comun === 'horario') return PaginaHorario
  if (comun === 'contacto') return modo === 'cita' ? PaginaCitaFormulario : modo === 'reserva' ? PaginaReservaFormulario : PaginaContacto
  if (comun === 'ubicacion') return PaginaUbicacion
  if (comun === 'precios') return PaginaPrecios
  return PaginaVacia
}

/* Miniweb por piezas: además de sus páginas propias, acepta las pestañas de cualquier ficha.
   hero.portada: el hero de ficha (por piezas) que hace de portada en la pestaña de fotos.
   hero.redesArriba: las redes en una barra debajo del menú (y en la portada, solo la reseña).
   hero.colorRedes: el fondo de esa barra (sin él, el color del texto de la marca).
   hero.barra: otro estilo para el menú de arriba (fichas/barras.jsx); sin él, el de siempre, el de Chalaquita. */
export default function HeroWeb({ hero, nombre, lema, cuerpo, redes, redesTexto }) {
  const pestanas = hero.pestanas ?? []
  const portada = HEROS[hero.portada]?.piezas ? hero.portada : null
  // Fotos para la portada del Inicio de una miniweb propia: solo las de la propia pestaña Inicio (el Horario y la Reserva tienen las suyas).
  // Si Inicio no trae ninguna, todas las que lleva la miniweb repartidas por sus páginas
  const fotosDe0 = lista => [...new Set(lista.flatMap(p => [p.foto, ...fotosDe(p).map(f => f.src)]).filter(Boolean))].map(src => ({ src }))
  const fotosInicio = fotosDe0(pestanas.filter((p, i) => p.tipo === 'inicio' || i === 0))
  const fotosPortada = fotosInicio.length ? fotosInicio : fotosDe0(pestanas)
  // La foto de las páginas sin foto propia: la primera de una pestaña de fotos o, si no hay, la primera de las que lleva la miniweb (la de Inicio)
  const respaldo = fotoDeRespaldo(pestanas) ?? fotosPortada[0]?.src ?? null
  const [activa, setActiva] = useState(0)
  // Vuelta de presentación desactivada en las miniwebs, de momento (el último parámetro): para volver a activarla, quitarlo
  const { parar } = useVueltaPestanas(pestanas, setActiva, null, true)

  const tocar = i => {
    parar()
    setActiva(i)
  }
  // Para los botones que llevan a otra pestaña (el de la portada, a la que diga botonA)
  const irA = tipo => {
    const i = pestanas.findIndex(p => p.tipo === tipo)
    if (i !== -1) tocar(i)
  }

  // El menú, arriba (como siempre) o abajo del todo, como una app (hero.menuEn)
  const menuAbajo = hero.menuEn === 'abajo'
  // Dónde va la barra de redes, según el menú: arriba (bajo el menú, o arriba del todo si el menú está abajo) o abajo (sobre el
  // menú si está abajo y, si no, al final de la página). Los números son el orden de las piezas en la columna
  const redesAbajo = lugarRedes(hero) === 'abajo'
  const ordenRedes = lugarRedes(hero) === 'vinculada' ? 'order-2' : menuAbajo ? (redesAbajo ? 'order-2' : 'order-0') : redesAbajo ? 'order-4' : 'order-2'
  // Colores del menú: su fondo (hero.colores.menuFondo) y el color del subrayado o de la pestaña activa (menuSubrayado); con
  // un fondo claro, las letras pasan a oscuro
  const coloresMenu = hero.colores ?? {}
  const menuClaro = esClaro(coloresMenu.menuFondo)
  // El estilo del menú (hero.barra) solo cambia la forma: el fondo es siempre el del menú (cabecera o el elegido) y las letras se adaptan a él.
  // Con un texto elegido: si es claro, el menú es oscuro (letras claras); si es oscuro, el menú es claro y las letras llevan su color
  const menuSobre = coloresMenu.menuTexto ? (esClaro(coloresMenu.menuTexto) ? 'oscuro' : 'claro') : menuClaro ? 'claro' : 'oscuro'
  const estiloMenu = {
    ...(coloresMenu.menuFondo ? { background: coloresMenu.menuFondo } : {}),
    ...(coloresMenu.menuSubrayado ? { '--demo-accent': coloresMenu.menuSubrayado, '--demo-primary': coloresMenu.menuSubrayado } : {}),
    // El texto del menú (hero.colores.menuTexto): las letras de las pestañas; en los estilos de las fichas, su color de texto
    ...(coloresMenu.menuTexto ? { color: coloresMenu.menuTexto, '--demo-text': coloresMenu.menuTexto } : {}),
  }

  return (
    // Cualquier toque en la página para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* Menú con un estilo de pestañas de las fichas (hero.barra), sobre el fondo de la marca */}
      {hero.barra ? (
        <header style={estiloMenu} className={`${menuAbajo ? 'order-3' : 'order-1'} bg-demo-header ${hero.barra === 'app' ? '' : 'px-[1.25rem] pb-[0.5rem] pt-[0.7rem]'} ${hero.bordes ? 'border-b border-[#D9D9D4]' : ''}`}>
          <BarraPestanas estilo={hero.barra} pestanas={pestanas} activa={activa} tocar={tocar} sobre={menuSobre} colorInactiva={coloresMenu.menuInactivo} />
        </header>
      ) : (
      /* Barra de navegación, como la de una web */
      <header style={estiloMenu} className={`${menuAbajo ? 'order-3' : 'order-1'} bg-demo-header px-[1.25rem] pt-[0.7rem] ${coloresMenu.menuTexto ? '' : menuClaro ? 'text-[#141414]' : 'text-white'} ${hero.bordes ? 'border-b border-[#D9D9D4]' : ''}`}>
        <nav className="flex justify-between">
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              style={i !== activa && coloresMenu.menuInactivo ? { color: coloresMenu.menuInactivo, opacity: 1 } : undefined}
              className={`relative pb-[0.6rem] pt-[0.2rem] text-[0.88rem] font-semibold transition-colors duration-300 ${
                coloresMenu.menuTexto
                  ? i === activa ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                  : i === activa ? (menuClaro ? 'text-[#141414]' : 'text-white') : menuClaro ? 'text-[#141414]/65 hover:text-[#141414]' : 'text-white/65 hover:text-white'
              }`}
            >
              {p.texto}
              <span
                className={`absolute inset-x-0 bottom-0 h-[0.2rem] rounded-t-full bg-demo-accent transition-transform duration-300 ${
                  i === activa ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </nav>
      </header>
      )}

      {/* Redes en una barra debajo del menú (hero.redesArriba), en todas las páginas */}
      <BarraRedes hero={hero} redes={redes} redesTexto={redesTexto} nombre={nombre} className={ordenRedes} />

      {/* Páginas completas: ocupan el resto de la pantalla. Como al navegar en una web, la vieja desaparece
          al instante y la nueva aparece con un fundido rápido, sin cruzarse.
          El mapa del horario se carga desde el principio, para que esté listo cuando la vuelta llegue a él */}
      <div className={`relative min-h-[30rem] flex-1 overflow-hidden ${menuAbajo ? 'order-1' : 'order-3'}`}>
        {pestanas.map((p, i) => {
          const Pagina = paginaDe(p.tipo, portada, hero.contactoEn)
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 ${
                i === activa ? 'opacity-100 transition-opacity duration-[250ms] ease-out' : 'pointer-events-none opacity-0 transition-none'
              }`}
            >
              <Pagina pestana={p.tipo === 'inicio' && portada ? { tipo: 'fotos', texto: p.texto, fotos: fotosPortada } : p} inicio={p} irA={irA} cuerpo={cuerpo} negocio={nombre} lema={lema} cargarMapa portada={portada} heroBase={hero} respaldo={respaldo} redes={redes} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
