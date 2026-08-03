// ============================================================================
// site.ts — TuriaFestNoticias · canonical origin
// ============================================================================

/** Production origin. Canonicals and Open Graph URLs must be absolute. */
export const SITE_BASE_URL = 'https://turia-fest-noticias.rngheru.workers.dev';

/** Normalised base URL (no trailing slash). */
export const BASE_URL = SITE_BASE_URL.replace(/\/$/, '');

/** Default language for the `<html lang>` attribute and Content-Language. */
export const SITE_LANG = 'es-ES';

export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${BASE_URL}/${path.replace(/^\//, '')}`;
}
