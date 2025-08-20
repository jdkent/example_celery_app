# syntax=docker/dockerfile:1

FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml /app/

RUN pip install --no-cache-dir .

COPY . .

RUN pip install --no-cache-dir -e .
ENV PYTHONUNBUFFERED=1


CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
