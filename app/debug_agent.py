import logging
from dotenv import load_dotenv
from livekit.agents import cli, JobContext, WorkerOptions, AgentServer

load_dotenv()
logger = logging.getLogger("debug-agent")
logging.basicConfig(level=logging.INFO)

server = AgentServer()

@server.rtc_session(agent_name="debug-agent")
async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to {ctx.room.name}")
    await ctx.connect()
    logger.info("CONNECTED SUCCESSFULLY!")
    await ctx.room.local_participant.publish_data("Debug Agent Connected")

if __name__ == "__main__":
    cli.run_app(server)