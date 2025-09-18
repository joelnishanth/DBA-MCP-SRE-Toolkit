FROM python:3.10-slim

WORKDIR /app
COPY ./bot_core/app /app

# Copy unified Claude client from the unified service directory
COPY ./unified_claude_service/unified_claude_client.py /app/

RUN pip install fastapi uvicorn httpx
RUN pip install boto3

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6000"]