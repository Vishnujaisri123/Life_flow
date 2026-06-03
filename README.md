# LifeFlow AI 🚀

LifeFlow AI is a modern, full-stack personal productivity SaaS ecosystem. It integrates a rich, glassmorphic **Web Dashboard** (React, TypeScript, Vite, Tailwind CSS v4, TanStack Router), a secure **REST API** (Node.js, Express, MongoDB/Mongoose, JWT), and a **Mobile Companion** (React Native, Expo). 

At its core, LifeFlow features an **AI Productivity Assistant** powered by OpenRouter. The assistant doesn't just chat—it is context-aware and can execute actions on your behalf (e.g., creating, rescheduling, or deleting tasks and goals) with built-in confirmations for destructive actions.

---

## 📂 Project Structure

The project is structured as a monorepo:

*   **[`/backend`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/backend)**: Express API. Handles authorization, database CRUD, background reminder schedules, and OpenRouter AI completions.
*   **[`/frontend`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/frontend)**: Vite + TS React Web Application. Implements Tailwind CSS v4, TanStack Query, Framer Motion, and PWA capabilities.
*   **[`/mobile`](file:///c:/Users/RUTHISH%20VEER/Downloads/Life_flow-main/Life_flow-main/mobile)**: Expo React Native application for iOS and Android.

---

## 🌟 Key Features

1.  **AI Assistant with Action Tooling**:
    *   Integrates with LLMs (GPT-4o-mini, Gemini, Claude, etc.) via **OpenRouter**.
    *   Executes actions dynamically:
        *   *Safe Actions* (e.g., `create_task`, `update_task`, `create_goal`, `update_goal`) run instantly.
        *   *Dangerous Actions* (e.g., `delete_task`, `delete_goal`) return a confirmation card to the UI for user approval before execution.
2.  **Background Reminder Scheduler**:
    *   Runs an active cron-like background process on the backend to evaluate active reminders, trigger notifications, and log notification history.
3.  **Analytics & Productivity Scoring**:
    *   Tracks task completion rates, daily/weekly streaks, and updates user productivity scores in real time.
4.  **Habit & Goal Tracking**:
    *   Allows breaking down year-long or month-long goals into daily/weekly actionable habits and items.

---

## 📊 Database Models (MongoDB / Mongoose)

Located in `backend/models/`:

*   **`User`**: Core user data (name, email, password), avatar, timezone, and productivity metrics (streak, score, total/completed task count).
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
*   [OpenRouter API Key](https://openrouter.ai/) (optional, for AI features)

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

#### Backend Settings
Copy `backend/.env.example` to `backend/.env` and update:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lifeflow?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_signing_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
OPENROUTER_API_KEY=your_openrouter_api_key
```

#### Frontend Settings
Copy `frontend/.env.example` to `frontend/.env.local` and update:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Project
Use the following root-level commands to spin up the developer environments:

*   **Run Web + Backend + Mobile**:
    ```bash
    npm run dev
    ```
*   **Run Web Frontend + Backend API only**:
    ```bash
    npm run dev:web
    ```
*   **Run Backend only**:
    ```bash
    npm run dev:backend
    ```
*   **Run Frontend only**:
    ```bash
    npm run dev:frontend
    ```
*   **Run Mobile (Expo) only**:
    ```bash
    npm run dev:mobile
    ```

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

### Frontend (Static Site on Vercel or Render)
1.  Deploy a new project pointing to your repository.
2.  Set the **Root Directory** to `frontend`.
3.  Configure the build settings:
    *   **Framework Preset**: Vite (if using Vercel)
    *   **Build Command**: `npm install && npm run build`
    *   **Output / Publish Directory**: `dist`
4.  Add environment variables:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (must end in `/api`)
