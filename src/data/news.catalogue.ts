import type { NewsArticle } from './news-article.model';

export const ARENAL_SOUND_2027_PRESALE_ARTICLE_SLUG = 'arenal-sound-2027-fechas-preventa-abonos';
export const ZEVRA_2027_PRESALE_ARTICLE_SLUG = 'zevra-2027-fechas-preventa-abonos-cashless';
export const ZEVRA_2026_THIRD_DAY_ARTICLE_SLUG =
  'zevra-2026-tercera-jornada-anuel-aa-juan-magan-chanel';
export const ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG =
  'zevra-2026-segunda-jornada-ozuna-omar-montes-luar-la-l';
export const ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG = 'zevra-2026-primera-jornada-nicky-jam-jc-reyes';
export const LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG =
  'latin-fest-2027-registro-valencia-benidorm';
export const LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG =
  'latin-fest-valencia-2026-dos-dias-musica-urbana';
export const REVE_FEST_2026_ARTICLE_SLUG = 'reve-fest-2026-nueve-horas-musica-urbana';

const ARENAL_SOUND_2027_PRESALE_ASSET_ROOT = `/assets/images/news/${ARENAL_SOUND_2027_PRESALE_ARTICLE_SLUG}`;
const ZEVRA_2026_SECOND_DAY_ASSET_ROOT = `/assets/images/news/${ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG}`;
const ZEVRA_2026_THIRD_DAY_ASSET_ROOT = `/assets/images/news/${ZEVRA_2026_THIRD_DAY_ARTICLE_SLUG}`;
const ZEVRA_2026_FIRST_DAY_ASSET_ROOT = `/assets/images/news/${ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG}`;
const ZEVRA_2027_PRESALE_ASSET_ROOT = `/assets/images/news/${ZEVRA_2027_PRESALE_ARTICLE_SLUG}`;
const LATIN_FEST_2027_REGISTRATION_ASSET_ROOT = `/assets/images/news/${LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG}`;
const LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT = `/assets/images/news/${LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG}`;
const REVE_FEST_NEWS_ASSET_ROOT = `/assets/images/news/${REVE_FEST_2026_ARTICLE_SLUG}`;

