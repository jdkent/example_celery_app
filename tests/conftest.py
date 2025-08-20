import pytest
import os
from app.config import TestConfig
from app import create_app
from app.models import db


@pytest.fixture
def client(request):
    app = create_app(TestConfig)
    app.config['TESTING'] = True
    from app.models import db
    from sqlalchemy import text
    # Ensure Celery tasks run synchronously during tests
    from app.celery import celery
    celery.conf.task_always_eager = True
    # Force test DB URI
    app.config['SQLALCHEMY_DATABASE_URI'] = TestConfig.TEST_DATABASE_URL
    print("client fixture DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    with app.app_context():
        db.session.remove()
        db.session.close()
    with TestConfig().engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
    with app.app_context():
        db.create_all()
        db.session.remove()
        # Explicitly clear all tables after create_all (extra safety)
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
        # Optionally seed sample data only for non-model tests
        module_name = getattr(request, "node", None)
        if module_name and getattr(module_name, "module", None):
            if module_name.module.__name__ != "tests.test_models":
                try:
                    from app.sample_data import load_sample_data
                    load_sample_data(db.session)
                except ImportError:
                    pass
        yield app.test_client()
        # Teardown: close all sessions inside app context
        with app.app_context():
            db.session.remove()
            db.session.close()
        # Dispose engine outside app context
        TestConfig().engine.dispose()
        print("client fixture teardown complete, engine disposed.")

@pytest.fixture(scope="function")
def db_session(request):
    # Ensure a clean DB for every test
    app = create_app(TestConfig)
    from app.models import db
    from sqlalchemy import text
    module_name = request.node.module.__name__
    print("db_session module:", module_name)
    # Force test DB URI
    app.config['SQLALCHEMY_DATABASE_URI'] = TestConfig.TEST_DATABASE_URL
    print("db_session fixture DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    with app.app_context():
        db.session.remove()
        db.session.close()
    # Always drop/recreate schema before test
    with TestConfig().engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
    with app.app_context():
        db.create_all()
        # Explicitly clear all tables after create_all (extra safety)
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
    session = TestConfig().Session()
    # Seed sample data for non-model tests
    if module_name != "tests.test_models":
        try:
            from app.sample_data import load_sample_data
            load_sample_data(session)
        except ImportError:
            pass
    yield session
    # Teardown: rollback, close session, remove Flask-SQLAlchemy session inside app context, dispose engine
    session.rollback()
    session.close()
    with app.app_context():
        db.session.remove()
        db.session.close()
    TestConfig().engine.dispose()
    print("db_session fixture teardown complete, engine disposed.")
@pytest.fixture(scope="session")
def app_context():
    app = create_app()
    ctx = app.app_context()
    ctx.push()
    yield
    ctx.pop()

@pytest.fixture
def celery_eager(monkeypatch):
    # Force Celery to run tasks eagerly for testing
    monkeypatch.setenv("CELERY_TASK_ALWAYS_EAGER", "True")
    monkeypatch.setenv("CELERY_TASK_EAGER_PROPAGATES", "True")
    yield
