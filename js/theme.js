/* theme.js — live look-and-feel toggle + demo (fallback) mode.
   State is held in JS memory only — NO localStorage/sessionStorage
   (they fail in some embedded / tab-share contexts). See DESIGN.md §9. */
(function () {
  "use strict";

  var state = { theme: "virgin", mode: "live" };

  function setTheme(name) {
    state.theme = name;
    document.documentElement.setAttribute("data-theme", name);
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-btn") === name));
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.documentElement.setAttribute("data-mode", mode);
    document.querySelectorAll("[data-fallback-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-fallback-btn") === mode));
    });
    // Broadcast so demo components can swap live widget <-> pre-recorded fallback.
    document.dispatchEvent(new CustomEvent("demomode", { detail: { mode: mode } }));
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-btn]");
    if (t) { setTheme(t.getAttribute("data-theme-btn")); return; }
    var f = e.target.closest("[data-fallback-btn]");
    if (f) { setMode(f.getAttribute("data-fallback-btn")); }
  });

  // expose for other scripts / console during a demo
  window.VV = window.VV || {};
  window.VV.setTheme = setTheme;
  window.VV.setMode = setMode;
  window.VV.state = state;
})();
