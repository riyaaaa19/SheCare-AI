# SheCare AI

**SheCare AI** is a comprehensive health tracking and wellness assistant platform designed specifically for women. It empowers users with tools to track menstrual cycles, log moods and symptoms, assess PCOS risk, receive personalized health recommendations, and interact with an AI-powered chatbot for timely support.

---

## 🌟 Features

- 🔐 **User Authentication**  
  Secure signup/login using JWT-based authentication.

- 📆 **Cycle Tracker**  
  Log menstrual cycles, visualize regularity, and gain cycle-based insights.

- 📓 **Journal**  
  Record daily moods, symptoms, and personal notes.

- 🧬 **PCOS Checker**  
  Submit symptoms and receive PCOS risk level with personalized guidance.

- 💡 **Personalized Recommendations**  
  Get contextual tips on health, well-being, and engagement based on your data.

- 🤖 **AI Chatbot (Google Gemini)**  
  Ask health-related questions and receive context-aware answers.

- 👤 **Profile Management**  
  Manage personal info such as age, height, weight, and cycle length.

---

## 🧰 Tech Stack

- **Backend**:  
  `FastAPI`, `SQLAlchemy`, `SQLite`, `Pydantic`, `Passlib`, `python-jose`, `google-generativeai`

- **Frontend**:  
  `React`, `Axios`, `Modern CSS`

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <https://github.com/sonamnimje/SheCare-AI.git>
cd SheCare-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r app/requirements.txt
```

- **Environment Variables**: Create a .env file in backend/app/ and include the following:

- `DATABASE_TYPE`: Database backend (default: sqlite)
- `SECRET_KEY`: Secret for JWT signing (keep this private!)
- `GOOGLE_API_KEY`: Google Gemini API key for chatbot (keep this private!)
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
- ⚠️Ensure the backend server is running for full app functionality.


## Authentication
- JWT tokens are used for all protected endpoints.
- JWT tokens are issued upon login and stored in localStorage as token.
- All protected API calls must include the token in headers:

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
- Powered via google-generativeai SDK.
- Loads API key from `.env`.
- Uses JWT-authenticated user context (recent journals, mood, cycle) for smart responses.
- Only returns plain text for simplicity and compatibility.


## Troubleshooting
- **401 Unauthorized**: Log out and log in again to get a fresh token. Ensure the token uses the `sub` field for user ID.
- **Failed to get AI response**: Check backend logs for errors, ensure the Google API key is valid, and the token is sent in the Authorization header.
- **Database issues**: Delete `shecare.db` and restart the backend to reset data (for development only).
- **CORS errors**: The backend enables CORS for all origins by default.

## 📄 License

This project is licensed under the MIT License — feel free to use and contribute.

## 🤝 Contributing

Pull requests and issues are welcome!
For questions or contributions, please open an issue or pull request!

## Made with 💗 to support women's health and wellness.

---