# Documento de diseño · Patrulla España

## Idea

Un juego de gestión policial en el que el mapa es España entera. La progresión no va por niveles cerrados: abres comisarías donde quieras, contratas a personas concretas y eliges qué casos investigar. El ritmo combina acción directa (patrullar, dar el alto, perseguir) con gestión (plantilla, calabozos, juzgado).

## Pilares

1. **Hacerlo bien tiene recompensa.** La legalidad es la mecánica central. Detener sin base, cachear sin indicios, interrogar sin abogado o pasarse de 72 horas hace que el caso se caiga. Quien juega aprende las garantías básicas sin darse cuenta.
2. **Personas, no números.** Cada miembro de la plantilla tiene nombre, cara, nivel y energía. Se cansan, mejoran y se pueden trasladar.
3. **España reconocible.** Autovías reales, ríos, sierras, tejados de teja en el sur, olivares en Andalucía, viñedos en La Mancha y bosques en el norte.
4. **Mundo abierto continuo.** Sin pantallas de carga ni fases. Ver el día pasar, la lluvia y la noche forma parte del juego.

## Sistemas

### Control en la vía pública
Identificar → preguntar → (perro) → cachear → sancionar o detener.
- Los indicios salen de lo que observas (`?` sobre la persona), de las contradicciones al preguntar, de que marque el perro o de una requisitoria.
- Cachear sin indicios: −4 de reputación y prueba ilícita.
- Detener sin base legal: detención ilegal, −10 de reputación y −$300.

### Custodia y juzgado
- Plazo máximo de 72 horas de juego (1 hora = 5 segundos).
- El abogado de oficio llega entre 2 y 5 horas después. El convenio con el turno de oficio acorta la espera.
- Interrogatorio por turnos: preguntar, mostrar pruebas, ofrecer el atenuante o presionar (ilegal).
- Ante el juez: nulidad si faltó la lectura de derechos o la prueba es ilícita. Condena si las pruebas llegan al 50 %.

### Plantilla
| Rol | Órdenes | Efecto |
|---|---|---|
| Agente | Patrullar, Acompañarme, Guardia, Descansar, Traslado | Atiende avisos. Si te acompaña, lleva detenidos y ayuda en los registros. De guardia, amplía los calabozos |
| Detective | Oficina, Acompañarme, Descansar, Traslado | En la oficina interroga y pasa casos al juez. Si te acompaña, añade pruebas y detecta contradicciones |
| Analista | Analizar, Descansar, Traslado | Aporta inteligencia cada 8 horas |
| Guía canino | Comisaría, Acompañarme, Descansar, Traslado | Su perro da indicios legales |
| Jefe de turno | Ninguna | Informa del estado de la comisaría y da consejos |

La energía baja trabajando y sube descansando. Con 5 casos se sube un nivel (máximo 5), y cada nivel da más velocidad y eficacia.

### Misiones
Están en `js/data.js`. Cada misión es una lista de pasos de estos tipos: `arrest`, `court`, `own`, `up`, `intel`, `goto`, `inspect`, `warrant`, `raid`, `boats` y `follow`.

## Pantalla principal (Mi Comisaría)
Escena 3D en tiempo real con cámara sobre el hombro del jefe, al estilo de los juegos de gestión para móvil: comisaría con cristaleras, plaza mojada con reflejos de sirenas, coches patrulla, helicóptero en vuelo, bandera ondeando y ciudad de fondo. Por encima va la interfaz completa: perfil y nivel, contadores, menú lateral, tarjetas de garaje, interrogatorio y calabozos, misión destacada y acciones rápidas.

## Dirección de arte
- Vista cenital con edificios en 2,5D: azotea más fachada sur con ventanas y sombra proyectada.
- Paleta nocturna de comisaría: azul marino, dorado de insignia, rojo y azul de sirena.
- Las ciudades se dibujan una vez y se guardan en una caché. El terreno se guarda en trozos de 1024 px. A partir de esas dos cachés se compone cada fotograma, con luces dinámicas encima.

## Hoja de ruta
- [ ] Sonido: sirenas, radio, ambiente de ciudad y mar
- [ ] Persecuciones por autovía con controles de carretera
- [ ] Oficina y sala de mando en 3D
- [x] Tráfico civil, farolas y agentes que circulan por las calles
- [x] Persecuciones en coche con cuenta atrás
- [x] Pantallas de garaje, personal, gestión de comisaría, misiones y perfil
- [ ] Modelos 3D más detallados (GLTF) para coches, personajes y edificios
- [x] Patrulla en 3D por las calles
- [x] Interrogatorio y calabozos en 3D
- [x] Tienda de vehículos con efectos en el juego
- [ ] Más ciudades: Valladolid, Salamanca, Santander, Pamplona, Badajoz, Canarias
- [ ] Rasgos de personalidad en la plantilla (veterano, impulsivo, metódico)
- [ ] Juicios con testigos y peritos
- [ ] Logros y estadísticas por comisaría
- [ ] Versión para móvil instalable (PWA)
