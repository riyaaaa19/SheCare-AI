# SheCare AI

SheCare AI is a comprehensive health tracking and wellness assistant platform designed for women. It combines cycle tracking, mood and symptom journaling, PCOS risk assessment, personalized recommendations, and an AI-powered chatbot for health guidance and support.

## Features
- **User Authentication**: Secure signup and login with JWT-based authentication.
- **Cycle Tracker**: Log and visualize menstrual cycles, with insights on regularity and length.
- **Journal**: Record daily moods, symptoms, and notes.
- **PCOS Checker**: Assess PCOS risk and receive actionable tips.
- **Personalized Recommendations**: Get health, wellness, and engagement tips based on your data.
- **AI Chatbot**: Ask health questions and get context-aware answers using Google Gemini.
- **Profile Management**: Update personal info, cycle length, and more.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, Passlib, python-jose, google-generativeai
- **Frontend**: React, Axios, modern CSS

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd SheCare-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r app/requirements.txt
```

- **Environment Variables**: Create a `.env` file in `backend/app/` with:
  ```env
  DATABASE_TYPE=sqlite
  SECRET_KEY=your_secret_key_here
  GOOGLE_API_KEY=your_google_gemini_api_key_here
  ```
- **Database**: The app uses SQLite by default. The database file is `backend/shecare.db`.
- **Run the Backend**:
  ```bash
  cd backend
  python -m uvicorn app.app:app --reload
  ```
  The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
- The frontend will run at `http://localhost:3000`.
- Make sure the backend is running for full functionality.

## Environment Variables
- `DATABASE_TYPE`: Database backend (default: sqlite)
- `SECRET_KEY`: Secret for JWT signing (keep this private!)
- `GOOGLE_API_KEY`: Google Gemini API key for chatbot (keep this private!)

## Authentication
- JWT tokens are used for all protected endpoints.
- The frontend stores the token in `localStorage` as `token`.
- All API requests to protected endpoints must include:
  ```
  Authorization: Bearer <token>
  ```

## API Endpoints (Key)
- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT token
- `GET /dashboard` — Get user dashboard data
- `POST /cycle-tracker` — Add a cycle entry
- `GET /cycle-tracker` — List cycle entries
- `POST /journal` — Add a journal entry
- `GET /journal` — List journal entries
- `POST /pcos-checker` — Submit PCOS check
- `GET /pcos-checker` — List PCOS checks
- `GET /recommendations` — Get personalized recommendations
- `POST /chatbot` — Ask the AI chatbot a question

## Recommendations Logic
- Cycle, mood, symptoms, hydration, engagement, and PCOS data are analyzed.
- Only one cycle-related recommendation is shown at a time (short, long, irregular, or normal).
- All recommendations use emoji at the start for clarity and engagement.
- Example recommendations:
  - 🩺 Your cycles are shorter than average. Consider consulting a gynecologist.
  - 😴 You've mentioned tiredness or sleep. Prioritize rest and good sleep hygiene for better well-being.
  - 🧬 Maintain a healthy diet, exercise regularly, and consult a gynecologist if concerned.

## Chatbot Integration
- Uses Google Gemini via `google-generativeai` SDK.
- Loads API key from `.env`.
- Provides context-aware answers using recent user data (cycles, moods, journals).
- Always returns plain text responses.

## Troubleshooting
- **401 Unauthorized**: Log out and log in again to get a fresh token. Ensure the token uses the `sub` field for user ID.
- **Failed to get AI response**: Check backend logs for errors, ensure the Google API key is valid, and the token is sent in the Authorization header.
- **Database issues**: Delete `shecare.db` and restart the backend to reset data (for development only).
- **CORS errors**: The backend enables CORS for all origins by default.

## License
MIT License

---

## .env File Example
Create a `.env` file in `backend/app/` with the following variables:

```env

- `DATABASE_TYPE`: Database backend (default: sqlite)
- `SECRET_KEY`: Secret for JWT signing (keep this private!)
- `GOOGLE_API_KEY`: Google Gemini API key for chatbot (keep this private!)

---

For questions or contributions, please open an issue or pull request!

---