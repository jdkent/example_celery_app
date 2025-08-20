import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configuration classes provide engine and Session access
DB_USER = os.environ.get("POSTGRES_USER", "myuser")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "mypassword")
DB_NAME = os.environ.get("POSTGRES_DB", "mydb")
DB_HOST = os.environ.get("POSTGRES_HOST", "db")
DB_PORT = os.environ.get("POSTGRES_PORT", "5432")

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

class Config:
    DATABASE_URL = DATABASE_URL
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")

    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)

    CELERY_BROKER_URL = os.environ.get(
        "CELERY_BROKER_URL",
        "redis://redis:6379/0"
    )
    CELERY_RESULT_BACKEND = os.environ.get(
        "CELERY_RESULT_BACKEND",
        "redis://redis:6379/0"
    )

class TestConfig:
    TEST_DB_USER = os.environ.get("POSTGRES_USER", "myuser")
    TEST_DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "mypassword")
    TEST_DB_NAME = os.environ.get("TEST_POSTGRES_DB", "test_mydb")
    TEST_DB_HOST = os.environ.get("POSTGRES_HOST", "db")
    TEST_DB_PORT = os.environ.get("POSTGRES_PORT", "5432")
    TEST_DATABASE_URL = (
        f"postgresql://{TEST_DB_USER}:{TEST_DB_PASSWORD}@{TEST_DB_HOST}:{TEST_DB_PORT}/{TEST_DB_NAME}"
    )
    SQLALCHEMY_DATABASE_URI = TEST_DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")

    @property
    def engine(self):
        # Always create a new engine using the current test DB URI
        print("Engine created with URI:", self.TEST_DATABASE_URL)
        return create_engine(self.TEST_DATABASE_URL)

    @property
    def Session(self):
        return sessionmaker(bind=self.engine)

    CELERY_BROKER_URL = os.environ.get(
        "CELERY_BROKER_URL",
        "redis://redis:6379/0"
    )
    CELERY_RESULT_BACKEND = os.environ.get(
        "CELERY_RESULT_BACKEND",
        "redis://redis:6379/0"
    )
