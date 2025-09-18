import streamlit as st
import requests
import json
import pandas as pd

st.set_page_config(
    page_title="NLP Database Query",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Natural Language Database Query")
st.markdown("Query multiple databases using natural language powered by MCP and Claude AI")

# Demo queries
demo_queries = [
    "Find all employees in the Engineering department",
    "Show me customers from New York",
    "List all active admin users",
    "Get employees with salary above 100000",
    "Find customers who registered in 2023",
    "Show me all managers and contractors"
]

st.subheader("🎯 Demo Queries")
col1, col2, col3 = st.columns(3)

with col1:
    if st.button("👥 Engineering Employees"):
        st.session_state.query = demo_queries[0]
    if st.button("💰 High Salary Employees"):
        st.session_state.query = demo_queries[3]

with col2:
    if st.button("🏙️ NYC Customers"):
        st.session_state.query = demo_queries[1]
    if st.button("📅 2023 Customers"):
        st.session_state.query = demo_queries[4]

with col3:
    if st.button("👤 Active Admins"):
        st.session_state.query = demo_queries[2]
    if st.button("👔 Managers & Contractors"):
        st.session_state.query = demo_queries[5]

st.divider()

# Query input
st.subheader("💬 Ask Your Question")
user_query = st.text_input(
    "Enter your question in natural language:",
    value=st.session_state.get('query', ''),
    placeholder="e.g., Find all employees in the Sales department"
)

if st.button("🚀 Execute Query", type="primary"):
    if user_query:
        with st.spinner("Processing your query across multiple databases..."):
            try:
                response = requests.post(
                    "http://bot_core:6000/nlp-query",
                    json={"query": user_query},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    st.success("✅ Query executed successfully!")
                    
                    # Show explanation
                    st.subheader("🧠 AI Analysis")
                    st.info(result.get("explanation", "Query processed"))
                    
                    # Show generated queries
                    st.subheader("🔧 Generated SQL Queries")
                    queries = result.get("generated_queries", {})
                    
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.markdown("**PostgreSQL (Employees)**")
                        pg_query = queries.get("postgres_query")
                        if pg_query and pg_query.lower() != 'null':
                            st.code(pg_query, language="sql")
                        else:
                            st.text("No relevant query for this database")
                    
                    with col2:
                        st.markdown("**MySQL (Customers)**")
                        mysql_query = queries.get("mysql_query")
                        if mysql_query and mysql_query.lower() != 'null':
                            st.code(mysql_query, language="sql")
                        else:
                            st.text("No relevant query for this database")
                    
                    with col3:
                        st.markdown("**SQLite (Users)**")
                        sqlite_query = queries.get("sqlite_query")
                        if sqlite_query and sqlite_query.lower() != 'null':
                            st.code(sqlite_query, language="sql")
                        else:
                            st.text("No relevant query for this database")
                    
                    # Show results
                    st.subheader("📊 Query Results")
                    db_results = result.get("database_results", {})
                    
                    for db_name, db_result in db_results.items():
                        if db_result.get("success"):
                            st.markdown(f"**{db_name.upper()} Results:**")
                            data = db_result.get("data", [])
                            columns = db_result.get("columns", [])
                            
                            if data and columns:
                                df = pd.DataFrame(data, columns=columns)
                                st.dataframe(df, use_container_width=True)
                                st.caption(f"Found {len(data)} records")
                            else:
                                st.text("No data found")
                                if db_result.get("message"):
                                    st.caption(db_result["message"])
                        else:
                            st.error(f"**{db_name.upper()} Error:** {db_result.get('error', 'Unknown error')}")
                    
                else:
                    st.error(f"Query failed: {response.status_code}")
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")
    else:
        st.warning("Please enter a query")

st.divider()

# Database schema info
with st.expander("📋 Database Schemas"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**PostgreSQL - Employees**")
        st.text("""
        • id (Primary Key)
        • first_name
        • last_name  
        • email
        • department
        • salary
        • hire_date
        • manager_id
        """)
    
    with col2:
        st.markdown("**MySQL - Customers**")
        st.text("""
        • id (Primary Key)
        • first_name
        • last_name
        • email
        • phone
        • city
        • registration_date
        """)
    
    with col3:
        st.markdown("**SQLite - Users**")
        st.text("""
        • id (Primary Key)
        • username
        • first_name
        • last_name
        • email
        • role
        • is_active
        """)