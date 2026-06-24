/**
 * demo-player.js — THROWAWAY demo: fake now-playing bar (D-04)
 *
 * Verbatim port from index.html lines 413-425.
 * Isolated: when Phase 2 audio island lands, delete this file and
 * its <script> import in TracksSection.astro (or Layout.astro).
 *
 * Uses is:inline in Astro to preserve IIFE without bundling (Assumption A2 resolved).
 */
(function demoDemoPlayer() {
  var npBar = document.getElementById('now-playing');
  var npTitle = document.getElementById('np-title');
  var npIndex = document.getElementById('np-index');
  document.querySelectorAll('.track').forEach(function (btn) {
    btn.addEventListener('click', function () {
      npTitle.textContent = btn.dataset.title;
      npIndex.textContent = 'трек ' + btn.dataset.i;
      npBar.style.display = 'flex';
    });
  });
  document.getElementById('np-close').addEventListener('click', function () {
    npBar.style.display = 'none';
  });
})();
