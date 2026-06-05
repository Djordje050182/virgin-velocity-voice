#!/usr/bin/env bash
# Test the live Databricks query that the ElevenLabs `lookup_velocity_member` tool will run.
# Usage:  ./query.sh [MEMBER_ID]      (defaults to VA7000000)
# Runs a parameterised, injection-safe harmonised join: Velocity member + next Sabre booking.
set -euo pipefail
cd "$(dirname "$0")"
set -a; source .env; set +a

MEMBER_ID="${1:-VA7000000}"

read -r -d '' SQL <<'EOF' || true
SELECT m.member_id, m.first_name, m.last_name, m.tier, m.points_balance,
       b.pnr, b.flight_number, b.origin, b.destination, b.departure_utc, b.cabin
FROM workspace.default.velocity_members m
LEFT JOIN workspace.default.bookings b ON b.member_id = m.member_id
WHERE m.member_id = :member_id
ORDER BY b.departure_utc
LIMIT 1
EOF

# jq builds the JSON body so the SQL/quotes are escaped correctly.
BODY=$(jq -n --arg wh "$DATABRICKS_WAREHOUSE_ID" --arg sql "$SQL" --arg mid "$MEMBER_ID" \
  '{warehouse_id:$wh, wait_timeout:"30s", statement:$sql,
    parameters:[{name:"member_id", value:$mid}]}')

RESP=$(curl -sS -X POST "https://${DATABRICKS_HOST}/api/2.0/sql/statements" \
  -H "Authorization: Bearer ${DATABRICKS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BODY")

STATE=$(echo "$RESP" | jq -r '.status.state')
SID=$(echo "$RESP" | jq -r '.statement_id')

# Poll until the statement finishes (warehouse cold-start can defer it).
for _ in $(seq 1 20); do
  [ "$STATE" = "PENDING" ] || [ "$STATE" = "RUNNING" ] || break
  sleep 2
  RESP=$(curl -sS "https://${DATABRICKS_HOST}/api/2.0/sql/statements/${SID}" \
    -H "Authorization: Bearer ${DATABRICKS_TOKEN}")
  STATE=$(echo "$RESP" | jq -r '.status.state')
done

echo "$RESP" | jq '{state: .status.state,
                     columns: (.manifest.schema.columns // [] | map(.name)),
                     row: (.result.data_array[0] // null),
                     error: (.status.error.message // null)}'
