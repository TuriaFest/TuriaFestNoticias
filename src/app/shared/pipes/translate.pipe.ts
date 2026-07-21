// ============================================================================
// translate.pipe.ts — TuriaFestNoticias · Shared · i18n binding for templates
// ============================================================================
// Use:  {{ 'nav.home' | t }}
// Impure so Angular re-runs `transform` whenever change detection fires after
// a language switch (Transloco's `reRenderOnLangChange: true` triggers a CD
// cycle on the host view, which is enough to pick up the new value).
// ============================================================================

import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslationService } from '@shared/data-access/i18n/translation.service';
import type { TranslationKey } from '@shared/data-access/i18n/translations';

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  readonly #translator = inject(TranslationService);

  transform(key: TranslationKey, params?: Record<string, unknown>): string {
    this.#translator.activeLang(); // read Signal → Angular tracks lang changes
    return this.#translator.t(key, params);
  }
}
