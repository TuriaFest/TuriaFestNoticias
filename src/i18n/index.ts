// ============================================================================
// index.ts — TuriaFestNoticias · i18n runtime translator
// ============================================================================
// Framework-free translation resolution. Pages render server-side with the
// Spanish source-of-truth dictionary (`ES_TRANSLATIONS`); the language
// switcher island fetches the selected locale JSON at runtime and re-resolves
// every `[data-i18n]` node with the same `t()` semantics (see NavBar island).
// ============================================================================

import type { TranslationKey, Translations } from './translations';

/** Locales the portal ships with. `es` is the source of truth. */
export type LangCode = 'es' | 'ca' | 'en';

export interface Language {
  readonly code: LangCode;
  readonly label: string;
  readonly flag: string;
  readonly localeTag: string;
}

export const LANGUAGES: readonly Language[] = [
  { code: 'es', label: 'Español', flag: '/assets/images/flags/flag-es.webp', localeTag: 'es-ES' },
  {
    code: 'ca',
    label: 'Valencià',
    flag: '/assets/images/flags/flag-ca.webp',
    localeTag: 'ca-ES-valencia',
  },
  { code: 'en', label: 'English', flag: '/assets/images/flags/flag-en.webp', localeTag: 'en-GB' },
];

export const DEFAULT_LANG: LangCode = 'es';

export function isLangCode(value: string | null): value is LangCode {
  return value === 'es' || value === 'ca' || value === 'en';
}

export function getLanguage(code: LangCode): Language {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}

/** Replaces `{{ key }}` placeholders with values from params. */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{{ ${k} }}`,
  );
}

export function resolveKey(dict: Translations, key: string): string | undefined {
  const segments = key.split('.');
  let cursor: unknown = dict;

  for (const segment of segments) {
    if (cursor && typeof cursor === 'object' && segment in cursor) {
      cursor = (cursor as Record<string, unknown>)[segment];
      continue;
    }
    return undefined;
  }

  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Resolve a dotted key (`nav.home`, `news.title`) against a dictionary.
 * Falls back to the Spanish bundle and finally to the raw key so callers
 * never throw.
 */
export function t(
  key: TranslationKey,
  dict: Translations,
  params?: Record<string, unknown>,
): string {
  return interpolate(resolveKey(dict, key) ?? key, params);
}
