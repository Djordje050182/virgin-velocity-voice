# Synthetic demo data — Virgin × ElevenLabs

Fake-but-realistic data shaped to mirror Virgin Australia's **real** vendor stack, so the
ElevenLabs voice agent can call into a **Databricks** lakehouse that looks like a harmonised
view across their systems. All data is generated, deterministic (seed=42), and contains no
real people. Regenerate anytime with `python3 generate.py`.

## The vendor story each table tells

| File | Stands in for | Role in Virgin's real stack |
|---|---|---|
| `velocity_members.csv` | **Velocity** loyalty | The customer: tier, points, status credits |
| `bookings.csv` | **Sabre / SabreSonic PSS** | System of record: PNR, ticket, SabreMosaic order, flight |
| `fare_offers.csv` | **Amadeus** distribution + **SabreMosaic** offers | Fares/ancillaries sold via GDS/NDC channels |
| `ops_events.csv` | Airline ops | The disruption that triggers the call (delay/cancel/diversion) |

The pitch line: *"Sabre is the engine room, Amadeus is the shop window, Databricks is where
they meet — and ElevenLabs is the voice that reads from all of it in one call."*

## Load into Databricks (once your Free Edition workspace is up)

1. **Catalog → Create table → Upload file** — upload all four CSVs (UI infers the schema), **or**
2. Run `schema.sql` in the SQL editor to create typed tables, then `COPY INTO` / re-upload.
3. Create a **Serverless SQL Warehouse** (note its **HTTP path**).
4. Generate a **personal access token** (User Settings → Developer → Access tokens).
5. Send me the **workspace URL** + **HTTP path** (NOT the token in chat — we'll store it as
   `DATABRICKS_TOKEN` env var). I'll wire the ElevenLabs tool to the SQL Statement Execution API.

## How ElevenLabs will use it
`lookup_velocity_member(member_id)` → runs the harmonised join in `schema.sql` against the
warehouse → returns name, tier, points, and the next flight/PNR. Replaces the current
in-browser stub in `js/demo.js` with a real Databricks round-trip — same UI, real data.
