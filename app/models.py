from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Holder(db.Model):
    __tablename__ = 'holders'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

    books = db.relationship("Book", back_populates="holder", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Holder(id={self.id}, name='{self.name}')>"

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    author = db.Column(db.String, nullable=False)
    published_year = db.Column(db.Integer, nullable=False)
    holder_id = db.Column(db.Integer, db.ForeignKey('holders.id'), nullable=False)

    holder = db.relationship("Holder", back_populates="books")

    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}', holder_id={self.holder_id})>"

# Note: The library itself should be represented as a Holder with a reserved name, e.g., "Library".
