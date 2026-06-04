# Demo runbook — Google Meet, 40 minutes

**Live site:** https://djordje050182.github.io/virgin-velocity-voice/
**Live agent (hero):** `agent_6701kt8w3svzen8ajsxjnk852mrj` (public)
**Backup workflow agent:** `agent_2601kt8w9rx4fp19evajw1m1nfxk`

---

## 0. The single most important pre-flight check — DO THIS FIRST (the night before AND 10 min before)
1. Open the live URL in **Chrome**, go to slide 08 (The live demo).
2. Click the ElevenLabs control and **allow the microphone**. Talk to Hannah. Confirm:
   - she responds in a warm Australian voice,
   - audio plays **out of the page**,
   - latency feels live.
3. **Note where the widget appears.** The ElevenLabs embed renders its own control — it may
   appear inline in the "Hannah" panel *or* as a floating button (commonly bottom-right). Either
   is fine; just know where to click on the day. If it floats, that's standard ElevenLabs.
4. If the mic prompt doesn't appear: check Chrome → site settings → Microphone = Allow for
   `djordje050182.github.io`.

> If the live agent is healthy here, the demo's hero works. If anything feels off, flip
> **Demo mode → Fallback** (bottom-left) and run the pre-recorded calls instead. Nobody will know.

## 1. Google Meet audio — the make-or-break setting
- In Meet, choose **Present → A tab → (this Chrome tab)**, and **tick "Share tab audio."**
  (Sharing the *whole screen* or a *window* will NOT carry page audio — it must be a **tab**.)
- The brief and the interview instructions both insist on **share-tab-only**. Do exactly that.
- Do a 10-second test with a colleague: play the slide-03 bad-call clip and confirm they hear it.
- Keep your **system volume up**; the page audio rides the tab-audio share.

## 2. Pre-flight checklist (5 minutes before)
- [ ] Live URL open in Chrome, **not** localhost.
- [ ] Slide 08 mic tested, Hannah responds, audio audible.
- [ ] Meet "Share tab audio" confirmed with a test listener.
- [ ] Theme set to **Virgin** (bottom-left), Demo mode **Live**.
- [ ] Velocity tier set to **Gold** (you'll switch to Platinum live as a flourish).
- [ ] Close noisy apps/notifications. Silence Slack/Mail.
- [ ] Phone/hotspot ready as a network backup.
- [ ] Have this runbook open on a second screen/phone.

## 3. The run of show (≈40 min; adjust to discovery)
Deck is now **13 slides**. You can **hide any slide** live by tapping the dot next to it in the menu.
| Time | Slides | You do / say |
|---|---|---|
| 0–2 | 01 Cold open · 02 Agenda | "Remember when someone actually picked up?" Set the frame, then the agenda. |
| 2–6 | 03 Problem · 04 Virgin · 05 Use case | Play the 40-sec bad call (watch the IVR screen). Discovery (MEDDIC). Frame the **proactive, member-aware** differentiator. |
| 6–8 | 06 Meet Hannah | Set up the call: she discloses she's AI, verifies identity, knows the tier, only offers what she's allowed to. |
| 8–22 | **07 Live demo** | **The hero.** See §4 below. |
| 22–30 | 08 How it works · 09 Architecture | Orchestration + guardrails. Toggle architecture: **disruption journey → Agentic ecosystem** (ElevenLabs ↔ Databricks ↔ Agentforce via MCP, on Genesys) **→ Scale across Virgin**. Then the **intelligence-layer** slide: voice inside Agentforce, not versus it. |
| 30–35 | 10 Stories · 11 ROI · 12 Why | Proof (toggle Global / ANZ). Plug in *their* numbers. Concede Agentforce honestly. |
| 35–40 | 13 Close | Land-and-expand: one journey first, then scale. Drive to the paid pilot. |

## 4. The live demo sequence (slide 08) — exact clicks
Guest is **George Sinclair**, Velocity **Gold**, on **VA838 MEL→SYD**.
1. **"Simulate Virgin ops event"** → banner: *VA838 DELAYED*. Say: *"In production this fires from
   your disruption workflow — here it's a button."* (Honest, out loud.)
   - Point at the **live system-activity pipeline** under the button — it lights up Genesys → ElevenLabs →
     Databricks → Agentforce → TTS as Hannah works. *"This is the data flow and tool-calling, in real time."*
2. **Start the call** (ElevenLabs control). Hannah does the **delay call**: she says she's a virtual
   assistant, **verifies George's identity** (give her a date of birth), gives the new departure, and
   **texts a lounge QR pass** (watch the phone). Talk back to her.
3. Click **"Escalate: flight now cancelled"** → banner flips to *CANCELLED*; stage moves to **Call 2**.
4. Start a call again → Hannah does the **cancellation** — more empathetic, refund vs rebook, offers WhatsApp.
5. The **phone** animates the WhatsApp rebooking options. **Click an option** → it advances to **Call 3**.
6. Start the call → **confirmation + loyalty gesture**. Switch **tier to Platinum** first to show
   the gesture change (Gold: hotel/lounge → Platinum: upgrade). Point at the deterministic
   **entitlement** card: *"That's a tool node, not the model improvising."*
7. Optional: play the **emotion-adaptive A/B** clips — "roadmap, not live."

> If the accent ever drifts, that's the voice model. We've raised stability to hold the Australian
> accent; if you want it warmer/livelier we can trade a little stability back.

## 5. Fallbacks (resilience)
- **Live agent fails / network drops:** bottom-left **Demo mode → Fallback**. The three calls become
  pre-recorded clips (Hannah's side) you press play on: Call 1 delay, Call 2 cancellation, Call 3
  confirmation. The rest of the demo (ops event, phone hop, entitlement) still works — it's all UI.
- **Audio not carrying in Meet:** you forgot "Share tab audio." Re-present the tab with it ticked.
- **Page won't load:** it's static on GitHub Pages; try a hard refresh (Cmd-Shift-R). The deck has no
  backend to fail. Worst case, run from `python3 -m http.server` locally and share that tab.
- **Theme looks wrong on their screen:** themes are CSS-only; toggle bottom-left.
- **Everything is in JS memory** (no localStorage) — a refresh resets cleanly to the start.

## 6. Honesty lines to say out loud (the Head of AI will probe)
- "The **voice agent is real**. The ops trigger, the WhatsApp thread and the member record are
  **simulated** for today — in production they're your disruption workflow and Velocity/Sabre APIs."
- "**Velocity Lookup** is a subagent here to show orchestration; in production it's a tool/API call."
- "**Entitlement is a deterministic tool node** — the fast model never improvises who gets a hotel."
- "Real-time English uses **Flash v2** (~75 ms); **v2.5** is the multilingual variant — same latency
  tier. **Eleven v3** is 70+ languages but not for real-time agents." *(Don't conflate them.)*
- "**Velocity is 13m+ members** — the official total."
- On security: SOC 2 Type II, ISO 27001, HIPAA, GDPR, EU residency, zero-retention — and "I'd bring a
  Solutions Engineer to go deep."

## 7. Known caveats to keep in your back pocket
- Share price / membership figures are **time-sensitive — re-verify the morning of**.
- The switchboard hero image should be **licence-cleared** before any external/public reuse.
- The KB policy/compensation figures are **illustrative**, not official Virgin policy.
- If they ask to see the build: walk the ElevenLabs dashboard — see **PLATFORM-WALKTHROUGH.md**
  (the workflow agent shows the orchestration; guardrails are real in the Security/Guardrails tab).
