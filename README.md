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
    *   `create_task`: Schedules a new task with automatic IST date normalization and timezone metadata.
    *   `update_task` / `reschedule`: Modifies task titles, dates, or progress with automatic date parsing in IST timezone.
    *   `create_goal` / `update_goal`: Creates objectives or logs progress percentage.
*   **Dangerous Actions** (returns a pending confirmation card to the frontend for user consent before database modification):
    *   `delete_task`
    *   `delete_goal`

### 4. AI Date Normalization
The AI assistant's action payloads are automatically processed through `normalizeAiDates()` in `backend/services/aiToolService.js` to ensure:
*   All date fields (`dueDate`, `startTime`, `endTime`, `reminderTime`, `recurrenceEnd`) are parsed as IST wall-clock times.
*   Dates are converted to UTC for consistent MongoDB storage.
*   AI-generated task times are never interpreted as local browser timezone or UTC directly.
*   System prompt includes IST context and UTC conversion examples for AI guidance.

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
*   **🕐 IST Timezone Handling**: All task dates are stored as UTC in MongoDB with explicit `timezone: "Asia/Kolkata"` metadata. The frontend uses `Intl.DateTimeFormat` with `timeZone: "Asia/Kolkata"` for consistent IST rendering across all components and time calculations.
*   **🎨 Dynamic Task Status Colors**: Tasks display with status-specific visual styles: completed (green), active (blue), pending (gray), rescheduled (orange), and overdue (red).

---

## 🕐 IST Timezone Management

LifeFlow ensures consistent IST (Asia/Kolkata, UTC+5:30) handling across the entire stack:

### Backend Timezone Utilities (`backend/utils/tzUtils.js`)
*   **`parseISTDateTime(value)`**: Parses incoming date strings as IST wall-clock time, then converts to UTC for storage in MongoDB.
*   **`istTimeToUTC(hours, minutes, refDate)`**: Converts IST wall-clock time to UTC Date object.
*   **`getTodayRangeIST()`**: Returns today's IST date range (start and end) in UTC for database queries.
*   **`getISTDayRange(dateString)`**: Gets a specific IST day's range in UTC.
*   **`formatForAI(date)`**: Formats UTC dates as readable IST strings for AI context prompts.

### Frontend IST Utilities (`frontend/src/utils/ist.ts`)
*   **`formatISTDateTime(value, options)`**: Returns full formatted IST date-time string using Intl.DateTimeFormat.
*   **`formatISTTime(value)`**: Returns IST time in `HH:mm AM/PM` format.
*   **`formatISTDate(value)`**: Returns IST date in `MMM D YYYY` format.
*   **`getISTDateKey(value)`**: Returns `YYYY-MM-DD` string for consistent IST day grouping and filtering.
*   **`isTodayIST(value)`**: Checks if a date falls within today's IST calendar day.
*   **`getISTTimePixels(value)`**: Calculates pixel offset for timeline rendering based on IST time.
*   **`setISTWallClock(value, hours, minutes)`**: Sets IST wall-clock time on a date for drag-and-drop rescheduling.

### Data Model Updates
*   **Task Model**: Added `timezone: { type: String, default: 'Asia/Kolkata' }` to persist timezone metadata per task.
*   **Reminder Model**: Added `timezone: { type: String, default: 'Asia/Kolkata' }` to sync with task timezone.
*   **Task Status Enum**: Extended with `'rescheduled'` status to distinguish AI-reschedules from user-initiated reschedules.

---

## 🌟 Key Features

