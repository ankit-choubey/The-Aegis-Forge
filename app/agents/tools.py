from typing import Annotated
from livekit.agents import llm
import logging
import json

logger = logging.getLogger("aegis.agents.tools")

class ToggleNotepad:
    def __init__(self, room):
        self._room = room

    @llm.function_tool(description="Toggle the visibility of the coding Notepad overlay on the user's screen. Use visible=True to show it for coding tasks.")
    async def toggle_notepad(self, visible: bool):
        """
        Toggle the user's notepad visibility via Data Channel.
        Args:
            visible: True to show notepad, False to hide.
        """
        logger.info(f"Tool called: toggle_notepad(visible={visible})")
        
        # Construct payload
        payload = json.dumps({
            "type": "TOGGLE_NOTEPAD",
            "visible": visible
        }).encode("utf-8")
        
        # Publish to Room
        if self._room and self._room.local_participant:
            await self._room.local_participant.publish_data(
                payload,
                reliable=True
            )
            return f"Notepad visibility set to {visible}"
        else:
            logger.error("Failed to toggle notepad: No room/participant")
            return "Error: Could not toggle notepad (No Room Connected)"
