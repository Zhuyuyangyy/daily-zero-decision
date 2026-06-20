#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"

curl_json() { curl -sS -H "Content-Type: application/json" "$@"; }

echo ">> register"
curl_json -X POST "$BASE/api/v1/auth/register" \
  -d '{"username":"alice","password":"alice123","nickname":"Alice","phone":"13800000001"}' || true

echo ">> login"
LOGIN=$(curl_json -X POST "$BASE/api/v1/auth/login" \
  -d '{"username":"alice","password":"alice123"}')
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | python -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')

echo ">> create goods"
curl_json -X POST "$BASE/api/v1/goods" -H "token: $TOKEN" \
  -d '{"name":"二手教材","price":25.00,"description":"九成新"}'

echo ">> list goods"
curl -sS "$BASE/api/v1/goods?page=1&size=10"
