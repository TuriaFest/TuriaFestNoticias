import type { NewsArticle } from './news-article.model';

export const LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG =
  'latin-fest-valencia-2026-dos-dias-musica-urbana';
export const REVE_FEST_2026_ARTICLE_SLUG = 'reve-fest-2026-nueve-horas-musica-urbana';

const LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT =
  `/assets/images/news/${LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG}`;
const REVE_FEST_NEWS_ASSET_ROOT = `/assets/images/news/${REVE_FEST_2026_ARTICLE_SLUG}`;

export const NEWS_ARTICLES: readonly NewsArticle[] = [
  {
    id: 'latin-fest-valencia-2026',
    slug: LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
    titleKey: 'news.articles.latinFestValencia2026.title',
    summaryKey: 'news.articles.latinFestValencia2026.summary',
    cityKey: 'news.articles.latinFestValencia2026.city',
    categoryKey: 'news.articles.latinFestValencia2026.category',
    searchGenresKey: 'news.articles.latinFestValencia2026.searchGenres',
    publishedLabelKey: 'news.articles.latinFestValencia2026.publishedLabel',
    publishedAt: '2026-07-21T19:41:00+02:00',
    modifiedAt: '2026-07-21T19:41:00+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.latinFestValencia2026.seoTitle',
    seoDescriptionKey: 'news.articles.latinFestValencia2026.seoDescription',
    cover: {
      src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-cover-1600.webp`,
      width: 1600,
      height: 1200,
      altKey: 'news.articles.latinFestValencia2026.coverAlt',
      captionKey: 'news.articles.latinFestValencia2026.coverCaption',
    },
    cardImage: {
      src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-cover-640.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.latinFestValencia2026.coverAlt',
    },
    socialImage: {
      src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.latinFestValencia2026.coverAlt',
    },
    highlightKey: 'news.articles.latinFestValencia2026.highlight',
    sections: [
      {
        headingKey: 'news.articles.latinFestValencia2026.sections.newStage.heading',
        paragraphKeys: [
          'news.articles.latinFestValencia2026.sections.newStage.paragraph1',
          'news.articles.latinFestValencia2026.sections.newStage.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.latinFestValencia2026.sections.friday.heading',
        paragraphKeys: [
          'news.articles.latinFestValencia2026.sections.friday.paragraph1',
          'news.articles.latinFestValencia2026.sections.friday.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.latinFestValencia2026.sections.saturday.heading',
        paragraphKeys: [
          'news.articles.latinFestValencia2026.sections.saturday.paragraph1',
          'news.articles.latinFestValencia2026.sections.saturday.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.latinFestValencia2026.gallery.title',
    gallery: [
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-01-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.fridayOpeningAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.fridayOpeningCaption',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-02-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.fridayStageAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.fridayStageCaption',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-03-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.fridayCloseAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.fridayCloseCaption',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-04-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.saturdayOpeningAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.saturdayOpeningCaption',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.saturdayNightAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.saturdayNightCaption',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-06-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.finalAlt',
        captionKey: 'news.articles.latinFestValencia2026.gallery.finalCaption',
      },
    ],
    source: {
      url: 'https://latinfest.es/valencia/',
    },
  },
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
    modifiedAt: '2026-07-21T19:28:00+02:00',
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
      url: 'https://www.roigarena.com/es/noticias/reve-fest-trae-nueve-horas-sonido-urbano-roig-arena/',
    },
  },
];

export function getNewsArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}
