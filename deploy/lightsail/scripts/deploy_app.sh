#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

: "${REPO_URL:?REPO_URL is required}"
: "${REPO_BRANCH:=main}"

APP_PARENT="$(dirname "$APP_DIR")"
mkdir -p "$APP_PARENT"
chown "$APP_USER":"$APP_USER" "$APP_PARENT"

if [[ -d "$APP_DIR/.git" ]]; then
  su - "$APP_USER" -c "cd '$APP_DIR' && git fetch --all --prune && git checkout '$REPO_BRANCH' && git pull --ff-only origin '$REPO_BRANCH'"
else
  su - "$APP_USER" -c "git clone --branch '$REPO_BRANCH' '$REPO_URL' '$APP_DIR'"
fi

# Python dependencies
su - "$APP_USER" -c "cd '$APP_DIR' && export PATH=\$HOME/.local/bin:/usr/local/bin:\$PATH && UV_PROJECT_ENVIRONMENT=.venv uv sync --all-extras --dev"

# Frontend dependencies + production build
su - "$APP_USER" -c "cd '$APP_DIR/frontend' && npm ci && npm run build"

# Persistent storage
mkdir -p "$UPLOADS_DIR"
chown -R "$APP_USER":"$APP_USER" "$UPLOADS_DIR"
chmod 750 "$UPLOADS_DIR"

mkdir -p /etc/aegis
chmod 750 /etc/aegis

ALLOWED_ORIGINS="https://${RECRUITER_DOMAIN},https://${CANDIDATE_DOMAIN}"
NEXT_PUBLIC_API_BASE="https://${API_DOMAIN}"
NEXT_PUBLIC_LIVEKIT_URL="${NEXT_PUBLIC_LIVEKIT_URL:-$LIVEKIT_URL}"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

cat > /etc/aegis/backend.env <<EOB
LIVEKIT_URL=${LIVEKIT_URL}
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
GROQ_API_KEY=${GROQ_API_KEY}
DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
SIMLI_API_KEY=${SIMLI_API_KEY:-}
SIMLI_FACE_ID=${SIMLI_FACE_ID:-}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
UPLOADS_DIR=${UPLOADS_DIR}
BACKEND_HOST=${BACKEND_HOST}
BACKEND_PORT=${BACKEND_PORT}
EOB

cat > /etc/aegis/agent.env <<EOA
LIVEKIT_URL=${LIVEKIT_URL}
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
GROQ_API_KEY=${GROQ_API_KEY}
DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
SIMLI_API_KEY=${SIMLI_API_KEY:-}
SIMLI_FACE_ID=${SIMLI_FACE_ID:-}
UPLOADS_DIR=${UPLOADS_DIR}
EOA

cat > /etc/aegis/frontend.env <<EOFRT
NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
NEXT_PUBLIC_LIVEKIT_URL=${NEXT_PUBLIC_LIVEKIT_URL}
LIVEKIT_URL=${LIVEKIT_URL}
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
FRONTEND_HOST=${FRONTEND_HOST}
FRONTEND_PORT=${FRONTEND_PORT}
EOFRT

chmod 640 /etc/aegis/backend.env /etc/aegis/agent.env /etc/aegis/frontend.env
chown root:"$APP_USER" /etc/aegis/backend.env /etc/aegis/agent.env /etc/aegis/frontend.env

echo "App deploy complete."
