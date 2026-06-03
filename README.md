# LifeFlow AI 🚀

[![Vite](https://img.shields.io/badge/Vite-6.0-blue?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind--v4.0-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-blueviolet?logo=expo&logoColor=white)](https://expo.dev)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb&logoColor=white)](https://www.mongodb.com)

**LifeFlow AI** is a premium, full-stack personal productivity SaaS ecosystem. It integrates a rich, glassmorphic **Web Dashboard** (React, TypeScript, Vite, Tailwind CSS v4, TanStack Router), a secure and scalable **REST API** (Node.js, Express, MongoDB/Mongoose, JWT), and a **Mobile Companion App** (React Native, Expo) to keep users aligned with their habits, tasks, goals, and schedules.

---

## 🗺️ System Architecture

```
                    ┌─────────────────────────┐
                    │  Vite React Web App     │
                    │  (Tailwind v4, Framer)  │
                    └───────────┬─────────────┘
                                │
                                │ HTTP / WebSockets / FCM
                                ▼
  ┌──────────────────┐    ┌───────────┐    ┌────────────────────┐
  │  Expo Mobile App │───►│ Express   │◄──►│ MongoDB Database   │
  │  (React Native)  │    │ API Server│    │ (Mongoose Schemas) │
  └──────────────────┘    └─────┬─────┘    └────────────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Gemini API  │         │  Groq API    │         │  OpenRouter  │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## 🤖 Multi-Provider Agentic AI Engine

LifeFlow features a resilient and context-aware **AI Assistant** capable of automating your workspace. Instead of relying on a single AI provider, the backend implements a resilient orchestrator (`backend/services/aiService.js`) supporting multiple LLMs with automatic fallback routing.

### 1. Resilient Fallback Routing Cascade
If your preferred provider is rate-limited, times out, or has an API key configuration error, LifeFlow automatically cascades down the fallback chain to fetch a response. The fallback priority order is:
1.  **OpenRouter API** (`google/gemini-2.5-pro` or custom model)
2.  **Groq API** (`grok-2` / `grok-beta`)
3.  **Gemini API** (`gemini-2.5-flash` natively)
4.  **OpenAI API** (`gpt-4o-mini`)

### 2. Context-Aware Prompting Engine
Using `backend/services/aiContextService.js`, the assistant gathers real-time user data before every prompt. The generated system instructions contain:
*   **User Profile**: Name, current local timestamp, timezone.
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

## 📂 Monorepo Structure

*   **[`/backend`](file:///C:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/backend)**: Express API. Handles authorization, database CRUD, background reminder schedules, and the AI Service.
*   **[`/frontend`](file:///C:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/frontend)**: Vite + TS React Web Application. Implements Tailwind CSS v4, TanStack Query, Framer Motion, and PWA capabilities.
*   **[`/mobile`](file:///C:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/mobile)**: Expo React Native application for iOS and Android.

---

## 🌟 Key Features

*   **⚡ Background Reminder Scheduler**: Runs an active cron-like background process on the Express backend (`backend/jobs/reminderCron.js`) to evaluate active reminders, trigger push notifications, and log notification history.
*   **📅 Google Calendar Task Sync**: Fully integrates with Google Calendar API to allow real-time calendar syncing, creating calendar events automatically when tasks are scheduled.
*   **🔔 Push Notifications**: Integrated with **Firebase Cloud Messaging (FCM)** for cross-platform push reminders (Web PWA, Android, and iOS).
*   **⏱️ Productivity Widgets**: Interactive glassmorphic widgets including a Pomodoro Timer, Habit completion lists, and gamified productivity scorecards.
*   **📈 Rich Analytics Dashboard**: Beautiful visual analytics plotting completion rates, streaks, and category breakdowns.

---

## 📊 Database Models (Mongoose Schemas)

Located in `backend/models/`:
*   **`User`**: Core user credentials, avatar, timezone, and productivity metrics.
*   **`Task`**: Task details, statuses (`todo`, `in-progress`, `completed`), priority (`low`, `medium`, `high`), due dates, categories, and progress indicators.
*   **`Goal`**: Multi-layered long-term objectives with target completion dates.
*   **`Habit`**: Recurring behavior checklists linked to the user's weekly planner.
*   **`Reminder`**: Smart notification schedules (times, custom messages, intervals).
*   **`ReminderHistory`**: Execution logs of triggered notifications and delivery statuses.
*   **`ChatMessage`**: History of conversation threads between users and the AI Assistant.
*   **`SavedPlan`**: AI-generated step-by-step plans created for users' personal goals.

---

## 💻 Local Development Setup

### 1. Installation
Initialize all sub-modules with a single command from the project root:
```bash
# Install root dependencies (concurrently)
npm install

# Install all sub-module dependencies (backend, frontend, mobile)
npm run install:all
```

### 2. Environment Configurations
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

# Provider API Keys
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional settings
GROK_MODEL=grok-beta
OPENROUTER_MODEL=google/gemini-2.5-pro

# Firebase configurations (for FCM)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

#### Frontend Settings (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔌 API Integrations Setup Guides

### 1. Google Calendar Integration
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project and enable the **Google Calendar API**.
3.  Navigate to **APIs & Services > Credentials** and create an **OAuth 2.0 Client ID**.
4.  Configure the OAuth Consent Screen and add the necessary scopes:
    *   `.../auth/calendar.events`
    *   `.../auth/calendar`
5.  Add your redirect URI (e.g. `http://localhost:5000/api/calendar/callback`).
6.  Save your client secret key and ID to configure in backend environment variables.

### 2. Firebase Cloud Messaging (FCM)
1.  Open the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Enable Cloud Messaging inside your Project Settings.
3.  Generate a new **Private Key** under **Service Accounts** and paste the JSON fields into your backend `.env` variables (`FIREBASE_PRIVATE_KEY` etc).
4.  Add a **Web App** to Firebase, download the client configurations, and rename the file as `firebase-config.json` inside the frontend `public/` directory.

---

## 🖥️ Running the Project

Use the following root-level commands to spin up the developer environments:
*   **Run Web + Backend + Mobile**: `npm run dev`
*   **Run Web Frontend + Backend API only**: `npm run dev:web`
*   **Run Backend only**: `npm run dev:backend`
*   **Run Frontend only**: `npm run dev:frontend`
*   **Run Mobile (Expo) only**: `npm run dev:mobile`
