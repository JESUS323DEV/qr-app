import { build } from 'esbuild'

/* Comprobación rápida de que toda la web "monta" (npm run comprobar, que además pasa ESLint): empaqueta la aplicación entera en memoria, sin escribir nada ni
   levantar el servidor, y falla si algún import no existe o algún archivo tiene un error de sintaxis. No sustituye a mirar la pantalla: lo que se rompe
   al ejecutar (como usar una variable antes de declararla dentro de un componente) solo aparece al abrir esa pantalla. */
try {
  const resultado = await build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    write: false,
    logLevel: 'silent',
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx', '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.webp': 'dataurl', '.svg': 'dataurl', '.css': 'empty' },
    // Las librerías de fuera no se empaquetan: aquí solo importa que los archivos propios se encuentren entre sí
    external: ['react', 'react/*', 'react-dom', 'react-dom/*', 'react-router-dom', 'lucide-react', '@supabase/supabase-js', 'qr-code-styling', 'qrcode-generator', 'react-colorful'],
  })
  const kb = Math.round(resultado.outputFiles.reduce((s, f) => s + f.contents.length, 0) / 1024)
  console.log(`La web monta bien (${kb} KB empaquetados, solo para comprobar).`)
} catch (e) {
  console.error('La web NO monta:')
  for (const m of e.errors ?? []) console.error(`  ${m.location?.file ?? ''}:${m.location?.line ?? ''} ${m.text}`)
  if (!e.errors?.length) console.error(e)
  process.exit(1)
}
