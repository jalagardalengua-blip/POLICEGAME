# Recursos 3D: inventario y licencias

Todo lo integrado es gratuito y de uso libre (CC0 o MIT). Las descargas se hicieron desde GitHub y se comprobó la huella SHA-256 publicada por el repositorio de origen.

## Integrado en el juego

| Recurso | Archivo | Origen | Licencia | Peso | Uso |
|---|---|---|---|---|---|
| Cuerpo humano realista (hombre) | `modelos/humano-h.glb` | Quaternius, *Universal Base Characters* (Standard) · copia en [WaviestSun/atelier-packs](https://github.com/WaviestSun/atelier-packs) release `packs-2` | CC0 1.0 | 1,4 MB | Agentes, civiles, sospechosos, presos, abogados |
| Cuerpo humano realista (mujer) | `modelos/humano-m.glb` | ídem | CC0 1.0 | 1,5 MB | ídem |
| Piel clara (texturas) | `modelos/piel-h-clara.jpg`, `piel-m-clara.jpg` | ídem | CC0 1.0 | 97 KB | Tonos de piel claros |
| Peinados y barba | `modelos/pelo-*.glb` (4) | ídem, *Hairstyles / Rigged to Head Bone* | CC0 1.0 | 0,9 MB | Pelo corto, rapado, largo y barba |
| Animaciones (19) | `modelos/anim-1.glb` | Quaternius, *Universal Animation Library* (Standard) · release `characters-1` | CC0 1.0 | 0,6 MB | Andar, trotar, esprintar, sentarse, conducir, hablar, pistola, golpes, caída… |
| Animaciones (6) | `modelos/anim-2.glb` | Quaternius, *Universal Animation Library 2* (Standard) · release `packs-2` | CC0 1.0 | 0,2 MB | Brazos cruzados, hablar por teléfono, negar, asentir, derribo, levantarse |
| Cargador glTF y clonado de esqueletos | `js/vendor/GLTFLoader.js`, `js/vendor/SkeletonUtils.js` | three.js r128 (`examples/js`) | MIT | 0,1 MB | Carga de modelos |

### Cómo se han adaptado
- **Texturas** reducidas de 2048 a 1024 px (JPEG) para móvil.
- **Animaciones**: solo las útiles para el juego, re-muestreadas y sin pistas constantes (de 26 MB a 0,9 MB).
- **Ropa**: los cuerpos vienen sin ropa. `js/gl3d.js` pinta el uniforme, el traje, el chándal o el mono de preso sobre el mapa UV de cada cuerpo (con bordes rectos en cintura, cuello y chaleco), aplana el relieve muscular bajo la tela y separa ligeramente la tela del cuerpo para que tenga volumen. Gorra, cinturón y rótulo «POLICÍA» se anclan a los huesos.
- **Rendimiento**: los colores de la gente de la calle se ajustan a una paleta para compartir texturas, se crean como mucho 2 personas realistas por fotograma y, si los modelos no cargan, se usan las personas procedurales de siempre.

## Revisado y no integrado (todavía)

| Recurso | Origen | Licencia | Motivo |
|---|---|---|---|
| Kenney *Car Kit* (patrulla, berlina, SUV, furgoneta, ambulancia, bomberos, taxi, camiones) | [lucasgrimont/assets3d](https://github.com/lucasgrimont/assets3d), [nrknithin/html-anime](https://github.com/nrknithin/html-anime) | CC0 | Estilo «juguete»: desentona con las personas realistas. Los coches procedurales del juego (pintura metalizada, cristal, rotulación) encajan mejor |
| Kenney *Racing Kit* y *City Kit* (conos, vallas, farolas, semáforos, radar) | ídem | CC0 | Pendiente de fase de calle; mismo estilo juguete |
| Kenney *Furniture Kit* 2.0 | [WaviestSun/atelier-packs](https://github.com/WaviestSun/atelier-packs) `packs-2` | CC0 | Candidato para la comisaría por dentro (fase siguiente) |
| Quaternius *Ultimate Animated Characters* (cabeza grande) | [nrknithin/html-anime](https://github.com/nrknithin/html-anime) | CC0 | Estilo infantil; sustituido por los cuerpos realistas |
| Helicóptero de rescate low poly | ídem | CC-BY 4.0 | Exige atribución y es de estilo juguete |
| Perros (carlino, husky, lobo) | ídem, [danwahl/animasim](https://github.com/danwahl/animasim) | CC0 / CC-BY | Candidatos para la unidad canina; ninguno es un pastor alemán |

## Para subir más el realismo
[Poly Haven](https://polyhaven.com) ofrece texturas PBR, cielos HDRI y modelos fotorrealistas CC0, pero su web no es accesible desde el entorno de desarrollo actual. Si se permite `polyhaven.com` y `dl.polyhaven.org`, se pueden añadir asfalto, fachadas, cielos reales y mobiliario urbano fotorrealista.
