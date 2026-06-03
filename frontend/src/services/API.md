# LifeFlow frontend → API mapping

Base URL: `VITE_API_URL` (e.g. `http://localhost:5000/api`)

See `backend/README.md` for full backend setup and Render deployment.

## Client modules

| Module | Purpose |
|--------|---------|
| `api.ts` | Base fetch, token storage, `isApiConfigured()` |
| `authApi.ts` | signup, login, me, logout |
| `taskApi.ts` | tasks CRUD + mapping to `TaskItem` |
| `placeholders.ts` | Demo data when `VITE_API_URL` unset |

## Wired pages

- **Login / Signup** — real API when `VITE_API_URL` is set; demo link otherwise
- **Tasks** — `useTasks()` fetches `GET /tasks` when API configured; else placeholders

## Still placeholder-only

Dashboard stats, notifications, analytics, calendar, AI assistant, profile
