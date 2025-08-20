import logging
from flask import Blueprint, request, jsonify
from app.models import db, Book
from app.schemas import BookSchema
from sqlalchemy.exc import SQLAlchemyError
from app.tasks.checkout import checkout_book
from app.tasks.return_book import return_book_task

books_bp = Blueprint('books', __name__, url_prefix='/books')
book_schema = BookSchema()
books_schema = BookSchema(many=True)

logger = logging.getLogger(__name__)

@books_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify(books_schema.dump(books)), 200


@books_bp.route('/<int:book_id>/', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book_schema.dump(book)), 200


@books_bp.route('/', methods=['POST'])
def create_book():
    data = request.get_json()
    try:
        book = book_schema.load(data, session=db.session)
        db.session.add(book)
        db.session.commit()
        return jsonify(book_schema.dump(book)), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@books_bp.route('/<int:book_id>/', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    try:
        updated_book = book_schema.load(
            data,
            instance=book,
            session=db.session
        )
        db.session.commit()
        return jsonify(book_schema.dump(updated_book)), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@books_bp.route('/<int:book_id>/', methods=['PATCH'])
def patch_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    try:
        updated_book = book_schema.load(
            data,
            instance=book,
            session=db.session,
            partial=True
        )
        db.session.commit()
        return book_schema.jsonify(updated_book), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@books_bp.route('/<int:book_id>/checkout/', methods=['POST'])
def checkout_book_endpoint(book_id):
    data = request.get_json()
    holder_id = data.get('holder_id')
    if not holder_id:
        return jsonify({'error': 'holder_id is required'}), 400
    task = checkout_book.apply_async(args=[book_id, holder_id])
    result = task.get(timeout=10)
    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@books_bp.route('/<int:book_id>/return/', methods=['POST'])
def return_book_task_endpoint(book_id):
    task = return_book_task.apply_async(args=[book_id])
    logger.debug(f"[DEBUG] type(task) = {type(task)}")
    logger.debug(f"[DEBUG] task.get = {task.get}")
    result = task.get(timeout=10)
    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@books_bp.route('/<int:book_id>/', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    try:
        db.session.delete(book)
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
