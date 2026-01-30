import asyncio
import os
from livekit import api
from dotenv import load_dotenv

load_dotenv()

async def main():
    lkapi = api.LiveKitAPI(
        os.getenv("LIVEKIT_URL"),
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET"),
    )
    
    print("API Attributes:", dir(lkapi))
    if hasattr(lkapi, 'agent_dispatch'):
        print("Agent Dispatch Attributes:", dir(lkapi.agent_dispatch))
        print("Create Dispatch Help:", help(lkapi.agent_dispatch.create_dispatch))
    
    await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(main())
