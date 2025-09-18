FROM python:3.10-slim

WORKDIR /client
COPY client /client

RUN pip install httpx asyncio

CMD ["python", "main.py"]