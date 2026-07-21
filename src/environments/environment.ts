// ============================================================================
// environment.ts — TuriaFestNoticias · default (development)
// ============================================================================
// Base URLs, feature flags and endpoints belong here — never hardcoded in
// services. See `CLAUDE.md` § Configuration.
// ============================================================================

import type { Environment } from './environment.model';

export const environment = {
  production: false,
  defaultLocale: 'es-ES',
  baseUrl: 'http://localhost:4200',
  sanity: {
    projectId: '',
    dataset: 'development',
    apiVersion: '2024-01-01',
    useCdn: false,
  },
  maps: {
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-0.40, 39.25],
    zoom: 7.2,
  },
  sentry: {
    dsn: '',
  },
} satisfies Environment;
