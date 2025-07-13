const express = require('express')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Get recent transactions (last 10)
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    // Get user with integrations to map display names
    const user = await User.findById(req.user._id)
    
    // Create display name map
    const displayNameMap = {}
    user.integrations.forEach((integration, index) => {
      const key = integration.name
      const sameTypeCount = user.integrations
        .slice(0, index)
        .filter(i => i.name === integration.name && i.type === integration.type).length
      
      displayNameMap[key] = integration.displayName || 
        `${integration.name} ${integration.type === 'wallet' ? 'Wallet' : 'Exchange'} ${sameTypeCount + 1}`
    })
    
    const transactions = await Transaction.find({ 
      userId: req.user._id,
      source: { $nin: ['Test Exchange', 'Test Wallet'] } // Exclude test sources
    })
      .sort({ timestamp: -1 })
      .limit(10)
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      date: tx.timestamp,
      type: tx.type,
      asset: `${tx.asset.amount} ${tx.asset.symbol}`,
      portfolio: displayNameMap[tx.source] || tx.source,
      status: tx.status,
      txHash: tx.txHash
    }))
    
    res.json(formattedTransactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ message: 'Failed to fetch transactions' })
  }
})

// Get transactions by asset
router.get('/asset/:symbol', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params
    const { limit = 50, skip = 0 } = req.query
    
    const transactions = await Transaction.find({ 
      userId: req.user._id,
      'asset.symbol': symbol.toUpperCase()
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
    
    const total = await Transaction.countDocuments({ 
      userId: req.user._id,
      'asset.symbol': symbol.toUpperCase()
    })
    
    res.json({
      transactions,
      total,
      hasMore: skip + transactions.length < total
    })
  } catch (error) {
    console.error('Get asset transactions error:', error)
    res.status(500).json({ message: 'Failed to fetch transactions' })
  }
})

// Get transaction statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ])
    
    const totalTransactions = await Transaction.countDocuments({ userId: req.user._id })
    
    res.json({
      totalTransactions,
      byType: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalValue: stat.totalValue
        }
        return acc
      }, {})
    })
  } catch (error) {
    console.error('Get transaction stats error:', error)
    res.status(500).json({ message: 'Failed to fetch transaction statistics' })
  }
})

// Manual transaction entry (optional feature)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, symbol, name, amount, value, source, sourceType, timestamp } = req.body
    
    // Validate required fields
    if (!type || !symbol || !name || !amount || !value || !source || !sourceType) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      asset: {
        symbol: symbol.toUpperCase(),
        name,
        amount: parseFloat(amount)
      },
      value: parseFloat(value),
      source,
      sourceType,
      timestamp: timestamp || new Date(),
      status: 'completed'
    })
    
    await transaction.save()
    
    res.status(201).json({
      message: 'Transaction added successfully',
      transaction
    })
  } catch (error) {
    console.error('Add transaction error:', error)
    res.status(500).json({ message: 'Failed to add transaction' })
  }
})

module.exports = router