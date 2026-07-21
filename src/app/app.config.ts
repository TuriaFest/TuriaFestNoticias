import {
  APP_INITIALIZER,
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { lastValueFrom } from 'rxjs';

import { TranslocoHttpLoader } from '@core/initializers/transloco.loader';
import { environment } from '@env/environment';
import { routes } from './app.routes';

registerLocaleData(localeEs);

function preloadDefaultLang(transloco: TranslocoService): () => Promise<void> {
  return () => lastValueFrom(transloco.load('es')).then(() => void 0);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: ['es', 'ca', 'en'],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: environment.production,
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: preloadDefaultLang,
      deps: [TranslocoService],
      multi: true,
    },
  ],
};
