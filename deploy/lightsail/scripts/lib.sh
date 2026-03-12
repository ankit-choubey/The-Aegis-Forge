#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
DEFAULT_ENV_FILE="${PROJECT_ROOT}/deploy/lightsail/config/lightsail.env"

load_env() {
  local env_file="${1:-$DEFAULT_ENV_FILE}"
  if [[ ! -f "$env_file" ]]; then
    echo "ERROR: env file not found: $env_file"
    echo "Copy deploy/lightsail/config/lightsail.env.example -> deploy/lightsail/config/lightsail.env"
    exit 1
  fi

  # shellcheck source=/dev/null
  source "$env_file"

  : "${APP_DIR:?APP_DIR is required}"
  : "${APP_USER:?APP_USER is required}"
  : "${RECRUITER_DOMAIN:?RECRUITER_DOMAIN is required}"
  : "${CANDIDATE_DOMAIN:?CANDIDATE_DOMAIN is required}"
  : "${API_DOMAIN:?API_DOMAIN is required}"
  : "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL is required}"
  : "${UPLOADS_DIR:?UPLOADS_DIR is required}"
  : "${LIVEKIT_URL:?LIVEKIT_URL is required}"
  : "${LIVEKIT_API_KEY:?LIVEKIT_API_KEY is required}"
  : "${LIVEKIT_API_SECRET:?LIVEKIT_API_SECRET is required}"
  : "${GROQ_API_KEY:?GROQ_API_KEY is required}"
  : "${DEEPGRAM_API_KEY:?DEEPGRAM_API_KEY is required}"

  export APP_DIR APP_USER RECRUITER_DOMAIN CANDIDATE_DOMAIN API_DOMAIN LETSENCRYPT_EMAIL
  export UPLOADS_DIR LIVEKIT_URL LIVEKIT_API_KEY LIVEKIT_API_SECRET GROQ_API_KEY DEEPGRAM_API_KEY
  export SIMLI_API_KEY SIMLI_FACE_ID NEXT_PUBLIC_LIVEKIT_URL
  export BACKEND_HOST BACKEND_PORT FRONTEND_HOST FRONTEND_PORT
  export AWS_REGION LIGHTSAIL_INSTANCE_NAME SNAPSHOT_RETENTION_COUNT REPO_URL REPO_BRANCH
}

ensure_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "ERROR: run as root (sudo)."
    exit 1
  fi
}

ensure_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $cmd"
    exit 1
  fi
}

write_file() {
  local target="$1"
  install -d "$(dirname "$target")"
  cat > "$target"
}
