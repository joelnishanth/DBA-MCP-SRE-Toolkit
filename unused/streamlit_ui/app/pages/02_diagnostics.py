import streamlit as st
import httpx
import asyncio

st.set_page_config(
    page_title="Container Diagnostics",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Container Diagnostics")
st.markdown("""
Run AI-powered diagnostics on your containers and view live logs. Select a container from the list below to begin analysis.
""")

async def get_container_list():
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.get("http://mcp_server:5000/containers")
            return resp.json().get("containers", [])
        except Exception as e:
            st.error(f"Error fetching containers: {e}")
            return []

container_options = asyncio.run(get_container_list())
selected_container = st.selectbox("Select container to diagnose:", container_options)

col1, col2 = st.columns(2)

with col1:
    if st.button("🔍 Run Diagnosis"):
        if not selected_container:
            st.warning("Please select a valid container.")
        else:
            with st.spinner("Calling Claude and analyzing logs... this may take a few seconds."):
                async def fetch_diagnosis():
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        resp = await client.post("http://bot_core:6000/diagnose", json={"container_name": selected_container})
                        return resp.json()

                try:
                    result = asyncio.run(fetch_diagnosis())
                    st.subheader("📝 Claude's Analysis")
                    st.markdown(result.get("claude_response", "No response received."), unsafe_allow_html=True)

                    st.subheader("📄 Diagnostic Prompt")
                    with st.expander("Prompt Sent to Claude"):
                        st.code(result.get("prompt", ""), language="text")
                except Exception as e:
                    st.error(f"Failed to complete diagnosis: {e}")

with col2:
    if st.button("📃 Stream Logs"):
        if not selected_container:
            st.warning("Please select a valid container.")
        else:
            st.subheader("📃 Live Logs")
            async def stream_logs():
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.get(f"http://mcp_server:5000/logs/{selected_container}?lines=50")
                    if resp.status_code != 200:
                        st.error(f"Error fetching logs: {resp.status_code} - {resp.text}")
                        return []
                    try:
                        return resp.json().get("logs", [])
                    except Exception as e:
                        st.error(f"Failed to parse logs response: {e}")
                        st.text(resp.text)
                        return []

            logs = asyncio.run(stream_logs())
            st.text("\n".join(logs))

# Add Fix button below the columns
if st.button("🔧 Fix Container"):
    if not selected_container:
        st.warning("Please select a valid container.")
    else:
        with st.spinner(f"Attempting to fix container {selected_container}..."):
            async def fix_container():
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(f"http://mcp_server:5000/fix/{selected_container}")
                    return resp.json()

            try:
                result = asyncio.run(fix_container())
                if result.get("success", False):
                    st.success(result.get("message", "Container fixed successfully"))
                else:
                    st.error(result.get("message", "Failed to fix container"))
            except Exception as e:
                st.error(f"Error fixing container: {e}")
