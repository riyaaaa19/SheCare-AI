# SheCare AI

**SheCare AI** is a comprehensive health tracking and wellness assistant platform designed specifically for women. It empowers users with tools to track menstrual cycles, log moods and symptoms, assess PCOS risk, receive personalized health recommendations, and interact with AI-powered chatbots for timely support.

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

- 🤖 **AI Chatbot Integration**  
   **OmniDimension Voice Agent**: Advanced voice-enabled AI assistant for health queries

- 👤 **Profile Management**  
  Manage personal info such as age, height, weight, and cycle length.


- 🎯 **Enhanced Recommendations System**  
  Smart recommendations based on:
  - Cycle patterns and irregularities
  - Mood tracking data
  - PCOS risk assessments
  - Wellness and nutrition tips

---

## 🧰 Tech Stack

- **Backend**:  
  `FastAPI`, `SQLAlchemy`, `SQLite`, `Pydantic`, `Passlib`, `python-jose`, `omnidimension`

- **Frontend**:  
  `React`, `Axios`, `Modern CSS`

- **AI Services**:
  - OmniDimension API for voice agent integration

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <https://github.com/sonamnimje/SheCare-AI.git>
cd SheCare-AI
```

### 2. Backend Setup
```bash
cd backend/app
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

- **Environment Variables**: Create a `.env` file in `backend/app/` and include the following:

```env
# Database Configuration
DATABASE_TYPE=sqlite

# JWT Configuration
SECRET_KEY=your_super_secret_key_change_this_in_production

# AI Service API Keys
OMNIDIM_API_KEY=your_omnidimension_api_key

# Optional: Database Configuration (if using PostgreSQL/MySQL)
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_USER=shecare_user
# POSTGRES_PASSWORD=shecare_password
# POSTGRES_DB=shecare_db
```

- **Database**: The app uses SQLite by default. The database file is `backend/app/shecare.db`.
- **Run the Backend**:
  ```bash
  cd backend/app
  python -m uvicorn app:app --reload
  ```
  The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
- The frontend will run at `http://localhost:3000`.
- ⚠️ Ensure the backend server is running for full app functionality.

---

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT token
- `GET /auth/me` — Get current user info

### Core Features
- `GET /dashboard` — Get user dashboard data
- `GET /profile` — Get user profile
- `PUT /profile` — Update user profile

### Cycle Tracking
- `POST /cycle-tracker` — Add a cycle entry
- `GET /cycle-tracker` — List cycle entries
- `DELETE /cycle-tracker/{entry_id}` — Delete cycle entry

### Journal
- `POST /journal` — Add a journal entry
- `GET /journal` — List journal entries
- `DELETE /journal/{journal_id}` — Delete journal entry

### PCOS Checker
- `POST /pcos-checker` — Submit PCOS check
- `GET /pcos-checker` — List PCOS checks
- `DELETE /pcos-checker/{pcos_id}` — Delete PCOS check

### Recommendations
- `GET /recommendations` — Get personalized recommendations
- `GET /recommendations/public` — Get public health tips
- `DELETE /recommendations/{rec_id}` — Delete recommendation

### AI Chatbot
- `POST /voice-chat` — Interact with OmniDimension voice agent

### Debug Endpoints
- `GET /debug/cycle-tracker` — Debug cycle entries
- `GET /debug/pcos-checker` — Debug PCOS checks
- `GET /health` — Health check endpoint

---

## 🔐 Authentication

- JWT tokens are used for all protected endpoints.
- JWT tokens are issued upon login and stored in localStorage as `token`.
- All protected API calls must include the token in headers:

  ```
  Authorization: Bearer <token>
  ```

---

## 🧠 AI Integration

### OmniDimension Voice Agent
- Advanced voice-enabled AI assistant
- Integrated via OmniDimension API
- Provides voice-based health consultations
- Requires `OMNIDIM_API_KEY` in environment variables

---

## 📊 Recommendations Logic

The system analyzes multiple data points to provide personalized recommendations:

- **Cycle Analysis**: Detects short, long, irregular, or normal cycles
- **Mood Tracking**: Monitors emotional patterns and suggests mood-boosting activities
- **PCOS Risk**: Provides guidance based on risk assessment results
- **Wellness Tips**: Offers nutrition, exercise, and self-care suggestions

### Recommendation Types
- 🩺 **Medical**: Cycle irregularities, PCOS concerns
- 😴 **Wellness**: Sleep, rest, and relaxation tips
- 🥗 **Nutrition**: Diet and hydration advice
- 😊 **Mood**: Emotional well-being and stress management
- 🏃‍♀️ **Activity**: Exercise and movement suggestions


---

## 🚨 Troubleshooting

- **401 Unauthorized**: Log out and log in again to get a fresh token. Ensure the token uses the `sub` field for user ID.
- **Failed to get AI response**: Check backend logs for errors, ensure the API keys are valid, and the token is sent in the Authorization header.
- **Database issues**: Delete `shecare.db` and restart the backend to reset data (for development only).
- **CORS errors**: The backend enables CORS for all origins by default.
- **Voice agent issues**: Verify `OMNIDIM_API_KEY` is set correctly in environment variables.

---

## 🤝 Contributing

Pull requests and issues are welcome!
For questions or contributions, please open an issue or pull request!

---

## Made with 💗 to support women's health and wellness.

