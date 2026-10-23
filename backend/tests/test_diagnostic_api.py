import io
from PIL import Image

def create_test_image_bytes(format="JPEG") -> bytes:
    """Generate a minimal valid in-memory test image."""
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_diagnose_text_only(client):
    response = client.post(
        "/api/diagnose",
        data={
            "symptoms": "Arduino Uno LED on pin 13 is not blinking",
            "expected_behavior": "LED blinks every 1 second",
            "actual_behavior": "LED stays permanently off",
            "source_code": "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] is not None
    assert len(data["snapshots"]) >= 1
    snapshot = data["snapshots"][0]
    assert len(snapshot["hypotheses"]) >= 1
    assert snapshot["recommended_test"] is not None
    assert "expected_observation" in snapshot

def test_diagnose_with_valid_image(client):
    img_bytes = create_test_image_bytes("JPEG")
    response = client.post(
        "/api/diagnose",
        data={
            "symptoms": "Breadboard LED circuit fails to illuminate",
            "expected_behavior": "LED on",
            "actual_behavior": "LED off"
        },
        files={
            "image": ("test_circuit.jpg", img_bytes, "image/jpeg")
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["image_filename"] == "test_circuit.jpg"
    assert len(data["snapshots"]) == 1

def test_diagnose_missing_symptoms_fails(client):
    response = client.post(
        "/api/diagnose",
        data={
            "symptoms": "   "
        }
    )
    assert response.status_code == 422

def test_diagnose_invalid_image_type_fails(client):
    fake_pdf = b"%PDF-1.4 fake content"
    response = client.post(
        "/api/diagnose",
        data={
            "symptoms": "LED not lighting up"
        },
        files={
            "image": ("schematic.pdf", fake_pdf, "application/pdf")
        }
    )
    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]

def test_full_iterative_workflow(client):
    # 1. Start diagnosis
    diag_res = client.post(
        "/api/diagnose",
        data={
            "symptoms": "Arduino pin 13 LED stays dark",
            "expected_behavior": "Blinking LED",
            "actual_behavior": "No light output"
        }
    )
    assert diag_res.status_code == 201
    session_id = diag_res.json()["id"]

    # 2. List sessions
    list_res = client.get("/api/sessions")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert any(s["id"] == session_id for s in sessions)

    # 3. Submit observation
    obs_res = client.post(
        f"/api/sessions/{session_id}/observations",
        json={
            "user_observation": "Reversed LED legs on breadboard, but LED still does not light. Measured 0V on Pin 13.",
            "recommended_test": "Swap LED orientation",
            "hypothesis_id": "H1"
        }
    )
    assert obs_res.status_code == 200
    updated_session = obs_res.json()
    assert len(updated_session["snapshots"]) == 2
    assert len(updated_session["observations"]) == 1
    latest_snapshot = updated_session["snapshots"][-1]
    assert latest_snapshot["iteration_number"] == 2
    assert latest_snapshot["delta_explanation"] is not None

    # 4. Record repair
    repair_res = client.post(
        f"/api/sessions/{session_id}/repairs",
        json={
            "repair_description": "Corrected pinMode pin assignment in sketch from pin 12 to 13 and re-flashed",
            "expected_behavior": "LED blinks every second",
            "observed_behavior": "LED is now blinking steadily at 1Hz",
            "verification_status": "VERIFIED_RESOLVED",
            "notes": "Verified working on breadboard"
        }
    )
    assert repair_res.status_code == 200
    resolved_session = repair_res.json()
    assert resolved_session["status"] == "RESOLVED"
    assert len(resolved_session["repairs"]) == 1
    assert resolved_session["repairs"][0]["verification_status"] == "VERIFIED_RESOLVED"
