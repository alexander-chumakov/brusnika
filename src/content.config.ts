/**
 * src/content.config.ts — Astro Content Layer configuration
 *
 * Defines tracks, shows, and gallery collections with zod schemas.
 * This is the v1→v2 CMS seam (FND-05, D-07): when a CMS is introduced in v2,
 * the loader swaps here — component getCollection() calls stay unchanged.
 *
 * Schema notes:
 *  - tracks: optional audioUrl + durationSeconds for Phase 2 data-fill (D-09)
 *  - shows: ticketUrl defaults to '#' (D-03 placeholder; Phase 4 fills real URLs)
 *  - gallery: gridSpan enum 'single'|'tall' (tall = grid-row: span 2)
 *
 * IMPORTANT: import z from 'astro/zod' NOT 'zod' (Pitfall 5 — Astro bundles Zod 4)
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tracks' }),
  schema: z.object({
    number: z.string(),                       // "01".."05" — display order + data-i attribute
    title: z.string(),                        // "Доодури"
    subtitle: z.string().optional(),          // "· сингл 2026"
    displayDuration: z.string().optional(),   // "4:18" — display string
    audioUrl: z.string().optional(),          // Phase 2 data-fill (D-09); absent for now
    durationSeconds: z.number().optional(),   // Phase 2 data-fill (D-09); absent for now
  }),
});

const shows = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shows' }),
  schema: z.object({
    dateDisplay: z.string(),                           // "12 сент"
    year: z.string(),                                  // "2026"
    city: z.string(),                                  // "Москва"
    venue: z.string(),                                 // "клуб «16 тонн»"
    ticketUrl: z.string().optional().default('#'),     // Phase 4 fills real URLs (D-03)
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    filename: z.string(),                               // "g-studio.jpg"
    alt: z.string(),
    gridSpan: z.enum(['single', 'tall']).default('single'), // 'tall' = grid-row: span 2
    order: z.number(),                                  // sort order 1..5
  }),
});

export const collections = { tracks, shows, gallery };
