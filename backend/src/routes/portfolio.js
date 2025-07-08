const express = require('express')
const Portfolio = require('../models/Portfolio')
const authMiddleware = require('../middleware/auth')
const { syncPortfolio } = require('../services/syncService')

const router = express.Router()

// Get portfolio summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id })
    
    if (!portfolio) {
      return res.json({
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercent24h: 0,
        assets: [],
        lastSync: null
      })
    }
    
    res.json({
      totalValue: portfolio.totalValue,
      totalChange24h: portfolio.totalChange24h,
      totalChangePercent24h: portfolio.totalChangePercent24h,
      assets: portfolio.assets,
      lastSync: portfolio.lastSync
    })
  } catch (error) {
    console.error('Get portfolio error:', error)
    res.status(500).json({ message: 'Failed to fetch portfolio' })
  }
})

// Get portfolio performance history
router.get('/performance/:timeframe', authMiddleware, async (req, res) => {
  try {
    const { timeframe } = req.params
    const portfolio = await Portfolio.findOne({ userId: req.user._id })
    
    if (!portfolio || !portfolio.performanceHistory.length) {
      return res.json({ labels: [], values: [] })
    }
    
    // Filter performance history based on timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '24H':
        startDate.setHours(now.getHours() - 24)
        break
      case '1W':
        startDate.setDate(now.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'All':
        startDate = new Date(0)
        break
      default:
        startDate.setHours(now.getHours() - 24)
    }
    
    const filteredHistory = portfolio.performanceHistory.filter(
      point => point.timestamp >= startDate
    )
    
    // Format for chart
    const labels = filteredHistory.map(point => point.timestamp)
    const values = filteredHistory.map(point => point.totalValue)
    
    res.json({ labels, values })
  } catch (error) {
    console.error('Get performance error:', error)
    res.status(500).json({ message: 'Failed to fetch performance data' })
  }
})

// Get all assets (for asset details page)
router.get('/assets', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id })
    
    if (!portfolio) {
      return res.json({ assets: [] })
    }
    
    // Calculate allocation percentages
    const totalValue = portfolio.totalValue || 1 // Avoid division by zero
    const assetsWithAllocation = portfolio.assets.map(asset => ({
      ...asset.toObject(),
      allocation: (asset.totalValue / totalValue) * 100
    }))
    
    res.json({ assets: assetsWithAllocation })
  } catch (error) {
    console.error('Get assets error:', error)
    res.status(500).json({ message: 'Failed to fetch assets' })
  }
})

// Sync portfolio
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    // Check if user has any integrations
    if (!req.user.integrations || req.user.integrations.length === 0) {
      return res.status(400).json({ message: 'No integrations found. Please add an exchange or wallet first.' })
    }
    
    // Perform sync (implement in syncService)
    const result = await syncPortfolio(req.user._id)
    
    res.json({ 
      message: 'Portfolio synced successfully',
      assetsUpdated: result.assetsUpdated,
      lastSync: result.lastSync
    })
  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ message: 'Sync failed. Please try again.' })
  }
})

module.exports = router