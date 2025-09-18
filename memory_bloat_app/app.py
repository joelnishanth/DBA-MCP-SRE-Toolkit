import psycopg2
import time

DB_CONFIG = {
    'host': 'postgres_db',
    'database': 'testdb',
    'user': 'postgres',
    'password': 'password'
}

def create_memory_bloat():
    while True:
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            
            print("Creating large result set...")
            cur.execute("""
                SELECT string_agg(md5(random()::text), '') as large_string
                FROM generate_series(1, 100000)
            """)
            result = cur.fetchall()
            
            print(f"Holding {len(str(result))} bytes in memory")
            
            cur.execute("""
                WITH RECURSIVE memory_hog AS (
                    SELECT 1 as n, repeat('x', 1000) as data
                    UNION ALL
                    SELECT n+1, data || repeat('y', 1000)
                    FROM memory_hog WHERE n < 1000
                )
                SELECT COUNT(*) FROM memory_hog
            """)
            cur.fetchall()
            
            time.sleep(30)
            cur.close()
            conn.close()
            
        except Exception as e:
            print(f"Memory bloat error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    print("Starting memory bloat app...")
    time.sleep(30)
    create_memory_bloat()