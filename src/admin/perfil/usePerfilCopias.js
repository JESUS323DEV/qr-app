import { useState } from 'react'

// Las copias y el guardado: copia cargada, avisos, errores, cambios a mano y la pregunta de salir. Cada dato con su función para cambiarlo, tal como los usa NuevoPerfil
export default function usePerfilCopias() {
  // Qué está haciendo al crear (null: nada)
  const [creando, setCreando] = useState(null)
  // El aviso de que el diseño se ha exportado a las muestras
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')
  // La copia que se ha cargado para retocarla ({ tipo, slug }) o null si se está montando una nueva, y si todo Nuevo perfil está abierto
  const [copiaCargada, setCopiaCargada] = useState(null)
  const [huellaBase, setHuellaBase] = useState(null)
  const [versionBase, setVersionBase] = useState(0)
  // Aviso propio (no el del navegador) antes de perder cambios sin guardar
  const [preguntaSalir, setPreguntaSalir] = useState(null)
  // Los cambios hechos a mano en los datos en bruto (ruta → valor) y su versión (para recargar la vista previa, con un pequeño retraso al escribir)
  const [cambiosExtra, setCambiosExtra] = useState({})
  const [versionExtra, setVersionExtra] = useState(0)
  return { creando, setCreando, aviso, setAviso, error, setError, copiaCargada, setCopiaCargada, huellaBase, setHuellaBase, versionBase, setVersionBase, preguntaSalir, setPreguntaSalir, cambiosExtra, setCambiosExtra, versionExtra, setVersionExtra }
}
