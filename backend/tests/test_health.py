def test_health_check_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "FaultForge AI"
    assert data["status"] in ["healthy", "degraded"]
    assert "gemini_configured" in data
    assert "database_status" in data

def test_health_check_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0-MVP"
    assert data["database_status"] == "connected"
