from flask import Flask
from flask_cors import CORS


from app.tasks import checkout, return_book_task

def create_app(config_object='app.config.Config'):
    app = Flask(__name__)
    CORS(
        app,
        origins=["http://localhost:3000"],
        supports_credentials=True,
        allow_headers=["*"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    app.config.from_object(config_object)

    # Force Celery to run tasks eagerly for testing
    app.config["CELERY_TASK_ALWAYS_EAGER"] = True
    app.config["CELERY_TASK_EAGER_PROPAGATES"] = True

    from app.models import db
    db.init_app(app)
    from flask_migrate import Migrate
    migrate = Migrate(app, db)

    # Import and register blueprints
    from app.routes.books import books_bp
    from app.routes.holders import holders_bp

    app.register_blueprint(books_bp, url_prefix="/api/books")
    app.register_blueprint(holders_bp, url_prefix="/api/holders")

    return app


# Remove this line to avoid creating the app at import time.
# The Flask CLI will call create_app() as needed.


from app.celery import celery
from app.tasks import checkout
from app.tasks import return_book
from app.tasks.checkout import checkout_book
from app.tasks.return_book import return_book_task
celery.register_task(checkout_book)
celery.register_task(return_book_task)
