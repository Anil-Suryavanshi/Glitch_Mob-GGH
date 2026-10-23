# FaultForge AI — Setup and Execution Guide

## 1. Prerequisites

Before running FaultForge AI, ensure you have the following installed:
- **Python**: Version 3.10+ (Tested on Python 3.13.7)
- **Node.js**: Version 18+ or 22+ (Tested on Node v22.9.0 with npm 10.8.3)
- **Web Browser**: Chrome, Edge, Firefox, or Safari

---

## 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your Google Gemini API key:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *(Note: If no API key is set, the application operates in transparent Demo Fallback mode for demonstration purposes).*

---

## 3. Backend Setup & Startup

1. Open a terminal in the project root directory:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
3. Verify backend health in browser or curl:
   ```bash
   curl http://127.0.0.1:8000/health
   ```
   Expected response: `{"status":"healthy", "service":"FaultForge AI", ...}`

---

## 4. Frontend Setup & Startup

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173
   ```

---

## 5. Running Automated Tests

Run backend tests using `pytest`:
```bash
python -m pytest backend/tests/ -v
```

Validate frontend production build:
```bash
cd frontend
npm run build
```

---

## 6. Troubleshooting Common Issues

### Issue 1: Port 8000 or 5173 Already in Use
- Check active connections on Windows:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000
  ```
- Or run uvicorn on another port with `--port 8001` and update `frontend/vite.config.js` proxy accordingly.

### Issue 2: Gemini API Quota Limit (429)
- Ensure your Google AI Studio account has active quota or switch to `gemini-1.5-flash` in `.env`.
