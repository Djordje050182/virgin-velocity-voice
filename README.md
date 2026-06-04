# Virgin Australia × ElevenLabs — Velocity Voice

A single-page pitch deck and **live voice demo** built for an ElevenLabs Strategic Account
Executive interview (Virgin Australia, ANZ). The centrepiece is a real, embedded ElevenLabs
voice agent ("Hannah", warm Australian female) configured for a **proactive, outbound,
multi-channel, loyalty-aware** flight-disruption journey.

**Live site:** see the repo's GitHub Pages URL.

## What's here
- `index.html` — the deck (10 slides, left-nav, 3 live themes, demo/fallback toggle)
- `css/` — hand-written design system (`tokens.css`, `base.css`, `components.css`)
- `js/` — `theme.js`, `nav.js`, `players.js`, `diagrams.js`, `roi.js`, `demo.js`
- `audio/` — pre-recorded ElevenLabs TTS (bad-call scene, emotion A/B, 3 fallback calls)
- `assets/` — switchboard hero image (cold open)
- `DESIGN.md` — the design system (palette sampled from live Virgin/Velocity CSS)
- `elevenlabs/` — **reproducible record** of every agent/tool/KB/workflow created via the API,
  with IDs, the workflow JSON, the KB sources, and the honesty notes. Start at
  [`elevenlabs/README.md`](elevenlabs/README.md).

## The voice agent
The live widget embeds a public ElevenLabs agent. The multi-agent **workflow**
(Guest Care → Velocity Lookup subagent → entitlement tool node → confirmation) was built
entirely via the ElevenLabs REST API and is documented in `elevenlabs/`.

## Honesty (stated in the deck and in code)
The **voice agent is real**. The ops event, the WhatsApp channel-hop and the member data are
**simulated** for the demo. Velocity Lookup is modelled as a subagent (a tool/API call in
production). Entitlement is deterministic, not LLM-improvised. Figures are time-sensitive —
re-verify on the day. The switchboard image should be licence-cleared before any external use.

## Run locally
```
python3 -m http.server 8765   # then open http://localhost:8765
```
No backend, no build step — deploys as static files to GitHub Pages.
