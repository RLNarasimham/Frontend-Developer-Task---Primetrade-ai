// const mongoose = require('mongoose');

// const taskSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   title: {
//     type: String,
//     required: [true, 'Please add a title'],
//     trim: true,
//     maxlength: [100, 'Title cannot be more than 100 characters'],
//   },
//   description: {
//     type: String,
//     maxlength: [500, 'Description cannot be more than 500 characters'],
//     default: '',
//   },
//   status: {
//     type: String,
//     required: true,
//     enum: ['pending', 'in_progress', 'completed'],
//     default: 'pending',
//   },
//   priority: {
//     type: String,
//     required: true,
//     enum: ['low', 'medium', 'high'],
//     default: 'medium',
//   },
// }, {
//   timestamps: true,
// });

// module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User reference is required'],
    ref: 'User',
    index: true, // Index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
    default: '',
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    index: true, // Index for filtering by status
  },
  priority: {
    type: String,
    required: true,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium',
    index: true, // Index for filtering by priority
  },
  dueDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        // Allow null/undefined, but if set, must be in the future for new tasks
        if (!value) return true;
        if (this.isNew) {
          return value >= new Date();
        }
        return true;
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date,
    default: null,
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters'],
    default: 'general',
    lowercase: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot be more than 30 characters'],
  }],
  attachments: [{
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask title cannot be more than 100 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    }
  }],
  reminders: [{
    reminderDate: {
      type: Date,
      required: true,
    },
    reminderType: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push',
    },
    sent: {
      type: Boolean,
      default: false,
    }
  }],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  isArchived: {
    type: Boolean,
    default: false,
    index: true, // Index for filtering archived tasks
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    default: '',
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [0, 'Estimated time cannot be negative'],
    default: null,
  },
  actualTime: {
    type: Number, // in minutes
    min: [0, 'Actual time cannot be negative'],
    default: null,
  },
  recurringTask: {
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: null,
    },
    nextOccurrence: {
      type: Date,
      default: null,
    }
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: null,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot be more than 200 characters'],
      default: null,
    }
  },
  metadata: {
    device: {
      type: String,
      default: null,
    },
    platform: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, isArchived: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index

// Virtual field for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate < new Date();
});

// Virtual field for subtask completion percentage
taskSchema.virtual('subtaskCompletionRate').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(st => st.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual field for days until due
taskSchema.virtual('daysUntilDue').get(function () {
  if (!this.dueDate) return null;
  const diffTime = this.dueDate - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  // Set completedAt when task is marked as completed
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status !== 'completed' && this.completedAt) {
      this.completedAt = null;
    }
  }

  // Update progress based on subtasks
  if (this.subtasks && this.subtasks.length > 0) {
    const completed = this.subtasks.filter(st => st.completed).length;
    this.progress = Math.round((completed / this.subtasks.length) * 100);
  }

  // Set archivedAt when task is archived
  if (this.isModified('isArchived') && this.isArchived && !this.archivedAt) {
    this.archivedAt = new Date();
  } else if (this.isModified('isArchived') && !this.isArchived) {
    this.archivedAt = null;
  }

  // Update completedAt for subtasks
  if (this.isModified('subtasks')) {
    this.subtasks.forEach(subtask => {
      if (subtask.completed && !subtask.completedAt) {
        subtask.completedAt = new Date();
      } else if (!subtask.completed && subtask.completedAt) {
        subtask.completedAt = null;
      }
    });
  }

  next();
});

// Pre-save middleware to sanitize and validate data
taskSchema.pre('save', function (next) {
  // Ensure tags are unique and limited
  if (this.tags) {
    this.tags = [...new Set(this.tags)].slice(0, 10); // Max 10 unique tags
  }

  // Ensure assignedTo are unique
  if (this.assignedTo) {
    this.assignedTo = [...new Set(this.assignedTo.map(id => id.toString()))].map(id => mongoose.Types.ObjectId(id));
  }

  next();
});

// Static method to get user's task statistics
taskSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] }
                ]
              },
              1,
              0
            ]
          }
        },
        highPriority: {
          $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0
  };
};

// Static method to get tasks due soon
taskSchema.statics.getTasksDueSoon = async function (userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    user: userId,
    isArchived: false,
    status: { $nin: ['completed', 'cancelled'] },
    dueDate: {
      $gte: new Date(),
      $lte: futureDate
    }
  }).sort({ dueDate: 1 });
};

// Instance method to mark task as complete
taskSchema.methods.markComplete = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  return this.save();
};

// Instance method to archive task
taskSchema.methods.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Instance method to unarchive task
taskSchema.methods.unarchive = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

// Instance method to add a subtask
taskSchema.methods.addSubtask = async function (title) {
  this.subtasks.push({ title, completed: false });
  return this.save();
};

// Instance method to share task with another user
taskSchema.methods.shareWithUser = async function (userId, permission = 'view') {
  const alreadyShared = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );

  if (!alreadyShared) {
    this.sharedWith.push({
      user: userId,
      permission,
      sharedAt: new Date()
    });
    return this.save();
  }

  return this;
};

// Text search index for title and description
taskSchema.index({ title: 'text', description: 'text', notes: 'text' });

module.exports = mongoose.model('Task', taskSchema);