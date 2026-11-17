import { useContext } from 'react'
import { SocialIcon, SocialIconMarca } from '../../components/SocialIcons'
import BotonCompartir from '../../components/BotonCompartir'
import { tonoDistinto } from '../../lib/colorMath'
import { ColoresMiniweb } from '../../components/ColoresPortada'

// Si un color (#RRGGBB) es claro, para poner encima letras oscuras (luminancia percibida); sin color, no
export const esClaro = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

// Dónde van las redes (hero.redesEn): 'arriba' (la barra, de siempre), 'lateral' (una columna al lado de la portada), 'medio'
// (una barra entre la portada y la reseña) o 'abajo' (la barra al final). Los valores viejos, 'barra' y 'boton', son 'arriba' y 'medio'
// Con hero.redesVinculadas, la barra va siempre pegada al menú de navegación ('vinculada'): debajo de él si está arriba y
// encima de él si está abajo, sea cual sea el sitio elegido
export const lugarRedes = hero => (hero.redesVinculadas ? 'vinculada' : ({ barra: 'arriba', boton: 'medio' })[hero.redesEn] ?? hero.redesEn ?? 'arriba')

// Los colores de la barra de redes: el fondo elegido (hero.colores.redesFondo o el antiguo hero.colorRedes) o, sin él, un tono distinto del de la barra del
// menú (el elegido o el de la cabecera): la barra de redes nunca es igual que el menú de navegación. Los iconos, el elegido (hero.colores.redesIconos) o
// blanco u oscuro solos según ese fondo. cabecera: el color de la cabecera de la marca (theme.colors.header o, sin él, el principal)
export function coloresRedes(hero, cabecera) {
  const elegido = hero.colores?.redesFondo ?? hero.colorRedes ?? null
  const menu = hero.colores?.menuFondo ?? cabecera
  const fondo = elegido ?? (menu ? tonoDistinto(menu) : null)
  const clara = esClaro(fondo)
  const iconos = hero.colores?.redesIconos ?? (clara ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)')
  return { fondo, clara, iconos }
}

// La barra de redes, debajo del menú: hero.redesArriba
export function BarraRedes({ hero, redes, redesTexto, nombre, className = '' }) {
  // Con las redes en lateral o en medio, no hay barra aquí (la pintan la portada)
  const { cabecera } = useContext(ColoresMiniweb)
  if (!hero.redesArriba || !redes?.length || ['lateral', 'medio'].includes(lugarRedes(hero))) return null
  const { fondo, clara, iconos } = coloresRedes(hero, cabecera)
  return (
    <div
      className={`flex items-center justify-between gap-[1rem] px-[1.25rem] py-[0.45rem] ${fondo ? '' : 'bg-demo-header'} ${clara ? 'text-[#141414]' : 'text-white'} ${hero.bordes ? 'border-b border-[#D9D9D4]' : ''} ${className}`}
      style={fondo ? { background: fondo } : undefined}
    >
      <p style={hero.colores?.redesTexto ? { color: hero.colores.redesTexto } : undefined} className={`text-[0.78rem] ${hero.bordes ? 'text-[#9A9A94]' : clara ? 'text-[#141414]/75' : 'text-white/75'}`}>{redesTexto ?? 'Síguenos en redes'}</p>
      <div className="flex items-center gap-[0.9rem]" style={{ color: iconos }}>
        {redes.map(r => (
          <a key={r.platform} href={r.href} target="_blank" rel="noreferrer" aria-label={r.platform} className="transition-opacity hover:opacity-75">
            {hero.redesColores === 'originales' ? <SocialIconMarca platform={r.platform} className="h-[1.05rem] w-[1.05rem]" /> : <SocialIcon platform={r.platform} className="h-[1.05rem] w-[1.05rem]" />}
          </a>
        ))}
        {/* Compartir 'en las redes': un icono más al final */}
        {hero.compartirEn === 'redes' && <BotonCompartir titulo={nombre} soloIcono alLado />}
      </div>
    </div>
  )
}
