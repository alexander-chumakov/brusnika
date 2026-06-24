// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Dev-only Astro toolbar (Menu / Inspect / Audit / Settings) — hidden so it
  // doesn't get mistaken for site UI during local review. Never shipped to prod.
  devToolbar: { enabled: false },
  adapter: vercel({
    staticHeaders: true,
  }),
  image: {
    // Astro uses Sharp by default for build-time image optimization.
    // No additional config needed for Vercel static deployment.
  },
});
