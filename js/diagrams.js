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

  /* ---------------- ARCHITECTURE (slide 7) ---------------- */
  var arHost = document.getElementById("archDiagram");
  if (arHost) {
    var AW = 1180, AH = 420, asvg = frame(AW, AH);
    var ae = el("g", {}), an = el("g", {}); asvg.appendChild(ae); asvg.appendChild(an);
    // existing stack (top row + sides), ElevenLabs layer in the middle band
    var box = function (x, y, w, label, sub, cls, tip) { return node(an, x, y, w, 56, label, sub, cls, tip); };
    var ev = box(430, 175, 320, "ElevenLabs voice + orchestration", "STT · TTS · turn-taking · Workflow", "node--accent",
      "<b>ElevenLabs (additive)</b><br>Voice (STT/TTS/turn-taking) + multi-agent orchestration (Workflow / subagents / tool nodes). BYO-LLM reuses your OpenAI; RAG over the KB; tool-calls into Sabre/Velocity/CRM; telephony via Twilio/SIP. <b>Not a rip-and-replace.</b>");
    var top = [
      box(20, 30, 175, "Sabre PSS", "bookings · CONFIRMED", "", "<b>Sabre PSS</b><br>Passenger service system / bookings. <i>Voice layer:</i> tool-calls read PNRs and write rebookings."),
      box(215, 30, 175, "SabreMosaic", "offers/pricing · CONFIRMED", "", "<b>SabreMosaic</b><br>Google-Cloud-native offers & pricing. <i>Voice layer:</i> surfaces ancillary offers mid-conversation."),
      box(410, 30, 175, "Databricks", "data + AI · CONFIRMED", "", "<b>Databricks</b><br>Data + AI platform. <i>Voice layer:</i> feeds analytics, propensity & post-call insight."),
      box(605, 30, 175, "OpenAI", "LLM / trip-planning · CONFIRMED", "", "<b>OpenAI</b><br>Existing LLM deal (Nov 2025). <i>Voice layer:</i> <b>reuse it as the BYO-LLM inside ElevenLabs</b> — model-agnostic."),
      box(800, 30, 175, "Velocity", "loyalty · tiers · points", "node--accent", "<b>Velocity loyalty platform</b><br>Member data, tiers, points. <i>Voice layer:</i> the lookup + entitlement tools call this for tier-aware service.")
    ];
    var bottom = [
      box(20, 330, 175, "CRM", "profile/case · ASSUMPTION", "node--tool", "<b>CRM</b><br>Vendor not public — <b>assumption</b>, validate in discovery. <i>Voice layer:</i> logs the case, reads history."),
      box(215, 330, 205, "Telephony / CCaaS", "ASSUMPTION — validate", "node--tool", "<b>Telephony / CCaaS</b><br><b>Assumption</b> — likely Genesys or Amazon Connect, to validate (don't confuse with the Virgin <i>Atlantic</i> Genesys case study). <i>Voice layer:</i> SIP/CCaaS bridge for inbound + outbound."),
      box(440, 330, 205, "SMS / WhatsApp", "Twilio or similar", "", "<b>SMS / WhatsApp</b><br>Messaging channels (Twilio or similar). <i>Voice layer:</i> the channel-hop — options sent in writing, conversation continues."),
      box(665, 330, 205, "Ops / disruption", "event source", "node--accent", "<b>Ops / disruption-management</b><br>The trigger for proactive outbound. <i>Voice layer:</i> a disruption event fires the outbound call.")
    ];
    top.forEach(function (n) { ae.appendChild(cord(n.cx, n.y + n.h, n.cx, ev.y, "")); });
    bottom.forEach(function (n) { ae.appendChild(cord(n.cx, n.y, n.cx, ev.y + ev.h, "edge--cord")); });
    arHost.appendChild(asvg);
  }
})();
