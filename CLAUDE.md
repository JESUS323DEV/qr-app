# QR miniweb

Proyecto de Jesús (desarrollador autodidacta, marca JesúsDev, Barcelona). Es independiente de `C:\Users\Jesus\Desktop\landig-pages\platform` (su escaparate de webs para negocios locales). Si la idea funciona, tendrá su propio dominio y su propia marca.

## Reglas de trabajo (obligatorias)

- Solo tocar código si el mensaje trae una orden clara ("hazlo", "ponlo", "quita", "cambia", "ok" tras una propuesta). Si es una queja, una duda, una explicación o pregunta "¿me pillas?", responder hablando y no editar nada. "No hagas código" significa solo hablar.
- Hacer solo lo que se pide. No cambiar diseño, tamaños ni elementos que no se han pedido. Si un cambio propio no era pedido, deshacerlo.
- Cuando se trabaja en una demo concreta, los cambios son solo para esa demo, salvo que Jesús diga otra cosa. Todas las demos comparten estructura (hero con pestañas, reseña, redes), pero cada una se muestra distinta.
- No pedir permiso a cada paso ni dar listas de opciones (A, B, C) cuando ya está decidido qué hacer: hacerlo y avisar en una frase. Si hay que recomendar, dar una recomendación.
- No apuntar nada en la memoria ni en archivos de notas que Jesús no haya dictado.
- Todo 100 % responsive y pensado primero para móvil. Usar medidas relativas, no porcentajes de pantalla mezclados con píxeles fijos. Pensar el diseño para móvil bajo (360×640), normal (360×780), alto (440×956), tableta y escritorio.
- No hacer capturas de pantalla ni comprobaciones visuales por cuenta propia: gastan muchos tokens y Jesús es quien confirma el diseño. Solo hacerlas cuando él lo pida.
- Diseño que no parezca hecho por una IA: nada de badges o etiquetas en mayúsculas con letra espaciada, titulares partidos en dos colores, tarjetas con icono ni frases de relleno típicas del sector.
- Copy en español correcto (tildes, eñes, ¿ y ¡) y sin guiones largos (—).
- No ejecutar `vite build` ni compilar salvo que lo pida. Jesús tiene el servidor de desarrollo abierto y ve los errores en el navegador; no cerrarlo.
- Git: de momento se trabaja en `main`. Se pasa a `dev` cuando Jesús lo pida o para cambios gordos. Commit y push solo cuando lo pida, en español y sin marcas de IA (sin Co-Authored-By).

## La idea de negocio

- Vender a negocios locales (peluquerías, barberías, estética, uñas, cafeterías, panaderías, tiendas de barrio) un **QR físico con buen acabado** (placa de mostrador, pegatina de escaparate o similar, aún por decidir) que abre una **miniweb con la marca del negocio**: un hero que impresiona y botones a lo que el negocio quiera.
- Muchos negocios no quieren ni necesitan una web completa: al buscar su nombre ya sale su Instagram. Esto es más barato, más rápido y más fácil de vender que una web entera.
- No se vende "un QR con enlaces" (eso es gratis con Linktree). Se vende el resultado: que los clientes que ya entran en el local **dejen reseña en Google, sigan en redes, escriban por WhatsApp y vuelvan**. Más el diseño de su marca, el acabado físico y que Jesús lo monta y lo cambia.
- Botones previstos: reseña en Google, WhatsApp (con una pantalla aparte con formulario que abre WhatsApp), redes sociales, reservar o pedir cita (Reservaq, app propia de Jesús), ver la carta, cómo llegar, horario, wifi y "ver la web completa".
- El QR apuntará a una dirección propia (no al contenido), para actualizar horario, carta o redes sin reimprimir.
- Idea de medir escaneos y pulsaciones de botones para enseñarle al cliente que funciona.
- Es el primer escalón: QR y miniweb ahora; si el negocio quiere más, la web completa en JesúsDev (gamas Base y A medida).
- Antes de invertir en placas: validar enseñando una miniweb de ejemplo en el móvil o con un QR impreso en papel a 5 o 10 negocios.

## El producto

