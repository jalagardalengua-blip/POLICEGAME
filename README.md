# Patrulla España

Juego de gestión policial a mundo abierto por toda España. Diriges una red de comisarías, das el alto a la gente por la calle, haces detenciones legales, interrogas con abogado presente y llevas los casos ante el juez. Por el camino desmontas redes de narcotráfico en la Costa del Sol, el Estrecho, el Guadalquivir, el puerto de Valencia, Barcelona y las Rías gallegas.

No hay niveles: el mapa es la península entera y se juega de forma continua.

## Pantallas

- **Mi Comisaría (3D)**: la pantalla principal. Edificio, coches patrulla con sirenas que se reflejan en el suelo mojado, helicóptero, bandera de España y tu plantilla en la puerta. Cambia con el día, el atardecer, la noche y la lluvia, y crece cuando amplías la comisaría.
- **Patrulla (mapa)**: vista cenital de toda España para salir a la calle, perseguir, dar el alto y viajar entre ciudades.

La interfaz tiene perfil de jefe con nivel y experiencia, contadores de fondos (€), reputación e inteligencia, menú lateral, tarjetas de garaje, interrogatorio y calabozos, minimapa con zoom y barra de acciones rápidas (desplegar unidades, sanción, arrestar, refuerzos y helicóptero).

## Cómo jugar

**En el navegador:** abre `index.html`. No hace falta instalar nada.

**En internet (GitHub Pages):** en el repositorio, ve a *Settings → Pages* y en *Source* elige **GitHub Actions**. Cada vez que se suba algo a `main`, el juego se publica solo en `https://<tu-usuario>.github.io/<repositorio>/`.

### Controles

| Acción | Teclado | Móvil |
|---|---|---|
| Moverse | WASD o flechas | Arrastrar el dedo |
| Dar el alto o dar órdenes | E | Tocar a la persona |
| Centro de mando (flota, agentes, operaciones…) | Menú lateral | Menú lateral |
| Misiones | M | Pestaña «Misiones» |
| Plantilla | P | Pestaña «Plantilla» |
| Entrar o salir de Mi Comisaría | E en la plaza de la comisaría | Menú «Mi Comisaría» / «Salir a patrullar» |

En la ciudad vas a pie, por carretera en coche patrulla y en el mar en patrullera (si tienes la Unidad marítima).

## Qué hay en el juego

- **Mapa de España**: 19 ciudades, autovías con su nombre (A-1, A-4, AP-7…), ríos, montañas con nieve, campos, olivares, viñedos, pueblos, playas, Baleares, Portugal, Francia y el norte de África.
- **Detenciones legales**: identificar, preguntar, pasar al perro, cachear (solo con indicios), proponer sanciones y detener leyendo los derechos. Si te saltas la ley, el juez anula el caso y pierdes reputación.
- **Custodia**: plazo de 72 horas, abogado de oficio, interrogatorios por turnos y pruebas que suben o bajan. Al final, el juez condena o deja en libertad.
- **Plantilla con personajes**: agentes, detectives, analistas, guías caninos con su perro y jefes de turno. Cada uno tiene nombre, aspecto, nivel, experiencia y energía. Les das órdenes: patrullar, acompañarte, guardia en calabozos, descansar o trasladarse a otra comisaría.
- **Comisarías ampliables**: tres niveles por comisaría, coches patrulla, garaje y helipuerto.
- **11 misiones** encadenadas sobre narcotráfico y crimen organizado (ficticias).
- **Gráficos**: edificios en 2,5D con sombras, tejados de teja en el sur, piscinas en Marbella, ventanas que se encienden de noche, faros, sirenas, lluvia, oleaje y espuma en la costa.
- **Guardado automático** en el navegador.

## Estructura del proyecto

```
index.html              Página del juego
css/style.css           Interfaz (HUD, paneles, fichas)
js/data.js              Contenido: geografía, ciudades, autovías, misiones, personal, delitos
js/game.js              Motor: simulación, IA, mapa 2D, interfaz
js/hub3d.js             Escena 3D de «Mi Comisaría» (Three.js)
js/icons.js             Iconos e ilustraciones SVG
js/vendor/three.min.js  Three.js r128 (licencia MIT, ver THREE-LICENSE.txt)
docs/DISENO.md          Documento de diseño y hoja de ruta
tools/build-single.py   Genera dist/patrulla-espana.html (todo en un archivo)
.github/workflows/      Publicación automática en GitHub Pages
```

Para añadir una misión, una ciudad o un tipo de personal, edita `js/data.js`. El motor lo recoge sin más cambios.

## Aviso

Los casos, nombres, emblemas y organizaciones son ficticios; el juego no usa logotipos ni rotulación de ningún cuerpo policial real. Las referencias legales (Constitución, LECrim, Código Penal, LO 4/2015) están simplificadas para el juego y no son asesoramiento jurídico.
