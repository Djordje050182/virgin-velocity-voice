#!/usr/bin/env bash
# Smoke test: Client Credentials OAuth -> create a real Case in Service Cloud.
set -euo pipefail
cd "$(dirname "$0")"
set -a; source .env; set +a

echo "1) Requesting OAuth token (client_credentials)…"
TOK=$(curl -sS -X POST "${SF_LOGIN_URL}/services/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=${SF_CLIENT_ID}" \
  --data-urlencode "client_secret=${SF_CLIENT_SECRET}")

ACCESS=$(echo "$TOK" | jq -r '.access_token // empty')
INSTANCE=$(echo "$TOK" | jq -r '.instance_url // empty')
if [ -z "$ACCESS" ]; then
  echo "   TOKEN FAILED:"; echo "$TOK" | jq .; exit 1
fi
echo "   ok — token acquired; instance: $INSTANCE"

echo "2) Creating a Case…"
CASE=$(curl -sS -X POST "${INSTANCE}/services/data/${SF_API_VERSION}/sobjects/Case" \
  -H "Authorization: Bearer ${ACCESS}" -H "Content-Type: application/json" \
  -d '{"Subject":"VA838 MEL→SYD cancelled — rebooking (ElevenLabs voice)",
       "Description":"Raised by Hannah (ElevenLabs voice agent) on behalf of George Sinclair, Velocity Gold. Action: rebook onto next service + apply loyalty gesture.",
       "Origin":"Phone","Status":"New","Priority":"High"}')

CASE_ID=$(echo "$CASE" | jq -r '.id // empty')
if [ -z "$CASE_ID" ]; then
  echo "   CASE FAILED:"; echo "$CASE" | jq .; exit 1
fi
echo "   ok — Case created: $CASE_ID"

echo "3) Reading the Case back…"
curl -sS "${INSTANCE}/services/data/${SF_API_VERSION}/sobjects/Case/${CASE_ID}" \
  -H "Authorization: Bearer ${ACCESS}" | jq '{CaseNumber, Subject, Status, Origin, Priority}'
