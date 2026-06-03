require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { startReminderCron } = require('./jobs/reminderCron');
const aiRoutes = require('./routes/aiRoutes');
const planRoutes = require('./routes/planRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/response');
const goalRoutes = require('./routes/goalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

app.use(
  cors({
    origin: parseCorsOrigins(),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  return sendSuccess(res, {
    message: 'LifeFlow API is running',
    data: {
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/goals', goalRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    startReminderCron(60_000);
    app.listen(PORT, () => {
      console.log(`LifeFlow API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();

module.exports = app;
