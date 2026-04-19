# Use python slim image
FROM python:3.11-slim

# Install system dependencies including chromium for Selenium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Set PYTHONPATH so absolute imports like 'shared.database' work
ENV PYTHONPATH=/app

# Expose ports
EXPOSE 8000 8001

# Command is typically overridden in docker-compose.yml
CMD ["uvicorn", "backend_web.main:app", "--host", "0.0.0.0", "--port", "8000"]
