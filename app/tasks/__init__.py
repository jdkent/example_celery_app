import logging
logging.warning("DEBUG: app/tasks/__init__.py imported")
from .checkout import checkout_book
from .return_book import return_book_task
# Make app.tasks a Python package for Celery autodiscover
