/* nav.js — builds the left menu from the slides, tracks the active slide,
   reveals on enter, supports per-slide hide toggles and a mobile hamburger.
   No storage; all state in memory. */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var list = document.getElementById("navList");
  var byId = {};

  /* build the menu */
  slides.forEach(function (s, i) {
    var num = ("0" + (i + 1)).slice(-2);
    var li = document.createElement("li");
    li.innerHTML =
      '<a href="#' + s.id + '" data-slide><span class="n">' + num + '</span>' +
      '<span class="t">' + (s.getAttribute("data-title") || s.id) + '</span></a>' +
      '<button class="nav-eye" data-hide="' + s.id + '" aria-label="Hide this slide" title="Hide / show"></button>';
    list.appendChild(li);
    byId[s.id] = li.querySelector("a");
  });
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list a[data-slide]"));

  /* screenshot/debug mode */
  if (location.search.indexOf("shot") > -1) {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
    if (location.hash) { var keep = location.hash.slice(1); slides.forEach(function (s) { if (s.id !== keep) s.style.display = "none"; }); }
  }

  /* active link + reveal */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("active", a === byId[en.target.id]); });
          var r = en.target.querySelector(".reveal"); if (r) r.classList.add("in");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    slides.forEach(function (s) { io.observe(s); });
    var ioR = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); }); }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (r) { ioR.observe(r); });
  } else { document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); }); }

  /* hide / show a slide */
  document.addEventListener("click", function (e) {
    var h = e.target.closest("[data-hide]");
    if (h) {
      e.preventDefault();
      var id = h.getAttribute("data-hide"), sec = document.getElementById(id);
      var off = sec.classList.toggle("slide-off");
      sec.hidden = off;
      h.closest("li").classList.toggle("off", off);
      return;
    }
    // close mobile rail after navigating
    var a = e.target.closest(".nav-list a");
    if (a && window.innerWidth <= 880) closeRail();
  });

  /* mobile hamburger */
  var rail = document.getElementById("rail"), toggle = document.getElementById("railToggle");
  function openRail() { document.body.classList.add("rail-open"); toggle.setAttribute("aria-expanded", "true"); }
  function closeRail() { document.body.classList.remove("rail-open"); toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) toggle.addEventListener("click", function () { document.body.classList.contains("rail-open") ? closeRail() : openRail(); });

  /* arrow-key advance (skips hidden slides) */
  function visible() { return slides.filter(function (s) { return !s.classList.contains("slide-off"); }); }
  function go(delta) {
    var vis = visible(), mid = window.innerHeight / 2, cur = 0;
    for (var i = 0; i < vis.length; i++) { var b = vis[i].getBoundingClientRect(); if (b.top <= mid && b.bottom > mid) { cur = i; break; } }
    var t = Math.max(0, Math.min(vis.length - 1, cur + delta));
    vis[t].scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(-1); }
  });
})();
