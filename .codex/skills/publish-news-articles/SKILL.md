---
name: publish-news-articles
description: >-
  Crea, edita y publica noticias completas en TuriaFestNoticias siguiendo el patrón editorial,
  visual y técnico de la noticia de Reve Fest: verificación de fuentes, redacción original,
  catálogo tipado, i18n, imágenes WebP, búsqueda, ruta de detalle, SEO NewsArticle, accesibilidad,
  pruebas y validación responsive. Usar siempre que se añada, modifique, retire o revise una
  noticia, crónica, galería o contenido del apartado /noticias.
---

# Publicar noticias

Crear noticias verificables, originales y visualmente coherentes con TuriaFestNoticias. Mantener
una única fuente de datos, el catálogo existente en `src/app/features/news/data-access/`, hasta que
el proyecto migre expresamente las noticias a un CMS.

## Revisiones obligatorias

Leer antes de modificar:

- `AGENTS.md` y `.codex/AGENTS.md`.
- La implementación actual en `src/app/features/news/`.
- Los agentes `content`, `views`, `performance` y `testing`.
- Las skills `project-structure`, `internationalization`, `asset-organization`, `seo-meta`,
  `performance-optimization`, `accessibility`, `theming-styling`,
  `design-responsive-validation` y `testing-patterns`.
- `routing-navigation` si se cambia una ruta o un slug.
- `search` si se modifica el comportamiento del buscador.

No crear una segunda arquitectura, otro catálogo ni componentes paralelos si el patrón actual
puede ampliarse.

## Flujo obligatorio

### 1. Reunir material y verificar hechos

Obtener antes de redactar:

- Nombre oficial del festival o evento.
- Ciudad, recinto y fecha del acontecimiento.
- Artistas, horarios, cifras y finalidad del evento que puedan confirmarse.
- Fuente oficial HTTPS: festival, recinto, promotora u organización.
- Fecha y hora de publicación en ISO 8601 con zona horaria.
- Autor o entidad responsable.
- Fotografías con procedencia y permiso de uso.

Consultar fuentes oficiales actuales cuando la información pueda haber cambiado. Contrastar cada
afirmación material. No inventar fechas, cifras, declaraciones, artistas, aforo, precios, causas
solidarias ni resultados.

Leer varias noticias o fuentes sobre el acontecimiento cuando estén disponibles y usar al menos una
fuente oficial como referencia factual. Tomar notas de hechos confirmados y cerrar las fuentes antes
de redactar. La fuente es material de verificación, no una plantilla narrativa.

Si falta un dato que cambia el sentido de la noticia, pedirlo antes de publicar. Si solo faltan
detalles secundarios, redactar sin afirmarlos.

### 2. Redactar una noticia original

Escribir en español de España con tono periodístico cercano, claro y sobrio:

- Crear un titular informativo, específico y sin sensacionalismo.
- Escribir una entradilla que responda qué ocurrió, dónde y por qué importa.
- Dividir el cuerpo en secciones con subtítulos descriptivos.
- Usar voz activa, párrafos breves y datos concretos.
- Distinguir hechos, citas y contexto editorial.
- Incluir una frase destacada solo si aporta una idea central; no usarla como tarjeta decorativa.
- Cerrar conectando el acontecimiento con su impacto o contexto, sin repetir la entradilla.
- Redactar desde cero después de comprender los hechos.
- Construir una estructura, un enfoque, un titular y unas transiciones propios.
- No copiar, traducir, resumir frase por frase ni hacer una reescritura superficial de una fuente.
- No reproducir el orden narrativo, los subtítulos o las expresiones distintivas de otra noticia.
- Mantener los nombres oficiales de festivales y artistas sin traducir.

No mostrar etiquetas editoriales artificiales como “Crónica”, “Desde el recinto” o equivalentes
si no aportan información. No incluir texto de prueba, números de edición ni tarjetas vacías.

### 3. Crear el slug y el registro tipado

Crear un slug ASCII, descriptivo y en `kebab-case`, por ejemplo:

```text
reve-fest-2026-nueve-horas-musica-urbana
```

Considerar el slug inmutable desde su publicación. Si debe cambiar, coordinar una redirección 301
con SEO.

Añadir el artículo a `news.catalogue.ts` usando `NewsArticle`. Completar todos los campos:

