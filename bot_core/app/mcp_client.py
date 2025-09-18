import httpx
import asyncio

async def fetch_logs_and_status(container_name: str):
    async with httpx.AsyncClient() as client:
        logs_resp = await client.get(f"http://mcp_server:5000/logs/{container_name}")
        status_resp = await client.get(f"http://mcp_server:5000/status/{container_name}")
        return logs_resp.json().get("logs", []), status_resp.json()