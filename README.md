# LifeFlow AI 🚀

LifeFlow AI is a modern, full-stack personal productivity SaaS ecosystem. It integrates a rich, glassmorphic **Web Dashboard** (React, TypeScript, Vite, Tailwind CSS v4, TanStack Router), a secure **REST API** (Node.js, Express, MongoDB/Mongoose, JWT), and a **Mobile Companion** (React Native, Expo).

---

## 🤖 Multi-Provider AI Engine (Gemini, Groq, OpenRouter, OpenAI)

LifeFlow features a resilient and context-aware **AI Assistant** capable of automating your workspace. Instead of relying on a single AI provider, the backend implements a resilient orchestrator (`backend/services/aiService.js`) supporting multiple LLMs:

```
                  ┌──────────────────────┐
                  │   User Chat Request  │
                  └──────────┬───────────┘
                             │
                             ▼
                 [ aiContextService.js ]
              Compiles active tasks, goals,
                habits, timezone & profile
                             │
                             ▼
                 [ Preferred Provider ] (e.g. Gemini)
                   Attempt API Completion
                             │
            ┌────────────────┴────────────────┐
         SUCCESS                           FAILURE / NO KEY
            │                                 │
            ▼                                 ▼
   [ Execute Action ]               [ Fallback Chain ]
   Safe: Runs immediately.          openrouter ➔ grok ➔ gemini ➔ openai
   Unsafe: Needs approval.
```

### 1. Resilient Fallback Routing
If your preferred provider is rate-limited, times out, or has an API key configuration error, LifeFlow automatically cascades down the fallback chain to fetch a response. The fallback priority order is:
1. **OpenRouter API** (`google/gemini-2.5-pro` or custom model)
2. **Groq API** (`grok-2` / `grok-beta`)
3. **Gemini API** (`gemini-2.5-flash` natively)
4. **OpenAI API** (`gpt-4o-mini`)

### 2. Context-Aware Prompting
Using `backend/services/aiContextService.js`, the assistant gathers real-time user data before every prompt. The generated system instructions contain:
*   User Profile (Name, current local timestamp, timezone)
*   **Due Today**: List of tasks scheduled for today.
*   **Overdue & Upcoming**: Live count and titles of overdue and upcoming tasks.
*   **Habits**: List of habits and the user's current streaks.
*   **Goals**: List of active long-term goals and their completion progress percentages.

### 3. Agentic Tool Actions
The assistant can execute actions directly inside the database by appending a JSON ````action```` block at the end of its response. 
*   **Safe Actions** (executed instantly):
    *   `create_task`: Schedules a new task.
    *   `update_task` / `reschedule`: Modifies task titles, dates, or progress.
    *   `create_goal` / `update_goal`: Creates objectives or logs progress percentage.
*   **Dangerous Actions** (returns a pending confirmation card to the frontend for user consent before database modification):
    *   `delete_task`
    *   `delete_goal`

---

## 📂 Project Structure

*   **[`/backend`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/backend)**: Express API. Handles authorization, database CRUD, background reminder schedules, and the AI Service.
*   **[`/frontend`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/frontend)**: Vite + TS React Web Application. Implements Tailwind CSS v4, TanStack Query, Framer Motion, and PWA capabilities.
*   **[`/mobile`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/mobile)**: Expo React Native application for iOS and Android.

---

## 🌟 Key Features
*   **Background Reminder Scheduler**: Runs an active cron-like background process on the backend to evaluate active reminders, trigger notifications, and log notification history.
*   **Analytics & Productivity Scoring**: Tracks task completion rates, daily/weekly streaks, and updates user productivity scores in real time.
*   **Habit & Goal Tracking**: Allows breaking down year-long or month-long goals into daily/weekly actionable habits and items.

---

## 📊 Database Models (MongoDB / Mongoose)

Located in `backend/models/`:
*   **`User`**: User details, avatar, timezone, and productivity metrics.
*   **`Task`**: Task details, statuses (`todo`, `in-progress`, `completed`), priority (`low`, `medium`, `high`), due dates, categories, and progress indicators.
*   **`Goal`**: Multi-layered long-term objectives with target completion dates.
*   **`Habit`**: Recurring behavior checklists linked to the user's weekly planner.
*   **`Reminder`**: Smart notification schedules (times, custom messages, intervals).
*   **`ReminderHistory`**: Execution logs of triggered notifications and delivery statuses.
*   **`ChatMessage`**: History of conversation threads between users and the AI Assistant.
*   **`SavedPlan`**: AI-generated step-by-step plans created for users' personal goals.

---

## 💻 Local Development Setup

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
*   An API key from **Gemini**, **Groq**, or **OpenRouter**.

### 2. Installation
Initialize all sub-modules with a single command from the project root:
```bash
# Install root dependencies (concurrently)
npm install

# Install all sub-module dependencies (backend, frontend, mobile)
npm run install:all
```

### 3. Environment Configurations
Configure the local environments by copying the sample files:

#### Backend Settings (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lifeflow?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_signing_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Preferred provider: 'gemini', 'grok', 'openrouter', or 'openai'
AI_PROVIDER=gemini

# Provider API Keys (Fill in the ones you use; others will be skipped gracefully)
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional settings
GROK_MODEL=grok-beta
OPENROUTER_MODEL=google/gemini-2.5-pro
```

#### Frontend Settings (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Project
Use the following root-level commands to spin up the developer environments:
*   **Run Web + Backend + Mobile**: `npm run dev`
*   **Run Web Frontend + Backend API only**: `npm run dev:web`
*   **Run Backend only**: `npm run dev:backend`
*   **Run Frontend only**: `npm run dev:frontend`
*   **Run Mobile (Expo) only**: `npm run dev:mobile`

---

## 🌐 Production Deployment

### Backend API (Web Service on Render)
1.  Create a **Web Service** pointing to your repository.
2.  Set the **Root Directory** to `backend`.
3.  Set the **Language** to `Node`.
4.  Configure the commands:
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Under **Advanced**, add environment variables:
    *   `NODE_ENV`: `production`
    *   `JWT_SECRET`: *Your generated secure secret key*
    *   `MONGODB_URI`: *Your MongoDB connection string*
    *   `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app` (without trailing slash)
    *   `AI_PROVIDER`: `gemini` (or `grok`)
    *   `GEMINI_API_KEY` / `GROK_API_KEY`: *Your API key*

### Frontend (Static Site on Vercel or Render)
1.  Deploy a new project pointing to your repository.
2.  Set the **Root Directory** to `frontend`.
3.  Configure the build settings:
    *   **Framework Preset**: Vite (if using Vercel)
    *   **Build Command**: `npm install && npm run build`
    *   **Output / Publish Directory**: `dist`
4.  Add environment variables:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (must end in `/api`)
