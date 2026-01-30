# 🤖 Agentic AI Architecture & LLM Models in LiveKit Agents

## ✅ Yes, This Project Uses Agentic AI!

### What is Agentic AI?

**Agentic AI** refers to AI systems that can act autonomously with agency. Unlike simple chatbots, agentic AI can:

1. **🎯 Take Actions** - Execute functions and tools to accomplish tasks
2. **🧠 Reason & Plan** - Think through problems step-by-step
3. **🔄 Maintain Context** - Remember conversation history and state
4. **🛠️ Use Tools** - Call external APIs, databases, and services
5. **🎭 Have Roles** - Operate with specific personas and goals
6. **📊 Make Decisions** - Choose which actions to take based on context

### How LiveKit Agents Implements Agentic AI

```
┌─────────────────────────────────────────────────────────┐
│                    AGENTIC AI AGENT                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👂 STT (Speech-to-Text)                               │
│     ↓                                                   │
│  🧠 LLM (Large Language Model) ← Instructions & Tools  │
│     ↓                                                   │
│  🔊 TTS (Text-to-Speech)                               │
│                                                         │
│  🛠️ Function Tools:                                    │
│     • lookup_weather()                                 │
│     • record_candidate_response()                      │
│     • ask_technical_question()                         │
│     • provide_coding_hint()                            │
│     • conclude_interview()                             │
│     • ... custom tools ...                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 LLM Models Used

### **Current Configuration (Your AI Interviewer)**

```python
llm=inference.LLM("openai/gpt-4.1-mini")
```

**Model:** OpenAI GPT-4.1 Mini
- **Provider:** OpenAI
- **Capabilities:** Advanced reasoning, function calling, context understanding
- **Best for:** Complex conversations, technical interviews, multi-step reasoning

---

## 📊 All Available LLM Models

LiveKit Agents supports **multiple LLM providers** through plugins:

### **1. OpenAI Models** 🔵
```python
from livekit.plugins import openai

# Standard LLMs
llm = openai.LLM(model="gpt-4.1-mini")
llm = openai.LLM(model="gpt-4o")
llm = openai.LLM(model="gpt-4-turbo")
llm = openai.LLM(model="gpt-3.5-turbo")

# Realtime API (voice-to-voice)
llm = openai.realtime.RealtimeModel(voice="echo")
```

**Used in examples:**
- `basic_agent.py` - GPT-4.1 Mini
- `ai_interviewer.py` - GPT-4.1 Mini
- `restaurant_agent.py` - GPT-4o
- `multi_agent.py` - GPT-4o with Realtime API

---

### **2. Google Gemini Models** 🟢
```python
from livekit.plugins import google

llm = google.LLM(model="gemini-2.5-flash")
llm = google.LLM(model="gemini-2.0-flash-exp")
llm = google.LLM(model="gemini-1.5-pro")
```

**Used in examples:**
- `zapier_mcp_integration.py` - Gemini 2.5 Flash
- `email_example.py` - Gemini 2.5 Flash
- `push_to_talk.py` - Gemini 2.5 Flash

**Features:**
- Fast response times
- Multimodal (text, images, video)
- Long context windows

---

### **3. Anthropic Claude Models** 🟣
```python
from livekit.plugins import anthropic

llm = anthropic.LLM(model="claude-3-5-sonnet-20241022")
llm = anthropic.LLM(model="claude-3-opus-20240229")
llm = anthropic.LLM(model="claude-3-haiku-20240307")
```

**Features:**
- Excellent reasoning capabilities
- Strong at following complex instructions
- Great for coding tasks

---

### **4. Groq (Fast Inference)** ⚡
```python
from livekit.plugins import groq

llm = groq.LLM(model="llama-3.1-70b-versatile")
llm = groq.LLM(model="mixtral-8x7b-32768")
```

**Used in:**
- `fast-preresponse.py` - Ultra-fast responses

**Features:**
- Extremely fast inference
- Low latency
- Great for real-time conversations

---

### **5. xAI Grok Models** 🚀
```python
from livekit.plugins import xai

llm = xai.LLM(model="grok-beta")
```

**Used in:**
- `grok/grok_voice_agent_api.py`

---

### **6. AWS Bedrock Models** 🟠
```python
from livekit.plugins import aws

llm = aws.LLM(model="anthropic.claude-3-sonnet-20240229-v1:0")
llm = aws.LLM(model="meta.llama3-70b-instruct-v1:0")
```

**Features:**
- Enterprise-grade
- Multiple model providers
- AWS infrastructure

---

### **7. Mistral AI Models** 🔴
```python
from livekit.plugins import mistralai

llm = mistralai.LLM(model="mistral-large-latest")
llm = mistralai.LLM(model="mistral-small-latest")
```

---

### **8. NVIDIA NIM Models** 🟢
```python
from livekit.plugins import nvidia

