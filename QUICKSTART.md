# 🚀 LiveKit Agents - Quick Start Guide

## What is This?

**LiveKit Agents** is a Python framework for building realtime, programmable AI voice agents that can:
- 🎤 Listen to users (Speech-to-Text)
- 🧠 Think and respond intelligently (LLM)
- 🔊 Speak back naturally (Text-to-Speech)
- 🛠️ Execute custom functions (Tools)

## Prerequisites

✅ **Already Installed:**
- Python 3.9+
- All required dependencies

⚠️ **You Need:**
- LiveKit credentials (see below)

---

## 🔑 Step 1: Get LiveKit Credentials

### Option A: LiveKit Cloud (Recommended - Free Tier)

1. Visit [LiveKit Cloud](https://cloud.livekit.io/)
2. Sign up for a free account
3. Create a new project
4. Copy your credentials

### Option B: Self-Host

Follow the [self-hosting guide](https://docs.livekit.io/home/self-hosting/deployment/)

---

## 🔧 Step 2: Configure Environment

Edit the file `examples/.env` with your credentials:

```bash
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY="your-api-key"
LIVEKIT_API_SECRET="your-api-secret"
```

---

## 🎯 Step 3: Run Your First Agent

### Three Running Modes:

#### 1️⃣ **Console Mode** (Terminal Testing)
Test directly in your terminal with local audio:

```bash
cd examples
python voice_agents/basic_agent.py console
```

**Features:**
- ✅ Uses your microphone and speakers
- ✅ Perfect for quick testing
- ✅ No external clients needed

---

#### 2️⃣ **Development Mode** (Hot Reload)
Run with automatic code reloading:

```bash
cd examples
python voice_agents/basic_agent.py dev
```

**Then connect using:**
- [Agents Playground](https://agents-playground.livekit.io/)
- Any LiveKit client SDK
- Phone via [SIP integration](https://docs.livekit.io/sip/)

**Features:**
- ✅ Hot reload on file changes
- ✅ Multiple concurrent agents
- ✅ Connect from any device

---

#### 3️⃣ **Production Mode**
Run with production optimizations:

```bash
cd examples
python voice_agents/basic_agent.py start
```

---

## 📝 Available Examples

### Voice Agents (`examples/voice_agents/`)

| Example | Description |
|---------|-------------|
| `basic_agent.py` | 🎙️ Starter agent with weather lookup |
| `multi_agent.py` | 🔄 Multi-agent handoff example |
| `restaurant_agent.py` | 🍽️ Restaurant ordering system |
| `push_to_talk.py` | 🔘 Push-to-talk mode |
| `background_audio.py` | 🎵 Ambient background audio |
| `structured_output.py` | 📋 Structured LLM responses |
| `web_search.py` | 🔍 Web search integration |

### Other Examples

- **Avatar Agents** (`examples/avatar_agents/`) - Video avatars
- **Transcription** (`examples/other/transcription/`) - Multi-user transcription
- **Text-only** (`examples/other/text_only.py`) - No voice, text chat only

---

## 🛠️ Customizing Your Agent

Edit `examples/voice_agents/basic_agent.py`:

```python
class MyAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="Your custom instructions here..."
        )
    
    @function_tool
    async def my_custom_function(self, context: RunContext, param: str):
        """Your custom function description"""
        # Your logic here
        return "result"
```

---

## 🔧 Choosing Models

You can mix and match different providers:

### Speech-to-Text (STT)
```python
stt=inference.STT("deepgram/nova-3")
# or: assemblyai, google, azure, etc.
```

### Large Language Model (LLM)
```python
llm=inference.LLM("openai/gpt-4.1-mini")
# or: anthropic/claude, google/gemini, etc.
```

### Text-to-Speech (TTS)
```python
tts=inference.TTS("cartesia/sonic-3", voice="...")
# or: elevenlabs, openai, google, etc.
```

See all available models:
- [STT Models](https://docs.livekit.io/agents/models/stt/)
- [LLM Models](https://docs.livekit.io/agents/models/llm/)
- [TTS Models](https://docs.livekit.io/agents/models/tts/)

---

## 📚 Next Steps

1. **Read the docs**: [docs.livekit.io/agents](https://docs.livekit.io/agents/)
2. **Try examples**: Explore the `examples/` directory
3. **Join community**: [LiveKit Slack](https://livekit.io/join-slack)
4. **Build your agent**: Start with `basic_agent.py` and customize!

---

## 🐛 Troubleshooting

### "ValueError: ws_url is required"
- Make sure `examples/.env` exists with valid credentials

### "Module not found"
- Run: `pip install "livekit-agents[openai,silero,deepgram,cartesia,turn-detector]~=1.0"`

### Audio issues in console mode
- Check microphone/speaker permissions
- Try a different audio device

---

## 📖 Resources

- **Documentation**: https://docs.livekit.io/agents/
- **Examples**: https://github.com/livekit-examples
- **Playground**: https://agents-playground.livekit.io/
- **Community**: https://livekit.io/join-slack

---

Happy building! 🎉
