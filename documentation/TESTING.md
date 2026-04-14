# Aegis Forge Agent Testing Guide

This guide outlines how to verify the Agent Intelligence logic before connecting to the full backend, and how to run the live agent server for integration.

## 1. Fast Logic Verification (Offline)
Run the script below to verify the 5-Agent Architecture logic (Incident Lead, Pressure, Mole, Observer, Governor) instantly without needing LiveKit connection.

```bash
python3 scripts/verify_agents.py
```
**What this tests:**
- ✅ **Prompt Injection**: Confirms system prompts are generated correctly without crashes.
- ✅ **State Transitions**: Tests `trigger_crisis()` and `check_safety()`.
- ✅ **Class Logic**: Verifies correct subclassing and dependency injection.

---

## 2. Live Agent Server (Online)
To connect the agents to real audio/text streams via LiveKit Cloud.

### Prerequisites
Ensure your `.env` file has:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GROQ_API_KEY`
- `DEEPGRAM_API_KEY`

### Running in Dev Mode (Hot Reload)
```bash
python3 app/main.py dev
```
Then connect via:
- [Agents Playground](https://agents-playground.livekit.io/)
- Or the `web/` frontend.

### Running in Production Mode
```bash
python3 app/main.py start
```

## 3. Troubleshooting
- **API Errors**: Check `GROQ_API_KEY` and `DEEPGRAM_API_KEY` in `.env`.
- **Audio Issues**: If running in `dev` mode with local frontend, ensure browser permissions are allowed.
