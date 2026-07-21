// ============================================================================
// translation.service.ts — TuriaFestNoticias · Shared · runtime translator
// ============================================================================
// Adapts between the internal `t(key)` API and Transloco. When Transloco is
// provided (production, via app.config.ts), all translation calls delegate to
// it and language switching is fully reactive. When Transloco is absent (unit
// tests), the service falls back to the static ES_TRANSLATIONS bundle so tests
// need zero extra setup.
// ============================================================================

import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { filter, firstValueFrom, map, merge } from 'rxjs';

import { ES_TRANSLATIONS, type TranslationKey, type Translations } from './translations';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly #transloco = inject(TranslocoService, { optional: true });
  readonly #static = signal<Translations>(ES_TRANSLATIONS);

  readonly activeLang: Signal<string> = this.#transloco
    ? toSignal(
        merge(
          this.#transloco.langChanges$,
          this.#transloco.events$.pipe(
            filter((e) => e.type === 'translationLoadSuccess'),
            map(() => this.#transloco!.getActiveLang()),
          ),
        ),
        { initialValue: this.#transloco.getActiveLang() },
      )
    : signal('es');

  /**
   * Load the translation file for `lang` (if not cached) and set it as active.
   * Safe to call repeatedly — Transloco caches loaded translations.
   */
  async switchLang(lang: string): Promise<void> {
    if (!this.#transloco) return;
    await firstValueFrom(this.#transloco.load(lang));
    this.#transloco.setActiveLang(lang);
  }

  /**
   * Resolve a dotted key (`nav.home`, `home.hero.title`) in the active locale.
   * Falls back to the Spanish static bundle and finally to the raw key so
   * templates never throw.
   */
  t(key: TranslationKey, params?: Record<string, unknown>): string {
    if (this.#transloco) {
      const value = this.#transloco.translate<string>(key, params);
      return value !== key ? value : interpolate(resolveKey(this.#static(), key) ?? key, params);
    }
    return interpolate(resolveKey(this.#static(), key) ?? key, params);
  }

  /** Replace the static dictionary — used by tests. */
  setTranslations(next: Translations): void {
    this.#static.set(next);
  }
}

/** Replaces `{{ key }}` placeholders with values from params. */
function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{{ ${k} }}`,
  );
}

function resolveKey(dict: Translations, key: string): string | undefined {
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
