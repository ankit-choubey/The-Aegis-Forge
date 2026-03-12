#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

TEMPLATE_FILE="${PROJECT_ROOT}/deploy/lightsail/templates/logrotate/aegis.tmpl"
TARGET_FILE=/etc/logrotate.d/aegis

sed -e "s|/opt/aegis-forge|${APP_DIR}|g" "$TEMPLATE_FILE" > "$TARGET_FILE"
chmod 644 "$TARGET_FILE"

logrotate -d /etc/logrotate.conf >/dev/null

echo "Logrotate config installed."
