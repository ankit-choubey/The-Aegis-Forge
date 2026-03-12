#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"

check_service() {
  local svc="$1"
  if ! systemctl is-active --quiet "$svc"; then
    echo "FAIL: service not active: $svc"
    return 1
  fi
  echo "OK: $svc"
}

check_url() {
  local url="$1"
  local expected_code="$2"
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  if [[ "$got" != "$expected_code" ]]; then
    echo "FAIL: $url returned $got (expected $expected_code)"
    return 1
  fi
  echo "OK: $url -> $got"
}

check_service aegis-backend.service
check_service aegis-frontend.service
check_service aegis-agent.service
check_service nginx.service

check_url "https://${RECRUITER_DOMAIN}/" "200"
check_url "https://${CANDIDATE_DOMAIN}/" "302"
check_url "https://${API_DOMAIN}/" "200"
check_url "https://${API_DOMAIN}/candidates" "200"

# Candidate landing redirect target check
redirect_target=$(curl -s -I "https://${CANDIDATE_DOMAIN}/" | awk -F': ' '/^location:/I {print $2}' | tr -d '\r')
if [[ "$redirect_target" != "/candidate" ]]; then
  echo "FAIL: candidate root redirect target is '$redirect_target' (expected '/candidate')"
  exit 1
fi
echo "OK: candidate root redirects to /candidate"

echo "Validation completed successfully."
