import streamlit as st
import requests
import json
import pandas as pd
import time

st.set_page_config(
    page_title="Query Performance Analyzer",
    page_icon="⚡",
    layout="wide"
)

st.title("⚡ Query Performance Analyzer")
st.markdown("Analyze query performance across multiple databases with AI-powered recommendations")

# Performance test queries
performance_queries = {
    "Fast Queries": {
        "Simple Count": {
            "postgres": "SELECT COUNT(*) FROM employees",
            "mysql": "SELECT COUNT(*) FROM customers", 
            "sqlite": "SELECT COUNT(*) FROM users"
        },
        "Indexed Lookup": {
            "postgres": "SELECT * FROM employees WHERE id = 1",
            "mysql": "SELECT * FROM customers WHERE id = 1",
            "sqlite": "SELECT * FROM users WHERE id = 1"
        },
        "Simple Aggregation": {
            "postgres": "SELECT AVG(salary) FROM employees",
            "mysql": "SELECT COUNT(DISTINCT city) FROM customers",
            "sqlite": "SELECT COUNT(*) FROM users WHERE is_active = 1"
        }
    },
    "Medium Queries": {
        "Department Filter": {
            "postgres": "SELECT * FROM employees WHERE department = 'Engineering'",
            "mysql": None,
            "sqlite": None
        },
        "Date Range": {
            "postgres": "SELECT * FROM employees WHERE hire_date > '2020-01-01'",
            "mysql": "SELECT * FROM customers WHERE registration_date > '2020-01-01'",
            "sqlite": None
        },
        "Role-based Filter": {
            "postgres": "SELECT first_name, last_name, salary FROM employees WHERE salary BETWEEN 60000 AND 100000",
            "mysql": "SELECT first_name, last_name, city FROM customers WHERE city IN ('New York', 'Los Angeles', 'Chicago')",
            "sqlite": "SELECT username, email FROM users WHERE role IN ('Admin', 'Manager')"
        },
        "Grouped Analysis": {
            "postgres": "SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department",
            "mysql": "SELECT city, COUNT(*) FROM customers GROUP BY city HAVING COUNT(*) > 2",
            "sqlite": "SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY COUNT(*) DESC"
        }
    },
    "Slow Queries": {
        "Full Table Scan": {
            "postgres": "SELECT * FROM employees WHERE salary > 80000 ORDER BY hire_date",
            "mysql": "SELECT * FROM customers WHERE email LIKE '%gmail%'",
            "sqlite": "SELECT * FROM users WHERE email LIKE '%test%'"
        },
        "Complex Join": {
            "postgres": "SELECT e1.first_name, e2.first_name as manager FROM employees e1 LEFT JOIN employees e2 ON e1.manager_id = e2.id",
            "mysql": None,
            "sqlite": None
        },
        "String Pattern Search": {
            "postgres": "SELECT * FROM employees WHERE first_name LIKE '%John%' OR last_name LIKE '%Smith%'",
            "mysql": "SELECT * FROM customers WHERE first_name LIKE '%A%' AND last_name LIKE '%son'",
            "sqlite": "SELECT * FROM users WHERE username LIKE '%admin%' OR email LIKE '%test%'"
        }
    }
}

st.subheader("🎯 Performance Test Categories")

# Create tabs for different query categories
tab1, tab2, tab3 = st.tabs(["⚡ Fast Queries", "🔄 Medium Queries", "🐌 Slow Queries"])

