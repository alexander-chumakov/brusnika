/**
 * demo-modal.js — Lessons modal IIFE (documentation mirror)
 *
 * Phase 3 (03-02) wired the real submit: the handler now POSTs to /api/book and
 * shows #lessons-thanks on success or #lessons-error on failure (D-14/D-15).
 * Everything else (open/close/escape/click-outside) stays as-is.
 *
 * This file is the documentation source for the <script is:inline> block inlined in
 * Layout.astro; the two MUST stay in sync (PATTERNS.md observation 3). Layout.astro
 * is the master that actually runs.
 */
(function demoModal() {
  var overlay = document.getElementById('lessons-overlay');
  var dialog = document.getElementById('lessons-dialog');
  var form = document.getElementById('lessons-form');
  var thanks = document.getElementById('lessons-thanks');
  var error = document.getElementById('lessons-error');
  var submitBtn = form ? form.querySelector('[type="submit"]') : null;

  function openLessons() {
    if (!overlay || !form || !thanks) return;
    form.style.display = 'flex';
    thanks.style.display = 'none';
    if (error) error.style.display = 'none';
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

  // Real submit — POST to /api/book; success shows thanks, failure shows the
  // non-silent error state with the Telegram fallback link (D-14). Stays is:inline.
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitText = submitBtn ? submitBtn.textContent : null;
      if (submitBtn) {
        submitBtn.textContent = 'отправляем...';
        submitBtn.setAttribute('disabled', '');
        submitBtn.setAttribute('aria-busy', 'true');
      }
      fetch('/api/book', { method: 'POST', body: new FormData(form) })
        .then(function (res) {
          if (res.ok) {
            form.style.display = 'none';
            if (thanks) thanks.style.display = 'block';
          } else {
            form.style.display = 'none';
            if (error) error.style.display = 'flex';
          }
        })
        .catch(function () {
          // Network failure → error state, never silent (D-14)
          form.style.display = 'none';
          if (error) error.style.display = 'flex';
        })
        .finally(function () {
          if (submitBtn) {
            if (submitText) submitBtn.textContent = submitText;
            submitBtn.removeAttribute('disabled');
            submitBtn.removeAttribute('aria-busy');
          }
        });
    });
  }

  // Retry — return from error state to the form, values retained (non-destructive)
  if (error) {
    var retryBtn = error.querySelector('.error-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        error.style.display = 'none';
        if (form) form.style.display = 'flex';
      });
    }
  }
})();
