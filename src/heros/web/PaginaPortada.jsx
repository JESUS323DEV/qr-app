import { useContext } from 'react'
import { SocialIcon, SocialIconMarca } from '../../components/SocialIcons'
import BotonCompartir, { LugarCompartir } from '../../components/BotonCompartir'
import { HEROS } from '../index'
import HeroRetratoWeb from '../HeroRetratoWeb'
import { ColoresMiniweb } from '../../components/ColoresPortada'
import { lugarRedes, coloresRedes } from './redes'

/* ---------- Páginas para las pestañas de las fichas (miniweb por piezas) ----------
   Con ellas, cualquier ficha se ve como miniweb: cada pestaña común (fotos, horario, contacto, ubicación,
   precios) es una página completa. La de fotos es la portada: el hero de una familia por piezas (hero.portada),
   sin su barra, con el cuerpo (reseña y redes) debajo. */

// Portada: el hero de ficha elegido (hero.portada), solo con sus fotos, y el cuerpo debajo
// Dónde van las redes y compartir (hero.redesEn: 'barra' | 'lateral' | 'boton'; hero.compartirEn: 'diseno' | 'abajo'):
// en columna al lado de la portada, o en una fila justo debajo de ella (con compartir)
export function PaginaPortada({ pestana, cuerpo, negocio, lema, portada, heroBase, inicio, irA, redes }) {
  // Retrato tiene su versión para miniwebs (con los textos del Inicio y siempre tres fotos); el de fichas no se toca
  const Portada = portada === 'retrato' ? HeroRetratoWeb : HEROS[portada]?.Componente
  const redesEn = lugarRedes(heroBase)
  // Compartir abajo: al lado del botón de la portada (cada diseño lo pone ahí); el suyo de siempre no se pinta
  const lugarCompartir = heroBase.compartirEn === 'abajo' ? 'boton' : heroBase.compartirEn === 'redes' ? 'redes' : 'diseno'
  const compartirEnRedes = heroBase.compartirEn === 'redes'
  const hayRedes = redes?.length > 0
  // Con las redes bajo el botón, la fila es una barra con el color de la barra de redes (hero.colorRedes o, sin él, el del
  // texto), con los iconos en blanco u oscuro según ese color, como la barra de arriba
  const conBarra = redesEn === 'medio' && hayRedes
  const { cabecera } = useContext(ColoresMiniweb)
  const { fondo: fondoRedes, iconos: colorIconos } = coloresRedes(heroBase, cabecera)
  // El fondo de toda la portada (hero.colores.fondoPortada; el antiguo fondoInicio): en Polaroid pinta todo, en Galería y
  // Mosaico el fondo de alrededor, y en Editorial y Diagonal el bloque del texto, porque la foto tapa el resto
  const fondoPortada = heroBase.colores?.fondoPortada ?? heroBase.fondoInicio
  const iconos = (clase, color) =>
    redes.map(r => (
      <a key={r.platform} href={r.href} target="_blank" rel="noreferrer" aria-label={r.platform} className="transition-opacity hover:opacity-75" style={{ color }}>
        {heroBase.redesColores === 'originales' ? <SocialIconMarca platform={r.platform} className={clase} /> : <SocialIcon platform={r.platform} className={clase} />}
      </a>
    ))
  return (
    <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none]">
      <div className="relative flex min-h-[22rem] flex-1 flex-col" style={fondoPortada ? { background: fondoPortada, '--demo-header': fondoPortada } : undefined}>
        <LugarCompartir.Provider value={lugarCompartir}>
          {/* El lema no se pinta en las portadas de una miniweb (así, con logo, el nombre se adapta a todo el sitio); solo Retrato lo usa, si no hay titular */}
          {Portada && <Portada hero={{ ...heroBase, diseno: portada, pestanas: [pestana] }} nombre={negocio} lema={portada === 'retrato' ? lema : undefined} inicio={inicio} irA={irA} sinBarra />}
        </LugarCompartir.Provider>
        {/* Redes en lateral: una columna de iconos pegada al lado derecho de la portada */}
        {redesEn === 'lateral' && hayRedes && (
          <div className="absolute right-[0.5rem] top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-[0.75rem] rounded-full bg-black/45 px-[0.5rem] py-[0.8rem] backdrop-blur-sm">
            {iconos('h-[1.05rem] w-[1.05rem]', heroBase.colores?.redesIconos ?? '#FFFFFF')}
            {compartirEnRedes && <BotonCompartir titulo={negocio} soloIcono alLado className="text-white" />}
          </div>
        )}
      </div>
      {/* Debajo de la portada: las redes en fila (bajo el botón), como una barra */}
      {conBarra && (
        <div
          className={`flex items-center justify-center gap-[1rem] px-[1.25rem] py-[0.55rem] ${fondoRedes ? '' : 'bg-demo-header'}`}
          style={fondoRedes ? { background: fondoRedes } : undefined}
        >
          <div className="flex items-center gap-[0.9rem]" style={{ color: colorIconos }}>
            {iconos('h-[1.1rem] w-[1.1rem]', colorIconos)}
            {compartirEnRedes && <BotonCompartir titulo={negocio} soloIcono alLado />}
          </div>
        </div>
      )}
      {cuerpo}
    </div>
  )
}
