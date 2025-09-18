import mysql.connector
import time

DB_CONFIG = {
    'host': 'mysql_db',
    'database': 'testdb',
    'user': 'root',
    'password': 'password'
}

connections = []

def leak_connections():
    while True:
        try:
            print(f"Opening connection #{len(connections) + 1}")
            conn = mysql.connector.connect(**DB_CONFIG)
            connections.append(conn)
            
            # Simulate work without closing connection
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchall()
            
            print(f"Total open connections: {len(connections)}")
            time.sleep(5)
            
        except Exception as e:
            print(f"Connection error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    print("Starting connection leak app...")
    time.sleep(30)
    leak_connections()