- Lo que se vende: **placa con QR físico para la tienda + linktree con miniweb y las secciones sencillas que quiera el negocio**.
- Estructura de la miniweb, todo en una pantalla de móvil: hero con pestañas (fotos, ubicación, horario y reservar/cita/comanda) y debajo la card de reseña de Google y la de redes.
- De cara afuera (landing, catálogo, flechas entre demos) las demos se clasifican por **temática de negocio** (Comida, Belleza, Salud, Tiendas), que lleva cada negocio en su archivo (`tematica`), junto a su `sector` (Pollería, Estudio de uñas...).
- Los diseños de hero tienen nombre interno (`src/heros/index.js`): Editorial, Banner, Diagonal, Fullbleed, Mosaico, Portada, Retrato, Ficha, Galería, Polaroid e Historias (todos por piezas, con las barras de `src/fichas/barras.jsx`). Es vocabulario solo para trabajar; no se muestra al cliente. Cualquier negocio puede usar cualquier diseño.
- Direcciones: un solo dominio. Los clientes van en la raíz (`dominio/slug`, la dirección corta del QR) y las demos en `/demo/slug` (las que llevan `demo: true`). El slug de un cliente no se cambia nunca una vez impreso el QR. `tematicas` y `demo` son palabras reservadas.
- Vocabulario: "el cuerpo de la miniweb" es la parte de debajo del hero (la card de reseña de Google y la de redes).
- Los botones los configura Jesús en el archivo del negocio. El negocio no edita nada por ahora.
- Precio fijo de momento, sin cuota. Los arreglos posteriores (cualquier cambio, cambios de diseño, etc.) se cobran aparte.
- Dos planes:
  - **Base**: heros reutilizables, como en `platform`, que se adaptan a los colores y la marca del negocio.
  - **Personalizado**: hero y diseño trabajados a medida para el negocio.
- Dominio y alojamiento: de momento corren a cargo de Jesús.

## Stack y enfoque técnico

- React 19, Vite 6, Tailwind CSS 4, React Router 7, lucide-react. Sin backend de momento.
- Como en `platform`: cada negocio será un archivo de configuración (colores, tipografías, fotos, textos, botones y enlaces) y la miniweb se pinta sola a partir de él.
- Se puede reutilizar de `platform/src`: heros (`sections/hero/`), iconos de redes (`components/SocialIcons.jsx`), imagen con respaldo si falla (`components/Img.jsx`), formulario de contacto (`sections/ContactSection.jsx`) y el sistema de tema por variables CSS (`lib/applyTheme.js`, `styles/main.css`).
- Fotos de Pexels (Unsplash bloquea las búsquedas). Datos de ejemplo inventados y genéricos.

## Features pendientes

- **MUY IMPORTANTE. Asistente con IA para crear y editar fichas y miniwebs (herramienta para Jesús, no para el cliente)**: un chat al que se le dice, por ejemplo, "hazme una ficha para una peluquería en Gràcia que se llama Ranita, colores rosa palo y negro, cita por WhatsApp" y la monta; y después se le piden cambios ("horario hasta las 20", "pásala al diseño Diagonal", "más oscuro") con vista previa en directo. La IA **no escribe código ni diseña desde cero**: solo elige entre los diseños, botones y piezas que ya existen y rellena los datos del negocio (colores sacados de su marca, tipografías, textos, pestañas, botones), siguiendo las reglas de diseño y de copy de este archivo. Así el resultado siempre tiene la calidad y el criterio de Jesús, no el aspecto de "web hecha con IA". Pasos: 1) que las fichas y miniwebs vivan en Supabase (como el menú del día) y se puedan editar sin tocar código; 2) el asistente, con un formato de datos fijo que la IA solo puede rellenar; 3) vista previa en directo mientras se chatea. Coste: céntimos por ficha. Objetivo: montar un cliente nuevo en diez minutos en lugar de una o dos horas. Abrirlo al cliente, solo si algún día tiene sentido y en versión limitada.

- **Ampliar las piezas**: hecho lo de mezclar (los 11 diseños de arriba van por piezas: aceptan las pestañas comunes, fotos, horario, contacto, ubicación y precios, y cualquiera de las 9 barras; 99 combinaciones). Siguiente: más diseños de arriba, más barras y más tipos de pestaña comunes, para tener aún más variedad. Jesús valida las combinaciones.

- **Asistente dentro del "Nuevo perfil" de /admin**: un cuadro de texto arriba ("peluquería en Gràcia, rosa palo y negro...") y un botón que rellena los selectores (temática, producto, diseño, colores y tipografía); Jesús lo ve en la vista previa y retoca antes de crear. Al crear, el asistente escribe los textos y busca las fotos con los datos reales. Así queda una sola herramienta en vez de dos.

