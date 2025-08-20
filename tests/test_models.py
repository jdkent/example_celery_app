import pytest
from app.models import db, Holder, Book
from flask import Flask


def test_create_holder(db_session, app_context):
    holder = Holder(name="Alice")
    db_session.add(holder)
    db_session.commit()
    assert holder.id is not None
    fetched = db_session.query(Holder).filter_by(name="Alice").first()
    assert fetched == holder

def test_create_book(db_session, app_context):
    holder = Holder(name="Bob")
    db_session.add(holder)
    db_session.commit()
    book = Book(title="Book 1", holder_id=holder.id)
    db_session.add(book)
    db_session.commit()
    assert book.id is not None
    assert book.holder == holder

def test_read_holder_and_books(db_session, app_context):
    holder = Holder(name="Carol")
    db_session.add(holder)
    db_session.commit()
    book = Book(title="Book 2", holder_id=holder.id)
    db_session.add(book)
    db_session.commit()
    fetched_holder = db_session.get(Holder, holder.id)
    assert fetched_holder.name == "Carol"
    assert fetched_holder.books[0].title == "Book 2"

def test_update_holder(db_session):
    holder = Holder(name="Dave")
    db_session.add(holder)
    db_session.commit()
    holder.name = "David"
    db_session.commit()
    assert db_session.get(Holder, holder.id).name == "David"

def test_update_book(db_session, app_context):
    holder = Holder(name="Eve")
    db_session.add(holder)
    db_session.commit()
    book = Book(title="Old Title", holder_id=holder.id)
    db_session.add(book)
    db_session.commit()
    book.title = "New Title"
    db_session.commit()
    assert db_session.get(Book, book.id).title == "New Title"

def test_delete_book(db_session, app_context):
    holder = Holder(name="Frank")
    db_session.add(holder)
    db_session.commit()
    book = Book(title="Book 3", holder_id=holder.id)
    db_session.add(book)
    db_session.commit()
    db_session.delete(book)
    db_session.commit()
    assert db_session.get(Book, book.id) is None

def test_delete_holder_cascades_books(db_session, app_context):
    holder = Holder(name="Grace")
    db_session.add(holder)
    db_session.commit()
    book = Book(title="Book 4", holder_id=holder.id)
    db_session.add(book)
    db_session.commit()
    db_session.delete(holder)
    db_session.commit()
    assert db_session.get(Holder, holder.id) is None
    assert db_session.query(Book).filter_by(holder_id=holder.id).count() == 0

def test_holder_name_unique_constraint(db_session, app_context):
    holder1 = Holder(name="Henry")
    db_session.add(holder1)
    db_session.commit()
    holder2 = Holder(name="Henry")
    db_session.add(holder2)
    with pytest.raises(Exception):
        db_session.commit()
