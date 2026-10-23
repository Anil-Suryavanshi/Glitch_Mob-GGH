// FaultForge AI - Frontend API Client

const BASE_URL = '';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return await res.json();
}

export async function createDiagnosis({ symptoms, expectedBehavior, actualBehavior, sourceCode, imageFile }) {
  const formData = new FormData();
  formData.append('symptoms', symptoms);
  if (expectedBehavior) formData.append('expected_behavior', expectedBehavior);
  if (actualBehavior) formData.append('actual_behavior', actualBehavior);
  if (sourceCode) formData.append('source_code', sourceCode);
  if (imageFile) formData.append('image', imageFile);

  const res = await fetch(`${BASE_URL}/api/diagnose`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Diagnostic analysis failed');
  }

  return await res.json();
}

export async function fetchSessions(limit = 50) {
  const res = await fetch(`${BASE_URL}/api/sessions?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return await res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to load session ${sessionId}`);
  return await res.json();
}

export async function submitObservation(sessionId, { userObservation, recommendedTest, hypothesisId }) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_observation: userObservation,
      recommended_test: recommendedTest,
      hypothesis_id: hypothesisId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to submit observation');
  }

  return await res.json();
}

export async function recordRepair(sessionId, { repairDescription, expectedBehavior, observedBehavior, verificationStatus, notes }) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/repairs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repair_description: repairDescription,
      expected_behavior: expectedBehavior,
      observed_behavior: observedBehavior,
      verification_status: verificationStatus,
      notes: notes,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to record repair');
  }

  return await res.json();
}

export async function updateVerification(sessionId, { verificationStatus, notes }) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/verification`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verification_status: verificationStatus,
      notes: notes,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Failed to update verification');
  }

  return await res.json();
}
