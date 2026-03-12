#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

TEMPLATE_DIR="${PROJECT_ROOT}/deploy/lightsail/templates/nginx"

render_nginx() {
  local src="$1"
  local dst="$2"
  sed \
    -e "s|__RECRUITER_DOMAIN__|${RECRUITER_DOMAIN}|g" \
    -e "s|__CANDIDATE_DOMAIN__|${CANDIDATE_DOMAIN}|g" \
    -e "s|__API_DOMAIN__|${API_DOMAIN}|g" \
    -e "s|__FRONTEND_HOST__|${FRONTEND_HOST}|g" \
    -e "s|__FRONTEND_PORT__|${FRONTEND_PORT}|g" \
    -e "s|__BACKEND_HOST__|${BACKEND_HOST}|g" \
    -e "s|__BACKEND_PORT__|${BACKEND_PORT}|g" \
    "$src" > "$dst"
}

render_nginx "${TEMPLATE_DIR}/aegis-rate-limits.conf.tmpl" /etc/nginx/conf.d/aegis-rate-limits.conf
render_nginx "${TEMPLATE_DIR}/recruiter.conf.tmpl" /etc/nginx/sites-available/aegis-recruiter.conf
render_nginx "${TEMPLATE_DIR}/candidate.conf.tmpl" /etc/nginx/sites-available/aegis-candidate.conf
render_nginx "${TEMPLATE_DIR}/api.conf.tmpl" /etc/nginx/sites-available/aegis-api.conf

ln -sf /etc/nginx/sites-available/aegis-recruiter.conf /etc/nginx/sites-enabled/aegis-recruiter.conf
ln -sf /etc/nginx/sites-available/aegis-candidate.conf /etc/nginx/sites-enabled/aegis-candidate.conf
ln -sf /etc/nginx/sites-available/aegis-api.conf /etc/nginx/sites-enabled/aegis-api.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "Nginx configs installed and restarted."
