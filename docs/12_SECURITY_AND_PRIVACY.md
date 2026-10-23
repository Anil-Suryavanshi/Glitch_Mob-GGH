# FaultForge AI — Security and Privacy Architecture

## 1. Threat Model & Security Posture

FaultForge AI is designed following the principle of **defense in depth** and **least privilege**, ensuring that user code, diagnostic evidence, and external API credentials are systematically safeguarded.

---

## 2. Key Security Controls

### 2.1 Backend Isolation of API Credentials
- The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables loaded via `python-dotenv`.
- The key is **never** transmitted to the client, embedded in frontend JavaScript bundles, or logged to disk.
- If credentials are absent, the server operates in an explicit demo fallback mode without compromising internal states.

### 2.2 Strict Input Validation & Schema Sanitization
- All client inputs are validated via Pydantic v2 schemas before being processed by application logic or passed to the database.
- Malformed inputs, unexpected fields, or out-of-bounds parameters are rejected with HTTP 422 or 400 status codes.

### 2.3 File Upload Security & Magic Byte Inspection
- **Supported Formats**: Strictly limited to `image/jpeg`, `image/png`, and `image/webp`.
- **Upload Size Limit**: 8 MB (8,388,608 bytes) enforced both in memory and stream processing.
- Executable files, scripts, and non-image binaries are rejected immediately.
- Uploaded files are processed in-memory for model transmission rather than saved as executable server files.

### 2.4 Prompt Injection Mitigation
- User-supplied symptoms and firmware code are treated as **untrusted data**.
- Text inputs are wrapped in distinct delimiters and isolated from system instructions.
- System instructions explicitly forbid model role re-assignment or execution of unauthorized system commands.

### 2.5 Cross-Origin Resource Sharing (CORS)
- CORS middleware in FastAPI restricts API access to authorized local origins (`http://localhost:5173`, `http://127.0.0.1:5173`).

---

## 3. Data Privacy & Retention Policy

- **Data Minimization**: FaultForge AI only persists the text of symptoms, code snippets, snapshot iterations, and repair logs needed to track the active troubleshooting session.
- **No PII Collection**: The system does not solicit or store personal identifying information, email addresses, or payment credentials.
- **Local Storage**: The database resides in a local SQLite file (`faultforge.db`), preserving user privacy entirely on their local environment.
