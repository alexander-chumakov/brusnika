/**
 * releases.ts — Full discography data for внимание брусника!
 *
 * All 18 releases in chronological-reverse order (newest first).
 * Per-release real streaming/store links are deferred — every entry
 * currently points to the Spotify artist page.
 * Deferred: replace url values with per-release Spotify/Apple/Яндекс
 * links when available (mirrors site.ts deferral convention).
 */

export interface Release {
  type: string;    // сингл | EP | live | альбом | мини-альбом
  title: string;
  year: string;
  meta: string;    // '' when none
  live?: boolean;  // ● live badge
  cover?: boolean; // true ONLY for «Неоднозначное» → maps to featured.jpg
  url: string;
}

const SP = 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B';

export const releases: Release[] = [
  { type: 'сингл',       title: 'Доодури',                   year: '2026', meta: 'новый сингл · 15 мая',        url: SP },
  { type: 'сингл',       title: 'Весеннее танго',             year: '2026', meta: 'кавер на Анну Герман',        url: SP },
  { type: 'live',        title: 'Home Session',               year: '2026', meta: 'акустический live · апрель',  live: true, url: SP },
  { type: 'EP',          title: 'Преисполненный',             year: '2025', meta: 'EP + Deluxe',                 url: SP },
  { type: 'сингл',       title: 'Вспомни меня',               year: '2025', meta: 'с YERKATT',                  url: SP },
  { type: 'сингл',       title: 'Клуб Неоправданных Надежд', year: '2025', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Научи меня быть',            year: '2025', meta: '',                            url: SP },
  { type: 'live',        title: 'Live Урбан 2024',            year: '2025', meta: 'концертный EP',               live: true, url: SP },
  { type: 'альбом',      title: 'Неоднозначное',              year: '2024', meta: '11 песен · дебют',            cover: true, url: SP },
  { type: 'EP',          title: 'неактуальное',               year: '2024', meta: 'мини-альбом',                 url: SP },
  { type: 'сингл',       title: 'Безнаказанным',              year: '2024', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Развлечение',                year: '2023', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Пари',                       year: '2023', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Занавес',                    year: '2022', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Осколки',                    year: '2022', meta: '',                            url: SP },
  { type: 'сингл',       title: 'Божья Коровка',              year: '2022', meta: '',                            url: SP },
  { type: 'EP',          title: 'босиком',                    year: '2021', meta: '',                            url: SP },
  { type: 'мини-альбом', title: 'как поймать себя (?)',       year: '2021', meta: '',                            url: SP },
];
