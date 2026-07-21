// Architectural exception: Transloco's HTTP loader pattern requires HttpClient here.
// This is a framework initializer, not a data-access service. The call is limited
// to fetching static JSON assets — not business data.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  readonly #http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    return this.#http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
