/**
 * demo-modal.js — Lessons modal IIFE (D-05 throwaway demo)
 *
 * Phase 3 replaces ONLY this submit handler with fetch('/api/book').
 * Everything else (open/close/escape/click-outside) stays as-is.
 *
 * Isolation contract (D-05):
 * - The form submit handler calls e.preventDefault() and shows the #lessons-thanks block
 * - It makes NO fetch() or XMLHttpRequest — no input crosses any trust boundary (T-04-01)
 * - Phase 3 removes this file and replaces the submit handler in Layout.astro's inline script block
 *
 * Source file for the <script is:inline> block inlined in Layout.astro.
 */
(function demoModal() {
  var overlay = document.getElementById('lessons-overlay');
  var dialog = document.getElementById('lessons-dialog');
  var form = document.getElementById('lessons-form');
  var thanks = document.getElementById('lessons-thanks');

  function openLessons() {
    if (!overlay || !form || !thanks) return;
    form.style.display = 'flex';
    thanks.style.display = 'none';
    form.reset();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLessons() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Open modal from any [data-open-lessons] trigger (Nav pill + SingSection button)
  document.querySelectorAll('[data-open-lessons]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openLessons();
    });
  });

  // Close with × button
  document.querySelectorAll('.lessons-close').forEach(function (el) {
    el.addEventListener('click', closeLessons);
  });

  // Close on click-outside (click on overlay, not dialog)
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLessons();
    });
  }

  // Prevent clicks inside dialog from bubbling to overlay
  if (dialog) {
    dialog.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
      closeLessons();
    }
  });

  // Fake submit — D-05: e.preventDefault() + show thanks, NO fetch/XHR
  // Phase 3 replaces ONLY this handler with: fetch('/api/book', { method: 'POST', body: new FormData(form) })
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      if (thanks) thanks.style.display = 'block';
    });
  }
})();
