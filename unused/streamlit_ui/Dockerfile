FROM python:3.10-slim

WORKDIR /app
COPY . /app

RUN pip install streamlit httpx humanize graphviz

CMD ["streamlit", "run", "app/app.py", "--server.port=8501", "--server.address=0.0.0.0"]