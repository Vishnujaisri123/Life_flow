const express = require('express');
const {
  getTasks,
  getTodayTasks,
  createTask,
  updateTask,
  reorderTasks,
  completeTask,
  deleteTask,
  syncGoogleCalendar,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/sync-google', syncGoogleCalendar);
router.get('/today', getTodayTasks);
router.get('/', getTasks);
router.patch('/reorder', reorderTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

module.exports = router;
