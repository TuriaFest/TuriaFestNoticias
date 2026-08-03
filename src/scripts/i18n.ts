// ============================================================================
// i18n.ts — TuriaFestNoticias · client-side language switching island
// ============================================================================
// The page is server-rendered in Spanish with `data-i18n` anchors. Switching
// language fetches the locale dictionary (mirroring the old Transloco HTTP
// loader), re-resolves every `[data-i18n]` node, updates `<html lang>`, the
// nav flag and the SEO meta, then dispatches `fv:langchange` so dependent
// islands (e.g. the news search) can rebuild.
//
// Contract for `data-i18n` anchors:
//   data-i18n="dotted.key"         — replace textContent (leaf text nodes only)
//   data-i18n-attr="aria-label,placeholder" — replace those attributes
//   data-i18n-params='{"q":"..."}' — interpolation params for the text
// ============================================================================

import {
  DEFAULT_LANG,
  getLanguage,
  isLangCode,
  t as translate,
  type LangCode,
} from '@i18n/index';
import type { Translations } from '@i18n/translations';

let activeLang: LangCode = DEFAULT_LANG;

const dictionaryCache = new Map<LangCode, Translations>();

/** Resolve a key against a cached dictionary (Spanish fallback to raw key). */
export function translateKey(
  key: string,
  params?: Record<string, unknown>,
  lang: LangCode = activeLang,
): string {
  const dict = dictionaryCache.get(lang);
  if (!dict) return key;
  return translate(key as never, dict, params);
}

export function getActiveLang(): LangCode {
  return activeLang;
}

/** Fetch (and cache) the locale dictionary — Spanish preloaded on init. */
export async function getDictionary(lang: LangCode): Promise<Translations | null> {
  const cached = dictionaryCache.get(lang);
  if (cached) return cached;

  try {
    const response = await fetch(`/assets/i18n/${lang}.json`);
    if (!response.ok) return null;
    const dict = (await response.json()) as Translations;
    dictionaryCache.set(lang, dict);
    return dict;
  } catch {
    return null;
  }
}

/** Replaces `{{ key }}` placeholders with values from params. */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{{ ${k} }}`,
  );
}

/** Apply the active dictionary to every `[data-i18n]` node in the document. */
function applyTranslations(dict: Translations): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-i18n]');
  for (const node of nodes) {
    const key = node.dataset['i18n'];
    if (!key) continue;

    const params = node.dataset['i18nParams'];
    const paramsValue: Record<string, unknown> | undefined = params
      ? (JSON.parse(params) as Record<string, unknown>)
      : undefined;

    const attrNames = node.dataset['i18nAttr'];
    if (attrNames) {
      const value = translate(key as never, dict, paramsValue);
      for (const name of attrNames.split(',').map((name) => name.trim())) {
        node.setAttribute(name, value);
      }
    }

    if (!node.children.length) {
      node.textContent = interpolate(translate(key as never, dict, undefined), paramsValue);
    }
  }
}

function updateSeoCopy(): void {
  const script = document.getElementById('fv-seo-copy');
  if (!script?.textContent) return;
  try {
    const copy = JSON.parse(script.textContent) as Record<
      string,
      { title: string; description: string } | undefined
    >;
    const pageCopy = copy[activeLang];
    if (!pageCopy) return;

    document.title = pageCopy.title;
    const set = (selector: string, value: string): void => {
      const meta = document.querySelector(selector);
      meta?.setAttribute('content', value);
    };
    set('meta[name="description"]', pageCopy.description);
    set('meta[data-fv-og-title]', pageCopy.title);
    set('meta[data-fv-og-description]', pageCopy.description);
    set('meta[data-fv-twitter-title]', pageCopy.title);
    set('meta[data-fv-twitter-description]', pageCopy.description);
  } catch {
    // Malformed embedded copy — keep the server-rendered (Spanish) meta.
  }
}

function updateDocumentLanguage(): void {
  const language = getLanguage(activeLang);
  document.documentElement.lang = language.localeTag;
  document
    .querySelector('meta[http-equiv="Content-Language"]')
    ?.setAttribute('content', activeLang);
}

function updateLanguageFlag(): void {
  const language = getLanguage(activeLang);
  const flag = document.querySelector<HTMLImageElement>('.nav-bar__language-flag');
  if (flag) {
    flag.src = language.flag;
    flag.alt = language.label;
  }
  for (const option of document.querySelectorAll<HTMLButtonElement>('[data-lang-option]')) {
    const isActive = option.dataset['langOption'] === activeLang;
    option.classList.toggle('nav-bar__language-option--active', isActive);
    if (isActive) option.setAttribute('aria-current', 'true');
    else option.removeAttribute('aria-current');
  }
}

/** Switch the active language and re-render every anchored translation. */
export async function selectLanguage(lang: string): Promise<void> {
  if (!isLangCode(lang) || lang === activeLang) return;

  const dict = await getDictionary(lang);
  if (!dict) return;

  activeLang = lang;
  applyTranslations(dict);
  updateDocumentLanguage();
  updateLanguageFlag();
  updateSeoCopy();
  window.dispatchEvent(new CustomEvent('fv:langchange', { detail: { lang } }));
}

/** Preload the Spanish dictionary (mirrors the old `preloadDefaultLang`). */
export async function initI18n(): Promise<void> {
  await getDictionary(DEFAULT_LANG);
}
