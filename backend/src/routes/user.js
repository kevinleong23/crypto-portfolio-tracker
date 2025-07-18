const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')
const { sendDeleteAccountOtpEmail } = require('../services/emailService')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars')
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const userId = req.user._id
    const extension = path.extname(file.originalname)
    cb(null, `${userId}${extension}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/
  const mimetype = allowedTypes.test(file.mimetype)
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb(new Error('Only .jpeg, .jpg, and .png formats are allowed'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
})

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userProfile = user.toObject();
    userProfile.hasPassword = !!user.password;
    delete userProfile.password;
    
    // Manually remove sensitive integration data
    if (userProfile.integrations) {
      userProfile.integrations.forEach(integration => {
        delete integration.apiKey;
        delete integration.apiSecret;
      });
    }
    
    res.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// Upload profile picture
router.post('/profile-picture', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const profilePictureUrl = `/public/uploads/avatars/${req.file.filename}`
    user.profilePictureUrl = profilePictureUrl
    await user.save()

    res.json({
      message: 'Profile picture uploaded successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl
      }
    })
  } catch (error) {
    console.error('Profile picture upload error:', error)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 2MB.' })
    }
    res.status(500).json({ message: error.message || 'Failed to upload profile picture' })
  }
})

// Update username
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }
    
    // Check if username exists
    const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } })
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }
    
    // Update username
    req.user.username = username
    await req.user.save()
    
    res.json({ message: 'Profile updated successfully', username })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate current password
    if (!currentPassword) {
      return res.status(400).json({ message: 'Please enter your current password' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Generate 2FA secret and QR code
router.post('/2fa/generate', authMiddleware, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `CryptoTracker (${req.user.email})`,
    });
    req.user.twoFactorTempSecret = secret.base32;
    await req.user.save();

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        throw new Error('Could not generate QR code');
      }
      res.json({ qrCode: data_url, secret: secret.base32 });
    });
  } catch (error) {
    console.error('2FA generate error:', error);
    res.status(500).json({ message: 'Failed to generate 2FA secret' });
  }
});

// Verify 2FA token and enable 2FA
router.post('/2fa/verify', authMiddleware, async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.twoFactorSecret = user.twoFactorTempSecret;
      user.twoFactorTempSecret = undefined;
      user.twoFactorEnabled = true;
      await user.save();
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA token' });
  }
});

// Disable 2FA
router.post('/2fa/disable', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorTempSecret = undefined;
    await user.save();
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

// Request OTP for account deletion
router.post('/request-delete-otp', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Ensure it's a Google-authenticated account
    if (user.password) {
      return res.status(400).json({ message: 'This route is only for Google-authenticated accounts.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.deleteAccountOtp = otp;
    user.deleteAccountExpires = Date.now() + 600000; // 10 minutes

    await user.save();
    await sendDeleteAccountOtpEmail(user.email, otp);

    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Request delete OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
});

// Delete account
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const { password, otp } = req.body;
    const user = await User.findById(req.user._id);

    // Handle Google-authenticated user deletion with OTP
    if (!user.password) {
      if (!otp || user.deleteAccountOtp !== otp || user.deleteAccountExpires < Date.now()) {
        return res.status(401).json({ message: 'Invalid or expired OTP.' });
      }
      user.deleteAccountOtp = undefined;
      user.deleteAccountExpires = undefined;
    } else {
      // Handle password-based user deletion
      if (!password) {
        return res.status(401).json({ message: 'Password is required to delete your account.'})
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    // Remove user and associated data (will trigger pre-remove hook)
    await user.deleteOne();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;