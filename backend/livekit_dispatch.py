"""
LiveKit Dispatch Helper
Handles room creation, token generation, and agent dispatch.
"""
import os
import logging
import time
from typing import Optional
from datetime import timedelta
from dotenv import load_dotenv
from livekit import api

# Load environment variables
load_dotenv()

logger = logging.getLogger("aegis.livekit_dispatch")


class LiveKitDispatcher:
    """Helper class for LiveKit operations."""
    
    def __init__(self):
        self.api_key = os.getenv("LIVEKIT_API_KEY")
        self.api_secret = os.getenv("LIVEKIT_API_SECRET")
        self.url = os.getenv("LIVEKIT_URL", "wss://ai-interviewer-b5tsniq0.livekit.cloud")
        
        if not self.api_key or not self.api_secret:
            logger.warning("LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set!")
    
    def create_token(
        self, 
        room_name: str, 
        participant_name: str,
        can_publish: bool = True,
        can_subscribe: bool = True,
        ttl_seconds: int = 3600
    ) -> str:
        """
        Create an access token for a participant.
        
        Args:
            room_name: Name of the room
            participant_name: Identity of the participant
            can_publish: Allow publishing audio/video
            can_subscribe: Allow subscribing to tracks
            ttl_seconds: Token validity in seconds
            
        Returns:
            JWT token string
        """
        token = api.AccessToken(self.api_key, self.api_secret)
        token.with_identity(participant_name)
        token.with_name(participant_name)
        token.with_ttl(timedelta(seconds=ttl_seconds))  # Fixed: use timedelta
        
        # Grant permissions
        grant = api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=can_publish,
            can_subscribe=can_subscribe,
        )
        token.with_grants(grant)
        
        return token.to_jwt()
    
    def generate_room_name(self, candidate_id: str) -> str:
        """Generate a unique room name for an interview session."""
        timestamp = int(time.time())
        return f"interview-{candidate_id}-{timestamp}"
    
    def get_room_url(self, room_name: str, token: str) -> str:
        """
        Get the full room URL with token for joining.
        
        For LiveKit Playground or custom frontend.
        """
        # Clean URL (remove wss:// for web URL)
        base_url = self.url.replace("wss://", "https://").replace("ws://", "http://")
        return f"https://meet.livekit.io?liveKitUrl={self.url}&token={token}"
    
    async def dispatch_agent(
        self,
        room_name: str,
        agent_name: str = "aegis-interviewer",
        metadata: Optional[str] = None
    ) -> dict:
        """
        Dispatch an agent to a room.
        
        Args:
            room_name: Target room name
            agent_name: Registered agent name
            metadata: Optional metadata (e.g., "audit:/path/to/audit.json")
            
        Returns:
            Dispatch response
        """
        try:
            room_service = api.RoomService(self.url, self.api_key, self.api_secret)
            
            # Create the room first (if it doesn't exist)
            try:
                await room_service.create_room(
                    api.CreateRoomRequest(
                        name=room_name,
                        empty_timeout=300,  # 5 minutes
                        max_participants=10
                    )
                )
                logger.info(f"Created room: {room_name}")
            except Exception as e:
                logger.info(f"Room may already exist: {e}")
            
            # Dispatch agent using AgentDispatch
            agent_dispatch = api.AgentDispatchService(self.url, self.api_key, self.api_secret)
            
            dispatch_request = api.CreateAgentDispatchRequest(
                agent_name=agent_name,
                room=room_name,
                metadata=metadata or ""
            )
            
            response = await agent_dispatch.create_dispatch(dispatch_request)
            logger.info(f"Agent dispatched to {room_name}: {response}")
            
            return {
                "success": True,
                "room_name": room_name,
                "agent_name": agent_name,
                "dispatch_id": response.id if hasattr(response, 'id') else None
            }
            
        except Exception as e:
            logger.error(f"Agent dispatch failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
dispatcher = LiveKitDispatcher()
