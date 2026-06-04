/* nav.js — left-rail slide navigation: active-state sync, reveal-on-enter,
   and arrow-key advance. No dependencies. */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));

  /* screenshot/debug mode: ?shot reveals everything and jumps instantly to the hash */
  if (location.search.indexOf("shot") > -1) {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
    if (location.hash) {
      var keep = location.hash.slice(1);
      slides.forEach(function (s) { if (s.id !== keep) s.style.display = "none"; });
    }
  }

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list a[data-slide]"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

  /* --- active nav link via IntersectionObserver --- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          links.forEach(function (a) { a.classList.toggle("active", a === byId[id]); });
          // reveal content once
          var r = en.target.querySelector(".reveal");
          if (r) r.classList.add("in");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    slides.forEach(function (s) { io.observe(s); });

    // separate, more eager observer just for reveals
    var ioR = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add("in"); });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (r) { ioR.observe(r); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
  }

  /* --- arrow-key / PageUp-Down advance --- */
  function currentIndex() {
    var mid = window.innerHeight / 2;
    for (var i = 0; i < slides.length; i++) {
      var box = slides[i].getBoundingClientRect();
      if (box.top <= mid && box.bottom > mid) return i;
    }
    return 0;
  }
  function go(delta) {
    var i = Math.max(0, Math.min(slides.length - 1, currentIndex() + delta));
    slides[i].scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(-1); }
  });
})();
