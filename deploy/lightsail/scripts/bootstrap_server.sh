#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y software-properties-common curl ca-certificates gnupg lsb-release \
  git build-essential jq unzip nginx certbot python3-certbot-nginx logrotate

# Python 3.11 (Ubuntu 22.04 default is usually 3.10)
if ! command -v python3.11 >/dev/null 2>&1; then
  add-apt-repository -y ppa:deadsnakes/ppa
  apt-get update
  apt-get install -y python3.11 python3.11-venv python3.11-dev
fi

# Node.js 20 LTS
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# uv package manager
if ! command -v uv >/dev/null 2>&1; then
  su - "$APP_USER" -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'
  if [[ -f "/home/${APP_USER}/.local/bin/uv" ]]; then
    ln -sf "/home/${APP_USER}/.local/bin/uv" /usr/local/bin/uv
  fi
fi

# Basic host hardening: only app ingress ports
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

mkdir -p /etc/aegis
chown root:root /etc/aegis
chmod 750 /etc/aegis

echo "Bootstrap complete."
node -v
python3.11 --version
uv --version
