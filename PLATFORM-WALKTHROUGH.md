# Platform walkthrough — showing them what we built in ElevenLabs

Use this when they ask "show us how you built it" (the brief says *be prepared to walk through how
the agent was built*). Everything below was created via the ElevenLabs API and is real in your
workspace. Sign in at **https://elevenlabs.io** → **Agents** (a.k.a. Conversational AI / ElevenAgents).

**The two agents (leave the old test agent alone):**
- **Virgin Australia — Guest Care** → `agent_6701kt8w3svzen8ajsxjnk852mrj` — the live one the website embeds.
- **Virgin Australia — Guest Care · Workflow** → `agent_2601kt8w9rx4fp19evajw1m1nfxk` — **show this one for the orchestration.**

Direct link pattern (paste into the browser, swap the ID):
`https://elevenlabs.io/app/agents/<agent_id>` — if that doesn't resolve, just open **Agents** in the
left menu and click the agent by name.

> Tip: open the dashboard in a **second browser tab** before the call, signed in, on the Workflow
> agent. Don't screen-share it raw — share the tab. Keep it as a "want to see under the hood?" move,
> not the main event. The live demo is the hero; this is the proof it's real.

---

## The tour (about 3–4 minutes if they ask)

**1. The agent, top level.** Open the **Workflow** agent. Say: *"This is the agent, configured
end-to-end for Virgin. Warm Australian voice, a fast model for low latency, a knowledge base, tools,
and a multi-agent workflow. All of it built programmatically — I can hand your team the exact config."*

**2. The Workflow tab — the orchestration.** This is the money shot. Show the visual graph:
*Start → (routes on call_stage) → Delay / Cancellation / Confirmation subagents → **Velocity Lookup**
subagent → **Entitlement** tool node → Confirmation → End.*
- Point at the **routing edges**: *"These are LLM-evaluated conditions — delay versus cancellation versus
  confirmation."*
- Point at the **Velocity Lookup subagent**: *"Modelled as a subagent to show the orchestration. In
  production this is a tool call into your Velocity platform — I'd build it that way for real."*
- Point at the **Agentforce tool node** (`fulfil_in_agentforce`): *"When a workflow belongs to Service Cloud — rebook, refund, raise a case — the agent hands it to your Agentforce agent over MCP, waits, and speaks the result. We're the voice inside Agentforce."*
- Point at the **Entitlement tool node**: *"This is a dedicated tool node. It's guaranteed to run, and
  it's deterministic — the model never decides who gets a hotel or an upgrade. That's where the
  guardrail lives for benefits."*

**3. Open a subagent node.** Click the **Cancellation** (or Delay) node → show its **prompt override**.
Say: *"Each phase has its own instructions layered on the base agent — so the cancellation call is
more empathetic, the delay call sends the lounge pass, and so on."*

**4. Tools.** Open **Tools** (or the tool node detail). Show **lookup_velocity_member** and
**check_entitlement**. Say: *"These are the integration points. Today they run in the browser for the
demo; in production they're API calls into Velocity and Sabre."*

**5. Knowledge Base.** Open the **Knowledge Base**. Show the four documents (Velocity tiers,
disruption/rebooking, the AU consumer charter, Virgin facts) — note they're **RAG-indexed**. Say:
*"This is where your policies live. Drop in more documents and the agent uses them straight away.
Everything here is illustrative for the demo, not your official policy."*

**6. Voice.** Show the voice is **Hannah** on **Flash v2** (~75ms). Say: *"Real-time English runs on
Flash v2 at about 75 milliseconds. Down the track we can clone a branded Virgin voice."*

**7. Guardrails / Security.** Open the **Guardrails** (and Security/Privacy) section. Show:
- **Focus** on — stays in scope.
- **Prompt-injection protection** on — can't be talked out of its role.
- **Content moderation** on (abuse / violence / sexual) — *"and we deliberately route self-harm to a
  human rather than ending the call."*
- **Privacy** — *"zero-retention mode and PII redaction are available for your enterprise requirements;
  we'd set those with your security team. SOC 2 Type II, ISO 27001, GDPR, EU data residency."*
This is the slide-08 guardrails panel, made real. The Head of AI will care about this one.

**8. (Optional) A transcript.** If there's a past conversation under **Conversation history**, open one
to show the turn-by-turn transcript, tool calls and latency. Good for "how do we monitor it?"

**9. Tie it back.** *"And that exact agent is what's running live on the page you just talked to —
public widget, on static hosting, no backend. That's the whole build."*

---

## If they push on anything
- **"Is the workflow real or a mock-up?"** — Real. It's stored on the agent and I can export the JSON
  (`elevenlabs/workflow.json` in the repo). Built via the API, read back to confirm.
- **"Did you really build this or is it a template?"** — Built for Virgin. Show `elevenlabs/README.md`
  in the repo — every agent, tool, KB doc and the workflow, with IDs and the exact calls.
- **"What about our telephony?"** — ElevenLabs bridges into Genesys via SIP / the Audio Connector
  (architecture slide). To validate with your team.
- **"What's not real today?"** — Be upfront: the ops trigger, the WhatsApp thread and the member data
  are simulated for the demo. The voice agent, the workflow, the tools, the KB and the guardrails are
  all real in the platform.
