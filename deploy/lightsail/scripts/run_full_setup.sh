#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-}"

"${SCRIPT_DIR}/bootstrap_server.sh" "$ENV_FILE"
"${SCRIPT_DIR}/deploy_app.sh" "$ENV_FILE"
"${SCRIPT_DIR}/install_systemd.sh" "$ENV_FILE"
"${SCRIPT_DIR}/install_nginx.sh" "$ENV_FILE"
"${SCRIPT_DIR}/issue_certs.sh" "$ENV_FILE"
"${SCRIPT_DIR}/install_logrotate.sh" "$ENV_FILE"
"${SCRIPT_DIR}/setup_snapshots.sh" "$ENV_FILE"
"${SCRIPT_DIR}/validate_deployment.sh" "$ENV_FILE"

echo "Full Lightsail setup complete."
