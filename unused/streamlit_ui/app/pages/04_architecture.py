import streamlit as st
import graphviz

st.set_page_config(
    page_title="DBA GenAI Architecture",
    page_icon="🏗️",
    layout="wide"
)

st.title("🏗️ DBA GenAI Architecture")
st.markdown("**Interactive architecture overview of the AI-powered database management system**")

# Create tabs for different views
tab_overview, tab_data_flow, tab_components = st.tabs([
    "🎯 System Overview", "🔄 Data Flow", "🔧 Components"
])

with tab_overview:
    st.markdown("""
    **DBA GenAI System Architecture** - AI-powered database management across multiple platforms
    """)

    # Create main architecture diagram
    graph = graphviz.Digraph()
    graph.attr(rankdir='TB', bgcolor='white')
    graph.attr('node', shape='box', style='rounded,filled')

    # User Interface Layer
    with graph.subgraph(name='cluster_ui') as ui:
        ui.attr(label='🖥️ User Interface Layer', style='filled', color='lightblue')
        ui.node('streamlit', 'Streamlit UI\n📊 Metrics | 🔍 NLP Query\n⚡ Performance | 🧠 AI Chat', fillcolor='lightcyan')

    # AI & Processing Layer  
    with graph.subgraph(name='cluster_ai') as ai:
        ai.attr(label='🤖 AI & Processing Layer', style='filled', color='lightgreen')
        ai.node('bot_core', 'Bot Core\n🧠 Claude AI\n📝 NLP Processing\n⚡ Performance Analysis', fillcolor='lightgreen')
        ai.node('mcp_server', 'MCP Server\n🔗 API Gateway\n📊 Metrics Collection\n🗄️ Query Execution', fillcolor='lightgreen')

    # Database Layer
    with graph.subgraph(name='cluster_db') as db:
        db.attr(label='🗄️ Database Layer', style='filled', color='lightyellow')
        db.node('postgres', 'PostgreSQL\n👥 Employees\n💼 HR Data', fillcolor='lightyellow')
        db.node('mysql', 'MySQL\n🛒 Customers\n📦 Orders', fillcolor='lightyellow')
        db.node('sqlite', 'SQLite\n👤 Users\n📋 Audit Logs', fillcolor='lightyellow')

    # Problem Simulation Layer
    with graph.subgraph(name='cluster_problems') as prob:
        prob.attr(label='⚠️ Database Problem Simulators', style='filled', color='lightcoral')
        prob.node('slow_query', 'Slow Query App\n🐌 Expensive Queries', fillcolor='lightcoral')
        prob.node('conn_leak', 'Connection Leak\n🔗 Unclosed Connections', fillcolor='lightcoral')
        prob.node('lock_contention', 'Lock Contention\n🔒 Deadlocks', fillcolor='lightcoral')
        prob.node('memory_bloat', 'Memory Bloat\n💾 Buffer Issues', fillcolor='lightcoral')

    # Add connections
    graph.edge('streamlit', 'bot_core', label='AI Requests')
    graph.edge('streamlit', 'mcp_server', label='API Calls')
    graph.edge('bot_core', 'mcp_server', label='Query Analysis')
    graph.edge('mcp_server', 'postgres', label='SQL Queries')
    graph.edge('mcp_server', 'mysql', label='SQL Queries')
    graph.edge('mcp_server', 'sqlite', label='SQL Queries')
    graph.edge('slow_query', 'postgres', label='Load')
    graph.edge('conn_leak', 'mysql', label='Load')
    graph.edge('lock_contention', 'sqlite', label='Load')
    graph.edge('memory_bloat', 'postgres', label='Load')

    st.graphviz_chart(graph)
    
    st.divider()
    
    # Interactive component explorer
    st.subheader("🔍 Interactive Component Explorer")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        component = st.selectbox(
            "Select a component:",
            ["Streamlit UI", "Bot Core (AI Engine)", "MCP Server", "PostgreSQL", "MySQL", "SQLite", "Problem Simulators"]
        )
    
    with col2:
        component_details = {
            "Streamlit UI": {
                "icon": "🖥️",
                "description": "Multi-page web interface for database management",
                "features": [
                    "📊 Real-time container metrics",
                    "🔍 Natural language database queries", 
                    "⚡ Query performance analysis",
                    "🧠 AI-powered diagnostics",
                    "📄 Log analysis and monitoring"
                ]
            },
            "Bot Core (AI Engine)": {
                "icon": "🤖",
                "description": "Claude AI-powered analysis engine via AWS Bedrock",
                "features": [
                    "🧠 Natural language query processing",
                    "⚡ Performance optimization recommendations",
                    "🔍 Intelligent diagnostics",
                    "📊 Query execution plan analysis",
                    "💡 Database tuning suggestions"
                ]
            },
            "MCP Server": {
                "icon": "🔗",
                "description": "Model Context Protocol server - central coordination hub",
                "features": [
                    "🌐 RESTful API gateway",
                    "🗄️ Multi-database query execution",
                    "📊 Performance metrics collection",
                    "🔄 Real-time data processing",
                    "🛡️ Security and authentication"
                ]
            },
            "PostgreSQL": {
                "icon": "🐘",
                "description": "Advanced relational database for complex queries",
                "features": [
                    "👥 Employee management data",
                    "💼 HR and payroll information",
                    "📈 Advanced analytics support",
                    "🔍 Full-text search capabilities",
                    "⚡ Query optimization testing"
                ]
            },
            "MySQL": {
                "icon": "🐬",
                "description": "Popular relational database for web applications",
                "features": [
                    "🛒 Customer data management",
                    "📦 Order processing system",
                    "🔗 Connection pooling testing",
                    "📊 E-commerce analytics",
                    "⚡ Performance benchmarking"
                ]
            },
            "SQLite": {
                "icon": "🗃️",
                "description": "Lightweight embedded database for local data",
                "features": [
                    "👤 User authentication data",
                    "📋 Audit logs and tracking",
                    "🔒 Lock contention testing",
                    "📱 Mobile-friendly operations",
                    "⚡ Lightweight query testing"
                ]
            },
            "Problem Simulators": {
                "icon": "⚠️",
                "description": "Database problem simulation for testing and learning",
                "features": [
                    "🐌 Slow query generation",
                    "🔗 Connection leak simulation",
                    "🔒 Deadlock and contention creation",
                    "💾 Memory bloat scenarios",
                    "📊 Performance bottleneck testing"
                ]
            }
        }
        
        details = component_details[component]
        st.markdown(f"### {details['icon']} {component}")
        st.markdown(f"**{details['description']}**")
        st.markdown("**Key Features:**")
        for feature in details['features']:
            st.markdown(f"- {feature}")

