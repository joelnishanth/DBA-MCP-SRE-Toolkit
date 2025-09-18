import streamlit as st

st.set_page_config(
    page_title="SRE GenAI Home",
    page_icon="🔧",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.sidebar.header("🗄️ DBA GenAI Assistant")
st.sidebar.markdown("**Powered by Claude AI & MCP**")
st.sidebar.markdown("Navigate between database tools using the sidebar.")
st.sidebar.divider()
st.sidebar.markdown("""
**🎯 Supported Databases:**
- 🐘 PostgreSQL
- 🐬 MySQL  
- 🗃️ SQLite

**🤖 AI Features:**
- Natural Language Queries
- Performance Optimization
- Intelligent Diagnostics
- Query Recommendations
""")

st.title("🗄️ Welcome to the DBA GenAI Assistant")
st.markdown("""
This intelligent assistant is powered by **Claude AI (via AWS Bedrock)** and **Model Context Protocol (MCP)** to help DBAs manage, analyze, and optimize database systems across multiple platforms.

### 🎯 Key Features:
- **Multi-Database Support**: PostgreSQL, MySQL, SQLite
- **AI-Powered Analysis**: Claude AI provides intelligent recommendations
- **Real-time Performance Monitoring**: Live database metrics and diagnostics
- **Natural Language Queries**: Ask questions in plain English
- **Performance Optimization**: AI-driven query tuning suggestions

### 🔧 Available Tools:
""")

col1, col2 = st.columns(2)

with col1:
    st.markdown("#### 📊 Container Metrics")
    st.markdown("Monitor database container performance and health")
    st.page_link("pages/01_container_metrics.py", label="📈 Open Metrics Dashboard")

    st.markdown("#### 🧠 AI Diagnostics")
    st.markdown("AI-powered database container diagnostics and troubleshooting")
    st.page_link("pages/02_diagnostics.py", label="🔍 Open Diagnostics")

    st.markdown("#### 🔍 NLP Database Query")
    st.markdown("Query multiple databases using natural language powered by AI")
    st.page_link("pages/05_nlp_database_query.py", label="💬 Open NLP Query")

with col2:
    st.markdown("#### 📄 Container Logs")
    st.markdown("View and analyze database container logs in real-time")
    st.page_link("pages/03_logs.py", label="📋 Open Logs Viewer")

    st.markdown("#### ⚡ Query Performance Analyzer")
    st.markdown("Analyze query performance with AI-powered optimization recommendations")
    st.page_link("pages/06_query_performance.py", label="🚀 Open Performance Analyzer")

    st.markdown("#### 🏗️ Project Architecture")
    st.markdown("Explore the MCP-based system architecture")
    st.page_link("pages/04_architecture.py", label="🔧 View Architecture")

st.divider()

# Feature highlights
st.subheader("✨ Feature Highlights")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    **🤖 AI-Powered**
    - Claude AI integration
    - Intelligent recommendations
    - Natural language processing
    - Automated diagnostics
    """)

with col2:
    st.markdown("""
    **🗄️ Multi-Database**
    - PostgreSQL support
    - MySQL compatibility
    - SQLite integration
    - Cross-database queries
    """)

with col3:
    st.markdown("""
    **📈 Performance Focus**
    - Query optimization
    - Execution plan analysis
    - Performance metrics
    - Bottleneck identification
    """)

st.divider()

st.subheader("🚀 Quick Start")
st.markdown("""
1. **📊 Monitor**: Check database container health and metrics
2. **💬 Query**: Use natural language to query across databases
3. **⚡ Analyze**: Run performance tests and get AI recommendations
4. **🔍 Diagnose**: Troubleshoot issues with AI-powered diagnostics

**Perfect for**: DBAs, DevOps Engineers, Database Developers, and SRE Teams
""")