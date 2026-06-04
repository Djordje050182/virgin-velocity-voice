/* diagrams.js — builds the workflow (slide 6) and architecture (slide 7) SVGs
   with hover tooltips. Cord-curve edges echo the switchboard motif. */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(n, attrs) { var e = document.createElementNS(SVGNS, n); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // shared tooltip
  var tip = document.createElement("div"); tip.className = "tip"; document.body.appendChild(tip);
  function bind(node, html) {
    node.addEventListener("mousemove", function (e) { tip.innerHTML = html; tip.classList.add("show");
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 300) + "px"; tip.style.top = (e.clientY + 14) + "px"; });
    node.addEventListener("mouseleave", function () { tip.classList.remove("show"); });
  }

  function cord(x1, y1, x2, y2, cls) { // a gentle bezier "patch cord"
    var mx = (x1 + x2) / 2;
    return el("path", { class: "edge " + (cls || ""), d: "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2 });
  }

  function node(g, x, y, w, h, label, sub, cls, tipHtml) {
    var ng = el("g", { class: "node " + (cls || ""), transform: "translate(" + x + "," + y + ")" });
    ng.appendChild(el("rect", { x: 0, y: 0, width: w, height: h, rx: 6 }));
    var t = el("text", { x: w / 2, y: sub ? h / 2 - 3 : h / 2 + 4, "text-anchor": "middle", class: "nlabel" }); t.textContent = label; ng.appendChild(t);
    if (sub) { var s = el("text", { x: w / 2, y: h / 2 + 13, "text-anchor": "middle", class: "nsub" }); s.textContent = sub; ng.appendChild(s); }
    if (tipHtml) bind(ng, tipHtml);
    g.appendChild(ng);
    return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2 };
  }

  function frame(w, h) {
    var svg = el("svg", { viewBox: "0 0 " + w + " " + h, role: "img" });
    var defs = el("defs", {});
    var m = el("marker", { id: "arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
    var p = el("path", { d: "M0,0 L10,5 L0,10 z", fill: "currentColor" }); p.style.color = "var(--ink-2)"; m.appendChild(p); defs.appendChild(m); svg.appendChild(defs);
    return svg;
  }

  /* ---------------- WORKFLOW (slide 6) ---------------- */
  var wfHost = document.getElementById("workflowDiagram");
  if (wfHost) {
    var W = 1180, H = 340, svg = frame(W, H);
    var edges = el("g", {}), nodes = el("g", {}); svg.appendChild(edges); svg.appendChild(nodes);
    var y = 150, h = 64;
    var start = node(nodes, 10, y, 130, h, "Start", "ops trigger · call_stage", "",
      "<b>Start node</b><br>Entry point. The simulated ops webhook passes <b>call_stage</b> (delay / cancellation / confirmation) and guest context as dynamic variables.");
    var triBox = node(nodes, 190, y, 150, h, "Guest Care", "subagent · routes", "node--accent",
      "<b>Guest Care subagents</b><br>Three override-agent nodes — Delay, Cancellation, Confirmation — selected by an <b>LLM routing edge</b> on call_stage. Warm Australian voice (Hannah), fast Gemini Flash.");
    var look = node(nodes, 390, y, 160, h, "Velocity Lookup", "subagent (→ API in prod)", "node--accent",
      "<b>Velocity Lookup subagent</b><br>Retrieves tier, points & booking via the lookup tool. <b>Honesty:</b> in production this is a tool/API call into the Velocity platform — modelled as a subagent here to show multi-agent orchestration.");
    var ent = node(nodes, 600, y, 160, h, "Entitlement", "TOOL NODE · deterministic", "node--tool",
      "<b>Entitlement tool node</b><br>Guaranteed execution, success/failure routing. Rules-driven (tier + disruption → gesture). The LLM <b>never improvises</b> who gets a hotel or upgrade.");
    var conf = node(nodes, 810, y, 160, h, "Confirmation", "subagent · loyalty gesture", "node--accent",
      "<b>Confirmation + gesture</b><br>Confirms the rebooking and delivers the exact entitlement returned by the tool node — Gold: lounge/hotel; Platinum: upgrade.");
    var end = node(nodes, 1020, y, 130, h, "End", "graceful close / human", "",
      "<b>End node</b><br>Closes the call. A separate routing edge can hand off to a <b>human</b> if the guest is distressed or out of policy.");
    [[start, triBox], [triBox, look], [look, ent], [ent, conf], [conf, end]].forEach(function (p, i) {
      edges.appendChild(cord(p[0].x + p[0].w, p[0].cy, p[1].x, p[1].cy, i === 2 ? "edge--cord" : ""));
    });
    // branch hint above Guest Care
    var bt = el("text", { x: 265, y: 120, "text-anchor": "middle", class: "elabel" }); bt.textContent = "llm: call_stage"; edges.appendChild(bt);
    var rt = el("text", { x: 680, y: 120, "text-anchor": "middle", class: "elabel" }); rt.textContent = "result: success"; edges.appendChild(rt);
    wfHost.appendChild(svg);
  }

  /* ---------------- ARCHITECTURE (slide 9) — two toggleable views ---------------- */
  var arHost = document.getElementById("archDiagram");
  var archNote = document.getElementById("archNote");

  function buildJourney() {
    var AW = 1180, AH = 430, asvg = frame(AW, AH);
    var ae = el("g", {}), an = el("g", {}); asvg.appendChild(ae); asvg.appendChild(an);
    var box = function (x, y, w, label, sub, cls, tip) { return node(an, x, y, w, 56, label, sub, cls, tip); };
    var ev = box(430, 180, 320, "ElevenLabs voice + orchestration", "STT · TTS · turn-taking · Workflow", "node--accent",
      "<b>ElevenLabs (additive)</b><br>Voice and multi-agent orchestration. Reuses your OpenAI as the model, RAG over the knowledge base, tool-calls into Sabre / Velocity / CRM, and bridges your telephony. It sits on top of the stack, it doesn't replace it.");
    var top = [
      box(20, 30, 175, "Sabre PSS", "bookings · CONFIRMED", "", "<b>Sabre PSS</b><br>Bookings / passenger service system. <i>Voice:</i> reads PNRs, writes rebookings via tool-calls."),
      box(215, 30, 175, "SabreMosaic", "offers · CONFIRMED", "", "<b>SabreMosaic</b><br>Offers & pricing. <i>Voice:</i> surfaces ancillary offers in the conversation."),
      box(410, 30, 175, "Databricks", "data + AI · CONFIRMED", "", "<b>Databricks</b><br>Data + AI platform. <i>Voice:</i> propensity, analytics, post-call insight."),
      box(605, 30, 175, "OpenAI", "LLM · CONFIRMED", "", "<b>OpenAI</b><br>Your existing model deal. <i>Voice:</i> reuse it as the model inside ElevenLabs — we're model-agnostic."),
      box(800, 30, 175, "Velocity", "loyalty · tiers", "node--accent", "<b>Velocity loyalty platform</b><br>Members, tiers, points. <i>Voice:</i> the lookup + entitlement tools call it for tier-aware service.")
    ];
    var bottom = [
      box(20, 340, 175, "CRM", "case · ASSUMPTION", "node--tool", "<b>CRM</b><br>Vendor not public — <b>assumption</b> to validate. <i>Voice:</i> logs the case, reads history."),
      box(215, 340, 235, "Genesys Cloud CX", "telephony · per your steer", "node--tool", "<b>Genesys Cloud CX</b><br>Telephony / CCaaS — <b>per your steer, to confirm</b> (note: not the Virgin <i>Atlantic</i> Genesys case study). <i>Voice:</i> ElevenLabs bridges in via SIP / the Genesys Audio Connector for inbound and outbound, so it slots into your existing routing, queues and reporting."),
      box(470, 340, 175, "SMS / WhatsApp", "Twilio", "", "<b>SMS / WhatsApp</b><br>Messaging (Twilio or similar). <i>Voice:</i> the channel-hop — options in writing, conversation continues."),
      box(665, 340, 205, "Ops / disruption", "event source", "node--accent", "<b>Ops / disruption management</b><br>The trigger for proactive outbound. <i>Voice:</i> a disruption event fires the call.")
    ];
    top.forEach(function (n) { ae.appendChild(cord(n.cx, n.y + n.h, n.cx, ev.y, "")); });
    bottom.forEach(function (n) { ae.appendChild(cord(n.cx, n.y, n.cx, ev.y + ev.h, "edge--cord")); });
    return asvg;
  }

  function buildScale() {
    var AW = 1180, AH = 430, asvg = frame(AW, AH);
    var ae = el("g", {}), an = el("g", {}); asvg.appendChild(ae); asvg.appendChild(an);
    var hub = node(an, 470, 187, 240, 60, "ElevenLabs voice layer", "one layer · many journeys", "node--accent",
      "<b>One voice + orchestration layer</b><br>The same platform you'd pilot on disruption serves every other voice conversation Virgin has. Start with one high-impact journey, then expand.");
    var lobs = [
      { x: 30, y: 30, l: "Consumer support", s: "disruption · refunds · changes", t: "<b>Consumer support</b><br>The pilot. Highest volume, most emotional, biggest cost-to-serve." },
      { x: 30, y: 180, l: "Velocity loyalty", s: "points · tiers · redemptions", t: "<b>Velocity servicing</b><br>13m+ members. Points, redemptions, tier queries — a natural second journey." },
      { x: 30, y: 330, l: "Corporate & business", s: "agents · duty of care", t: "<b>Corporate / business travel</b><br>Managed travel, re-accommodation, duty-of-care notifications." },
      { x: 920, y: 30, l: "Cargo & freight", s: "bookings · tracking", t: "<b>Cargo & freight</b><br>Booking status, capacity, track-and-trace — a B2B voice line entirely separate from consumer." },
      { x: 920, y: 180, l: "Charter & regional", s: "resources sector", t: "<b>Charter / regional (VARA)</b><br>Fly-in fly-out and resources-sector charter — scheduling and crew/passenger comms." },
      { x: 920, y: 330, l: "Holidays & trade", s: "packages · agents", t: "<b>Holidays & trade</b><br>Packages and the travel-agent line — quoting, changes, support." }
    ];
    lobs.forEach(function (b) {
      var n = node(an, b.x, b.y, 230, 56, b.l, b.s, b.x < 200 ? "" : "node--accent", b.t);
      var fromRight = b.x > 200;
      ae.appendChild(cord(fromRight ? n.x : n.x + n.w, n.cy, fromRight ? hub.x + hub.w : hub.x, hub.cy, b.y === 180 ? "edge--cord" : ""));
    });
    return asvg;
  }

  function buildEcosystem() {
    var W = 1180, H = 430, svg = frame(W, H);
    var ae = el("g", {}), an = el("g", {}); svg.appendChild(ae); svg.appendChild(an);
    var b = function (x, y, w, h, l, s, c, t) { return node(an, x, y, w, h, l, s, c, t); };
    // left: guest -> genesys -> hub
    var guest = b(20, 40, 150, 52, "Guest", "voice in / out", "",
      "<b>The guest</b><br>Speaks naturally. Inbound or proactive outbound.");
    var gen = b(20, 190, 150, 52, "Genesys", "telephony · CCaaS", "node--tool",
      "<b>Genesys Cloud CX</b><br>The telephony layer — routing, queues, recording, reporting. ElevenLabs bridges in via SIP / the Genesys Audio Connector. <i>Additive, not a replacement.</i> <span style='color:#ffb3b3'>per your steer, to confirm</span>");
    var hub = b(330, 110, 280, 120, "ElevenLabs", "voice + intelligence layer", "node--accent",
      "<b>ElevenLabs</b><br>STT · a fast model · multi-agent orchestration · TTS (~75ms). The conversational brain that listens, reasons, and decides which system to call. BYO-LLM reuses your OpenAI.");
    var subt = el("text", { x: 470, y: 200, "text-anchor": "middle", class: "nsub" }); subt.textContent = "STT · fast LLM · orchestration · TTS"; an.appendChild(subt);
    // right spokes via MCP
    var dbx = b(760, 50, 230, 64, "Databricks", "lakehouse · READ", "node--data",
      "<b>Databricks</b><br>The unified data layer — booking and member context, sourced from <b>Sabre PSS, SabreMosaic and Velocity</b>. ElevenLabs reads it as a tool over <b>MCP</b> or a secure API.");
    var dsrc = el("text", { x: 875, y: 130, "text-anchor": "middle", class: "elabel" }); dsrc.textContent = "← Sabre · SabreMosaic · Velocity"; an.appendChild(dsrc);
    var af = b(760, 250, 230, 64, "Agentforce", "Service Cloud · ACT", "node--act",
      "<b>Agentforce (Salesforce)</b><br>Where a workflow belongs to the CRM — rebook, raise a case, push a refund — ElevenLabs calls your Agentforce agent over <b>MCP</b>, waits, and speaks the result back. <b>Voice inside Agentforce, not versus it.</b>");
    // edges
    ae.appendChild(cord(guest.x + guest.w, guest.cy, hub.x, hub.cy - 20));
    ae.appendChild(cord(gen.x + gen.w, gen.cy, hub.x, hub.cy + 20));
    var e1 = cord(hub.x + hub.w, hub.cy - 25, dbx.x, dbx.cy, "edge--cord"); ae.appendChild(e1);
    var e2 = cord(hub.x + hub.w, hub.cy + 25, af.x, af.cy, "edge--cord"); ae.appendChild(e2);
    var l1 = el("text", { x: 690, y: 120, "text-anchor": "middle", class: "elabel" }); l1.textContent = "read · MCP"; ae.appendChild(l1);
    var l2 = el("text", { x: 690, y: 270, "text-anchor": "middle", class: "elabel" }); l2.textContent = "act · MCP"; ae.appendChild(l2);
    return svg;
  }

  function setArch(view) {
    if (!arHost) return;
    arHost.innerHTML = "";
    arHost.appendChild(view === "scale" ? buildScale() : view === "ecosystem" ? buildEcosystem() : buildJourney());
    document.querySelectorAll("#archToggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-arch") === view)); });
    if (archNote) archNote.innerHTML =
      view === "scale" ? "The pilot is one journey. The opportunity is every voice conversation Virgin has, across consumer, loyalty, corporate, cargo, charter and trade. <span class='tag'>lines of business to confirm with you</span>"
      : view === "ecosystem" ? "ElevenLabs is the voice + intelligence layer: it reads from Databricks and acts through Agentforce over MCP, riding your Genesys telephony. <span class='tag'>simulated for the demo — live MCP/tool calls in production</span>"
      : "Confirmed systems are labelled. <span class='tag'>assumption</span> marks things to validate with you. Latency: Flash v2 for real-time English at ~75ms; v2.5 is multilingual at the same speed; Eleven v3 covers 70+ languages but isn't for real-time agents.";
  }

  // intelligence-layer slide reuses the ecosystem diagram
  var layerHost = document.getElementById("layerDiagram");
  if (layerHost) layerHost.appendChild(buildEcosystem());
  if (arHost) {
    setArch("journey");
    document.addEventListener("click", function (e) {
      var b = e.target.closest("#archToggle button"); if (b) setArch(b.getAttribute("data-arch"));
    });
  }
})();
