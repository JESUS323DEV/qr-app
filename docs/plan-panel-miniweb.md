# Plan: datos por miniweb y panel del cliente

Apuntado el 15-11-2026. Es una idea acordada, no está construida. Nada de esto se hace sin que Jesús lo pida.

## Idea en una frase

El Editor de /admin sigue llevando el diseño. Los datos (platos, ofertas, horarios) pasan a vivir en un sitio nuevo ligado a la miniweb, que Jesús maneja desde el Editor y el cliente desde un panel nuevo.

## Los dos sistemas

1. **Diseño** (ya existe): el Editor, con las copias en `ediciones` (estilo, colores, fotos). No cambia. Una vez cerrado el diseño de un cliente no se vuelve a guardar esa copia.
2. **Datos** (nuevo): una tabla nueva en Supabase ligada al slug de la miniweb, con el menú del día, las ofertas y los horarios. Los edita:
   - Jesús, desde una pestaña de datos en el Editor, como admin y para todos los negocios.
   - El cliente, desde un panel nuevo, solo lo que Jesús le dé.

## Lo que se queda como está

- `/mi-panel` y `/mi-carta` quedan solo para cartas y ofertas sueltas, con la tabla `cartas`.
- El diseño de una carta se puede seguir exportando como carta suelta o como parte de una miniweb.

## La pieza clave

El mismo diseño de carta lee sus datos de dos sitios:

- Suelto: de la fila de `cartas`, como hoy.
- Dentro de una miniweb: de los datos nuevos de esa miniweb.

Así se evita el lío de nombres (carta y miniweb con slugs parecidos), porque los datos cuelgan del slug de la miniweb.

## Orden de trabajo

1. Refactor de `src/pages/PanelPage.jsx` (1.419 líneas): sacar `EditorMenu`, `EditorOfertas` y `EditorHorarios` a archivos propios, para usarlos en `/mi-panel`, en el Editor y en el panel nuevo. Sin cambiar lo que hacen.
2. Diseñar la tabla de datos nueva y su SQL (lo ejecuta Jesús).
3. Que la carta lea de las dos fuentes. Es el cambio más delicado: `CartaIncrustada` hoy se llama por slug de carta (`hero.carta`) y mezcla la copia con la fila de `cartas`.
4. Pestaña de datos en el Editor.
5. Panel nuevo del cliente, con pestañas según lo que tenga su negocio.

## El editor táctil de Inmersiva (importante)

Al hacer el refactor, el editor del menú para móvil con diseño Inmersiva se extrae tal cual en lo que hace; el aspecto puede cambiar después. Son varias piezas que se hablan entre sí:

- En `src/pages/PanelPage.jsx`: `EditorMenu` (con `zona` y `modoVista`), `VistaPrevia`, `PantallaCompleta` y el gancho `useCartaEnVivo`.
- La comunicación con el iframe de la carta (`?vista=panel&editar=1&lapices=1`): el panel manda `mostraq-borrador` y la carta avisa con `mostraq-editar`. Mismos mensajes y mismos parámetros.
- Al otro lado, sin moverse: `src/pages/CartaPage.jsx` y `src/lib/edicionPanel.jsx`.
- Hay que dejarlo reutilizable (datos y forma de guardar por parámetros) y probarlo en un móvil real tras cada trozo.

## Decisiones abiertas

- Una tabla nueva ligada al slug de la miniweb (menú, ofertas y horarios) o ampliar la de `horarios`.
- Cómo se asigna el dueño: en un solo sitio o seguir con uno por pieza.
- Qué puede cambiar el cliente además de horarios, menú y ofertas.
- Si un cliente puede tener varias miniwebs.
- Qué hace el asistente de Menú y ofertas: solo diseño, colores y fotos, sin inventar platos.

## Riesgos

- Que la carta lea de dos fuentes puede romper miniwebs que ya existen. Probar con una de prueba (Dulce Aroma) antes de tocar nada real.
- Mantener dos fuentes de datos es más trabajo. Se controla con un único punto que decida de dónde se lee.
- No se ha comprobado cuántas piezas dependen hoy del enlace `hero.carta`.

## Estado de la prueba (15-11-2026)

- Cuenta de cliente de prueba: jtipian90. Entra en `/mi-panel` y ve la carta `dulce-aroma` (tabla `cartas`), con sus ofertas.
- En la base de datos hay una carta `dulce-aroma` y dos miniwebs, `dulce-aroma` y `dulce-aroma1`. La carta no pertenece a ninguna de ellas.
- Pendiente ordenar esos nombres si se quiere dejar limpio.
