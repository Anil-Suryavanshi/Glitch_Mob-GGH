# FaultForge AI — AI Design & Prompt Engineering

## 1. Overview of AI Integration

FaultForge AI utilizes the **Google Gemini API** through the official Python SDK (`google-genai`). Unlike typical chatbots that respond with conversational prose, FaultForge AI utilizes Gemini as an **analytical inference engine** that outputs strictly structured, schema-compliant JSON representations of engineering troubleshooting states.

---

## 2. Model Selection and Rationale

- **Primary Model**: `gemini-2.5-flash` (or `gemini-1.5-flash` depending on deployment configuration).
- **Rationale**:
  - Exceptional multimodal visual reasoning over high-resolution circuit photographs.
  - Native JSON Schema enforcement via `response_mime_type="application/json"`.
  - Sub-5-second inference latency, essential for interactive laboratory environments.
  - Long context window allowing full microcontroller source code files alongside multimodal images.

The model name is read from environment configuration (`GEMINI_MODEL`) rather than hardcoded.

---

## 3. Multimodal Evidence Ingestion Architecture

```
[ User Text Symptoms ] ──┐
[ Expected Behavior  ] ──┼──> [ Formatted Prompt ] ──┐
[ Microcontroller Code] ─┤                           │
                                                     ├──> [ Gemini generate_content ]
[ Circuit Photo (bytes)] ─> [ types.Part.from_bytes ]─┘
```

When an image is uploaded:
- Image bytes are read into memory.
- MIME type is validated (`image/jpeg`, `image/png`, `image/webp`).
- Converted into a `types.Part.from_bytes(data=image_bytes, mime_type=content_type)`.
- Passed alongside the structured text prompt in the `contents` list.

When no image is attached, the prompt executes text-and-code reasoning seamlessly.

---

## 4. Prompt Engineering Strategy

### 4.1 System Instructions
System instructions explicitly define the role of an expert embedded systems troubleshooter. They mandate:
1. Grounding every hypothesis strictly in visible evidence.
2. Distinguishing directly observed facts from plausible assumptions.
3. Checking breadboard rails, pin numbers, polarity markers (cathode notch, diode stripe), and code definitions.
4. Prescribing a safe, low-voltage diagnostic test.
5. Strict adherence to the JSON schema.

### 4.2 Differential Hypothesis Reevaluation Prompt
During reevaluation, Gemini receives:
- Original problem description and code.
- JSON snapshot of prior hypotheses with their original confidence scores.
- The test that was prescribed.
- The user's empirical observation.

The prompt instructs the model to act as a differential diagnostic engine, updating plausibility ratings into `SUPPORTED`, `WEAKENED`, or `UNRESOLVED` and explaining the delta.

---

## 5. Confidence Score Interpretation

- Confidence scores (0.0 to 1.0) represent model uncertainty estimates based on evidence consistency.
- **They are NOT calibrated physical probabilities.**
- The UI clearly conveys confidence as a ranking metric rather than an absolute mathematical certainty.

---

## 6. Safety Guardrails & Hazardous Voltage Prevention

1. **Low-Voltage Operational Boundary**: The system is tuned for educational microcontrollers (&lt;24V DC).
2. **Mains Electricity Rejection**: If prompts, symptoms, or images reference AC mains (110V/220V/240V) or live distribution panels, the system prioritizes safety warnings and forbids physical probing.
3. **Prompt Injection Shielding**: Untrusted user code and text are wrapped in distinct Markdown code blocks and isolated from system directives.
