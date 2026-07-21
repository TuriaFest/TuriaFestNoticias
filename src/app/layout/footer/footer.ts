import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'fv-footer',
  imports: [NgOptimizedImage, RouterLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fv-footer-host' },
})
export class Footer {}
