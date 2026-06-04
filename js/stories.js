/* stories.js — customer-stories grid with a Global / ANZ+aviation toggle.
   "comparable" = honest industry reference, NOT an ElevenLabs customer. */
(function () {
  "use strict";
  var grid = document.getElementById("storiesGrid"); if (!grid) return;

  var DATA = {
    global: [
      { name: "Revolut", metric: "8× faster", line: "query resolution across 4M+ customers and 30+ languages", el: true },
      { name: "Klarna", metric: "35M", line: "US customers on first-line phone support; de-escalation and live refunds", el: true },
      { name: "Deutsche Telekom", metric: "~80%", line: "of customer queries resolved by the voice agent", el: true },
      { name: "ING (Türkiye)", metric: "~60%", line: "lift in customer payment promises via a voice IVR", el: true },
      { name: "Chess.com", metric: "150M+", line: "members; in-product voice coaching built on ElevenLabs", el: true },
      { name: "Built on us", metric: "Meta · Twilio", line: "ElevenLabs voice underpins products across consumer and platform", el: true }
    ],
    anz: [
      { name: "Air New Zealand", metric: "CX", line: "conversational AI for customer experience in the region", el: false },
      { name: "Telus Digital", metric: "at scale", line: "BPO voice operations across millions of interactions", el: false },
      { name: "Travel & hospitality", metric: "24/7", line: "ElevenLabs receptionist / guest-service agents for bookings and recovery", el: true },
      { name: "Time to live", metric: "<3 wks", line: "most ElevenLabs agents go live in under three weeks", el: true },
      { name: "Regional reach", metric: "ANZ", line: "we operate across Australia and New Zealand, with local data options", el: true },
      { name: "Languages", metric: "32", line: "real-time languages at ~75ms — for a multicultural customer base", el: true }
    ]
  };

  function card(s) {
    return '<div class="story">' +
      '<div class="story__top"><span class="story__name">' + s.name + '</span>' +
      (s.el ? '<span class="story__badge">ElevenLabs</span>' : '<span class="tag">comparable</span>') + '</div>' +
      '<div class="figure story__metric">' + s.metric + '</div>' +
      '<div class="story__line muted">' + s.line + '</div></div>';
  }
  function render(which) {
    grid.innerHTML = DATA[which].map(card).join("");
    document.querySelectorAll("#storyToggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-story") === which)); });
    var note = document.getElementById("storyNote");
    if (note) note.style.display = which === "anz" ? "" : "block";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("#storyToggle button"); if (b) render(b.getAttribute("data-story"));
  });
  render("global");
})();
