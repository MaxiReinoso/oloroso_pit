/*
 * Oloroso Pit — single point of change for the displayed brand name.
 * Revision: 4 · Approval: pending (2026-11-13)
 *
 * Usage in any local HTML preview:
 *   <h1 data-brand-name>Oloroso Pit</h1>
 *   <title data-brand-title>Oloroso Pit — Catálogo</title>
 *
 * The element keeps working without JavaScript because the fallback text is
 * already written in the HTML. This script only overwrites it.
 *
 * Accessibility:
 *  - Uses textContent (never innerHTML), so the constant cannot inject markup.
 *  - Preserves any aria-label the author wrote; only visible text changes.
 *  - Skips elements marked [data-brand-skip] (e.g. legal disclaimers).
 */
(function () {
  "use strict";

  /* PROVISIONAL (TBD): confirm the final commercial name with the owners. */
  var BRAND_NAME = "Oloroso Pit";

  function applyBrandName(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-brand-name]");
    var i;

    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].hasAttribute("data-brand-skip")) {
        continue;
      }
      nodes[i].textContent = BRAND_NAME;
    }

    var titles = scope.querySelectorAll("[data-brand-title]");
    for (i = 0; i < titles.length; i += 1) {
      titles[i].textContent = BRAND_NAME + " — Catálogo";
    }

    document.documentElement.setAttribute("data-brand", BRAND_NAME);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyBrandName(document);
    });
  } else {
    applyBrandName(document);
  }

  /* Exposed for future previews or tests; read-only by convention. */
  window.OLOROSO_BRAND = Object.freeze({
    name: BRAND_NAME,
    provisional: true,
  });
})();