*   **⚡ Background Reminder Scheduler**: Runs an active cron-like background process on the Express backend (`backend/jobs/reminderCron.js`) to evaluate active reminders, trigger push notifications, and log notification history.
*   **📅 Google Calendar Task Sync**: Fully integrates with Google Calendar API to allow real-time calendar syncing, creating calendar events automatically when tasks are scheduled. Preserves task timezone during calendar event creation.
*   **🔔 Push Notifications**: Integrated with **Firebase Cloud Messaging (FCM)** for cross-platform push reminders (Web PWA, Android, and iOS).
*   **⏱️ Productivity Widgets**: Interactive glassmorphic widgets including a Pomodoro Timer, Habit completion lists, and gamified productivity scorecards. All time displays use IST formatting.
*   **📈 Rich Analytics Dashboard**: Beautiful visual analytics plotting completion rates, streaks, and category breakdowns.
*   **🎨 Dynamic Task Status Colors**: Tasks display with status-specific visual styles:
    - ✅ Completed (green): `bg-green-500/20 text-green-400`
    - 🔵 Active (blue): `bg-blue-500/20 text-blue-400`
    - ⚪ Pending (gray): `bg-gray-500/20 text-gray-400`
    - 🟠 Rescheduled (orange): `bg-orange-500/20 text-orange-400`
    - 🔴 Overdue (red): `bg-red-500/20 text-red-400`

---

## 📊 Database Models (Mongoose Schemas)

Located in `backend/models/`:
*   **`User`**: Core user credentials, avatar, timezone, and productivity metrics.
*   **`Task`**: Task details, statuses (`todo`, `in_progress`, `done`, `rescheduled`), priority (`low`, `medium`, `high`), due dates, categories, progress indicators, and **explicit `timezone` metadata** (defaults to `Asia/Kolkata` for IST consistency).
*   **`Goal`**: Multi-layered long-term objectives with target completion dates.
*   **`Habit`**: Recurring behavior checklists linked to the user's weekly planner.
*   **`Reminder`**: Smart notification schedules (times, custom messages, intervals) with **explicit `timezone` metadata** synced from associated task.
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

---

## 📝 Recent Updates (v2.0)

### ✨ IST Timezone Management (Complete Overhaul)
- **Backend**: Created `backend/utils/tzUtils.js` with 8 centralized IST conversion utilities for parsing, formatting, and range calculations.
- **Frontend**: Created `frontend/src/utils/ist.ts` with 8 IST formatting and calculation helpers using Intl.DateTimeFormat with `timeZone: "Asia/Kolkata"`.
- **Data Models**: Added explicit `timezone: "Asia/Kolkata"` field to Task and Reminder schemas for persistent timezone metadata.
- **Task Updates**: All task create/update operations now preserve timezone via `taskService.mapTaskUpdates()` which normalizes dates through IST parsing.
- **Reminder Sync**: `syncTaskReminder()` calculates reminder time in IST and preserves timezone on Reminder documents.
- **Google Calendar**: Event creation now uses stored task timezone for calendar event timeZone property.

### 🤖 AI Date Normalization
- **AI Action Processing**: Added `normalizeAiDates()` function in `backend/services/aiToolService.js` to parse AI-generated task dates as IST before UTC storage.
- **System Prompt Enhancement**: Updated `backend/services/aiContextService.js` to include IST context and UTC conversion examples in AI instructions.
- **Task Creation**: AI `create_task` and `update_task` actions now automatically normalize all date fields (dueDate, startTime, endTime, reminderTime, recurrenceEnd).
- **Rescheduled Status**: AI reschedules set task status to `'rescheduled'` to distinguish from user-initiated updates.

### 🎨 Task Status & Styling
- **Status Enum**: Extended task status to include `'rescheduled'` in addition to `'todo'`, `'in_progress'`, `'done'`.
- **Status Detection**: Updated `frontend/src/components/tasks/taskStatus.ts` with explicit rescheduled status detection and orange color styling.
- **Frontend Components**: All task components (TaskCard, TaskDetailModal, TaskWidgets, DailyTimeline) updated to use IST utilities for consistent time rendering.
- **Calendar Grouping**: Calendar view now groups tasks by IST date keys for correct day-based organization.

### 🔧 Bug Fixes
- **ReferenceError Fix**: Replaced date-fns `isToday()` imports with `isTodayIST()` in taskContext.ts, TimelineWidgets.tsx, and CalendarPage.tsx to fix "isToday is not defined" error on production.
- **Tomorrow Detection**: Improved `formatDue()` in taskApi.ts with robust UTC day comparison to prevent timezone misinterpretation.
- **Timeline Rendering**: Fixed IST-aware pixel calculations and drag-drop reschedule time setting in DailyTimeline component.

---
