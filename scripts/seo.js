/* SEO al publicar: se lanza después de "vite build" (npm run build) y prepara dist/ para Google.
   - robots.txt: fuera de Google lo interno (/admin, /mi-carta, /gestion...) y las demos (son ejemplos inventados).
   - sitemap.xml: la landing y las páginas de clientes reales (los archivos de src/negocios y src/cartas sin demo: true).
   - La landing (/) con su dirección canónica, su tarjeta para compartir y sus datos de negocio para Google.
     El resto de páginas se sirven desde app.html (el mismo HTML, sin eso), para que ninguna diga ser la landing.
   El dominio es mostraq.es, siempre (no el de Netlify, que cambiaría el sitemap y las direcciones al publicar desde otra dirección).
   Para probar con otro, la variable DOMINIO. La dirección canónica y og:url ya vienen en index.html y las pone cada ruta en App.jsx. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const DIST = 'dist'
const dominio = (process.env.DOMINIO || 'https://mostraq.es').replace(/\/+$/, '')

// Rutas que Google no tiene que ver: lo interno y las demos
const PRIVADAS = ['/admin', '/mi-carta', '/panel', '/gestion', '/disenos', '/miniweb', '/demo/', '/mi-qr/']

// Páginas de clientes reales: se leen los archivos como texto (importarlos no vale fuera de Vite: llevan fotos)
function clientes(carpeta, sufijo = '') {
  return readdirSync(carpeta)
    .filter(f => f.endsWith('.js') && f !== 'index.js')
    .map(f => readFileSync(`${carpeta}/${f}`, 'utf8'))
    .filter(texto => !/\bdemo:\s*true\b/.test(texto))
    .map(texto => texto.match(/\bslug:\s*['"]([^'"]+)['"]/)?.[1])
    .filter(Boolean)
    .map(slug => `/${slug}${sufijo}`)
}
const paginas = ['/', ...clientes('src/negocios'), ...clientes('src/cartas', '/carta')]

writeFileSync(
  `${DIST}/robots.txt`,
  `User-agent: *\n${PRIVADAS.map(r => `Disallow: ${r}`).join('\n')}\n\nSitemap: ${dominio}/sitemap.xml\n`,
)

const hoy = new Date().toISOString().slice(0, 10)
writeFileSync(
  `${DIST}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paginas
    .map(p => `  <url><loc>${dominio}${p === '/' ? '/' : p}</loc><lastmod>${hoy}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)

// Las demás páginas (clientes, demos, panel...) usan app.html; la landing, index.html con lo suyo
const html = readFileSync(`${DIST}/index.html`, 'utf8')
writeFileSync(`${DIST}/app.html`, html)
writeFileSync(`${DIST}/_redirects`, '/*  /app.html  200\n')

const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Mostraq'
const descripcion = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
const datos = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Mostraq',
  url: `${dominio}/`,
  description: descripcion,
  areaServed: { '@type': 'City', name: 'Barcelona' },
  address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
}
const extra = [
  `<script type="application/ld+json">${JSON.stringify(datos)}</script>`,
].join('\n    ')
writeFileSync(`${DIST}/index.html`, html.replace('</head>', `    ${extra}\n  </head>`))

console.log(`SEO listo para ${dominio}: ${paginas.length} páginas en el sitemap (${paginas.join(', ')}). Título: ${titulo}`)
