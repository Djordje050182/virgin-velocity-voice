# Salesforce integration — real Service Cloud action

Makes the demo's `fulfil_in_agentforce` tool create a **real Case** in a live Salesforce
Service Cloud org (instead of returning a fake reference).

```
browser (ElevenLabs client tool) → ../proxy.py /fulfil → Salesforce REST API → Case created
```

Auth is **OAuth 2.0 Client Credentials** via an **External Client App** ("ElevenLabs Voice"),
so the proxy gets a token server-side with no user login — token never touches the browser.

## Files
- `.env` — `SF_LOGIN_URL`, `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_API_VERSION` (git-ignored).
- `sf_test.sh` — CLI smoke test: token → create Case → read it back.
- The live endpoint lives in the unified `../proxy.py` (`GET /fulfil?action=…`).

## Org setup (done once, for reference)
External Client App → OAuth enabled, scope **api**, **Client Credentials Flow** ON with
**Run As** = `dgvozdenovic+labs@gmail.com`, IP relaxed, Start Page = None.
Org: `orgfarm-57167bd36b` (My Domain). Verify in the org under **Service → Cases**.

## Run / test
- `cd integrations && python3 proxy.py` then `curl "localhost:8799/fulfil?action=rebook"`
- or `cd integrations/salesforce && ./sf_test.sh`

Actions → Case: `rebook` → Rebooking · `refund` → Refund · `case`/`raise case` → General enquiry.

## Security
- Consumer Key/Secret live only in `.env` (git-ignored). **Disposable demo credentials** — the
  secret was shown in chat once, so revoke/rotate (or delete this External Client App) after the pitch.
- Client Credentials runs as a real user — for production, use a dedicated integration user with
  least-privilege (Case create only), not a full admin.

## Next (optional, deeper): invoke an Agentforce agent
Today we create a Case directly. To literally hand the conversation to an Agentforce agent, use the
**Agent API** (`/services/data/vXX.0/connect/agent/...`) to start a session and send the utterance —
a bigger setup; the Case-create path is the reliable demo proof.
