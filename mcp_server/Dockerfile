FROM python:3.10-slim

WORKDIR /app
COPY ./mcp_server/app /app

# Copy unified Claude client from the unified service directory
COPY ./unified_claude_service/unified_claude_client.py /app/

RUN pip install fastapi uvicorn docker psycopg2-binary mysql-connector-python httpx boto3

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]