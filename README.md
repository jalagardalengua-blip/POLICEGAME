# Patrulla España

Juego de gestión policial a mundo abierto por toda España. Diriges una red de comisarías, das el alto a la gente por la calle, haces detenciones legales, interrogas con abogado presente y llevas los casos ante el juez. Por el camino desmontas redes de narcotráfico en la Costa del Sol, el Estrecho, el Guadalquivir, el puerto de Valencia, Barcelona y las Rías gallegas.

No hay niveles: el mapa es la península entera y se juega de forma continua.

## Pantallas

| Pantalla | Qué hay |
|---|---|
| **Mapa de España** | Escudos de cada comisaría (azul: tuya; gris: por abrir; rojo: misión), avisos por ciudad, ficha con «Entrar», «Volar» o «Marcar ruta», panel de misión actual, tiempo y hora |
| **Mi Comisaría (3D)** | Edificio, coches de tu flota con sirenas que se reflejan en el suelo mojado, helicóptero, bandera, plantilla en la puerta. Tarjetas de garaje, interrogatorio y calabozos con mantenimiento diario |
| **Patrulla (3D)** | Conduces o caminas por la ciudad con cámara detrás, velocímetro, radio, sirena, cambio de vehículo, flechas y pedal táctiles. Fuera de las ciudades pasa al mapa de carreteras |
| **Interrogatorio (3D)** | Sala con mesa, pruebas, lámpara y espejo. El sospechoso reacciona (niega, confiesa, calla, se asusta) y su abogado aparece cuando llega. Nivel de cooperación y respuestas posibles |
| **Calabozos (3D)** | Pasillo con celdas y presos. Lista de detenidos con horas, pruebas y abogado; botones para pasar al juez, interrogar o liberar |
| **Tienda / Garaje** | Patrullas (compacto, berlina, todoterreno), furgonetas, motos, helicóptero y drones con imágenes 3D. Cada vehículo cambia el juego |

La interfaz tiene perfil de jefe con nivel y experiencia, contadores de fondos (€), reputación e inteligencia, menú lateral, minimapa con zoom y acciones rápidas (desplegar unidades, sanción, arrestar, refuerzos y helicóptero).

### Vehículos

| Vehículo | Efecto |
|---|---|
| Patrullas | Tus agentes llegan antes a los avisos (cuanto mejor el modelo, más rápidos) |
| Furgoneta de intervención | +2 plazas de calabozo y en los registros los sospechosos huyen más despacio |
| Moto | El agente que la lleva es el más rápido de la ciudad |
| Helicóptero | Viajes instantáneos entre comisarías y necesario para la operación final |
| Dron | Los avisos de esa ciudad duran más y detectas indicios desde más lejos |

Cada día se pagan las nóminas y el mantenimiento de la flota.

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
| Conducir en 3D | W/S acelerar y frenar, A/D girar | Flechas y pedal en pantalla, o arrastrar |
| Subir o bajar del coche | C | «Cambiar vehículo» |
| Vista 3D o mapa | V | «Vista 2D / 3D» |
| Volver atrás | Esc | Botón «Volver» o «Finalizar» |

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
js/hub3d.js             Motor 3D: comisaría, interrogatorio, calabozos, calle y miniaturas (Three.js)
js/icons.js             Iconos e ilustraciones SVG
js/vendor/three.min.js  Three.js r128 (licencia MIT, ver THREE-LICENSE.txt)
docs/DISENO.md          Documento de diseño y hoja de ruta
tools/build-single.py   Genera dist/patrulla-espana.html (todo en un archivo)
.github/workflows/      Publicación automática en GitHub Pages
```

Para añadir una misión, una ciudad o un tipo de personal, edita `js/data.js`. El motor lo recoge sin más cambios.

## Aviso

Los casos, nombres, emblemas y organizaciones son ficticios; el juego no usa logotipos ni rotulación de ningún cuerpo policial real. Las referencias legales (Constitución, LECrim, Código Penal, LO 4/2015) están simplificadas para el juego y no son asesoramiento jurídico.
