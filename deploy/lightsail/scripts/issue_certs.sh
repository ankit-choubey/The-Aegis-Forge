#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

ensure_cmd certbot

certbot --nginx \
  -d "$RECRUITER_DOMAIN" \
  -d "$CANDIDATE_DOMAIN" \
  -d "$API_DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$LETSENCRYPT_EMAIL" \
  --redirect

systemctl reload nginx

echo "TLS certificates issued and redirect enabled."
