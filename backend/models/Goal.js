const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false },
});

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, enum: ['work', 'personal', 'health', 'learning', 'finance', 'other'], default: 'other' },
    targetDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['active', 'paused', 'completed', 'archived'], default: 'active' },
    milestones: [milestoneSchema],
    tasksLinked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
