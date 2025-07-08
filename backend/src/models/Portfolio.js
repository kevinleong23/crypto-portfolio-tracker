const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true // e.g., 'MEXC', 'Binance', 'MetaMask'
  },
  sourceType: {
    type: String,
    enum: ['exchange', 'wallet'],
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  change24h: {
    type: Number,
    default: 0
  },
  changePercent24h: {
    type: Number,
    default: 0
  },
  pnl24h: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
})

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assets: [assetSchema],
  totalValue: {
    type: Number,
    default: 0
  },
  totalChange24h: {
    type: Number,
    default: 0
  },
  totalChangePercent24h: {
    type: Number,
    default: 0
  },
  performanceHistory: [{
    timestamp: {
      type: Date,
      required: true
    },
    totalValue: {
      type: Number,
      required: true
    }
  }],
  lastSync: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate total portfolio value before saving
portfolioSchema.pre('save', function(next) {
  this.totalValue = this.assets.reduce((sum, asset) => sum + (asset.totalValue || 0), 0)
  this.totalChange24h = this.assets.reduce((sum, asset) => sum + (asset.pnl24h || 0), 0)
  
  if (this.totalValue > 0) {
    this.totalChangePercent24h = (this.totalChange24h / (this.totalValue - this.totalChange24h)) * 100
  }
  
  this.updatedAt = Date.now()
  next()
})

// Index for efficient queries
portfolioSchema.index({ userId: 1 })
portfolioSchema.index({ 'assets.symbol': 1 })

module.exports = mongoose.model('Portfolio', portfolioSchema)