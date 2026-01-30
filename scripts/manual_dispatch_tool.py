import asyncio
import os
import logging
from livekit import api
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("manual_dispatch")

async def main():
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")

    if not all([url, key, secret]):
        logger.error("Missing credentials in .env")
        return

    lkapi = api.LiveKitAPI(url, key, secret)
    
    from livekit.protocol import agent_dispatch
    
    room_name = "test-room"
    agent_name = "aegis-interviewer"
    
    logger.info(f"Attempting to dispatch '{agent_name}' to room '{room_name}'...")

    try:
        if hasattr(lkapi, 'agent_dispatch'):
            logger.info("Using lkapi.agent_dispatch...")
            
            req = agent_dispatch.CreateAgentDispatchRequest(
                agent_name=agent_name,
                room=room_name
            )
            
            res = await lkapi.agent_dispatch.create_dispatch(req)
            logger.info(f"Dispatch Created: {res}")
            
        else:
            logger.warning("lkapi.agent_dispatch not found. Listing attributes:")
            logger.info(dir(lkapi))

    except Exception as e:
        logger.error(f"Dispatch Failed: {e}")
        import traceback
        traceback.print_exc()
    
    await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(main())
