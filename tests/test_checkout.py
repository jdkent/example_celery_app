import pytest
from app.tasks.checkout import checkout_book
import app.tasks.checkout
from app.models import Book, Holder
import json
import pytest
from app.celery import celery


@pytest.fixture(autouse=True)
def patch_checkout_db(monkeypatch, db_session):
    from app.tasks import checkout as checkout_module
    monkeypatch.setattr(checkout_module, "Session", lambda: db_session)
    yield

def test_checkout_book_endpoint_integration(client, db_session, patch_checkout_db):
    # Ensure required book and holder exist in Flask app context
    from app.models import db, Holder, Book
    with client.application.app_context():
        alice = Holder.query.filter_by(name="Alice").first()
        if not alice:
            alice = Holder(name="Alice")
            db.session.add(alice)
            db.session.commit()
        book = Book.query.filter_by(title="Book 1").first()
        if not book:
            book = Book(title="Book 1", holder_id=alice.id)
            db.session.add(book)
            db.session.commit()
        print(f"DEBUG: Alice id={alice.id}, Book id={book.id}")

    # Call endpoint
    print(f"DEBUG: POST /api/books/{book.id}/checkout/ with holder_id={alice.id}")
    response = client.post(
        f"/api/books/{book.id}/checkout/",
        data=json.dumps({"holder_id": alice.id}),
        content_type="application/json"
    )
    print(f"DEBUG: Response status={response.status_code}, data={response.get_data(as_text=True)}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"

def test_checkout_success(db_session, celery_eager):
    book = db_session.query(Book).filter_by(title="Book 1").first()
    alice = db_session.query(Holder).filter_by(name="Alice").first()
    result = checkout_book.apply(args=(book.id, alice.id, db_session)).get()
    assert result["status"] == "success"
    updated_book = db_session.query(Book).filter_by(id=book.id).first()
    assert updated_book.holder_id == alice.id

def test_checkout_invalid_book(db_session, celery_eager):
    alice = db_session.query(Holder).filter_by(name="Alice").first()
    result = checkout_book.apply(args=(999, alice.id)).get()
    assert result["status"] == "error"
    assert "not found" in result["message"]

def test_checkout_invalid_holder(db_session, celery_eager):
    book = db_session.query(Book).filter_by(title="Book 1").first()
    result = checkout_book.apply(args=(book.id, 999)).get()
    assert result["status"] == "error"
    assert "not found" in result["message"]

def test_checkout_already_checked_out(db_session, celery_eager):
    book = db_session.query(Book).filter_by(title="Book 1").first()
    alice = db_session.query(Holder).filter_by(name="Alice").first()
    # First checkout
    checkout_book.apply(args=(book.id, alice.id, db_session)).get()
    # Re-query book after first checkout
    book = db_session.query(Book).filter_by(title="Book 1").first()
    # Try to checkout again to same holder
    result = checkout_book.apply(args=(book.id, alice.id, db_session)).get()
    assert result["status"] == "success"
    updated_book = db_session.query(Book).filter_by(id=book.id).first()
    assert updated_book.holder_id == alice.id

def test_checkout_book_celery_result(db_session):
    """Demonstrate Celery testing utilities: inspect task result."""
    from app.tasks.checkout import checkout_book
    # Example book/holder setup
    holder = db_session.query(Holder).first()
    book = db_session.query(Book).first()
    assert holder is not None and book is not None
    # Call Celery task synchronously (task_always_eager=True)
    result = checkout_book.delay(book.id, holder.id)
    # Inspect result as if async, but runs synchronously in tests
    assert result.successful()
    assert result.result is not None
    print(f"Celery task result: {result.result}")
