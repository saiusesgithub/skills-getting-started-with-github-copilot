import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert all('description' in v and 'participants' in v for v in data.values())

def test_signup_and_unregister():
    # Get an activity name
    response = client.get("/activities")
    activities = response.json()
    activity = next(iter(activities))
    test_email = "pytest-student@mergington.edu"

    # Sign up
    signup = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert signup.status_code in (200, 201)
    assert "message" in signup.json() or "detail" in signup.json()

    # Check participant is added
    after_signup = client.get("/activities").json()
    assert test_email in after_signup[activity]["participants"]

    # Unregister
    unregister = client.post(f"/activities/{activity}/unregister?email={test_email}")
    assert unregister.status_code in (200, 201)
    # Check participant is removed
    after_unreg = client.get("/activities").json()
    assert test_email not in after_unreg[activity]["participants"]
