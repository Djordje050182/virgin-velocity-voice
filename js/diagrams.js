/* diagrams.js - builds the workflow (slide 6) and architecture (slide 7) SVGs
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
      "<b>Guest Care subagents</b><br>Three override-agent nodes - Delay, Cancellation, Confirmation - selected by an <b>LLM routing edge</b> on call_stage. Warm Australian voice (Hannah), fast Gemini Flash.");
    var look = node(nodes, 390, y, 160, h, "Velocity Lookup", "subagent (→ API in prod)", "node--accent",
      "<b>Velocity Lookup subagent</b><br>Retrieves tier, points & booking via the lookup tool. <b>Honesty:</b> in production this is a tool/API call into the Velocity platform - modelled as a subagent here to show multi-agent orchestration.");
    var ent = node(nodes, 600, y, 160, h, "Entitlement", "TOOL NODE · deterministic", "node--tool",
      "<b>Entitlement tool node</b><br>Guaranteed execution, success/failure routing. Rules-driven (tier + disruption → gesture). The LLM <b>never improvises</b> who gets a hotel or upgrade.");
    var conf = node(nodes, 810, y, 160, h, "Confirmation", "subagent · loyalty gesture", "node--accent",
      "<b>Confirmation + gesture</b><br>Confirms the rebooking and delivers the exact entitlement returned by the tool node - Gold: lounge/hotel; Platinum: upgrade.");
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

  /* ---------------- ARCHITECTURE (slide 9) - two toggleable views ---------------- */
  var arHost = document.getElementById("archDiagram");
  var archNote = document.getElementById("archNote");

  function buildJourney() {
    var AW = 1180, AH = 430, asvg = frame(AW, AH);
    var ae = el("g", {}), an = el("g", {}); asvg.appendChild(ae); asvg.appendChild(an);
    var box = function (x, y, w, label, sub, cls, tip) { return node(an, x, y, w, 56, label, sub, cls, tip); };
    var ev = box(430, 180, 320, "ElevenLabs voice + orchestration", "STT · TTS · turn-taking · Workflow", "node--accent",
      "<b>ElevenLabs (additive)</b><br>Voice and multi-agent orchestration. Reuses your OpenAI as the model, RAG over the knowledge base, tool-calls into Sabre / Velocity / CRM, and bridges your telephony. It sits on top of the stack, it doesn't replace it.");
    var top = [
      box(20, 30, 175, "Sabre PSS", "engine room · CONFIRMED", "", "<b>Sabre PSS (SabreSonic)</b><br>The <b>engine room</b> - reservations, ticketing & departure control; the system of record for bookings/orders. <i>Voice:</i> reads PNRs, writes rebookings via tool-calls."),
      box(215, 30, 175, "SabreMosaic", "offers/orders · CONFIRMED", "", "<b>SabreMosaic</b><br>Modern offer & order retailing - AI dynamic pricing & ancillaries (Google Cloud). <i>Voice:</i> surfaces personalised offers mid-conversation."),
      box(410, 30, 175, "Amadeus", "shop window · CONFIRMED", "", "<b>Amadeus</b><br>The <b>shop window</b> - distribution / GDS pushing fares, seatmaps & ancillaries to travel agents and corporates (EDIFACT today, NDC next). <i>Voice:</i> agent-booked trips surface in the same call."),
      box(605, 30, 175, "Databricks", "data + AI · LIVE", "node--data", "<b>Databricks</b><br>Unified lakehouse harmonising Sabre + Amadeus + Velocity. <b>Live in this demo:</b> the lookup tool runs a real SQL join here."),
      box(800, 30, 175, "OpenAI", "LLM · CONFIRMED", "", "<b>OpenAI</b><br>Your existing model deal. <i>Voice:</i> reuse it as the model inside ElevenLabs - we're model-agnostic."),
      box(995, 30, 175, "Velocity", "loyalty · tiers", "node--accent", "<b>Velocity loyalty platform</b><br>13m+ members, tiers, points. <i>Voice:</i> the lookup + entitlement tools call it for tier-aware service.")
    ];
    var bottom = [
      box(20, 340, 175, "CRM", "case · ASSUMPTION", "node--tool", "<b>CRM</b><br>Vendor not public - <b>assumption</b> to validate. <i>Voice:</i> logs the case, reads history."),
      box(215, 340, 235, "Genesys Cloud CX", "telephony · per your steer", "node--tool", "<b>Genesys Cloud CX</b><br>Telephony / CCaaS - <b>per your steer, to confirm</b> (note: not the Virgin <i>Atlantic</i> Genesys case study). <i>Voice:</i> ElevenLabs bridges in via SIP / the Genesys Audio Connector for inbound and outbound, so it slots into your existing routing, queues and reporting."),
      box(470, 340, 175, "SMS / WhatsApp", "Twilio", "", "<b>SMS / WhatsApp</b><br>Messaging (Twilio or similar). <i>Voice:</i> the channel-hop - options in writing, conversation continues."),
      box(665, 340, 205, "Ops / disruption", "event source", "node--accent", "<b>Ops / disruption management</b><br>The trigger for proactive outbound. <i>Voice:</i> a disruption event fires the call.")
    ];
    // converge every system into the ElevenLabs box (spread entry points across its width)
    top.forEach(function (n, i) { ae.appendChild(cord(n.cx, n.y + n.h, ev.x + ev.w * (i + 1) / (top.length + 1), ev.y, "")); });
    bottom.forEach(function (n, i) { ae.appendChild(cord(n.cx, n.y, ev.x + ev.w * (i + 1) / (bottom.length + 1), ev.y + ev.h, "edge--cord")); });
    return asvg;
  }

  function buildScale() {
    var AW = 1180, AH = 430, asvg = frame(AW, AH);
    var ae = el("g", {}), an = el("g", {}); asvg.appendChild(ae); asvg.appendChild(an);
    var hub = node(an, 470, 187, 240, 60, "ElevenLabs voice layer", "one layer · many journeys", "node--accent",
      "<b>One voice + orchestration layer</b><br>The same platform you'd pilot on disruption serves every other voice conversation Virgin has. Start with one high-impact journey, then expand.");
    var lobs = [
      { x: 30, y: 30, l: "Consumer support", s: "disruption · refunds · changes", t: "<b>Consumer support</b><br>The pilot. Highest volume, most emotional, biggest cost-to-serve." },
      { x: 30, y: 180, l: "Velocity loyalty", s: "points · tiers · redemptions", t: "<b>Velocity servicing</b><br>13m+ members. Points, redemptions, tier queries - a natural second journey." },
      { x: 30, y: 330, l: "Corporate & business", s: "agents · duty of care", t: "<b>Corporate / business travel</b><br>Managed travel, re-accommodation, duty-of-care notifications." },
      { x: 920, y: 30, l: "Cargo & freight", s: "bookings · tracking", t: "<b>Cargo & freight</b><br>Booking status, capacity, track-and-trace - a B2B voice line entirely separate from consumer." },
      { x: 920, y: 180, l: "Charter & regional", s: "resources sector", t: "<b>Charter / regional (VARA)</b><br>Fly-in fly-out and resources-sector charter - scheduling and crew/passenger comms." },
      { x: 920, y: 330, l: "Holidays & trade", s: "packages · agents", t: "<b>Holidays & trade</b><br>Packages and the travel-agent line - quoting, changes, support." }
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
      "<b>Genesys Cloud CX</b><br>The telephony layer - routing, queues, recording, reporting. ElevenLabs bridges in via SIP / the Genesys Audio Connector. <i>Additive, not a replacement.</i> <span style='color:#ffb3b3'>per your steer, to confirm</span>");
    var hub = b(330, 110, 280, 120, "ElevenLabs", "voice + intelligence layer", "node--accent",
      "<b>ElevenLabs</b><br>STT · a fast model · multi-agent orchestration · TTS (~75ms). The conversational brain that listens, reasons, and decides which system to call. BYO-LLM reuses your OpenAI.");
    // right spokes via MCP
    var dbx = b(760, 50, 230, 64, "Databricks", "lakehouse · LIVE", "node--data",
      "<b>Databricks</b><br>The unified lakehouse - booking & member context harmonised from <b>Sabre PSS, SabreMosaic, Amadeus and Velocity</b>. <b>Live in this demo:</b> ElevenLabs runs a real SQL join here via a secure proxy (MCP-ready).");
    var dsrc = el("text", { x: 875, y: 130, "text-anchor": "middle", class: "elabel" }); dsrc.textContent = "← Sabre · Amadeus · SabreMosaic · Velocity"; an.appendChild(dsrc);
    var af = b(760, 250, 230, 64, "Agentforce", "Service Cloud · ACT", "node--act",
      "<b>Agentforce (Salesforce)</b><br>Where a workflow belongs to the CRM - rebook, raise a case, push a refund - ElevenLabs calls your Agentforce agent over <b>MCP</b>, waits, and speaks the result back. <b>Voice inside Agentforce, not versus it.</b>");
    // edges
    ae.appendChild(cord(guest.x + guest.w, guest.cy, hub.x, hub.cy - 20));
    ae.appendChild(cord(gen.x + gen.w, gen.cy, hub.x, hub.cy + 20));
    var e1 = cord(hub.x + hub.w, hub.cy - 25, dbx.x, dbx.cy, "edge--cord"); ae.appendChild(e1);
    var e2 = cord(hub.x + hub.w, hub.cy + 25, af.x, af.cy, "edge--cord"); ae.appendChild(e2);
    var l1 = el("text", { x: 690, y: 120, "text-anchor": "middle", class: "elabel" }); l1.textContent = "read · MCP"; ae.appendChild(l1);
    var l2 = el("text", { x: 690, y: 270, "text-anchor": "middle", class: "elabel" }); l2.textContent = "act · MCP"; ae.appendChild(l2);
    return svg;
  }

  /* ---------------- RUNTIME ORCHESTRATION (How we built this) ----------------
     Tells the story: ElevenLabs is the conductor. One conversation; it listens,
     reasons, reads LIVE from Databricks, acts LIVE in Salesforce, and speaks. */
  function buildRuntime() {
    var W = 1180, H = 470, svg = frame(W, H);
    var ae = el("g", {}), an = el("g", {}); svg.appendChild(ae); svg.appendChild(an);
    var b = function (x, y, w, h, l, s, c, t) { return node(an, x, y, w, h, l, s, c, t); };

    // numbered story badge - hover it for the turn-by-turn detail
    function badge(x, y, n, label, tip) {
      var g = el("g", { transform: "translate(" + x + "," + y + ")" }); g.style.cursor = "pointer";
      var hit = el("circle", { cx: 0, cy: 0, r: 20 }); hit.style.cssText = "fill:transparent"; g.appendChild(hit);
      var c = el("circle", { cx: 0, cy: 0, r: 13 }); c.style.cssText = "fill:var(--va-red)";
      g.appendChild(c);
      var t = el("text", { x: 0, y: 4, "text-anchor": "middle" });
      t.style.cssText = "fill:#fff;font:700 12px 'Space Grotesk',sans-serif;pointer-events:none"; t.textContent = n; g.appendChild(t);
      if (label) { var lt = el("text", { x: 19, y: 5, class: "elabel" }); lt.style.pointerEvents = "none"; lt.textContent = label; g.appendChild(lt); }
      if (tip) bind(g, tip);
      an.appendChild(g);
    }

    // left rail: guest / telephony / disruption trigger
    var guest = b(20, 40, 150, 54, "Guest", "voice in / out", "",
      "<b>The guest</b><br>Speaks naturally - inbound, or a proactive outbound call.");
    var gen = b(20, 200, 150, 54, "Genesys", "telephony · CCaaS", "node--tool",
      "<b>Genesys Cloud CX</b><br>Your telephony. ElevenLabs bridges in via SIP / Audio Connector. <span style='color:#ffb3b3'>per your steer, to confirm</span>");
    var ops = b(20, 360, 150, 54, "Ops / disruption", "event trigger", "node--accent",
      "<b>Disruption event</b><br>A VA838 delay/cancel fires the proactive call.");

    // centre: ElevenLabs - the conductor (custom tall box with capability lines)
    var hx = 330, hy = 60, hw = 300, hh = 350;
    var hg = el("g", { class: "node node--accent", transform: "translate(" + hx + "," + hy + ")" });
    hg.appendChild(el("rect", { x: 0, y: 0, width: hw, height: hh, rx: 8 }));
    var ht = el("text", { x: hw / 2, y: 38, "text-anchor": "middle", class: "nlabel" }); ht.textContent = "ElevenLabs"; hg.appendChild(ht);
    var hs = el("text", { x: hw / 2, y: 60, "text-anchor": "middle", class: "nsub" }); hs.textContent = "the orchestration layer - conducts every turn"; hg.appendChild(hs);
    [["Listen", "speech-to-text"],
     ["Reason", "any fast model - Gemini, GPT, Claude, Qwen"],
     ["Read or act", "calls the right system as a tool"],
     ["Speak", "text-to-speech · ~75 ms"]].forEach(function (r, i) {
      var ry = 110 + i * 56;
      var a = el("text", { x: 34, y: ry, class: "nlabel", "text-anchor": "start" });
      a.style.cssText = "font-size:14px"; a.textContent = r[0]; hg.appendChild(a);
      var s = el("text", { x: 34, y: ry + 18, class: "nsub", "text-anchor": "start" }); s.textContent = r[1]; hg.appendChild(s);
    });
    an.appendChild(hg);
    bind(hg, "<b>ElevenLabs - the conductor</b><br>One conversation. It listens, reasons on a fast model, decides which system to call, and speaks the result - turn by turn, in real time. Every other box is a tool it orchestrates.");
    var hub = { x: hx, y: hy, w: hw, h: hh, cx: hx + hw / 2, cy: hy + hh / 2 };

    // right: secure tool layer → live systems
    var proxy = b(720, 205, 150, 60, "Tool layer", "secure proxy · MCP-ready", "node--tool",
      "<b>Tool / action layer</b><br>A secure proxy holds the credentials and brokers each tool call - Databricks SQL and Salesforce REST today, MCP-ready for production. <b>The voice agent never holds a secret.</b>");
    var dbx = b(950, 70, 210, 64, "Databricks", "READ · live", "node--data",
      "<b>Databricks - live read</b><br>Velocity ⋈ Sabre · Amadeus, harmonised. The member lookup runs a <b>real SQL join</b> here, mid-call.");
    var sf = b(950, 330, 210, 64, "Salesforce", "Service Cloud · ACT · live", "node--act",
      "<b>Salesforce · Service Cloud - live act</b><br>ElevenLabs calls in to <b>create a real Case</b> / rebook. Voice inside Salesforce, not versus it.");

    // cords: in (guest/telephony/ops → hub), out to tools, return path
    ae.appendChild(cord(guest.x + guest.w, guest.cy, hub.x, hub.cy - 130));
    ae.appendChild(cord(gen.x + gen.w, gen.cy, hub.x, hub.cy - 40));
    ae.appendChild(cord(ops.x + ops.w, ops.cy, hub.x, hub.cy + 110, "edge--cord"));
    ae.appendChild(cord(hub.x + hub.w, hub.cy - 30, proxy.x, proxy.cy, "edge--cord"));
    ae.appendChild(cord(proxy.x + proxy.w, proxy.cy, dbx.x, dbx.cy, "edge--cord"));
    ae.appendChild(cord(proxy.x + proxy.w, proxy.cy, sf.x, sf.cy, "edge--cord"));
    ae.appendChild(cord(hub.x, hub.cy + 110, gen.x + gen.w, gen.cy + 10, ""));

    // the 1→7 story, around the path
    badge(250, ops.cy, "1", "disruption → call", "<b>1 · Disruption fires the call</b><br>The ops system flags VA838 - delayed, then cancelled - and ElevenLabs places a <b>proactive outbound call</b>. Virgin reaches out first, before the guest ever has to.");
    badge(250, gen.cy, "2", "caller speaks", "<b>2 · The guest speaks</b><br>The call connects over Genesys telephony and the guest talks naturally. ElevenLabs transcribes in real time (speech-to-text).");
    badge(672, 150, "3", "reason", "<b>3 · Reason</b><br>ElevenLabs reasons on a fast model - <b>Gemini 2.5 Flash here</b>, but it's <b>model-agnostic</b>: swap in GPT, Claude or an open model like Qwen. It decides the next best action.");
    badge(905, 104, "4", "read - live", "<b>4 · Read, live</b><br>A real SQL query into <b>Databricks</b> joins the guest's Velocity loyalty record with their Sabre &amp; Amadeus booking - returned mid-call.");
    badge(672, 300, "5", "decide", "<b>5 · Decide</b><br>It reasons over what came back, applies the deterministic entitlement rule, and decides to act.");
    badge(905, 364, "6", "act - live", "<b>6 · Act, live</b><br>It creates a <b>real Case in Salesforce</b> Service Cloud - rebooking, refund or case - and waits for the result.");
    badge(250, guest.cy, "7", "Hannah speaks", "<b>7 · Hannah speaks</b><br>It composes the answer and Hannah speaks it back - all inside one natural voice turn.");
    return svg;
  }

  var rtHost = document.getElementById("runtimeDiagram");
  if (rtHost) rtHost.appendChild(buildRuntime());

  /* ---------------- HOLISTIC ARCHITECTURE (slide: Architecture) ----------------
     Your systems land in Databricks; ElevenLabs reads from it, acts through Agentforce,
     rides Genesys telephony, and serves every line of business. One voice layer. */
  function buildHolistic() {
    var W = 1180, H = 520, svg = frame(W, H);
    var ae = el("g", {}), an = el("g", {}); svg.appendChild(ae); svg.appendChild(an);
    var box = function (x, y, w, h, l, s, c, t) { return node(an, x, y, w, h, l, s, c, t); };
    function glabel(x, y, txt) { var t = el("text", { x: x, y: y, class: "elabel" }); t.style.cssText = "font-weight:600;letter-spacing:.09em;text-transform:uppercase;opacity:.65"; t.textContent = txt; an.appendChild(t); }

    // top banner: lines of business - an overlay across everything
    var br = el("rect", { x: 20, y: 6, width: 1140, height: 38, rx: 8 });
    br.style.cssText = "fill:color-mix(in srgb, var(--vel-violet) 9%, var(--paper)); stroke:var(--line)"; an.appendChild(br);
    var bt = el("text", { x: 38, y: 30, class: "nlabel", "text-anchor": "start" }); bt.style.cssText = "font-size:13px"; bt.textContent = "Across every line of business"; an.appendChild(bt);
    var bs = el("text", { x: 1142, y: 30, class: "nsub", "text-anchor": "end" }); bs.textContent = "consumer · loyalty · corporate · cargo · charter · holidays"; an.appendChild(bs);

    // LEFT: your systems → Databricks
    glabel(20, 78, "Back of house · systems & data");
    var sys = [
      box(20, 94, 140, 40, "Sabre PSS", "reservations", "", "<b>Sabre PSS</b><br>Bookings, ticketing, departure control."),
      box(20, 142, 140, 40, "SabreMosaic", "offers & orders", "", "<b>SabreMosaic</b><br>Dynamic offers and ancillaries."),
      box(20, 190, 140, 40, "Amadeus", "distribution", "", "<b>Amadeus</b><br>GDS / NDC distribution."),
      box(20, 238, 140, 40, "Velocity", "loyalty", "node--accent", "<b>Velocity</b><br>13m+ members, tiers and points."),
      box(20, 286, 140, 40, "Ops", "disruption events", "", "<b>Ops</b><br>Disruption signals that trigger outreach.")
    ];
    var dbx = box(200, 170, 125, 90, "Databricks", "data layer · LIVE", "node--data",
      "<b>Databricks</b><br>Every system on the left lands here, harmonised. ElevenLabs reads it live.");
    sys.forEach(function (n) { ae.appendChild(cord(n.x + n.w, n.cy, dbx.x, dbx.cy, "edge--cord")); });
    var dl = el("text", { x: 182, y: 163, "text-anchor": "middle", class: "elabel" }); dl.textContent = "lands in"; an.appendChild(dl);

    // CENTRE: ElevenLabs - the hero, with its capabilities
    var hx = 375, hy = 102, hw = 262, hh = 286;
    var hg = el("g", { class: "node node--accent", transform: "translate(" + hx + "," + hy + ")" });
    hg.appendChild(el("rect", { x: 0, y: 0, width: hw, height: hh, rx: 8 }));
    var hT = el("text", { x: hw / 2, y: 30, "text-anchor": "middle", class: "nlabel" }); hT.textContent = "ElevenLabs"; hg.appendChild(hT);
    var hS = el("text", { x: hw / 2, y: 49, "text-anchor": "middle", class: "nsub" }); hS.textContent = "the conversational-AI layer"; hg.appendChild(hS);
    ["Listen · reason · speak (~75 ms)",
     "Orchestrates every system, every turn",
     "Reads your data, acts in your CRM",
     "Voice on any channel - plus a web / app agent",
     "Evals, analytics & observability built in",
     "Guardrailed, model-agnostic, secure"].forEach(function (line, i) {
      var t = el("text", { x: 20, y: 78 + i * 30, class: "nsub", "text-anchor": "start" }); t.style.cssText = "font-size:11.5px"; t.textContent = "• " + line; hg.appendChild(t);
    });
    an.appendChild(hg);
    bind(hg, "<b>ElevenLabs - the hero</b><br>The conversational-AI layer that conducts your whole stack: it listens, reasons on a fast model, reads from Databricks, acts in Salesforce, and speaks - on any channel a customer uses.");
    var hub = { x: hx, y: hy, w: hw, h: hh, cx: hx + hw / 2, cy: hy + hh / 2 };
    ae.appendChild(cord(dbx.x + dbx.w, dbx.cy, hub.x, hub.cy - 20, "edge--cord"));
    var rl = el("text", { x: 352, y: 200, "text-anchor": "middle", class: "elabel" }); rl.textContent = "reads"; an.appendChild(rl);

    // ACT: Salesforce below the hero
    var af = box(402, 402, 208, 56, "Salesforce", "Service Cloud · acts", "node--act",
      "<b>Salesforce · Service Cloud</b><br>Where the voice agent hands transactional work - rebooking, refunds, cases. ElevenLabs calls in and speaks the result back. Voice inside Salesforce, not versus it.");
    ae.appendChild(cord(hub.cx, hub.y + hub.h, af.cx, af.y, "edge--cord"));
    var actl = el("text", { x: hub.cx + 26, y: 396, "text-anchor": "start", class: "elabel" }); actl.textContent = "acts"; an.appendChild(actl);

    // RIGHT: the channels it serves
    glabel(700, 78, "Front of house · channels");
    var chans = [
      box(700, 94, 178, 40, "Phone", "inbound & proactive", "node--tool", "<b>Phone</b><br>Inbound and proactive outbound calls - the core voice channel."),
      box(700, 142, 178, 40, "Website", "web & in-app agent", "node--tool", "<b>Website</b><br>ElevenLabs appears as a talk-to agent right on the site or app."),
      box(700, 190, 178, 40, "Live chat", "text, same brain", "node--tool", "<b>Live chat</b><br>The same agent, in writing."),
      box(700, 238, 178, 40, "WhatsApp", "messaging", "node--tool", "<b>WhatsApp</b><br>Channel-hop to messaging mid-journey."),
      box(700, 286, 178, 40, "SMS / text", "notifications & replies", "node--tool", "<b>SMS / text</b><br>Status, options and quick replies."),
      box(700, 334, 178, 40, "Contact centre", "Genesys · human handoff", "node--tool", "<b>Contact centre</b><br>Rides your Genesys telephony; warm-transfers to a human when needed.")
    ];
    chans.forEach(function (n) { ae.appendChild(cord(hub.x + hub.w, hub.cy, n.x, n.cy, "edge--cord")); });
    var sv = el("text", { x: 668, y: 200, "text-anchor": "middle", class: "elabel" }); sv.textContent = "serves"; an.appendChild(sv);

    // FAR RIGHT: the customer / member the whole stack exists for
    glabel(952, 78, "Who it's for");
    var cust = box(952, 168, 168, 92, "Your member", "13m+ Velocity · live", "node--accent",
      "<b>Your member</b><br>The person the whole stack exists to serve. They never see Databricks or Salesforce - they just talk, in their words, on the channel they're already on, and get a real outcome.");
    chans.forEach(function (n) { ae.appendChild(cord(n.x + n.w, n.cy, cust.x, cust.cy, "edge--cord")); });
    var rl2 = el("text", { x: 920, y: 214, "text-anchor": "middle", class: "elabel" }); rl2.textContent = "reaches"; an.appendChild(rl2);
    return svg;
  }

  function setArch(view) {
    if (!arHost) return;
    arHost.innerHTML = "";
    arHost.appendChild(view === "scale" ? buildScale() : buildHolistic());
    document.querySelectorAll("#archToggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-arch") === view)); });
    if (archNote) archNote.innerHTML =
      view === "scale" ? "The pilot is one journey. The opportunity is every voice conversation Virgin has, across consumer, loyalty, corporate, cargo, charter and trade. <span class='tag'>lines of business to confirm with you</span>"
      : "Back of house, your systems land in Databricks. ElevenLabs reads it live, acts in Salesforce, and serves the member on any front-of-house channel - phone, web, chat, WhatsApp, SMS or the contact centre - across every line of business. <span class='tag'>Databricks read + Salesforce act are live; data is synthetic</span>";
  }

  // intelligence-layer slide reuses the ecosystem diagram
  var layerHost = document.getElementById("layerDiagram");
  if (layerHost) layerHost.appendChild(buildEcosystem());
  if (arHost) {
    setArch("fit");
    document.addEventListener("click", function (e) {
      var b = e.target.closest("#archToggle button"); if (b) setArch(b.getAttribute("data-arch"));
    });
  }

  /* ============================================================
     ANIMATED ARCHITECTURE - two call patterns over one stack.
     Genesys <-> ElevenLabs (Hannah) <-> webhook tools <-> Databricks / Salesforce.
     A packet flows along the active leg each step; the step rail + caption narrate.
     ============================================================ */
  var flowHost = document.getElementById("flowDiagram");
  if (flowHost) {
    var FW = 1200, FH = 430;

    // node that returns its <g> (so we can toggle .act) plus edge anchor points
    function fnode(g, x, y, w, h, label, lines, cls, tag) {
      var ng = el("g", { class: "flnode " + (cls || ""), transform: "translate(" + x + "," + y + ")" });
      ng.appendChild(el("rect", { x: 0, y: 0, width: w, height: h, rx: 8 }));
      var lt = el("text", { x: 14, y: 25, class: "nlabel", "text-anchor": "start" }); lt.textContent = label; ng.appendChild(lt);
      (lines || []).forEach(function (ln, i) {
        var s = el("text", { x: 14, y: 45 + i * 17, class: "nsub", "text-anchor": "start" }); s.style.fontSize = "11px"; s.textContent = ln; ng.appendChild(s);
      });
      if (tag) { var tg = el("text", { x: w - 12, y: 23, class: "fltag", "text-anchor": "end" }); tg.textContent = tag; ng.appendChild(tg); }
      g.appendChild(ng);
      return { g: ng, cx: x + w / 2, cy: y + h / 2,
               left: { x: x, y: y + h / 2 }, right: { x: x + w, y: y + h / 2 } };
    }

    var fsvg = frame(FW, FH); fsvg.setAttribute("class", "flow-svg");
    var eg = el("g", {}), nodeg = el("g", {}); fsvg.appendChild(eg); fsvg.appendChild(nodeg);
    var N = {};
    N.cust = fnode(nodeg, 24, 178, 124, 80, "Customer", ["mobile / phone"], "");
    N.gen  = fnode(nodeg, 226, 150, 166, 136, "Genesys", ["Cloud telephony", "Architect flow", "Audio Connector", "Dialer + AMD"], "flnode--tool");
    N.el   = fnode(nodeg, 458, 138, 286, 162, "ElevenLabs", ["Hannah · Conversational AI", "Bidirectional WSS audio", "Reason on a fast model", "Webhook / server tools", "The orchestration layer"], "flnode--accent flnode--hero");
    N.tool = fnode(nodeg, 818, 184, 148, 72, "Webhook tools", ["secure proxy", "holds credentials"], "flnode--tool");
    N.dbx  = fnode(nodeg, 1014, 92, 162, 94, "Databricks", ["SQL Statement", "Execution API"], "flnode--data", "READ");
    N.sf   = fnode(nodeg, 1014, 272, 162, 94, "Salesforce", ["Service Cloud", "Support Case"], "flnode--act", "ACT");

    var E = {};
    function edge(id, a, b) { var p = cord(a.x, a.y, b.x, b.y, "edge-f"); p.id = id; eg.appendChild(p); E[id] = p; }
    edge("e_cust_gen", N.cust.right, N.gen.left);
    edge("e_gen_el",   N.gen.right,  N.el.left);
    edge("e_el_tool",  N.el.right,   N.tool.left);
    edge("e_tool_dbx", N.tool.right, N.dbx.left);
    edge("e_tool_sf",  N.tool.right, N.sf.left);
    flowHost.appendChild(fsvg);

    var FLOWS = {
      outbound: [
        { n: ["gen", "cust"], e: [["e_cust_gen", "rev"]], t: "Dialer places the call", c: "The <b>Genesys outbound dialer</b> calls the customer. <b>Answering Machine Detection</b> confirms a live human before connecting." },
        { n: ["gen", "el"], e: [["e_gen_el", "fwd"]], t: "Audio Connector → ElevenLabs", c: "Genesys triggers the <b>Call Audio Connector</b>, opens a <b>bidirectional WebSocket</b> to ElevenLabs and passes context - name, flight - as <b>input session variables</b>." },
        { n: ["el", "cust"], e: [["e_gen_el", "fwd"], ["e_cust_gen", "rev"]], t: "Hannah greets, personally", c: "Hannah opens with a <b>personalised greeting</b> using the passed variables - a real conversation, not a phone menu." },
        { n: ["el", "tool", "dbx"], e: [["e_el_tool", "fwd"], ["e_tool_dbx", "fwd"]], t: "Webhook → Databricks", c: "Hannah calls a <b>webhook tool</b> through the secure proxy into <b>Databricks</b> (SQL Statement Execution API) for real-time status - the flight delay." },
        { n: ["dbx", "el"], e: [["e_tool_dbx", "rev"], ["e_el_tool", "rev"]], t: "Live status returns", c: "<b>Databricks</b> returns the live status to ElevenLabs, mid-call." },
        { n: ["el", "tool", "sf"], e: [["e_el_tool", "fwd"], ["e_tool_sf", "fwd"]], t: "Webhook → Salesforce", c: "If the customer wants a change, Hannah logs or updates a <b>Support Case</b> in <b>Salesforce Service Cloud</b> via a webhook tool." },
        { n: ["sf", "el"], e: [["e_tool_sf", "rev"], ["e_el_tool", "rev"]], t: "Case ID returns", c: "<b>Salesforce</b> returns the Case ID to ElevenLabs." },
        { n: ["el", "gen"], e: [["e_gen_el", "rev"]], t: "Output variables → Genesys", c: "The call ends. ElevenLabs passes <b>output session variables</b> back to Genesys to update the <b>campaign contact list</b>." }
      ],
      inbound: [
        { n: ["cust", "gen"], e: [["e_cust_gen", "fwd"]], t: "Customer dials in", c: "The customer dials your number - the call lands in <b>Genesys Cloud</b> telephony." },
        { n: ["gen", "el"], e: [["e_gen_el", "fwd"]], t: "Audio Connector → ElevenLabs", c: "The <b>Genesys Architect flow</b> triggers the <b>Call Audio Connector</b> and opens a <b>bidirectional WebSocket</b> to ElevenLabs." },
        { n: ["el", "cust"], e: [["e_gen_el", "fwd"], ["e_cust_gen", "fwd"]], t: "Hannah answers", c: "Hannah picks up and starts the conversation naturally - the <b>same agent</b> as outbound." },
        { n: ["el", "tool", "dbx"], e: [["e_el_tool", "fwd"], ["e_tool_dbx", "fwd"]], t: "Webhook → Databricks", c: "Hannah calls a <b>webhook tool</b> into <b>Databricks</b> to look up the customer's profile and history." },
        { n: ["dbx", "el"], e: [["e_tool_dbx", "rev"], ["e_el_tool", "rev"]], t: "Profile returns", c: "<b>Databricks</b> returns the customer profile; Hannah uses it to resolve the issue." },
        { n: ["el", "tool", "sf"], e: [["e_el_tool", "fwd"], ["e_tool_sf", "fwd"]], t: "Webhook → Salesforce", c: "At the end of the call, Hannah creates a <b>Support Case</b> in <b>Salesforce Service Cloud</b> via a webhook tool." },
        { n: ["sf", "el"], e: [["e_tool_sf", "rev"], ["e_el_tool", "rev"]], t: "Case ID returns", c: "<b>Salesforce</b> returns the Case ID." },
        { n: ["el", "gen", "cust"], e: [["e_gen_el", "rev"], ["e_cust_gen", "rev"]], t: "Call ends", c: "The call ends and <b>Genesys updates the call record</b>." }
      ]
    };

    var stepsHost = document.getElementById("flowSteps");
    var noteHost = document.getElementById("flowNote");
    var fmode = "outbound", fcur = 0, ftimer = null, fplaying = true, SPEED = 1450;

    function fclear() {
      Object.keys(E).forEach(function (k) { E[k].classList.remove("flow"); });
      Object.keys(N).forEach(function (k) { N[k].g.classList.remove("act"); });
    }
    function firePacket(pathId, dir) {
      var path = document.getElementById(pathId); if (!path) return;
      var c = el("circle", { r: 5, class: "pkt" });
      var am = el("animateMotion", { dur: "0.8s", begin: "indefinite", fill: "remove" });
      if (dir === "rev") { am.setAttribute("keyPoints", "1;0"); am.setAttribute("keyTimes", "0;1"); am.setAttribute("calcMode", "linear"); }
      var mp = el("mpath", {}); mp.setAttribute("href", "#" + pathId); mp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + pathId);
      am.appendChild(mp); c.appendChild(am); path.parentNode.appendChild(c);
      try { am.beginElement(); } catch (e) {}
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 950);
    }
    function frender() {
      if (!stepsHost) return;
      stepsHost.innerHTML = "";
      FLOWS[fmode].forEach(function (s, i) {
        var b = document.createElement("button");
        b.className = "flow-step"; b.setAttribute("data-i", i);
        b.innerHTML = "<span class='flow-step__n'>" + (i + 1) + "</span><span class='flow-step__t'>" + s.t + "</span>";
        stepsHost.appendChild(b);
      });
    }
    function fshow(i) {
      var steps = FLOWS[fmode]; fcur = (i % steps.length + steps.length) % steps.length;
      fclear();
      var s = steps[fcur];
      s.n.forEach(function (k) { if (N[k]) N[k].g.classList.add("act"); });
      s.e.forEach(function (pair) { var p = E[pair[0]]; if (p) p.classList.add("flow"); firePacket(pair[0], pair[1]); });
      if (noteHost) noteHost.innerHTML = "<b>Step " + (fcur + 1) + " of " + steps.length + "</b> · " + s.c;
      if (stepsHost) stepsHost.querySelectorAll(".flow-step").forEach(function (b, bi) { b.classList.toggle("on", bi === fcur); });
    }
    function setMode(m) { document.querySelectorAll("#flowMode button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m)); }); }
    function fstop() { if (ftimer) { clearTimeout(ftimer); ftimer = null; } }
    function ftick() { fshow(fcur + 1); if (fplaying) ftimer = setTimeout(ftick, SPEED); }
    function fstart() { fstop(); fplaying = true; setMode("auto"); fshow(fcur); ftimer = setTimeout(ftick, SPEED); }
    function fmanual() { fstop(); fplaying = false; setMode("manual"); }

    frender(); fstart();
    document.addEventListener("click", function (e) {
      var tb = e.target.closest("#flowToggle button");
      if (tb) {
        fmode = tb.getAttribute("data-flow"); fcur = 0;
        document.querySelectorAll("#flowToggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-flow") === fmode)); });
        frender(); if (fplaying) fstart(); else fshow(0); return;
      }
      var mb = e.target.closest("#flowMode button");
      if (mb) { if (mb.getAttribute("data-mode") === "auto") fstart(); else fmanual(); return; }
      if (e.target.closest("#flowNext")) { fmanual(); fshow(fcur + 1); return; }
      if (e.target.closest("#flowPrev")) { fmanual(); fshow(fcur - 1); return; }
      var sb = e.target.closest(".flow-step");
      if (sb) { fmanual(); fshow(+sb.getAttribute("data-i")); return; }
    });
  }
})();
