#!/usr/bin/env bash

set -e

BASE="http://127.0.0.1:5000"

echo "===== 1. HEALTH ====="
curl -fsS "$BASE/api/health"
echo
echo "OK"

echo
echo "===== 2. LOGIN ====="

RESPONSE=$(curl -fsS -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testkronos5@example.com",
    "password":"KronosTest123!"
  }')

TOKEN=$(printf '%s' "$RESPONSE" |
  sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "ERROR: LOGIN SIN TOKEN"
  exit 1
fi

echo "LOGIN OK"

echo
echo "===== 3. FEED ====="

FEED=$(curl -fsS \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/posts/feed")

printf '%s\n' "$FEED"

echo
echo "FEED OK"

echo
echo "===== 4. SCRIPT AI ROUTE ====="

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/ai/scripts/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Crear un script corto de prueba"}')

echo "HTTP: $STATUS"

echo
echo "===== 5. IMAGE AI ROUTE ====="

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/ai/images/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Una ciudad futurista de noche"}')

echo "HTTP: $STATUS"

echo
echo "===== 6. VIDEO AI ROUTE ====="

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/ai/videos/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Una ciudad futurista de noche"}')

echo "HTTP: $STATUS"

echo
echo "===== SMOKE TEST FINALIZADO ====="
