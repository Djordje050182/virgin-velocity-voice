/* demo.js — the live-demo slide orchestration.
   The VOICE AGENT IS REAL (ElevenLabs widget). The ops event, member data and the
   WhatsApp thread are SIMULATED for the demo and driven deterministically by the UI,
   so the visual story never depends on the model. State is in JS memory only. */
(function () {
  "use strict";
  var AGENT_ID = "agent_6701kt8w3svzen8ajsxjnk852mrj"; // live "Guest Care" agent (public)
  var WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";
  // Local proxy → Databricks (run integrations/databricks/proxy.py during the demo).
  // Each tier maps to a real "George Sinclair" hero record in the lakehouse.
  var PROXY = "http://localhost:8799";
  var MEMBER_IDS = { Red: "VA8380001", Silver: "VA8380002", Gold: "VA8380003", Platinum: "VA8380004" };

  var state = { tier: "Gold", stage: "delay", opsStep: 0, mode: "live" };

  var GUEST = { name: "George Sinclair", flight: "VA838", route: "MEL→SYD" };
  var TIERS = {
    Red:      { pts: "2,140",  label: "RED" },
    Silver:   { pts: "24,800", label: "SILVER" },
    Gold:     { pts: "82,450", label: "GOLD" },
    Platinum: { pts: "318,900",label: "PLATINUM" }
  };
  // Deterministic entitlement rules — mirror of KB doc 01. NEVER LLM-improvised.
  function entitlement(tier, stage) {
    var cancel = (stage === "cancellation" || stage === "confirmation");
    if (tier === "Platinum") return cancel
      ? { v: "Complimentary upgrade", d: "on the rebooked flight + hotel night if overnight" }
      : { v: "Lounge access + concierge", d: "while you wait" };
    if (tier === "Gold") return cancel
      ? { v: "Lounge access + hotel night", d: "if the disruption runs overnight" }
      : { v: "Lounge access", d: "while you wait" };
    return cancel
      ? { v: "Automatic refund or free rebooking", d: "on the next available service" }
      : { v: "Meal voucher + priority rebooking", d: "while you wait" };
  }

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- live system-activity pipeline ---------- */
  var pipeToken = 0;
  function pipeSet(nodes) {
    document.querySelectorAll(".pipe").forEach(function (p) {
      p.classList.toggle("on", nodes.indexOf(p.getAttribute("data-node")) > -1);
    });
  }
  function pipeCap(html) { var c = $("pipeCaption"); if (c) c.innerHTML = html; }
  function pipeFlash(node, html) { // light one node briefly (used by real tool calls)
    var el = document.querySelector('.pipe[data-node="' + node + '"]'); if (!el) return;
    el.classList.add("on"); if (html) pipeCap(html);
    setTimeout(function () { el.classList.remove("on"); }, 1600);
  }
  function pipePlay(steps) {
    var my = ++pipeToken, i = 0;
    (function step() {
      if (my !== pipeToken || i >= steps.length) return;
      var s = steps[i++]; pipeSet(s.nodes); pipeCap(s.cap);
      setTimeout(step, s.ms);
    })();
  }
  var SEQ = {
    delay: [
      { nodes: ["caller", "genesys"], cap: "Proactive call placed through <b>Genesys</b> telephony", ms: 1000 },
      { nodes: ["stt"], cap: "Listening — speech-to-text", ms: 700 },
      { nodes: ["brain"], cap: "Reasoning on a fast model", ms: 800 },
      { nodes: ["databricks"], cap: "<b>Databricks</b>: fetching George's booking (← Sabre) and Velocity tier", ms: 1300 },
      { nodes: ["brain"], cap: "Deciding the next best action", ms: 700 },
      { nodes: ["tts"], cap: "Hannah speaks — text-to-speech", ms: 700 },
      { nodes: ["out"], cap: "Guest hears the update, and a lounge pass is sent", ms: 1200 }
    ],
    cancellation: [
      { nodes: ["caller", "genesys"], cap: "Call connected via <b>Genesys</b>", ms: 900 },
      { nodes: ["stt", "brain"], cap: "Understanding the guest", ms: 800 },
      { nodes: ["databricks"], cap: "<b>Databricks</b>: pulling rebooking options (← Sabre)", ms: 1200 },
      { nodes: ["agentforce"], cap: "<b>Agentforce</b>: raising the case + rebooking in Service Cloud", ms: 1500 },
      { nodes: ["brain"], cap: "Confirming what was done", ms: 700 },
      { nodes: ["tts", "out"], cap: "Hannah explains the options, offers WhatsApp", ms: 1200 }
    ],
    confirmation: [
      { nodes: ["caller", "genesys"], cap: "Call-back via <b>Genesys</b>", ms: 900 },
      { nodes: ["databricks"], cap: "<b>Databricks</b>: re-checking the booking", ms: 1000 },
      { nodes: ["agentforce"], cap: "<b>Agentforce</b>: confirming booking + applying the loyalty gesture", ms: 1500 },
      { nodes: ["tts", "out"], cap: "Hannah confirms and thanks George", ms: 1200 }
    ]
  };
  function pipeline(stage) { pipePlay(SEQ[stage] || SEQ.delay); }

  /* ---------- UI cards (deterministic, always reliable) ---------- */
  function paintMember() {
    var t = TIERS[state.tier];
    $("memberTier").textContent = t.label;
    $("memberName").textContent = GUEST.name;
    $("memberPts").textContent = t.pts;
    $("memberBkg").textContent = GUEST.flight + " · " + GUEST.route + " · tonight";
    $("callMeta").textContent = "Velocity " + state.tier + " · " + GUEST.flight + " " + GUEST.route;
  }
  function paintEntitlement(show) {
    var e = entitlement(state.tier, state.stage);
    $("entVal").textContent = e.v; $("entDetail").textContent = e.d;
    $("entitlement").hidden = !show;
  }

  /* ---------- live widget ---------- */
  var scriptLoaded = false;
  function ensureScript() {
    if (scriptLoaded) return;
    var s = document.createElement("script"); s.src = WIDGET_SRC; s.async = true; s.type = "text/javascript";
    document.body.appendChild(s); scriptLoaded = true;
  }
  function firstMessageFor(stage) {
    if (stage === "cancellation") return "Hi " + GUEST.name + ", it's Hannah from Virgin Australia Guest Care again — I'm so sorry, I'm afraid I've got an update on your flight tonight.";
    if (stage === "confirmation") return "Hi " + GUEST.name + ", it's Hannah from Virgin Australia — good news, I've got your rebooking sorted.";
    return "Hi " + GUEST.name + ", it's Hannah calling from Virgin Australia Guest Care — do you have a quick moment? It's about your flight tonight.";
  }
  function mountWidget() {
    var host = $("widgetMount"); if (!host) return;
    host.innerHTML = "";
    // Remove any prior instance. The widget renders a FIXED bottom-right launcher; if it lives
    // inside a slide whose ancestor has a transform (.reveal), that transform becomes its
    // containing block and it shifts/clips per slide. Mounting on <body> keeps it viewport-fixed
    // and consistently on top.
    document.querySelectorAll("elevenlabs-convai").forEach(function (e) { e.remove(); });
    var w = document.createElement("elevenlabs-convai");
    w.setAttribute("agent-id", AGENT_ID);
    w.setAttribute("dynamic-variables", JSON.stringify({
      guest_name: GUEST.name.split(" ")[0], velocity_tier: state.tier,
      flight_number: GUEST.flight, route: "Melbourne to Sydney",
      new_departure: "7:45 PM", call_stage: state.stage
    }));
    w.setAttribute("override-first-message", firstMessageFor(state.stage));
    // Best-effort client tools + overrides via the widget's call-config event.
    w.addEventListener("elevenlabs-convai:call", function (ev) {
      try {
        var cfg = ev.detail.config;
        cfg.clientTools = Object.assign(cfg.clientTools || {}, {
          lookup_velocity_member: function () {
            paintMember();
            pipeFlash("databricks", "<b>Databricks</b>: querying Velocity ⋈ Sabre (live)…");
            var t = TIERS[state.tier];
            // Hardcoded fallback so the call never breaks if the proxy/warehouse is unavailable.
            var fallback = { name: GUEST.name, tier: state.tier, points: t.pts,
                             recent_booking: GUEST.flight + " " + GUEST.route + " tonight" };
            return fetch(PROXY + "/member?id=" + MEMBER_IDS[state.tier], { cache: "no-store" })
              .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
              .then(function (rec) {
                if (!rec || rec.error) throw 0;
                pipeFlash("databricks", "<b>Databricks</b>: " + rec.name + " · " + rec.tier + " · " + rec.points + " pts · " + rec.flight_number + " (← Sabre, live)");
                return { name: rec.name, tier: rec.tier, points: rec.points,
                         recent_booking: (rec.recent_booking || (GUEST.flight + " " + GUEST.route)) + " tonight",
                         source: "Databricks live (Velocity ⋈ Sabre)" };
              })
              .catch(function () {
                pipeFlash("databricks", "<b>Databricks</b>: returning George's record (← Sabre)");
                return fallback;
              });
          },
          check_entitlement: function (p) {
            var e = entitlement((p && p.tier) || state.tier, (p && p.disruption_type) || state.stage);
            paintEntitlement(true); pipeFlash("agentforce", "<b>Agentforce</b>: applying the entitlement in Service Cloud");
            return { gesture: e.v, detail: e.d };
          },
          fulfil_in_agentforce: function (p) {
            var action = (p && p.action) || "rebook";
            pipeFlash("agentforce", "<b>Agentforce → Service Cloud</b>: creating case (live)…");
            // Fallback fake reference so the call never breaks if the proxy/org is unavailable.
            var fallback = { status: "done", action: action, reference: "SC-" + (state.tier[0]) + "48210",
                             message: action + " completed in Service Cloud" };
            var qs = "action=" + encodeURIComponent(action) +
                     "&member=" + encodeURIComponent(GUEST.name) +
                     "&tier=" + encodeURIComponent(state.tier) +
                     "&flight=" + encodeURIComponent(GUEST.flight) +
                     "&route=" + encodeURIComponent("MEL→SYD");
            return fetch(PROXY + "/fulfil?" + qs, { cache: "no-store" })
              .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
              .then(function (res) {
                if (!res || res.error) throw 0;
                pipeFlash("agentforce", "<b>Agentforce → Service Cloud</b>: case " + res.reference + " created (live) ✓");
                return res;
              })
              .catch(function () {
                pipeFlash("agentforce", "<b>Agentforce</b>: " + action + " actioned in Service Cloud ✓");
                return fallback;
              });
          }
        });
        cfg.dynamicVariables = Object.assign(cfg.dynamicVariables || {}, { call_stage: state.stage, velocity_tier: state.tier, guest_name: GUEST.name.split(" ")[0] });
      } catch (e) { /* never let wiring break the live call */ }
    });
    document.body.appendChild(w);   // top-level, not inside a transformed slide
    ensureScript();
  }

  /* ---------- fallback mode (pre-recorded) ---------- */
  var FALLBACK = {
    delay: "audio/fallback-call1-delay.mp3",
    cancellation: "audio/fallback-call2-cancellation.mp3",
    confirmation: "audio/fallback-call3-confirmation.mp3"
  };
  function renderFallback() {
    var m = $("fallbackMount"); m.innerHTML = "";
    [["delay", "Call 1 · Delay"], ["cancellation", "Call 2 · Cancellation"], ["confirmation", "Call 3 · Confirmation"]].forEach(function (p) {
      var b = document.createElement("button");
      b.className = "btn btn--ghost"; b.setAttribute("data-audio", FALLBACK[p[0]]); b.textContent = "▶ " + p[1];
      m.appendChild(b);
    });
    // re-bind simple players for these new buttons
    if (window.VV && window.VV.bindAudio) window.VV.bindAudio(m);
  }
  function applyMode() {
    var live = state.mode !== "safe";
    $("widgetMount").hidden = !live;
    $("fallbackMount").hidden = live;
    $("callHint").textContent = live
      ? "Click “Start a call”, allow the mic, and talk to Hannah — the real ElevenLabs agent configured for Virgin."
      : "Fallback mode: pre-recorded calls if the network or mic misbehaves on the day.";
    if (live) { mountWidget(); }
    else { document.querySelectorAll("elevenlabs-convai").forEach(function (e) { e.remove(); }); renderFallback(); }
  }

  /* ---------- WhatsApp channel-hop simulation ---------- */
  function bubble(cls, html) { var b = document.createElement("div"); b.className = "bubble " + cls; b.innerHTML = html; return b; }
  function typing(thread, then) {
    var t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
    thread.appendChild(t); thread.scrollTop = thread.scrollHeight;
    setTimeout(function () { t.remove(); then(); }, 1100);
  }
  function fauxQR() {
    // a QR-looking SVG block (illustrative, not a scannable code)
    var cells = "", n = 11;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var corner = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
      var on = corner || ((x * 7 + y * 13 + x * y) % 3 === 0);
      if (on) cells += '<rect x="' + (x * 8) + '" y="' + (y * 8) + '" width="8" height="8"/>';
    }
    return '<svg class="qr" viewBox="0 0 ' + (n * 8) + ' ' + (n * 8) + '" fill="#111">' + cells + '</svg>';
  }
  var loungeDone = false;
  function showLoungePass() {
    if (loungeDone) return;
    if (state.tier !== "Gold" && state.tier !== "Platinum") return;
    loungeDone = true;
    $("phone").hidden = false;
    var thread = $("thread"); thread.innerHTML = "";
    setTimeout(function () {
      thread.appendChild(bubble("in", "Hi " + GUEST.name.split(" ")[0] + " 👋 Virgin Australia here. While you wait, here's complimentary lounge access — show this at the door:"));
      thread.scrollTop = thread.scrollHeight;
      typing(thread, function () {
        thread.appendChild(bubble("in", "<div class='qrcard'>" + fauxQR() + "<div><b>Virgin Australia Lounge</b><span>Velocity " + state.tier + " · complimentary</span></div></div>"));
        thread.scrollTop = thread.scrollHeight;
      });
    }, 400);
  }
  var hopDone = false;
  function runChannelHop() {
    if (hopDone) return; hopDone = true;
    $("phone").hidden = false;
    var thread = $("thread"); thread.innerHTML = "";
    setTimeout(function () {
      thread.appendChild(bubble("in", "Hi " + GUEST.name.split(" ")[0] + " 👋 It's Virgin Australia. Sorry your flight was cancelled — here are your options:"));
      thread.scrollTop = thread.scrollHeight;
      typing(thread, function () {
        var opt = bubble("in", "Choose one and I'll lock it in:" +
          "<span class='opt' data-opt='A'>✈️ Next service — 9:15 PM tonight</span>" +
          "<span class='opt' data-opt='B'>🛏️ Fly tomorrow AM + hotel</span>");
        thread.appendChild(opt); thread.scrollTop = thread.scrollHeight;
        opt.querySelectorAll(".opt").forEach(function (o) {
          o.addEventListener("click", function () {
            thread.appendChild(bubble("out", o.getAttribute("data-opt") === "A" ? "The 9:15 tonight, please 🙏" : "Tomorrow morning + the hotel, thanks 🙏"));
            thread.scrollTop = thread.scrollHeight;
            typing(thread, function () {
              thread.appendChild(bubble("in", "Done! Hannah will call you in a moment to confirm and sort your Velocity " + state.tier + " gesture. ❤️"));
              thread.scrollTop = thread.scrollHeight;
              setStage("confirmation");
            });
          });
        });
      });
    }, 400);
  }

  /* ---------- stage + ops control ---------- */
  function setStage(stage) {
    state.stage = stage;
    document.querySelectorAll(".stage").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-stage") === stage)); });
    paintEntitlement(true); // entitlement card differs by stage
    pipeline(stage); // animate the system-activity pipeline for this call
    if (stage === "delay") showLoungePass();
    if (stage === "cancellation") runChannelHop();
    if (state.mode !== "safe") mountWidget(); else renderFallback();
  }
  function setTier(tier) {
    state.tier = tier;
    document.querySelectorAll("[data-tier]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-tier") === tier)); });
    paintMember(); paintEntitlement(!$("entitlement").hidden);
    if (state.mode !== "safe") mountWidget();
  }

  function ops() {
    state.opsStep++;
    var banner = $("opsBanner"), text = $("opsText"), label = $("opsBtnLabel");
    banner.hidden = false;
    if (state.opsStep === 1) {
      text.innerHTML = "<b>VA838 MEL→SYD — DELAYED.</b> New expected departure ~7:45 PM. Proactive outbound triggered.";
      label.textContent = "Escalate: flight now cancelled";
      setStage("delay");
    } else {
      text.innerHTML = "<b>VA838 — now CANCELLED.</b> Disruption workflow escalates: refund / rebooking + member care.";
      label.textContent = "Ops event fired";
      $("opsBtn").disabled = true;
      setStage("cancellation");
    }
  }

  /* ---------- wire up ---------- */
  document.addEventListener("click", function (e) {
    var s = e.target.closest(".stage"); if (s) { setStage(s.getAttribute("data-stage")); return; }
    var t = e.target.closest("[data-tier]"); if (t) { setTier(t.getAttribute("data-tier")); return; }
    if (e.target.closest("#opsBtn")) ops();
  });
  document.addEventListener("demomode", function (e) {
    state.mode = e.detail.mode === "safe" ? "safe" : "live";
    if (window.VV) window.VV.stopAllAudio && window.VV.stopAllAudio();
    applyMode();
  });

  // init
  paintMember(); paintEntitlement(false); applyMode();
})();
