# Ideas

Actualizado el 15-11-2026. Estados: idea, en curso, hecha, descartada. Una línea por idea; si crece, va a su `plan-*.md`.

## Panel y datos

- **Panel del cliente por miniweb** (horarios, menú u ofertas desde un solo sitio). Estado: idea. Ver `plan-panel-miniweb.md`.
- **Datos de la carta ligados a la miniweb**, con la carta leyendo de dos fuentes (suelta o dentro de una miniweb). Estado: idea. Ver el plan.
- **Pestaña de datos en el Editor** para que el admin maneje los datos de todos los negocios. Estado: idea.
- **Alta de un cliente con un botón desde `/admin`** (cuenta, dueño, horarios, carta). Estado: idea. Hoy se hace a mano en Supabase, a propósito.
- **Una regla de nombres** para que una carta de una miniweb no tenga un slug distinto. Estado: idea, quizá innecesaria con el plan de datos por miniweb.
- **Login, texto de entrada y recuperación de contraseña** del cliente. Estado: idea, aparcado.

## Refactor y limpieza

- **Partir `src/pages/PanelPage.jsx`** (1.419 líneas) en editores propios. Estado: idea, primer paso del plan. Extraer el editor táctil de Inmersiva tal cual en lo que hace.
- **Partir `src/components/GeneradorQR.jsx`** (2.573 líneas). Estado: idea. Jesús dice que de momento no le preocupa.
- **Partir `LandingPage.jsx` y `HeroWeb.jsx`**. Estado: idea.

## Editor de cartas

- **Quitar del asistente de Menú y ofertas** la parte que rellena platos, para que solo ponga diseño, colores y fotos. Estado: idea.
- **El mockup del Editor** debería enseñar los datos reales de la carta y no los de la temática de ejemplo. Estado: idea.
- **Títulos largos en el diseño Revista** que se salen del cuadro. Estado: idea.
- **Texto de ayuda obsoleto** en el campo de texto extra de Inicio. Estado: idea.
- **Extender la edición táctil** a los otros cuatro estilos de carta y a las ofertas (hoy solo Inmersiva). Estado: idea.

## Producto

- **Tarjeta al compartir el enlace de un cliente** (WhatsApp, Instagram), hoy sale la genérica de Mostraq. Estado: idea, pendiente antes del primer cliente.
- **Medir escaneos y pulsaciones** de las páginas de cliente para enseñárselo. Estado: idea.
- **Una red de seguridad visual** (que las pantallas se vean igual tras un refactor). Estado: idea.

## Hecho

- **Panel de admin que ve todas las cartas** en `/mi-panel` (15-11-2026, `be35907`).
- **Temática como etiqueta** y perfil obligatorio en Menú y ofertas (15-11-2026, `ffc4deb`).
- **Paletas de siete colores** en miniweb y cartas (14 y 15-11-2026).
- **Asistente en modo terminar** para miniwebs (14-11-2026).
