const express = require('express');
const {
  getTasks,
  getTodayTasks,
  createTask,
  updateTask,
  reorderTasks,
  completeTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/today', getTodayTasks);
router.get('/', getTasks);
router.patch('/reorder', reorderTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

module.exports = router;
