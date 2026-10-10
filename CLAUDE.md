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
- De cara afuera (landing, catálogo, flechas entre demos) las demos se clasifican por **temática de negocio** (Comida, Belleza, Tiendas), que lleva cada negocio en su archivo (`tematica`), junto a su `sector` (Pollería, Estudio de uñas...).
- Los diseños de hero tienen nombre interno (`src/heros/index.js`): Editorial, Banner, Diagonal, Fullbleed, Mosaico y Portada. Es vocabulario solo para trabajar; no se muestra al cliente. Cualquier negocio puede usar cualquier diseño.
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

## Estado

- Hay una landing del producto en `src/pages/LandingPage.jsx` (textos en `src/landing/contenido.js`; nombre, WhatsApp y precios provisionales). A Jesús no le gusta su diseño: hay que rehacerlo.
- Demos hechas: Almendra (Editorial), El Pollastre d'Horta (Banner, en catalán, para un negocio real), LadySalon (Diagonal), Laca (Fullbleed), Dulce Lima (Mosaico) y Navaja & Tijera (Portada).