export const NEWS_ARTICLES: readonly NewsArticle[] = [
  {
    id: 'arenal-sound-2027-presale',
    slug: ARENAL_SOUND_2027_PRESALE_ARTICLE_SLUG,
    titleKey: 'news.articles.arenalSound2027Presale.title',
    summaryKey: 'news.articles.arenalSound2027Presale.summary',
    cityKey: 'news.articles.arenalSound2027Presale.city',
    categoryKey: 'news.articles.arenalSound2027Presale.category',
    searchGenresKey: 'news.articles.arenalSound2027Presale.searchGenres',
    publishedLabelKey: 'news.articles.arenalSound2027Presale.publishedLabel',
    publishedAt: '2026-08-03T11:30:00+02:00',
    modifiedAt: '2026-08-03T11:30:00+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.arenalSound2027Presale.seoTitle',
    seoDescriptionKey: 'news.articles.arenalSound2027Presale.seoDescription',
    cover: {
      src: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-cover-1024.webp`,
      responsive: {
        srcset: '640w, 800w, 1024w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-cover-640.webp`,
          800: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-cover-800.webp`,
          1024: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-cover-1024.webp`,
        },
      },
      width: 1024,
      height: 768,
      altKey: 'news.articles.arenalSound2027Presale.coverAlt',
      captionKey: 'news.articles.arenalSound2027Presale.coverCaption',
    },
    cardImage: {
      src: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-card-640x400.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.arenalSound2027Presale.coverAlt',
    },
    socialImage: {
      src: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.arenalSound2027Presale.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.arenalSound2027Presale.sections.dates.heading',
        paragraphKeys: [
          'news.articles.arenalSound2027Presale.sections.dates.paragraph1',
          'news.articles.arenalSound2027Presale.sections.dates.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.arenalSound2027Presale.sections.presale.heading',
        paragraphKeys: [
          'news.articles.arenalSound2027Presale.sections.presale.paragraph1',
          'news.articles.arenalSound2027Presale.sections.presale.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.arenalSound2027Presale.sections.prices.heading',
        paragraphKeys: [
          'news.articles.arenalSound2027Presale.sections.prices.paragraph1',
          'news.articles.arenalSound2027Presale.sections.prices.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.arenalSound2027Presale.sections.info.heading',
        paragraphKeys: [
          'news.articles.arenalSound2027Presale.sections.info.paragraph1',
          'news.articles.arenalSound2027Presale.sections.info.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.arenalSound2027Presale.gallery.title',
    gallery: [
      {
        src: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-gallery-01-1024.webp`,
        width: 1024,
        height: 1281,
        altKey: 'news.articles.arenalSound2027Presale.gallery.presaleAlt',
        captionKey: 'news.articles.arenalSound2027Presale.gallery.presaleCaption',
      },
      {
        src: `${ARENAL_SOUND_2027_PRESALE_ASSET_ROOT}/arenal-sound-2027-gallery-02-1024.webp`,
        width: 1024,
        height: 1281,
        altKey: 'news.articles.arenalSound2027Presale.gallery.datesAlt',
        captionKey: 'news.articles.arenalSound2027Presale.gallery.datesCaption',
      },
    ],
    source: {
      url: 'https://arenalsound.com/',
      additionalUrls: [
        'https://www.instagram.com/p/DbkFKrWkale/',
        'https://www.instagram.com/p/Dbkgroaj1o-/',
      ],
    },
  },
  {
    id: 'zevra-2027-presale',
    slug: ZEVRA_2027_PRESALE_ARTICLE_SLUG,
    titleKey: 'news.articles.zevra2027Presale.title',
    summaryKey: 'news.articles.zevra2027Presale.summary',
    cityKey: 'news.articles.zevra2027Presale.city',
    categoryKey: 'news.articles.zevra2027Presale.category',
    searchGenresKey: 'news.articles.zevra2027Presale.searchGenres',
    publishedLabelKey: 'news.articles.zevra2027Presale.publishedLabel',
    publishedAt: '2026-07-27T17:57:28+02:00',
    modifiedAt: '2026-07-27T17:57:28+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.zevra2027Presale.seoTitle',
    seoDescriptionKey: 'news.articles.zevra2027Presale.seoDescription',
    cover: {
      src: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-cover-1600.webp`,
      responsive: {
        srcset: '640w, 800w, 1200w, 1600w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-cover-640.webp`,
          800: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-cover-800.webp`,
          1200: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-cover-1200.webp`,
          1600: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-cover-1600.webp`,
        },
      },
      width: 1600,
      height: 1200,
      altKey: 'news.articles.zevra2027Presale.coverAlt',
      captionKey: 'news.articles.zevra2027Presale.coverCaption',
    },
    cardImage: {
      src: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-card-640x400.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.zevra2027Presale.coverAlt',
    },
    socialImage: {
      src: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.zevra2027Presale.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.zevra2027Presale.sections.dates.heading',
        paragraphKeys: [
          'news.articles.zevra2027Presale.sections.dates.paragraph1',
          'news.articles.zevra2027Presale.sections.dates.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2027Presale.sections.presale.heading',
        paragraphKeys: [
          'news.articles.zevra2027Presale.sections.presale.paragraph1',
          'news.articles.zevra2027Presale.sections.presale.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2027Presale.sections.prices.heading',
        paragraphKeys: [
          'news.articles.zevra2027Presale.sections.prices.paragraph1',
          'news.articles.zevra2027Presale.sections.prices.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2027Presale.sections.cashless.heading',
        paragraphKeys: [
          'news.articles.zevra2027Presale.sections.cashless.paragraph1',
          'news.articles.zevra2027Presale.sections.cashless.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.zevra2027Presale.gallery.title',
    gallery: [
      {
        src: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-gallery-01-960.webp`,
        width: 960,
        height: 1200,
        altKey: 'news.articles.zevra2027Presale.gallery.presaleAlt',
        captionKey: 'news.articles.zevra2027Presale.gallery.presaleCaption',
      },
      {
        src: `${ZEVRA_2027_PRESALE_ASSET_ROOT}/zevra-2027-gallery-02-960.webp`,
        width: 960,
        height: 1200,
        altKey: 'news.articles.zevra2027Presale.gallery.cashlessAlt',
        captionKey: 'news.articles.zevra2027Presale.gallery.cashlessCaption',
      },
    ],
    source: {
      url: 'https://www.zevrafestival.com/',
      additionalUrls: ['https://www.instagram.com/p/DbTIr7ZCER2/'],
    },
  },
  {
    id: 'zevra-2026-third-day',
    slug: ZEVRA_2026_THIRD_DAY_ARTICLE_SLUG,
    titleKey: 'news.articles.zevra2026ThirdDay.title',
    summaryKey: 'news.articles.zevra2026ThirdDay.summary',
    cityKey: 'news.articles.zevra2026ThirdDay.city',
    categoryKey: 'news.articles.zevra2026ThirdDay.category',
    searchGenresKey: 'news.articles.zevra2026ThirdDay.searchGenres',
    publishedLabelKey: 'news.articles.zevra2026ThirdDay.publishedLabel',
    publishedAt: '2026-07-27T17:14:24+02:00',
    modifiedAt: '2026-07-27T17:14:24+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.zevra2026ThirdDay.seoTitle',
    seoDescriptionKey: 'news.articles.zevra2026ThirdDay.seoDescription',
    cover: {
      src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-cover-1600.webp`,
      responsive: {
        srcset: '640w, 800w, 1200w, 1600w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-cover-640.webp`,
          800: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-cover-800.webp`,
          1200: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-cover-1200.webp`,
          1600: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-cover-1600.webp`,
        },
      },
      width: 1600,
      height: 1200,
      altKey: 'news.articles.zevra2026ThirdDay.coverAlt',
      captionKey: 'news.articles.zevra2026ThirdDay.coverCaption',
    },
    cardImage: {
      src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-card-640x400.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.zevra2026ThirdDay.coverAlt',
    },
    socialImage: {
      src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.zevra2026ThirdDay.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.zevra2026ThirdDay.sections.opening.heading',
        paragraphKeys: [
          'news.articles.zevra2026ThirdDay.sections.opening.paragraph1',
          'news.articles.zevra2026ThirdDay.sections.opening.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026ThirdDay.sections.photos.heading',
        paragraphKeys: [
          'news.articles.zevra2026ThirdDay.sections.photos.paragraph1',
          'news.articles.zevra2026ThirdDay.sections.photos.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026ThirdDay.sections.mainStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026ThirdDay.sections.mainStages.paragraph1',
          'news.articles.zevra2026ThirdDay.sections.mainStages.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026ThirdDay.sections.beyond.heading',
        paragraphKeys: [
          'news.articles.zevra2026ThirdDay.sections.beyond.paragraph1',
          'news.articles.zevra2026ThirdDay.sections.beyond.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026ThirdDay.sections.lateStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026ThirdDay.sections.lateStages.paragraph1',
          'news.articles.zevra2026ThirdDay.sections.lateStages.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.zevra2026ThirdDay.gallery.title',
    gallery: [
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-01-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.redSmokeAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-02-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.backlightAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-03-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.raisedHandAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-04-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.redStageAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.redPortraitAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-06-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.closePortraitAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-07-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.orangePortraitAlt',
      },
      {
        src: `${ZEVRA_2026_THIRD_DAY_ASSET_ROOT}/zevra-2026-day-three-gallery-08-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026ThirdDay.gallery.profileAlt',
      },
    ],
    source: {
      url: 'https://www.zevrafestival.com/horarios',
      additionalUrls: [
        'https://www.zevrafestival.com/images/2026/Zevra_Horario_Domingo_update.jpg',
        'https://www.zevrafestival.com/',
      ],
    },
  },
  {
    id: 'zevra-2026-second-day',
    slug: ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG,
    titleKey: 'news.articles.zevra2026SecondDay.title',
    summaryKey: 'news.articles.zevra2026SecondDay.summary',
    cityKey: 'news.articles.zevra2026SecondDay.city',
    categoryKey: 'news.articles.zevra2026SecondDay.category',
    searchGenresKey: 'news.articles.zevra2026SecondDay.searchGenres',
    publishedLabelKey: 'news.articles.zevra2026SecondDay.publishedLabel',
    publishedAt: '2026-07-26T15:23:58+02:00',
    modifiedAt: '2026-07-26T15:41:21+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.zevra2026SecondDay.seoTitle',
    seoDescriptionKey: 'news.articles.zevra2026SecondDay.seoDescription',
    cover: {
      src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-cover-1600.webp`,
      responsive: {
        srcset: '640w, 800w, 1200w, 1600w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-cover-640.webp`,
          800: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-cover-800.webp`,
          1200: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-cover-1200.webp`,
          1600: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-cover-1600.webp`,
        },
      },
      width: 1600,
      height: 1200,
      altKey: 'news.articles.zevra2026SecondDay.coverAlt',
      captionKey: 'news.articles.zevra2026SecondDay.coverCaption',
    },
    cardImage: {
      src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-card-640x400.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.zevra2026SecondDay.coverAlt',
    },
    socialImage: {
      src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.zevra2026SecondDay.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.zevra2026SecondDay.sections.opening.heading',
        paragraphKeys: [
          'news.articles.zevra2026SecondDay.sections.opening.paragraph1',
          'news.articles.zevra2026SecondDay.sections.opening.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026SecondDay.sections.photos.heading',
        paragraphKeys: [
          'news.articles.zevra2026SecondDay.sections.photos.paragraph1',
          'news.articles.zevra2026SecondDay.sections.photos.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026SecondDay.sections.mainStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026SecondDay.sections.mainStages.paragraph1',
          'news.articles.zevra2026SecondDay.sections.mainStages.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026SecondDay.sections.arcadeBeyond.heading',
        paragraphKeys: [
          'news.articles.zevra2026SecondDay.sections.arcadeBeyond.paragraph1',
          'news.articles.zevra2026SecondDay.sections.arcadeBeyond.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026SecondDay.sections.lateStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026SecondDay.sections.lateStages.paragraph1',
          'news.articles.zevra2026SecondDay.sections.lateStages.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.zevra2026SecondDay.gallery.title',
    gallery: [
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-01-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.omarMontesAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-02-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.ozunaBlueAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-03-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.ozunaProfileAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-04-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.ozunaArmAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.luarWideAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-06-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.luarPairAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-07-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.luarGestureAlt',
      },
      {
        src: `${ZEVRA_2026_SECOND_DAY_ASSET_ROOT}/zevra-2026-day-two-gallery-08-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026SecondDay.gallery.luarCloseAlt',
      },
    ],
    source: {
      url: 'https://www.zevrafestival.com/horarios',
      additionalUrls: [
        'https://www.zevrafestival.com/images/2026/Zevra_Horario_Sabado_update.jpg',
        'https://www.zevrafestival.com/',
      ],
    },
  },
  {
    id: 'zevra-2026-first-day',
    slug: ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG,
    titleKey: 'news.articles.zevra2026FirstDay.title',
    summaryKey: 'news.articles.zevra2026FirstDay.summary',
    cityKey: 'news.articles.zevra2026FirstDay.city',
    categoryKey: 'news.articles.zevra2026FirstDay.category',
    searchGenresKey: 'news.articles.zevra2026FirstDay.searchGenres',
    publishedLabelKey: 'news.articles.zevra2026FirstDay.publishedLabel',
    publishedAt: '2026-07-25T14:05:00+02:00',
    modifiedAt: '2026-07-25T14:05:00+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.zevra2026FirstDay.seoTitle',
    seoDescriptionKey: 'news.articles.zevra2026FirstDay.seoDescription',
    cover: {
      src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-cover-1600.webp`,
      responsive: {
        srcset: '640w, 800w, 1200w, 1600w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-cover-640.webp`,
          800: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-cover-800.webp`,
          1200: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-cover-1200.webp`,
          1600: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-cover-1600.webp`,
        },
      },
      width: 1600,
      height: 1200,
      altKey: 'news.articles.zevra2026FirstDay.coverAlt',
      captionKey: 'news.articles.zevra2026FirstDay.coverCaption',
    },
    cardImage: {
      src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-card-640x400.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.zevra2026FirstDay.coverAlt',
    },
    socialImage: {
      src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.zevra2026FirstDay.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.zevra2026FirstDay.sections.opening.heading',
        paragraphKeys: [
          'news.articles.zevra2026FirstDay.sections.opening.paragraph1',
          'news.articles.zevra2026FirstDay.sections.opening.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026FirstDay.sections.photos.heading',
        paragraphKeys: [
          'news.articles.zevra2026FirstDay.sections.photos.paragraph1',
          'news.articles.zevra2026FirstDay.sections.photos.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026FirstDay.sections.mainStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026FirstDay.sections.mainStages.paragraph1',
          'news.articles.zevra2026FirstDay.sections.mainStages.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026FirstDay.sections.arcadeBeyond.heading',
        paragraphKeys: [
          'news.articles.zevra2026FirstDay.sections.arcadeBeyond.paragraph1',
          'news.articles.zevra2026FirstDay.sections.arcadeBeyond.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.zevra2026FirstDay.sections.lateStages.heading',
        paragraphKeys: [
          'news.articles.zevra2026FirstDay.sections.lateStages.paragraph1',
          'news.articles.zevra2026FirstDay.sections.lateStages.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.zevra2026FirstDay.gallery.title',
    gallery: [
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-01-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.nickyJamWideAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-02-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.nickyJamPortraitAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-03-960.webp`,
        width: 960,
        height: 1707,
        altKey: 'news.articles.zevra2026FirstDay.gallery.nickyJamRedAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-04-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.nickyJamLightsAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.jcReyesFlameAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-06-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.jcReyesCloseAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-07-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.jcReyesGreenAlt',
      },
      {
        src: `${ZEVRA_2026_FIRST_DAY_ASSET_ROOT}/zevra-2026-gallery-08-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.zevra2026FirstDay.gallery.jcReyesPurpleAlt',
      },
    ],
    source: {
      url: 'https://zevrafestival.com/horarios',
      additionalUrls: [
        'https://zevrafestival.com/images/2026/Zevra_Horario_Viernes_update.jpg',
        'https://www.zevrafestival.com/',
      ],
    },
  },
  {
    id: 'latin-fest-2027-registration',
    slug: LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG,
    titleKey: 'news.articles.latinFest2027Registration.title',
    summaryKey: 'news.articles.latinFest2027Registration.summary',
    cityKey: 'news.articles.latinFest2027Registration.city',
    categoryKey: 'news.articles.latinFest2027Registration.category',
    searchGenresKey: 'news.articles.latinFest2027Registration.searchGenres',
    publishedLabelKey: 'news.articles.latinFest2027Registration.publishedLabel',
    publishedAt: '2026-07-25T13:13:00+02:00',
    modifiedAt: '2026-07-25T13:49:03+02:00',
    authorKey: 'news.article.author',
    seoTitleKey: 'news.articles.latinFest2027Registration.seoTitle',
    seoDescriptionKey: 'news.articles.latinFest2027Registration.seoDescription',
    cover: {
      src: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-1600.webp`,
      responsive: {
        srcset: '640w, 800w, 1200w, 1600w',
        sizes:
          '(min-width: 1200px) 1104px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 48px)',
        sources: {
          640: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-detail-640.webp`,
          800: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-detail-800.webp`,
          1200: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-detail-1200.webp`,
          1600: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-1600.webp`,
        },
      },
      width: 1600,
      height: 1200,
      altKey: 'news.articles.latinFest2027Registration.coverAlt',
      captionKey: 'news.articles.latinFest2027Registration.coverCaption',
      creditKey: 'news.articles.latinFest2027Registration.imageCredit',
    },
    cardImage: {
      src: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-cover-640.webp`,
      width: 640,
      height: 400,
      altKey: 'news.articles.latinFest2027Registration.coverAlt',
    },
    socialImage: {
      src: `${LATIN_FEST_2027_REGISTRATION_ASSET_ROOT}/latin-fest-2027-social-1200x630.webp`,
      width: 1200,
      height: 630,
      altKey: 'news.articles.latinFest2027Registration.coverAlt',
    },
    sections: [
      {
        headingKey: 'news.articles.latinFest2027Registration.sections.launch.heading',
        paragraphKeys: [
          'news.articles.latinFest2027Registration.sections.launch.paragraph1',
          'news.articles.latinFest2027Registration.sections.launch.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.latinFest2027Registration.sections.valencia.heading',
        paragraphKeys: [
          'news.articles.latinFest2027Registration.sections.valencia.paragraph1',
          'news.articles.latinFest2027Registration.sections.valencia.paragraph2',
        ],
      },
      {
        headingKey: 'news.articles.latinFest2027Registration.sections.benidorm.heading',
        paragraphKeys: [
          'news.articles.latinFest2027Registration.sections.benidorm.paragraph1',
          'news.articles.latinFest2027Registration.sections.benidorm.paragraph2',
        ],
      },
    ],
    galleryTitleKey: 'news.articles.latinFest2027Registration.gallery.title',
    gallery: [],
    source: {
      url: 'https://www.instagram.com/p/DbK3BBHiPZd/',
      additionalUrls: ['https://www.instagram.com/p/DbK20XTiPqy/', 'https://latinfest.es/'],
    },
  },
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
    modifiedAt: '2026-07-21T21:42:04+02:00',
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
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-02-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.fridayStageAlt',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-03-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.fridayCloseAlt',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-04-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.saturdayOpeningAlt',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-05-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.saturdayNightAlt',
      },
      {
        src: `${LATIN_FEST_VALENCIA_NEWS_ASSET_ROOT}/latin-fest-valencia-2026-gallery-06-960.webp`,
        width: 960,
        height: 1280,
        altKey: 'news.articles.latinFestValencia2026.gallery.finalAlt',
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