with tab_data_flow:
    st.markdown("## 🔄 Data Flow & Processing")
    
    # Create flow selection
    flow_type = st.selectbox(
        "Select data flow to visualize:",
        ["NLP Query Flow", "Performance Analysis Flow", "Container Monitoring Flow"]
    )
    
    if flow_type == "NLP Query Flow":
        st.markdown("**Natural Language to SQL Query Processing**")
        
        flow = graphviz.Digraph()
        flow.attr(rankdir='LR', bgcolor='white')
        flow.attr('node', shape='box', style='rounded,filled')
        
        flow.node('user', '👤 User\nNatural Language\nQuery', fillcolor='lightblue')
        flow.node('ui', '🖥️ Streamlit UI\nQuery Interface', fillcolor='lightcyan')
        flow.node('bot', '🤖 Bot Core\nClaude AI\nNLP Processing', fillcolor='lightgreen')
        flow.node('mcp', '🔗 MCP Server\nSQL Generation\n& Execution', fillcolor='lightyellow')
        flow.node('dbs', '🗄️ Databases\nPostgreSQL\nMySQL\nSQLite', fillcolor='lightcoral')
        
        flow.edge('user', 'ui', label='"Find engineers\nin Sales dept"')
        flow.edge('ui', 'bot', label='NLP Request')
        flow.edge('bot', 'mcp', label='Generated SQL')
        flow.edge('mcp', 'dbs', label='Execute Queries')
        flow.edge('dbs', 'mcp', label='Results')
        flow.edge('mcp', 'ui', label='Formatted Data')
        flow.edge('ui', 'user', label='Visual Results')
        
        st.graphviz_chart(flow)
        
    elif flow_type == "Performance Analysis Flow":
        st.markdown("**Query Performance Analysis & Optimization**")
        
        flow = graphviz.Digraph()
        flow.attr(rankdir='LR', bgcolor='white')
        flow.attr('node', shape='box', style='rounded,filled')
        
        flow.node('query', '📝 SQL Query\nInput', fillcolor='lightblue')
        flow.node('mcp', '🔗 MCP Server\nExecution &\nMetrics', fillcolor='lightyellow')
        flow.node('db', '🗄️ Database\nQuery Execution\nPlan Analysis', fillcolor='lightcoral')
        flow.node('ai', '🤖 Claude AI\nPerformance\nAnalysis', fillcolor='lightgreen')
        flow.node('result', '📊 Results\nMetrics +\nRecommendations', fillcolor='lightcyan')
        
        flow.edge('query', 'mcp', label='Query + Config')
        flow.edge('mcp', 'db', label='Execute & Profile')
        flow.edge('db', 'mcp', label='Metrics + Plan')
        flow.edge('mcp', 'ai', label='Performance Data')
        flow.edge('ai', 'result', label='AI Insights')
        
        st.graphviz_chart(flow)
        
    else:  # Container Monitoring Flow
        st.markdown("**Database Container Health Monitoring**")
        
        flow = graphviz.Digraph()
        flow.attr(rankdir='TB', bgcolor='white')
        flow.attr('node', shape='box', style='rounded,filled')
        
        flow.node('containers', '🐳 Database\nContainers\n(PG, MySQL, SQLite)', fillcolor='lightcoral')
        flow.node('docker', '🔧 Docker Engine\nStats API', fillcolor='lightgray')
        flow.node('mcp', '🔗 MCP Server\nMetrics Collection', fillcolor='lightyellow')
        flow.node('ui', '🖥️ Streamlit UI\nReal-time Dashboard', fillcolor='lightcyan')
        flow.node('ai', '🤖 AI Diagnostics\nHealth Analysis', fillcolor='lightgreen')
        
        flow.edge('containers', 'docker', label='Resource Usage')
        flow.edge('docker', 'mcp', label='Container Stats')
        flow.edge('mcp', 'ui', label='Live Metrics')
        flow.edge('mcp', 'ai', label='Health Data')
        flow.edge('ai', 'ui', label='Diagnostics')
        
        st.graphviz_chart(flow)

