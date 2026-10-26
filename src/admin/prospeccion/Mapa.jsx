import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* El mapa de Buscar clientes (OpenStreetMap con Leaflet): un círculo que se mueve tocando el mapa y un punto de color por negocio
   (verde sin web, ámbar solo redes, gris con web). Se carga solo en esta pantalla. */

export const COLORES_WEB = { sin: '#16a34a', redes: '#f59e0b', con: '#9ca3af' }

export default function Mapa({ centro, radio, negocios, alElegirCentro }) {
  const caja = useRef(null)
  const mapa = useRef(null)
  const circulo = useRef(null)
  const puntos = useRef(null)
  const alElegir = useRef(alElegirCentro)
  alElegir.current = alElegirCentro

  // El mapa se crea una vez; el centro y el radio de partida son los de la primera vez
  useEffect(() => {
    const m = L.map(caja.current).setView([centro.lat, centro.lon], 15)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m)
    circulo.current = L.circle([centro.lat, centro.lon], { radius: radio, color: '#2563eb', weight: 2, fillOpacity: 0.08 }).addTo(m)
    puntos.current = L.layerGroup().addTo(m)
    m.on('click', e => alElegir.current({ lat: e.latlng.lat, lon: e.latlng.lng }))
    mapa.current = m
    return () => {
      m.remove()
      mapa.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    circulo.current?.setLatLng([centro.lat, centro.lon])
    circulo.current?.setRadius(radio)
  }, [centro, radio])

  // Al llegar resultados, se dibujan y el mapa se ajusta al círculo
  useEffect(() => {
    if (!mapa.current) return
    puntos.current.clearLayers()
    for (const n of negocios ?? []) {
      L.circleMarker([n.lat, n.lon], { radius: 8, color: '#ffffff', weight: 2, fillColor: COLORES_WEB[n.webEstado], fillOpacity: 1 })
        .bindTooltip(n.nombre)
        .addTo(puntos.current)
    }
    if (negocios) mapa.current.fitBounds(circulo.current.getBounds(), { padding: [16, 16] })
  }, [negocios])

  return <div ref={caja} className="z-0 h-[22rem] w-full overflow-hidden rounded-[0.9rem] lg:h-[34rem]" />
}
