#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "${SCRIPT_DIR}/lib.sh"

ENV_FILE="${1:-}"
load_env "${ENV_FILE:-$DEFAULT_ENV_FILE}"
ensure_root

apt-get update
apt-get install -y awscli

cat > /usr/local/bin/aegis_snapshot.sh <<EOS
#!/usr/bin/env bash
set -euo pipefail

INSTANCE_NAME="${LIGHTSAIL_INSTANCE_NAME}"
REGION="${AWS_REGION}"
RETENTION="${SNAPSHOT_RETENTION_COUNT:-7}"
STAMP="\$(date +%Y%m%d-%H%M%S)"
SNAPSHOT_NAME="\${INSTANCE_NAME}-\${STAMP}"

aws lightsail create-instance-snapshot \
  --region "\${REGION}" \
  --instance-name "\${INSTANCE_NAME}" \
  --instance-snapshot-name "\${SNAPSHOT_NAME}" >/dev/null

echo "Created snapshot: \${SNAPSHOT_NAME}"

SNAPSHOTS=\$(aws lightsail get-instance-snapshots \
  --region "\${REGION}" \
  --query "instanceSnapshots[?starts_with(name, '\${INSTANCE_NAME}-')].name" \
  --output text | tr '\t' '\n' | sed '/^\s*$/d' | sort)

COUNT=\$(echo "\${SNAPSHOTS}" | sed '/^\s*$/d' | wc -l | tr -d ' ')
if [[ "\${COUNT}" -le "\${RETENTION}" ]]; then
  exit 0
fi

TO_DELETE=\$((COUNT - RETENTION))
INDEX=0
while IFS= read -r SNAP; do
  [[ -z "\${SNAP}" ]] && continue
  INDEX=\$((INDEX + 1))
  if [[ "\${INDEX}" -le "\${TO_DELETE}" ]]; then
    aws lightsail delete-instance-snapshot --region "\${REGION}" --instance-snapshot-name "\${SNAP}" >/dev/null
    echo "Deleted old snapshot: \${SNAP}"
  fi
done <<< "\${SNAPSHOTS}"
EOS

chmod +x /usr/local/bin/aegis_snapshot.sh

TEMPLATE_DIR="${PROJECT_ROOT}/deploy/lightsail/templates/systemd"
cp "${TEMPLATE_DIR}/aegis-snapshot.service.tmpl" /etc/systemd/system/aegis-snapshot.service
cp "${TEMPLATE_DIR}/aegis-snapshot.timer.tmpl" /etc/systemd/system/aegis-snapshot.timer

systemctl daemon-reload
systemctl enable --now aegis-snapshot.timer

echo "Snapshot timer installed."
echo "IMPORTANT: Ensure AWS credentials with Lightsail permissions are configured on this host."
