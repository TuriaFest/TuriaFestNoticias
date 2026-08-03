import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const alias = (path) => fileURLToPath(new URL(path, import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'static',
  redirects: {
    '/': '/noticias',
  },
  vite: {
    resolve: {
      alias: {
        '@data': alias('./src/data'),
        '@i18n': alias('./src/i18n'),
        '@lib': alias('./src/lib'),
        '@assets': alias('./src/assets'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          loadPaths: ['src'],
        },
      },
    },
  },
});
