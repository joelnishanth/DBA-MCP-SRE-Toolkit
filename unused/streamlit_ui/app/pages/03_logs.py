import streamlit as st
import httpx
import asyncio
import time

st.set_page_config(
    page_title="Container Logs",
    page_icon="📄",
    layout="wide"
)

st.title("📄 Container Logs")
st.markdown("""
View and monitor container logs in real-time. Select a container and configure log viewing options below.
""")

async def get_container_list():
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.get("http://mcp_server:5000/containers")
            return resp.json().get("containers", [])
        except Exception as e:
            st.error(f"Error fetching containers: {e}")
            return []

# Get list of containers
container_options = asyncio.run(get_container_list())
selected_container = st.selectbox("Select container:", container_options)

# Log viewing options
col1, col2, col3 = st.columns(3)
with col1:
    num_lines = st.number_input("Number of lines to show", min_value=10, max_value=1000, value=50)
with col2:
    auto_refresh = st.checkbox("Auto-refresh logs", value=True)
with col3:
    refresh_interval = st.number_input("Refresh interval (seconds)", min_value=5, max_value=60, value=10)

if selected_container:
    async def fetch_logs():
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                resp = await client.get(f"http://mcp_server:5000/logs/{selected_container}?lines={num_lines}")
                if resp.status_code == 200:
                    return resp.json().get("logs", [])
                else:
                    st.error(f"Error fetching logs: {resp.status_code}")
                    return []
            except Exception as e:
                st.error(f"Failed to fetch logs: {e}")
                return []

    # Create a container for the logs
    logs_container = st.empty()
    
    def update_logs():
        logs = asyncio.run(fetch_logs())
        if logs:
            logs_container.code("\n".join(logs), language="text")
        
    # Initial load
    update_logs()
    
    # Auto-refresh logic
    if auto_refresh:
        while True:
            time.sleep(refresh_interval)
            update_logs()
            
    # Manual refresh button
    if st.button("🔄 Refresh Logs"):
        update_logs()
else:
    st.info("Please select a container to view its logs")