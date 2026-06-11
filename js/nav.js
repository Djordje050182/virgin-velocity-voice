/* nav.js - builds the left menu from the slides, tracks the active slide, reveals on
   enter, and supports: per-slide hide, slide reorder (up/down), full-rail show/hide,
   and presenter notes (toggle with the button or the "N" key). State in memory only. */
(function () {
  "use strict";
  var deck = document.getElementById("deck");
  var list = document.getElementById("navList");
  var byId = {}, activeId = null;

  function slides() { return Array.prototype.slice.call(document.querySelectorAll(".slide")); }

  /* ---------- build / rebuild the menu ---------- */
  function buildMenu() {
    list.innerHTML = ""; byId = {};
    slides().forEach(function (s, i) {
      var num = ("0" + (i + 1)).slice(-2);
      var ix = s.querySelector(".slide__index"); if (ix) ix.textContent = num;
      var li = document.createElement("li");
      if (s.classList.contains("slide-off")) li.classList.add("off");
      li.innerHTML =
        '<a href="#' + s.id + '" data-slide><span class="n">' + num + '</span>' +
        '<span class="t">' + (s.getAttribute("data-title") || s.id) + '</span></a>' +
        '<span class="nav-tools">' +
          '<button class="nav-mv" data-mv="up" data-id="' + s.id + '" title="Move up" aria-label="Move up">▲</button>' +
          '<button class="nav-mv" data-mv="down" data-id="' + s.id + '" title="Move down" aria-label="Move down">▼</button>' +
          '<button class="nav-eye" data-hide="' + s.id + '" title="Hide / show" aria-label="Hide or show this slide"></button>' +
        '</span>';
      list.appendChild(li);
      byId[s.id] = li.querySelector("a");
    });
    setActive(activeId);
  }
  function setActive(id) {
    activeId = id;
    Object.keys(byId).forEach(function (k) { byId[k].classList.toggle("active", k === id); });
    renderNote();
  }

  /* ---------- reveal + active slide ---------- */
  function observe() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          setActive(en.target.id);
          var r = en.target.querySelector(".reveal"); if (r) r.classList.add("in");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    slides().forEach(function (s) { io.observe(s); });
    var ioR = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); }); }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (r) { ioR.observe(r); });
  }

  /* ---------- presenter notes ---------- */
  var panel = document.createElement("aside");
  panel.id = "notesPanel"; panel.className = "notes-panel"; document.body.appendChild(panel);
  function renderNote() {
    var s = activeId && document.getElementById(activeId);
    var note = s && s.querySelector(".snote");
    var title = (s && (s.getAttribute("data-title") || s.id)) || "";
    panel.innerHTML =
      '<div class="notes-panel__h"><b>Presenter notes</b> - ' + title +
        ' <button class="notes-panel__x" id="notesClose" aria-label="Close notes">✕</button></div>' +
      '<div class="notes-panel__b">' + (note ? note.innerHTML : '<span class="muted">No notes for this slide yet.</span>') + '</div>';
  }
  function toggleNotes(on) {
    var v = (on === undefined) ? !document.body.classList.contains("notes-on") : on;
    document.body.classList.toggle("notes-on", v);
  }

  /* ---------- reorder slides (up / down) ---------- */
  function move(id, dir) {
    var s = document.getElementById(id); if (!s || !deck) return;
    var sib = dir === "up" ? s.previousElementSibling : s.nextElementSibling;
    while (sib && !sib.classList.contains("slide")) sib = dir === "up" ? sib.previousElementSibling : sib.nextElementSibling;
    if (!sib) return;
    if (dir === "up") deck.insertBefore(s, sib); else deck.insertBefore(sib, s);
    buildMenu();
  }

  /* ---------- clicks ---------- */
  document.addEventListener("click", function (e) {
    var mv = e.target.closest("[data-mv]");
    if (mv) { e.preventDefault(); move(mv.getAttribute("data-id"), mv.getAttribute("data-mv")); return; }
    var h = e.target.closest("[data-hide]");
    if (h) {
      e.preventDefault();
      var id = h.getAttribute("data-hide"), sec = document.getElementById(id);
      var off = sec.classList.toggle("slide-off"); sec.hidden = off;
      h.closest("li").classList.toggle("off", off); return;
    }
    if (e.target.closest("#notesBtn")) { toggleNotes(); return; }
    if (e.target.closest("#notesClose")) { toggleNotes(false); return; }
    if (e.target.closest("#railHideBtn")) { document.body.classList.add("rail-hidden"); return; }
    if (e.target.closest("#railShowBtn")) { document.body.classList.remove("rail-hidden"); return; }
    var a = e.target.closest(".nav-list a");
    if (a && window.innerWidth <= 880) closeRail();
  });

  /* ---------- mobile hamburger ---------- */
  var toggle = document.getElementById("railToggle");
  function openRail() { document.body.classList.add("rail-open"); if (toggle) toggle.setAttribute("aria-expanded", "true"); }
  function closeRail() { document.body.classList.remove("rail-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) toggle.addEventListener("click", function () { document.body.classList.contains("rail-open") ? closeRail() : openRail(); });

  /* ---------- keyboard ---------- */
  function visible() { return slides().filter(function (s) { return !s.classList.contains("slide-off"); }); }
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
    else if (e.key === "n" || e.key === "N") { toggleNotes(); }
    else if (e.key === "m" || e.key === "M") { document.body.classList.toggle("rail-hidden"); }
  });

  /* ---------- measure / shot hooks ---------- */
  if (location.search.indexOf("measure") > -1) {
    window.addEventListener("load", function () {
      requestAnimationFrame(function () {
        var data = slides().map(function (s) { return { id: s.id, over: s.scrollHeight - window.innerHeight }; });
        // horizontal offenders: elements whose right edge pokes past the viewport
        var vw = window.innerWidth, wide = [];
        document.querySelectorAll(".slide *").forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.width && r.right - vw > 4 && wide.length < 40) {
            var sl = el.closest(".slide");
            wide.push((sl ? sl.id : "?") + ":" + el.tagName.toLowerCase() +
              (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "") +
              "+" + Math.round(r.right - vw));
          }
        });
        var pre = document.createElement("pre"); pre.id = "MEASURE";
        pre.textContent = "VH=" + window.innerHeight + " VW=" + vw + " " + JSON.stringify(data) + " WIDE=" + JSON.stringify(wide);
        document.body.appendChild(pre);
      });
    });
  }
  if (location.search.indexOf("shot") > -1) {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
    if (location.hash) { var keep = location.hash.slice(1); slides().forEach(function (s) { if (s.id !== keep) s.style.display = "none"; }); }
  }

  buildMenu(); observe();
})();
