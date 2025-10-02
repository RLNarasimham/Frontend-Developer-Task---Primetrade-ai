// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/userModel');
// const sendEmail = require('../utils/sendEmail');
// const crypto = require('crypto');

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };


// const registerUser = async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body;

//     if (!fullName || !email || !password) {
//       return res.status(400).json({ message: 'Please add all fields' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       fullName,
//       email,
//       password: hashedPassword,
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid user data' });
//     }
//   } catch (error) {
//     console.error('REGISTER ERROR:', error);
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// };


// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({
//         _id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('LOGIN ERROR:', error);
//     res.status(500).json({ message: 'Server error during login' });
//   }
// };

// const getUserProfile = async (req, res) => {
//   try {
//     res.status(200).json(req.user);
//   } catch (error) {
//     console.error('GET PROFILE ERROR:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const updateUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (user) {
//       user.fullName = req.body.fullName || user.fullName;
//       user.email = req.body.email || user.email;
//       if (req.body.password) {
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(req.body.password, salt);
//       }

//       const updatedUser = await user.save();
//       res.json({
//         _id: updatedUser.id,
//         fullName: updatedUser.fullName,
//         email: updatedUser.email,
//         token: generateToken(updatedUser._id),
//       });
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error('UPDATE PROFILE ERROR:', error);
//     res.status(500).json({ message: 'Server error during profile update' });
//   }
// };


// const forgotPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (!user) {
//       return res.status(200).json({ message: 'Email sent' });
//     }

//     const resetToken = user.getResetPasswordToken();
//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

//     const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Password Reset Token',
//         message,
//       });

//       res.status(200).json({ message: 'Email sent' });
//     } catch (err) {
//       console.error(err);
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });
//       res.status(500).json({ message: 'Email could not be sent' });
//     }
//   } catch (error) {
//     console.error('FORGOT PASSWORD ERROR:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile,
//   updateUserProfile,
//   forgotPassword,
// };

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists (case-insensitive)
    const userExists = await User.findOne({
      email: email.toLowerCase()
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          fullName: user.fullName,
          email: user.email,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (case-insensitive email)
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Login successful
    res.status(200).json({
      success: true,
      data: {
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate email if being updated
    if (req.body.email && req.body.email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email already exists
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update fields
    user.fullName = req.body.fullName?.trim() || user.fullName;
    user.email = req.body.email?.toLowerCase() || user.email;

    // Update password if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      }
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL - use environment variable for frontend URL
    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    } catch (err) {
      console.error('EMAIL SEND ERROR:', err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/users/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token from params
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};