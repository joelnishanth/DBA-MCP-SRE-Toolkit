FROM python:3.9-slim
WORKDIR /app
RUN pip install psycopg2-binary mysql-connector-python faker
COPY seed_databases.py .
CMD ["python", "seed_databases.py"]