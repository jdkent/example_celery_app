# Flask Library App

A Flask application with Celery for background tasks, PostgreSQL for storage, and Redis as a broker. Manages holders and books, including a library holder.

## Flask and Celery Entrypoints & App Structure

### Flask Initialization

The Flask app is created in [`app/__init__.py`](app/__init__.py:3) using a factory pattern:

```python
from flask import Flask

def create_app():
    app = Flask(__name__)
    # Register blueprints
    return app

app = create_app()
```

The `app` object is referenced as the main Flask application.

### Celery Initialization

Celery is initialized in [`app/celery.py`](app/celery.py:4):

```python
from celery import Celery
from app.config import Config

celery = Celery(
    "my_example_celery_app",
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
)
celery.conf.update(
    broker_url=Config.CELERY_BROKER_URL,
    result_backend=Config.CELERY_RESULT_BACKEND,
)
```

The `celery` object is referenced for background task processing.

### Docker Compose Entrypoints

- **Flask**:  
  Service: `web`  
  Entrypoint:  
  ```bash
  flask run --host=0.0.0.0 --reload
  ```

- **Celery**:  
  Service: `worker`  
  Entrypoint:  
  ```bash
  celery -A app.celery worker --loglevel=info --concurrency=1
  ```

### Required Environment Variables

Both services use the following variables (see [`.env`](.env:1)):

- `FLASK_APP`, `FLASK_ENV`, `SECRET_KEY`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`

### Running with Docker Compose

Build and start all services (Flask, Celery worker, PostgreSQL, Redis):

```bash
docker-compose up --build
```

To run only the Flask app or Celery worker:

```bash
docker-compose run --rm web
docker-compose run --rm worker
```
## Setup

### Prerequisites

- Docker & Docker Compose

### Clone the Repository

```bash
git clone <repo-url>
cd my_example_celery_app
```

### Environment Variables

Edit `.env` as needed:

- `FLASK_APP`, `FLASK_ENV`, `SECRET_KEY`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`

### Build and Start Services

```bash
docker-compose up --build
```

- Flask app: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Database Initialization

The app uses SQLAlchemy. **All database configuration and session creation should be imported from [`app/config.py`](app/config.py)**, which is the single source of truth for database connectivity.

To initialize the database tables:

1. Enter the web container:

    ```bash
    docker-compose exec web bash
    ```

2. Run Python shell:

    ```bash
    python
    ```

3. Initialize tables:

    ```python
    from app.models import Base
    from app.config import Config  # Use Config for engine

    Base.metadata.create_all(Config.engine)
    ```

Alternatively, run the sample data script (see below).

## Populating Sample Data

After initializing the database, populate it with example holders and books:

```bash
docker-compose exec web python app/sample_data.py
```

## Running Flask and Celery

- Flask server: started automatically by Docker Compose.
- Celery worker: started automatically by Docker Compose.

## API Usage

### Holders

- `GET /holders` — List holders
- `POST /holders` — Create holder
- `GET /holders/<id>` — Get holder by ID

### Books

- `GET /books` — List books
- `POST /books` — Create book
- `GET /books/<id>` — Get book by ID

### Tasks

- `POST /checkout` — Checkout a book (Celery task)
- `POST /return` — Return a book (Celery task)

## Testing

Run tests inside the web container:

```bash
docker-compose exec web pytest
```

## Notes

- All database configuration and session creation should be imported from [`app/config.py`](app/config.py). Do not initialize `DATABASE_URL`, `engine`, or `Session` locally—always import them from `app.config`.
- The library itself is represented as a Holder with the name "Library".
- See `app/sample_data.py` for example data population.

## Running Tests with PostgreSQL

1. Ensure Docker and Docker Compose are running.
2. Create the test database (only once):

   ```sh
   docker compose exec db psql -U myuser -d mydb -c "CREATE DATABASE test_mydb OWNER myuser ENCODING 'UTF8';"
   ```

3. Run tests using Docker Compose:

   ```sh
   docker compose run web pytest
   ```

Tests will use the `test_mydb` PostgreSQL database, matching production configuration. No in-memory databases are used.