| Campo               | Regla                                              |
| ------------------- | -------------------------------------------------- |
| `id`                | Identificador corto, único y estable.              |
| `slug`              | URL pública inmutable.                             |
| `titleKey`          | Clave i18n del titular.                            |
| `summaryKey`        | Clave i18n de la entradilla.                       |
| `cityKey`           | Ciudad indexable por el buscador.                  |
| `categoryKey`       | Categoría o tipo musical visible.                  |
| `searchGenresKey`   | Géneros y sinónimos útiles para búsqueda.          |
| `publishedLabelKey` | Fecha legible localizada.                          |
| `publishedAt`       | Fecha ISO 8601 para `<time>` y JSON-LD.            |
| `modifiedAt`        | Fecha ISO 8601 de última modificación.             |
| `authorKey`         | Autor o redacción.                                 |
| `seoTitleKey`       | Título SEO específico, idealmente ≤ 60 caracteres. |
| `seoDescriptionKey` | Descripción fiel, idealmente ≤ 155 caracteres.     |
| `cover`             | Imagen principal grande con dimensiones reales.    |
| `cardImage`         | Variante optimizada del listado.                   |
| `socialImage`       | Imagen Open Graph de 1200 × 630.                   |
| `highlightKey`      | Frase destacada editorial.                         |
| `sections`          | Subtítulos y párrafos en orden narrativo.          |
| `galleryTitleKey`   | Título descriptivo de la galería.                  |
| `gallery`           | Fotografías con tamaño, alt y pie opcional.        |
| `source`            | URL interna usada para verificación y `citation`.  |

Ordenar `NEWS_ARTICLES` por `publishedAt` descendente. No duplicar un `id`, slug o artículo.

### 4. Preparar las imágenes

Seguir `asset-organization` y trabajar dentro de:

```text
src/assets/images/news/<slug>/
```

Procesar únicamente fotografías. Ignorar vídeos salvo petición explícita. Convertir los raster a
WebP, conservar la proporción y usar nombres `kebab-case`:

```text
<festival>-<año>-cover-1600.webp
<festival>-<año>-cover-640.webp
<festival>-<año>-social-1200x630.webp
<festival>-<año>-gallery-01-960.webp
```

Crear como mínimo:

- Portada de hasta 1600 px para la página de detalle.
- Portada de 640 px con relación 8:5 para el listado.
- Imagen social 1200 × 630 para Open Graph y Twitter.
- Galería a 960 px de ancho cuando existan fotografías adicionales.

Registrar el ancho y alto reales en el catálogo. Usar `NgOptimizedImage` con dimensiones explícitas;
marcar `priority` únicamente en la portada LCP del detalle. No deformar imágenes, cortar texto de
carteles ni reutilizar imágenes de otro festival como relleno.

Escribir textos alternativos que describan lo visible y pies de foto que aporten contexto. No
repetir el titular como `alt`. Mantener imágenes decorativas con `alt=""`.

### 5. Añadir las claves i18n

Guardar todo el contenido visible bajo `news.articles.<articleKey>` en
`src/assets/i18n/es.json`. Incluir titular, resumen, ciudad, categoría, géneros de búsqueda, fecha,
SEO, secciones, galería, textos alternativos y pies de foto.

No hardcodear copy en HTML ni TypeScript. Mantener paridad con `ca.json` y `en.json` según
`i18n-commit-policy` y ejecutar:

```bash
npm run i18n:check
```

### 6. Mantener listado, buscador y ruta

Conservar el listado principal en `/noticias` y el detalle en `/noticias/:slug`. Generar la ruta
desde `NEWS_ARTICLES` como hace `news.routes.ts`; no duplicar manualmente los slugs.

El listado debe mostrar la imagen, ciudad, categoría, fecha, titular, resumen y enlace de lectura
sobre el fondo editorial. Separar noticias mediante una línea, no mediante tarjetas cerradas.

Indexar cada noticia en `NewsSearchService` con:

- `title`: titular traducido, con peso principal.
- `city`: ciudad.
- `genres`: género, categoría y sinónimos pertinentes.

Mantener búsqueda sin distinguir mayúsculas ni tildes, con prefijos y tolerancia a errores. Verificar
búsquedas por titular, ciudad y tipo de música, además del estado sin resultados y la limpieza del
parámetro `?buscar=`.

