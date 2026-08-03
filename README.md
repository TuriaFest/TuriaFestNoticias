# TuriaFestNoticias

Portal de noticias y festivales de la Comunitat Valenciana, construido con [Astro](https://astro.build/) y desplegado como sitio estático en Cloudflare Workers. La interfaz está en español (es-ES), con valenciano e inglés en el roadmap.

> Migrado de Angular 21 a Astro. La superficie en producción es el portal de noticias (`/noticias`, `/noticias/:slug`); el catálogo de festivales, filtros y mapa son roadmap.

## Requisitos

- Node.js 22.22+ / 24.15+ (ver avisos de `engines`)
- npm

Instala dependencias con:

```bash
npm install
```

## Servidor de desarrollo

```bash
npm start
```

Arranca `astro dev` en `http://localhost:4321/`. La app recarga al modificar los ficheros fuente.

## Build

```bash
npm run build
```

Compila el sitio estático en `dist/`. Para previsualizar el resultado del build:

```bash
npm run preview
```

## Despliegue en Cloudflare Workers

Los assets estáticos se sirven desde `./dist` (configuración en `wrangler.jsonc`). Para construir y desplegar la rama actual:

```bash
npm run deploy
```

En Cloudflare Builds, usa `npm run build` como comando de build y `npx wrangler deploy` como comando de despliegue.

## Tests

```bash
npm test           # Vitest en modo watch
npm test -- --run  # una sola pasada (usado en la puerta de pre-commit)
```

## Lint / type-check

```bash
npm run lint       # astro check
```

## Puerta de pre-commit

Todo commit que toque `src/` debe pasar, en orden y ambos con salida `0`, antes de `git commit`:

```bash
npm run lint && npm test -- --run
```

## Internacionalización

Las traducciones viven en `src/assets/i18n/*.json` (`es.json` es la fuente de verdad). Un paso `copy:i18n` (pre-dev y pre-build) las copia a `public/assets/i18n` para el island de cambio de idioma.

```bash
npm run i18n:check   # verifica paridad de claves entre locales
npm run i18n:sync    # propaga claves nuevas a los demás locales
```

## Estructura

```
src/
├── pages/       # rutas → HTML estático (noticias/index, noticias/[slug], 404)
├── layouts/     # shells de documento (BaseLayout.astro)
├── components/  # componentes .astro reutilizables (NavBar, Footer) + SCSS
├── scripts/     # islands de cliente (theme, i18n, nav, news-search)
├── data/        # catálogo de contenido tipado + modelos + búsqueda
├── lib/         # helpers agnósticos de framework (seo, site, theme)
├── i18n/        # resolver de traducciones en runtime
├── styles/      # sistema de diseño SCSS (tokens, capa semántica, mixins)
└── assets/      # JSON de i18n (fuente) + fuentes de imágenes
```

`public/` contiene los assets estáticos servidos tal cual (branding, fuentes, imágenes optimizadas, i18n copiado).

## Recursos

- [Documentación de Astro](https://docs.astro.build/)
- Contrato del proyecto para agentes: [`.claude/CLAUDE.md`](.claude/CLAUDE.md)
