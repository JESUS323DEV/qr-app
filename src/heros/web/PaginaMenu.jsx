import { useState } from 'react'
import { ALERGENOS, getCarta, rutaCarta } from '../../cartas'
import Ofertas from '../../components/carta/Ofertas'
import { tipoMenuDe } from '../../lib/tipoMenu'

// Pestañas de texto con raya debajo de la activa (las de Menú: Menú del día / Carta, y las secciones de la carta)
function Subpestana({ activa, onClick, children, pequena = false }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`relative shrink-0 pb-[0.45rem] font-semibold transition-colors ${pequena ? 'text-[0.85rem]' : 'text-[0.95rem]'} ${
        activa ? 'text-demo-text' : 'text-demo-muted hover:text-demo-text'
      }`}
    >
      {children}
      <span className={`absolute inset-x-0 bottom-0 h-[0.15rem] rounded-full bg-demo-primary transition-transform duration-300 ${activa ? 'scale-x-100' : 'scale-x-0'}`} />
    </button>
  )
}

function MenuDelDia({ menu }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-[1rem]">
        <div>
          <h2 className="font-demo-heading text-[1.6rem] font-extrabold leading-none">{menu.titulo}</h2>
          <p className="mt-[0.3rem] text-[0.82rem] text-demo-muted">{menu.cuando}</p>
        </div>
        <p className="shrink-0 font-demo-heading text-[1.6rem] font-extrabold leading-none text-demo-primary">{menu.precio}</p>
      </div>
      <div className="mt-[0.9rem] grid gap-[0.8rem]">
        {menu.grupos.map(g => (
          <div key={g.nombre} className="border-t border-dashed border-demo-text/20 pt-[0.6rem]">
            <p className="text-[0.78rem] font-semibold text-demo-muted">{g.nombre}</p>
            <ul className="mt-[0.25rem] text-[0.95rem] leading-[1.45]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-[0.9rem] border-t border-dashed border-demo-text/20 pt-[0.6rem] text-[0.82rem] text-demo-muted">Incluye: {menu.incluye}</p>
    </div>
  )
}

function SeccionCarta({ seccion }) {
  return (
    <ul>
      {seccion.platos.map(p => (
        <li key={p.nombre} className="border-b border-demo-text/10 py-[0.75rem] first:pt-0">
          <div className="flex items-baseline justify-between gap-[1rem]">
            <p className="font-semibold">{p.nombre}</p>
            <p className="shrink-0 font-semibold text-demo-primary">{p.precio}</p>
          </div>
          {p.descripcion && <p className="mt-[0.15rem] text-[0.85rem] leading-[1.45] text-demo-muted">{p.descripcion}</p>}
          {/* Alérgenos en texto, sin etiquetas */}
          {p.alergenos?.length > 0 && (
            <p className="mt-[0.2rem] text-[0.72rem] text-demo-muted/80">
              Alérgenos: {p.alergenos.map(a => ALERGENOS[a]?.nombre.toLowerCase()).join(', ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

/* Menú: el menú del día y la carta, como en las cartas digitales. Arriba dos pestañas (Menú del día / Carta);
   en la carta, una fila con sus secciones. El contenido se desliza dentro de la página si no cabe.
   pestana: menuDia { texto, titulo, cuando, precio, incluye, grupos }, secciones[{ nombre, platos }] */
/* También vale para belleza y tiendas (pestaña servicios): en vez del menú del día, las ofertas (con sus
   polaroids, si traen fotos), y la carta se llama Servicios.
   pestana: ofertas { texto, titulo, cuando, fotos, lista }, secciones, textoCarta? */
function PaginaMenuPropia({ pestana }) {
  const ofertas = pestana.ofertas
  // Qué enseña: el menú del día y la carta (lo de siempre) o las ofertas y los servicios (menuTipo de la pestaña, que se elige en el Editor)
  const conOfertas = tipoMenuDe(pestana) === 'ofertas'
  const destacado = conOfertas ? ofertas : pestana.menuDia
  const [vista, setVista] = useState(destacado ? 'menu' : 'carta')
  const [seccionActiva, setSeccionActiva] = useState(pestana.secciones?.[0]?.nombre)
  const seccion = pestana.secciones?.find(s => s.nombre === seccionActiva)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-demo-text/10 px-[1.25rem] pt-[0.9rem]">
        <div className="flex gap-[1.4rem]">
          {destacado && <Subpestana activa={vista === 'menu'} onClick={() => setVista('menu')}>{destacado.texto ?? 'Ofertas'}</Subpestana>}
          {pestana.secciones?.length > 0 && (
            <Subpestana activa={vista === 'carta'} onClick={() => setVista('carta')}>
              {pestana.textoCarta ?? (conOfertas ? 'Servicios' : 'Carta')}
            </Subpestana>
          )}
        </div>
      </div>

      {vista === 'carta' && (
        <div className="-mb-px flex gap-[1.1rem] overflow-x-auto border-b border-demo-text/10 px-[1.25rem] pt-[0.7rem] [scrollbar-width:none]">
          {pestana.secciones.map(s => (
            <Subpestana key={s.nombre} pequena activa={seccionActiva === s.nombre} onClick={() => setSeccionActiva(s.nombre)}>
              {s.nombre}
            </Subpestana>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-[1.25rem] pb-[1.25rem] pt-[1rem]">
        {vista === 'menu' && !conOfertas && pestana.menuDia && <MenuDelDia menu={pestana.menuDia} />}
        {vista === 'menu' && conOfertas && (
          <Ofertas estilo="polaroid" papelitos={false} menu={{ titulo: ofertas.titulo ?? 'Ofertas', cuando: ofertas.cuando, fotos: ofertas.fotos, ofertas: ofertas.lista ?? [] }} />
        )}
        {vista === 'carta' && seccion && <SeccionCarta seccion={seccion} />}
      </div>
    </div>
  )
}

/* La carta de verdad (hero.carta: el nombre de una de las cartas de src/cartas) dentro de la página del menú, con su diseño y su
   contenido. Es la misma página que se abre con /slug/carta: lo que se edite en su panel se ve aquí. La carta de muestra, la de
   una demo (/demo/slug/carta); la de un cliente, la suya (/slug/carta). Sin carta elegida, el menú propio de la miniweb */
function CartaIncrustada({ slug }) {
  const carta = getCarta(slug)
  const ruta = carta ? rutaCarta(carta) : `/${slug}/carta`
  return <iframe src={`${ruta}?incrustada=1`} title="Carta" className="h-full w-full border-0 bg-demo-bg" />
}

export function PaginaMenu(props) {
  return props.heroBase?.carta ? <CartaIncrustada slug={props.heroBase.carta} /> : <PaginaMenuPropia {...props} />
}
