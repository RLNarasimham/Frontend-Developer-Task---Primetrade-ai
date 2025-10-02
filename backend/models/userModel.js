// const mongoose = require('mongoose');
// const crypto = require('crypto');

// const userSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: [true, 'Please add a full name'],
//   },
//   email: {
//     type: String,
//     required: [true, 'Please add an email'],
//     unique: true,
//     match: [
//       /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//       'Please add a valid email',
//     ],
//   },
//   password: {
//     type: String,
//     required: [true, 'Please add a password'],
//     minlength: 6,
//   },
//   passwordResetToken: String,
//   passwordResetExpires: Date,
// }, {
//   timestamps: true,
// });

// userSchema.methods.getResetPasswordToken = function () {

//   const resetToken = crypto.randomBytes(20).toString('hex');

//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

//   return resetToken;
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please add a valid email address',
    ],
    index: true, // Index for faster lookups
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Please add a valid phone number',
    ],
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters'],
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    language: {
      type: String,
      default: 'en',
      lowercase: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      }
    },
    taskReminders: {
      type: Boolean,
      default: true,
    }
  },
  socialLinks: {
    twitter: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    }
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    location: {
      country: String,
      city: String,
    },
    device: {
      type: String,
    },
    platform: {
      type: String,
    }
  }],
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
      select: false,
    },
    backupCodes: [{
      type: String,
      select: false,
    }]
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    device: {
      type: String,
    }
  }],
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted', 'pending'],
    default: 'active',
  },
  suspensionReason: {
    type: String,
    default: null,
  },
  suspendedUntil: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  passwordChangedAt: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLockedUntil: {
    type: Date,
    default: null,
  },
  metadata: {
    registrationIp: {
      type: String,
    },
    registrationDevice: {
      type: String,
    },
    registrationPlatform: {
      type: String,
    },
    referralSource: {
      type: String,
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Remove sensitive fields from JSON response
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.twoFactorAuth;
      delete ret.refreshTokens;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ accountStatus: 1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function () {
  if (!this.address || !this.address.street) return null;

  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.postalCode,
    this.address.country
  ].filter(Boolean);

  return parts.join(', ');
});

// Virtual for age
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Virtual for account age in days
userSchema.virtual('accountAgeDays').get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to handle password hashing if modified externally
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check if password is already hashed (starts with bcrypt prefix)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Set password changed timestamp
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure email is lowercase
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Pre-save middleware to limit login history
userSchema.pre('save', function (next) {
  if (this.loginHistory && this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50); // Keep last 50 logins
  }
  next();
});

// Instance method to check if password matches
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Instance method to check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Instance method to increment failed login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // If account is already locked and lock has expired, reset attempts
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.accountLockedUntil = null;
  } else {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 1 hour
    if (this.failedLoginAttempts >= 5) {
      this.accountLockedUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    }
  }

  return this.save();
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  return this.save();
};

// Instance method to record login
userSchema.methods.recordLogin = async function (loginData = {}) {
  this.lastLogin = Date.now();

  // Add to login history
  this.loginHistory.push({
    timestamp: Date.now(),
    ipAddress: loginData.ipAddress || null,
    userAgent: loginData.userAgent || null,
    location: loginData.location || {},
    device: loginData.device || null,
    platform: loginData.platform || null,
  });

  // Reset failed login attempts on successful login
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;

  return this.save();
};

// Instance method to soft delete user
userSchema.methods.softDelete = async function () {
  this.accountStatus = 'deleted';
  this.deletedAt = Date.now();
  this.isActive = false;
  return this.save();
};

// Instance method to restore deleted account
userSchema.methods.restore = async function () {
  this.accountStatus = 'active';
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

// Instance method to suspend account
userSchema.methods.suspend = async function (reason, duration) {
  this.accountStatus = 'suspended';
  this.suspensionReason = reason;
  if (duration) {
    this.suspendedUntil = Date.now() + duration;
  }
  return this.save();
};

// Instance method to check if JWT was issued before password change
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    accountStatus: 'active'
  });
};

// Static method to find by email (case-insensitive)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase()
  });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        },
        admins: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    admins: 0
  };
};

// Static method to cleanup expired tokens
userSchema.statics.cleanupExpiredTokens = async function () {
  const now = Date.now();

  await this.updateMany(
    {
      $or: [
        { passwordResetExpires: { $lt: now } },
        { emailVerificationExpires: { $lt: now } }
      ]
    },
    {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
        emailVerificationToken: 1,
        emailVerificationExpires: 1
      }
    }
  );
};

// Static method to cleanup old login history
userSchema.statics.cleanupLoginHistory = async function (daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  await this.updateMany(
    {},
    {
      $pull: {
        loginHistory: {
          timestamp: { $lt: cutoffDate }
        }
      }
    }
  );
};

module.exports = mongoose.model('User', userSchema);