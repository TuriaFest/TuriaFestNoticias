// ============================================================================
// translations.ts — TuriaFestNoticias · i18n source dictionary
// ============================================================================
// Imports the `es-ES` source-of-truth JSON via the `@assets/*` alias. The
// shape of the JSON drives the `Translations` type — every other locale must
// stay in key parity with it (see `i18n-commit-policy` skill).
// ============================================================================

import esTranslations from '@assets/i18n/es.json';

/** Source-of-truth Spanish dictionary. */
export const ES_TRANSLATIONS = esTranslations;

/** Structural shape every locale file must respect. */
export type Translations = typeof esTranslations;

/**
 * Dotted key paths derived from the translations shape. Mirrors keys like
 * `nav.home`, `home.hero.title`. Excludes intermediate node paths.
 */
export type TranslationKey = LeafPaths<Translations>;

// ---------------------------------------------------------------------------
// Internal: derive `'a.b.c'` literal-union type from a nested string dict.
// ---------------------------------------------------------------------------

type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? LeafPaths<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];