def run_performance_test(queries, category_name):
    st.markdown(f"**{category_name} Performance Tests**")
    
    for query_name, query_set in queries.items():
        # Show the queries that will be executed
        with st.expander(f"📝 View Queries: {query_name}"):
            col1, col2, col3 = st.columns(3)
            with col1:
                st.markdown("**PostgreSQL:**")
                if query_set.get("postgres"):
                    st.code(query_set["postgres"], language="sql")
                else:
                    st.text("No query for this database")
            with col2:
                st.markdown("**MySQL:**")
                if query_set.get("mysql"):
                    st.code(query_set["mysql"], language="sql")
                else:
                    st.text("No query for this database")
            with col3:
                st.markdown("**SQLite:**")
                if query_set.get("sqlite"):
                    st.code(query_set["sqlite"], language="sql")
                else:
                    st.text("No query for this database")
        
        if st.button(f"🚀 Test: {query_name}", key=f"{category_name}_{query_name}"):
            with st.spinner(f"Analyzing {query_name} performance..."):
                try:
                    # Convert query format to match bot_core expectations
                    formatted_queries = {}
                    if query_set.get("postgres"):
                        formatted_queries["postgres_query"] = query_set["postgres"]
                    if query_set.get("mysql"):
                        formatted_queries["mysql_query"] = query_set["mysql"]
                    if query_set.get("sqlite"):
                        formatted_queries["sqlite_query"] = query_set["sqlite"]
                    
                    response = requests.post(
                        "http://bot_core:6000/analyze-performance",
                        json=formatted_queries,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        st.success(f"✅ {query_name} analysis completed!")
                        
                        # Show performance results
                        st.subheader("📊 Performance Metrics")
                        
                        perf_results = result.get("performance_results", {})
                        metrics_data = []
                        
                        for db_name, db_result in perf_results.items():
                            if db_result.get("success"):
                                metrics_data.append({
                                    "Database": db_name.upper(),
                                    "Execution Time (ms)": db_result.get("execution_time_ms", 0),
                                    "Rows Returned": db_result.get("rows_returned", 0),
                                    "Status": "✅ Success"
                                })
                            else:
                                metrics_data.append({
                                    "Database": db_name.upper(),
                                    "Execution Time (ms)": "N/A",
                                    "Rows Returned": "N/A", 
                                    "Status": f"❌ {db_result.get('error', 'Failed')}"
                                })
                        
                        if metrics_data:
                            df = pd.DataFrame(metrics_data)
                            st.dataframe(df, use_container_width=True)
                        else:
                            st.warning("No performance metrics available")
                        
                        # Show AI recommendations
                        ai_recs = result.get("ai_recommendations", {})
                        st.subheader("🤖 AI Performance Recommendations")
                        
                        if ai_recs and ai_recs.get("database_recommendations"):
                            overall = ai_recs.get("overall_assessment", "")
                            if overall:
                                st.info(f"**Overall Assessment:** {overall}")
                            
                            db_recs = ai_recs.get("database_recommendations", {})
                            if db_recs:
                                col1, col2, col3 = st.columns(3)
                                
                                with col1:
                                    if "postgres" in db_recs:
                                        pg_rec = db_recs["postgres"]
                                        st.markdown("**PostgreSQL**")
                                        st.markdown(f"Assessment: {pg_rec.get('assessment', 'N/A')}")
                                        for rec in pg_rec.get('recommendations', []):
                                            st.markdown(f"• {rec}")
                                
                                with col2:
                                    if "mysql" in db_recs:
                                        mysql_rec = db_recs["mysql"]
                                        st.markdown("**MySQL**")
                                        st.markdown(f"Assessment: {mysql_rec.get('assessment', 'N/A')}")
                                        for rec in mysql_rec.get('recommendations', []):
                                            st.markdown(f"• {rec}")
                                
                                with col3:
                                    if "sqlite" in db_recs:
                                        sqlite_rec = db_recs["sqlite"]
                                        st.markdown("**SQLite**")
                                        st.markdown(f"Assessment: {sqlite_rec.get('assessment', 'N/A')}")
                                        for rec in sqlite_rec.get('recommendations', []):
                                            st.markdown(f"• {rec}")
                        else:
                            st.warning("No AI recommendations available - check logs for details")
                        
                        # Show execution plans
                        with st.expander("🔍 Execution Plans"):
                            for db_name, db_result in perf_results.items():
                                if db_result.get("success") and db_result.get("execution_plan"):
                                    st.markdown(f"**{db_name.upper()} Execution Plan:**")
                                    st.json(db_result["execution_plan"])
                    
                    else:
                        st.error(f"Analysis failed: {response.status_code}")
                        
                except Exception as e:
                    st.error(f"Error: {str(e)}")

# Run tests in each tab
with tab1:
    run_performance_test(performance_queries["Fast Queries"], "Fast")

with tab2:
    run_performance_test(performance_queries["Medium Queries"], "Medium")

with tab3:
    run_performance_test(performance_queries["Slow Queries"], "Slow")

st.divider()

# Custom query performance testing
st.subheader("🔧 Custom Query Performance Test")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("**PostgreSQL Query**")
    pg_query = st.text_area("Enter PostgreSQL query:", height=100, key="pg_custom")

with col2:
    st.markdown("**MySQL Query**")
    mysql_query = st.text_area("Enter MySQL query:", height=100, key="mysql_custom")

with col3:
    st.markdown("**SQLite Query**")
    sqlite_query = st.text_area("Enter SQLite query:", height=100, key="sqlite_custom")

if st.button("🚀 Analyze Custom Queries", type="primary"):
    custom_queries = {}
    if pg_query.strip():
        custom_queries["postgres_query"] = pg_query.strip()
    if mysql_query.strip():
        custom_queries["mysql_query"] = mysql_query.strip()
    if sqlite_query.strip():
        custom_queries["sqlite_query"] = sqlite_query.strip()
    
    if custom_queries:
        with st.spinner("Analyzing custom query performance..."):
            try:
                response = requests.post(
                    "http://bot_core:6000/analyze-performance",
                    json=custom_queries,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    st.success("✅ Custom query analysis completed!")
                    
                    # Display results similar to above
                    perf_results = result.get("performance_results", {})
                    for db_name, db_result in perf_results.items():
                        if db_result.get("success"):
                            st.metric(
                                f"{db_name.upper()} Performance",
                                f"{db_result.get('execution_time_ms', 0)} ms",
                                f"{db_result.get('rows_returned', 0)} rows"
                            )
                        else:
                            st.error(f"{db_name.upper()}: {db_result.get('error', 'Failed')}")
                
            except Exception as e:
                st.error(f"Error: {str(e)}")
    else:
        st.warning("Please enter at least one query to analyze")