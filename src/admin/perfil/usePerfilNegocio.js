import { useState } from 'react'

// Los datos del negocio: nombre, logo, tipografía, colores de la marca y textos. Cada dato con su función para cambiarlo, tal como los usa NuevoPerfil
export default function usePerfilNegocio() {
  const [nombre, setNombre] = useState('')
  // Un nombre solo para ti ("Claudia 1", "Claudia 2"...): sale en las listas y no en la miniweb. Se guarda en la instantánea de la copia
  const [etiqueta, setEtiqueta] = useState('')
  // La frase bajo el nombre de una carta (el lema de la marca): null, la de la plantilla; si se escribe (también vacía, para quitarla), la elegida
  const [lema, setLema] = useState(null)
  // Cómo sale el nombre arriba (fichas y miniwebs): escrito ('texto', lo de siempre) o con su logo ('logo')
  // Si el campo para subir el logo está abierto (el logo se sube junto al nombre; con uno subido, se usa)
  const [logoAbierto, setLogoAbierto] = useState(false)
  const [logo, setLogo] = useState('')
  const [principal, setPrincipal] = useState('')
  const [acento, setAcento] = useState('')
  const [colorTexto, setColorTexto] = useState('')
  const [fondo, setFondo] = useState('')
  const [letra, setLetra] = useState('')
  // Solo en miniwebs: los textos de la portada que se han escrito (titular1, titular2 y descripcion); los que no están, los de la demo
  const [textosMini, setTextosMini] = useState({})
  // El nombre llega a la vista previa medio segundo después de dejar de escribir (si no, se recargaría a cada letra)
  const [nombreVista, setNombreVista] = useState('')
  return { nombre, setNombre, etiqueta, setEtiqueta, lema, setLema, logoAbierto, setLogoAbierto, logo, setLogo, principal, setPrincipal, acento, setAcento, colorTexto, setColorTexto, fondo, setFondo, letra, setLetra, textosMini, setTextosMini, nombreVista, setNombreVista }
}
