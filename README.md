# SafeMedAI - AI-Powered Pharmacovigilance Platform

A complete web application for detecting, analyzing, and alerting drug safety risks using AI and public datasets.

## 📋 Project Structure

```
SafeMedAI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── ml/             # ML models
│   │   ├── database/       # Database config
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   └── utils/          # Utilities
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite config
│
├── docker-compose.yml      # Docker setup
├── .env                    # Environment variables
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Git

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 2: Frontend Setup

```bash
# Open another terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📚 Development Phases

### Phase 1: Project Setup ✅

- Folder structure
- Backend & Frontend initialization
- Basic API connection

### Phase 2: Authentication System ✅

- Two-role login system
- Doctor verification
- JWT tokens

### Phase 3: Data Pipeline ✅

- FAERS data fetching
- Data cleaning & storage

### Phase 4: Core Logic ✅

- ROR calculation
- Risk scoring
- Trend detection

### Phase 5: Backend APIs ✅

- Leaderboard API
- Drug details API
- Search API
- Alert API
- Interaction API
- Sentiment Analysis API
- AI Chatbot API

### Phase 6: Frontend UI ✅

- Dashboard (Officer)
- Leaderboard
- Drug detail page
- Search interface

### Phase 7: Advanced Features ✅

- Alert system
- Drug interaction detection
- Social media sentiment & Nocebo detection
- AI Chatbot (Gemini-powered)

### Phase 8: Doctor Input System ⏳

- Symptom submission form
- Backend integration

### Phase 9: Report Generation ⏳

- PDF export functionality

### Phase 10: Final Integration & Testing

- End-to-end testing
- Deployment preparation

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python 3.10+
- **Database**: PostgreSQL / SQLite (Dev)
- **Authentication**: JWT (python-jose)
- **AI/LLM**: OpenAI GPT-4 / Gemini API

## 📝 API Endpoints

```
GET  /               - Root endpoint
GET  /health         - Health check
POST /auth/register  - User registration
POST /auth/token     - Login/Token generation
GET  /drugs/search   - Drug search
GET  /drugs/detail   - Drug detail analytics
GET  /analytics/leaderboard - Top risk drugs
GET  /alerts/list    - System-generated alerts
POST /interactions   - Drug-drug interaction check
GET  /sentiment      - Social media sentiment analysis
POST /chatbot/ask    - AI Support Chatbot
```

## 🔐 Environment Variables

See `.env` file for configuration. Update for production use.

## 🎯 Current Status

Phase 1-7 are complete. The core pharmacovigilance engine, AI insights, and interactive dashboards are fully operational.

---

**Next Step**: Implementing **Phase 8: Doctor Input System** and **Phase 9: Report Generation (PDF Export)**.
