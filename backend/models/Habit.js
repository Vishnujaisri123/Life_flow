const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    streak: { type: Number, default: 0 },
    lastCompleted: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
