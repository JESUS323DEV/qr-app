# Ideas

Actualizado el 16-11-2026. Estados: idea, en curso, hecha, descartada. Una línea por idea; si crece, va a su `plan-*.md`.

## Panel y datos

- **Panel del cliente por miniweb** (horarios, menú u ofertas desde un solo sitio). Estado: idea. Ver `plan-panel-miniweb.md`.
- **Datos de la carta ligados a la miniweb**, con la carta leyendo de dos fuentes (suelta o dentro de una miniweb). Estado: idea. Ver el plan.
- **Pestaña de datos en el Editor** para que el admin maneje los datos de todos los negocios. Estado: idea.
- **Alta de un cliente con un botón desde `/admin`** (cuenta, dueño, horarios, carta). Estado: idea. Hoy se hace a mano en Supabase, a propósito.
- **Una regla de nombres** para que una carta de una miniweb no tenga un slug distinto. Estado: idea, quizá innecesaria con el plan de datos por miniweb.
- **Login, texto de entrada y recuperación de contraseña** del cliente. Estado: idea, aparcado.

## Refactor y limpieza

- **Partir `src/components/GeneradorQR.jsx`** (2.573 líneas). Estado: idea. Jesús dice que de momento no le preocupa.
- **Partir `LandingPage.jsx`** (1.141 líneas). Estado: no merece la pena de momento (17-11-2026): solo va a recibir alguna imagen y algo de texto. Solo si se rehace su diseño, y con pruebas de montaje antes.
- **`Editor.jsx`** (de /admin, unas 850 líneas): una copia se abre con su información y Editar lleva al Nuevo perfil; la parte de edición con campos, Diseño, tipografía y Guardar solo la alcanza una página que no sea demo ni copia (hoy solo Vanessa). Estado: no se parte; decidir si esa parte se queda o se borra cuando se decida qué hacer con lo de Vanessa (17-11-2026).

## Editor de cartas

- **Quitar del asistente de Menú y ofertas** la parte que rellena platos, para que solo ponga diseño, colores y fotos. Estado: idea.
- **El mockup del Editor** debería enseñar los datos reales de la carta y no los de la temática de ejemplo. Estado: idea.
- **Títulos largos en el diseño Revista** que se salen del cuadro. Estado: idea.
- **Texto de ayuda obsoleto** en el campo de texto extra de Inicio. Estado: idea.
- **Extender la edición táctil** a los otros cuatro estilos de carta y a las ofertas (hoy solo Inmersiva). Estado: idea.

## Producto

- **Linktree propio: un organizador de links con la ficha como base** (idea de Jesús, 17-11-2026, será lo siguiente tras el Editor). Reutilizar o crear fichas (el hero Ficha con pestañas de carpeta y su motor de pestañas, el que usa la página de Vanessa) para hacer una especie de Linktree: botones de enlace y pestañas de contacto, YouTube o Sobre mí, sin horario, reseña ni carta. No es una miniweb de negocio local: es para profesionales como Vanessa, que hoy tiene su página real en `/vanessa` (diseño Ficha, creada para sustituir su Beacons, que no cuenta como parte del Editor). Estado: idea. Por decidir: si lleva su propio producto en el Nuevo perfil y si sigue colgado de `Editor.jsx`.
- **Tarjeta al compartir el enlace de un cliente** (WhatsApp, Instagram), hoy sale la genérica de Mostraq. Estado: idea, pendiente antes del primer cliente.
- **Medir escaneos y pulsaciones** de las páginas de cliente para enseñárselo. Estado: idea.
- **Una red de seguridad visual** (que las pantallas se vean igual tras un refactor). Estado: idea.

## Hecho

- **Panel de admin que ve todas las cartas** en `/mi-panel` (15-11-2026, `be35907`).
- **Temática como etiqueta** y perfil obligatorio en Menú y ofertas (15-11-2026, `ffc4deb`).
- **Paletas de siete colores** en miniweb y cartas (14 y 15-11-2026).
- **Asistente en modo terminar** para miniwebs (14-11-2026).
- **Partir `src/pages/PanelPage.jsx`** (de 1.419 a 191 líneas): los editores de menú, ofertas y horarios, la elección de perfil y la vista previa están en `src/panel/`, con el código idéntico. El editor táctil de Inmersiva, probado en móvil real (16-11-2026).

## Descartado

- **Paleta sugerida por fórmulas** (pestaña Paletas, con "Sugerir con mi principal" y "Paletas al azar"): descartada el 16-11-2026 y sustituida por una librería de paletas hechas a mano (`libreriaPaletas.js`, 43 paletas de 10 familias de color, sin repetir hasta que se acaben). Solo comprobaba que el texto se leyera, no que los colores combinaran, repetía familias de color (el verde salía en el 98 % de las pulsaciones), con un principal apagado dos opciones salían idénticas y los textos sobre la foto de la portada pasaban a oscuros. Los colores se siguen eligiendo a mano en el Editor.
