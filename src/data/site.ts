/**
 * site.ts — Typed singleton data for внимание брусника!
 *
 * Models outbound links as data (LINK-01/02, D-07, D-08).
 * All placeholder '#' hrefs carry inline comments naming the deferral phase.
 *
 * streamingLinks ordering: Яндекс Музыка, VK Музыка first (LINK-01 requirement),
 * then Spotify, Apple Music, YouTube.
 *
 * Footer renders the subset: Spotify, Яндекс Музыка, Apple Music, YouTube (no VK Музыка).
 * TracksSection header renders: Spotify, Яндекс Музыка, YouTube (draft subset).
 * (VK Музыка is in the ordered array but omitted from both rendered subsets per design draft.)
 */

export interface Link {
  label: string;
  url: string;
}

/**
 * streamingLinks — ordered with Яндекс/VK first per LINK-01.
 * Footer renders [Spotify, Яндекс, Apple Music, YouTube] (index 2,0,3,4).
 * TracksSection renders [Spotify, Яндекс, YouTube] (index 2,0,4).
 */
export const streamingLinks = [
  {
    label: 'Яндекс Музыка',
    url: '#', // D-02: user supplies real Яндекс Музыка artist URL
  },
  {
    label: 'VK Музыка',
    url: '#', // D-02: user supplies real VK Музыка artist URL
  },
  {
    label: 'Spotify',
    url: 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B',
  },
  {
    label: 'Apple Music',
    url: '#', // D-03: Phase 4 fills real Apple Music artist URL
  },
  {
    label: 'YouTube',
    url: 'https://www.youtube.com/@vnimaniebrusnika',
  },
] as const;

/**
 * socialLinks — Telegram, VK, Instagram, email.
 */
export const socialLinks = [
  {
    label: 'Telegram',
    url: 'https://t.me/vnimaniebrusnika',
  },
  {
    label: 'VK',
    url: '#', // D-03: Phase 4 fills real VK community URL
  },
  {
    label: 'Instagram',
    url: '#', // D-03: Phase 4 fills real Instagram profile URL (footer-only)
  },
  {
    label: 'hello@brusnika.ru',
    url: 'mailto:hello@brusnika.ru', // D-03: draft email placeholder
  },
] as const;

/**
 * horoterapiyaUrl — real Timepad event for the upcoming хоротерапия session.
 */
export const horoterapiyaUrl =
  'https://sonya-brusnika.timepad.ru/event/4010316/';
