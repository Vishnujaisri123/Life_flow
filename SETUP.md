# LifeFlow — Full Stack Setup Guide

## 1. MongoDB Atlas (Free Database)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a **free M0 cluster** (choose any region)
3. Under **Database Access** → Add a user with password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, for dev)
5. Click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/lifeflow?retryWrites=true&w=majority
```

6. Open `backend/.env` and replace the `MONGODB_URI` line with your string

---

## 2. Run the Full Project

### Web (Backend + Frontend)
```bash
npm run dev:web
```
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173

### Mobile (Expo)
```bash
npm run dev:mobile
```
- Scan the QR code with the **Expo Go** app on your phone
- Or press `a` for Android emulator / `w` for web browser

### All Three Together
```bash
npm run dev
```

---

## 3. Mobile — Connect to Your Backend

The mobile app connects to `http://10.0.2.2:5000/api` by default (Android emulator).

**For a physical device**, edit `mobile/src/services/apiClient.ts`:
```ts
const API_URL = 'http://YOUR_LAN_IP:5000/api';
// e.g. http://192.168.1.5:5000/api
```
Find your LAN IP with: `ipconfig` (Windows) — look for IPv4 under Wi-Fi

---

## 4. Optional: AI Features
Get a free API key from https://openrouter.ai and add it to `backend/.env`:
```
OPENROUTER_API_KEY=sk-or-...
```

---

## 5. Optional: Push Notifications (Firebase)
1. Create a project at https://console.firebase.google.com
2. Add a Web app and copy the config to `frontend/.env.local`
3. Add service account credentials to `backend/.env`
