const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const { sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      })
    }
    
    // Create user
    const user = new User({ username, email, password })
    await user.save()
    
    // Create empty portfolio
    const portfolio = new Portfolio({ userId: user._id })
    await portfolio.save()
    
    // Generate token
    const token = generateToken(user._id)
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Generate token
    const token = generateToken(user._id)
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

        await user.save();
        await sendPasswordResetEmail(user.email, otp);

        res.json({ message: 'OTP sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending password reset email.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        res.json({ message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Error verifying OTP.' });
    }
});


// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password.' });
    }
});


// Google OAuth (placeholder - implement with passport.js)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    // Check if a user with this email already exists
    let user = await User.findOne({ email });

    if (user) {
      // If the user exists and has a password, they are a regular user.
      // Deny Google login.
      if (user.password) {
        return res.status(400).json({ message: 'This email is already registered. Please log in with your password.' });
      }
      // If the user exists and has a googleId, it's a valid Google login.
      // Update googleId if it's missing (e.g., first Google login after email was found)
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // If no user with this email exists, create a new Google-authenticated user
      user = new User({
        googleId,
        email,
        username: name.replace(/\s+/g, '').toLowerCase(),
        password: undefined // Explicitly set no password
      });
      await user.save();

      // Create an empty portfolio for the new user
      const portfolio = new Portfolio({ userId: user._id });
      await portfolio.save();
    }

    // Generate token for the user
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

module.exports = router