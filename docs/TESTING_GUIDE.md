# 🧪 NLP Database Query Testing Guide

## Prerequisites

1. **Start the System**
   ```bash
   cd /Users/ponukuma/PycharmProjects/SREBOT/sre-genai
   docker compose down
   docker compose up --build
   ```

2. **Wait for Services** (~60 seconds for database initialization)

## 🔍 Expected Results for Sample Queries:

### 1. "Find all employees in the Engineering department"
- **PostgreSQL**: Returns employees with department = 'Engineering'
- **MySQL/SQLite**: No relevant query (no department field)

### 2. "Show me customers from New York"
- **MySQL**: Returns customers with city LIKE '%New York%'
- **PostgreSQL/SQLite**: No relevant query (no city field)

### 3. "List all active admin users"
- **SQLite**: Returns users with role LIKE '%Admin%' AND is_active = 1
- **PostgreSQL/MySQL**: No relevant query (no role/active fields)

### 4. "Get employees with salary above 100000"
- **PostgreSQL**: Returns employees with salary > 100000
- **MySQL/SQLite**: No relevant query (no salary field)

### 5. "Find customers who registered in 2023"
- **MySQL**: Returns customers with registration_date >= '2023-01-01'
- **PostgreSQL/SQLite**: No relevant query (no registration_date field)

### 6. "Show me all managers and contractors"
- **SQLite**: Returns users with role IN ('Manager', 'Contractor')
- **PostgreSQL/MySQL**: No relevant query (no role field)

## 🚀 Testing Steps

1. Access: http://localhost:8501
2. Go to "NLP Database Query" page
3. Click demo query buttons
4. Verify results match expectations above

## 🐛 Troubleshooting

```bash
# Check service status
docker compose ps

# Check logs
docker logs data_seeder
docker logs bot_core
docker logs mcp_server

# Test database connections
docker exec -it postgres_db psql -U postgres -d testdb -c "SELECT COUNT(*) FROM employees;"
docker exec -it mysql_db mysql -u root -ppassword testdb -e "SELECT COUNT(*) FROM customers;"
```