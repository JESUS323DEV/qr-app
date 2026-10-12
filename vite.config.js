import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/* Gestión interna (/gestion): solo existe con el servidor de desarrollo (npm run dev).
   Lee y guarda sus datos en gestion/datos.json, que está fuera de git y nunca se publica.
   Cada vez que se guarda, reescribe también gestion/gastos.txt: los gastos en texto, para abrir con el Bloc de notas. */
const ARCHIVO_GESTION = path.resolve('gestion/datos.json')
const ARCHIVO_GASTOS_TXT = path.resolve('gestion/gastos.txt')

const fechaEs = iso => iso.split('-').reverse().join('/')
const eurosTxt = n => `${Number(n).toFixed(2).replace('.', ',')} €`

// Los gastos en texto, en columnas: fecha, concepto e importe, del más reciente al más antiguo, y el total
function gastosEnTexto(gastos = []) {
  const lista = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ancho = Math.max(20, ...lista.map(g => g.concepto.length)) + 3
  const total = lista.reduce((s, g) => s + Number(g.importe), 0)
  const hoy = new Date().toLocaleDateString('es-ES')
  return [
    `GASTOS · actualizado el ${hoy}`,
    '',
    ...lista.map(g => `${fechaEs(g.fecha)}   ${g.concepto.padEnd(ancho)}${eurosTxt(g.importe).padStart(12)}`),
    '',
    `${'TOTAL'.padEnd(13 + ancho)}${eurosTxt(total).padStart(12)}`,
    '',
  ].join('\r\n')
}

function gestionLocal() {
  return {
    name: 'gestion-local',
    // configureServer solo se ejecuta en desarrollo: en el build de Netlify esto no existe
    configureServer(server) {
      server.middlewares.use('/__gestion/datos', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.existsSync(ARCHIVO_GESTION) ? fs.readFileSync(ARCHIVO_GESTION, 'utf8') : 'null')
          return
        }
        if (req.method === 'PUT') {
          let cuerpo = ''
          req.on('data', trozo => { cuerpo += trozo })
          req.on('end', () => {
            try {
              const datos = JSON.parse(cuerpo)
              fs.mkdirSync(path.dirname(ARCHIVO_GESTION), { recursive: true })
              fs.writeFileSync(ARCHIVO_GESTION, JSON.stringify(datos, null, 2))
              fs.writeFileSync(ARCHIVO_GASTOS_TXT, gastosEnTexto(datos.gastos))
              res.statusCode = 204
            } catch {
              res.statusCode = 400
            }
            res.end()
          })
          return
        }
        res.statusCode = 405
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), gestionLocal()],
})
