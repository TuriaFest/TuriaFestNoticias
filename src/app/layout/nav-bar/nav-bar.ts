import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideMenu, LucideMoon, LucideSearch, LucideSun } from '@lucide/angular';

import { ThemeService } from '@core/platform/theme.service';
import { TranslationService } from '@shared/data-access/i18n/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

type LangCode = 'es' | 'ca' | 'en';

interface LangOption {
  readonly code: LangCode;
  readonly label: string;
  readonly flag: string;
}

const LANGUAGES: readonly LangOption[] = [
  { code: 'es', label: 'Español', flag: 'assets/images/flags/flag-es.webp' },
  { code: 'ca', label: 'Valencià', flag: 'assets/images/flags/flag-ca.webp' },
  { code: 'en', label: 'English', flag: 'assets/images/flags/flag-en.webp' },
] as const;

@Component({
  selector: 'fv-nav-bar',
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    LucideSearch,
    LucideMoon,
    LucideSun,
    LucideMenu,
    TranslatePipe,
  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fv-nav-bar-host',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeLangMenu()',
  },
})
export class NavBar {
  readonly #theme = inject(ThemeService);
  readonly #translation = inject(TranslationService);

  protected readonly languages = LANGUAGES;
  protected readonly langMenuOpen = signal(false);
  protected readonly langMenuRef = viewChild<ElementRef<HTMLElement>>('langMenuContainer');

  protected readonly isDark = computed(() => this.#theme.resolvedTheme() === 'dark');
  protected readonly themeLabelKey = computed(() =>
    this.isDark() ? ('nav.theme.toLight' as const) : ('nav.theme.toDark' as const),
  );

  protected readonly activeLang = computed<LangCode>(
    () => this.#translation.activeLang() as LangCode,
  );

  protected readonly currentLang = computed(
    () => LANGUAGES.find((l) => l.code === this.activeLang()) ?? LANGUAGES[0],
  );

  protected toggleTheme(): void {
    this.#theme.toggle();
  }

  protected toggleLangMenu(): void {
    this.langMenuOpen.update((v) => !v);
  }

  protected closeLangMenu(): void {
    this.langMenuOpen.set(false);
  }

  protected selectLang(code: LangCode): void {
    void this.#translation.switchLang(code);
    this.closeLangMenu();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.langMenuOpen()) return;
    const container = this.langMenuRef()?.nativeElement;
    if (container && !container.contains(event.target as Node)) {
      this.closeLangMenu();
    }
  }
}
