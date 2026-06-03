const mongoose = require('mongoose');

const reminderHistorySchema = new mongoose.Schema(
  {
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    triggeredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    snoozedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soundType: { type: String },
    notificationType: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model('ReminderHistory', reminderHistorySchema);
