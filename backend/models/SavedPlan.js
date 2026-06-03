const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  time: { type: String, required: true },
  activity: { type: String, required: true },
  notes: { type: String },
});

const savedPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    planData: {
      blocks: [blockSchema],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SavedPlan', savedPlanSchema);
