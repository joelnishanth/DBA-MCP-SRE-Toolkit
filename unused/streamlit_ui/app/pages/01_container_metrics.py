import streamlit as st
import requests
import time
import pandas as pd

st.set_page_config(
    page_title="Container Metrics",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Container Metrics")
st.markdown("""
This page shows live metrics for all running containers in the system.
The data refreshes automatically every few seconds.
""")

def get_container_list():
    try:
        resp = requests.get("http://mcp_server:5000/containers", timeout=10)
        if resp.status_code == 200:
            return resp.json().get("containers", [])
        else:
            st.error(f"Error fetching containers: HTTP {resp.status_code}")
            return []
    except Exception as e:
        st.error(f"Error fetching containers: {e}")
        return []

def get_container_stats(container_name):
    try:
        resp = requests.get(f"http://mcp_server:5000/status/{container_name}", timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            st.error(f"Error fetching stats for {container_name}: HTTP {resp.status_code}")
            return None
    except Exception as e:
        st.error(f"Error fetching stats for {container_name}: {e}")
        return None

# Get list of containers
containers = get_container_list()

if not containers:
    st.warning("No containers found or unable to fetch container list.")
else:
    # Collect metrics data for table
    metrics_data = []
    
    for container in containers:
        stats = get_container_stats(container)
        
        if stats:
            status_icon = "🟢" if stats.get("status") == "running" else "🔴"
            status_text = f"{status_icon} {stats.get('status', 'unknown')}"
            
            metrics_data.append({
                "Container": container,
                "Status": status_text,
                "CPU Usage (%)": f"{stats.get('cpu_percent', 0):.2f}",
                "Memory Usage (MB)": f"{stats.get('memory_usage_mb', 0):.1f}",
                "Memory Usage (%)": f"{stats.get('memory_percent', 0):.1f}",
                "Memory Limit (MB)": f"{stats.get('memory_limit_mb', 0):.1f}"
            })
        else:
            metrics_data.append({
                "Container": container,
                "Status": "🔴 Error",
                "CPU Usage (%)": "N/A",
                "Memory Usage (MB)": "N/A",
                "Memory Usage (%)": "N/A",
                "Memory Limit (MB)": "N/A"
            })
    
    # Display as table
    if metrics_data:
        df = pd.DataFrame(metrics_data)
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.warning("No metrics data available")

    st.divider()
    
    # Auto-refresh controls
    col1, col2, col3 = st.columns([1, 2, 1])
    with col1:
        auto_refresh = st.checkbox("Auto-refresh", value=False)
    with col2:
        refresh_interval = st.slider("Refresh interval (seconds)", min_value=5, max_value=60, value=10)
    with col3:
        if st.button("🔄 Refresh Now"):
            st.rerun()

    if auto_refresh:
        time.sleep(refresh_interval)
        st.rerun()

    # Add note about refresh
    st.markdown("""
    ---
    ℹ️ Metrics will auto-refresh based on the interval above, or click the refresh button for manual updates.
    """)