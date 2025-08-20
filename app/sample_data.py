# app/sample_data.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import db, Holder, Book

from app.config import Config

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
print(f"Engine created with URI: {Config.SQLALCHEMY_DATABASE_URI}")
Session = sessionmaker(bind=engine)
session = Session()


def load_sample_data(session):
    # Create Library holder if not exists
    library = session.query(Holder).filter_by(name="Library").first()
    if not library:
        library = Holder(name="Library")
        session.add(library)
        session.commit()
    # Example holders
    holders = [
        Holder(name="Alice"),
        Holder(name="Bob"),
    ]
    for h in holders:
        if not session.query(Holder).filter_by(name=h.name).first():
            session.add(h)
    session.commit()
    # Example books
    books = [
        Book(title="Book 1", holder_id=library.id),
        Book(title="Book 2", holder_id=library.id),
        Book(title="Book 3", holder_id=library.id),
    ]
    for b in books:
        if not session.query(Book).filter_by(title=b.title).first():
            session.add(b)
    session.commit()


def main():
    # Create tables if they don't exist
    db.metadata.create_all(engine)

    # Use the above function to seed data
    load_sample_data(session)

    print("Sample data inserted.")


if __name__ == "__main__":
    main()
