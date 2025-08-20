from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from app.models import Book, Holder

class HolderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Holder
        load_instance = True
        include_relationships = True

    name = fields.String(required=True)
    books = fields.Nested('BookSchema', many=True, exclude=('holder',))

class BookSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Book
        load_instance = True
        include_fk = True

    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Integer(required=True)
    holder = fields.Nested('HolderSchema', exclude=('books',))
    holder_id = fields.Integer(required=False, allow_none=True)
