# Demo runbook — Google Meet, 40 minutes

**Live site:** https://djordje050182.github.io/virgin-velocity-voice/
**Live agent (hero):** `agent_6701kt8w3svzen8ajsxjnk852mrj` (public)
**Backup workflow agent:** `agent_2601kt8w9rx4fp19evajw1m1nfxk`

---

## 0. The single most important pre-flight check — DO THIS FIRST (the night before AND 10 min before)
1. Open the live URL in **Chrome**, go to slide 05 (The live demo).
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
- Do a 10-second test with a colleague: play the slide-02 bad-call clip and confirm they hear it.
- Keep your **system volume up**; the page audio rides the tab-audio share.

## 2. Pre-flight checklist (5 minutes before)
- [ ] Live URL open in Chrome, **not** localhost.
- [ ] Slide 05 mic tested, Hannah responds, audio audible.
- [ ] Meet "Share tab audio" confirmed with a test listener.
- [ ] Theme set to **Virgin** (bottom-left), Demo mode **Live**.
- [ ] Velocity tier set to **Gold** (you'll switch to Platinum live as a flourish).
- [ ] Close noisy apps/notifications. Silence Slack/Mail.
- [ ] Phone/hotspot ready as a network backup.
- [ ] Have this runbook open on a second screen/phone.

## 3. The run of show (≈40 min; adjust to discovery)
| Time | Slide | You do / say |
|---|---|---|
| 0–3 | 01 Switchboard | Cold open. The limbic story: operator → IVR → today → agentic voice. "Between the switchboard and HAL. Voice, and only voice." |
| 3–6 | 02 Problem | Play the 40-sec bad call. Let it sting. "Millions of contacts a year still hit this." |
| 6–12 | 03 Virgin / 04 Use case | Discovery (MEDDIC). Real figures. Frame the **proactive, member-aware** differentiator. Ask the CCO + Head of AI their priorities. |
| 12–24 | **05 Live demo** | **The hero.** See §4 below. |
| 24–30 | 06 Flow / 07 Architecture | Walk the orchestration + where ElevenLabs sits (additive). Hover the nodes. Hit the honesty notes. |
| 30–35 | 08 ROI / 09 Why | Plug in *their* numbers live. Differentiation (concede Agentforce honestly). |
| 35–40 | 10 Close | Summarise for both stakeholders. Drive to the paid pilot next step. |

## 4. The live demo sequence (slide 05) — exact clicks
1. **"Simulate Virgin ops event"** → banner: *VA838 DELAYED*. Say: *"In production this fires from
   your disruption workflow — here it's a button."* (Honest, out loud.)
2. **Start the call** (ElevenLabs control). Hannah does the **delay call** (Call 1). Talk back to her.
3. Click **"Escalate: flight now cancelled"** → banner flips to *CANCELLED*; stage moves to **Call 2**.
4. Start a call again → Hannah does the **cancellation**: refund vs rebook, offers WhatsApp.
5. The **phone mockup** animates the WhatsApp options. **Click an option** → it advances to **Call 3**.
6. Start the call → **confirmation + loyalty gesture**. Switch **tier to Platinum** beforehand to show
   the gesture change (Gold: hotel/lounge → Platinum: upgrade). Point at the deterministic
   **entitlement** card: *"That's a tool node, not the model improvising."*
7. Optional: play the **emotion-adaptive A/B** clips — "roadmap, not live."

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
- If they ask to see the build: the workflow is real on the platform — open the **workflow agent**
  in the ElevenLabs dashboard, or walk `elevenlabs/README.md` + `workflow.json`.
