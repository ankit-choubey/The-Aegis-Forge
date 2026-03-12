#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

TEMPLATE_DIR="${PROJECT_ROOT}/deploy/lightsail/templates/systemd"

render_unit() {
  local src="$1"
  local dst="$2"
  sed \
    -e "s|__APP_DIR__|${APP_DIR}|g" \
    -e "s|__APP_USER__|${APP_USER}|g" \
    "$src" > "$dst"
}

render_unit "${TEMPLATE_DIR}/aegis-backend.service.tmpl" /etc/systemd/system/aegis-backend.service
render_unit "${TEMPLATE_DIR}/aegis-frontend.service.tmpl" /etc/systemd/system/aegis-frontend.service
render_unit "${TEMPLATE_DIR}/aegis-agent.service.tmpl" /etc/systemd/system/aegis-agent.service

systemctl daemon-reload
systemctl enable aegis-backend.service aegis-frontend.service aegis-agent.service
systemctl restart aegis-backend.service aegis-frontend.service aegis-agent.service

echo "Systemd services installed and restarted."
