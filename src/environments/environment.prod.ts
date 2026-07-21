// ============================================================================
// environment.prod.ts — TuriaFestNoticias · production
// ============================================================================

import type { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  defaultLocale: 'es-ES',
  baseUrl: 'https://turia-fest-noticias.rngheru.workers.dev',
  sanity: {
    projectId: '',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  },
  maps: {
    styleUrl: '/assets/maps/festival-dark.json',
    center: [-0.40, 39.25],
    zoom: 7.2,
  },
  sentry: {
    dsn: '',
  },
} as const;
