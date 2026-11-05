# Patrulla España

Juego de gestión policial a mundo abierto por toda España. Diriges una red de comisarías, das el alto a la gente por la calle, haces detenciones legales, interrogas con abogado presente y llevas los casos ante el juez. Por el camino desmontas redes de narcotráfico en la Costa del Sol, el Estrecho, el Guadalquivir, el puerto de Valencia, Barcelona y las Rías gallegas.

No hay niveles: el mapa es la península entera y se juega de forma continua.

## Pantallas

| Pantalla | Qué hay |
|---|---|
| **Mapa de España** | Escudos de cada comisaría (azul: tuya; gris: por abrir; rojo: misión), avisos por ciudad, ficha con «Entrar», «Volar» o «Marcar ruta», panel de misión actual, tiempo y hora |
| **Mi Comisaría (3D)** | Edificio, coches de tu flota con sirenas que se reflejan en el suelo mojado, helicóptero, bandera, plantilla en la puerta. Tarjetas de garaje, interrogatorio y calabozos con mantenimiento diario |
| **Patrulla (3D)** | Conduces o caminas por la ciudad con cámara detrás, velocímetro, radio, sirena, cambio de vehículo, flechas y pedal táctiles. Fuera de las ciudades pasa al mapa de carreteras |
| **Interrogatorio (3D)** | Ficha del sospechoso (edad y delito), preguntas concretas, nivel de cooperación y respuestas posibles. El sospechoso reacciona y su abogado aparece cuando llega |
| **Calabozos (3D)** | Pasillo con celdas y presos. Lista de detenidos con horas, pruebas y abogado; botones para pasar al juez, interrogar o liberar |
| **Garaje** | Patrullas (compacto, berlina, todoterreno), furgonetas, motos, helicóptero y drones con imagen 3D grande y estadísticas de velocidad, aceleración, blindaje y capacidad |
| **Gestión de comisaría** | Imagen 3D de la comisaría, prestigio, mejoras del siguiente nivel y pestañas de Información, Personal, Vehículos e Instalaciones |
| **Personal** | Fichas con retrato, estrellas de nivel y energía; contratar agentes y especialistas |
| **Misiones disponibles** | Tarjetas con imagen, nivel recomendado, recompensa en euros y XP, y botón Aceptar |
| **Tu perfil** | Tu jefe, nivel y estadísticas de carrera |
| **Persecuciones** | En la ciudad (3D) y en las autovías: un coche huye con cuenta atrás. Mantente pegado para detenerlo o, en autovía, pide por radio un **control de carretera** (200 €) más adelante |
| **Sonido** | Sirena, bocina, motor según la velocidad, radio de la central, ruido de ciudad y de mar, y melodías al detener o completar misiones. Se puede apagar en Ajustes |

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

### Controles (mundo libre)

| Acción | Teclado | Móvil |
|---|---|---|
| Caminar / correr | WASD · Mayús para correr | Joystick a la izquierda · botón Correr |
| Mirar alrededor | Arrastrar con el ratón | Arrastrar en la mitad derecha |
| **Conducir** | W acelerador, S freno y marcha atrás, A/D volante, **Mayús freno de mano** | **Volante** táctil a la izquierda y pedales **GAS** / **FRENO** (los dos a la vez: freno de mano) |
| Cambiar cámara (detrás, cerca, interior) | C | Botón Cámara |
| **Botón de acción** (¡Alto, policía!, Dar el alto, Hablar, Subir/Bajar del coche, Entregar detenidos, Entrar en comisaría) | E o Espacio | Botón grande |
| Radio (pedir tu coche, refuerzos, control de carretera) | Botón Radio | Botón Radio |
| Menú | Botón Menú | Botón Menú |

Velocidades reales: se camina a unos 12 km/h, se corre a 20 y el coche llega a unos 55 km/h en ciudad y 120 en autovía. **Tu compañero** patrulla contigo: va de copiloto, se baja contigo, te avisa por radio y persigue a quien huya.

### Misiones completas

