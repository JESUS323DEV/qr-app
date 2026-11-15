# Documentación de Mostraq

Mostraq (mostraq.es) vende placas QR que abren una miniweb. Stack: React 19, Vite 6, Tailwind 4, React Router 7 y Supabase. Netlify sirve la rama `main`; el trabajo se hace en `dev`. Piezas: landing, `/admin` (Editor "Nuevo perfil" y generador de QR), `/mi-panel` (alias `/mi-carta`) para el cliente y la miniweb pública.

## Reglas de trabajo

Están en `reglas-de-trabajo.md`. Leerlas antes de tocar nada.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `reglas-de-trabajo.md` | Las reglas de trabajo con Jesús |
| `ideas.md` | Lista de ideas sueltas, una línea cada una, con su estado |
| `plan-panel-miniweb.md` | Plan grande: datos por miniweb y panel del cliente |
| `sesiones/` | Un resumen por día de trabajo |

## Cómo se usa

1. Una idea nueva va primero a `ideas.md`, en una línea.
2. Si crece, pasa a su propio `plan-*.md`.
3. Cada archivo lleva su fecha y su estado arriba.
4. Lo que se hace o se descarta se marca, no se borra.
5. Al terminar el día, se escribe su resumen en `sesiones/`.
