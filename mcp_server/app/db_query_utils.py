import psycopg2
import mysql.connector
import sqlite3
import json

POSTGRES_CONFIG = {
    'host': 'postgres_db',
    'database': 'testdb',
    'user': 'postgres',
    'password': 'password'
}

MYSQL_CONFIG = {
    'host': 'mysql_db',
    'database': 'testdb',
    'user': 'root',
    'password': 'password'
}

def query_postgres(query):
    if not query or query.strip().lower() == 'null':
        return {"success": True, "data": [], "columns": [], "message": "No query provided"}
    
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        cur = conn.cursor()
        cur.execute(query)
        results = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        conn.close()
        return {"success": True, "data": results, "columns": columns}
    except Exception as e:
        return {"success": False, "error": str(e)}

def query_mysql(query):
    if not query or query.strip().lower() == 'null':
        return {"success": True, "data": [], "columns": [], "message": "No query provided"}
    
    try:
        # Add connection pooling config
        config = MYSQL_CONFIG.copy()
        config.update({
            'pool_name': 'mypool',
            'pool_size': 5,
            'pool_reset_session': True,
            'autocommit': True
        })
        
        conn = mysql.connector.connect(**config)
        cur = conn.cursor()
        cur.execute(query)
        results = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        conn.close()
        return {"success": True, "data": results, "columns": columns}
    except Exception as e:
        # Fallback to simple connection
        try:
            conn = mysql.connector.connect(**MYSQL_CONFIG)
            cur = conn.cursor()
            cur.execute(query)
            results = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            cur.close()
            conn.close()
            return {"success": True, "data": results, "columns": columns}
        except Exception as e2:
            return {"success": False, "error": str(e2)}

def query_sqlite(query):
    if not query or query.strip().lower() == 'null':
        return {"success": True, "data": [], "columns": [], "message": "No query provided"}
    
    try:
        # SQLite database is in the shared volume
        import os
        db_path = '/var/lib/sqlite/company.db'
        if not os.path.exists(db_path):
            db_path = '/tmp/company.db'  # Fallback
        
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute(query)
        results = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        conn.close()
        return {"success": True, "data": results, "columns": columns}
    except Exception as e:
        return {"success": False, "error": str(e)}

def execute_multi_db_query(postgres_query=None, mysql_query=None, sqlite_query=None):
    results = {}
    
    if postgres_query:
        results['postgres'] = query_postgres(postgres_query)
    
    if mysql_query:
        results['mysql'] = query_mysql(mysql_query)
    
    if sqlite_query:
        results['sqlite'] = query_sqlite(sqlite_query)
    
    return results