- **El tirón de la plaza** (Madrid): aviso de la central → hablar con la víctima → buscar al sospechoso por su descripción → persecución a pie → detención legal → entrega → interrogatorio.
- **Conductor ebrio en la A-42**: alcanzar al coche que va haciendo eses → prueba de alcoholemia → detención (art. 379.2 CP) → entrega.
- **Atraco a la joyería** (Toledo): viajar a Toledo → hablar con el joyero → revisar las cámaras → capturar a los dos atracadores → juzgado.

## Qué hay en el juego

- **Mapa de España**: 33 ciudades (con Toledo, Valladolid, Salamanca, Burgos, León, Oviedo, Santander, Pamplona, Cáceres, Badajoz, Córdoba, Jaén, Tarragona y Castellón), pueblos junto a las autovías, autovías con su nombre (A-1, A-4, AP-7…), ríos, montañas con nieve, campos, olivares, viñedos, pueblos, playas, Baleares, Portugal, Francia y el norte de África.
- **Detenciones legales**: identificar, preguntar, pasar al perro, cachear (solo con indicios), proponer sanciones y detener leyendo los derechos. Si te saltas la ley, el juez anula el caso y pierdes reputación.
- **Custodia**: plazo de 72 horas, abogado de oficio, interrogatorios por turnos y pruebas que suben o bajan. Al final, el juez condena o deja en libertad.
- **Plantilla con personajes**: agentes, detectives, analistas, guías caninos con su perro y jefes de turno. Cada uno tiene nombre, aspecto, nivel, experiencia y energía. Les das órdenes: patrullar, acompañarte, guardia en calabozos, descansar o trasladarse a otra comisaría.
- **Comisarías ampliables**: tres niveles por comisaría, coches patrulla, garaje y helipuerto.
- **11 misiones** encadenadas sobre narcotráfico y crimen organizado (ficticias).
- **Gráficos**: edificios en 2,5D con sombras, tejados de teja en el sur, piscinas en Marbella, ventanas que se encienden de noche, faros, sirenas, lluvia, oleaje y espuma en la costa.
- **Personas realistas** con captura de movimiento: andan, trotan y esprintan según su velocidad, se sientan en el interrogatorio, conducen, hablan por teléfono o se cruzan de brazos. Uniforme, traje, ropa de calle y mono de preso pintados sobre el cuerpo. Modelos CC0 de Quaternius (inventario y licencias en `docs/RECURSOS.md`).
- **Conducción con inercia**: el coche derrapa si giras fuerte a mucha velocidad, desliza con el freno de mano y la carrocería cabecea al frenar y se inclina en las curvas.
- **Guardado automático** en el navegador.

## Estructura del proyecto

```
index.html              Página del juego
css/style.css           Interfaz (HUD, paneles, fichas)
js/data.js              Contenido: geografía, ciudades, autovías, misiones, personal, delitos
js/game.js              Motor: simulación, IA, mapa 2D, interfaz
js/hub3d.js             Motor 3D: comisaría, interrogatorio, calabozos, calle y miniaturas (Three.js)
js/gl3d.js              Personas realistas con animación (GLTF), ropa pintada por zonas
modelos/                Cuerpos, peinados y animaciones (Quaternius, CC0) — ver docs/RECURSOS.md
js/icons.js             Iconos e ilustraciones SVG
js/audio.js             Sonido sintetizado con Web Audio (sin archivos)
js/vendor/three.min.js  Three.js r128 (licencia MIT, ver THREE-LICENSE.txt)
docs/DISENO.md          Documento de diseño y hoja de ruta
tools/build-single.py   Genera dist/patrulla-espana.html (todo en un archivo)
.github/workflows/      Publicación automática en GitHub Pages
```

Para añadir una misión, una ciudad o un tipo de personal, edita `js/data.js`. El motor lo recoge sin más cambios.

## Aviso

Los casos, nombres, emblemas y organizaciones son ficticios; el juego no usa logotipos ni rotulación de ningún cuerpo policial real. Las referencias legales (Constitución, LECrim, Código Penal, LO 4/2015) están simplificadas para el juego y no son asesoramiento jurídico.
