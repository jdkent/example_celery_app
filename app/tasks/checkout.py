import logging
logging.warning("DEBUG: app/tasks/checkout.py imported")
import os
from app.celery import celery
from app.models import Book, Holder
from app.config import Config
import os

Session = Config.Session

@celery.task(bind=True)
def checkout_book(self, book_id, holder_id, session=None):
    logging.warning(f"CHECKOUT_TASK: DB URL={os.environ.get('DATABASE_URL')}, TEST_DATABASE_URL={os.environ.get('TEST_DATABASE_URL')}")
    close_session = False
    if session is None:
        session = Session()
        close_session = True
    try:
        book = session.query(Book).filter_by(id=book_id).first()
        holder = session.query(Holder).filter_by(id=holder_id).first()
        if not book:
            return {'status': 'error', 'message': f'Book {book_id} not found'}
        if not holder:
            return {'status': 'error', 'message': f'Holder {holder_id} not found'}
        book.holder_id = holder.id
        session.commit()
        return {'status': 'success', 'book_id': book_id, 'holder_id': holder_id}
    except Exception as e:
        session.rollback()
        return {'status': 'error', 'message': str(e)}
    finally:
        if close_session:
            session.close()
