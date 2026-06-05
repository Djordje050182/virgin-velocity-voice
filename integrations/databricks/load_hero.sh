#!/usr/bin/env bash
# Load the hero records (hero.sql) into Databricks via the SQL Statement Execution API.
# Splits hero.sql on ';' and runs each statement, polling through any cold start.
set -euo pipefail
cd "$(dirname "$0")"
set -a; source .env; set +a

exec_sql() {
  local sql="$1"
  local body resp sid state
  body=$(jq -n --arg wh "$DATABRICKS_WAREHOUSE_ID" --arg sql "$sql" \
    '{warehouse_id:$wh, wait_timeout:"30s", statement:$sql}')
  resp=$(curl -sS -X POST "https://${DATABRICKS_HOST}/api/2.0/sql/statements" \
    -H "Authorization: Bearer ${DATABRICKS_TOKEN}" -H "Content-Type: application/json" -d "$body")
  sid=$(echo "$resp" | jq -r '.statement_id'); state=$(echo "$resp" | jq -r '.status.state')
  for _ in $(seq 1 30); do
    [ "$state" = "PENDING" ] || [ "$state" = "RUNNING" ] || break
    sleep 2
    resp=$(curl -sS "https://${DATABRICKS_HOST}/api/2.0/sql/statements/${sid}" -H "Authorization: Bearer ${DATABRICKS_TOKEN}")
    state=$(echo "$resp" | jq -r '.status.state')
  done
  if [ "$state" != "SUCCEEDED" ]; then
    echo "  FAILED: $(echo "$resp" | jq -c '.status')"; echo "  SQL: ${sql:0:80}..."; exit 1
  fi
  echo "  ok  (${sql:0:60}...)"
}

# Strip SQL comments, split on ';', run each non-empty statement.
grep -v '^[[:space:]]*--' hero.sql | tr '\n' ' ' | tr ';' '\n' | while IFS= read -r stmt; do
  trimmed=$(echo "$stmt" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  [ -z "$trimmed" ] && continue
  exec_sql "$trimmed"
done
echo "Hero records loaded."
