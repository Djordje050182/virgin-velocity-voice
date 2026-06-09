/* demo.js - slide 8 live demo, rebuilt around the Virgin voice orb.
   The voice agent is REAL: we drive it with the @elevenlabs/client SDK
   (Conversation.startSession), so the orb is the call control and onModeChange
   shimmers it while Hannah speaks. The orb fires off to live systems - Databricks
   (read) and Salesforce/Agentforce (the workflow) - which light up as spokes.
   Member data + the WhatsApp thread are synthetic; the connections are real. */
(function () {
  "use strict";
  var AGENT_ID = "agent_6701kt8w3svzen8ajsxjnk852mrj"; // live "Guest Care" agent (public) - the disruption demo
  var MEET_AGENT_ID = "agent_0501ktn3jtvver39s7vxwj7wjpxd"; // dedicated "Meet Hannah" intro agent (public, no tools)
  var SDK_URL = "https://esm.sh/@elevenlabs/client";     // ESM CDN - no build step
  var PROXY = "http://localhost:8799";                   // local proxy → Databricks + Salesforce
  var MEMBER_IDS = { Red: "VA8380001", Silver: "VA8380002", Gold: "VA8380003", Platinum: "VA8380004" };

  var state = { tier: "Gold", stage: "delay", opsStep: 0, mode: "live" };

  var GUEST = { name: "Djordje Gvozdenovic", first: "Djordje", flight: "VA838", route: "MEL→SYD" };
  var TIERS = {
    Red:      { pts: "2,140",   label: "RED" },
    Silver:   { pts: "24,800",  label: "SILVER" },
    Gold:     { pts: "82,450",  label: "GOLD" },
    Platinum: { pts: "318,900", label: "PLATINUM" }
  };
  // Deterministic entitlement rules - never LLM-improvised.
  function entitlement(tier, stage) {
    var cancel = (stage === "cancellation");
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

  /* ---------- spokes + caption ---------- */
  function cap(html) { var c = $("pipeCaption"); if (c) c.innerHTML = html; }
  function spokeSet(names) {
    document.querySelectorAll(".spoke").forEach(function (s) {
      s.classList.toggle("on", names.indexOf(s.getAttribute("data-spoke")) > -1);
    });
  }
  var spokeTimers = {};
  function spokeFlash(name, html, hold) {
    var el = document.querySelector('.spoke[data-spoke="' + name + '"]');
    if (el) {
      el.classList.add("on");
      clearTimeout(spokeTimers[name]);
      spokeTimers[name] = setTimeout(function () { el.classList.remove("on"); }, hold || 2500);
    }
    if (html) cap(html);
  }

  /* ---------- orb visual state ---------- */
  function orbState(cls) {
    var o = $("orb"); if (!o) return;
    o.classList.remove("incall", "speaking");
    if (cls) o.classList.add(cls);
  }
  function status(html) { var s = $("orbStatus"); if (s) s.innerHTML = html; }

  /* ---------- "do this now" cue ---------- */
  var STEP = {
    delay:        [2, "Tap the orb - Hannah calls about the delay. She looks Djordje up (Databricks) and texts a <b>lounge pass</b> on WhatsApp."],
    cancellation: [3, "Tap the orb - Hannah handles the cancellation and rebooks Djordje on the call, logging a <b>real Salesforce case</b>. <b>Hang up</b> and the WhatsApp confirmation - new flight + hotel - arrives automatically."]
  };
  function setStep(stage) {
    var s = STEP[stage]; if (!s) return;
    var t = $("demoStepText"); if (t) t.innerHTML = s[1];
  }

  /* ---------- cards ---------- */
  function paintMember() {
    var t = TIERS[state.tier];
    $("memberTier").textContent = t.label;
    $("memberName").textContent = GUEST.name;
    $("memberPts").textContent = t.pts;
    $("memberBkg").textContent = GUEST.flight + " · " + GUEST.route + " · tonight";
    var card = $("memberCard"); if (card) card.className = "member-card member-card--" + state.tier;
    $("callMeta").textContent = "Velocity " + state.tier + " · " + GUEST.flight + " " + GUEST.route;
  }
  function paintEntitlement(show) {
    var e = entitlement(state.tier, state.stage);
    $("entVal").textContent = e.v; $("entDetail").textContent = e.d;
    $("entitlement").hidden = !show;
  }
  function showSf(ref) {
    var c = $("sfCard"); if (!c) return;
    c.hidden = false;
    $("sfVal").textContent = "Case " + ref + " · created";
  }
  // Create the real Salesforce case once - shared by the agent's tool call and the
  // automatic post-hang-up confirmation, memoised so we never raise two cases.
  var casePromise = null;
  function createCase(action) {
    if (casePromise) return casePromise;
    action = action || "rebook";
    spokeFlash("agentforce", "<b>Salesforce → Service Cloud</b>: running the rebooking workflow (live)…", 5000);
    var fallback = { status: "done", action: action, reference: "SC-" + state.tier[0] + "48210",
                     message: action + " completed in Service Cloud" };
    var qs = "action=" + encodeURIComponent(action) + "&member=" + encodeURIComponent(GUEST.name) +
             "&tier=" + encodeURIComponent(state.tier) + "&flight=" + encodeURIComponent(GUEST.flight) +
             "&route=" + encodeURIComponent("MEL→SYD");
    casePromise = fetch(PROXY + "/fulfil?" + qs, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (res) {
        if (!res || res.error) throw 0;
        showSf(res.reference);
        spokeFlash("agentforce", "<b>Salesforce</b>: case " + res.reference + " created in Service Cloud (live) ✓", 5000);
        return res;
      })
      .catch(function () { showSf(fallback.reference); spokeFlash("agentforce", "<b>Salesforce</b>: " + action + " actioned (cached) ✓", 4000); return fallback; });
    return casePromise;
  }

  /* ---------- live connection badge ---------- */
  function checkLive() {
    var b = $("liveBadge"), t = $("liveBadgeText"); if (!b) return;
    fetch(PROXY + "/health", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (h) {
        if (!h || !h.ok) throw 0;
        b.className = "live-badge ok";
        t.textContent = "Databricks ✓  Salesforce ✓  live";
      })
      .catch(function () { b.className = "live-badge bad"; t.textContent = "proxy offline - cached data"; });
  }

  /* ---------- client tools (called BY the real voice agent) ---------- */
  function clientTools() {
    return {
      lookup_velocity_member: function () {
        paintMember();
        spokeFlash("databricks", "<b>Databricks</b>: querying Velocity ⋈ Sabre (live)…", 4000);
        var t = TIERS[state.tier];
        var fallback = { name: GUEST.name, tier: state.tier, points: t.pts,
                         recent_booking: GUEST.flight + " " + GUEST.route + " tonight" };
        return fetch(PROXY + "/member?id=" + MEMBER_IDS[state.tier], { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
          .then(function (rec) {
            if (!rec || rec.error) throw 0;
            var src = $("memberSrc"); if (src) src.hidden = false;
            spokeFlash("databricks", "<b>Databricks</b> returned " + rec.name + " · " + rec.tier + " · " + rec.points + " pts · " + rec.flight_number + " (live)", 4500);
            return { name: rec.name, tier: rec.tier, points: rec.points,
                     recent_booking: (rec.recent_booking || (GUEST.flight + " " + GUEST.route)) + " tonight",
                     source: "Databricks live (Velocity ⋈ Sabre)" };
          })
          .catch(function () { spokeFlash("databricks", "<b>Databricks</b>: returning Djordje's record (cached)", 3000); return fallback; });
      },
      check_entitlement: function (p) {
        var e = entitlement((p && p.tier) || state.tier, (p && p.disruption_type) || state.stage);
        paintEntitlement(true);
        return { gesture: e.v, detail: e.d };
      },
      fulfil_in_agentforce: function (p) {
        return createCase((p && p.action) || "rebook");
      }
    };
  }

  /* ---------- the call: @elevenlabs/client SDK ---------- */
  var convo = null, sdkP = null, connecting = false;   // connecting guard prevents double sessions (the "multiple voices" bug)
  // Hannah's live self-introduction (slide 7), scripted for reliability, ends on a question to the room.
  var INTRO = "Hi, I'm Hannah - a voice for Virgin Australia Guest Care, built on ElevenLabs. " +
    "On a normal day, I call guests the moment their flight is disrupted: I check I'm speaking with the right person, " +
    "look up their Velocity tier and booking, sort a rebooking or a refund, and make sure they feel properly looked after - " +
    "all in a natural conversation, not a phone menu. In just a moment, Djordje is going to play a guest whose flight gets delayed, " +
    "then cancelled, and you'll watch me handle it live. But first - Sarah, Tom - I'm curious: have either of you ever been " +
    "left on hold with an airline when a flight went wrong?";
  // Intro-mode system prompt override: keeps Hannah's warm AU persona but stops her launching the
  // disruption call - she says hello, takes their answer, and wraps up with "enjoy the demo".
  var INTRO_PROMPT =
    "You are Hannah, Virgin Australia Guest Care's warm, friendly voice assistant. Speak with a warm Australian " +
    "accent and keep it the whole way through - never slip into an American or neutral accent. You are giving a short, " +
    "friendly hello to two people in the room, Sarah and Tom, just before a live product demo. You have already given " +
    "your introduction and asked whether they've ever been left on hold with an airline when a flight went wrong. " +
    "After they answer, warmly acknowledge what they said in one short sentence, then wrap up and hand over to the demo " +
    "- say something like \"Anyway, I'll let you get to it - enjoy the demo.\" Keep everything short, warm and natural. " +
    "Do NOT start a disruption or delay call. Do NOT ask for a date of birth, booking reference or any verification. " +
    "Do NOT look anything up or use any tools. This is only a friendly hello before the demo. If they ask you something, " +
    "answer briefly and kindly, then wrap up with \"enjoy the demo\".";
  function sdk() { return sdkP || (sdkP = import(SDK_URL)); }
  function endBtns(on) { var a = $("endCallBtn"), b = $("endMeetBtn"); if (a) a.hidden = !on; if (b) b.hidden = !on; }
  function meetOrb(cls) { var o = $("orbMeet"); if (!o) return; o.classList.remove("incall", "speaking"); if (cls) o.classList.add(cls); }
  function meetStatus(t) { var s = $("orbMeetStatus"); if (s) s.innerHTML = t; }
  function firstMessageFor(stage) {
    if (stage === "cancellation") return "Hi " + GUEST.first + ", it's Hannah from Virgin Australia Guest Care again - I'm so sorry, your flight tonight has been cancelled. Let me sort a rebooking for you right now.";
    return "Hi " + GUEST.first + ", it's Hannah calling from Virgin Australia Guest Care - do you have a quick moment? It's about your flight tonight.";
  }
  function callActive() { return !!convo; }
  function endCall() { try { if (convo) convo.endSession(); } catch (e) {} convo = null; connecting = false; orbState(""); endBtns(false); }

  function startCall() {
    if (callActive()) { endCall(); status("Call ended. Tap the orb to call again."); return; }
    if (connecting) return;                              // ignore taps while a call is mid-connect
    if (state.mode === "safe") { playFallback(); return; }
    connecting = true; status("Connecting…"); orbState("incall");
    sdk().then(function (mod) {
      return mod.Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "websocket",
        clientTools: clientTools(),
        dynamicVariables: { guest_name: GUEST.first, velocity_tier: state.tier,
          flight_number: GUEST.flight, route: "Melbourne to Sydney", new_departure: "7:45 PM", call_stage: state.stage },
        overrides: { agent: { firstMessage: firstMessageFor(state.stage) } },
        onConnect: function () { connecting = false; orbState("incall"); status("On the call with Hannah - speak as Djordje."); var e = $("endCallBtn"); if (e) e.hidden = false; },
        onDisconnect: function () { convo = null; connecting = false; orbState(""); status("Call ended. Tap the orb to call again."); endBtns(false); if (state.stage === "cancellation") sendConfirmation(); },
        onModeChange: function (m) {
          var mode = m && m.mode;
          if (mode === "speaking") { orbState("speaking"); status("<b>Hannah is speaking…</b>"); }
          else { orbState("incall"); status("Listening… speak as Djordje."); }
        },
        onError: function (m) { connecting = false; orbState(""); console.error("[EL onError]", m); status("Call error: " + (typeof m === "string" ? m : (m && m.message) || "see console (F12)") + " - or use Fallback (left rail)."); }
      }).then(function (c) { convo = c; });
    }).catch(function (e) { connecting = false; orbState(""); console.error("[EL startCall failed]", e); status("Couldn't start: " + ((e && e.message) || e || "unknown") + " - or use Fallback (left rail)."); });
  }

  /* ---------- slide 7: Hannah introduces herself live ---------- */
  function startMeet() {
    if (callActive()) { endCall(); meetOrb(""); meetStatus("Call ended. Tap the orb to introduce Hannah again."); return; }
    if (connecting) return;
    connecting = true; meetStatus("Connecting…"); meetOrb("incall");
    meetSession();
  }
  function meetSession() {
    // Dedicated intro agent - its own first_message + prompt do the hello, the question and the
    // hand-off to the demo. No overrides, no tools, no disruption flow.
    sdk().then(function (mod) {
      return mod.Conversation.startSession({
        agentId: MEET_AGENT_ID,
        connectionType: "websocket",
        onConnect: function () { connecting = false; meetOrb("incall"); meetStatus("Hannah is introducing herself - say hello, then end the call when you're ready."); var b = $("endMeetBtn"); if (b) b.hidden = false; },
        onDisconnect: function () { convo = null; connecting = false; meetOrb(""); meetStatus("That's Hannah. Tap to introduce her again, or move on to the demo."); endBtns(false); },
        onModeChange: function (m) {
          if (m && m.mode === "speaking") { meetOrb("speaking"); meetStatus("<b>Hannah is speaking…</b>"); }
          else { meetOrb("incall"); meetStatus("Listening…"); }
        },
        onError: function (m) { connecting = false; meetOrb(""); console.error("[EL meet onError]", m); meetStatus("Call error: " + (typeof m === "string" ? m : (m && m.message) || "see console (F12)") + "."); }
      }).then(function (c) { convo = c; });
    }).catch(function (e) { connecting = false; meetOrb(""); console.error("[EL meet failed]", e); meetStatus("Couldn't start: " + ((e && e.message) || e || "unknown") + "."); });
  }

  /* ---------- fallback (pre-recorded) for safe mode ---------- */
  var FALLBACK = { delay: "audio/fallback-call1-delay.mp3", cancellation: "audio/fallback-call2-cancellation.mp3", confirmation: "audio/fallback-call3-confirmation.mp3" };
  var fbAudio = null;
  function playFallback() {
    try { if (fbAudio) fbAudio.pause(); fbAudio = new Audio(FALLBACK[state.stage]); fbAudio.play(); } catch (e) {}
    orbState("speaking"); status("Playing the recorded " + state.stage + " call (fallback mode).");
    if (fbAudio) fbAudio.onended = function () { orbState(""); status("Recording finished - tap to replay."); };
  }

  /* ---------- WhatsApp channel-hop (synthetic) ---------- */
  function bubble(cls, html) { var b = document.createElement("div"); b.className = "bubble " + cls; b.innerHTML = html; return b; }
  function typing(thread, then) {
    var t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
    thread.appendChild(t); thread.scrollTop = thread.scrollHeight;
    setTimeout(function () { t.remove(); then(); }, 1100);
  }
  function fauxQR() {
    var cells = "", n = 11;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var corner = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
      if (corner || ((x * 7 + y * 13 + x * y) % 3 === 0)) cells += '<rect x="' + (x * 8) + '" y="' + (y * 8) + '" width="8" height="8"/>';
    }
    return '<svg class="qr" viewBox="0 0 ' + (n * 8) + ' ' + (n * 8) + '" fill="#111">' + cells + '</svg>';
  }
  var loungeDone = false;
  function showLoungePass() {
    if (loungeDone || (state.tier !== "Gold" && state.tier !== "Platinum")) return;
    loungeDone = true;
    spokeFlash("whatsapp", "<b>WhatsApp</b>: sending a lounge pass while Djordje waits", 4000);
    $("phone").hidden = false;
    var thread = $("thread"); thread.innerHTML = "";
    setTimeout(function () {
      thread.appendChild(bubble("in", "Hi " + GUEST.first + " 👋 Virgin Australia here. While you wait, here's complimentary lounge access - show this at the door:"));
      thread.scrollTop = thread.scrollHeight;
      typing(thread, function () {
        thread.appendChild(bubble("in", "<div class='qrcard'>" + fauxQR() + "<div><b>Virgin Australia Lounge</b><span>Velocity " + state.tier + " · complimentary</span></div></div>"));
        thread.scrollTop = thread.scrollHeight;
      });
    }, 400);
  }
  // After the cancellation call ends (the guest hangs up), the confirmation lands
  // automatically on WhatsApp: new flight + hotel, with the real Salesforce case behind it.
  var confirmDone = false;
  function sendConfirmation() {
    if (confirmDone) return; confirmDone = true;
    var hotel = (state.tier === "Gold" || state.tier === "Platinum");
    createCase("rebook").then(function () {
      $("phone").hidden = false;
      var thread = $("thread");
      setTimeout(function () {
        thread.appendChild(bubble("in", "All sorted, " + GUEST.first + " 🙏 You're rebooked - here's your confirmation:"));
        thread.scrollTop = thread.scrollHeight;
        typing(thread, function () {
          var flight = hotel ? "VA842 · tomorrow 7:50 AM · MEL → SYD" : "VA840 · tonight 9:15 PM · MEL → SYD";
          var extra = hotel
            ? "<span>🛏️ Hotel tonight: PARKROYAL Melbourne Airport - booked &amp; paid</span>"
            : "<span>💳 Fare difference refunded automatically</span>";
          thread.appendChild(bubble("in", "<div class='qrcard'>" + fauxQR() +
            "<div><b>Rebooking confirmed</b><span>" + flight + "</span>" + extra +
            "<span>Velocity " + state.tier + " · e-ticket emailed</span></div></div>"));
          thread.scrollTop = thread.scrollHeight;
          cap("<b>Done.</b> Two calls, one hang-up - the confirmation lands on WhatsApp" + (hotel ? " with the new flight and hotel" : " with the new flight") + ", and a real Salesforce case sits behind it.");
        });
      }, 500);
    });
  }

  /* ---------- stage + tier + ops + reset ---------- */
  function setStage(stage) {
    if (callActive()) endCall();
    state.stage = stage;
    document.querySelectorAll(".stage").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-stage") === stage)); });
    paintEntitlement(true);
    setStep(stage);
    if (stage === "delay") showLoungePass();
  }
  function setTier(tier) {
    state.tier = tier;
    document.querySelectorAll("[data-tier]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-tier") === tier)); });
    paintMember(); paintEntitlement(!$("entitlement").hidden);
  }
  function ops() {
    state.opsStep++;
    var banner = $("opsBanner"), text = $("opsText"), label = $("opsBtnLabel");
    banner.hidden = false;
    if (state.opsStep === 1) {
      text.innerHTML = "<b>VA838 MEL→SYD - DELAYED.</b> New departure ~7:45 PM. Instead of waiting for Djordje to call us, Virgin reaches out first.";
      label.textContent = "Escalate: flight now cancelled";
      setStage("delay");
    } else {
      text.innerHTML = "<b>VA838 - now CANCELLED.</b> The proactive call shifts to rebooking and member care.";
      label.textContent = "Disruption fired";
      $("opsBtn").disabled = true;
      setStage("cancellation");
    }
  }
  function resetDemo() {
    endCall(); if (fbAudio) { try { fbAudio.pause(); } catch (e) {} }
    state.tier = "Gold"; state.stage = "delay"; state.opsStep = 0; loungeDone = false; confirmDone = false; casePromise = null;
    $("opsBanner").hidden = true; $("opsBtn").disabled = false; $("opsBtnLabel").textContent = "Trigger flight disruption";
    $("entitlement").hidden = true; $("sfCard").hidden = true; $("phone").hidden = true; $("thread").innerHTML = "";
    var src = $("memberSrc"); if (src) src.hidden = true;
    spokeSet([]); orbState("");
    document.querySelectorAll(".stage").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-stage") === "delay")); });
    setTier("Gold"); setStep("delay");
    status("Hannah is Virgin's voice. Tap the orb to place the proactive call.");
    cap("");
  }

  /* ---------- wire up ---------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("#orb")) { startCall(); return; }
    if (e.target.closest("#orbMeet")) { startMeet(); return; }
    if (e.target.closest("#endCallBtn")) { endCall(); status("Call ended. Tap the orb to call again."); return; }
    if (e.target.closest("#endMeetBtn")) { endCall(); meetOrb(""); meetStatus("Call ended. Tap the orb to introduce Hannah again."); return; }
    if (e.target.closest("#resetBtn")) { resetDemo(); return; }
    var s = e.target.closest(".stage"); if (s) { setStage(s.getAttribute("data-stage")); return; }
    var t = e.target.closest("[data-tier]"); if (t) { setTier(t.getAttribute("data-tier")); return; }
    if (e.target.closest("#opsBtn")) { ops(); return; }
  });
  document.addEventListener("demomode", function (e) {
    state.mode = e.detail.mode === "safe" ? "safe" : "live";
    endCall();
    status(state.mode === "safe"
      ? "Fallback mode - tap the orb to play a pre-recorded call."
      : "Hannah is Virgin's voice. Tap the orb to place the proactive call.");
  });

  // init
  paintMember(); paintEntitlement(false); setStep("delay"); checkLive();
  sdk();  // warm the SDK so the first orb tap connects fast (keeps the mic gesture)
})();
