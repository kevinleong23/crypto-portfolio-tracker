const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  integrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.integrations',
    required: true
  },
  type: {
    type: String,
    enum: ['Received', 'Sent', 'Buy', 'Sell', 'Swap'],
    required: true
  },
  asset: {
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
      required: true
    }
  },
  value: {
    type: Number,
    required: true // USD value at time of transaction
  },
  source: {
    type: String,
    required: true // e.g., 'MEXC', 'MetaMask'
  },
  sourceType: {
    type: String,
    enum: ['exchange', 'wallet'],
    required: true
  },
  txHash: {
    type: String // For blockchain transactions
  },
  fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes for efficient queries
transactionSchema.index({ userId: 1, timestamp: -1 })
transactionSchema.index({ userId: 1, 'asset.symbol': 1 })
transactionSchema.index({ txHash: 1, type: 1 }) // Changed index to include type

// Virtual for display format
transactionSchema.virtual('displayAmount').get(function() {
  return `${this.asset.amount}${this.asset.symbol}`
})

module.exports = mongoose.model('Transaction', transactionSchema)