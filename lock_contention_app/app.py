import sqlite3
import threading
import time
import random

DB_PATH = '/tmp/test.db'

def setup_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY,
            balance INTEGER
        )
    ''')
    
    cursor.execute("SELECT COUNT(*) FROM accounts")
    if cursor.fetchone()[0] == 0:
        for i in range(10):
            cursor.execute("INSERT INTO accounts (balance) VALUES (?)", (1000,))
    
    conn.commit()
    conn.close()

def create_deadlock(thread_id):
    while True:
        try:
            conn = sqlite3.connect(DB_PATH, timeout=30)
            cursor = conn.cursor()
            
            account1 = random.randint(1, 5)
            account2 = random.randint(6, 10)
            
            print(f"Thread {thread_id}: Locking accounts {account1} and {account2}")
            
            cursor.execute("BEGIN EXCLUSIVE")
            cursor.execute("UPDATE accounts SET balance = balance - 10 WHERE id = ?", (account1,))
            
            time.sleep(random.uniform(1, 3))
            
            cursor.execute("UPDATE accounts SET balance = balance + 10 WHERE id = ?", (account2,))
            conn.commit()
            
            print(f"Thread {thread_id}: Transaction completed")
            conn.close()
            
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            print(f"Thread {thread_id} error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    print("Starting lock contention app...")
    setup_database()
    
    for i in range(4):
        thread = threading.Thread(target=create_deadlock, args=(i,))
        thread.daemon = True
        thread.start()
    
    while True:
        time.sleep(10)