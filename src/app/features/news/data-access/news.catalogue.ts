import type { NewsArticle } from './news-article.model';

export const REVE_FEST_2026_ARTICLE_SLUG = 'reve-fest-2026-nueve-horas-musica-urbana';

const REVE_FEST_NEWS_ASSET_ROOT = `/assets/images/news/${REVE_FEST_2026_ARTICLE_SLUG}`;

export const NEWS_ARTICLES: readonly NewsArticle[] = [
  {
    id: 'reve-fest-2026',
    slug: REVE_FEST_2026_ARTICLE_SLUG,
    titleKey: 'news.articles.reveFest2026.title',
    summaryKey: 'news.articles.reveFest2026.summary',
    cityKey: 'news.articles.reveFest2026.city',
    categoryKey: 'news.articles.reveFest2026.category',
    searchGenresKey: 'news.articles.reveFest2026.searchGenres',
    publishedLabelKey: 'news.articles.reveFest2026.publishedLabel',
    publishedAt: '2026-07-21T18:30:00+02:00',
    modifiedAt: '2026-07-21T18:30:00+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.reveFest2026.seoTitle',
    seoDescriptionKey: 'news.articles.reveFest2026.seoDescription',
    cover: {
      src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-cover-1600.webp`,
      width: 1600,
      height: 1200,
      altKey: 'news.articles.reveFest2026.coverAlt',
      captionKey: 'news.articles.reveFest2026.coverCaption',
    },
    cardImage: {
      src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-cover-640.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.reveFest2026.coverAlt',
    },
    socialImage: {
      src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.reveFest2026.coverAlt',
    },
    highlightKey: 'news.articles.reveFest2026.highlight',
    sections: [
      {
        headingKey: 'news.articles.reveFest2026.sections.debut.heading',
        paragraphKeys: [
          'news.articles.reveFest2026.sections.debut.paragraph1',
          'news.articles.reveFest2026.sections.debut.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.reveFest2026.sections.lineup.heading',
        paragraphKeys: [
          'news.articles.reveFest2026.sections.lineup.paragraph1',
          'news.articles.reveFest2026.sections.lineup.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.reveFest2026.sections.purpose.heading',
        paragraphKeys: [
          'news.articles.reveFest2026.sections.purpose.paragraph1',
          'news.articles.reveFest2026.sections.purpose.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.reveFest2026.gallery.title',
    gallery: [
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-01-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.reveFest2026.gallery.openingAlt',
        captionKey: 'news.articles.reveFest2026.gallery.openingCaption',
      },
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-02-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.reveFest2026.gallery.stageAlt',
        captionKey: 'news.articles.reveFest2026.gallery.stageCaption',
      },
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-03-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.reveFest2026.gallery.afternoonAlt',
        captionKey: 'news.articles.reveFest2026.gallery.afternoonCaption',
      },
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-04-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.reveFest2026.gallery.eveningAlt',
        captionKey: 'news.articles.reveFest2026.gallery.eveningCaption',
      },
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.reveFest2026.gallery.closingAlt',
        captionKey: 'news.articles.reveFest2026.gallery.closingCaption',
      },
      {
        src: `${REVE_FEST_NEWS_ASSET_ROOT}/reve-fest-2026-gallery-06-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.reveFest2026.gallery.finalAlt',
        captionKey: 'news.articles.reveFest2026.gallery.finalCaption',
      },
    ],
    source: {
      nameKey: 'news.articles.reveFest2026.sourceName',
      url: 'https://www.roigarena.com/es/noticias/reve-fest-trae-nueve-horas-sonido-urbano-roig-arena/',
      verifiedLabelKey: 'news.articles.reveFest2026.sourceVerified',
    },
  },
];

export function getNewsArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}
