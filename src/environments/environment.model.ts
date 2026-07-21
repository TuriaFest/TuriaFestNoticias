export interface Environment {
  production: boolean;
  defaultLocale: 'es-ES';
  /** Absolute base URL used for hreflang and canonical tags. No trailing slash. */
  baseUrl: string;
  sanity: {
    projectId: string;
    dataset: 'development' | 'production';
    apiVersion: '2024-01-01';
    useCdn: boolean;
  };
  maps: {
    /** MapLibre GL style URL. Replace with self-hosted Protomaps tiles in production. */
    styleUrl: string;
    /** Default center [lng, lat] over the Valencian Community. */
    center: [number, number];
    zoom: number;
  };
  sentry: {
    /** Sentry DSN. Leave empty to disable reporting (development). */
    dsn: string;
  };
}
