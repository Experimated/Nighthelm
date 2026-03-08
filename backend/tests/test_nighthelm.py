"""NightHelm Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

# Health
def test_health(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert "message" in r.json()

# Recipients CRUD
def test_get_recipients(client):
    r = client.get(f"{BASE_URL}/api/recipients")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_create_and_get_recipient(client):
    payload = {"name": "TEST_John Boss", "email": "TEST_john@boss.com", "relationship": "Boss"}
    r = client.post(f"{BASE_URL}/api/recipients", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "id" in data
    return data["id"]

def test_update_recipient(client):
    # Create first
    payload = {"name": "TEST_Update User", "email": "TEST_update@test.com", "relationship": "Colleague"}
    r = client.post(f"{BASE_URL}/api/recipients", json=payload)
    assert r.status_code == 200
    rid = r.json()["id"]
    # Update
    update = {"name": "TEST_Update User", "email": "TEST_updated@test.com", "relationship": "Colleague"}
    r2 = client.put(f"{BASE_URL}/api/recipients/{rid}", json=update)
    assert r2.status_code == 200
    assert r2.json()["email"] == "TEST_updated@test.com"
    # Cleanup
    client.delete(f"{BASE_URL}/api/recipients/{rid}")

def test_delete_recipient(client):
    payload = {"name": "TEST_Delete User", "email": "TEST_delete@test.com", "relationship": "Friend"}
    r = client.post(f"{BASE_URL}/api/recipients", json=payload)
    rid = r.json()["id"]
    r2 = client.delete(f"{BASE_URL}/api/recipients/{rid}")
    assert r2.status_code == 200

# Messages
def test_get_messages(client):
    r = client.get(f"{BASE_URL}/api/messages")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_create_message(client):
    payload = {
        "recipient_email": "TEST_boss@company.com",
        "recipient_name": "TEST_Boss",
        "subject": "TEST Quick update",
        "body": "TEST body",
        "scheduled_for": "2025-02-15T07:50:00Z"
    }
    r = client.post(f"{BASE_URL}/api/messages", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["subject"] == payload["subject"]
    assert "id" in data

def test_cancel_all_messages(client):
    r = client.delete(f"{BASE_URL}/api/messages")
    assert r.status_code == 200

# AI endpoints
def test_ai_excuses(client):
    r = client.post(f"{BASE_URL}/api/ai/excuses", json={"reason": "not feeling well", "recipient_type": "Boss"})
    assert r.status_code == 200
    data = r.json()
    assert "excuses" in data
    assert len(data["excuses"]) == 3
    for excuse in data["excuses"]:
        assert "label" in excuse
        assert "subject" in excuse
        assert "body" in excuse

def test_ai_analyze(client):
    r = client.post(f"{BASE_URL}/api/ai/analyze", json={"text": "sorry can't come", "recipient_type": "colleague"})
    assert r.status_code == 200
    data = r.json()
    assert "risk_score" in data
    assert "risk_label" in data
    assert "characteristics" in data
    assert "safer_version" in data

def test_ai_analyze_risky(client):
    r = client.post(f"{BASE_URL}/api/ai/analyze", json={"text": "I'm so drunk and angry right now!!!", "recipient_type": "colleague"})
    assert r.status_code == 200
    data = r.json()
    assert data["risk_label"] == "High risk"

# Used reasons
def test_used_reasons(client):
    # Create a recipient first
    payload = {"name": "TEST_Reasons User", "email": "TEST_reasons@test.com", "relationship": "Boss"}
    r = client.post(f"{BASE_URL}/api/recipients", json=payload)
    rid = r.json()["id"]
    
    # Add used reason
    r2 = client.post(f"{BASE_URL}/api/used-reasons", json={"recipient_id": rid, "reason_type": "not feeling well"})
    assert r2.status_code == 200
    
    # Get used reasons
    r3 = client.get(f"{BASE_URL}/api/used-reasons/{rid}")
    assert r3.status_code == 200
    assert len(r3.json()) >= 1
    
    # Duplicate should return same
    r4 = client.post(f"{BASE_URL}/api/used-reasons", json={"recipient_id": rid, "reason_type": "not feeling well"})
    assert r4.status_code == 200
    
    # Cleanup
    client.delete(f"{BASE_URL}/api/recipients/{rid}")
