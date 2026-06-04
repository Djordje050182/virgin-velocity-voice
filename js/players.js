/* players.js — audio players. In-memory only, no storage.
   1) Segmented "bad call" player (#badcallPlayer) chains clips into one ~45s scene.
   2) Simple toggle players [data-audio] for single clips (emotion A/B, fallbacks). */
(function () {
  "use strict";

  var BADCALL = [
    "audio/badcall-1-ivr.mp3",
    "audio/badcall-2-hold.mp3",
    "audio/badcall-3-agent.mp3",
    "audio/badcall-4-customer.mp3"
  ];

  /* ---- IVR "video" screen, synced to segments ---- */
  var ivrStage = document.getElementById("ivrStage");
  var ivrTimer = document.getElementById("ivrTimer");
  var ivrScreen = document.getElementById("ivrScreen");
  var IVR = [
    '<div class="ivr__call"><div class="ivr__num">13 67 89 · calling…</div></div>' +
    '<ul class="ivr__menu">' +
      '<li class="hot">Press 1 — Existing bookings</li><li>Press 2 — New bookings</li>' +
      '<li>Press 3 — Velocity Frequent Flyer</li><li>Press 9 — Repeat these options</li>' +
    '</ul><div class="ivr__cap">“…our menu options have recently changed.”</div>',
    '<div class="ivr__hold"><div class="ivr__spin"></div><div class="ivr__big">Estimated wait</div>' +
      '<div class="ivr__wait">45 minutes</div><div class="ivr__cap">♪ hold music ♪</div></div>',
    '<div class="ivr__agent"><span class="ivr__av"></span><div><div class="ivr__big">Connected · Consultant</div>' +
      '<div class="ivr__cap">“…that booking\'s in our other system, I can\'t see it from here.”</div></div></div>',
    '<div class="ivr__cust"><div class="ivr__face">😤</div><div class="ivr__big">You</div>' +
      '<div class="ivr__cap">“Tomorrow? My flight is tonight!”</div></div>'
  ];
  function paintIVR(i) { if (ivrStage) { ivrStage.className = "ivr__stage stage-" + i; ivrStage.innerHTML = IVR[i] || ""; } }

  /* ---- segmented player ---- */
  var pl = document.getElementById("badcallPlayer");
  if (pl) {
    var audio = new Audio();
    audio.preload = "auto";
    var btn = pl.querySelector(".player__btn");
    var fill = pl.querySelector(".player__fill");
    var timeEl = pl.querySelector(".player__time");
    var steps = pl.querySelectorAll(".player__steps span");
    var idx = 0, playing = false, t0 = 0, tAcc = 0, ticker = null;

    function fmt(s) { s = Math.max(0, s | 0); return (s / 60 | 0) + ":" + ("0" + (s % 60)).slice(-2); }
    function markStep(i) { steps.forEach(function (s, j) { s.classList.toggle("on", j === i); }); }
    function loadSeg(i) { idx = i; audio.src = BADCALL[i]; markStep(i); paintIVR(i); }
    function tick() { if (ivrTimer) ivrTimer.textContent = ("0" + Math.floor((tAcc + (playing ? (Date.now() - t0) / 1000 : 0)) / 60)).slice(-2) + ":" + ("0" + Math.floor((tAcc + (playing ? (Date.now() - t0) / 1000 : 0)) % 60)).slice(-2); }

    function play() {
      if (!audio.src) loadSeg(0);
      audio.play(); playing = true; pl.classList.add("is-playing");
      if (ivrScreen) ivrScreen.classList.add("on");
      t0 = Date.now(); if (!ticker) ticker = setInterval(tick, 250);
    }
    function pause() { audio.pause(); playing = false; pl.classList.remove("is-playing");
      tAcc += (Date.now() - t0) / 1000; }

    btn.addEventListener("click", function () { playing ? pause() : play(); });
    paintIVR(0); // show the menu before play

    var elapsedBefore = 0; // seconds elapsed in prior segments (approx for the bar)
    audio.addEventListener("timeupdate", function () {
      var total = BADCALL.length * (audio.duration || 11); // rough total
      var cur = idx * (audio.duration || 11) + audio.currentTime;
      fill.style.width = Math.min(100, (cur / total) * 100) + "%";
      timeEl.textContent = fmt(cur);
    });
    audio.addEventListener("ended", function () {
      if (idx < BADCALL.length - 1) { loadSeg(idx + 1); audio.play(); }
      else { pause(); playing = false; clearInterval(ticker); ticker = null; tAcc = 0;
        fill.style.width = "100%";
        setTimeout(function () { fill.style.width = "0"; timeEl.textContent = "0:00"; if (ivrTimer) ivrTimer.textContent = "00:00"; markStep(-1); idx = 0; loadSeg(0); if (ivrScreen) ivrScreen.classList.remove("on"); }, 1000); }
    });
  }

  /* ---- simple toggle players (one [data-audio] each) ---- */
  var current = null;
  function bindOne(el) {
    if (el.__bound) return; el.__bound = true;
    var a = new Audio(el.getAttribute("data-audio")); a.preload = "none";
    el.addEventListener("click", function () {
      if (current && current !== a) { current.pause(); current.currentTime = 0; document.querySelectorAll("[data-audio].is-playing").forEach(function(x){x.classList.remove("is-playing");}); }
      if (a.paused) { a.play(); current = a; el.classList.add("is-playing"); }
      else { a.pause(); el.classList.remove("is-playing"); }
    });
    a.addEventListener("ended", function () { el.classList.remove("is-playing"); });
  }
  function bindAudio(root) { (root || document).querySelectorAll("[data-audio]").forEach(bindOne); }
  bindAudio(document);

  window.VV = window.VV || {};
  window.VV.bindAudio = bindAudio;
  window.VV.stopAllAudio = function () { if (current) { current.pause(); document.querySelectorAll("[data-audio].is-playing").forEach(function(x){x.classList.remove("is-playing");}); } };
})();
