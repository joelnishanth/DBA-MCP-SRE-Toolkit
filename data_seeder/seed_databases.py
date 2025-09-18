import psycopg2
import mysql.connector
import sqlite3
import time
from faker import Faker
import random

fake = Faker()

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

def seed_postgres():
    conn = psycopg2.connect(**POSTGRES_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            email VARCHAR(100),
            department VARCHAR(50),
            salary INTEGER,
            hire_date DATE,
            manager_id INTEGER
        )
    """)
    
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Management']
    common_cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
    email_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'hotmail.com']
    
    for i in range(100):
        # 20% chance of being named John for cross-database testing
        first_name = 'John' if random.random() < 0.2 else fake.first_name()
        last_name = fake.last_name()
        
        # 40% chance of Gmail for cross-database testing
        if random.random() < 0.4:
            email = f"{first_name.lower()}.{last_name.lower()}@gmail.com"
        else:
            domain = random.choice(email_domains)
            email = f"{first_name.lower()}.{last_name.lower()}@{domain}"
        
        department = random.choice(departments)
        # Higher salaries for Management department
        if department == 'Management':
            salary = random.randint(90000, 180000)
        else:
            salary = random.randint(50000, 150000)
            
        cur.execute("""
            INSERT INTO employees (first_name, last_name, email, department, salary, hire_date, manager_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            first_name,
            last_name,
            email,
            department,
            salary,
            fake.date_between(start_date='-5y', end_date='today'),
            random.randint(1, 10) if i > 10 else None
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print("PostgreSQL seeded successfully")

def seed_mysql():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            email VARCHAR(100),
            phone VARCHAR(50),
            city VARCHAR(50),
            registration_date DATE
        )
    """)
    
    # Use same cities as employees for cross-database correlation
    common_cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
    email_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'personal.com', 'hotmail.com']
    
    for i in range(100):
        # 20% chance of being named John for cross-database testing
        first_name = 'John' if random.random() < 0.2 else fake.first_name()
        last_name = fake.last_name()
        
        # 35% chance of Gmail for cross-database testing
        if random.random() < 0.35:
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@gmail.com"
        else:
            domain = random.choice(email_domains)
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@{domain}"
        
        # 70% chance of using common cities for employee correlation
        city = random.choice(common_cities) if random.random() < 0.7 else fake.city()
            
        cur.execute("""
            INSERT INTO customers (first_name, last_name, email, phone, city, registration_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            first_name,
            last_name,
            email,
            fake.phone_number()[:20],  # Truncate phone number
            city,
            fake.date_between(start_date='-3y', end_date='today')
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print("MySQL seeded successfully")

def seed_sqlite():
    conn = sqlite3.connect('/tmp/company.db')
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            role TEXT,
            is_active INTEGER
        )
    """)
    
    roles = ['Admin', 'Manager', 'Employee', 'Contractor']
    email_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'system.com', 'hotmail.com']
    
    for i in range(100):
        # 20% chance of being named John for cross-database testing
        first_name = 'John' if random.random() < 0.2 else fake.first_name()
        last_name = fake.last_name()
        
        # 30% chance of Gmail for cross-database testing
        if random.random() < 0.3:
            email = f"{first_name.lower()}.{last_name.lower()}.{random.randint(10, 99)}@gmail.com"
        else:
            domain = random.choice(email_domains)
            email = f"{first_name.lower()}.{last_name.lower()}.{random.randint(10, 99)}@{domain}"
        
        role = random.choice(roles)
        # Admins and Managers are more likely to be active
        if role in ['Admin', 'Manager']:
            is_active = 1 if random.random() < 0.9 else 0
        else:
            is_active = random.choice([0, 1])
            
        cur.execute("""
            INSERT INTO users (username, first_name, last_name, email, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{first_name.lower()}.{last_name.lower()}",
            first_name,
            last_name,
            email,
            role,
            is_active
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print("SQLite seeded successfully")

if __name__ == "__main__":
    print("Waiting for databases to be ready...")
    time.sleep(45)
    
    # Seed PostgreSQL
    try:
        seed_postgres()
    except Exception as e:
        print(f"PostgreSQL seeding failed: {e}")
    
    # Seed MySQL with retry
    for attempt in range(3):
        try:
            seed_mysql()
            break
        except Exception as e:
            print(f"MySQL seeding attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(10)
    
    # Seed SQLite with retry
    for attempt in range(3):
        try:
            seed_sqlite()
            break
        except Exception as e:
            print(f"SQLite seeding attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(5)
    
    print("Database seeding completed!")