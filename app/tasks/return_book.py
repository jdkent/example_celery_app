import logging
logging.warning("DEBUG: app/tasks/return_book.py imported")
from app.celery import celery
from app.models import Book, Holder
from app.config import Config
import os

Session = Config.Session

@celery.task(bind=True)
def return_book_task(self, book_id, session=None):
    close_session = False
    if session is None:
        session = Session()
        close_session = True
    try:
        book = session.query(Book).filter_by(id=book_id).first()
        if not book:
            return {'status': 'error', 'message': f'Book {book_id} not found'}
        library_holder = session.query(Holder).filter_by(name='Library').first()
        if not library_holder:
            return {'status': 'error', 'message': 'Library holder not found'}
        book.holder_id = library_holder.id
        session.commit()
        return {'status': 'success', 'book_id': book_id, 'holder_id': library_holder.id}
    except Exception as e:
        session.rollback()
        return {'status': 'error', 'message': str(e)}
    finally:
        if close_session:
            session.close()