llm = nvidia.LLM(model="meta/llama-3.1-70b-instruct")
```

**Used in:**
- `nvidia_test.py`

---

### **9. Unified Inference API** 🌐

LiveKit provides a **unified API** to access multiple models:

```python
from livekit.agents import inference

# Automatically routes to the correct provider
llm = inference.LLM("openai/gpt-4.1-mini")
llm = inference.LLM("google/gemini-2.5-flash")
llm = inference.LLM("anthropic/claude-3-5-sonnet-20241022")
```

**Benefits:**
- Single API for all providers
- Easy to switch models
- Managed through LiveKit Cloud

---

## 🎯 How Agentic AI Works in Your Interviewer

### **1. Agent Definition**
```python
class InterviewerAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are Alex, a professional AI interviewer..."
        )
```

### **2. Function Tools (Agent's Capabilities)**
```python
@function_tool
async def ask_technical_question(self, context, topic: str):
    """The LLM can call this to ask interview questions"""
    return "Ask this question: ..."

@function_tool
async def record_candidate_response(self, context, response: str, rating: str):
    """The LLM can call this to record responses"""
    self.interview_notes.append(...)
```

### **3. Agentic Workflow**
```
User speaks → STT → Text
                ↓
         LLM processes with:
         • Agent instructions
         • Conversation history
         • Available tools
                ↓
         LLM decides:
         • What to say
         • Which tool to call (if any)
                ↓
         Tool executes → Result
                ↓
         LLM incorporates result
                ↓
         TTS → Agent speaks
```

---

## 🔧 Choosing the Right LLM

### **For Interviews (Current Setup)**
```python
llm = inference.LLM("openai/gpt-4.1-mini")  # ✅ Best choice
```
**Why:** Strong reasoning, function calling, professional responses

### **For Speed**
```python
llm = groq.LLM(model="llama-3.1-70b-versatile")  # ⚡ Fastest
```

### **For Cost Efficiency**
```python
llm = inference.LLM("google/gemini-2.5-flash")  # 💰 Cheap & fast
```

### **For Complex Reasoning**
```python
llm = openai.LLM(model="gpt-4o")  # 🧠 Most capable
```

---

## 📊 Model Comparison

| Provider | Model | Speed | Cost | Reasoning | Function Calling |
|----------|-------|-------|------|-----------|------------------|
| OpenAI | GPT-4.1 Mini | ⚡⚡⚡ | 💰💰 | ⭐⭐⭐⭐⭐ | ✅ Excellent |
| OpenAI | GPT-4o | ⚡⚡ | 💰💰💰 | ⭐⭐⭐⭐⭐ | ✅ Excellent |
| Google | Gemini 2.5 Flash | ⚡⚡⚡⚡ | 💰 | ⭐⭐⭐⭐ | ✅ Good |
| Anthropic | Claude 3.5 Sonnet | ⚡⚡⚡ | 💰💰💰 | ⭐⭐⭐⭐⭐ | ✅ Excellent |
| Groq | Llama 3.1 70B | ⚡⚡⚡⚡⚡ | 💰 | ⭐⭐⭐ | ✅ Good |
| xAI | Grok Beta | ⚡⚡⚡ | 💰💰 | ⭐⭐⭐⭐ | ✅ Good |

---

## 🎨 Switching Models

To change the LLM in your AI Interviewer:

```python
# Edit: examples/voice_agents/ai_interviewer.py

# Option 1: Use Google Gemini (faster, cheaper)
llm=inference.LLM("google/gemini-2.5-flash")

# Option 2: Use Claude (better reasoning)
llm=inference.LLM("anthropic/claude-3-5-sonnet-20241022")

# Option 3: Use Groq (fastest)
from livekit.plugins import groq
llm=groq.LLM(model="llama-3.1-70b-versatile")
```

---

## 🔗 Resources

- **LLM Models Docs:** https://docs.livekit.io/agents/models/llm/
- **Function Tools:** https://docs.livekit.io/agents/build/tools/
- **Agent Architecture:** https://docs.livekit.io/agents/build/agent/

---

## 📝 Summary

✅ **Yes, this is Agentic AI** - Agents can reason, use tools, and take actions  
✅ **Primary LLM:** OpenAI GPT-4.1 Mini (in your interviewer)  
✅ **56+ Plugins Available** - OpenAI, Google, Anthropic, Groq, xAI, AWS, and more  
✅ **Easy to Switch** - Change one line to use different models  
✅ **Function Calling** - Agents can execute custom tools and functions  

Your AI Interviewer is a true **agentic system** that can conduct interviews, ask questions, evaluate responses, and make decisions autonomously! 🚀
