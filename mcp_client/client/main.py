import asyncio
from request_utils import fetch_logs_and_status

async def main():
    await fetch_logs_and_status("error_app")

asyncio.run(main())