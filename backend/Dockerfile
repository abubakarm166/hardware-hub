# Railway / any Docker host — build context should be the `backend/` folder
FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x deploy_start.sh

EXPOSE 8000

# Migrations, optional admin bootstrap & seed, then Gunicorn. Railway sets PORT.
CMD ["sh", "deploy_start.sh"]
