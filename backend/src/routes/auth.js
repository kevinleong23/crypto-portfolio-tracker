const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')

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

// Google OAuth (placeholder - implement with passport.js)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body
    
    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] })
    
    if (!user) {
      user = new User({
        googleId,
        email,
        username: name.replace(/\s+/g, '').toLowerCase(),
        password: undefined
      })
      await user.save()
      
      // Create empty portfolio
      const portfolio = new Portfolio({ userId: user._id })
      await portfolio.save()
    }
    
    // Generate token
    const token = generateToken(user._id)
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ message: 'Google authentication failed' })
  }
})

module.exports = router