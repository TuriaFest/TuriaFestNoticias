import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@data': alias('./src/data'),
      '@i18n': alias('./src/i18n'),
      '@lib': alias('./src/lib'),
      '@assets': alias('./src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
