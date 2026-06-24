/**
 * global-animations.js — Scroll-reveal + cursor-glow (FND-03, D-06)
 *
 * NOTE: This IIFE is inlined via <script is:inline> in Layout.astro, NOT this file directly.
 * This file is the isolated source reference (D-06). The <script is:inline> block in Layout.astro
 * contains the verbatim content.
 *
 * .js-reveal handoff (from global.css + 01-02 SUMMARY):
 * (1) An inline render-blocking <script> in <head> adds document.documentElement.classList.add('js-reveal')
 *     BEFORE first paint — prevents flash-then-hide of content.
 * (2) This IIFE wires the IntersectionObserver that adds .in to [data-reveal] elements.
 * Both steps ship together (see Layout.astro).
 *
 * prefers-reduced-motion: if user prefers reduced motion, we skip adding .js-reveal entirely
 * (content stays visible with no animation — progressive enhancement).
 *
 * Cursor-glow: mousemove on fine-pointer devices only (D-06).
 */
(function globalAnimations() {
  // Scroll reveal — IntersectionObserver adds .in to [data-reveal] elements (threshold 0.12)
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: immediately reveal all (no IntersectionObserver support)
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Cursor-follow glow — fine pointer devices only (D-06)
  var glow = document.getElementById('cursor-glow');
  if (glow && window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (ev) {
      glow.style.transform = 'translate(' + ev.clientX + 'px, ' + ev.clientY + 'px)';
    }, { passive: true });
  }
})();
