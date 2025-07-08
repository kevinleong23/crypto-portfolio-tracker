const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -integrations.apiKey -integrations.apiSecret')
    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
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
    const { currentPassword, newPassword } = req.body
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    
    // Get user with password
    const user = await User.findById(req.user._id)
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    
    // Update password
    user.password = newPassword
    await user.save()
    
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Failed to change password' })
  }
})

// Toggle 2FA
router.post('/2fa/toggle', authMiddleware, async (req, res) => {
  try {
    const { enable } = req.body
    
    req.user.twoFactorEnabled = enable
    
    if (enable) {
      // Generate 2FA secret (implement with speakeasy or similar)
      // For now, just enable the flag
      req.user.twoFactorSecret = 'temporary-secret'
    } else {
      req.user.twoFactorSecret = undefined
    }
    
    await req.user.save()
    
    res.json({ 
      message: `2FA ${enable ? 'enabled' : 'disabled'} successfully`,
      twoFactorEnabled: req.user.twoFactorEnabled
    })
  } catch (error) {
    console.error('Toggle 2FA error:', error)
    res.status(500).json({ message: 'Failed to toggle 2FA' })
  }
})

module.exports = router