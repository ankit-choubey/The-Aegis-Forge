# Aegis Forge Lightsail Deployment Pack

This package implements the AWS Lightsail one-month showcase plan without changing application code.

## What This Pack Sets Up

- Single Lightsail host (Ubuntu 22.04 expected) running:
- Next.js frontend service (`aegis-frontend`)
- FastAPI backend service (`aegis-backend`)
- LiveKit agent service (`aegis-agent`)
- Three public domains:
- `recruiter.<domain>` -> frontend landing flow
- `candidate.<domain>` -> frontend candidate flow (root redirects to `/candidate`)
- `api.<domain>` -> FastAPI
- Nginx reverse proxy + Let's Encrypt TLS
- Daily Lightsail snapshot timer with retention pruning
- Logrotate for app log files

## Files

- `config/lightsail.env.example`: configuration template
- `scripts/bootstrap_server.sh`: OS/runtime bootstrap (Node 20, Python 3.11, uv, Nginx, Certbot)
- `scripts/deploy_app.sh`: checkout app, install deps, build frontend, write `/etc/aegis/*.env`
- `scripts/install_systemd.sh`: install/restart backend/frontend/agent services
- `scripts/install_nginx.sh`: install Nginx configs for recruiter/candidate/api hosts
- `scripts/issue_certs.sh`: issue TLS certs for all 3 domains
- `scripts/install_logrotate.sh`: configure log rotation
- `scripts/setup_snapshots.sh`: install daily snapshot timer (`aegis-snapshot.timer`)
- `scripts/validate_deployment.sh`: post-deploy checks
- `scripts/run_full_setup.sh`: executes all scripts in order

## Prerequisites

- Lightsail instance created in Mumbai (`ap-south-1`) with Ubuntu 22.04 and at least 2GB RAM.
- Static IP attached to instance.
- DNS A records pointing to static IP:
- `recruiter.<domain>`
- `candidate.<domain>`
- `api.<domain>`
- Repo access from instance (SSH key or HTTPS token).
- API keys ready: LiveKit, Groq, Deepgram.

## Usage

1. Copy this repository to the Lightsail instance.
2. Create env file from template:

```bash
cp deploy/lightsail/config/lightsail.env.example deploy/lightsail/config/lightsail.env
```

3. Edit `deploy/lightsail/config/lightsail.env` with your real values.
4. Run full setup as root:

```bash
sudo deploy/lightsail/scripts/run_full_setup.sh deploy/lightsail/config/lightsail.env
```

5. Validate deployment:

```bash
sudo deploy/lightsail/scripts/validate_deployment.sh deploy/lightsail/config/lightsail.env
```

## Recruiter and Candidate Flow Mapping

- Recruiter entry URL: `https://recruiter.<domain>/`
- Recruiter journey: landing -> resume upload -> report -> credential generation.
- Candidate entry URL: `https://candidate.<domain>/candidate`
- Candidate journey: login -> interview -> results/feedback.

## Notes

- No existing app source files are modified by this pack.
- Backend CORS is set via `ALLOWED_ORIGINS` in `/etc/aegis/backend.env`.
- Snapshot automation requires valid AWS credentials on the instance with Lightsail snapshot permissions.
