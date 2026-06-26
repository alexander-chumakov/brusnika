/**
 * releases.ts — Full discography for the hero slideshow in ReleasesSection.
 *
 * 19 releases across 6 years (2021–2026), newest first within the array.
 * All CTAs point to the Spotify artist page; per-release deep-links are
 * deferred until the band confirms canonical URLs (mirrors site.ts convention).
 *
 * Only 3 releases carry a photo (band-table.jpg / g-guitar.jpg / featured.jpg).
 * The other 16 render as themed placeholder tiles in ReleasesSection.
 * Images are imported as ESM assets so Astro's <Image> component can
 * process and optimise them at build time.
 */

import type { ImageMetadata } from 'astro';
import bandTableImg from '../assets/images/band-table.jpg';
import gGuitarImg from '../assets/images/g-guitar.jpg';
import featuredImg from '../assets/images/featured.jpg';

export interface Release {
  year: string;
  type: string;
  title: string;
  eyebrow: string;
  meta: string;
  desc?: string;
  image?: ImageMetadata;
  imagePosition?: string;
  url: string;
}

const SP = 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B';

export const releases: Release[] = [
  // ── 2026 ────────────────────────────────────────────────
  {
    year: '2026',
    type: 'сингл',
    title: 'Доодури',
    eyebrow: 'новый сингл · 2026',
    meta: 'сингл · 15 мая 2026',
    desc: 'Самый свежий релиз — тёплый и негромкий, как поздняя весна.',
    image: bandTableImg,
    imagePosition: 'center 32%',
    url: SP,
  },
  {
    year: '2026',
    type: 'сингл',
    title: 'Весеннее танго',
    eyebrow: 'сингл · 2026',
    meta: 'кавер на Анну Герман',
    url: SP,
  },
  {
    year: '2026',
    type: 'live',
    title: 'Home Session Live',
    eyebrow: 'live · 2026',
    meta: 'акустический live · апрель 2026',
    url: SP,
  },
  // ── 2025 ────────────────────────────────────────────────
  {
    year: '2025',
    type: 'EP + Deluxe',
    title: 'Преисполненный',
    eyebrow: 'EP + Deluxe · 2025',
    meta: 'EP · 24 октября 2025',
    desc: 'Песни о свободе и взрослении — с расширенным Deluxe-изданием.',
    image: gGuitarImg,
    imagePosition: 'center 42%',
    url: SP,
  },
  {
    year: '2025',
    type: 'live',
    title: 'Live Урбан 2024',
    eyebrow: 'live EP · 2025',
    meta: 'live EP · 14 марта 2025',
    url: SP,
  },
  {
    year: '2025',
    type: 'сингл',
    title: 'Научи меня быть',
    eyebrow: 'сингл · 2025',
    meta: 'сингл · 2025',
    url: SP,
  },
  {
    year: '2025',
    type: 'сингл',
    title: 'Вспомни меня',
    eyebrow: 'сингл · 2025',
    meta: 'с YERKATT · 2025',
    url: SP,
  },
  {
    year: '2025',
    type: 'сингл',
    title: 'Клуб Неоправданных Надежд',
    eyebrow: 'сингл · 2025',
    meta: 'сингл · 2025',
    url: SP,
  },
  {
    year: '2025',
    type: 'remix',
    title: 'куда летят мысли?',
    eyebrow: 'remix · 2025',
    meta: 'remix · 2025',
    url: SP,
  },
  // ── 2024 ────────────────────────────────────────────────
  {
    year: '2024',
    type: 'альбом',
    title: 'Неоднозначное',
    eyebrow: 'дебютный альбом · 2024',
    meta: 'альбом · 25 октября 2024',
    desc: 'Одиннадцать песен о любви, памяти и взрослении. Тёплые гитары, синтезаторы и шорох плёнки.',
    image: featuredImg,
    imagePosition: 'center 42%',
    url: SP,
  },
  {
    year: '2024',
    type: 'EP',
    title: 'неактуальное',
    eyebrow: 'EP · 2024',
    meta: 'EP · 29 января 2024',
    url: SP,
  },
  {
    year: '2024',
    type: 'сингл',
    title: 'Безнаказанным',
    eyebrow: 'сингл · 2024',
    meta: 'сингл · 2024',
    url: SP,
  },
  // ── 2023 ────────────────────────────────────────────────
  {
    year: '2023',
    type: 'сингл',
    title: 'Развлечение',
    eyebrow: 'сингл · 2023',
    meta: 'сингл · 2023',
    url: SP,
  },
  {
    year: '2023',
    type: 'сингл',
    title: 'Пари',
    eyebrow: 'сингл · 2023',
    meta: 'сингл · 2023',
    url: SP,
  },
  // ── 2022 ────────────────────────────────────────────────
  {
    year: '2022',
    type: 'сингл',
    title: 'Занавес',
    eyebrow: 'сингл · 2022',
    meta: 'сингл · 2022',
    url: SP,
  },
  {
    year: '2022',
    type: 'сингл',
    title: 'Осколки',
    eyebrow: 'сингл · 2022',
    meta: 'сингл · 2022',
    url: SP,
  },
  {
    year: '2022',
    type: 'сингл',
    title: 'Божья Коровка',
    eyebrow: 'сингл · 2022',
    meta: 'сингл · 2022',
    url: SP,
  },
  // ── 2021 ────────────────────────────────────────────────
  {
    year: '2021',
    type: 'EP',
    title: 'босиком',
    eyebrow: 'EP · 2021',
    meta: 'EP · 2021',
    url: SP,
  },
  {
    year: '2021',
    type: 'мини-альбом',
    title: 'как поймать себя (?)',
    eyebrow: 'мини-альбом · 2021',
    meta: 'мини-альбом · 2021',
    url: SP,
  },
];
