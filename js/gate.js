/* gate.js - lightweight password gate for the public URL.
   Skipped entirely on localhost (rehearsal/presenting) and once unlocked per tab.
   Client-side only: keeps casual visitors out; it is not vault-grade security. */
(function () {
  "use strict";
  var HASH = "7da9d1f99586d4af701390f51654968e65420743dd588b7b2d1ed3df2e9c3ef7"; // sha-256
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (local || sessionStorage.getItem("vvv_ok") === "1") {
    document.documentElement.classList.remove("lock-pending");
    return;
  }

  var ov = document.createElement("div");
  ov.className = "gate";
  ov.innerHTML =
    '<div class="gate__card">' +
      '<span class="roundel" aria-hidden="true"></span>' +
      '<div class="gate__word">Virgin × ElevenLabs<small>Velocity Voice</small></div>' +
      '<p class="gate__hint">This presentation is private. Enter the access code to continue.</p>' +
      '<form class="gate__form" id="gateForm">' +
        '<input type="password" id="gatePw" placeholder="Access code" autocomplete="off" autofocus />' +
        '<button type="submit">Enter</button>' +
      '</form>' +
      '<p class="gate__err" id="gateErr" hidden>That code isn\'t right - try again.</p>' +
    '</div>';
  document.body.appendChild(ov);
  document.documentElement.classList.remove("lock-pending");   // gate now covers the deck
  document.documentElement.classList.add("locked");

  function sha256(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  document.getElementById("gateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var pw = document.getElementById("gatePw").value;
    sha256(pw).then(function (h) {
      if (h === HASH) {
        sessionStorage.setItem("vvv_ok", "1");
        document.documentElement.classList.remove("locked");
        ov.remove();
      } else {
        var err = document.getElementById("gateErr");
        err.hidden = false;
        ov.querySelector(".gate__card").classList.remove("shake");
        void ov.querySelector(".gate__card").offsetWidth;        // restart the animation
        ov.querySelector(".gate__card").classList.add("shake");
        document.getElementById("gatePw").select();
      }
    });
  });
})();
