require('dotenv').config({ path: __dirname + '/../../.env' })
const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')

async function clearTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Remove test transactions
    const result = await Transaction.deleteMany({
      source: { $in: ['Test Exchange', 'Test Wallet'] }
    })
    
    console.log(`Removed ${result.deletedCount} test transactions`)
    
  } catch (error) {
    console.error('Error clearing test data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

// Run the script
clearTestData()