# LifeFlow API (Backend)

Node.js + Express + MongoDB (Mongoose) REST API for the LifeFlow AI productivity SaaS frontend.

## Quick start (local)

1. Install dependencies: `cd backend && npm install`
2. Copy env: `cp .env.example .env` and set `MONGODB_URI` and `JWT_SECRET`
3. Run: `npm run dev` — base URL `http://localhost:5000/api`, health `GET /api/health`

Without a valid `MONGODB_URI`, the server exits on startup.

## Environment variables

- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — JWT signing secret (required)
- `PORT` — default 5000
- `NODE_ENV` — development | production
- `CORS_ORIGIN` — comma-separated origins, e.g. `http://localhost:5173`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — optional FCM server push

### Firebase Cloud Messaging (optional)

1. Create a Firebase project → Project settings → Service accounts → Generate new private key.
2. Set backend env vars from the JSON: `project_id`, `client_email`, `private_key` (escape newlines as `\n` in `.env`).
3. Install admin SDK in backend: `npm install firebase-admin`.
4. Frontend: set all `VITE_FIREBASE_*` vars in `.env.local`, copy `public/firebase-config.json.example` to `public/firebase-config.json` with web app config, add Web Push certificate (VAPID) as `VITE_FIREBASE_VAPID_KEY`.
5. Sign in, allow notifications — token registers via `POST /api/notifications/fcm-token`.
6. Reminders with `notificationType: push` receive server cron push when due (60s tick).

Without credentials, FCM tokens are still stored; push is skipped gracefully.

## API endpoints

Response shape: `{ success, message, data }`.

**Health:** GET `/api/health`

**Auth:** POST `/api/auth/signup`, POST `/api/auth/login`, GET `/api/auth/me` (JWT)

**Tasks (JWT):** GET `/api/tasks`, GET `/api/tasks/today`, POST `/api/tasks`, PUT `/api/tasks/:id`, PATCH `/api/tasks/:id/complete`, DELETE `/api/tasks/:id`

**Reminders (JWT):** GET `/api/reminders`, GET `/api/reminders/due`, GET `/api/reminders/history`, POST `/api/reminders`, PUT `/api/reminders/:id`, DELETE `/api/reminders/:id`, PATCH `/api/reminders/:id/snooze`, PATCH `/api/reminders/:id/dismiss`, PATCH `/api/reminders/:id/read`, PATCH `/api/reminders/:id/trigger`

**Notifications (JWT):** POST `/api/notifications/fcm-token`, POST `/api/notifications/test-push`

**Analytics (JWT):** GET `/api/analytics` — productivity score, streak, task counts, weekly series

## Render deployment

Web Service, root directory `backend`, build `npm install`, start `npm start`, health check `/api/health`. Set env vars in dashboard. See `render.yaml`.

## Frontend

Set `VITE_API_URL=http://localhost:5000/api` in the Vite app `.env.local`.
