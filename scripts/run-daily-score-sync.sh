#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/root/Score}"
BASE_URL="${SCORE_BASE_URL:-http://127.0.0.1:8080}"

cd "$APP_DIR"

if [ ! -f ".env" ]; then
  echo "[$(date -Is)] ERROR: .env not found in $APP_DIR"
  exit 1
fi

CRON_SECRET="$(grep '^CRON_SECRET=' .env | cut -d= -f2- | tr -d '"')"

if [ -z "$CRON_SECRET" ]; then
  echo "[$(date -Is)] ERROR: CRON_SECRET is empty"
  exit 1
fi

echo "[$(date -Is)] Starting daily Score sync"

echo "[$(date -Is)] Running sync-matches..."
SYNC_RESPONSE="$(curl -fsS -X POST "$BASE_URL/api/cron/sync-matches" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")"

echo "[$(date -Is)] sync-matches response:"
echo "$SYNC_RESPONSE"

echo "[$(date -Is)] Running calculate-scores..."
SCORE_RESPONSE="$(curl -fsS -X POST "$BASE_URL/api/cron/calculate-scores" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")"

echo "[$(date -Is)] calculate-scores response:"
echo "$SCORE_RESPONSE"

echo "[$(date -Is)] Daily Score sync completed successfully"
