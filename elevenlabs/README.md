# ElevenLabs build — reproducible record & what's real vs simulated

Everything here was created **programmatically via the ElevenLabs REST API** (no MCP server was
connected; the documented SDK/API fallback was used). Every object below was created and then
**read back to verify** — nothing is claimed that wasn't confirmed live.

## IDs (single source of truth: `agent_ids.json`)

| Object | ID | Notes |
|---|---|---|
| **Live widget agent — "Virgin Australia — Guest Care"** | `agent_6701kt8w3svzen8ajsxjnk852mrj` | The hero. Public, auth disabled, override-enabled. Robust single-prompt + client tools. **This is what the website embeds.** |
| **Workflow showcase agent — "…· Workflow"** | `agent_2601kt8w9rx4fp19evajw1m1nfxk` | The full multi-agent visual workflow graph (slide 6 / "how it was built" / dashboard). |
| Voice — "Hannah the natural Australian Voice" | `M7ya1YbaeFaPXljg9BpK` | Soft, warm, female, Australian. Added to workspace from shared library. |
| Tool — `lookup_velocity_member` (client) | `tool_0101kt8vtk26erzrd8yq9ay3pmf2` | Browser-implemented. |
| Tool — `check_entitlement` (client, deterministic) | `tool_4901kt8vwdjeezernf04nfc5ag9r` | Browser-implemented rules. |
| KB docs (4) | see `agent_ids.json` | RAG indexed (`e5_mistral_7b_instruct`). |

## Models (verified, with the nuance the Head of AI will probe)
- **Conversation LLM:** `gemini-2.5-flash` — fast, low-latency, cheap. Right call for scripted
  disruption handling + lookups; speed/economics over heavyweight reasoning.
- **Voice model:** `eleven_flash_v2` (~75 ms). **Important nuance:** the API *rejects* Flash v2.5
  for English-only agents — Flash **v2.5** is the **multilingual (32-language)** variant; for an
  English agent ElevenLabs uses Flash **v2**, same ~75 ms latency tier. Don't conflate the two
  (and don't confuse either with Eleven v3, which is 70+ languages but **not** for real-time agents).

## The embed snippet (confirmed current, not assumed)
```html
<elevenlabs-convai agent-id="agent_6701kt8w3svzen8ajsxjnk852mrj"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```
Widgets require a **public agent with authentication disabled** — done (`auth.enable_auth=false`).

## Driving the three calls (live demo)
The widget starts a fresh conversation per call, passing **dynamic variables** to set the scene.
`first_message` and `language` overrides are enabled on the live agent. Variables:
`guest_name`, `velocity_tier` (Red/Silver/Gold/Platinum), `flight_number`, `route`,
`new_departure`, `call_stage` (`delay` | `cancellation` | `confirmation`).
The base prompt (`guest_care_prompt.txt`) branches on `call_stage`.

## Client-tool contract (implemented in the site's JS — deterministic, visible, configurable)
- `lookup_velocity_member({member_name})` → `{ name, tier, points, recent_booking }`
- `check_entitlement({tier, disruption_type})` → `{ gesture, detail }` using these **rules**
  (mirror of KB doc 01 — entitlement is rules-driven, never LLM-improvised):

| tier | delay | cancellation |
|---|---|---|
| Red / Silver | meal voucher + priority rebook | automatic refund or free rebook |
| **Gold** | lounge access | **lounge access + hotel night (if overnight)** |
| **Platinum** | lounge + concierge | **complimentary upgrade on rebooked flight + hotel night** |

## The workflow graph (on the showcase agent) — built via API, verified by read-back
Stored at the agent's **top-level `workflow`** field (not `conversation_config.workflow`).
8 nodes, 9 edges:
- `start_node` → (LLM condition on `call_stage`) → `delay` | `cancel` | `confirm_entry` subagents
- each → **`lookup`** (Velocity Lookup **subagent** node) → **`entitlement`** (**tool node**,
  deterministic, guaranteed call) → (**result** condition / success path) → `confirm`
  (Confirmation + loyalty gesture subagent) → `end_node`
- Node types: `start`, `override_agent` (subagents), `tool`, `end`. Edge conditions used:
  `llm`, `unconditional`, `result`. Full JSON: `workflow.json`.

## Honesty guardrails (baked in — say these out loud)
- **Velocity Lookup is modelled as a subagent** to demonstrate multi-agent orchestration. In
  production this would be a **tool/API call into the Velocity platform**, not a conversational
  agent. (Stated in the node's `additional_prompt`.)
- **Entitlement is deterministic** (tool node / client-tool rules), never LLM-improvised — the
  fast model must not invent who gets a free hotel.
- The **ops event, SMS/WhatsApp hop, and the membership/booking data are simulated** for the demo
  (client-side). The **live voice agent is real** — that's the hero.
- **Velocity 13m+ members** is Virgin's official total figure (the first-call brief said "8m");
  policy/comp figures in the KB are illustrative for the demo, not official Virgin policy.

## What needed the dashboard? — **Nothing.**
Agents, sub-agent/workflow nodes, tool nodes, routing edges, KB upload, RAG indexing, voice add,
public/override settings: **all created via API.** Optional dashboard step only if you want to
*visually* tweak node positions in the Workflow editor — not required for function.

## Rebuild / inspect
- `agent_guest_care_payload.json` — exact create body for the live agent
- `guest_care_prompt.txt` — system prompt
- `workflow.json` — the workflow graph
- `kb/*.md` + `kb_docs.json` — knowledge base sources + IDs
