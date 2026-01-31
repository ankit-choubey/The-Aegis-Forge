import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

# Load .env for GROQ_API_KEY
load_dotenv() 

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from livekit.agents import llm
from livekit.plugins import groq
from app.agents.rubrics.faang_swe import FAANG_OBSERVER_SYSTEM

# DSA Transcript (Sub-optimal solution)
TRANSCRIPT = """
Interviewer: Given an array of integers from 1 to N, one number involves a duplicate. Find it.
Candidate: I can iterate through the array, and for each element, I'll search the rest of the array to see if it appears again.
Interviewer: What is the time complexity of that approach?
Candidate: Since I have nested loops, it would be O(N^2).
Interviewer: Can we optimize this?
Candidate: We could sort the array first, then check adjacent elements. That would be O(N log N).
Interviewer: Is there an O(N) approach?
Candidate: I think maybe using a Set? But that uses extra space.
"""

async def test_dsa():
    print(">>> Testing DSA Rubric Evaluation...")
    print(f"Transcript:\n{TRANSCRIPT}\n")
    
    model = groq.LLM(model="llama-3.3-70b-versatile")
    
    chat_ctx = llm.ChatContext()
    chat_ctx.add_message(role="system", content=FAANG_OBSERVER_SYSTEM)
    chat_ctx.add_message(role="user", content=f"Evaluate this interview segment:\n{TRANSCRIPT}")
    
    try:
        stream = model.chat(chat_ctx=chat_ctx)
        
        full_response = ""
        print(">>> Stream Output:")
        async for chunk in stream:
            print(f"DEBUG: {chunk}")
            content = None
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
            elif hasattr(chunk, 'content'):
                content = chunk.content
            
            if content:
                full_response += content
                print(content, end="", flush=True)
                
        print("\n\n>>> Verification:")
        if "problem_solving" in full_response and "complexity" in full_response.lower():
            print(">>> SUCCESS: Rubric picked up on DSA/Complexity signals.")
        else:
            print(">>> WARNING: Rubric might have missed the DSA context.")

    except Exception as e:
        print(f"\n>>> ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_dsa())
