# 🎓 StudyAI — AI Study Assistant (MERN Stack)

A full-stack AI-powered study assistant built with the MERN stack. Upload PDFs, generate notes, take quizzes, and chat with your documents using AI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based register/login with bcrypt password hashing |
| 📄 **PDF Upload** | Upload PDFs to Cloudinary with text extraction via pdf-parse |
| 📝 **AI Notes Generator** | Generate concise, detailed, or summary notes from PDFs |
| 🧠 **AI Quiz Generator** | Create 10/20/30-question MCQ quizzes with scoring & explanations |
| 💬 **Chat with PDF** | Ask questions about your PDF — AI answers from document context only |
| 📊 **Dashboard** | Stats, recent activity, and quick actions |
| 👤 **Profile** | Edit name, bio, avatar URL, and change password |

---

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + React Router + Axios  
**Backend:** Node.js + Express.js + MongoDB + Mongoose  
**Auth:** JWT + bcryptjs  
**File Upload:** Multer + Cloudinary  
**AI:** OpenAI API (switchable to Google Gemini)  
**PDF Parsing:** pdf-parse

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free)
- OpenAI API key **OR** Google Gemini API key

---

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

**Backend** — copy and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant

JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Choose: 'openai' or 'gemini'
AI_PROVIDER=Groq
GROQ_API_KEY=sk-your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile

# Only needed if AI_PROVIDER=gemini
# GEMINI_API_KEY=your-gemini-key

FRONTEND_URL=http://localhost:5173
```

**Frontend** — copy and fill in:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 🔌 Switching AI Provider

This app supports both OpenAI and Google Gemini. To switch:

1. Set `AI_PROVIDER=gemini` in `backend/.env`
2. Add your `GEMINI_API_KEY`
3. Install the Gemini SDK: `npm install @google/generative-ai`
4. Restart the backend

No code changes needed — the AI service abstraction handles everything.

---

## 📁 Project Structure

```
ai-study-assistant/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Multer + Cloudinary setup
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── document.controller.js
│   │   ├── note.controller.js
│   │   ├── quiz.controller.js
│   │   └── chat.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT protect middleware
│   │   └── error.middleware.js # Global error handler
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Document.model.js
│   │   ├── Note.model.js
│   │   ├── Quiz.model.js
│   │   └── Chat.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── document.routes.js
│   │   ├── note.routes.js
│   │   ├── quiz.routes.js
│   │   └── chat.routes.js
│   ├── services/
│   │   └── ai.service.js      # OpenAI/Gemini abstraction
│   ├── utils/
│   │   └── pdfParser.js       # pdf-parse wrapper
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/        # Reusable UI components
    │   │   └── layout/        # AppLayout, Sidebar, Header
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── UploadPage.jsx
    │   │   ├── DocumentsPage.jsx
    │   │   ├── NotesPage.jsx
    │   │   ├── NotePage.jsx
    │   │   ├── QuizzesPage.jsx
    │   │   ├── QuizPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js         # Axios + all API calls
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css          # Tailwind + custom components
    ├── .env.example
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🌐 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users/profile` | Get profile with stats |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |
| GET | `/api/users/stats` | Get dashboard stats |
| POST | `/api/documents/upload` | Upload PDF (multipart) |
| GET | `/api/documents` | List user's PDFs |
| GET | `/api/documents/:id` | Get single document |
| DELETE | `/api/documents/:id` | Delete document + all data |
| POST | `/api/notes/generate` | Generate AI notes |
| GET | `/api/notes` | List notes |
| GET | `/api/notes/:id` | Get single note |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/quizzes/generate` | Generate AI quiz |
| GET | `/api/quizzes` | List quizzes |
| GET | `/api/quizzes/:id` | Get quiz (no answers until submitted) |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |
| DELETE | `/api/quizzes/:id` | Delete quiz |
| POST | `/api/chats/message` | Send chat message |
| GET | `/api/chats` | List chat sessions |
| GET | `/api/chats/:id` | Get chat history |
| DELETE | `/api/chats/:id` | Delete chat session |

---

## 🔑 Getting API Keys

### Cloudinary (Free)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. API keys → Create new secret key

### Google Gemini (Free tier available)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get API key → Create API key

---

## 🚢 Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to Railway/Render
3. Add environment variables from `.env`
4. Deploy

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL=https://your-backend.railway.app/api`
2. Deploy with `npm run build` → `dist/` folder

---

## 🐛 Common Issues

**PDF text extraction fails?**
- Make sure the PDF is text-based (not a scanned image)
- Try a different PDF first to verify setup

**AI response slow?**
- OpenAI gpt-3.5-turbo is fastest; gpt-4 is slower
- Quiz generation (10-30 questions) can take 30-90 seconds

**Cloudinary upload fails?**
- Verify all 3 Cloudinary env vars are correct
- Check your Cloudinary account has storage space

---

## 📄 License

MIT License — free to use for portfolio projects.

---

Built with ❤️ — Perfect for MERN developer portfolios
