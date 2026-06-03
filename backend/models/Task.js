const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'work',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    startDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    reminderTime: {
      type: Date,
      default: null,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderBefore: {
      type: Number,
      default: 0,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    vibrationEnabled: {
      type: Boolean,
      default: true,
    },
    fullscreenAlertEnabled: {
      type: Boolean,
      default: false,
    },
    lastReminderSent: {
      type: Date,
      default: null,
    },
    notificationSound: {
      type: String,
      enum: ['default', 'chime', 'bell', 'soft', 'urgent', 'silent'],
      default: 'default',
    },
    tags: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    recurrenceFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null,
    },
    recurrenceInterval: {
      type: Number,
      default: 1,
      min: 1,
    },
    recurrenceEnd: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    googleEventId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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

taskSchema.pre('save', function syncCompleted(next) {
  if (this.dueDate == null && this.endTime) {
    this.dueDate = this.endTime;
  }
  if (this.endTime == null && this.dueDate) {
    this.endTime = this.dueDate;
  }
  if (this.startDate == null && this.startTime) {
    this.startDate = this.startTime;
  }
  if (this.recurrenceFrequency) {
    this.recurring = true;
  } else {
    this.recurring = false;
  }
  if (this.status === 'done') {
    this.completed = true;
  } else if (this.completed) {
    this.status = 'done';
  }
  return next();
});

module.exports = mongoose.model('Task', taskSchema);
