/**
 * releases.ts — Featured releases for the hero slideshow in ReleasesSection.
 *
 * Exactly 3 slides (one per year), newest first.
 * All CTAs point to the Spotify artist page; per-release deep-links are
 * deferred until the band confirms canonical URLs (mirrors site.ts convention).
 *
 * Images are imported as ESM assets so Astro's <Image> component can
 * process and optimise them at build time.
 */

import type { ImageMetadata } from 'astro';
import bandTableImg from '../assets/images/band-table.jpg';
import gGuitarImg from '../assets/images/g-guitar.jpg';
import featuredImg from '../assets/images/featured.jpg';

export interface ReleaseSlide {
  year: string;
  eyebrow: string;
  title: string;
  desc: string;
  ctaLabel: string;
  meta: string;
  image: ImageMetadata;
  imagePosition: string;
  url: string;
}

const SP = 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B';

export const releaseSlides: ReleaseSlide[] = [
  {
    year: '2026',
    eyebrow: 'новый сингл · 2026',
    title: 'Доодури',
    desc: 'Самый свежий релиз — тёплый и негромкий, как поздняя весна.',
    ctaLabel: '▶ слушать',
    meta: 'сингл · 15 мая 2026',
    image: bandTableImg,
    imagePosition: 'center 32%',
    url: SP,
  },
  {
    year: '2025',
    eyebrow: 'EP + Deluxe · 2025',
    title: 'Преисполненный',
    desc: 'Песни о свободе и взрослении — с расширенным Deluxe-изданием.',
    ctaLabel: '▶ слушать',
    meta: 'EP · 24 октября 2025',
    image: gGuitarImg,
    imagePosition: 'center 42%',
    url: SP,
  },
  {
    year: '2024',
    eyebrow: 'дебютный альбом · 2024',
    title: 'Неоднозначное',
    desc: 'Одиннадцать песен о любви, памяти и взрослении. Тёплые гитары, синтезаторы и шорох плёнки.',
    ctaLabel: '▶ слушать целиком',
    meta: '11 треков · 38 мин',
    image: featuredImg,
    imagePosition: 'center 42%',
    url: SP,
  },
];
