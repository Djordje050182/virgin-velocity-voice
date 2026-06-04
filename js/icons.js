/* icons.js — tiny inline line-icon library. Add data-ic="name" to any element
   and it gets a crisp SVG (currentColor). Keeps the editorial look, adds visual anchors. */
(function () {
  "use strict";
  var P = {
    alert:    "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01",
    refund:   "M23 4v6h-6|M1 20v-6h6|M3.5 9a9 9 0 0 1 14.9-3.4L23 10|M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
    swap:     "M17 1l4 4-4 4|M3 11V9a4 4 0 0 1 4-4h14|M7 23l-4-4 4-4|M21 13v2a4 4 0 0 1-4 4H3",
    bag:      "M6 7V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2|M4 7h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z|M9 11v6|M15 11v6",
    ticket:   "M3 7h18a0 0 0 0 1 0 0v3a2 2 0 0 0 0 4v3a0 0 0 0 1 0 0H3a0 0 0 0 1 0 0v-3a2 2 0 0 0 0-4V7a0 0 0 0 1 0 0z|M14 7v10",
    star:     "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 18.6 5.8 22 7 14.1l-5-4.9 6.9-1z",
    briefcase:"M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z|M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    box:      "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z|M3.3 7 12 12l8.7-5|M12 22V12",
    plane:    "M17.8 19.2 16 11l3.5-3.5c1.5-1.5 2-3.5 1.5-4.5-1-.5-3 0-4.5 1.5L13 8 4.8 6.2a1 1 0 0 0-1.1.5l-.3.6c-.2.4-.1 1 .3 1.2L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3a1 1 0 0 0 1.3.3l.5-.2c.4-.3.6-.8.5-1.2z",
    sun:      "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z|M12 1v2|M12 21v2|M4.2 4.2l1.5 1.5|M18.4 18.4l1.4 1.4|M1 12h2|M21 12h2|M4.2 19.8l1.5-1.5|M18.4 5.6l1.4-1.4",
    users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.9|M16 3.1a4 4 0 0 1 0 7.8",
    shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    mic:      "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z|M19 10v2a7 7 0 0 1-14 0v-2|M12 19v4|M8 23h8"
  };
  function svg(name) {
    var d = P[name]; if (!d) return "";
    var paths = d.split("|").map(function (p) { return '<path d="' + p + '"/>'; }).join("");
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }
  document.querySelectorAll("[data-ic]").forEach(function (e) { e.innerHTML = svg(e.getAttribute("data-ic")); });

  /* build the soundwave hero (a row of bars, gentle idle motion) */
  var sw = document.getElementById("soundwave");
  if (sw) {
    var N = 64, html = "";
    for (var i = 0; i < N; i++) {
      // a smooth-ish envelope so it reads like a voice waveform, not noise
      var base = 18 + Math.round(70 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.17)));
      html += '<span style="height:' + base + '%;animation-delay:' + (i * 40) + 'ms"></span>';
    }
    sw.innerHTML = html;
  }
})();