### 7. Componer el detalle editorial

Mantener el orden semántico:

1. Migas de pan.
2. Un único `h1`.
3. Entradilla.
4. Ciudad, categoría, `<time datetime>` y autor.
5. Portada y pie de foto.
6. Cuerpo con secciones `h2`.
7. Frase destacada integrada.
8. Galería.
9. Enlace de vuelta a Noticias.

No mostrar al lector bloques de “Fuentes y verificación”, enlaces a las noticias consultadas ni
sellos de “noticia oficial”. Conservar las URL únicamente en el catálogo para trazabilidad interna y
para la propiedad `citation` del JSON-LD.

Justificar únicamente los párrafos del cuerpo editorial con `text-align: justify`,
`text-justify: inter-word` y `hyphens: auto`. Mantener sin justificar el titular, la entradilla,
la frase destacada, las fuentes y los pies de foto para preservar su jerarquía y legibilidad.
Limitar la prosa a un máximo aproximado de 70 caracteres por línea.

Usar superficies, texto, bordes, espaciado y tipografía mediante tokens `--fv-*`. Mantener
comportamiento correcto en tema claro, oscuro y sistema. No crear tarjetas para el cuerpo ni
fondos decorativos sin función editorial.

### 8. Configurar SEO completo

Usar `NewsMetaService` para aplicar:

- `<title>` y meta description únicos.
- `robots: index, follow` solo para contenido real publicable.
- Canonical absoluto `/noticias/<slug>`.
- Open Graph con `og:type=article`.
- Twitter Card `summary_large_image`.
- Imagen social absoluta, dimensiones y alt.
- `article:published_time`, `article:modified_time` y autor.
- JSON-LD `NewsArticle` con titular, descripción, imagen, fechas, autor, publisher, sección,
  idioma, URL y `citation`.
- JSON-LD `BreadcrumbList`.

Añadir cada detalle al prerender de `app.routes.server.ts`. Comprobar que la URL pública usa
`environment.baseUrl`; no hardcodear el dominio.

### 9. Probar

Añadir o actualizar pruebas para cubrir como mínimo:

- Integridad del catálogo, slugs únicos, fechas y assets WebP.
- Orden cronológico del listado.
- Render de tarjeta y enlace de detalle.
- Render del detalle, jerarquía y ausencia de fuentes visibles.
- Conservación de la fuente interna en `citation` del JSON-LD.
- Metadatos, canonical y JSON-LD.
- Búsqueda exacta, por ciudad, por género, sin tildes, con errores y sin resultados.
- Ruta prerenderizada.

No depender de red, reloj real ni contenido mutable en las pruebas.

### 10. Validar en ejecución

Ejecutar:

```bash
npm run i18n:check
npm run lint
npm test -- --run
npm run build
```

Abrir `/noticias` y `/noticias/<slug>` en la aplicación real. Revisar tema claro y oscuro en 1440,
1024, 768 y 320 px. Confirmar:

- Sin desplazamiento horizontal, solapes ni contenido recortado.
- Texto justificado legible, sin huecos desproporcionados en móvil.
- Imágenes sin deformación ni cambios de layout.
- Foco visible y navegación por teclado.
- Contraste WCAG 2.1 AA.
- Un `h1`, jerarquía correcta y `<time>` válido.
- Sin errores de consola.

## Prohibiciones editoriales

No publicar:

- Rumores o datos sin fuente oficial.
- Citas inventadas o atribuciones ambiguas.
- Texto copiado, traducido o reescrito de forma demasiado cercana a terceros.
- Imágenes sin procedencia o derechos claros.
- Datos personales innecesarios, credenciales o URL privadas.
- Enlaces de compra no oficiales.
- Contenido de prueba en producción.

## Informe final obligatorio

Indicar:

- Noticia y slug publicados.
- Fuentes oficiales utilizadas.
- Fotografías y variantes WebP creadas.
- Claves i18n, buscador, rutas, SEO y prerender actualizados.
- Resultado de i18n, lint, pruebas y build.
- Validación responsive en los cuatro anchos y ambos temas.
- Datos pendientes que requieran revisión humana.

Incluir el informe exacto exigido por `design-responsive-validation` cuando haya cambios visuales.
