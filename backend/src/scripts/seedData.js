require('dotenv').config({ path: __dirname + '/../../.env' })
const mongoose = require('mongoose')
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const Transaction = require('../models/Transaction')

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find test user
    const user = await User.findOne({ email: 'test@example.com' })
    if (!user) {
      console.log('Test user not found. Please create a user first.')
      process.exit(1)
    }

    // Find or create portfolio
    let portfolio = await Portfolio.findOne({ userId: user._id })
    if (!portfolio) {
      portfolio = new Portfolio({ userId: user._id })
    }

    // Add test assets
    portfolio.assets = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 0.125,
        source: 'Test Exchange',
        sourceType: 'exchange',
        currentPrice: 43250,
        totalValue: 5406.25,
        change24h: -125.50,
        changePercent24h: -2.27,
        pnl24h: -125.50
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 2.5,
        source: 'Test Exchange',
        sourceType: 'exchange',
        currentPrice: 2280,
        totalValue: 5700,
        change24h: -180.00,
        changePercent24h: -3.06,
        pnl24h: -180.00
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        amount: 15,
        source: 'Test Wallet',
        sourceType: 'wallet',
        currentPrice: 95.50,
        totalValue: 1432.50,
        change24h: -125.00,
        changePercent24h: -8.02,
        pnl24h: -125.00
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        amount: 1000,
        source: 'Test Exchange',
        sourceType: 'exchange',
        currentPrice: 1.00,
        totalValue: 1000,
        change24h: 0,
        changePercent24h: 0,
        pnl24h: 0
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        amount: 500,
        source: 'Test Exchange',
        sourceType: 'exchange',
        currentPrice: 1.00,
        totalValue: 500,
        change24h: 0,
        changePercent24h: 0,
        pnl24h: 0
      }
    ]

    // Add performance history (last 365 days)
    const now = new Date()
    portfolio.performanceHistory = []
    
    // Generate hourly data for last 24 hours
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now)
      date.setHours(date.getHours() - i)
      const variation = 1 + (Math.random() - 0.5) * 0.02 // ±1% variation
      const value = 14038.75 * variation
      portfolio.performanceHistory.push({
        timestamp: date,
        totalValue: value
      })
    }
    
    // Generate daily data for last 365 days
    for (let i = 365; i >= 1; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Simulate realistic market movements
      const trend = Math.sin(i / 30) * 0.2 // Long-term wave
      const noise = (Math.random() - 0.5) * 0.1 // Daily volatility
      const variation = 1 + trend + noise
      const value = 14038.75 * variation
      
      portfolio.performanceHistory.push({
        timestamp: date,
        totalValue: value
      })
    }

    portfolio.lastSync = new Date()
    await portfolio.save()
    console.log('Portfolio data added successfully')

    // Add test transactions
    const transactions = [
      {
        userId: user._id,
        type: 'Received',
        asset: { symbol: 'BTC', name: 'Bitcoin', amount: 0.05 },
        value: 2162.50,
        source: 'Test Exchange',
        sourceType: 'exchange',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: user._id,
        type: 'Sent',
        asset: { symbol: 'ETH', name: 'Ethereum', amount: 0.5 },
        value: 1140,
        source: 'Test Exchange',
        sourceType: 'exchange',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: user._id,
        type: 'Received',
        asset: { symbol: 'SOL', name: 'Solana', amount: 10 },
        value: 955,
        source: 'Test Wallet',
        sourceType: 'wallet',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: user._id,
        type: 'Buy',
        asset: { symbol: 'USDT', name: 'Tether', amount: 1000 },
        value: 1000,
        source: 'Test Exchange',
        sourceType: 'exchange',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        userId: user._id,
        type: 'Swap',
        asset: { symbol: 'USDC', name: 'USD Coin', amount: 500 },
        value: 500,
        source: 'Test Exchange',
        sourceType: 'exchange',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ]

    // Clear existing transactions and add new ones
    await Transaction.deleteMany({ userId: user._id })
    await Transaction.insertMany(transactions)
    console.log('Transaction history added successfully')

    console.log('\n✅ Seed data added successfully!')
    console.log('Portfolio value: $14,038.75')
    console.log('Assets: 5 (BTC, ETH, SOL, USDT, USDC)')
    console.log('Transactions: 5')
    
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

// Run the script
seedData()