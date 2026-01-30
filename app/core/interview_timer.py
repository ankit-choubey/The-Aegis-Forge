"""
Interview Timer
Manages the 40-minute interview time limit.
"""
import logging
import asyncio
from typing import Callable, Optional, Awaitable

logger = logging.getLogger("aegis.core.interview_timer")


class InterviewTimer:
    """
    Manages the interview time limit.
    
    Triggers a callback when the maximum time is reached.
    Can be cancelled if the interview ends early.
    """
    
    def __init__(
        self,
        max_duration_seconds: int = 2400,  # 40 minutes default
        on_timeout: Optional[Callable[[], Awaitable[None]]] = None,
        warning_at_seconds: int = 2100  # 35 minutes - 5 min warning
    ):
        """
        Initialize the interview timer.
        
        Args:
            max_duration_seconds: Maximum interview duration (default 40 min)
            on_timeout: Async callback to call when time expires
            warning_at_seconds: When to send a warning (default 35 min)
        """
        self._max_duration = max_duration_seconds
        self._warning_at = warning_at_seconds
        self._on_timeout = on_timeout
        
        self._task: Optional[asyncio.Task] = None
        self._warning_task: Optional[asyncio.Task] = None
        self._on_warning: Optional[Callable[[], Awaitable[None]]] = None
        self._cancelled = False
        
    def set_warning_callback(self, callback: Callable[[], Awaitable[None]]):
        """Set callback for 5-minute warning."""
        self._on_warning = callback
        
    async def start(self):
        """Start the interview timer."""
        if self._task is not None:
            logger.warning("Interview timer already started")
            return
            
        self._cancelled = False
        self._task = asyncio.create_task(self._timer_loop())
        
        # Start warning timer if callback is set
        if self._on_warning and self._warning_at < self._max_duration:
            self._warning_task = asyncio.create_task(self._warning_loop())
            
        logger.info(f">>> Interview Timer started: {self._max_duration/60:.0f} minutes")
        
    async def stop(self):
        """Stop the timer (interview ended early)."""
        self._cancelled = True
        
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
            
        if self._warning_task:
            self._warning_task.cancel()
            try:
                await self._warning_task
            except asyncio.CancelledError:
                pass
            self._warning_task = None
            
        logger.info(">>> Interview Timer stopped")
        
    async def _timer_loop(self):
        """Wait for max duration, then trigger timeout."""
        try:
            await asyncio.sleep(self._max_duration)
            
            if not self._cancelled and self._on_timeout:
                logger.info(">>> Interview Timer EXPIRED! Triggering timeout...")
                await self._on_timeout()
                
        except asyncio.CancelledError:
            logger.info(">>> Interview timer cancelled")
            raise
            
    async def _warning_loop(self):
        """Send warning at the configured time."""
        try:
            await asyncio.sleep(self._warning_at)
            
            if not self._cancelled and self._on_warning:
                logger.info(">>> Interview Timer: 5-minute warning!")
                await self._on_warning()
                
        except asyncio.CancelledError:
            pass
            
    @property
    def is_running(self) -> bool:
        """Check if timer is running."""
        return self._task is not None and not self._task.done()
