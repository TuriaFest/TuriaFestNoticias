import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewsPageComponent } from './news.page';

describe('NewsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the news title and introduction', () => {
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-page-title"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="news-page-description"]')).not.toBeNull();
  });

  it('renders one semantic sample article', () => {
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const sample = root.querySelector('[data-testid="news-sample-article"]');

    expect(sample?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('article')).toHaveLength(1);
    expect(sample?.querySelector('[data-testid="news-sample-media"]')).not.toBeNull();
    expect(sample?.querySelector('.news-entry__marker')).toBeNull();
    expect(sample?.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-21');
  });
});
