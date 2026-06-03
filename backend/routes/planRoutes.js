const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPlans, getPlan, createPlan, updatePlan, deletePlan } = require('../controllers/planController');

router.use(protect);

router.route('/').get(getPlans).post(createPlan);
router.route('/:id').get(getPlan).put(updatePlan).delete(deletePlan);

module.exports = router;
