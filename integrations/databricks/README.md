# Databricks integration — live member lookup

Makes the ElevenLabs demo's `lookup_velocity_member` tool query a **real Databricks lakehouse**
(Velocity loyalty ⋈ Sabre-style booking) instead of returning hardcoded data.

```
browser (ElevenLabs client tool)  →  proxy.py (localhost:8799)  →  Databricks SQL warehouse
```

The proxy exists because the Databricks token must stay off the public site, the SQL API has no
CORS, and a cold serverless warehouse needs polling. It also keeps the warehouse warm.

## Files
- `.env` — connection + token (git-ignored; never commit). `.env.example` shows the shape.
- `proxy.py` — the local proxy. `GET /member?id=VA…`, `GET /health`.
- `query.sh` — CLI smoke test of the harmonised join.
- `schema.sql` / `../../data/synthetic/` — table DDL + the synthetic CSVs loaded into Databricks.
- `hero.sql` + `load_hero.sh` — seed the demo "George Sinclair" records (one per tier) so the live
  lookup matches the scripted demo exactly.

## Run it (before a demo)
1. `cd integrations/databricks && python3 proxy.py`  (leave running)
2. Smoke test: `curl localhost:8799/member?id=VA8380003`  → George Sinclair, Gold, 82,450 pts, VA838
3. Open the deck, slide 08, start a call — when Hannah looks George up it's now live from Databricks.
   The pipeline caption shows `…(← Sabre, live)`.

If the proxy isn't running, the tool **falls back** to cached values automatically — the call never breaks.

## Tier → hero member id
Red `VA8380001` · Silver `VA8380002` · Gold `VA8380003` · Platinum `VA8380004`

## Security
- Token lives only in `.env` (git-ignored) and is sent server-side from the proxy.
- The demo token is disposable — **revoke it after the pitch** (Databricks → Settings → Developer →
  Access tokens) and regenerate. Queries are parameterised (`:member_id`) — injection-safe.
