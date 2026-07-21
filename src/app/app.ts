import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from '@core/platform/theme.service';
import { NavBar } from '@layout/nav-bar/nav-bar';

@Component({
  selector: 'fv-root',
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    inject(ThemeService);
  }
}
