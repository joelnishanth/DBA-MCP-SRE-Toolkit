import psycopg2
import time
import random

DB_CONFIG = {
    'host': 'postgres_db',
    'database': 'testdb',
    'user': 'postgres',
    'password': 'password'
}

def create_test_data():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS large_table (
            id SERIAL PRIMARY KEY,
            data TEXT,
            number INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    
    cur.execute("SELECT COUNT(*) FROM large_table")
    if cur.fetchone()[0] == 0:
        for i in range(10000):
            cur.execute("INSERT INTO large_table (data, number) VALUES (%s, %s)", 
                       (f"test_data_{i}", random.randint(1, 1000)))
    
    conn.commit()
    cur.close()
    conn.close()

def run_slow_queries():
    while True:
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            
            print("Running slow query without index...")
            cur.execute("SELECT * FROM large_table WHERE data LIKE '%500%' ORDER BY created_at")
            cur.fetchall()
            
            print("Running cartesian product query...")
            cur.execute("""
                SELECT l1.id, l2.id FROM large_table l1, large_table l2 
                WHERE l1.number = l2.number LIMIT 100
            """)
            cur.fetchall()
            
            cur.close()
            conn.close()
            time.sleep(10)
            
        except Exception as e:
            print(f"Database error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    print("Starting slow query app...")
    time.sleep(30)
    create_test_data()
    run_slow_queries()