with tab_components:
    st.markdown("## 🔧 Component Deep Dive")
    
    # Component selection with categories
    component_category = st.selectbox(
        "Select component category:",
        ["Core Services", "Database Layer", "AI & Processing", "Problem Simulation"]
    )
    
    if component_category == "Core Services":
        st.markdown("### 🖥️ Streamlit UI Components")
        
        ui_components = {
            "📊 Container Metrics": "Real-time database container monitoring with health status, CPU usage, and memory consumption in table format",
            "🔍 NLP Database Query": "Natural language interface for querying across PostgreSQL, MySQL, and SQLite databases simultaneously",
            "⚡ Query Performance Analyzer": "AI-powered query performance testing with execution time analysis and optimization recommendations",
            "🧠 AI Diagnostics": "Intelligent troubleshooting for database container issues with Claude AI recommendations",
            "📄 Container Logs": "Real-time log viewing and analysis for database containers with filtering capabilities"
        }
        
        for component, description in ui_components.items():
            with st.expander(component):
                st.markdown(description)
                
    elif component_category == "Database Layer":
        st.markdown("### 🗄️ Database Infrastructure")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("**🐘 PostgreSQL**")
            st.markdown("""
            - **Purpose**: Advanced analytics & HR data
            - **Schema**: Employees table with departments, salaries, hire dates
            - **Use Cases**: Complex queries, joins, aggregations
            - **Problem Simulation**: Slow queries, memory bloat
            """)
            
        with col2:
            st.markdown("**🐬 MySQL**")
            st.markdown("""
            - **Purpose**: E-commerce & customer data
            - **Schema**: Customers table with orders, locations
            - **Use Cases**: Web applications, OLTP workloads
            - **Problem Simulation**: Connection leaks
            """)
            
        with col3:
            st.markdown("**🗃️ SQLite**")
            st.markdown("""
            - **Purpose**: User management & audit logs
            - **Schema**: Users table with roles, activity tracking
            - **Use Cases**: Lightweight operations, embedded scenarios
            - **Problem Simulation**: Lock contention, deadlocks
            """)
            
    elif component_category == "AI & Processing":
        st.markdown("### 🤖 AI & Processing Pipeline")
        
        ai_flow = graphviz.Digraph()
        ai_flow.attr(rankdir='LR', bgcolor='white')
        ai_flow.attr('node', shape='box', style='rounded,filled')
        
        ai_flow.node('input', '📝 User Input\n(NLP Query)', fillcolor='lightblue')
        ai_flow.node('nlp', '🧠 NLP Processing\n(Claude AI)', fillcolor='lightgreen')
        ai_flow.node('sql', '🔧 SQL Generation\n(Multi-DB)', fillcolor='lightyellow')
        ai_flow.node('exec', '⚡ Query Execution\n(Performance Analysis)', fillcolor='lightcoral')
        ai_flow.node('ai_analysis', '📊 AI Analysis\n(Optimization)', fillcolor='lightcyan')
        ai_flow.node('output', '📋 Results\n(Data + Recommendations)', fillcolor='lightpink')
        
        ai_flow.edge('input', 'nlp')
        ai_flow.edge('nlp', 'sql')
        ai_flow.edge('sql', 'exec')
        ai_flow.edge('exec', 'ai_analysis')
        ai_flow.edge('ai_analysis', 'output')
        
        st.graphviz_chart(ai_flow)
        
        st.markdown("""
        **AI Processing Capabilities:**
        - 🧠 **Natural Language Understanding**: Convert English queries to SQL
        - ⚡ **Performance Analysis**: Execution time measurement and optimization
        - 🔍 **Query Optimization**: AI-powered recommendations for better performance
        - 📊 **Multi-Database Intelligence**: Cross-platform query generation
        - 💡 **Proactive Suggestions**: Index recommendations and query rewrites
        """)
        
    else:  # Problem Simulation
        st.markdown("### ⚠️ Database Problem Simulators")
        
        problems = {
            "🐌 Slow Query App": {
                "target": "PostgreSQL",
                "issues": ["Cartesian product queries", "Full table scans without indexes", "Complex joins on large datasets"],
                "purpose": "Demonstrate query optimization techniques"
            },
            "🔗 Connection Leak App": {
                "target": "MySQL", 
                "issues": ["Unclosed database connections", "Connection pool exhaustion", "Resource starvation"],
                "purpose": "Test connection management and pooling"
            },
            "🔒 Lock Contention App": {
                "target": "SQLite",
                "issues": ["Deadlock scenarios", "Long-running transactions", "Blocking queries"],
                "purpose": "Simulate concurrency issues and locking problems"
            },
            "💾 Memory Bloat App": {
                "target": "PostgreSQL",
                "issues": ["Large result sets", "Buffer pool pressure", "Memory-intensive operations"],
                "purpose": "Test memory management and optimization"
            }
        }
        
        for app_name, details in problems.items():
            with st.expander(app_name):
                st.markdown(f"**Target Database**: {details['target']}")
                st.markdown(f"**Purpose**: {details['purpose']}")
                st.markdown("**Simulated Issues**:")
                for issue in details['issues']:
                    st.markdown(f"- {issue}")
    
    st.divider()
    
    # Technology stack
    st.subheader("🛠️ Technology Stack")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        **Frontend**
        - 🖥️ Streamlit
        - 📊 Pandas
        - 📈 Plotly
        - 🎨 CSS/HTML
        """)
        
    with col2:
        st.markdown("""
        **AI & ML**
        - 🤖 Claude AI (Bedrock)
        - 🧠 Natural Language Processing
        - 📝 Prompt Engineering
        - ⚡ Performance Analysis
        """)
        
    with col3:
        st.markdown("""
        **Backend**
        - 🔗 FastAPI
        - 🌐 Model Context Protocol
        - 🐳 Docker
        - 🔄 Async Processing
        """)
        
    with col4:
        st.markdown("""
        **Databases**
        - 🐘 PostgreSQL 15
        - 🐬 MySQL 8.0
        - 🗃️ SQLite
        - 📊 Multi-DB Queries
        """)

# System benefits
st.divider()
st.subheader("🎯 System Benefits")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    **For DBAs:**
    - 🔍 Natural language database queries
    - ⚡ AI-powered performance optimization
    - 📊 Multi-database monitoring
    - 🧠 Intelligent troubleshooting
    - 📈 Proactive issue detection
    """)
    
with col2:
    st.markdown("""
    **For Organizations:**
    - 🚀 Faster problem resolution
    - 💡 AI-driven insights
    - 🔄 Automated monitoring
    - 📋 Comprehensive reporting
    - 🛡️ Proactive maintenance
    """)

st.markdown("### 🔗 Quick Links")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("📊 View Container Metrics"):
        st.switch_page("pages/01_container_metrics.py")
        
with col2:
    if st.button("🔍 Try NLP Queries"):
        st.switch_page("pages/05_nlp_database_query.py")
        
with col3:
    if st.button("⚡ Analyze Performance"):
        st.switch_page("pages/06_query_performance.py")