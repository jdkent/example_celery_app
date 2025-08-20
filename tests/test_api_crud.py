import pytest
from app import create_app
from app.models import db


def test_create_holder(client):
    resp = client.post("/api/holders/", json={"name": "TestHolder"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "TestHolder"

def test_get_holders(client):
    client.post("/api/holders/", json={"name": "HolderA"})
    client.post("/api/holders/", json={"name": "HolderB"})
    resp = client.get("/api/holders/")
    assert resp.status_code == 200
    data = resp.get_json()
    assert any(h["name"] == "HolderA" for h in data)
    assert any(h["name"] == "HolderB" for h in data)

def test_update_holder(client):
    resp = client.post("/api/holders/", json={"name": "HolderToUpdate"})
    holder_id = resp.get_json()["id"]
    resp = client.put(f"/api/holders/{holder_id}/", json={"name": "UpdatedHolder"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["name"] == "UpdatedHolder"

def test_delete_holder(client):
    resp = client.post("/api/holders/", json={"name": "HolderToDelete"})
    holder_id = resp.get_json()["id"]
    resp = client.delete(f"/api/holders/{holder_id}/")
    assert resp.status_code == 204 or resp.status_code == 200
    resp = client.get(f"/api/holders/{holder_id}/")
    assert resp.status_code == 404

def test_create_book(client):
    holder_resp = client.post("/api/holders/", json={"name": "BookOwner"})
    holder_id = holder_resp.get_json()["id"]
    resp = client.post("/api/books/", json={"title": "TestBook", "holder_id": holder_id})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "TestBook"
    assert data["holder_id"] == holder_id

def test_get_books(client):
    holder_resp = client.post("/api/holders/", json={"name": "BookLister"})
    holder_id = holder_resp.get_json()["id"]
    client.post("/api/books/", json={"title": "BookA", "holder_id": holder_id})
    client.post("/api/books/", json={"title": "BookB", "holder_id": holder_id})
    resp = client.get("/api/books/")
    assert resp.status_code == 200
    data = resp.get_json()
    assert any(b["title"] == "BookA" for b in data)
    assert any(b["title"] == "BookB" for b in data)

def test_update_book(client):
    holder_resp = client.post("/api/holders/", json={"name": "BookUpdater"})
    holder_id = holder_resp.get_json()["id"]
    resp = client.post("/api/books/", json={"title": "BookToUpdate", "holder_id": holder_id})
    book_id = resp.get_json()["id"]
    resp = client.put(f"/api/books/{book_id}/", json={"title": "UpdatedBook", "holder_id": holder_id})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["title"] == "UpdatedBook"

def test_delete_book(client):
    holder_resp = client.post("/api/holders/", json={"name": "BookDeleter"})
    holder_id = holder_resp.get_json()["id"]
    resp = client.post("/api/books/", json={"title": "BookToDelete", "holder_id": holder_id})
    book_id = resp.get_json()["id"]
    resp = client.delete(f"/api/books/{book_id}/")
    assert resp.status_code == 204 or resp.status_code == 200
    resp = client.get(f"/api/books/{book_id}/")
    assert resp.status_code == 404
