const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reminderTime: {
      type: Date,
      required: [true, 'Reminder time is required'],
      index: true,
    },
    soundType: {
      type: String,
      enum: ['default', 'chime', 'bell', 'soft', 'urgent', 'silent'],
      default: 'chime',
    },
    notificationType: {
      type: String,
      enum: ['push', 'email', 'in_app', 'browser'],
      default: 'in_app',
    },
    status: {
      type: String,
      enum: ['pending', 'triggered', 'snoozed', 'dismissed'],
      default: 'pending',
      index: true,
    },
    snoozeUntil: {
      type: Date,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Kolkata',
    },
    snoozedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
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

module.exports = mongoose.model('Reminder', reminderSchema);
