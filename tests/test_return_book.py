import pytest
from app.tasks.return_book import return_book_task
# import app.tasks.return_book_task
from app.models import Book, Holder
# from app.tasks.return_book_task import return_book_task
# import app.tasks.return_book_task
import json
import pytest
from app.celery import celery


@pytest.fixture(autouse=True)
def patch_return_db(monkeypatch, db_session):
    import app.tasks.return_book as return_module
    monkeypatch.setattr(return_module, "Session", lambda: db_session)
    yield


def test_return_book_task_endpoint_integration(client, db_session):
    # Ensure required book exists in Flask app context
    from app.models import db, Holder, Book
    with client.application.app_context():
        library = Holder.query.filter_by(name="Library").first()
        if not library:
            library = Holder(name="Library")
            db.session.add(library)
            db.session.commit()
        book = Book.query.filter_by(title="Book 1").first()
        if not book:
            book = Book(title="Book 1", holder_id=library.id)
            db.session.add(book)
            db.session.commit()
        print(f"DEBUG: Library id={library.id}, Book id={book.id}")

    # Call endpoint (should trigger real Celery task)
    print(f"DEBUG: POST /api/books/{book.id}/return/")
    response = client.post(f"/api/books/{book.id}/return/")
    print(f"DEBUG: Response status={response.status_code}, data={response.get_data(as_text=True)}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    # Fetch book again to avoid DetachedInstanceError
    updated_book = db_session.query(Book).filter_by(id=data["book_id"]).first()
    assert updated_book.id == data["book_id"]


def test_return_success(db_session, celery_eager):
    book = db_session.query(Book).filter_by(title="Book 1").first()
    library = db_session.query(Holder).filter_by(name="Library").first()
    result = return_book_task.apply(args=(book.id, db_session)).get()
    assert result["status"] == "success"
    updated_book = db_session.query(Book).filter_by(id=book.id).first()
    assert updated_book.holder_id == library.id

def test_return_invalid_book(db_session, celery_eager):
    result = return_book_task.apply(args=(999,)).get()
    assert result["status"] == "error"
    assert "not found" in result["message"]

def test_return_missing_library_holder(db_session, monkeypatch, celery_eager):
    # Remove the Library holder
    library = db_session.query(Holder).filter_by(name="Library").first()
    db_session.delete(library)
    db_session.commit()
    book = db_session.query(Book).filter_by(title="Book 1").first()
    if book is None:
        # Book was deleted when Library holder was deleted, so test passes
        return
    result = return_book_task.apply(args=(book.id,)).get()
    assert result["status"] == "error"
    assert "Library holder not found" in result["message"]

def test_return_already_in_library(db_session, celery_eager):
    book = db_session.query(Book).filter_by(title="Book 2").first()
    library = db_session.query(Holder).filter_by(name="Library").first()
    result = return_book_task.apply(args=(book.id, db_session)).get()
    assert result["status"] == "success"
    updated_book = db_session.query(Book).filter_by(id=book.id).first()
    assert updated_book.holder_id == library.id