- **SIGUIENTE PASO. Editor de QR para el cliente, con PIN** (en marcha, para dejarlo listo antes del primer cliente): el generador de /admin para que el cliente elija su QR, con una IA que usa todos los ajustes del generador (colores, degradados, formas de puntos y esquinas, placa, tipografía, tamaño y textos; las redes solo con los datos que dé el cliente, nunca inventadas). El generador de /admin se queda como está, con su IA de colores. Jesús crea la sesión en /admin (elige el negocio) y se genera un enlace (`/mi-qr/slug`) y un PIN de 4 a 6 cifras que le pasa al cliente. Sin PIN, el enlace solo enseña su QR; con el PIN se desbloquea el editor: algunos estilos predeterminados (no todos), un editor mínimo (forma y color de los puntos, color y texto del marco) y el chat de IA con 2 intentos (6 propuestas). El PIN (guardado cifrado) y los intentos se comprueban en el servidor (Supabase), no en la página; 5 fallos de PIN bloquean un rato y sigue el límite diario del asistente. Al terminar, "Enviar mi diseño" le llega a Jesús, que lo revisa, lo prueba e imprime. Jesús cierra la sesión desde /admin (o caduca sola, por ejemplo a los 7 días) y el enlace vuelve a ser solo de vista. Necesita una tabla nueva en Supabase, una función para el PIN y la página del cliente.
- **Generador de QR**: pantalla interna para generar el QR de cada negocio con sus colores (librería `qr-code-styling`): forma de los puntos, ojos, inicial o logo en el centro y marco con texto, descargable en alta calidad para imprenta.
- **Semántica de las pestañas** (landing y miniwebs): pintar todas las pestañas en el HTML y ocultar solo las inactivas, con roles accesibles (`tablist`, `tab`, `tabpanel`). Ahora solo existe en el HTML la pestaña abierta, así que Google no ve las demás y los lectores de pantalla no entienden la estructura.
- **Prerenderizar** la landing y las miniwebs (HTML ya pintado al publicar): mejor SEO y vista previa con título e imagen al compartir el enlace por WhatsApp o Instagram.
- **Secciones ocultas de la landing**: decidir si se quitan o se quedan solo como contenido para buscadores (ahora están en el HTML pero no se pueden ver por el bloqueo de scroll).
- **Páginas legales**: Política de privacidad y Aviso legal (enlazadas desde el menú; ahora sus enlaces no llevan a ningún sitio).
- **Botón de compartir**: abre el menú de compartir del móvil (WhatsApp, Instagram...) con el enlace de la página; en ordenador, copia el enlace.
- **Perfiles de negocio para las cartas (cartas de ofertas)**: que las cartas y el panel no sirvan solo para restaurantes. Cada carta tendrá un perfil (restaurante, belleza, etc.) y, según el que se elija, el panel enseña un editor y la carta (UI) otra forma del bloque destacado. Restaurante: menú del día (grupos de platos y precio único). Belleza, uñas, etc.: ofertas (cada una con su precio y el precio anterior tachado), con vigencia por fechas además del horario. Los textos (pestaña, panel) se adaptan al perfil. No hacen falta diseños nuevos: los de carta actuales (base, inmersiva, historias) sirven, solo cambia ese bloque.
- **Vuelta automática de pestañas solo la primera vez en las páginas de clientes**: en la landing ya se ve una sola vez por navegador (se recuerda en localStorage). Cuando una demo pase a ser la página de un cliente real, su vuelta también debe verse solo la primera vez (tercer parámetro `recordar` de `useVueltaPestanas`, con una clave por negocio). Las demos del catálogo la siguen haciendo siempre.

## Estado

- Landing del producto (`src/pages/LandingPage.jsx`, textos en `src/landing/contenido.js`): es una miniweb de una pantalla, sin scroll vertical. Fondo oscuro, Archivo + Inter y acento amarillo. Pestañas: Inicio (fila de móviles con capturas de las demos), Tu QR (placa con colores de redes), Web completa, Cómo funciona (pasos + ventajas) y Contacto (formulario que abre WhatsApp). Menú hamburguesa que hace de pie de página. Las secciones de debajo siguen en el código pero no se ven. Nombre "Mostrador", WhatsApp y redes provisionales; sin precios (presupuesto a medida).
- Demos hechas: Almendra (Editorial), El Pollastre d'Horta (Banner, en catalán, para un negocio real), LadySalon (Diagonal), Laca (Fullbleed), Dulce Lima (Mosaico), Navaja & Tijera (Portada) y Marta Soler (Retrato, psicóloga, datos inventados).
- Página real de Vanessa (`/vanessa`, diseño Ficha): prima de Jesús, psicóloga, para sustituir su Beacons. Con su branding y sus datos reales; no sale en el catálogo. Completa: pestañas Consulta, YouTube (captura del canal con "Suscribirse") y Sobre mí; galería de sus vídeos; Instagram y YouTube arriba; contacto y "Ver más" a su web (vanessa-psicopedagoga.netlify.app).
