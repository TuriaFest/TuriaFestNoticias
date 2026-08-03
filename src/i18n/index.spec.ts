import { describe, it, expect } from 'vitest';

import { ES_TRANSLATIONS } from '@i18n/translations';
import { DEFAULT_LANG, getLanguage, interpolate, isLangCode, LANGUAGES, t } from '@i18n/index';

describe('i18n translator', () => {
  it('exposes the three supported locales in order', () => {
    expect(LANGUAGES.map((lang) => lang.code)).toEqual(['es', 'ca', 'en']);
    expect(DEFAULT_LANG).toBe('es');
  });

  it('maps locales to their HTML lang tags', () => {
    expect(getLanguage('es').localeTag).toBe('es-ES');
    expect(getLanguage('ca').localeTag).toBe('ca-ES-valencia');
    expect(getLanguage('en').localeTag).toBe('en-GB');
  });

  it('recognises valid language codes only', () => {
    expect(isLangCode('es')).toBe(true);
    expect(isLangCode('ca')).toBe(true);
    expect(isLangCode('en')).toBe(true);
    expect(isLangCode('fr')).toBe(false);
    expect(isLangCode(null)).toBe(false);
  });

  it('resolves dotted keys from the Spanish source dictionary', () => {
    expect(t('nav.home', ES_TRANSLATIONS)).toBe('Inicio');
    expect(t('news.title', ES_TRANSLATIONS)).toBe('Noticias');
  });

  it('interpolates named params with {{ key }} placeholders', () => {
    const template = 'Resultados para «{{ query }}»';
    expect(interpolate(template, { query: 'Zevra' })).toBe('Resultados para «Zevra»');
    expect(interpolate(template, {})).toBe(template);
    expect(interpolate(template)).toBe(template);
  });

  it('falls back to the raw key for unknown or non-string paths', () => {
    expect(t('does.not.exist' as never, ES_TRANSLATIONS)).toBe('does.not.exist');
  });

  it('guards against interpolating missing params', () => {
    expect(interpolate('Hola {{ name }}', { other: 'x' })).toBe('Hola {{ name }}');
  });
});
