// Aviso de archivos largos: al terminar cada respuesta de Claude, mira src y avisa si algún archivo pasa del límite de líneas.
// El límite es 2600 (se puede probar con LIMITE_LINEAS=2000). Si no pasa ninguno, no dice nada.
const fs = require('fs')
const path = require('path')

const LIMITE = Number(process.env.LIMITE_LINEAS) || 2600
const raiz = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), 'src')

const largos = []
const recorrer = carpeta => {
  for (const e of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = path.join(carpeta, e.name)
    if (e.isDirectory()) recorrer(ruta)
    else if (/\.(jsx?|css)$/.test(e.name)) {
      const lineas = (fs.readFileSync(ruta, 'utf8').match(/\n/g) || []).length
      if (lineas > LIMITE) largos.push({ ruta: path.relative(path.dirname(raiz), ruta).split(path.sep).join('/'), lineas })
    }
  }
}
if (fs.existsSync(raiz)) recorrer(raiz)

if (largos.length) {
  const lista = largos.sort((a, b) => b.lineas - a.lineas).map(f => `${f.ruta} (${f.lineas} líneas)`).join(', ')
  console.log(JSON.stringify({ systemMessage: `Aviso: pasan de ${LIMITE} líneas: ${lista}. Conviene partirlos.` }))
}
